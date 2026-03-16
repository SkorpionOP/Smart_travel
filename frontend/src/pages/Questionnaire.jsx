import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const questions = [
    { id: 'environment', title: 'What environment do you prefer?', options: ['City', 'Mountain', 'Beach', 'Tropical'] },
    { id: 'activity', title: 'What is your primary activity?', options: ['Relaxation', 'Adventure', 'Culture', 'Nature'] },
    { id: 'climate', title: 'What is your ideal climate?', options: ['Warm', 'Cold'] },
    { id: 'vibe', title: 'What vibe are you looking for?', options: ['Modern', 'History', 'Nightlife', 'Quiet', 'Nature'] },
    { id: 'food', title: 'Is culinary experience a priority?', options: ['Important', 'Standard'] }
];

export default function Questionnaire() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const handleSelect = (option) => {
        const newAnswers = { ...answers, [questions[currentStep].id]: option };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            setTimeout(() => navigate('/results', { state: { answers: newAnswers } }), 300);
        }
    };

    const currentQ = questions[currentStep];

    return (
        <div className="min-h-screen bg-background pt-24 pb-24 px-6 flex flex-col items-center">
            <div className="max-w-3xl w-full">
                {/* Progress Bar */}
                <div className="mb-16 flex space-x-3 justify-center">
                    {questions.map((q, idx) => (
                        <div 
                            key={idx} 
                            className={`h-3 flex-1 rounded-full ${idx <= currentStep ? 'bg-secondary shadow-lg shadow-secondary/20' : 'bg-gray-200'} transition-all duration-700`} 
                        />
                    ))}
                </div>

                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="absolute inset-0 flex flex-col items-center"
                        >
                            <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">Question {currentStep + 1} of {questions.length}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-primary mb-12 text-center leading-tight">{currentQ.title}</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                                {currentQ.options.map((opt) => (
                                    <motion.button
                                        key={opt}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(opt)}
                                        className={`py-6 px-8 rounded-2xl text-xl font-bold border-2 transition-all flex justify-between items-center ${
                                            answers[currentQ.id] === opt
                                                ? 'border-accent bg-accent text-white shadow-xl shadow-accent/20'
                                                : 'border-gray-100 text-primary bg-white hover:border-secondary hover:shadow-lg'
                                        }`}
                                    >
                                        {opt}
                                        <ChevronRight size={24} className={answers[currentQ.id] === opt ? 'opacity-100' : 'opacity-0'} />
                                    </motion.button>
                                ))}
                            </div>

                            {currentStep > 0 && (
                                <button 
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="mt-12 flex items-center gap-2 text-gray-400 hover:text-primary font-bold transition-colors"
                                >
                                    <ChevronLeft size={20} /> Back to Previous
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
