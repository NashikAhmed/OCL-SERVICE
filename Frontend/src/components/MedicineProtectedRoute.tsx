import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity } from "lucide-react";

interface MedicineProtectedRouteProps {
  children: React.ReactNode;
}

const MedicineProtectedRoute: React.FC<MedicineProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('medicineToken');
      const info = localStorage.getItem('medicineInfo');

      if (!token || !info) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/medicine/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('medicineToken');
          localStorage.removeItem('medicineInfo');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Medicine auth check failed:', error);
        localStorage.removeItem('medicineToken');
        localStorage.removeItem('medicineInfo');
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
    return <Navigate to="/medicine" replace />;
  }

  return <>{children}</>;
};

export default MedicineProtectedRoute;


