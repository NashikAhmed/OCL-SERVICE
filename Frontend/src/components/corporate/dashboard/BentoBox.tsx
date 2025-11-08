import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BentoBoxProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  headerAction?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full' | 'xlarge';
}

const BentoBox: React.FC<BentoBoxProps> = ({
  title,
  children,
  icon: Icon,
  className = '',
  headerAction,
  size = 'medium'
}) => {
  const sizeClasses: Record<NonNullable<BentoBoxProps['size']>, string> = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
    wide: 'col-span-3 row-span-1',
    tall: 'col-span-1 row-span-2',
    xlarge: 'col-span-3 row-span-2',
    full: 'col-span-6 row-span-1'
  };

  return (
    <Card className={`${sizeClasses[size]} ${className} border-0 shadow-sm hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm overflow-hidden`}>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4 text-gray-600" />}
            <span>{title}</span>
          </div>
          {headerAction}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        {children}
      </CardContent>
    </Card>
  );
};

export default BentoBox;
