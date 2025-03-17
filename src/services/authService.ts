import apiService from '../lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}

class AuthService {
    simpleMock = true;
  /**
   * Login with email and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
     if(this.simpleMock) {
         apiService.setAuthToken("Mock token");
         localStorage.setItem('refresh_token', "Mock refresh token");
         return {
           token: "Mock token",
           refreshToken: "Mock refresh token",
           user: {
             id: "Mock id",
             name: "Mock name",
             email: "mock@example.com",
             roles: ["Mock role"]
           }
         };
     } else {
         const response = await apiService.post<AuthResponse>('/auth/login', credentials);
         
         if (response.data.token) {
           // Store tokens
           apiService.setAuthToken(response.data.token);
           localStorage.setItem('refresh_token', response.data.refreshToken);
       }
         
         return response.data;
     }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', data);
      
      if (response.data.token) {
        // Store tokens
        apiService.setAuthToken(response.data.token);
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  public async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API response
      apiService.clearAuthToken();
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Get the current authenticated user
   */
  public async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      if (!apiService.isAuthenticated()) {
        return null;
      }
      
      const response = await apiService.get<{ user: AuthResponse['user'] }>('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Refresh the auth token
   */
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return null;
      }
      
      const response = await apiService.post<{ token: string }>('/auth/refresh-token', { refreshToken });
      
      if (response.data.token) {
        apiService.setAuthToken(response.data.token);
        return response.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
