import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  User,
  FileText,
  MapPin,
  LogOut,
  BarChart3,
  Settings,
  Shield,
  Activity,
  UserCog,
  Crown,
  Truck,
  X,
  Menu,
  DollarSign,
  CheckCircle,
  Building2,
  Package,
  Bike,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isAdminLoggedIn, getStoredAdminInfo, getStoredToken, clearAuthData, isTokenExpired, getTimeUntilExpiry } from '@/utils/auth';
import AddressFormsTable from '@/components/admin/AddressFormsTable';
import PincodeManagement from '@/components/admin/PincodeManagement';
import UserManagement from '@/components/admin/UserManagement';
import AdminManagement from '@/components/admin/AdminManagement';
import ColoaderRegistration from '@/components/admin/ColoaderRegistration';
import ColoaderManagement from '@/components/admin/ColoaderManagement';
import CorporatePricing from '@/components/admin/CorporatePricing';
import CorporateApproval from '@/components/admin/CorporateApproval';
import TestComponent from '@/components/admin/TestComponent';
import CorporateRegistration from '@/components/admin/CorporateRegistration';
import CorporateManagement from '@/components/admin/CorporateManagement';
import AssignConsignment from '@/components/admin/AssignConsignment';
import CourierRequests from '@/components/admin/CourierRequests';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import EmployeeRegistration from '@/components/admin/EmployeeRegistration';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import AssignColoader from '@/components/admin/AssignColoader';
import ReceivedConsignment from '@/components/admin/ReceivedConsignment';
import BaggingManagement from '@/components/admin/BaggingManagement';
import AssignCourierBoy from '@/components/admin/AssignCourierBoy';
import CourierBoyManagement from '@/components/admin/CourierBoyManagement';
import SingleQuotation from '@/components/admin/SingleQuotation';
import MedicineSettlement from '@/components/admin/MedicineSettlement';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  permissions: {
    dashboard: boolean;
    userManagement: boolean;
    pincodeManagement: boolean;
    addressForms: boolean;
    coloaderRegistration: boolean;
    corporatePricing: boolean;
    corporateRegistration: boolean;
    corporateManagement: boolean;
    consignmentManagement: boolean;
    reports: boolean;
    settings: boolean;
  };
}

interface DashboardStats {
  forms: {
    total: number;
    completed: number;
    incomplete: number;
    completionRate: number;
  };
  pincodes: {
    total: number;
    states: number;
    cities: number;
  };
  recent: {
    forms: any[];
    topStates: any[];
  };
}

