import json
from google import genai
from google.genai import types
from scraper import scrape_destination_info
from pydantic import BaseModel

class Attraction(BaseModel):
    name: str
    lat: float
    lng: float

class Hotel(BaseModel):
    name: str
    price: int
    rating: float
    distance_from_center: float
    lat: float
    lng: float

class TripData(BaseModel):
    description: str
    estimated_flight_cost_per_person: int
    estimated_food_cost_per_day_per_person: int
    estimated_transport_cost_per_day_per_person: int
    estimated_attractions_cost_per_day_per_person: int
    hotels: list[Hotel]
    attractions: list[Attraction]

def get_gemini_trip_data(origin: str, destination: str, key: str, budget: float, travelers: int, style: str):
    try:
        client = genai.Client(api_key=key)
        
        prompt = f"""
        You are an expert travel agent. The user wants to travel from {origin} to {destination}.
        They have a budget of ${budget} for {travelers} traveler(s), and prefer a '{style}' travel style.
        
        Please provide the following:
        1. A detailed description of {destination} as a travel destination.
        2. Average estimated round-trip flight cost per person in INR from {origin} to {destination}.
        3. Average estimated daily food cost per person in INR in {destination} for a '{style}' style.
        4. Average estimated daily local transport cost per person in INR in {destination}.
        5. Average estimated daily attractions/sightseeing cost per person in INR in {destination}.
        6. A list of 5 realistic recommended hotels in {destination} that fit their budget.
        7. A list of 6-8 recommended attractions in {destination}.
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
        
        # Sort hotels by rating descending
        if "hotels" in data:
            data["hotels"] = sorted(data["hotels"], key=lambda x: x.get("rating", 0), reverse=True)
            
        return data
    except Exception as e:
        print(f"Gemini API failed: {e}")
        # Fallback to the non-AI web scraper
        return None
