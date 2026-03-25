import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sun, Star, Map, Building } from 'lucide-react';

const traitMap = ['Adventure', 'Relaxation', 'Culture', 'Nature', 'Social'];

const initialQuestions = [
    {
        id: 'trait',
        title: 'Which of these best describes your ideal vibe?',
        options: [
            { label: 'Uncharted Territory & Adrenaline', scores: { Adventure: 0.8, Nature: 0.4 } },
            { label: 'Sunset Cocktails & Spa Days', scores: { Relaxation: 0.8, Social: 0.3 } },
            { label: 'Museums, Ruins & Deep History', scores: { Culture: 0.8, Relaxation: 0.2 } },
            { label: 'Forest Trails & Starry Nights', scores: { Nature: 0.8, Adventure: 0.3 } },
            { label: 'Dancing into the Night with Friends', scores: { Social: 0.8, Adventure: 0.2 } }
        ]
    },
    {
        id: 'interest',
        title: 'What scenery are you dreaming of?',
        options: [
            { label: 'White Sands & Turquoise Waters', branch: 'beach', icon: <Sun />, scores: { Nature: 0.4, Relaxation: 0.4 } },
            { label: 'Ancient Carvings & Spiritual Echoes', branch: 'temple', icon: <Star />, scores: { Culture: 0.6, Relaxation: 0.2 } },
            { label: 'Snowy Peaks & Alpine Meadows', branch: 'mountain', icon: <Map />, scores: { Nature: 0.6, Adventure: 0.3 } },
            { label: 'Bustling Markets & Vibrant Streets', branch: 'city', icon: <Building />, scores: { Social: 0.6, Culture: 0.2 } }
        ]
    }
];

const branches = {
    beach: [
        {
            title: 'Solitude or Celebration?',
            options: [
                { label: 'Hidden Secluded Coves', scores: { Nature: 0.6, Relaxation: 0.4 } },
                { label: 'Vibrant Beach Clubs', scores: { Social: 0.7, Adventure: 0.2 } }
            ]
        },
        {
            title: 'Your Water Activity of Choice?',
            options: [
                { label: 'Scuba Diving & Surfing', scores: { Adventure: 0.8, Nature: 0.3 } },
                { label: 'Sunbathing & Reading', scores: { Relaxation: 0.8 } }
            ]
        },
        {
            title: 'Accommodation Style?',
            options: [
                { label: 'Luxury Beachfront Villa', scores: { Relaxation: 0.6, Social: 0.3 } },
                { label: 'Eco-Friendly Beach Hut', scores: { Nature: 0.7, Adventure: 0.2 } }
            ]
        },
        {
            title: 'Best Time on the Shore?',
            options: [
                { label: 'Early Morning Sunrise', scores: { Relaxation: 0.5, Nature: 0.5 } },
                { label: 'Sunset Party Vibes', scores: { Social: 0.8 } }
            ]
        },
        {
            title: 'Local Coastal Flavor?',
            options: [
                { label: 'Fresh Seafood Shack', scores: { Culture: 0.4, Social: 0.4 } },
                { label: 'Private Candlelight Dinner', scores: { Relaxation: 0.8, Social: 0.2 } }
            ]
        }
    ],
    temple: [
        {
            title: 'Architecture or Atmosphere?',
            options: [
                { label: 'Intricate Ancient Carvings', scores: { Culture: 0.8 } },
                { label: 'Vibrant Devotional Energy', scores: { Social: 0.5, Culture: 0.4 } }
            ]
        },
        {
            title: 'Location Preference?',
            options: [
                { label: 'Clifftop Temples with Views', scores: { Nature: 0.6, Adventure: 0.4 } },
                { label: 'Riverside Ghats & Rituals', scores: { Culture: 0.7, Relaxation: 0.3 } }
            ]
        },
        {
            title: 'Crowd Preference?',
            options: [
                { label: 'Grand Temple Festivals', scores: { Social: 0.7, Culture: 0.3 } },
                { label: 'Peaceful Meditative Silence', scores: { Relaxation: 0.8, Nature: 0.2 } }
            ]
        },
        {
            title: 'History or Spirituality?',
            options: [
                { label: 'Archeological Significance', scores: { Culture: 0.8 } },
                { label: 'Spiritual Peace & Chantings', scores: { Relaxation: 0.7, Culture: 0.3 } }
            ]
        },
        {
            title: 'Surrounding Exploration?',
            options: [
                { label: 'Nearby Ancient Caves', scores: { Adventure: 0.7, Culture: 0.3 } },
                { label: 'Temple Gardens & Parks', scores: { Relaxation: 0.7, Nature: 0.4 } }
            ]
        }
    ],
    mountain: [
        {
            title: 'Energy Level?',
            options: [
                { label: 'Challenging High-Altitude Treks', scores: { Adventure: 0.9, Nature: 0.4 } },
                { label: 'Cozy Mountain Cabin Relaxation', scores: { Relaxation: 0.8, Nature: 0.3 } }
            ]
        },
        {
            title: 'Landscape Preference?',
            options: [
                { label: 'Rugged Cliffs & Snow', scores: { Nature: 0.7, Adventure: 0.4 } },
                { label: 'Lush Valleys & Pine Forests', scores: { Nature: 0.8, Relaxation: 0.2 } }
            ]
        },
        {
            title: 'Local Interaction?',
            options: [
                { label: 'Staying with Local Hill Tribes', scores: { Culture: 0.7, Social: 0.4 } },
                { label: 'Remote Wilderness Camping', scores: { Nature: 0.8, Adventure: 0.5 } }
            ]
        },
        {
            title: 'Mountain Activity?',
            options: [
                { label: 'Paragliding & Ziplining', scores: { Adventure: 0.9 } },
                { label: 'Photography & Birdwatching', scores: { Nature: 0.8, Relaxation: 0.3 } }
            ]
        },
        {
            title: 'Climate Preference?',
            options: [
                { label: 'Crisp, Biting Cold', scores: { Nature: 0.6, Adventure: 0.4 } },
                { label: 'Mild, Cool Breeze', scores: { Relaxation: 0.7, Nature: 0.3 } }
            ]
        }
    ],
    city: [
        {
            title: 'Urban Vibe?',
            options: [
                { label: 'Historic Old Quarters', scores: { Culture: 0.8, Social: 0.3 } },
                { label: 'Modern Skylines & Neon Lights', scores: { Social: 0.7, Adventure: 0.2 } }
            ]
        },
        {
            title: 'Dining Style?',
            options: [
                { label: 'Gourmet Fine Dining', scores: { Relaxation: 0.6, Social: 0.4 } },
                { label: 'Street Food Crawls', scores: { Adventure: 0.5, Social: 0.6, Culture: 0.3 } }
            ]
        },
        {
            title: 'Activity Priority?',
            options: [
                { label: 'Shopping & Nightlife', scores: { Social: 0.8 } },
                { label: 'Galleries & Performing Arts', scores: { Culture: 0.8, Relaxation: 0.2 } }
            ]
        },
        {
            title: 'Transportation preference?',
            options: [
                { label: 'Walking the Streets', scores: { Adventure: 0.4, Culture: 0.4 } },
                { label: 'Sleek Metro & Taxis', scores: { Relaxation: 0.6, Social: 0.3 } }
            ]
        },
        {
            title: 'City Scale?',
            options: [
                { label: 'Mega-Metropolis Energy', scores: { Social: 0.8, Adventure: 0.3 } },
                { label: 'Charming Small Town', scores: { Relaxation: 0.7, Culture: 0.5 } }
            ]
        }
    ]
};

