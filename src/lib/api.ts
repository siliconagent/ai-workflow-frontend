import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a base API instance
const baseURL = import.meta.env.REACT_APP_API_URL || '/api';

class ApiService {
  private axiosInstance: AxiosInstance;
  private tokenKey = 'auth_token';
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.post('/auth/refresh-token', { refreshToken });
              const { token } = response.data;
              
              localStorage.setItem(this.tokenKey, token);
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, redirect to login
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem('refresh_token');
            
            // In a real app, you might want to use a router instead
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  public async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  // GET method
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  // POST method
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  // PUT method
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  // PATCH method
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  // DELETE method
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // Set auth token
  public setAuthToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get auth token
  public getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Clear auth token
  public clearAuthToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
