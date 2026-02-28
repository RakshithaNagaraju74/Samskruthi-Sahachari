"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import SellerLayout from "../components/SellerLayout";
import Image from "next/image";
import Link from "next/link";

interface Review {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_purchase: boolean;
}

export default function ReviewsPage() {
  const { isDarkMode } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0
  });

  // Mock Reviews Data
  const mockReviews: Review[] = [
    {
      id: 1,
      product_id: 101,
      product_name: 'Mysore Silk Saree',
      product_image: null,
      customer_name: 'Priya Sharma',
      customer_email: 'priya.s@gmail.com',
      rating: 5,
      title: 'Absolutely beautiful!',
      comment: 'The saree is stunning. Exactly as described. The silk quality is amazing and the colors are vibrant.',
      created_at: '2025-02-24T10:30:00Z',
      status: 'approved',
      verified_purchase: true
    },
    {
      id: 2,
      product_id: 102,
      product_name: 'Sandalwood Incense Sticks',
      product_image: null,
      customer_name: 'Rahul Patel',
      customer_email: 'rahul.p@yahoo.com',
      rating: 4,
      title: 'Great fragrance',
      comment: 'Long-lasting fragrance. Packaging could be better but overall good product.',
      created_at: '2025-02-23T15:45:00Z',
      status: 'approved',
      verified_purchase: true
    },
    {
      id: 3,
      product_id: 103,
      product_name: 'Channapatna Wooden Toys',
      product_image: null,
      customer_name: 'Anita Kumar',
      customer_email: 'anita.k@gmail.com',
      rating: 5,
      title: 'My kids love them!',
      comment: 'Beautiful handmade toys. Very safe for children. Worth every rupee.',
      created_at: '2025-02-22T09:15:00Z',
      status: 'approved',
      verified_purchase: true
    },
    {
      id: 4,
      product_id: 104,
      product_name: 'Mysore Pak (500g)',
      product_image: null,
      customer_name: 'Suresh Reddy',
      customer_email: 'suresh.r@hotmail.com',
      rating: 2,
      title: 'Not as expected',
      comment: 'The taste was okay but texture was different from authentic Mysore Pak.',
      created_at: '2025-02-21T14:20:00Z',
      status: 'pending',
      verified_purchase: true
    },
    {
      id: 5,
      product_id: 105,
      product_name: 'Byadagi Red Chili Powder',
      product_image: null,
      customer_name: 'Lakshmi Devi',
      customer_email: 'lakshmi.d@gmail.com',
      rating: 3,
      title: 'Average quality',
      comment: 'Color is good but less spicy than expected.',
      created_at: '2025-02-20T11:10:00Z',
      status: 'rejected',
      verified_purchase: true
    },
    {
      id: 6,
      product_id: 106,
      product_name: 'Coorg Honey',
      product_image: null,
      customer_name: 'Arjun Nair',
      customer_email: 'arjun.n@gmail.com',
      rating: 5,
      title: 'Pure and natural',
      comment: 'Authentic Coorg honey. You can taste the difference.',
      created_at: '2025-02-19T08:30:00Z',
      status: 'approved',
      verified_purchase: true
    },
    {
      id: 7,
      product_id: 107,
      product_name: 'Bidriware Paperweight',
      product_image: null,
      customer_name: 'Vikram Singh',
      customer_email: 'vikram.s@yahoo.com',
      rating: 4,
      title: 'Beautiful craftsmanship',
      comment: 'Intricate design. Makes a great gift.',
      created_at: '2025-02-18T16:20:00Z',
      status: 'approved',
      verified_purchase: true
    }
  ];

  // Mock Stats
  const mockStats = {
    total: 47,
    average: 4.2,
    pending: 8,
    approved: 35,
    rejected: 4,
    five_star: 22,
    four_star: 12,
    three_star: 7,
    two_star: 4,
    one_star: 2
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filter, ratingFilter, search]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        let filtered = [...mockReviews];
        
        if (filter !== 'all') {
          filtered = filtered.filter(r => r.status === filter);
        }
        
        if (ratingFilter !== 'all') {
          filtered = filtered.filter(r => r.rating === parseInt(ratingFilter));
        }
        
        if (search) {
          filtered = filtered.filter(r => 
            r.product_name.toLowerCase().includes(search.toLowerCase()) ||
            r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            r.comment.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        setReviews(filtered);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setStats(mockStats);
      }, 500);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = (reviewId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    setReviews(prev => 
      prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
    );
    if (selectedReview?.id === reviewId) {
      setSelectedReview({ ...selectedReview, status: newStatus });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Product Reviews
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage customer reviews and ratings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="Total Reviews" value={stats.total} icon="📝" isDarkMode={isDarkMode} />
          <StatCard title="Avg Rating" value={stats.average.toFixed(1)} icon="⭐" isDarkMode={isDarkMode} />
          <StatCard title="Pending" value={stats.pending} icon="⏳" isDarkMode={isDarkMode} />
          <StatCard title="Approved" value={stats.approved} icon="✅" isDarkMode={isDarkMode} />
          <StatCard title="Rejected" value={stats.rejected} icon="❌" isDarkMode={isDarkMode} />
          <StatCard title="5-Star" value={stats.five_star} icon="🌟🌟" isDarkMode={isDarkMode} />
        </div>

        {/* Rating Distribution */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Rating Distribution
          </h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = stats[star === 5 ? 'five_star' : star === 4 ? 'four_star' : star === 3 ? 'three_star' : star === 2 ? 'two_star' : 'one_star'];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className={`text-xs w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {star} ★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by product or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg text-sm border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } outline-none focus:ring-1 focus:ring-emerald-500`}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Reviews Found
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No reviews match your current filters
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <div key={review.id} className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-lg ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                          {getRatingStars(review.rating)}
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {review.rating}.0
                        </span>
                        {review.verified_purchase && (
                          <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      
                      <h4 className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {review.title}
                      </h4>
                      
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {review.comment}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          Product: {review.product_name}
                        </span>
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          By: {review.customer_name}
                        </span>
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={review.status}
                        onChange={(e) => handleStatusUpdate(review.id, e.target.value as any)}
                        className={`text-xs px-2 py-1 rounded-full border outline-none ${getStatusColor(review.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetails(true);
                        }}
                        className={`p-1 rounded hover:bg-opacity-10 ${
                          isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Details Modal */}
        {showDetails && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`max-w-2xl w-full mx-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Review Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className={`p-1 rounded ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Product Info */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product
                  </h4>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReview.product_name}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Product ID: #{selectedReview.product_id}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer
                  </h4>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReview.customer_name}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedReview.customer_email}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </h4>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                        {getRatingStars(selectedReview.rating)}
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedReview.rating} out of 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Review
                  </h4>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReview.title}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedReview.comment}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Posted on {new Date(selectedReview.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Update Status
                  </label>
                  <select
                    value={selectedReview.status}
                    onChange={(e) => handleStatusUpdate(selectedReview.id, e.target.value as any)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, isDarkMode }: any) {
  return (
    <div className={`p-3 rounded-lg ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
    } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}