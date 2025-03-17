import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import useAuthStore from '../../store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthentication = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        navigate('/');
      }
    };
    
    checkAuthentication();
  }, [checkAuth, navigate, isAuthenticated]);
  
  const handleLoginSuccess = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Workflow AI</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
