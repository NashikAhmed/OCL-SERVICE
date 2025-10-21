import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { isAdminLoggedIn, clearAuthData } from '@/utils/auth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  console.log('AdminProtectedRoute component rendering...');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      
      if (!isAdminLoggedIn()) {
        console.log('Not logged in or token expired, redirecting to login');
        clearAuthData();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying token with backend...');
        const token = localStorage.getItem('adminToken');
        // Verify token with backend
        const response = await fetch('/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          console.log('Authentication successful');
          setIsAuthenticated(true);
        } else {
          console.log('Authentication failed, clearing storage');
          clearAuthData();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  console.log('AdminProtectedRoute render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/admin" replace />;
  }

  console.log('Authenticated, rendering children');
  return <>{children}</>;
};

export default AdminProtectedRoute;
