// services/heritageService.ts
import api from './api';

export interface HeritageSite {
  // Core fields
  id: number;
  name: string;
  description: string;
  short_description: string | null;
  location: string;
  district: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  subcategory: string | null;
  site_type: string | null;
  
  // Media
  main_image: string | null;
  gallery_images: string[] | null;
  
  // Historical info
  built_in: string | null;
  built_by: string | null;
  architectural_style: string | null;
  significance: string | null;
  
  // Pricing (numeric in database)
  entry_fee_indian: number | null;
  entry_fee_foreigner: number | null;
  
  // Timing (time without time zone in database)
  opening_time: string | null;
  closing_time: string | null;
  best_time_to_visit: string | null;
  duration_required: string | null;
  
  // Contact
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  
  // Enterprise
  enterprise_id: number | null;
  
  // Status flags (boolean in database)
  is_unesco: boolean;
  is_featured: boolean;
  is_active: boolean;
  
  // Stats (numeric in database)
  rating: number | null;
  total_reviews: number;
  views: number;
  
  // Arrays
  tags: string[];
  highlights: string[];
  pickup_points: string[];   // NEW FIELD: pickup points for booking
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // UI state fields (added by frontend - make them optional)
  visited?: boolean;
  booked?: boolean;
  wishlisted?: boolean;
  
  // Computed fields (added by frontend)
  display_price?: string;
  opening_time_formatted?: string;
  closing_time_formatted?: string;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_image?: string;
  rating: number;
  title?: string;
  comment: string;
  visit_date?: string;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

// NEW: Product interface for site‑associated products
export interface SiteProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  thumbnail: string | null;
  seller_shop_name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

// Helper function to format price
function formatPrice(price?: number | null): string {
  if (!price || price <= 0) return 'Free';
  return `₹${price}`;
}

// Helper function to format time
function formatTime(time?: string | null): string {
  if (!time) return '';
  try {
    // Handle PostgreSQL time format (HH:MM:SS)
    const parts = time.split(':');
    if (parts.length < 2) return time;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

// Helper function to normalize site data from database
function normalizeSiteData(site: any): HeritageSite {
  return {
    id: site.id,
    name: site.name || 'Unnamed Site',
    description: site.description || 'No description available',
    short_description: site.short_description || null,
    location: site.location || 'Karnataka',
    district: site.district || null,
    state: site.state || 'Karnataka',
    latitude: site.latitude ? Number(site.latitude) : null,
    longitude: site.longitude ? Number(site.longitude) : null,
    category: site.category || null,
    subcategory: site.subcategory || null,
    site_type: site.site_type || null,
    
    // Media
    main_image: site.main_image || null,
    gallery_images: site.gallery_images || [],
    
    // Historical info
    built_in: site.built_in || null,
    built_by: site.built_by || null,
    architectural_style: site.architectural_style || null,
    significance: site.significance || null,
    
    // Pricing
    entry_fee_indian: site.entry_fee_indian ? Number(site.entry_fee_indian) : null,
    entry_fee_foreigner: site.entry_fee_foreigner ? Number(site.entry_fee_foreigner) : null,
    
    // Timing
    opening_time: site.opening_time || null,
    closing_time: site.closing_time || null,
    best_time_to_visit: site.best_time_to_visit || null,
    duration_required: site.duration_required || null,
    
    // Contact
    contact_phone: site.contact_phone || null,
    contact_email: site.contact_email || null,
    website: site.website || null,
    
    // Enterprise
    enterprise_id: site.enterprise_id || null,
    
    // Status flags
    is_unesco: site.is_unesco || false,
    is_featured: site.is_featured || false,
    is_active: site.is_active !== false,
    
    // Stats
    rating: site.rating ? Number(site.rating) : null,
    total_reviews: site.total_reviews || 0,
    views: site.views || 0,
    
    // Arrays
    tags: site.tags || [],
    highlights: site.highlights || [],
    pickup_points: site.pickup_points || [],   // NEW FIELD
    
    // Metadata
    created_at: site.created_at,
    updated_at: site.updated_at,
    
    // UI state (default values)
    visited: false,
    booked: false,
    wishlisted: false,
    
    // Computed fields
    display_price: formatPrice(site.entry_fee_indian),
    opening_time_formatted: formatTime(site.opening_time),
    closing_time_formatted: formatTime(site.closing_time),
  };
}

export const heritageService = {
  /**
   * Get all heritage sites
   */
  getAllSites: async (): Promise<HeritageSite[]> => {
    try {
      console.log('🚀 Fetching heritage sites from API...');
      
      const response = await api.get<ApiResponse<any[]>>('/heritage/sites');

      console.log('📦 Response Data:', response.data);

      if (!response.data) {
        console.error('❌ No response.data received');
        return [];
      }

      if (!response.data.success) {
        console.error('❌ API returned success = false');
        console.error('Message:', response.data.message);
        return [];
      }

      if (!response.data.data) {
        console.error('❌ response.data.data is empty or undefined');
        return [];
      }

      console.log('📊 Raw Sites Count:', response.data.data.length);

      const sites = response.data.data.map((site: any) => {
        return normalizeSiteData(site);
      });

      console.log(`✅ Normalized ${sites.length} sites`);
      return sites;

    } catch (error: any) {
      console.error('🔥 API ERROR:', error);
      console.error('🔥 ERROR RESPONSE:', error?.response);
      console.error('🔥 ERROR DATA:', error?.response?.data);
      return [];
    }
  },

  /**
   * Get site by ID
   */
  getSiteById: async (id: number): Promise<HeritageSite | null> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/heritage/sites/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        return normalizeSiteData(response.data.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching site ${id}:`, error);
      return null;
    }
  },

  // NEW: Get products associated with a site
  getSiteProducts: async (siteId: number): Promise<SiteProduct[]> => {
    try {
      const response = await api.get<ApiResponse<SiteProduct[]>>(`/heritage/sites/${siteId}/products`);
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching site products:', error);
      return [];
    }
  },

  /**
   * Get sites by category
   */
  getSitesByCategory: async (category: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/sites/category/${category}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting sites by category:', error);
      return [];
    }
  },

  /**
   * Get sites by site type
   */
  getSitesByType: async (siteType: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/sites/type/${siteType}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting sites by type:', error);
      return [];
    }
  },

  /**
   * Get UNESCO sites
   */
  getUnescoSites: async (): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/heritage/unesco');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting UNESCO sites:', error);
      return [];
    }
  },

  /**
   * Get featured sites
   */
  getFeaturedSites: async (limit?: number): Promise<HeritageSite[]> => {
    try {
      const url = limit ? `/heritage/featured?limit=${limit}` : '/heritage/featured';
      const response = await api.get<ApiResponse<any[]>>(url);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting featured sites:', error);
      return [];
    }
  },

  /**
   * Search sites
   */
  searchSites: async (query: string): Promise<HeritageSite[]> => {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const response = await api.get<ApiResponse<any[]>>(`/heritage/search?q=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching sites:', error);
      return [];
    }
  },

  /**
   * Get sites by district
   */
  getSitesByDistrict: async (district: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/district/${encodeURIComponent(district)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting sites by district:', error);
      return [];
    }
  },

  /**
   * Get sites by enterprise
   */
  getSitesByEnterprise: async (enterpriseId: number): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/enterprise/${enterpriseId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting sites by enterprise:', error);
      return [];
    }
  },

  /**
   * Get filtered sites
   */
  getFilteredSites: async (filters: {
    category?: string;
    site_type?: string;
    district?: string;
    minRating?: number;
    isUnesco?: boolean;
    isFeatured?: boolean;
    enterprise_id?: number;
  }): Promise<HeritageSite[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.site_type) params.append('site_type', filters.site_type);
      if (filters.district) params.append('district', filters.district);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.isUnesco) params.append('isUnesco', 'true');
      if (filters.isFeatured) params.append('isFeatured', 'true');
      if (filters.enterprise_id) params.append('enterprise_id', filters.enterprise_id.toString());
      
