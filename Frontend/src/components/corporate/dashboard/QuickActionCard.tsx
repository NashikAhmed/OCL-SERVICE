import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  isPrimary?: boolean;
}

interface QuickActionCardProps {
  title: string;
  description?: string;
  actions: QuickAction[];
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  actions
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            className={`w-full justify-start ${action.isPrimary ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.title}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
