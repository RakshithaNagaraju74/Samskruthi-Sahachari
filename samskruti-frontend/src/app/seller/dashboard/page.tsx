"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import SellerLayout from "../components/SellerLayout";

interface DashboardData {
  seller: {
    id: number;
    shop_name: string;
    logo: string | null;
    rating: number;
    verified: boolean;
  };
  overview: {
    today_orders: number;
    today_revenue: number;
    total_orders: number;
    total_revenue: number;
    total_customers: number;
    total_products: number;
    published_products: number;
    pending_orders: number;
    low_stock_products: number;
    out_of_stock: number;
  };
  earnings: {
    total: number;
    commission: number;
    net: number;
    paid: number;
    pending: number;
  };
  recent_orders: any[];
  monthly_revenue: { month: string; revenue: number }[];
}

export default function SellerDashboard() {
  const { isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {dashboardData?.seller?.shop_name}
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/seller/products/add">
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
                + Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Orders"
            value={dashboardData?.overview.today_orders || 0}
            icon="📦"
            change="+12%"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${(dashboardData?.overview.today_revenue || 0).toLocaleString()}`}
            icon="💰"
            change="+8%"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Pending Orders"
            value={dashboardData?.overview.pending_orders || 0}
            icon="⏳"
            change="-3%"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Low Stock Alert"
            value={dashboardData?.overview.low_stock_products || 0}
            icon="⚠️"
            change="+5"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={dashboardData?.overview.total_products || 0}
            icon="🛍️"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Published"
            value={dashboardData?.overview.published_products || 0}
            icon="✅"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Total Orders"
            value={dashboardData?.overview.total_orders || 0}
            icon="📋"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(dashboardData?.overview.total_revenue || 0).toLocaleString()}`}
            icon="💵"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Charts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className={`lg:col-span-2 p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Revenue Overview
            </h3>
            <div className="h-64">
              {dashboardData?.monthly_revenue && dashboardData.monthly_revenue.length > 0 ? (
                <div className="flex items-end justify-between h-full gap-2">
                  {dashboardData.monthly_revenue.map((item, index) => {
                    const maxRevenue = Math.max(...dashboardData.monthly_revenue.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-400"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No revenue data available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Orders
            </h3>
            <div className="space-y-4">
              {dashboardData?.recent_orders && dashboardData.recent_orders.length > 0 ? (
                dashboardData.recent_orders.map((order) => (
                  <Link key={order.id} href={`/seller/orders/${order.id}`}>
                    <div className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {order.customer_name || 'Guest'}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {order.order_id}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.order_status === 'delivered' 
                            ? 'bg-green-500/10 text-green-600'
                            : order.order_status === 'processing'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : order.order_status === 'shipped'
                            ? 'bg-blue-500/10 text-blue-600'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-gray-500/10 text-gray-600'
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{order.total_amount.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No recent orders
                  </p>
                </div>
              )}
            </div>
            <Link href="/seller/orders">
              <button className={`w-full mt-4 py-2 text-sm text-center border-t ${
                isDarkMode 
                  ? 'border-gray-700 text-gray-400 hover:text-white' 
                  : 'border-gray-200 text-gray-500 hover:text-gray-900'
              } transition-colors`}>
                View All Orders
              </button>
            </Link>
          </div>
        </div>

        {/* Earnings Summary */}
        {dashboardData?.earnings && (
          <div className={`p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Earnings Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <EarningCard
                title="Total Earnings"
                value={`₹${dashboardData.earnings.total.toLocaleString()}`}
                icon="💰"
                isDarkMode={isDarkMode}
              />
              <EarningCard
                title="Commission"
                value={`₹${dashboardData.earnings.commission.toLocaleString()}`}
                icon="📊"
                isDarkMode={isDarkMode}
              />
              <EarningCard
                title="Net Earnings"
                value={`₹${dashboardData.earnings.net.toLocaleString()}`}
                icon="💵"
                isDarkMode={isDarkMode}
              />
              <EarningCard
                title="Paid"
                value={`₹${dashboardData.earnings.paid.toLocaleString()}`}
                icon="✅"
                isDarkMode={isDarkMode}
              />
              <EarningCard
                title="Pending"
                value={`₹${dashboardData.earnings.pending.toLocaleString()}`}
                icon="⏳"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              icon="➕"
              title="Add Product"
              description="List a new product"
              href="/seller/products/add"
              isDarkMode={isDarkMode}
            />
            <QuickAction
              icon="📦"
              title="Update Inventory"
              description="Manage stock levels"
              href="/seller/inventory"
              isDarkMode={isDarkMode}
            />
            <QuickAction
              icon="🏷️"
              title="Create Coupon"
              description="Offer discounts"
              href="/seller/coupons/add"
              isDarkMode={isDarkMode}
            />
            <QuickAction
              icon="📊"
              title="View Reports"
              description="Analytics & insights"
              href="/seller/analytics"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, change, isDarkMode }: any) {
  return (
    <div className={`p-6 rounded-xl border ${
      isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-light mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      {change && (
        <div className="mt-2">
          <span className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            vs last period
          </span>
        </div>
      )}
    </div>
  );
}

// Earning Card Component
function EarningCard({ title, value, icon, isDarkMode }: any) {
  return (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
    }`}>
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

// Quick Action Component
function QuickAction({ icon, title, description, href, isDarkMode }: any) {
  return (
    <Link href={href}>
      <div className={`p-4 rounded-lg text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
        isDarkMode 
          ? 'bg-gray-700/50 hover:bg-gray-700' 
          : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <span className="text-2xl mb-2 block">{icon}</span>
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    </Link>
  );
}