"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardStats {
  pendingEnterprises: number;
  pendingSellers: number;
  totalUsers: number;
  totalBookings: number;
  recentActivity: Array<{
    type: string;
    name: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log('Fetching stats with token:', token ? 'Token exists' : 'No token');
    
    const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    
    if (data.success) {
      setStats(data.data);
    } else {
      console.error('API returned error:', data.message);
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Don't set sample data - let it show zeros
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const statsCards = [
    {
      title: "Pending Enterprises",
      value: stats?.pendingEnterprises || 0,
      icon: "🏢",
      gradient: "from-emerald-500 to-teal-500",
      link: "/admin/enterprises/pending",
      color: "emerald"
    },
    {
      title: "Pending Sellers",
      value: stats?.pendingSellers || 0,
      icon: "🛍️",
      gradient: "from-blue-500 to-indigo-500",
      link: "/admin/sellers/pending",
      color: "blue"
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "👥",
      gradient: "from-purple-500 to-pink-500",
      link: "/admin/users",
      color: "purple"
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: "🎫",
      gradient: "from-amber-500 to-orange-500",
      link: "/admin/bookings",
      color: "amber"
    },
  ];

  const quickActions = [
    {
      title: "Review Enterprises",
      description: "Approve or reject pending enterprise applications",
      icon: "🏢",
      gradient: "from-emerald-500 to-teal-500",
      link: "/admin/enterprises/pending",
      count: stats?.pendingEnterprises
    },
    {
      title: "Review Sellers",
      description: "Approve or reject pending seller applications",
      icon: "🛍️",
      gradient: "from-blue-500 to-indigo-500",
      link: "/admin/sellers/pending",
      count: stats?.pendingSellers
    },
    {
      title: "Manage Users",
      description: "View and manage all registered users",
      icon: "👥",
      gradient: "from-purple-500 to-pink-500",
      link: "/admin/users",
      count: stats?.totalUsers
    },
    {
      title: "View Reports",
      description: "Access analytics and financial reports",
      icon: "📊",
      gradient: "from-amber-500 to-orange-500",
      link: "/admin/reports"
    },
    {
      title: "Site Management",
      description: "Manage heritage sites and attractions",
      icon: "🏛️",
      gradient: "from-red-500 to-pink-500",
      link: "/admin/sites"
    },
    {
      title: "Activity Logs",
      description: "View admin actions and system logs",
      icon: "📋",
      gradient: "from-cyan-500 to-blue-500",
      link: "/admin/logs"
    },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${
        isDarkMode ? "bg-gray-900/80 backdrop-blur-xl border-b border-gray-800" : "bg-white/80 backdrop-blur-xl border-b border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Admin
              </span>
              <span className={isDarkMode ? "text-white" : "text-gray-900"}>.</span>
            </h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-emerald-400">Administrator</span>
            </h1>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Here's what's happening with your platform today
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => router.push(card.link)}
              className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${
                isDarkMode ? "bg-gray-900/50" : "bg-white/50"
              } backdrop-blur-xl border ${isDarkMode ? "border-gray-800/50" : "border-gray-200/50"} shadow-xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-2xl`}>
                    {card.icon}
                  </div>
                  <span className={`text-3xl font-bold text-${card.color}-500`}>
                    {card.value}
                  </span>
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Click to review
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(action.link)}
              className={`relative overflow-hidden rounded-xl p-6 cursor-pointer ${
                isDarkMode ? "bg-gray-900/30" : "bg-white/30"
              } backdrop-blur-sm border ${isDarkMode ? "border-gray-800/30" : "border-gray-200/30"} hover:shadow-xl transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {action.title}
                    </h3>
                    {action.count !== undefined && action.count > 0 && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full">
                        {action.count} pending
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Recent Activity
        </h2>
        <div className={`rounded-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-900/30" : "bg-white/30"
        } backdrop-blur-sm border ${isDarkMode ? "border-gray-800/30" : "border-gray-200/30"}`}>
          <div className="p-6">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between py-3 border-b border-dashed border-gray-200 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        activity.type === 'enterprise'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {activity.type === 'enterprise' ? '🏢' : '🛍️'}
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {activity.name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {activity.type === 'enterprise' ? 'Enterprise' : 'Seller'} • Status: {activity.status || 'pending'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}