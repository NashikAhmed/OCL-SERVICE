import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '@/components/medicine/MedicineSidebar';
import MedicineBookingPanel from '@/components/medicine/MedicineBookingPanel';

interface MedicineUserInfo {
  id: string;
  email: string;
  name: string;
}

const MedicineBooking: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <MedicineSidebar 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} 
      />
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="min-h-[calc(100vh-3rem)]">
          <MedicineBookingPanel />
        </div>
      </main>
    </div>
  );
};

export default MedicineBooking;