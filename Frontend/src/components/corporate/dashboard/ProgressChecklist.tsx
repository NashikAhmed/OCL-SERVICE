import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

interface ProgressChecklistProps {
  title: string;
  items: ChecklistItem[];
  onItemClick?: (item: ChecklistItem) => void;
}

const ProgressChecklist: React.FC<ProgressChecklistProps> = ({
  title,
  items,
  onItemClick
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = (completedCount / items.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{items.length} completed
          </span>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
              item.completed 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
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
            <div className="flex-shrink-0 mt-0.5">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                item.completed ? 'text-green-800' : 'text-gray-900'
              }`}>
                {item.title}
              </h4>
              <p className={`text-xs mt-1 ${
                item.completed ? 'text-green-600' : 'text-gray-600'
              }`}>
                {item.description}
              </p>
            </div>
            {item.action && !item.completed && (
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProgressChecklist;
