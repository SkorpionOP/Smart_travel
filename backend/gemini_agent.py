import json
from google import genai
from google.genai import types
from scraper import scrape_destination_info
from pydantic import BaseModel
from typing import Optional

class Attraction(BaseModel):
    name: str
    lat: float
    lng: float

class Hotel(BaseModel):
    name: str
    price: int
    rating: float
    distance_from_center: float
    max_capacity: int
    lat: float
    lng: float

class TripData(BaseModel):
    description: str
    estimated_flight_cost_per_person: int
    estimated_food_cost_per_day_per_person: int
    estimated_transport_cost_per_day_per_person: int
    estimated_attractions_cost_per_day_per_person: int
    hotels: list[Hotel]
    pgs: Optional[list[Hotel]] = None
    attractions: list[Attraction]

class WhyItReason(BaseModel):
    name: str
    description: str

class WhyItResponse(BaseModel):
    reasons: list[WhyItReason]

from scraper import scrape_wikipedia_image, scrape_destination_info

def get_gemini_why_it(city: str, spots: list[str], key: str):
    print(f"Bypassing Gemini for Why-It -> Fast Scraping {city} spots...")
    reasons = []
    
    for spot in spots:
        # 1. Fetch short description from Wikipedia
        dest_info = scrape_destination_info(spot)
        desc = dest_info.get("description", "A fantastic attraction worth exploring.")
        # Crop description to a reasonable length (2 sentences max)
        sentences = desc.split('. ')
        short_desc = '. '.join(sentences[:2]) + ('.' if not sentences[0].endswith('.') else '')
        
        # 2. Add Wikipedia image
        img = scrape_wikipedia_image(spot)
        
        reasons.append({
            "name": spot,
            "description": short_desc,
            "image": img
        })
        
    return {"reasons": reasons}

def get_gemini_trip_data(origin: str, destination: str, key: str, budget: float, travelers: int, style: str):
    try:
        client = genai.Client(api_key=key)
        style_lower = style.lower()
        if style_lower == "budget friendly":
            prompt = f"""
            You are an expert travel agent. The user wants to travel from {origin} to {destination}.
            They have a budget of ${budget} for {travelers} traveler(s), and prefer a '{style}' travel style.
        
            Please provide the following:
            1. A detailed description of {destination} as a travel destination. 
            2. Average estimated round-trip Train(Sleeper Class) cost per person in INR from {origin} to {destination}.
            3. Average estimated daily food cost per person in INR in {destination} for a '{style}' style.
            4. Average estimated daily local transport cost per person in INR in {destination}.
            5. Average estimated daily attractions/sightseeing cost per person in INR in {destination}.
            6. A comprehensive list of ALL notable budget-friendly hotels in {destination} — include every well-known option, do not cap the count.
            7. A comprehensive list of ALL notable PGs with food in {destination} — include every well-known option, do not cap the count.
            8. A list of ALL recommended attractions per day in {destination}, scheduled during their peak 'golden hours' (specific times of day when the lighting, weather, and crowd levels are most ideal for that specific location).
            """
        elif style_lower == "luxury":
            prompt = f"""
            You are an expert travel agent. The user wants to travel from {origin} to {destination}.
            They have a budget of ${budget} for {travelers} traveler(s), and prefer a '{style}' travel style.
        
            Please provide the following:
            1. A detailed description of {destination} as a travel destination. 
            2. Average estimated round-trip Train(First Class) cost per person in INR from {origin} to {destination}.
            3. Average estimated daily food cost per person in INR in {destination} for a '{style}' style.
            4. Average estimated daily local transport cost per person in INR in {destination}.
            5. Average estimated daily attractions/sightseeing cost per person in INR in {destination}.
            6. A comprehensive list of ALL top-class luxury 5-star hotels in {destination} — include every well-known option, do not cap the count.
            7. A list of ALL recommended attractions per day in {destination}, scheduled during their peak 'golden hours' (specific times of day when the lighting, weather, and crowd levels are most ideal for that specific location).
            """
        elif style_lower == "quick":
            prompt = f"""
            You are an expert travel agent. The user wants to travel from {origin} to {destination}.
            They have a budget of ${budget} for {travelers} traveler(s), and prefer a '{style}' travel style.
        
            Please provide the following:
            1. A detailed description of {destination} as a travel destination. 
            2. Average estimated round-trip Flight cost per person in INR from {origin} to {destination}.
            3. Average estimated daily food cost per person in INR in {destination} for a '{style}' style.
            4. Average estimated daily local transport cost per person in INR in {destination}.
            5. Average estimated daily attractions/sightseeing cost per person in INR in {destination}.
            6. A comprehensive list of ALL centrally located hotels in {destination} closest to the city center — include every well-known option, do not cap the count.
            7. A list of ALL recommended attractions per day in {destination}, scheduled during their peak 'golden hours' (specific times of day when the lighting, weather, and crowd levels are most ideal for that specific location).
            """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=TripData,
            ),
        )
        
        data = json.loads(response.text)
        
        if "hotels" in data:
            if style_lower == "budget friendly":
                data["hotels"] = sorted(data["hotels"], key=lambda x: x.get("price", 999999))
            elif style_lower == "quick":
                data["hotels"] = sorted(data["hotels"], key=lambda x: x.get("distance_from_center", 999999))
            else:
                data["hotels"] = sorted(data["hotels"], key=lambda x: x.get("rating", 0), reverse=True)
            
        return data
    except Exception as e:
        print(f"Gemini API failed: {e}")
        return None
