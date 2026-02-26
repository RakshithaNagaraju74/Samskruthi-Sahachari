"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { heritageService, HeritageSite } from "@/services/heritageService";
import { bookingService, Booking} from "@/services/bookingService";
import { userActivityService } from "@/services/userActivityService";
import HeritageMap from "@/components/HeritageMap";
import HeritageStats from "@/components/HeritageStats";
import NotificationCenter from "@/components/NotificationCenter";
import AIAssistant from "@/components/AIAssistant";
import { notificationService } from "@/services/notificationService";
import { groqService } from "@/services/groqService";

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
  ChevronDoubleLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>,
  ChevronDoubleRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  QrCode: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Trophy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14v4a7 7 0 11-14 0V3zm0 10h14v1a7 7 0 11-14 0v-1zm0 6h14" /></svg>,
  Compass: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v4M12 22v-4M4 12H2h2m14 0h4-4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8m0-12.8l-2.8 2.8m-7.2 7.2l-2.8 2.8" /></svg>,
  AI: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
};

// Categories for filter - UPDATED to include all categories
const categories = [
  { id: "all", name: "All", icon: "🌍", color: "from-gray-500 to-gray-600", gradient: "from-gray-400 to-gray-600" },
  { id: "heritage", name: "Heritage", icon: "🏛️", color: "from-amber-500 to-orange-500", gradient: "from-amber-400 to-orange-600" },
  { id: "nature", name: "Nature", icon: "🌄", color: "from-emerald-500 to-teal-500", gradient: "from-emerald-400 to-teal-600" },
  { id: "culture", name: "Culture", icon: "🎭", color: "from-purple-500 to-pink-500", gradient: "from-purple-400 to-pink-600" },
  { id: "fort", name: "Forts", icon: "🏰", color: "from-stone-500 to-stone-700", gradient: "from-stone-400 to-stone-800" },
  { id: "temple", name: "Temples", icon: "🛕", color: "from-amber-600 to-yellow-600", gradient: "from-amber-500 to-yellow-700" },
  { id: "unesco", name: "UNESCO", icon: "🏛️", color: "from-indigo-500 to-purple-500", gradient: "from-indigo-400 to-purple-600" },
  { id: "palace", name: "Palaces", icon: "👑", color: "from-rose-500 to-pink-500", gradient: "from-rose-400 to-pink-600" },
  { id: "beach", name: "Beaches", icon: "🏖️", color: "from-cyan-500 to-blue-500", gradient: "from-cyan-400 to-blue-600" },
  { id: "wildlife", name: "Wildlife", icon: "🐘", color: "from-green-500 to-emerald-500", gradient: "from-green-400 to-emerald-600" },
];

interface Ticket {
  id: number;
  ticket_number: string;
  booking_id: number;
  site_id: number;
  site_name: string;
  site_location: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  issued_at: string;
  expires_at: string;
  used_at?: string;
  qr_code?: string;
}

interface RecentActivity {
  id: number;
  site_id: number;
  name: string;
  location: string;
  image: string;
  type: 'visit' | 'booking' | 'review';
  date: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  target: number;
  progress: number;
  category: string;
  unlocked: boolean;
}

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop';

