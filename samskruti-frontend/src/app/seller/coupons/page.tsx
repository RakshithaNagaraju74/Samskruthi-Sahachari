"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import SellerLayout from "../components/SellerLayout";
import Link from "next/link";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  minimum_order: number | null;
  maximum_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'scheduled' | 'disabled';
  applicable_products: 'all' | 'selected';
  product_ids?: number[];
}

export default function CouponsPage() {
  const { isDarkMode } = useTheme();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    scheduled: 0,
    disabled: 0,
    total_used: 0,
    total_discount: 0
  });

  // Demo Coupons Data
  const demoCoupons: Coupon[] = [
    {
      id: 1,
      code: 'WELCOME10',
      description: '10% off on your first order',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order: 500,
      maximum_discount: 500,
      usage_limit: 100,
      usage_count: 45,
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-12-31T23:59:59Z',
      status: 'active',
      applicable_products: 'all'
    },
    {
      id: 2,
      code: 'SAVE500',
      description: 'Flat ₹500 off on orders above ₹2000',
      discount_type: 'fixed',
      discount_value: 500,
      minimum_order: 2000,
      maximum_discount: null,
      usage_limit: 50,
      usage_count: 23,
      start_date: '2025-02-01T00:00:00Z',
      end_date: '2025-03-31T23:59:59Z',
      status: 'active',
      applicable_products: 'all'
    },
    {
      id: 3,
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      discount_type: 'free_shipping',
      discount_value: 0,
      minimum_order: 999,
      maximum_discount: null,
      usage_limit: null,
      usage_count: 89,
      start_date: '2025-01-15T00:00:00Z',
      end_date: '2025-02-28T23:59:59Z',
      status: 'expired',
      applicable_products: 'all'
    },
    {
      id: 4,
      code: 'SUMMER25',
      description: '25% off on summer collection',
      discount_type: 'percentage',
      discount_value: 25,
      minimum_order: 1000,
      maximum_discount: 1000,
      usage_limit: 200,
      usage_count: 67,
      start_date: '2025-03-01T00:00:00Z',
      end_date: '2025-05-31T23:59:59Z',
      status: 'scheduled',
      applicable_products: 'selected',
      product_ids: [101, 102, 103]
    }
  ];

  // Demo Stats
  const demoStats = {
    total: 4,
    active: 2,
    expired: 1,
    scheduled: 1,
    disabled: 0,
    total_used: 224,
    total_discount: 45670
  };

  useEffect(() => {
    fetchCoupons();
  }, [filter, search, page]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      // Use demo data for now
      setTimeout(() => {
        let filtered = [...demoCoupons];
        
        if (filter !== 'all') {
          filtered = filtered.filter(c => c.status === filter);
        }
        
        if (search) {
          filtered = filtered.filter(c => 
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Simple pagination
        const itemsPerPage = 6;
        const start = (page - 1) * itemsPerPage;
        const paginatedCoupons = filtered.slice(start, start + itemsPerPage);
        
        setCoupons(paginatedCoupons);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setTotalCoupons(filtered.length);
        setStats(demoStats);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (formData: any) => {
    try {
      // For demo - just add to local state
      const newCoupon: Coupon = {
        id: demoCoupons.length + 1,
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        minimum_order: null,
        maximum_discount: null,
        usage_limit: null,
        usage_count: 0,
        start_date: new Date().toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        status: new Date(formData.end_date) > new Date() ? 'active' : 'expired',
        applicable_products: 'all'
      };

      demoCoupons.unshift(newCoupon);
      demoStats.total++;
      if (newCoupon.status === 'active') demoStats.active++;
      
      alert('Coupon created successfully!');
      setShowCreateModal(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Error creating coupon');
    }
  };

  const handleStatusUpdate = (couponId: number, newStatus: string) => {
    setCoupons(prev => 
      prev.map(c => c.id === couponId ? { ...c, status: newStatus as any } : c)
    );
    if (selectedCoupon?.id === couponId) {
      setSelectedCoupon({ ...selectedCoupon, status: newStatus as any });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'expired': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'disabled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getTypeBadge = (type: string, value: number) => {
    switch(type) {
      case 'percentage':
        return <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full">{value}% OFF</span>;
      case 'fixed':
        return <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">₹{value} OFF</span>;
      case 'free_shipping':
        return <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">FREE SHIPPING</span>;
      default:
        return null;
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Coupons & Discounts
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Create and manage promotional coupons
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="Total Coupons" value={stats.total} icon="🎫" isDarkMode={isDarkMode} />
          <StatCard title="Active" value={stats.active} icon="✅" isDarkMode={isDarkMode} />
          <StatCard title="Scheduled" value={stats.scheduled} icon="📅" isDarkMode={isDarkMode} />
          <StatCard title="Expired" value={stats.expired} icon="⏰" isDarkMode={isDarkMode} />
          <StatCard title="Times Used" value={stats.total_used} icon="🔄" isDarkMode={isDarkMode} />
          <StatCard title="Total Discount" value={`₹${stats.total_discount.toLocaleString()}`} icon="💰" isDarkMode={isDarkMode} />
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by coupon code or description..."
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
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <span className="text-6xl mb-4 block">🎫</span>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Coupons Found
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create your first coupon to start offering discounts
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
              >
                Create Coupon
              </button>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-6 rounded-xl border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-mono font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {coupon.code}
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {coupon.description}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(coupon.status)}`}>
                    {coupon.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(coupon.discount_type, coupon.discount_value)}
                    {coupon.minimum_order && (
                      <span className={`text-xs px-2 py-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Min: ₹{coupon.minimum_order}
                      </span>
                    )}
                  </div>
                  
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Valid: {new Date(coupon.start_date).toLocaleDateString()} - {new Date(coupon.end_date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Used: {coupon.usage_count} / {coupon.usage_limit || '∞'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCoupon(coupon);
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
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={goToPreviousPage}
              disabled={page === 1}
              className={`px-3 py-1 rounded text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white disabled:opacity-50' 
                  : 'bg-gray-100 text-gray-900 disabled:opacity-50'
              }`}
            >
              Previous
            </button>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white disabled:opacity-50' 
                  : 'bg-gray-100 text-gray-900 disabled:opacity-50'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Create Coupon Modal - MINIMAL with only 5 fields */}
        {showCreateModal && (
          <CreateCouponModal
            isDarkMode={isDarkMode}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCoupon}
          />
        )}

        {/* Coupon Details Modal */}
        {showDetails && selectedCoupon && (
          <CouponDetailsModal
            coupon={selectedCoupon}
            isDarkMode={isDarkMode}
            onClose={() => setShowDetails(false)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </SellerLayout>
  );
}

// Create Coupon Modal - MINIMAL with only 5 fields
function CreateCouponModal({ isDarkMode, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    end_date: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Set default end date to next month
  useEffect(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthDate = nextMonth.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      end_date: prev.end_date || nextMonthDate
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full mx-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Coupon
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field 1: Coupon Code */}
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Coupon Code <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="e.g. SAVE20"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            />
          </div>

          {/* Field 2: Description */}
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="e.g. 20% off on all orders"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            />
          </div>

          {/* Field 3: Discount Type */}
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Discount Type <span className="text-emerald-500">*</span>
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>

          {/* Field 4: Discount Value */}
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Discount Value <span className="text-emerald-500">*</span>
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              required
              min="0"
              step={formData.discount_type === 'percentage' ? '1' : '0.01'}
              placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            />
          </div>

          {/* Field 5: End Date */}
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              End Date <span className="text-emerald-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Start date will be set to today automatically
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Coupon Details Modal
function CouponDetailsModal({ coupon, isDarkMode, onClose, onStatusUpdate }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`max-w-2xl w-full mx-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Coupon Details - {coupon.code}
          </h3>
          <button
            onClick={onClose}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Coupon Code</p>
              <p className={`text-lg font-mono font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {coupon.code}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
              <span className={`text-xs px-2 py-1 rounded-full border inline-block mt-1 ${getStatusColor(coupon.status)}`}>
                {coupon.status}
              </span>
            </div>
          </div>

          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Description</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {coupon.description}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Discount Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type:</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` :
                   coupon.discount_type === 'fixed' ? `₹${coupon.discount_value} OFF` :
                   'Free Shipping'}
                </span>
              </div>
              {coupon.minimum_order && (
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Order:</span>
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{coupon.minimum_order}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Valid From</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(coupon.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Valid Until</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(coupon.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Times Used</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {coupon.usage_count}
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Update Status
            </label>
            <select
              value={coupon.status}
              onChange={(e) => onStatusUpdate(coupon.id, e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
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

// Helper function for status colors
function getStatusColor(status: string) {
  switch(status) {
    case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'expired': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    case 'scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'disabled': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}