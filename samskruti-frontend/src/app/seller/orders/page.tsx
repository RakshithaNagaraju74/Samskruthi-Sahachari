"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import SellerLayout from "../components/SellerLayout";

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  shipping_charge: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export default function OrdersPage() {
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [useMockData, setUseMockData] = useState(true); // Set to true to see demo data
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [search, setSearch] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  // Mock Orders Data
  const mockOrders: Order[] = [
    {
      id: 1,
      order_id: 'ORD-2025-001',
      customer_name: 'Rahul Sharma',
      customer_email: 'rahul.sharma@gmail.com',
      customer_phone: '9876543210',
      total_amount: 2499,
      shipping_charge: 50,
      payment_method: 'UPI',
      payment_status: 'paid',
      order_status: 'delivered',
      created_at: '2025-02-24T10:30:00Z',
      items: [
        {
          id: 1,
          product_name: 'Mysore Silk Saree',
          quantity: 1,
          price: 2499,
          total: 2499
        }
      ]
    },
    {
      id: 2,
      order_id: 'ORD-2025-002',
      customer_name: 'Priya Patel',
      customer_email: 'priya.p@gmail.com',
      customer_phone: '9988776655',
      total_amount: 599,
      shipping_charge: 40,
      payment_method: 'Credit Card',
      payment_status: 'paid',
      order_status: 'shipped',
      created_at: '2025-02-23T15:45:00Z',
      items: [
        {
          id: 2,
          product_name: 'Sandalwood Incense Sticks (Pack of 6)',
          quantity: 2,
          price: 299.5,
          total: 599
        }
      ]
    },
    {
      id: 3,
      order_id: 'ORD-2025-003',
      customer_name: 'Arun Kumar',
      customer_email: 'arun.k@yahoo.com',
      customer_phone: '7766554433',
      total_amount: 1899,
      shipping_charge: 0,
      payment_method: 'Cash on Delivery',
      payment_status: 'pending',
      order_status: 'processing',
      created_at: '2025-02-22T09:15:00Z',
      items: [
        {
          id: 3,
          product_name: 'Channapatna Wooden Toys Set',
          quantity: 1,
          price: 899,
          total: 899
        },
        {
          id: 4,
          product_name: 'Mysore Pak (500g)',
          quantity: 2,
          price: 500,
          total: 1000
        }
      ]
    },
    {
      id: 4,
      order_id: 'ORD-2025-004',
      customer_name: 'Kavitha Nair',
      customer_email: 'kavitha.n@hotmail.com',
      customer_phone: '8899776655',
      total_amount: 3499,
      shipping_charge: 50,
      payment_method: 'Net Banking',
      payment_status: 'paid',
      order_status: 'confirmed',
      created_at: '2025-02-21T14:20:00Z',
      items: [
        {
          id: 5,
          product_name: 'Byadagi Red Chili Powder (1kg)',
          quantity: 2,
          price: 450,
          total: 900
        },
        {
          id: 6,
          product_name: 'Coorg Honey (500g)',
          quantity: 1,
          price: 599,
          total: 599
        },
        {
          id: 7,
          product_name: 'Mysore Sandal Soap (Pack of 5)',
          quantity: 2,
          price: 500,
          total: 1000
        },
        {
          id: 8,
          product_name: 'Kaavi Art Wall Hanging',
          quantity: 1,
          price: 1000,
          total: 1000
        }
      ]
    },
    {
      id: 5,
      order_id: 'ORD-2025-005',
      customer_name: 'Suresh Reddy',
      customer_email: 'suresh.r@gmail.com',
      customer_phone: '9123456789',
      total_amount: 799,
      shipping_charge: 40,
      payment_method: 'UPI',
      payment_status: 'failed',
      order_status: 'cancelled',
      created_at: '2025-02-20T11:10:00Z',
      items: [
        {
          id: 9,
          product_name: 'Bidriware Paperweight',
          quantity: 1,
          price: 799,
          total: 799
        }
      ]
    },
    {
      id: 6,
      order_id: 'ORD-2025-006',
      customer_name: 'Lakshmi Devi',
      customer_email: 'lakshmi.d@gmail.com',
      customer_phone: '9000012345',
      total_amount: 1299,
      shipping_charge: 0,
      payment_method: 'Cash on Delivery',
      payment_status: 'pending',
      order_status: 'pending',
      created_at: '2025-02-25T08:30:00Z',
      items: [
        {
          id: 10,
          product_name: 'Udupi Matta Rice (5kg)',
          quantity: 1,
          price: 699,
          total: 699
        },
        {
          id: 11,
          product_name: 'Gokak Bells (Set of 3)',
          quantity: 1,
          price: 600,
          total: 600
        }
      ]
    }
  ];

  // Mock Stats Data
  const mockStats = {
    total: 156,
    pending: 23,
    processing: 15,
    shipped: 28,
    delivered: 78,
    cancelled: 12,
    revenue: 245780
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, statusFilter, paymentFilter, dateRange, search, useMockData]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      if (useMockData) {
        // Use mock data for testing
        console.log('📦 Using mock orders data');
        
        // Filter mock data based on filters
        let filteredOrders = [...mockOrders];
        
        if (statusFilter !== 'all') {
          filteredOrders = filteredOrders.filter(o => o.order_status === statusFilter);
        }
        
        if (paymentFilter !== 'all') {
          filteredOrders = filteredOrders.filter(o => o.payment_status === paymentFilter);
        }
        
        if (search) {
          filteredOrders = filteredOrders.filter(o => 
            o.order_id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_email.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Filter by date range
        if (dateRange !== 'all') {
          const now = new Date();
          const filterDate = new Date();
          
          if (dateRange === 'today') {
            filterDate.setDate(now.getDate() - 1);
          } else if (dateRange === 'week') {
            filterDate.setDate(now.getDate() - 7);
          } else if (dateRange === 'month') {
            filterDate.setMonth(now.getMonth() - 1);
          }
          
          filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= filterDate);
        }
        
        // Simple pagination
        const itemsPerPage = 10;
        const start = (page - 1) * itemsPerPage;
        const paginatedOrders = filteredOrders.slice(start, start + itemsPerPage);
        
        setOrders(paginatedOrders);
        setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
        setTotalOrders(filteredOrders.length);
      } else {
        // Use real API
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          status: statusFilter !== 'all' ? statusFilter : '',
          payment_status: paymentFilter !== 'all' ? paymentFilter : '',
          search: search
        });

        if (dateRange !== 'all') {
          const dates = getDateRange(dateRange);
          if (dates.start) params.append('start_date', dates.start);
          if (dates.end) params.append('end_date', dates.end);
        }

        const response = await fetch(`http://localhost:5000/api/seller/orders?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
          setTotalPages(data.pagination.pages);
          setTotalOrders(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (useMockData) {
        // Use mock stats
        console.log('📊 Using mock stats data');
        setStats(mockStats);
      } else {
        // Use real API
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/seller/orders/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getDateRange = (range: string) => {
    const today = new Date();
    const start = new Date();
    
    switch(range) {
      case 'today':
        start.setHours(0,0,0,0);
        return { start: start.toISOString(), end: today.toISOString() };
      case 'week':
        start.setDate(today.getDate() - 7);
        return { start: start.toISOString(), end: today.toISOString() };
      case 'month':
        start.setMonth(today.getMonth() - 1);
        return { start: start.toISOString(), end: today.toISOString() };
      default:
        return {};
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      if (useMockData) {
        // Update mock data
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, order_status: newStatus } : order
        );
        setOrders(updatedOrders);
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus });
        }
        
        // Update mock stats
        const newStats = { ...stats };
        
        // Decrement old status count
        const oldOrder = orders.find(o => o.id === orderId);
        if (oldOrder) {
          const oldStatus = oldOrder.order_status;
          if (oldStatus === 'pending') newStats.pending--;
          else if (oldStatus === 'processing') newStats.processing--;
          else if (oldStatus === 'shipped') newStats.shipped--;
          else if (oldStatus === 'delivered') newStats.delivered--;
          else if (oldStatus === 'cancelled') newStats.cancelled--;
        }
        
        // Increment new status count
        if (newStatus === 'pending') newStats.pending++;
        else if (newStatus === 'processing') newStats.processing++;
        else if (newStatus === 'shipped') newStats.shipped++;
        else if (newStatus === 'delivered') newStats.delivered++;
        else if (newStatus === 'cancelled') newStats.cancelled++;
        
        setStats(newStats);
      } else {
        // Use real API
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order_status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
          fetchOrders();
          fetchStats();
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const viewOrderDetails = async (orderId: number) => {
    try {
      if (useMockData) {
        // Get from mock data
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
          setShowDetails(true);
        }
      } else {
        // Use real API
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setSelectedOrder(data.data);
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'confirmed': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'shipped': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'returned': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Orders
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage and track your orders
            </p>
          </div>
        </div>

        {/* Mock Data Toggle (for testing only) */}
        <div className={`p-3 rounded-lg border ${
          isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                🧪 Test Mode
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {useMockData ? 'Showing demo orders with sample products' : 'Showing real orders from database'}
              </p>
            </div>
            <button
              onClick={() => {
                setUseMockData(!useMockData);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs ${
                isDarkMode 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                  : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
              } transition-colors`}
            >
              Switch to {useMockData ? 'Real' : 'Demo'} Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard
            title="Total"
            value={stats.total}
            icon="📦"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon="⏳"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Processing"
            value={stats.processing}
            icon="⚙️"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Shipped"
            value={stats.shipped}
            icon="🚚"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon="✅"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon="❌"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Revenue"
            value={`₹${(stats.revenue || 0).toLocaleString()}`}
            icon="💰"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by order ID, customer, email..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Orders Found
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {useMockData 
                  ? 'Try changing your filters or switch to demo data'
                  : 'When customers place orders, they will appear here'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {order.order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {order.customer_name || 'Guest'}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{order.total_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {order.payment_method}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border outline-none ${getStatusColor(order.order_status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
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
                Page {page} of {totalPages} (Total {totalOrders} orders)
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
        </div>

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`max-w-2xl w-full mx-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Details - {selectedOrder.order_id}
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

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Customer Info */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Information
                  </h4>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.customer_name}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedOrder.customer_email}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📞 {selectedOrder.customer_phone}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className={`p-3 rounded-lg flex items-center justify-between ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.product_name}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subtotal:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{selectedOrder.total_amount - (selectedOrder.shipping_charge || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shipping:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{selectedOrder.shipping_charge || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                    <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{selectedOrder.total_amount}
                    </span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Update Status
                  </label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } outline-none focus:ring-1 focus:ring-emerald-500`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
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

// Stat Card Component - FULLY COMPLETE
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