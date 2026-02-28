"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Seller {
  id: string;
  user_id: string;
  shop_name: string;
  owner_name: string;
  shop_type: string | null;
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

export default function SellerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    fetchSellerDetails();
  }, [router, sellerId]);

  const fetchSellerDetails = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      console.log(`Fetching seller details for ID: ${sellerId}`);
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}`, {
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
      console.log('Seller details received:', data);

      if (data.success) {
        setSeller(data.data);
      } else {
        setError(data.message || 'Failed to fetch seller details');
      }
    } catch (error) {
      console.error('Error fetching seller:', error);
      setError(error instanceof Error ? error.message : 'Failed to load seller details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          notes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowApproveModal(false);
        fetchSellerDetails();
      } else {
        setError(data.message || 'Failed to approve seller');
      }
    } catch (error) {
      console.error('Error approving seller:', error);
      setError('Failed to approve seller');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectionReason,
          notes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason("");
        setAdminNotes("");
        fetchSellerDetails();
      } else {
        setError(data.message || 'Failed to reject seller');
      }
    } catch (error) {
      console.error('Error rejecting seller:', error);
      setError('Failed to reject seller');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">😕</span>
          <h3 className="text-xl text-white mb-2">Error Loading Seller</h3>
          <p className="text-gray-400 mb-6">{error || 'Seller not found'}</p>
          <Link
            href="/admin/sellers/pending"
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Back to Pending Sellers
          </Link>
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
                href="/admin/sellers/pending"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Pending
              </Link>
              <h1 className="text-xl text-white">
                Seller Review
                <span className="ml-3 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                  ID: {seller.id}
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
        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-xl border ${
          seller.verification_status === 'approved'
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : seller.verification_status === 'rejected'
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${
                seller.verification_status === 'approved'
                  ? 'text-emerald-500'
                  : seller.verification_status === 'rejected'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}>
                {seller.verification_status === 'approved' ? '✅' : seller.verification_status === 'rejected' ? '❌' : '⏳'}
              </span>
              <div>
                <p className={`text-lg font-semibold ${
                  seller.verification_status === 'approved'
                    ? 'text-emerald-500'
                    : seller.verification_status === 'rejected'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}>
                  {seller.verification_status?.toUpperCase() || 'PENDING'}
                </p>
                {seller.verified_at && (
                  <p className="text-xs text-gray-500">
                    Reviewed on: {new Date(seller.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {seller.verification_status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Approve Seller
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Reject Seller
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seller Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🏪</span> Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                  <p className="text-white font-medium">{seller.shop_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                  <p className="text-white">{seller.owner_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Type</p>
                  <p className="text-white">{seller.shop_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Established Year</p>
                  <p className="text-white">{seller.established_year || 'N/A'}</p>
                </div>
              </div>

              {seller.business_description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Business Description</p>
                  <p className="text-gray-300 text-sm">{seller.business_description}</p>
                </div>
              )}

              {seller.product_categories && seller.product_categories.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Product Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {seller.product_categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📞</span> Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-emerald-400">{seller.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-white">{seller.phone}</p>
                </div>
                {seller.alternate_phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Alternate Phone</p>
                    <p className="text-white">{seller.alternate_phone}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Shop Address</p>
                <p className="text-white text-sm">{seller.shop_address}</p>
                {(seller.city || seller.state || seller.pincode) && (
                  <p className="text-gray-400 text-sm mt-1">
                    {[seller.city, seller.state, seller.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Information */}
            {(seller.gst_number || seller.pan_number || seller.bank_name || seller.bank_account_number || seller.bank_ifsc_code) && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💰</span> Financial Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {seller.gst_number && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">GST Number</p>
                      <p className="text-white font-mono text-sm">{seller.gst_number}</p>
                    </div>
                  )}
                  {seller.pan_number && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                      <p className="text-white font-mono text-sm">{seller.pan_number}</p>
                    </div>
                  )}
                </div>
                {(seller.bank_name || seller.bank_account_number || seller.bank_ifsc_code) && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-emerald-400 mb-3">Bank Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      {seller.bank_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                          <p className="text-white">{seller.bank_name}</p>
                        </div>
                      )}
                      {seller.bank_account_number && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Account Number</p>
                          <p className="text-white font-mono text-sm">{seller.bank_account_number}</p>
                        </div>
                      )}
                      {seller.bank_ifsc_code && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                          <p className="text-white font-mono text-sm">{seller.bank_ifsc_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            {(seller.verification_documents || seller.business_documents || seller.tax_documents) && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📄</span> Documents
                </h2>
                <div className="space-y-3">
                  {seller.verification_documents && Object.entries(seller.verification_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <a
                        href={`http://localhost:5000/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 text-sm"
                      >
                        View Document →
                      </a>
                    </div>
                  ))}
                  {seller.business_documents && Object.entries(seller.business_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <a
                        href={`http://localhost:5000/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 text-sm"
                      >
                        View Document →
                      </a>
                    </div>
                  ))}
                  {seller.tax_documents && Object.entries(seller.tax_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <a
                        href={`http://localhost:5000/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 text-sm"
                      >
                        View Document →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Statistics Card */}
            {/* Statistics Card */}
<div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
    <span>📊</span> Statistics
  </h2>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-gray-500">Rating</span>
      <span className="text-white">
        {seller.rating != null && !isNaN(Number(seller.rating))
          ? Number(seller.rating).toFixed(1)
          : 'N/A'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Total Reviews</span>
      <span className="text-white">
        {seller.total_reviews != null ? Number(seller.total_reviews).toLocaleString() : '0'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Total Products</span>
      <span className="text-white">
        {seller.total_products != null ? Number(seller.total_products).toLocaleString() : '0'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Total Orders</span>
      <span className="text-white">
        {seller.total_orders != null ? Number(seller.total_orders).toLocaleString() : '0'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Total Revenue</span>
      <span className="text-white">
        ₹{seller.total_revenue != null && !isNaN(Number(seller.total_revenue))
          ? Number(seller.total_revenue).toLocaleString()
          : '0'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Commission Rate</span>
      <span className="text-white">
        {seller.commission_rate != null && !isNaN(Number(seller.commission_rate))
          ? `${Number(seller.commission_rate)}%`
          : 'N/A'}
      </span>
    </div>
  </div>
</div>

            {/* Admin Notes Section */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Admin Notes
              </h2>
              {seller.admin_notes ? (
                <p className="text-gray-300 text-sm">{seller.admin_notes}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">No admin notes yet</p>
              )}
            </div>

            {/* Rejection Reason (if rejected) */}
            {seller.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Rejection Reason
                </h2>
                <p className="text-red-300 text-sm">{seller.rejection_reason}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>ℹ️</span> Metadata
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span className="text-gray-300">{seller.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted:</span>
                  <span className="text-gray-300">
                    {seller.submitted_at ? new Date(seller.submitted_at).toLocaleString() : new Date(seller.created_at).toLocaleString()}
                  </span>
                </div>
                {seller.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified:</span>
                    <span className="text-gray-300">{new Date(seller.verified_at).toLocaleString()}</span>
                  </div>
                )}
                {seller.verified_by && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified By:</span>
                    <span className="text-gray-300">{seller.verified_by}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    seller.verification_status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : seller.verification_status === 'rejected'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {seller.verification_status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✅
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Approve Seller</h2>
                <p className="text-gray-400 text-sm">
                  Are you sure you want to approve {seller.shop_name}?
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Add any notes about this approval..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ❌
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Reject Seller</h2>
                <p className="text-gray-400 text-sm">
                  Please provide a reason for rejecting {seller.shop_name}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    placeholder="Explain why this application is being rejected..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Add any internal notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setAdminNotes("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}