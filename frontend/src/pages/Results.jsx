import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, ArrowRight, RefreshCcw, Sparkles, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [whyItData, setWhyItData] = useState(null);
    const [whyItLoading, setWhyItLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const survey = location.state?.survey;

    useEffect(() => {
        if (!survey) {
            navigate('/quiz');
            return;
        }

        const fetchResults = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quiz/recommendations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ survey: location.state.survey, history: location.state.history })
                });
                const data = await res.json();
                setResults(data.recommendations);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [survey, navigate, location.state]);

    const handleWhyIt = async (dest) => {
        setWhyItLoading(true);
        setModalOpen(true);
        setWhyItData({ city: dest.City || dest.name.split(',')[0], reasons: [] });
        try {
            const res = await fetch(`${API_BASE_URL}/api/quiz/why-it`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    city: dest.City || dest.name.split(',')[0], 
                    spots: dest.spots.map(s => s.name) 
                })
            });
            const data = await res.json();
            setWhyItData({ city: dest.City || dest.name.split(',')[0], reasons: data.reasons });
        } catch (err) {
            console.error(err);
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
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-24 pb-24 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black text-primary dark:text-white mb-4">Top AI Recommendations</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xl">Based on your unique preferences, we think you'll love these.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {results.map((dest, idx) => (
                        <motion.div
                            key={dest.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-white/5 flex flex-col"
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 font-bold text-primary text-sm shadow-sm">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> {dest.rating}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
                                    <MapPin size={20} className="text-secondary" /> {dest.name}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed text-sm">{dest.description}</p>
                                
                                <div className="mb-6 flex-1">
                                    <h4 className="font-bold text-sm text-primary dark:text-white mb-3 uppercase tracking-wide">Top Spots Included:</h4>
                                    <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-2">
                                        {dest.spots && dest.spots.map((spot, i) => (
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
                                        <span key={tag} className="px-3 py-1 bg-secondary/5 text-secondary border border-secondary/10 rounded-lg text-xs font-bold uppercase tracking-wider">
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
                                        onClick={() => navigate('/planner', { state: { destination: dest.City || dest.name.split(',')[0], spots: dest.spots ? dest.spots.map(s => s.name) : [] } })}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Plan Trip to {dest.City || dest.name.split(',')[0]} <ArrowRight size={20} />
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
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">Live scraped insights on the top spots.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto">
                                {whyItLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Sparkles className="animate-spin text-secondary mb-4" size={40} />
                                        <p className="font-bold text-gray-500 animate-pulse">Fetching live data for {whyItData?.city}...</p>
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
