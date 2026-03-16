from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import random
from scraper import scrape_destination_info
from gemini_agent import get_gemini_trip_data
from planner import generate_itinerary
from cost_estimator import calculate_costs
from real_scraper import run_playwright_scraper
from dataset import destinations

app = FastAPI(title="Smart Travel AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Preferences(BaseModel):
    environment: str
    activity: str
    climate: str
    vibe: str
    food: str

class TravelRequest(BaseModel):
    origin: str
    destination: str
    budget: float
    travelers: int
    travel_style: str
    duration: Optional[int] = None
    gemini_key: Optional[str] = None

@app.post("/api/plan")
def generate_plan(req: TravelRequest):
    # 1. Scrape data (using Gemini if key provided, else fallback)
    scraped_data = None
    if req.gemini_key and req.gemini_key.strip() != "":
        scraped_data = get_gemini_trip_data(req.origin, req.destination, req.gemini_key, req.budget, req.travelers, req.travel_style)
        
    if scraped_data is None:
        wiki_data = scrape_destination_info(req.destination)
        real_hotels, real_attractions = run_playwright_scraper(req.destination, req.budget)
        
        scraped_data = {
            "description": wiki_data["description"],
            "hotels": real_hotels if real_hotels else wiki_data["hotels"],
            "attractions": real_attractions if real_attractions else wiki_data["attractions"]
        }
        
        # Add mock coordinates if geocoding failed so the map doesn't break
        for h in scraped_data["hotels"]:
            if "lat" not in h or (h["lat"] == 0.0 and h["lng"] == 0.0):
                h["lat"], h["lng"] = 0.0, 0.0
                
        # Handle formatting of attractions between mock list of strings vs real dicts
        formatted_attractions = []
        for a in scraped_data["attractions"]:
            if isinstance(a, dict):
                formatted_attractions.append(a)
            else:
                formatted_attractions.append({"name": a, "lat": 0.0, "lng": 0.0})
        scraped_data["attractions"] = formatted_attractions
    
    # 2. Plan
    attn_names = [a["name"] for a in scraped_data["attractions"]]
    itinerary, calculated_duration = generate_itinerary(attn_names, req.duration)
    
    # 3. Cost Estimator
    costs = calculate_costs(
        scraped_data["hotels"], 
        calculated_duration, 
        req.travelers, 
        req.travel_style,
        req.origin,
        req.destination,
        scraped_data
    )
    
    return {
        "destination": req.destination,
        "description": scraped_data["description"],
        "duration": calculated_duration,
        "hotels": scraped_data["hotels"],
        "attractions": scraped_data["attractions"], # Return full attractions for map
        "itinerary": itinerary,
        "costs": costs
    }

@app.post("/api/recommendations")
def get_recommendations(prefs: Preferences):
    user_tags = set([
        prefs.environment.lower(),
        prefs.activity.lower(),
        prefs.climate.lower(),
        prefs.vibe.lower(),
        prefs.food.lower()
    ])
    
    scored_destinations = []
    for dest in destinations:
        dest_tags = set(dest["tags"])
        # Simple overlap scoring
        score = len(user_tags.intersection(dest_tags))
        scored_destinations.append({
            "destination": dest,
            "score": score
        })
    
    # Sort by score, then by rating as tie breaker
    scored_destinations.sort(key=lambda x: (x["score"], x["destination"]["rating"]), reverse=True)
    return {"recommendations": [item["destination"] for item in scored_destinations[:5]]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
