from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

import random
from scraper import scrape_destination_info, scrape_local_culinary
# Removed redundant import (merged with line 18)
from planner import generate_itinerary
from cost_estimator import calculate_costs
from real_scraper import run_playwright_scraper
from dataset import destinations
from fastapi import HTTPException
from database import init_db, get_db, hash_password
from recommender import get_hybrid_recommendations
from quiz_ml import get_ml_recommendations, create_daily_plan
from gemini_agent import get_gemini_trip_data, get_gemini_why_it
from dotenv import load_dotenv

load_dotenv()
init_db()
app = FastAPI(title="Smart Travel AI API")

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

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

class QuizMLRequest(BaseModel):
    survey: list[float]  # [Adventure, Relaxation, Culture, Nature, Social]
    history: list[dict] = [] # Optional past ratings

class WhyItRequest(BaseModel):
    city: str
    spots: list[str]
    gemini_key: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserPrefModel(BaseModel):
    user_id: int
    budget_range: str
    preferred_climate: str
    travel_type: str
    preferred_region: str

class TravelRequest(BaseModel):
    origin: str
    destination: str
    budget: float
    travelers: int
    travel_style: str
    duration: Optional[int] = None
    gemini_key: Optional[str] = None
    spots: Optional[list[str]] = None

@app.post("/api/plan")
def generate_plan(req: TravelRequest):
    # 1. Scrape data (using Gemini if key provided, else fallback)
    scraped_data = None
    actual_key = req.gemini_key if req.gemini_key and req.gemini_key.strip() != "" else DEFAULT_GEMINI_KEY
    if actual_key:
        scraped_data = get_gemini_trip_data(req.origin, req.destination, actual_key, req.budget, req.travelers, req.travel_style)
        
    local_culinary, total_food_per_day = scrape_local_culinary(req.destination)

    if scraped_data is None:
        wiki_data = scrape_destination_info(req.destination)
        real_hotels, real_attractions = run_playwright_scraper(req.destination, req.budget, req.spots)
        
        scraped_data = {
            "description": wiki_data["description"],
            "hotels": real_hotels if real_hotels else wiki_data["hotels"],
            "attractions": real_attractions if real_attractions else wiki_data["attractions"],
        }
    
    scraped_data["local_culinary"] = local_culinary
    if "estimated_food_cost_per_day_per_person" not in scraped_data or scraped_data.get("estimated_food_cost_per_day_per_person", 0) == 0:
        scraped_data["estimated_food_cost_per_day_per_person"] = total_food_per_day
        
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
        "costs": costs,
        "local_culinary": scraped_data.get("local_culinary", [])
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

@app.post("/api/quiz/recommendations")
def quiz_recommendations(req: QuizMLRequest):
    # ML Engine processes vectors -> [Adventure, Relaxation, Culture, Nature, Social]
    top_matches = get_ml_recommendations(req.survey, req.history)
    itinerary = create_daily_plan(top_matches)
    
    return {
        "recommendations": top_matches,
        "itinerary": itinerary
    }

@app.post("/api/quiz/why-it")
def why_this_city(req: WhyItRequest):
    key = req.gemini_key if req.gemini_key else DEFAULT_GEMINI_KEY
    return get_gemini_why_it(req.city, req.spots, key)

# --- MVP Auth & Recommender Endpoints ---

@app.post("/api/auth/register")
def register(user: UserRegister):
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users(name, email, password_hash) VALUES (?,?,?)", 
                  (user.name, user.email, hash_password(user.password)))
        conn.commit()
        user_id = c.lastrowid
        return {"message": "User registered successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email might already exist")
    finally:
        conn.close()

@app.post("/api/auth/login")
def login(user: UserLogin):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, name FROM users WHERE email=? AND password_hash=?", 
              (user.email, hash_password(user.password)))
    row = c.fetchone()
    conn.close()
    if row:
        return {"message": "Login successful", "user_id": row["id"], "name": row["name"]}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/user/preferences")
def set_preferences(prefs: UserPrefModel):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO preferences(user_id, budget_range, preferred_climate, travel_type, preferred_region) 
        VALUES (?,?,?,?,?) 
        ON CONFLICT(user_id) DO UPDATE SET 
        budget_range=excluded.budget_range, 
        preferred_climate=excluded.preferred_climate, 
        travel_type=excluded.travel_type, 
        preferred_region=excluded.preferred_region
    """, (prefs.user_id, prefs.budget_range, prefs.preferred_climate, prefs.travel_type, prefs.preferred_region))
    conn.commit()
    conn.close()
    return {"message": "Preferences saved successfully"}

@app.get("/api/user/{user_id}/recommendations")
def hybrid_recommend(user_id: int):
    # Returns the list of dicts directly
    results = get_hybrid_recommendations(user_id)
    return {"recommendations": results}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
