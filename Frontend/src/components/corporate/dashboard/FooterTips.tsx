import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

interface Tip {
  id: string;
  title: string;
  message: string;
  category: 'general' | 'shipping' | 'billing' | 'support';
}

interface FooterTipsProps {
  tips: Tip[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

const FooterTips: React.FC<FooterTipsProps> = ({
  tips,
  autoRotate = true,
  rotationInterval = 5000
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || tips.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, tips.length]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  if (tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {currentTip.title}
              </h4>
              <p className="text-xs text-blue-700">
                {currentTip.message}
              </p>
            </div>
          </div>
          
          {tips.length > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={prevTip}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors"
                disabled={tips.length <= 1}
              >
                <ChevronLeft className="h-4 w-4 text-blue-600" />
              </button>
              <span className="text-xs text-blue-600">
                {currentTipIndex + 1}/{tips.length}
              </span>
              <button
                onClick={nextTip}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors"
                disabled={tips.length <= 1}
              >
                <ChevronRight className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterTips;
