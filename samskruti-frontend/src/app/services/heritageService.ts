// services/heritageService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface HeritageSite {
  id: number;
  name: string;
  description: string;
  short_description: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  era: string;
  built_in: string;
  built_by: string;
  architectural_style: string;
  significance: string;
  category: string;
  subcategory: string;
  type: string;
  main_image: string;
  gallery_images: string[];
  entry_fee_indian: number;
  entry_fee_foreigner: number;
  camera_fee: number;
  opening_time: string;
  closing_time: string;
  closed_on: string;
  best_time_to_visit: string;
  duration_required: string;
  parking_available: boolean;
  guide_available: boolean;
  wheelchair_accessible: boolean;
  museum_available: boolean;
  cafeteria_available: boolean;
  restroom_available: boolean;
  contact_phone: string;
  contact_email: string;
  website: string;
  tags: string[];
  highlights: string[];
  enterprise_id: number;
  enterprise: {
    id: number;
    company_name: string;
    verified: boolean;
  };
  is_featured: boolean;
  verified: boolean;
  visited?: boolean;
  booked?: boolean;
}

export interface BookingResponse {
  success: boolean;
  booking_id?: string;
  message?: string;
  error?: string;
  data?: any;
}

class HeritageService {
  private sitesCache: HeritageSite[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getAllSites(forceRefresh = false): Promise<HeritageSite[]> {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && this.sitesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Returning cached heritage sites');
      return [...this.sitesCache]; // Return a copy to avoid mutation
    }

    try {
      const url = `${API_URL}/heritage/sites`;
      console.log('Fetching heritage sites from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sites = data.data || [];
      
      console.log(`✅ Loaded ${sites.length} heritage sites from API`);
      
      // Update cache
      this.sitesCache = sites;
      this.cacheTimestamp = now;
      
      return sites;
    } catch (error) {
      console.error('Error fetching heritage sites:', error);
      return []; // Always return empty array on error
    }
  }

  async getSiteById(id: number): Promise<HeritageSite | null> {
    try {
      // Check cache first
      if (this.sitesCache) {
        const cachedSite = this.sitesCache.find(site => site.id === id);
        if (cachedSite) {
          return cachedSite;
        }
      }

      const response = await fetch(`${API_URL}/heritage/sites/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching heritage site:', error);
      return null;
    }
  }

  async getUNESCOSites(): Promise<HeritageSite[]> {
    try {
      // Try cache first
      if (this.sitesCache) {
        const unescSites = this.sitesCache.filter(site => 
          site.type === 'UNESCO World Heritage' || 
          site.subcategory?.includes('unesco')
        );
        if (unescSites.length > 0) {
          return unescSites;
        }
      }

      const response = await fetch(`${API_URL}/heritage/unesco`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching UNESCO sites:', error);
      return [];
    }
  }

  async getSitesByCategory(category: string): Promise<HeritageSite[]> {
    try {
      // Try cache first
      if (this.sitesCache) {
        const categorySites = this.sitesCache.filter(site => 
          site.category?.toLowerCase() === category.toLowerCase() ||
          site.subcategory?.toLowerCase().includes(category.toLowerCase()) ||
          site.type?.toLowerCase().includes(category.toLowerCase())
        );
        if (categorySites.length > 0) {
          return categorySites;
        }
      }

      const response = await fetch(`${API_URL}/heritage/sites/category/${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching sites by category:', error);
      return [];
    }
  }

  async getUserVisitedSites(userId: number): Promise<number[]> {
    try {
      const response = await fetch(`${API_URL}/heritage/user/${userId}/visited`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user visited sites:', error);
      return [];
    }
  }

  async getUserBookedSites(userId: number): Promise<number[]> {
    try {
      const response = await fetch(`${API_URL}/heritage/user/${userId}/booked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user booked sites:', error);
      return [];
    }
  }

  async markSiteAsVisited(userId: number, siteId: number, rating?: number, review?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/heritage/user/${userId}/visited`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          rating,
          review,
          visitDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error marking site as visited:', error);
      return false;
    }
  }

  async bookSite(
    userId: number, 
    siteId: number, 
    travelDate: string, 
    travelers: number, 
    specialRequests?: string
  ): Promise<BookingResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/heritage/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          userId,
          siteId,
          travelDate,
          travelers,
          specialRequests,
          bookingDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        booking_id: data.booking_id,
        message: 'Booking confirmed successfully',
        data: data
      };
    } catch (error) {
      console.error('Error booking site:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Booking failed. Please try again.' 
      };
    }
  }

  async createBooking(bookingData: any): Promise<BookingResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        booking_id: data.booking_id,
        message: 'Booking created successfully',
        data: data
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Booking failed. Please try again.' 
      };
    }
  }

  getSitesWithCoordinates(sites: HeritageSite[]): HeritageSite[] {
    return sites.filter(site => 
      site.latitude && 
      site.longitude && 
      !isNaN(site.latitude) && 
      !isNaN(site.longitude)
    );
  }

  getFeaturedSites(sites: HeritageSite[]): HeritageSite[] {
    return sites.filter(site => site.is_featured === true);
  }

  searchSites(sites: HeritageSite[], query: string): HeritageSite[] {
    if (!query.trim()) return sites;
    
    const lowerQuery = query.toLowerCase();
    return sites.filter(site => 
      site.name?.toLowerCase().includes(lowerQuery) ||
      site.location?.toLowerCase().includes(lowerQuery) ||
      site.district?.toLowerCase().includes(lowerQuery) ||
      site.description?.toLowerCase().includes(lowerQuery) ||
      site.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  filterByPrice(sites: HeritageSite[], minPrice?: number, maxPrice?: number): HeritageSite[] {
    return sites.filter(site => {
      const price = site.entry_fee_indian || 0;
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      return true;
    });
  }

  filterByDuration(sites: HeritageSite[], maxHours: number): HeritageSite[] {
    return sites.filter(site => {
      const duration = site.duration_required || '';
      const hours = parseInt(duration.split('-')[0]) || 0;
      return hours <= maxHours;
    });
  }

  clearCache(): void {
    this.sitesCache = null;
    this.cacheTimestamp = 0;
    console.log('Heritage sites cache cleared');
  }
}

export const heritageService = new HeritageService();