import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MedicineSidebar from '@/components/medicine/MedicineSidebar';
import Settlement from '@/components/medicine/Settlement';
import { AlertCircle, Loader2, Package } from 'lucide-react';

interface MedicineUserInfo {
  id: string;
  email: string;
  name: string;
  lastLogin?: string;
}

const MedicineDashboard: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const settlementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('medicineToken');
    const info = localStorage.getItem('medicineInfo');
    if (!token || !info) {
      navigate('/medicine');
      return;
    }
    try {
      setUser(JSON.parse(info));
    } catch {
      navigate('/medicine');
      return;
    }
    setIsLoading(false);
  }, [navigate]);

  // Scroll to settlement section when hash is #settlement
  useEffect(() => {
    if (location.hash === '#settlement' && settlementRef.current) {
      settlementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const showSettlement = location.hash === '#settlement';

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <MedicineSidebar 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} 
      />
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,24,40,0.08)] border border-gray-100 p-6 min-h-[calc(100vh-3rem)]">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Medicine Dashboard</h1>
          
          {!showSettlement ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/medicine/booking')}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Create Booking</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Create a new medicine shipment booking</p>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                    Create Booking
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/medicine/history')}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">My Bookings</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">View and manage your existing bookings</p>
                  <button className="text-green-600 text-sm font-medium hover:text-green-800 flex items-center">
                    View Bookings
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => navigate('/medicine/booking')}
                  >
                    <h3 className="font-medium text-blue-800 mb-2">New Booking</h3>
                    <p className="text-blue-600 text-sm">Create a new medicine shipment booking with our easy form.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">Booking Guidelines</h3>
                    <div className="text-green-600 text-sm">
                      <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Use our platform to return expired medicine from retailers to companies</li>
                        <li>Only medicine items are allowed for shipping - no other items permitted</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div ref={settlementRef}>
              <Settlement />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineDashboard;