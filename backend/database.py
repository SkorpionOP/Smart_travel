import sqlite3
import hashlib

DB_FILE = "smart_travel.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    password_hash TEXT
                )''')
    c.execute('''CREATE TABLE IF NOT EXISTS preferences (
                    user_id INTEGER PRIMARY KEY,
                    budget_range TEXT,
                    preferred_climate TEXT,
                    travel_type TEXT,
                    preferred_region TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )''')
    c.execute('''CREATE TABLE IF NOT EXISTS destinations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    country TEXT,
                    climate TEXT,
                    travel_type TEXT,
                    budget_level TEXT,
                    rating REAL
                )''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_ratings (
                    user_id INTEGER,
                    destination_id INTEGER,
                    rating REAL,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(destination_id) REFERENCES destinations(id)
                )''')
    
    # Pre-populate MVP Destinations if empty
    c.execute("SELECT count(*) FROM destinations")
    if c.fetchone()[0] == 0:
        dests = [
            ("Bali", "Indonesia", "Tropical", "Relaxation", "Medium", 4.7),
            ("Swiss Alps", "Switzerland", "Cold", "Adventure", "Luxury", 4.9),
            ("Kyoto", "Japan", "Moderate", "Cultural", "Medium", 4.8),
            ("Reykjavik", "Iceland", "Cold", "Adventure", "Luxury", 4.6),
            ("Goa", "India", "Tropical", "Relaxation", "Low", 4.2),
            ("Kerala", "India", "Tropical", "Nature", "Medium", 4.5),
            ("Paris", "France", "Moderate", "Cultural", "Luxury", 4.7),
            ("Costa Rica", "Costa Rica", "Tropical", "Adventure", "Medium", 4.6),
            ("Machu Picchu", "Peru", "Moderate", "Cultural", "Medium", 4.8),
            ("Phuket", "Thailand", "Tropical", "Relaxation", "Low", 4.3)
        ]
        c.executemany("INSERT INTO destinations(name, country, climate, travel_type, budget_level, rating) VALUES (?,?,?,?,?,?)", dests)
        
        # Insert a dummy user and dummy ratings for MVP collaborative filtering
        c.execute("INSERT INTO users(name, email, password_hash) VALUES ('TestUser', 'test@test.com', ?)", (hash_password("password123"),))
        dummy_user_id = c.lastrowid
        ratings = [
            (dummy_user_id, 1, 5.0), # Bali
            (dummy_user_id, 5, 4.0), # Goa
            (dummy_user_id, 10, 4.5) # Phuket
        ]
        c.executemany("INSERT INTO user_ratings(user_id, destination_id, rating) VALUES (?,?,?)", ratings)

    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn
