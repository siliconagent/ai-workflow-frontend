import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/index';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import WorkflowsPage from './pages/workflows/index';
import WorkflowDetailPage from './pages/workflows/[id]';
import NewWorkflowPage from './pages/workflows/new';
import apiService from './lib/api';
import './styles/index.css';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/workflows" element={
          <ProtectedRoute>
            <WorkflowsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/workflows/new" element={
          <ProtectedRoute>
            <NewWorkflowPage />
          </ProtectedRoute>
        } />
        
        <Route path="/workflows/:id" element={
          <ProtectedRoute>
            <WorkflowDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
