// app/services/mlRecommendationService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-hf-space.hf.space';

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

class MLRecommendationService {
  private async fetchAPI(endpoint: string, options?: RequestInit) {
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
      console.error('ML API Error:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(
    userHistory: number[] = [],
    preferences: UserPreferences = {},
    n: number = 6
  ): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI('/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          user_history: userHistory,
          preferences: preferences,
          n_recommendations: n
        }),
      });

      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  async getSimilarDestinations(destinationId: number, n: number = 4): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI(`/similar/${destinationId}?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting similar destinations:', error);
      return [];
    }
  }

  async getDestinationsByCategory(category: string, n: number = 10): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI(`/category/${category}?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting destinations by category:', error);
      return [];
    }
  }

  async getSeasonalPicks(n: number = 6): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI(`/seasonal?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting seasonal picks:', error);
      return [];
    }
  }

  async getBudgetPicks(budgetRange: 'low' | 'mid' | 'high', n: number = 6): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI(`/budget/${budgetRange}?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting budget picks:', error);
      return [];
    }
  }

  async getAllDestinations(): Promise<Destination[]> {
    try {
      const response = await this.fetchAPI('/destinations');
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting all destinations:', error);
      return [];
    }
  }

  async getDestinationById(id: number): Promise<Destination | null> {
    try {
      const response = await this.fetchAPI(`/destinations/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting destination:', error);
      return null;
    }
  }

  async getStats() {
    try {
      const response = await this.fetchAPI('/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchAPI('/health');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export const mlService = new MLRecommendationService();