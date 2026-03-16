import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Map as MapIcon, ArrowRight } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-gray-800">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-white shadow-2xl mb-8"
                >
                    <Compass size={40} />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-8xl font-black text-primary mb-8 tracking-tighter"
                >
                    Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Smarter</span>,<br />Not Harder.
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed"
                >
                    Experience the future of travel planning. Our AI-powered engine helps you discover perfect destinations and craft detailed itineraries in seconds.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {/* Module 1: Recommendation Engine */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-start text-left group cursor-pointer"
                        onClick={() => navigate('/quiz')}
                    >
                        <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-3">Find My Destination</h3>
                        <p className="text-gray-500 mb-8">Take a personalized quiz and let our AI suggest the best places on Earth for your vibe.</p>
                        <div className="mt-auto flex items-center gap-2 text-secondary font-bold">
                            Start Quiz <ArrowRight size={20} />
                        </div>
                    </motion.div>

                    {/* Module 2: Planner */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-primary p-8 rounded-3xl shadow-xl border border-primary/10 flex flex-col items-start text-left group cursor-pointer"
                        onClick={() => navigate('/planner')}
                    >
                        <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                            <MapIcon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Plan a Trip</h3>
                        <p className="text-blue-100 mb-8">Know where you're going? Enter your destination and get a full AI-generated itinerary instantly.</p>
                        <div className="mt-auto flex items-center gap-2 text-accent font-bold">
                            Go to Planner <ArrowRight size={20} />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Subtle background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
