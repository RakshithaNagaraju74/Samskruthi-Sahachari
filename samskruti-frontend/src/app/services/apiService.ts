// app/services/apiService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Destination {
  id: number;
  name: string;
  location: string;
  state: string;
  image: string;
  images: string[];
  price: string;
  rating: number;
  category: string;
  subcategory: string;
  duration: string;
  bestTime: string;
  description: string;
  longDescription: string;
  coordinates: { lat: number; lng: number };
  tags: string[];
  highlights: string[];
  nearbyAttractions: number[];
  entry_fee?: string;
  open_timing?: string;
  closed_on?: string;
  enterprise?: Enterprise;
}

export interface Enterprise {
  id: number;
  company_name: string;
  business_type: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
}

export interface Recommendation {
  id: number;
  score: number;
  reason: string;
  matchTags: string[];
  destination: Destination;
}

export interface UserPreferences {
  favorite_categories?: string[];
  budget_range?: 'low' | 'mid' | 'high';
  preferred_season?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class ApiService {
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all destinations
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Destination[]>>('/destinations');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  // Get destination by ID
  async getDestinationById(id: number): Promise<Destination | null> {
    try {
      const response = await this.fetchAPI<ApiResponse<Destination>>(`/destinations/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching destination:', error);
      return null;
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    userHistory: number[] = [],
    preferences: UserPreferences = {},
    n: number = 6
  ): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>('/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          user_history: userHistory,
          preferences: {
            favorite_categories: preferences.favorite_categories || [],
            budget_range: preferences.budget_range || 'mid',
            preferred_season: preferences.preferred_season || []
          },
          n_recommendations: n
        }),
      });
      return response.data || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Get similar destinations
  async getSimilarDestinations(destinationId: number, n: number = 4): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/similar/${destinationId}?n=${n}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting similar destinations:', error);
      return [];
    }
  }

  // Get seasonal picks
  async getSeasonalPicks(n: number = 6): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/seasonal?n=${n}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting seasonal picks:', error);
      return [];
    }
  }

  // Get destinations by category
  async getDestinationsByCategory(category: string, n: number = 10): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/category/${category}?n=${n}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting destinations by category:', error);
      return [];
    }
  }

  // Get budget picks
  async getBudgetPicks(budgetRange: 'low' | 'mid' | 'high', n: number = 6): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/budget/${budgetRange}?n=${n}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting budget picks:', error);
      return [];
    }
  }

  // Get stats
  async getStats() {
    try {
      const response = await this.fetchAPI<ApiResponse<any>>('/stats');
      return response.data || null;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // Track user view
  async trackView(userId: number, destinationId: number) {
    try {
      await fetch('/api/user/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, destinationId })
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }
}

export const apiService = new ApiService();