const AdminDashboard = () => {
  console.log('AdminDashboard component rendering...');
  
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin');
      return;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      clearAuthData();
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive"
      });
      navigate('/admin');
      return;
    }

    // Get admin info from storage
    const storedAdminInfo = getStoredAdminInfo();
    if (storedAdminInfo) {
      setAdminInfo(storedAdminInfo);
    } else {
      navigate('/admin');
      return;
    }

    fetchDashboardStats();
    
  }, [navigate, toast]);

  // Listen for storage changes to update admin data in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const storedAdminInfo = localStorage.getItem('adminInfo');
      if (storedAdminInfo) {
        try {
          const adminData = JSON.parse(storedAdminInfo);
          setAdminInfo(adminData);
        } catch (error) {
          console.error('Error parsing updated admin data:', error);
        }
      }
    };

    // Listen for storage events (when localStorage is updated from other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('userPermissionsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userPermissionsUpdated', handleStorageChange);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = getStoredToken();
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else if (response.status === 401) {
        // Token expired or invalid, clear storage and logout
        clearAuthData();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        navigate('/admin');
        return;
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch {
      setError('Network error while loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    toast({ title: 'Logged out', description: 'You have been logged out.' });
    navigate('/admin');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
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

          {/* Admin logo and text section */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'gap-3 mb-6'}`}>
            <div className="p-3 rounded-xl bg-white shadow-inner">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
                <p className="text-xs text-gray-500">OCL Management</p>
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
              onClick={() => setActiveTab('overview')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Overview" : ""}
            >
              <BarChart3 className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Overview</span>}
            </button>

            <button
              onClick={() => setActiveTab('medicineSettlement')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'medicineSettlement'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Medicine Settlement" : ""}
            >
              <DollarSign className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Medicine Settlement</span>}
            </button>

            <button
              onClick={() => setActiveTab('addressforms')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'addressforms'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Address Forms" : ""}
            >
              <FileText className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Address Forms</span>}
            </button>

            <button
              onClick={() => setActiveTab('pincodes')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'pincodes'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Pincode Management" : ""}
            >
              <MapPin className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Pincode Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "User Management" : ""}
            >
              <UserCog className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">User Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('employeeRegistration')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'employeeRegistration'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Employee Registration" : ""}
            >
              <User className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Employee Registration</span>}
            </button>

            <button
              onClick={() => setActiveTab('employeeManagement')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'employeeManagement'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Employee Management" : ""}
            >
              <Users className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Employee Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('coloader')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'coloader'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Coloader Registration" : ""}
            >
              <Truck className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Coloader Registration</span>}
            </button>

            <button
              onClick={() => setActiveTab('coloaderManagement')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'coloaderManagement'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Coloader Management" : ""}
            >
              <Truck className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Coloader Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('corporatePricing')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'corporatePricing'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Corporate Pricing" : ""}
            >
              <DollarSign className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Pricing</span>}
            </button>

            <button
              onClick={() => setActiveTab('corporateApproval')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'corporateApproval'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Corporate Approval" : ""}
            >
              <CheckCircle className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Approval</span>}
            </button>


            <button
              onClick={() => setActiveTab('corporateRegistration')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'corporateRegistration'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Corporate Registration" : ""}
            >
              <Users className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Registration</span>}
            </button>

            <button
              onClick={() => setActiveTab('corporateManagement')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'corporateManagement'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Corporate Management" : ""}
            >
              <Building2 className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('consignment')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'consignment'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Assign Consignment" : ""}
            >
              <Package className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Assign Consignment</span>}
            </button>

            <button
              onClick={() => setActiveTab('courierRequests')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'courierRequests'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Courier Requests" : ""}
            >
              <Truck className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Courier Requests</span>}
            </button>

            <button
              onClick={() => setActiveTab('invoiceManagement')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'invoiceManagement'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Invoice Management" : ""}
            >
              <FileText className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Invoice Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('manageOrders')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'manageOrders'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Assign Coloaders" : ""}
            >
              <Package className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Assign Coloaders</span>}
            </button>

            <button
              onClick={() => setActiveTab('receivedOrders')}
              className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                activeTab === 'receivedOrders'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Received Consignments" : ""}
            >
              <Package className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Received Consignments</span>}
            </button>

          <button
            onClick={() => setActiveTab('baggingManagement')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'baggingManagement'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Bagging Management" : ""}
          >
            <Package className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Bagging Management</span>}
          </button>

          <button
            onClick={() => setActiveTab('singleQuotation')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'singleQuotation'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Single Quotation" : ""}
          >
            <FileText className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Single Quotation</span>}
          </button>

          <button
            onClick={() => setActiveTab('courierBoyManagement')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'courierBoyManagement'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Courier Boy Management" : ""}
          >
            <Bike className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Courier Boy Management</span>}
          </button>

          <button
            onClick={() => setActiveTab('assignCourierBoy')}
            className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
              activeTab === 'assignCourierBoy'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={isSidebarCollapsed ? "Assign Courier Boy" : ""}
          >
            <Bike className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Assign Courier Boy</span>}
          </button>

            {adminInfo?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full ${isSidebarCollapsed ? 'flex justify-center p-2' : 'text-left flex items-center gap-3 px-3 py-2'} rounded-xl transition ${
                  activeTab === 'admins'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Admin Management" : ""}
              >
                <Crown className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Admin Management</span>}
              </button>
            )}
          </nav>
        </div>

        {/* Footer Section - Fixed at Bottom */}
        <div className={`${isSidebarCollapsed ? 'p-2' : 'p-5'} border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0`}>
          {!isSidebarCollapsed ? (
            <>
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-gray-800">{adminInfo?.name}</p>
                <p className="text-xs text-gray-500">{adminInfo?.email}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge
                  variant={adminInfo?.role === 'super_admin' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {adminInfo?.role}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/90"
                  onClick={handleLogout}
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
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,24,40,0.08)] border border-gray-100 p-6 min-h-[calc(100vh-3rem)]">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-50/80 border-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Overview */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat cards */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Total Forms</h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stats.forms.total}</div>
                  <p className="text-sm text-gray-500">{stats.forms.completionRate}% completion rate</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">{stats.forms.completed}</div>
                  <p className="text-sm text-gray-500">Ready for processing</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Incomplete</h3>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{stats.forms.incomplete}</div>
                  <p className="text-sm text-gray-500">Require attention</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Pincodes</h3>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stats.pincodes.total}</div>
                  <p className="text-sm text-gray-500">
                    {stats.pincodes.states} states, {stats.pincodes.cities} cities
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Recent Forms</h3>
                  <p className="text-sm text-gray-500 mb-4">Latest form submissions</p>
                  <div className="space-y-3">
                    {stats.recent.forms.map((form, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-50"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{form.senderName}</p>
                          <p className="text-xs text-gray-500">{form.senderEmail}</p>
                          {form.receiverName && (
                            <p className="text-xs text-gray-400">→ {form.receiverName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={form.formCompleted ? 'default' : 'secondary'}
                            className="shadow-sm"
                          >
                            {form.formCompleted ? 'Complete' : 'Incomplete'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Top States</h3>
                  <p className="text-sm text-gray-500 mb-4">Most active states</p>
                  <div className="space-y-3">
                    {stats.recent.topStates.map((state, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                            style={{
                              background: 'linear-gradient(90deg,#3b82f6,#2563eb)',
                            }}
                          >
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-800">{state._id}</span>
                        </div>
                        <Badge variant="outline" className="shadow-sm">
                          {state.count} forms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other pages */}
          {activeTab === 'medicineSettlement' && <MedicineSettlement />}
          {activeTab === 'addressforms' && <AddressFormsTable />}
          {activeTab === 'pincodes' && <PincodeManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'employeeRegistration' && <EmployeeRegistration />}
          {activeTab === 'employeeManagement' && <EmployeeManagement />}
          {activeTab === 'coloader' && <ColoaderRegistration />}
          {activeTab === 'coloaderManagement' && <ColoaderManagement />}
          {activeTab === 'corporatePricing' && <CorporatePricing />}
          {activeTab === 'corporateApproval' && <CorporateApproval />}
          {activeTab === 'corporateRegistration' && <CorporateRegistration />}
          {activeTab === 'corporateManagement' && <CorporateManagement />}
          {activeTab === 'consignment' && <AssignConsignment />}
          {activeTab === 'courierRequests' && <CourierRequests />}
          {activeTab === 'invoiceManagement' && <InvoiceManagement />}
          {activeTab === 'manageOrders' && <AssignColoader />}
          {activeTab === 'receivedOrders' && <ReceivedConsignment />}
          {activeTab === 'baggingManagement' && <BaggingManagement />}
          {activeTab === 'singleQuotation' && <SingleQuotation />}
          {activeTab === 'courierBoyManagement' && <CourierBoyManagement />}
          {activeTab === 'assignCourierBoy' && <AssignCourierBoy />}
          {activeTab === 'admins' && adminInfo?.role === 'super_admin' && (
            <AdminManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
