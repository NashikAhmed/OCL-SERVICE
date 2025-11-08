import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface CompactMetricProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'green' | 'orange' | 'red' | 'blue' | 'purple';
  size?: 'small' | 'medium';
}

const CompactMetric: React.FC<CompactMetricProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'default',
  size = 'medium'
}) => {
  const colorConfig = {
    default: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      valueColor: 'text-gray-800',
      border: 'border-gray-200'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-800',
      border: 'border-green-200'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-800',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-800',
      border: 'border-red-200'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-800',
      border: 'border-blue-200'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-800',
      border: 'border-purple-200'
    }
  };

  const config = colorConfig[color];
  const textSize = size === 'small' ? 'text-base' : 'text-xl';
  const iconSize = size === 'small' ? 'h-4 w-4' : 'h-4 w-4';

  return (
    <div className={`relative overflow-hidden rounded-lg border ${config.border} ${config.bg} p-3 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-12 h-12 bg-current rounded-full -translate-y-6 translate-x-6"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-current rounded-full translate-y-4 -translate-x-4"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-md ${config.iconBg} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`${iconSize} ${config.iconColor}`} />
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-0.5">
          <div className={`${textSize} font-bold ${config.valueColor} group-hover:scale-105 transition-transform duration-200`}>
            {value}
          </div>
          <div className="text-xs font-medium text-gray-600 opacity-80 leading-tight">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactMetric;
