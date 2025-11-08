import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  LogOut, 
  Settings, 
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CorporateSidebar from "@/components/corporate/CorporateSidebar";
import CorporatePricingDisplay from "@/components/corporate/CorporatePricingDisplay";
import ComplaintDesk from "@/components/corporate/ComplaintDesk";
import CourierComplaintDesk from "@/components/corporate/CourierComplaintDesk";
import BookingSection from "@/components/corporate/BookingSection";
import ShipmentOverview from "@/components/corporate/ShipmentOverview";
import SettlementSection from "@/components/corporate/SettlementSection";
import CompanyProfile from "@/components/corporate/CompanyProfile";
import NewCorporateDashboard from "@/components/corporate/dashboard/NewCorporateDashboard";
import ActiveCorporateDashboard from "@/components/corporate/dashboard/ActiveCorporateDashboard";
import DashboardDemoToggle from "@/components/corporate/dashboard/DashboardDemoToggle";
import HelpResources from "@/components/corporate/HelpResources";

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

interface DashboardStats {
  corporate: {
    id: string;
    corporateId: string;
    companyName: string;
    email: string;
    contactNumber: string;
    registrationDate: string;
    lastLogin: string;
    isActive: boolean;
    billingType?: string;
    manager?: string;
    billingCycle?: string;
    companyAddress?: string;
    city?: string;
    state?: string;
    pin?: string;
    locality?: string;
    gstNumber?: string;
    logo?: string;
  };
  summary: {
    totalShipments: number;
    pendingShipments: number;
    completedShipments: number;
    totalSpent: number;
  };
  monthly: {
    shipments: number;
    spend: number;
    deliveryRate: number;
  };
  recentShipments: Array<{
    id: string;
    consignmentNumber: string;
    destination: string;
    status: string;
    date: string;
  }>;
  complaints: {
    active: number;
    resolved: number;
  };
  tpMetrics: {
    tpPaidShipments: number; // TP shipments that are paid
    fpUnpaidShipments: number; // FP shipments that are unpaid (in transit)
    tpUnpaidShipments: number; // TP shipments that are unpaid (on hold)
  };
  topDestinations: Array<{
    route: string;
    count: number;
  }>;
}

