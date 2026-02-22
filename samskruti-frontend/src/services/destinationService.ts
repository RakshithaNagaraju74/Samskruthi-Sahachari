// services/destinationService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Enterprise {
  id: number;
  company_name: string;
  logo: string;
  verified: boolean;
  description: string;
  phone: string;
  email: string;
}

export interface Destination {
  id: number;
  name: string;
  location: string;
  state: string;
  description: string;
  long_description: string;
  image: string;
  images: string[];
  price: string;
  numeric_price?: number;
  category: string;
  subcategory: string;
  duration: string;
  best_time: string;
  tags: string[];
  highlights: string[];
  entry_fee: string;
  open_timing: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  status: string;
  enterprise_id: number;
  enterprise: Enterprise;
  rating?: number;
  review_count?: number;
}

export interface Booking {
  id: number;
  booking_id: string;
  destination_id: number;
  destination_name?: string;
  destination_image?: string;
  destination_location?: string;
  travel_date: string;
  travelers: number;
  total_price: number;
  status: string;
}

class DestinationService {
  private destinationsCache: Destination[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getApprovedDestinations(forceRefresh = false): Promise<{ success: boolean; data: Destination[] }> {
    // Return cached data if available and not expired
    const now = Date.now();
    if (!forceRefresh && this.destinationsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Returning cached destinations');
      return {
        success: true,
        data: this.destinationsCache
      };
    }

    try {
      const url = `${API_URL}/enterprise/destinations/approved`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getApprovedDestinations(forceRefresh); // Retry after delay
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add ratings and review counts for UI
      const destinationsWithMeta = data.data.map((dest: Destination) => ({
        ...dest,
        rating: (Math.random() * 2 + 3).toFixed(1),
        review_count: Math.floor(Math.random() * 500) + 50
      }));
      
      // Update cache
      this.destinationsCache = destinationsWithMeta;
      this.cacheTimestamp = now;
      
      return {
        success: true,
        data: destinationsWithMeta
      };
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return { success: false, data: [] };
    }
  }

  async getDestinationById(id: number): Promise<{ success: boolean; data: Destination | null }> {
    try {
      const response = await fetch(`${API_URL}/enterprise/destinations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getDestinationById(id); // Retry after delay
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || null
      };
    } catch (error) {
      console.error('Error fetching destination:', error);
      return { success: false, data: null };
    }
  }

  async getUserBookings(): Promise<Booking[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getUserBookings(); // Retry after delay
        }
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  // These methods now use the cached data instead of making new API calls
  async getFeaturedDestinations(): Promise<Destination[]> {
    const result = await this.getApprovedDestinations();
    return result.data.slice(0, 3);
  }

  async getPopularDestinations(): Promise<Destination[]> {
    const result = await this.getApprovedDestinations();
    return result.data.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  }

  async getSpecialOffers(): Promise<Destination[]> {
    const result = await this.getApprovedDestinations();
    return result.data.filter((_, index) => index % 3 === 0).slice(0, 4);
  }

  async getNearMeDestinations(): Promise<Destination[]> {
    const result = await this.getApprovedDestinations();
    return result.data.slice(-4);
  }

  async createBooking(bookingData: any): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.createBooking(bookingData); // Retry after delay
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }
}

export const destinationService = new DestinationService();