export default function DashboardPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, profile, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State for heritage sites
  const [heritageSites, setHeritageSites] = useState<HeritageSite[]>([]);
  const [filteredHeritageSites, setFilteredHeritageSites] = useState<HeritageSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [greeting, setGreeting] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [notifications] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapView, setMapView] = useState<"all" | "heritage" | "nature" | "culture" | "fort" | "temple" | "palace" | "beach" | "wildlife" | "unesco">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("rating");
  const [ticketFilter, setTicketFilter] = useState<"all" | "active" | "used" | "expired">("all");
  
  // User-specific data states
  const [userVisited, setUserVisited] = useState<number[]>([]);
  const [userBookedSites, setUserBookedSites] = useState<number[]>([]);
  const [userStats, setUserStats] = useState({
    totalVisits: 0,
    totalBookings: 0,
    totalReviews: 0,
    completionRate: 0,
    activeTickets: 0,
    usedTickets: 0,
    expiredTickets: 0,
    totalSites: 0,
    visitedSites: 0,
    uniqueSitesVisited: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  
  // New state for notifications and AI assistant
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'heritage-explorer-5',
      name: 'Heritage Explorer',
      icon: '🗺️',
      description: 'Visit 5 heritage sites',
      target: 5,
      progress: 0,
      category: 'heritage',
      unlocked: false
    },
    {
      id: 'history-buff-10',
      name: 'History Buff',
      icon: '📜',
      description: 'Visit 10 heritage sites',
      target: 10,
      progress: 0,
      category: 'heritage',
      unlocked: false
    },
    {
      id: 'temple-runner-5',
      name: 'Temple Runner',
      icon: '🏛️',
      description: 'Visit 5 temples',
      target: 5,
      progress: 0,
      category: 'temple',
      unlocked: false
    },
    {
      id: 'fort-explorer-5',
      name: 'Fort Explorer',
      icon: '🏰',
      description: 'Visit 5 forts',
      target: 5,
      progress: 0,
      category: 'fort',
      unlocked: false
    },
    {
      id: 'unesco-hunter-3',
      name: 'UNESCO Hunter',
      icon: '🌟',
      description: 'Visit 3 UNESCO sites',
      target: 3,
      progress: 0,
      category: 'unesco',
      unlocked: false
    },
    {
      id: 'adventure-seeker-5',
      name: 'Adventure Seeker',
      icon: '🧗',
      description: 'Visit 5 nature/adventure sites',
      target: 5,
      progress: 0,
      category: 'nature',
      unlocked: false
    },
    {
      id: 'beach-lover-3',
      name: 'Beach Lover',
      icon: '🏖️',
      description: 'Visit 3 beaches',
      target: 3,
      progress: 0,
      category: 'beach',
      unlocked: false
    },
    {
      id: 'wildlife-enthusiast-3',
      name: 'Wildlife Enthusiast',
      icon: '🐘',
      description: 'Visit 3 wildlife sanctuaries',
      target: 3,
      progress: 0,
      category: 'wildlife',
      unlocked: false
    },
    {
      id: 'heritage-master-20',
      name: 'Heritage Master',
      icon: '👑',
      description: 'Visit 20 heritage sites',
      target: 20,
      progress: 0,
      category: 'heritage',
      unlocked: false
    }
  ]);

  // ============= Helper Functions =============
  const getUserIdFromToken = useCallback((): number | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return null;
      }
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      console.log('🔑 Decoded token payload:', payload);
      
      const userId = payload.id || payload.userId || payload.sub;
      console.log('🆔 User ID from token:', userId);
      
      return userId ? Number(userId) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Function to update AI assistant with latest data
  const updateAIAssistantData = useCallback(async () => {
    try {
      // Update site data
      groqService.updateSiteData(heritageSites);
      
      // Update tickets data
      groqService.updateTicketsData(userTickets);
      
      // Fetch and update favorites data
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          const response = await api.get('/user/wishlist');
          // Handle different response structures safely
          if (response.data && typeof response.data === 'object') {
            const responseData = response.data as any;
            if (responseData.success && responseData.data) {
              groqService.updateFavoritesData(responseData.data);
            } else if (Array.isArray(responseData)) {
              groqService.updateFavoritesData(responseData);
            } else if (responseData.data && Array.isArray(responseData.data)) {
              groqService.updateFavoritesData(responseData.data);
            }
          }
        } catch (error) {
          console.error('Error fetching favorites for AI:', error);
        }
      }
    } catch (error) {
      console.error('Error updating AI assistant data:', error);
    }
  }, [heritageSites, userTickets, getUserIdFromToken]);

  // Store heritage sites in a ref to avoid dependency issues
  const heritageSitesRef = useRef<HeritageSite[]>([]);
  
  useEffect(() => {
    heritageSitesRef.current = heritageSites;
    console.log('🔄 Heritage sites ref updated with', heritageSites.length, 'sites');
    console.log('📋 All categories:', heritageSites.map(s => ({ name: s.name, category: s.category })));
  }, [heritageSites]);
  // Filter and sort heritage sites
