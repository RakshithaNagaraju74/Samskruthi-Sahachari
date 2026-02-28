// services/messageService.ts
import api from './api';

export interface Conversation {
  id: number;
  user_id: number;
  enterprise_id: number;
  site_id?: number;
  subject: string;
  last_message?: string;
  last_message_at?: string;
  unread_count_user: number;
  unread_count_enterprise: number;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  user_image?: string;
  enterprise_name?: string;
  enterprise_logo?: string;
  site_name?: string;
  site_image?: string;
  unread_count?: number;
  
  // Tourist details
  tourist_details?: {
    full_name: string;
    email: string;
    phone?: string;
    total_bookings?: number;
    total_spent?: number;
    joined_date?: string;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: 'user' | 'enterprise';
  sender_name?: string;
  sender_avatar?: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  attachments?: any;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Interface for enterprise list response
export interface EnterpriseListResponse {
  success: boolean;
  data: Array<{
    id: number;
    enterprise_name: string;
    description?: string;
    business_type?: string;
    logo?: string;
    location?: string;
  }>;
}

export const messageService = {
  // Get user's conversations
  getUserConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get<ApiResponse<Conversation[]>>('/messages/conversations');
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Get enterprise conversations
  getEnterpriseConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get<ApiResponse<Conversation[]>>('/messages/enterprise/conversations');
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching enterprise conversations:', error);
      return [];
    }
  },

  // Start a new conversation
  startConversation: async (enterpriseId: number, siteId?: number, subject?: string): Promise<Conversation | null> => {
    try {
      const response = await api.post<ApiResponse<Conversation>>('/messages/conversations/start', {
        enterpriseId,
        siteId,
        subject
      });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
  },

  // Get messages for a conversation
  getMessages: async (conversationId: number, limit: number = 50, offset: number = 0): Promise<Message[]> => {
    try {
      const response = await api.get<ApiResponse<Message[]>>(
        `/messages/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Send a message (as user)
  sendMessage: async (conversationId: number, message: string): Promise<Message | null> => {
    try {
      const response = await api.post<ApiResponse<Message>>(
        `/messages/conversations/${conversationId}/messages`,
        { message }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  // Send message as enterprise
  sendEnterpriseMessage: async (conversationId: number, message: string): Promise<Message | null> => {
    try {
      const response = await api.post<ApiResponse<Message>>(
        `/messages/enterprise/conversations/${conversationId}/messages`,
        { message }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error sending enterprise message:', error);
      return null;
    }
  },

  // Mark messages as read (user)
  markAsRead: async (conversationId: number): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<any>>(
        `/messages/conversations/${conversationId}/read`
      );
      return response.data?.success || false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },

  // Mark messages as read (enterprise)
  markEnterpriseAsRead: async (conversationId: number): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<any>>(
        `/messages/enterprise/conversations/${conversationId}/read`
      );
      return response.data?.success || false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },

  // Archive conversation
  archiveConversation: async (conversationId: number): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<any>>(
        `/messages/conversations/${conversationId}/archive`
      );
      return response.data?.success || false;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  },

  // Get tourist details
  getTouristDetails: async (userId: number): Promise<any> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/messages/tourist/${userId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tourist details:', error);
      return null;
    }
  },

  // Get all approved enterprises
  getAllEnterprises: async (): Promise<EnterpriseListResponse['data']> => {
    try {
      const response = await api.get<EnterpriseListResponse>('/enterprise/all');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching enterprises:', error);
      return [];
    }
  },

  // Format timestamp
  formatMessageTime: (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return timestamp;
    }
  }
};