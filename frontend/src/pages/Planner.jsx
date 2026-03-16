import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, IndianRupee, Users, Calendar, Compass, Star, Map as MapIcon, Utensils, Ticket, ShieldAlert, TrainFront, BusFront } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';

const createIcon = (color) => divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const hotelIcon = createIcon('#3FA9F5'); // Secondary
const attractionIcon = createIcon('#FF7A45'); // Accent

function SetMapBounds({ markers }) {
  const map = useMap();
  React.useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map(m => [m.lat, m.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

function TravelInputForm({ onSubmit, loading, initialDestination }) {
  const [formData, setFormData] = useState({
    origin: '', destination: initialDestination || '', budget: '', travelers: 1, travel_style: 'Budget Friendly', duration: '', gemini_key: 'AIzaSyDMoFVhZhSb4J9r7_I1eno3w69xbUE1TNM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    const data = {
      ...formData,
      budget: parseFloat(formData.budget),
      travelers: parseInt(formData.travelers, 10),
      duration: formData.duration ? parseInt(formData.duration, 10) : null
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-bold text-primary mb-8 text-center">Plan Your Dream Trip</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><MapPin size={18} /> Origin</span>
          <input required type="text" className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="E.g. New York"
            value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><MapPin size={18} /> Destination</span>
          <input required type="text" className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="E.g. Paris"
            value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><IndianRupee size={18} /> Budget (₹)</span>
          <input required type="number" min="1" className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="1500"
            value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><Users size={18} /> Travelers</span>
          <input required type="number" min="1" className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl"
            value={formData.travelers} onChange={e => setFormData({ ...formData, travelers: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><Compass size={18} /> Style</span>
          <select className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl bg-white"
            value={formData.travel_style} onChange={e => setFormData({ ...formData, travel_style: e.target.value })}>
            <option value="Budget Friendly">Budget Friendly</option>
            <option value="Adventure">Adventure</option>
            <option value="Relax">Relax</option>
            <option value="Cultural">Cultural</option>
            <option value="Nature">Nature</option>
            <option value="Luxury">Luxury</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2"><Calendar size={18} /> Duration (Days, Optional)</span>
          <input type="number" min="1" className="w-full p-4 border border-gray-200 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="Leave empty for auto-estimation"
            value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
        </label>
      </div>
      <button type="submit" disabled={loading} className="mt-10 w-full p-5 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 shadow-xl shadow-accent/20 transition-all flex justify-center items-center h-16 text-lg">
        {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate Full Itinerary'}
      </button>
    </form>
  )
}

function TripOverview({ data }) {
  return (
    <section className="bg-white p-8 rounded-3xl shadow-lg border-l-8 border-primary mb-10">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-6"><Compass className="text-primary" /> {data.destination}</h3>
      <p className="text-gray-600 mb-8 text-xl leading-relaxed">{data.description}</p>
      <div className="flex gap-4">
        <span className="bg-secondary/10 text-secondary px-6 py-3 rounded-2xl font-bold border border-secondary/10">🗓️ {data.duration} Days</span>
      </div>
    </section>
  )
}

function HotelRecommendations({ hotels }) {
  if (!hotels || hotels.length === 0) return null;
  return (
    <section className="mb-10 p-10 bg-white rounded-3xl shadow-lg border border-gray-50">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary"><Star className="text-accent fill-accent" size={32} /> Hand-Picked Hotels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((h, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="bg-background p-8 rounded-3xl border border-gray-100 flex flex-col justify-between hover:border-secondary hover:shadow-xl transition-all group">
            <div>
              <h4 className="font-bold text-2xl mb-3 text-primary group-hover:text-secondary transition-colors">{h.name}</h4>
              <div className="flex items-center gap-2 text-yellow-500 mb-4 font-black">
                <Star size={20} fill="currentColor" /> {h.rating} / 5.0
              </div>
              <p className="text-base text-gray-500 mb-6 flex items-center gap-2 font-medium"><MapPin size={18} className="text-gray-300" /> {h.distance_from_center} miles from center</p>
            </div>
            <div className="mt-auto font-black text-green-600 text-3xl border-t border-gray-100 pt-6 flex items-end">
              ₹{h.price} <span className="text-sm text-gray-400 font-semibold mb-2 ml-2">/ night</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function MapSection({ hotels, attractions }) {
  const validHotels = hotels.filter(h => h.lat !== 0 && h.lng !== 0);
  const validAttractions = attractions.filter(a => a.lat !== 0 && a.lng !== 0);
  const allMarkers = [...validHotels, ...validAttractions];
  const defaultCenter = [51.505, -0.09];
  const initialCenter = allMarkers.length > 0 ? [allMarkers[0].lat, allMarkers[0].lng] : defaultCenter;

  return (
    <section className="p-10 bg-white rounded-3xl shadow-lg border border-gray-50 mb-10">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary"><MapIcon className="text-secondary" size={32} /> Interactive Destination Map</h3>
      <div className="flex gap-6 mb-8 text-sm font-bold uppercase tracking-wider">
        <span className="flex items-center gap-2 text-secondary bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10"><div className="w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div> Hotels</span>
        <span className="flex items-center gap-2 text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/10"><div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"></div> Attractions</span>
      </div>

      <div className="w-full h-[500px] rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-inner z-0">
        <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allMarkers.length > 0 && <SetMapBounds markers={allMarkers} />}
          {validHotels.map((h, i) => (
            <Marker key={`h-${i}`} position={[h.lat, h.lng]} icon={hotelIcon}>
              <Popup><div className="p-2 font-sans font-bold text-lg">{h.name}</div></Popup>
            </Marker>
          ))}
          {validAttractions.map((a, i) => (
            <Marker key={`a-${i}`} position={[a.lat, a.lng]} icon={attractionIcon}>
              <Popup><div className="p-2 font-sans font-bold text-lg">{a.name}</div></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

function Itinerary({ itinerary }) {
  if (!itinerary || itinerary.length === 0) return null;
  return (
    <section className="mb-10 p-10 bg-white rounded-3xl shadow-lg">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary"><MapPin className="text-accent" size={32} /> The Perfect Itinerary</h3>
      <div className="space-y-10">
        {itinerary.map((day, idx) => (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} key={day.day} className="bg-background p-10 rounded-[32px] border border-gray-100 hover:border-secondary transition-all">
            <h4 className="text-2xl font-black text-secondary mb-8 pb-4 border-b border-gray-200 flex items-center gap-3">
              <Calendar size={28} className="text-secondary" /> Day {day.day}
            </h4>
            <div className="space-y-6">
              {day.activities.map((act, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-6 group">
                  <div className="bg-primary text-white w-32 text-center py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {act.time}
                  </div>
                  <div className="text-primary font-bold text-xl px-2">
                    {act.activity}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function EstimatedBudget({ costs, totalBudget }) {
  const isOver = costs.total_cost > totalBudget;
  return (
    <section className="mb-10 p-10 bg-gray-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-3xl font-bold flex items-center gap-3 mb-12"><IndianRupee className="text-accent bg-accent/20 rounded-2xl p-2" size={40} /> Financial Breakdown</h3>
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-6">
                {[
                    { icon: (costs.transport_mode_label?.includes("Bus")) ? <BusFront size={24} /> : (costs.transport_mode_label?.includes("Train")) ? <TrainFront size={24} /> : <MapPin size={24} />, label: costs.transport_mode_label || "Flights & Travel", val: costs.flight_cost },
                    { icon: <Star size={24} />, label: `Accommodation (${costs.rooms_needed || 1} Room${costs.rooms_needed > 1 ? 's' : ''})`, val: costs.hotel_cost },
                    { icon: <Utensils size={24} />, label: "Food & Dining", val: costs.food_cost },
                    { icon: <Compass size={24} />, label: "Local Transport", val: costs.transport_cost },
                    { icon: <Ticket size={24} />, label: "Sightseeing", val: costs.attractions_cost }
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="flex items-center gap-3 text-gray-400 font-bold">{item.icon} {item.label}</span>
                        <span className="font-black text-2xl text-accent">₹{item.val}</span>
                    </div>
                ))}
            </div>
            <div className="flex-1 rounded-[32px] p-12 flex flex-col items-center justify-center text-center border-4 border-dashed border-white/10 bg-white/5 backdrop-blur-xl">
                <p className={`mb-4 font-black uppercase tracking-widest text-sm ${isOver ? 'text-red-400' : 'text-accent'}`}>Estimated Grand Total</p>
                <h2 className={`text-8xl font-black mb-10 tracking-tighter ${isOver ? 'text-red-500' : 'text-accent'}`}>₹{costs.total_cost}</h2>
                <div className={`text-xl font-black px-10 py-5 rounded-[24px] shadow-2xl ${isOver ? 'bg-red-500 text-white' : 'bg-accent text-primary transition-transform hover:scale-105 cursor-default'}`}>
                    {isOver ? `⚠️ OVER BUDGET BY ₹${(costs.total_cost - totalBudget).toFixed(2)}` : `✅ UNDER BUDGET BY ₹${(totalBudget - costs.total_cost).toFixed(2)}`}
                </div>
            </div>
        </div>
      </div>
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
    </section>
  )
}

function LoadingOverlay() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center z-[100]">
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 border-[12px] border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-[12px] border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="text-4xl font-black text-white animate-pulse mb-4 tracking-tight">AI is Architecting your Trip...</h2>
      <p className="text-blue-200 font-bold text-center px-6 max-w-xl text-lg leading-relaxed italic">"Gathering live coordinates and premium pricing data for a collision-free adventure..."</p>
    </motion.div>
  )
}

export default function Planner() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [budgetConstraint, setBudgetConstraint] = useState(0);

  const initialDestination = location.state?.destination || '';

  const fetchPlan = async (formData) => {
    setLoading(true);
    setBudgetConstraint(formData.budget);
    try {
      const res = await fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setPlanData(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 pb-32 pt-20">
      <AnimatePresence>
        {loading && <LoadingOverlay key="loading" />}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6">
        {!planData && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="text-center mb-16">
              <h2 className="text-6xl font-black text-primary mb-6 tracking-tight">Trip <span className="text-accent">Architect</span></h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Knowing where you want to go is half the battle. Let our AI handle the logistics, costs, and itineraries.</p>
            </div>
            <TravelInputForm onSubmit={fetchPlan} loading={loading} initialDestination={initialDestination} />
          </motion.div>
        )}

        {planData && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-10 rounded-[40px] shadow-sm border border-gray-50">
              <div className="mb-6 md:mb-0">
                <p className="text-accent font-black uppercase tracking-widest text-sm mb-2">Plan Ready</p>
                <h2 className="text-4xl font-black text-primary">Your Masterpiece Itinerary</h2>
              </div>
              <button 
                onClick={() => setPlanData(null)} 
                className="px-8 py-4 bg-gray-100 text-primary hover:bg-primary hover:text-white font-black rounded-2xl transition-all shadow-md active:scale-95"
              >
                ← Edit Parameters
              </button>
            </div>

            <TripOverview data={planData} />
            <MapSection hotels={planData.hotels} attractions={planData.attractions} />
            <HotelRecommendations hotels={planData.hotels} />
            <Itinerary itinerary={planData.itinerary} />
            <EstimatedBudget costs={planData.costs} totalBudget={budgetConstraint} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
