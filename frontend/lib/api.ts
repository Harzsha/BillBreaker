import axios, { AxiosInstance } from 'axios';
import { sessionStorage } from '@/lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await sessionStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Token refresh logic here if needed
        // For now, just log the error
        console.error('Authentication failed. Please login again.');
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authEndpoints = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (email: string, password: string, name: string) =>
    api.post('/auth/signup', { email, password, name }),
};

// API Service - All endpoints
export const apiService = {
  // Auth
  ...authEndpoints,

  // Groups
  getGroups: () => api.get('/groups'),
  getGroup: (groupId: string) => api.get(`/groups/${groupId}`),
  createGroup: (data: any) => api.post('/groups', data),
  updateGroup: (groupId: string, data: any) => api.put(`/groups/${groupId}`, data),
  deleteGroup: (groupId: string) => api.delete(`/groups/${groupId}`),

  // Expenses
  createExpense: (data: any) => api.post('/expenses', data),
  getExpenses: (groupId: string) => api.get(`/expenses/${groupId}`),
  getGroupExpenses: (groupId: string) => api.get(`/expenses/${groupId}`),
  updateExpense: (expenseId: string, data: any) => api.put(`/expenses/${expenseId}`, data),
  deleteExpense: (expenseId: string) => api.delete(`/expenses/${expenseId}`),

  // Voice/AI Processing
  processVoiceExpense: (formData: FormData) =>
    api.post('/expenses/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Balances
  getBalances: (groupId: string) => api.get(`/balances/${groupId}`),

  // Settlements
  createSettlement: (data: any) => api.post('/settlements', data),
  getSettlements: (groupId: string) => api.get(`/settlements/${groupId}`),

  // Users
  getUser: (userId: string) => api.get(`/users/${userId}`),
  updateUser: (userId: string, data: any) => api.put(`/users/${userId}`, data),
  getCurrentUser: () => api.get('/users/me'),

  // Health check
  health: () => api.get('/test'),
};

export default api;
