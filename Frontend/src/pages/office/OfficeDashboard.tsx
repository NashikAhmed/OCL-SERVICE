import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
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
  Package,
  X,
  Menu,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookingPanel from '@/components/BookingPanel';
// Import admin components for users with admin privileges
import AdminManagement from '@/components/admin/AdminManagement';
import ColoaderRegistration from '@/components/admin/ColoaderRegistration';
import AddressFormsTable from '@/components/admin/AddressFormsTable';
import PincodeManagement from '@/components/admin/PincodeManagement';
import UserManagement from '@/components/admin/UserManagement';
import ColoaderManagement from '@/components/admin/ColoaderManagement';
// Import all admin components for office users
import EmployeeRegistration from '@/components/admin/EmployeeRegistration';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import CorporateRegistration from '@/components/admin/CorporateRegistration';
import CorporateManagement from '@/components/admin/CorporateManagement';
import CorporatePricing from '@/components/admin/CorporatePricing';
import CorporateApproval from '@/components/admin/CorporateApproval';
import AssignConsignment from '@/components/admin/AssignConsignment';
import CourierRequests from '@/components/admin/CourierRequests';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import BaggingManagement from '@/components/admin/BaggingManagement';
import ReceivedConsignment from '@/components/admin/ReceivedConsignment';
import AssignColoader from '@/components/admin/AssignColoader';

interface OfficeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  permissions: {
    dashboard: boolean;
    booking: boolean;
    reports: boolean;
    settings: boolean;
    pincodeManagement: boolean;
    addressForms: boolean;
    coloaderRegistration: boolean;
    coloaderManagement: boolean;
    corporateRegistration: boolean;
    corporateManagement: boolean;
    corporatePricing: boolean;
    corporateApproval: boolean;
    employeeRegistration: boolean;
    employeeManagement: boolean;
    consignmentManagement: boolean;
    courierRequests: boolean;
    invoiceManagement: boolean;
    userManagement: boolean;
    baggingManagement: boolean;
    receivedOrders: boolean;
    manageOrders: boolean;
  };
  department?: string;
  adminInfo?: {
    id: string;
    role: string;
    permissions: {
      dashboard: boolean;
      booking: boolean;
      userManagement: boolean;
      pincodeManagement: boolean;
      addressForms: boolean;
      coloaderRegistration: boolean; // Add this new permission
      reports: boolean;
      settings: boolean;
    };
    canAssignPermissions: boolean;
  };
}

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

