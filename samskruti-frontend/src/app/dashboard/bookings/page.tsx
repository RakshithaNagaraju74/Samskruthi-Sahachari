// app/dashboard/bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";

interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  site_id: number;
  site_name?: string;
  site_location?: string;
  site_image?: string;
  travel_date: string;
  travelers: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: string;
  created_at: string;
  enterprise_name?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export default function BookingsPage() {
  const { isDarkMode } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Use the correct API endpoint from your routes
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/user');
      
      if (response.data && response.data.success) {
        console.log('Bookings fetched:', response.data.data);
        setBookings(response.data.data || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'refunded': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-red-500/20 text-red-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="mt-4 text-emerald-500">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-lg ${
        isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-xl font-light hover:text-emerald-500 transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-light">My Bookings</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-8xl mb-6 animate-bounce">📅</div>
            <h2 className="text-3xl font-light mb-3">No bookings yet</h2>
            <p className="text-lg mb-8">Start exploring and book your first heritage experience!</p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium"
            >
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: Booking) => (
              <div
                key={booking.id}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white'
                } shadow-lg hover:shadow-xl transition-all duration-300 border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image with gradient background if no image */}
                  <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                    {booking.site_image ? (
                      <Image
                        src={booking.site_image}
                        alt={booking.site_name || 'Heritage Site'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${
                        booking.status === 'confirmed' ? 'from-emerald-500 to-teal-500' :
                        booking.status === 'pending' ? 'from-yellow-500 to-orange-500' :
                        booking.status === 'cancelled' ? 'from-red-500 to-pink-500' :
                        'from-blue-500 to-indigo-500'
                      } flex items-center justify-center`}>
                        <span className="text-4xl">🏛️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-semibold mb-1">{booking.site_name || 'Heritage Site'}</h3>
                        <p className={`text-sm flex items-center gap-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {booking.site_location || 'Karnataka'}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-medium text-white ${getStatusColor(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Ref</p>
                        <p className="font-mono text-sm font-medium">{booking.booking_reference}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Travel Date</p>
                        <p className="font-medium">{formatDate(booking.travel_date)}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Travelers</p>
                        <p className="font-medium">{booking.travelers} {booking.travelers === 1 ? 'Person' : 'Persons'}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                        <p className="font-bold text-emerald-500">₹{booking.total_amount}</p>
                      </div>
                    </div>

                    {booking.enterprise_name && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-emerald-400">🏢</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {booking.enterprise_name}
                        </span>
                      </div>
                    )}

                    {/* Payment Status */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                        Payment: {booking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}