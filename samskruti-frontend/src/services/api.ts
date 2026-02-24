// services/api.ts
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// =============================
// REQUEST INTERCEPTOR
// =============================

api.interceptors.request.use(
  (config: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// =============================
// RESPONSE INTERCEPTOR
// =============================

api.interceptors.response.use(
  (response: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('refreshToken')
            : null;

        if (!refreshToken) {
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/auth';
          }
          return Promise.reject(error);
        }

        // Properly type refresh response
        const refreshResponse = await axios.post<{
          token: string;
          refreshToken?: string;
        }>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = refreshResponse.data.token;

        // Store new tokens
        localStorage.setItem('token', newToken);

        if (refreshResponse.data.refreshToken) {
          localStorage.setItem(
            'refreshToken',
            refreshResponse.data.refreshToken
          );
        }

        // Update header and retry request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/auth';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =============================
// ERROR HANDLER
// =============================

export const handleApiError = (error: any): string => {
  if (error.response) {
    return (
      error.response.data?.message ||
      error.message ||
      'An error occurred'
    );
  } else if (error.request) {
    return 'No response from server. Please check your internet connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api;