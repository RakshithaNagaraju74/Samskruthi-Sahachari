// services/userService.ts - Fixed getWishlist method

import api from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UserProfile {
  id?: number;
  user_id: number;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_image?: string;
  preferred_language?: string;
  interests?: string[];
}

export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  site_id: number;
  site_name: string;
  site_location: string;
  site_image?: string;
  category: string;
  rating?: number;
  created_at: string;
  source_table?: 'heritage_site' | 'enterprise_destination';
}

export interface VisitedSite {
  id: number;
  site_id: number;
  site_name: string;
  site_location: string;
  site_image?: string;
  visit_date: string;
}

export interface ScheduledVisit {
  id: number;
  site_id: number;
  site_name: string;
  site_location: string;
  site_image?: string;
  scheduled_date: string;
  notes?: string;
  booking_reference?: string;
}

export const userService = {
  // Get user profile
  getProfile: async (): Promise<{ user: User; profile: UserProfile } | null> => {
    try {
      const response = await api.get<ApiResponse<{ user: User; profile: UserProfile }>>(
        '/user/profile'
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await api.put<ApiResponse<UserProfile>>(
        '/user/profile',
        profileData
      );
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  },

  // Add to wishlist
  addToWishlist: async (siteId: number): Promise<boolean> => {
    try {
      console.log(`Adding site ${siteId} to wishlist...`);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return false;
      }
      
      const response = await fetch(`${API_URL}/user/wishlist/${siteId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Wishlist response:', data);
      
      if (!response.ok) {
        if (data.code === 'SITE_NOT_FOUND') {
          console.error(`Site ID ${siteId} not found in database`);
          alert('This site is not available in the database. Please try another site.');
        } else if (data.code === 'ALREADY_EXISTS') {
          console.log('Site already in wishlist');
          return true; // Consider it success since it's already there
        }
        return false;
      }
      
      // Dispatch event to refresh dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-data-updated', { 
          detail: { type: 'wishlist', action: 'add', siteId } 
        }));
      }
      
      return data.success || false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (siteId: number): Promise<boolean> => {
    try {
      console.log(`Removing site ${siteId} from wishlist...`);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return false;
      }
      
      const response = await fetch(`${API_URL}/user/wishlist/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Remove from wishlist response:', data);
      
      if (!response.ok) {
        return false;
      }
      
      // Dispatch event to refresh dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-data-updated', { 
          detail: { type: 'wishlist', action: 'remove', siteId } 
        }));
      }
      
      return data.success || false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  },

  // services/userService.ts - Fixed getWishlist method

// services/userService.ts - Fixed getWishlist method

getWishlist: async (): Promise<WishlistItem[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return [];
    }
    
    console.log('Fetching wishlist from API...');
    const response = await fetch(`${API_URL}/user/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // 🔴 FIX: Handle nested data structure
    // Your backend returns: { success: true, data: { success: true, data: [...] } }
    
    // Check if data.data exists and has its own data property
    if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
      console.log(`✅ Found ${data.data.data.length} wishlist items in data.data.data`);
      return data.data.data;
    }
    
    // Check standard response { success: true, data: [...] }
    if (data && data.success && Array.isArray(data.data)) {
      console.log(`✅ Found ${data.data.length} wishlist items in data.data`);
      return data.data;
    }
    
    // Check if data.data exists and is an array
    if (data && data.data && Array.isArray(data.data)) {
      console.log(`✅ Found ${data.data.length} wishlist items in data.data`);
      return data.data;
    }
    
    // Direct array response
    if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} wishlist items (direct array)`);
      return data;
    }
    
    // Check for items property
    if (data && Array.isArray(data.items)) {
      console.log(`✅ Found ${data.items.length} wishlist items in items array`);
      return data.items;
    }
    
    // Check for results property
    if (data && Array.isArray(data.results)) {
      console.log(`✅ Found ${data.results.length} wishlist items in results array`);
      return data.results;
    }
    
    // If we get here, log the structure for debugging
    console.warn('Unexpected response structure:', {
      hasData: !!data,
      keys: data ? Object.keys(data) : [],
      dataType: data ? typeof data : 'undefined',
      isArray: Array.isArray(data),
      structure: data
    });
    
    return [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
},

  // Check if site is in wishlist
  checkWishlist: async (siteId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return false;
      }
      
      // Try the dedicated endpoint first
      try {
        const response = await fetch(`${API_URL}/user/wishlist/check/${siteId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log('Check wishlist response:', data);
        
        if (data.success) {
          return data.inWishlist;
        }
      } catch (e) {
        console.log('Check endpoint failed, falling back to getWishlist');
      }
      
      // Fallback: get all wishlist and check
      const wishlist = await userService.getWishlist();
      return wishlist.some(item => item.site_id === siteId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // Get visited sites
  getVisitedSites: async (): Promise<VisitedSite[]> => {
    try {
      const response = await api.get<ApiResponse<VisitedSite[]>>(
        '/user/visits'
      );
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching visited sites:', error);
      return [];
    }
  },

  // Get scheduled visits
  getScheduledVisits: async (): Promise<ScheduledVisit[]> => {
    try {
      const response = await api.get<ApiResponse<ScheduledVisit[]>>(
        '/user/scheduled'
      );
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching scheduled visits:', error);
      return [];
    }
  },

  // Track site view
  trackView: async (siteId: number): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(
        '/user/track-view',
        { siteId }
      );
      return response.data?.success || false;
    } catch (error) {
      console.error('Error tracking view:', error);
      return false;
    }
  }
};