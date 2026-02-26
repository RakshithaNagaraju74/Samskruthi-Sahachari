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

interface AnalyticsData {
  revenueOverTime: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  sitePerformance: Array<{
    id: string;
    name: string;
    rating: number;
    total_reviews: number;
    views: number;
    total_bookings: number;
    total_revenue: number;
    avg_booking_value: number;
  }>;
  bookingStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  monthlyComparison: Array<{
    month: string;
    bookings: number;
    revenue: number;
    prev_bookings?: number;
    prev_revenue?: number;
  }>;
  period: string;
}

export default function EnterpriseAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [selectedSite, setSelectedSite] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    fetchAnalytics();
  }, [router, period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enterprise/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
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
              <Link href="/enterprise/dashboard" className="text-gray-400 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-xl text-white">Analytics & Reports</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
              </select>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl text-emerald-400 font-light">
              {formatCurrency(data?.monthlyComparison?.[0]?.revenue || 0)}
            </p>
            {data?.monthlyComparison?.[0]?.prev_revenue && (
              <p className="text-xs text-gray-500 mt-2">
                vs previous: {((data.monthlyComparison[0].revenue / data.monthlyComparison[0].prev_revenue - 1) * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
            <p className="text-3xl text-blue-400 font-light">
              {formatNumber(data?.monthlyComparison?.[0]?.bookings || 0)}
            </p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Avg. Booking Value</p>
            <p className="text-3xl text-purple-400 font-light">
              {data?.sitePerformance?.length ? 
                formatCurrency(data.sitePerformance.reduce((sum, site) => sum + site.avg_booking_value, 0) / data.sitePerformance.length) : 
                formatCurrency(0)}
            </p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Site Views</p>
            <p className="text-3xl text-amber-400 font-light">
              {formatNumber(data?.sitePerformance?.reduce((sum, site) => sum + (site.views || 0), 0) || 0)}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Revenue Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueOverTime || []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
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
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Booking Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.bookingStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(data?.bookingStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {data?.bookingStatus.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-300 capitalize">{status.status}</span>
                  </div>
                  <span className="text-white font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Site Performance */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Site Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Site Name</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Reviews</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Bookings</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Avg. Value</th>
                </tr>
              </thead>
              <tbody>
                {data?.sitePerformance.map((site) => (
                  <tr key={site.id} className="border-b border-gray-800/50">
                    <td className="py-3 text-white">{site.name}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-300">{site.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{site.total_reviews || 0}</td>
                    <td className="py-3 text-gray-300">{formatNumber(site.views || 0)}</td>
                    <td className="py-3 text-gray-300">{site.total_bookings || 0}</td>
                    <td className="py-3 text-emerald-400">{formatCurrency(site.total_revenue || 0)}</td>
                    <td className="py-3 text-purple-400">{formatCurrency(site.avg_booking_value || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyComparison || []}>
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
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                {data?.monthlyComparison?.[0]?.prev_revenue && (
                  <Bar dataKey="prev_revenue" fill="#6b7280" name="Previous Period" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}