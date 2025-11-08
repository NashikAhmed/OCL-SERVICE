import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Info, CheckCircle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  date: string;
  isRead?: boolean;
}

interface AnnouncementCardProps {
  announcements: Announcement[];
  onMarkAsRead?: (id: string) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcements,
  onMarkAsRead
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'alert':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No announcements at this time</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border ${
                announcement.isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getIcon(announcement.type)}
                  <h4 className="text-sm font-medium text-gray-900">
                    {announcement.title}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getBadgeVariant(announcement.type)}>
                    {announcement.type}
                  </Badge>
                  {!announcement.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {announcement.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {announcement.date}
                </span>
                {!announcement.isRead && onMarkAsRead && (
                  <button
                    onClick={() => onMarkAsRead(announcement.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
