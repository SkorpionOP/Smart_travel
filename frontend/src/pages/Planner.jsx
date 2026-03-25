import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, IndianRupee, Users, Calendar, Compass, Star, Map as MapIcon, Utensils, Ticket, ShieldAlert, TrainFront, BusFront, CheckCircle2, PartyPopper, X, Heart } from 'lucide-react';
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

// ── Confirm Booking Modal ──
function ConfirmTripModal({ formData, onConfirm, onDismiss }) {
  const dest = formData?.destination || '?';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onDismiss}>
      <motion.div initial={{ scale: 0.88, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[36px] p-10 shadow-2xl border border-gray-100 dark:border-white/5 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent/30">
          <PartyPopper size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-primary dark:text-white mb-2">Heading to {dest}?</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8 leading-relaxed">
          Save this trip to your profile so you can rate it later — the ML engine will use your rating to give even smarter picks next time!
        </p>
        <div className="flex flex-col gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="w-full py-4 bg-gradient-to-r from-secondary to-accent text-white font-black rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> Yes! Save to My Profile
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} onClick={onDismiss}
            className="w-full py-4 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
            Not yet, keep exploring
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TravelInputForm({ onSubmit, loading, initialDestination, initialSpots }) {
  const [formData, setFormData] = useState({
    origin: '', destination: initialDestination || '', budget: '', travelers: 1, travel_style: 'Budget Friendly', duration: '', gemini_key: '', spots: initialSpots || []
  });

  useEffect(() => {
    if (initialDestination) {
      setFormData(prev => ({ ...prev, destination: initialDestination, spots: initialSpots || [] }));
    }
  }, [initialDestination, initialSpots]);

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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100 dark:border-white/5">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-8 text-center">Plan Your Dream Trip</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><MapPin size={18} /> Origin</span>
          <input required type="text" className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="E.g. New York"
            value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><MapPin size={18} /> Destination</span>
          <input required type="text" className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="E.g. Paris"
            value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><IndianRupee size={18} /> Budget (₹)</span>
          <input required type="number" min="1" className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="1500"
            value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><Users size={18} /> Travelers</span>
          <input required type="number" min="1" className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl"
            value={formData.travelers} onChange={e => setFormData({ ...formData, travelers: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><Compass size={18} /> Style</span>
          <select className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl"
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
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 mb-2"><Calendar size={18} /> Duration (Days, Optional)</span>
          <input type="number" min="1" className="w-full p-4 border border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl" placeholder="Leave empty for auto-estimation"
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
    <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg border-l-8 border-primary mb-10">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-6 text-primary dark:text-white"><Compass className="text-primary" /> {data.destination}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-xl leading-relaxed">{data.description}</p>
      <div className="flex gap-4">
        <span className="bg-secondary/10 text-secondary px-6 py-3 rounded-2xl font-bold border border-secondary/10">🗓️ {data.duration} Days</span>
      </div>
    </section>
  )
}

function HotelRecommendations({ hotels }) {
  if (!hotels || hotels.length === 0) return null;
  return (
    <section className="mb-10 p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-50 dark:border-white/5">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary dark:text-white"><Star className="text-accent fill-accent" size={32} /> Hand-Picked Hotels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((h, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#F5F7FA] dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:border-secondary hover:shadow-xl transition-all group">
            <div>
              <h4 className="font-bold text-2xl mb-3 text-primary dark:text-white group-hover:text-secondary transition-colors">{h.name}</h4>
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

function CulinaryHighlights({ culinary }) {
  if (!culinary || culinary.length === 0) return null;
  return (
    <section className="mb-10 p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-50 dark:border-white/5">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary dark:text-white"><Utensils className="text-secondary" size={32} /> Local Culinary Prices</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {culinary.map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="bg-[#F5F7FA] dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:border-accent hover:shadow-lg transition-all group">
            <h4 className="font-bold text-lg mb-3 text-primary dark:text-white group-hover:text-accent transition-colors">{item.name}</h4>
            <div className="mt-auto font-black text-green-600 text-2xl pt-4 border-t border-gray-100 flex items-end">
              ₹{item.price}
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
    <section className="p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-50 dark:border-white/5 mb-10">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary dark:text-white"><MapIcon className="text-secondary" size={32} /> Interactive Destination Map</h3>
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
    <section className="mb-10 p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-lg">
      <h3 className="text-3xl font-bold flex items-center gap-3 mb-10 text-primary dark:text-white"><MapPin className="text-accent" size={32} /> The Perfect Itinerary</h3>
      <div className="space-y-10">
        {itinerary.map((day, idx) => (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} key={day.day} className="bg-[#F5F7FA] dark:bg-gray-800 p-10 rounded-[32px] border border-gray-100 dark:border-white/5 hover:border-secondary transition-all">
            <h4 className="text-2xl font-black text-secondary mb-8 pb-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
              <Calendar size={28} className="text-secondary" /> Day {day.day}
            </h4>
            <div className="space-y-6">
              {day.activities.map((act, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-6 group">
                  <div className="bg-primary text-white w-32 text-center py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {act.time}
                  </div>
                  <div className="text-primary dark:text-white font-bold text-xl px-2">
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
  const messages = [
    '"Gathering live hotel prices across India..."',
    '"Plotting the perfect day-by-day route..."',
    '"Scanning OpenStreetMap for hidden gems..."',
    '"AI is crafting your personalised itinerary..."',
  ];
  const [msgIdx, setMsgIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-950 via-[#0a1628] to-gray-900 backdrop-blur-xl flex flex-col items-center justify-center z-[100]">
      {/* Glowing orb background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Spinner */}
        <div className="relative w-28 h-28 mb-10">
          <div className="absolute inset-0 border-[10px] border-white/5 rounded-full" />
          <div className="absolute inset-0 border-[10px] border-t-accent border-r-secondary border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 border-[6px] border-t-transparent border-accent/30 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass size={28} className="text-secondary opacity-60" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          Building Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Perfect Trip</span>
        </h2>

        <AnimatePresence mode="wait">
          <motion.p key={msgIdx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-gray-400 font-medium text-center px-8 max-w-md text-base leading-relaxed italic">
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-10">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [lastFormData, setLastFormData] = useState(null);
  const [tripSaved, setTripSaved] = useState(false);
  const [budgetConstraint, setBudgetConstraint] = useState(0);

  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedDest, setSelectedDest] = useState('');

  const initialDestination = location.state?.destination || '';
  const initialSpots = location.state?.spots || [];

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId && !initialDestination && !selectedDest) {
      setRecsLoading(true);
      fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms/api/user/${userId}/recommendations`)
        .then(res => res.json())
        .then(data => setRecs(data.recommendations))
        .catch(console.error)
        .finally(() => setRecsLoading(false));
    }
  }, [initialDestination, selectedDest]);

  const fetchPlan = async (formData) => {
    setLoading(true);
    setBudgetConstraint(formData.budget);
    setLastFormData(formData);
    setTripSaved(false);
    try {
      const res = await fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setPlanData(data);
      // Prompt after plan loads
      setTimeout(() => setConfirmModal(true), 1200);
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = () => {
    const trips = JSON.parse(localStorage.getItem('saved_trips') || '[]');
    const newTrip = {
      id: Date.now(),
      destination: lastFormData?.destination || '?',
      budget: parseFloat(lastFormData?.budget || 0),
      style: lastFormData?.travel_style,
      savedAt: new Date().toISOString(),
      rating: 0,
    };
    trips.unshift(newTrip);
    localStorage.setItem('saved_trips', JSON.stringify(trips));
    setConfirmModal(false);
    setTripSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 font-sans text-gray-800 dark:text-white pb-32 pt-20">
      <AnimatePresence>
        {loading && <LoadingOverlay key="loading" />}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6">
        {!planData && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="text-center mb-16">
              <h2 className="text-6xl font-black text-primary dark:text-white mb-6 tracking-tight">Trip <span className="text-accent">Architect</span></h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">Knowing where you want to go is half the battle. Let our AI handle the logistics, costs, and itineraries.</p>
            </div>
            
            {recs && !selectedDest && !initialDestination && (
              <div className="mb-16">
                <h3 className="text-3xl font-black text-primary mb-6 flex items-center gap-3"><Star className="text-accent" fill="currentColor" /> Highly Recommended for You</h3>
                <p className="text-gray-500 mb-6 -mt-2">Based on your global travel preferences & collaborative trends.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recs.map((rec, i) => (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}} key={i} 
                      onClick={() => setSelectedDest(rec.name)} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 cursor-pointer hover:border-secondary transition-all hover:shadow-xl group">
                      <h4 className="font-bold text-2xl text-primary group-hover:text-secondary mb-1">{rec.name}</h4>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">{rec.country}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{rec.climate}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{rec.travel_type}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-3 py-1 rounded-full">{rec.budget_level}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="flex items-center gap-2 font-bold text-sm text-yellow-500"><Star size={16} fill="currentColor"/> {rec.rating}</span>
                        <span className="text-xs font-black text-secondary group-hover:text-accent uppercase transition-colors">Select Dest ➔</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <TravelInputForm onSubmit={fetchPlan} loading={loading} initialDestination={initialDestination || selectedDest} initialSpots={initialSpots} />
          </motion.div>
        )}

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal && (
            <ConfirmTripModal
              planData={planData}
              formData={lastFormData}
              onConfirm={handleSaveTrip}
              onDismiss={() => setConfirmModal(false)}
            />
          )}
        </AnimatePresence>

        {planData && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-sm border border-gray-50 dark:border-white/5">
              <div className="mb-6 md:mb-0">
                <p className="text-accent font-black uppercase tracking-widest text-sm mb-2">Plan Ready ✈️</p>
                <h2 className="text-4xl font-black text-primary dark:text-white">Your {lastFormData?.destination} Itinerary</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {tripSaved ? (
                  <div className="px-6 py-3 bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 font-bold rounded-2xl flex items-center gap-2">
                    <CheckCircle2 size={18} /> Saved to Profile!
                  </div>
                ) : (
                  <button onClick={() => setConfirmModal(true)}
                    className="px-6 py-3 bg-secondary/10 text-secondary border border-secondary/20 font-bold rounded-2xl flex items-center gap-2 hover:bg-secondary/20 transition-all">
                    <Heart size={18} /> Book This Trip?
                  </button>
                )}
                <button
                  onClick={() => setPlanData(null)}
                  className="px-6 py-4 bg-gray-100 dark:bg-white/10 text-primary dark:text-white hover:bg-primary hover:text-white font-black rounded-2xl transition-all shadow-md active:scale-95">
                  ← Edit
                </button>
              </div>
            </div>

            <TripOverview data={planData} />
            <MapSection hotels={planData.hotels} attractions={planData.attractions} />
            <HotelRecommendations hotels={planData.hotels} />
            <CulinaryHighlights culinary={planData.local_culinary} />
            <Itinerary itinerary={planData.itinerary} />
            <EstimatedBudget costs={planData.costs} totalBudget={budgetConstraint} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
