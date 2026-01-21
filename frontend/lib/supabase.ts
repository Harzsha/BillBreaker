import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Session management utilities
export const sessionStorage = {
  setSession: async (session: any) => {
    if (session) {
      await AsyncStorage.setItem('authSession', JSON.stringify(session));
    }
  },
  getSession: async () => {
    const session = await AsyncStorage.getItem('authSession');
    return session ? JSON.parse(session) : null;
  },
  clearSession: async () => {
    await AsyncStorage.removeItem('authSession');
  },
  setUser: async (user: any) => {
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
  },
  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  clearUser: async () => {
    await AsyncStorage.removeItem('user');
  },
  setToken: async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
  },
  getToken: async () => {
    return await AsyncStorage.getItem('authToken');
  },
  clearToken: async () => {
    await AsyncStorage.removeItem('authToken');
  },
};

// Helper function to get UPI link for settlements
export const getUPILink = (amount: number, phone: string, upiId: string, name: string) => {
  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(`Settlement from BillBreak AI`);
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&tn=${encodedNote}`;
};

// Auth service using custom backend API
export const authService = {
  // Sign up with email and password
  signup: async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        name,
      });

      const { token, id, email: userEmail, name: userName } = response.data;

      // Create user object
      const user = {
        id,
        email: userEmail,
        user_metadata: {
          full_name: userName,
        },
      };

      // Store user and token locally
      await sessionStorage.setUser(user);
      await sessionStorage.setToken(token);
      await sessionStorage.setSession({ access_token: token });

      return { success: true, data: { user, session: { access_token: token } } };
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Signup failed';
      return { success: false, error: new Error(errorMessage) };
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, id, email: userEmail, name: userName } = response.data;

      // Create user object
      const user = {
        id,
        email: userEmail,
        user_metadata: {
          full_name: userName,
        },
      };

      // Store user and token locally
      await sessionStorage.setUser(user);
      await sessionStorage.setToken(token);
      await sessionStorage.setSession({ access_token: token });

      return { success: true, data: { user, session: { access_token: token } } };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: new Error(errorMessage) };
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear local storage
      await sessionStorage.clearUser();
      await sessionStorage.clearSession();
      await sessionStorage.clearToken();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const token = await sessionStorage.getToken();
      const session = await sessionStorage.getSession();
      
      if (token && session) {
        return { success: true, session };
      }
      return { success: false, session: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error };
    }
  },

  // Refresh token (not used with current backend, but kept for compatibility)
  refreshToken: async () => {
    try {
      const token = await sessionStorage.getToken();
      const session = await sessionStorage.getSession();
      
      if (token && session) {
        return { success: true, session };
      }
      return { success: false, session: null };
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false, error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = await sessionStorage.getUser();
      if (user) {
        return { success: true, user };
      }
      return { success: false, user: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error };
    }
  },
};

// Create a dummy supabase export for compatibility
export const supabase = {
  auth: authService,
};

export default supabase;
