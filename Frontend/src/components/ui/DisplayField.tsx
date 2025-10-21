import React from 'react';

interface DisplayFieldProps {
  label: string;
  value: string;
  className?: string;
  isBold?: boolean;
}

const DisplayField: React.FC<DisplayFieldProps> = ({
  label,
  value,
  className = '',
  isBold = false
}) => {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-gray-200 ${className}`}>
      <span className={`text-sm font-calibri text-gray-700 ${isBold ? 'font-bold text-base' : ''}`}>{label}:</span>
      <span className={`text-sm font-calibri text-gray-900 text-right ${isBold ? 'font-bold text-base' : ''}`}>{value}</span>
    </div>
  );
};

export default DisplayField;
