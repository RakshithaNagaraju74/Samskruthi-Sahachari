// services/userActivityService.js
import api from './api';

// Helper function to get user ID from token
const getUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload.id || payload.userId || payload.sub || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

class UserActivityService {
  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID available');
        return {
          totalVisits: 0,
          totalBookings: 0,
          totalReviews: 0,
          completionRate: 0,
          activeTickets: 0
        };
      }
      
      console.log(`Fetching stats for user: ${userId}`);
      
      // Get bookings count from booking service
      let totalBookings = 0;
      try {
        const bookingsResponse = await api.get('/bookings/user');
        totalBookings = bookingsResponse.data?.data?.length || 0;
      } catch (e) {
        console.log('No bookings found');
      }
      
      // Get tickets count from ticket service
      let activeTickets = 0;
      let totalTickets = 0;
      try {
        const ticketsResponse = await api.get(`/tickets/user/${userId}`);
        totalTickets = ticketsResponse.data?.data?.length || 0;
        activeTickets = ticketsResponse.data?.data?.filter(t => t.status === 'active').length || 0;
      } catch (e) {
        console.log('No tickets found');
      }
      
      // Get reviews count
      let totalReviews = 0;
      try {
        const reviewsResponse = await api.get(`/users/${userId}/reviews`);
        totalReviews = reviewsResponse.data?.data?.length || 0;
      } catch (e) {
        console.log('No reviews found');
      }
      
      return {
        totalVisits: 0, // This might need a separate endpoint
        totalBookings,
        totalReviews,
        completionRate: 0,
        activeTickets
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalVisits: 0,
        totalBookings: 0,
        totalReviews: 0,
        completionRate: 0,
        activeTickets: 0
      };
    }
  }

  /**
   * Get user visits - This endpoint might not exist, return empty array
   */
  async getUserVisits() {
    return []; // Return empty array if endpoint doesn't exist
  }

  /**
   * Get user bookings - Use booking service
   */
  async getUserBookings() {
    try {
      const response = await api.get('/bookings/user');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  /**
   * Get user recent activity - Combine from multiple sources
   */
  async getUserRecentActivity(limit = 10) {
    try {
      const userId = getUserId();
      if (!userId) return [];
      
      const activities = [];
      
      // Get recent bookings
      try {
        const bookingsResponse = await api.get('/bookings/user');
        const bookings = bookingsResponse.data?.data || [];
        bookings.slice(0, 3).forEach(booking => {
          activities.push({
            id: `booking-${booking.id}`,
            site_id: booking.site_id,
            name: booking.site_name || 'Heritage Site',
            location: booking.site_location || 'Karnataka',
            image: '',
            type: 'booking',
            date: booking.created_at
          });
        });
      } catch (e) {}
      
      // Get recent tickets
      try {
        const ticketsResponse = await api.get(`/tickets/user/${userId}`);
        const tickets = ticketsResponse.data?.data || [];
        tickets.slice(0, 3).forEach(ticket => {
          activities.push({
            id: `ticket-${ticket.id}`,
            site_id: ticket.site_id,
            name: ticket.site_name || 'Heritage Site',
            location: ticket.site_location || 'Karnataka',
            image: '',
            type: 'booking',
            date: ticket.issued_at
          });
        });
      } catch (e) {}
      
      // Sort by date and limit
      return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

export const userActivityService = new UserActivityService();