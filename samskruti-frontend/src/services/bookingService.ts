// services/bookingService.ts
import api from './api';

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  site_id: number;
  enterprise_id?: number;
  travel_date: string;
  travelers: number;
  special_requests?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  site_name?: string;
  site_location?: string;
  site_image?: string;
  enterprise_name?: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  booking_id: number;
  user_id: number;
  site_id: number;
  site_name: string;
  site_location: string;
  qr_code?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  issued_at: string;
  used_at?: string;
  expires_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

// Extended Ticket with booking information
export interface ExtendedTicket extends Ticket {
  travel_date?: string;
  travelers?: number;
  total_amount?: number;
  booking_reference?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

// Helper function to get user ID from token
const getUserIdFromToken = (): number | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return payload.id || payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const bookingService = {
  // Get user's bookings
  getUserBookings: async (): Promise<Booking[]> => {
    try {
      console.log('📅 Fetching user bookings...');
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/user');
      
      if (response.data && response.data.success) {
        console.log(`✅ Fetched ${response.data.data?.length || 0} bookings`);
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching user bookings:', error?.response?.data || error.message);
      return [];
    }
  },

  // Get user's tickets with booking details
  getUserTickets: async (): Promise<ExtendedTicket[]> => {
    try {
      // Get user ID from token
      const userId = getUserIdFromToken();
      
      if (!userId) {
        console.error('❌ No user ID available to fetch tickets');
        return [];
      }
      
      console.log(`🎟️ Fetching tickets for user: ${userId}`);
      
      // Fetch tickets
      const ticketsResponse = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}?history=true`);
      
      if (!ticketsResponse.data?.success || !ticketsResponse.data?.data) {
        return [];
      }
      
      const tickets = ticketsResponse.data.data;
      console.log(`✅ Fetched ${tickets.length} tickets`);
      
      // Fetch bookings to get additional details
      const bookingsResponse = await api.get<ApiResponse<Booking[]>>('/bookings/user');
      const bookings = bookingsResponse.data?.success ? bookingsResponse.data.data || [] : [];
      
      // Create a map of booking_id to booking for quick lookup
      const bookingMap = new Map<number, Booking>();
      bookings.forEach(booking => {
        bookingMap.set(booking.id, booking);
      });
      
      // Merge ticket data with booking data
      const extendedTickets: ExtendedTicket[] = tickets.map(ticket => {
        const booking = bookingMap.get(ticket.booking_id);
        
        return {
          ...ticket,
          travel_date: booking?.travel_date,
          travelers: booking?.travelers,
          total_amount: booking?.total_amount,
          booking_reference: booking?.booking_reference,
        };
      });
      
      console.log(`✅ Enhanced ${extendedTickets.length} tickets with booking data`);
      return extendedTickets;
      
    } catch (error: any) {
      console.error('Error fetching tickets:', error?.response?.data || error.message);
      return [];
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId: number): Promise<Booking | null> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching booking:', error?.response?.data || error.message);
      return null;
    }
  },

  // Get booking by reference
  getBookingByReference: async (reference: string): Promise<Booking | null> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/reference/${reference}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching booking by reference:', error?.response?.data || error.message);
      return null;
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async (): Promise<Booking[]> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];
      
      const response = await api.get<ApiResponse<Booking[]>>(`/bookings/user/${userId}/upcoming`);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching upcoming bookings:', error?.response?.data || error.message);
      return [];
    }
  },

  // Get past bookings
  getPastBookings: async (): Promise<Booking[]> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];
      
      const response = await api.get<ApiResponse<Booking[]>>(`/bookings/user/${userId}/past`);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching past bookings:', error?.response?.data || error.message);
      return [];
    }
  },

  // Create booking
  createBooking: async (bookingData: {
    user_id: number;
    site_id: number;
    enterprise_id?: number | null;
    travel_date: string;
    travelers: number;
    total_amount: number;
    special_requests?: string | null;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    try {
      console.log('📝 Creating booking with data:', bookingData);
      
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      
      if (response.data && response.data.success && response.data.data) {
        // Dispatch event to refresh dashboard
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('booking-updated', { 
            detail: { type: 'booking', bookingId: response.data.data.id } 
          }));
        }
        
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
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || `Server error: ${error.response.status}`
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No response from server. Please check your connection.'
        };
      } else {
        return {
          success: false,
          error: error.message || 'Failed to create booking'
        };
      }
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/bookings/${bookingId}/cancel`, { reason });
      
      if (response.data && response.data.success) {
        // Dispatch event to refresh dashboard
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('booking-updated', { 
            detail: { type: 'cancel', bookingId } 
          }));
        }
        
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
  getBookingStats: async (): Promise<{
    total_bookings: number;
    active_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
  }> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        return {
          total_bookings: 0,
          active_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0,
          total_spent: 0
        };
      }
      
      const response = await api.get<ApiResponse<any>>(`/bookings/user/${userId}/stats`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
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
      return {
        total_bookings: 0,
        active_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        total_spent: 0
      };
    }
  },

  // Get ticket by ID
  getTicketById: async (ticketId: number): Promise<Ticket | null> => {
    try {
      const response = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  },

  // Get ticket by ticket number with booking details
  // services/bookingService.ts - Update this method (around line 360)

// Get ticket by ticket number with booking details
// services/bookingService.ts - Update getTicketByNumber method (around line 360)

// Get ticket by ticket number with booking details
getTicketByNumber: async (ticketNumber: string): Promise<ExtendedTicket | null> => {
  try {
    console.log(`🔍 Fetching ticket by number: ${ticketNumber}`);
    
    // Use the correct endpoint - should match your backend route
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketNumber}`);
    
    if (!response.data?.success || !response.data?.data) {
      console.error('Ticket not found in API');
      return null;
    }
    
    const ticket = response.data.data;
    console.log('✅ Ticket found:', ticket);
    
    // The backend now returns extended ticket with booking data
    // So we can just return it directly
    return ticket as ExtendedTicket;
    
  } catch (error) {
    console.error('Error fetching ticket by number:', error);
    return null;
  }
},

  // Get active tickets
  getActiveTickets: async (): Promise<Ticket[]> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];
      
      const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}/active`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching active tickets:', error);
      return [];
    }
  },

  // Get upcoming tickets
  getUpcomingTickets: async (): Promise<Ticket[]> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];
      
      const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}/upcoming`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching upcoming tickets:', error);
      return [];
    }
  },

  // Cancel ticket
  cancelTicket: async (ticketNumber: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/tickets/${ticketNumber}/cancel`, { reason });
      
      if (response.data && response.data.success) {
        // Dispatch event to refresh dashboard
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ticket-updated', { 
            detail: { type: 'cancel', ticketNumber } 
          }));
        }
        
        return {
          success: true,
          message: response.data.message || 'Ticket cancelled successfully'
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Failed to cancel ticket'
      };
    } catch (error: any) {
      console.error('Error cancelling ticket:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel ticket'
      };
    }
  },

  // Verify ticket
  verifyTicket: async (ticketNumber: string, qrToken: string): Promise<{ 
    valid: boolean; 
    message: string; 
    ticket?: any;
  }> => {
    try {
      const response = await api.post<ApiResponse<any>>('/tickets/verify', {
        ticket_number: ticketNumber,
        qr_token: qrToken
      });
      
      if (response.data && response.data.success) {
        return {
          valid: true,
          message: response.data.message || 'Ticket verified successfully',
          ticket: response.data.data
        };
      }
      
      return {
        valid: false,
        message: response.data?.message || 'Invalid ticket'
      };
    } catch (error: any) {
      console.error('Error verifying ticket:', error);
      return {
        valid: false,
        message: error.response?.data?.message || 'Failed to verify ticket'
      };
    }
  },

  // Get ticket statistics
  getTicketStats: async (): Promise<{
    total_tickets: number;
    active_tickets: number;
    used_tickets: number;
    expired_tickets: number;
    cancelled_tickets: number;
  }> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        return {
          total_tickets: 0,
          active_tickets: 0,
          used_tickets: 0,
          expired_tickets: 0,
          cancelled_tickets: 0
        };
      }
      
      const response = await api.get<ApiResponse<any>>(`/tickets/user/${userId}/stats`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return {
        total_tickets: 0,
        active_tickets: 0,
        used_tickets: 0,
        expired_tickets: 0,
        cancelled_tickets: 0
      };
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return {
        total_tickets: 0,
        active_tickets: 0,
        used_tickets: 0,
        expired_tickets: 0,
        cancelled_tickets: 0
      };
    }
  },

  // Download ticket (generate PDF)
  downloadTicket: async (ticketNumber: string): Promise<Blob | null> => {
    try {
      const response = await api.get<Blob>(
        `/tickets/${ticketNumber}/download`,
        {
          responseType: 'blob'
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error('Error downloading ticket:', error);
      return null;
    }
  },

  // Send ticket via email
  emailTicket: async (ticketNumber: string, email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/tickets/${ticketNumber}/email`, { email });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Ticket sent successfully'
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Failed to send ticket'
      };
    } catch (error: any) {
      console.error('Error emailing ticket:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send ticket'
      };
    }
  },

  // Bulk get tickets for multiple IDs
  getTicketsBatch: async (ticketIds: number[]): Promise<Ticket[]> => {
    try {
      const response = await api.post<ApiResponse<Ticket[]>>('/tickets/batch', { ticket_ids: ticketIds });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tickets batch:', error);
      return [];
    }
  },

  // Search tickets
  searchTickets: async (query: string): Promise<Ticket[]> => {
    try {
      const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/search?q=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching tickets:', error);
      return [];
    }
  }
};