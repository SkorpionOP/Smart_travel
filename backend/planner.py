import math

def generate_itinerary(attractions, duration=None):
    if not duration or duration <= 0:
        duration = math.ceil(len(attractions) / 5)
        if duration == 0: duration = 1
        
    itinerary = []
    attractions_per_day = math.ceil(len(attractions) / duration) if duration > 0 else 1
    if attractions_per_day == 0: attractions_per_day = 1
    
    for day in range(1, duration + 1):
        day_plan = {"day": day, "activities": []}
        start_idx = (day - 1) * attractions_per_day
        end_idx = start_idx + attractions_per_day
        day_attractions = attractions[start_idx:end_idx]
        
        if not day_attractions:
            day_plan["activities"].append({
                "time": "Flexible",
                "activity": "Relaxing day and free exploration"
            })
        else:
            times = ["Morning", "Afternoon", "Evening", "Late Evening", "Night"]
            for i, attr in enumerate(day_attractions):
                time_slot = times[i] if i < len(times) else f"Extra Time {i+1}"
                day_plan["activities"].append({
                    "time": time_slot,
                    "activity": f"Visit {attr}"
                })
            
        itinerary.append(day_plan)
        
    return itinerary, duration
