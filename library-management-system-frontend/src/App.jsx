import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import PasswordResetPage from './PasswordResetPage.jsx';

// Protected Route wrapper
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Redirect authenticated users away from login
function PublicRoute({ children, isAuthenticated }) {
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!token || !refreshToken) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/auth/me` : '/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // If token is invalid, clean up local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('role');
          localStorage.removeItem('permissions');
          localStorage.removeItem('token_type');
        }
      } catch (error) {
        console.error('Failed to verify token:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b11]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <Login setIsAuthenticated={setIsAuthenticated} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <PasswordResetPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
