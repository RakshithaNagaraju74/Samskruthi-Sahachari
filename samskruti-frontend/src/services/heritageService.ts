// services/heritageService.ts
import api from './api';

export interface HeritageSite {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  location: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  category: string;
  subcategory?: string;
  type?: string;
  main_image?: string;
  gallery_images?: string[];
  images?: string[];
  entry_fee_indian?: number;
  entry_fee_foreigner?: number;
  opening_time?: string;
  closing_time?: string;
  best_time_to_visit?: string;
  duration_required?: string;
  is_active?: boolean;
  is_featured?: boolean;
  is_unesco?: boolean;
  
  // Historical info
  built_by?: string;
  built_in?: string;
  architectural_style?: string;
  significance?: string;
  
  // Additional fields
  tags?: string[];
  highlights?: string[];
  
  // Contact fields
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  
  // Stats
  rating?: number;
  total_reviews?: number;
  
  // Enterprise info
  enterprise?: {
    id: number;
    company_name: string;
    verified: boolean;
    logo?: string;
    contact_email?: string;
    contact_phone?: string;
  };
  
  // UI state fields
  visited?: boolean;
  booked?: boolean;
  wishlisted?: boolean;
  
  // Computed fields
  display_price?: string;
}

export interface BookingResult {
  success: boolean;
  booking_id?: number;
  ticket_number?: string;
  error?: string;
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
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const heritageService = {
  // Get all heritage sites
  getAllSites: async (): Promise<HeritageSite[]> => {
    try {
      console.log('Fetching heritage sites from API...');
      const response = await api.get<ApiResponse<any[]>>('/heritage/sites');
      
      if (response.data && response.data.success && response.data.data) {
        const sites = response.data.data.map((site: any): HeritageSite => ({
          id: site.id,
          name: site.name || 'Unnamed Site',
          description: site.description || site.short_description || 'No description available',
          short_description: site.short_description,
          location: site.location || 'Karnataka',
          district: site.district,
          state: site.state || 'Karnataka',
          latitude: site.latitude,
          longitude: site.longitude,
          category: site.category || 'heritage',
          subcategory: site.subcategory,
          type: site.site_type,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          gallery_images: site.gallery_images || [],
          images: site.images || [],
          entry_fee_indian: site.entry_fee_indian,
          entry_fee_foreigner: site.entry_fee_foreigner,
          opening_time: site.opening_time,
          closing_time: site.closing_time,
          best_time_to_visit: site.best_time_to_visit,
          duration_required: site.duration_required,
          is_active: site.is_active,
          is_featured: site.is_featured,
          is_unesco: site.is_unesco,
          built_by: site.built_by,
          built_in: site.built_in,
          architectural_style: site.architectural_style,
          significance: site.significance,
          tags: site.tags || [],
          highlights: site.highlights || [],
          contact_phone: site.contact_phone,
          contact_email: site.contact_email,
          website: site.website,
          rating: site.rating || 0,
          total_reviews: site.total_reviews || 0,
          enterprise: site.enterprise,
          visited: false,
          booked: false,
          wishlisted: false,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
        
        console.log(`✅ Loaded ${sites.length} heritage sites`);
        return sites;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching heritage sites:', error);
      throw error;
    }
  },

  // Get site by ID
  getSiteById: async (id: number): Promise<HeritageSite | null> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/heritage/sites/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        const site = response.data.data;
        return {
          id: site.id,
          name: site.name || 'Unnamed Site',
          description: site.description || site.short_description || 'No description available',
          short_description: site.short_description,
          location: site.location || 'Karnataka',
          district: site.district,
          state: site.state || 'Karnataka',
          latitude: site.latitude,
          longitude: site.longitude,
          category: site.category || 'heritage',
          subcategory: site.subcategory,
          type: site.site_type,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          gallery_images: site.gallery_images || [],
          images: site.images || [],
          entry_fee_indian: site.entry_fee_indian,
          entry_fee_foreigner: site.entry_fee_foreigner,
          opening_time: site.opening_time,
          closing_time: site.closing_time,
          best_time_to_visit: site.best_time_to_visit,
          duration_required: site.duration_required,
          is_active: site.is_active,
          is_featured: site.is_featured,
          is_unesco: site.is_unesco,
          built_by: site.built_by,
          built_in: site.built_in,
          architectural_style: site.architectural_style,
          significance: site.significance,
          tags: site.tags || [],
          highlights: site.highlights || [],
          contact_phone: site.contact_phone,
          contact_email: site.contact_email,
          website: site.website,
          rating: site.rating || 0,
          total_reviews: site.total_reviews || 0,
          enterprise: site.enterprise,
          visited: false,
          booked: false,
          wishlisted: false,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching heritage site ${id}:`, error);
      throw error;
    }
  },

  // Get featured sites
  getFeaturedSites: async (): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/heritage/featured');
      
      if (response.data && response.data.success && response.data.data) {
        const sites = response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          short_description: site.short_description,
          location: site.location,
          district: site.district,
          category: site.category,
          type: site.site_type,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          is_unesco: site.is_unesco,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
        
        return sites;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching featured sites:', error);
      throw error;
    }
  },

  // Get UNESCO sites
  getUnescoSites: async (): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/heritage/unesco');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          is_unesco: true,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching UNESCO sites:', error);
      throw error;
    }
  },

  // Search sites
  searchSites: async (query: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/search?q=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching sites:', error);
      throw error;
    }
  },

  // Get sites by category
  getSitesByCategory: async (category: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/sites/category/${category}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching sites by category ${category}:`, error);
      throw error;
    }
  },

  // Get sites by district
  getSitesByDistrict: async (district: string): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/district/${district}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching sites by district ${district}:`, error);
      throw error;
    }
  },

  // Get nearby sites
  getNearbySites: async (lat: number, lng: number, radius: number = 50): Promise<HeritageSite[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/heritage/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          latitude: site.latitude,
          longitude: site.longitude,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching nearby sites:', error);
      throw error;
    }
  },

  // Get filtered sites
  getFilteredSites: async (filters: Record<string, string>): Promise<HeritageSite[]> => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get<ApiResponse<any[]>>(`/heritage/filter?${params}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map((site: any) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          district: site.district,
          category: site.category,
          main_image: site.main_image || getDefaultImageForCategory(site.category),
          entry_fee_indian: site.entry_fee_indian,
          rating: site.rating,
          display_price: formatPrice(site.entry_fee_indian, site.entry_fee_foreigner)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching filtered sites:', error);
      throw error;
    }
  },

  // Get all districts
  getDistricts: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/heritage/districts');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/heritage/categories');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get reviews for a site
  getReviews: async (siteId: number): Promise<Review[]> => {
    try {
      const response = await api.get<ApiResponse<Review[]>>(`/heritage/sites/${siteId}/reviews`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Add a review
  addReview: async (userId: number, siteId: number, rating: number, comment: string, title?: string, visitDate?: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/heritage/sites/${siteId}/reviews`, {
        rating,
        title,
        comment,
        visit_date: visitDate
      });
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  },

  // Book a site
  bookSite: async (
    userId: number,
    siteId: number,
    travelDate: string,
    travelers: number,
    specialRequests?: string
  ): Promise<BookingResult> => {
    try {
      // First get the site details
      const site = await heritageService.getSiteById(siteId);
      
      if (!site) {
        return {
          success: false,
          error: 'Site not found'
        };
      }

      const totalPrice = (site.entry_fee_indian || 0) * travelers;

      // Create booking
      const response = await api.post<ApiResponse<any>>('/api/bookings', {
        user_id: userId,
        site_id: siteId,
        travel_date: travelDate,
        travelers: travelers,
        total_amount: totalPrice,
        special_requests: specialRequests
      });

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          booking_id: response.data.data.id,
          ticket_number: response.data.data.booking_reference
        };
      }

      return {
        success: false,
        error: 'Booking failed - invalid response'
      };
    } catch (error: any) {
      console.error('Error booking site:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to book site. Please try again.'
      };
    }
  }
};

// Helper function to format price
function formatPrice(indian?: number, foreigner?: number): string {
  if (indian && foreigner) {
    return `₹${indian}`;
  } else if (indian) {
    return `₹${indian}`;
  } else if (foreigner) {
    return `₹${foreigner}`;
  } else {
    return 'Free';
  }
}

// Helper function to get default image based on category
function getDefaultImageForCategory(category?: string): string {
  const defaultImages: Record<string, string> = {
    heritage: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800',
    nature: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800',
    culture: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800',
    adventure: 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800',
    beach: 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800',
    wildlife: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800',
    default: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800'
  };
  
  return defaultImages[category || 'default'] || defaultImages.default;
}