// app/components/AIRecommendations.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { apiService, Destination, Recommendation } from "@/app/services/apiService";

interface AIRecommendationsProps {
  destinations: Destination[];
  userHistory: number[];
  userPreferences?: string[];
  currentDestinationId?: number;
}

export default function AIRecommendations({ 
  destinations, 
  userHistory, 
  userPreferences = [],
  currentDestinationId 
}: AIRecommendationsProps) {
  const { isDarkMode } = useTheme();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'seasonal' | 'similar'>('personalized');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      
      try {
        let data: Recommendation[] = [];
        
        if (activeTab === 'personalized') {
          data = await apiService.getPersonalizedRecommendations(
            userHistory,
            { favorite_categories: userPreferences },
            6
          );
        } else if (activeTab === 'seasonal') {
          data = await apiService.getSeasonalPicks(6);
        } else if (activeTab === 'similar' && currentDestinationId) {
          data = await apiService.getSimilarDestinations(currentDestinationId, 4);
        }
        
        if (data.length > 0) {
          setRecommendations(data);
        } else {
          // Fallback to popular destinations
          const fallback = destinations.slice(0, 6).map(d => ({
            id: d.id,
            score: d.rating * 10,
            reason: "Popular destination",
            matchTags: d.tags?.slice(0, 3) || [],
            destination: d
          }));
          setRecommendations(fallback);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to popular destinations
        const fallback = destinations.slice(0, 6).map(d => ({
          id: d.id,
          score: d.rating * 10,
          reason: "Popular destination",
          matchTags: d.tags?.slice(0, 3) || [],
          destination: d
        }));
        setRecommendations(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [activeTab, userHistory, userPreferences, currentDestinationId, destinations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(i => (
            <div key={i} className={`h-10 w-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className={`h-64 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'personalized', label: 'For You', icon: '✨' },
          { id: 'seasonal', label: 'Seasonal Picks', icon: '🌸' },
          ...(currentDestinationId ? [{ id: 'similar', label: 'Similar Places', icon: '🔍' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link href={`/dashboard/destination/${rec.id}`}>
              <div className={`group relative rounded-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white'
              } shadow-lg hover:shadow-xl transition-all`}>
                {/* Match Score Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.score > 80 ? 'bg-emerald-500' :
                    rec.score > 60 ? 'bg-yellow-500' : 'bg-gray-500'
                  } text-white`}>
                    {Math.round(rec.score)}% Match
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={rec.destination.image || '/images/placeholder.jpg'}
                    alt={rec.destination.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{rec.destination.name}</h3>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {rec.destination.location}
                  </p>
                  
                  {/* Reason */}
                  <p className={`text-xs mb-3 flex items-center gap-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span>💡</span> {rec.reason}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.matchTags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Enterprise & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {rec.destination.enterprise && (
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-xs">🏢</span>
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {rec.destination.enterprise.company_name}
                          </span>
                          {rec.destination.enterprise.verified && (
                            <span className="text-emerald-500 text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-emerald-500 font-semibold">
                      {rec.destination.price}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}