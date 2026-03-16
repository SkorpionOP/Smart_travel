import json
from google import genai
from google.genai import types
from scraper import scrape_destination_info

def get_gemini_trip_data(origin: str, destination: str, key: str, budget: float, travelers: int, style: str):
    try:
        client = genai.Client(api_key=key)
        
        prompt = f"""
        You are an expert travel agent. The user wants to travel from {origin} to {destination}.
        They have a budget of ${budget} for {travelers} traveler(s), and prefer a '{style}' travel style.
        
        Please provide the following in pure JSON format:
        1. A detailed "description" of {destination} as a travel destination.
        2. Average estimated round-trip flight cost per person in INR from {origin} to {destination} ("estimated_flight_cost_per_person": integer).
        3. Average estimated daily food cost per person in INR in {destination} for a '{style}' style ("estimated_food_cost_per_day_per_person": integer).
        4. Average estimated daily local transport cost per person in INR in {destination} ("estimated_transport_cost_per_day_per_person": integer).
        5. Average estimated daily attractions/sightseeing cost per person in INR in {destination} ("estimated_attractions_cost_per_day_per_person": integer).
        6. A list of 5 realistic recommended hotels ("hotels") in {destination} that fit their budget. For each hotel, provide:
           - "name": string
           - "price": integer (estimated nightly rate in INR)
           - "rating": float (out of 5.0)
           - "distance_from_center": float (miles)
           - "lat": float (latitude)
           - "lng": float (longitude)
        7. A list of 6-8 recommended attractions ("attractions") in {destination}. For each attraction, provide:
           - "name": string
           - "lat": float (latitude)
           - "lng": float (longitude)
           
        Output ONLY valid JSON. The JSON schema should be:
        {{
          "description": "...",
          "estimated_flight_cost_per_person": 0,
          "estimated_food_cost_per_day_per_person": 0,
          "estimated_transport_cost_per_day_per_person": 0,
          "estimated_attractions_cost_per_day_per_person": 0,
          "hotels": [
            {{"name": "...", "price": 0, "rating": 4.5, "distance_from_center": 0.5, "lat": 0.0, "lng": 0.0}}
          ],
          "attractions": [
            {{"name": "...", "lat": 0.0, "lng": 0.0}}
          ]
        }}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
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
