import React from 'react';
import { LogOut, LayoutGrid, Package, BarChart3, X, Menu, History, Truck, ClipboardList, Send, CheckCircle, Warehouse, FileText, Calculator } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicineSidebarProps {
  user: { name: string; email: string } | null;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const MedicineSidebar: React.FC<MedicineSidebarProps> = ({ 
  user, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  onLogout 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0 flex flex-col bg-white rounded-r-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-gray-100 z-20 transition-all duration-300 ease-in-out`}>
      {/* Header Section - Fixed */}
      <div className={`${isSidebarCollapsed ? 'p-3' : 'p-5'} flex-shrink-0`}>
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

        {/* Medicine logo and text section */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'gap-3 mb-6'}`}>
          <div className="p-3 rounded-xl bg-white shadow-inner">
            <LayoutGrid className="h-6 w-6 text-blue-600" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">Medicine Portal</h2>
              <p className="text-xs text-gray-500">Shipment Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        <nav className={`${isSidebarCollapsed ? 'space-y-2 px-3 pb-4' : 'space-y-3 px-5 pb-4'}`}>
          <button
            onClick={() => navigate('/medicine/dashboard')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/dashboard')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Dashboard" : ""}
          >
            <BarChart3 className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Dashboard</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/booking')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/booking')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Booking" : ""}
          >
            <Package className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Booking</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/history')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/history')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "History" : ""}
          >
            <History className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">History</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/consignment')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/consignment')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Consignment" : ""}
          >
            <ClipboardList className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Consignment</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/dispatch-consignment')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/dispatch-consignment')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Dispatch Consignment" : ""}
          >
            <Send className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Dispatch Consignment</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/manifest')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/manifest')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Ready to Dispatch" : ""}
          >
            <ClipboardList className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Ready to Dispatch</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/coloader')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/coloader')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Coloader" : ""}
          >
            <Warehouse className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Coloader</span>}
          </button>

          <button
            onClick={() => navigate('/medicine/view-manifest')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/view-manifest')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "View Manifest" : ""}
          >
            <FileText className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">View Manifest</span>}
          </button>

          {/* Settlement */}
          <button
            onClick={() => navigate('/medicine/view-settlement')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              isActive('/medicine/view-settlement')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Settlement" : ""}
          >
            <Calculator className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Settlement</span>}
          </button>
        </nav>
      </div>

      {/* Footer Section - Fixed at Bottom */}
      <div className={`${isSidebarCollapsed ? 'p-2' : 'p-5'} border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0`}>
        {!isSidebarCollapsed ? (
          <>
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Badge
                variant="secondary"
                className="px-3 py-1"
              >
                Medicine User
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

export default MedicineSidebar;