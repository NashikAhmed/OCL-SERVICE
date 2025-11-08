import React from 'react';
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  action?: () => void;
}

interface CompactChecklistProps {
  title: string;
  items: ChecklistItem[];
  onItemClick?: (item: ChecklistItem) => void;
}

const CompactChecklist: React.FC<CompactChecklistProps> = ({
  title,
  items,
  onItemClick
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = (completedCount / items.length) * 100;

  return (
    <div className="space-y-2">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-500">{completedCount}/{items.length}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center space-x-2 p-1.5 rounded transition-all duration-200 ${
              item.completed 
                ? 'bg-green-50 shadow-sm hover:shadow-md' 
                : 'bg-gray-50 shadow-sm hover:shadow-md hover:bg-gray-100'
            } ${item.action ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (item.action) {
                item.action();
              }
              if (onItemClick) {
                onItemClick(item);
              }
            }}
          >
            <div className="flex-shrink-0">
              {item.completed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <span className={`text-xs flex-1 ${
              item.completed ? 'text-green-800 line-through' : 'text-gray-700'
            }`}>
              {item.title}
            </span>
            {item.action && !item.completed && (
              <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactChecklist;
