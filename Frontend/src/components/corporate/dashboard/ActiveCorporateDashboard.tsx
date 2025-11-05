import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  BarChart3,
  Users,
  Shield,
  Building
} from "lucide-react";
import BentoBox from './BentoBox';
import CompactMetric from './CompactMetric';
import CompactRecentActivity from './CompactRecentActivity';
import NotificationSystem from './NotificationSystem';
import CourierRequestModal from '../CourierRequestModal';

interface ActiveCorporateDashboardProps {
  corporate: {
    companyName: string;
    corporateId: string;
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
  stats: {
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
  };
  onNavigateToTab: (tab: string) => void;
}

const ActiveCorporateDashboard: React.FC<ActiveCorporateDashboardProps> = ({
  corporate,
  stats,
  onNavigateToTab
}) => {
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  const notifications = [
    {
      id: '1',
      title: 'Monthly Performance Report',
      message: `Your ${currentMonth} performance shows ${stats.monthly.deliveryRate}% delivery success rate. Great job!`,
      type: 'success' as const,
      date: 'Today',
      isRead: false,
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'New Service Areas Added',
      message: 'We have expanded our service coverage to 15 new cities.',
      type: 'info' as const,
      date: '2 days ago',
      isRead: true,
      priority: 'medium' as const
    },
    {
      id: '3',
      title: 'Payment Reminder',
      message: 'Your monthly invoice is due in 5 days.',
      type: 'warning' as const,
      date: '1 day ago',
      isRead: false,
      priority: 'high' as const
    }
  ];

  const recentActivity = stats.recentShipments.map(shipment => ({
    id: shipment.id,
    type: 'shipment' as const,
    title: shipment.consignmentNumber,
    description: shipment.destination,
    status: shipment.status,
    time: shipment.date
  }));

  const handleMarkAsRead = (id: string) => {
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  const handleRequestCourier = () => {
    setIsCourierModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentMonth} Overview
          </h1>
          <p className="text-sm text-gray-600">Performance metrics and recent activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>
      </div>

      {/* Bento Box Grid - 6x4 Grid */}
      <div className="grid grid-cols-6 grid-rows-4 gap-2 h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide scroll-smooth">
        {/* Row 1: Key Metrics (Full Width) */}
        <BentoBox title="Key Metrics" icon={BarChart3} size="full">
          <div className="grid grid-cols-6 gap-2">
            <CompactMetric
              label="Total Shipments"
              value={stats.summary.totalShipments}
              icon={Package}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <CompactMetric
              label="In Transit"
              value={stats.tpMetrics.fpUnpaidShipments}
              icon={Truck}
              color="orange"
            />
            <CompactMetric
              label="Shipment Hold"
              value={stats.tpMetrics.tpUnpaidShipments}
              icon={Clock}
              color="red"
            />
            <CompactMetric
              label="Delivered"
              value={stats.summary.completedShipments}
              icon={CheckCircle}
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
            <CompactMetric
              label="Success Rate"
              value={`${stats.monthly.deliveryRate}%`}
              icon={TrendingUp}
              color="green"
              trend={{ value: 3, isPositive: true }}
            />
            <CompactMetric
              label="TP Shipments"
              value={stats.tpMetrics.tpPaidShipments}
              icon={CheckCircle}
              color="purple"
            />
          </div>
        </BentoBox>

        {/* Row 2: Recent Shipments (2x2) + Billing Summary (2x1) + Support (1x1) + Quick Actions (1x1) */}
        <BentoBox title="Recent Shipments" icon={Package} size="large">
          <CompactRecentActivity
            title="Latest Activity"
            items={recentActivity}
            onViewAll={() => onNavigateToTab('shipments')}
          />
        </BentoBox>

        <BentoBox title="Billing Summary" icon={CreditCard} size="medium">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Last Invoice</span>
              <span className="text-sm font-semibold">₹{Math.floor(stats.monthly.spend * 0.8).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Next Due</span>
              <span className="text-xs text-gray-600">
                {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Cycle</span>
              <span className="text-xs text-gray-600">{corporate.billingCycle || 'Monthly'}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => onNavigateToTab('settlement')}
            >
              View Details
            </Button>
          </div>
        </BentoBox>

        <BentoBox title="Support" icon={AlertCircle} size="small">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Active</span>
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {stats.complaints.active}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Resolved</span>
              <Badge variant="default" className="text-xs px-1.5 py-0.5">
                {stats.complaints.resolved}
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full h-6 text-xs"
              onClick={() => onNavigateToTab('complaints')}
            >
              View All
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full h-6 text-xs"
              onClick={() => onNavigateToTab('courier-complaints')}
            >
              Courier Issues
            </Button>
          </div>
        </BentoBox>

        <BentoBox title="Quick Actions" icon={Package} size="small">
          <div className="space-y-2">
            <Button 
              size="sm" 
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => onNavigateToTab('booking')}
            >
              <Package className="h-3 w-3 mr-1" />
              New Shipment
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => onNavigateToTab('pricing')}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              View Pricing
            </Button>
          </div>
        </BentoBox>

        {/* Row 3: Top Destinations (2x1) + Account Info (2x1) + Insights (2x1) */}
        <BentoBox title="Top Destinations" icon={MapPin} size="medium">
          <div className="space-y-2">
            {stats.topDestinations && stats.topDestinations.length > 0 ? (
              stats.topDestinations.slice(0, 3).map((destination, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50/50 rounded shadow-sm hover:shadow-md transition-all duration-200">
                  <span className="text-xs font-medium">{destination.route}</span>
                  <span className="text-xs font-semibold">{destination.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-xs text-gray-500">No shipment data available</div>
                <div className="text-xs text-gray-400 mt-1">Create your first shipment to see top destinations</div>
              </div>
            )}
          </div>
        </BentoBox>

        <BentoBox title="Account Info" icon={Shield} size="large">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Company Name</div>
                <div className="text-sm font-medium">{corporate.companyName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Corporate ID</div>
                <div className="text-sm font-mono font-medium">{corporate.corporateId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm">{corporate.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Contact Number</div>
                <div className="text-sm">{corporate.contactNumber}</div>
              </div>
            </div>
            <div className="space-y-3">
              {corporate.gstNumber && (
                <div>
                  <div className="text-xs text-gray-500">GST Number</div>
                  <div className="text-sm font-mono">{corporate.gstNumber}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="text-sm">
                  {corporate.companyAddress || 'Not Available'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm">
                  {corporate.locality && corporate.city && corporate.state 
                    ? `${corporate.locality}, ${corporate.city}, ${corporate.state}${corporate.pin ? ` - ${corporate.pin}` : ''}`
                    : corporate.city && corporate.state 
                    ? `${corporate.city}, ${corporate.state}${corporate.pin ? ` - ${corporate.pin}` : ''}`
                    : 'Not Available'
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Registration Date</div>
                <div className="text-sm">{new Date(corporate.registrationDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Login</div>
                <div className="text-sm">{new Date(corporate.lastLogin).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </BentoBox>

        <BentoBox title="Insights" icon={Eye} size="medium">
          <div className="space-y-2">
            {stats.topDestinations && stats.topDestinations.length > 0 ? (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded shadow-sm">
                Top route: {stats.topDestinations[0].route}
              </div>
            ) : (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded shadow-sm">
                No routes available yet
              </div>
            )}
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded shadow-sm">
              {stats.monthly.deliveryRate}% success rate
            </div>
            <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded shadow-sm">
              {stats.monthly.shipments} shipments this month
            </div>
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded shadow-sm">
              Consider bulk shipments for cost savings
            </div>
          </div>
        </BentoBox>

        {/* Row 4: Request Courier (2x1) + Performance Trends (4x1) */}
        <BentoBox title="Quick Actions" icon={Truck} size="medium">
          <div className="space-y-3">
            <Button
              onClick={() => handleRequestCourier()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Truck className="h-4 w-4 mr-2" />
              Request For Pickup
            </Button>
            <div className="text-xs text-gray-500 text-center">
              Need a courier boy for pickup? Click to request one.
            </div>
          </div>
        </BentoBox>

      </div>

      {/* Courier Request Modal */}
      <CourierRequestModal
        isOpen={isCourierModalOpen}
        onClose={() => setIsCourierModalOpen(false)}
        corporateName={corporate.companyName}
        corporateContact={corporate.contactNumber}
      />
    </div>
  );
};

export default ActiveCorporateDashboard;
