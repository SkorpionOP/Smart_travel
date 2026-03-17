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

def get_ml_recommendations(survey, history=[]):
    load_data()
    user_profile = evolve_user_profile(survey, history)
    
    # Query the model: find destinations nearest to the user profile
    distances, indices = engine.kneighbors(user_profile.reshape(1, -1))
    
    # Extract the recommended destinations
    recommendations = df.iloc[indices[0]].copy()
    recommendations['Match_Score'] = 1 - distances[0] # Convert distance to similarity %
    
    # Convert to list of dicts for API response
    results = []
    for _, row in recommendations.sort_values(by='Match_Score', ascending=False).iterrows():
        # Create a dict that matches the frontend expectation format, similar to our old destinations dataset
        dest_name = f"{row['Name']}, {row['City']}, {row['State']}"
        results.append({
            "id": str(row['Name']).lower().replace(' ', '_'),
            "name": dest_name,
            "image": scrape_wikipedia_image(row['Name']),
            "rating": round(row.get('Google review rating', 4.5), 1),
            "description": f"A notable {row.get('Type', 'place')} historically significant for {row.get('Significance', 'visitors')}.",
            "tags": [t for t in traits if row[t] > 0.5],
            "Match_Score": round(row['Match_Score'] * 100, 1),
            "City": row['City'],
            "time_needed": row.get('time needed to visit in hrs', 2)
        })
    return results[:5]

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
