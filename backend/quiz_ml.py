import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import os
from scraper import scrape_wikipedia_image

df = None
engine = None
traits = ['Adventure', 'Relaxation', 'Culture', 'Nature', 'Social']

def load_data():
    global df, engine
    if df is None:
        file_path = os.path.join(os.path.dirname(__file__), 'Final_Indian_Destinations.csv')
        df = pd.read_csv(file_path)
        
        # Train KNN Engine
        engine = NearestNeighbors(n_neighbors=10, metric='cosine')
        # Fill missing numeric values with 0 if any
        df[traits] = df[traits].fillna(0)
        engine.fit(df[traits].values)

def evolve_user_profile(survey, history):
    load_data()
    survey_vec = np.array(survey)
    if not history or len(history) == 0:
        return survey_vec
    
    past_vectors = []
    weights = []
    
    for trip in history:
        dest_row = df[df['Name'] == trip['Name']]
        if not dest_row.empty:
            vec = dest_row[traits].values[0]
            weight = trip.get('Rating', 3) # default weight
            past_vectors.append(vec * weight)
            weights.append(weight)
            
    if not weights:
        return survey_vec
        
    # Calculate weighted average of past experiences
    experience_vec = np.sum(past_vectors, axis=0) / np.sum(weights)
    
    # BLEND: 50% Survey Results + 50% Actual History
    refined_profile = (survey_vec * 0.5) + (experience_vec * 0.5)
    return np.clip(refined_profile, 0, 1)

def get_ml_recommendations(survey, history=[], vibe=None):
    load_data()
    user_profile = evolve_user_profile(survey, history)
    
    # Query more neighbors to get enough distinct cities
    n_neighbors = min(150, len(df)) # increased pool
    distances, indices = engine.kneighbors(user_profile.reshape(1, -1), n_neighbors=n_neighbors)
    
    cities_map = {}
    
    # Define vibe keywords for boosting
    vibe_keywords = {
        'mountain': ['hill', 'mountain', 'peak', 'valley', 'trek', 'himalaya', 'auli', 'shimla', 'manali', 'munnar', 'coorg', 'ooty', 'kodaikanal', 'altitude'],
        'beach': ['beach', 'island', 'coast', 'sea', 'waterfall', 'goa', 'kerala', 'pondicherry', 'daman', 'ocean'],
        'temple': ['temple', 'shrine', 'spiritual', 'religious', 'monastery', 'dargah', 'church', 'mosque', 'guru'],
        'city': ['shopping', 'mall', 'metro', 'market', 'historical', 'museum', 'monument', 'fort', 'palace']
    }
    
    # States for broad categorization
    mountain_states = ['Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Ladakh', 'Jammu and Kashmir', 'Arunachal Pradesh', 'Meghalaya', 'Nagaland', 'Mizoram']
    beach_states = ['Goa', 'Andaman and Nicobar Islands', 'Puducherry', 'Lakshadweep', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh'] # Coastal states

    for dist, idx in zip(distances[0], indices[0]):
        row = df.iloc[idx]
        city = row['City']
        state = row['State']
        match_score = 1 - dist
        
        # Categorical Boosting & Penalizing
        boost = 0.0
        if vibe:
            vibe_lower = vibe.lower()
            keywords = vibe_keywords.get(vibe_lower, [])
            
            # Combine relevant text for checking
            desc_text = f"{row.get('Type', '')} {row.get('Significance', '')} {row.get('Name', '')}".lower()
            
            # 1. Direct Keyword Match (Strong Boost)
            if any(kw in desc_text for kw in keywords):
                boost += 0.5
            
            # 2. State match (Medium Boost)
            if vibe_lower == 'mountain' and state in mountain_states:
                boost += 0.3
            elif vibe_lower == 'beach' and state in beach_states and 'beach' in desc_text:
                boost += 0.3
            
            # 3. PENALTY for wrong vibe (Antivibe)
            # If looking for mountain, but it's a beach or a generic city mall
            if vibe_lower == 'mountain':
                if any(kw in desc_text for kw in ['beach', 'mall', 'metro', 'shopping']):
                    boost -= 0.5
            elif vibe_lower == 'beach':
                if any(kw in desc_text for kw in ['trek', 'mountain', 'peak', 'mall']):
                    boost -= 0.5
            elif vibe_lower == 'city':
                if any(kw in desc_text for kw in ['trek', 'mountain', 'remote']):
                    boost -= 0.3

        match_score += boost
        
        if city not in cities_map:
            cities_map[city] = {
                "City": city,
                "State": state,
                "Match_Score": match_score,
                "Spots": []
            }
            
        cities_map[city]["Spots"].append({
            "name": row['Name'],
            "type": row.get('Type', 'place'),
            "rating": round(row.get('Google review rating', 4.5), 1),
            "Match_Score": round(match_score * 100, 1),
            "time_needed": row.get('time needed to visit in hrs', 2)
        })

    # Re-sort cities by boosted Match Score
    sorted_cities = sorted(list(cities_map.values()), key=lambda x: x["Match_Score"], reverse=True)
    
    top_5_cities = sorted_cities[:5]
    
    results = []
    
    for c in top_5_cities:
        city_name = str(c['City'])
        top_spots = c['Spots'][:5] # Top 5 places
        spot_names = [s['name'] for s in top_spots]
        
        # Determine city tags based on mean of traits for this city
        city_rows = df[df['City'] == city_name]
        mean_traits = city_rows[traits].mean()
        city_tags = [t for t in traits if mean_traits[t] > 0.4]
        if not city_tags:
            city_tags = [traits[int(np.argmax(mean_traits.values))]] # at least one
            
        results.append({
            "id": city_name.lower().replace(' ', '_'),
            "name": f"{city_name}, {c['State']}",
            "image": scrape_wikipedia_image(city_name),
            "rating": round(top_spots[0]['rating'], 1) if top_spots else 4.5,
            "description": f"Based on your vibe, {city_name} is the ultimate go-to! It's perfectly suited for your interests. Here are some of the best matching spots in {city_name} for you.",
            "tags": city_tags,
            "Match_Score": round(c['Match_Score'] * 100, 1),
            "City": city_name,
            "spots": top_spots,
            "time_needed": sum(s['time_needed'] for s in top_spots)
        })
        
    return results

def create_daily_plan(rec_list, max_hours=8):
    plan = []
    total_time = 0
    # Create simple itinerary
    for row in rec_list:
        if total_time + row['time_needed'] <= max_hours:
            plan.append({
                'Place': row['name'].split(',')[0],
                'City': row['City'],
                'Time': row['time_needed'],
                'Vibe': ", ".join(row['tags'])
            })
            total_time += row['time_needed']
    return plan
