// services/enterpriseDestinationService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BookingRequest {
  destination_id: number;
  travel_date: string;
  travelers: number;
  special_requests?: string;
  contact_phone: string;
  contact_email: string;
}

class EnterpriseDestinationService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Get all approved enterprise destinations for users
  async getApprovedDestinations() {
    try {
      const response = await axios.get(`${API_URL}/enterprise/destinations/approved`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved destinations:', error);
      throw error;
    }
  }

  // Get enterprise destination by ID
  async getDestinationById(id: number) {
    try {
      const response = await axios.get(`${API_URL}/enterprise/destinations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  }

  // Get destinations by enterprise
  async getDestinationsByEnterprise(enterpriseId: number) {
    try {
      const response = await axios.get(`${API_URL}/enterprise/${enterpriseId}/destinations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enterprise destinations:', error);
      throw error;
    }
  }

  // Get destinations by category
  async getDestinationsByCategory(category: string) {
    try {
      const response = await axios.get(`${API_URL}/enterprise/destinations/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destinations by category:', error);
      throw error;
    }
  }

  // Search destinations
  async searchDestinations(query: string) {
    try {
      const response = await axios.get(`${API_URL}/enterprise/destinations/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw error;
    }
  }

  // Create a booking
  async createBooking(bookingData: BookingRequest) {
    try {
      const response = await axios.post(
        `${API_URL}/enterprise/bookings`,
        bookingData,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings() {
    try {
      const response = await axios.get(
        `${API_URL}/user/bookings`,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: number) {
    try {
      const response = await axios.put(
        `${API_URL}/user/bookings/${bookingId}/cancel`,
        {},
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Add review
  async addReview(reviewData: any) {
    try {
      const response = await axios.post(
        `${API_URL}/user/reviews`,
        reviewData,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get destination stats
  async getDestinationStats(destinationId: number) {
    try {
      const response = await axios.get(`${API_URL}/enterprise/destinations/${destinationId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

export const enterpriseDestinationService = new EnterpriseDestinationService();