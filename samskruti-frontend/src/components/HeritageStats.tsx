// components/HeritageStats.tsx
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface HeritageStatsProps {
  totalSites: number;
  visitedCount: number;
  bookedCount: number;
  byEra?: { era: string; count: number }[];
  byRegion?: { region: string; count: number }[];
}

export default function HeritageStats({ 
  totalSites, 
  visitedCount, 
  bookedCount,
  byEra = [
    { era: 'Ancient (Before 1000 CE)', count: 12 },
    { era: 'Medieval (1000-1500 CE)', count: 10 },
    { era: 'Vijayanagara (1336-1646)', count: 8 },
    { era: 'Modern (After 1700)', count: 5 },
  ],
  byRegion = [
    { region: 'Mysuru', count: 8 },
    { region: 'Hampi', count: 6 },
    { region: 'Badami', count: 5 },
    { region: 'Belur', count: 4 },
    { region: 'Other', count: 12 },
  ]
}: HeritageStatsProps) {
  const { isDarkMode } = useTheme();

  const completionPercentage = Math.round((visitedCount / totalSites) * 100);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <p className="text-3xl font-bold text-emerald-500">{totalSites}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Sites</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <p className="text-3xl font-bold text-green-500">{visitedCount}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Visited</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <p className="text-3xl font-bold text-orange-500">{bookedCount}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booked</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Heritage Journey Progress</h4>
          <span className="text-sm text-emerald-500 font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          />
        </div>
        <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {visitedCount} of {totalSites} heritage sites explored
        </p>
      </div>

      {/* Distribution by Era */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3">🏛️ By Historical Era</h4>
        <div className="space-y-2">
          {byEra.map((item) => (
            <div key={item.era}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{item.era}</span>
                <span className="text-emerald-500 font-medium">{item.count}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(item.count / totalSites) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution by Region */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3">📍 By Region</h4>
        <div className="space-y-2">
          {byRegion.map((item) => (
            <div key={item.region} className="flex items-center justify-between text-xs">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{item.region}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${(item.count / totalSites) * 100}%` }}
                  />
                </div>
                <span className="text-emerald-500 font-medium w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3">🏆 Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Heritage Explorer', achieved: visitedCount >= 5, icon: '🗺️' },
            { name: 'History Buff', achieved: visitedCount >= 10, icon: '📜' },
            { name: 'Temple Runner', achieved: visitedCount >= 15, icon: '🏛️' },
            { name: 'UNESCO Hunter', achieved: visitedCount >= 20, icon: '🌟' },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={`p-2 rounded-lg text-center ${
                achievement.achieved
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : isDarkMode
                    ? 'bg-gray-700/50 opacity-50'
                    : 'bg-gray-100 opacity-50'
              }`}
            >
              <span className="text-xl mb-1 block">{achievement.icon}</span>
              <p className="text-xs font-medium">{achievement.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}