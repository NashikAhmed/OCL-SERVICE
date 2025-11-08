import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  DollarSign,
  LogOut,
  X,
  Menu,
  Building2,
  MessageSquare,
  Calendar,
  Truck,
  Receipt,
  User,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface CorporateInfo {
  id: string;
  corporateId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  username: string;
  lastLogin: string;
  isFirstLogin: boolean;
  logo?: string;
}

interface CorporateSidebarProps {
  corporate: CorporateInfo | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const CorporateSidebar: React.FC<CorporateSidebarProps> = ({
  corporate,
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onLogout,
}) => {
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0 flex flex-col justify-between bg-white rounded-r-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-gray-100 z-20 transition-all duration-300 ease-in-out`}>
      <div className={`${isSidebarCollapsed ? 'p-3' : 'p-5'}`}>
        {/* Button area - dedicated space for cross/expand buttons */}
        <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'} mb-4`}>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="h-5 w-5 text-gray-600" />
            ) : (
              <X className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Corporate logo and text section */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'gap-3 mb-6'}`}>
          <div className="p-3 rounded-xl bg-white shadow-inner">
            {corporate?.logo ? (
              <img 
                src={`http://localhost:5000${corporate.logo}`} 
                alt={`${corporate.companyName} Logo`}
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  // Fallback to Building2 icon if image fails to load
                  const target = e.currentTarget as HTMLImageElement;
                  const nextElement = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
            ) : null}
            <Building2 
              className={`h-6 w-6 text-blue-600 ${corporate?.logo ? 'hidden' : 'block'}`} 
            />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {corporate?.companyName || 'Corporate Portal'}
              </h2>
              <p className="text-xs text-gray-500">OCL Services</p>
            </div>
          )}
        </div>

        <nav className={`${isSidebarCollapsed ? 'space-y-2' : 'space-y-3'}`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Dashboard" : ""}
          >
            <BarChart3 className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Pricing" : ""}
          >
            <DollarSign className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Pricing</span>}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Company Profile" : ""}
          >
            <User className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Company Profile</span>}
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'booking'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Booking" : ""}
          >
            <Calendar className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Booking</span>}
          </button>

          <button
            onClick={() => setActiveTab('shipments')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'shipments'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Shipments" : ""}
          >
            <Truck className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Shipments</span>}
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'complaints'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Complaint Desk" : ""}
          >
            <MessageSquare className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Complaint Desk</span>}
          </button>

          <button
            onClick={() => setActiveTab('courier-complaints')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'courier-complaints'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Courier Complaints" : ""}
          >
            <AlertTriangle className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Courier Complaints</span>}
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'settlement'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Settlement" : ""}
          >
            <Receipt className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Settlement</span>}
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'help'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Help & Resources" : ""}
          >
            <HelpCircle className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Help & Resources</span>}
          </button>
        </nav>
      </div>

      {/* Footer - Corporate info */}
      <div className={`${isSidebarCollapsed ? 'p-2' : 'p-5'} border-t border-gray-100 bg-gray-50 rounded-b-2xl`}>
        {!isSidebarCollapsed ? (
          <>
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-gray-800">{corporate?.companyName}</p>
              <p className="text-xs text-gray-500">{corporate?.email}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1"
              >
                {corporate?.corporateId}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white/90"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/90 p-2 hover:bg-gray-100 transition-colors"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CorporateSidebar;
