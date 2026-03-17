import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, RefreshCcw } from 'lucide-react';

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const survey = location.state?.survey;

    useEffect(() => {
        if (!survey) {
            navigate('/quiz');
            return;
        }

        const fetchResults = async () => {
            try {
                const res = await fetch(`https://lmcjgntt-8000.inc1.devtunnels.ms/api/quiz/recommendations`, {
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

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-16 h-16 border-4 border-secondary border-t-accent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-primary animate-pulse">Finding your perfect match...</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-24 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black text-primary mb-4">Top AI Recommendations</h2>
                    <p className="text-gray-500 text-xl">Based on your unique preferences, we think you'll love these.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {results.map((dest, idx) => (
                        <motion.div
                            key={dest.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col"
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 font-bold text-primary text-sm shadow-sm">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> {dest.rating}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-primary mb-3 flex items-center gap-2">
                                    <MapPin size={20} className="text-secondary" /> {dest.name}
                                </h3>
                                <p className="text-gray-500 mb-6 leading-relaxed flex-1">{dest.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {dest.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-secondary/5 text-secondary border border-secondary/10 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ gap: '12px' }}
                                    onClick={() => navigate('/planner', { state: { destination: dest.name } })}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Plan Trip to {dest.name.split(',')[0]} <ArrowRight size={20} />
                                </motion.button>
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
        </div>
    );
}
