// src/app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { isDarkMode } = useTheme();
  const { user, profile, updateProfile, isLoading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
  });

  const [preferences, setPreferences] = useState({
    favorite_categories: [] as string[],
    travel_style: [] as string[],
    budget_range: '',
    preferred_season: [] as string[],
  });

  const [activeTab, setActiveTab] = useState('profile');

  // Debug logging
  useEffect(() => {
    console.log('User data:', { user, profile });
  }, [user, profile]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      console.log('Setting form data from profile:', profile);
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
      });
      
      setPreferences({
        favorite_categories: profile.preferences?.favorite_categories || [],
        travel_style: profile.preferences?.travel_style || [],
        budget_range: profile.preferences?.budget_range || '',
        preferred_season: profile.preferences?.preferred_season || [],
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const success = await updateProfile(formData);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const success = await updateProfile({
        preferences: preferences
      });
      
      if (success) {
        setSaveMessage({ type: 'success', text: 'Preferences saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save preferences' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_categories: prev.favorite_categories.includes(category.toLowerCase())
        ? prev.favorite_categories.filter(c => c !== category.toLowerCase())
        : [...prev.favorite_categories, category.toLowerCase()]
    }));
  };

  const toggleTravelStyle = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      travel_style: prev.travel_style.includes(style.toLowerCase())
        ? prev.travel_style.filter(s => s !== style.toLowerCase())
        : [...prev.travel_style, style.toLowerCase()]
    }));
  };

  const toggleSeason = (season: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_season: prev.preferred_season.includes(season.toLowerCase())
        ? prev.preferred_season.filter(s => s !== season.toLowerCase())
        : [...prev.preferred_season, season.toLowerCase()]
    }));
  };

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
          <div className={`p-8 rounded-3xl mb-6 ${
            isDarkMode ? "bg-gray-800/50" : "bg-white shadow-lg"
          }`}>
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-light">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-light mb-1">
                  {profile?.full_name || 'Traveler'}
                </h2>
                <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {user?.email || 'No email'} • {user?.user_type || 'user'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">12</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Trips</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">8</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-emerald-400">24</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Photos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-xl mb-6 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}>
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className={`p-8 rounded-3xl ${
              isDarkMode ? "bg-gray-800/50" : "bg-white shadow-lg"
            }`}>
              <h3 className="text-lg font-light mb-6">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      />
                    ) : (
                      <p className={`px-4 py-2 rounded-lg ${
                        isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                      }`}>
                        {profile?.full_name || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Email
                    </label>
                    <p className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                    }`}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Phone
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
                      />
                    ) : (
                      <p className={`px-4 py-2 rounded-lg ${
                        isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"
                      }`}>
                        {profile?.phone || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.date_of_birth}
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
                        {profile?.date_of_birth || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

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
                      {profile?.gender || 'Not set'}
                    </p>
                  )}
                </div>

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
          )}

          {activeTab === 'preferences' && (
            <div className={`p-8 rounded-3xl ${
              isDarkMode ? "bg-gray-800/50" : "bg-white shadow-lg"
            }`}>
              <h3 className="text-lg font-light mb-6">Travel Preferences</h3>
              
              <div className="space-y-6">
                {/* Favorite Categories */}
                <div>
                  <label className={`block text-sm mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Favorite Types of Destinations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Heritage', 'Nature', 'Beach', 'Wildlife', 'Culture', 'Food', 'Shopping'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs transition-all ${
                          preferences.favorite_categories.includes(cat.toLowerCase())
                            ? "bg-emerald-500 text-white"
                            : isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <label className={`block text-sm mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Adventure', 'Relaxation', 'Cultural', 'Family', 'Solo', 'Luxury', 'Budget'].map(style => (
                      <button
                        key={style}
                        onClick={() => toggleTravelStyle(style)}
                        className={`px-4 py-2 rounded-full text-xs transition-all ${
                          preferences.travel_style.includes(style.toLowerCase())
                            ? "bg-emerald-500 text-white"
                            : isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className={`block text-sm mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Budget Range per Trip
                  </label>
                  <div className="flex gap-2">
                    {['₹5k-10k', '₹10k-25k', '₹25k-50k', '₹50k+'].map(budget => (
                      <button
                        key={budget}
                        onClick={() => setPreferences(prev => ({ ...prev, budget_range: budget }))}
                        className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                          preferences.budget_range === budget
                            ? "bg-emerald-500 text-white"
                            : isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Season */}
                <div>
                  <label className={`block text-sm mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Preferred Season
                  </label>
                  <div className="flex gap-2">
                    {['Summer', 'Monsoon', 'Autumn', 'Winter'].map(season => (
                      <button
                        key={season}
                        onClick={() => toggleSeason(season)}
                        className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                          preferences.preferred_season.includes(season.toLowerCase())
                            ? "bg-emerald-500 text-white"
                            : isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}