useEffect(() => {
  if (!heritageSites.length) {
    setFilteredHeritageSites([]);
    return;
  }
  
  console.log('🔍 ===== FILTERING =====');
  console.log('🔍 Total sites before filter:', heritageSites.length);
  console.log('🔍 Site 62 present before filter:', heritageSites.some(s => s.id === 62) ? 'YES ✅' : 'NO ❌');
  console.log('🔍 Current filters:', { searchQuery, selectedCategory, mapView, sortBy });
  
  let filtered = [...heritageSites];
  
  // Search filter
  if (searchQuery && searchQuery.trim() !== '') {
    filtered = filtered.filter(site => 
      site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.district && site.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (site.tags && site.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    console.log('🔍 After search filter:', filtered.length);
  }
  
  // Category filter
  if (selectedCategory !== "all") {
    filtered = filtered.filter(site => 
      site.category && site.category.toLowerCase() === selectedCategory.toLowerCase()
    );
    console.log('🔍 After category filter:', filtered.length);
  }

  // Map view filter
  if (mapView !== "all") {
    filtered = filtered.filter(site => 
      site.category && site.category.toLowerCase() === mapView.toLowerCase()
    );
    console.log('🔍 After map view filter:', filtered.length);
  }

  // Check if site 62 survived the filters
  const site62AfterFilter = filtered.find(s => s.id === 62);
  console.log('🔍 Site 62 after filters:', site62AfterFilter ? 'YES ✅' : 'NO ❌');
  
  if (!site62AfterFilter && heritageSites.some(s => s.id === 62)) {
    console.log('🔍 Site 62 was FILTERED OUT!');
    const site62 = heritageSites.find(s => s.id === 62);
    if (site62) {
      console.log('   - site.category:', site62.category);
      console.log('   - selectedCategory:', selectedCategory);
      console.log('   - mapView:', mapView);
      console.log('   - matches category?', site62.category?.toLowerCase() === selectedCategory.toLowerCase());
      console.log('   - matches mapView?', site62.category?.toLowerCase() === mapView.toLowerCase());
    }
  }

  // Sort
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
  console.log('🔍 Final filtered count:', filtered.length);
}, [searchQuery, selectedCategory, mapView, sortBy, heritageSites]);
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      console.log('No user found, redirecting to login...');
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    };
    
    fetchUnreadCount();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('notification-updated', handleNotificationUpdate);
    return () => window.removeEventListener('notification-updated', handleNotificationUpdate);
  }, []);

  // Calculate achievements based on visited sites
  const updateAchievements = useCallback((visitedSiteIds: number[], sites: HeritageSite[]) => {
    if (!sites.length) return;

    const visitedCount = visitedSiteIds.length;
    const visitedSitesData = sites.filter(site => visitedSiteIds.includes(site.id));
    
    // Count by category
    const heritageVisited = visitedSitesData.filter(site => site.category === 'heritage').length;
    const templeVisited = visitedSitesData.filter(site => site.category === 'temple').length;
    const fortVisited = visitedSitesData.filter(site => site.category === 'fort').length;
    const unescoVisited = visitedSitesData.filter(site => site.is_unesco).length;
    const natureVisited = visitedSitesData.filter(site => site.category === 'nature').length;
    const beachVisited = visitedSitesData.filter(site => site.category === 'beach').length;
    const wildlifeVisited = visitedSitesData.filter(site => site.category === 'wildlife').length;

    setAchievements(prev => prev.map(achievement => {
      let progress = 0;
      
      switch(achievement.id) {
        case 'heritage-explorer-5':
        case 'history-buff-10':
          progress = heritageVisited;
          break;
        case 'temple-runner-5':
          progress = templeVisited;
          break;
        case 'fort-explorer-5':
          progress = fortVisited;
          break;
        case 'unesco-hunter-3':
          progress = unescoVisited;
          break;
        case 'adventure-seeker-5':
          progress = natureVisited;
          break;
        case 'beach-lover-3':
          progress = beachVisited;
          break;
        case 'wildlife-enthusiast-3':
          progress = wildlifeVisited;
          break;
        case 'heritage-master-20':
          progress = visitedCount;
          break;
        default:
          progress = visitedCount;
      }
      
      return {
        ...achievement,
        progress,
        unlocked: progress >= achievement.target
      };
    }));
  }, []);

  // ============= Fetch heritage sites (PUBLIC DATA - loads immediately) =============
  const fetchHeritageSites = useCallback(async () => {
  console.log('📋 ========== STARTING HERITAGE SITES FETCH ==========');
  setIsLoading(true);
  setApiError(null);
  
  try {
    console.log('📋 Calling heritageService.getAllSites()...');
    const sites = await heritageService.getAllSites();
    
    console.log('📋 heritageService.getAllSites() returned:', sites?.length || 0, 'sites');
    
    // DEBUG: Log ALL sites with their IDs
    console.log('📋 ALL SITE IDs:', sites.map(s => s.id).sort((a, b) => a - b));
    
    // Specifically check for site 62
    const site62 = sites.find(s => s.id === 62);
    console.log('🔍 Site 62 found?', site62 ? 'YES ✅' : 'NO ❌');
    
    if (site62) {
      console.log('📋 Site 62 details:', {
        id: site62.id,
        name: site62.name,
        category: site62.category,
        is_active: site62.is_active,
        enterprise_id: site62.enterprise_id
      });
    }
    
    if (sites && sites.length > 0) {
      console.log(`✅ SUCCESS: Loaded ${sites.length} heritage sites`);
      
      // Store raw sites
      setHeritageSites(sites);
      setFilteredHeritageSites(sites);
      
      // Update userStats with total sites
      setUserStats(prev => ({
        ...prev,
        totalSites: sites.length
      }));
      
      // Update AI assistant with new site data
      groqService.updateSiteData(sites);
      
      return sites;
    } else {
      console.log('⚠️ No heritage sites found - API returned empty array');
      setHeritageSites([]);
      setFilteredHeritageSites([]);
      return [];
    }
  } catch (error) {
    console.error('❌ ERROR fetching heritage sites:', error);
    setApiError('Failed to load heritage sites. Please try again.');
    setHeritageSites([]);
    setFilteredHeritageSites([]);
    return [];
  } finally {
    setIsLoading(false);
    console.log('📋 ========== HERITAGE SITES FETCH COMPLETE ==========');
  }
}, []);

  // Fetch user data (PRIVATE DATA - requires authentication)
  const refreshUserData = useCallback(async (showLoading = true) => {
    console.log('🔍 DEBUG - Starting refreshUserData');
    
    if (showLoading) setIsLoadingUserData(true);
    setApiError(null);
    
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.log('⚠️ No user ID available for user data fetch');
        return;
      }
      
      // Fetch tickets
      let tickets: Ticket[] = [];
      if (userId) {
        try {
          console.log('📋 Fetching tickets...');
          const ticketsResponse = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}?history=true`);
          console.log('Tickets response:', ticketsResponse.data);
          tickets = ticketsResponse.data?.data || [];
          console.log(`✅ Fetched ${tickets.length} tickets`);
        } catch (error: any) {
          console.error('Error fetching tickets:', error?.response?.data || error.message);
        }
      }
      setUserTickets(tickets);
      
      // Fetch bookings
      let bookings: Booking[] = [];
      try {
        console.log('📅 Fetching bookings...');
        const bookingsResponse = await api.get<ApiResponse<Booking[]>>('/bookings/user');
        console.log('Bookings response:', bookingsResponse.data);
        bookings = bookingsResponse.data?.data || [];
        console.log(`✅ Fetched ${bookings.length} bookings`);
      } catch (error: any) {
        console.error('Error fetching bookings:', error?.response?.data || error.message);
      }
      
      // Calculate ticket stats
      const activeTicketsCount = tickets.filter(t => t.status === 'active').length;
      const usedTicketsCount = tickets.filter(t => t.status === 'used').length;
      const expiredTicketsCount = tickets.filter(t => t.status === 'expired').length;
      
      // Get unique visited sites from used tickets
      const visitedSiteIds = [
        ...new Set(
          tickets
            .filter(t => t.status === 'used')
            .map(t => t.site_id)
        )
      ];
      setUserVisited(visitedSiteIds);
      
      // Get booked site IDs
      const bookedSiteIds = [
        ...new Set([
          ...tickets.map(t => t.site_id),
          ...bookings.map(b => b.site_id)
        ])
      ];
      setUserBookedSites(bookedSiteIds);
      
      // Calculate completion rate
      const totalSites = heritageSitesRef.current.length || 60;
      const uniqueVisitedCount = visitedSiteIds.length;
      const completionRate = totalSites > 0 ? Math.round((uniqueVisitedCount / totalSites) * 100) : 0;
      
      // ============= UPDATE HERITAGE SITES WITH BOOKED STATUS =============
      console.log('🔄 Checking heritage sites ref for update...');
      console.log('🔄 heritageSitesRef.current.length:', heritageSitesRef.current?.length || 0);
      
      if (heritageSitesRef.current && heritageSitesRef.current.length > 0) {
        console.log('🔄 Updating', heritageSitesRef.current.length, 'heritage sites with visited/booked status...');
        const updatedSites = heritageSitesRef.current.map(site => ({
          ...site,
          booked: bookedSiteIds.includes(site.id),
          visited: visitedSiteIds.includes(site.id)
        }));
        console.log('🔄 Setting updated sites with visited/booked status');
        setHeritageSites(updatedSites);
        setFilteredHeritageSites(updatedSites);
        
        // Update AI assistant with updated site data
        groqService.updateSiteData(updatedSites);
        
        // Update achievements based on visited sites
        updateAchievements(visitedSiteIds, updatedSites);
      } else {
        console.log('⚠️ No heritage sites to update yet - they will be updated when loaded');
      }
      
      // Update AI assistant with tickets data
      groqService.updateTicketsData(tickets);
      
      // Fetch and update favorites for AI
      try {
        const favResponse = await api.get('/user/wishlist');
        // Handle response safely
        if (favResponse.data && typeof favResponse.data === 'object') {
          const responseData = favResponse.data as any;
          if (responseData.success && responseData.data) {
            groqService.updateFavoritesData(responseData.data);
          } else if (Array.isArray(responseData)) {
            groqService.updateFavoritesData(responseData);
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
      
      // Create recent activity
      const activity: RecentActivity[] = [];
      
      // Add used tickets as visits
      tickets.filter(t => t.status === 'used' && t.used_at).forEach(t => {
        activity.push({
          id: t.id,
          site_id: t.site_id,
          name: t.site_name || 'Heritage Site',
          location: t.site_location || 'Karnataka',
          image: '',
          type: 'visit',
          date: t.used_at || t.issued_at
        });
      });
      
      // Add bookings
      bookings.slice(0, 3).forEach(b => {
        activity.push({
          id: b.id,
          site_id: b.site_id,
          name: b.site_name || 'Heritage Site',
          location: b.site_location || 'Karnataka',
          image: '',
          type: 'booking',
          date: b.created_at
        });
      });
      
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activity.slice(0, 5));
      
      setUserStats({
        totalVisits: usedTicketsCount,
        totalBookings: bookings.length,
        totalReviews: 0,
        completionRate: completionRate,
        activeTickets: activeTicketsCount,
        usedTickets: usedTicketsCount,
        expiredTickets: expiredTicketsCount,
        totalSites: totalSites,
        visitedSites: uniqueVisitedCount,
        uniqueSitesVisited: uniqueVisitedCount
      });
      
      setDataVersion(prev => prev + 1);
      
      console.log('✅ FINAL USER DATA ==================');
      console.log('Stats:', {
        totalVisits: usedTicketsCount,
        totalBookings: bookings.length,
        activeTickets: activeTicketsCount,
        usedTickets: usedTicketsCount,
        expiredTickets: expiredTicketsCount,
        uniqueVisitedSites: uniqueVisitedCount,
        completionRate: completionRate + '%'
      });
      console.log('Bookings count:', bookings.length);
      console.log('Tickets count:', tickets.length);
      console.log('Active tickets:', activeTicketsCount);
      console.log('Used tickets:', usedTicketsCount);
      console.log('Expired tickets:', expiredTicketsCount);
      console.log('Unique visited sites:', uniqueVisitedCount);
      console.log('User booked sites:', bookedSiteIds);
      console.log('Recent activity:', activity.length);
      console.log('=====================================');
      
    } catch (error: any) {
      console.error('❌ Error in refreshUserData:', error);
      setApiError('Failed to load user data');
    } finally {
      if (showLoading) setIsLoadingUserData(false);
    }
  }, [getUserIdFromToken, updateAchievements]);

  // ============= CRITICAL FIX: Separate concerns =============
  
  // 1️⃣ Fetch heritage sites IMMEDIATELY on mount (PUBLIC DATA)
  useEffect(() => {
    console.log('🔥 Fetching heritage sites independently (public data)...');
    fetchHeritageSites();
  }, [fetchHeritageSites]);

  // 2️⃣ Fetch user data separately when token is available (PRIVATE DATA)
  useEffect(() => {
    if (isUserLoading) {
      console.log('⏳ Waiting for user context to load...');
      return;
    }
    
    const userId = getUserIdFromToken();
    if (!userId) {
      console.log('⏳ No user ID from token yet...');
      return;
    }

    console.log('🔥 Fetching user data with userId:', userId);
    
    // Small delay to ensure heritage sites might have loaded
    setTimeout(() => {
      refreshUserData(true);
    }, 500);

  }, [isUserLoading, getUserIdFromToken, refreshUserData]);

  // Debug effect to monitor heritageSites changes
  useEffect(() => {
    console.log('📊 heritageSites state changed - current count:', heritageSites.length);
    if (heritageSites.length > 0) {
      console.log('📊 First site:', heritageSites[0]?.name);
      console.log('📊 All categories:', heritageSites.map(s => ({ id: s.id, name: s.name, category: s.category })));
    }
  }, [heritageSites]);

  // Filter and sort heritage sites - UPDATED to include all categories
  useEffect(() => {
    if (!heritageSites.length) {
      setFilteredHeritageSites([]);
      return;
    }
    
    let filtered = [...heritageSites];
    
    // Search filter
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(site => 
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.district && site.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (site.tags && site.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(site => 
        site.category && site.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Map view filter - UPDATED to include all categories
    if (mapView !== "all") {
      filtered = filtered.filter(site => 
        site.category && site.category.toLowerCase() === mapView.toLowerCase()
      );
    }

    // Sort
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
    console.log('🔍 Filtered sites count:', filtered.length, 'for mapView:', mapView, 'selectedCategory:', selectedCategory);
  }, [searchQuery, selectedCategory, mapView, sortBy, heritageSites]);

  // Listen for custom events
  useEffect(() => {
    const handleDataUpdate = (e: CustomEvent) => {
      console.log('Data update event detected:', e.detail);
      const userId = getUserIdFromToken();
      if (userId) {
        refreshUserData(true);
      }
    };

    window.addEventListener('booking-updated', handleDataUpdate as EventListener);
    window.addEventListener('ticket-updated', handleDataUpdate as EventListener);
    window.addEventListener('user-data-updated', handleDataUpdate as EventListener);
    window.addEventListener('refresh-dashboard', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('booking-updated', handleDataUpdate as EventListener);
      window.removeEventListener('ticket-updated', handleDataUpdate as EventListener);
      window.removeEventListener('user-data-updated', handleDataUpdate as EventListener);
      window.removeEventListener('refresh-dashboard', handleDataUpdate as EventListener);
    };
  }, [getUserIdFromToken, refreshUserData]);

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

  // UPDATED handleMapViewChange to include all categories
  const handleMapViewChange = (view: "all" | "heritage" | "nature" | "culture" | "fort" | "temple" | "palace" | "beach" | "wildlife" | "unesco") => {
    setMapView(view);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTicket = (ticketId: number) => {
    router.push(`/dashboard/tickets/${ticketId}`);
  };

  const handleDownloadTicket = (ticket: Ticket) => {
    console.log('Downloading ticket:', ticket.ticket_number);
    alert(`Download ticket: ${ticket.ticket_number}`);
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard, path: "/dashboard" },
    { id: "my-tickets", label: "My Tickets", icon: Icons.Tickets, badge: userStats.activeTickets, path: "/dashboard/tickets" },
    { id: "favourites", label: "Favourites", icon: Icons.Favorites, path: "/dashboard/favourites" },
    { id: "messages", label: "Messages", icon: Icons.Message, badge: 3, path: "/dashboard/messages" }
  ];

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Traveler';

  const filteredTickets = userTickets.filter(ticket => {
    if (ticketFilter === "all") return true;
    return ticket.status === ticketFilter;
  });

  if (isUserLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-6 text-emerald-500 font-medium animate-pulse">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate achievement progress percentage
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  // Calculate booking rate
  const bookingRate = userStats.totalSites > 0 ? Math.round((userStats.totalBookings / userStats.totalSites) * 100) : 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>
      
      {/* Manual Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          const userId = getUserIdFromToken();
          if (userId) {
            refreshUserData(true);
          } else {
            fetchHeritageSites();
          }
        }}
        className={`fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-lg ${
          isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
        }`}
        title="Refresh Data"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </motion.button>

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

      {/* Left Sidebar - Collapsible */}
      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`fixed left-0 top-0 h-screen border-r backdrop-blur-xl z-30 ${
          isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
        } ${isLeftSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Toggle Button */}
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className={`absolute -right-3 top-20 z-40 p-1.5 rounded-full ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } shadow-lg hover:scale-110 transition-transform`}
          >
            {isLeftSidebarCollapsed ? <Icons.ChevronDoubleRight /> : <Icons.ChevronDoubleLeft />}
          </button>

          <Link href="/dashboard" className={`flex items-center ${isLeftSidebarCollapsed ? 'justify-center' : 'gap-3'} mb-8 group`}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
            >
              KS
            </motion.div>
            {!isLeftSidebarCollapsed && (
              <div>
                <h1 className="text-xl font-light tracking-wider group-hover:text-emerald-400 transition-colors">
                  Karnataka
                </h1>
                <p className="text-[8px] tracking-[0.3em] uppercase text-emerald-400/70">
                  Heritage Explorer
                </p>
              </div>
            )}
          </Link>

          <nav className="space-y-1 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = (item.path === '/dashboard' && pathname === '/dashboard') ||
                              (item.path && pathname === item.path) ||
                              (!item.path && activeTab === item.id);
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: isLeftSidebarCollapsed ? 0 : 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (item.path) {
                      router.push(item.path);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center ${isLeftSidebarCollapsed ? 'justify-center' : 'justify-between'} px-${isLeftSidebarCollapsed ? '2' : '4'} py-3 rounded-xl text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                  }`}
                  title={isLeftSidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isLeftSidebarCollapsed ? '' : 'gap-3'}`}>
                    <Icon />
                    {!isLeftSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isLeftSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <motion.span 
                      key={`${item.id}-${item.badge}-${dataVersion}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {!isLeftSidebarCollapsed && (
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
          )}

          <div className={`flex items-center ${isLeftSidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl ${
            isDarkMode ? "bg-gray-800/50" : "bg-white/50"
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isLeftSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.full_name || displayName}</p>
                  <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {user?.email}
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  <Icons.Logout />
                </motion.button>
              </>
            )}
            {isLeftSidebarCollapsed && (
              <motion.button
                whileHover={{ rotate: 180 }}
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
                title="Logout"
              >
                <Icons.Logout />
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isRightSidebarOpen ? "mr-80" : "mr-0"
      } ${isLeftSidebarCollapsed ? "ml-20" : "ml-64"} p-6`}>
        <div className="max-w-7xl mx-auto">
          
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
              {activeTab === "dashboard" && (
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
              )}

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

              {/* AI Assistant Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? "bg-purple-600 hover:bg-purple-500 text-white" 
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
                title="AI Assistant"
              >
                <Icons.AI />
              </motion.button>

              {/* Notification Bell with Unread Count */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                <Icons.Bell />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => router.push('/dashboard/profile')}
                className={`w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </motion.button>

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

          {apiError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key={`dashboard-${dataVersion}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
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
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Sites Visited</p>
                        <motion.p 
                          key={`visits-${userStats.uniqueSitesVisited}-${dataVersion}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-emerald-500"
                        >
                          {userStats.uniqueSitesVisited}
                        </motion.p>
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
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Bookings</p>
                        <motion.p 
                          key={`bookings-${userStats.totalBookings}-${dataVersion}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-blue-500"
                        >
                          {userStats.totalBookings}
                        </motion.p>
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
                        <Icons.QrCode />
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Used Tickets</p>
                        <motion.p 
                          key={`used-${userStats.usedTickets}-${dataVersion}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-purple-500"
                        >
                          {userStats.usedTickets}
                        </motion.p>
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
                        <Icons.Calendar />
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Active Tickets</p>
                        <motion.p 
                          key={`active-${userStats.activeTickets}-${dataVersion}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-orange-500"
                        >
                          {userStats.activeTickets}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {userTickets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-light flex items-center gap-2">
                        <span>🎟️</span> Recent Tickets
                      </h2>
                      <button
                        onClick={() => router.push('/dashboard/tickets')}
                        className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                      >
                        View All
                        <span>→</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTickets.slice(0, 2).map((ticket) => (
                        <motion.div
                          key={`recent-ticket-${ticket.id}`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(`/dashboard/tickets/${ticket.ticket_number}`)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-gray-500">{ticket.ticket_number}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              ticket.status === 'active' ? 'bg-green-500/20 text-green-500' :
                              ticket.status === 'used' ? 'bg-blue-500/20 text-blue-500' :
                              ticket.status === 'expired' ? 'bg-gray-500/20 text-gray-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <h3 className="font-medium mb-1">{ticket.site_name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{ticket.site_location}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>Valid until: {new Date(ticket.expires_at).toLocaleDateString()}</span>
                            <Icons.QrCode />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

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
                      onChange={(e) => setSortBy(e.target.value as "name" | "price" | "rating")}
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

                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-light flex items-center gap-2">
                      <span>🗺️</span> Karnataka Heritage Map 
                      <span className="text-sm bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        {filteredHeritageSites.length} sites
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      {["all", "heritage", "nature", "culture", "fort", "temple", "palace", "beach", "wildlife", "unesco"].map((view) => (
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
                      coordinates: { 
                        lat: site.latitude || 12.9716,
                        lng: site.longitude || 77.5946 
                      },
                      image: site.main_image || PLACEHOLDER_IMAGE,
                      price: site.entry_fee_indian ? `₹${site.entry_fee_indian}` : 'Free',
                      visited: site.visited || false,
                      booked: site.booked || false
                    }))}
                    userVisited={userVisited}
                    userBooked={userBookedSites}
                    onSiteClick={handleSiteClick}
                  />
                </section>

                <section className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-light flex items-center gap-2">
                      <span>🔥</span> All Heritage Sites ({filteredHeritageSites.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredHeritageSites.map((site) => (
                      <PopularCard
                        key={`site-${site.id}`}
                        destination={site}
                        isDarkMode={isDarkMode}
                        onClick={() => handleSiteClick(site.id)}
                      />
                    ))}
                  </div>
                  
                  {filteredHeritageSites.length === 0 && !isLoading && (
                    <div className={`text-center py-12 rounded-xl ${
                      isDarkMode ? "bg-gray-800/50" : "bg-white"
                    }`}>
                      <div className="text-6xl mb-4">🏛️</div>
                      <h3 className="text-xl font-medium mb-2">No heritage sites found</h3>
                      <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Try adjusting your search or filter
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setMapView("all");
                        }}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        Clear Filters
                      </button>
                      <button
  onClick={async () => {
    const response = await fetch('http://localhost:5000/api/heritage/sites');
    const data = await response.json();
    console.log('📡 DIRECT API CALL:', data);
    alert(`API returned ${data.data?.length || 0} sites. Check console for details.`);
  }}
  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
>
  Debug API
</button>
                    </div>
                  )}
                </section>

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
                      .filter(site => site.is_unesco === true)
                      .slice(0, 3)
                      .map((site) => (
                        <FeaturedCard 
                          key={`unesco-${site.id}`}
                          destination={site}
                          isDarkMode={isDarkMode}
                          onClick={() => handleSiteClick(site.id)}
                        />
                      ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "my-tickets" && (
              <motion.div
                key={`tickets-${dataVersion}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tickets content (unchanged) */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-light flex items-center gap-2">
                      <span>🎟️</span> My Tickets
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTicketFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          ticketFilter === "all"
                            ? "bg-emerald-500 text-white"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All ({userTickets.length})
                      </button>
                      <button
                        onClick={() => setTicketFilter("active")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          ticketFilter === "active"
                            ? "bg-green-500 text-white"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Active ({userTickets.filter(t => t.status === 'active').length})
                      </button>
                      <button
                        onClick={() => setTicketFilter("used")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          ticketFilter === "used"
                            ? "bg-blue-500 text-white"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Used ({userTickets.filter(t => t.status === 'used').length})
                      </button>
                      <button
                        onClick={() => setTicketFilter("expired")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          ticketFilter === "expired"
                            ? "bg-gray-500 text-white"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Expired ({userTickets.filter(t => t.status === 'expired').length})
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg`}>
                      <p className="text-sm text-gray-500 mb-1">Total Tickets</p>
                      <motion.p 
                        key={`total-${userTickets.length}-${dataVersion}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-emerald-500"
                      >
                        {userTickets.length}
                      </motion.p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg`}>
                      <p className="text-sm text-gray-500 mb-1">Active</p>
                      <motion.p 
                        key={`active-${userTickets.filter(t => t.status === 'active').length}-${dataVersion}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-green-500"
                      >
                        {userTickets.filter(t => t.status === 'active').length}
                      </motion.p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg`}>
                      <p className="text-sm text-gray-500 mb-1">Used</p>
                      <motion.p 
                        key={`used-${userTickets.filter(t => t.status === 'used').length}-${dataVersion}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-blue-500"
                      >
                        {userTickets.filter(t => t.status === 'used').length}
                      </motion.p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg`}>
                      <p className="text-sm text-gray-500 mb-1">Expired</p>
                      <motion.p 
                        key={`expired-${userTickets.filter(t => t.status === 'expired').length}-${dataVersion}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-gray-500"
                      >
                        {userTickets.filter(t => t.status === 'expired').length}
                      </motion.p>
                    </div>
                  </div>
                </div>

                {filteredTickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTickets.map((ticket) => (
                      <motion.div
                        key={`ticket-${ticket.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:shadow-xl"
                        }`}
                        onClick={() => handleViewTicket(ticket.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icons.QrCode />
                            <span className="font-mono text-xs text-gray-500">{ticket.ticket_number}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.status === 'active' ? 'bg-green-500/20 text-green-500' :
                            ticket.status === 'used' ? 'bg-blue-500/20 text-blue-500' :
                            ticket.status === 'expired' ? 'bg-gray-500/20 text-gray-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        
                        <h3 className="font-medium mb-1">{ticket.site_name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{ticket.site_location}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Issued:</span>
                            <span>{new Date(ticket.issued_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Valid until:</span>
                            <span className={new Date(ticket.expires_at) < new Date() ? 'text-red-500' : 'text-green-500'}>
                              {new Date(ticket.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                          {ticket.used_at && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Used on:</span>
                              <span>{new Date(ticket.used_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadTicket(ticket);
                            }}
                            className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <Icons.Download />
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTicket(ticket.id);
                            }}
                            className="px-3 py-2 bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-500/30 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 rounded-xl ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white"
                  }`}>
                    <div className="text-6xl mb-4">🎟️</div>
                    <h3 className="text-xl font-medium mb-2">No tickets found</h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {ticketFilter === "all" 
                        ? "You haven't booked any tickets yet" 
                        : `You don't have any ${ticketFilter} tickets`}
                    </p>
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      Explore Heritage Sites
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Right Sidebar - Collapsible with toggle button */}
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
            {/* Right Sidebar Toggle Button */}
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className={`absolute -left-3 top-20 z-40 p-1.5 rounded-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } shadow-lg hover:scale-110 transition-transform`}
            >
              <Icons.ChevronRight />
            </button>

            <div className="p-6">
              {/* Your Heritage Journey Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Icons.Compass />
                  Your Heritage Journey
                </h3>
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white"
                } shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium text-emerald-500">{userStats.uniqueSitesVisited}/{userStats.totalSites} sites</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${userStats.completionRate}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You've explored {userStats.completionRate}% of all heritage sites
                  </p>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Icons.Trophy />
                  Your Achievements
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    {unlockedAchievements}/{totalAchievements}
                  </span>
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-xl ${
                        achievement.unlocked
                          ? isDarkMode
                            ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
                            : "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
                          : isDarkMode
                            ? "bg-gray-800/50 opacity-70"
                            : "bg-white opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium">{achievement.name}</h4>
                            {achievement.unlocked && (
                              <span className="text-amber-500 text-xs">✓ Unlocked</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress: {achievement.progress}/{achievement.target}</span>
                            <span>{Math.min(100, Math.round((achievement.progress / achievement.target) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                              transition={{ duration: 1 }}
                              className={`h-full ${
                                achievement.unlocked
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Icons.TrendingUp />
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-gray-800/50" : "bg-white"
                    } shadow-lg`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-emerald-500">{userStats.completionRate}%</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-gray-800/50" : "bg-white"
                    } shadow-lg`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Booking Rate</p>
                    <p className="text-2xl font-bold text-blue-500">{bookingRate}%</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-gray-800/50" : "bg-white"
                    } shadow-lg`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Left to Explore</p>
                    <p className="text-2xl font-bold text-purple-500">{userStats.totalSites - userStats.uniqueSitesVisited}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-gray-800/50" : "bg-white"
                    } shadow-lg`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Engagement</p>
                    <p className="text-2xl font-bold text-orange-500">{userStats.usedTickets > 0 ? Math.min(100, Math.round((userStats.usedTickets / userStats.totalBookings) * 100)) : 0}%</p>
                  </motion.div>
                </div>
              </div>

              {userTickets.filter(t => t.status === 'active').length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <span>🎟️</span> Active Tickets
                    <motion.span 
                      key={`active-badge-${userTickets.filter(t => t.status === 'active').length}-${dataVersion}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {userTickets.filter(t => t.status === 'active').length}
                    </motion.span>
                  </h3>
                  <div className="space-y-2">
                    {userTickets.filter(t => t.status === 'active').slice(0, 3).map((ticket) => (
                      <motion.div
                        key={`active-${ticket.id}`}
                        whileHover={{ x: 5 }}
                        className={`p-3 rounded-xl cursor-pointer ${
                          isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:shadow-md"
                        } transition-all`}
                        onClick={() => router.push(`/dashboard/tickets/${ticket.ticket_number}`)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">{ticket.site_name}</h4>
                          <span className="text-xs text-green-500">Active</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">#{ticket.ticket_number.slice(-8)}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Valid until:</span>
                          <span>{new Date(ticket.expires_at).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

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

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>📋</span> Recent Activity
                </h3>
                <div className="space-y-3">
                  {isLoadingUserData ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <motion.div
                        key={`activity-${activity.id}-${dataVersion}`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`flex gap-3 p-2 rounded-xl cursor-pointer ${
                          isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white shadow-sm hover:shadow-md"
                        } transition-all`}
                        onClick={() => handleSiteClick(activity.site_id)}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={activity.image || PLACEHOLDER_IMAGE}
                            alt={activity.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{activity.name}</h4>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {activity.location}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs ${
                              activity.type === 'visit' ? 'text-green-500' : 
                              activity.type === 'booking' ? 'text-blue-500' : 'text-purple-500'
                            }`}>
                              {activity.type === 'visit' ? '✓' : 
                               activity.type === 'booking' ? '🎟️' : '✍️'}
                            </span>
                            <span className={`text-xs ${
                              activity.type === 'visit' ? 'text-green-500' : 
                              activity.type === 'booking' ? 'text-blue-500' : 'text-purple-500'
                            }`}>
                              {activity.type === 'visit' ? 'Visited' : 
                               activity.type === 'booking' ? 'Booked' : 'Reviewed'}
                            </span>
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                              • {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`p-4 text-center rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-white"} text-sm text-gray-500`}>
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Notification Center Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="absolute right-24 top-20 z-50">
            <NotificationCenter 
              onClose={() => setShowNotifications(false)} 
              onNotificationUpdate={(count) => setUnreadCount(count)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center" onClick={() => setShowAIAssistant(false)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <AIAssistant onClose={() => setShowAIAssistant(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CardProps {
  destination: HeritageSite;
  isDarkMode: boolean;
  onClick: () => void;
}

function FeaturedCard({ destination, isDarkMode, onClick }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop';

  useEffect(() => {
    if (destination.main_image) {
      // Fix backslashes in the URL
      const fixedPath = destination.main_image.replace(/\\/g, '/');
      // Construct the full URL
      const fullUrl = `http://localhost:5000/${fixedPath}`;
      setImageSrc(fullUrl);
    } else {
      setImageSrc(PLACEHOLDER_IMAGE);
    }
  }, [destination.main_image]);

  const rating = typeof destination.rating === 'number' ? destination.rating : 4.5;
  const displayPrice = destination.entry_fee_indian ? `₹${destination.entry_fee_indian}` : 'Free';

  const handleImageError = () => {
    console.log('Image failed to load:', imageSrc);
    setImageError(true);
    setImageSrc(PLACEHOLDER_IMAGE);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer h-64"
      onClick={onClick}
    >
      <Image
        src={imageError ? PLACEHOLDER_IMAGE : imageSrc}
        alt={destination.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        onError={handleImageError}
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

function PopularCard({ destination, isDarkMode, onClick }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1590523277543-94a1e8e96b32?w=800&auto=format&fit=crop';

  useEffect(() => {
    if (destination.main_image) {
      // Fix backslashes in the URL
      const fixedPath = destination.main_image.replace(/\\/g, '/');
      // Construct the full URL
      const fullUrl = `http://localhost:5000/${fixedPath}`;
      setImageSrc(fullUrl);
    } else {
      setImageSrc(PLACEHOLDER_IMAGE);
    }
  }, [destination.main_image]);

  const rating = typeof destination.rating === 'number' ? destination.rating : 4.5;
  const displayPrice = destination.entry_fee_indian ? `₹${destination.entry_fee_indian}` : 'Free';

  const handleImageError = () => {
    console.log('Image failed to load:', imageSrc);
    setImageError(true);
    setImageSrc(PLACEHOLDER_IMAGE);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group rounded-xl overflow-hidden cursor-pointer ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg hover:shadow-xl transition-all`}
      onClick={onClick}
    >
      <div className="relative h-32 w-full">
        <Image
          src={imageError ? PLACEHOLDER_IMAGE : imageSrc}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
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
              key={`${destination.id}-tag-${i}`}
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