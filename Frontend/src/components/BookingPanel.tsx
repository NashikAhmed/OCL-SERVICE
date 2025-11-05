import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Check, 
  X, 
  Phone, 
  User, 
  Building, 
  Mail, 
  MapPin,
  Upload,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Minus,
  Calendar,
  Clock,
  Package,
  Plane,
  Truck,
  Train,
  Shield,
  FileText,
  Camera,
  DollarSign,
  IndianRupee,
  Edit3,
  ArrowRight,
  Search,
  XCircle,
  SquarePen,
  Globe,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import ImageUploadWithPreview from './ImageUploadWithPreview';
import InvoicePopup from './InvoicePopup';
import BookingConfirmation from './BookingConfirmation';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

// Floating Label Input Component
interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  disabledHoverDanger?: boolean; // when disabled, show red hover + not-allowed cursor
  serviceabilityStatus?: 'available' | 'unavailable' | null; // New prop for inline status
  showInlineStatus?: boolean; // Whether to show status inside input
  addressInfo?: string; // Address information to show below inline status
  errorMessage?: string; // Error message to show for non-serviceable areas
  placeholder?: string; // Custom placeholder for inputs
  hasValidationError?: boolean; // Validation error state
  validationErrorMessage?: string; // Validation error message to show below input
  compact?: boolean; // Compact size for smaller inputs
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // Callback when input loses focus
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Callback when key is pressed
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength,
  icon,
  disabled = false,
  className = '',
  disabledHoverDanger = false,
  serviceabilityStatus = null,
  showInlineStatus = false,
  addressInfo = '',
  errorMessage = '',
  placeholder = '',
  hasValidationError = false,
  validationErrorMessage = '',
  compact = false,
  onBlur
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;

  // Determine status display
  const getStatusDisplay = () => {
    if (!showInlineStatus || !serviceabilityStatus) return null;
    
    if (serviceabilityStatus === 'available') {
      return {
        text: 'Available',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: <CheckCircle className="w-3 h-3" />
      };
    } else {
      return {
        text: 'Not Available', 
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: <XCircle className="w-3 h-3" />
      };
    }
  };

  const statusDisplay = getStatusDisplay();
  const hasInlineStatus = showInlineStatus && serviceabilityStatus;

  return (
    <div className={`relative ${className} ${disabled && disabledHoverDanger ? 'group' : ''}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          type={type === 'date' && !isFocused && !hasValue ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full ${compact ? 'h-8' : 'h-10'} px-3 ${icon ? 'pl-10' : 'pl-3'} ${hasInlineStatus || hasValidationError ? 'pr-10' : 'pr-3'}
            border rounded-xl bg-white/90 backdrop-blur-sm
            transition-all duration-200 ease-in-out ${compact ? 'text-xs' : 'text-sm'}
            ${hasValidationError
              ? 'border-red-500 ring-2 ring-red-200'
              : isFocused 
                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)]' 
                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${disabled && disabledHoverDanger ? 'group-hover:border-red-500 group-hover:bg-red-50' : ''}
            focus:outline-none text-[#1e293b]
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
          placeholder={placeholder || ""}
          aria-disabled={disabled}
          title={disabled && disabledHoverDanger ? 'Origin pincode is Non - Serviceable' : undefined}
        />
        
        {/* Validation Error Alert Icon */}
        {hasValidationError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
        
        {/* Inline Status Display */}
        {hasInlineStatus && statusDisplay && !hasValidationError && (
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10`}>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
              {statusDisplay.icon}
              <span>{statusDisplay.text}</span>
            </div>
          </div>
        )}
        
        <label
          className={`
            absolute ${icon ? 'left-12' : 'left-4'} 
            transition-all duration-200 ease-in-out
            pointer-events-none select-none
            ${shouldFloat
              ? 'top-0 -translate-y-1/2 text-xs bg-white px-2 text-[#406ab9] font-medium'
              : compact 
                ? 'top-1/2 -translate-y-1/2 text-xs text-[#64748b]'
                : 'top-1/2 -translate-y-1/2 text-base text-[#64748b]'
            }
            ${isFocused && !hasValue ? 'text-[#406ab9]' : ''}
            ${disabled && disabledHoverDanger ? 'group-hover:text-red-600' : ''}
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {/* Address and Error Display Below Inline Status */}
      {showInlineStatus && serviceabilityStatus && (
        <div className="mt-1">
          {/* Address Info for Available Status */}
          {serviceabilityStatus === 'available' && addressInfo && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 justify-end pr-3"
            >
              <div className="text-xs text-black">
                {addressInfo}
              </div>
            </motion.div>
          )}
          
          {/* Error Message for Unavailable Status */}
          {serviceabilityStatus === 'unavailable' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 justify-end pr-3"
            >
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                {errorMessage}
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Validation Error Message */}
      {hasValidationError && validationErrorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1"
        >
          <div className="text-xs text-red-600">
            {validationErrorMessage}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Stepper Component
interface StepperProps {
  currentStep: number;
  steps: string[];
  completedSteps: boolean[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, completedSteps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300
                    ${completedSteps[index] 
                      ? 'bg-green-500 text-white' 
                      : currentStep === index 
                        ? 'bg-[#406ab9] text-white ring-2 ring-[#4ec0f7]/20' 
                        : 'bg-gray-300 text-[#64748b]'
                    }
                  `}
                >
                  {completedSteps[index] ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <span
                  className={`
                    mt-1 text-xs font-medium text-center max-w-16
                    ${currentStep === index ? 'text-[#406ab9] font-semibold' : 'text-[#64748b]'}
                  `}
                  style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-8 h-0.5 rounded-full transition-all duration-300
                    ${completedSteps[index] ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Floating Select Component
interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon,
  disabled = false,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full h-10 px-3 ${icon ? 'pl-10' : 'pl-3'} pr-8
            border rounded-xl bg-white/90 backdrop-blur-sm text-sm
            transition-all duration-200 ease-in-out
            ${isFocused 
              ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)]' 
              : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            focus:outline-none text-[#1e293b] appearance-none
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
        >
          <option value="" disabled hidden></option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label
          className={`
            absolute ${icon ? 'left-12' : 'left-4'}
            transition-all duration-200 ease-in-out
            pointer-events-none select-none
            ${shouldFloat
              ? 'top-0 -translate-y-1/2 text-xs bg-white px-2 text-[#406ab9] font-medium'
              : 'top-1/2 -translate-y-1/2 text-base text-[#64748b]'
            }
            ${isFocused && !hasValue ? 'text-[#406ab9]' : ''}
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Floating Textarea Component
interface FloatingTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  className?: string;
}

const FloatingTextarea: React.FC<FloatingTextareaProps> = ({
  label,
  value,
  onChange,
  required = false,
  rows = 4,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={`
            w-full px-3 pt-5 pb-3 text-sm
            border rounded-xl bg-white/90 backdrop-blur-sm resize-none
            transition-all duration-200 ease-in-out
            ${isFocused 
              ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)]' 
              : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
            }
            focus:outline-none text-[#1e293b]
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
          placeholder=""
        />
        <label
          className={`
            absolute left-4
            transition-all duration-200 ease-in-out
            pointer-events-none select-none
            ${shouldFloat
              ? 'top-0 -translate-y-1/2 text-xs bg-white px-2 text-blue-600 font-medium'
              : 'top-6 text-base text-gray-500'
            }
            ${isFocused && !hasValue ? 'text-blue-500' : ''}
          `}
          style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    </div>
  );
};

// Upload Box Component for Invoice, PAN, Declaration
interface UploadBoxProps {
  label: string;
  files: any[];
  onFilesChange: (files: any[]) => void;
  onPreview: (fileUrl: string) => void;
  compressImage: (file: File) => Promise<File>;
}

const UploadBox: React.FC<UploadBoxProps> = ({ label, files, onFilesChange, onPreview, compressImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Compress each file
      const compressedFilesPromises = validFiles.map(async (file) => {
        try {
          const compressedFile = await compressImage(file);
          return {
            file: compressedFile,
            name: compressedFile.name,
            preview: URL.createObjectURL(compressedFile),
            size: compressedFile.size
          };
        } catch (error: any) {
          alert(`Failed to process ${file.name}: ${error.message}`);
          return null;
        }
      });

      const compressedFiles = await Promise.all(compressedFilesPromises);
      const validCompressedFiles = compressedFiles.filter(f => f !== null);
      
      onFilesChange([...files, ...validCompressedFiles]);
    } catch (error) {
      console.error('Error compressing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="flex flex-col">
      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-3 flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-xs text-blue-700 font-medium">Compressing image...</span>
        </div>
      )}

      {/* Upload Area - Compact Version */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`
          bg-gradient-to-b from-blue-50/50 to-white
          border-2 border-dashed rounded-xl p-4
          transition-all duration-300 
          ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/70 hover:shadow-sm'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-center space-x-3">
          <Upload className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-700">{label}</p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP, PDF - Auto-compressed</p>
          </div>
        </div>
      </div>

      {/* Uploaded Files Gallery - Horizontal Thumbnails */}
      {files.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {/* Eye/Preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(file.preview || file.url || '');
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  title: string;
  data: any;
  stepType: string;
  currentStep: number;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  title,
  data,
  stepType,
  currentStep
}) => {
  if (!isOpen) return null;

  // Get step color based on current step
  const getStepColor = () => {
    switch (currentStep) {
      case 0: return 'blue';
      case 1: return 'green';
      case 2: return 'orange';
      case 3: return 'purple';
      case 4: return 'indigo';
      default: return 'emerald';
    }
  };

  const stepColor = getStepColor();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r from-${stepColor}-500 to-${stepColor}-600 px-8 py-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{title}</h3>
                <p className="text-${stepColor}-100 text-sm">Please review and confirm your details</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-96">
            <div className={`bg-gradient-to-r from-${stepColor}-50 to-${stepColor}-100 rounded-2xl p-6 border border-${stepColor}-200`}>
              <h4 className={`font-semibold text-${stepColor}-800 mb-4 text-lg flex items-center`}>
                <FileText className={`w-5 h-5 mr-2 text-${stepColor}-600`} />
                Step Details Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  
                  // Special handling for image fields
                  const isImageField = key === 'packageImages' || key === 'invoiceImages';
                  
                  return (
                    <div key={key} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className={`text-${stepColor}-600 text-xs font-medium uppercase tracking-wide mb-1`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        {isImageField ? (
                          Array.isArray(value) && value.length > 0 ? (
                            <div className="space-y-2">
                              {value.map((file, index) => {
                                const fileName = file.file?.name || file.originalName || 'Unknown';
                                const imageUrl = file.preview || file.url || (file.file ? URL.createObjectURL(file.file) : null);
                                
                                return (
                                  <div key={index} className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        if (imageUrl) {
                                          window.open(imageUrl, '_blank');
                                        }
                                      }}
                                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer transition-colors duration-200"
                                      title="Click to view image"
                                    >
                                      {fileName}
                                    </button>
                                    <span className="text-gray-400 text-xs">({file.file?.size ? `${(file.file.size / 1024).toFixed(1)} KB` : 'Unknown size'})</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm italic">No images uploaded</span>
                          )
                        ) : (
                          <span className="text-gray-800 font-semibold text-sm break-words">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-yellow-800 text-sm mb-1">Review Carefully</h5>
                  <p className="text-yellow-700 text-xs">
                    Please verify all information is correct before proceeding. You can edit details if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEdit}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Details
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-${stepColor}-500 to-${stepColor}-600 text-white font-semibold rounded-xl hover:from-${stepColor}-600 hover:to-${stepColor}-700 transition-all duration-200 flex items-center justify-center shadow-lg`}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Proceed to Next Step
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Final Confirmation Modal Component (Step 6a)
interface FinalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onBack: () => void;
  allData: any;
  loading?: boolean;
  errorMessage?: string | null;
}

