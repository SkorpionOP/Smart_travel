import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Compass, Map as MapIcon, User } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import Planner from './pages/Planner';
import Profile from './pages/Profile';

function Navbar() {
  const location = useLocation();

  return (
    <>
      {/* Top Navbar - Desktop & Tablet */}
      <nav className="p-6 fixed top-0 w-full z-50 transition-all hidden md:block pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-[24px] shadow-lg border border-white/20 pointer-events-auto">
          <Link to="/" className="text-2xl font-black text-primary flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Compass size={24} />
            </div>
            Smart Travel
          </Link>
          
          <div className="flex gap-4 md:gap-8 font-bold text-sm uppercase tracking-widest text-primary/60">
              <Link to="/quiz" className={`hover:text-secondary transition-colors ${location.pathname === '/quiz' || location.pathname === '/results' ? 'text-secondary' : ''}`}>AI Quiz</Link>
              <Link to="/planner" className={`hover:text-secondary transition-colors ${location.pathname === '/planner' ? 'text-secondary' : ''}`}>Planner</Link>
              <Link to="/profile" className={`hover:text-secondary transition-colors ${location.pathname === '/profile' ? 'text-secondary' : ''}`}>Profile</Link>
          </div>
        </div>
      </nav>

      {/* Top Header - Mobile */}
      <nav className="p-4 fixed top-0 w-full z-50 md:hidden bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-center">
          <Link to="/" className="text-xl font-black text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white shadow-md">
              <Compass size={20} />
            </div>
            Smart Travel
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-accent' : 'text-gray-400'}`}>
            <Home size={20} className={location.pathname === '/' ? 'fill-accent text-accent' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </Link>
          <Link to="/quiz" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${(location.pathname === '/quiz' || location.pathname === '/results') ? 'text-accent' : 'text-gray-400'}`}>
            <Compass size={20} className={(location.pathname === '/quiz' || location.pathname === '/results') ? 'fill-accent text-accent' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Quiz</span>
          </Link>
          <Link to="/planner" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/planner' ? 'text-accent' : 'text-gray-400'}`}>
            <MapIcon size={20} className={location.pathname === '/planner' ? 'fill-accent text-accent' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Planner</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-accent' : 'text-gray-400'}`}>
            <User size={20} className={location.pathname === '/profile' ? 'fill-accent text-accent' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Auth</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Questionnaire />} />
          <Route path="/results" element={<Results />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}
