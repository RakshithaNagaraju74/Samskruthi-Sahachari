// services/groqService.ts
import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
}

class GroqService {
  private chatHistory: ChatMessage[] = [];
  private siteData: any[] = [];
  private favoritesData: any[] = [];
  private userTickets: any[] = [];

  // ✅ Add missing update methods
  updateSiteData(sites: any[]) {
    this.siteData = sites;
  }

  updateFavoritesData(favorites: any[]) {
    this.favoritesData = favorites;
  }

  updateTicketsData(tickets: any[]) {
    this.userTickets = tickets;
  }

  // Build context for the AI
  private buildContext(): string {
    let context = `Current Data:\n\n`;
    
    // Add site information
    context += `Total Heritage Sites: ${this.siteData.length}\n`;
    context += `Site Categories:\n`;
    const categories: Record<string, number> = {};
    this.siteData.forEach(site => {
      if (site.category) {
        categories[site.category] = (categories[site.category] || 0) + 1;
      }
    });
    
    Object.entries(categories).forEach(([category, count]) => {
      context += `- ${category}: ${count} sites\n`;
    });

    // Add site names
    context += `\nAvailable Sites:\n`;
    this.siteData.slice(0, 20).forEach(site => {
      context += `- ${site.name} (${site.category || 'heritage'}): ${site.location || 'Karnataka'}\n`;
    });

    // Add favorites information
    context += `\nUser's Favorites: ${this.favoritesData.length} sites\n`;
    if (this.favoritesData.length > 0) {
      context += `Favorite Sites:\n`;
      this.favoritesData.slice(0, 10).forEach(fav => {
        context += `- ${fav.site_name} (added on ${new Date(fav.created_at).toLocaleDateString()})\n`;
      });
    }

    // Add tickets information
    context += `\nUser's Tickets: ${this.userTickets.length} total\n`;
    const activeTickets = this.userTickets.filter(t => t.status === 'active').length;
    const usedTickets = this.userTickets.filter(t => t.status === 'used').length;
    const expiredTickets = this.userTickets.filter(t => t.status === 'expired').length;
    const expiringSoon = this.userTickets.filter(t => {
      if (t.status !== 'active') return false;
      const daysLeft = Math.ceil((new Date(t.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 3 && daysLeft > 0;
    }).length;

    context += `- Active: ${activeTickets}\n`;
    context += `- Used: ${usedTickets}\n`;
    context += `- Expired: ${expiredTickets}\n`;
    context += `- Expiring Soon (≤3 days): ${expiringSoon}\n`;

    if (this.userTickets.length > 0) {
      context += `\nTicket Details:\n`;
      this.userTickets.slice(0, 10).forEach(ticket => {
        const daysLeft = ticket.status === 'active' 
          ? Math.ceil((new Date(ticket.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
          : 0;
        context += `- ${ticket.site_name}: ${ticket.status}${ticket.status === 'active' ? ` (expires in ${daysLeft} days)` : ''}\n`;
      });
    }

    return context;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Build context
      const context = this.buildContext();

      const response = await api.post<any>('/groq/chat', { 
        message,
        context // Send context to backend
      });

      // Handle different response structures
      if (response.data?.success) {
        const assistantMessage = response.data.message || response.data.data?.message || '';
        
        // Add assistant response to history
        if (assistantMessage) {
          this.chatHistory.push({
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date()
          });
        }

        return {
          success: true,
          message: assistantMessage
        };
      } else if (response.data?.message) {
        this.chatHistory.push({
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        });
        
        return {
          success: true,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: 'Sorry, I could not process that request.'
      };
    } catch (error) {
      console.error('Error sending message to Groq:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.'
      };
    }
  }

  async getRecommendations(category?: string): Promise<any[]> {
    try {
      const response = await api.get('/groq/recommendations', {
        params: { category }
      });
      
      if (response.data?.success && response.data?.recommendations) {
        return response.data.recommendations;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory() {
    this.chatHistory = [];
  }
}

// Export a singleton instance
export const groqService = new GroqService();