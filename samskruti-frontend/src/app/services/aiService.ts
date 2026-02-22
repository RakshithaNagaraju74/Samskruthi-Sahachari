interface AIRecommendation {
  id: number;
  score: number;
  reason: string;
  matchTags: string[];
  destination: any;
}

export class AIService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  async getPersonalizedRecommendations(data: any): Promise<any[]> {
  try {
    const response = await fetch(`${this.apiUrl}/api/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) return [];
    
    const result = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('AI Service Error:', error);
    return [];
  }
}

  async getDestinationInsights(destinationId: number) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/ai/insights/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Insights Error:', error);
      return null;
    }
  }

  async generateItinerary(destinationIds: number[], days: number, preferences: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/ai/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ destinationIds, days, preferences })
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Itinerary Error:', error);
      return null;
    }
  }

  async findSimilarDestinations(destinationId: number) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/ai/similar/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Similar Destinations Error:', error);
      return [];
    }
  }

  async getEnterpriseRecommendations(preferences: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/ai/enterprise-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Enterprise Recommendations Error:', error);
      return null;
    }
  }
}

export const aiService = new AIService();