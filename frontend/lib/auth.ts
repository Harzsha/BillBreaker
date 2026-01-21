import { create } from 'zustand';
import { authService, sessionStorage } from '@/lib/supabase';
import { User } from '@/constants/types';

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(email, password);
      
      if (!result.success) {
        const errorMessage =
          result.error instanceof Error ? result.error.message : 'Login failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }

      const userData = result.data?.user;
      const sessionData = result.data?.session;

      if (userData && sessionData) {
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.user_metadata?.full_name || 'User',
          avatar: userData.user_metadata?.avatar_url,
        };

        set({
          user,
          session: sessionData,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.signup(email, password, name);

      if (!result.success) {
        const errorMessage =
          result.error instanceof Error ? result.error.message : 'Signup failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }

      const userData = result.data?.user;
      const sessionData = result.data?.session;

      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.user_metadata?.full_name || name,
          avatar: userData.user_metadata?.avatar_url,
        };

        set({
          user,
          session: sessionData,
          isAuthenticated: !!sessionData,
          isLoading: false,
        });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Check for stored session
      const storedUser = await sessionStorage.getUser();
      const storedSession = await sessionStorage.getSession();
      const token = await sessionStorage.getToken();

      if (storedUser && storedSession && token) {
        const user: User = {
          id: storedUser.id,
          email: storedUser.email || '',
          name: storedUser.user_metadata?.full_name || 'User',
          avatar: storedUser.user_metadata?.avatar_url,
        };

        set({
          user,
          session: storedSession,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Try to get current user from Supabase
        const result = await authService.getCurrentUser();
        if (result.success && result.user) {
          const user: User = {
            id: result.user.id,
            email: result.user.email || '',
            name: result.user.user_metadata?.full_name || 'User',
            avatar: result.user.user_metadata?.avatar_url,
          };

          const sessionResult = await authService.getSession();
          set({
            user,
            session: sessionResult.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
