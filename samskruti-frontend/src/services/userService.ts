// services/userService.ts
import api from './api';
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
  '/api/user/profile'
);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await api.put<ApiResponse<UserProfile>>(
  '/api/user/profile',
  profileData
);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    try {
      const response = await api.get<ApiResponse<WishlistItem[]>>(
  '/api/user/wishlist'
);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (siteId: number): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(
  `/api/user/wishlist/${siteId}`
);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (siteId: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<any>>(
  `/api/user/wishlist/${siteId}`
);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  },

  // Get visited sites
  getVisitedSites: async (): Promise<VisitedSite[]> => {
    try {
      const response = await api.get<ApiResponse<VisitedSite[]>>(
  '/api/user/visits'
);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching visited sites:', error);
      throw error;
    }
  },

  // Get scheduled visits
  getScheduledVisits: async (): Promise<ScheduledVisit[]> => {
    try {
      const response = await api.get<ApiResponse<ScheduledVisit[]>>(
  '/api/user/scheduled'
);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching scheduled visits:', error);
      throw error;
    }
  },

  // Track site view
  trackView: async (siteId: number): Promise<boolean> => {
    try {
     const response = await api.post<ApiResponse<any>>(
  '/api/user/track-view',
  { siteId }
);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error tracking view:', error);
      return false;
    }
  }
};