import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

interface DashboardDemoToggleProps {
  isNewCorporate: boolean;
  onToggle: () => void;
}

const DashboardDemoToggle: React.FC<DashboardDemoToggleProps> = ({
  isNewCorporate,
  onToggle
}) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-3">
          <div className="text-sm">
            <span className="text-gray-600">Demo Mode:</span>
            <Badge variant={isNewCorporate ? "secondary" : "default"} className="ml-2">
              {isNewCorporate ? "New Corporate" : "Active Corporate"}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="flex items-center space-x-1"
          >
            {isNewCorporate ? (
              <>
                <Eye className="h-3 w-3" />
                <span>Show Active</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" />
                <span>Show New</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemoToggle;
