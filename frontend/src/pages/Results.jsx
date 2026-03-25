import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, ArrowRight, RefreshCcw, Sparkles, X, Clock, Sun } from 'lucide-react';
import { API_BASE_URL } from '../config';

// ─── EMBEDDED CITY DATA (pre-computed from CSV) ──────────────────────────────
// Vector order: [Adventure, Relaxation, Culture, Nature, Social]
// Each vector is normalized relative to the city's dominant trait (max=1.0)
const CITY_DATA = [{ "city": "Delhi", "state": "Delhi", "zone": "Northern", "vector": [0.3063, 0.7027, 1.0, 0.6216, 0.4595], "tags": ["Culture", "Relaxation", "Nature"], "rating": 4.4, "topSpots": [{ "name": "India Gate", "rating": 4.6 }, { "name": "Akshardham Temple", "rating": 4.6 }, { "name": "Sunder Nursery", "rating": 4.6 }], "bestTime": "All", "spotCount": 16 }, { "city": "Mumbai", "state": "Maharastra", "zone": "Western", "vector": [0.5312, 0.7969, 1.0, 0.5781, 0.5312], "tags": ["Culture", "Relaxation", "Nature"], "rating": 4.5, "topSpots": [{ "name": "Siddhivinayak Temple", "rating": 4.8 }, { "name": "Mahalaxmi Temple", "rating": 4.7 }, { "name": "Gateway of India", "rating": 4.6 }], "bestTime": "All", "spotCount": 10 }, { "city": "Lonavala", "state": "Maharastra", "zone": "Western", "vector": [0.6667, 0.8333, 1.0, 0.5, 0.9167], "tags": ["Culture", "Social", "Relaxation"], "rating": 2.9, "topSpots": [{ "name": "Karla Caves", "rating": 4.4 }, { "name": "Imagicaa", "rating": 1.4 }], "bestTime": "Afternoon", "spotCount": 2 }, { "city": "Bangalore", "state": "Karnataka", "zone": "Southern", "vector": [0.6, 1.0, 0.8667, 0.9333, 0.4667], "tags": ["Relaxation", "Nature", "Culture"], "rating": 4.4, "topSpots": [{ "name": "Vidhana Soudha", "rating": 4.6 }, { "name": "ISKCON Temple Bangalore", "rating": 4.6 }, { "name": "Lalbagh Botanical Garden", "rating": 4.4 }], "bestTime": "Evening", "spotCount": 5 }, { "city": "Hyderabad", "state": "Telangana", "zone": "Southern", "vector": [0.5, 0.6944, 1.0, 0.5694, 0.5972], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.4, "topSpots": [{ "name": "Birla Mandir", "rating": 4.7 }, { "name": "Charminar", "rating": 4.5 }, { "name": "Inorbit Mall Cyberabad", "rating": 4.5 }], "bestTime": "All", "spotCount": 11 }, { "city": "Kolkata", "state": "West Bengal", "zone": "Eastern", "vector": [0.4189, 0.527, 1.0, 0.3919, 0.4595], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.5, "topSpots": [{ "name": "Dakshineswar Kali Temple", "rating": 4.7 }, { "name": "Belur Math", "rating": 4.7 }, { "name": "Victoria Memorial", "rating": 4.6 }], "bestTime": "Afternoon", "spotCount": 10 }, { "city": "Goa", "state": "Goa", "zone": "Southern", "vector": [0.5648, 0.9167, 0.537, 1.0, 0.287], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Dudhsagar Falls", "rating": 4.6 }, { "name": "Arambol Beach", "rating": 4.6 }, { "name": "Palolem Beach", "rating": 4.6 }], "bestTime": "Afternoon", "spotCount": 14 }, { "city": "Ahmedabad", "state": "Gujarat", "zone": "Western", "vector": [0.6897, 0.7931, 1.0, 0.5862, 0.9655], "tags": ["Culture", "Social", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Sabarmati Ashram", "rating": 4.6 }, { "name": "Sabarmati Riverfront", "rating": 4.6 }, { "name": "Kankaria Lake", "rating": 4.5 }], "bestTime": "All", "spotCount": 5 }, { "city": "Dwarka", "state": "Gujarat", "zone": "Western", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Dwarkadhish Temple", "rating": 4.7 }], "bestTime": "Evening", "spotCount": 1 }, { "city": "Junagadh", "state": "Gujarat", "zone": "Western", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Gir National Park", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Bhuj", "state": "Gujarat", "zone": "Western", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "White Desert", "rating": 4.6 }], "bestTime": "Evening", "spotCount": 1 }, { "city": "Vadodara", "state": "Gujarat", "zone": "Western", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Laxmi Vilas Palace", "rating": 4.4 }], "bestTime": "Afternoon", "spotCount": 1 }, { "city": "Somnath", "state": "Gujarat", "zone": "Western", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.8, "topSpots": [{ "name": "Somnath Temple", "rating": 4.8 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Rann of Kutch", "state": "Gujarat", "zone": "Western", "vector": [1.0, 1.0, 1.0, 1.0, 1.0], "tags": ["Adventure", "Relaxation", "Culture"], "rating": 4.9, "topSpots": [{ "name": "Rann Utsav", "rating": 4.9 }], "bestTime": "Evening", "spotCount": 1 }, { "city": "Kevadia", "state": "Gujarat", "zone": "Western", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Statue of Unity", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Gandhinagar", "state": "Gujarat", "zone": "Western", "vector": [0.1579, 0.4737, 1.0, 0.1579, 0.2632], "tags": ["Culture", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Akshardham", "rating": 4.6 }, { "name": "Dandi Kutir", "rating": 4.5 }], "bestTime": "All", "spotCount": 2 }, { "city": "Jaipur", "state": "Rajasthan", "zone": "Northern", "vector": [0.2889, 0.4667, 1.0, 0.2889, 0.3778], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.5, "topSpots": [{ "name": "Amber Fort", "rating": 4.6 }, { "name": "Jaigarh Fort", "rating": 4.5 }, { "name": "Albert Hall Museum", "rating": 4.5 }], "bestTime": "All", "spotCount": 5 }, { "city": "Udaipur", "state": "Rajasthan", "zone": "Northern", "vector": [0.5833, 1.0, 0.9167, 1.0, 0.4167], "tags": ["Relaxation", "Nature", "Culture"], "rating": 4.5, "topSpots": [{ "name": "Lake Pichola", "rating": 4.6 }, { "name": "City Palace", "rating": 4.4 }], "bestTime": "All", "spotCount": 2 }, { "city": "Jaisalmer", "state": "Rajasthan", "zone": "Northern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Jaisalmer Fort", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Sawai Madhopur", "state": "Rajasthan", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Ranthambore National Park", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Pushkar", "state": "Rajasthan", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Pushkar Lake", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Ajmer", "state": "Rajasthan", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Ajmer Sharif Dargah", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Jodhpur", "state": "Rajasthan", "zone": "Northern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Mehrangarh Fort", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Chittorgarh", "state": "Rajasthan", "zone": "Northern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Chittorgarh Fort", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Mount Abu", "state": "Rajasthan", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Dilwara Temples", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Bikaner", "state": "Rajasthan", "zone": "Northern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Junagarh Fort", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Amritsar", "state": "Punjab", "zone": "Northern", "vector": [0.3478, 0.6957, 1.0, 0.3913, 0.4348], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.8, "topSpots": [{ "name": "Golden Temple (Harmandir Sahib)", "rating": 4.9 }, { "name": "Jallianwala Bagh", "rating": 4.8 }, { "name": "Wagah Border", "rating": 4.8 }], "bestTime": "Evening", "spotCount": 3 }, { "city": "Chandigarh", "state": "Punjab", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.2222, 0.6667], "tags": ["Culture", "Social", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Rock Garden", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Alappuzha", "state": "Kerala", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Alappuzha Beach", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Munnar", "state": "Kerala", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.3, "topSpots": [{ "name": "Munnar Tea Gardens", "rating": 4.3 }], "bestTime": "All", "spotCount": 1 }, { "city": "Kochi", "state": "Kerala", "zone": "Southern", "vector": [0.5652, 0.6957, 1.0, 0.5652, 1.0], "tags": ["Culture", "Social", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Wonderla Amusement Park", "rating": 4.6 }, { "name": "LuLu International Shopping Mall", "rating": 4.6 }, { "name": "Fort Kochi", "rating": 4.4 }], "bestTime": "All", "spotCount": 4 }, { "city": "Thiruvananthapuram", "state": "Kerala", "zone": "Southern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Padmanabhaswamy Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Wayanad", "state": "Kerala", "zone": "Southern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Wayanad Wildlife Sanctuary", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Thekkady", "state": "Kerala", "zone": "Southern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.3, "topSpots": [{ "name": "Periyar National Park", "rating": 4.3 }], "bestTime": "All", "spotCount": 1 }, { "city": "Kumarakom", "state": "Kerala", "zone": "Southern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 3.8, "topSpots": [{ "name": "Kumarakom Bird Sanctuary", "rating": 3.8 }], "bestTime": "All", "spotCount": 1 }, { "city": "Varkala", "state": "Kerala", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Varkala Beach", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Kovalam", "state": "Kerala", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Kovalam Beach", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Nelliyampathy", "state": "Kerala", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Seethargundu Viewpoint", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Mysore", "state": "Karnataka", "zone": "Southern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Mysore Palace", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Hampi", "state": "Karnataka", "zone": "Southern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Hampi Archaeological Ruins", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Coorg", "state": "Karnataka", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.1, "topSpots": [{ "name": "Abbey Falls", "rating": 4.1 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Gokarna", "state": "Karnataka", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Om Beach", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Chikmagalur", "state": "Karnataka", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Mullayanagiri", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Badami", "state": "Karnataka", "zone": "Southern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Badami Cave Temples", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Shivamogga", "state": "Karnataka", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Jog Falls", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Mangalore", "state": "Karnataka", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Panambur Beach", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Bandipur", "state": "Karnataka", "zone": "Southern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Bandipur National Park", "rating": 4.4 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Pune", "state": "Maharastra", "zone": "Western", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Shaniwar Wada", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Aurangabad", "state": "Maharastra", "zone": "Western", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Ajanta Caves", "rating": 4.6 }], "bestTime": "Afternoon", "spotCount": 1 }, { "city": "Nashik", "state": "Maharastra", "zone": "Western", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.1, "topSpots": [{ "name": "Sula Vineyards", "rating": 4.1 }], "bestTime": "Afternoon", "spotCount": 1 }, { "city": "Shirdi", "state": "Maharastra", "zone": "Western", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Sai Baba Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Shimla", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "The Ridge", "rating": 4.7 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Manali", "state": "Himachal Pradesh", "zone": "Northern", "vector": [1.0, 0.2, 0.1, 0.7, 0.3], "tags": ["Adventure", "Nature"], "rating": 4.1, "topSpots": [{ "name": "Solang Valley", "rating": 4.1 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Dalhousie", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Khajjiar Lake", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Kullu", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Great Himalayan National Park", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Chamba", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Chamera Lake", "rating": 4.4 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Kinnaur", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Sangla Valley", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Palampur", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.3333, 0.6667, 0.4444, 1.0, 0.1111], "tags": ["Nature", "Relaxation", "Culture"], "rating": 4.6, "topSpots": [{ "name": "Tea Gardens", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Mandi", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Prashar Lake", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Bir Billing", "state": "Himachal Pradesh", "zone": "Northern", "vector": [1.0, 0.2, 0.1, 0.7, 0.3], "tags": ["Adventure", "Nature"], "rating": 4.8, "topSpots": [{ "name": "Paragliding Site", "rating": 4.8 }], "bestTime": "All", "spotCount": 1 }, { "city": "McLeod Ganj", "state": "Himachal Pradesh", "zone": "Northern", "vector": [1.0, 0.2, 0.1, 0.7, 0.3], "tags": ["Adventure", "Nature"], "rating": 4.8, "topSpots": [{ "name": "Triund Trek", "rating": 4.8 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Manikaran", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "Manikaran Sahib", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Narkanda", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Hatu Peak", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Barot", "state": "Himachal Pradesh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.7, "topSpots": [{ "name": "Barot Valley", "rating": 4.7 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Nainital", "state": "Uttarakhand", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.2, "topSpots": [{ "name": "Naini Lake", "rating": 4.2 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Rishikesh", "state": "Uttarakhand", "zone": "Northern", "vector": [1.0, 1.0, 1.0, 1.0, 1.0], "tags": ["Adventure", "Relaxation", "Culture"], "rating": 4.4, "topSpots": [{ "name": "Laxman Jhula", "rating": 4.4 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Haridwar", "state": "Uttarakhand", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Har Ki Pauri", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Dehradun", "state": "Uttarakhand", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Robber's Cave", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Mussoorie", "state": "Uttarakhand", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.2, "topSpots": [{ "name": "Kempty Falls", "rating": 4.2 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Auli", "state": "Uttarakhand", "zone": "Northern", "vector": [1.0, 0.2, 0.1, 0.7, 0.3], "tags": ["Adventure", "Nature"], "rating": 4.5, "topSpots": [{ "name": "Auli Ski Resort", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Badrinath", "state": "Uttarakhand", "zone": "Northern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.8, "topSpots": [{ "name": "Badrinath Temple", "rating": 4.8 }], "bestTime": "All", "spotCount": 1 }, { "city": "Almora", "state": "Uttarakhand", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.3, "topSpots": [{ "name": "Binsar Wildlife Sanctuary", "rating": 4.3 }], "bestTime": "All", "spotCount": 1 }, { "city": "Jim Corbett", "state": "Uttarakhand", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Jim Corbett National Park", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Joshimath", "state": "Uttarakhand", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.7, "topSpots": [{ "name": "Valley of Flowers", "rating": 4.7 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Agra", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Taj Mahal", "rating": 4.6 }, { "name": "Agra Fort", "rating": 4.5 }], "bestTime": "Afternoon", "spotCount": 2 }, { "city": "Varanasi", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Kashi Vishwanath Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Lucknow", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.2308, 0.4615, 1.0, 0.2308, 1.0], "tags": ["Culture", "Social", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Phoenix Palassio", "rating": 4.6 }, { "name": "Bara Imambara", "rating": 4.4 }], "bestTime": "All", "spotCount": 2 }, { "city": "Mathura", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.3043, 0.6522, 1.0, 0.3043, 0.3913], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.5, "topSpots": [{ "name": "Barsana Mandir", "rating": 4.8 }, { "name": "Krishna Janmabhoomi", "rating": 4.7 }, { "name": "Nand Gaon", "rating": 4.1 }], "bestTime": "Morning", "spotCount": 3 }, { "city": "Ayodhya", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.8, "topSpots": [{ "name": "Ram Janmabhoomi", "rating": 4.8 }], "bestTime": "All", "spotCount": 1 }, { "city": "Vrindavan", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.8, "topSpots": [{ "name": "Banke Bihari Temple", "rating": 4.8 }, { "name": "Prem Mandir", "rating": 4.8 }], "bestTime": "Evening", "spotCount": 2 }, { "city": "Allahabad", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Triveni Sangam", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Noida", "state": "Uttar Pradesh", "zone": "Central", "vector": [0.8182, 0.4545, 0.3636, 1.0, 1.0], "tags": ["Nature", "Social", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "DLF Mall of India", "rating": 4.6 }, { "name": "Okhla Bird Sanctuary", "rating": 4.3 }], "bestTime": "All", "spotCount": 2 }, { "city": "Srinagar", "state": "Jammu and Kashmir", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Dal Lake", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Leh", "state": "Ladakh", "zone": "Northern", "vector": [0.7586, 0.9655, 0.7241, 1.0, 0.3793], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Pangong Tso", "rating": 4.9 }, { "name": "Thiksey Monastery", "rating": 4.7 }, { "name": "Nubra Valley", "rating": 4.5 }], "bestTime": "All", "spotCount": 5 }, { "city": "Pahalgam", "state": "Jammu and Kashmir", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Betaab Valley", "rating": 4.6 }], "bestTime": "All", "spotCount": 1 }, { "city": "Nubra Valley", "state": "Ladakh", "zone": "Northern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Nubra Valley", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Kishtwar", "state": "Jammu and Kashmir", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.3, "topSpots": [{ "name": "Kishtwar National Park", "rating": 4.3 }], "bestTime": "All", "spotCount": 1 }, { "city": "Hemis", "state": "Ladakh", "zone": "Northern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Hemis National Park", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Darjeeling", "state": "West Bengal", "zone": "Eastern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Tiger Hill", "rating": 4.5 }], "bestTime": "All", "spotCount": 1 }, { "city": "Siliguri", "state": "West Bengal", "zone": "Eastern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Jaldapara National Park", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Sundarbans", "state": "West Bengal", "zone": "Eastern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Sundarbans National Park", "rating": 4.4 }], "bestTime": "All", "spotCount": 1 }, { "city": "Puri", "state": "Odisha", "zone": "Eastern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Jagannath Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Konark", "state": "Odisha", "zone": "Eastern", "vector": [0.2, 0.4, 1.0, 0.2, 0.3], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Sun Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Bhubaneswar", "state": "Odisha", "zone": "Eastern", "vector": [0.8182, 0.7273, 0.9091, 1.0, 0.2727], "tags": ["Nature", "Culture", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Lingaraj Temple", "rating": 4.6 }, { "name": "Nandankanan Zoological Park", "rating": 4.4 }], "bestTime": "Afternoon", "spotCount": 2 }, { "city": "Chennai", "state": "Tamil Nadu", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 3.9, "topSpots": [{ "name": "Marina Beach", "rating": 3.9 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Madurai", "state": "Tamil Nadu", "zone": "Southern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Meenakshi Amman Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Ooty", "state": "Tamil Nadu", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.1, "topSpots": [{ "name": "Ooty Lake", "rating": 4.1 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Thanjavur", "state": "Tamil Nadu", "zone": "Southern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.8, "topSpots": [{ "name": "Brihadeeswarar Temple", "rating": 4.8 }], "bestTime": "All", "spotCount": 1 }, { "city": "Vijayawada", "state": "Andhra Pradesh", "zone": "Southern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Kanaka Durga Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Visakhapatnam", "state": "Andhra Pradesh", "zone": "Southern", "vector": [0.9756, 0.9512, 0.9024, 0.878, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.4, "topSpots": [{ "name": "Submarine Museum", "rating": 4.6 }, { "name": "War Memorial", "rating": 4.6 }, { "name": "Rishikonda Beach", "rating": 4.5 }], "bestTime": "All", "spotCount": 8 }, { "city": "Rajahmundry", "state": "Andhra Pradesh", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.3, "topSpots": [{ "name": "Papikondalu", "rating": 4.3 }], "bestTime": "All", "spotCount": 1 }, { "city": "Gangtok", "state": "Sikkim", "zone": "Eastern", "vector": [0.3103, 0.7586, 1.0, 0.4828, 0.3103], "tags": ["Culture", "Relaxation", "Nature"], "rating": 4.5, "topSpots": [{ "name": "Baba Harbhajan Singh Temple", "rating": 4.7 }, { "name": "Rumtek Monastery", "rating": 4.6 }, { "name": "Tsomgo Lake", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 4 }, { "city": "Guwahati", "state": "Assam", "zone": "North Eastern", "vector": [0.6667, 0.7619, 0.5238, 1.0, 0.2381], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.4, "topSpots": [{ "name": "Kamakhya Temple", "rating": 4.6 }, { "name": "Pobitora Wildlife Sanctuary", "rating": 4.4 }, { "name": "Umananda Island", "rating": 4.1 }], "bestTime": "All", "spotCount": 3 }, { "city": "Kaziranga", "state": "Assam", "zone": "North Eastern", "vector": [0.8, 0.3, 0.1, 1.0, 0.1], "tags": ["Nature", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Kaziranga National Park", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Tawang", "state": "Arunachal Pradesh", "zone": "North Eastern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Tawang Monastery", "rating": 4.7 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Puducherry", "state": "Puducherry", "zone": "Southern", "vector": [0.75, 0.75, 0.25, 0.5, 1.0], "tags": ["Social", "Adventure", "Relaxation"], "rating": 4.5, "topSpots": [{ "name": "Promenade Beach", "rating": 4.5 }, { "name": "Paradise Beach", "rating": 4.5 }], "bestTime": "Morning", "spotCount": 2 }, { "city": "Havelock Island", "state": "Andaman and Nicobar Islands", "zone": "Southern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.8, "topSpots": [{ "name": "Radhanagar Beach", "rating": 4.8 }], "bestTime": "Morning", "spotCount": 1 }, { "city": "Diu", "state": "Daman and Diu", "zone": "Western", "vector": [0.5833, 1.0, 0.9167, 1.0, 0.4167], "tags": ["Relaxation", "Nature", "Culture"], "rating": 4.5, "topSpots": [{ "name": "Diu Fort", "rating": 4.6 }, { "name": "Naida Caves", "rating": 4.5 }], "bestTime": "Afternoon", "spotCount": 2 }, { "city": "Bodh Gaya", "state": "Bihar", "zone": "Eastern", "vector": [0.1111, 0.5556, 1.0, 0.1111, 0.2222], "tags": ["Culture", "Relaxation"], "rating": 4.7, "topSpots": [{ "name": "Mahabodhi Temple", "rating": 4.7 }], "bestTime": "All", "spotCount": 1 }, { "city": "Patna", "state": "Bihar", "zone": "Eastern", "vector": [0.875, 0.8125, 0.9375, 1.0, 0.5], "tags": ["Nature", "Culture", "Adventure"], "rating": 4.5, "topSpots": [{ "name": "Takhat Shri Harimandir Ji Patna Sahib", "rating": 4.7 }, { "name": "Budhha Smriti Park", "rating": 4.4 }, { "name": "Sanjay Gandhi Biological Park", "rating": 4.3 }], "bestTime": "All", "spotCount": 3 }, { "city": "Gurugram", "state": "Haryana", "zone": "Northern", "vector": [0.55, 0.6, 0.65, 0.55, 1.0], "tags": ["Social", "Culture", "Relaxation"], "rating": 4.6, "topSpots": [{ "name": "DLF CyberHub", "rating": 4.7 }, { "name": "Ambience Mall", "rating": 4.6 }, { "name": "Kingdom of Dreams", "rating": 4.4 }], "bestTime": "Afternoon", "spotCount": 3 }, { "city": "New Delhi", "state": "Delhi", "zone": "Northern", "vector": [0.3333, 0.5833, 1.0, 0.3333, 0.4167], "tags": ["Culture", "Relaxation", "Social"], "rating": 4.6, "topSpots": [{ "name": "Gurudwara Bangla Sahib", "rating": 4.8 }, { "name": "Jama Masjid", "rating": 4.5 }, { "name": "Rail Museum", "rating": 4.4 }], "bestTime": "Morning", "spotCount": 3 }, { "city": "Cherrapunji", "state": "Meghalaya", "zone": "North Eastern", "vector": [0.5, 0.8, 0.1, 1.0, 0.2], "tags": ["Nature", "Relaxation", "Adventure"], "rating": 4.6, "topSpots": [{ "name": "Living Root Bridge", "rating": 4.6 }], "bestTime": "Morning", "spotCount": 1 }];

// ─── COSINE SIMILARITY MATCHING ENGINE ────────────────────────────────────────
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return magA && magB ? dot / (magA * magB) : 0;
}

// Trait order: [Adventure, Relaxation, Culture, Nature, Social]
function getTopRecommendations(surveyVector, count = 6) {
    const scored = CITY_DATA.map(city => ({
        ...city,
        score: cosineSimilarity(surveyVector, city.vector),
        // Blend with rating for tiebreaking (weighted 90% similarity, 10% rating)
        finalScore: cosineSimilarity(surveyVector, city.vector) * 0.9 + (city.rating / 5) * 0.1
    }));

    scored.sort((a, b) => b.finalScore - a.finalScore);

    // Deduplicate — ensure geographic diversity (max 2 per state)
    const stateCount = {};
    const diverse = [];
    for (const city of scored) {
        if (diverse.length >= count) break;
        const sc = stateCount[city.state] || 0;
        if (sc < 2) {
            diverse.push(city);
            stateCount[city.state] = sc + 1;
        }
    }
    return diverse;
}

// ─── CITY IMAGE HELPER (Unsplash keyword-based) ────────────────────────────────
function getCityImageUrl(city, state) {
    const queries = {
        Manali: 'manali himachal snow mountains',
        'Bir Billing': 'bir billing paragliding himachal',
        'McLeod Ganj': 'mcleod ganj dharamsala mountains',
        Auli: 'auli ski resort uttarakhand snow',
        Leh: 'leh ladakh monastery mountains',
        Rishikesh: 'rishikesh ganga river yoga',
        Goa: 'goa beach tropical india',
        Jaipur: 'jaipur pink city rajasthan',
        Varanasi: 'varanasi ganga ghats',
        Agra: 'taj mahal agra india',
        Amritsar: 'golden temple amritsar',
        Hampi: 'hampi ruins karnataka',
        Munnar: 'munnar tea garden kerala',
        Darjeeling: 'darjeeling tea estate mountains',
        Kaziranga: 'kaziranga rhino assam',
        'Rann of Kutch': 'rann kutch white salt desert',
        Udaipur: 'udaipur lake palace rajasthan',
        Coorg: 'coorg coffee plantation karnataka',
        Shimla: 'shimla snow mountains himachal',
    };
    const q = queries[city] || `${city},india`;
    return `https://loremflickr.com/800/500/${encodeURIComponent(q)}?lock=${city.length}`;
}

// ─── TAG COLOR MAP ─────────────────────────────────────────────────────────────
const TAG_COLORS = {
    Adventure: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Relaxation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Culture: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Nature: 'bg-green-500/10 text-green-500 border-green-500/20',
    Social: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

// ─── MATCH % BADGE ─────────────────────────────────────────────────────────────
function MatchBadge({ score }) {
    const pct = Math.round(score * 100);
    const color = pct >= 90 ? 'text-green-400' : pct >= 75 ? 'text-yellow-400' : 'text-gray-400';
    return (
        <div className={`absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-black ${color}`}>
            {pct}% match
        </div>
    );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [whyItData, setWhyItData] = useState(null);
    const [whyItLoading, setWhyItLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const survey = location.state?.survey; // [Adventure, Relaxation, Culture, Nature, Social]

    useEffect(() => {
        if (!survey) { navigate('/quiz'); return; }

        // ── CLIENT-SIDE MATCHING (replaces unreliable backend) ──
        const recommendations = getTopRecommendations(survey, 6);
        setResults(recommendations);
        setLoading(false);
    }, [survey, navigate]);

    const handleWhyIt = async (dest) => {
        setWhyItLoading(true);
        setModalOpen(true);
        setWhyItData({ city: dest.city, reasons: [] });
        try {
            const res = await fetch(`${API_BASE_URL}/api/quiz/why-it`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city: dest.city,
                    spots: dest.topSpots.map(s => s.name)
                })
            });
            const data = await res.json();
            setWhyItData({ city: dest.city, reasons: data.reasons });
        } catch (err) {
            // Fallback: use local spot data if API fails
            setWhyItData({
                city: dest.city,
                reasons: dest.topSpots.map(s => ({
                    name: s.name,
                    description: `One of the top-rated attractions in ${dest.city} with a ${s.rating} Google rating.`,
                    image: null
                }))
            });
        } finally {
            setWhyItLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] dark:bg-gray-950">
            <div className="w-16 h-16 border-4 border-secondary border-t-accent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-primary dark:text-white animate-pulse">Finding your perfect match...</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-24 pb-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black text-primary dark:text-white mb-4">Your AI Recommendations</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xl">Matched to your unique vibe using cosine similarity across 214 Indian destinations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {results.map((dest, idx) => (
                        <motion.div
                            key={dest.city}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-white/5 flex flex-col"
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img
                                    src={getCityImageUrl(dest.city, dest.state)}
                                    alt={dest.city}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    onError={e => { e.target.src = `https://loremflickr.com/800/500/india,travel?lock=${idx}`; }}
                                />
                                <MatchBadge score={dest.score} />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 font-bold text-primary text-sm shadow-sm">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> {dest.rating}
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-primary dark:text-white mb-1 flex items-center gap-2">
                                    <MapPin size={20} className="text-secondary flex-shrink-0" />
                                    {dest.city}
                                </h3>
                                <p className="text-xs text-gray-400 mb-4 ml-7">{dest.state} · {dest.zone} India</p>

                                <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                                    <Sun size={14} /> Best time: <span className="font-semibold text-gray-600 dark:text-gray-300">{dest.bestTime}</span>
                                    <Clock size={14} className="ml-2" /> {dest.spotCount} spots
                                </div>

                                <div className="mb-6 flex-1">
                                    <h4 className="font-bold text-sm text-primary dark:text-white mb-3 uppercase tracking-wide">Top Spots:</h4>
                                    <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-2">
                                        {dest.topSpots.map((spot, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0"></span>
                                                <span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{spot.name}</span>
                                                    <span className="text-xs text-yellow-500 ml-2">★ {spot.rating}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                    {dest.tags.map(tag => (
                                        <span key={tag} className={`px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wider ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleWhyIt(dest)}
                                        className="w-full py-3 bg-secondary/10 text-secondary border border-secondary/20 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/20 transition-colors"
                                    >
                                        <Sparkles size={18} /> Why This City?
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ gap: '12px' }}
                                        onClick={() => navigate('/planner', {
                                            state: {
                                                destination: dest.city,
                                                spots: dest.topSpots.map(s => s.name)
                                            }
                                        })}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Plan Trip to {dest.city} <ArrowRight size={20} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="flex items-center gap-2 text-gray-500 font-bold hover:text-secondary transition-colors"
                    >
                        <RefreshCcw size={20} /> Retake Quiz
                    </button>
                </div>
            </div>

            {/* WHY THIS CITY MODAL */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-primary dark:text-white flex items-center gap-3">
                                        <Sparkles className="text-secondary" size={28} /> Why {whyItData?.city}?
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">Top spots in this destination.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                {whyItLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Sparkles className="animate-spin text-secondary mb-4" size={40} />
                                        <p className="font-bold text-gray-500 animate-pulse">Fetching insights for {whyItData?.city}...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {whyItData?.reasons.map((reason, idx) => (
                                            <div key={idx} className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                                                {reason.image && (
                                                    <div className="h-48 overflow-hidden">
                                                        <img src={reason.image} alt={reason.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 line-clamp-1">{reason.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{reason.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}