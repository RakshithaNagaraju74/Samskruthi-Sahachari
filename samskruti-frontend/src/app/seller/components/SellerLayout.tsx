"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sellerData, setSellerData] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(1);

  // Rotate background images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage(prev => prev === 3 ? 1 : prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBackgroundImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Mysore Palace
      'https://images.unsplash.com/photo-1566577739112-5180d4bf9399?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Hampi
      'https://images.unsplash.com/photo-1512343879784-9604d4201d9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Coorg
    ];
    return images[backgroundImage - 1];
  };

  useEffect(() => {
    fetchSellerData();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSellerData(data.data);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/notifications?unread_only=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/seller/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/seller/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const menuItems = [
    { name: 'Dashboard', icon: '📊', href: '/seller/dashboard', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Products', icon: '🛍️', href: '/seller/products', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Orders', icon: '📦', href: '/seller/orders', gradient: 'from-purple-500 to-pink-500' },

    { name: 'Reviews', icon: '⭐', href: '/seller/reviews', gradient: 'from-yellow-500 to-amber-500' },
    { name: 'Coupons', icon: '🏷️', href: '/seller/coupons', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Payouts', icon: '💰', href: '/seller/payouts', gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className={`min-h-screen relative transition-all duration-500 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Animated Background with Overlay */}
      <div className="fixed inset-0 z-0">
        {/* Background Image with Ken Burns effect */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${getBackgroundImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isDarkMode ? 0.01 : 0.,
            transform: `scale(${backgroundImage === 1 ? 1.05 : 1})`,
            transition: 'transform 10s ease-in-out',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-emerald-900/30' 
            : 'bg-gradient-to-br from-white/90 via-white/85 to-emerald-50/70'
        }`} />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-500 z-30 backdrop-blur-xl ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${
          isDarkMode 
            ? 'bg-gray-900/80 border-gray-800/50' 
            : 'bg-white/80 border-gray-200/50'
        } border-r shadow-2xl`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700/30">
          <Link href="/seller/dashboard">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg rotate-12 group-hover:rotate-45 transition-all duration-500 shadow-lg shadow-emerald-500/30"></div>
              {isSidebarOpen && (
                <div>
                  <span className={`font-light block ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Seller Hub
                  </span>
                  <span className="text-[8px] tracking-wider text-emerald-500 block -mt-1">
                    SAMSKRUTHI
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="py-6 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 mb-2 relative overflow-hidden group ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/30`
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-full"></div>
                  )}
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <span className="text-xl relative z-10">{item.icon}</span>
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium relative z-10">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && (
                    <div className="absolute left-16 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isDarkMode ? 'border-gray-800/50' : 'border-gray-200/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg">
                {sellerData?.shop_name?.charAt(0) || 'S'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{sellerData?.shop_name || 'Seller'}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-500 relative z-10 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <header
          className={`h-16 flex items-center justify-between px-6 border-b backdrop-blur-xl sticky top-0 z-20 ${
            isDarkMode 
              ? 'bg-gray-900/80 border-gray-800/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'hover:bg-gray-800/50 hover:text-emerald-400' 
                : 'hover:bg-gray-100/80 hover:text-emerald-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg relative transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'hover:bg-gray-800/50 hover:text-emerald-400' 
                    : 'hover:bg-gray-100/80 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-gray-900/90 border-gray-800/50'
                      : 'bg-white/90 border-gray-200/50'
                  } z-50`}
                >
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                            isDarkMode
                              ? 'border-gray-800/50 hover:bg-gray-800/50'
                              : 'border-gray-100/50 hover:bg-gray-100/80'
                          } ${!notif.is_read ? 'bg-emerald-500/5' : ''}`}
                        >
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notif.message}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(notif.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-4xl mb-3">🔔</div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No notifications
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50 hover:text-emerald-400' 
                  : 'hover:bg-gray-100/80 hover:text-emerald-600'
              }`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {sellerData?.shop_name?.charAt(0) || 'S'}
                </div>
                {sellerData && (
                  <span className={`text-sm hidden md:block ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    {sellerData.shop_name}
                  </span>
                )}
              </button>

              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-gray-900/90 border-gray-800/50'
                      : 'bg-white/90 border-gray-200/50'
                  } z-50`}
                >
                  <Link href="/seller/profile">
                    <div
                      className={`px-4 py-3 text-sm cursor-pointer transition-all duration-300 hover:pl-6 ${
                        isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400'
                          : 'text-gray-700 hover:bg-gray-100/80 hover:text-emerald-600'
                      }`}
                    >
                      Profile
                    </div>
                  </Link>
                  <div className="border-t border-gray-700/30 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 text-sm text-red-500 cursor-pointer transition-all duration-300 hover:pl-6 ${
                      isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/80'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content with subtle pattern */}
        <main className="p-6 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}