      const response = await api.get<ApiResponse<any[]>>(`/heritage/filter?${params.toString()}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error filtering sites:', error);
      return [];
    }
  },

  /**
   * Get nearby sites
   */
  getNearbySites: async (lat: number, lng: number, radius: number = 50): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/heritage/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => normalizeSiteData(site));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting nearby sites:', error);
      return [];
    }
  },

  /**
   * Get all districts
   */
  getDistricts: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/heritage/districts');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting districts:', error);
      return [];
    }
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/heritage/categories');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  /**
   * Get all site types
   */
  getSiteTypes: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/heritage/site-types');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting site types:', error);
      return [];
    }
  },

  getRecommended: async (categories: string[]): Promise<HeritageSite[]> => {
    try {
        const catString = categories.join(',');
        const response = await api.get(`/heritage/recommended?categories=${catString}`);
        if (response.data.success) {
            return response.data.data.map((site: any) => normalizeSiteData(site));
        }
        return [];
    } catch (error) {
        console.error('Error fetching recommended sites:', error);
        return [];
    }
  },

  /**
   * Get site statistics
   */
  getSiteStats: async (): Promise<any> => {
    try {
      const response = await api.get<ApiResponse<any>>('/heritage/stats');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting site stats:', error);
      return null;
    }
  },

  /**
   * Get reviews for a site
   */
  getReviews: async (siteId: number): Promise<Review[]> => {
    try {
      const response = await api.get<ApiResponse<Review[]>>(`/heritage/sites/${siteId}/reviews`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  /**
   * Add a review for a site
   */
  addReview: async (siteId: number, reviewData: {
    rating: number;
    title?: string;
    comment: string;
    visit_date?: string;
  }): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/heritage/sites/${siteId}/reviews`, reviewData);
      
      if (response.data && response.data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user-data-updated', { 
            detail: { type: 'review', siteId } 
          }));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  },

  /**
   * Normalize a single site data
   */
  normalizeSite: (site: any): HeritageSite => {
    return normalizeSiteData(site);
  },
};