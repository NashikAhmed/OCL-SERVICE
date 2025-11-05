import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

// Custom Radio Button Component
interface RadioButtonOption {
  value: string;
  label: string;
}

interface CustomRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioButtonOption[];
  required?: boolean;
  icon?: React.ReactNode;
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-3">
        {options.map((option) => (
          <label 
            key={option.value} 
            className={`flex items-center space-x-3 cursor-pointer rounded-xl py-3 px-4 border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
              value === option.value 
                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-blue-50' 
                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
            }`}
          >
            {icon && <div className="text-gray-400">{icon}</div>}
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-[#406ab9] focus:ring-[#4ec0f7] border-gray-300"
            />
            <span className="text-gray-800">{option.label}</span>
          </label>
        ))}
      </div>
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
  placeholder?: string;
  hasValidationError?: boolean;
  validationErrorMessage?: string;
  compact?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
  placeholder = '',
  hasValidationError = false,
  validationErrorMessage = '',
  compact = false,
  onBlur
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
        <input
          type={type}
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
            w-full ${compact ? 'h-8' : 'h-10'} px-3 ${icon ? 'pl-10' : 'pl-3'} pr-3
            border rounded-xl bg-white/90 backdrop-blur-sm
            transition-all duration-200 ease-in-out ${compact ? 'text-xs' : 'text-sm'}
            ${hasValidationError
              ? 'border-red-500 ring-2 ring-red-200'
              : isFocused 
                ? 'border-[#406ab9] ring-2 ring-[#4ec0f7]/20 shadow-[0_4px_8px_rgba(0,0,0,0.1)]' 
                : 'border-gray-300/60 hover:border-[#406ab9]/50 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            focus:outline-none text-[#1e293b]
          `}
          placeholder={placeholder || ""}
          aria-disabled={disabled}
        />
        
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
          `}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {/* Validation Error Message */}
      {hasValidationError && validationErrorMessage && (
        <div className="mt-1">
          <div className="text-xs text-red-600">
            {validationErrorMessage}
          </div>
        </div>
      )}
    </div>
  );
};

// Floating Select Component
interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {value: string, label: string}[];
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
        >
          <option value="" disabled hidden></option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
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
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    </div>
  );
};