const CorporateDashboard = () => {
  const [corporate, setCorporate] = useState<CorporateInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isNewCorporateDemo, setIsNewCorporateDemo] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('corporateToken');
    const storedCorporateInfo = localStorage.getItem('corporateInfo');

    if (!token || !storedCorporateInfo) {
      navigate('/corporate');
      return;
    }

    try {
      const corporateData = JSON.parse(storedCorporateInfo);
      setCorporate(corporateData);
      
      // Check if it's first login
      if (corporateData.isFirstLogin) {
        navigate('/corporate/change-password');
        return;
      }
    } catch (error) {
      navigate('/corporate');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  // Function to calculate top destinations from shipment data
  const calculateTopDestinations = (shipments: any[]): Array<{ route: string; count: number }> => {
    const routeCounts: { [key: string]: number } = {};
    
    console.log('Calculating top destinations from shipments:', shipments.length);
    
    shipments.forEach((shipment, index) => {
      console.log(`Processing shipment ${index}:`, shipment);
      
      // Handle both possible data structures: direct originData/destinationData or nested under bookingData
      let originData, destinationData;
      
      if (shipment.bookingData) {
        // Data is nested under bookingData (from API)
        originData = shipment.bookingData.originData;
        destinationData = shipment.bookingData.destinationData;
        console.log(`Shipment ${index} - Using bookingData structure`);
      } else {
        // Data is direct (transformed data)
        originData = shipment.originData;
        destinationData = shipment.destinationData;
        console.log(`Shipment ${index} - Using direct structure`);
      }
      
      console.log(`Shipment ${index} - Origin data:`, originData);
      console.log(`Shipment ${index} - Destination data:`, destinationData);
      
      if (originData && destinationData) {
        const origin = originData.city || originData.state || 'Unknown';
        const destination = destinationData.city || destinationData.state || 'Unknown';
        const route = `${origin} → ${destination}`;
        routeCounts[route] = (routeCounts[route] || 0) + 1;
        console.log(`Shipment ${index} - Route: ${route}`);
      } else {
        console.log(`Shipment ${index} - Missing origin or destination data`);
      }
    });
    
    console.log('Route counts:', routeCounts);
    
    // Convert to array and sort by count
    const result = Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 destinations
    
    console.log('Final top destinations result:', result);
    return result;
  };

  const generateMockStats = (isNewCorporate: boolean): DashboardStats => {
    const baseCorporate = {
      id: corporate?.id || '1',
      corporateId: corporate?.corporateId || 'CORP001',
      companyName: corporate?.companyName || 'Demo Company',
      email: corporate?.email || 'demo@company.com',
      contactNumber: corporate?.contactNumber || '+91 9876543210',
      registrationDate: '2024-01-15',
      lastLogin: new Date().toISOString(),
      isActive: true,
      billingType: 'Monthly',
      manager: 'John Smith',
      billingCycle: 'Monthly'
    };

    if (isNewCorporate) {
      return {
        corporate: baseCorporate,
        summary: {
          totalShipments: 0,
          pendingShipments: 0,
          completedShipments: 0,
          totalSpent: 0
        },
        monthly: {
          shipments: 0,
          spend: 0,
          deliveryRate: 0
        },
        recentShipments: [],
        complaints: {
          active: 0,
          resolved: 0
        },
        tpMetrics: {
          tpPaidShipments: 0,
          fpUnpaidShipments: 0,
          tpUnpaidShipments: 0
        },
        topDestinations: []
      };
    } else {
      // Active corporate with data
      return {
        corporate: baseCorporate,
        summary: {
          totalShipments: 156,
          pendingShipments: 12,
          completedShipments: 144,
          totalSpent: 125000
        },
        monthly: {
          shipments: 45,
          spend: 35000,
          deliveryRate: 96
        },
        recentShipments: [
          {
            id: '1',
            consignmentNumber: 'OCL240101001',
            destination: 'Mumbai, Maharashtra',
            status: 'Delivered',
            date: '2 days ago'
          },
          {
            id: '2',
            consignmentNumber: 'OCL240101002',
            destination: 'Delhi, NCR',
            status: 'In Transit',
            date: '1 day ago'
          },
          {
            id: '3',
            consignmentNumber: 'OCL240101003',
            destination: 'Bangalore, Karnataka',
            status: 'Delivered',
            date: '3 days ago'
          },
          {
            id: '4',
            consignmentNumber: 'OCL240101004',
            destination: 'Chennai, Tamil Nadu',
            status: 'Pending',
            date: 'Today'
          }
        ],
        complaints: {
          active: 2,
          resolved: 8
        },
        tpMetrics: {
          tpPaidShipments: 45, // TP shipments that are paid
          fpUnpaidShipments: 8, // FP shipments that are unpaid (in transit)
          tpUnpaidShipments: 4 // TP shipments that are unpaid (on hold)
        },
        topDestinations: [
          { route: 'Mumbai → Delhi', count: 47 },
          { route: 'Bangalore → Chennai', count: 31 },
          { route: 'Pune → Hyderabad', count: 23 },
          { route: 'Delhi → Mumbai', count: 19 },
          { route: 'Chennai → Bangalore', count: 15 }
        ]
      };
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('corporateToken');
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/corporate/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch shipment data for top destinations calculation
      const shipmentsResponse = await fetch('/api/corporate/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        let dashboardStats = statsData.stats;
        
        // If we have shipment data, calculate top destinations
        if (shipmentsResponse.ok) {
          const shipmentsData = await shipmentsResponse.json();
          const shipments = shipmentsData.data || [];
          console.log('Shipments data for top destinations:', shipments);
          const topDestinations = calculateTopDestinations(shipments);
          console.log('Calculated top destinations:', topDestinations);
          dashboardStats.topDestinations = topDestinations;
        } else {
          // If no shipment data, set empty array
          console.log('No shipment data available for top destinations');
          dashboardStats.topDestinations = [];
        }
        
        setStats(dashboardStats);
        setIsDemoMode(false); // Real data loaded
      } else {
        console.error('Failed to fetch dashboard stats:', statsResponse.status);
        setError('Failed to load dashboard data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('corporateToken');
    localStorage.removeItem('corporateInfo');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/corporate');
  };

  const toggleDemoMode = () => {
    setIsNewCorporateDemo(!isNewCorporateDemo);
    setStats(generateMockStats(!isNewCorporateDemo));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Button onClick={fetchDashboardStats} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Demo Toggle */}
      {isDemoMode && (
        <DashboardDemoToggle
          isNewCorporate={isNewCorporateDemo}
          onToggle={toggleDemoMode}
        />
      )}

      {/* Sidebar */}
      <CorporateSidebar
        corporate={corporate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="bg-gradient-to-br from-gray-50/50 to-white/80 backdrop-blur-sm rounded-2xl shadow-[0_20px_50px_rgba(16,24,40,0.12)] p-6 min-h-[calc(100vh-3rem)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 rounded-lg shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading dashboard...</span>
                </div>
              ) : stats ? (
                // Check if corporate has any data (shipments, spend, etc.) or if in demo mode
                (isDemoMode ? isNewCorporateDemo : (stats.summary.totalShipments === 0 && stats.summary.totalSpent === 0)) ? (
                  // Scenario A: New Corporate (No Data Yet)
                  <NewCorporateDashboard 
                    corporate={stats.corporate}
                    onNavigateToTab={setActiveTab}
                  />
                ) : (
                  // Scenario B: Active Corporate (Has Data)
                  <ActiveCorporateDashboard 
                    corporate={stats.corporate}
                    stats={stats}
                    onNavigateToTab={setActiveTab}
                  />
                )
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
                  <p className="text-gray-600 mb-4">Unable to load your dashboard data. Please try again.</p>
                  <Button onClick={fetchDashboardStats} variant="outline">
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && <CorporatePricingDisplay />}

          {/* Company Profile Tab */}
          {activeTab === 'profile' && <CompanyProfile />}

          {/* Booking Tab */}
          {activeTab === 'booking' && <BookingSection />}

          {/* Shipments Tab */}
          {activeTab === 'shipments' && <ShipmentOverview />}

          {/* Complaint Desk Tab */}
          {activeTab === 'complaints' && <ComplaintDesk />}

          {/* Courier Complaint Desk Tab */}
          {activeTab === 'courier-complaints' && <CourierComplaintDesk />}

          {/* Settlement Tab */}
          {activeTab === 'settlement' && <SettlementSection />}

          {/* Help & Resources Tab */}
          {activeTab === 'help' && <HelpResources />}
        </div>
      </main>
    </div>
  );
};

export default CorporateDashboard;
