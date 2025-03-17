import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authService from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await authService.login({ email, password });
        set({ 
          user: response.user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to login';
        set({ 
          isLoading: false, 
          isAuthenticated: false,
          error: errorMessage
        });
        return false;
      }
    },
    
    register: async (name: string, email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await authService.register({ name, email, password });
        set({ 
          user: response.user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to register';
        set({ 
          isLoading: false, 
          isAuthenticated: false,
          error: errorMessage
        });
        return false;
      }
    },
    
    logout: async () => {
      set({ isLoading: true });
      
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    },
    
    checkAuth: async () => {
      set({ isLoading: true });
      
      try {
        const user = await authService.getCurrentUser();
        
        if (user) {
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } else {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          return false;
        }
      } catch (error) {
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return false;
      }
    },
    
    clearError: () => {
      set({ error: null });
    }
  }))
);

export default useAuthStore;
