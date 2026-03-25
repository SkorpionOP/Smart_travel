import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Map as MapIcon, ArrowRight, Globe, Star, Zap, ShieldCheck } from 'lucide-react';

const features = [
  { icon: <Zap size={22} />, title: 'Instant Itineraries', desc: 'Full day-by-day plans in under 10 seconds via AI + live scraping.' },
  { icon: <Star size={22} />, title: 'ML Recommendations', desc: 'Get city matches tuned to your vibe — beach, culture, adventure.' },
  { icon: <Globe size={22} />, title: 'Live Data', desc: 'Real hotel prices, actual attractions and flight costs — not guesswork.' },
  { icon: <ShieldCheck size={22} />, title: 'Trip History', desc: 'Rate past trips and watch the ML engine get smarter every time.' },
];

const destinations = ['Goa', 'Manali', 'Jaipur', 'Kerala', 'Mumbai', 'Rishikesh'];

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('user_id');
  const userName = localStorage.getItem('user_name');

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] h-[60vw] bg-gradient-to-b from-secondary/20 via-accent/10 to-transparent rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        {/* Floating destination pills */}
        <div className="absolute top-32 left-4 md:left-24 flex flex-col gap-3 opacity-60">
          {destinations.slice(0, 3).map((d, i) => (
            <motion.div key={d} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + i * 0.15 }}
              className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md text-sm font-bold text-primary dark:text-white border border-gray-100 dark:border-white/10 flex items-center gap-2">
              <MapIcon size={14} className="text-secondary" /> {d}
            </motion.div>
          ))}
        </div>
        <div className="absolute top-32 right-4 md:right-24 flex flex-col gap-3 opacity-60">
          {destinations.slice(3).map((d, i) => (
            <motion.div key={d} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + i * 0.15 }}
              className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md text-sm font-bold text-primary dark:text-white border border-gray-100 dark:border-white/10 flex items-center gap-2">
              <MapIcon size={14} className="text-accent" /> {d}
            </motion.div>
          ))}
        </div>

        {/* Logo badge */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}
          className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-accent/30 mb-8">
          <Compass size={40} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="inline-block bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          AI-Powered Travel Planning for India
        </motion.div>

        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="text-5xl md:text-8xl font-black text-primary dark:text-white mb-6 tracking-tighter leading-tight max-w-5xl">
          Your Next Trip,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Planned in Seconds.</span>
        </motion.h1>

        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Wanderly combines ML recommendations, live web scraping, and AI to craft
          the perfect India itinerary for your personality and budget.
        </motion.p>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4">
          {isLoggedIn ? (
            // Logged-in CTAs
            <>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/quiz')}
                className="px-8 py-4 bg-gradient-to-r from-secondary to-accent text-white font-black rounded-2xl shadow-2xl shadow-accent/30 flex items-center gap-3 text-lg">
                <Sparkles size={22} /> Find My Destination
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/planner')}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-primary dark:text-white font-black rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3 text-lg">
                <MapIcon size={22} /> Plan a Trip <ArrowRight size={18} />
              </motion.button>
            </>
          ) : (
            // Guest CTAs
            <>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/profile')}
                className="px-8 py-4 bg-gradient-to-r from-secondary to-accent text-white font-black rounded-2xl shadow-2xl shadow-accent/30 flex items-center gap-3 text-lg">
                <Sparkles size={22} /> Get Started — It's Free
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/profile')}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-primary dark:text-white font-black rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3 text-lg">
                Sign In <ArrowRight size={18} />
              </motion.button>
            </>
          )}
        </motion.div>

        {/* stat row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-12 mt-20 text-center">
          {[['10s', 'Itinerary Speed'], ['50+', 'Indian Cities'], ['Live', 'Hotel Prices'], ['Free', 'No API key needed']].map(([val, label]) => (
            <div key={label}>
              <p className="text-4xl font-black text-primary dark:text-white">{val}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── CARDS / MODES ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-white mb-4 tracking-tight">
              Two Ways to Explore
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Not sure where to go? Take the AI quiz. Know your destination? Go straight to the planner.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quiz card */}
            <motion.div whileHover={{ y: -8 }} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              onClick={() => navigate('/quiz')}
              className="relative group cursor-pointer bg-gradient-to-br from-secondary to-blue-600 p-10 rounded-[32px] shadow-2xl shadow-secondary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-3">Find My Destination</h3>
                <p className="text-blue-100 text-lg mb-8">Answer 7 personality questions and get 5 perfectly matched Indian cities powered by our ML engine.</p>
                <div className="flex items-center gap-2 text-white font-black text-lg">
                  Start the Quiz <ArrowRight size={22} />
                </div>
              </div>
            </motion.div>

            {/* Planner card */}
            <motion.div whileHover={{ y: -8 }} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              onClick={() => navigate('/planner')}
              className="relative group cursor-pointer bg-white dark:bg-gray-800 p-10 rounded-[32px] shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <MapIcon size={28} className="text-accent" />
                </div>
                <h3 className="text-3xl font-black text-primary dark:text-white mb-3">Plan a Trip</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">Know your destination? Get a full AI-crafted itinerary, live hotel prices, map, and budget breakdown instantly.</p>
                <div className="flex items-center gap-2 text-accent font-black text-lg">
                  Open Planner <ArrowRight size={22} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-white mb-4 tracking-tight">
              Everything Built In
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 bg-[#F5F7FA] dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 group hover:border-secondary dark:hover:border-secondary transition-all">
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h4 className="text-lg font-black text-primary dark:text-white mb-2">{f.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-[40px] shadow-2xl shadow-secondary/30">
            <div className="bg-white dark:bg-gray-900 rounded-[36px] py-16 px-10">
              <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-white mb-4 tracking-tight">
                Ready to Wander?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-10">
                Create a free profile, take the quiz, and let Wanderly plan your next unforgettable journey.
              </p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/quiz')}
                className="px-10 py-5 bg-gradient-to-r from-secondary to-accent text-white font-black rounded-2xl shadow-xl shadow-accent/30 text-xl">
                Start for Free →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
