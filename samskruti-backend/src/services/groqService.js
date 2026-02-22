// src/services/groqService.js
class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.models = {
      primary: 'llama-3.3-70b-versatile',
      fallback: 'llama-3.1-8b-instant',
      cheap: 'llama-3.1-8b-instant' // For retries
    };
    this.retryDelay = 1000; // 1 second
    this.maxRetries = 3;
  }

  async makeRequest(messages, model = this.models.primary, temperature = 0.7, retryCount = 0) {
    try {
      console.log(`Making Groq API request with model: ${model} (attempt ${retryCount + 1})`);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 512 // Reduced to save tokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API HTTP error:', response.status, response.statusText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = JSON.parse(errorText);
          const match = errorData.error?.message?.match(/Please try again in (\d+(?:\.\d+)?)s/);
          const waitTime = match ? parseFloat(match[1]) * 1000 : 5000;
          
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          
          if (retryCount < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            // Try with cheaper model on retry
            return this.makeRequest(messages, this.models.cheap, temperature, retryCount + 1);
          }
        }
        
        return null;
      }

      const data = await response.json();
      
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected Groq API response structure:', data);
        return null;
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.message);
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying after error... (attempt ${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(messages, model, temperature, retryCount + 1);
      }
      
      return null;
    }
  }

  async getPersonalizedRecommendations(userData, destinations) {
    try {
      // If no API key, immediately use fallback
      if (!this.apiKey) {
        console.log('No Groq API key found, using fallback recommendations');
        return this.getFallbackRecommendations(destinations);
      }

      // Limit destinations to avoid token limits
      const limitedDestinations = destinations.slice(0, 15).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        rating: d.rating,
        price: d.price,
        bestTime: d.bestTime
      }));

      const prompt = `
        You are a travel recommendation AI for Karnataka tourism.
        
        User Preferences: ${userData.preferences?.favorite_categories?.join(', ') || 'Not specified'}
        User History: ${userData.history?.length || 0} destinations viewed
        
        Available Destinations:
        ${JSON.stringify(limitedDestinations, null, 2)}
        
        Recommend 4 destinations that would be perfect for this user.
        Return ONLY a JSON array in this format:
        [
          {
            "id": number,
            "score": number (0-100),
            "reason": "short reason"
          }
        ]
      `;

      const response = await this.makeRequest([
        { role: 'system', content: 'You are a travel recommendation AI. Return only JSON.' },
        { role: 'user', content: prompt }
      ]);

      if (!response) {
        return this.getFallbackRecommendations(destinations);
      }
      
      // Parse response
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          return recommendations;
        }
      }
      
      return this.getFallbackRecommendations(destinations);
    } catch (error) {
      console.error('Recommendation Error:', error);
      return this.getFallbackRecommendations(destinations);
    }
  }

  getFallbackRecommendations(destinations) {
    return destinations
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map(d => ({
        id: d.id,
        score: Math.round(d.rating * 10),
        reason: `Popular destination with ${d.rating} rating`,
        matchTags: (d.tags || []).slice(0, 2)
      }));
  }
}

module.exports = new GroqService();