// services/notificationService.ts
import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  type: 'expiring_soon' | 'expired' | 'ticket_used' | 'booking_confirmed' | 'daily_summary' | 'system';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount?: number;
  count?: number;
}

class NotificationService {
  async getNotifications(limit: number = 20, unreadOnly: boolean = false): Promise<{ notifications: Notification[], unreadCount: number }> {
    try {
      const response = await api.get<NotificationResponse>(
        `/notifications?limit=${limit}&unreadOnly=${unreadOnly}`
      );
      
      // Handle different response structures
      if (response.data?.success && response.data?.data) {
        return {
          notifications: Array.isArray(response.data.data) ? response.data.data : [],
          unreadCount: response.data.unreadCount || 0
        };
      } else if (Array.isArray(response.data)) {
        return {
          notifications: response.data,
          unreadCount: 0
        };
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return {
          notifications: response.data.data,
          unreadCount: response.data.unreadCount || 0
        };
      }
      
      return { notifications: [], unreadCount: 0 };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }

  async markAsRead(notificationId: number): Promise<Notification | null> {
    try {
      const response = await api.patch<{ success?: boolean; data?: Notification }>(
  `/notifications/${notificationId}/read`
);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data?.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await api.post<{ success?: boolean }>(
  '/notifications/mark-all-read'
);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const response = await api.delete<{ success?: boolean }>(
  `/notifications/${notificationId}`
);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{
  success?: boolean;
  data?: { count?: number };
  count?: number;
}>('/notifications/unread-count');
      
      if (response.data?.success && response.data?.data?.count !== undefined) {
        return response.data.data.count;
      } else if (response.data?.count !== undefined) {
        return response.data.count;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'expiring_soon':
        return '⏰';
      case 'expired':
        return '❌';
      case 'ticket_used':
        return '✅';
      case 'booking_confirmed':
        return '🎟️';
      case 'daily_summary':
        return '📋';
      default:
        return '🔔';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'expiring_soon':
        return 'yellow';
      case 'expired':
        return 'red';
      case 'ticket_used':
        return 'green';
      case 'booking_confirmed':
        return 'blue';
      default:
        return 'gray';
    }
  }
}

export const notificationService = new NotificationService();