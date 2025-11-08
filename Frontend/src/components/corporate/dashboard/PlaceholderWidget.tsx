import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, MapPin, Clock } from "lucide-react";

interface PlaceholderWidgetProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  comingSoon?: boolean;
}

const PlaceholderWidget: React.FC<PlaceholderWidgetProps> = ({
  title,
  description,
  icon: Icon,
  comingSoon = true
}) => {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-gray-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-2">{description}</p>
          {comingSoon && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
              Coming Soon
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderWidget;
