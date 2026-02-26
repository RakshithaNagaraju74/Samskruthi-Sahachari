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
    // Add detailed request logging
    console.log('🔍 [API Request] ==================================');
    console.log(`📍 URL: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`📦 Data:`, config.data || 'No data');
    console.log(`🔑 Headers:`, {
      ...config.headers,
      Authorization: config.headers?.Authorization ? 'Bearer [HIDDEN]' : 'None'
    });
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log(`🪙 Token in localStorage:`, token ? 'Present' : 'Missing');
      console.log(`🔄 Refresh Token:`, refreshToken ? 'Present' : 'Missing');
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No token found in localStorage!');
      }
    }

    console.log('==================================================');
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
    console.log('✅ [API Response] =================================');
    console.log(`📍 URL: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Data:`, response.data);
    console.log('==================================================');
    return response;
  },
  async (error: any) => {
    console.error('❌ [API Error] ==================================');
    console.error(`📍 URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error(`📊 Status: ${error.response?.status} ${error.response?.statusText}`);
    console.error(`📦 Error Data:`, error.response?.data);
    console.error(`💬 Message:`, error.message);
    console.error('==================================================');

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('🔐 401 Unauthorized detected - attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null;

        console.log('🔄 Refresh token:', refreshToken ? 'Present' : 'Missing');

        if (!refreshToken) {
          console.error('❌ No refresh token available - redirecting to login');
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/auth';
          }
          return Promise.reject(error);
        }

        console.log('🔄 Attempting to refresh token...');
        
        const refreshResponse = await axios.post<{
          token: string;
          refreshToken?: string;
        }>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        console.log('✅ Token refresh response:', refreshResponse.data);

        const newToken = refreshResponse.data.token;

        // Store new tokens
        localStorage.setItem('token', newToken);
        console.log('✅ New token stored');

        if (refreshResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
          console.log('✅ New refresh token stored');
        }

        // Update header and retry request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        console.log('🔄 Retrying original request with new token...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        if (typeof window !== 'undefined') {
          console.log('🚪 Redirecting to login...');
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
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('❌ Server Error Response:', {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers,
    });
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      `Server error: ${error.response.status}`
    );
  } else if (error.request) {
    // The request was made but no response was received
    console.error('❌ No Response Received:', error.request);
    return 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('❌ Request Setup Error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};

export default api;