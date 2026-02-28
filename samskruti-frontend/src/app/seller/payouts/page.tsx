"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import SellerLayout from "../components/SellerLayout";
import Link from "next/link";

interface Payout {
  id: number;
  payout_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  requested_date: string;
  processed_date: string | null;
  notes: string | null;
}

interface PayoutSummary {
  total_earnings: number;
  total_commission: number;
  net_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  next_payout: number;
  estimated_date: string;
}

export default function PayoutsPage() {
  const { isDarkMode } = useTheme();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    total_earnings: 245780,
    total_commission: 36867,
    net_earnings: 208913,
    paid_earnings: 150000,
    pending_earnings: 58913,
    next_payout: 58913,
    estimated_date: '2025-03-05'
  });
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [bankDetails, setBankDetails] = useState({
    account_holder: 'Sushma',
    bank_name: 'State Bank of India',
    account_number: '****1234',
    ifsc_code: 'SBIN001234',
    account_type: 'Savings'
  });

  // Mock Payouts Data
  const mockPayouts: Payout[] = [
    {
      id: 1,
      payout_id: 'PO-2025-001',
      amount: 25000,
      commission: 3750,
      net_amount: 21250,
      status: 'completed',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2025-02-15T10:30:00Z',
      processed_date: '2025-02-17T14:20:00Z',
      notes: null
    },
    {
      id: 2,
      payout_id: 'PO-2025-002',
      amount: 35000,
      commission: 5250,
      net_amount: 29750,
      status: 'completed',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2025-02-01T09:15:00Z',
      processed_date: '2025-02-03T11:30:00Z',
      notes: null
    },
    {
      id: 3,
      payout_id: 'PO-2025-003',
      amount: 15000,
      commission: 2250,
      net_amount: 12750,
      status: 'processing',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2025-01-20T16:45:00Z',
      processed_date: null,
      notes: 'Processing for this week'
    },
    {
      id: 4,
      payout_id: 'PO-2025-004',
      amount: 42000,
      commission: 6300,
      net_amount: 35700,
      status: 'pending',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2025-01-05T11:20:00Z',
      processed_date: null,
      notes: 'Awaiting approval'
    },
    {
      id: 5,
      payout_id: 'PO-2025-005',
      amount: 18000,
      commission: 2700,
      net_amount: 15300,
      status: 'completed',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2024-12-18T13:10:00Z',
      processed_date: '2024-12-20T09:45:00Z',
      notes: null
    },
    {
      id: 6,
      payout_id: 'PO-2025-006',
      amount: 30000,
      commission: 4500,
      net_amount: 25500,
      status: 'failed',
      payment_method: 'bank_transfer',
      account_number: '****1234',
      bank_name: 'State Bank of India',
      ifsc_code: 'SBIN001234',
      requested_date: '2024-12-05T14:30:00Z',
      processed_date: '2024-12-06T10:15:00Z',
      notes: 'Bank account issue - contact support'
    }
  ];

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        let filtered = [...mockPayouts];
        if (filter !== 'all') {
          filtered = filtered.filter(p => p.status === filter);
        }
        setPayouts(filtered);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      setLoading(false);
    }
  };

  const handleRequestPayout = () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(requestAmount) > summary.pending_earnings) {
      alert('Amount exceeds available balance');
      return;
    }

    // Simulate API call
    alert(`Payout request for ₹${requestAmount} submitted successfully!`);
    setShowRequestModal(false);
    setRequestAmount('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'cancelled': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Payouts & Earnings
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your payouts and track earnings
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={summary.pending_earnings <= 0}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
              summary.pending_earnings > 0
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Request Payout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Earnings"
            value={`₹${summary.total_earnings.toLocaleString()}`}
            icon="💰"
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Commission"
            value={`₹${summary.total_commission.toLocaleString()}`}
            icon="📊"
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Net Earnings"
            value={`₹${summary.net_earnings.toLocaleString()}`}
            icon="💵"
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Paid"
            value={`₹${summary.paid_earnings.toLocaleString()}`}
            icon="✅"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Balance & Next Payout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Available Balance
              </h3>
              <span className="text-2xl">💳</span>
            </div>
            <p className={`text-3xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{summary.pending_earnings.toLocaleString()}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ready to withdraw
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Next Payout
              </h3>
              <span className="text-2xl">📅</span>
            </div>
            <p className={`text-3xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{summary.next_payout.toLocaleString()}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Estimated by {new Date(summary.estimated_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Bank Account Details
            </h3>
            <Link href="/seller/settings">
              <button className="text-xs text-emerald-500 hover:text-emerald-400">
                Update
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Holder</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {bankDetails.account_holder}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bank Name</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {bankDetails.bank_name}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Number</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {bankDetails.account_number}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>IFSC Code</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {bankDetails.ifsc_code}
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } outline-none focus:ring-1 focus:ring-emerald-500`}
          >
            <option value="all">All Payouts</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payouts Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Payouts Found
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No payout history matches your filter
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payout ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Processed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.map((payout) => (
                  <tr key={payout.id} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {payout.payout_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(payout.requested_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {payout.processed_date ? new Date(payout.processed_date).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{payout.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ₹{payout.commission.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{payout.net_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Request Payout Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Request Payout
                </h3>
                <button
                  onClick={() => setShowRequestModal(false)}
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
                <div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Available Balance
                  </p>
                  <p className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{summary.pending_earnings.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Withdrawal Amount
                  </label>
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="100"
                    max={summary.pending_earnings}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minimum withdrawal: ₹100
                  </p>
                </div>

                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Will be transferred to:
                  </p>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bankDetails.bank_name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {bankDetails.account_number} | {bankDetails.ifsc_code}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout Details Modal */}
        {showDetails && selectedPayout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`max-w-2xl w-full mx-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payout Details - {selectedPayout.payout_id}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payout ID</p>
                    <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPayout.payout_id}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                    <span className={`text-xs px-2 py-1 rounded-full border inline-block mt-1 ${getStatusColor(selectedPayout.status)}`}>
                      {selectedPayout.status}
                    </span>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Requested Date</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedPayout.requested_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processed Date</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPayout.processed_date ? new Date(selectedPayout.processed_date).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Amount Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gross Amount:</span>
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{selectedPayout.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Commission (15%):</span>
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        -₹{selectedPayout.commission.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Net Amount:</span>
                      <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{selectedPayout.net_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bank Account
                  </h4>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPayout.bank_name}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      A/C: {selectedPayout.account_number} | IFSC: {selectedPayout.ifsc_code}
                    </p>
                  </div>
                </div>

                {selectedPayout.notes && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </h4>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedPayout.notes}
                      </p>
                    </div>
                  </div>
                )}
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

// Summary Card Component
function SummaryCard({ title, value, icon, isDarkMode }: any) {
  return (
    <div className={`p-6 rounded-xl border ${
      isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}