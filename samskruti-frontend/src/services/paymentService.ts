// services/paymentService.ts
import api from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    site_id: number;
    site_name: string;
    travelers: number;
    travel_date: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface OrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  message?: string;
}

export const paymentService = {
  // Create a Razorpay order
  createOrder: async (amount: number, receipt: string, notes?: any): Promise<OrderResponse> => {
    try {
      const response = await api.post('/payments/create-order', {
        amount,
        receipt,
        notes
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          order: response.data.order
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Failed to create order'
      };
    } catch (error: any) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  },

  // Verify payment
  verifyPayment: async (paymentData: any): Promise<{ success: boolean; message: string; booking?: any }> => {
    try {
      const response = await api.post('/payments/verify', paymentData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: 'Payment verified successfully',
          booking: response.data.booking
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Payment verification failed'
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed'
      };
    }
  },

  // Load Razorpay script
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Open Razorpay checkout
  openCheckout: (options: PaymentOptions): void => {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }
};