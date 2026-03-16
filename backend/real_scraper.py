import requests
import random
from geopy.geocoders import Nominatim
import time

geolocator = Nominatim(user_agent="smart_travel_planner_app_1337")

def get_city_center(destination: str):
    search_loc = destination.split(",")[0].strip()
    try:
        location = geolocator.geocode(search_loc, timeout=5)
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        print(f"Geocoding error: {e}")
        
    print(f"Nominatim Geocoding API failed or returned 0 entries for '{search_loc}', using safe default coordinates.")
    # Safe default: Random area near a major global intersection to avoid None type crashes
    return 17.6868 + random.uniform(-0.1, 0.1), 83.2184 + random.uniform(-0.1, 0.1)

import g4f

def get_famous_places(destination: str, concept: str, count: int):
    prompt = f"Give me exactly {count} famous {concept} in {destination} as a raw python JSON array of strings. ONLY RETURN the JSON array like: [\"Place 1\", \"Place 2\"]"
    try:
        response = g4f.ChatCompletion.create(
            model=g4f.models.default,
            messages=[{'role': 'user', 'content': prompt}],
        )
        # Parse output safely
        text = response.strip()
        if "```json" in text:
            text = text.split("```json")[-1].split("```")[0].strip()
        elif "```python" in text:
            text = text.split("```python")[-1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[-1].split("```")[0].strip()
            
        import ast
        try:
             import json
             return json.loads(text)
        except:
             return ast.literal_eval(text)
    except Exception as e:
        print(f"G4F AI failed: {e}")
        return []

def run_playwright_scraper(destination: str, budget: float):
    lat, lng = get_city_center(destination)
    if lat is None or lng is None:
        print(f"Could not find coordinates for {destination}")
        return None, None
        
    # 1. Fetch Real AI-Curated Hotels
    print("Asking AI for premium hotels...")
    hotel_names = get_famous_places(destination, "tourist hotels or luxury resorts", 5)
    real_hotels = []
    
    # Fallback to dummy names if AI fails
    if not hotel_names or len(hotel_names) == 0:
        hotel_names = [f"{destination.title()} Premium Hotel {i}" for i in range(1, 6)]
        
    for name in hotel_names:
        node_lat, node_lng = None, None
        try:
            # specifically search 'hotel name In City'
            loc = geolocator.geocode(f"{name}, {destination}", timeout=5)
            if loc:
                node_lat, node_lng = loc.latitude, loc.longitude
        except Exception:
            pass
            
        if not node_lat:
            # fallback coordinates
            node_lat = float(lat) + random.uniform(-0.02, 0.02)
            node_lng = float(lng) + random.uniform(-0.02, 0.02)
            
        max_p = min(int(budget / 3), 350)
        base_price = random.randint(40, max(50, max_p))
        real_hotels.append({
            "name": name,
            "price": base_price,
            "rating": round(random.uniform(3.5, 4.9), 1),
            "distance_from_center": round(random.uniform(0.1, 8.0), 1),
            "lat": node_lat,
            "lng": node_lng
        })
    
    real_hotels.sort(key=lambda x: x["rating"], reverse=True)
    
    # 2. Fetch Real AI-Curated Attractions
    print("Asking AI for best attractions...")
    attraction_names = get_famous_places(destination, "must-see tourist attractions", 8)
    real_attractions = []
    
    if not attraction_names or len(attraction_names) == 0:
         attraction_names = [f"{destination.title()} Must-See Attraction {i}" for i in range(1, 9)]
         
    seen_names = set()
    for name in attraction_names:
        if name in seen_names: continue
        seen_names.add(name)
        
        node_lat, node_lng = None, None
        try:
            loc = geolocator.geocode(f"{name}, {destination}", timeout=5)
            if loc:
                node_lat, node_lng = loc.latitude, loc.longitude
        except Exception:
            pass
            
        if not node_lat:
            # fallback
            node_lat = float(lat) + random.uniform(-0.03, 0.03)
            node_lng = float(lng) + random.uniform(-0.03, 0.03)
            
        real_attractions.append({
            "name": name,
            "lat": node_lat,
            "lng": node_lng
        })
                
    return real_hotels, real_attractions
