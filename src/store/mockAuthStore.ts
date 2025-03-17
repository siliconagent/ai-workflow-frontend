import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface MockAuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Mock actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  autoLogin: () => void; // Automatically log in for development
}

// Create a mock user
const mockUser: MockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  roles: ['admin', 'designer']
};

export const useMockAuthStore = create<MockAuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate successful login for demo
        if (email.includes('@') && password.length > 2) {
          set({ 
            user: mockUser,
            isAuthenticated: true, 
            isLoading: false
          });
          // Store flag in localStorage for persistent login
          localStorage.setItem('mock_auth', 'true');
          return true;
        } else {
          set({ 
            error: 'Invalid email or password', 
            isLoading: false,
            isAuthenticated: false
          });
          return false;
        }
      },
      
      logout: () => {
        localStorage.removeItem('mock_auth');
        set({ 
          user: null, 
          isAuthenticated: false
        });
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Always successful for demo
        set({ 
          user: { ...mockUser, name, email },
          isAuthenticated: true, 
          isLoading: false
        });
        
        // Store flag in localStorage for persistent login
        localStorage.setItem('mock_auth', 'true');
        return true;
      },
      
      autoLogin: () => {
        const hasAuth = localStorage.getItem('mock_auth') === 'true';
        if (hasAuth) {
          set({ 
            user: mockUser,
            isAuthenticated: true
          });
        }
      }
    }),
    { name: 'mock-auth-store' }
  )
);
