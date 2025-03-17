import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuthStore from '../../store/authStore';

const RegisterPage: React.FC = () => {
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
  
  const handleRegisterSuccess = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Workflow AI</h1>
          <p className="text-muted-foreground mt-2">Create a new account</p>
        </div>
        
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;
