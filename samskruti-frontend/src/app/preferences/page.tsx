"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import api from "@/services/api";

const categories = [
    { id: "heritage", label: "Heritage Sites", icon: "🏛️", color: "from-amber-500 to-orange-500" },
    { id: "temple", label: "Temples", icon: "🛕", color: "from-amber-500 to-yellow-500" },
    { id: "palace", label: "Palaces", icon: "👑", color: "from-purple-500 to-pink-500" },
    { id: "fort", label: "Forts", icon: "🏰", color: "from-stone-500 to-gray-500" },
    { id: "monument", label: "Monuments", icon: "🗿", color: "from-gray-500 to-slate-500" },
    { id: "museum", label: "Museums", icon: "🏛️", color: "from-blue-500 to-indigo-500" },
    { id: "nature", label: "Nature & Hills", icon: "🏔️", color: "from-green-500 to-emerald-500" },
    { id: "wildlife", label: "Wildlife", icon: "🐘", color: "from-lime-500 to-green-500" },
    { id: "beach", label: "Beaches", icon: "🏖️", color: "from-cyan-500 to-blue-500" },
    { id: "hill_station", label: "Hill Stations", icon: "⛰️", color: "from-teal-500 to-green-500" },
];

export default function PreferencesPage() {
    const { isDarkMode } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth');
            return;
        }
        if (user.role !== 'user') {
            router.push('/dashboard');
            return;
        }
        const fetchPrefs = async () => {
            try {
                const res = await api.get('/user/preferences');
                if (res.data.success) {
                    setSelected(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchPrefs();
    }, [user, router]);

    const toggleCategory = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/user/preferences', { categories: selected });
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('Failed to save preferences. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.push('/dashboard');
    };

    if (initialLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900/30" />
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-light bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
                        Tailor Your Experience
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Select the types of places you'd like to explore. We'll show you personalized recommendations.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
                >
                    {categories.map((cat, idx) => (
                        <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggleCategory(cat.id)}
                            className={`relative p-6 rounded-2xl transition-all duration-300 ${
                                selected.includes(cat.id)
                                    ? `bg-gradient-to-br ${cat.color} text-white shadow-xl scale-105`
                                    : isDarkMode
                                        ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                                        : 'bg-white border border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="text-4xl mb-3">{cat.icon}</div>
                            <div className="font-medium text-sm">{cat.label}</div>
                            {selected.includes(cat.id) && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleSkip}
                        className="px-8 py-3 rounded-xl text-sm font-medium transition-all border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || selected.length === 0}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
}