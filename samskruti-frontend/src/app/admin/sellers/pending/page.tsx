"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Seller {
  id: string;
  user_id: string;
  shop_name: string;
  owner_name: string;
  shop_type: string;
  phone: string;
  alternate_phone: string | null;
  email: string;
  shop_address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  established_year: number | null;
  business_description: string | null;
  product_categories: string[] | null;
  gst_number: string | null;
  pan_number: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  bank_name: string | null;
  verified: boolean;
  verification_documents: any | null;
  rating: number | null;
  total_reviews: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  commission_rate: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  verification_status: string;
  submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  business_documents: any | null;
  tax_documents: any | null;
}

export default function PendingSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    fetchPendingSellers();
  }, [router]);

  const fetchPendingSellers = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('Fetching pending sellers...');
      const response = await fetch('http://localhost:5000/api/admin/sellers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sellers data received:', data);
      
      if (data.success) {
        setSellers(data.data);
      } else {
        setError(data.message || 'Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const handleReview = (sellerId: string) => {
    router.push(`/admin/sellers/${sellerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading sellers...</p>
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
              <Link 
                href="/admin/dashboard" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl text-white">
                Pending Sellers
                <span className="ml-3 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                  {sellers.length} pending
                </span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchPendingSellers}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        {sellers.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800"
          >
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-xl text-white mb-2">No Pending Seller Applications</h3>
            <p className="text-gray-400">All seller applications have been reviewed</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sellers.map((seller, idx) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl">
                        🏪
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{seller.shop_name}</h3>
                        <p className="text-sm text-emerald-400">{seller.shop_type || 'Shop'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Owner</p>
                        <p className="text-sm font-medium text-gray-300">{seller.owner_name}</p>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-300">{seller.email}</p>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-300">{seller.phone}</p>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-300 truncate" title={`${seller.city || ''} ${seller.state || ''}`}>
                          {seller.city || seller.state ? `${seller.city || ''}${seller.city && seller.state ? ', ' : ''}${seller.state || ''}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {seller.business_description && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-400 line-clamp-2">{seller.business_description}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <span className="text-gray-500">
                        Submitted: {seller.submitted_at ? new Date(seller.submitted_at).toLocaleDateString() : new Date(seller.created_at).toLocaleDateString()}
                      </span>
                      {seller.product_categories && seller.product_categories.length > 0 && (
                        <span className="text-gray-500">
                          Categories: {seller.product_categories.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-3">
                    <button
                      onClick={() => handleReview(seller.id)}
                      className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors whitespace-nowrap"
                    >
                      Review Application
                    </button>
                    <button
                      onClick={() => router.push(`/admin/sellers/${seller.id}`)}
                      className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    seller.verification_status === 'pending' 
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : seller.verification_status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {seller.verification_status || 'pending'}
                  </span>
                  {seller.user_id && (
                    <span className="text-xs text-gray-600">
                      User ID: {seller.user_id}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}