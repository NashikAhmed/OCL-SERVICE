import React from 'react';
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentActivityItem {
  id: string;
  type: 'shipment' | 'delivery' | 'payment' | 'complaint';
  title: string;
  description: string;
  status: string;
  time: string;
}

interface CompactRecentActivityProps {
  title: string;
  items: RecentActivityItem[];
  onViewAll?: () => void;
}

const CompactRecentActivity: React.FC<CompactRecentActivityProps> = ({
  title,
  items,
  onViewAll
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <Package className="h-3 w-3 text-blue-600" />;
      case 'delivery':
        return <Truck className="h-3 w-3 text-green-600" />;
      case 'payment':
        return <CheckCircle className="h-3 w-3 text-purple-600" />;
      case 'complaint':
        return <Clock className="h-3 w-3 text-orange-600" />;
      default:
        return <Package className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in transit':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{title}</span>
        {onViewAll && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewAll}
            className="h-5 px-2 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View All
          </Button>
        )}
      </div>

      {/* Activity items */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="text-center py-4">
            <Package className="h-6 w-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">No recent activity</p>
          </div>
        ) : (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex-shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <Badge className={`${getStatusColor(item.status)} text-xs px-1.5 py-0.5`}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {item.description}
                </p>
                <p className="text-xs text-gray-400">
                  {item.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompactRecentActivity;
