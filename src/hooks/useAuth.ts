import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthContextType } from '@/types/auth.types';

/**
 * Hook for accessing the authentication context
 * 
 * @returns {AuthContextType} Authentication context with user state and auth methods
 */
export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authContext as AuthContextType;
};

export default useAuth;
