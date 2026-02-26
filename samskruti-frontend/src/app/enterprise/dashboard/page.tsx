"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface DashboardStats {
  sites: {
    total: number;
    approved: number;
    pending: number;
  };
  bookings: {
    total: number;
    revenue: number;
  };
  monthlyRevenue: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: string;
    booking_reference: string;
    travel_date: string;
    total_amount: number;
    status: string;
    site_name: string;
    user_email: string;
  }>;
  popularSites: Array<{
    id: string;
    name: string;
    location: string;
    main_image: string;
    rating: number;
    total_bookings: number;
    revenue: number;
  }>;
  tickets: {
    total_tickets: number;
    active_tickets: number;
    used_tickets: number;
    expired_tickets: number;
  };
}

export default function EnterpriseDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'enterprise') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardStats();
  }, [router, timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/enterprise/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-light text-white">
                Enterprise<span className="text-emerald-400">.</span> Dashboard
              </h1>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/enterprise/sites"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Manage Sites
              </Link>
              <Link
                href="/enterprise/bookings"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Bookings
              </Link>
              <Link
                href="/enterprise/analytics"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Analytics
              </Link>
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
              Welcome back, <span className="text-emerald-400">Enterprise Partner</span>
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your heritage sites today
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Sites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-2xl">
                🏛️
              </div>
              <span className="text-3xl font-light text-emerald-400">
                {stats?.sites.total || 0}
              </span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Total Sites</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-500">{stats?.sites.approved || 0} approved</span>
              <span className="text-gray-600">•</span>
              <span className="text-yellow-500">{stats?.sites.pending || 0} pending</span>
            </div>
          </motion.div>

          {/* Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-2xl">
                🎫
              </div>
              <span className="text-3xl font-light text-blue-400">
                {stats?.bookings.total || 0}
              </span>
            </div>
            <h3 className="text-gray-300 text-sm">Total Bookings</h3>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
              <span className="text-3xl font-light text-purple-400">
                {formatRevenue(stats?.bookings.revenue || 0)}
              </span>
            </div>
            <h3 className="text-gray-300 text-sm">Total Revenue</h3>
          </motion.div>

          {/* Ticket Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center text-2xl">
                🎟️
              </div>
              <span className="text-3xl font-light text-amber-400">
                {stats?.tickets?.active_tickets || 0}
              </span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Active Tickets</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-500">{stats?.tickets?.used_tickets || 0} used</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-500">{stats?.tickets?.expired_tickets || 0} expired</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          {/* Revenue Chart */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
  className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
>
  <h2 className="text-lg font-semibold text-white mb-4">Revenue Overview</h2>
  <div className="h-64 w-full">
    {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={stats.monthlyRevenue}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex items-center justify-center text-gray-500">
        No revenue data available
      </div>
    )}
  </div>
</motion.div>

          {/* Popular Sites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Popular Sites</h2>
            <div className="space-y-4">
              {stats?.popularSites.map((site, idx) => (
                <div key={site.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-sm">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white text-sm font-medium">{site.name}</h3>
                      <span className="text-emerald-400 text-sm">
                        {formatRevenue(site.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{site.total_bookings} bookings</span>
                      <span>⭐ {site.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
            <Link
              href="/enterprise/bookings"
              className="text-sm text-emerald-500 hover:text-emerald-400"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Site</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Travel Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-800/50">
                    <td className="py-3 text-gray-300 font-mono">
                      {booking.booking_reference}
                    </td>
                    <td className="py-3 text-gray-300">{booking.site_name}</td>
                    <td className="py-3 text-gray-300">{booking.user_email}</td>
                    <td className="py-3 text-gray-300">
                      {new Date(booking.travel_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-emerald-400">
                      {formatRevenue(booking.total_amount)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/enterprise/sites/new">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-3xl mb-3">➕</div>
              <h3 className="text-white font-medium mb-1">Add New Site</h3>
              <p className="text-gray-400 text-sm">List a new heritage site</p>
            </motion.div>
          </Link>

          <Link href="/enterprise/sites">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-white font-medium mb-1">Manage Sites</h3>
              <p className="text-gray-400 text-sm">Edit or update your sites</p>
            </motion.div>
          </Link>

          <Link href="/enterprise/analytics">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-medium mb-1">View Analytics</h3>
              <p className="text-gray-400 text-sm">Detailed performance reports</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}