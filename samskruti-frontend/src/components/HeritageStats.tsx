// components/HeritageStats.tsx
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface HeritageStatsProps {
  totalSites: number;
  visitedCount: number;
  bookedCount: number;
  // New props for ticket stats
  activeTickets?: number;
  usedTickets?: number;
  expiredTickets?: number;
  byEra?: { era: string; count: number }[];
  byRegion?: { region: string; count: number }[];
  userAchievements?: {
    name: string;
    achieved: boolean;
    icon: string;
    description?: string;
  }[];
}

export default function HeritageStats({ 
  totalSites, 
  visitedCount, 
  bookedCount,
  // Default values for ticket stats
  activeTickets = 0,
  usedTickets = 0,
  expiredTickets = 0,
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
  ],
  userAchievements = [
    { name: 'Heritage Explorer', achieved: visitedCount >= 5, icon: '🗺️', description: 'Visit 5 heritage sites' },
    { name: 'History Buff', achieved: visitedCount >= 10, icon: '📜', description: 'Visit 10 heritage sites' },
    { name: 'Temple Runner', achieved: visitedCount >= 15, icon: '🏛️', description: 'Visit 15 heritage sites' },
    { name: 'UNESCO Hunter', achieved: visitedCount >= 20, icon: '🌟', description: 'Visit 20 heritage sites' },
    { name: 'Adventure Seeker', achieved: visitedCount >= 25, icon: '🧗', description: 'Visit 25 heritage sites' },
    { name: 'Heritage Master', achieved: visitedCount >= 30, icon: '👑', description: 'Visit 30 heritage sites' },
  ]
}: HeritageStatsProps) {
  const { isDarkMode } = useTheme();

  const completionPercentage = Math.min(Math.round((visitedCount / totalSites) * 100), 100);
  const bookingPercentage = Math.min(Math.round((bookedCount / totalSites) * 100), 100);
  
  // Calculate ticket percentages
  const totalTickets = activeTickets + usedTickets + expiredTickets;
  const activePercentage = totalTickets > 0 ? Math.round((activeTickets / totalTickets) * 100) : 0;
  const usedPercentage = totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0;
  const expiredPercentage = totalTickets > 0 ? Math.round((expiredTickets / totalTickets) * 100) : 0;

  // Calculate next achievement
  const nextAchievement = userAchievements.find(a => !a.achieved);
  const progressToNext = nextAchievement 
    ? Math.min(Math.round((visitedCount / parseInt(nextAchievement.name.includes('5') ? '5' : 
        nextAchievement.name.includes('10') ? '10' : 
        nextAchievement.name.includes('15') ? '15' : 
        nextAchievement.name.includes('20') ? '20' : 
        nextAchievement.name.includes('25') ? '25' : '30')) * 100), 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Main Stats - User Specific */}
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
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Visits</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <p className="text-3xl font-bold text-orange-500">{bookedCount}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Bookings</p>
        </motion.div>
      </div>

      {/* Ticket Stats Section - NEW */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <span>🎫</span> Your Ticket Statistics
        </h4>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{activeTickets}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{usedTickets}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">{expiredTickets}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expired</p>
          </div>
        </div>

        {/* Ticket Distribution Bar */}
        {totalTickets > 0 && (
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${activePercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-green-500"
              style={{ width: `${activePercentage}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-blue-500"
              style={{ width: `${usedPercentage}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expiredPercentage}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-gray-500"
              style={{ width: `${expiredPercentage}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Active ({activePercentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Used ({usedPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Expired ({expiredPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Progress Bars - User Progress */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <div className="space-y-4">
          {/* Visited Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <span>✅</span> Your Heritage Journey
              </h4>
              <span className="text-sm text-emerald-500 font-bold">{visitedCount}/{totalSites} sites</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You've explored {completionPercentage}% of all heritage sites
            </p>
          </div>

          {/* Booked Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <span>🎫</span> Upcoming Visits
              </h4>
              <span className="text-sm text-orange-500 font-bold">{bookedCount} booked</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bookingPercentage}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution by Era - Static Site Data */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <span>🏛️</span> All Sites by Historical Era
        </h4>
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

      {/* Distribution by Region - Static Site Data */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <span>📍</span> All Sites by Region
        </h4>
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

      {/* Your Achievement Badges - User Specific */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <span>🏆</span> Your Achievements
        </h4>
        
        {/* Next Achievement Progress */}
        {nextAchievement && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{nextAchievement.icon}</span>
              <div>
                <p className="text-sm font-medium">{nextAchievement.name}</p>
                <p className="text-xs opacity-70">{nextAchievement.description}</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-emerald-500">
              {visitedCount} / {nextAchievement.name.includes('5') ? '5' : 
                nextAchievement.name.includes('10') ? '10' : 
                nextAchievement.name.includes('15') ? '15' : 
                nextAchievement.name.includes('20') ? '20' : 
                nextAchievement.name.includes('25') ? '25' : '30'} sites visited
            </p>
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid grid-cols-3 gap-2">
          {userAchievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`p-2 rounded-lg text-center transition-all ${
                achievement.achieved
                  ? 'bg-emerald-500/20 border border-emerald-500/30 scale-105'
                  : isDarkMode
                    ? 'bg-gray-700/50 opacity-50'
                    : 'bg-gray-100 opacity-50'
              }`}
              title={achievement.description}
            >
              <span className="text-xl mb-1 block">{achievement.icon}</span>
              <p className="text-[10px] font-medium leading-tight">{achievement.name}</p>
              {achievement.achieved && (
                <span className="text-[8px] text-emerald-500 mt-1 block">✓ Unlocked</span>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Achievements Unlocked:</span>
            <span className="text-emerald-500 font-bold">
              {userAchievements.filter(a => a.achieved).length}/{userAchievements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats - Updated to include ticket stats */}
      <div className={`p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg`}>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <span>📊</span> Quick Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">{Math.round(visitedCount / totalSites * 100)}%</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{Math.round(bookedCount / totalSites * 100)}%</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{totalSites - visitedCount}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Left to Explore</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">{usedTickets}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tickets Used</p>
          </div>
          <div className="text-center col-span-2">
            <p className="text-2xl font-bold text-red-500">{expiredTickets}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expired Tickets</p>
          </div>
        </div>
      </div>
    </div>
  );
}