export default function Questionnaire() {
    const [questionStack, setQuestionStack] = useState(initialQuestions);
    const [currentStep, setCurrentStep] = useState(0);
    const [accumulatedScores, setAccumulatedScores] = useState({
        Adventure: 0, Relaxation: 0, Culture: 0, Nature: 0, Social: 0
    });
    const [selectedVibe, setSelectedVibe] = useState(null);
    const navigate = useNavigate();

    const handleSelect = (option) => {
        if (option.branch) setSelectedVibe(option.branch);
        
        // Update scores
        const newScores = { ...accumulatedScores };
        if (option.scores) {
            Object.entries(option.scores).forEach(([trait, value]) => {
                newScores[trait] += value;
            });
        }
        setAccumulatedScores(newScores);

        // Branching logic: if this option has a branch, add branch questions to the stack
        let newStack = [...questionStack];
        if (option.branch && branches[option.branch]) {
            newStack = [...initialQuestions, ...branches[option.branch]];
            setQuestionStack(newStack);
        }

        // Move to next question or Finish
        if (currentStep < newStack.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            // Finalize scores: Normalize to 0-1 range
            const finalSurveyArray = traitMap.map(trait => {
                const raw = newScores[trait];
                return Math.min(1.0, raw / 2.5); 
            });

            setTimeout(() => navigate('/results', { state: { survey: finalSurveyArray, history: [], vibe: selectedVibe } }), 300);
        }
    };

    const currentQ = questionStack[currentStep];

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pt-20 md:pt-28 pb-32 md:pb-24 px-4 md:px-6 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                {/* Progress Bar */}
                <div className="mb-10 md:mb-16 flex space-x-2 md:space-x-3 justify-center">
                    {questionStack.map((q, idx) => (
                        <div 
                            key={idx} 
                            className={`h-2 md:h-3 flex-1 rounded-full ${idx <= currentStep ? 'bg-secondary shadow-lg shadow-secondary/20' : 'bg-gray-200 dark:bg-gray-700'} transition-all duration-700`} 
                        />
                    ))}
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex flex-col items-center w-full"
                        >
                            <span className="text-secondary font-bold uppercase tracking-widest text-[10px] md:text-sm mb-4">
                                ML Assessment Step {currentStep + 1} of {questionStack.length}
                            </span>
                            <h2 className="text-2xl md:text-5xl font-black text-primary dark:text-white mb-8 md:mb-12 text-center leading-tight px-2">
                                {currentQ.title}
                            </h2>
                            
                            <div className="flex flex-col gap-3 md:gap-4 w-full px-2 md:px-8">
                                {currentQ.options.map((opt, i) => {
                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelect(opt)}
                                            className="group py-4 md:py-6 px-5 md:px-10 rounded-2xl md:rounded-3xl text-lg md:text-2xl font-bold border-2 border-white dark:border-white/5 text-primary dark:text-white bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg shadow-gray-200/50 dark:shadow-none hover:border-secondary hover:bg-white dark:hover:bg-gray-700 transition-all flex justify-between items-center text-left"
                                        >
                                            <span className="flex items-center gap-4 md:gap-6">
                                                {opt.icon && (
                                                    <div className="p-2 md:p-3 bg-secondary/10 rounded-xl text-secondary group-hover:bg-secondary group-hover:text-white transition-colors flex-shrink-0">
                                                        {React.cloneElement(opt.icon, { size: 24 })}
                                                    </div>
                                                )}
                                                <span className="leading-snug">{opt.label}</span>
                                            </span>
                                            <ChevronRight size={24} className="text-secondary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {currentStep > 0 && (
                                <button 
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="mt-10 md:mt-12 flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-white font-bold transition-colors"
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
