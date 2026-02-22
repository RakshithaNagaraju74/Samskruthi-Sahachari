import { Destination, Recommendation } from '@/types';

// Simple AI-like recommendation engine based on user preferences and behavior
export class RecommendationEngine {
  private destinations: Destination[];
  private userHistory: number[] = [];
  private userPreferences: string[] = [];

  constructor(destinations: Destination[]) {
    this.destinations = destinations;
  }

  // Track user interactions
  trackView(destinationId: number) {
    this.userHistory.push(destinationId);
    // Keep only last 20 views
    if (this.userHistory.length > 20) {
      this.userHistory.shift();
    }
  }

  trackPreference(category: string) {
    if (!this.userPreferences.includes(category)) {
      this.userPreferences.push(category);
    }
  }

  // Get recommendations based on collaborative filtering
  getRecommendations(limit: number = 6): Recommendation[] {
    const scores: Map<number, { score: number; reasons: string[] }> = new Map();

    // Factor 1: Based on user history (collaborative)
    if (this.userHistory.length > 0) {
      const viewedDestinations = this.userHistory.map(id => 
        this.destinations.find(d => d.id === id)
      ).filter(Boolean) as Destination[];

      // Find similar destinations based on tags
      const viewedTags = viewedDestinations.flatMap(d => d.tags);
      const tagFrequency = new Map<string, number>();
      
      viewedTags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });

      // Score destinations based on matching tags
      this.destinations.forEach(dest => {
        if (!this.userHistory.includes(dest.id)) {
          let matchScore = 0;
          const reasons: string[] = [];

          dest.tags.forEach(tag => {
            const freq = tagFrequency.get(tag) || 0;
            if (freq > 0) {
              matchScore += freq * 2;
              if (!reasons.includes(`Similar to places you liked`)) {
                reasons.push(`Similar to places you liked`);
              }
            }
          });

          if (matchScore > 0) {
            scores.set(dest.id, {
              score: matchScore,
              reasons
            });
          }
        }
      });
    }

    // Factor 2: Based on user preferences
    if (this.userPreferences.length > 0) {
      this.destinations.forEach(dest => {
        const current = scores.get(dest.id) || { score: 0, reasons: [] };
        
        if (this.userPreferences.includes(dest.category)) {
          current.score += 5;
          current.reasons.push(`Matches your interest in ${dest.category}`);
        }

        dest.tags.forEach(tag => {
          if (this.userPreferences.includes(tag)) {
            current.score += 3;
            if (!current.reasons.includes(`Based on your preferences`)) {
              current.reasons.push(`Based on your preferences`);
            }
          }
        });

        scores.set(dest.id, current);
      });
    }

    // Factor 3: Popularity (rating)
    this.destinations.forEach(dest => {
      const current = scores.get(dest.id) || { score: 0, reasons: [] };
      current.score += dest.rating * 2;
      scores.set(dest.id, current);
    });

    // Convert to array, sort by score, and return top recommendations
    const recommendations = Array.from(scores.entries())
      .map(([id, data]) => ({
        destination: this.destinations.find(d => d.id === id)!,
        score: data.score,
        reason: data.reasons.length > 0 
          ? data.reasons[0] 
          : `Popular destination with ${data.score.toFixed(1)} rating`,
        based_on: data.reasons
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  // Get similar destinations
  getSimilarDestinations(destinationId: number, limit: number = 4): Destination[] {
    const target = this.destinations.find(d => d.id === destinationId);
    if (!target) return [];

    const similarities = this.destinations
      .filter(d => d.id !== destinationId)
      .map(d => {
        // Calculate similarity based on tags and category
        const commonTags = d.tags.filter(tag => target.tags.includes(tag)).length;
        const categoryMatch = d.category === target.category ? 1 : 0;
        const similarity = commonTags * 2 + categoryMatch * 3;
        
        return { destination: d, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.destination);

    return similarities;
  }

  // Get personalized recommendations for a specific user
  static getPersonalizedRecommendations(
    destinations: Destination[],
    userHistory: number[] = [],
    preferences: string[] = []
  ): Recommendation[] {
    const engine = new RecommendationEngine(destinations);
    userHistory.forEach(id => engine.trackView(id));
    preferences.forEach(pref => engine.trackPreference(pref));
    return engine.getRecommendations();
  }
}

// Content-based filtering for similar items
export function getContentBasedRecommendations(
  destination: Destination,
  allDestinations: Destination[],
  limit: number = 4
): Destination[] {
  return allDestinations
    .filter(d => d.id !== destination.id)
    .map(d => {
      // Calculate similarity score
      let score = 0;
      
      // Category match (high weight)
      if (d.category === destination.category) score += 5;
      
      // Tag matches
      const commonTags = d.tags.filter(tag => destination.tags.includes(tag)).length;
      score += commonTags * 2;
      
      // Price similarity (optional)
      const priceDiff = Math.abs(
        parseInt(d.price.replace(/[^0-9]/g, '')) - 
        parseInt(destination.price.replace(/[^0-9]/g, ''))
      );
      if (priceDiff < 500) score += 1;
      
      return { destination: d, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.destination);
}