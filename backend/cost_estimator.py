from geopy.geocoders import Nominatim
from geopy.distance import geodesic

geolocator = Nominatim(user_agent="smart_travel_cost_estimator")

def calculate_costs(hotels, duration, travelers, travel_style, origin, destination, scraped_data=None):
    style_mult_map = {"Budget Friendly": 0.6, "Adventure": 1.2, "Relax": 1.5, "Cultural": 1.0, "Nature": 0.8, "Luxury": 2.5}
    style_mult = style_mult_map.get(travel_style, 1.0)
    
    avg_hotel_price = sum(h["price"] for h in hotels) / len(hotels) if hotels else 8000
    capacity_map = {"Budget Friendly": 5, "Luxury": 2, "Relax": 2}
    room_capacity = capacity_map.get(travel_style, 3)
    rooms_needed = max(1, (travelers + room_capacity - 1) // room_capacity)
    
    hotel_cost = int(avg_hotel_price * duration * rooms_needed)
    
    # Core transport selection logic
    transport_mode = "Flights & Travel"
    
    if travel_style == "Budget Friendly":
        # SCRAPE live data from websites to compare budget travel
        from scraper import scrape_transit_costs
        transit_data = scrape_transit_costs(origin, destination)
        
        bus_total = transit_data["bus"] * travelers
        train_total = transit_data["train"] * travelers
        
        if bus_total < train_total:
            flight_tickets_total = bus_total
            transport_mode = "Bus & Travel"
        else:
            flight_tickets_total = train_total
            transport_mode = "Train & Travel"
            
        # Food and local transport are also cheaper if travelling budget friendly
        total_food = int(1200 * duration * travelers)
        total_transport = int(600 * duration * travelers)
        total_attractions = int(1000 * duration * travelers)
        
    elif scraped_data and "estimated_flight_cost_per_person" in scraped_data:
        flight_tickets_total = int(scraped_data.get("estimated_flight_cost_per_person", 20000) * travelers)
        total_food = int(scraped_data.get("estimated_food_cost_per_day_per_person", 3200) * duration * travelers)
        total_transport = int(scraped_data.get("estimated_transport_cost_per_day_per_person", 1600) * duration * travelers)
        total_attractions = int(scraped_data.get("estimated_attractions_cost_per_day_per_person", 2400) * duration * travelers)
    else:
        food_per_day = 3200 * style_mult
        transport_per_day = 1600 * style_mult
        attractions_per_day = 2400 * style_mult
        
        # Estimate base travel tickets dynamically based on distance
        flight_tickets_total = 20000 * travelers # fallback
        try:
            origin_loc = geolocator.geocode(origin, timeout=5)
            dest_loc = geolocator.geocode(destination, timeout=5)
            if origin_loc and dest_loc:
                dist_miles = geodesic((origin_loc.latitude, origin_loc.longitude), (dest_loc.latitude, dest_loc.longitude)).miles
                # ₹12 per mile round-trip estimate per traveler
                flight_tickets_total = int((dist_miles * 12 + 4000) * travelers)
        except Exception as e:
            print(f"Cost Estimator Geocode Error: {e}")
            pass
        
        total_food = int(food_per_day * duration * travelers)
        total_transport = int(transport_per_day * duration * travelers)
        total_attractions = int(attractions_per_day * duration * travelers)
    
    return {
        "flight_cost": flight_tickets_total,
        "transport_mode_label": transport_mode,
        "rooms_needed": rooms_needed,
        "hotel_cost": hotel_cost,
        "food_cost": total_food,
        "transport_cost": total_transport,
        "attractions_cost": total_attractions,
        "total_cost": hotel_cost + total_food + total_transport + total_attractions + flight_tickets_total
    }