const OfficeDashboard = () => {
  const [user, setUser] = useState<OfficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [consignmentStats, setConsignmentStats] = useState({
    totalAssigned: 0,
    usedCount: 0,
    availableCount: 0,
    usagePercentage: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('officeToken');
    const storedUserInfo = localStorage.getItem('officeUser');

    if (!token || !storedUserInfo) {
      navigate('/office');
      return;
    }

    const loadUserData = () => {
      try {
        const userData = JSON.parse(storedUserInfo);
        
        // Ensure the new permission fields exist in the user data
        // This handles cases where existing users don't have the new fields
        if (userData.permissions) {
          if (userData.permissions.coloaderRegistration === undefined) {
            userData.permissions.coloaderRegistration = false;
          }
          if (userData.permissions.baggingManagement === undefined) {
            userData.permissions.baggingManagement = false;
          }
          if (userData.permissions.receivedOrders === undefined) {
            userData.permissions.receivedOrders = false;
          }
          if (userData.permissions.manageOrders === undefined) {
            userData.permissions.manageOrders = false;
          }
        }
        
        if (userData.adminInfo && userData.adminInfo.permissions) {
          if (userData.adminInfo.permissions.coloaderRegistration === undefined) {
            userData.adminInfo.permissions.coloaderRegistration = false;
          }
          if (userData.adminInfo.permissions.baggingManagement === undefined) {
            userData.adminInfo.permissions.baggingManagement = false;
          }
          if (userData.adminInfo.permissions.receivedOrders === undefined) {
            userData.adminInfo.permissions.receivedOrders = false;
          }
          if (userData.adminInfo.permissions.manageOrders === undefined) {
            userData.adminInfo.permissions.manageOrders = false;
          }
        }
        
        setUser(userData);
      } catch (error) {
        navigate('/office');
        return;
      }
    };

    loadUserData();

    // Add a global function to refresh permissions (can be called from anywhere)
    (window as any).refreshOfficePermissions = () => {
      console.log('🔄 Manual permission refresh triggered');
      loadUserData();
    };

    // Listen for permission update events
    const handlePermissionUpdate = (event) => {
      console.log('🔄 Permission update detected:', event.type, 'refreshing user data...');
      console.log('🔄 Event details:', event.detail);
      loadUserData();
    };

    // Also add a global listener for any permission changes
    const handleGlobalPermissionUpdate = () => {
      console.log('🔄 Global permission update detected, refreshing user data...');
      loadUserData();
    };

    // Add event listeners for permission updates
    window.addEventListener('userPermissionsUpdated', handlePermissionUpdate);
    window.addEventListener('officeUserPermissionsUpdated', handlePermissionUpdate);
    window.addEventListener('permissionsUpdated', handlePermissionUpdate);
    
    // Add a global listener for any storage changes (fallback)
    const handleStorageChange = (e) => {
      if (e.key === 'officeUser') {
        console.log('🔄 Office user data changed in localStorage, refreshing...');
        loadUserData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Set isLoading to false after user data is loaded
    setIsLoading(false);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('userPermissionsUpdated', handlePermissionUpdate);
      window.removeEventListener('officeUserPermissionsUpdated', handlePermissionUpdate);
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Fetch consignment stats for office user
  const fetchConsignmentStats = async () => {
    try {
      const token = localStorage.getItem('officeToken');
      const response = await fetch('/api/office/consignment/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasAssignment) {
          setConsignmentStats(data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching consignment stats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConsignmentStats();
    }
  }, [user]);

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('officeToken');
      if (!token) return;

      const response = await fetch('/api/office/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        // Ensure the new permission field exists in the user data
        if (userData.permissions && userData.permissions.coloaderRegistration === undefined) {
          userData.permissions.coloaderRegistration = false;
        }
        
        if (userData.adminInfo && userData.adminInfo.permissions && userData.adminInfo.permissions.coloaderRegistration === undefined) {
          userData.adminInfo.permissions.coloaderRegistration = false;
        }
        
        // Update localStorage with fresh data
        localStorage.setItem('officeUser', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Listen for storage changes to update user data in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserInfo = localStorage.getItem('officeUser');
      if (storedUserInfo) {
        try {
          const userData = JSON.parse(storedUserInfo);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    const handlePermissionsUpdate = () => {
      // When permissions are updated, refresh user data from server to ensure we have the latest
      refreshUserData();
    };

    // Listen for storage events (when localStorage is updated from other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('userPermissionsUpdated', handlePermissionsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userPermissionsUpdated', handlePermissionsUpdate);
    };
  }, []);

  // const fetchDashboardStats = async () => {
  //   try {
  //     const token = localStorage.getItem('officeToken');
  //     const response = await fetch('/api/office/stats', {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       // setStats(data.stats);
  //     } else if (response.status === 401) {
  //       handleLogout();
  //       return;
  //     } else {
  //       setError('Failed to load dashboard statistics');
  //     }
  //   } catch {
  //     setError('Network error while loading dashboard');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('officeToken');
    localStorage.removeItem('officeUser');
    toast({ title: 'Logged out', description: 'You have been logged out.' });
    navigate('/office');
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
        {/* Header section - fixed at top */}
        <div className={`${isSidebarCollapsed ? 'p-3' : 'p-5'} border-b border-gray-100`}>
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

          {/* Office logo and text section */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'gap-3 mb-6'}`}>
            <div className="p-3 rounded-xl bg-white shadow-inner">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-800">Office Panel</h2>
                <p className="text-xs text-gray-500">OCL Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <nav className={`${isSidebarCollapsed ? 'space-y-2 p-3' : 'space-y-3 p-5'}`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Overview" : ""}
            >
              <BarChart3 className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Overview</span>}
            </button>

            {/* Booking Panel - shown when user has booking permission */}
            {(user?.permissions?.booking || user?.adminInfo?.permissions?.booking) && (
              <button
                onClick={() => setActiveTab('booking')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'booking'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Booking" : ""}
              >
                <Package className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Booking</span>}
              </button>
            )}

            {/* Address Forms - only shown when user has access */}
            {(user?.permissions?.addressForms || user?.adminInfo?.permissions?.addressForms) && (
              <button
                onClick={() => setActiveTab('addressforms')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'addressforms'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Address Forms" : ""}
              >
                <FileText className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Address Forms</span>}
              </button>
            )}

            {/* Pincode Management - only shown when user has access */}
            {(user?.permissions?.pincodeManagement || user?.adminInfo?.permissions?.pincodeManagement) && (
              <button
                onClick={() => setActiveTab('pincodes')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'pincodes'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Pincode Management" : ""}
              >
                <MapPin className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Pincode Management</span>}
              </button>
            )}

            {/* User Management - only shown when user has admin access */}
            {(user?.adminInfo?.permissions?.userManagement) && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "User Management" : ""}
              >
                <UserCog className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">User Management</span>}
              </button>
            )}

            {/* Settings - shown by default for all users */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Settings" : ""}
            >
              <Settings className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
            </button>

            {/* Reports - shown by default for all users */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isSidebarCollapsed ? "Reports" : ""}
            >
              <FileText className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Reports</span>}
            </button>

            {/* Coloader Registration - only shown when user has access */}
            {(user?.permissions?.coloaderRegistration || user?.adminInfo?.permissions?.coloaderRegistration) && (
              <button
                onClick={() => setActiveTab('coloader')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'coloader'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Coloader Registration" : ""}
              >
                <Truck className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Coloader Registration</span>}
              </button>
            )}

            {/* Coloader Management - only shown when user has access */}
            {(user?.permissions?.coloaderManagement || user?.adminInfo?.permissions?.coloaderManagement) && (
              <button
                onClick={() => setActiveTab('coloaderManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'coloaderManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Coloader Management" : ""}
              >
                <Truck className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Coloader Management</span>}
              </button>
            )}

            {/* Employee Management - only shown when user has access */}
            {(user?.permissions?.employeeManagement || user?.adminInfo?.permissions?.employeeManagement) && (
              <button
                onClick={() => setActiveTab('employeeManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'employeeManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Employee Management" : ""}
              >
                <Users className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Employee Management</span>}
              </button>
            )}

            {/* Employee Registration - only shown when user has access */}
            {(user?.permissions?.employeeRegistration || user?.adminInfo?.permissions?.employeeRegistration) && (
              <button
                onClick={() => setActiveTab('employeeRegistration')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'employeeRegistration'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Employee Registration" : ""}
              >
                <Users className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Employee Registration</span>}
              </button>
            )}

            {/* Corporate Management - only shown when user has access */}
            {(user?.permissions?.corporateManagement || user?.adminInfo?.permissions?.corporateManagement) && (
              <button
                onClick={() => setActiveTab('corporateManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'corporateManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Corporate Management" : ""}
              >
                <Shield className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Management</span>}
              </button>
            )}

            {/* Corporate Registration - only shown when user has access */}
            {(user?.permissions?.corporateRegistration || user?.adminInfo?.permissions?.corporateRegistration) && (
              <button
                onClick={() => setActiveTab('corporateRegistration')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'corporateRegistration'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Corporate Registration" : ""}
              >
                <Shield className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Registration</span>}
              </button>
            )}

            {/* Corporate Pricing - only shown when user has access */}
            {(user?.permissions?.corporatePricing || user?.adminInfo?.permissions?.corporatePricing) && (
              <button
                onClick={() => setActiveTab('corporatePricing')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'corporatePricing'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Corporate Pricing" : ""}
              >
                <BarChart3 className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Pricing</span>}
              </button>
            )}

            {/* Corporate Approval - only shown when user has access */}
            {(user?.permissions?.corporateApproval || user?.adminInfo?.permissions?.corporateApproval) && (
              <button
                onClick={() => setActiveTab('corporateApproval')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'corporateApproval'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Corporate Approval" : ""}
              >
                <Shield className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Corporate Approval</span>}
              </button>
            )}

            {/* Assign Consignment - only shown when user has access */}
            {(user?.permissions?.consignmentManagement || user?.adminInfo?.permissions?.consignmentManagement) && (
              <button
                onClick={() => setActiveTab('consignmentManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'consignmentManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Assign Consignment" : ""}
              >
                <Package className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Assign Consignment</span>}
              </button>
            )}

            {/* Courier Requests - only shown when user has access */}
            {(user?.permissions?.courierRequests || user?.adminInfo?.permissions?.courierRequests) && (
              <button
                onClick={() => setActiveTab('courierRequests')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'courierRequests'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Courier Requests" : ""}
              >
                <Truck className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Courier Requests</span>}
              </button>
            )}

            {/* Invoice Management - only shown when user has access */}
            {(user?.permissions?.invoiceManagement || user?.adminInfo?.permissions?.invoiceManagement) && (
              <button
                onClick={() => setActiveTab('invoiceManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'invoiceManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Invoice Management" : ""}
              >
                <FileText className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Invoice Management</span>}
              </button>
            )}

            {/* Bagging Management - only shown when user has access */}
            {(user?.permissions?.baggingManagement || user?.adminInfo?.permissions?.baggingManagement) && (
              <button
                onClick={() => setActiveTab('baggingManagement')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'baggingManagement'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Bagging Management" : ""}
              >
                <Package className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Bagging Management</span>}
              </button>
            )}

            {/* Received Consignments - only shown when user has access */}
            {(user?.permissions?.receivedOrders || user?.adminInfo?.permissions?.receivedOrders) && (
              <button
                onClick={() => setActiveTab('receivedOrders')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'receivedOrders'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Received Consignments" : ""}
              >
                <Package className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Received Consignments</span>}
              </button>
            )}

            {/* Assign Coloaders - only shown when user has access */}
            {(user?.permissions?.manageOrders || user?.adminInfo?.permissions?.manageOrders) && (
              <button
                onClick={() => setActiveTab('manageOrders')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
                  activeTab === 'manageOrders'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? "Assign Coloaders" : ""}
              >
                <Package className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Assign Coloaders</span>}
              </button>
            )}

            {/* Admin-only sections */}
            {user?.adminInfo && user?.adminInfo?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full text-left flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl transition ${
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

        {/* Footer - User info - fixed at bottom */}
        <div className={`${isSidebarCollapsed ? 'p-3' : 'p-5'} border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0`}>
          {!isSidebarCollapsed ? (
            <>
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge
                  variant={user?.adminInfo?.role === 'super_admin' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {user?.adminInfo ? user.adminInfo.role : user?.role}
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
                className="w-full bg-white/90 p-2"
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat cards - placeholder data for now */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Total Forms</h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
                  <p className="text-sm text-gray-500">0% completion rate</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                  <p className="text-sm text-gray-500">Ready for processing</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Incomplete</h3>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
                  <p className="text-sm text-gray-500">Require attention</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Consignments</h3>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{consignmentStats.availableCount}</div>
                  <p className="text-sm text-gray-500">
                    {consignmentStats.usedCount} used of {consignmentStats.totalAssigned}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Recent Forms</h3>
                  <p className="text-sm text-gray-500 mb-4">Latest form submissions</p>
                  <div className="space-y-3">
                    <p className="text-gray-500 text-center py-4">No recent forms</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Top States</h3>
                  <p className="text-sm text-gray-500 mb-4">Most active states</p>
                  <div className="space-y-3">
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Panel */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  {/* <h1 className="text-2xl font-bold text-gray-800">Booking Panel</h1>
                  <p className="text-gray-600">Create and manage shipment bookings</p> */}
                </div>
              </div>
              <BookingPanel />
            </div>
          )}

          {/* Other pages */}
          {activeTab === 'addressforms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Address Forms</h1>
                  <p className="text-gray-600">View and manage customer address forms</p>
                </div>
              </div>
              <AddressFormsTable />
            </div>
          )}
          {activeTab === 'pincodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Pincode Management</h1>
                  <p className="text-gray-600">Manage pincode areas and coverage</p>
                </div>
              </div>
              <PincodeManagement />
            </div>
          )}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                  <p className="text-gray-600">Manage office users and permissions</p>
                </div>
              </div>
              <UserManagement />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                  <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">System Configuration</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Shipping Method
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Express Delivery</option>
                      <option>Standard Delivery</option>
                      <option>Economy Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-600">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-600">SMS alerts</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-gray-600">Push notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                  <p className="text-gray-600">View and generate reports</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Monthly Performance Report</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Delivery Success Rate</span>
                    <span className="font-semibold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Average Delivery Time</span>
                    <span className="font-semibold text-blue-600">2.3 days</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold text-purple-600">4.8/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'coloader' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Coloader Registration</h1>
                  <p className="text-gray-600">Manage coloader partner registrations</p>
                </div>
              </div>
              <ColoaderRegistration />
            </div>
          )}
          {activeTab === 'coloaderManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Coloader Management</h1>
                  <p className="text-gray-600">View and manage registered coloaders</p>
                </div>
              </div>
              <ColoaderManagement />
            </div>
          )}
          {/* Employee Management */}
          {activeTab === 'employeeManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                  <p className="text-gray-600">View and manage employee records</p>
                </div>
              </div>
              <EmployeeManagement />
            </div>
          )}

          {/* Employee Registration */}
          {activeTab === 'employeeRegistration' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Employee Registration</h1>
                  <p className="text-gray-600">Register new employees</p>
                </div>
              </div>
              <EmployeeRegistration />
            </div>
          )}

          {/* Corporate Management */}
          {activeTab === 'corporateManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Corporate Management</h1>
                  <p className="text-gray-600">View and manage corporate clients</p>
                </div>
              </div>
              <CorporateManagement />
            </div>
          )}

          {/* Corporate Registration */}
          {activeTab === 'corporateRegistration' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Corporate Registration</h1>
                  <p className="text-gray-600">Register new corporate clients</p>
                </div>
              </div>
              <CorporateRegistration />
            </div>
          )}

          {/* Corporate Pricing */}
          {activeTab === 'corporatePricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Corporate Pricing</h1>
                  <p className="text-gray-600">Manage corporate pricing plans</p>
                </div>
              </div>
              <CorporatePricing />
            </div>
          )}

          {/* Corporate Approval */}
          {activeTab === 'corporateApproval' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Corporate Approval</h1>
                  <p className="text-gray-600">Approve corporate client applications</p>
                </div>
              </div>
              <CorporateApproval />
            </div>
          )}

          {/* Assign Consignment */}
          {activeTab === 'consignmentManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Assign Consignment</h1>
                  <p className="text-gray-600">View and manage consignments</p>
                </div>
              </div>
              <AssignConsignment />
            </div>
          )}

          {/* Courier Requests */}
          {activeTab === 'courierRequests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Courier Requests</h1>
                  <p className="text-gray-600">View and manage courier requests</p>
                </div>
              </div>
              <CourierRequests />
            </div>
          )}

          {/* Invoice Management */}
          {activeTab === 'invoiceManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
                  <p className="text-gray-600">View and manage invoices</p>
                </div>
              </div>
              <InvoiceManagement />
            </div>
          )}

          {/* Bagging Management */}
          {activeTab === 'baggingManagement' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Bagging Management</h1>
                  <p className="text-gray-600">Manage bagging operations and route-based bagging</p>
                </div>
              </div>
              <BaggingManagement />
            </div>
          )}

          {/* Received Consignments */}
          {activeTab === 'receivedOrders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Received Consignments</h1>
                  <p className="text-gray-600">Manage received consignments and barcode scanning</p>
                </div>
              </div>
              <ReceivedConsignment />
            </div>
          )}

          {/* Assign Coloaders */}
          {activeTab === 'manageOrders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Assign Coloaders</h1>
                  <p className="text-gray-600">Manage and edit order details</p>
                </div>
              </div>
              <AssignColoader />
            </div>
          )}

          {activeTab === 'admins' && user?.adminInfo && user?.adminInfo?.role === 'super_admin' && (
            <AdminManagement />
          )}
          {activeTab === 'admins' && (!user?.adminInfo || user?.adminInfo?.role !== 'super_admin') && (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-100">
              <Shield className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Super Admin Access Required</h3>
              <p className="text-gray-500 text-center max-w-md">
                You need super administrator privileges to access this section. 
                Please contact your system administrator if you believe you should have access.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficeDashboard;