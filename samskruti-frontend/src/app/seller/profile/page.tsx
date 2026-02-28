"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import SellerLayout from "../components/SellerLayout";
import Image from "next/image";

interface SellerProfile {
  id: number;
  shop_name: string;
  owner_name: string;
  email: string;
  phone: string;
  shop_address: string;
  logo: string | null;
  banner: string | null;
  rating: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  joined_date: string;
  status: string;
}

export default function SellerProfilePage() {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    phone: '',
    shop_address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          shop_name: data.data.shop_name || '',
          owner_name: data.data.owner_name || '',
          phone: data.data.phone || '',
          shop_address: data.data.shop_address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        setProfile(data.data);
        setEditing(false);
        alert('Profile updated successfully!');
      }else {
            alert(data.message || 'Failed to update profile');
        }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Server error occurred');
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seller Profile
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your seller account information
          </p>
        </div>

        {/* Profile Card */}
        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {!editing ? (
            // View Mode
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    {profile?.logo ? (
                      <Image 
                        src={`http://localhost:5000/${profile.logo}`}
                        alt={profile.shop_name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-emerald-600">
                        {profile?.shop_name?.charAt(0) || 'S'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {profile?.shop_name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Member since {profile?.joined_date ? new Date(profile.joined_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Owner Name</p>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile?.owner_name || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile?.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile?.phone || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shop Name</p>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile?.shop_name}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile?.shop_address || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        profile?.status === 'active' 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {profile?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
                  <p className={`text-lg font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile?.total_products || 0}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</p>
                  <p className={`text-lg font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile?.total_orders || 0}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                  <p className={`text-lg font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{profile?.total_revenue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit}>
              <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address
                  </label>
                  <textarea
                    name="shop_address"
                    value={formData.shop_address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}