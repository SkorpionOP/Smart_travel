import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Mail, Lock, Heart, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [mode, setMode] = useState('login'); // login, register, prefs, profile
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [prefs, setPrefs] = useState({ budget_range: 'Medium', preferred_climate: 'Tropical', travel_type: 'Relaxation', preferred_region: 'International' });
  const [userId, setUserId] = useState(localStorage.getItem('user_id'));
  const [userName, setUserName] = useState(localStorage.getItem('user_name'));
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (userId && mode !== 'prefs') {
      setMode('profile');
    }
  }, [userId]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Auth failed');
      
      localStorage.setItem('user_id', data.user_id);
      if (data.name) localStorage.setItem('user_name', data.name);
      else localStorage.setItem('user_name', form.name);
      
      setUserId(data.user_id);
      setUserName(data.name || form.name);
      setMode(mode === 'register' ? 'prefs' : 'profile');
      if(mode === 'login') navigate('/planner');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrefs = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms/api/user/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId), ...prefs })
      });
      if (res.ok) {
        alert("Preferences Saved! Head to the Planner for tailored recommendations.");
        setMode('profile');
        navigate('/planner');
      }
    } catch (err) {
      alert("Error saving preferences");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    setUserId(null);
    setUserName(null);
    setMode('login');
  }

  if (mode === 'profile') {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 px-6">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-center">
          <div className="w-24 h-24 bg-accent/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <User size={40} className="text-accent" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-2">Welcome Back, {userName}</h2>
          <p className="text-gray-500 mb-10">Your traveler profile is active and feeding into the Hybrid ML Core.</p>
          
          <div className="flex flex-col gap-4">
            <button onClick={() => setMode('prefs')} className="w-full p-4 bg-secondary/10 text-secondary font-bold rounded-2xl border border-secondary/20 flex items-center justify-center gap-2">
              <Heart size={20} /> Update ML Preferences
            </button>
            <button onClick={logout} className="w-full p-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200">
              Disconnect Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-md mx-auto relative z-10">
        
        {mode === 'prefs' ? (
          <form onSubmit={handlePrefs} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-primary mb-2 flex justify-center items-center gap-2"><ShieldCheck className="text-secondary" /> AI Blueprint</h2>
              <p className="text-gray-500">Tune your travel frequencies for the recommendation engine.</p>
            </div>
            
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 block">Budget Range</span>
              <select className="w-full p-4 border rounded-2xl bg-white" value={prefs.budget_range} onChange={e => setPrefs({...prefs, budget_range: e.target.value})}>
                <option>Low</option><option>Medium</option><option>Luxury</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 block">Climate Vibe</span>
              <select className="w-full p-4 border rounded-2xl bg-white" value={prefs.preferred_climate} onChange={e => setPrefs({...prefs, preferred_climate: e.target.value})}>
                <option>Cold</option><option>Tropical</option><option>Moderate</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 block">Travel Type</span>
              <select className="w-full p-4 border rounded-2xl bg-white" value={prefs.travel_type} onChange={e => setPrefs({...prefs, travel_type: e.target.value})}>
                <option>Adventure</option><option>Cultural</option><option>Relaxation</option><option>Nature</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 block">Region</span>
              <select className="w-full p-4 border rounded-2xl bg-white" value={prefs.preferred_region} onChange={e => setPrefs({...prefs, preferred_region: e.target.value})}>
                <option>Domestic</option><option>International</option>
              </select>
            </label>
            
            <button disabled={loading} className="w-full p-4 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90">{loading ? 'Saving...' : 'Finalize Profile'}</button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-primary mb-2 flex justify-center items-center gap-2">
                <LogIn className="text-accent" /> {mode === 'login' ? 'Global Access' : 'New Protocols'}
              </h2>
              <p className="text-gray-500">{mode === 'login' ? 'Sign in to access hybrid recommendations.' : 'Initialize your traveler matrix.'}</p>
            </div>

            {mode === 'register' && (
              <label className="block">
                <span className="font-bold text-gray-700 mb-2 flex gap-2"><User size={18}/> Full Name</span>
                <input required className="w-full p-4 border rounded-2xl" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </label>
            )}
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 flex gap-2"><Mail size={18}/> Email</span>
              <input required type="email" className="w-full p-4 border rounded-2xl" placeholder="travel@earth.com" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            </label>
            <label className="block">
              <span className="font-bold text-gray-700 mb-2 flex gap-2"><Lock size={18}/> Password</span>
              <input required type="password" className="w-full p-4 border rounded-2xl" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            </label>

            <button disabled={loading} className="w-full p-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-opacity-90 transition-all">{loading ? 'Authenticating...' : (mode === 'login' ? 'Login' : 'Register Node')}</button>
            <p className="text-center text-gray-500 font-medium">
              {mode === 'login' ? "New here? " : "Already established? "}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-accent font-bold underline">
                {mode === 'login' ? 'Create an account' : 'Login'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
