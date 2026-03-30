import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, clearAuth, getUser } from '../../utils/auth';
import { authAPI } from '../../utils/api';

/**
 * ProtectedRoute - Validates authentication before rendering children
 * Uses backend token validation to ensure security
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [authState, setAuthState] = useState({
    isChecking: true,
    isAuthenticated: false,
    user: null,
  });
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      const token = getToken();
      
      // No token = not authenticated
      if (!token) {
        setAuthState({
          isChecking: false,
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      try {
        // Validate token with backend
        const response = await authAPI.getMe();
        const user = response.data;

        // Check role restrictions
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          setAuthState({
            isChecking: false,
            isAuthenticated: false,
            user: null,
          });
          return;
        }

        setAuthState({
          isChecking: false,
          isAuthenticated: true,
          user,
        });
      } catch (error) {
        // Token invalid or expired
        console.error('Auth validation failed:', error);
        clearAuth();
        setAuthState({
          isChecking: false,
          isAuthenticated: false,
          user: null,
        });
      }
    };

    validateAuth();
  }, [allowedRoles]);

  // Show loading spinner while checking auth
  if (authState.isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">
            <span className="material-symbols-outlined text-primary text-5xl">refresh</span>
          </div>
          <p className="font-['Press_Start_2P'] text-[10px] text-secondary">
            VERIFYING IDENTITY...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated - render children
  return children;
};

export default ProtectedRoute;
