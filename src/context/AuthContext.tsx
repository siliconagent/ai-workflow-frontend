// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth.types';
import { LoginCredentials, RegistrationData } from '@/types/common';
import api from '@/lib/api';
import jwtDecode from 'jwt-decode';

// Default auth context values
const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshToken: async () => false,
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  inviteUser: async () => {},
  clearErrors: () => {}
};


export const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token
          await validateToken(token);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  // Validate auth token
  const validateToken = async (token: string) => {
    try {
      // Decode token to check expiration
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token expired
        throw new Error('Token expired');
      }
      
      // Token is valid, fetch current user
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  };
  
  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      // Set token in local storage
      localStorage.setItem('auth_token', token);
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register user
  const register = async (data: RegistrationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/register', data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    try {
      api.post('/auth/logout').catch(err => console.log('Logout API error:', err));
    } finally {
      // Remove token from local storage
      localStorage.removeItem('auth_token');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Refresh auth token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token } = response.data;
      
      localStorage.setItem('auth_token', token);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };
  
  // Reset password (request)
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/reset-password', { email });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to request password reset.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update password
  const updatePassword = async (data: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/update-password', data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Invite a new user
  const inviteUser = async (data: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/users/invite', data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to invite user.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear any errors
  const clearErrors = () => {
    setError(null);
  };
  
  // Build context value
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    resetPassword,
    updatePassword,
    updateProfile,
    inviteUser,
    clearErrors
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
