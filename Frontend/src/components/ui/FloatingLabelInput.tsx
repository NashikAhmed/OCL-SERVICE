import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
        {/* Input Field */}
        <input
          type="text"
          value={value}
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

        {/* Floating Label */}
        <AnimatePresence>
          {isFloating && (
            <motion.label
              initial={{ y: 0, scale: 1 }}
              animate={{ y: -8, scale: 0.85 }}
              exit={{ y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                absolute left-0 -top-2 px-1 bg-white font-calibri text-sm font-medium
                ${isFocused ? 'text-blue-500' : 'text-gray-600'}
                transition-colors duration-200
              `}
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Static Label (when not floating) */}
        {!isFloating && (
          <label
            className={`
              absolute left-0 top-3 font-calibri text-gray-500 cursor-text
              transition-colors duration-200
              ${isFocused ? 'text-blue-500' : 'text-gray-500'}
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

export default FloatingLabelInput;