// Upload Box Component
interface UploadBoxProps {
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const UploadBox: React.FC<UploadBoxProps> = ({ label, files, onFilesChange, maxFiles = 5 }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const fileType = (file as File).type;
        return fileType.startsWith('image/') || fileType === 'application/pdf';
      });
      
      // Limit to maxFiles
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      
      onFilesChange([...files, ...filesToAdd]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="flex flex-col">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`
          bg-gradient-to-b from-blue-50/50 to-white
          border-2 border-dashed rounded-xl p-4
          transition-all duration-300 cursor-pointer
          border-gray-300 hover:border-blue-400 hover:bg-blue-50/70 hover:shadow-sm
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex items-center justify-center space-x-3">
          <Upload className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-700">{label}</p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP, PDF (Max {maxFiles} files)</p>
          </div>
        </div>
      </div>

      {/* Uploaded Files Gallery */}
      {files.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200">
                  {file && (file as File).type?.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-md"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MedicineBookingPanel: React.FC = () => {
  // State for stepper
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false, false]);
  
  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [consignmentNumber, setConsignmentNumber] = useState<number | null>(null);
  
  // State for consignment availability check
  const [consignmentAvailable, setConsignmentAvailable] = useState<boolean | null>(null);
  const [consignmentCheckError, setConsignmentCheckError] = useState<string | null>(null);
  
  // State for step validation errors
  const [stepValidationError, setStepValidationError] = useState<string | null>(null);
  
  // Steps configuration
  const steps = ['Origin', 'Destination', 'Shipment', 'Invoice', 'Billing'];

  // State for origin data
  const [originData, setOriginData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    companyName: '',
    flatBuilding: '',
    locality: '',
    landmark: '',
    pincode: '',
    area: '',
    city: '',
    district: '',
    state: '',
    gstNumber: '',
    addressType: 'Home'
  });

  // State for destination data
  const [destinationData, setDestinationData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    companyName: '',
    flatBuilding: '',
    locality: '',
    landmark: '',
    pincode: '',
    area: '',
    city: '',
    district: '',
    state: '',
    gstNumber: '',
    addressType: 'Home'
  });

  // Pincode lookup states
  const [originAreas, setOriginAreas] = useState<string[]>([]);
  const [destinationAreas, setDestinationAreas] = useState<string[]>([]);
  const [originPinError, setOriginPinError] = useState<string | null>(null);
  const [destinationPinError, setDestinationPinError] = useState<string | null>(null);
  
  // GST validation states
  const [originGstError, setOriginGstError] = useState(false);
  const [destinationGstError, setDestinationGstError] = useState(false);

  // State for phone number verification (Origin)
  const [originMobileDigits, setOriginMobileDigits] = useState<string[]>(Array(10).fill(''));
  const [originUserFound, setOriginUserFound] = useState<boolean | null>(null);
  const [originUserAddresses, setOriginUserAddresses] = useState<any[]>([]);
  const [selectedOriginAddressId, setSelectedOriginAddressId] = useState<string | null>(null);
  const [originAddressDeliveryConfirmed, setOriginAddressDeliveryConfirmed] = useState(false);
  const [showOriginSummaryCard, setShowOriginSummaryCard] = useState(false);
  const [showOriginManualForm, setShowOriginManualForm] = useState(false);

  // State for phone number verification (Destination)
  const [destinationMobileDigits, setDestinationMobileDigits] = useState<string[]>(Array(10).fill(''));
  const [destinationUserFound, setDestinationUserFound] = useState<boolean | null>(null);
  const [destinationUserAddresses, setDestinationUserAddresses] = useState<any[]>([]);
  const [selectedDestinationAddressId, setSelectedDestinationAddressId] = useState<string | null>(null);
  const [destinationAddressDeliveryConfirmed, setDestinationAddressDeliveryConfirmed] = useState(false);
  const [showDestinationSummaryCard, setShowDestinationSummaryCard] = useState(false);
  const [showDestinationManualForm, setShowDestinationManualForm] = useState(false);

  // Lookup helper to fetch past addresses by phone
  const fetchAddressesByPhone = async (phone: string, role: 'origin' | 'destination') => {
    try {
      console.log(`[MedicineBooking] Looking up ${role} addresses for phone: ${phone}`);
      const token = localStorage.getItem('medicineToken');
      const url = `/api/medicine/bookings/lookup?phone=${encodeURIComponent(phone)}&role=${role}`;
      console.log(`[MedicineBooking] Fetching from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      console.log(`[MedicineBooking] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[MedicineBooking] Lookup failed: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[MedicineBooking] Lookup response:`, data);
      
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      console.log(`[MedicineBooking] Found ${addresses.length} ${role} address(es)`);
      
      return addresses;
    } catch (e) {
      console.error('[MedicineBooking] Lookup request failed:', e);
      return [];
    }
  };

  // State for shipment data
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

  // State for package data
  const [packageData, setPackageData] = useState({
    totalPackages: '',
    materials: '',
    packageImages: [] as File[],
    contentDescription: ''
  });

  // State for invoice data
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceValue: '',
    invoiceImages: [] as File[],
    eWaybillNumber: '',
    acceptTerms: false
  });

  // State for bill data
  const [billData, setBillData] = useState({
    gst: 'No', // Yes or No
    partyType: 'sender', // Only sender and recipient
    billType: 'normal' // normal or rcm
  });

  // State for details data
  const [detailsData, setDetailsData] = useState({
    freightCharge: '0.00',
    awbCharge: '0.00',
    localCollection: '0.00',
    doorDelivery: '0.00',
    loadingUnloading: '0.00',
    demurrageCharge: '0.00',
    ddaCharge: '0.00',
    hamaliCharge: '0.00',
    packingCharge: '0.00',
    otherCharge: '0.00',
    total: '0.00',
    fuelCharge: '0.00',
    fuelChargeType: 'percentage',
    gstAmount: '0.00',
    sgstAmount: '0.00',
    cgstAmount: '0.00',
    igstAmount: '0.00',
    grandTotal: '0.00'
  });

  // State for payment data
  const [paymentData, setPaymentData] = useState({
    mode: '',
    deliveryType: ''
  });

  // Handle step navigation
  const handleNextStep = () => {
    // Clear previous validation error
    setStepValidationError(null);
    
    // Validate current step before proceeding
    let isValid = true;
    let errorMessage = '';
    
    switch (currentStep) {
      case 0: // Origin Details - mobile number and address confirmation required
        const originMobileNumber = originMobileDigits.filter(digit => digit !== '').join('');
        // For origin, we just need a valid phone number and confirmed address (either selected or manually filled)
        // If user filled manual form, use the validation function which checks all required fields
        if (showOriginManualForm || originUserFound === false) {
          if (originMobileNumber.length !== 10) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
          } else if (!isOriginFormValid()) {
            isValid = false;
            errorMessage = 'Please fill all required fields in the Origin Details form';
          }
        } else {
          // If user selected an address, check if it's confirmed
          if (originMobileNumber.length !== 10) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
          } else if (!originAddressDeliveryConfirmed) {
            isValid = false;
            errorMessage = 'Please select and confirm a delivery address';
          }
        }
        break;
      
      case 1: // Destination Details - mobile number and address confirmation required
        const destinationMobileNumber = destinationMobileDigits.filter(digit => digit !== '').join('');
        // For destination, we just need a valid phone number and confirmed address (either selected or manually filled)
        // If user filled manual form, use the validation function which checks all required fields
        if (showDestinationManualForm || destinationUserFound === false) {
          if (destinationMobileNumber.length !== 10) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
          } else if (!isDestinationFormValid()) {
            isValid = false;
            errorMessage = 'Please fill all required fields in the Destination Details form';
          }
        } else {
          // If user selected an address, check if it's confirmed
          if (destinationMobileNumber.length !== 10) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
          } else if (!destinationAddressDeliveryConfirmed) {
            isValid = false;
            errorMessage = 'Please select and confirm a delivery address';
          }
        }
        break;
      
      case 2: // Shipment Details
        if (!shipmentData.natureOfConsignment) {
          isValid = false;
          errorMessage = 'Please select Nature of Consignment';
        } else if (!shipmentData.services) {
          isValid = false;
          errorMessage = 'Please select Services';
        } else if (!shipmentData.mode) {
          isValid = false;
          errorMessage = 'Please select Mode';
        } else if (!shipmentData.insurance) {
          isValid = false;
          errorMessage = 'Please select Insurance';
        } else if (!shipmentData.riskCoverage) {
          isValid = false;
          errorMessage = 'Please select Risk Coverage';
        } else if (!packageData.totalPackages) {
          isValid = false;
          errorMessage = 'Please enter Total Packages';
        } else if (!packageData.materials) {
          isValid = false;
          errorMessage = 'Please enter Materials';
        } else if (!packageData.contentDescription) {
          isValid = false;
          errorMessage = 'Please enter Content Description';
        }
        break;
      
      case 3: // Invoice Information
        if (!invoiceData.invoiceNumber) {
          isValid = false;
          errorMessage = 'Please enter Invoice Number';
        } else if (!invoiceData.invoiceValue) {
          isValid = false;
          errorMessage = 'Please enter Invoice Value';
        } else if (parseFloat(invoiceData.invoiceValue) > 50000 && !invoiceData.eWaybillNumber) {
          isValid = false;
          errorMessage = 'E-Waybill Number is required for invoice values above ₹50,000';
        }
        break;
      
      case 4: // Billing Information
        if (!billData.gst) {
          isValid = false;
          errorMessage = 'Please select GST option';
        } else if (!billData.partyType) {
          isValid = false;
          errorMessage = 'Please select Party Type';
        } else if (billData.gst === 'Yes' && !billData.billType) {
          isValid = false;
          errorMessage = 'Please select Bill Type';
        }
        break;
      
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < steps.length - 1) {
      const newCompletedSteps = [...completedSteps];
      newCompletedSteps[currentStep] = true;
      setCompletedSteps(newCompletedSteps);
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      setStepValidationError(errorMessage);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle origin input changes
  const handleOriginChange = (field: string, value: string) => {
    setOriginData(prev => ({ ...prev, [field]: value }));
  };

  // Handle destination input changes
  const handleDestinationChange = (field: string, value: string) => {
    setDestinationData(prev => ({ ...prev, [field]: value }));
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
      } else {
        setDestinationPinError(null);
        setDestinationAreas([]);
      }
    }
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

  // Handle shipment input changes
  const handleShipmentChange = (field: string, value: string) => {
    setShipmentData(prev => ({ ...prev, [field]: value }));
  };

  // Handle dimension changes
  const handleDimensionChange = (index: number, field: string, value: string) => {
    const newDimensions = [...shipmentData.dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setShipmentData(prev => ({ ...prev, dimensions: newDimensions }));
  };

  // Handle package input changes
  const handlePackageChange = (field: string, value: string) => {
    setPackageData(prev => ({ ...prev, [field]: value }));
  };

  // Handle package file changes
  const handlePackageFileChange = (field: string, files: File[]) => {
    setPackageData(prev => ({ ...prev, [field]: files }));
  };

  // Handle invoice input changes
  const handleInvoiceChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  // Handle invoice file changes
  const handleInvoiceFileChange = (field: string, files: File[]) => {
    setInvoiceData(prev => ({ ...prev, [field]: files }));
  };

  // Handle bill input changes
  const handleBillChange = (field: string, value: string) => {
    setBillData(prev => ({ ...prev, [field]: value }));
    
    // When GST selection changes, recalculate charges
    if (field === 'gst') {
      const freightChargeValue = parseFloat(detailsData.freightCharge) || 0;
      
      if (value === 'No') {
        // If GST is set to "No", grand total equals freight charge
        const grandTotal = freightChargeValue.toFixed(2);
        setDetailsData(prev => ({ ...prev, gstAmount: '0.00', grandTotal }));
      } else {
        // If GST is set to "Yes", grand total equals freight charge + 18% GST
        const gstAmount = (freightChargeValue * 0.18).toFixed(2);
        const grandTotal = (freightChargeValue + parseFloat(gstAmount)).toFixed(2);
        setDetailsData(prev => ({ ...prev, gstAmount, grandTotal }));
      }
    }
  };

  // Format price to 2 decimal places
  const formatPriceToTwoDecimals = (value: string): string => {
    if (!value || value === '') return '0.00';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0.00';
    return numValue.toFixed(2);
  }

  // Auto-calculate GST (18% of freight charge) whenever freight charge changes
  useEffect(() => {
    const freightChargeValue = parseFloat(detailsData.freightCharge) || 0;
    
    // If GST is "No", grand total equals freight charge
    // If GST is "Yes", grand total equals freight charge + 18% GST
    if (billData.gst === 'No') {
      const grandTotal = freightChargeValue.toFixed(2);
      setDetailsData(prev => ({ ...prev, gstAmount: '0.00', grandTotal }));
    } else {
      const gstAmount = (freightChargeValue * 0.18).toFixed(2);
      const grandTotal = (freightChargeValue + parseFloat(gstAmount)).toFixed(2);
      setDetailsData(prev => ({ ...prev, gstAmount, grandTotal }));
    }
  }, [detailsData.freightCharge, billData.gst]);

  // Handle details input changes
  const handleDetailsChange = (field: string, value: string) => {
    // Allow user to type numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDetailsData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle price field blur to format to 2 decimal places
  const handlePriceBlur = (field: string, value: string) => {
    const formattedValue = formatPriceToTwoDecimals(value);
    setDetailsData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Handle payment input changes
  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  // Handle origin mobile digit change
  const handleOriginDigitChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
    
    const newDigits = [...originMobileDigits];
    newDigits[index] = value;
    setOriginMobileDigits(newDigits);
    
    // Update origin data with mobile number
    const mobileNumber = newDigits.filter(digit => digit !== '').join('');
    setOriginData(prev => ({ ...prev, mobileNumber }));
    
    // Auto-focus next input
    if (value && index < 9) {
      const nextInput = document.getElementById(`origin-digit-${index + 1}`);
      nextInput?.focus();
    }
    
    // Check if all digits are entered
    if (mobileNumber.length === 10) {
      // Add a small delay to ensure state is updated before lookup
      setTimeout(() => {
        lookupOriginUserInDatabase(mobileNumber);
      }, 100);
    }
  };

  // Handle origin mobile digit key down
  const handleOriginDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !originMobileDigits[index] && index > 0) {
      const prevInput = document.getElementById(`origin-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle destination mobile digit change
  const handleDestinationDigitChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
    
    const newDigits = [...destinationMobileDigits];
    newDigits[index] = value;
    setDestinationMobileDigits(newDigits);
    
    // Update destination data with mobile number
    const mobileNumber = newDigits.filter(digit => digit !== '').join('');
    setDestinationData(prev => ({ ...prev, mobileNumber }));
    
    // Auto-focus next input
    if (value && index < 9) {
      const nextInput = document.getElementById(`dest-digit-${index + 1}`);
      nextInput?.focus();
    }
    
    // Check if all digits are entered
    if (mobileNumber.length === 10) {
      // Add a small delay to ensure state is updated before lookup
      setTimeout(() => {
        lookupDestinationUserInDatabase(mobileNumber);
      }, 100);
    }
  };

  // Handle destination mobile digit key down
  const handleDestinationDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !destinationMobileDigits[index] && index > 0) {
      const prevInput = document.getElementById(`dest-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Reset origin mobile input
  const resetOriginMobileInput = () => {
    setOriginMobileDigits(Array(10).fill(''));
    setOriginUserFound(null);
    setOriginUserAddresses([]);
    setSelectedOriginAddressId(null);
    setOriginAddressDeliveryConfirmed(false);
    setShowOriginSummaryCard(false);
    setShowOriginManualForm(false);
    setOriginData(prev => ({ ...prev, mobileNumber: '' }));
  };

  // Reset destination mobile input
  const resetDestinationMobileInput = () => {
    setDestinationMobileDigits(Array(10).fill(''));
    setDestinationUserFound(null);
    setDestinationUserAddresses([]);
    setSelectedDestinationAddressId(null);
    setDestinationAddressDeliveryConfirmed(false);
    setShowDestinationSummaryCard(false);
    setShowDestinationManualForm(false);
    setDestinationData(prev => ({ ...prev, mobileNumber: '' }));
  };

  // Lookup origin user from database
  const lookupOriginUserInDatabase = async (mobileNumber: string) => {
    console.log(`[MedicineBooking] Looking up origin user for: ${mobileNumber}`);
    try {
      const addresses = await fetchAddressesByPhone(mobileNumber, 'origin');
      console.log(`[MedicineBooking] Origin lookup result:`, addresses);
      
      if (addresses.length > 0) {
        const address = addresses[0];
        console.log(`[MedicineBooking] Found origin address:`, address);
        
        setOriginUserFound(true);
        setOriginUserAddresses(addresses);
        setSelectedOriginAddressId(addresses[0].id);
        setShowOriginSummaryCard(true);
        setShowOriginManualForm(false);
        
        // Map the address data, preserving any existing 'area' field
        setOriginData(prev => ({
          ...prev,
          name: address.name || '',
          mobileNumber: address.mobileNumber || mobileNumber,
          email: address.email || '',
          companyName: address.companyName || '',
          flatBuilding: address.flatBuilding || '',
          locality: address.locality || '',
          landmark: address.landmark || '',
          pincode: address.pincode || '',
          city: address.city || '',
          district: address.district || '',
          state: address.state || '',
          gstNumber: address.gstNumber || '',
          addressType: address.addressType || 'Home'
          // Note: 'area' is not in the database, so we preserve the existing value
        }));
        
        console.log(`[MedicineBooking] Origin form autofilled successfully`);
      } else {
        console.log(`[MedicineBooking] No origin addresses found, showing manual form`);
        setOriginUserFound(false);
        setOriginUserAddresses([]);
        setShowOriginSummaryCard(false);
        setShowOriginManualForm(true);
      }
    } catch (error) {
      console.error('[MedicineBooking] Error in origin lookup:', error);
      setOriginUserFound(false);
      setOriginUserAddresses([]);
      setShowOriginSummaryCard(false);
      setShowOriginManualForm(true);
    }
  };

  // Lookup destination user from database
  const lookupDestinationUserInDatabase = async (mobileNumber: string) => {
    console.log(`[MedicineBooking] Looking up destination user for: ${mobileNumber}`);
    try {
      const addresses = await fetchAddressesByPhone(mobileNumber, 'destination');
      console.log(`[MedicineBooking] Destination lookup result:`, addresses);
      
      if (addresses.length > 0) {
        const address = addresses[0];
        console.log(`[MedicineBooking] Found destination address:`, address);
        
        setDestinationUserFound(true);
        setDestinationUserAddresses(addresses);
        setSelectedDestinationAddressId(addresses[0].id);
        setShowDestinationSummaryCard(true);
        setShowDestinationManualForm(false);
        
        // Map the address data, preserving any existing 'area' field
        setDestinationData(prev => ({
          ...prev,
          name: address.name || '',
          mobileNumber: address.mobileNumber || mobileNumber,
          email: address.email || '',
          companyName: address.companyName || '',
          flatBuilding: address.flatBuilding || '',
          locality: address.locality || '',
          landmark: address.landmark || '',
          pincode: address.pincode || '',
          city: address.city || '',
          district: address.district || '',
          state: address.state || '',
          gstNumber: address.gstNumber || '',
          addressType: address.addressType || 'Home'
          // Note: 'area' is not in the database, so we preserve the existing value
        }));
        
        console.log(`[MedicineBooking] Destination form autofilled successfully`);
      } else {
        console.log(`[MedicineBooking] No destination addresses found, showing manual form`);
        setDestinationUserFound(false);
        setDestinationUserAddresses([]);
        setShowDestinationSummaryCard(false);
        setShowDestinationManualForm(true);
      }
    } catch (error) {
      console.error('[MedicineBooking] Error in destination lookup:', error);
      setDestinationUserFound(false);
      setDestinationUserAddresses([]);
      setShowDestinationSummaryCard(false);
      setShowDestinationManualForm(true);
    }
  };

  // Handle origin address selection
  const handleOriginAddressSelect = (addressId: string) => {
    setSelectedOriginAddressId(addressId);
    setOriginAddressDeliveryConfirmed(false);
    
    // Update origin data with selected address
    const selectedAddress = originUserAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setOriginData(prev => ({ ...prev, ...selectedAddress }));
    }
  };
  
  // Handle origin deliver here
  const handleOriginDeliverHere = () => {
    if (selectedOriginAddressId) {
      setOriginAddressDeliveryConfirmed(true);
    }
  };

  // Handle destination address selection
  const handleDestinationAddressSelect = (addressId: string) => {
    setSelectedDestinationAddressId(addressId);
    setDestinationAddressDeliveryConfirmed(false);
    
    // Update destination data with selected address
    const selectedAddress = destinationUserAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setDestinationData(prev => ({ ...prev, ...selectedAddress }));
    }
  };

  // Handle destination deliver here
  const handleDestinationDeliverHere = () => {
    if (selectedDestinationAddressId) {
      setDestinationAddressDeliveryConfirmed(true);
    }
  };

  // Validate origin form - only check required fields
  const isOriginFormValid = () => {
    return (
      originData.name.trim() !== '' &&
      originData.mobileNumber.length === 10 &&
      originData.locality.trim() !== '' &&
      originData.pincode.trim() !== '' &&
      originData.area.trim() !== '' &&
      originData.city.trim() !== '' &&
      originData.district.trim() !== '' &&
      originData.state.trim() !== '' &&
      !originGstError // GST should be either empty or complete 15 digits
    );
  };

  // Validate destination form - only check required fields
  const isDestinationFormValid = () => {
    return (
      destinationData.name.trim() !== '' &&
      destinationData.mobileNumber.length === 10 &&
      destinationData.locality.trim() !== '' &&
      destinationData.pincode.trim() !== '' &&
      destinationData.area.trim() !== '' &&
      destinationData.city.trim() !== '' &&
      destinationData.district.trim() !== '' &&
      destinationData.state.trim() !== '' &&
      !destinationGstError // GST should be either empty or complete 15 digits
    );
  };

  // Clear validation error when step changes
  useEffect(() => {
    setStepValidationError(null);
  }, [currentStep]);

  // Effect to automatically set origin address delivery confirmation when manual form is valid
  useEffect(() => {
    if ((showOriginManualForm || originUserFound === false) && isOriginFormValid()) {
      setOriginAddressDeliveryConfirmed(true);
    } else if (originAddressDeliveryConfirmed && !isOriginFormValid()) {
      setOriginAddressDeliveryConfirmed(false);
    }
  }, [originData, showOriginManualForm, originUserFound]);

  // Effect to automatically set destination address delivery confirmation when manual form is valid
  useEffect(() => {
    if ((showDestinationManualForm || destinationUserFound === false) && isDestinationFormValid()) {
      setDestinationAddressDeliveryConfirmed(true);
    } else if (destinationAddressDeliveryConfirmed && !isDestinationFormValid()) {
      setDestinationAddressDeliveryConfirmed(false);
    }
  }, [destinationData, showDestinationManualForm, destinationUserFound]);


  // Calculate volumetric weight
  const calculateVolumetricWeight = () => {
    const { length, breadth, height, unit } = shipmentData.dimensions[0];
    if (length && breadth && height) {
      const l = parseFloat(length) || 0;
      const b = parseFloat(breadth) || 0;
      const h = parseFloat(height) || 0;
      const multiplier = unit === 'cm' ? 1 : (unit === 'mm' ? 0.1 : 100);
      const volWeight = (l * b * h * multiplier) / 5000;
      return parseFloat(volWeight.toFixed(2));
    }
    return 0;
  };

  // Calculate chargeable weight
  const calculateChargeableWeight = () => {
    const actualWeight = parseFloat(shipmentData.actualWeight) || 0;
    const volumetricWeight = calculateVolumetricWeight();
    return Math.max(actualWeight, volumetricWeight);
  };

  // Update weights when dimensions or actual weight change
  useEffect(() => {
    const volumetricWeight = calculateVolumetricWeight();
    const chargeableWeight = calculateChargeableWeight();
    
    setShipmentData(prev => ({
      ...prev,
      volumetricWeight,
      chargeableWeight
    }));
  }, [shipmentData.dimensions, shipmentData.actualWeight]);

  // Update freight charge when chargeable weight or per kg rate changes
  useEffect(() => {
    const chargeableWeight = parseFloat(shipmentData.chargeableWeight.toString()) || 0;
    const perKgRate = parseFloat(shipmentData.perKgWeight) || 0;
    const freightCharge = (chargeableWeight * perKgRate).toFixed(2);
    
    setDetailsData(prev => ({
      ...prev,
      freightCharge
    }));
  }, [shipmentData.chargeableWeight, shipmentData.perKgWeight]);

  // Check consignment availability on component mount
  useEffect(() => {
    const checkConsignmentAvailability = async () => {
      const medicineToken = localStorage.getItem('medicineToken');
      if (!medicineToken) {
        setConsignmentCheckError('Please login to check consignment availability');
        setConsignmentAvailable(false);
        return;
      }

      try {
        const response = await fetch('/api/medicine/consignment/assignments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${medicineToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.hasAssignment) {
            const availableCount = data.summary?.availableCount || 0;
            setConsignmentAvailable(availableCount > 0);
            if (availableCount === 0) {
              setConsignmentCheckError('All consignment numbers have been used. Please contact admin to get more consignment numbers assigned.');
            } else {
              setConsignmentCheckError(null);
            }
          } else {
            setConsignmentAvailable(false);
            setConsignmentCheckError('No consignment numbers assigned to your account. Please contact admin to get consignment numbers assigned.');
          }
        } else {
          const errorData = await response.json();
          setConsignmentAvailable(false);
          setConsignmentCheckError(errorData.message || 'Failed to check consignment availability');
        }
      } catch (error: any) {
        console.error('Error checking consignment availability:', error);
        setConsignmentAvailable(false);
        setConsignmentCheckError('Failed to check consignment availability');
      }
    };

    checkConsignmentAvailability();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Step 1: Upload images first if there are any
      let packageImageUrls: any[] = [];
      let invoiceImageUrls: any[] = [];

      // Upload both package and invoice images together if there are any
      if ((packageData.packageImages && packageData.packageImages.length > 0) ||
          (invoiceData.invoiceImages && invoiceData.invoiceImages.length > 0)) {
        const formData = new FormData();
        
        if (packageData.packageImages && packageData.packageImages.length > 0) {
          packageData.packageImages.forEach((file: File) => {
            formData.append('packageImages', file);
          });
        }

        if (invoiceData.invoiceImages && invoiceData.invoiceImages.length > 0) {
          invoiceData.invoiceImages.forEach((file: File) => {
            formData.append('invoiceImages', file);
          });
        }

        const uploadResponse = await fetch('/api/medicine/bookings/upload-images', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload images');
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.data?.packageImages) {
          packageImageUrls = uploadData.data.packageImages;
        }
        if (uploadData.data?.invoiceImages) {
          invoiceImageUrls = uploadData.data.invoiceImages;
        }
      }

      // Step 2: Prepare booking data
      const medicineToken = localStorage.getItem('medicineToken');
      const medicineInfo = localStorage.getItem('medicineInfo');
      let medicineUserId = null;
      
      if (medicineInfo) {
        try {
          const userInfo = JSON.parse(medicineInfo);
          medicineUserId = userInfo.id || null;
        } catch (e) {
          console.warn('Failed to parse medicine user info:', e);
        }
      }

      const bookingPayload = {
        medicineUserId,
        origin: originData,
        destination: destinationData,
        shipment: {
          ...shipmentData,
          volumetricWeight: shipmentData.volumetricWeight || 0,
          chargeableWeight: shipmentData.chargeableWeight || 0
        },
        package: {
          totalPackages: packageData.totalPackages,
          materials: packageData.materials || '',
          packageImages: packageImageUrls,
          contentDescription: packageData.contentDescription
        },
        invoice: {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceValue: invoiceData.invoiceValue,
          invoiceImages: invoiceImageUrls,
          eWaybillNumber: invoiceData.eWaybillNumber || '',
          acceptTerms: invoiceData.acceptTerms || false
        },
        billing: billData,
        // Modified charges data based on GST selection
        charges: billData.gst === 'Yes' ? detailsData : {
          freightCharge: detailsData.freightCharge,
          grandTotal: detailsData.grandTotal
        },
        payment: paymentData
      };

      // Step 3: Submit booking data
      const response = await fetch('/api/medicine/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(medicineToken && { 'Authorization': `Bearer ${medicineToken}` })
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      
      if (result.success && result.booking) {
        setBookingReference(result.booking.bookingReference);
        setConsignmentNumber(result.booking.consignmentNumber);
        setSubmitSuccess(true);
        setSubmitError(null);
        
        // Update consignment availability after successful booking
        setConsignmentAvailable(prev => {
          // Decrement available count (approximate)
          return prev !== false; // Keep current state or true, but will be rechecked on next mount
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          // You can add form reset logic here if needed
          // window.location.reload(); // Or reload the page
        }, 3000);
      } else {
        throw new Error('Booking created but no consignment number received');
      }
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      // Normalize technical validation errors into a friendly message without backend internals
      const rawMessage = (error && error.message) ? String(error.message) : '';
      const looksLikeValidation =
        rawMessage.toLowerCase().includes('validation failed') ||
        rawMessage.toLowerCase().includes('path `');

      const friendlyMessage = looksLikeValidation
        ? 'Please complete the required fields before booking.'
        : (rawMessage || 'Failed to submit booking. Please try again.');

      setSubmitError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Origin Details
        return (
          <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-blue-800">Origin Details</h2>
            </div>
            
            {/* Phone Number Input Section */}
            {!showOriginSummaryCard && !showOriginManualForm && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Sender / Consignor - Phone No.</h3>
                
                {/* Mobile Number Input Section with Country Code */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  {/* Country Code Fixed Display */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-[#406ab9]">+91</span>
                  </div>
                  
                  {/* Mobile Number Input Boxes */}
                  <div className="flex gap-1 flex-wrap justify-center max-w-full">
                    {originMobileDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`origin-digit-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOriginDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOriginDigitKeyDown(index, e)}
                        className="w-10 h-10 text-center text-sm font-semibold border-2 border-gray-300 rounded-2xl bg-white/80 focus:border-[#406ab9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4ec0f7]/30 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>
                
                {originMobileDigits.filter(digit => digit !== '').join('').length === 10 && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={resetOriginMobileInput}
                      className="text-sm text-[#64748b] hover:text-[#406ab9] underline transition-colors duration-200"
                    >
                      Change Number
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Address Selection Card */}
            {showOriginSummaryCard && originUserAddresses.length > 0 && (
              <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-0 overflow-hidden">
                <div className="bg-[#406ab9] text-white px-6 py-3 rounded-t-2xl">
                  <h4 className="font-semibold text-lg">Select Delivery Address</h4>
                </div>
                
                {originUserAddresses.map((address) => (
                  <div 
                    key={address.id}
                    className={`p-5 cursor-pointer transition-all duration-200 ${
                      selectedOriginAddressId === address.id 
                        ? '!bg-blue-50' 
                        : '!bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {/* Radio Button */}
                      <div className="mt-0.5">
                        <input
                          type="radio"
                          name="selectedOriginAddress"
                          checked={selectedOriginAddressId === address.id}
                          onChange={() => handleOriginAddressSelect(address.id)}
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
                        </div>
                        
                        {/* Details Display */}
                        <div className="space-y-1 text-sm">
                          {/* Company Name */}
                          {address.companyName && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 flex-shrink-0" />
                              <span className="text-gray-800 font-medium">{address.companyName}</span>
                            </div>
                          )}
                          
                          {/* Address */}
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-xs">
                              {address.locality}, {address.flatBuilding}
                              {address.landmark && `, ${address.landmark}`}, {address.city}, {address.pincode} - ({address.state})
                            </span>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="flex items-center gap-2 flex-wrap text-gray-700 text-xs">
                            {/* Mobile */}
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span className="font-semibold">+91 {address.mobileNumber}</span>
                            </div>
                            
                            {/* Email */}
                            {address.email && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span>{address.email}</span>
                                </div>
                              </>
                            )}
                            
                            {/* GST */}
                            {address.gstNumber && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-mono">{address.gstNumber}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Deliver Here Button - Changed to Confirm Address and color change on click */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={handleOriginDeliverHere}
                    disabled={!selectedOriginAddressId}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      originAddressDeliveryConfirmed
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' // Green when confirmed
                        : selectedOriginAddressId
                          ? 'bg-[#406ab9] text-white hover:bg-[#3059a0] shadow-md' // Blue when selectable
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed' // Gray when disabled
                    }`}
                  >
                    {originAddressDeliveryConfirmed ? 'Address Confirmed' : 'Confirm Address'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Manual Form */}
            {(showOriginManualForm || originUserFound === false) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  label="Full Name"
                  value={originData.name}
                  onChange={(value) => handleOriginChange('name', value)}
                  icon={<User className="h-4 w-4" />}
                  required
                />
                
                <FloatingInput
                  label="Mobile Number"
                  value={originData.mobileNumber}
                  onChange={(value) => handleOriginChange('mobileNumber', value)}
                  icon={<Phone className="h-4 w-4" />}
                  type="tel"
                  required
                />
                
                <FloatingInput
                  label="Email Address"
                  value={originData.email}
                  onChange={(value) => handleOriginChange('email', value)}
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                />
                
                <FloatingInput
                  label="Company Name"
                  value={originData.companyName}
                  onChange={(value) => handleOriginChange('companyName', value)}
                  icon={<Building className="h-4 w-4" />}
                />
                

                
                <FloatingInput
                  label="Locality"
                  value={originData.locality}
                  onChange={(value) => handleOriginChange('locality', value)}
                  required
                />
                
                <FloatingInput
                  label="Landmark"
                  value={originData.landmark}
                  onChange={(value) => handleOriginChange('landmark', value)}
                />
                
                <FloatingInput
                  label="GST"
                  value={originData.gstNumber}
                  onChange={(value) => {
                    const formattedGST = validateGSTFormat(value);
                    handleOriginChange('gstNumber', formattedGST);
                    // Validate GST: if partially filled (1-14 chars), show error
                    if (formattedGST.length > 0 && formattedGST.length < 15) {
                      setOriginGstError(true);
                    } else {
                      setOriginGstError(false);
                    }
                  }}
                  maxLength={15}
                  icon={<MapPin className="h-4 w-4" />}
                  hasValidationError={originGstError}
                  validationErrorMessage={originGstError ? "Please complete the 15-digit GST number or leave it empty" : ""}
                />
                
                <FloatingInput
                  label="PINCode"
                  value={originData.pincode}
                  onChange={(value) => {
                    const pincode = value.replace(/\D/g, '').slice(0, 6);
                    handleOriginChange('pincode', pincode);
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
                  icon={<MapPin className="h-4 w-4" />}
                  disabled={originGstError}
                />
                
                <FloatingInput
                  label="State"
                  value={originData.state}
                  onChange={(value) => handleOriginChange('state', value)}
                  disabled={true}
                  icon={<MapPin className="h-4 w-4" />}
                />
                
                <FloatingInput
                  label="City"
                  value={originData.city}
                  onChange={(value) => handleOriginChange('city', value)}
                  disabled={true}
                  icon={<MapPin className="h-4 w-4" />}
                />
                
                {originData.pincode.length === 6 && (
                  <FloatingSelect
                    label="Area"
                    value={originData.area}
                    onChange={(value) => handleOriginChange('area', value)}
                    options={originAreas.length > 0 ? originAreas.map(area => ({ value: area, label: area })) : [{ value: 'not-serviceable', label: 'This pincode is not serviceable' }]}
                    required
                    disabled={originAreas.length === 0 || originGstError}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                )}
              </div>
            )}
          </div>
        );
      
      case 1: // Destination Details
        return (
          <div className="border border-green-200 rounded-xl p-6 bg-green-50">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800">Destination Details</h2>
            </div>
            
            {/* Phone Number Input Section */}
            {!showDestinationSummaryCard && !showDestinationManualForm && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Receiver / Consignee - Phone No.</h3>
                
                {/* Mobile Number Input Section with Country Code */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  {/* Country Code Fixed Display */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-[#406ab9]">+91</span>
                  </div>
                  
                  {/* Mobile Number Input Boxes */}
                  <div className="flex gap-1 flex-wrap justify-center max-w-full">
                    {destinationMobileDigits.map((digit, index) => (
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
                
                {destinationMobileDigits.filter(digit => digit !== '').join('').length === 10 && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={resetDestinationMobileInput}
                      className="text-sm text-[#64748b] hover:text-[#406ab9] underline transition-colors duration-200"
                    >
                      Change Number
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Address Selection Card */}
            {showDestinationSummaryCard && destinationUserAddresses.length > 0 && (
              <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-0 overflow-hidden">
                <div className="bg-[#406ab9] text-white px-6 py-3 rounded-t-2xl">
                  <h4 className="font-semibold text-lg">Select Delivery Address</h4>
                </div>
                
                {destinationUserAddresses.map((address) => (
                  <div 
                    key={address.id}
                    className={`p-5 cursor-pointer transition-all duration-200 ${
                      selectedDestinationAddressId === address.id 
                        ? '!bg-green-50' 
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
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {address.addressType}
                            </span>
                          </div>
                        </div>
                        
                        {/* Details Display */}
                        <div className="space-y-1 text-sm">
                          {/* Company Name */}
                          {address.companyName && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 flex-shrink-0" />
                              <span className="text-gray-800 font-medium">{address.companyName}</span>
                            </div>
                          )}
                          
                          {/* Address */}
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-xs">
                              {address.locality}, {address.flatBuilding}
                              {address.landmark && `, ${address.landmark}`}, {address.city}, {address.pincode} - ({address.state})
                            </span>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="flex items-center gap-2 flex-wrap text-gray-700 text-xs">
                            {/* Mobile */}
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span className="font-semibold">+91 {address.mobileNumber}</span>
                            </div>
                            
                            {/* Email */}
                            {address.email && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span>{address.email}</span>
                                </div>
                              </>
                            )}
                            
                            {/* GST */}
                            {address.gstNumber && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-mono">{address.gstNumber}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Deliver Here Button - Changed to Confirm Address and color change on click */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={handleDestinationDeliverHere}
                    disabled={!selectedDestinationAddressId}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      destinationAddressDeliveryConfirmed
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' // Green when confirmed
                        : selectedDestinationAddressId
                          ? 'bg-[#406ab9] text-white hover:bg-[#3059a0] shadow-md' // Blue when selectable
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed' // Gray when disabled
                    }`}
                  >
                    {destinationAddressDeliveryConfirmed ? 'Address Confirmed' : 'Confirm Address'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Manual Form */}
            {(showDestinationManualForm || destinationUserFound === false) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  label="Full Name"
                  value={destinationData.name}
                  onChange={(value) => handleDestinationChange('name', value)}
                  icon={<User className="h-4 w-4" />}
                  required
                />
                
                <FloatingInput
                  label="Mobile Number"
                  value={destinationData.mobileNumber}
                  onChange={(value) => handleDestinationChange('mobileNumber', value)}
                  icon={<Phone className="h-4 w-4" />}
                  type="tel"
                  required
                />
                
                <FloatingInput
                  label="Email Address"
                  value={destinationData.email}
                  onChange={(value) => handleDestinationChange('email', value)}
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                />
                
                <FloatingInput
                  label="Company Name"
                  value={destinationData.companyName}
                  onChange={(value) => handleDestinationChange('companyName', value)}
                  icon={<Building className="h-4 w-4" />}
                />
                

                
                <FloatingInput
                  label="Locality"
                  value={destinationData.locality}
                  onChange={(value) => handleDestinationChange('locality', value)}
                  required
                />
                
                <FloatingInput
                  label="Landmark"
                  value={destinationData.landmark}
                  onChange={(value) => handleDestinationChange('landmark', value)}
                />
                
                <FloatingInput
                  label="GST"
                  value={destinationData.gstNumber}
                  onChange={(value) => {
                    const formattedGST = validateGSTFormat(value);
                    handleDestinationChange('gstNumber', formattedGST);
                    // Validate GST: if partially filled (1-14 chars), show error
                    if (formattedGST.length > 0 && formattedGST.length < 15) {
                      setDestinationGstError(true);
                    } else {
                      setDestinationGstError(false);
                    }
                  }}
                  maxLength={15}
                  icon={<MapPin className="h-4 w-4" />}
                  hasValidationError={destinationGstError}
                  validationErrorMessage={destinationGstError ? "Please complete the 15-digit GST number or leave it empty" : ""}
                />
                
                <FloatingInput
                  label="PINCode"
                  value={destinationData.pincode}
                  onChange={(value) => {
                    const pincode = value.replace(/\D/g, '').slice(0, 6);
                    handleDestinationChange('pincode', pincode);
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
                  icon={<MapPin className="h-4 w-4" />}
                  disabled={destinationGstError}
                />
                
                <FloatingInput
                  label="State"
                  value={destinationData.state}
                  onChange={(value) => handleDestinationChange('state', value)}
                  disabled={true}
                  icon={<MapPin className="h-4 w-4" />}
                />
                
                <FloatingInput
                  label="City"
                  value={destinationData.city}
                  onChange={(value) => handleDestinationChange('city', value)}
                  disabled={true}
                  icon={<MapPin className="h-4 w-4" />}
                />
                
                {destinationData.pincode.length === 6 && (
                  <FloatingSelect
                    label="Area"
                    value={destinationData.area}
                    onChange={(value) => handleDestinationChange('area', value)}
                    options={destinationAreas.length > 0 ? destinationAreas.map(area => ({ value: area, label: area })) : [{ value: 'not-serviceable', label: 'This pincode is not serviceable' }]}
                    required
                    disabled={destinationAreas.length === 0 || destinationGstError}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                )}
              </div>
            )}
          </div>
        );
      
      case 2: // Shipment Details with package information
        return (
          <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-orange-800">Shipment Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomRadioGroup
                label="Nature of Consignment"
                name="natureOfConsignment"
                value={shipmentData.natureOfConsignment}
                onChange={(value) => handleShipmentChange('natureOfConsignment', value)}
                options={[
                  { value: 'NON-DOX', label: 'NON-DOX' },
                  { value: 'DOX', label: 'DOX' }
                ]}
                required
                icon={<FileText className="h-4 w-4" />}
              />
              
              <CustomRadioGroup
                label="Services"
                name="services"
                value={shipmentData.services}
                onChange={(value) => handleShipmentChange('services', value)}
                options={[
                  { value: 'Standard', label: 'Standard' },
                  { value: 'Express', label: 'Express' },
                  { value: 'Same Day', label: 'Same Day' }
                ]}
                required
                icon={<Clock className="h-4 w-4" />}
              />
              
              <CustomRadioGroup
                label="Mode"
                name="mode"
                value={shipmentData.mode}
                onChange={(value) => handleShipmentChange('mode', value)}
                options={[
                  { value: 'Air', label: 'Air' },
                  { value: 'Surface', label: 'Surface' },
                  { value: 'Cargo', label: 'Cargo' }
                ]}
                required
                icon={<Globe className="h-4 w-4" />}
              />
              
              <CustomRadioGroup
                label="Insurance"
                name="insurance"
                value={shipmentData.insurance}
                onChange={(value) => handleShipmentChange('insurance', value)}
                options={[
                  { value: 'Consignor not insured the shipment', label: 'Consignor not insured the shipment' },
                  { value: 'Consignor has insured the shipment', label: 'Consignor has insured the shipment' }
                ]}
                required
                icon={<Shield className="h-4 w-4" />}
              />
              
              <CustomRadioGroup
                label="Risk Coverage"
                name="riskCoverage"
                value={shipmentData.riskCoverage}
                onChange={(value) => handleShipmentChange('riskCoverage', value)}
                options={[
                  { value: 'Owner', label: 'Owner' },
                  { value: 'Carrier', label: 'Carrier' }
                ]}
                required
                icon={<User className="h-4 w-4" />}
              />
              
              {/* Package Information Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-orange-700 mb-3">Package Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput
                    label="Total Packages"
                    value={packageData.totalPackages}
                    onChange={(value) => handlePackageChange('totalPackages', value)}
                    type="number"
                    required
                  />
                  
                  <FloatingInput
                    label="Materials"
                    value={packageData.materials}
                    onChange={(value) => handlePackageChange('materials', value)}
                  />
                  
                  <FloatingInput
                    label="Actual Weight (Kg)"
                    value={shipmentData.actualWeight}
                    onChange={(value) => handleShipmentChange('actualWeight', value)}
                    type="number"
                    required
                  />
                </div>
                
                {/* Per Kg and Chargeable Weight Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FloatingInput
                    label="Per Kg Rate (₹)"
                    value={shipmentData.perKgWeight}
                    onChange={(value) => handleShipmentChange('perKgWeight', value)}
                    type="number"
                  />
                  
                  {/* Simplified Chargeable Fix Button */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        // Simple alert to indicate the button was clicked
                        alert("Chargeable Fix button clicked");
                      }}
                      className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Chargeable Fix
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <FloatingTextarea
                    label="Content Description"
                    value={packageData.contentDescription}
                    onChange={(value) => handlePackageChange('contentDescription', value)}
                    required
                    rows={3}
                  />
                </div>
                
                <div className="mt-4">
                  <UploadBox
                    label="Upload Package Documents (Max 5)"
                    files={packageData.packageImages}
                    onFilesChange={(files) => handlePackageFileChange('packageImages', files)}
                    maxFiles={5}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3: // Invoice Information
        return (
          <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-indigo-800">Invoice Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput
                label="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={(value) => handleInvoiceChange('invoiceNumber', value)}
                required
              />
              
              <FloatingInput
                label="Invoice Value (₹)"
                value={invoiceData.invoiceValue}
                onChange={(value) => handleInvoiceChange('invoiceValue', value)}
                type="number"
                required
                icon={<IndianRupee className="h-4 w-4" />}
              />
              
              {/* Show E-Waybill Number only if invoice value is greater than 50000 */}
              {parseFloat(invoiceData.invoiceValue) > 50000 && (
                <FloatingInput
                  label="E-Waybill Number"
                  value={invoiceData.eWaybillNumber}
                  onChange={(value) => handleInvoiceChange('eWaybillNumber', value)}
                />
              )}
              
              <div className="md:col-span-2">
                <UploadBox
                  label="Upload Invoice Documents (Max 5)"
                  files={invoiceData.invoiceImages}
                  onFilesChange={(files) => handleInvoiceFileChange('invoiceImages', files)}
                  maxFiles={5}
                />
              </div>
            </div>
          </div>
        );
      
      case 4: // Billing Information
        return (
          <div className="border border-teal-200 rounded-xl p-6 bg-teal-50">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-teal-100 rounded-lg mr-3">
                <CreditCard className="h-6 w-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-teal-800">Billing Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomRadioGroup
                label="GST Applicable"
                name="gst"
                value={billData.gst}
                onChange={(value) => handleBillChange('gst', value)}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' }
                ]}
                required
              />
              
              <CustomRadioGroup
                label="Paid By"
                name="partyType"
                value={billData.partyType}
                onChange={(value) => handleBillChange('partyType', value)}
                options={[
                  { value: 'sender', label: 'Sender' },
                  { value: 'recipient', label: 'Recipient' }
                ]}
                required
              />
              
              {billData.gst === 'Yes' && (
                <CustomRadioGroup
                  label="Bill Type"
                  name="billType"
                  value={billData.billType}
                  onChange={(value) => handleBillChange('billType', value)}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'rcm', label: 'RCM (Reverse Charge Mechanism)' }
                  ]}
                  required
                />
              )}
              
              {billData.gst === 'No' && (
                <div className="md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-700">
                        GST is not applicable. You will be redirected to complete the booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Complete Booking Button for GST No case */}
            {billData.gst === 'No' && (
              <div className="flex flex-col items-center pt-6 space-y-4">
                {/* Consignment availability warning */}
                {consignmentAvailable === false && consignmentCheckError && (
                  <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-700 text-sm">{consignmentCheckError}</p>
                    </div>
                  </div>
                )}
                {/* Submit warning removed intentionally */}
                {submitSuccess && consignmentNumber && (
                  <div className="w-full max-w-md bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-green-700 font-semibold">Booking created successfully!</p>
                        <p className="text-green-600 text-sm mt-1">Consignment Number: {consignmentNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess || consignmentAvailable === false}
                  className={`px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center shadow-lg ${
                    isSubmitting || submitSuccess || consignmentAvailable === false
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {submitSuccess ? 'Booking Completed' : 'Complete Booking'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Determine if we should show the next button
  const shouldShowNextButton = () => {
    if (currentStep === 4) {
      return false; // Don't show next button on billing page
    }
    return currentStep < 4;
  };

  // Determine if we should show the charges step
  const shouldShowChargesStep = () => {
    return currentStep === 5 || (currentStep === 4 && billData.gst === 'Yes');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Medicine Booking</h1>
          <p className="text-gray-600">Create a new shipment booking for medicine delivery</p>
        </div>

        {/* Stepper */}
        <Stepper 
          currentStep={currentStep} 
          steps={steps} 
          completedSteps={completedSteps} 
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step Content */}
          {renderStepContent()}
          
          {/* Charges Step - only shown when GST is Yes */}
          {shouldShowChargesStep() && (
            <div className="border border-pink-200 rounded-xl p-6 bg-pink-50">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-pink-100 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-pink-800">Charges Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  label="Freight Charge (₹)"
                  value={detailsData.freightCharge}
                  onChange={(value) => handleDetailsChange('freightCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('freightCharge', detailsData.freightCharge)}
                />
                
                <FloatingInput
                  label="AWB Charge (₹)"
                  value={detailsData.awbCharge}
                  onChange={(value) => handleDetailsChange('awbCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('awbCharge', detailsData.awbCharge)}
                />
                
                <FloatingInput
                  label="Local Collection (₹)"
                  value={detailsData.localCollection}
                  onChange={(value) => handleDetailsChange('localCollection', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('localCollection', detailsData.localCollection)}
                />
                
                <FloatingInput
                  label="Door Delivery (₹)"
                  value={detailsData.doorDelivery}
                  onChange={(value) => handleDetailsChange('doorDelivery', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('doorDelivery', detailsData.doorDelivery)}
                />
                
                <FloatingInput
                  label="Loading/Unloading (₹)"
                  value={detailsData.loadingUnloading}
                  onChange={(value) => handleDetailsChange('loadingUnloading', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('loadingUnloading', detailsData.loadingUnloading)}
                />
                
                <FloatingInput
                  label="Demurrage Charge (₹)"
                  value={detailsData.demurrageCharge}
                  onChange={(value) => handleDetailsChange('demurrageCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('demurrageCharge', detailsData.demurrageCharge)}
                />
                
                <FloatingInput
                  label="DDA Charge (₹)"
                  value={detailsData.ddaCharge}
                  onChange={(value) => handleDetailsChange('ddaCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('ddaCharge', detailsData.ddaCharge)}
                />
                
                <FloatingInput
                  label="Hamali Charge (₹)"
                  value={detailsData.hamaliCharge}
                  onChange={(value) => handleDetailsChange('hamaliCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('hamaliCharge', detailsData.hamaliCharge)}
                />
                
                <FloatingInput
                  label="Packing Charge (₹)"
                  value={detailsData.packingCharge}
                  onChange={(value) => handleDetailsChange('packingCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('packingCharge', detailsData.packingCharge)}
                />
                
                <FloatingInput
                  label="Other Charge (₹)"
                  value={detailsData.otherCharge}
                  onChange={(value) => handleDetailsChange('otherCharge', value)}
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  onBlur={() => handlePriceBlur('otherCharge', detailsData.otherCharge)}
                />
                
                <FloatingInput
                  label="Fuel Charge (%)"
                  value={detailsData.fuelCharge}
                  onChange={(value) => handleDetailsChange('fuelCharge', value)}
                  type="text"
                  onBlur={() => handlePriceBlur('fuelCharge', detailsData.fuelCharge)}
                />
                
                <FloatingInput
                  label="GST (18%)"
                  value={detailsData.gstAmount}
                  onChange={() => {}} // Read-only, auto-calculated
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  disabled={true}
                />
                
                <FloatingInput
                  label="Grand Total"
                  value={detailsData.grandTotal}
                  onChange={() => {}} // Read-only, auto-calculated
                  type="text"
                  icon={<IndianRupee className="h-4 w-4" />}
                  disabled={true}
                />
              </div>
              
              {/* Complete Booking Button */}
              <div className="flex flex-col items-center pt-6 space-y-4">
                {/* Consignment availability warning */}
                {consignmentAvailable === false && consignmentCheckError && (
                  <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-700 text-sm">{consignmentCheckError}</p>
                    </div>
                  </div>
                )}
                {/* Submit warning removed intentionally */}
                {submitSuccess && consignmentNumber && (
                  <div className="w-full max-w-md bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-green-700 font-semibold">Booking created successfully!</p>
                        <p className="text-green-600 text-sm mt-1">Consignment Number: {consignmentNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess || consignmentAvailable === false}
                  className={`px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center shadow-lg ${
                    isSubmitting || submitSuccess || consignmentAvailable === false
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {submitSuccess ? 'Booking Completed' : 'Complete Booking'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Validation Error Message */}
          {stepValidationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{stepValidationError}</p>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Previous
              </button>
            )}
            
            {shouldShowNextButton() && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextStep();
                }}
                className="px-6 py-2 bg-[#406ab9] text-white font-medium rounded-xl hover:bg-[#3059a0] transition-all duration-200 flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
          
          {/* Back button for charges step */}
          {currentStep === 5 && (
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Billing
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MedicineBookingPanel;