const FinalConfirmationModal: React.FC<FinalConfirmationModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  onBack,
  allData,
  loading = false,
  errorMessage = null
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-1">Final Review & Confirmation</h3>
                <p className="text-emerald-100 text-sm">Please review all details before finalizing your booking</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Origin Details */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="font-bold text-blue-800 text-lg mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Origin Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {allData.originData?.name}</div>
                  <div><span className="font-medium">Mobile:</span> +91 {allData.originData?.mobileNumber}</div>
                  <div><span className="font-medium">Address:</span> {allData.originData?.flatBuilding}, {allData.originData?.locality}</div>
                  <div><span className="font-medium">Pincode:</span> {allData.originData?.pincode}</div>
                  <div><span className="font-medium">City:</span> {allData.originData?.city}, {allData.originData?.state}</div>
                </div>
              </div>

              {/* Destination Details */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-green-800 text-lg mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Destination Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {allData.destinationData?.name}</div>
                  <div><span className="font-medium">Mobile:</span> +91 {allData.destinationData?.mobileNumber}</div>
                  <div><span className="font-medium">Address:</span> {allData.destinationData?.flatBuilding}, {allData.destinationData?.locality}</div>
                  <div><span className="font-medium">Pincode:</span> {allData.destinationData?.pincode}</div>
                  <div><span className="font-medium">City:</span> {allData.destinationData?.city}, {allData.destinationData?.state}</div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                <h4 className="font-bold text-orange-800 text-lg mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Shipment Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nature:</span> {allData.shipmentData?.natureOfConsignment}</div>
                  <div><span className="font-medium">Service:</span> {allData.shipmentData?.services}</div>
                  <div><span className="font-medium">Mode:</span> {allData.shipmentData?.mode}</div>
                  <div><span className="font-medium">Insurance:</span> {allData.shipmentData?.insurance}</div>
                  <div><span className="font-medium">Dimensions:</span> {allData.shipmentData?.dimensions}</div>
                  <div><span className="font-medium">Weight:</span> {allData.shipmentData?.chargeableWeight} Kg</div>
                </div>
              </div>

              {/* Upload Details */}
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h4 className="font-bold text-purple-800 text-lg mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Package & Invoice Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Packages:</span> {allData.uploadData?.totalPackages}</div>
                  <div><span className="font-medium">Content:</span> {allData.uploadData?.contentDescription}</div>
                  <div><span className="font-medium">Invoice No:</span> {allData.uploadData?.invoiceNumber}</div>
                  <div><span className="font-medium">Invoice Value:</span> ₹{allData.uploadData?.invoiceValue}</div>
                  <div>
                    <span className="font-medium">Package Images:</span>
                    {Array.isArray(allData.uploadData?.packageImages) && allData.uploadData.packageImages.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {allData.uploadData.packageImages.map((file, index) => {
                          const fileName = file.file?.name || file.originalName || 'Unknown';
                          const imageUrl = file.preview || file.url || (file.file ? URL.createObjectURL(file.file) : null);
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (imageUrl) {
                                    window.open(imageUrl, '_blank');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer transition-colors duration-200"
                                title="Click to view image"
                              >
                                {fileName}
                              </button>
                              <span className="text-gray-400 text-xs">({file.file?.size ? `${(file.file.size / 1024).toFixed(1)} KB` : 'Unknown size'})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic ml-2">No package images uploaded</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Invoice Images:</span>
                    {Array.isArray(allData.uploadData?.invoiceImages) && allData.uploadData.invoiceImages.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {allData.uploadData.invoiceImages.map((file, index) => {
                          const fileName = file.file?.name || file.originalName || 'Unknown';
                          const imageUrl = file.preview || file.url || (file.file ? URL.createObjectURL(file.file) : null);
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (imageUrl) {
                                    window.open(imageUrl, '_blank');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer transition-colors duration-200"
                                title="Click to view image"
                              >
                                {fileName}
                              </button>
                              <span className="text-gray-400 text-xs">({file.file?.size ? `${(file.file.size / 1024).toFixed(1)} KB` : 'Unknown size'})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic ml-2">No invoice images uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200 lg:col-span-2">
                <h4 className="font-bold text-indigo-800 text-lg mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment & Delivery
                </h4>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-indigo-100 text-indigo-800 rounded-full text-lg font-bold">
                      Payment: {allData.paymentData?.mode}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-lg font-bold">
                      Delivery: {allData.paymentData?.deliveryType}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Step 1
              </motion.button>

              {errorMessage && (
                <div className="text-red-600 text-sm mr-4">{errorMessage}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onProceed}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center shadow-lg disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Finalize Booking'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Final Document Display Component (Step 6b)
interface FinalDocumentDisplayProps {
  allData: any;
  customerId: string;
  onStartNew: () => void;
}

const FinalDocumentDisplay: React.FC<FinalDocumentDisplayProps> = ({
  allData,
  customerId,
  onStartNew
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-auto"
    >
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">Your shipment booking has been successfully created</p>
          <div className="mt-4 inline-block bg-green-100 px-6 py-3 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Customer ID</p>
            <p className="text-2xl font-bold text-green-600">{customerId}</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white shadow-2xl rounded-2xl border-2 border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Origin Section */}
            <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                📍 ORIGIN DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Name:</strong> {allData.originData?.name}</div>
                <div><strong>Mobile:</strong> +91 {allData.originData?.mobileNumber}</div>
                <div><strong>Company:</strong> {allData.originData?.companyName || 'N/A'}</div>
                <div><strong>Email:</strong> {allData.originData?.email}</div>
                <div><strong>Address:</strong> {allData.originData?.flatBuilding}, {allData.originData?.locality}</div>
                <div><strong>Landmark:</strong> {allData.originData?.landmark || 'N/A'}</div>
                <div><strong>Pincode:</strong> {allData.originData?.pincode}</div>
                <div><strong>City:</strong> {allData.originData?.city}</div>
                <div><strong>District:</strong> {allData.originData?.district}</div>
                <div><strong>State:</strong> {allData.originData?.state}</div>
                <div><strong>GST:</strong> {allData.originData?.gstNumber || 'N/A'}</div>
                <div><strong>Type:</strong> {allData.originData?.addressType}</div>
              </div>
            </div>

            {/* Destination Section */}
            <div className="border border-green-200 rounded-xl p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-800 mb-4 border-b border-green-200 pb-2">
                🎯 DESTINATION DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Name:</strong> {allData.destinationData?.name}</div>
                <div><strong>Mobile:</strong> +91 {allData.destinationData?.mobileNumber}</div>
                <div><strong>Company:</strong> {allData.destinationData?.companyName || 'N/A'}</div>
                <div><strong>Email:</strong> {allData.destinationData?.email}</div>
                <div><strong>Address:</strong> {allData.destinationData?.flatBuilding}, {allData.destinationData?.locality}</div>
                <div><strong>Landmark:</strong> {allData.destinationData?.landmark || 'N/A'}</div>
                <div><strong>Pincode:</strong> {allData.destinationData?.pincode}</div>
                <div><strong>City:</strong> {allData.destinationData?.city}</div>
                <div><strong>District:</strong> {allData.destinationData?.district}</div>
                <div><strong>State:</strong> {allData.destinationData?.state}</div>
                <div><strong>GST:</strong> {allData.destinationData?.gstNumber || 'N/A'}</div>
                <div><strong>Type:</strong> {allData.destinationData?.addressType}</div>
              </div>
            </div>

            {/* Shipment Section */}
            <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
              <h3 className="text-xl font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2">
                📦 SHIPMENT DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Nature:</strong> {allData.shipmentData?.natureOfConsignment}</div>
                <div><strong>Service:</strong> {allData.shipmentData?.services}</div>
                <div><strong>Mode:</strong> {allData.shipmentData?.mode}</div>
                <div><strong>Insurance:</strong> {allData.shipmentData?.insurance}</div>
                <div><strong>Risk Coverage:</strong> {allData.shipmentData?.riskCoverage}</div>
                <div><strong>Dimensions:</strong> {allData.shipmentData?.dimensions}</div>
                <div><strong>Actual Weight:</strong> {allData.shipmentData?.actualWeight} Kg</div>
                {allData.shipmentData?.perKgWeight && (
                  <div><strong>Per Kg Rate:</strong> ₹{allData.shipmentData?.perKgWeight}</div>
                )}
                <div><strong>Volumetric Weight:</strong> {allData.shipmentData?.volumetricWeight} Kg</div>
                <div><strong>Chargeable Weight:</strong> {allData.shipmentData?.chargeableWeight} Kg</div>
              </div>
            </div>

            {/* Package & Payment Section */}
            <div className="space-y-6">
              {/* Package Details */}
              <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
                <h3 className="text-xl font-bold text-purple-800 mb-4 border-b border-purple-200 pb-2">
                  📋 PACKAGE DETAILS
                </h3>
                <div className="space-y-2">
                  <div><strong>Total Packages:</strong> {allData.uploadData?.totalPackages}</div>
                  <div><strong>Content:</strong> {allData.uploadData?.contentDescription}</div>
                  <div><strong>Invoice No:</strong> {allData.uploadData?.invoiceNumber}</div>
                  <div><strong>Invoice Value:</strong> ₹{allData.uploadData?.invoiceValue}</div>
                  {allData.uploadData?.eWaybillNumber && (
                    <div><strong>E-Waybill:</strong> {allData.uploadData.eWaybillNumber}</div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50">
                <h3 className="text-xl font-bold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">
                  💳 PAYMENT & DELIVERY
                </h3>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-lg font-bold">
                      Payment: {allData.paymentData?.mode}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-bold">
                      Delivery: {allData.paymentData?.deliveryType}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Print Document
            </button>
            <button
              onClick={onStartNew}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            Please save this document for your records. Your booking reference is: <strong>{customerId}</strong>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const BookingPanel: React.FC = () => {
  // Main flow state
  const [flowType, setFlowType] = useState<'public' | 'corporate'>('public');
  
  // Public flow states
  const [originPincode, setOriginPincode] = useState('');
  const [destinationPincode, setDestinationPincode] = useState('');
  const [originServiceable, setOriginServiceable] = useState<boolean | null>(null);
  const [destinationServiceable, setDestinationServiceable] = useState<boolean | null>(null);
  const [showNonServiceableMessage, setShowNonServiceableMessage] = useState(false);
  
  // Corporate flow states
  const [corporateId, setCorporateId] = useState('');
  const [corporateMobile, setCorporateMobile] = useState('');
  const [corporateData, setCorporateData] = useState<any>(null);
  const [corporateSearchType, setCorporateSearchType] = useState<'id' | 'mobile'>('id');
  
  // Stepper states
  const [showStepper, setShowStepper] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false, false, false, false]);
  
  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Booking submission state
  const [isBookingSubmitted, setIsBookingSubmitted] = useState(false);
  
  const steps = ['Origin', 'Destination', 'Shipment Details', 'Upload', 'Bill', 'Details', 'Mode of Payment', 'Successful'];

  // Form data states for all steps
  const [originData, setOriginData] = useState({
    mobileNumber: '',
    name: '',
    companyName: '',
    email: '',
    locality: '',
    flatBuilding: '',
    landmark: '',
    pincode: '',
    area: '',
    city: '',
    district: '',
    state: '',
    gstNumber: '',
    alternateNumbers: [''],
    addressType: 'Home',
    birthday: '',
    anniversary: '',
    otherAlternateNumber: '',
    showOtherAlternateNumber: false,
    website: ''
  });

  const [destinationData, setDestinationData] = useState({
    mobileNumber: '',
    name: '',
    companyName: '',
    email: '',
    locality: '',
    flatBuilding: '',
    landmark: '',
    pincode: '',
    area: '',
    city: '',
    district: '',
    state: '',
    gstNumber: '',
    alternateNumbers: [''],
    addressType: 'Home',
    website: '',
    anniversary: '',
    birthday: ''
  });

  const [shipmentData, setShipmentData] = useState({
    natureOfConsignment: 'NON-DOX',
    services: 'Standard',
    mode: 'Air',
    insurance: 'Consignor not insured the shipment',
    riskCoverage: 'Owner',
    dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
    actualWeight: '',
    perKgWeight: '',
    volumetricWeight: 0,
    chargeableWeight: 0
  });

  const [uploadData, setUploadData] = useState({
    totalPackages: '',
    materials: '',
    packageImages: [],
    contentDescription: '',
    invoiceNumber: '',
    invoiceValue: '',
    invoiceImages: [],
    panImages: [],
    declarationImages: [],
    eWaybillNumber: '',
    acceptTerms: false
  });

  const [paymentData, setPaymentData] = useState({
    mode: '',
    deliveryType: ''
  });

  const [billData, setBillData] = useState({
    partyType: '', // 'sender', 'recipient', or 'other'
    otherPartyDetails: {
      concernName: '',
      companyName: '',
      phoneNumber: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: ''
    },
    billType: '' // 'normal' or 'rcm'
  });

  const [showOtherPartyForm, setShowOtherPartyForm] = useState(false);
  const [otherPartyAreas, setOtherPartyAreas] = useState<string[]>([]);
  const [otherPartyPinError, setOtherPartyPinError] = useState<string | null>(null);

  const [detailsData, setDetailsData] = useState({
    freightCharge: '',
    awbCharge: '',
    localCollection: '',
    doorDelivery: '',
    loadingUnloading: '',
    demurrageCharge: '',
    ddaCharge: '',
    hamaliCharge: '',
    packingCharge: '',
    otherCharge: '',
    total: '',
    fuelCharge: '', // Stores percentage value or custom value
    fuelChargeType: 'percentage', // 'percentage' or 'custom'
    sgstAmount: '',
    cgstAmount: '',
    igstAmount: '',
    grandTotal: ''
  });

  const [showCustomFuelCharge, setShowCustomFuelCharge] = useState(false);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPackageImageModal, setShowPackageImageModal] = useState(false);
  const [isDescriptionBlurred, setIsDescriptionBlurred] = useState(false);
  const [isPackageInfoComplete, setIsPackageInfoComplete] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalTitle, setModalTitle] = useState('');
  const [currentStepType, setCurrentStepType] = useState('');
  const [isChargeableFixed, setIsChargeableFixed] = useState(false);
  const [eWaybillDigits, setEWaybillDigits] = useState<string[]>(Array(12).fill(''));
  
  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState('');

  // Success state
  const [generatedCustomerId, setGeneratedCustomerId] = useState('');
  
  // Final document states
  const [showFinalDocument, setShowFinalDocument] = useState(false);
  const [allFormData, setAllFormData] = useState({});
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pincode lookup states
  const [originAreas, setOriginAreas] = useState<string[]>([]);
  const [destinationAreas, setDestinationAreas] = useState<string[]>([]);
  const [originPinError, setOriginPinError] = useState<string | null>(null);
  const [destinationPinError, setDestinationPinError] = useState<string | null>(null);
  
  // GST validation states
  const [originGstError, setOriginGstError] = useState(false);
  const [destinationGstError, setDestinationGstError] = useState(false);
  const [otherPartyGstError, setOtherPartyGstError] = useState(false);

  // Email validation states
  const [originEmailError, setOriginEmailError] = useState(false);
  const [destinationEmailError, setDestinationEmailError] = useState(false);

  // OTP-style mobile input states
  const [mobileDigits, setMobileDigits] = useState<string[]>(Array(10).fill(''));
  const [userFound, setUserFound] = useState<boolean | null>(null);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressDeliveryConfirmed, setAddressDeliveryConfirmed] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // OTP verification states
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [checkingPhoneNumber, setCheckingPhoneNumber] = useState(false);
  


  // Country codes data
  const countryCodes = [
    { code: '+91', flag: '/src/Icon-images/india.png' },
  ];
  
  // Destination mobile input states (same as origin)
  const [destinationMobileDigits, setDestinationMobileDigits] = useState<string[]>(() => Array(10).fill(''));
  const [destinationUserFound, setDestinationUserFound] = useState<boolean | null>(null);
  const [destinationUserSummary, setDestinationUserSummary] = useState<any>(null);
  const [showDestinationManualForm, setShowDestinationManualForm] = useState(false);
  const [showDestinationSummaryCard, setShowDestinationSummaryCard] = useState(false);
  const [destinationUserAddresses, setDestinationUserAddresses] = useState<any[]>([]);
  const [selectedDestinationAddressId, setSelectedDestinationAddressId] = useState<string | null>(null);
  const [destinationAddressDeliveryConfirmed, setDestinationAddressDeliveryConfirmed] = useState(false);
  const [editingDestinationAddressId, setEditingDestinationAddressId] = useState<string | null>(null);

  // Utility functions
  // Image compression utility
  const compressImage = async (file: File): Promise<File> => {
    const MAX_SIZE_MB = 20;
    const TARGET_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

    // Check if file exceeds maximum allowed size (20MB)
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`Image size exceeds 20 MB. Please upload a smaller image. Current size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }

    // If file is already under 10MB, return as is
    if (file.size <= TARGET_SIZE_BYTES) {
      return file;
    }

    // Compression options
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.8,
    };

    try {
      setIsCompressing(true);
      setCompressionMessage('Compressing image...');
      
      const compressedFile = await imageCompression(file, options);
      
      // Check if compressed file is still too large
      if (compressedFile.size > TARGET_SIZE_BYTES) {
        throw new Error('Image size too large even after compression. Please upload a smaller image.');
      }

      setIsCompressing(false);
      setCompressionMessage('');
      return compressedFile;
    } catch (error: any) {
      setIsCompressing(false);
      setCompressionMessage('');
      throw error;
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour12: true })
    };
  };

  // LocalStorage functions for data persistence
  const saveToLocalStorage = () => {
    const formData = {
      flowType,
      originData,
      destinationData,
      shipmentData,
      uploadData,
      paymentData,
      billData,
      detailsData,
      currentStep,
      completedSteps,
      originPincode,
      destinationPincode,
      originServiceable,
      destinationServiceable,
      corporateId,
      corporateMobile,
      corporateData,
      corporateSearchType,
      showStepper,
      sessionId: Date.now() // Add session identifier
    };
    localStorage.setItem('bookingFormData', JSON.stringify(formData));
  };

  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('bookingFormData');
      if (savedData) {
        const formData = JSON.parse(savedData);
        
        // Check if the saved data is from the current session (within last 30 minutes)
        const currentTime = Date.now();
        const sessionAge = currentTime - (formData.sessionId || 0);
        const maxSessionAge = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // If data is older than 30 minutes, clear it
        if (sessionAge > maxSessionAge) {
          clearLocalStorage();
          return;
        }
        setFlowType(formData.flowType || 'public');
        setOriginData(formData.originData || {
          mobileNumber: '', name: '', companyName: '', email: '', pincode: '', area: '',
          locality: '', flatBuilding: '', landmark: '', gstNumber: '', city: '', district: '',
          state: '', alternateNumbers: [''], addressType: 'Home', birthday: '', anniversary: '',
          otherAlternateNumber: '', showOtherAlternateNumber: false
        });
        setDestinationData(formData.destinationData || {
          mobileNumber: '', name: '', companyName: '', email: '', pincode: '', area: '',
          locality: '', flatBuilding: '', landmark: '', gstNumber: '', city: '', district: '',
          state: '', alternateNumbers: [''], addressType: 'Home'
        });
        setShipmentData(formData.shipmentData || {
          natureOfConsignment: 'NON-DOX', services: 'Standard', mode: 'Air',
          insurance: 'Consignor not insured the shipment', riskCoverage: 'Owner',
          dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
          actualWeight: '', perKgWeight: '', volumetricWeight: 0, chargeableWeight: 0
        });
        setUploadData(formData.uploadData || {
          totalPackages: '', packageImages: [], contentDescription: '', invoiceNumber: '',
          invoiceValue: '', invoiceImages: [], eWaybillNumber: '', acceptTerms: false
        });
        setPaymentData(formData.paymentData || { mode: '', deliveryType: '' });
        setBillData(formData.billData || {
          partyType: '',
          otherPartyDetails: {
            concernName: '',
            companyName: '',
            phoneNumber: '',
            locality: '',
            flatBuilding: '',
            landmark: '',
            pincode: '',
            area: '',
            city: '',
            district: '',
            state: '',
            gstNumber: ''
          },
          billType: ''
        });
        setDetailsData(formData.detailsData || {
          freightCharge: '',
          awbCharge: '',
          localCollection: '',
          doorDelivery: '',
          loadingUnloading: '',
          demurrageCharge: '',
          ddaCharge: '',
          hamaliCharge: '',
          packingCharge: '',
          otherCharge: '',
          total: '',
          fuelCharge: '',
          fuelChargeType: 'percentage',
          sgstAmount: '',
          cgstAmount: '',
          igstAmount: '',
          grandTotal: ''
        });
        setCurrentStep(formData.currentStep || 0);
        setCompletedSteps(formData.completedSteps || []);
        setOriginPincode(formData.originPincode || '');
        setDestinationPincode(formData.destinationPincode || '');
        setOriginServiceable(formData.originServiceable);
        setDestinationServiceable(formData.destinationServiceable);
        setCorporateId(formData.corporateId || '');
        setCorporateMobile(formData.corporateMobile || '');
        setCorporateData(formData.corporateData || null);
        setCorporateSearchType(formData.corporateSearchType || 'id');
        setShowStepper(formData.showStepper || false);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('bookingFormData');
  };

  // Comprehensive form reset function
  const resetAllFormData = () => {
    // Reset all form states to initial values
    setOriginData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      birthday: '',
      anniversary: '',
      otherAlternateNumber: '',
      showOtherAlternateNumber: false,
      website: ''
    });

    setDestinationData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      website: '',
      anniversary: '',
      birthday: ''
    });

    setShipmentData({
      natureOfConsignment: 'NON-DOX',
      services: 'Standard',
      mode: 'Air',
      insurance: 'Consignor not insured the shipment',
      riskCoverage: 'Owner',
      dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
      actualWeight: '',
      perKgWeight: '',
      volumetricWeight: 0,
      chargeableWeight: 0
    });

    setUploadData({
      totalPackages: '',
      materials: '',
      packageImages: [],
      contentDescription: '',
      invoiceNumber: '',
      invoiceValue: '',
      invoiceImages: [],
      panImages: [],
      declarationImages: [],
      eWaybillNumber: '',
      acceptTerms: false
    });

    setPaymentData({
      mode: '',
      deliveryType: ''
    });

    setBillData({
      partyType: '',
      otherPartyDetails: {
        concernName: '',
        companyName: '',
        phoneNumber: '',
        locality: '',
        flatBuilding: '',
        landmark: '',
        pincode: '',
        area: '',
        city: '',
        district: '',
        state: '',
        gstNumber: ''
      },
      billType: ''
    });

    setDetailsData({
      freightCharge: '',
      awbCharge: '',
      localCollection: '',
      doorDelivery: '',
      loadingUnloading: '',
      demurrageCharge: '',
      ddaCharge: '',
      hamaliCharge: '',
      packingCharge: '',
      otherCharge: '',
      total: '',
      fuelCharge: '',
      fuelChargeType: 'percentage',
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      grandTotal: ''
    });

    // Reset flow and step states
    setFlowType('public');
    setCurrentStep(0);
    setCompletedSteps([false, false, false, false, false, false, false, false]);
    setShowStepper(false);
    setIsBookingSubmitted(false);
    setShowFinalDocument(false);
    setShowInvoiceModal(false);

    // Reset pincode states
    setOriginPincode('');
    setDestinationPincode('');
    setOriginServiceable(null);
    setDestinationServiceable(null);
    setShowNonServiceableMessage(false);

    // Reset corporate states
    setCorporateId('');
    setCorporateMobile('');
    setCorporateData(null);
    setCorporateSearchType('id');

    // Reset other states
    setShowOtherPartyForm(false);
    setOtherPartyAreas([]);
    setOtherPartyPinError(null);
    setGeneratedCustomerId('');
    setShowOTPVerification(false);
    setOtpVerified(false);
    setUserFound(false);
    setDestinationUserFound(false);
    setUserAddresses([]);
    setDestinationUserAddresses([]);
    setMobileDigits(['', '', '', '', '', '', '', '', '', '']);
    setCheckingPhoneNumber(false);
    setSubmitError(null);
    setSubmitLoading(false);

    // Clear localStorage
    clearLocalStorage();
  };

  // Load data on component mount to preserve user's current state
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Clear form data when component unmounts (user navigates away or closes browser)
  useEffect(() => {
    return () => {
      // Only clear if booking was not successfully submitted
      if (!isBookingSubmitted) {
        clearLocalStorage();
      }
    };
  }, [isBookingSubmitted]);

  // Handle browser/tab closure and visibility changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear form data when user is about to leave the page
      if (!isBookingSubmitted) {
        clearLocalStorage();
      }
    };

    const handleVisibilityChange = () => {
      // Clear form data when tab becomes hidden (user switches tabs or minimizes browser)
      if (document.hidden && !isBookingSubmitted) {
        clearLocalStorage();
      }
    };

    const handlePageHide = () => {
      // Clear form data when page is being unloaded (browser close, navigation, etc.)
      if (!isBookingSubmitted) {
        clearLocalStorage();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isBookingSubmitted]);

  // Handle user inactivity - clear form data after 15 minutes of inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (!isBookingSubmitted) {
        inactivityTimer = setTimeout(() => {
          clearLocalStorage();
        }, 15 * 60 * 1000); // 15 minutes
      }
    };

    // Reset timer on user activity
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Add activity listeners
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);

    // Start the initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isBookingSubmitted]);

  // Save data whenever any form data changes
  useEffect(() => {
    saveToLocalStorage();
  }, [flowType, originData, destinationData, shipmentData, uploadData, paymentData, billData, detailsData, currentStep, completedSteps, originPincode, destinationPincode, originServiceable, destinationServiceable, corporateId, corporateMobile, corporateData, corporateSearchType, showStepper]);

  // Pre-fill pincodes when stepper becomes visible
  useEffect(() => {
    if (showStepper) {
      // Pre-fill origin pincode if available
      if (originPincode.length === 6 && originData.pincode !== originPincode) {
        setOriginData(prev => ({ ...prev, pincode: originPincode }));
        autoFillFromPincode(originPincode, 'origin');
      }
      // Pre-fill destination pincode if available
      if (destinationPincode.length === 6 && destinationData.pincode !== destinationPincode) {
        setDestinationData(prev => ({ ...prev, pincode: destinationPincode }));
        autoFillFromPincode(destinationPincode, 'destination');
      }
    }
  }, [showStepper, originPincode, destinationPincode]);

  // Auto-calculate Freight Charge based on Per Kg Weight
  useEffect(() => {
    // Only auto-calculate if per Kg weight is provided and fixed mode is not activated
    if (shipmentData.perKgWeight && !isChargeableFixed) {
      const perKgRate = parseFloat(shipmentData.perKgWeight);
      const chargeableWeight = calculateChargeableWeight();
      
      if (!isNaN(perKgRate) && perKgRate > 0 && chargeableWeight > 0) {
        const calculatedFreight = perKgRate * chargeableWeight;
        const formattedFreight = formatIndianNumberWithDecimals(calculatedFreight.toString());
        
        // Only update if the calculated value is different from current value
        if (detailsData.freightCharge !== formattedFreight) {
          setDetailsData(prev => ({ ...prev, freightCharge: formattedFreight }));
        }
      }
    } else if (isChargeableFixed && detailsData.freightCharge) {
      // Clear freight charge when fixed mode is activated
      setDetailsData(prev => ({ ...prev, freightCharge: '' }));
    }
  }, [shipmentData.perKgWeight, shipmentData.actualWeight, shipmentData.dimensions, isChargeableFixed]);

  // Helper function to get the state of the selected party
  const getSelectedPartyState = (): string => {
    if (billData.partyType === 'sender') {
      return originData.state || '';
    } else if (billData.partyType === 'recipient') {
      return destinationData.state || '';
    } else if (billData.partyType === 'other') {
      return billData.otherPartyDetails.state || '';
    }
    return '';
  };

  // Auto-calculate Total, GST, and Grand Total
  useEffect(() => {
    // Helper to parse formatted numbers
    const parseFormattedNumber = (value: string): number => {
      if (!value) return 0;
      return parseFloat(value.replace(/,/g, '')) || 0;
    };

    // Calculate sum of all charges (excluding fuel)
    const freight = parseFormattedNumber(detailsData.freightCharge);
    const awb = parseFormattedNumber(detailsData.awbCharge);
    const localCollection = parseFormattedNumber(detailsData.localCollection);
    const doorDelivery = parseFormattedNumber(detailsData.doorDelivery);
    const loadingUnloading = parseFormattedNumber(detailsData.loadingUnloading);
    const fov = parseFormattedNumber(detailsData.demurrageCharge);
    const dda = parseFormattedNumber(detailsData.ddaCharge);
    const hamali = parseFormattedNumber(detailsData.hamaliCharge);
    const packing = parseFormattedNumber(detailsData.packingCharge);
    const other = parseFormattedNumber(detailsData.otherCharge);

    let subtotal = freight + awb + localCollection + doorDelivery + loadingUnloading + fov + dda + hamali + packing + other;

    // Apply fuel charge if exists
    if (detailsData.fuelCharge) {
      const fuelPercentage = parseFloat(detailsData.fuelCharge);
      if (!isNaN(fuelPercentage) && fuelPercentage > 0) {
        const fuelAmount = (subtotal * fuelPercentage) / 100;
        subtotal += fuelAmount;
      }
    }

    // Format and set total
    const formattedTotal = subtotal > 0 ? formatIndianNumberWithDecimals(subtotal.toString()) : '';

    // Calculate GST based on Bill Type and State
    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    if (billData.billType === 'normal') {
      const selectedPartyState = getSelectedPartyState();
      
      if (selectedPartyState.toLowerCase() === 'assam') {
        // If state is Assam: CGST (9%) and SGST (9%), IGST (0%)
        cgst = subtotal * 0.09;
        sgst = subtotal * 0.09;
        igst = 0;
      } else {
        // If state is not Assam: IGST (18%), CGST (0%) and SGST (0%)
        igst = subtotal * 0.18;
        cgst = 0;
        sgst = 0;
      }
    } else if (billData.billType === 'rcm') {
      // RCM: Calculate IGST (18%)
      igst = subtotal * 0.18;
    }

    const formattedSGST = sgst > 0 ? formatIndianNumberWithDecimals(sgst.toString()) : '';
    const formattedCGST = cgst > 0 ? formatIndianNumberWithDecimals(cgst.toString()) : '';
    const formattedIGST = igst > 0 ? formatIndianNumberWithDecimals(igst.toString()) : '';

    // Calculate Grand Total
    const grandTotalValue = subtotal + sgst + cgst + igst;
    const formattedGrandTotal = grandTotalValue > 0 ? formatIndianNumberWithDecimals(grandTotalValue.toString()) : '';

    // Update state only if values have changed to avoid infinite loop
    setDetailsData(prev => {
      if (prev.total !== formattedTotal || 
          prev.sgstAmount !== formattedSGST || 
          prev.cgstAmount !== formattedCGST || 
          prev.igstAmount !== formattedIGST ||
          prev.grandTotal !== formattedGrandTotal) {
        return {
          ...prev,
          total: formattedTotal,
          sgstAmount: formattedSGST,
          cgstAmount: formattedCGST,
          igstAmount: formattedIGST,
          grandTotal: formattedGrandTotal
        };
      }
      return prev;
    });
  }, [
    detailsData.freightCharge,
    detailsData.awbCharge,
    detailsData.localCollection,
    detailsData.doorDelivery,
    detailsData.loadingUnloading,
    detailsData.demurrageCharge,
    detailsData.ddaCharge,
    detailsData.hamaliCharge,
    detailsData.packingCharge,
    detailsData.otherCharge,
    detailsData.fuelCharge,
    billData.billType,
    billData.partyType,
    originData.state,
    destinationData.state,
    billData.otherPartyDetails.state
  ]);

  // Helper function to parse invoice value (remove commas)
  const parseInvoiceValue = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  // Format number in Indian numbering system with 2 decimal places
  const formatIndianNumber = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    let numStr = value.replace(/[^\d.]/g, '');
    
    // Handle empty or invalid input
    if (!numStr || numStr === '.') return '';
    
    // Split into integer and decimal parts
    const parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';
    
    // Remove leading zeros
    integerPart = integerPart.replace(/^0+/, '') || '0';
    
    // Apply Indian numbering system (last 3 digits, then groups of 2)
    let formattedInteger = '';
    if (integerPart.length <= 3) {
      formattedInteger = integerPart;
    } else {
      const lastThree = integerPart.slice(-3);
      const remaining = integerPart.slice(0, -3);
      formattedInteger = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    
    // Limit decimal to 2 places
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.slice(0, 2);
    }
    
    // Return formatted number with decimal if exists
    if (parts.length > 1) {
      return formattedInteger + '.' + decimalPart;
    }
    
    return formattedInteger;
  };

  // Format number with exactly 2 decimal places for display
  const formatIndianNumberWithDecimals = (value: string): string => {
    if (!value) return '';
    
    // Remove commas for calculation
    const numValue = parseFloat(value.replace(/,/g, ''));
    
    if (isNaN(numValue)) return '';
    
    // Format to 2 decimal places
    const fixedValue = numValue.toFixed(2);
    const parts = fixedValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Apply Indian numbering system
    let formattedInteger = '';
    if (integerPart.length <= 3) {
      formattedInteger = integerPart;
    } else {
      const lastThree = integerPart.slice(-3);
      const remaining = integerPart.slice(0, -3);
      formattedInteger = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    
    return formattedInteger + '.' + decimalPart;
  };

  // GST validation function
  const validateGSTFormat = (value: string) => {
    // Remove any non-alphanumeric characters
    let cleanValue = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // Limit to 15 characters
    cleanValue = cleanValue.slice(0, 15);
    
    // Apply GST format rules
    let formattedValue = '';
    
    for (let i = 0; i < cleanValue.length; i++) {
      const char = cleanValue[i];
      
      if (i < 2) {
        // First 2 digits: State code (numbers only)
        if (/[0-9]/.test(char)) {
          formattedValue += char;
        }
      } else if (i < 7) {
        // Next 5 characters: Alphabets only (positions 2-6)
        if (/[A-Z]/.test(char)) {
          formattedValue += char;
        }
      } else if (i < 11) {
        // Next 4 characters: Numbers only (positions 7-10)
        if (/[0-9]/.test(char)) {
          formattedValue += char;
        }
      } else if (i === 11) {
        // 12th character: Alphabet only
        if (/[A-Z]/.test(char)) {
          formattedValue += char;
        }
      } else if (i === 12) {
        // 13th character: Entity code (1-9, then A-Z)
        if (/[1-9A-Z]/.test(char)) {
          formattedValue += char;
        }
      } else if (i === 13) {
        // 14th character: Always Z
        formattedValue += 'Z';
      } else if (i === 14) {
        // 15th character: Checksum (can be number or alphabet)
        if (/[0-9A-Z]/.test(char)) {
          formattedValue += char;
        }
      }
    }
    
    return formattedValue;
  };

  const calculateVolumetricWeight = () => {
    const total = shipmentData.dimensions.reduce((sum, dim) => {
      const l = parseFloat(dim.length) || 0;
      const b = parseFloat(dim.breadth) || 0;
      const h = parseFloat(dim.height) || 0;
      const multiplier = dim.unit === 'cm' ? 1 : (dim.unit === 'mm' ? 0.1 : 100);
      return sum + (l * b * h * multiplier);
    }, 0);
    const volumetric = Math.round((total / 5000) * 100) / 100;
    
    // Update shipment data with calculated volumetric weight
    if (shipmentData.volumetricWeight !== volumetric) {
      setShipmentData(prev => ({ ...prev, volumetricWeight: volumetric }));
    }
    
    return volumetric;
  };

  const calculateChargeableWeight = () => {
    const volumetric = calculateVolumetricWeight();
    const actual = parseFloat(shipmentData.actualWeight) || 0;
    const chargeable = Math.max(volumetric, actual);
    
    // Update shipment data with calculated chargeable weight
    if (shipmentData.chargeableWeight !== chargeable) {
      setShipmentData(prev => ({ ...prev, chargeableWeight: chargeable }));
    }
    
    return chargeable;
  };

  // Helper to parse backend pincode response into flat values
  const parsePincodeResponse = (data: any) => {
    try {
      if (!data || typeof data !== 'object') {
        return { state: '', city: '', district: '', areas: [] };
      }
      
      const state: string = data?.state || '';
      const citiesObj = data?.cities || {};
      const firstCityKey = citiesObj && Object.keys(citiesObj).length > 0 ? Object.keys(citiesObj)[0] : '';
      const city: string = firstCityKey || '';
      const districtsObj = firstCityKey ? citiesObj[firstCityKey]?.districts || {} : {};
      const firstDistrictKey = districtsObj && Object.keys(districtsObj).length > 0 ? Object.keys(districtsObj)[0] : '';
      const district: string = firstDistrictKey || '';
      const areasArr = firstDistrictKey ? districtsObj[firstDistrictKey]?.areas || [] : [];
      const areas: string[] = Array.isArray(areasArr) ? areasArr.map((a: any) => a?.name || '').filter(Boolean) : [];
      
      return { state, city, district, areas };
    } catch (error) {
      console.error('Error parsing pincode response:', error);
      return { state: '', city: '', district: '', areas: [] };
    }
  };

  // Auto-fill address data from pincode via backend
  const autoFillFromPincode = async (pincode: string, type: 'origin' | 'destination') => {
    try {
      if (type === 'origin') {
        setOriginPinError(null);
      } else {
        setDestinationPinError(null);
      }
      
      // Validate pincode format before making API call
      if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        throw new Error('Invalid pincode format');
      }
      
      const { data } = await axios.get(`${API_BASE}/api/pincode/${pincode}`);
      if (!data) throw new Error('Invalid pincode');
      
      const parsed = parsePincodeResponse(data);
      const updateData = {
        city: parsed.city || '',
        district: parsed.district || '',
        state: parsed.state || ''
      };
      const areas: string[] = parsed.areas || [];
      
      if (type === 'origin') {
        setOriginData(prev => ({ ...prev, ...updateData }));
        setOriginAreas(areas);
      } else {
        setDestinationData(prev => ({ ...prev, ...updateData }));
        setDestinationAreas(areas);
      }
    } catch (err: any) {
      console.error(`Error fetching pincode data for ${type}:`, err);
      // Don't show error message for unserviceable pincodes
      // Just set empty areas array to show disabled dropdown
      if (type === 'origin') {
        setOriginPinError(null);
        setOriginAreas([]);
        // For unserviceable pincodes, we could potentially get basic location info
        // from a different source or show a generic message, but for now just clear areas
      } else {
        setDestinationPinError(null);
        setDestinationAreas([]);
      }
    }
  };

  // Auto-fill address data from pincode for other party
  const autoFillOtherPartyFromPincode = async (pincode: string) => {
    try {
      setOtherPartyPinError(null);
      const { data } = await axios.get(`${API_BASE}/api/pincode/${pincode}`);
      if (!data) throw new Error('Invalid pincode');
      const parsed = parsePincodeResponse(data);
      const updateData = {
        city: parsed.city,
        district: parsed.district,
        state: parsed.state
      };
      const areas: string[] = parsed.areas;
      setBillData(prev => ({
        ...prev,
        otherPartyDetails: {
          ...prev.otherPartyDetails,
          ...updateData
        }
      }));
      setOtherPartyAreas(areas);
    } catch (err: any) {
      setOtherPartyPinError(null);
      setOtherPartyAreas([]);
    }
  };

  // Handle step save - directly proceed to next step
  const handleStepSave = (stepIndex: number) => {
    // Special handling for Step 6 (Payment) - show final confirmation
    if (stepIndex === 6) {
      // Compile all data for final confirmation
      const compiledData = {
        flowType,
        originData,
        destinationData,
        shipmentData: {
          ...shipmentData,
          dimensions: shipmentData.dimensions
            .filter(dim => dim.length && dim.breadth && dim.height)
            .map(dim => `${dim.length} × ${dim.breadth} × ${dim.height} = ${(parseFloat(dim.length) * parseFloat(dim.breadth) * parseFloat(dim.height)).toFixed(2)} ${dim.unit}³`)
            .join(', ') || 'No dimensions entered',
          volumetricWeight: calculateVolumetricWeight(),
          chargeableWeight: calculateChargeableWeight()
        },
        uploadData: {
          ...uploadData,
          packageImages: uploadData.packageImages.length > 0 
            ? uploadData.packageImages
            : [],
          invoiceImages: uploadData.invoiceImages.length > 0
            ? uploadData.invoiceImages
            : []
        },
        paymentData
      };
      
      setAllFormData(compiledData);
      return;
    }
    
    // For all other steps, directly proceed to next step
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  // Confirm step and move to next (legacy function, kept for compatibility)
  const confirmStep = () => {
    setShowConfirmModal(false);
  };

  // Enhanced pincode serviceability check via backend
  const checkPincodeServiceability = async (pincode: string, type: 'origin' | 'destination') => {
    if (pincode.length === 6) {
      try {
        const { data } = await axios.get(`${API_BASE}/api/pincode/${pincode}`);
        const isServiceable = !!data;
        const parsed = isServiceable ? parsePincodeResponse(data) : { state: '', city: '', district: '', areas: [] as string[] };
        if (type === 'origin') {
          setOriginServiceable(isServiceable);
          if (!isServiceable) {
            setShowNonServiceableMessage(true);
            setShowStepper(false);
            setDestinationServiceable(null);
            setDestinationPincode('');
            setOriginAreas([]);
          } else {
            setOriginData(prev => ({
              ...prev,
              pincode: pincode,
              city: parsed.city,
              district: parsed.district,
              state: parsed.state
            }));
            setOriginAreas(parsed.areas);
          }
        } else {
          setDestinationServiceable(isServiceable);
          if (isServiceable) {
            setDestinationData(prev => ({
              ...prev,
              pincode: pincode,
              city: parsed.city,
              district: parsed.district,
              state: parsed.state
            }));
            setDestinationAreas(parsed.areas);
          } else {
            setDestinationAreas([]);
          }
        }
        // When both are serviceable, do not auto-advance.
        // The UI will show a Next button to proceed to Step 1 explicitly.
      } catch (e) {
        if (type === 'origin') {
          setOriginServiceable(false);
          setOriginAreas([]);
        } else {
          setDestinationServiceable(false);
          setDestinationAreas([]);
        }
        setShowStepper(false);
      }
    } else {
      if (type === 'origin') {
        setOriginServiceable(null);
        setShowStepper(false);
        setOriginAreas([]);
      } else {
        setDestinationServiceable(null);
        setShowStepper(false);
        setDestinationAreas([]);
      }
    }
  };

  // Final booking submission - send consolidated full payload to backend
  const submitBooking = async () => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      console.log('Starting booking submission process...');
      
      // 1) Fetch next consignment number for this office user (numeric only)
      //    This will be used as the consignment number (separate from invoice number)
      let nextConsignmentNumber: number | null = null;
      try {
        const officeToken = localStorage.getItem('officeToken');
        if (!officeToken) {
          throw new Error('Not authenticated as office user');
        }
        const nextRes = await axios.get(`${API_BASE}/api/office/consignment/next`, {
          headers: { Authorization: `Bearer ${officeToken}` }
        });
        nextConsignmentNumber = nextRes?.data?.consignmentNumber ?? null;
        if (!nextConsignmentNumber) {
          throw new Error('No consignment number available');
        }
        // Keep the original invoice number as entered by user
        // setUploadData(prev => ({ ...prev, invoiceNumber: String(nextConsignmentNumber) }));
      } catch (e: any) {
        const msg = e?.response?.data?.error || e?.message || 'Failed to get next consignment number';
        setSubmitError(msg);
        setSubmitLoading(false);
        return;
      }
      
      // Frontend validation mirroring backend required fields
      const requiredSender: Array<[string, string]> = [
        ['name', originData.name],
        ['email', originData.email],
        ['phone', originData.mobileNumber],
        ['pincode', originData.pincode],
        ['state', originData.state],
        ['city', originData.city],
        ['district', originData.district],
        ['area', originData.area],
        ['addressLine1', originData.flatBuilding]
      ];
      const missingSender = requiredSender.filter(([_, val]) => !val || String(val).trim() === '').map(([key]) => key);
      if (missingSender.length > 0) {
        const errorMsg = `Please complete sender fields: ${missingSender.join(', ')}`;
        console.error('Validation error:', errorMsg);
        setSubmitError(errorMsg);
        setSubmitLoading(false);
        return;
      }

      const requiredReceiver: Array<[string, string]> = [
        ['name', destinationData.name],
        ['email', destinationData.email],
        ['phone', destinationData.mobileNumber],
        ['pincode', destinationData.pincode],
        ['state', destinationData.state],
        ['city', destinationData.city],
        ['district', destinationData.district],
        ['area', destinationData.area],
        ['addressLine1', destinationData.flatBuilding]
      ];
      const missingReceiver = requiredReceiver.filter(([_, val]) => !val || String(val).trim() === '').map(([key]) => key);
      if (missingReceiver.length > 0) {
        const errorMsg = `Please complete receiver fields: ${missingReceiver.join(', ')}`;
        console.error('Validation error:', errorMsg);
        setSubmitError(errorMsg);
        setSubmitLoading(false);
        return;
      }

      console.log('Validation passed, proceeding with file uploads...');
      
      // Upload files if not already uploaded
      const uploadFiles = async (files: any[], endpoint: string, fieldName: string) => {
        const unuploadedFiles = files.filter(file => !file.uploaded);
        if (unuploadedFiles.length === 0) return files;

        const formData = new FormData();
        unuploadedFiles.forEach(file => {
          formData.append(fieldName, file.file);
        });

        try {
          console.log(`Uploading ${unuploadedFiles.length} files to ${endpoint}...`);
          const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed with status:', response.status, 'Response:', errorText);
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          console.log('Upload response:', result);
          
          if (result.success) {
            // Update files with server paths
            return files.map(file => {
              if (!file.uploaded) {
                const uploadedFile = result.files?.find((f: any) => f.originalName === file.file.name);
                if (uploadedFile) {
                  // Clean up any @ symbol that might be in the URL
                  let cleanUrl = uploadedFile.url;
                  if (cleanUrl && cleanUrl.startsWith('@')) {
                    cleanUrl = cleanUrl.substring(1);
                  }
                  
                  return {
                    ...file,
                    uploaded: true,
                    serverPath: cleanUrl, // Store the clean S3 URL
                    filename: uploadedFile.fileName // Keep filename for reference
                  };
                }
              }
              return file;
            });
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          throw new Error(`Failed to upload files: ${error.message || 'Please try again.'}`);
        }
      };

      // Upload package images if they exist
      let uploadedPackageImages = uploadData.packageImages;
      if (uploadData.packageImages && uploadData.packageImages.length > 0) {
        console.log('Uploading package images...');
        uploadedPackageImages = await uploadFiles(
          uploadData.packageImages, 
          '/api/upload/package-images', 
          'packageImages'
        );
      }

      // Upload invoice images if they exist
      let uploadedInvoiceImages = uploadData.invoiceImages;
      if (uploadData.invoiceImages && uploadData.invoiceImages.length > 0) {
        console.log('Uploading invoice images...');
        uploadedInvoiceImages = await uploadFiles(
          uploadData.invoiceImages, 
          '/api/upload/invoice-images', 
          'invoiceImages'
        );
      }

      // Debug: Log the original invoice number from state
      console.log('🔍 DEBUG - Frontend invoice number from state:', uploadData.invoiceNumber);
      
      // Prepare upload data with server paths
      const processedUploadData = {
        ...uploadData,
        // Parse numeric fields to remove commas and convert to numbers
        totalPackages: parseInvoiceValue(uploadData.totalPackages),
        invoiceValue: parseInvoiceValue(uploadData.invoiceValue),
        // Keep the original invoice number as entered by user
        invoiceNumber: uploadData.invoiceNumber,
        packageImages: uploadedPackageImages
          .filter((file: any) => file.uploaded && file.serverPath)
          .map((file: any) => file.serverPath),
        invoiceImages: uploadedInvoiceImages
          .filter((file: any) => file.uploaded && file.serverPath)
          .map((file: any) => file.serverPath)
      };
      
      // Debug: Log the processed invoice number being sent
      console.log('🔍 DEBUG - Frontend processed invoice number:', processedUploadData.invoiceNumber);

      // Process shipmentData to convert numeric fields
      const processedShipmentData = {
        ...shipmentData,
        // Parse numeric fields to remove commas and convert to numbers
        actualWeight: parseInvoiceValue(shipmentData.actualWeight),
        // volumetricWeight and chargeableWeight are already numbers, no need to parse
        volumetricWeight: shipmentData.volumetricWeight,
        chargeableWeight: shipmentData.chargeableWeight,
        // Process dimensions array
        dimensions: shipmentData.dimensions?.map((dim: any) => ({
          ...dim,
          length: parseInvoiceValue(dim.length),
          breadth: parseInvoiceValue(dim.breadth),
          height: parseInvoiceValue(dim.height)
        }))
      };

      // Process detailsData to convert numeric fields
      const processedDetailsData = {
        ...detailsData,
        // Parse numeric fields to remove commas and convert to numbers
        total: parseInvoiceValue(detailsData.total),
        fuelCharge: parseInvoiceValue(detailsData.fuelCharge),
        sgstAmount: parseInvoiceValue(detailsData.sgstAmount),
        cgstAmount: parseInvoiceValue(detailsData.cgstAmount),
        igstAmount: parseInvoiceValue(detailsData.igstAmount),
        grandTotal: parseInvoiceValue(detailsData.grandTotal)
      };

      const fullPayload = {
        formType: "full",
        originData: { ...originData },
        destinationData: { ...destinationData },
        shipmentData: processedShipmentData,
        uploadData: processedUploadData,
        paymentData: { ...paymentData },
        billData: { ...billData },
        detailsData: processedDetailsData,
        consignmentNumber: nextConsignmentNumber // Include the consignment number from office user assignment
      };

      console.log('🚀 Starting booking submission...');
      console.log('Submitting booking with payload:', fullPayload);
      
      const fullRes = await axios.post(`${API_BASE}/api/form`, fullPayload);

      console.log('Booking submission response:', fullRes.data);

      const backendId = fullRes?.data?.data?._id || fullRes?.data?.bookingId || fullRes?.data?.customerId || fullRes?.data?.id;
      const fallbackId = `OCL${Date.now().toString().slice(-6)}`;
      setGeneratedCustomerId(backendId || fallbackId);
      
      console.log('✅ Booking submitted successfully with ID:', backendId || fallbackId);
      
      // Mark booking as submitted and move to success step
      setIsBookingSubmitted(true);
      setCurrentStep(7);
      setCompletedSteps([true, true, true, true, true, true, true, true]);
      
      // Don't reset form data here - let the user see the completion screen first
      // Form data will be reset when user clicks "Book More"
      
      // 3) Record consignment usage (non-blocking)
      try {
        const officeToken = localStorage.getItem('officeToken');
        if (officeToken && nextConsignmentNumber) {
          await axios.post(`${API_BASE}/api/office/consignment/use`, {
            consignmentNumber: nextConsignmentNumber,
            bookingReference: backendId || fallbackId,
            bookingData: fullPayload
          }, {
            headers: { Authorization: `Bearer ${officeToken}` }
          });
          
          // Dispatch event to notify other components about consignment usage update
          const officeUserId = localStorage.getItem('officeUserId');
          if (officeUserId) {
            const event = new CustomEvent('consignmentUsageUpdated', {
              detail: {
                officeUserId: officeUserId,
                assignmentType: 'office_user',
                consignmentNumber: nextConsignmentNumber,
                bookingReference: backendId || fallbackId
              }
            });
            window.dispatchEvent(event);
            console.log('Dispatched consignmentUsageUpdated event for office user:', officeUserId);
          }
        }
      } catch (usageErr) {
        console.warn('Failed to record consignment usage:', usageErr);
      }
      
    } catch (err: any) {
      console.error('Booking submission error:', err);
      
      // Handle upload errors specifically
      if (err.message && err.message.includes('upload')) {
        setSubmitError(`Upload failed: ${err.message}`);
      } else {
        const backendError = err?.response?.data;
        const details = Array.isArray(backendError?.details) ? `: ${backendError.details.join('; ')}` : '';
        const errorMsg = (backendError?.error || "Failed to submit booking") + details;
        console.error('Backend error:', errorMsg);
        setSubmitError(errorMsg);
      }
      
      // Reset loading state even on error
      setSubmitLoading(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  // OTP-style mobile input handlers
  const handleDigitChange = async (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
    
    const newDigits = [...mobileDigits];
    newDigits[index] = value;
    setMobileDigits(newDigits);
    
    // Auto-focus next input
    if (value && index < 9) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
    
    // Check if all digits are entered - filter out empty strings
    const mobileNumber = newDigits.filter(digit => digit !== '').join('');
    console.log('=== PHONE DIGIT DEBUG ===');
    console.log('Index:', index, 'Value:', value);
    console.log('Previous mobileDigits:', mobileDigits);
    console.log('New digits array:', newDigits);
    console.log('Filtered digits:', newDigits.filter(digit => digit !== ''));
    console.log('Mobile number (joined):', mobileNumber);
    console.log('Mobile number length:', mobileNumber.length);
    console.log('==========================');
    
    if (mobileNumber.length === 10) {
      console.log('All 10 digits entered, checking phone number:', mobileNumber);
      console.log('Phone number validation passed:', mobileNumber.length === 10);
      setOriginData(prev => ({ ...prev, mobileNumber }));
      setCheckingPhoneNumber(true);
      
      // Check if phone number exists in address form data
      try {
        const response = await fetch(`${API_BASE}/api/form/check-phone/${mobileNumber}`);
        const data = await response.json();
        
        if (data.success && data.exists) {
          // Phone number exists, skip OTP and proceed directly
          setOtpVerified(true);
          setUserFound(true);
          setUserAddresses([{
            id: 'existing_user',
            name: data.data.senderName,
            mobileNumber: data.data.senderPhone,
            email: data.data.senderEmail,
            addressType: 'HOME',
            flatBuilding: data.data.senderAddressLine1,
            locality: data.data.senderArea,
            city: data.data.senderCity,
            state: data.data.senderState,
            pincode: data.data.senderPincode,
            area: data.data.senderArea,
            district: data.data.senderDistrict,
            landmark: data.data.senderLandmark
          }]);
          setShowSummaryCard(true);
        } else {
          // Phone number doesn't exist, show OTP verification
          console.log('Phone number not found, proceeding to OTP verification');
          setOtpError(null); // Clear any existing errors
          setShowOTPVerification(true);
          // Send OTP when showing OTP popup
          setTimeout(() => {
            sendOTP(mobileNumber);
          }, 100);
        }
      } catch (error) {
        console.error('Error checking phone number:', error);
        // On error, proceed with OTP verification
        setOtpError(null); // Clear any existing errors
        setShowOTPVerification(true);
        // Send OTP when showing OTP popup
        setTimeout(() => {
          sendOTP(mobileNumber);
        }, 100);
      } finally {
        setCheckingPhoneNumber(false);
      }
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mobileDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError(null);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
    
    // Check if all OTP digits are entered
    const otpNumber = newDigits.join('');
    if (otpNumber.length === 6) {
      verifyOTP(otpNumber);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOTP = async (otp: string) => {
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const mobileNumber = mobileDigits.filter(digit => digit !== '').join('');
      const fullPhoneNumber = mobileNumber; // Use 10-digit number as-is
      
      console.log('Verifying OTP:', otp, 'for phone:', fullPhoneNumber);
      console.log('Mobile digits:', mobileDigits);
      console.log('Mobile number length:', mobileNumber.length);
      
      // Verify OTP via backend API
      const response = await fetch(`${API_BASE}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          otp: otp
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOtpVerified(true);
        setOtpError(null);
        console.log('OTP verified successfully');
        // Now lookup user in database
        lookupUserInDatabase(mobileNumber);
      } else {
        setOtpError(result.error || 'Invalid OTP. Please try again.');
        setOtpDigits(Array(6).fill(''));
        // Focus on the first input field after error
        setTimeout(() => {
          const firstInput = document.getElementById('otp-digit-0');
          firstInput?.focus();
        }, 100);
      }
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Error verifying OTP. Please try again.');
      setOtpDigits(Array(6).fill(''));
      setTimeout(() => {
        const firstInput = document.getElementById('otp-digit-0');
        firstInput?.focus();
      }, 100);
    }
  };

  const resetOTP = () => {
    setOtpDigits(Array(6).fill(''));
    setOtpVerified(false);
    setOtpError(null);
    setShowOTPVerification(false);
  };

  // Send OTP using MSG91 REST API
  const sendOTP = async (phoneNumber?: string) => {
    try {
      // Double-check the mobileDigits state
      console.log('=== MOBILE DIGITS STATE CHECK ===');
      console.log('Current mobileDigits state:', mobileDigits);
      console.log('MobileDigits length:', mobileDigits.length);
      console.log('Each digit:', mobileDigits.map((digit, index) => `[${index}]: "${digit}"`));
      console.log('==================================');
      
      // Use provided phone number or get from state
      const mobileNumber = phoneNumber || mobileDigits.filter(digit => digit !== '').join('');
      
      console.log('=== OTP SEND DEBUG ===');
      console.log('Provided phoneNumber parameter:', phoneNumber);
      console.log('Mobile digits array:', mobileDigits);
      console.log('Mobile digits filtered:', mobileDigits.filter(digit => digit !== ''));
      console.log('Final mobile number:', mobileNumber);
      console.log('Mobile number length:', mobileNumber.length);
      console.log('========================');
      
      // Validate we have exactly 10 digits
      if (mobileNumber.length !== 10) {
        console.error('ERROR: Mobile number length is not 10:', mobileNumber.length);
        setOtpError(`Invalid phone number length: ${mobileNumber.length}. Expected 10 digits.`);
        return;
      }
      
      // Send the 10-digit number as-is to MSG91
      const fullPhoneNumber = mobileNumber;
      
      setIsOtpSending(true);
      setOtpError(null);
      
      // Send OTP via backend API
      const requestBody = {
        phoneNumber: fullPhoneNumber
      };
      
      console.log('=== API REQUEST DEBUG ===');
      console.log('Request body:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));
      console.log('Full phone number being sent:', fullPhoneNumber);
      console.log('==========================');
      
      const response = await fetch(`${API_BASE}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('OTP sent successfully:', result);
        setIsOtpSending(false);
        setOtpError(null);
      } else {
        console.error('Failed to send OTP:', result.error);
        setOtpError(result.error || 'Failed to send OTP. Please try again.');
        setIsOtpSending(false);
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
      setIsOtpSending(false);
    }
  };

  // Database lookup function
  const lookupUserInDatabase = async (mobileNumber: string) => {
    try {
      console.log(`Looking up origin user in database for phone number: ${mobileNumber}`);
      
      // Get the office token for authentication
      const token = localStorage.getItem('officeToken');
      if (!token) {
        console.error('No office token found');
        setUserFound(false);
        setUserAddresses([]);
        setShowSummaryCard(false);
        setShowManualForm(true);
        return;
      }
      
      // Make API call to lookup user by phone number
      const response = await fetch(`${API_BASE}/api/office/user-lookup/${mobileNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.found) {
        console.log('Origin user found in database:', data.user);
        console.log('Origin user addresses:', data.addresses);
        
        setUserFound(true);
        setUserAddresses(data.addresses);
        setOriginData(prev => ({ ...prev, mobileNumber }));
        setShowSummaryCard(true);
        setShowManualForm(false); // Ensure manual form is hidden
      } else {
        console.log('Origin user not found in database');
        setUserFound(false);
        setUserAddresses([]); // Clear any existing addresses
        setShowSummaryCard(false); // Ensure summary card is hidden
        setShowManualForm(true);
      }
    } catch (error) {
      console.error('Database lookup error:', error);
      setUserFound(false);
      setUserAddresses([]); // Clear any existing addresses
      setShowSummaryCard(false); // Ensure summary card is hidden
      setShowManualForm(true);
    }
  };
  
  // Destination mobile input handlers
  const handleDestinationDigitChange = (index: number, value: string) => {
    try {
      if (value.length > 1) return; // Only allow single digit
      if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
      
      const newDigits = [...destinationMobileDigits];
      newDigits[index] = value;
      setDestinationMobileDigits(newDigits);
      
      // Auto-focus next input
      if (value && index < 9) {
        const nextInput = document.getElementById(`dest-digit-${index + 1}`);
        nextInput?.focus();
      }
      
      // Check if all digits are entered - filter out empty strings
      const mobileNumber = newDigits.filter(digit => digit !== '').join('');
      if (mobileNumber.length === 10) {
        setDestinationData(prev => ({ ...prev, mobileNumber }));
        // Add a small delay to ensure state is updated before lookup
        setTimeout(() => {
          lookupDestinationUserInDatabase(mobileNumber);
        }, 100);
      }
    } catch (error) {
      console.error('Error in handleDestinationDigitChange:', error);
    }
  };

  const handleDestinationDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !destinationMobileDigits[index] && index > 0) {
      const prevInput = document.getElementById(`dest-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // E-Waybill digit input handlers
  const handleEWaybillDigitChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
    
    const newDigits = [...eWaybillDigits];
    newDigits[index] = value;
    setEWaybillDigits(newDigits);
    
    // Update uploadData with joined string
    const eWaybillNumber = newDigits.join('');
    setUploadData(prev => ({ ...prev, eWaybillNumber }));
    
    // Auto-focus next input
    if (value && index < 11) {
      const nextInput = document.getElementById(`ewaybill-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleEWaybillDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !eWaybillDigits[index] && index > 0) {
      const prevInput = document.getElementById(`ewaybill-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Destination database lookup function
  const lookupDestinationUserInDatabase = async (mobileNumber: string) => {
    try {
      console.log(`Looking up user in database for phone number: ${mobileNumber}`);
      
      // Get the office token for authentication
      const token = localStorage.getItem('officeToken');
      if (!token) {
        console.error('No office token found');
        setDestinationUserFound(false);
        setDestinationUserAddresses([]);
        setShowDestinationSummaryCard(false);
        setShowDestinationManualForm(true);
        return;
      }
      
      // Make API call to lookup user by phone number
      const response = await fetch(`${API_BASE}/api/office/user-lookup/${mobileNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.found) {
        console.log('User found in database:', data.user);
        console.log('User addresses:', data.addresses);
        
        setDestinationUserFound(true);
        setDestinationUserAddresses(data.addresses);
        setDestinationData(prev => ({ ...prev, mobileNumber }));
        setShowDestinationSummaryCard(true);
        setShowDestinationManualForm(false); // Ensure manual form is hidden
      } else {
        console.log('User not found in database');
        setDestinationUserFound(false);
        setDestinationUserAddresses([]); // Clear any existing addresses
        setShowDestinationSummaryCard(false); // Ensure summary card is hidden
        setShowDestinationManualForm(true);
      }
    } catch (error) {
      console.error('Database lookup error:', error);
      setDestinationUserFound(false);
      setDestinationUserAddresses([]); // Clear any existing addresses
      setShowDestinationSummaryCard(false); // Ensure summary card is hidden
      setShowDestinationManualForm(true);
    }
  };

  // Handle manual form save
  const handleManualFormSave = () => {
    // Validate required fields
    if (!originData.name || !originData.email || !originData.flatBuilding || !originData.locality) {
      alert('Please fill all required fields');
      return;
    }
    
    if (editingAddressId) {
      // Update existing address
      setUserAddresses(userAddresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, ...originData, mobileNumber: mobileDigits.filter(digit => digit !== '').join('') }
          : addr
      ));
      setEditingAddressId(null);
      setSelectedAddressId(editingAddressId);
    } else {
      // Create a new address from the form data
      const newAddress = {
        id: Date.now().toString(), // Simple ID generation
        ...originData,
        mobileNumber: mobileDigits.filter(digit => digit !== '').join('')
      };
      
      // Add to user addresses (append to existing list, not replace)
      setUserAddresses([...userAddresses, newAddress]);
      setSelectedAddressId(newAddress.id);
    }
    
    setShowManualForm(false);
    setShowSummaryCard(true);
    setAddressDeliveryConfirmed(false); // Reset confirmation for new/edited address
  };

  // Handle address selection and delivery confirmation
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setAddressDeliveryConfirmed(false);
    
    // Update origin data with selected address
    const selectedAddress = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setOriginData(prev => ({ ...prev, ...selectedAddress }));
    }
  };
  
  const handleDeliverHere = () => {
    if (selectedAddressId) {
      // Only confirm the address, don't move to next step
      // The "Proceed" button will handle moving to next step
      setAddressDeliveryConfirmed(true);
    }
  };
  
  // Destination address handling functions
  const handleDestinationManualFormSave = () => {
    // Validate required fields
    if (!destinationData.name || !destinationData.email || !destinationData.flatBuilding || !destinationData.locality) {
      alert('Please fill all required fields');
      return;
    }
    
    if (editingDestinationAddressId) {
      // Update existing address
      setDestinationUserAddresses(destinationUserAddresses.map(addr => 
        addr.id === editingDestinationAddressId 
          ? { ...addr, ...destinationData, mobileNumber: destinationMobileDigits.filter(digit => digit !== '').join('') }
          : addr
      ));
      setEditingDestinationAddressId(null);
      setSelectedDestinationAddressId(editingDestinationAddressId);
    } else {
      // Create a new address from the form data
      const newAddress = {
        id: Date.now().toString(), // Simple ID generation
        ...destinationData,
        mobileNumber: destinationMobileDigits.filter(digit => digit !== '').join('')
      };
      
      // Add to user addresses (append to existing list, not replace)
      setDestinationUserAddresses([...destinationUserAddresses, newAddress]);
      setSelectedDestinationAddressId(newAddress.id);
    }
    
    setShowDestinationManualForm(false);
    setShowDestinationSummaryCard(true);
    setDestinationAddressDeliveryConfirmed(false); // Reset confirmation for new/edited address
  };

  const handleDestinationAddressSelect = (addressId: string) => {
    setSelectedDestinationAddressId(addressId);
    setDestinationAddressDeliveryConfirmed(false);
    
    // Update destination data with selected address
    const selectedAddress = destinationUserAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setDestinationData(prev => ({ ...prev, ...selectedAddress }));
    }
  };
  
  const handleDestinationDeliverHere = () => {
    if (selectedDestinationAddressId) {
      // Only confirm the address, don't move to next step
      // The "Proceed" button will handle moving to next step
      setDestinationAddressDeliveryConfirmed(true);
    }
  };

  // Reset OTP input
  const resetMobileInput = () => {
    setMobileDigits(Array(10).fill(''));
    setUserFound(null);
    setUserSummary(null);
    setShowManualForm(false);
    setShowSummaryCard(false);
    setUserAddresses([]);
    setSelectedAddressId(null);
    setAddressDeliveryConfirmed(false);
    setOriginData(prev => ({ ...prev, mobileNumber: '' }));
    // Reset OTP verification state
    setShowOTPVerification(false);
    setOtpDigits(Array(4).fill(''));
    setOtpVerified(false);
    setOtpError(null);
    setCheckingPhoneNumber(false);
  };
  
  // Reset destination OTP input
  const resetDestinationMobileInput = () => {
    setDestinationMobileDigits(Array(10).fill(''));
    setDestinationUserFound(null);
    setDestinationUserSummary(null);
    setShowDestinationManualForm(false);
    setShowDestinationSummaryCard(false);
    setDestinationUserAddresses([]);
    setSelectedDestinationAddressId(null);
    setDestinationAddressDeliveryConfirmed(false);
    setDestinationData(prev => ({ ...prev, mobileNumber: '' }));
  };

  // Validation function for current step - only checks required fields
  const isCurrentStepValid = (step: number) => {
    switch (step) {
      case 0: // Origin - mobile, OTP verification, and address confirmation required
        return addressDeliveryConfirmed && mobileDigits.filter(digit => digit !== '').join('').length === 10 && (otpVerified || userFound);
      
      case 1: // Destination - only mobile and address confirmation required
        return destinationAddressDeliveryConfirmed && (destinationMobileDigits || []).filter(digit => digit !== '').join('').length === 10 && (destinationUserFound || true);
      
      case 2: // Shipping Details - package images must be uploaded, then dimensions/weight OR chargeable fixed
        const hasPackageImagesUploaded = uploadData.packageImages.length > 0;
        if (!hasPackageImagesUploaded) {
          return false; // Must upload images first
        }
        const hasValidDimensions = shipmentData.dimensions.some(dim => 
          dim.length && dim.breadth && dim.height
        );
        
        // Three conditions for validation:
        if (isChargeableFixed) {
          // Condition 1: Fixed mode - allow proceeding without per Kg weight
          return true;
        } else if (shipmentData.actualWeight && shipmentData.perKgWeight) {
          // Condition 2: Weight and per Kg price mentioned - proceed even without dimensions
          return true;
        } else if (hasValidDimensions && shipmentData.perKgWeight) {
          // Condition 3: Dimensions mentioned and per Kg price - use volumetric weight for freight calculation
          return true;
        }
        
        return false;
      
      case 3: // Upload Details - only invoice information required
        const isEwaybillValid = parseInvoiceValue(uploadData.invoiceValue) >= 50000 
          ? uploadData.eWaybillNumber.length === 12
          : true;
        return uploadData.invoiceNumber && 
               uploadData.invoiceValue && 
               isEwaybillValid &&
               uploadData.acceptTerms;
      
      case 4: // Bill - party type and bill type required
        if (billData.partyType === 'other') {
          // If "Other" is selected, validate the other party form
          const otherParty = billData.otherPartyDetails;
          return otherParty.concernName && 
                 otherParty.companyName && 
                 otherParty.phoneNumber && 
                 otherParty.pincode &&
                 otherParty.area &&
                 otherParty.city &&
                 otherParty.district &&
                 otherParty.state &&
                 otherParty.locality && 
                 otherParty.flatBuilding && 
                 otherParty.landmark && 
                 !otherPartyGstError &&
                 !!billData.billType;
        }
        // If "Sender" or "Recipient" is selected
        return !!billData.partyType && !!billData.billType;
      
      case 5: // Details - at least one charge field required (empty fields will be treated as 0)
        return detailsData.freightCharge || 
               detailsData.awbCharge || 
               detailsData.localCollection || 
               detailsData.doorDelivery || 
               detailsData.loadingUnloading || 
               detailsData.demurrageCharge || 
               detailsData.ddaCharge || 
               detailsData.hamaliCharge || 
               detailsData.packingCharge || 
               detailsData.otherCharge || 
               detailsData.fuelCharge;
      
      case 6: // Payment - payment mode and delivery type required
        return !!paymentData.mode && !!paymentData.deliveryType;
      
      case 7: // Success step - only valid if booking is submitted
        return isBookingSubmitted;
      
      default:
        return true;
    }
  };

  // Reset public flow
  const resetPublicFlow = () => {
    setOriginPincode('');
    setDestinationPincode('');
    setOriginServiceable(null);
    setDestinationServiceable(null);
    setShowNonServiceableMessage(false);
    setShowStepper(false);
    setCurrentStep(0);
    setCompletedSteps([false, false, false, false, false, false, false, false]);
    // Reset form data
    setOriginData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      birthday: '',
      anniversary: '',
      otherAlternateNumber: '',
      showOtherAlternateNumber: false,
      website: ''
    });
    setDestinationData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      website: '',
      anniversary: '',
      birthday: ''
    });
    setUploadData({
      totalPackages: '',
      materials: '',
      packageImages: [],
      contentDescription: '',
      invoiceNumber: '',
      invoiceValue: '',
      invoiceImages: [],
      panImages: [],
      declarationImages: [],
      eWaybillNumber: '',
      acceptTerms: false
    });
    setPaymentData({ mode: '', deliveryType: '' });
    setBillData({
      partyType: '',
      otherPartyDetails: {
        concernName: '',
        companyName: '',
        phoneNumber: '',
        locality: '',
        flatBuilding: '',
        landmark: '',
        pincode: '',
        area: '',
        city: '',
        district: '',
        state: '',
        gstNumber: ''
      },
      billType: ''
    });
    setShowOtherPartyForm(false);
    setOtherPartyAreas([]);
    setOtherPartyPinError(null);
    setOtherPartyGstError(false);
    setDetailsData({
      freightCharge: '',
      awbCharge: '',
      localCollection: '',
      doorDelivery: '',
      loadingUnloading: '',
      demurrageCharge: '',
      ddaCharge: '',
      hamaliCharge: '',
      packingCharge: '',
      otherCharge: '',
      total: '',
      fuelCharge: '',
      fuelChargeType: 'percentage',
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      grandTotal: ''
    });
    setShowCustomFuelCharge(false);
    setIsDescriptionBlurred(false);
    setIsPackageInfoComplete(false);
  };

  // Enhanced corporate lookup with validation and auto-fill
  const handleCorporateLookup = () => {
    let foundData = null;
    let searchValue = '';
    
    if (foundData && foundData.isActive) {
      setCorporateData(foundData);
      
      // Pre-fill origin data with corporate information
      setOriginData(prev => ({
        ...prev,
        name: foundData.name,
        companyName: foundData.name, // Corporate name as company
        email: foundData.email,
        mobileNumber: foundData.contactNumber,
        pincode: foundData.pin,
        city: foundData.city,
        district: foundData.locality,
        state: foundData.state,
        locality: foundData.companyAddress,
        flatBuilding: foundData.flatNumber,
        landmark: foundData.landmark || '',
        gstNumber: foundData.gstNumber,
        addressType: 'Office'
      }));
      
      // Also set pincode validation for origin (defer to backend check)
      setOriginPincode(foundData.pin);
      
      setShowStepper(true);
      setCurrentStep(0); // Start from Origin step
      // Ensure origin areas are populated for corporate flow
      if (foundData.pin && foundData.pin.length === 6) {
        setOriginData(prev => ({ ...prev, pincode: foundData.pin }));
        autoFillFromPincode(foundData.pin, 'origin');
      }
    } else if (foundData && !foundData.isActive) {
      setCorporateData({ ...foundData, error: 'inactive' });
    } else {
      setCorporateData({ error: 'notFound', searchValue, searchType: corporateSearchType });
      // Still show stepper for manual entry
      setShowStepper(true);
      setCurrentStep(0);
    }
  };

  // Reset corporate flow
  const resetCorporateFlow = () => {
    setCorporateId('');
    setCorporateMobile('');
    setCorporateData(null);
    setShowStepper(false);
    setCurrentStep(0);
    setCompletedSteps([false, false, false, false, false, false, false, false]);
    // Reset form data
    setOriginData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      birthday: '',
      anniversary: '',
      otherAlternateNumber: '',
      showOtherAlternateNumber: false,
      website: ''
    });
    setDestinationData({
      mobileNumber: '',
      name: '',
      companyName: '',
      email: '',
      locality: '',
      flatBuilding: '',
      landmark: '',
      pincode: '',
      area: '',
      city: '',
      district: '',
      state: '',
      gstNumber: '',
      alternateNumbers: [''],
      addressType: 'Home',
      website: '',
      anniversary: '',
      birthday: ''
    });
    setUploadData({
      totalPackages: '',
      materials: '',
      packageImages: [],
      contentDescription: '',
      invoiceNumber: '',
      invoiceValue: '',
      invoiceImages: [],
      panImages: [],
      declarationImages: [],
      eWaybillNumber: '',
      acceptTerms: false
    });
    setPaymentData({ mode: '', deliveryType: '' });
    setBillData({
      partyType: '',
      otherPartyDetails: {
        concernName: '',
        companyName: '',
        phoneNumber: '',
        locality: '',
        flatBuilding: '',
        landmark: '',
        pincode: '',
        area: '',
        city: '',
        district: '',
        state: '',
        gstNumber: ''
      },
      billType: ''
    });
    setShowOtherPartyForm(false);
    setOtherPartyAreas([]);
    setOtherPartyPinError(null);
    setOtherPartyGstError(false);
    setDetailsData({
      freightCharge: '',
      awbCharge: '',
      localCollection: '',
      doorDelivery: '',
      loadingUnloading: '',
      demurrageCharge: '',
      ddaCharge: '',
      hamaliCharge: '',
      packingCharge: '',
      otherCharge: '',
      total: '',
      fuelCharge: '',
      fuelChargeType: 'percentage',
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      grandTotal: ''
    });
    setShowCustomFuelCharge(false);
  };

  return (
    <div 
      className="w-full" 
      style={{ 
        fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
        fontSize: '16px',
        lineHeight: '1.5'
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .booking-panel-container * {
            font-family: Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          .booking-panel-container h1, .booking-panel-container h2, .booking-panel-container h3, .booking-panel-container h4, .booking-panel-container h5, .booking-panel-container h6,
          .booking-panel-container .text-xl, .booking-panel-container .text-2xl, .booking-panel-container .text-3xl, .booking-panel-container .text-4xl,
          .booking-panel-container .text-lg, .booking-panel-container .font-bold, .booking-panel-container .font-semibold {
            font-family: Calibr !important;
            font-weight: bold;
          }
          .booking-panel-container input, .booking-panel-container textarea, .booking-panel-container select, .booking-panel-container button, .booking-panel-container label, .booking-panel-container span, .booking-panel-container p, .booking-panel-container div {
            font-family: Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
        `
      }} />
      <div className="booking-panel-container">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
          {/* Main Content Cards */}
        {/* Top Toggle Circles - Hidden when in stepper mode */}
        {!showStepper && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border-b border-gray-200/50 p-6 mb-8" style={{
            boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
          }}>
            <div className="flex justify-center">
              <div className="flex bg-gray-50 rounded-2xl p-1">
                <button
                  onClick={() => {
                    setFlowType('public');
                    resetPublicFlow();
                  }}
                  className={`
                    px-8 py-3 rounded-xl font-medium transition-all duration-300
                    ${flowType === 'public' 
                      ? 'bg-[#406ab9] text-white shadow-md' 
                      : 'text-[#64748b] hover:text-[#406ab9]'
                    }
                  `}
                  style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
                >
                  Public
                </button>
                <button
                  onClick={() => {
                    setFlowType('corporate');
                    resetPublicFlow();
                    resetCorporateFlow();
                  }}
                  className={`
                    px-8 py-3 rounded-xl font-medium transition-all duration-300
                    ${flowType === 'corporate' 
                      ? 'bg-[#406ab9] text-white shadow-md' 
                      : 'text-[#64748b] hover:text-[#406ab9]'
                    }
                  `}
                  style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}
                >
                  Corporate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Public Flow */}
        {flowType === 'public' && !showStepper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto mt-8"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 aspect-square flex flex-col justify-center" style={{
              boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
            }}>
              {/* OCL Services Logo */}
              <div className="w-full flex justify-center mb-4">
                <img
                  src="/src/assets/ocl-logo.jpg"
                  alt="OCL Services"
                  className="h-20 w-20 rounded-full shadow-md"
                />
              </div>
              
              <div className="text-center mb-3">
                <h2 className="text-lg font-semibold text-[#1e293b] mb-1" style={{ 
                  fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important'
                }}>
                  Check Serviceability
                </h2>
                <p className="text-xs text-[#64748b]" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                  Enter PINCodes to Proceed
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <FloatingInput
                    label="Origin PINCode"
                    value={originPincode}
                    onChange={(value) => {
                      const pincode = value.replace(/\D/g, '').slice(0, 6);
                      setOriginPincode(pincode);
                      checkPincodeServiceability(pincode, 'origin');
                    }}
                    type="tel"
                    maxLength={6}
                    required
                    icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                    serviceabilityStatus={originServiceable === null ? null : (originServiceable ? 'available' : 'unavailable')}
                    showInlineStatus={true}
                    addressInfo={originServiceable && originData.city && originData.state ? `${originData.city}, ${originData.state}` : ''}
                    errorMessage={originServiceable === false ? 'Please try a different Pin Code or contact Customer Care' : ''}
                  />
                </div>

                <div className={`${!originServiceable && originServiceable !== null ? 'opacity-50' : ''}`}>
                  <FloatingInput
                    label="Destination PINCode"
                    value={destinationPincode}
                    onChange={(value) => {
                      const pincode = value.replace(/\D/g, '').slice(0, 6);
                      setDestinationPincode(pincode);
                      checkPincodeServiceability(pincode, 'destination');
                    }}
                    type="tel"
                    maxLength={6}
                    required
                    disabled={!originServiceable && originServiceable !== null}
                    disabledHoverDanger={!originServiceable && originServiceable !== null}
                    icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                    serviceabilityStatus={destinationServiceable === null ? null : (destinationServiceable ? 'available' : 'unavailable')}
                    showInlineStatus={true}
                    addressInfo={destinationServiceable && destinationData.city && destinationData.state ? `${destinationData.city}, ${destinationData.state}` : ''}
                    errorMessage={destinationServiceable === false ? 'Please try a different Pin Code' : ''}
                  />
                </div>

                {/* Success Message when both are serviceable */}
                {originServiceable && destinationServiceable && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-blue-800 font-medium text-xs">Great! Both locations are serviceable</p>
                    <p className="text-blue-600 text-xs mt-1">You can now proceed with booking</p>
                    <div className="mt-2">
                      <button
                        onClick={async () => { 
                          setFlowType('public'); // Ensure we're in public flow
                          setShowStepper(true); 
                          setCurrentStep(0);
                          // Pre-fill origin pincode and auto-fill location data
                          if (originPincode.length === 6) {
                            setOriginData(prev => ({ ...prev, pincode: originPincode }));
                            await autoFillFromPincode(originPincode, 'origin');
                          }
                          // Pre-fill destination pincode and auto-fill location data
                          if (destinationPincode.length === 6) {
                            setDestinationData(prev => ({ ...prev, pincode: destinationPincode }));
                            await autoFillFromPincode(destinationPincode, 'destination');
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-[#406ab9] text-white rounded-xl hover:bg-[#3059a0] transition-all duration-200 shadow-md font-medium text-xs"
                      >
                        Next
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Reset Button */}
                {(originServiceable !== null || destinationServiceable !== null) && (
                  <div className="text-center mt-2">
                    <button
                      onClick={resetPublicFlow}
                      className="text-[#64748b] hover:text-[#406ab9] text-xs underline transition-colors duration-200"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Corporate Flow */}
        {flowType === 'corporate' && !showStepper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50" style={{
              boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
            }}>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2" style={{ 
                fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important'
              }}>
                Corporate Login
              </h2>
              <p className="text-center text-gray-600 mb-8" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                Search by Corporate ID or Mobile Number to auto-fill your details
              </p>
              
              <div className="space-y-6">
                {/* Search Type Toggle */}
                <div className="flex justify-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setCorporateSearchType('id');
                      setCorporateData(null);
                      setCorporateMobile('');
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      corporateSearchType === 'id' 
                        ? 'bg-white text-[#406ab9] shadow-sm border border-[#4ec0f7]' 
                        : 'text-[#64748b] hover:text-[#406ab9]'
                    }`}
                  >
                    <Building className="w-4 h-4 inline mr-2" />
                    Corporate ID
                  </button>
                  <button
                    onClick={() => {
                      setCorporateSearchType('mobile');
                      setCorporateData(null);
                      setCorporateId('');
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      corporateSearchType === 'mobile' 
                        ? 'bg-white text-[#406ab9] shadow-sm border border-[#4ec0f7]' 
                        : 'text-[#64748b] hover:text-[#406ab9]'
                    }`}
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Mobile Number
                  </button>
                </div>

                {/* Search Input */}
                {corporateSearchType === 'id' ? (
                  <FloatingInput
                    label="Corporate ID (e.g., D00001)"
                    value={corporateId}
                    onChange={(value) => {
                      setCorporateId(value.toUpperCase());
                      setCorporateData(null);
                    }}
                    icon={<Building className="w-4 h-4" />}
                  />
                ) : (
                  <FloatingInput
                    label="Mobile Number"
                    value={corporateMobile}
                    onChange={(value) => {
                      const mobile = value.replace(/\D/g, '').slice(0, 10);
                      setCorporateMobile(mobile);
                      setCorporateData(null);
                    }}
                    type="tel"
                    maxLength={10}
                    icon={<Phone className="w-4 h-4" />}
                  />
                )}

                {/* Search Button */}
                <button
                  onClick={handleCorporateLookup}
                  disabled={
                    (corporateSearchType === 'id' && !corporateId.trim()) ||
                    (corporateSearchType === 'mobile' && corporateMobile.length !== 10)
                  }
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    (corporateSearchType === 'id' && corporateId.trim()) ||
                    (corporateSearchType === 'mobile' && corporateMobile.length === 10)
                      ? 'bg-[#406ab9] text-white hover:bg-[#3059a0] shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Search & Proceed
                </button>

                {/* Results Display */}
                <AnimatePresence mode="wait">
                  {corporateData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Success - Active Corporate Found */}
                      {!corporateData.error && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            <h3 className="text-lg font-semibold text-green-800">Corporate Account Found</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-green-700"><strong>Company:</strong> {corporateData.name}</p>
                              <p className="text-green-700"><strong>Email:</strong> {corporateData.email}</p>
                              <p className="text-green-700"><strong>Contact:</strong> {corporateData.contactNumber}</p>
                            </div>
                            <div>
                              <p className="text-green-700"><strong>Address:</strong> {corporateData.companyAddress}</p>
                              <p className="text-green-700"><strong>City:</strong> {corporateData.city}, {corporateData.state}</p>
                              <p className="text-green-700"><strong>GST:</strong> {corporateData.gstNumber}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-green-100 rounded-lg">
                            <p className="text-green-800 text-sm font-medium">
                              âœ“ Your details will be automatically filled in the booking form
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error - Inactive Corporate */}
                      {corporateData.error === 'inactive' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
                            <h3 className="text-lg font-semibold text-orange-800">Account Inactive</h3>
                          </div>
                          
                          <p className="text-orange-700 mb-4">
                            Your corporate account <strong>{corporateData.name}</strong> is currently inactive. 
                            Please contact your account manager to reactivate your account.
                          </p>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={async () => {
                                setShowStepper(true);
                                // Pre-fill origin pincode and auto-fill location data
                                if (originPincode.length === 6) {
                                  setOriginData(prev => ({ ...prev, pincode: originPincode }));
                                  await autoFillFromPincode(originPincode, 'origin');
                                }
                                // Pre-fill destination pincode and auto-fill location data
                                if (destinationPincode.length === 6) {
                                  setDestinationData(prev => ({ ...prev, pincode: destinationPincode }));
                                  await autoFillFromPincode(destinationPincode, 'destination');
                                }
                              }}
                              className="px-4 py-2 bg-[#4ec0f7] text-white rounded-xl hover:bg-[#3da9d9] transition-colors"
                            >
                              Continue Manually
                            </button>
                            <button
                              onClick={resetCorporateFlow}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Try Different Account
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error - Not Found */}
                      {corporateData.error === 'notFound' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                            <h3 className="text-lg font-semibold text-blue-800">Account Not Found</h3>
                          </div>
                          
                          <p className="text-blue-700 mb-4">
                            No corporate account found with {corporateData.searchType === 'id' ? 'ID' : 'mobile number'} 
                            <strong> {corporateData.searchValue}</strong>. You can proceed with manual entry or try a different search.
                          </p>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={async () => {
                                setShowStepper(true);
                                // Pre-fill origin pincode and auto-fill location data
                                if (originPincode.length === 6) {
                                  setOriginData(prev => ({ ...prev, pincode: originPincode }));
                                  await autoFillFromPincode(originPincode, 'origin');
                                }
                                // Pre-fill destination pincode and auto-fill location data
                                if (destinationPincode.length === 6) {
                                  setDestinationData(prev => ({ ...prev, pincode: destinationPincode }));
                                  await autoFillFromPincode(destinationPincode, 'destination');
                                }
                              }}
                              className="px-4 py-2 bg-[#406ab9] text-white rounded-xl hover:bg-[#3059a0] transition-colors"
                            >
                              Continue Manually
                            </button>
                            <button
                              onClick={resetCorporateFlow}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Try Different Search
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reset Option */}
                {(corporateId || corporateMobile) && (
                  <div className="text-center">
                    <button
                      onClick={resetCorporateFlow}
                      className="text-[#64748b] hover:text-[#406ab9] text-sm underline transition-colors duration-200"
                    >
                      Reset and try different credentials
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Non-serviceable Message */}
        <AnimatePresence>
          {showNonServiceableMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Service Not Available</h3>
                  <p className="text-gray-600 mb-6">
                    Sorry, we don't currently service the origin pincode <strong>{originPincode}</strong>. 
                    Please try a different pincode or contact our customer care team for assistance.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowNonServiceableMessage(false);
                        resetPublicFlow();
                      }}
                      className="px-6 py-3 bg-[#406ab9] text-white rounded-xl hover:bg-[#3059a0] transition-all duration-200 font-medium"
                    >
                      Try Different Pincode
                    </button>
                    
                    <button
                      onClick={() => setShowNonServiceableMessage(false)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Contact Customer Care
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowNonServiceableMessage(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stepper Section */}
        {showStepper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            {/* Step Content - Only Manual Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Stepper and City Display inside the card */}
              <div className="flex flex-col items-center space-y-2 mb-6">
                <Stepper 
                  currentStep={currentStep} 
                  steps={steps} 
                  completedSteps={completedSteps} 
                />
                
                {/* City Display */}
                {originData.city && destinationData.city && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-4">
                      {/* From Location Box */}
                      <div className="bg-blue-100 px-6 py-1 rounded-xl border border-blue-200 shadow-sm mt-1">
                        <span className="text-lg font-bold text-gray-800">
                          {originData.city}
                        </span>
                      </div>
                      
                      {/* Plane Icon */}
                      <div className="flex items-center justify-center">
                        <svg 
                          className="w-8 h-8 text-blue-500" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 12l-8-5v3H8v4h6v3l8-5z"/>
                        </svg>
                      </div>
                      
                      {/* To Location Box */}
                      <div className="bg-green-100 px-6 py-1 rounded-xl border border-green-200 shadow-sm mt-1">
                        <span className="text-lg font-bold text-gray-800">
                          {destinationData.city}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Back Button for all steps */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (currentStep === 0) {
                      // If in manual form, go back to mobile input within stepper
                      if (showManualForm) {
                        setShowManualForm(false);
                        setShowSummaryCard(false);
                        // Reset mobile input to allow re-entry
                        setMobileDigits(['', '', '', '', '', '', '', '', '', '']);
                      } else {
                        // Otherwise go back to Check Serviceability page
                        setShowStepper(false);
                      }
                    } else {
                      // Go to previous step
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  className="flex items-center px-4 py-2 text-[#64748b] hover:text-[#406ab9] hover:bg-[#4ec0f7]/10 rounded-xl transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {currentStep === 0 ? (showManualForm ? 'Back to Mobile Input' : 'Back') : `Back to ${steps[currentStep - 1]}`}
                </button>
              </div>

              {/* Step 1: Origin Details - Mobile Input First, then Manual Form */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Mobile Number Input Section or OTP Verification Section */}
                  {!showSummaryCard && !showManualForm && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl h-auto flex flex-col justify-center backdrop-blur-sm bg-white/95">
                        {/* OCL Services Logo */}
                        <div className="w-full flex justify-center mb-6">
                          <img
                            src="/src/assets/ocl-logo.jpg"
                            alt="OCL Services"
                            className="h-16 w-16 rounded-full shadow-lg border-2 border-white/60"
                          />
                        </div>
                        
                        <div className="text-center space-y-6">
                          {/* Phone Number Input Section - Always Visible */}
                            <>
                              <h2 className="text-xl text-[#1e293b] mb-4" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                                Sender / Consignor - Phone No.
                              </h2>
                              
                              {/* Mobile Number Input Section with Country Code */}
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                                {/* Country Code Fixed Display */}
                                <div className="flex items-center space-x-2">
                                  <img
                                    src="/src/Icon-images/india.png"
                                    alt="India"
                                    className="w-6 h-6 rounded-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <span className="text-lg font-semibold text-[#406ab9]" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>+91</span>
                                </div>
                                
                                {/* Mobile Number Input Boxes */}
                                <div className="flex gap-1 flex-wrap justify-center max-w-full">
                                  {mobileDigits.map((digit, index) => (
                                    <input
                                      key={index}
                                      id={`digit-${index}`}
                                      type="text"
                                      value={digit}
                                      onChange={(e) => handleDigitChange(index, e.target.value)}
                                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                                      className="w-10 h-10 text-center text-sm font-semibold border-2 border-gray-300 rounded-2xl bg-white/80 focus:border-[#406ab9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4ec0f7]/30 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                                      maxLength={1}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {mobileDigits.filter(digit => digit !== '').join('').length === 10 && (
                                <div className="flex flex-col items-center gap-2">
                                  {checkingPhoneNumber ? (
                                    <div className="flex items-center gap-2 text-[#406ab9]">
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#406ab9] border-t-transparent"></div>
                                      <span className="text-sm">Checking phone number...</span>
                                    </div>
                                  ) : (
                                <button
                                  onClick={resetMobileInput}
                                      className="text-sm text-[#64748b] hover:text-[#406ab9] underline transition-colors duration-200"
                                >
                                  Change Number
                                </button>
                                  )}
                                </div>
                              )}
                            </>

                          {/* OTP Verification Popup - Full Page Overlay */}
                          {showOTPVerification && (
                            <div className="fixed inset-0 flex items-center justify-center z-[9999] animate-in fade-in duration-500">
                              <div className="absolute inset-0 bg-white"></div>
                              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
                                <div className="text-center mb-4">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Enter OTP</h3>
                                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-blue-200/50 shadow-lg animate-in slide-in-from-top-2 fade-in duration-500">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                      <p className="text-xs text-gray-600 font-medium">
                                        {isOtpSending ? 'Sending OTP...' : 'An OTP had been sent : '}
                                      </p>
                                      <p className="text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-lg shadow-sm">
                                        {mobileDigits.filter(digit => digit !== '').join('').length >= 4
                                          ? "XXXXXX" + mobileDigits.filter(digit => digit !== '').join('').slice(-4)
                                          : "XXXXXX"}
                                      </p>
                                  </div>
                                <button
                                      type="button"
                                  onClick={resetMobileInput}
                                      className="p-2 hover:bg-white/80 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                                      title="Edit Number"
                                >
                                      <svg className="w-4 h-4 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                </div>
                              </div>
                              
                                <div className="flex gap-3 justify-center mb-6">
                                  {[0, 1, 2, 3, 4, 5].map((index) => (
                                      <div key={index} className="relative group">
                                  <input
                                    type="text"
                                    maxLength={1}
                                        value={otpDigits[index] || ''}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, '');
                                          if (value.length <= 1) {
                                            const newOtp = [...otpDigits];
                                            newOtp[index] = value;
                                            setOtpDigits(newOtp);
                                            setOtpError(null);
                                            
                                            // Auto-focus next input
                                            if (value && index < 5) {
                                              const nextInput = document.getElementById(`otp-digit-${index + 1}`);
                                              nextInput?.focus();
                                            }

                                            // Auto-verify when 6 digits are entered
                                            if (newOtp.join('').length === 6) {
                                              setTimeout(() => {
                                                verifyOTP(newOtp.join(''));
                                              }, 100);
                                            }
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                                            const prevInput = document.getElementById(`otp-digit-${index - 1}`);
                                            prevInput?.focus();
                                          }
                                        }}
                                        id={`otp-digit-${index}`}
                                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400"
                                        placeholder=""
                                      />
                                      </div>
                                    ))}
                              </div>
                              
                              {/* OTP Error Display */}
                              {otpError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm text-red-600 text-center">{otpError}</p>
                                  {otpError.includes('phone number') && (
                                    <button
                                      onClick={() => {
                                        setShowOTPVerification(false);
                                        setOtpError(null);
                                        setOtpDigits(Array(6).fill(''));
                                      }}
                                      className="mt-2 w-full px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Go Back to Phone Number
                                    </button>
                                  )}
                                </div>
                              )}
                              
                                <div className="flex items-center justify-center">
                                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 border border-gray-200/50 shadow-md">
                                    <span className="text-xs text-gray-500 font-medium">Didn't receive ?</span>
                                <button
                                      type="button"
                                  onClick={() => {
                                    setOtpDigits(Array(6).fill(''));
                                    setOtpError(null);
                                    const currentMobileNumber = mobileDigits.filter(digit => digit !== '').join('');
                                    sendOTP(currentMobileNumber);
                                  }}
                                      className="text-xs font-bold px-3 py-1 rounded-lg transition-all duration-300 text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-100 hover:bg-blue-200 shadow-sm hover:shadow-md"
                                      disabled={isOtpSending}
                                >
                                      {isOtpSending ? 'Sending...' : 'Resend OTP'}
                                </button>
                              </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* OTP Verification Success Message - Modern Design */}
                  {otpVerified && !showSummaryCard && !showManualForm && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeOut",
                        delay: 0.2
                      }}
                      className="max-w-2xl mx-auto mt-6"
                    >
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-lg">
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeOut",
                            delay: 0.4
                          }}
                          className="flex items-center justify-center mb-6"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </motion.div>
                        <motion.h3 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                          className="text-xl font-bold text-green-800 mb-3" 
                          style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        >
                          Phone Number Verified!
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          className="text-sm text-green-700 mb-4"
                        >
                          Your phone number <span className="font-semibold">+91 {mobileDigits.filter(digit => digit !== '').join('')}</span> has been successfully verified.
                        </motion.p>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 1.0 }}
                          className="inline-flex items-center space-x-2 text-xs text-green-600 bg-green-100 rounded-full px-4 py-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Secure verification completed</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Address Selection (if mobile found in database) */}
                  {showSummaryCard && userAddresses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.7, 
                        ease: "easeOut",
                        delay: 0.3
                      }}
                      className="max-w-2xl mx-auto"
                    >
                      <div>
                        {/* Header */}
                        <div className="bg-[#406ab9] text-white px-6 py-3 rounded-t-2xl">
                          <h4 className="font-semibold text-lg">Select Delivery Address</h4>
                        </div>

                        {/* Address Cards */}
                        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-0 overflow-hidden">
                          {userAddresses.map((address, index) => {
                            const isSelected = selectedAddressId === address.id;
                            return (
                            <div key={address.id}>
                              <div
                                className={`p-5 cursor-pointer transition-all duration-200 ${
                                  isSelected 
                                    ? '!bg-blue-50' 
                                    : '!bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  {/* Radio Button */}
                                  <div className="mt-0.5">
                                    <input
                                      type="radio"
                                      name="selectedAddress"
                                      checked={selectedAddressId === address.id}
                                      onChange={() => handleAddressSelect(address.id)}
                                      className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                
                                {/* Address Content */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center space-x-2">
                                      <div className="font-bold text-[#1e293b] text-lg">{address.name}</div>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        {address.addressType}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Pre-fill form with this address data for editing
                                          setEditingAddressId(address.id);
                                          setOriginData(prev => ({ ...prev, ...address }));
                                          setShowSummaryCard(false);
                                          setShowManualForm(true);
                                        }}
                                        className="text-[#406ab9] hover:text-[#3059a0] p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                      >
                                        <SquarePen className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Delete address
                                          if (confirm('Are you sure you want to delete this address?')) {
                                            setUserAddresses(userAddresses.filter(addr => addr.id !== address.id));
                                            if (selectedAddressId === address.id) {
                                              setSelectedAddressId(null);
                                              setAddressDeliveryConfirmed(false);
                                            }
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Details Display - Matching Reference Format */}
                                  <div className="space-y-1 text-sm">
                                    {/* Company Name with Icon */}
                                    {address.companyName && (
                                      <div className="flex items-center gap-2">
                                        <img src="/src/Icon-images/Building.png" alt="Company" className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-gray-800 font-medium">{address.companyName}</span>
                                      </div>
                                    )}

                                    {/* Address - Single Line */}
                                    <div className="flex items-start gap-2">
                                      <img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      <span className="text-gray-700 text-xs">
                                        {address.locality}, {address.flatBuilding}
                                        {address.landmark && `, ${address.landmark}`}, {address.area}, {address.city}, {address.pincode} - ({address.state})
                                      </span>
                                    </div>

                                    {/* Contact & Business Info - All in One Horizontal Line with Bullets */}
                                    <div className="flex items-center gap-2 flex-wrap text-gray-700 text-xs">
                                      {/* Mobile */}
                                      <div className="flex items-center gap-1.5">
                                        <img src="/src/Icon-images/mobile.png" alt="Phone" className="w-4 h-4 flex-shrink-0" />
                                        <span className="font-semibold">+91 {address.mobileNumber}</span>
                                      </div>

                                      {/* Email */}
                                      {address.email && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/communication.png" alt="Email" className="w-4 h-4 flex-shrink-0" />
                                            <span>{address.email}</span>
                                          </div>
                                        </>
                                      )}

                                      {/* GST */}
                                      {address.gstNumber && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/calculate.png" alt="GST" className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-mono">{address.gstNumber}</span>
                                          </div>
                                        </>
                                      )}

                                      {/* Website */}
                                      {address.website && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/world-wide-web.png" alt="Website" className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-blue-600">{address.website}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Additional Info - Birthday, Anniversary, Alternate Number */}
                                    {(address.birthday || address.anniversary || address.otherAlternateNumber) && (
                                      <div className="flex items-center gap-1.5 flex-wrap text-gray-600 text-xs">
                                        {address.otherAlternateNumber && (
                                          <div className="flex items-center gap-1">
                                            <img src="/src/Icon-images/mobile.png" alt="Phone" className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="font-medium">{address.otherAlternateNumber}</span>
                                          </div>
                                        )}
                                        {address.birthday && (
                                          <>
                                            {address.otherAlternateNumber && <span className="text-gray-400">•</span>}
                                            <div className="flex items-center gap-1">
                                              <img src="/src/Icon-images/birthday.png" alt="Birthday" className="w-3.5 h-3.5 flex-shrink-0" />
                                              <span>Birthday: {address.birthday}</span>
                                            </div>
                                          </>
                                        )}
                                        {address.anniversary && (
                                          <>
                                            {(address.otherAlternateNumber || address.birthday) && <span className="text-gray-400">•</span>}
                                            <div className="flex items-center gap-1">
                                              <img src="/src/Icon-images/anniversary.png" alt="Anniversary" className="w-3.5 h-3.5 flex-shrink-0" />
                                              <span>Anniversary: {address.anniversary}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-[#F4F2F1] rounded-2xl border border-gray-200 shadow-lg p-6 space-y-3">
                          <button
                            onClick={handleDeliverHere}
                            disabled={!selectedAddressId}
                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 ${
                              selectedAddressId
                                ? 'bg-[#ff6b35] hover:bg-[#e55a2b] text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {addressDeliveryConfirmed ? '✓ Address Confirmed' : 'DELIVER HERE'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowSummaryCard(false);
                              setShowManualForm(true);
                              setEditingAddressId(null); // Reset editing ID for new address
                              // Reset form for new address
                              setOriginData(prev => ({
                                ...prev,
                                name: '',
                                companyName: '',
                                email: '',
                                locality: '',
                                flatBuilding: '',
                                landmark: '',
                                pincode: '',
                                area: '',
                                city: '',
                                district: '',
                                state: '',
                                gstNumber: '',
                                alternateNumbers: [''],
                                addressType: 'Home',
                                birthday: '',
                                anniversary: '',
                                otherAlternateNumber: '',
                                showOtherAlternateNumber: false,
                                website: ''
                              }));
                            }}
                            className="w-full text-[#406ab9] hover:bg-[#406ab9] hover:text-white font-semibold py-3 rounded-xl transition-all duration-200"
                          >
                            Add a New Address
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Manual Form (when adding new address or mobile not found) */}
                  {showManualForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        ease: "easeOut",
                        delay: 0.2
                      }}
                      className="max-w-4xl mx-auto"
                    >
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        {/* Display Mobile Number as Text */}
                        <div className="mb-2">
                          <div className="text-sm font-medium text-[#64748b] mb-2">
                            Mobile No: +91 {mobileDigits.filter(digit => digit !== '').join('')}
                          </div>
                        </div>

                        {/* Enter Your Details Section */}
                        <div className="mb-4">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3 flex items-center gap-2" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                            <img src="/src/Icon-images/address.png" alt="Address" className="w-5 h-5" />
                            Sender / Consignor Address
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Concern Name"
                              value={originData.name}
                              onChange={(value) => setOriginData(prev => ({ ...prev, name: value }))}
                              required
                              icon={<img src="/src/Icon-images/user.png" alt="User" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Company Name"
                              value={originData.companyName}
                              onChange={(value) => setOriginData(prev => ({ ...prev, companyName: value }))}
                              icon={<img src="/src/Icon-images/Building.png" alt="Building" className="w-4 h-4" />}
                            />
                          </div>
                        </div>

                        {/* Address Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}></h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Locality / Street"
                              value={originData.locality}
                              onChange={(value) => setOriginData(prev => ({ ...prev, locality: value }))}
                              required
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Building / Flat No."
                              value={originData.flatBuilding}
                              onChange={(value) => setOriginData(prev => ({ ...prev, flatBuilding: value }))}
                              required
                              icon={<img src="/src/Icon-images/Building.png" alt="Building" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Landmark"
                              value={originData.landmark}
                              onChange={(value) => setOriginData(prev => ({ ...prev, landmark: value }))}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="GST"
                              value={originData.gstNumber}
                              onChange={(value) => {
                                const formattedGST = validateGSTFormat(value);
                                setOriginData(prev => ({ ...prev, gstNumber: formattedGST }));
                                // Validate GST: if partially filled (1-14 chars), show error
                                if (formattedGST.length > 0 && formattedGST.length < 15) {
                                  setOriginGstError(true);
                                } else {
                                  setOriginGstError(false);
                                }
                              }}
                              maxLength={15}
                              icon={<img src="/src/Icon-images/calculate.png" alt="GST" className="w-4 h-4" />}
                              hasValidationError={originGstError}
                              validationErrorMessage={originGstError ? "Please complete the 15-digit GST number or leave it empty" : ""}
                            />

                            <FloatingInput
                              label="PINCode"
                              value={originData.pincode}
                              onChange={(value) => {
                                const pincode = value.replace(/\D/g, '').slice(0, 6);
                                setOriginData(prev => ({ ...prev, pincode }));
                                if (pincode.length === 6) {
                                  autoFillFromPincode(pincode, 'origin');
                                } else {
                                  // Clear areas when pincode is incomplete
                                  setOriginAreas([]);
                                  setOriginData(prev => ({ ...prev, area: '', city: '', state: '', district: '' }));
                                }
                              }}
                              type="tel"
                              required
                              maxLength={6}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                              disabled={originGstError}
                            />

                            <FloatingInput
                              label="State"
                              value={originData.state}
                              onChange={(value) => setOriginData(prev => ({ ...prev, state: value }))}
                              disabled={true}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="City"
                              value={originData.city}
                              onChange={(value) => setOriginData(prev => ({ ...prev, city: value }))}
                              disabled={true}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            {originData.pincode.length === 6 && (
                              <FloatingSelect
                                label="Area"
                                value={originData.area}
                                onChange={(value) => setOriginData(prev => ({ ...prev, area: value }))}
                                options={originAreas.length > 0 ? originAreas : ['This pincode is not serviceable']}
                                required
                                disabled={originAreas.length === 0 || originGstError}
                                icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                              />
                            )}
                          </div>
                        </div>

                        {/* Contact Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}></h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Email"
                              value={originData.email}
                              onChange={(value) => {
                                setOriginData(prev => ({ ...prev, email: value }));
                                // Validate Email: if partially filled (doesn't contain @), show error
                                if (value.length > 0 && !value.includes('@')) {
                                  setOriginEmailError(true);
                                } else {
                                  setOriginEmailError(false);
                                }
                              }}
                              type="email"
                              required
                              icon={<img src="/src/Icon-images/communication.png" alt="Email" className="w-4 h-4" />}
                              disabled={originGstError}
                              hasValidationError={originEmailError}
                              validationErrorMessage={originEmailError ? "Please enter a valid email address with @" : ""}
                            />

                            <FloatingInput
                              label="Website (Optional)"
                              value={originData.website || ''}
                              onChange={(value) => setOriginData(prev => ({ ...prev, website: value }))}
                              type="url"
                              icon={<img src="/src/Icon-images/world-wide-web.png" alt="Website" className="w-4 h-4" />}
                              disabled={originGstError || originEmailError}
                            />

                            <FloatingInput
                              label="Anniversary"
                              value={originData.anniversary}
                              onChange={(value) => setOriginData(prev => ({ ...prev, anniversary: value }))}
                              type="date"
                              icon={<img src="/src/Icon-images/anniversary.png" alt="Anniversary" className="w-4 h-4" />}
                              disabled={originGstError || originEmailError}
                            />

                            <FloatingInput
                              label="Birthday"
                              value={originData.birthday}
                              onChange={(value) => setOriginData(prev => ({ ...prev, birthday: value }))}
                              type="date"
                              icon={<img src="/src/Icon-images/birthday.png" alt="Birthday" className="w-4 h-4" />}
                              disabled={originGstError || originEmailError}
                            />
                          </div>
                        </div>

                        {/* Alternate Number Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}></h5>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div 
                              onClick={() => setOriginData(prev => ({ ...prev, showOtherAlternateNumber: !prev.showOtherAlternateNumber }))}
                              className="flex items-center justify-between cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                            >
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-[#406ab9]" />
                                <span className="text-[#1e293b] font-medium text-sm">Alternate Number</span>
                              </div>
                              <div className="text-[#64748b] text-sm">
                                {originData.showOtherAlternateNumber ? '▼' : '▶'}
                              </div>
                            </div>
                            {originData.showOtherAlternateNumber && (
                              <div className="mt-3 pt-2" onClick={(e) => e.stopPropagation()}>
                                <FloatingInput
                                  label="Add Number"
                                  value={originData.otherAlternateNumber}
                                  onChange={(value) => {
                                    const mobile = value.replace(/\D/g, '').slice(0, 10);
                                    setOriginData(prev => ({ ...prev, otherAlternateNumber: mobile }));
                                  }}
                                  type="tel"
                                  maxLength={10}
                                  icon={<img src="/src/Icon-images/mobile.png" alt="Mobile" className="w-4 h-4" />}
                                  disabled={originGstError || originEmailError}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Address Type Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3 flex items-center gap-2" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                            <img src="/src/Icon-images/address.png" alt="Address" className="w-5 h-5" />
                            Type of Address
                          </h5>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex space-x-6">
                              {['Home', 'Office', 'Other'].map((type) => (
                                <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                                  <input
                                    type="radio"
                                    name="originAddressType"
                                    value={type}
                                    checked={originData.addressType === type}
                                    onChange={(e) => setOriginData(prev => ({ ...prev, addressType: e.target.value }))}
                                    className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300"
                                  />
                                  <span className="text-[#64748b] group-hover:text-[#406ab9] transition-colors">{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex space-x-4">
                          <button
                            onClick={() => {
                              setShowManualForm(false);
                              setShowSummaryCard(false);
                              // Reset mobile input to allow re-entry
                              setMobileDigits(['', '', '', '', '', '', '', '', '', '']);
                            }}
                            className="px-6 py-2 border border-gray-300 text-[#64748b] rounded-xl hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleManualFormSave}
                            className="flex-1 bg-[#406ab9] hover:bg-[#3059a0] text-white font-semibold py-2 rounded-xl transition-colors duration-200"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Proceed Button for Step 0 (Origin) */}
                  {(showSummaryCard && addressDeliveryConfirmed) && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => {
                          if (!isCurrentStepValid(currentStep)) return;
                          
                          // Mark current step as completed
                          const newCompletedSteps = [...completedSteps];
                          newCompletedSteps[currentStep] = true;
                          setCompletedSteps(newCompletedSteps);
                          
                          // Move to next step
                          if (currentStep < steps.length - 1) {
                            setCurrentStep(currentStep + 1);
                          }
                        }}
                        disabled={!isCurrentStepValid(currentStep)}
                        className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                          isCurrentStepValid(currentStep)
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Proceed to Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Destination Details */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Fallback content in case of any rendering issues */}
                  {(!showDestinationSummaryCard && !showDestinationManualForm && !destinationMobileDigits) && (
                    <div className="max-w-2xl mx-auto p-8 text-center">
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <h2 className="text-xl text-[#1e293b] mb-4">Loading...</h2>
                        <p className="text-gray-600">Please wait while we load the destination details form.</p>
                      </div>
                    </div>
                  )}
                  {/* Mobile Number Input Section - Glassmorphic Card */}
                  {!showDestinationSummaryCard && !showDestinationManualForm && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-gradient-to-br from-gray-100/90 to-gray-200/80 backdrop-blur-md rounded-3xl p-8 border border-gray-300/50 h-auto flex flex-col justify-center" style={{
                        boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
                      }}>
                        {/* OCL Services Logo */}
                        <div className="w-full flex justify-center mb-6">
                          <img
                            src="/src/assets/ocl-logo.jpg"
                            alt="OCL Services"
                            className="h-16 w-16 rounded-full shadow-lg border-2 border-white/60"
                          />
                        </div>
                        
                        <div className="text-center space-y-6">
                          <h2 className="text-xl text-[#1e293b] mb-4" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                            Receiver / Consignee - Phone No.
                          </h2>
                          
                          {/* Mobile Number Input Section with Country Code */}
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                            {/* Country Code Fixed Display */}
                            <div className="flex items-center space-x-2">
                              <img
                                src="/src/Icon-images/india.png"
                                alt="India"
                                className="w-6 h-6 rounded-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className="text-lg font-semibold text-[#406ab9]" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>+91</span>
                            </div>
                            
                            {/* Mobile Number Input Boxes */}
                            <div className="flex gap-1 flex-wrap justify-center max-w-full">
                              {(destinationMobileDigits || Array(10).fill('')).map((digit, index) => (
                                <input
                                  key={index}
                                  id={`dest-digit-${index}`}
                                  type="text"
                                  value={digit}
                                  onChange={(e) => handleDestinationDigitChange(index, e.target.value)}
                                  onKeyDown={(e) => handleDestinationDigitKeyDown(index, e)}
                                  className="w-10 h-10 text-center text-sm font-semibold border-2 border-gray-300 rounded-2xl bg-white/80 focus:border-[#406ab9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4ec0f7]/30 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                                  maxLength={1}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {(destinationMobileDigits || []).filter(digit => digit !== '').join('').length === 10 && (
                            <button
                              onClick={resetDestinationMobileInput}
                              className="text-sm text-[#64748b] hover:text-[#406ab9] underline transition-colors duration-200 mt-4"
                            >
                              Change Number
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Address Selection (if mobile found in database) */}
                  {showDestinationSummaryCard && destinationUserAddresses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.7, 
                        ease: "easeOut",
                        delay: 0.3
                      }}
                      className="max-w-2xl mx-auto"
                    >
                      <div>
                        {/* Header */}
                        <div className="bg-[#406ab9] text-white px-6 py-3 rounded-t-2xl">
                          <h4 className="font-semibold text-lg">Select Delivery Address</h4>
                          <p className="text-sm text-blue-100">Choose from your saved addresses</p>
                        </div>

                        {/* Address Cards */}
                        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-0 overflow-hidden">
                          {destinationUserAddresses.map((address, index) => {
                            const isSelected = selectedDestinationAddressId === address.id;
                            return (
                            <div key={address.id}>
                              <div
                                className={`p-5 cursor-pointer transition-all duration-200 ${
                                  isSelected 
                                    ? '!bg-blue-50' 
                                    : '!bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  {/* Radio Button */}
                                  <div className="mt-0.5">
                                    <input
                                      type="radio"
                                      name="selectedDestinationAddress"
                                      checked={selectedDestinationAddressId === address.id}
                                      onChange={() => handleDestinationAddressSelect(address.id)}
                                      className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                
                                {/* Address Content */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center space-x-2">
                                      <div className="font-bold text-[#1e293b] text-lg">{address.name}</div>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        {address.addressType}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Pre-fill form with this address data for editing
                                          setEditingDestinationAddressId(address.id);
                                          setDestinationData(prev => ({ ...prev, ...address }));
                                          setShowDestinationSummaryCard(false);
                                          setShowDestinationManualForm(true);
                                        }}
                                        className="text-[#406ab9] hover:text-[#3059a0] p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                      >
                                        <SquarePen className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Delete address
                                          if (confirm('Are you sure you want to delete this address?')) {
                                            setDestinationUserAddresses(destinationUserAddresses.filter(addr => addr.id !== address.id));
                                            if (selectedDestinationAddressId === address.id) {
                                              setSelectedDestinationAddressId(null);
                                              setDestinationAddressDeliveryConfirmed(false);
                                            }
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Details Display - Matching Reference Format */}
                                  <div className="space-y-1 text-sm">
                                    {/* Company Name with Icon */}
                                    {address.companyName && (
                                      <div className="flex items-center gap-2">
                                        <img src="/src/Icon-images/Building.png" alt="Company" className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-gray-800 font-medium">{address.companyName}</span>
                                      </div>
                                    )}

                                    {/* Address - Single Line */}
                                    <div className="flex items-start gap-2">
                                      <img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      <span className="text-gray-700 text-xs">
                                        {address.locality}, {address.flatBuilding}
                                        {address.landmark && `, ${address.landmark}`}, {address.area}, {address.city}, {address.pincode} - ({address.state})
                                      </span>
                                    </div>

                                    {/* Contact & Business Info - All in One Horizontal Line with Bullets */}
                                    <div className="flex items-center gap-2 flex-wrap text-gray-700 text-xs">
                                      {/* Mobile */}
                                      <div className="flex items-center gap-1.5">
                                        <img src="/src/Icon-images/mobile.png" alt="Phone" className="w-4 h-4 flex-shrink-0" />
                                        <span className="font-semibold">+91 {address.mobileNumber}</span>
                                      </div>

                                      {/* Email */}
                                      {address.email && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/communication.png" alt="Email" className="w-4 h-4 flex-shrink-0" />
                                            <span>{address.email}</span>
                                          </div>
                                        </>
                                      )}

                                      {/* GST */}
                                      {address.gstNumber && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/calculate.png" alt="GST" className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-mono">{address.gstNumber}</span>
                                          </div>
                                        </>
                                      )}

                                      {/* Website */}
                                      {address.website && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1.5">
                                            <img src="/src/Icon-images/world-wide-web.png" alt="Website" className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-blue-600">{address.website}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Additional Info - Birthday, Anniversary, Alternate Number */}
                                    {(address.birthday || address.anniversary || address.otherAlternateNumber) && (
                                      <div className="flex items-center gap-1.5 flex-wrap text-gray-600 text-xs">
                                        {address.otherAlternateNumber && (
                                          <div className="flex items-center gap-1">
                                            <img src="/src/Icon-images/mobile.png" alt="Phone" className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="font-medium">{address.otherAlternateNumber}</span>
                                          </div>
                                        )}
                                        {address.birthday && (
                                          <>
                                            {address.otherAlternateNumber && <span className="text-gray-400">•</span>}
                                            <div className="flex items-center gap-1">
                                              <img src="/src/Icon-images/birthday.png" alt="Birthday" className="w-3.5 h-3.5 flex-shrink-0" />
                                              <span>Birthday: {address.birthday}</span>
                                            </div>
                                          </>
                                        )}
                                        {address.anniversary && (
                                          <>
                                            {(address.otherAlternateNumber || address.birthday) && <span className="text-gray-400">•</span>}
                                            <div className="flex items-center gap-1">
                                              <img src="/src/Icon-images/anniversary.png" alt="Anniversary" className="w-3.5 h-3.5 flex-shrink-0" />
                                              <span>Anniversary: {address.anniversary}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-[#F4F2F1] rounded-2xl border border-gray-200 shadow-lg p-6 space-y-3">
                          <button
                            onClick={handleDestinationDeliverHere}
                            disabled={!selectedDestinationAddressId}
                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 ${
                              selectedDestinationAddressId
                                ? 'bg-[#ff6b35] hover:bg-[#e55a2b] text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {destinationAddressDeliveryConfirmed ? '✓ Address Confirmed' : 'DELIVER HERE'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowDestinationSummaryCard(false);
                              setShowDestinationManualForm(true);
                              setEditingDestinationAddressId(null); // Reset editing ID for new address
                              // Reset form for new address
                              setDestinationData(prev => ({
                                ...prev,
                                name: '',
                                companyName: '',
                                email: '',
                                locality: '',
                                flatBuilding: '',
                                landmark: '',
                                pincode: '',
                                area: '',
                                city: '',
                                district: '',
                                state: '',
                                gstNumber: '',
                                alternateNumbers: [''],
                                addressType: 'Home',
                                website: '',
                                anniversary: '',
                                birthday: ''
                              }));
                            }}
                            className="w-full text-[#406ab9] hover:bg-[#406ab9] hover:text-white font-semibold py-3 rounded-xl transition-all duration-200"
                          >
                            Add a New Address
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Manual Form (when adding new address or mobile not found) */}
                  {showDestinationManualForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        ease: "easeOut",
                        delay: 0.2
                      }}
                      className="max-w-4xl mx-auto"
                    >
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        {/* Display Mobile Number as Text */}
                        <div className="mb-6">
                          <div className="text-sm font-medium text-[#64748b] mb-2">
                            Mobile No: +91 {(destinationMobileDigits || []).filter(digit => digit !== '').join('')}
                          </div>
                          <h4 className="text-xl font-semibold text-[#1e293b] mb-2">Recipient / Consignor Details</h4>
                        </div>

                        {/* Enter Your Details Section */}
                        <div className="mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Concern Name"
                              value={destinationData.name}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, name: value }))}
                              required
                              icon={<img src="/src/Icon-images/user.png" alt="User" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Company Name"
                              value={destinationData.companyName}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, companyName: value }))}
                              icon={<img src="/src/Icon-images/Building.png" alt="Building" className="w-4 h-4" />}
                            />
                          </div>
                        </div>

                        {/* Address Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}></h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Locality/Street"
                              value={destinationData.locality}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, locality: value }))}
                              required
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Building /Flat No."
                              value={destinationData.flatBuilding}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, flatBuilding: value }))}
                              required
                              icon={<img src="/src/Icon-images/Building.png" alt="Building" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="Landmark"
                              value={destinationData.landmark}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, landmark: value }))}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="GST"
                              value={destinationData.gstNumber}
                              onChange={(value) => {
                                const formattedGST = validateGSTFormat(value);
                                setDestinationData(prev => ({ ...prev, gstNumber: formattedGST }));
                                // Validate GST: if partially filled (1-14 chars), show error
                                if (formattedGST.length > 0 && formattedGST.length < 15) {
                                  setDestinationGstError(true);
                                } else {
                                  setDestinationGstError(false);
                                }
                              }}
                              maxLength={15}
                              icon={<img src="/src/Icon-images/calculate.png" alt="GST" className="w-4 h-4" />}
                              hasValidationError={destinationGstError}
                              validationErrorMessage={destinationGstError ? "Please complete the 15-digit GST number or leave it empty" : ""}
                            />

                            <FloatingInput
                              label="Pin Code"
                              value={destinationData.pincode}
                              onChange={(value) => {
                                const pincode = value.replace(/\D/g, '').slice(0, 6);
                                setDestinationData(prev => ({ ...prev, pincode }));
                                if (pincode.length === 6) {
                                  autoFillFromPincode(pincode, 'destination');
                                } else {
                                  // Clear areas when pincode is incomplete
                                  setDestinationAreas([]);
                                  setDestinationData(prev => ({ ...prev, area: '', city: '', state: '', district: '' }));
                                }
                              }}
                              type="tel"
                              required
                              maxLength={6}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                              disabled={destinationGstError}
                            />

                            <FloatingInput
                              label="State"
                              value={destinationData.state}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, state: value }))}
                              disabled={true}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            <FloatingInput
                              label="City"
                              value={destinationData.city}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, city: value }))}
                              disabled={true}
                              icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                            />

                            {destinationData.pincode.length === 6 && (
                              <FloatingSelect
                                label="Area"
                                value={destinationData.area}
                                onChange={(value) => setDestinationData(prev => ({ ...prev, area: value }))}
                                options={destinationAreas.length > 0 ? destinationAreas : ['This pincode is not serviceable']}
                                required
                                disabled={destinationAreas.length === 0 || destinationGstError}
                                icon={<img src="/src/Icon-images/location.png" alt="Location" className="w-4 h-4" />}
                              />
                            )}
                          </div>
                        </div>

                        {/* Contact Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}></h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                              label="Email"
                              value={destinationData.email}
                              onChange={(value) => {
                                setDestinationData(prev => ({ ...prev, email: value }));
                                // Validate Email: if partially filled (doesn't contain @), show error
                                if (value.length > 0 && !value.includes('@')) {
                                  setDestinationEmailError(true);
                                } else {
                                  setDestinationEmailError(false);
                                }
                              }}
                              type="email"
                              required
                              icon={<img src="/src/Icon-images/communication.png" alt="Email" className="w-4 h-4" />}
                              disabled={destinationGstError}
                              hasValidationError={destinationEmailError}
                              validationErrorMessage={destinationEmailError ? "Please enter a valid email address with @" : ""}
                            />

                            <FloatingInput
                              label="Website (Optional)"
                              value={destinationData.website || ''}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, website: value }))}
                              type="url"
                              icon={<img src="/src/Icon-images/world-wide-web.png" alt="Website" className="w-4 h-4" />}
                              disabled={destinationGstError || destinationEmailError}
                            />

                            <FloatingInput
                              label="Anniversary"
                              value={destinationData.anniversary}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, anniversary: value }))}
                              type="date"
                              icon={<img src="/src/Icon-images/anniversary.png" alt="Anniversary" className="w-4 h-4" />}
                              disabled={destinationGstError || destinationEmailError}
                            />

                            <FloatingInput
                              label="Birthday"
                              value={destinationData.birthday}
                              onChange={(value) => setDestinationData(prev => ({ ...prev, birthday: value }))}
                              type="date"
                              icon={<img src="/src/Icon-images/birthday.png" alt="Birthday" className="w-4 h-4" />}
                              disabled={destinationGstError || destinationEmailError}
                            />
                          </div>
                        </div>

                        {/* Address Type Section */}
                        <div className="mb-5">
                          <h5 className="text-lg font-semibold text-[#1e293b] mb-3 flex items-center gap-2" style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important' }}>
                            <img src="/src/Icon-images/address.png" alt="Address" className="w-5 h-5" />
                            Type of Address
                          </h5>
                          <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex space-x-6">
                              {['Home', 'Office', 'Other'].map((type) => (
                                <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                                  <input
                                    type="radio"
                                    name="destinationAddressType"
                                    value={type}
                                    checked={destinationData.addressType === type}
                                    onChange={(e) => setDestinationData(prev => ({ ...prev, addressType: e.target.value }))}
                                    className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300"
                                  />
                                  <span className="text-[#64748b] group-hover:text-[#406ab9] transition-colors">{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex space-x-4">
                          <button
                            onClick={() => {
                              setShowDestinationManualForm(false);
                              setShowDestinationSummaryCard(false);
                              // Reset mobile input to allow re-entry
                              setDestinationMobileDigits(['', '', '', '', '', '', '', '', '', '']);
                            }}
                            className="px-6 py-2 border border-gray-300 text-[#64748b] rounded-xl hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDestinationManualFormSave}
                            className="flex-1 bg-[#406ab9] hover:bg-[#3059a0] text-white font-semibold py-2 rounded-xl transition-colors duration-200"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Proceed Button for Step 1 (Destination) */}
                  {(showDestinationSummaryCard && destinationAddressDeliveryConfirmed) && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => {
                          if (!isCurrentStepValid(currentStep)) return;
                          
                          // Mark current step as completed
                          const newCompletedSteps = [...completedSteps];
                          newCompletedSteps[currentStep] = true;
                          setCompletedSteps(newCompletedSteps);
                          
                          // Move to next step
                          if (currentStep < steps.length - 1) {
                            setCurrentStep(currentStep + 1);
                          }
                        }}
                        disabled={!isCurrentStepValid(currentStep)}
                        className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                          isCurrentStepValid(currentStep)
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Proceed to Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}


              {/* Step 3: Shipment Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  

                  {/* Glassmorphism Card - Shipping Details */}
                  <div className="w-full max-w-3xl mx-auto mt-4">
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg" style={{ 
                      backgroundColor: 'white',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: 'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset'
                    }}>
                      
                      {/* Nature of Consignment */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Nature of Consignment</label>
                        <div className="space-y-3">
                          {['DOX', 'NON-DOX'].map((type) => (
                            <label 
                              key={type} 
                              className={`flex items-center space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                                shipmentData.natureOfConsignment === type 
                                  ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                  : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="natureOfConsignment"
                                value={type}
                                checked={shipmentData.natureOfConsignment === type}
                                onChange={(e) => setShipmentData(prev => ({ ...prev, natureOfConsignment: e.target.value }))}
                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-800 text-xs">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Services</label>
                        <div className="space-y-3">
                          {['Standard', 'Priority'].map((service) => (
                            <label 
                              key={service} 
                              className={`flex items-center space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                                shipmentData.services === service 
                                  ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                  : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="services"
                                value={service}
                                checked={shipmentData.services === service}
                                onChange={(e) => setShipmentData(prev => ({ ...prev, services: e.target.value }))}
                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-800 text-xs">
                                {service}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Mode */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Mode</label>
                        <div className="space-y-3">
                          {[
                            { value: 'Air', icon: Plane },
                            { value: 'Surface', icon: Truck },
                            { value: 'Train', icon: Train }
                          ].map(({ value, icon: Icon }) => (
                            <label 
                              key={value} 
                              className={`flex items-center space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                                shipmentData.mode === value 
                                  ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                  : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="mode"
                                value={value}
                                checked={shipmentData.mode === value}
                                onChange={(e) => setShipmentData(prev => ({ ...prev, mode: e.target.value }))}
                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-800 text-xs">
                                {value}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Insurance */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Insurance</label>
                        <div className="space-y-3">
                          <label 
                            className={`flex items-start space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                              shipmentData.insurance === "Consignor not insured the shipment" 
                                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="insurance"
                              value="Consignor not insured the shipment"
                              checked={shipmentData.insurance === "Consignor not insured the shipment"}
                              onChange={(e) => setShipmentData(prev => ({ ...prev, insurance: e.target.value }))}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                            />
                            <span className="text-gray-800 text-xs">
                              Consignor not insured the shipment
                            </span>
                          </label>
                          <label 
                            className={`flex items-start space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                              shipmentData.insurance === "Consignor has insured the shipment" 
                                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="insurance"
                              value="Consignor has insured the shipment"
                              checked={shipmentData.insurance === "Consignor has insured the shipment"}
                              onChange={(e) => setShipmentData(prev => ({ ...prev, insurance: e.target.value }))}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                            />
                            <span className="text-gray-800 text-xs">
                              Consignor has insured the shipment
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Risk Coverage */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Risk Coverage</label>
                        <div className="space-y-3">
                          <label 
                            className={`flex items-center space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                              shipmentData.riskCoverage === "Owner" 
                                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="riskCoverage"
                              value="Owner"
                              checked={shipmentData.riskCoverage === "Owner"}
                              onChange={(e) => setShipmentData(prev => ({ ...prev, riskCoverage: e.target.value }))}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-800 text-xs">
                              Owner
                            </span>
                          </label>
                          <label 
                            className={`flex items-center space-x-2 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                              shipmentData.riskCoverage === "Carrier" 
                                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="riskCoverage"
                              value="Carrier"
                              checked={shipmentData.riskCoverage === "Carrier"}
                              onChange={(e) => setShipmentData(prev => ({ ...prev, riskCoverage: e.target.value }))}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-800 text-xs">
                              Carrier
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Package Information */}
                      <div className="mb-4">
                        <label className="block text-lg font-semibold text-blue-700 mb-4">Package Information</label>
                        
                        {/* Total Number of Packages */}
                        <div className="mb-4">
                          <FloatingInput
                            label="No. of Packages"
                            value={uploadData.totalPackages}
                            onChange={(value) => {
                              setUploadData(prev => ({ ...prev, totalPackages: value.replace(/\D/g, '') }));
                            }}
                            type="number"
                            required
                            icon={<img src="/src/Icon-images/package.png" alt="Package" className="w-4 h-4" />}
                          />
                        </div>

                        {/* Materials */}
                        <div className="mb-4">
                          <FloatingInput
                            label="Materials"
                            value={uploadData.materials}
                            onChange={(value) => {
                              setUploadData(prev => ({ ...prev, materials: value }));
                            }}
                            type="text"
                            required
                            icon={<img src="/src/Icon-images/content.png" alt="Materials" className="w-4 h-4" />}
                          />
                        </div>

                        {/* Content Description */}
                        <div className="mb-4">
                          <FloatingInput
                            label="Description (Said to Contain)"
                            value={uploadData.contentDescription}
                            onChange={(value) => {
                              setUploadData(prev => ({ ...prev, contentDescription: value }));
                              // Reset the blurred state when user starts typing again
                              setIsDescriptionBlurred(false);
                            }}
                            onBlur={() => {
                              // Enable Next button when description loses focus and has value
                              if (uploadData.contentDescription) {
                                setIsDescriptionBlurred(true);
                              }
                            }}
                            type="text"
                            required
                            icon={<img src="/src/Icon-images/content.png" alt="Description" className="w-4 h-4" />}
                          />
                        </div>

                        {/* Uploaded Images Gallery */}
                        {uploadData.packageImages.length > 0 && (
                          <div className="mt-4 mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {uploadData.packageImages.map((fileObj: any) => (
                                <div key={fileObj.id} className="relative group">
                                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200">
                                    <img
                                      src={fileObj.preview}
                                      alt="Package"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  
                                  {/* Action buttons overlay */}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                    {/* Eye/Preview button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewImage(fileObj.preview);
                                        setShowImagePreview(true);
                                      }}
                                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                                      title="Preview"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    
                                    {/* Remove button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadData(prev => ({
                                          ...prev,
                                          packageImages: prev.packageImages.filter((f: any) => f.id !== fileObj.id)
                                        }));
                                      }}
                                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                                      title="Remove"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add More Button - Only show if less than 10 images */}
                              {uploadData.packageImages.length < 10 && (
                                <button
                                  onClick={() => setShowPackageImageModal(true)}
                                  className="w-20 h-16 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all duration-200 flex flex-col items-center justify-center"
                                >
                                  <Plus className="w-4 h-4 text-blue-600 mb-0.5" />
                                  <span className="text-[10px] text-blue-600 font-medium">Add More</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Next Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => {
                              // Show upload modal after clicking Next
                              setShowPackageImageModal(true);
                            }}
                            disabled={!isDescriptionBlurred || !uploadData.totalPackages || !uploadData.materials || !uploadData.contentDescription}
                            className={`px-6 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                              isDescriptionBlurred && uploadData.totalPackages && uploadData.materials && uploadData.contentDescription
                                ? 'bg-[#406ab9] hover:bg-[#3059a0] text-white shadow-md cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {uploadData.packageImages.length > 0 ? '✓ Completed' : 'Next'}
                          </button>
                        </div>

                      </div>

                      {/* Package Dimensions */}
                      <div className={`mb-3 ${uploadData.packageImages.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-lg font-semibold text-blue-700">
                            :: Volumetric Weight :: 
                            {uploadData.packageImages.length === 0 && (
                              <span className="ml-2 text-xs text-red-600 font-normal">(Upload package images first)</span>
                            )}
                          </label>
                          <button
                            onClick={() => setShipmentData(prev => ({
                              ...prev,
                              dimensions: [...prev.dimensions, { length: '', breadth: '', height: '', unit: 'cm' }]
                            }))}
                            disabled={isChargeableFixed || uploadData.packageImages.length === 0}
                            className={`flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors ${(isChargeableFixed || uploadData.packageImages.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Package
                          </button>
                        </div>

                        {/* Dimensions */}
                        <div className="space-y-3">
                          {shipmentData.dimensions.map((dim, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <FloatingInput
                                label="Length"
                                value={dim.length}
                                onChange={(value) => {
                                  const newDimensions = [...shipmentData.dimensions];
                                  newDimensions[index] = { ...newDimensions[index], length: value };
                                  setShipmentData(prev => ({ ...prev, dimensions: newDimensions }));
                                }}
                                type="number"
                                className={`flex-1 ${isChargeableFixed ? 'opacity-50' : ''}`}
                                compact={true}
                                disabled={isChargeableFixed}
                              />
                              <FloatingInput
                                label="Breadth"
                                value={dim.breadth}
                                onChange={(value) => {
                                  const newDimensions = [...shipmentData.dimensions];
                                  newDimensions[index] = { ...newDimensions[index], breadth: value };
                                  setShipmentData(prev => ({ ...prev, dimensions: newDimensions }));
                                }}
                                type="number"
                                className={`flex-1 ${isChargeableFixed ? 'opacity-50' : ''}`}
                                compact={true}
                                disabled={isChargeableFixed}
                              />
                              <FloatingInput
                                label="Height"
                                value={dim.height}
                                onChange={(value) => {
                                  const newDimensions = [...shipmentData.dimensions];
                                  newDimensions[index] = { ...newDimensions[index], height: value };
                                  setShipmentData(prev => ({ ...prev, dimensions: newDimensions }));
                                }}
                                type="number"
                                className={`flex-1 ${isChargeableFixed ? 'opacity-50' : ''}`}
                                compact={true}
                                disabled={isChargeableFixed}
                              />
                              <div className={`w-16 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-xl text-xs text-gray-600 ${isChargeableFixed ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                cm
                              </div>
                              {shipmentData.dimensions.length > 1 && (
                                <button
                                  onClick={() => {
                                    const newDimensions = shipmentData.dimensions.filter((_, i) => i !== index);
                                    setShipmentData(prev => ({ ...prev, dimensions: newDimensions }));
                                  }}
                                  disabled={isChargeableFixed}
                                  className={`h-8 px-2 text-red-600 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-colors ${isChargeableFixed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="mb-0">
                        
                        {/* Weight Inputs - Same Line */}
                        <div className={`mb-4 flex gap-4 ${uploadData.packageImages.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="flex-1">
                            <FloatingInput
                              label="Actual Weight (Kg.)"
                              value={shipmentData.actualWeight}
                              onChange={(value) => setShipmentData(prev => ({ ...prev, actualWeight: value }))}
                              type="number"
                              compact={true}
                              disabled={isChargeableFixed || uploadData.packageImages.length === 0}
                              className={isChargeableFixed ? 'opacity-50' : ''}
                            />
                          </div>
                          <div className="flex-1">
                            <FloatingInput
                              label="Per Kg."
                              value={shipmentData.perKgWeight || ''}
                              onChange={(value) => {
                                // Use the same formatting as details section
                                const formatted = formatIndianNumber(value);
                                setShipmentData(prev => ({ ...prev, perKgWeight: formatted }));
                              }}
                              onBlur={(e) => {
                                // Use the same formatting as details section
                                const formatted = formatIndianNumberWithDecimals(e.target.value);
                                setShipmentData(prev => ({ ...prev, perKgWeight: formatted }));
                              }}
                              type="text"
                              compact={true}
                              disabled={isChargeableFixed || uploadData.packageImages.length === 0}
                              className={`${(shipmentData.perKgWeight && shipmentData.perKgWeight !== "") ? 'pl-4' : ''} ${isChargeableFixed ? 'opacity-50' : ''}`}
                              icon={(shipmentData.perKgWeight && shipmentData.perKgWeight !== "") ? (
                                <span className="text-gray-500 text-base pr-1">₹</span>
                              ) : undefined}
                            />
                          </div>
                        </div>

                        {/* Weight Results - Compact Horizontal Layout */}
                        <div className={`grid grid-cols-4 gap-2 ${uploadData.packageImages.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className={`bg-white rounded-xl py-2 px-2.5 border border-blue-200 ${isChargeableFixed ? 'opacity-50' : ''}`}>
                            <div className="text-xs text-gray-600 mb-0.5">Volumetric</div>
                            <div className="text-sm font-semibold text-blue-600">{calculateVolumetricWeight()} Kg.</div>
                          </div>
                          <div className={`bg-white rounded-xl py-2 px-2.5 border border-blue-200 ${isChargeableFixed ? 'opacity-50' : ''}`}>
                            <div className="text-xs text-gray-600 mb-0.5">Actual</div>
                            <div className="text-sm font-semibold text-blue-600">{shipmentData.actualWeight || 0} Kg.</div>
                          </div>
                          <div className={`bg-white rounded-xl py-2 px-2.5 border border-blue-400 bg-blue-50 ${isChargeableFixed ? 'opacity-50' : ''}`}>
                            <div className="text-xs text-gray-700 font-medium mb-0.5">Chargeable</div>
                            <div className="text-sm font-bold text-blue-700">{calculateChargeableWeight()} Kg.</div>
                          </div>
                          <button
                            onClick={() => setIsChargeableFixed(!isChargeableFixed)}
                            disabled={uploadData.packageImages.length === 0}
                            className={`rounded-xl py-2 px-2.5 border-2 transition-all duration-200 ${
                              uploadData.packageImages.length === 0
                                ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                                : isChargeableFixed 
                                  ? 'bg-[#22C55E] border-[#22C55E] text-white' 
                                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-[#22C55E] hover:border-[#22C55E] hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-medium mb-0.5">Chargeable</div>
                            <div className="text-sm font-bold">Fix</div>
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Proceed Button for Step 2 (Shipment Details) */}
              {currentStep === 2 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (!isCurrentStepValid(currentStep)) return;
                      
                      // Mark current step as completed
                      const newCompletedSteps = [...completedSteps];
                      newCompletedSteps[currentStep] = true;
                      setCompletedSteps(newCompletedSteps);
                      
                      // Move to next step
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={!isCurrentStepValid(currentStep)}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                      isCurrentStepValid(currentStep)
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Proceed to Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 4: Upload Section - Enhanced */}
              {currentStep === 3 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  

                  {/* Glassmorphism Card - Upload Details */}
                  <div className="w-full max-w-3xl mx-auto mt-4">
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg" style={{ 
                      backgroundColor: 'white',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: 'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset'
                    }}>
                      
                      {/* Invoice Information */}
                      <div className={`mb-4 relative ${uploadData.packageImages.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="block text-lg font-semibold text-blue-700 mb-4">
                          Invoice Information
                          {uploadData.packageImages.length === 0 && (
                            <span className="ml-2 text-xs text-red-600 font-normal">(Upload package images first)</span>
                          )}
                        </label>
                        
                        {/* Invoice Number */}
                        <div className="mb-4">
                          <FloatingInput
                            label="Invoice Number"
                            value={uploadData.invoiceNumber}
                            onChange={(value) => setUploadData(prev => ({ ...prev, invoiceNumber: value }))}
                            required
                            disabled={uploadData.packageImages.length === 0}
                            icon={<img src="/src/Icon-images/invoice.png" alt="Invoice" className="w-4 h-4" />}
                          />
                        </div>
                        
                        {/* Invoice Value */}
                        <div className="mb-4">
                          <FloatingInput
                            label="Declared Value"
                            value={uploadData.invoiceValue}
                            onChange={(value) => {
                              // Remove all non-numeric characters except decimal point
                              const numericValue = value.replace(/[^\d.]/g, '');
                              // Format with Indian number system (commas)
                              const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                              setUploadData(prev => ({ ...prev, invoiceValue: formattedValue }));
                            }}
                            type="text"
                            required
                            disabled={uploadData.packageImages.length === 0}
                            icon={<IndianRupee className="w-4 h-4" />}
                          />
                        </div>

                        {/* Conditional E-Waybill */}
                        {parseInvoiceValue(uploadData.invoiceValue) >= 50000 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <div className="flex items-center mb-3">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                              <span className="text-sm font-medium text-yellow-800">E-Waybill Required (12 digits)</span>
                            </div>
                            
                            {/* E-Waybill Digit Input Boxes */}
                            <div className="flex gap-1 flex-wrap justify-start">
                              {eWaybillDigits.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`ewaybill-digit-${index}`}
                                  type="text"
                                  value={digit}
                                  onChange={(e) => handleEWaybillDigitChange(index, e.target.value)}
                                  onKeyDown={(e) => handleEWaybillDigitKeyDown(index, e)}
                                  disabled={uploadData.packageImages.length === 0}
                                  className="w-10 h-10 text-center text-sm font-semibold border-2 border-yellow-300 rounded-xl bg-white focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  maxLength={1}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Upload Documents Section */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Upload Documents</label>
                          <div className="space-y-3">
                            {/* Upload Invoice Images */}
                            <UploadBox
                              label="Invoice Images"
                              files={uploadData.invoiceImages}
                              onFilesChange={(files) => setUploadData(prev => ({ ...prev, invoiceImages: files }))}
                              onPreview={(fileUrl) => {
                                setPreviewImage(fileUrl);
                                setShowImagePreview(true);
                              }}
                              compressImage={compressImage}
                            />
                            
                            {/* Upload PAN */}
                            <UploadBox
                              label="PAN Card"
                              files={uploadData.panImages}
                              onFilesChange={(files) => setUploadData(prev => ({ ...prev, panImages: files }))}
                              onPreview={(fileUrl) => {
                                setPreviewImage(fileUrl);
                                setShowImagePreview(true);
                              }}
                              compressImage={compressImage}
                            />
                            
                            {/* Upload Declaration */}
                            <UploadBox
                              label="Declaration Form"
                              files={uploadData.declarationImages}
                              onFilesChange={(files) => setUploadData(prev => ({ ...prev, declarationImages: files }))}
                              onPreview={(fileUrl) => {
                                setPreviewImage(fileUrl);
                                setShowImagePreview(true);
                              }}
                              compressImage={compressImage}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Terms & Conditions */}
                      <div className={`mb-0 ${uploadData.packageImages.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-start space-x-3 bg-white rounded-xl py-3 px-4">
                          <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={uploadData.acceptTerms}
                            onChange={(e) => setUploadData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                            className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300 rounded mt-0.5"
                            required
                            disabled={uploadData.packageImages.length === 0}
                          />
                          <label htmlFor="acceptTerms" className="text-sm text-[#1e293b]">
                            I accept the{' '}
                            <a href="#" className="text-[#406ab9] hover:text-[#3059a0] underline">
                              Terms & Conditions
                            </a>
                            {' '}and confirm that all information is accurate.
                          </label>
                        </div>
                        {!uploadData.acceptTerms && (
                          <p className="text-xs text-red-600 mt-2 ml-7">
                            * Required to proceed
                          </p>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* Proceed Button for Step 3 (Upload) */}
              {currentStep === 3 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (!isCurrentStepValid(currentStep)) return;
                      
                      // Mark current step as completed
                      const newCompletedSteps = [...completedSteps];
                      newCompletedSteps[currentStep] = true;
                      setCompletedSteps(newCompletedSteps);
                      
                      // Move to next step
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={!isCurrentStepValid(currentStep)}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                      isCurrentStepValid(currentStep)
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Proceed to Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {currentStep === 4 ? (
                  /* Bill Page - Compressed Single Card */
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {/* Glassmorphism Card - Bill Details */}
                    <div className="w-full max-w-3xl mx-auto mt-4">
                      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg" style={{ 
                        backgroundColor: 'white',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset'
                      }}>
                        
                        {/* Party Selection */}
                        <div className="mb-6">
                          <label className="block text-lg font-semibold text-blue-700 mb-4">Party</label>
                          <div className="flex flex-wrap gap-4 justify-center">
                            {['sender', 'recipient', 'other'].map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setBillData(prev => ({ ...prev, partyType: type }));
                                  setShowOtherPartyForm(type === 'other');
                                }}
                                className={`
                                  px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm
                                  ${billData.partyType === type
                                    ? 'bg-[#406ab9] text-white shadow-md scale-105'
                                    : 'bg-white text-[#64748b] hover:bg-[#406ab9]/10 hover:text-[#406ab9] hover:shadow-md'
                                  }
                                `}
                                style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui' }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </button>
                            ))}
                          </div>
                          {billData.partyType && billData.partyType !== 'other' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 text-center"
                            >
                              <div className="inline-flex items-center px-4 py-2 bg-[#406ab9]/10 text-[#406ab9] rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Selected: {billData.partyType.charAt(0).toUpperCase() + billData.partyType.slice(1)}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Other Party Details Form */}
                        <AnimatePresence>
                          {showOtherPartyForm && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mb-6"
                            >
                              <label className="block text-lg font-semibold text-blue-700 mb-4">Other Party Details</label>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput
                                  label="Concern Name"
                                  value={billData.otherPartyDetails.concernName}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, concernName: value }
                                  }))}
                                  required
                                  icon={<User className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="Company Name"
                                  value={billData.otherPartyDetails.companyName}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, companyName: value }
                                  }))}
                                  required
                                  icon={<Building className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="Phone No."
                                  value={billData.otherPartyDetails.phoneNumber}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, phoneNumber: value }
                                  }))}
                                  required
                                  maxLength={10}
                                  icon={<Phone className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="PINCode"
                                  value={billData.otherPartyDetails.pincode}
                                  onChange={(value) => {
                                    setBillData(prev => ({
                                      ...prev,
                                      otherPartyDetails: { ...prev.otherPartyDetails, pincode: value }
                                    }));
                                    if (value.length === 6) {
                                      autoFillOtherPartyFromPincode(value);
                                    }
                                  }}
                                  required
                                  maxLength={6}
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="State"
                                  value={billData.otherPartyDetails.state}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, state: value }
                                  }))}
                                  disabled
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="City"
                                  value={billData.otherPartyDetails.city}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, city: value }
                                  }))}
                                  disabled
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="District"
                                  value={billData.otherPartyDetails.district}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, district: value }
                                  }))}
                                  disabled
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                {/* Area Dropdown */}
                                <div className="relative">
                                  <select
                                    value={billData.otherPartyDetails.area}
                                    onChange={(e) => setBillData(prev => ({
                                      ...prev,
                                      otherPartyDetails: { ...prev.otherPartyDetails, area: e.target.value }
                                    }))}
                                    disabled={otherPartyAreas.length === 0}
                                    className={`
                                      w-full h-10 px-3 pl-10 pr-10 border rounded-xl bg-white/90 backdrop-blur-sm
                                      transition-all duration-200 ease-in-out text-sm
                                      ${otherPartyAreas.length === 0
                                        ? 'border-gray-300/60 cursor-not-allowed bg-gray-50'
                                        : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-md focus:outline-none focus:border-[#406ab9] focus:ring-2 focus:ring-[#4ec0f7]/20'
                                      }
                                      text-[#1e293b] appearance-none
                                    `}
                                    style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui' }}
                                  >
                                    <option value="">Select Area</option>
                                    {otherPartyAreas.map((area, idx) => (
                                      <option key={idx} value={area}>{area}</option>
                                    ))}
                                  </select>
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronRight className="w-5 h-5 text-[#64748b] rotate-90" />
                                  </div>
                                  <label
                                    className={`
                                      absolute left-12 top-0 -translate-y-1/2 text-xs bg-white px-2 text-[#406ab9] font-medium
                                      pointer-events-none select-none
                                    `}
                                    style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui' }}
                                  >
                                    Area<span className="text-red-500 ml-1">*</span>
                                  </label>
                                </div>
                                
                                <FloatingInput
                                  label="Locality / Street"
                                  value={billData.otherPartyDetails.locality}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, locality: value }
                                  }))}
                                  required
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="Building / Flat No."
                                  value={billData.otherPartyDetails.flatBuilding}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, flatBuilding: value }
                                  }))}
                                  required
                                  icon={<Building className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="Landmark"
                                  value={billData.otherPartyDetails.landmark}
                                  onChange={(value) => setBillData(prev => ({
                                    ...prev,
                                    otherPartyDetails: { ...prev.otherPartyDetails, landmark: value }
                                  }))}
                                  required
                                  icon={<MapPin className="w-4 h-4" />}
                                />
                                
                                <FloatingInput
                                  label="GST"
                                  value={billData.otherPartyDetails.gstNumber}
                                  onChange={(value) => {
                                    const formattedGST = validateGSTFormat(value);
                                    setBillData(prev => ({
                                      ...prev,
                                      otherPartyDetails: { ...prev.otherPartyDetails, gstNumber: formattedGST }
                                    }));
                                    // Validate GST: if partially filled (1-14 chars), show error
                                    if (formattedGST.length > 0 && formattedGST.length < 15) {
                                      setOtherPartyGstError(true);
                                    } else {
                                      setOtherPartyGstError(false);
                                    }
                                  }}
                                  required
                                  maxLength={15}
                                  icon={<FileText className="w-4 h-4" />}
                                  hasValidationError={otherPartyGstError}
                                  validationErrorMessage={otherPartyGstError ? "Please complete the 15-digit GST number or leave it empty" : ""}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Bill Type */}
                        <div className="mb-4">
                          <label className="block text-lg font-semibold text-blue-700 mb-4">Bill Type</label>
                          <div className="relative">
                            <select
                              value={billData.billType}
                              onChange={(e) => setBillData(prev => ({ ...prev, billType: e.target.value }))}
                              className="w-full h-12 px-4 pr-10 border border-gray-300/60 rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-200 text-sm text-[#1e293b] hover:border-[#406ab9]/50 hover:shadow-md focus:outline-none focus:border-[#406ab9] focus:ring-2 focus:ring-[#4ec0f7]/20 cursor-pointer appearance-none"
                              style={{ fontFamily: 'Calibri, ui-sans-serif, system-ui' }}
                            >
                              <option value="" disabled>Select Bill Type</option>
                              <option value="normal">Normal GST</option>
                              <option value="rcm">RCM (Reverse Charge Mechanism)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <ChevronRight className="w-5 h-5 text-[#64748b] rotate-90" />
                            </div>
                          </div>
                          {billData.billType && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 text-center"
                            >
                              <div className="inline-flex items-center px-4 py-2 bg-[#406ab9]/10 text-[#406ab9] rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Selected: {billData.billType === 'normal' ? 'Normal GST' : 'RCM'}
                              </div>
                            </motion.div>
                          )}
                        </div>
                        
                      </div>
                    </div>
                  </motion.div>
                ) : null}

              {/* Proceed Button for Step 4 (Bill) */}
              {currentStep === 4 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (!isCurrentStepValid(currentStep)) return;
                      
                      // Mark current step as completed
                      const newCompletedSteps = [...completedSteps];
                      newCompletedSteps[currentStep] = true;
                      setCompletedSteps(newCompletedSteps);
                      
                      // Move to next step
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={!isCurrentStepValid(currentStep)}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                      isCurrentStepValid(currentStep)
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Proceed to Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {currentStep === 5 ? (
                    /* Details Page */
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      {/* Glassmorphism Card - Details */}
                      <div className="w-full max-w-3xl mx-auto mt-4">
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg" style={{ 
                          backgroundColor: 'white',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset'
                        }}>
                          
                          <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-blue-700" />
                            <label className="text-lg font-semibold text-blue-700">Details</label>
                          </div>
                          
                          {/* Charges Grid - Two Column Layout */}
                          <div className="space-y-1.5 mb-3 ml-6">
                            {/* Freight Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">
                                Freight Charge
                                {shipmentData.perKgWeight && !isChargeableFixed && (
                                  <span className="ml-2 text-xs text-green-600 font-normal">(Auto-calculated)</span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={detailsData.freightCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, freightCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, freightCharge: formatted }));
                                }}
                                placeholder="0.00"
                                disabled={shipmentData.perKgWeight && !isChargeableFixed}
                                className={`w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 transition-all ${
                                  shipmentData.perKgWeight && !isChargeableFixed 
                                    ? 'opacity-60 cursor-not-allowed' 
                                    : 'hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb]'
                                }`}
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* AWB Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">AWB Charge</label>
                              <input
                                type="text"
                                value={detailsData.awbCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, awbCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, awbCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Local Collection */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Local Collection</label>
                              <input
                                type="text"
                                value={detailsData.localCollection}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, localCollection: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, localCollection: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Door Delivery */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Door Delivery</label>
                              <input
                                type="text"
                                value={detailsData.doorDelivery}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, doorDelivery: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, doorDelivery: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Loading & Unloading */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Loading & Unloading</label>
                              <input
                                type="text"
                                value={detailsData.loadingUnloading}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, loadingUnloading: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, loadingUnloading: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Demurrage Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Demurrage Charge</label>
                              <input
                                type="text"
                                value={detailsData.demurrageCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, demurrageCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, demurrageCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* DDA Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">ODA Charge</label>
                              <input
                                type="text"
                                value={detailsData.ddaCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, ddaCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, ddaCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Hamali Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Hamali Charge</label>
                              <input
                                type="text"
                                value={detailsData.hamaliCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, hamaliCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, hamaliCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Packing Charge */}
                            <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Packing Charge</label>
                              <input
                                type="text"
                                value={detailsData.packingCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, packingCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, packingCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Other Charge */}
                            <div className="flex items-center justify-between gap-1">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Other Charge</label>
                              <input
                                type="text"
                                value={detailsData.otherCharge}
                                onChange={(e) => {
                                  const formatted = formatIndianNumber(e.target.value);
                                  setDetailsData(prev => ({ ...prev, otherCharge: formatted }));
                                }}
                                onBlur={(e) => {
                                  const formatted = formatIndianNumberWithDecimals(e.target.value);
                                  setDetailsData(prev => ({ ...prev, otherCharge: formatted }));
                                }}
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] focus:outline-none focus:bg-[#f9f5fb] transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>

                            {/* Total (before fuel) */}
                            <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-300 border-b border-gray-400 mt-2">
                              <label className="text-sm font-semibold text-gray-800 w-1/2 py-2">Total</label>
                              <input
                                type="text"
                                value={(() => {
                                  const parseFormattedNumber = (value: string): number => {
                                    if (!value) return 0;
                                    return parseFloat(value.replace(/,/g, '')) || 0;
                                  };
                                  
                                  const freight = parseFormattedNumber(detailsData.freightCharge);
                                  const awb = parseFormattedNumber(detailsData.awbCharge);
                                  const localCollection = parseFormattedNumber(detailsData.localCollection);
                                  const doorDelivery = parseFormattedNumber(detailsData.doorDelivery);
                                  const loadingUnloading = parseFormattedNumber(detailsData.loadingUnloading);
                                  const fov = parseFormattedNumber(detailsData.demurrageCharge);
                                  const dda = parseFormattedNumber(detailsData.ddaCharge);
                                  const hamali = parseFormattedNumber(detailsData.hamaliCharge);
                                  const packing = parseFormattedNumber(detailsData.packingCharge);
                                  const other = parseFormattedNumber(detailsData.otherCharge);
                                  
                                  const subtotal = freight + awb + localCollection + doorDelivery + loadingUnloading + fov + dda + hamali + packing + other;
                                  return subtotal > 0 ? formatIndianNumberWithDecimals(subtotal.toString()) : '0.00';
                                })()}
                                readOnly
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-blue-50 text-right text-sm font-semibold text-gray-800 cursor-not-allowed transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>
                          </div>

                          {/* Fuel Charge - Dropdown and Amount Display */}
                          <div className="mb-3 ml-6 mt-3">
                            <div className="flex items-center gap-1">
                              <label className="text-sm font-medium text-gray-700 w-1/2 py-2">Fuel Charge</label>
                              <div className="w-1/2 flex items-center gap-4">
                              {!showCustomFuelCharge ? (
                                <div className="relative w-1/2">
                                  <select
                                    value={detailsData.fuelCharge}
                                    onChange={(e) => {
                                      if (e.target.value === 'other') {
                                        setShowCustomFuelCharge(true);
                                        setDetailsData(prev => ({ ...prev, fuelCharge: '', fuelChargeType: 'custom' }));
                                      } else {
                                        setDetailsData(prev => ({ ...prev, fuelCharge: e.target.value, fuelChargeType: 'percentage' }));
                                      }
                                    }}
                                    className="w-full h-10 px-4 pr-10 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:shadow-sm focus:outline-none focus:border-[#406ab9] focus:ring-2 focus:ring-[#4ec0f7]/20 cursor-pointer appearance-none transition-all"
                                    style={{ fontFamily: 'system-ui' }}
                                  >
                                    <option value="">Select %</option>
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="10">10%</option>
                                    <option value="15">15%</option>
                                    <option value="20">20%</option>
                                    <option value="other">Other</option>
                                  </select>
                                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronRight className="w-5 h-5 text-[#64748b] rotate-90" />
                                  </div>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={detailsData.fuelCharge}
                                  onChange={(e) => setDetailsData(prev => ({ ...prev, fuelCharge: e.target.value }))}
                                  placeholder="Enter %"
                                  className="w-1/2 h-10 px-4 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:shadow-sm focus:outline-none focus:border-[#406ab9] focus:ring-2 focus:ring-[#4ec0f7]/20 transition-all"
                                  style={{ fontFamily: 'system-ui' }}
                                />
                              )}
                              
                              {/* Fuel Charge Amount Display */}
                              <input
                                type="text"
                                value={(() => {
                                  // Calculate fuel charge amount
                                  const parseFormattedNumber = (value: string): number => {
                                    if (!value) return 0;
                                    return parseFloat(value.replace(/,/g, '')) || 0;
                                  };
                                  
                                  const freight = parseFormattedNumber(detailsData.freightCharge);
                                  const awb = parseFormattedNumber(detailsData.awbCharge);
                                  const localCollection = parseFormattedNumber(detailsData.localCollection);
                                  const doorDelivery = parseFormattedNumber(detailsData.doorDelivery);
                                  const loadingUnloading = parseFormattedNumber(detailsData.loadingUnloading);
                                  const fov = parseFormattedNumber(detailsData.demurrageCharge);
                                  const dda = parseFormattedNumber(detailsData.ddaCharge);
                                  const hamali = parseFormattedNumber(detailsData.hamaliCharge);
                                  const packing = parseFormattedNumber(detailsData.packingCharge);
                                  const other = parseFormattedNumber(detailsData.otherCharge);
                                  
                                  const subtotal = freight + awb + localCollection + doorDelivery + loadingUnloading + fov + dda + hamali + packing + other;
                                  
                                  if (detailsData.fuelCharge) {
                                    const fuelPercentage = parseFloat(detailsData.fuelCharge);
                                    if (!isNaN(fuelPercentage) && fuelPercentage > 0) {
                                      const fuelAmount = (subtotal * fuelPercentage) / 100;
                                      return fuelAmount > 0 ? formatIndianNumberWithDecimals(fuelAmount.toString()) : '0.00';
                                    }
                                  }
                                  return '0.00';
                                })()}
                                readOnly
                                placeholder="0.00"
                                className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] cursor-not-allowed focus:outline-none transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                              </div>
                            </div>
                            
                            {/* Total with Fuel Charge */}
                            <div className="mt-2 pt-2 border-t border-gray-300 border-b border-gray-400">
                              <div className="flex items-center justify-between gap-1">
                                <label className="text-sm font-semibold text-gray-800 w-1/2 py-2">Total (with Fuel)</label>
                                <input
                                  type="text"
                                  value={detailsData.total}
                                  readOnly
                                  placeholder="0.00"
                                  className="w-1/2 h-10 px-2 bg-gray-50 text-right text-sm font-semibold text-gray-800 cursor-not-allowed transition-all"
                                  style={{ fontFamily: 'system-ui' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* GST Section */}
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="flex items-center gap-3 mb-3">
                              <IndianRupee className="w-6 h-6 text-blue-700" />
                              <label className="text-lg font-semibold text-blue-700">GST</label>
                            </div>
                            
                            <div className="space-y-1.5 ml-6">
                              {/* SGST */}
                              <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                                <div className="flex items-center gap-2 w-1/2 py-2">
                                  <label className="text-sm font-medium text-gray-700">SGST</label>
                                  <span className="text-xs text-gray-500">(9%)</span>
                                </div>
                                <input
                                  type="text"
                                  value={detailsData.sgstAmount}
                                  readOnly
                                  placeholder="0.00"
                                  className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] cursor-not-allowed focus:outline-none transition-all"
                                  style={{ fontFamily: 'system-ui' }}
                                />
                              </div>

                              {/* CGST */}
                              <div className="flex items-center justify-between gap-1 border-b border-gray-300">
                                <div className="flex items-center gap-2 w-1/2 py-2">
                                  <label className="text-sm font-medium text-gray-700">CGST</label>
                                  <span className="text-xs text-gray-500">(9%)</span>
                                </div>
                                <input
                                  type="text"
                                  value={detailsData.cgstAmount}
                                  readOnly
                                  placeholder="0.00"
                                  className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] cursor-not-allowed focus:outline-none transition-all"
                                  style={{ fontFamily: 'system-ui' }}
                                />
                              </div>

                              {/* IGST */}
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-2 w-1/2 py-2">
                                  <label className="text-sm font-medium text-gray-700">IGST</label>
                                  <span className="text-xs text-gray-500">(18%)</span>
                                </div>
                                <input
                                  type="text"
                                  value={detailsData.igstAmount}
                                  readOnly
                                  placeholder="0.00"
                                  className="w-1/2 h-10 px-2 bg-transparent text-right text-sm text-gray-700 hover:bg-[#f9f5fb] cursor-not-allowed focus:outline-none transition-all"
                                  style={{ fontFamily: 'system-ui' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Grand Total Section */}
                          <div className="mt-4 pt-4 border-t-2 border-gray-400">
                            <div className="flex items-center justify-between gap-1">
                              <label className="text-lg font-bold text-gray-900 w-1/2">Grand Total</label>
                              <input
                                type="text"
                                value={detailsData.grandTotal}
                                readOnly
                                placeholder="0.00"
                                className="w-1/2 h-12 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 text-right text-base font-bold text-[#406ab9] cursor-not-allowed shadow-sm transition-all"
                                style={{ fontFamily: 'system-ui' }}
                              />
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

              {/* Proceed Button for Step 5 (Details) */}
              {currentStep === 5 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (!isCurrentStepValid(currentStep)) return;
                      
                      // Mark current step as completed
                      const newCompletedSteps = [...completedSteps];
                      newCompletedSteps[currentStep] = true;
                      setCompletedSteps(newCompletedSteps);
                      
                      // Move to next step
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={!isCurrentStepValid(currentStep)}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                      isCurrentStepValid(currentStep)
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Proceed to Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {currentStep === 6 ? (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="mb-6">
                          <p className="text-[#64748b] mt-1">Choose your preferred payment method</p>
                        </div>

                        <div className="bg-gradient-to-r from-[#406ab9]/5 to-[#4ec0f7]/5 rounded-2xl p-8 border border-[#406ab9]/20">
                          <h4 className="text-lg font-semibold text-[#1e293b] mb-6 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 mr-3 text-[#406ab9]" />
                            Select Payment Method
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                            {/* Cash Payment */}
                            <label className="flex flex-col items-center space-y-3 cursor-pointer group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#406ab9] hover:bg-[#406ab9]/5 transition-all duration-300">
                              <input
                                type="radio"
                                name="paymentMode"
                                value="Cash"
                                checked={paymentData.mode === "Cash"}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, mode: e.target.value }))}
                                className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300"
                              />
                              <div className="text-center">
                                <div className="w-12 h-12 bg-[#406ab9]/10 rounded-full flex items-center justify-center mb-2 mx-auto group-hover:bg-[#406ab9]/20 transition-colors">
                                  <DollarSign className="w-6 h-6 text-[#406ab9]" />
                                </div>
                                <span className="text-base font-semibold text-[#1e293b] group-hover:text-[#406ab9] transition-colors">
                                  Cash
                                </span>
                                <p className="text-xs text-[#64748b] mt-1">Pay in cash on delivery</p>
                              </div>
                            </label>

                            {/* Online/UPI/FP Payment */}
                            <label className="flex flex-col items-center space-y-3 cursor-pointer group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#4ec0f7] hover:bg-[#4ec0f7]/5 transition-all duration-300">
                              <input
                                type="radio"
                                name="paymentMode"
                                value="To Pay"
                                checked={paymentData.mode === "To Pay"}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, mode: e.target.value }))}
                                className="w-4 h-4 text-[#4ec0f7] focus:ring-[#406ab9] border-gray-300"
                              />
                              <div className="text-center">
                                <div className="w-12 h-12 bg-[#4ec0f7]/10 rounded-full flex items-center justify-center mb-2 mx-auto group-hover:bg-[#4ec0f7]/20 transition-colors">
                                  <CreditCard className="w-6 h-6 text-[#4ec0f7]" />
                                </div>
                                <span className="text-base font-semibold text-[#1e293b] group-hover:text-[#4ec0f7] transition-colors">
                                  To Pay
                                </span>
                                <p className="text-xs text-[#64748b] mt-1">Digital payment methods</p>
                              </div>
                            </label>
                          </div>

                          {/* Payment Selection Indicator */}
                          {paymentData.mode && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 text-center"
                            >
                              <div className="inline-flex items-center px-4 py-2 bg-[#406ab9]/10 text-[#406ab9] rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Payment: {paymentData.mode}
                              </div>
                            </motion.div>
                          )}

                          {/* Delivery Type Section */}
                          <div className="mt-8">
                            <h4 className="text-lg font-semibold text-[#1e293b] mb-6 flex items-center justify-center">
                              <Truck className="w-6 h-6 mr-3 text-[#406ab9]" />
                              Delivery Type
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                              {/* Godown Delivery */}
                              <label className="flex flex-col items-center space-y-3 cursor-pointer group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#406ab9] hover:bg-[#406ab9]/5 transition-all duration-300">
                                <input
                                  type="radio"
                                  name="deliveryType"
                                  value="Godown Delivery"
                                  checked={paymentData.deliveryType === "Godown Delivery"}
                                  onChange={(e) => setPaymentData(prev => ({ ...prev, deliveryType: e.target.value }))}
                                  className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300"
                                />
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-[#406ab9]/10 rounded-full flex items-center justify-center mb-2 mx-auto group-hover:bg-[#406ab9]/20 transition-colors">
                                    <Building className="w-6 h-6 text-[#406ab9]" />
                                  </div>
                                  <span className="text-base font-semibold text-[#1e293b] group-hover:text-[#406ab9] transition-colors">
                                    Godown Delivery
                                  </span>
                                  <p className="text-xs text-[#64748b] mt-1">Deliver to warehouse/godown</p>
                                </div>
                              </label>

                              {/* Door Delivery */}
                              <label className="flex flex-col items-center space-y-3 cursor-pointer group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#4ec0f7] hover:bg-[#4ec0f7]/5 transition-all duration-300">
                                <input
                                  type="radio"
                                  name="deliveryType"
                                  value="Door Delivery"
                                  checked={paymentData.deliveryType === "Door Delivery"}
                                  onChange={(e) => setPaymentData(prev => ({ ...prev, deliveryType: e.target.value }))}
                                  className="w-4 h-4 text-[#4ec0f7] focus:ring-[#406ab9] border-gray-300"
                                />
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-[#4ec0f7]/10 rounded-full flex items-center justify-center mb-2 mx-auto group-hover:bg-[#4ec0f7]/20 transition-colors">
                                    <Truck className="w-6 h-6 text-[#4ec0f7]" />
                                  </div>
                                  <span className="text-base font-semibold text-[#1e293b] group-hover:text-[#4ec0f7] transition-colors">
                                    Door Delivery
                                  </span>
                                  <p className="text-xs text-[#64748b] mt-1">Deliver to recipient's address</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Delivery Selection Indicator */}
                          {paymentData.deliveryType && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 text-center"
                            >
                              <div className="inline-flex items-center px-4 py-2 bg-[#4ec0f7]/10 text-[#4ec0f7] rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Delivery: {paymentData.deliveryType}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ) : null}

              {/* Complete Booking Button for Step 6 (Mode of Payment) */}
              {currentStep === 6 && (
                <div className="mt-6">

                  {/* Validation Message */}
                  {!isCurrentStepValid(currentStep) && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Please complete the following:
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc list-inside space-y-1">
                              {!paymentData.mode && <li>Select a payment mode (Cash or To Pay)</li>}
                              {!paymentData.deliveryType && <li>Select a delivery type (Godown Delivery or Door Delivery)</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {submitError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error submitting booking
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{submitError}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (!isCurrentStepValid(currentStep)) return;
                      
                      // Mark current step as completed
                      const newCompletedSteps = [...completedSteps];
                      newCompletedSteps[currentStep] = true;
                      setCompletedSteps(newCompletedSteps);
                      
                      // Show invoice modal for confirmation before submitting
                      setShowInvoiceModal(true);
                    }}
                    disabled={!isCurrentStepValid(currentStep) || submitLoading}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center ${
                      isCurrentStepValid(currentStep) && !submitLoading
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {submitLoading ? 'Submitting...' : 'Complete Booking'}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </button>
                  </div>
                </div>
              )}


              {currentStep === 7 && isBookingSubmitted ? (
                <BookingConfirmation
                  bookingData={{
                    originData,
                    destinationData,
                    shipmentData,
                    uploadData,
                    billData,
                    paymentData,
                    detailsData
                  }}
                  customerId={generatedCustomerId}
                  onBookMore={() => {
                    // Reset all booking states
                    setShowStepper(false);
                    setCurrentStep(0);
                    setCompletedSteps([false, false, false, false, false, false, false, false]);
                    
                    // Reset all form data
                    setOriginData({
                      mobileNumber: '',
                      name: '',
                      companyName: '',
                      email: '',
                      locality: '',
                      flatBuilding: '',
                      landmark: '',
                      pincode: '',
                      area: '',
                      city: '',
                      district: '',
                      state: '',
                      gstNumber: '',
                      alternateNumbers: [''],
                      addressType: 'Home',
                      birthday: '',
                      anniversary: '',
                      otherAlternateNumber: '',
                      showOtherAlternateNumber: false,
                      website: ''
                    });
                    
                    setDestinationData({
                      mobileNumber: '',
                      name: '',
                      companyName: '',
                      email: '',
                      locality: '',
                      flatBuilding: '',
                      landmark: '',
                      pincode: '',
                      area: '',
                      city: '',
                      district: '',
                      state: '',
                      gstNumber: '',
                      alternateNumbers: [''],
                      addressType: 'Home',
                      website: '',
                      anniversary: '',
                      birthday: ''
                    });
                    
                    setShipmentData({
                      natureOfConsignment: 'NON-DOX',
                      services: 'Standard',
                      mode: 'Air',
                      insurance: 'Consignor not insured the shipment',
                      riskCoverage: 'Owner',
                      dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
                      actualWeight: '',
                      perKgWeight: '',
                      volumetricWeight: 0,
                      chargeableWeight: 0
                    });
                    
                    setUploadData({
                      totalPackages: '',
                      materials: '',
                      packageImages: [],
                      contentDescription: '',
                      invoiceNumber: '',
                      invoiceValue: '',
                      invoiceImages: [],
                      panImages: [],
                      declarationImages: [],
                      eWaybillNumber: '',
                      acceptTerms: false
                    });
                    
                    setPaymentData({
                      mode: '',
                      deliveryType: ''
                    });
                    
                    setBillData({
                      partyType: '',
                      otherPartyDetails: {
                        concernName: '',
                        companyName: '',
                        phoneNumber: '',
                        locality: '',
                        flatBuilding: '',
                        landmark: '',
                        pincode: '',
                        area: '',
                        city: '',
                        district: '',
                        state: '',
                        gstNumber: ''
                      },
                      billType: ''
                    });
                    
                    setDetailsData({
                      freightCharge: '',
                      awbCharge: '',
                      localCollection: '',
                      doorDelivery: '',
                      loadingUnloading: '',
                      demurrageCharge: '',
                      ddaCharge: '',
                      hamaliCharge: '',
                      packingCharge: '',
                      otherCharge: '',
                      total: '',
                      fuelCharge: '',
                      fuelChargeType: 'percentage',
                      sgstAmount: '',
                      cgstAmount: '',
                      igstAmount: '',
                      grandTotal: ''
                    });
                    
                    // Reset all other states
                    setMobileDigits(Array(10).fill(''));
                    setDestinationMobileDigits(Array(10).fill(''));
                    setUserFound(null);
                    setDestinationUserFound(null);
                    setShowManualForm(false);
                    setShowDestinationManualForm(false);
                    setShowSummaryCard(false);
                    setShowDestinationSummaryCard(false);
                    setAddressDeliveryConfirmed(false);
                    setDestinationAddressDeliveryConfirmed(false);
                    setOtpVerified(false);
                    setShowOTPVerification(false);
                    setGeneratedCustomerId('');
                    setIsBookingSubmitted(false);
                    
                    // Reset all form data
                    resetAllFormData();
                  }}
                  onViewInvoice={() => setShowInvoiceModal(true)}
                />
              ) : (
                showStepper && currentStep === 7 && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#406ab9] mb-4"></div>
                    <p className="text-lg text-gray-600">Processing your booking...</p>
                  </div>
                )
              )}

              {/* Step 6: Mode of Payment has a "Review & Proceed" button that opens final confirmation modal */}
                
            </div>
          </motion.div>
        )}

        {/* Enhanced Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmStep}
          onEdit={() => {
            setShowConfirmModal(false);
            // Stay on current step for editing - don't change currentStep
          }}
          title={modalTitle}
          data={modalData}
          stepType={currentStepType}
          currentStep={currentStep}
        />


        {/* Final Document Display (Step 6b) */}
        {showFinalDocument && (
          <FinalDocumentDisplay
            allData={allFormData}
            customerId={generatedCustomerId}
            onStartNew={() => {
              // Reset all booking states
              setShowStepper(false);
              setCurrentStep(0);
              setCompletedSteps([false, false, false, false, false, false, false, false]);
              
              // Reset all form data
              setOriginData({
                mobileNumber: '',
                name: '',
                companyName: '',
                email: '',
                locality: '',
                flatBuilding: '',
                landmark: '',
                pincode: '',
                area: '',
                city: '',
                district: '',
                state: '',
                gstNumber: '',
                alternateNumbers: [''],
                addressType: 'Home',
                birthday: '',
                anniversary: '',
                otherAlternateNumber: '',
                showOtherAlternateNumber: false,
                website: ''
              });
              
              setDestinationData({
                mobileNumber: '',
                name: '',
                companyName: '',
                email: '',
                locality: '',
                flatBuilding: '',
                landmark: '',
                pincode: '',
                area: '',
                city: '',
                district: '',
                state: '',
                gstNumber: '',
                alternateNumbers: [''],
                addressType: 'Home',
                website: '',
                anniversary: '',
                birthday: ''
              });
              
              setShipmentData({
                natureOfConsignment: 'NON-DOX',
                services: 'Standard',
                mode: 'Air',
                insurance: 'Consignor not insured the shipment',
                riskCoverage: 'Owner',
                dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
                actualWeight: '',
                perKgWeight: '',
                volumetricWeight: 0,
                chargeableWeight: 0
              });
              
              setUploadData({
                totalPackages: '',
                materials: '',
                packageImages: [],
                contentDescription: '',
                invoiceNumber: '',
                invoiceValue: '',
                invoiceImages: [],
                panImages: [],
                declarationImages: [],
                eWaybillNumber: '',
                acceptTerms: false
              });
              
              setPaymentData({
                mode: '',
                deliveryType: ''
              });
              
              // Reset all other states
              setMobileDigits(Array(10).fill(''));
              setDestinationMobileDigits(Array(10).fill(''));
              setUserFound(null);
              setDestinationUserFound(null);
              setShowManualForm(false);
              setShowDestinationManualForm(false);
              setShowSummaryCard(false);
              setShowDestinationSummaryCard(false);
              setAddressDeliveryConfirmed(false);
              setDestinationAddressDeliveryConfirmed(false);
              setOtpVerified(false);
              setShowOTPVerification(false);
              setGeneratedCustomerId('');
              setShowFinalDocument(false);
              
              // Reset all form data
              resetAllFormData();
            }}
          />
        )}

        {/* Image Preview Modal */}
        {showImagePreview && previewImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
            onClick={() => {
              setShowImagePreview(false);
              setPreviewImage(null);
            }}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setPreviewImage(null);
                }}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Package Image Upload Modal */}
        {showPackageImageModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPackageImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#406ab9] to-[#4ec0f7] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white bg-opacity-20 rounded-full p-1.5">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Upload Package Images</h3>
                      <p className="text-[10px] text-blue-100">Add photos of your packages</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPackageImageModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Compression Message */}
                  {isCompressing && (
                    <div className="mb-2 flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span className="text-xs text-blue-700 font-medium">{compressionMessage}</span>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    onClick={async () => {
                      if (isCompressing) return; // Prevent clicks during compression
                      
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/jpeg,image/jpg,image/png,image/webp,application/pdf';
                      input.multiple = false;
                      input.onchange = async (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            // Check max files
                            if (uploadData.packageImages.length >= 10) {
                              alert('Maximum 10 images allowed.');
                              return;
                            }

                            // Compress the image
                            const compressedFile = await compressImage(file);

                            const id = Date.now() + Math.random().toString(36);
                            const preview = URL.createObjectURL(compressedFile);
                            
                            const newFile = {
                              id,
                              file: compressedFile,
                              preview,
                              uploaded: false
                            };

                            setUploadData(prev => ({
                              ...prev,
                              packageImages: [...prev.packageImages, newFile]
                            }));

                            // Close modal after upload
                            setTimeout(() => setShowPackageImageModal(false), 300);
                          } catch (error: any) {
                            alert(error.message || 'Failed to process image. Please try again.');
                          }
                        }
                      };
                      input.click();
                    }}
                    className={`border-2 border-dashed border-blue-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gradient-to-br from-blue-50 to-white ${
                      isCompressing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-0.5">
                          Click to Upload Image
                        </p>
                        <p className="text-[10px] text-gray-500">
                          JPG, PNG, WEBP, PDF up to 20MB
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Auto-compressed to 10MB or less
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                    <div className="flex items-start space-x-2">
                      <Camera className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-[10px] text-blue-700">
                        <p className="font-medium mb-0.5">Upload Information:</p>
                        <ul className="space-y-0.5 text-blue-600">
                          <li>• Images auto-compressed for faster upload</li>
                          <li>• Maintain high quality after compression</li>
                          <li>• Supported: JPG, PNG, WEBP, PDF</li>
                          <li>• Maximum {10 - uploadData.packageImages.length} more image(s) allowed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => setShowPackageImageModal(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice Popup - Rendered at top level so it can appear from any step */}
        <InvoicePopup
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onConfirm={async (invoice) => {
            console.log('Invoice confirmed:', invoice);
            setShowInvoiceModal(false);
            
            // Now submit the booking after invoice confirmation
            await submitBooking();
          }}
          bookingData={{
            originData,
            destinationData,
            shipmentData,
            uploadData,
            paymentData,
            billData,
            detailsData
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default BookingPanel;