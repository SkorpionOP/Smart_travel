import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Compass, Map as MapIcon, User, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

// Pages
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import Planner from './pages/Planner';
import Profile from './pages/Profile';

// ── Bulletproof dark mode: no context, just DOM + localStorage ──
function useDark() {
  const [dark, setDarkState] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
    setDarkState(next);
  }, []);
  return [dark, toggle];
}

// Apply dark mode before React renders (no flash)
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}

// ── Auth guard: redirects to /profile if not logged in ──
function RequireAuth({ children }) {
  const userId = localStorage.getItem('user_id');
  const location = useLocation();
  if (!userId) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }
  return children;
}

function Navbar({ dark, toggle }) {
  const location = useLocation();
  const userName = localStorage.getItem('user_name');

  const links = [
    { to: '/quiz', label: 'Discover', active: location.pathname === '/quiz' || location.pathname === '/results' },
    { to: '/planner', label: 'Planner', active: location.pathname === '/planner' },
    { to: '/profile', label: userName ? `Hi, ${userName.split(' ')[0]} 👋` : 'Sign In', active: location.pathname === '/profile' },
  ];

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav className="p-5 fixed top-0 w-full z-50 hidden md:block pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/20 dark:border-white/5 pointer-events-auto">
          <Link to="/" className="text-xl font-black text-primary dark:text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/30">
              <Compass size={20} />
            </div>
            Wanderly
          </Link>

          <div className="flex items-center gap-8 font-bold text-sm">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`relative hover:text-secondary transition-colors ${l.active ? 'text-secondary' : 'text-primary/60 dark:text-white/60 dark:hover:text-secondary'}`}>
                {l.active && (
                  <motion.span layoutId="nav-pill"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                )}
                {l.label}
              </Link>
            ))}
            <button
              id="dark-toggle"
              onClick={toggle}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <nav className="px-4 py-3 fixed top-0 w-full z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-black text-primary dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center text-white">
              <Compass size={18} />
            </div>
            Wanderly
          </Link>
          <button
            onClick={toggle}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-yellow-300 transition-all">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {[
            { to: '/', Icon: Home, label: 'Home', isActive: location.pathname === '/' },
            { to: '/quiz', Icon: Compass, label: 'Quiz', isActive: location.pathname === '/quiz' || location.pathname === '/results' },
            { to: '/planner', Icon: MapIcon, label: 'Plan', isActive: location.pathname === '/planner' },
            { to: '/profile', Icon: User, label: 'Me', isActive: location.pathname === '/profile' },
          ].map(({ to, Icon, label, isActive }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-accent' : 'text-gray-400 dark:text-white/40'}`}>
              <Icon size={20} className={isActive ? 'fill-accent text-accent' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default function App() {
  const [dark, toggle] = useDark();

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 transition-colors duration-300">
        <Navbar dark={dark} toggle={toggle} />
        <Routes>
          {/* Always public */}
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />

          {/* Protected — must be signed in */}
          <Route path="/quiz" element={<RequireAuth><Questionnaire /></RequireAuth>} />
          <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
          <Route path="/planner" element={<RequireAuth><Planner /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}
