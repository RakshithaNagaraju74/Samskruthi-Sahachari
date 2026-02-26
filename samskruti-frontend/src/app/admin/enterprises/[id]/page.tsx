"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Enterprise {
  id: string;
  user_id: string;
  enterprise_name: string;
  owner_name: string;
  business_type: string;
  description: string;
  location: string;
  phone: string;
  website: string;
  email: string;
  registration_number?: string;
  gst_number?: string;
  pan_number?: string;
  established_year?: number;
  employee_count?: number;
  verification_status: string;
  verification_documents?: any;
  business_documents?: any;
  tax_documents?: any;
  bank_details?: any;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  verified_at?: string;
  verified_by?: number;
  is_active?: boolean;
}

export default function EnterpriseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const enterpriseId = params.id;
  
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
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

    fetchEnterpriseDetails();
  }, [router, enterpriseId]);

  const fetchEnterpriseDetails = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log(`Fetching enterprise details for ID: ${enterpriseId}`);
      const response = await fetch(`http://localhost:5000/api/admin/enterprises/${enterpriseId}`, {
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
      console.log('Enterprise details received:', data);
      
      if (data.success) {
        setEnterprise(data.data);
      } else {
        setError(data.message || 'Failed to fetch enterprise details');
      }
    } catch (error) {
      console.error('Error fetching enterprise:', error);
      setError(error instanceof Error ? error.message : 'Failed to load enterprise details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/enterprises/${enterpriseId}/verify`, {
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
        // Refresh enterprise details
        fetchEnterpriseDetails();
      } else {
        setError(data.message || 'Failed to approve enterprise');
      }
    } catch (error) {
      console.error('Error approving enterprise:', error);
      setError('Failed to approve enterprise');
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
      const response = await fetch(`http://localhost:5000/api/admin/enterprises/${enterpriseId}/verify`, {
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
        // Refresh enterprise details
        fetchEnterpriseDetails();
      } else {
        setError(data.message || 'Failed to reject enterprise');
      }
    } catch (error) {
      console.error('Error rejecting enterprise:', error);
      setError('Failed to reject enterprise');
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
          <p className="text-gray-400">Loading enterprise details...</p>
        </div>
      </div>
    );
  }

  if (error || !enterprise) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">😕</span>
          <h3 className="text-xl text-white mb-2">Error Loading Enterprise</h3>
          <p className="text-gray-400 mb-6">{error || 'Enterprise not found'}</p>
          <Link
            href="/admin/enterprises/pending"
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Back to Pending Enterprises
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
                href="/admin/enterprises/pending" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Pending
              </Link>
              <h1 className="text-xl text-white">
                Enterprise Review
                <span className="ml-3 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                  ID: {enterprise.id}
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
          enterprise.verification_status === 'approved' 
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : enterprise.verification_status === 'rejected'
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${
                enterprise.verification_status === 'approved' 
                  ? 'text-emerald-500'
                  : enterprise.verification_status === 'rejected'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}>
                {enterprise.verification_status === 'approved' ? '✅' : enterprise.verification_status === 'rejected' ? '❌' : '⏳'}
              </span>
              <div>
                <p className={`text-lg font-semibold ${
                  enterprise.verification_status === 'approved' 
                    ? 'text-emerald-500'
                    : enterprise.verification_status === 'rejected'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}>
                  {enterprise.verification_status?.toUpperCase() || 'PENDING'}
                </p>
                {enterprise.verified_at && (
                  <p className="text-xs text-gray-500">
                    Reviewed on: {new Date(enterprise.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {enterprise.verification_status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Approve Enterprise
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Reject Enterprise
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enterprise Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🏢</span> Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Enterprise Name</p>
                  <p className="text-white font-medium">{enterprise.enterprise_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                  <p className="text-white">{enterprise.owner_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Business Type</p>
                  <p className="text-white">{enterprise.business_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Established Year</p>
                  <p className="text-white">{enterprise.established_year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Employee Count</p>
                  <p className="text-white">{enterprise.employee_count || 'N/A'}</p>
                </div>
              </div>
              
              {enterprise.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 text-sm">{enterprise.description}</p>
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
                  <p className="text-emerald-400">{enterprise.email || enterprise.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-white">{enterprise.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-white">{enterprise.location || 'N/A'}</p>
                </div>
                {enterprise.website && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Website</p>
                    <a 
                      href={enterprise.website.startsWith('http') ? enterprise.website : `https://${enterprise.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:text-emerald-400 hover:underline"
                    >
                      {enterprise.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {(enterprise.verification_documents || enterprise.business_documents || enterprise.tax_documents) && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📄</span> Documents
                </h2>
                <div className="space-y-3">
                  {enterprise.verification_documents && Object.entries(enterprise.verification_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
                  {enterprise.business_documents && Object.entries(enterprise.business_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
                  {enterprise.tax_documents && Object.entries(enterprise.tax_documents).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
            {/* Registration Details */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔖</span> Registration Details
              </h2>
              <div className="space-y-3">
                {enterprise.registration_number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                    <p className="text-white font-mono text-sm">{enterprise.registration_number}</p>
                  </div>
                )}
                {enterprise.gst_number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">GST Number</p>
                    <p className="text-white font-mono text-sm">{enterprise.gst_number}</p>
                  </div>
                )}
                {enterprise.pan_number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                    <p className="text-white font-mono text-sm">{enterprise.pan_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            {enterprise.bank_details && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🏦</span> Bank Details
                </h2>
                <div className="space-y-3">
                  {Object.entries(enterprise.bank_details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-white text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes Section */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Admin Notes
              </h2>
              {enterprise.admin_notes ? (
                <p className="text-gray-300 text-sm">{enterprise.admin_notes}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">No admin notes yet</p>
              )}
            </div>

            {/* Rejection Reason (if rejected) */}
            {enterprise.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Rejection Reason
                </h2>
                <p className="text-red-300 text-sm">{enterprise.rejection_reason}</p>
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
                  <span className="text-gray-300">{enterprise.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-300">{new Date(enterprise.created_at).toLocaleString()}</span>
                </div>
                {enterprise.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified:</span>
                    <span className="text-gray-300">{new Date(enterprise.verified_at).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    enterprise.verification_status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : enterprise.verification_status === 'rejected'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {enterprise.verification_status || 'pending'}
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
                <h2 className="text-xl font-semibold text-white mb-2">Approve Enterprise</h2>
                <p className="text-gray-400 text-sm">
                  Are you sure you want to approve {enterprise.enterprise_name}?
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
                <h2 className="text-xl font-semibold text-white mb-2">Reject Enterprise</h2>
                <p className="text-gray-400 text-sm">
                  Please provide a reason for rejecting {enterprise.enterprise_name}
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