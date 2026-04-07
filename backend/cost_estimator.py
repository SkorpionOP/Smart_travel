from geopy.geocoders import Nominatim
from geopy.distance import geodesic

geolocator = Nominatim(user_agent="smart_travel_cost_estimator")

def calculate_costs(hotels, duration, travelers, travel_style, origin, destination, scraped_data=None):
    style_mult_map = {"Budget Friendly": 0.45, "Adventure": 1.1, "Relax": 1.5, "Cultural": 1.0, "Nature": 0.8, "Luxury": 2.5}
    style_mult = style_mult_map.get(travel_style, 1.0)
    
    avg_hotel_price = sum(h["price"] for h in hotels) / len(hotels) if hotels else 2500
    
    # If budget, clamp the hotel estimate so it stays extremely affordable
    if travel_style == "Budget Friendly":
        avg_hotel_price = min(avg_hotel_price, 1200)
        
    if hotels and "max_capacity" in hotels[0]:
        avg_capacity = max(1, sum(h.get("max_capacity", 2) for h in hotels) / len(hotels))
        room_capacity = int(round(avg_capacity))
    else:
        capacity_map = {"Budget Friendly": 4, "Luxury": 2, "Relax": 2}
        room_capacity = capacity_map.get(travel_style, 3)
        
    rooms_needed = max(1, (travelers + room_capacity - 1) // room_capacity)
    
    hotel_cost = int(avg_hotel_price * duration * rooms_needed)
    
    # Core transport selection logic
    transport_mode = "Flights & Travel"
    flight_tickets_total = 0
    from scraper import scrape_skyscanner_flights
    
    dist_miles = 0
    is_international = False
    try:
        origin_loc = geolocator.geocode(origin, timeout=5)
        dest_loc = geolocator.geocode(destination, timeout=5)
        if origin_loc and dest_loc:
            dist_miles = geodesic((origin_loc.latitude, origin_loc.longitude), (dest_loc.latitude, dest_loc.longitude)).miles
            # Simple international heuristic
            o_addr = origin_loc.address.lower()
            d_addr = dest_loc.address.lower()
            if ("india" in o_addr and "india" not in d_addr) or ("india" not in o_addr and "india" in d_addr):
                is_international = True
    except Exception:
        pass
        
    # If distance is too far (>500 miles) or it's international, FORCE flights over bus/train
    if travel_style == "Budget Friendly" and dist_miles < 500 and not is_international and dist_miles > 0:
        from scraper import scrape_transit_costs
        transit_data = scrape_transit_costs(origin, destination)
        
        # Round trip multipliers (Arrival + Departure)
        bus_total = transit_data["bus"] * travelers * 2
        train_total = transit_data["train"] * travelers * 2
        
        if bus_total < train_total:
            flight_tickets_total = int(bus_total * 0.75) 
            transport_mode = "Economy Bus (Round Trip)"
        else:
            flight_tickets_total = int(train_total * 0.75)
            transport_mode = "Sleeper Class Train (Round Trip)"
    else:
        # Distance too far OR failed geocoding. Use Skyscanner for Flight estimate.
        # If geocoding failed, we assume a far trip to be safe.
        calc_dist = dist_miles if dist_miles > 0 else 1200
        per_person_flight_round_trip = scrape_skyscanner_flights(origin, destination, calc_dist)
        
        # Cross-reference with scraped_data if available (AI might have different estimates)
        if scraped_data and "estimated_flight_cost_per_person" in scraped_data:
            ai_flight = scraped_data["estimated_flight_cost_per_person"]
            if ai_flight > 0:
                # Use the cheaper of the two sources
                per_person_flight_round_trip = min(per_person_flight_round_trip, ai_flight)
                
        flight_tickets_total = int(per_person_flight_round_trip * travelers)
        if travel_style == "Luxury":
            transport_mode = "First Class Flight (Round Trip)"
        elif travel_style == "Quick":
            transport_mode = "Express Flight (Round Trip)"
        elif travel_style == "Budget Friendly":
            transport_mode = "Economy Flight (Round Trip)"
        else:
            transport_mode = f"{travel_style} Flight (Round Trip)"
                
    intl_mult = 1.35 if is_international else 1.0
    
    # Scale all daily costs perfectly by the travel style
    base_food = scraped_data.get("estimated_food_cost_per_day_per_person", 800) if scraped_data else 800
    base_transport = scraped_data.get("estimated_transport_cost_per_day_per_person", 400) if scraped_data else 400
    base_attractions = scraped_data.get("estimated_attractions_cost_per_day_per_person", 600) if scraped_data else 600
    
    total_food = int(base_food * style_mult * intl_mult * duration * travelers)
    total_transport = int(base_transport * style_mult * intl_mult * duration * travelers)
    total_attractions = int(base_attractions * style_mult * intl_mult * duration * travelers)
    
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
