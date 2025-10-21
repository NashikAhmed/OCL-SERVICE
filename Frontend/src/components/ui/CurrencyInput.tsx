import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isBold?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  isBold = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Format number with Indian-style commas
  const formatIndianNumber = (num: string): string => {
    if (!num || num === '') return '';
    
    // Remove all non-numeric characters except decimal point
    const cleanNum = num.replace(/[^\d.]/g, '');
    
    if (cleanNum === '' || cleanNum === '.') return '';
    
    // Split by decimal point
    const parts = cleanNum.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Add Indian-style commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Limit decimal part to 2 digits
    const formattedDecimal = decimalPart.slice(0, 2);
    
    return formattedDecimal ? `${formattedInteger}.${formattedDecimal}` : formattedInteger;
  };

  // Parse formatted number back to raw number
  const parseFormattedNumber = (formatted: string): string => {
    return formatted.replace(/,/g, '');
  };

  useEffect(() => {
    if (value) {
      setDisplayValue(formatIndianNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatIndianNumber(inputValue);
    setDisplayValue(formatted);
    
    // Send the raw number (without commas) to parent
    const rawValue = parseFormattedNumber(formatted);
    onChange(rawValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isFloating = isFocused || value !== '';

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Input Field with dynamic ₹ positioning */}
        <div className="relative">
          <input
            type="text"
            value={isFocused ? displayValue : `₹ ${displayValue || '0.00'}`}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full py-2 text-right font-calibri
              border-0 border-b-2 border-gray-300 bg-transparent
              focus:outline-none focus:border-blue-500
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            `}
            style={{ fontFamily: 'Calibri, sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Floating Label - only show if label is not empty */}
        <AnimatePresence>
          {isFloating && label && (
            <motion.label
              initial={{ y: 0, scale: 1 }}
              animate={{ y: -8, scale: 0.85 }}
              exit={{ y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                absolute left-0 -top-2 px-1 bg-white font-calibri text-sm font-medium
                ${isFocused ? 'text-blue-500' : 'text-gray-600'}
                ${isBold ? 'font-bold text-base' : ''}
                transition-colors duration-200
              `}
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Static Label (when not floating) - only show if label is not empty */}
        {!isFloating && label && (
          <label
            className={`
              absolute left-0 top-3 font-calibri text-gray-500 cursor-text
              transition-colors duration-200
              ${isFocused ? 'text-blue-500' : 'text-gray-500'}
              ${isBold ? 'font-bold text-base' : ''}
            `}
            style={{ fontFamily: 'Calibri, sans-serif' }}
            onClick={() => document.querySelector('input')?.focus()}
          >
            {label}
          </label>
        )}
      </div>
    </div>
  );
};

export default CurrencyInput;
