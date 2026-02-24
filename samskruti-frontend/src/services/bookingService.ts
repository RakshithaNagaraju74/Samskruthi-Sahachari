// services/bookingService.ts
import api from './api';

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  site_id: number;
  site_name: string;
  site_location?: string;
  site_image?: string;
  enterprise_id?: number;
  enterprise_name?: string;
  travel_date: string;
  travelers: number;
  total_amount: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  created_at: string;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: {
    user_id: number;
    site_id: number;
    travel_date: string;
    travelers: number;
    total_amount: number;
    special_requests?: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    try {
      const response = await api.post<ApiResponse<Booking>>('/api/bookings', bookingData);
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          booking: response.data.data
        };
      }
      
      return {
        success: false,
        error: response.data?.message || 'Failed to create booking'
      };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create booking'
      };
    }
  },

  // Get user's bookings
  getUserBookings: async (userId: number): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(`/api/user/bookings`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async (userId: number): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(`/api/user/bookings/upcoming`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  },

  // Get past bookings
  getPastBookings: async (userId: number): Promise<Booking[]> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(`/api/user/bookings/past`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching past bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId: number): Promise<Booking | null> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Get booking by reference
  getBookingByReference: async (reference: string): Promise<Booking | null> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/api/bookings/reference/${reference}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking by reference:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/api/bookings/${bookingId}/cancel`, { reason });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Booking cancelled successfully'
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Failed to cancel booking'
      };
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking'
      };
    }
  },

  // Get booking statistics
  getBookingStats: async (userId: number): Promise<{
    total_bookings: number;
    active_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/user/stats`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.bookings;
      }
      
      return {
        total_bookings: 0,
        active_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        total_spent: 0
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  }
};