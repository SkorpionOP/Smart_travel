from database import get_db

def get_hybrid_recommendations(user_id: int):
    conn = get_db()
    c = conn.cursor()
    
    # Get User Preferences
    c.execute("SELECT * FROM preferences WHERE user_id = ?", (user_id,))
    prefs = c.fetchone()
    if not prefs:
        # Default fallback if they haven't set preferences yet, just return top rated
        c.execute("SELECT * FROM destinations ORDER BY rating DESC LIMIT 5")
        return [dict(row) for row in c.fetchall()]
        
    user_budget = prefs["budget_range"]
    user_climate = prefs["preferred_climate"]
    user_type = prefs["travel_type"]
    user_region = prefs["preferred_region"] # Domestic vs International (optional filter)
    
    c.execute("SELECT * FROM destinations")
    destinations = c.fetchall()
    
    # 1. Content-Based Filtering Score
    content_scores = {}
    for dest in destinations:
        dest_id = dest["id"]
        score = 0.0
        
        # Exact match logic (MVP)
        if dest["travel_type"].lower() == user_type.lower():
            score += 3.0
        if dest["climate"].lower() == user_climate.lower():
            score += 2.0
        if dest["budget_level"].lower() == user_budget.lower():
            score += 2.0
            
        # Regional filtering implicitly if needed, MVP omits it or just relies on base scores
        # We add base rating to reward universally loved places
        score += dest["rating"]
        content_scores[dest_id] = score
        
    # Normalize Content Score to a 0-1 scale locally (roughly max 12 points)
    max_c = max(content_scores.values()) if content_scores else 1.0
    for d_id in content_scores:
        content_scores[d_id] = content_scores[d_id] / max_c
        
    # 2. Collaborative Filtering (Fake/Simplified for MVP)
    # Approach: Find users who liked what THIS user liked. But since new users have 0 ratings,
    # we'll recommend globally highly-rated items from OTHER users for collaborative.
    # We will simulate Collaborative by finding destinations highly rated across the board by other users.
    
    c.execute("""
        SELECT destination_id, AVG(rating) as avg_collab_rating 
        FROM user_ratings 
        WHERE user_id != ? 
        GROUP BY destination_id
    """, (user_id,))
    collab_ratings = {row["destination_id"]: row["avg_collab_rating"] for row in c.fetchall()}
    
    # Normalize Collab Score (0 to 1 scale based on 5 star ratings)
    collab_scores = {d_id: (rating / 5.0) for d_id, rating in collab_ratings.items()}
    
    # 3. Hybrid Calculation
    # Final Score = (Content Score * 0.6) + (Collaborative Score * 0.4)
    hybrid_recommendations = []
    
    for dest in destinations:
        d_id = dest["id"]
        c_score = content_scores.get(d_id, 0.0)
        u_score = collab_scores.get(d_id, 0.5) # Fallback 0.5 if no ratings exist for it yet
        
        final_score = (c_score * 0.6) + (u_score * 0.4)
        
        dest_dict = dict(dest)
        dest_dict["hybrid_score"] = round(final_score, 3)
        hybrid_recommendations.append(dest_dict)
        
    conn.close()
    
    # Sort and return top 5
    hybrid_recommendations.sort(key=lambda x: x["hybrid_score"], reverse=True)
    return hybrid_recommendations[:5]
