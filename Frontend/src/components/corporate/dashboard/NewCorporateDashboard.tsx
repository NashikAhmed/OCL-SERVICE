import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  DollarSign, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  HelpCircle,
  BookOpen,
  Phone,
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  Building,
  Calendar,
  Truck
} from "lucide-react";
import BentoBox from './BentoBox';
import CompactMetric from './CompactMetric';
import CompactChecklist from './CompactChecklist';
import CompactRecentActivity from './CompactRecentActivity';
import NotificationSystem from './NotificationSystem';
import CourierRequestModal from '../CourierRequestModal';

interface NewCorporateDashboardProps {
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
  };
  onNavigateToTab: (tab: string) => void;
}

const NewCorporateDashboard: React.FC<NewCorporateDashboardProps> = ({
  corporate,
  onNavigateToTab
}) => {
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);

  const handleRequestCourier = () => {
    setIsCourierModalOpen(true);
  };

  // Sample data for new corporate
  const gettingStartedItems = [
    {
      id: '1',
      title: 'Complete Company Profile',
      completed: true,
      action: () => onNavigateToTab('profile')
    },
    {
      id: '2',
      title: 'Review Your Pricing Plan',
      completed: false,
      action: () => onNavigateToTab('pricing')
    },
    {
      id: '3',
      title: 'Create Your First Shipment',
      completed: false,
      action: () => onNavigateToTab('booking')
    },
    {
      id: '4',
      title: 'Set Up Billing Information',
      completed: false,
      action: () => onNavigateToTab('settlement')
    }
  ];

  const notifications = [
    {
      id: '1',
      title: 'Welcome to OCL Corporate Portal',
      message: 'Your corporate account has been successfully activated.',
      type: 'success' as const,
      date: 'Today',
      isRead: false,
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'Getting Started Guide',
      message: 'Check out our comprehensive guide to help you get started.',
      type: 'info' as const,
      date: 'Today',
      isRead: false,
      priority: 'medium' as const
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'shipment' as const,
      title: 'Account Activated',
      description: 'Your corporate account is now ready',
      status: 'completed',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'delivery' as const,
      title: 'Profile Setup',
      description: 'Company profile completed',
      status: 'completed',
      time: '1 hour ago'
    }
  ];

  const handleMarkAsRead = (id: string) => {
    // Handle marking notification as read
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    // Handle marking all notifications as read
    console.log('Mark all as read');
  };

  return (
    <div className="h-full overflow-hidden">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {corporate.companyName}!
          </h1>
          <p className="text-sm text-gray-600">Your corporate account is active and ready</p>
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
        {/* Row 1: Quick Actions (2x2) + Getting Started (2x1) + Account Info (1x1) + Help Support (1x1) */}
        <BentoBox title="Quick Actions" icon={Package} size="large">
          <div className="space-y-3">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700" 
              onClick={() => onNavigateToTab('booking')}
            >
              <Package className="h-4 w-4 mr-2" />
              Create First Shipment
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onNavigateToTab('pricing')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Pricing & Zones
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onNavigateToTab('complaints')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onNavigateToTab('courier-complaints')}
            >
              <Truck className="h-4 w-4 mr-2" />
              Courier Complaints
            </Button>
          </div>
        </BentoBox>

        <BentoBox title="Getting Started" icon={CheckCircle} size="medium">
          <CompactChecklist
            title="Setup Progress"
            items={gettingStartedItems}
          />
        </BentoBox>

        <BentoBox title="Account Info" icon={Shield} size="small">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Corporate ID</div>
            <div className="text-sm font-mono font-medium">{corporate.corporateId}</div>
            <div className="text-xs text-gray-500">Billing Type</div>
            <div className="text-sm">{corporate.billingType || 'Monthly'}</div>
          </div>
        </BentoBox>

        <BentoBox title="Help & Support" icon={HelpCircle} size="small">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
              <BookOpen className="h-3 w-3 mr-2" />
              User Guide
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
              <HelpCircle className="h-3 w-3 mr-2" />
              FAQs
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
              <Phone className="h-3 w-3 mr-2" />
              Contact
            </Button>
          </div>
        </BentoBox>

        {/* Row 2: Recent Activity (2x1) + Company Details (2x1) + Quick Tips (2x1) */}
        <BentoBox title="Recent Activity" icon={Clock} size="medium">
          <CompactRecentActivity
            title="Activity Feed"
            items={recentActivity}
          />
        </BentoBox>

        <BentoBox title="Company Details" icon={Building} size="medium">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">Company Name</div>
              <div className="text-sm font-medium">{corporate.companyName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm">{corporate.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Contact</div>
              <div className="text-sm">{corporate.contactNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Manager</div>
              <div className="text-sm">{corporate.manager || 'Not Assigned'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Last Login</div>
              <div className="text-sm">{new Date(corporate.lastLogin).toLocaleDateString()}</div>
            </div>
          </div>
        </BentoBox>

        <BentoBox title="Quick Tips" icon={ArrowRight} size="medium">
          <div className="space-y-2">
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded shadow-sm">
              Complete your profile to unlock all features
            </div>
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded shadow-sm">
              Your corporate rates are pre-configured
            </div>
            <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded shadow-sm">
              Start with a test shipment to get familiar
            </div>
          </div>
        </BentoBox>

        {/* Row 3: Request Courier (2x1) + Analytics Preview (4x1) */}
        <BentoBox title="Quick Actions" icon={Truck} size="medium">
          <div className="space-y-3">
            <Button
              onClick={() => handleRequestCourier()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Truck className="h-4 w-4 mr-2" />
              Request a Courier
            </Button>
            <div className="text-xs text-gray-500 text-center">
              Need a courier boy for pickup? Click to request one.
            </div>
          </div>
        </BentoBox>

        <BentoBox title="Analytics Preview" icon={TrendingUp} size="large">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-gray-400">0</div>
              <div className="text-xs text-gray-500">Total Shipments</div>
            </div>
            <div className="text-center p-3 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-gray-400">₹0</div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
            <div className="text-center p-3 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-gray-400">0%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-gray-400">0</div>
              <div className="text-xs text-gray-500">Active Routes</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full shadow-sm">
              📊 Analytics data will appear after your first shipment
            </span>
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

export default NewCorporateDashboard;
