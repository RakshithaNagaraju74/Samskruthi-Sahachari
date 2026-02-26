// src/app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { bookingService } from "@/services/bookingService";
import { ticketService } from "@/services/ticketService";
import api from "@/services/api";

interface UserStats {
  totalBookings: number;
  totalSpent: number;
  activeTickets: number;
  completedTrips: number;
}

export default function ProfilePage() {
  const { isDarkMode } = useTheme();
  const { user, profile, isLoading: userLoading, refreshUserData } = useUser();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalBookings: 0,
    totalSpent: 0,
    activeTickets: 0,
    completedTrips: 0
  });
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    profile_image: profile?.profile_image || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || 'India',
    preferred_language: profile?.preferred_language || 'English',
    interests: profile?.interests || []
  });

  const [interestInput, setInterestInput] = useState('');

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        profile_image: profile.profile_image || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'India',
        preferred_language: profile.preferred_language || 'English',
        interests: profile.interests || []
      });
    }
  }, [profile]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const tickets = await ticketService.getUserTickets(user.id, true);
        const bookings = await bookingService.getUserBookings();
        
        const activeTickets = tickets.filter((t: any) => t.status === 'active').length;
        const completedTrips = tickets.filter((t: any) => t.status === 'used').length;
        
        const totalSpent = bookings.reduce((sum: number, booking: any) => {
          const amount = booking.total_amount || booking.total_price || 0;
          return sum + (typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0);
        }, 0);
        
        setUserStats({
          totalBookings: bookings.length,
          totalSpent: totalSpent,
          activeTickets,
          completedTrips
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await api.put('/user/profile', formData);
      
      if (response.data?.success) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        await refreshUserData();
      } else {
        setSaveMessage({ type: 'error', text: response.data?.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'An error occurred while saving' 
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (userLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-4 text-emerald-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>
      
      {/* Header */}
      <header className={`fixed top-0 right-0 left-0 z-40 h-16 border-b backdrop-blur-md ${
        isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
      }`}>
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-light">My Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Success/Error Message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {saveMessage.text}
            </motion.div>
          )}

          {/* Profile Header */}
          <div className={`relative rounded-3xl overflow-hidden mb-6 ${
            isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
          }`}>
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-500 relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Info */}
            <div className="relative px-8 pb-6">
              {/* Profile Picture */}
              <div className="absolute -top-12 left-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-light shadow-xl">
                    {formData.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="ml-32 pt-2">
                <h2 className="text-2xl font-semibold mb-1">
                  {formData.full_name || 'Traveler'}
                </h2>
                <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {user?.email} • {user?.role || 'user'}
                </p>
                <p className={`text-xs mb-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Member since {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    isEditing
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">{userStats.totalBookings}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">{userStats.activeTickets}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Active Tickets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">{userStats.completedTrips}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Trips Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">{formatCurrency(userStats.totalSpent)}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className={`p-8 rounded-3xl ${
            isDarkMode ? "bg-gray-800/50" : "bg-white shadow-lg"
          }`}>
            <h3 className="text-lg font-light mb-6">Personal Information</h3>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:border-emerald-500`}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                  }`}>
                    {formData.full_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Email Address
                </label>
                <p className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                }`}>
                  {user?.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:border-emerald-500`}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                  }`}>
                    {formData.phone || 'Not set'}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(formData.date_of_birth)}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:border-emerald-500`}
                  />
                ) : (
                  <p className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                  }`}>
                    {formData.date_of_birth ? formatDate(formData.date_of_birth) : 'Not set'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:border-emerald-500`}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                ) : (
                  <p className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                  }`}>
                    {formData.gender || 'Not set'}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      } focus:outline-none focus:border-emerald-500`}
                      placeholder="City"
                    />
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                    }`}>
                      {formData.city || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      } focus:outline-none focus:border-emerald-500`}
                      placeholder="State"
                    />
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                    }`}>
                      {formData.state || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      } focus:outline-none focus:border-emerald-500`}
                      placeholder="Country"
                    />
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                    }`}>
                      {formData.country || 'India'}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Preferred Language
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:border-emerald-500`}
                  >
                    <option value="English">English</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                  </select>
                ) : (
                  <p className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                  }`}>
                    {formData.preferred_language || 'English'}
                  </p>
                )}
              </div>

              {/* Interests */}
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Interests
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        } focus:outline-none focus:border-emerald-500`}
                        placeholder="Add an interest (e.g., Photography, History)"
                      />
                      <button
                        onClick={addInterest}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {formData.interests.length === 0 && (
                        <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          No interests added yet
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length > 0 ? (
                      formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className={`px-4 py-2 rounded-lg ${
                        isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                      }`}>
                        No interests added
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-6 py-2 rounded-lg border ${
                      isDarkMode 
                        ? "border-gray-700 hover:bg-gray-800" 
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}