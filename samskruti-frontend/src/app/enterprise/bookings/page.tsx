"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  booking_reference: string;
  site_id: string;
  site_name: string;
  site_location: string;
  user_id: string;
  user_email: string;
  user_name: string;
  travel_date: string;
  travelers: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  special_requests?: string;
}

export default function EnterpriseBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    fetchBookings();
  }, [router]);

  useEffect(() => {
    // Apply filters
    let filtered = [...bookings];
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(b => new Date(b.travel_date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(b => new Date(b.travel_date) <= new Date(dateRange.end));
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateRange, searchTerm]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/enterprise/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
        setFilteredBookings(data.data);
        
        // Calculate stats
        const stats = {
          total: data.data.length,
          confirmed: data.data.filter((b: Booking) => b.status === 'confirmed').length,
          pending: data.data.filter((b: Booking) => b.status === 'pending').length,
          completed: data.data.filter((b: Booking) => b.status === 'completed').length,
          cancelled: data.data.filter((b: Booking) => b.status === 'cancelled').length,
          revenue: data.data.reduce((sum: number, b: Booking) => sum + (b.total_amount || 0), 0)
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enterprise/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh bookings
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      confirmed: 'bg-emerald-500/10 text-emerald-500',
      completed: 'bg-blue-500/10 text-blue-500',
      cancelled: 'bg-red-500/10 text-red-500'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-500/10 text-gray-500'}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-500/10 text-emerald-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      failed: 'bg-red-500/10 text-red-500',
      refunded: 'bg-purple-500/10 text-purple-500'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading bookings...</p>
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
              <h1 className="text-xl text-white">Bookings Management</h1>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-2xl text-white font-light">{stats.total}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Confirmed</p>
            <p className="text-2xl text-emerald-400 font-light">{stats.confirmed}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Pending</p>
            <p className="text-2xl text-yellow-400 font-light">{stats.pending}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Completed</p>
            <p className="text-2xl text-blue-400 font-light">{stats.completed}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Cancelled</p>
            <p className="text-2xl text-red-400 font-light">{stats.cancelled}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Revenue</p>
            <p className="text-lg text-purple-400 font-light truncate">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Booking ID, Site, Customer..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setStatusFilter("all");
                setDateRange({ start: "", end: "" });
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl text-white mb-2">No Bookings Found</h3>
            <p className="text-gray-400">
              {bookings.length === 0 
                ? "No bookings have been made for your sites yet." 
                : "No bookings match your filters."}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Booking ID</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Site</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Customer</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Travel Date</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Travelers</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Payment</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-t border-gray-800 hover:bg-gray-800/30"
                    >
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 font-mono text-sm">
                          {booking.booking_reference}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white text-sm">{booking.site_name}</p>
                          <p className="text-gray-500 text-xs">{booking.site_location}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white text-sm">{booking.user_name || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">{booking.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-sm">
                          {new Date(booking.travel_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-sm">{booking.travelers}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 text-sm font-medium">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getPaymentBadge(booking.payment_status || 'pending')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/enterprise/bookings/${booking.id}`}
                            className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs hover:bg-emerald-500/20"
                          >
                            View
                          </Link>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs hover:bg-emerald-500/20"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}