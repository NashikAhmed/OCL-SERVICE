import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Package,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  Phone,
  Mail,
  Calendar,
  Truck,
  DollarSign,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Navigation,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWithPreview, uploadFiles, validateFile, compressImage, UploadedFileData } from "./upload";

// Floating Label Input Component
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

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
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-1">
          {icon}
        </div>
      )}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        onOpenChange={(open) => setIsFocused(open)}
      >
        <SelectTrigger className={`${icon ? 'pl-10' : ''} ${disabled ? 'bg-gray-100' : ''} ${className}`}>
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${
          isFloating
            ? `${icon ? 'left-8' : 'left-3'} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
            : `${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-500`
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
    </div>
  );
};

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  error,
  required = false,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-1">
          {icon}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        disabled={disabled}
        className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        placeholder=""
      />
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${
          isFloating
            ? `${icon ? 'left-8' : 'left-3'} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
            : `${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-500`
        }`}
      >
        {placeholder} {required && <span className="text-red-500">*</span>}
      </Label>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

interface CorporateBookingData {
  // Origin data
  originData: {
    useCurrentAddress: boolean;
    mobileNumber: string;
    name: string;
    companyName: string;
    email: string;
    locality: string;
    flatBuilding: string;
    landmark: string;
    pincode: string;
    area: string;
    city: string;
    district: string;
    state: string;
    gstNumber: string;
    alternateNumbers: string[];
    addressType: string;
    birthday: string;
    anniversary: string;
    otherAlternateNumber: string;
    showOtherAlternateNumber: boolean;
    website: string;
  };

  // Destination data
  destinationData: {
    mobileNumber: string;
    name: string;
    companyName: string;
    email: string;
    locality: string;
    flatBuilding: string;
    landmark: string;
    pincode: string;
    area: string;
    city: string;
    district: string;
    state: string;
    gstNumber: string;
    alternateNumbers: string[];
    addressType: string;
    website: string;
    anniversary: string;
    birthday: string;
  };

  // Shipment data
  shipmentData: {
    natureOfConsignment: string;
    services: string;
    mode: string;
    insurance: string;
    riskCoverage: string;
    dimensions: Array<{
      length: string;
      breadth: string;
      height: string;
      unit: string;
    }>;
    actualWeight: string;
    volumetricWeight: number;
    chargeableWeight: number;
    totalPackages: string;
    materials: string;
    packageImages: File[];
    uploadedFiles: UploadedFileData[];
    description: string;
    specialInstructions: string;
  };

  // Invoice data
  invoiceData: {
    billingAddress: string;
    paymentMethod: string;
    terms: string;
    calculatedPrice: number;
    gst: number;
    finalPrice: number;
    serviceType: string;
    location: string;
    transportMode: string;
    chargeableWeight: number;
  };

  // Payment data
  paymentData: {
    paymentType: 'FP' | 'TP'; // FP = Freight Paid, TP = To Pay
  };
}

const CorporateBookingPanel = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [corporateInfo, setCorporateInfo] = useState<any>(null);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [previousDestinations, setPreviousDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [destinationAreas, setDestinationAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isLoadingDestinationPincode, setIsLoadingDestinationPincode] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');

  // Consignment assignment states
  const [consignmentCheck, setConsignmentCheck] = useState<{
    hasAssignment: boolean | null;
    assignments: any[];
    summary: any;
    message: string;
    isLoading: boolean;
  }>({
    hasAssignment: null,
    assignments: [],
    summary: null,
    message: '',
    isLoading: true
  });

  // Consignment finished popup state
  const [showConsignmentFinishedPopup, setShowConsignmentFinishedPopup] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      bookingData.shipmentData.packageImages.forEach(file => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, []);

  // GST validation states
  const [originGstError, setOriginGstError] = useState(false);
  const [destinationGstError, setDestinationGstError] = useState(false);

  // Mobile number validation states
  const [originMobileError, setOriginMobileError] = useState(false);
  const [destinationMobileError, setDestinationMobileError] = useState(false);

  const { toast } = useToast();

  // GST validation function (from office dashboard)
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
      } else if (i < 13) {
        // Next 2 characters: Alphabets only (positions 11-12)
        if (/[A-Z]/.test(char)) {
          formattedValue += char;
        }
      } else {
        // Last 3 characters: Numbers only (positions 13-15)
        if (/[0-9]/.test(char)) {
          formattedValue += char;
        }
      }
    }

    return formattedValue;
  };

  // Mobile number validation function
  const validateMobileNumber = (value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, '');

    // Check if it's a valid 10-digit Indian mobile number
    if (cleanValue.length === 10) {
      const firstDigit = cleanValue[0];
      // Indian mobile numbers start with 6, 7, 8, or 9
      return ['6', '7', '8', '9'].includes(firstDigit);
    }

    return false;
  };

  // Check consignment assignment on component mount
  useEffect(() => {
    const checkConsignmentAssignment = async () => {
      try {
        const token = localStorage.getItem('corporateToken');
        if (!token) return;

        const response = await fetch('/api/corporate/consignment/check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        setConsignmentCheck({
          hasAssignment: data.hasAssignment,
          assignments: data.assignments || [],
          summary: data.summary || null,
          message: data.message,
          isLoading: false
        });

        if (!data.hasAssignment) {
          toast({
            title: "Consignment Assignment Required",
            description: data.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Consignment Status",
            description: data.message,
          });
        }
      } catch (error) {
        console.error('Error checking consignment assignment:', error);
        setConsignmentCheck({
          hasAssignment: false,
          assignments: [],
          summary: null,
          message: 'Failed to check consignment assignment status',
          isLoading: false
        });
        toast({
          title: "Error",
          description: "Failed to check consignment assignment status",
          variant: "destructive",
        });
      }
    };

    checkConsignmentAssignment();
  }, []);

  // Load corporate pricing data
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const token = localStorage.getItem('corporateToken');
        const response = await fetch('/api/corporate/pricing', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPricingData(data.pricing);
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      }
    };

    fetchPricingData();
  }, []);

  // Helper functions for pincode classification
  const isAssamPincode = (pincode: string) => {
    const pin = parseInt(pincode);
    return pin >= 780000 && pin <= 788999;
  };

  const isNorthEastPincode = (pincode: string) => {
    const pin = parseInt(pincode);
    return pin >= 790000 && pin <= 799999;
  };

  // Location classification function
  const classifyLocation = (pincode: string, byAir: boolean = false) => {
    if (isAssamPincode(pincode)) {
      return 'assam';
    } else if (isNorthEastPincode(pincode)) {
      return byAir ? 'neByAirAgtImp' : 'neBySurface';
    } else {
      return 'restOfIndia';
    }
  };

  // Calculate corporate pricing
  const calculateCorporatePrice = () => {
    if (!pricingData || !bookingData.destinationData.pincode || !bookingData.shipmentData.actualWeight) {
      return;
    }

    const weight = parseFloat(bookingData.shipmentData.actualWeight);
    const isPriority = bookingData.shipmentData.services === 'Priority';
    const isAir = bookingData.shipmentData.mode === 'Air';
    const natureOfConsignment = bookingData.shipmentData.natureOfConsignment;

    let price = 0;
    let location = '';
    let transportMode = '';
    let chargeableWeight = weight;
    let isMinimumWeightApplied = false;

    // Check if this is reverse pricing (only when using different address, not default corporate address)
    if (!bookingData.originData.useCurrentAddress && natureOfConsignment === 'NON-DOX') {
      // Reverse pricing logic
      const minChargeableWeights = {
        'Road': 500,
        'Surface': 100,
        'Air': 25
      };

      const modeKey = bookingData.shipmentData.mode === 'Air' ? 'Air' :
                     bookingData.shipmentData.mode === 'Surface' ? 'Surface' : 'Road';

      chargeableWeight = Math.max(weight, minChargeableWeights[modeKey as keyof typeof minChargeableWeights]);
      isMinimumWeightApplied = chargeableWeight > weight;

      if (isAssamPincode(bookingData.destinationData.pincode)) {
        location = 'Assam';
        const deliveryType = isPriority ? 'priority' : 'normal';
        const transportKey = bookingData.shipmentData.mode === 'Air' ? 'byFlight' :
                           bookingData.shipmentData.mode === 'Surface' ? 'byTrain' : 'byRoad';
        const pricePerKg = parseFloat(pricingData.reversePricing.toAssam[transportKey as keyof typeof pricingData.reversePricing.toAssam][deliveryType as keyof typeof pricingData.reversePricing.toAssam.byRoad]) || 0;
        price = pricePerKg * chargeableWeight;
        transportMode = transportKey;
      } else if (isNorthEastPincode(bookingData.destinationData.pincode)) {
        location = 'North East';
        const deliveryType = isPriority ? 'priority' : 'normal';
        const transportKey = bookingData.shipmentData.mode === 'Air' ? 'byFlight' :
                           bookingData.shipmentData.mode === 'Surface' ? 'byTrain' : 'byRoad';
        const pricePerKg = parseFloat(pricingData.reversePricing.toNorthEast[transportKey as keyof typeof pricingData.reversePricing.toNorthEast][deliveryType as keyof typeof pricingData.reversePricing.toNorthEast.byRoad]) || 0;
        price = pricePerKg * chargeableWeight;
        transportMode = transportKey;
      } else {
        // Not applicable for reverse pricing
        return;
      }
    } else {
      // Normal pricing logic
      location = classifyLocation(bookingData.destinationData.pincode, isAir);

      if (natureOfConsignment === 'DOX') {
        // DOX pricing logic
        if (isPriority) {
          // Priority Service pricing
          if (weight <= 500) {
            price = parseFloat(pricingData.priorityPricing['01gm-500gm'][location as keyof typeof pricingData.priorityPricing['01gm-500gm']]) || 0;
          } else {
            // For weights above 500gm, use base price + additional 500gm charges
            const basePrice = parseFloat(pricingData.priorityPricing['01gm-500gm'][location as keyof typeof pricingData.priorityPricing['01gm-500gm']]) || 0;
            const additionalWeight = Math.ceil((weight - 500) / 500);
            const additionalPrice = parseFloat(pricingData.priorityPricing.add500gm[location as keyof typeof pricingData.priorityPricing.add500gm]) || 0;
            price = basePrice + (additionalWeight * additionalPrice);
          }
        } else {
          // Standard Service pricing
          if (weight <= 250) {
            price = parseFloat(pricingData.doxPricing['01gm-250gm'][location as keyof typeof pricingData.doxPricing['01gm-250gm']]) || 0;
          } else if (weight <= 500) {
            price = parseFloat(pricingData.doxPricing['251gm-500gm'][location as keyof typeof pricingData.doxPricing['251gm-500gm']]) || 0;
          } else {
            // For weights above 500gm, use base price + additional 500gm charges
            const basePrice = parseFloat(pricingData.doxPricing['251gm-500gm'][location as keyof typeof pricingData.doxPricing['251gm-500gm']]) || 0;
            const additionalWeight = Math.ceil((weight - 500) / 500);
            const additionalPrice = parseFloat(pricingData.doxPricing.add500gm[location as keyof typeof pricingData.doxPricing.add500gm]) || 0;
            price = basePrice + (additionalWeight * additionalPrice);
          }
        }
      } else {
        // NON-DOX pricing logic (per kg)
        if (isAir) {
          const pricePerKg = parseFloat(pricingData.nonDoxAirPricing[location as keyof typeof pricingData.nonDoxAirPricing]) || 0;
          price = pricePerKg * weight;
        } else {
          const pricePerKg = parseFloat(pricingData.nonDoxSurfacePricing[location as keyof typeof pricingData.nonDoxSurfacePricing]) || 0;
          price = pricePerKg * weight;
        }
      }
    }

    const gst = price * 0.18;
    const finalPrice = price + gst;

    setBookingData(prev => ({
      ...prev,
      invoiceData: {
        ...prev.invoiceData,
        calculatedPrice: price,
        gst: gst,
        finalPrice: finalPrice,
        serviceType: natureOfConsignment,
        location: location,
        transportMode: transportMode || bookingData.shipmentData.mode,
        chargeableWeight: chargeableWeight
      }
    }));
  };

  const [bookingData, setBookingData] = useState<CorporateBookingData>({
    originData: {
      useCurrentAddress: true,
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
      addressType: 'Corporate',
      birthday: '',
      anniversary: '',
      otherAlternateNumber: '',
      showOtherAlternateNumber: false,
      website: ''
    },
    destinationData: {
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
    },
    shipmentData: {
      natureOfConsignment: 'NON-DOX',
      services: 'Standard',
      mode: 'Air',
      insurance: 'Consignor not insured the shipment',
      riskCoverage: 'Owner',
      dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
      actualWeight: '',
      volumetricWeight: 0,
      chargeableWeight: 0,
      totalPackages: '',
      materials: '',
      packageImages: [],
      uploadedFiles: [],
      description: '',
      specialInstructions: ''
    },
    invoiceData: {
      billingAddress: '',
      paymentMethod: 'Corporate Credit',
      terms: '',
      calculatedPrice: 0,
      gst: 0,
      finalPrice: 0,
      serviceType: '',
      location: '',
      transportMode: '',
      chargeableWeight: 0
    },
    paymentData: {
      paymentType: 'FP' // Default to Freight Paid
    }
  });

  // Calculate price when relevant fields change
  useEffect(() => {
    if (currentStep >= 3 && pricingData) {
      calculateCorporatePrice();
    }
  }, [
    bookingData.originData.pincode,
    bookingData.destinationData.pincode,
    bookingData.shipmentData.actualWeight,
    bookingData.shipmentData.natureOfConsignment,
    bookingData.shipmentData.services,
    bookingData.shipmentData.mode,
    pricingData,
    currentStep
  ]);

  // Load corporate information on component mount
  useEffect(() => {
    const fetchCorporateProfile = async () => {
      try {
        const token = localStorage.getItem('corporateToken');
        if (!token) return;

        // Fetch full corporate profile from API
        const response = await fetch('/api/corporate/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const corporateData = data.corporate;
        setCorporateInfo(corporateData);

        // If corporate data doesn't have complete city information, try to fetch from pincode
        if (corporateData.pin && (!corporateData.city || !corporateData.state)) {
          try {
            const pincodeResponse = await fetch(`/api/pincode/${corporateData.pin}/simple`);
            if (pincodeResponse.ok) {
              const pincodeData = await pincodeResponse.json();
              // Update corporate data with pincode information
              const updatedCorporateData = {
                ...corporateData,
                city: corporateData.city || pincodeData.city,
                state: corporateData.state || pincodeData.state,
                locality: corporateData.locality || pincodeData.district
              };
              setCorporateInfo(updatedCorporateData);
              corporateData.city = updatedCorporateData.city;
              corporateData.state = updatedCorporateData.state;
              corporateData.locality = updatedCorporateData.locality;
            }
          } catch (pincodeError) {
            console.error('Error fetching pincode data:', pincodeError);
          }
        }

        // Pre-fill origin data with corporate information
        setBookingData(prev => ({
          ...prev,
          originData: {
            ...prev.originData,
            name: corporateData.companyName || '',
            companyName: corporateData.companyName || '',
            email: corporateData.email || '',
            mobileNumber: corporateData.contactNumber || '',
            pincode: corporateData.pin || '',
            city: corporateData.city || '',
            state: corporateData.state || '',
            locality: corporateData.companyAddress || '',
              flatBuilding: corporateData.flatNumber || '',
              landmark: corporateData.landmark || '',
              area: corporateData.locality || '',
              gstNumber: corporateData.gstNumber || '',
            addressType: 'Corporate'
          }
        }));
        } else {
          // Fallback to localStorage if API fails
          const storedCorporateInfo = localStorage.getItem('corporateInfo');
          if (storedCorporateInfo) {
            const corporateData = JSON.parse(storedCorporateInfo);
            setCorporateInfo(corporateData);

            // Pre-fill origin data with corporate information from localStorage
            setBookingData(prev => ({
              ...prev,
              originData: {
                ...prev.originData,
                name: corporateData.companyName || '',
                companyName: corporateData.companyName || '',
                email: corporateData.email || '',
                mobileNumber: corporateData.contactNumber || '',
                pincode: corporateData.pin || '',
                city: corporateData.city || '',
                state: corporateData.state || '',
                locality: corporateData.companyAddress || '',
                flatBuilding: corporateData.flatNumber || '',
                landmark: corporateData.landmark || '',
                area: corporateData.locality || '',
                gstNumber: corporateData.gstNumber || '',
                addressType: 'Corporate'
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching corporate profile:', error);
        // Fallback to localStorage
        const storedCorporateInfo = localStorage.getItem('corporateInfo');
        if (storedCorporateInfo) {
          try {
            const corporateData = JSON.parse(storedCorporateInfo);
            setCorporateInfo(corporateData);

            // Pre-fill origin data with corporate information from localStorage
            setBookingData(prev => ({
              ...prev,
              originData: {
                ...prev.originData,
                name: corporateData.companyName || '',
                companyName: corporateData.companyName || '',
                email: corporateData.email || '',
                mobileNumber: corporateData.contactNumber || '',
                pincode: corporateData.pin || '',
                city: corporateData.city || '',
                state: corporateData.state || '',
                locality: corporateData.companyAddress || '',
                flatBuilding: corporateData.flatNumber || '',
                landmark: corporateData.landmark || '',
                area: corporateData.locality || '',
                gstNumber: corporateData.gstNumber || '',
                addressType: 'Corporate'
              }
            }));
          } catch (parseError) {
            console.error('Error parsing stored corporate info:', parseError);
          }
        }
      }
    };

    fetchCorporateProfile();
  }, []);

  // Pincode lookup function
  const lookupPincode = async (pincode: string, type: 'origin' | 'destination') => {
    if (!pincode || pincode.length !== 6) return;

    if (type === 'origin') {
      setIsLoadingPincode(true);
    } else {
      setIsLoadingDestinationPincode(true);
    }

    try {
      const response = await fetch(`/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();

        if (type === 'origin') {
          setBookingData(prev => ({
            ...prev,
            originData: {
              ...prev.originData,
              state: data.state || '',
              city: data.city || '',
              district: data.district || '',
              area: ''
            }
          }));
          setAvailableAreas(data.areas || []);
        } else {
          setBookingData(prev => ({
            ...prev,
            destinationData: {
              ...prev.destinationData,
              state: data.state || '',
              city: data.city || '',
              district: data.district || '',
              area: ''
            }
          }));
          setDestinationAreas(data.areas || []);
        }
      } else {
        toast({
          title: "Pincode Not Found",
          description: "The entered pincode is not serviceable in our database.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      toast({
        title: "Error",
        description: "Failed to lookup pincode. Please try again.",
        variant: "destructive"
      });
    } finally {
      if (type === 'origin') {
        setIsLoadingPincode(false);
      } else {
        setIsLoadingDestinationPincode(false);
      }
    }
  };

  // Handle pincode change
  const handlePincodeChange = (pincode: string, type: 'origin' | 'destination') => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    if (type === 'origin') {
      setBookingData(prev => ({
        ...prev,
        originData: { ...prev.originData, pincode: numericPincode }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        destinationData: { ...prev.destinationData, pincode: numericPincode }
      }));
    }

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode, type);
    }
  };

  // Handle file upload with compression and validation
  const handleFileUpload = async (files: File[]) => {
    try {
      // Validate files
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          toast({
            title: "Invalid File",
            description: validation.error,
            variant: "destructive",
          });
          return;
        }
      }

      // Compress images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      // Upload to server
      const uploadResult = await uploadFiles(compressedFiles);
      
      if (uploadResult.success) {
        setBookingData(prev => ({
          ...prev,
          shipmentData: {
            ...prev.shipmentData,
            packageImages: [...prev.shipmentData.packageImages, ...compressedFiles],
            uploadedFiles: [...prev.shipmentData.uploadedFiles, ...uploadResult.files]
          }
        }));

        toast({
          title: "Files Uploaded",
          description: `${uploadResult.files.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    // Clean up object URL to prevent memory leaks
    const fileToRemove = bookingData.shipmentData.packageImages[index];
    if (fileToRemove && fileToRemove.type.startsWith('image/')) {
      URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
    }

    setBookingData(prev => ({
      ...prev,
      shipmentData: {
        ...prev.shipmentData,
        packageImages: prev.shipmentData.packageImages.filter((_, i) => i !== index),
        uploadedFiles: prev.shipmentData.uploadedFiles.filter((_, i) => i !== index)
      }
    }));
  };

  // Validation function
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Origin validation
      if (!bookingData.originData.useCurrentAddress) {
        if (!bookingData.originData.name) newErrors.originName = 'Name is required';
        if (!bookingData.originData.email) newErrors.originEmail = 'Email is required';
        if (!bookingData.originData.mobileNumber) newErrors.originMobileNumber = 'Mobile number is required';
        else if (!validateMobileNumber(bookingData.originData.mobileNumber)) newErrors.originMobileNumber = 'Please enter a valid 10-digit mobile number';
        if (!bookingData.originData.pincode) newErrors.originPincode = 'Pincode is required';
        if (bookingData.originData.pincode.length === 6 && !bookingData.originData.area) newErrors.originArea = 'Area is required';
        if (!bookingData.originData.locality) newErrors.originLocality = 'Locality is required';
        if (!bookingData.originData.flatBuilding) newErrors.originFlatBuilding = 'Flat/Building is required';
        if (bookingData.originData.gstNumber && bookingData.originData.gstNumber.length > 0 && bookingData.originData.gstNumber.length < 15) {
          newErrors.originGstNumber = 'Please complete the 15-digit GST number or leave it empty';
        }
      }
    } else if (currentStep === 2) {
      // Destination validation
      if (!bookingData.destinationData.name) newErrors.destinationName = 'Name is required';
      if (!bookingData.destinationData.email) newErrors.destinationEmail = 'Email is required';
        if (!bookingData.destinationData.mobileNumber) newErrors.destinationMobileNumber = 'Mobile number is required';
        else if (!validateMobileNumber(bookingData.destinationData.mobileNumber)) newErrors.destinationMobileNumber = 'Please enter a valid 10-digit mobile number';
      if (!bookingData.destinationData.pincode) newErrors.destinationPincode = 'Pincode is required';
        if (bookingData.destinationData.pincode.length === 6 && !bookingData.destinationData.area) newErrors.destinationArea = 'Area is required';
      if (!bookingData.destinationData.locality) newErrors.destinationLocality = 'Locality is required';
      if (!bookingData.destinationData.flatBuilding) newErrors.destinationFlatBuilding = 'Flat/Building is required';
        if (bookingData.destinationData.gstNumber && bookingData.destinationData.gstNumber.length > 0 && bookingData.destinationData.gstNumber.length < 15) {
          newErrors.destinationGstNumber = 'Please complete the 15-digit GST number or leave it empty';
        }
    } else if (currentStep === 3) {
      // Shipment validation
      if (!bookingData.shipmentData.natureOfConsignment) newErrors.natureOfConsignment = 'Nature of consignment is required';
      if (!bookingData.shipmentData.actualWeight) newErrors.actualWeight = 'Weight is required';
      if (!bookingData.shipmentData.description) newErrors.description = 'Description is required';
      if (bookingData.shipmentData.packageImages.length === 0) newErrors.packageImages = 'At least one document is required';
    } else if (currentStep === 4) {
      // Payment validation
      if (!bookingData.paymentData.paymentType) newErrors.paymentType = 'Payment type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Handle phone number lookup
  const handlePhoneLookup = async (phone: string) => {
    setIsLookingUpPhone(true);
    try {
      console.log('=== PHONE LOOKUP DEBUG ===');
      console.log('Searching for phone:', phone);

      // Clean the search phone number
      const cleanSearchPhone = phone.replace(/\D/g, '');
      console.log('Clean search phone:', cleanSearchPhone);

      // Get authentication token
      const token = localStorage.getItem('corporateToken');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }

      // Call API to fetch previous destinations
      const response = await fetch(`/api/corporate/destinations/phone/${cleanSearchPhone}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch destinations');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log(`Found ${result.data.length} previous destinations`);
        setPreviousDestinations(result.data);
        setCountdown(null); // Clear countdown when destinations are found
        return result.data;
      } else {
        console.log('No previous destinations found');
        setPreviousDestinations([]);
        
        // Start countdown for auto-redirect
        setCountdown(4);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              setCountdown(null);
              // Auto-redirect to destination form
              setShowPhonePopup(false);
              setCurrentStep(2);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        return [];
      }
    } catch (error) {
      console.error('Error looking up phone number:', error);
      setPreviousDestinations([]);
      
      // Show error toast
      toast({
        title: "Lookup Failed",
        description: "Failed to search for previous destinations. Please try again.",
        variant: "destructive"
      });
      
      return [];
    } finally {
      setIsLookingUpPhone(false);
      console.log('=== END PHONE LOOKUP DEBUG ===');
    }
  };

  // Handle destination selection and auto-fill
  const handleDestinationSelect = (destination: any) => {
    setSelectedDestination(destination);
    setCountdown(null); // Clear countdown when destination is selected
    setBookingData(prev => ({
      ...prev,
      destinationData: {
        name: destination.name,
        companyName: destination.companyName,
        email: destination.email,
        mobileNumber: destination.mobileNumber,
        locality: destination.locality,
        flatBuilding: destination.flatBuilding,
        landmark: destination.landmark,
        pincode: destination.pincode,
        area: destination.area,
        city: destination.city,
        district: destination.district,
        state: destination.state,
        gstNumber: destination.gstNumber,
        addressType: destination.addressType,
        alternateNumbers: destination.alternateNumbers || [],
        website: destination.website || '',
        anniversary: destination.anniversary || '',
        birthday: destination.birthday || ''
      }
    }));

    // Close the popup and proceed to next step
    setShowPhonePopup(false);
    setCountdown(null); // Clear countdown when popup is closed
    setCurrentStep(2);

    toast({
      title: "Destination Auto-filled",
      description: "Selected destination address has been filled automatically.",
    });
  };

  // Handle phone popup submission
  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive"
      });
      return;
    }

    const destinations = await handlePhoneLookup(phoneNumber);

    if (destinations.length === 1) {
      // Auto-fill destination with the single result
      handleDestinationSelect(destinations[0]);
    } else if (destinations.length > 1) {
      // Multiple destinations found - show selection options (handled in UI)
      toast({
        title: "Multiple Destinations Found",
        description: "Please select the destination address you want to use.",
      });
    } else {
      // No previous data found, go to destination step for manual entry
      toast({
        title: "No Previous Data Found",
        description: "No previous destinations found for this phone number. Please enter manually.",
      });

      setShowPhonePopup(false);
      setCountdown(null); // Clear countdown when popup is closed
      setCurrentStep(2); // Go to destination step
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 1) {
        // After origin, show phone popup
        setShowPhonePopup(true);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    // Check if consignments are available before proceeding
    if (consignmentCheck.hasAssignment && consignmentCheck.summary?.availableCount === 0) {
      setShowConsignmentFinishedPopup(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('corporateToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare booking data for API
      const bookingPayload = {
        originData: bookingData.originData,
        destinationData: bookingData.destinationData,
        shipmentData: {
          ...bookingData.shipmentData,
          uploadedFiles: bookingData.shipmentData.uploadedFiles // Include uploaded file references
        },
        invoiceData: bookingData.invoiceData,
        paymentData: bookingData.paymentData, // Include payment data with paymentType
        bookingDate: new Date().toISOString(),
        status: 'booked',
        paymentStatus: 'unpaid'
      };

      try {
        const response = await fetch('/api/corporate/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingPayload)
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an invalid response. Please try again.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          // Check if it's a consignment finished error
          if (errorData.error && errorData.error.includes('All consignment numbers have been used')) {
            setShowConsignmentFinishedPopup(true);
            return;
          }
          throw new Error(errorData.error || errorData.message || 'Failed to submit booking');
        }

        const result = await response.json();

      toast({
        title: "Booking Submitted",
          description: `Your shipment has been booked successfully! Consignment Number: ${result.consignmentNumber}`,
        });

        // Set completion state
        setIsBookingComplete(true);
        setBookingReference(result.bookingReference || result.consignmentNumber || `OCL-${Date.now().toString().slice(-8)}`);

      } catch (apiError) {
        // If API fails, fall back to local storage
        console.log('Using local storage for booking data');

        // Store booking in local storage
        const existingBookings = JSON.parse(localStorage.getItem('corporateBookings') || '[]');
        const newBooking = {
          ...bookingPayload,
          _id: `booking_${Date.now()}`,
          bookingReference: `OCL-${Date.now().toString().slice(-8)}`,
          paymentStatus: 'unpaid'
        };
        existingBookings.push(newBooking);
        localStorage.setItem('corporateBookings', JSON.stringify(existingBookings));

        toast({
          title: "Booking Submitted",
          description: "Your shipment has been booked successfully!",
        });

        // Set completion state
        setIsBookingComplete(true);
        setBookingReference(newBooking.bookingReference);
      }

    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new booking
  const handleNewBooking = () => {
    setIsBookingComplete(false);
      setCurrentStep(1);
    setBookingReference('');
      setBookingData({
        originData: {
          useCurrentAddress: true,
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
        addressType: 'Corporate',
        birthday: '',
        anniversary: '',
        otherAlternateNumber: '',
        showOtherAlternateNumber: false,
        website: ''
        },
        destinationData: {
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
        },
        shipmentData: {
        natureOfConsignment: 'NON-DOX',
        services: 'Standard',
        mode: 'Air',
        insurance: 'Consignor not insured the shipment',
        riskCoverage: 'Owner',
        dimensions: [{ length: '', breadth: '', height: '', unit: 'cm' }],
        actualWeight: '',
        volumetricWeight: 0,
        chargeableWeight: 0,
        totalPackages: '',
        materials: '',
        packageImages: [],
        uploadedFiles: [],
          description: '',
        specialInstructions: ''
        },
        invoiceData: {
          billingAddress: '',
        paymentMethod: 'Corporate Credit',
        terms: '',
        calculatedPrice: 0,
        gst: 0,
        finalPrice: 0,
        serviceType: '',
        location: '',
        transportMode: '',
        chargeableWeight: 0
      },
      paymentData: {
        paymentType: 'FP' // Default to Freight Paid
      }
    });
  };

  // Handle track progress
  const handleTrackProgress = () => {
    // Navigate to tracking page or open tracking modal
      toast({
      title: "Track Progress",
      description: `Tracking reference: ${bookingReference}`,
      });
  };

  const steps = [
    { number: 1, title: 'Origin', icon: <MapPin className="h-5 w-5" /> },
    { number: 2, title: 'Destination', icon: <Truck className="h-5 w-5" /> },
    { number: 3, title: 'Shipment Details', icon: <Package className="h-5 w-5" /> }
  ];

  // Show completion overview if booking is complete
  if (isBookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-12 w-12 text-white" />
            </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Successful!</h1>
              <p className="text-gray-600 text-lg">Your shipment has been booked successfully</p>
        </div>

              {/* Booking Confirmed Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                    <h2 className="text-xl font-bold text-green-800">Booking Confirmed</h2>
                </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
                    <p className="text-2xl font-bold text-green-700 font-mono mb-2">{bookingReference}</p>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Confirmed
                    </Badge>
                  </div>

                  <p className="text-xs text-green-600 mt-3">
                    📱 Please save this reference number for tracking your shipment
                  </p>
                </div>
              </div>

              {/* Action Button */}
                <Button
                  onClick={handleNewBooking}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Booking
                </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-2xl p-6 border border-gray-100 shadow-lg mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Shipment Booking</h2>
            <p className="text-gray-600">Book your shipment with OCL Services</p>
          </div>
        </div>
      </div>

      {/* Consignment Assignment Status - Only show on origin step */}
      {currentStep === 1 && consignmentCheck.isLoading ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700">Checking consignment assignment status...</p>
          </div>
        </div>
      ) : currentStep === 1 && !consignmentCheck.hasAssignment ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Consignment Assignment Required</h3>
              <p className="text-red-700 mb-4">{consignmentCheck.message}</p>
              <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">What you need to do:</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Contact your admin to get consignment numbers assigned</li>
                  <li>• Once assigned, you'll be able to create bookings</li>
                  <li>• Each booking will automatically use the next available consignment number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : currentStep === 1 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-green-700 font-medium">{consignmentCheck.message}</p>
              {consignmentCheck.summary && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-green-600">
                    Total Assigned: {consignmentCheck.summary.totalAssigned} | 
                    Used: {consignmentCheck.summary.usedCount} | 
                    Available: {consignmentCheck.summary.availableCount} 
                    ({consignmentCheck.summary.usagePercentage}% used)
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Usage Progress</span>
                      <span>{consignmentCheck.summary.usagePercentage}%</span>
                    </div>
                    <Progress 
                      value={consignmentCheck.summary.usagePercentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              )}
              {consignmentCheck.assignments && consignmentCheck.assignments.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-medium mb-1">Assignment Ranges:</p>
                  <div className="space-y-1">
                    {consignmentCheck.assignments.map((assignment, index) => (
                      <div key={assignment._id} className="text-xs text-green-600">
                        Range {index + 1}: {assignment.startNumber} - {assignment.endNumber}
                        ({assignment.totalNumbers} numbers)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Progress Steps - Sticky */}
      <Card className="sticky top-32 z-40 bg-white border border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <div className="scale-110">{step.icon}</div>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-semibold transition-colors duration-300 ${
                    currentStep >= step.number ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-6 rounded-full transition-all duration-300 ${
                    currentStep > step.number ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Popup */}
      <Dialog open={showPhonePopup} onOpenChange={setShowPhonePopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Destination Phone Number</DialogTitle>
            <DialogDescription>
              Enter the phone number of the destination to auto-fill the address.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <FloatingLabelInput
              id="destination-phone"
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                setCountdown(null); // Clear countdown when phone number changes
              }}
              placeholder="Phone Number"
              type="tel"
              maxLength={10}
              icon={<Phone className="h-5 w-5" />}
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={handlePhoneSubmit}
              disabled={isLookingUpPhone}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLookingUpPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step Content */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          {/* Disable form if no consignment assignment */}
          {!consignmentCheck.hasAssignment ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Booking Not Available</h3>
              <p className="text-gray-500">Please contact your admin to get consignment numbers assigned before making bookings.</p>
            </div>
          ) : (
            <>
              {/* Step 1: Origin */}
              {currentStep === 1 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Origin Address</h3>
                      <p className="text-sm text-gray-600">Enter the pickup location details</p>
                    </div>
                  </div>

                  {/* Default Corporate Address - Only show when useCurrentAddress is true */}
                  {corporateInfo && bookingData.originData.useCurrentAddress && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-800">Default Corporate Address</h4>
                            <p className="text-sm text-gray-600">Your registered corporate address</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBookingData(prev => ({
                        ...prev,
                        originData: {
                          ...prev.originData,
                          useCurrentAddress: false,
                          // Clear all form fields for alternative address
                          name: '',
                          companyName: '',
                          email: '',
                          mobileNumber: '',
                          locality: '',
                          flatBuilding: '',
                          landmark: '',
                          pincode: '',
                          area: '',
                          city: '',
                          district: '',
                          state: '',
                          gstNumber: '',
                          alternateNumbers: [],
                          addressType: 'Home',
                          birthday: '',
                          anniversary: '',
                          otherAlternateNumber: '',
                          showOtherAlternateNumber: false,
                          website: ''
                        }
                      }))}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Add another address
                    </Button>
                  </div>
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-sm text-gray-700 space-y-1">
                        <div><strong>Company:</strong> {corporateInfo.companyName}</div>
                        <div><strong>Address:</strong> {corporateInfo.companyAddress || 'N/A'}</div>
                        <div><strong>City:</strong> {corporateInfo.city || 'N/A'}, {corporateInfo.state || 'N/A'} - {corporateInfo.pin || 'N/A'}</div>
                      </p>
                    </div>
                </div>
                )}

                {/* Address Form - Only show when useCurrentAddress is false */}
                {!bookingData.originData.useCurrentAddress && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-800">Alternative Address</h4>
                            <p className="text-sm text-gray-600">Enter a different pickup location</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (corporateInfo) {
                              setBookingData(prev => ({
                                ...prev,
                                originData: {
                                  ...prev.originData,
                                  useCurrentAddress: true,
                                  // Restore corporate data
                                  name: corporateInfo.companyName || '',
                                  companyName: corporateInfo.companyName || '',
                                  email: corporateInfo.email || '',
                                  mobileNumber: corporateInfo.contactNumber || '',
                                  pincode: corporateInfo.pin || '',
                                  city: corporateInfo.city || '',
                                  state: corporateInfo.state || '',
                                  locality: corporateInfo.companyAddress || '',
                                  flatBuilding: corporateInfo.flatNumber || '',
                                  landmark: corporateInfo.landmark || '',
                                  area: corporateInfo.locality || '',
                                  gstNumber: corporateInfo.gstNumber || '',
                                  addressType: 'Corporate'
                                }
                              }));
                            } else {
                              setBookingData(prev => ({
                                ...prev,
                                originData: { ...prev.originData, useCurrentAddress: true }
                              }));
                            }
                          }}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          Back to default address
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="originName"
                        value={bookingData.originData.name}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, name: value }
                        }))}
                        placeholder="Contact Name"
                        icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
                        error={errors.originName}
                        required
                      />

                      <FloatingLabelInput
                        id="originCompany"
                        value={bookingData.originData.companyName}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, companyName: value }
                        }))}
                        placeholder="Company Name"
                        icon={<Building className="h-4 w-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="originEmail"
                        value={bookingData.originData.email}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, email: value }
                        }))}
                        placeholder="Email Address"
                        type="email"
                        icon={<Mail className="h-4 w-4" />}
                        error={errors.originEmail}
                        required
                      />

                      <FloatingLabelInput
                        id="originMobileNumber"
                        value={bookingData.originData.mobileNumber}
                        onChange={(value) => {
                          const cleanValue = value.replace(/\D/g, '').slice(0, 10);
                          setBookingData(prev => ({
                          ...prev,
                            originData: { ...prev.originData, mobileNumber: cleanValue }
                          }));
                          // Validate mobile number
                          if (cleanValue.length === 10) {
                            setOriginMobileError(!validateMobileNumber(cleanValue));
                          } else {
                            setOriginMobileError(false);
                          }
                        }}
                        placeholder="Mobile Number"
                        type="tel"
                        maxLength={10}
                        icon={<Phone className="h-4 w-4" />}
                        error={errors.originMobileNumber || (originMobileError ? 'Please enter a valid 10-digit mobile number' : '')}
                        required
                      />
                    </div>

                    <FloatingLabelInput
                      id="originPincode"
                      value={bookingData.originData.pincode}
                      onChange={(value) => handlePincodeChange(value, 'origin')}
                      placeholder="Pincode"
                      maxLength={6}
                      icon={isLoadingPincode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />
                      )}
                      error={errors.originPincode}
                      required
                    />

                    {bookingData.originData.pincode.length === 6 && (
                      <div>
                        <FloatingSelect
                          label="Area"
                          value={bookingData.originData.area}
                          onChange={(value) => setBookingData(prev => ({
                            ...prev,
                            originData: { ...prev.originData, area: value }
                          }))}
                          options={availableAreas.length > 0 ? availableAreas : ['This pincode is not serviceable']}
                          required
                          disabled={availableAreas.length === 0}
                          icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        />
                        {errors.originArea && (
                          <p className="text-sm text-red-600 mt-1">{errors.originArea}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="originLocality"
                        value={bookingData.originData.locality}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, locality: value }
                        }))}
                        placeholder="Locality/Street"
                        icon={<img src="/src/Icon-images/streets.png" alt="streets" className="h-4 w-4" />}
                        error={errors.originLocality}
                        required
                      />

                      <FloatingLabelInput
                        id="originFlatBuilding"
                        value={bookingData.originData.flatBuilding}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, flatBuilding: value }
                        }))}
                        placeholder="Flat/Building No."
                        icon={<Building className="h-4 w-4" />}
                        error={errors.originFlatBuilding}
                        required
                      />
                    </div>

                    <FloatingLabelInput
                      id="originLandmark"
                      value={bookingData.originData.landmark}
                      onChange={(value) => setBookingData(prev => ({
                        ...prev,
                        originData: { ...prev.originData, landmark: value }
                      }))}
                      placeholder="Landmark (Optional)"
                      icon={<img src="/src/Icon-images/landmark.png" alt="landmark" className="h-4 w-4" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="originGstNumber"
                      value={bookingData.originData.gstNumber}
                      onChange={(value) => {
                        const formattedGST = validateGSTFormat(value);
                        setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, gstNumber: formattedGST }
                        }));
                        // Validate GST: if partially filled (1-14 chars), show error
                        if (formattedGST.length > 0 && formattedGST.length < 15) {
                          setOriginGstError(true);
                        } else {
                          setOriginGstError(false);
                        }
                      }}
                      placeholder="GST Number (Optional)"
                      maxLength={15}
                      icon={<Building className="h-4 w-4" />}
                      error={originGstError ? 'Please complete the 15-digit GST number or leave it empty' : ''}
                    />

                      <FloatingLabelInput
                        id="originWebsite"
                        value={bookingData.originData.website}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, website: value }
                        }))}
                        placeholder="Website (Optional)"
                        icon={<img src="/src/Icon-images/world-wide-web.png" alt="website" className="h-4 w-4" />}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originAddressType" className="text-sm font-medium">
                        Address Type
                      </Label>
                      <Select
                        value={bookingData.originData.addressType}
                        onValueChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, addressType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City, District, State Fields - Only show when not using current address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FloatingLabelInput
                        id="originCity"
                        value={bookingData.originData.city}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, city: value }
                        }))}
                        placeholder="City"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id="originDistrict"
                        value={bookingData.originData.district}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, district: value }
                        }))}
                        placeholder="District"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id="originState"
                        value={bookingData.originData.state}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          originData: { ...prev.originData, state: value }
                        }))}
                        placeholder="State"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Step 2: Destination */}
              {currentStep === 2 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Destination Address</h3>
                      <p className="text-sm text-gray-600">Enter the delivery location details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="destinationName"
                        value={bookingData.destinationData.name}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, name: value }
                        }))}
                        placeholder="Contact Name"
                        icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
                        error={errors.destinationName}
                        required
                      />

                      <FloatingLabelInput
                        id="destinationCompany"
                        value={bookingData.destinationData.companyName}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, companyName: value }
                        }))}
                        placeholder="Company Name"
                        icon={<Building className="h-4 w-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="destinationEmail"
                        value={bookingData.destinationData.email}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, email: value }
                        }))}
                        placeholder="Email Address"
                        type="email"
                        icon={<Mail className="h-4 w-4" />}
                        error={errors.destinationEmail}
                        required
                      />

                      <FloatingLabelInput
                        id="destinationMobileNumber"
                        value={bookingData.destinationData.mobileNumber}
                        onChange={(value) => {
                          const cleanValue = value.replace(/\D/g, '').slice(0, 10);
                          setBookingData(prev => ({
                          ...prev,
                            destinationData: { ...prev.destinationData, mobileNumber: cleanValue }
                          }));
                          // Validate mobile number
                          if (cleanValue.length === 10) {
                            setDestinationMobileError(!validateMobileNumber(cleanValue));
                          } else {
                            setDestinationMobileError(false);
                          }
                        }}
                        placeholder="Mobile Number"
                        type="tel"
                        maxLength={10}
                        icon={<Phone className="h-4 w-4" />}
                        error={errors.destinationMobileNumber || (destinationMobileError ? 'Please enter a valid 10-digit mobile number' : '')}
                        required
                      />
                    </div>

                    <FloatingLabelInput
                      id="destinationPincode"
                      value={bookingData.destinationData.pincode}
                      onChange={(value) => handlePincodeChange(value, 'destination')}
                      placeholder="Pincode"
                      maxLength={6}
                      icon={isLoadingDestinationPincode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />
                      )}
                      error={errors.destinationPincode}
                      required
                    />

                    {bookingData.destinationData.pincode.length === 6 && (
                      <div>
                        <FloatingSelect
                          label="Area"
                          value={bookingData.destinationData.area}
                          onChange={(value) => setBookingData(prev => ({
                            ...prev,
                            destinationData: { ...prev.destinationData, area: value }
                          }))}
                          options={destinationAreas.length > 0 ? destinationAreas : ['This pincode is not serviceable']}
                          required
                          disabled={destinationAreas.length === 0}
                          icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        />
                        {errors.destinationArea && (
                          <p className="text-sm text-red-600 mt-1">{errors.destinationArea}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FloatingLabelInput
                        id="destinationCity"
                        value={bookingData.destinationData.city}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, city: value }
                        }))}
                        placeholder="City"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id="destinationDistrict"
                        value={bookingData.destinationData.district}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, district: value }
                        }))}
                        placeholder="District"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id="destinationState"
                        value={bookingData.destinationData.state}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, state: value }
                        }))}
                        placeholder="State"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="destinationLocality"
                        value={bookingData.destinationData.locality}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, locality: value }
                        }))}
                        placeholder="Locality/Street"
                        icon={<img src="/src/Icon-images/streets.png" alt="streets" className="h-4 w-4" />}
                        error={errors.destinationLocality}
                        required
                      />

                      <FloatingLabelInput
                        id="destinationFlatBuilding"
                        value={bookingData.destinationData.flatBuilding}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, flatBuilding: value }
                        }))}
                        placeholder="Flat/Building No."
                        icon={<Building className="h-4 w-4" />}
                        error={errors.destinationFlatBuilding}
                        required
                      />
                    </div>

                    <FloatingLabelInput
                      id="destinationLandmark"
                      value={bookingData.destinationData.landmark}
                      onChange={(value) => setBookingData(prev => ({
                        ...prev,
                        destinationData: { ...prev.destinationData, landmark: value }
                      }))}
                      placeholder="Landmark (Optional)"
                      icon={<img src="/src/Icon-images/landmark.png" alt="landmark" className="h-4 w-4" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="destinationGstNumber"
                        value={bookingData.destinationData.gstNumber}
                        onChange={(value) => {
                          const formattedGST = validateGSTFormat(value);
                          setBookingData(prev => ({
                            ...prev,
                            destinationData: { ...prev.destinationData, gstNumber: formattedGST }
                          }));
                          // Validate GST: if partially filled (1-14 chars), show error
                          if (formattedGST.length > 0 && formattedGST.length < 15) {
                            setDestinationGstError(true);
                          } else {
                            setDestinationGstError(false);
                          }
                        }}
                        placeholder="GST Number (Optional)"
                        maxLength={15}
                        icon={<Building className="h-4 w-4" />}
                        error={destinationGstError ? 'Please complete the 15-digit GST number or leave it empty' : ''}
                      />

                      <FloatingLabelInput
                        id="destinationWebsite"
                        value={bookingData.destinationData.website}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, website: value }
                        }))}
                        placeholder="Website (Optional)"
                        icon={<img src="/src/Icon-images/world-wide-web.png" alt="website" className="h-4 w-4" />}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destinationAddressType" className="text-sm font-medium">
                        Address Type
                      </Label>
                      <Select
                        value={bookingData.destinationData.addressType}
                        onValueChange={(value) => setBookingData(prev => ({
                          ...prev,
                          destinationData: { ...prev.destinationData, addressType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Shipment Details */}
              {currentStep === 3 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-sm">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Shipment Details</h3>
                      <p className="text-sm text-gray-600">Provide package information and service preferences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Service Selection */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Package className="h-5 w-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-800 text-lg">Service Selection</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="natureOfConsignment" className="text-sm font-medium">
                            Nature of Consignment <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={bookingData.shipmentData.natureOfConsignment}
                          onValueChange={(value) => setBookingData(prev => ({
                            ...prev,
                              shipmentData: { ...prev.shipmentData, natureOfConsignment: value }
                          }))}
                        >
                          <SelectTrigger>
                              <SelectValue placeholder="Select nature of consignment" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="DOX">DOX (Documents)</SelectItem>
                              <SelectItem value="NON-DOX">NON-DOX (Parcels)</SelectItem>
                          </SelectContent>
                        </Select>
                          {errors.natureOfConsignment && (
                            <p className="text-sm text-red-600">{errors.natureOfConsignment}</p>
                        )}
                      </div>

                        <div className="space-y-2">
                          <Label htmlFor="services" className="text-sm font-medium">
                            Services
                          </Label>
                          <Select
                            value={bookingData.shipmentData.services}
                            onValueChange={(value) => setBookingData(prev => ({
                              ...prev,
                              shipmentData: { ...prev.shipmentData, services: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Priority">Priority</SelectItem>
                              {/* <SelectItem value="Express">Express</SelectItem> */}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mode" className="text-sm font-medium">
                            Mode
                          </Label>
                          <Select
                            value={bookingData.shipmentData.mode}
                            onValueChange={(value) => setBookingData(prev => ({
                              ...prev,
                              shipmentData: { ...prev.shipmentData, mode: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Air">Air</SelectItem>
                              <SelectItem value="Surface">Surface</SelectItem>
                              <SelectItem value="Road">Road</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Weight & Package Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-blue-800 text-lg">Weight & Package Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingLabelInput
                          id="actualWeight"
                          value={bookingData.shipmentData.actualWeight}
                          onChange={(value) => setBookingData(prev => ({
                            ...prev,
                            shipmentData: { ...prev.shipmentData, actualWeight: value }
                          }))}
                          placeholder="Actual Weight (kg)"
                          type="number"
                          icon={<Package className="h-4 w-4" />}
                          error={errors.actualWeight}
                          required
                        />

                        <FloatingLabelInput
                          id="totalPackages"
                          value={bookingData.shipmentData.totalPackages}
                          onChange={(value) => setBookingData(prev => ({
                            ...prev,
                            shipmentData: { ...prev.shipmentData, totalPackages: value }
                          }))}
                          placeholder="Total Packages"
                          type="number"
                          icon={<Package className="h-4 w-4" />}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1 bg-gray-100 rounded">
                            <Package className="h-4 w-4 text-gray-600" />
                          </div>
                          <h4 style={{color: 'black'}} className="text-lg font-semibold text-gray-700">Dimensional Weight</h4>
                        </div>
                        {bookingData.shipmentData.dimensions.map((dimension, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
                            <FloatingLabelInput
                              id={`length-${index}`}
                              value={dimension.length}
                              onChange={(value) => {
                                const newDimensions = [...bookingData.shipmentData.dimensions];
                                newDimensions[index] = { ...newDimensions[index], length: value };
                                setBookingData(prev => ({
                                  ...prev,
                                  shipmentData: { ...prev.shipmentData, dimensions: newDimensions }
                                }));
                              }}
                              placeholder="Length (cm)"
                              type="number"
                              icon={<Package className="h-4 w-4" />}
                            />

                            <FloatingLabelInput
                              id={`breadth-${index}`}
                              value={dimension.breadth}
                              onChange={(value) => {
                                const newDimensions = [...bookingData.shipmentData.dimensions];
                                newDimensions[index] = { ...newDimensions[index], breadth: value };
                                setBookingData(prev => ({
                                  ...prev,
                                  shipmentData: { ...prev.shipmentData, dimensions: newDimensions }
                                }));
                              }}
                              placeholder="Breadth (cm)"
                              type="number"
                              icon={<Package className="h-4 w-4" />}
                            />

                            <FloatingLabelInput
                              id={`height-${index}`}
                              value={dimension.height}
                              onChange={(value) => {
                                const newDimensions = [...bookingData.shipmentData.dimensions];
                                newDimensions[index] = { ...newDimensions[index], height: value };
                                setBookingData(prev => ({
                                  ...prev,
                                  shipmentData: { ...prev.shipmentData, dimensions: newDimensions }
                                }));
                              }}
                              placeholder="Height (cm)"
                              type="number"
                              icon={<Package className="h-4 w-4" />}
                            />

                            <div className="flex items-center gap-2">
                              <Select
                                value={dimension.unit}
                                onValueChange={(value) => {
                                  const newDimensions = [...bookingData.shipmentData.dimensions];
                                  newDimensions[index] = { ...newDimensions[index], unit: value };
                                  setBookingData(prev => ({
                                    ...prev,
                                    shipmentData: { ...prev.shipmentData, dimensions: newDimensions }
                                  }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="in">in</SelectItem>
                                </SelectContent>
                              </Select>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newDimensions = bookingData.shipmentData.dimensions.filter((_, i) => i !== index);
                                    setBookingData(prev => ({
                                      ...prev,
                                      shipmentData: { ...prev.shipmentData, dimensions: newDimensions }
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setBookingData(prev => ({
                              ...prev,
                              shipmentData: {
                                ...prev.shipmentData,
                                dimensions: [...prev.shipmentData.dimensions, { length: '', breadth: '', height: '', unit: 'cm' }]
                              }
                            }));
                          }}
                          className="flex items-center gap-2 border-2 border-gray-300 shadow-md hover:shadow-lg mb-6"
                        >
                          <Plus className="h-4 w-4" />
                          Add Dimensions
                        </Button>
                      </div>

                      <FloatingLabelInput
                        id="materials"
                        value={bookingData.shipmentData.materials}
                        onChange={(value) => setBookingData(prev => ({
                          ...prev,
                          shipmentData: { ...prev.shipmentData, materials: value }
                        }))}
                        placeholder="Materials/Contents"
                        icon={<Package className="h-4 w-4" />}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Package Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={bookingData.shipmentData.description}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            shipmentData: { ...prev.shipmentData, description: e.target.value }
                          }))}
                          placeholder="Describe the contents of your package..."
                          className="min-h-[100px]"
                        />
                        {errors.description && (
                          <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialInstructions" className="text-sm font-medium">
                          Special Instructions
                        </Label>
                        <Textarea
                          id="specialInstructions"
                          value={bookingData.shipmentData.specialInstructions}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            shipmentData: { ...prev.shipmentData, specialInstructions: e.target.value }
                          }))}
                          placeholder="Any special handling instructions..."
                          className="min-h-[80px]"
                        />
                      </div>

                      {/* File Upload - Compact */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Upload Documents <span className="text-red-500">*</span>
                        </Label>
                        <FileUploadWithPreview
                          files={bookingData.shipmentData.packageImages.map((file, index) => ({
                            file,
                            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
                            id: `${file.name}-${file.size}-${index}`
                          }))}
                          onFilesChange={(uploadedFiles) => {
                            // Check if files were added or removed
                            const currentCount = bookingData.shipmentData.packageImages.length;
                            const newCount = uploadedFiles.length;
                            
                            if (newCount > currentCount) {
                              // Files were added - upload new ones
                              const newFiles = uploadedFiles.slice(currentCount).map(uf => uf.file);
                              handleFileUpload(newFiles);
                            } else {
                              // Files were removed - just update state
                              setBookingData(prev => ({
                                ...prev,
                                shipmentData: {
                                  ...prev.shipmentData,
                                  packageImages: uploadedFiles.map(uf => uf.file),
                                  uploadedFiles: prev.shipmentData.uploadedFiles.slice(0, uploadedFiles.length)
                                }
                              }));
                            }
                            
                            // Clear the upload error if files are present
                            if (uploadedFiles.length > 0 && errors.packageImages) {
                              setErrors(prev => ({
                                ...prev,
                                packageImages: undefined
                              }));
                            }
                          }}
                          maxFiles={5}
                          acceptedTypes="image/*,.pdf"
                          label=""
                        />
                      </div>
                      
                      {errors.packageImages && (
                        <p className="text-sm text-red-600 mt-2">{errors.packageImages}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Payment Options */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-sm">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Payment Options</h3>
                      <p className="text-sm text-gray-600">Choose your payment preference</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Select Payment Type</h4>
                        <p className="text-sm text-gray-600">Choose how you want to handle the freight charges</p>
                      </div>

                      <div className="flex justify-center gap-10 max-w-3xl mx-auto">
                        {/* FP Option */}
                        <div 
                          className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 w-64 ${
                            bookingData.paymentData.paymentType === 'FP' 
                              ? 'border-green-500 bg-green-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            paymentData: { ...prev.paymentData, paymentType: 'FP' }
                          }))}
                        >
                          <div className="flex items-center gap-5 mb-5">
                            <div className={`p-4 rounded-lg ${
                              bookingData.paymentData.paymentType === 'FP' 
                                ? 'bg-green-100' 
                                : 'bg-gray-100'
                            }`}>
                              <CreditCard className={`h-7 w-7 ${
                                bookingData.paymentData.paymentType === 'FP' 
                                  ? 'text-green-600' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <h5 className="font-semibold text-gray-800 text-xl">FP</h5>
                          </div>
                          {/* <p className="text-sm text-gray-600 mb-3">
                            Pay freight charges now. This shipment will be included in your settlement invoice.
                          </p> */}
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              bookingData.paymentData.paymentType === 'FP' 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300'
                            }`}>
                              {bookingData.paymentData.paymentType === 'FP' && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-base font-medium text-gray-700">Include in Settlement</span>
                          </div>
                        </div>

                        {/* TP Option */}
                        <div 
                          className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 w-64 ${
                            bookingData.paymentData.paymentType === 'TP' 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            paymentData: { ...prev.paymentData, paymentType: 'TP' }
                          }))}
                        >
                          <div className="flex items-center gap-5 mb-5">
                            <div className={`p-4 rounded-lg ${
                              bookingData.paymentData.paymentType === 'TP' 
                                ? 'bg-blue-100' 
                                : 'bg-gray-100'
                            }`}>
                              <CreditCard className={`h-7 w-7 ${
                                bookingData.paymentData.paymentType === 'TP' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <h5 className="font-semibold text-gray-800 text-xl">TP</h5>
                          </div>
                          {/* <p className="text-sm text-gray-600 mb-3">
                            Pay freight charges later. This shipment will NOT be included in your settlement invoice.
                          </p> */}
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              bookingData.paymentData.paymentType === 'TP' 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {bookingData.paymentData.paymentType === 'TP' && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-base font-medium text-gray-700">Exclude from Settlement</span>
                          </div>
                        </div>
                      </div>

                      {errors.paymentType && (
                        <p className="text-sm text-red-600 mt-2">{errors.paymentType}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          {consignmentCheck.hasAssignment && (
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 h-10 px-6 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 h-10 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 h-10 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Popup */}
      <Dialog open={showPhonePopup} onOpenChange={setShowPhonePopup}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              Destination Lookup
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base leading-relaxed">
              Enter the destination phone number to auto-fill address details from previous bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Phone Number Input Section */}
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Label className="text-lg font-semibold text-gray-800 block">
                  Destination Phone Number
                </Label>
                <p className="text-sm text-gray-500 block">
                  Enter 10-digit mobile number
                </p>
              </div>

              {/* Interactive 10-Block Phone Input */}
              <div className="flex justify-center">
                <div className="grid grid-cols-10 gap-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={phoneNumber[index] || ''}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 1) {
                          const newPhone = phoneNumber.split('');
                          newPhone[index] = value;
                          const updatedPhone = newPhone.join('');

                          setPhoneNumber(updatedPhone);
                          setCountdown(null); // Clear countdown when phone number changes

                          // Auto-focus next input
                          if (value && index < 9) {
                            const nextInput = document.getElementById(`phone-block-${index + 1}`);
                            nextInput?.focus();
                          }

                          // Auto-lookup when 10 digits are entered
                          if (updatedPhone.length === 10) {
                            const destinations = await handlePhoneLookup(updatedPhone);
                            // Auto-proceed if only one destination is found
                            if (destinations.length === 1) {
                              // Auto-fill destination with the single result
                              handleDestinationSelect(destinations[0]);
                            }
                            // For multiple destinations, show selection options (handled in UI)
                          } else {
                            // Clear previous results if phone number is incomplete
                            setPreviousDestinations([]);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !phoneNumber[index] && index > 0) {
                          const prevInput = document.getElementById(`phone-block-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      onKeyUp={async (e) => {
                        // Handle paste functionality
                        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                          setTimeout(async () => {
                            const target = e.target as HTMLInputElement;
                            const pastedValue = target.value.replace(/\D/g, '').slice(0, 10);
                            if (pastedValue.length > 1) {
                              setPhoneNumber(pastedValue);
                              setCountdown(null); // Clear countdown when phone number changes
                              if (pastedValue.length === 10) {
                                const destinations = await handlePhoneLookup(pastedValue);
                                // Auto-proceed if only one destination is found
                                if (destinations.length === 1) {
                                  // Auto-fill destination with the single result
                                  handleDestinationSelect(destinations[0]);
                                }
                                // For multiple destinations, show selection options (handled in UI)
                              }
                            }
                          }, 10);
                        }
                      }}
                      id={`phone-block-${index}`}
                      className={`w-10 h-12 border-2 rounded-lg text-center text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                        index < phoneNumber.length
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg shadow-blue-200/50'
                          : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:bg-gray-50'
                      } ${isLookingUpPhone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={isLookingUpPhone}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {isLookingUpPhone ? (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-600 border-t-transparent"></div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Searching for previous destinations...
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Please wait while we check our records
                    </p>
                  </div>
                </div>
              </div>
            ) : previousDestinations.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Found {previousDestinations.length} previous destination{previousDestinations.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-green-600">
                        {previousDestinations.length === 1 ? 'Click to auto-fill this address' : 'Select an address to auto-fill'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Destination Selection Options */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {previousDestinations.map((destination, index) => (
                    <div
                      key={index}
                      onClick={() => handleDestinationSelect(destination)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                              <Building className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              {destination.name}
                            </span>
                            {destination.companyName && (
                              <span className="text-xs text-gray-500">
                                ({destination.companyName})
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 text-xs text-gray-600">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {destination.flatBuilding}, {destination.locality}
                            </p>
                            {destination.landmark && (
                              <p className="flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                Near {destination.landmark}
                              </p>
                            )}
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {destination.area}, {destination.city} - {destination.pincode}
                            </p>
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {destination.email}
                            </p>
                          </div>
                        </div>

                        <div className="ml-3 flex flex-col items-end">
                          <span className="text-xs text-gray-500 mb-1">
                            {index === 0 ? 'Most Recent' : `Option ${index + 1}`}
                          </span>
                          <div className="p-1 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                            <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : phoneNumber.length === 10 ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      No previous destinations found
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {countdown !== null 
                        ? `Redirecting to manual entry in ${countdown} seconds...`
                        : 'You can continue to enter destination manually'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </DialogContent>
      </Dialog>

      {/* Consignment Finished Popup */}
      <Dialog open={showConsignmentFinishedPopup} onOpenChange={setShowConsignmentFinishedPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Package className="h-5 w-5 mr-2" />
              Consignment Numbers Finished
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                All Consignment Numbers Used
              </h3>
              <p className="text-gray-600 mb-4">
                You have used all your assigned consignment numbers. Please contact your admin to get more consignment numbers assigned before making new bookings.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You cannot complete this booking until new consignment numbers are assigned to your account.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowConsignmentFinishedPopup(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorporateBookingPanel;