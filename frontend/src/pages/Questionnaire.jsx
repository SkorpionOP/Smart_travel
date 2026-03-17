import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const questions = [
    { id: 'Adventure', title: 'How much do you value Adventure on a trip?', options: ['Not at all', 'A Little', 'Moderate', 'Very Much', 'Mandalorian'] },
    { id: 'Relaxation', title: 'How important is Pure Relaxation?', options: ['Not at all', 'A Little', 'Moderate', 'Very Much', 'Mandalorian'] },
    { id: 'Culture', title: 'Do you seek Cultural and Historical depth?', options: ['Not at all', 'A Little', 'Moderate', 'Very Much', 'Mandalorian'] },
    { id: 'Nature', title: 'How drawn are you to Nature and Wildlife?', options: ['Not at all', 'A Little', 'Moderate', 'Very Much', 'Mandalorian'] },
    { id: 'Social', title: 'Do you prioritize Socializing and Nightlife?', options: ['Not at all', 'A Little', 'Moderate', 'Very Much', 'Mandalorian'] }
];

const optionToScore = {
    'Not at all': 0.0,
    'A Little': 0.25,
    'Moderate': 0.5,
    'Very Much': 0.75,
    'Mandalorian': 1.0
};

export default function Questionnaire() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const handleSelect = (optLabel) => {
        const score = optionToScore[optLabel];
        const newAnswers = { ...answers, [questions[currentStep].id]: score };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            // Convert to array of floats exactly in order: ['Adventure', 'Relaxation', 'Culture', 'Nature', 'Social']
            const finalSurveyArray = questions.map(q => newAnswers[q.id] || 0.0);
            
            // Minimal history mock format as fallback if no real BE endpoint supplies it yet
            // user past experience history can be grabbed dynamically later
            const history = []; 

            setTimeout(() => navigate('/results', { state: { survey: finalSurveyArray, history: history } }), 300);
        }
    };

    const currentQ = questions[currentStep];

    return (
        <div className="min-h-screen bg-background pt-24 pb-24 px-6 flex flex-col items-center">
            <div className="max-w-4xl w-full">
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
                            <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">ML Assessment {currentStep + 1} of {questions.length}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-primary mb-12 text-center leading-tight">{currentQ.title}</h2>
                            
                            <div className="flex flex-col gap-4 w-full px-8">
                                {currentQ.options.map((opt) => {
                                    const scoreMatch = answers[currentQ.id] === optionToScore[opt];
                                    return (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelect(opt)}
                                            className={`py-5 px-8 rounded-2xl text-xl font-bold border-2 transition-all flex justify-between items-center ${
                                                scoreMatch
                                                    ? 'border-accent bg-accent text-white shadow-xl shadow-accent/20'
                                                    : 'border-gray-100 text-primary bg-white hover:border-secondary hover:shadow-lg'
                                            }`}
                                        >
                                            {opt}
                                            <ChevronRight size={24} className={scoreMatch ? 'opacity-100' : 'opacity-0'} />
                                        </motion.button>
                                    );
                                })}
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
