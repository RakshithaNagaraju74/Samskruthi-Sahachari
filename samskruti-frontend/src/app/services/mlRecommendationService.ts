// app/services/mlRecommendationService.ts
import { Destination as GlobalDestination, UserPreferences as GlobalUserPreferences } from "@/types";

// Re-export the types from your global types
export type Destination = GlobalDestination;
export type UserPreferences = GlobalUserPreferences;

export interface Recommendation {
  id: number;
  score: number;
  reason: string;
  matchTags: string[];
  destination: Destination;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  destinations: number;
}

class MLRecommendationService {
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-hf-space.hf.space';
      
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
    preferences: GlobalUserPreferences = {},
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
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/similar/${destinationId}?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting similar destinations:', error);
      return [];
    }
  }

  async getSeasonalPicks(n: number = 6): Promise<Recommendation[]> {
    try {
      const response = await this.fetchAPI<ApiResponse<Recommendation[]>>(`/seasonal?n=${n}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting seasonal picks:', error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchAPI<HealthResponse>('/health');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export const mlService = new MLRecommendationService();