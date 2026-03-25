import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Mail, Lock, Heart, LogIn, Star, MapPin, Calendar, Trash2, TrendingUp, ChevronRight, Award, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-125">
          <Star size={22} className={`transition-colors ${s <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

function TripCard({ trip, onRate, onDelete }) {
  const [rating, setRating] = useState(trip.rating || 0);
  const [saved, setSaved] = useState(false);

  const handleRate = (r) => {
    setRating(r);
    onRate(trip.id, r);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <MapPin size={16} className="text-secondary" />
            </div>
            <h3 className="text-xl font-black text-primary dark:text-white">{trip.destination}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider ml-10">
            {trip.style && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{trip.style}</span>}
            {trip.savedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {new Date(trip.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(trip.id)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all">
          <Trash2 size={16} />
        </button>
      </div>

      {trip.budget && (
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-bold">Budget</span>
          <span className="text-green-600 dark:text-green-400 font-black">₹{trip.budget?.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-1">Your Rating</p>
          <StarRating value={rating} onChange={handleRate} />
        </div>
        {saved && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-400/10 px-3 py-1 rounded-full">
            ✓ Saved!
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [prefs, setPrefs] = useState({ budget_range: 'Medium', preferred_climate: 'Tropical', travel_type: 'Relaxation', preferred_region: 'Domestic' });
  const [userId, setUserId] = useState(localStorage.getItem('user_id'));
  const [userName, setUserName] = useState(localStorage.getItem('user_name'));
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved_trips') || '[]'); } catch { return []; }
  });
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after successful auth (defaults to '/')
  const intendedPath = location.state?.from?.pathname || '/';
  const wasRedirected = !!location.state?.from;

  useEffect(() => {
    if (userId && mode !== 'prefs') setMode('profile');
  }, [userId]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Auth failed');
      localStorage.setItem('user_id', data.user_id);
      const name = data.name || form.name;
      localStorage.setItem('user_name', name);
      setUserId(data.user_id); setUserName(name);
      if (mode === 'register') {
        setMode('prefs');
      } else {
        setMode('profile');
        navigate(intendedPath);
      }
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handlePrefs = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId), ...prefs })
      });
      if (res.ok) { setMode('profile'); navigate(intendedPath); }
    } catch { alert('Error saving preferences'); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('user_id'); localStorage.removeItem('user_name');
    setUserId(null); setUserName(null); setMode('login');
  };

  const handleRate = (id, rating) => {
    const updated = trips.map(t => t.id === id ? { ...t, rating } : t);
    setTrips(updated);
    localStorage.setItem('saved_trips', JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    const updated = trips.filter(t => t.id !== id);
    setTrips(updated);
    localStorage.setItem('saved_trips', JSON.stringify(updated));
  };

  // ─── Profile View ───
  if (mode === 'profile') {
    const ratedTrips = trips.filter(t => t.rating > 0);
    const avgRating = ratedTrips.length ? (ratedTrips.reduce((s, t) => s + t.rating, 0) / ratedTrips.length).toFixed(1) : '—';

    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-28 pb-28 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-secondary p-1 rounded-[40px] shadow-2xl shadow-secondary/30 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-[36px] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-[28px] flex items-center justify-center shadow-xl shadow-accent/30 flex-shrink-0">
                <User size={40} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-1">Traveller Profile</p>
                <h2 className="text-3xl font-black text-primary dark:text-white mb-1">{userName}</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Your preferences power the ML recommendation engine.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  {[
                    { label: 'Trips Saved', val: trips.length, icon: <MapPin size={16} /> },
                    { label: 'Trips Rated', val: ratedTrips.length, icon: <Star size={16} /> },
                    { label: 'Avg Rating', val: avgRating, icon: <TrendingUp size={16} /> },
                  ].map(({ label, val, icon }) => (
                    <div key={label} className="text-center">
                      <p className="text-3xl font-black text-primary dark:text-white">{val}</p>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 justify-center">{icon}{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 self-center">
                <button onClick={() => setMode('prefs')}
                  className="px-6 py-3 bg-secondary/10 dark:bg-secondary/20 text-secondary font-bold rounded-2xl border border-secondary/20 flex items-center gap-2 hover:bg-secondary/20 transition-all">
                  <Heart size={18} /> Edit Prefs
                </button>
                <button onClick={logout}
                  className="px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Trip History */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-primary dark:text-white flex items-center gap-2">
                <Award size={24} className="text-accent" /> My Trip History
              </h3>
              {trips.length > 0 && (
                <button onClick={() => navigate('/planner')}
                  className="text-secondary font-bold text-sm flex items-center gap-1 hover:underline">
                  Plan Another <ChevronRight size={16} />
                </button>
              )}
            </div>

            {trips.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                <MapPin size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 dark:text-gray-500 font-bold text-lg">No saved trips yet</p>
                <p className="text-gray-300 dark:text-gray-600 text-sm mb-6">Plan a trip and confirm it to see it here.</p>
                <button onClick={() => navigate('/planner')}
                  className="px-6 py-3 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 shadow-lg shadow-accent/20">
                  Plan My First Trip
                </button>
              </motion.div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} onRate={handleRate} onDelete={handleDelete} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Prefs Form ───
  const inputCls = "w-full p-4 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-secondary focus:outline-none rounded-2xl bg-white dark:bg-gray-800 text-primary dark:text-white";

  if (mode === 'prefs') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-28 pb-28 px-6 flex items-center justify-center">
        <motion.form onSubmit={handlePrefs} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-white/5 w-full max-w-md space-y-6">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-secondary" />
            </div>
            <h2 className="text-3xl font-black text-primary dark:text-white mb-2">Travel Blueprint</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Tune your preferences for the ML engine.</p>
          </div>
          {[
            { key: 'budget_range', label: 'Budget Range', opts: ['Low', 'Medium', 'Luxury'] },
            { key: 'preferred_climate', label: 'Climate Vibe', opts: ['Cold', 'Tropical', 'Moderate', 'Desert'] },
            { key: 'travel_type', label: 'Travel Type', opts: ['Adventure', 'Cultural', 'Relaxation', 'Nature', 'Beach'] },
            { key: 'preferred_region', label: 'Region', opts: ['Domestic', 'International'] },
          ].map(({ key, label, opts }) => (
            <label key={key} className="block">
              <span className="font-bold text-gray-600 dark:text-gray-300 mb-2 block text-sm">{label}</span>
              <select className={inputCls} value={prefs[key]} onChange={e => setPrefs({ ...prefs, [key]: e.target.value })}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <button disabled={loading} className="w-full p-4 bg-gradient-to-r from-secondary to-accent text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all">
            {loading ? 'Saving...' : 'Save & Continue →'}
          </button>
        </motion.form>
      </div>
    );
  }

  // ─── Login / Register ───
  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-28 pb-28 px-6 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <form onSubmit={handleAuth} className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-white/5 space-y-6">
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/30">
              <LogIn size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-primary dark:text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {mode === 'login' ? 'Sign in to access your trips and recommendations.' : 'Join Wanderly and start planning smarter.'}
            </p>
          </div>

          {/* Redirected banner */}
          {wasRedirected && (
            <div className="flex items-start gap-3 bg-secondary/5 border border-secondary/20 p-4 rounded-2xl">
              <Sparkles size={18} className="text-secondary mt-0.5 flex-shrink-0" />
              <p className="text-secondary text-sm font-bold leading-relaxed">
                Sign in to unlock that page — it only takes a second!
              </p>
            </div>
          )}

          {mode === 'register' && (
            <label className="block">
              <span className="font-bold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2 text-sm"><User size={16} /> Full Name</span>
              <input required className={inputCls} placeholder="Rahul Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
          )}
          <label className="block">
            <span className="font-bold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2 text-sm"><Mail size={16} /> Email</span>
            <input required type="email" className={inputCls} placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-bold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2 text-sm"><Lock size={16} /> Password</span>
            <input required type="password" className={inputCls} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </label>

          <button disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all">
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-secondary font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
