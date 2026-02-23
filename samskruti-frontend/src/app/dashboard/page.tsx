"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { heritageService, HeritageSite } from "@/services/heritageService";
import HeritageMap from "@/components/HeritageMap";
import HeritageStats from "@/components/HeritageStats";

// Icons
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Tickets: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  Favorites: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Message: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Payment: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

// Categories for filter with enhanced styling
const categories = [
  { id: "all", name: "All", icon: "🌍", color: "from-gray-500 to-gray-600", gradient: "from-gray-400 to-gray-600" },
  { id: "heritage", name: "Heritage", icon: "🏛️", color: "from-amber-500 to-orange-500", gradient: "from-amber-400 to-orange-600" },
  { id: "nature", name: "Nature", icon: "🌄", color: "from-emerald-500 to-teal-500", gradient: "from-emerald-400 to-teal-600" },
  { id: "culture", name: "Culture", icon: "🎭", color: "from-purple-500 to-pink-500", gradient: "from-purple-400 to-pink-600" },
  { id: "fort", name: "Forts", icon: "🏰", color: "from-stone-500 to-stone-700", gradient: "from-stone-400 to-stone-800" },
  { id: "temple", name: "Temples", icon: "🛕", color: "from-amber-600 to-yellow-600", gradient: "from-amber-500 to-yellow-700" },
  { id: "unesco", name: "UNESCO", icon: "🏛️", color: "from-indigo-500 to-purple-500", gradient: "from-indigo-400 to-purple-600" },
  { id: "adventure", name: "Adventure", icon: "🧗", color: "from-red-500 to-rose-500", gradient: "from-red-400 to-rose-600" },
  { id: "museum", name: "Museums", icon: "🏛️", color: "from-teal-500 to-cyan-500", gradient: "from-teal-400 to-cyan-600" },
];

