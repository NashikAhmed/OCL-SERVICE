import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

interface CorporateProtectedRouteProps {
  children: React.ReactNode;
}

const CorporateProtectedRoute: React.FC<CorporateProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('corporateToken');
      const corporateInfo = localStorage.getItem('corporateInfo');

      if (!token || !corporateInfo) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch('/api/corporate/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Clear invalid data
          localStorage.removeItem('corporateToken');
          localStorage.removeItem('corporateInfo');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('corporateToken');
        localStorage.removeItem('corporateInfo');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
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
    return <Navigate to="/corporate" replace />;
  }

  return <>{children}</>;
};

export default CorporateProtectedRoute;
