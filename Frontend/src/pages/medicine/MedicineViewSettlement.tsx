import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '@/components/medicine/MedicineSidebar';
import Settlement from '@/components/medicine/Settlement';
import { Loader2 } from 'lucide-react';

interface MedicineUserInfo {
  id: string;
  name: string;
  email: string;
}

const MedicineViewSettlement: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <MedicineSidebar 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} 
      />
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="space-y-6 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">View Settlement</h1>
              <p className="text-sm text-gray-500 mt-1">Monthly settlement statement</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,24,40,0.08)] border border-gray-100">
            <Settlement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicineViewSettlement;


