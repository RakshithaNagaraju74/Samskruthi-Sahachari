// services/ticketService.ts
import api from './api';

export interface Ticket {
  id: number;
  ticket_number: string;
  booking_id?: number;
  user_id: number;
  site_id: number;
  site_name: string;
  site_location?: string;
  site_image?: string;
  travel_date: string;
  travelers: number;
  total_price: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qr_code?: string;
  destination_name?: string;
destination_image?: string;
destination_location?: string;
  issued_at: string;
  expires_at: string;
  used_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  booking_reference?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface ValidateTicketResponse {
  valid: boolean;
  message: string;
  ticket?: {
    ticket_number: string;
    site_name: string;
    site_location: string;
    user_name?: string;
    travel_date: string;
    travelers: number;
  };
}

export const ticketService = {
  // Get all tickets for a user
  getUserTickets: async (userId: number, includeHistory: boolean = true): Promise<Ticket[]> => {
    try {
      const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}?history=${includeHistory}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  // Get single ticket by ticket number
  getTicket: async (ticketNumber: string): Promise<Ticket | null> => {
    try {
      const response = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketNumber}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ticket ${ticketNumber}:`, error);
      throw error;
    }
  },

  // Get upcoming tickets
  getUpcomingTickets: async (userId: number): Promise<Ticket[]> => {
    try {
      const response = await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}/upcoming`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching upcoming tickets:', error);
      throw error;
    }
  },

  // Create ticket from booking
  createTicket: async (bookingData: {
    booking_id?: number;
    user_id: number;
    site_id: number;
    site_name: string;
    site_location: string;
    travel_date: string;
    travelers: number;
    total_price: number;
  }): Promise<Ticket | null> => {
    try {
      const response = await api.post<ApiResponse<Ticket>>('/tickets/create', bookingData);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Cancel a ticket
  cancelTicket: async (ticketNumber: string, userId: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/tickets/${ticketNumber}/cancel`, {
        reason
      });
      
      if (response.data && response.data.success) {
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

  // Download ticket
  downloadTicket: async (ticketNumber: string): Promise<void> => {
    try {
      const ticket = await ticketService.getTicket(ticketNumber);
      if (ticket) {
        // Create PDF content
        const content = `
          KARNATAKA HERITAGE - ENTRY TICKET
          =================================
          Ticket Number: ${ticket.ticket_number}
          Site: ${ticket.site_name}
          Location: ${ticket.site_location || 'Karnataka'}
          Date: ${new Date(ticket.travel_date).toLocaleDateString()}
          Travelers: ${ticket.travelers}
          Total: ₹${ticket.total_price}
          Status: ${ticket.status}
          
          Please present this ticket at the entrance.
          Valid ID proof is required.
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketNumber}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      throw error;
    }
  },

  // Get ticket statistics
  getTicketStats: async (userId: number): Promise<{
    total_tickets: number;
    active_tickets: number;
    used_tickets: number;
    expired_tickets: number;
    cancelled_tickets: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/tickets/stats/${userId}`);
      
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
      throw error;
    }
  },

  // Share ticket via email
  shareTicket: async (ticketNumber: string, email: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/tickets/${ticketNumber}/share`, { email });
      return response.data?.success || false;
    } catch (error) {
      console.error('Error sharing ticket:', error);
      return false;
    }
  }
};