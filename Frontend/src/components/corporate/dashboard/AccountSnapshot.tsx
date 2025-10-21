import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Clock, Shield, User, CreditCard } from "lucide-react";

interface AccountSnapshotProps {
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
}

const AccountSnapshot: React.FC<AccountSnapshotProps> = ({ corporate }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Account Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Account Status</span>
          <Badge variant={corporate.isActive ? "default" : "destructive"}>
            {corporate.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Corporate ID */}
        <div className="flex items-center space-x-3">
          <Building className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Corporate ID</p>
            <p className="text-sm text-gray-600">{corporate.corporateId}</p>
          </div>
        </div>

        {/* Billing Type */}
        {corporate.billingType && (
          <div className="flex items-center space-x-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Billing Type</p>
              <p className="text-sm text-gray-600">{corporate.billingType}</p>
            </div>
          </div>
        )}

        {/* Manager */}
        {corporate.manager && (
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Account Manager</p>
              <p className="text-sm text-gray-600">{corporate.manager}</p>
            </div>
          </div>
        )}

        {/* Billing Cycle */}
        {corporate.billingCycle && (
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Billing Cycle</p>
              <p className="text-sm text-gray-600">{corporate.billingCycle}</p>
            </div>
          </div>
        )}

        {/* Last Login */}
        <div className="flex items-center space-x-3">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Last Login</p>
            <p className="text-sm text-gray-600">{formatDate(corporate.lastLogin)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSnapshot;