export default function DashboardPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, profile } = useUser();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State for heritage sites
  const [heritageSites, setHeritageSites] = useState<HeritageSite[]>([]);
  const [filteredHeritageSites, setFilteredHeritageSites] = useState<HeritageSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>("Loading...");
  
  const [greeting, setGreeting] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [activeFilter, setActiveFilter] = useState("Most Popular");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapView, setMapView] = useState<"all" | "heritage" | "nature" | "culture" | "adventure">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("rating");
  
  // State for heritage features
  const [userVisited, setUserVisited] = useState<number[]>([1, 2, 5, 7]); 
  const [userBooked, setUserBooked] = useState<number[]>([3, 4, 6]); 
  const [stats, setStats] = useState({
    totalVisits: 12,
    totalBookings: 8,
    totalReviews: 24,
    completionRate: 65
  });

  // Set greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch heritage sites
  useEffect(() => {
    const fetchHeritageSites = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching heritage sites from API...');
        const sites = await heritageService.getAllSites();
        
        if (sites && sites.length > 0) {
          console.log(`✅ Loaded ${sites.length} heritage sites from API`);
          
          // Mark visited and booked sites
          const sitesWithStatus = sites.map(site => ({
            ...site,
            visited: userVisited.includes(site.id),
            booked: userBooked.includes(site.id)
          }));
          
          setHeritageSites(sitesWithStatus);
          setFilteredHeritageSites(sitesWithStatus);
          setApiStatus(`Loaded ${sites.length} heritage sites`);
        } else {
          console.log('No heritage sites found in API');
          setApiStatus('No heritage sites found');
          setHeritageSites([]);
          setFilteredHeritageSites([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setApiStatus('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeritageSites();
  }, []);

  // Filter and sort heritage sites
  useEffect(() => {
    let filtered = [...heritageSites];
    
    // Filter by search query
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(site => 
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(site => 
        site.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by map view
    if (mapView !== "all") {
      filtered = filtered.filter(site => 
        site.category?.toLowerCase() === mapView.toLowerCase()
      );
    }

    // Sort sites
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        return (a.entry_fee_indian || 0) - (b.entry_fee_indian || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    setFilteredHeritageSites(filtered);
  }, [searchQuery, selectedCategory, mapView, sortBy, heritageSites]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/auth');
  };

  const handleSiteClick = (id: number) => {
    router.push(`/dashboard/heritage/${id}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleMapViewChange = (view: "all" | "heritage" | "nature" | "culture" | "adventure") => {
    setMapView(view);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "my-tickets", label: "My Tickets", icon: Icons.Tickets, badge: 2 },
    { id: "favourites", label: "Favourites", icon: Icons.Favorites },
    { id: "messages", label: "Messages", icon: Icons.Message, badge: 3 },
    { id: "payment", label: "Payment", icon: Icons.Payment },
    { id: "settings", label: "Settings", icon: Icons.Settings },
  ];

  // Get display name
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Traveler';

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-6 text-emerald-500 font-medium animate-pulse">Loading heritage sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>
      
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg ${
              isDarkMode 
                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            } transition-all duration-300 hover:scale-110`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`fixed left-0 top-0 h-screen w-64 border-r backdrop-blur-xl z-30 ${
          isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            >
              KS
            </motion.div>
            <div>
              <h1 className="text-xl font-light tracking-wider group-hover:text-emerald-400 transition-colors">
                Karnataka
              </h1>
              <p className="text-[8px] tracking-[0.3em] uppercase text-emerald-400/70">
                Heritage Explorer
              </p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="space-y-1 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Promo Card */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden group cursor-pointer mb-4 relative"
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
            <p className="text-xs opacity-90">✨ Heritage Pass</p>
            <p className="text-sm font-medium mt-1">Get access to all <br />UNESCO sites</p>
            <button className="mt-3 px-3 py-1.5 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-all">
              Learn More →
            </button>
          </motion.div>

          {/* User Profile Summary */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            isDarkMode ? "bg-gray-800/50" : "bg-white/50"
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || displayName}</p>
              <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isRightSidebarOpen ? "mr-80" : "mr-0"
      } ml-64 p-6`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header with Stats */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-light mb-2"
              >
                {greeting}, <span className="text-emerald-500 font-medium bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{displayName}!</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Discover {filteredHeritageSites.length} heritage sites across Karnataka
              </motion.p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search heritage sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-72 px-4 py-2.5 pl-11 rounded-xl text-sm border transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/50"
                      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  } focus:outline-none`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icons.Search />
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </motion.div>

              {/* Theme Toggle */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
              </motion.button>

              {/* Notifications */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                <Icons.Bell />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                    {notifications}
                  </span>
                )}
              </motion.button>

              {/* Profile */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => router.push('/dashboard/profile')}
                className={`w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </motion.button>

              {/* Toggle Right Sidebar */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                {isRightSidebarOpen ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
              </motion.button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Icons.TrendingUp />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Visits</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.totalVisits}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Icons.Tickets />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Bookings</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.totalBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Icons.Message />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Reviews</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.totalReviews}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Icons.Users />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Completion</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.completionRate}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Category Pills with Scroll */}
          <div className="relative mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                      : isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </motion.button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                } border focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="rating">Rating</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          {/* Heritage Map Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light flex items-center gap-2">
                <span>🗺️</span> Karnataka Heritage Map 
                <span className="text-sm bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  {filteredHeritageSites.length} sites
                </span>
              </h2>
              <div className="flex gap-2">
                {["all", "heritage", "nature", "culture", "adventure"].map((view) => (
                  <button
                    key={view}
                    onClick={() => handleMapViewChange(view as any)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      mapView === view
                        ? "bg-emerald-500 text-white"
                        : isDarkMode 
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
            <HeritageMap 
              sites={filteredHeritageSites.map(site => ({
                id: site.id,
                name: site.name,
                location: site.location,
                coordinates: { lat: site.latitude || 0, lng: site.longitude || 0 },
                image: site.main_image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800',
                price: site.entry_fee_indian ? `₹${site.entry_fee_indian}` : 'Free',
                visited: site.visited,
                booked: site.booked
              }))}
              userVisited={userVisited}
              userBooked={userBooked}
              onSiteClick={handleSiteClick}
            />
          </section>

          {/* Featured UNESCO Sites */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light flex items-center gap-2">
                <span>🏛️</span> UNESCO World Heritage Sites
              </h2>
              <Link href="/dashboard/unesco" className={`text-sm flex items-center gap-1 group ${
                isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              }`}>
                View All 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heritageSites
                .filter(site => site.is_unesco || site.type?.includes('UNESCO'))
                .slice(0, 3)
                .map((site, index) => (
                  <FeaturedCard 
                    key={site.id}
                    destination={site}
                    index={index}
                    isDarkMode={isDarkMode}
                  />
                ))}
            </div>
          </section>

          {/* Most Popular Heritage Sites */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light flex items-center gap-2">
                <span>🔥</span> Most Popular Heritage Sites
              </h2>
              <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                {['Most Popular', 'Special Offers', 'Near Me'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === tab
                        ? "bg-emerald-500 text-white shadow-lg"
                        : isDarkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {heritageSites.slice(0, 8).map((site, index) => (
                <PopularCard
                  key={site.id}
                  destination={site}
                  index={index}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </section>

          {/* Weekly Picks Section */}
          <section className="mb-10">
            <h2 className="text-xl font-light mb-4 flex items-center gap-2">
              <span>🌟</span> Weekly Heritage Picks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heritageSites.filter(site => site.is_featured).slice(0, 2).map((site, index) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer h-48 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } shadow-lg hover:shadow-xl transition-all`}
                  onClick={() => router.push(`/dashboard/heritage/${site.id}`)}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={site.main_image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800'}
                      alt={site.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{site.name}</h3>
                    <p className="text-sm opacity-90 mb-2">{site.location}{site.district ? `, ${site.district}` : ''}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        {site.entry_fee_indian ? `₹${site.entry_fee_indian}` : 'Free'}
                      </span>
                      <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar - Collapsible with Heritage Stats */}
      <AnimatePresence mode="wait">
        {isRightSidebarOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed right-0 top-0 bottom-0 w-80 border-l backdrop-blur-xl overflow-y-auto z-20 ${
              isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
            }`}
          >
            <div className="p-6">
              
              {/* Quick Stats */}
              <div className="mb-6 grid grid-cols-2 gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white"
                  } shadow-lg`}
                >
                  <p className="text-2xl font-bold text-emerald-500">{heritageSites.length}</p>
                  <p className="text-xs">Total Sites</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white"
                  } shadow-lg`}
                >
                  <p className="text-2xl font-bold text-amber-500">
                    {heritageSites.filter(s => s.category === 'heritage').length}
                  </p>
                  <p className="text-xs">Heritage</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white"
                  } shadow-lg`}
                >
                  <p className="text-2xl font-bold text-blue-500">
                    {heritageSites.filter(s => s.category === 'nature').length}
                  </p>
                  <p className="text-xs">Nature</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white"
                  } shadow-lg`}
                >
                  <p className="text-2xl font-bold text-purple-500">
                    {heritageSites.filter(s => s.category === 'culture').length}
                  </p>
                  <p className="text-xs">Culture</p>
                </motion.div>
              </div>

              {/* Heritage Stats Widget */}
              <div className="mb-6">
                <HeritageStats 
                  totalSites={heritageSites.length}
                  visitedCount={userVisited.length}
                  bookedCount={userBooked.length}
                />
              </div>

              {/* Weather Widget */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`mb-6 p-4 rounded-xl ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white shadow-sm"
                } hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">🌤️ Weather</h3>
                  <span className="text-xs text-emerald-500">Hampi</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">☀️</span>
                    <div>
                      <p className="text-2xl font-light">28°C</p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Sunny</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Humidity: 65%</p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Wind: 12 km/h</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>📋</span> Recent Activity
                </h3>
                <div className="space-y-3">
                  {userVisited.slice(0, 3).map((siteId, index) => {
                    const site = heritageSites.find(s => s.id === siteId);
                    return site ? (
                      <motion.div
                        key={siteId}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`flex gap-3 p-2 rounded-xl cursor-pointer ${
                          isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white shadow-sm hover:shadow-md"
                        } transition-all`}
                        onClick={() => router.push(`/dashboard/heritage/${site.id}`)}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={site.main_image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800'}
                            alt={site.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{site.name}</h4>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {site.location}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-green-500 text-xs">✓</span>
                            <span className="text-xs text-green-500">Visited</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Travel Tips */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`mt-6 p-4 rounded-xl ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white shadow-sm"
                } hover:shadow-lg transition-all`}
              >
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>💡</span> Heritage Travel Tip
                </h3>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Visit Hampi during November to February for the best weather. Don't miss the sunset from Matanga Hill!
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span>✨</span> Pro tip: Book tickets in advance
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// Featured Card Component
function FeaturedCard({ destination, index, isDarkMode }: any) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800';

  // Safely get rating
  const rating = typeof destination.rating === 'number' ? destination.rating : 4.5;
  const displayPrice = destination.entry_fee_indian ? `₹${destination.entry_fee_indian}` : destination.price || 'Free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer h-64"
      onClick={() => router.push(`/dashboard/heritage/${destination.id}`)}
    >
      <Image
        src={imageError ? defaultImage : (destination.main_image || destination.image || defaultImage)}
        alt={destination.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        onError={() => setImageError(true)}
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
        <p className="text-sm opacity-90 mb-2">{destination.location}</p>
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-bold text-lg">
            {displayPrice}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm">{rating.toFixed(1)}</span>
            </div>
            {destination.is_unesco && (
              <span className="text-xs bg-amber-500 px-2 py-1 rounded-full animate-pulse">UNESCO</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
              Quick View
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Popular Card Component
function PopularCard({ destination, index, isDarkMode }: any) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1590523277543-94a1e8e96b32?w=800';

  // Safely get rating - FIXED THE ERROR
  const rating = typeof destination.rating === 'number' ? destination.rating : 4.5;
  const displayPrice = destination.entry_fee_indian ? `₹${destination.entry_fee_indian}` : destination.price || 'Free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`group rounded-xl overflow-hidden cursor-pointer ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg hover:shadow-xl transition-all`}
      onClick={() => router.push(`/dashboard/heritage/${destination.id}`)}
    >
      <div className="relative h-32 w-full">
        <Image
          src={imageError ? defaultImage : (destination.main_image || destination.image || defaultImage)}
          alt={destination.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
          unoptimized
        />
        {destination.is_unesco && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
            UNESCO
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">{destination.name}</h4>
        </div>
        <p className={`text-xs mb-2 truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {destination.location}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-emerald-500 font-bold text-sm">
            {displayPrice}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          {destination.tags?.slice(0, 2).map((tag: string, i: number) => (
            <span
              key={i}
              className={`text-[8px] px-2 py-0.5 rounded-full ${
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}