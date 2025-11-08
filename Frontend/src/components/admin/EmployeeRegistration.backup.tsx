import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
</original_code>```

```
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Eye,
  UserPlus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userIcon from '@/Icon-images/user.png';
import addressIcon from '@/Icon-images/address.png';
import buildingIcon from '@/Icon-images/Building.png';
import landmarkIcon from '@/Icon-images/Landmark.png';
import locationIcon from '@/Icon-images/location.png';
import flagIcon from '@/Icon-images/flag.png';

// Floating Label Input Component (matching existing forms)
interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  rightButton?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  icon,
  prefix,
  error,
  required = false,
  onKeyDown,
  disabled = false,
  rightButton
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  // The label should float if focused, has a value, OR if it's a date input (to avoid overlap with native date placeholder)
  const isFloating = isFocused || hasValue || type === 'date';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      {prefix && (
        <div className={`absolute ${icon ? 'left-10' : 'left-3'} top-1/2 transform -translate-y-1/2 z-10 text-gray-500 text-sm`}>
          {prefix}
        </div>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={`bg-white ${prefix ? 'pl-16' : (icon ? 'pl-10' : '')} ${rightButton ? 'pr-24' : ''} ${error ? 'border-red-500' : ''} ${className} shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-200`}
        placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
      />
      {rightButton && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          {rightButton}
        </div>
      )}
      <Label
        htmlFor={id}
        className={`absolute transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${isFloating
          ? `${prefix ? 'left-16' : (icon ? 'left-8' : 'left-3')} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
          : `${prefix ? 'left-16' : (icon ? 'left-10' : 'left-3')} top-1/2 transform -translate-y-1/2 text-gray-500`
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

interface EmployeeFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  alternativePhone: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  addressType: string;
  locality: string;
  buildingFlatNo: string;
  landmark: string;
  gst: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  website: string;
  anniversary: string;
  birthday: string;
  ref1Name: string;
  ref1Relation: string;
  ref1Mobile: string;
  ref2Name: string;
  ref2Relation: string;
  ref2Mobile: string;
  photoFile: File | null;
  cvFile: File | null;
  documentFile: File | null;
  dateOfBirth: string;
  designation: string;
  otp: string;
  captcha: string;
  workExperience: string;
  sameAsPresent: boolean;
  permanentLocality: string;
  permanentBuildingFlatNo: string;
  permanentLandmark: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;
  permanentArea: string;
  // Alternate present address when addressType === 'permanent'
  otherPresentLocality: string;
  otherPresentBuildingFlatNo: string;
  otherPresentLandmark: string;
  otherPresentPincode: string;
  otherPresentCity: string;
  otherPresentState: string;
  otherPresentArea: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  primeMobileNumbers: string[];
  panCardFile: File | null;
  aadharCardFile: File | null;
  salary: string; // New field
  dateOfJoining: string; // New field
}

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternativePhone: '',
    aadharNo: '',
    panNo: '',
    qualification: '',
    addressType: '',
    locality: '',
    buildingFlatNo: '',
    landmark: '',
    gst: '',
    pincode: '',
    city: '',
    state: '',
    area: '',
    website: '',
    anniversary: '',
    birthday: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Mobile: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Mobile: '',
    photoFile: null,
    cvFile: null,
    documentFile: null,
    dateOfBirth: '',
    designation: '',
    otp: '',
    captcha: '',
    workExperience: '',
    sameAsPresent: false,
    permanentLocality: '',
    permanentBuildingFlatNo: '',
    permanentLandmark: '',
    permanentPincode: '',
    permanentCity: '',
    permanentState: '',
    permanentArea: '',
    otherPresentLocality: '',
    otherPresentBuildingFlatNo: '',
    otherPresentLandmark: '',
    otherPresentPincode: '',
    otherPresentCity: '',
    otherPresentState: '',
    otherPresentArea: '',
    references: [{ name: '', relation: '', mobile: '' }],
    primeMobileNumbers: [''],
    panCardFile: null,
    aadharCardFile: null,
    salary: '', // New field
    dateOfJoining: '' // New field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedEmployeeCode, setGeneratedEmployeeCode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cvPreview, setCvPreview] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [permanentAvailableAreas, setPermanentAvailableAreas] = useState<string[]>([]);
  const [isLoadingPermanentPincode, setIsLoadingPermanentPincode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMobileOtpPopup, setShowMobileOtpPopup] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [showMobileOtpSuccess, setShowMobileOtpSuccess] = useState(false);
  const otpBoxCount = 4;
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const { toast } = useToast();

  // Generate initial unique ID when component mounts
  React.useEffect(() => {
    generateUniqueId();
  }, []);

  // Designation options
  const designationOptions = [
    'Accounts',
    'Accounts Head',
    'Courier Boy',
    'Customer Care',
    'Driver',
    'Operation Manager',
    'Sales Executive',
    'Tech Support',
    'Tech Support Manager',
    'Telecaller',
    'Others'
  ];

  // Handle designation change
  const handleDesignationChange = (value: string) => {
    setFormData(prev => ({ ...prev, designation: value }));
    setShowFormFields(true);
  };

  // Clear opposite address fields depending on selected type
  const clearOppositeAddressFields = (type: 'present' | 'permanent') => {
    setFormData(prev => ({
      ...prev,
      ...(type === 'present'
        ? {
            // clear permanent fields
            permanentLocality: '',
            permanentBuildingFlatNo: '',
            permanentLandmark: '',
            permanentPincode: '',
            permanentCity: '',
            permanentState: '',
            permanentArea: ''
          }
        : {
            // clear alternate present fields
            otherPresentLocality: '',
            otherPresentBuildingFlatNo: '',
            otherPresentLandmark: '',
            otherPresentPincode: '',
            otherPresentCity: '',
            otherPresentState: '',
            otherPresentArea: ''
          })
    }));
  };

  // Handle address type change: set type, uncheck sameAs, show lower section empty
  const handleAddressTypeChange = (value: string) => {
    const nextType = value as 'present' | 'permanent';
    // Only change the type; do not touch any existing field values to avoid disappearing data
    setFormData(prev => ({ ...prev, addressType: nextType, sameAsPresent: false }));
    setShowPermanentAddress(true);
    // Do NOT clear opposite fields here to preserve what user typed
  };

  // Handle "Same as ... Address" checkbox (dynamic based on selected type)
  const handleSameAsPresentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsPresent: checked }));
    if (checked) {
      setFormData(prev => {
        if (prev.addressType === 'present') {
          // User is filling Present as primary; make Present = Permanent
          return {
            ...prev,
            locality: prev.permanentLocality,
            buildingFlatNo: prev.permanentBuildingFlatNo,
            landmark: prev.permanentLandmark,
            pincode: prev.permanentPincode,
            city: prev.permanentCity,
            state: prev.permanentState,
            area: prev.permanentArea
          };
        }
        // addressType === 'permanent': User is filling Permanent as primary; make Permanent = Present
        return {
          ...prev,
          permanentLocality: prev.locality,
          permanentBuildingFlatNo: prev.buildingFlatNo,
          permanentLandmark: prev.landmark,
          permanentPincode: prev.pincode,
          permanentCity: prev.city,
          permanentState: prev.state,
          permanentArea: prev.area
        };
      });
      setShowPermanentAddress(false); // hide lower form when same-as is checked
    } else {
      // show lower form again, but keep it empty to be filled manually
      setShowPermanentAddress(true);
    }
  };

  // Handle permanent address pincode lookup
  const handlePermanentPincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, permanentPincode: numericPincode }));

    if (numericPincode.length === 6) {
      setIsLoadingPermanentPincode(true);
      try {
        const response = await fetch(`http://localhost:5000/api/pincode/${numericPincode}/simple`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permanentState: data.state || '',
            permanentCity: data.city || '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas(data.areas || []);
        } else {
          setFormData(prev => ({
            ...prev,
            permanentState: '',
            permanentCity: '',
            permanentArea: ''
          }));
          setPermanentAvailableAreas([]);
        }
      } catch (error) {
        console.error('Error looking up permanent pincode:', error);
      } finally {
        setIsLoadingPermanentPincode(false);
      }
    }
  };

  // Add new reference
  const addReference = () => {
    setFormData(prev => {
      if (prev.references.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 references only.' });
        return prev;
      }
      return {
        ...prev,
        references: [...prev.references, { name: '', relation: '', mobile: '' }]
      };
    });
  };

  // Remove reference
  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Update reference
  const updateReference = (index: number, field: string, value: string) => {
    // Apply mobile number validation for mobile field
    const validatedValue = field === 'mobile' ? validateMobileNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: validatedValue } : ref
      )
    }));
  };

  // Add prime mobile number
  const addPrimeMobile = () => {
    setFormData(prev => {
      if (prev.primeMobileNumbers.length >= 3) {
        toast({ title: 'Limit reached', description: 'You can add up to 3 mobile numbers only.' });
        return prev;
      }
      return {
        ...prev,
        primeMobileNumbers: [...prev.primeMobileNumbers, '']
      };
    });
  };

  // Remove prime mobile number
  const removePrimeMobile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.filter((_, i) => i !== index)
    }));
  };

  // Validate and format mobile number (only 10 digits)
  const validateMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Update prime mobile number
  const updatePrimeMobile = (index: number, value: string) => {
    const validatedValue = validateMobileNumber(value);
    setFormData(prev => ({
      ...prev,
      primeMobileNumbers: prev.primeMobileNumbers.map((mobile, i) => 
        i === index ? validatedValue : mobile
      )
    }));
  };

  // Generate unique employee code starting from T0001
  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `T${String(timestamp).slice(-4)}${String(random).padStart(2, '0')}`;
    setGeneratedEmployeeCode(code);
    return code;
  };

  // Generate unique ID starting from OCL0001
  const generateUniqueId = () => {
    // If we already have a uniqueId, don't generate a new one
    if (uniqueId) {
      return uniqueId;
    }
    
    // Get the last used ID from localStorage or start from 0
    const lastId = localStorage.getItem('lastEmployeeId') || '0';
    const nextId = parseInt(lastId) + 1;
    const uniqueCode = `OCL${String(nextId).padStart(4, '0')}`;
    
    // Store the new ID in localStorage
    localStorage.setItem('lastEmployeeId', nextId.toString());
    setUniqueId(uniqueCode);
    return uniqueCode;
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    // Simulate OTP verification (in real app, this would be an API call)
    if (otpInput === '123456') { // Demo OTP
      setOtpVerified(true);
      setShowOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowOtpSuccess(false);
        setShowOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP sending
  const handleSendMobileOtp = () => {
    if (formData.primeMobileNumbers[0] && formData.primeMobileNumbers[0].length === 10) {
      setShowMobileOtpPopup(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to +91${formData.primeMobileNumbers[0]}`,
      });
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpVerification = () => {
    // Dummy logic - accept any OTP
    if (mobileOtpInput.length >= 4) {
      setMobileOtpVerified(true);
      setShowMobileOtpSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowMobileOtpSuccess(false);
        setShowMobileOtpPopup(false);
      }, 2000);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP.",
        variant: "destructive"
      });
    }
  };

  // Helpers for 4-box OTP UI
  const setOtpAtIndex = (index: number, digit: string) => {
    const padded = (mobileOtpInput + '    ').slice(0, otpBoxCount).split('');
    padded[index] = digit;
    const nextValue = padded.join('').replace(/\s/g, '');
    setMobileOtpInput(nextValue);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (!digit) return;
    setOtpAtIndex(index, digit);
    const nextRef = otpInputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = otpInputRefs.current[index];
    if (e.key === 'Backspace') {
      const currentValuePresent = (mobileOtpInput[index] ?? '') !== '';
      if (currentValuePresent) {
        // clear current digit
        setOtpAtIndex(index, '');
      } else if (index > 0) {
        const prevRef = otpInputRefs.current[index - 1];
        prevRef?.focus();
        setOtpAtIndex(index - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < otpBoxCount - 1) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpBoxCount);
    if (!text) return;
    setMobileOtpInput(text);
    // focus last filled box
    const focusIndex = Math.min(text.length, otpBoxCount) - 1;
    if (focusIndex >= 0) {
      setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
    }
    e.preventDefault();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!mobileOtpVerified) {
      toast({
        title: "OTP Required",
        description: "Please verify your mobile number with OTP first.",
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    setShowSuccessToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Handle new form
  const handleNewForm = () => {
    // Reset all form data
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      alternativePhone: '',
      aadharNo: '',
      panNo: '',
      qualification: '',
      addressType: '',
      locality: '',
      buildingFlatNo: '',
      landmark: '',
      gst: '',
      pincode: '',
      city: '',
      state: '',
      area: '',
      website: '',
      anniversary: '',
      birthday: '',
      ref1Name: '',
      ref1Relation: '',
      ref1Mobile: '',
      ref2Name: '',
      ref2Relation: '',
      ref2Mobile: '',
      photoFile: null,
      cvFile: null,
      documentFile: null,
      dateOfBirth: '',
      designation: '',
      otp: '',
      captcha: '',
      workExperience: '',
      sameAsPresent: false,
      permanentLocality: '',
      permanentBuildingFlatNo: '',
      permanentLandmark: '',
      permanentPincode: '',
      permanentCity: '',
      permanentState: '',
      permanentArea: '',
      otherPresentLocality: '',
      otherPresentBuildingFlatNo: '',
      otherPresentLandmark: '',
      otherPresentPincode: '',
      otherPresentCity: '',
      otherPresentState: '',
      otherPresentArea: '',
      references: [{ name: '', relation: '', mobile: '' }],
      primeMobileNumbers: [''],
      panCardFile: null,
      aadharCardFile: null,
      salary: '', // New field
      dateOfJoining: '' // New field
    });
    
    // Reset all states
    setShowFormFields(false);
    setShowPermanentAddress(false);
    setOtpVerified(false);
    setOtpInput('');
    setShowOtpPopup(false);
    setShowOtpSuccess(false);
    setMobileOtpVerified(false);
    setMobileOtpInput('');
    setShowMobileOtpPopup(false);
    setShowMobileOtpSuccess(false);
    // Don't reset uniqueId here, keep the current one
    setShowSuccessToast(false);
    
    // Generate new unique ID only if we don't have one
    if (!uniqueId) {
      generateUniqueId();
    }
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          state: data.state || '',
          city: data.city || '',
          area: '' // Reset area when pincode changes
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          state: '',
          city: '',
          area: ''
        }));
        setAvailableAreas([]);
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
      setIsLoadingPincode(false);
    }
  };

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setFormData(prev => ({
      ...prev,
      pincode: numericPincode
    }));

    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  React.useEffect(() => {
    if (showOtpSuccess) {
      const timer = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpSuccess]);

  // Utils: format Aadhaar as 1234 5678 9012
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Unique ID will be generated only after successful submit

  // Real-time form validation
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) {
      newErrors.aadharNo = 'Aadhaar number must be 12 digits.';
    }

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      newErrors.panNo = 'Invalid PAN number format.';
    }

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) {
      newErrors.gst = 'Invalid GST number format.';
    }

    // Salary validation (only if provided)
    if (formData.salary.trim() && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount.';
    }

    setErrors(newErrors);
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (field: 'photoFile' | 'cvFile' | 'documentFile' | 'panCardFile' | 'aadharCardFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'photoFile') setPhotoPreview(result);
        else if (field === 'cvFile') setCvPreview(result);
        else if (field === 'documentFile') setDocumentPreview(result);
        else if (field === 'panCardFile') setPanPreview(result);
        else if (field === 'aadharCardFile') setAadharPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'photoFile') setPhotoPreview('');
      else if (field === 'cvFile') setCvPreview('');
      else if (field === 'documentFile') setDocumentPreview('');
      else if (field === 'panCardFile') setPanPreview('');
      else if (field === 'aadharCardFile') setAadharPreview('');
    }
  };

  const validateForm = () => {
    // Basic required field validations (silent validation)
    if (!formData.name.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.aadharNo.trim()) return false;
    if (!formData.panNo.trim()) return false;
    if (!formData.qualification.trim()) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.designation.trim()) return false;
    if (!formData.addressType.trim()) return false;
    if (!formData.salary.trim()) return false; // New required field
    if (!formData.dateOfJoining) return false; // New required field

    // Email validation
    if (!formData.email.includes('@') || !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // Aadhaar number validation (ignore spaces)
    if (formData.aadharNo.trim() && !/^\d{12}$/.test(formData.aadharNo.replace(/\s/g, ''))) return false;

    // PAN number validation
    if (formData.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) return false;

    // GST number validation (only if provided)
    if (formData.gst.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase())) return false;

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowOtpSection(true);
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      toast({
        title: "OTP Sent",
        description: "OTP has been sent to your email for verification.",
      });
    }
  };

  const handleSendOtp = async () => {
    try {
      // Simulate OTP sending
      setOtpSent(true);
      setOtpTimer(300);
      toast({
        title: "OTP Sent",
        description: "OTP has been sent to your email for verification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate OTP verification
      setOtpVerified(true);
      setShowOtpSuccess(true);
      toast({
        title: "OTP Verified",
        description: "Your email has been verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      toast({
        title: "Error",
        description: "Please verify your email with OTP first.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate employee code and unique ID only on successful submit
      const employeeCode = generateEmployeeCode();

      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowSuccess(true);
      generateUniqueId();
      toast({
        title: "Registration Successful",
        description: `Employee registered successfully with code: ${employeeCode}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">Employee has been registered successfully.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-blue-800">
                  Employee Code: <span className="underline">{generatedEmployeeCode}</span>
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setFormData({
                    name: '',
                    address: '',
                    email: '',
                    phone: '',
                    alternativePhone: '',
                    aadharNo: '',
                    panNo: '',
                    qualification: '',
                    addressType: '',
                    locality: '',
                    buildingFlatNo: '',
                    landmark: '',
                    gst: '',
                    pincode: '',
                    city: '',
                    state: '',
                    area: '',
                    website: '',
                    anniversary: '',
                    birthday: '',
                    ref1Name: '',
                    ref1Relation: '',
                    ref1Mobile: '',
                    ref2Name: '',
                    ref2Relation: '',
                    ref2Mobile: '',
                    photoFile: null,
                    cvFile: null,
                    documentFile: null,
                    dateOfBirth: '',
                    designation: '',
                    otp: '',
                    captcha: '',
                    workExperience: '',
                    sameAsPresent: false,
                    permanentLocality: '',
                    permanentBuildingFlatNo: '',
                    permanentLandmark: '',
                    permanentPincode: '',
                    permanentCity: '',
                    permanentState: '',
                    permanentArea: '',
                    references: [{ name: '', relation: '', mobile: '' }],
                    primeMobileNumbers: [''],
                    panCardFile: null,
                    aadharCardFile: null,
                    otherPresentLocality: '',
                    otherPresentBuildingFlatNo: '',
                    otherPresentLandmark: '',
                    otherPresentPincode: '',
                    otherPresentCity: '',
                    otherPresentState: '',
                    otherPresentArea: '',
                    salary: '',
                    dateOfJoining: ''
                  });
                  setShowOtpSection(false);
                  setOtpVerified(false);
                  setGeneratedEmployeeCode('');
                  // Generate a new unique ID for the next employee
                  generateUniqueId();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Register Another Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <UserPlus className="h-6 w-6" />
              Employee Registration Form
            </CardTitle>
            {uniqueId && (
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">ID: {uniqueId}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Designation Section - Always Visible */}
            <div>
              <Label htmlFor="designation" className="text-sm font-medium text-gray-600 mb-2 block">
                 <span className="text-red-500"></span>
              </Label>
              <Select
                value={formData.designation}
                onValueChange={handleDesignationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  {designationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Form Fields - Appear after designation selection */}
            {showFormFields && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Row 1: Name */}
                <div>
                  <FloatingLabelInput
                    id="name"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    placeholder="Name"
                    icon={<img src={userIcon} alt="" className="h-4 w-4" />}
                    required
                  />
                </div>

                {/* Present Address Fields */}
                {/* Locality/Street */}
                <div>
                  <FloatingLabelInput
                    id="locality"
                    value={formData.locality}
                    onChange={(value) => setFormData(prev => ({ ...prev, locality: value }))}
                    placeholder="Locality / Street"
                    icon={<img src={addressIcon} alt="" className="h-4 w-4" />}
                    required
                  />
                </div>

                {/* Building/Flat No and Landmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FloatingLabelInput
                      id="buildingFlatNo"
                      value={formData.buildingFlatNo}
                      onChange={(value) => setFormData(prev => ({ ...prev, buildingFlatNo: value }))}
                      placeholder="Building / Flat No"
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                      required
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      id="landmark"
                      value={formData.landmark}
                      onChange={(value) => setFormData(prev => ({ ...prev, landmark: value }))}
                      placeholder="Landmark"
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                    />
                  </div>
                </div>

                {/* PIN Code and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FloatingLabelInput
                      id="pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      placeholder="PINCode"
                      maxLength={6}
                      disabled={isLoadingPincode}
                      required
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      id="city"
                      value={formData.city}
                      onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                      placeholder="City"
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                      disabled={isLoadingPincode}
                      required
                    />
                  </div>
                </div>

                {/* State and Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FloatingLabelInput
                      id="state"
                      value={formData.state}
                      onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                      placeholder="State"
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                      disabled={isLoadingPincode}
                      required
                    />
                  </div>
                  <div>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                      disabled={availableAreas.length === 0 || isLoadingPincode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingPincode ? "Loading..." : availableAreas.length === 0 ? "Select area" : "Select area"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAreas.map((area, index) => (
                          <SelectItem key={index} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Type of Address Radio Buttons */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="px-4 py-1 rounded-full bg-[#2057E0] text-white text-sm font-semibold">
                      Type of Address
                    </div>
                  </div>
                  <RadioGroup
                    value={formData.addressType}
                    onValueChange={handleAddressTypeChange}
                    className="flex items-center justify-center gap-8 md:gap-16"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="permanent"
                        id="permanent"
                        className="data-[state=checked]:bg-[#2057E0] data-[state=checked]:border-[#2057E0] data-[state=checked]:[&_svg]:hidden"
                      />
                      <Label htmlFor="permanent" className="text-sm font-medium text-gray-700">
                        Permanent Address
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="present"
                        id="present"
                        className="data-[state=checked]:bg-[#2057E0] data-[state=checked]:border-[#2057E0] data-[state=checked]:[&_svg]:hidden"
                      />
                      <Label htmlFor="present" className="text-sm font-medium text-gray-700">
                        Present Address
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Checkbox below address type */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sameAsPresentCheckbox"
                        checked={formData.sameAsPresent}
                        onChange={(e) => handleSameAsPresentChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="sameAsPresentCheckbox" className="text-sm font-medium text-gray-700">
                        {formData.addressType === 'present' ? 'Same as Permanent Address' : 'Same as Present Address'}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Dynamic Address Section - Only show when a type is chosen and checkbox is unchecked */}
                {formData.addressType && !formData.sameAsPresent && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-center mb-2">
                      <div className="px-4 py-1 rounded-full bg-[#2057E0] text-white text-sm font-semibold">
                        {formData.addressType === 'present' ? 'Permanent Address' : 'Present Address'}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {formData.addressType === 'present' ? (
                        // Show Permanent Address fields when Present is selected
                        <>
                          {/* Locality/Street */}
                          <div>
                            <FloatingLabelInput
                              id="permanentLocality"
                              value={formData.permanentLocality}
                              onChange={(value) => setFormData(prev => ({ ...prev, permanentLocality: value }))}
                              placeholder="Locality / Street"
                              icon={<img src={buildingIcon} alt="" className="h-4 w-4" />}
                              required
                            />
                          </div>

                          {/* Building/Flat No and Landmark */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="permanentBuildingFlatNo"
                                value={formData.permanentBuildingFlatNo}
                                onChange={(value) => setFormData(prev => ({ ...prev, permanentBuildingFlatNo: value }))}
                                placeholder="Building / Flat No"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                required
                              />
                            </div>
                            <div>
                              <FloatingLabelInput
                                id="permanentLandmark"
                                value={formData.permanentLandmark}
                                onChange={(value) => setFormData(prev => ({ ...prev, permanentLandmark: value }))}
                                placeholder="Landmark"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                              />
                            </div>
                          </div>

                          {/* PIN Code and City */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="permanentPincode"
                                value={formData.permanentPincode}
                                onChange={handlePermanentPincodeChange}
                                placeholder="PINCode"
                                maxLength={6}
                                disabled={isLoadingPermanentPincode}
                                required
                              />
                            </div>
                            <div>
                              <FloatingLabelInput
                                id="permanentCity"
                                value={formData.permanentCity}
                                onChange={(value) => setFormData(prev => ({ ...prev, permanentCity: value }))}
                                placeholder="City"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                disabled={isLoadingPermanentPincode}
                                required
                              />
                            </div>
                          </div>

                          {/* State and Area */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="permanentState"
                                value={formData.permanentState}
                                onChange={(value) => setFormData(prev => ({ ...prev, permanentState: value }))}
                                placeholder="State"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                disabled={isLoadingPermanentPincode}
                                required
                              />
                            </div>
                            <div>
                              <Select
                                value={formData.permanentArea}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, permanentArea: value }))}
                                disabled={permanentAvailableAreas.length === 0 || isLoadingPermanentPincode}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={isLoadingPermanentPincode ? "Loading..." : permanentAvailableAreas.length === 0 ? "Enter pincode first" : "Select area"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {permanentAvailableAreas.map((area, index) => (
                                    <SelectItem key={index} value={area}>
                                      {area}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Show Present Address fields (separate set) when Permanent is selected
                        <>
                          {/* Locality/Street */}
                          <div>
                            <FloatingLabelInput
                              id="otherPresentLocality"
                              value={formData.otherPresentLocality}
                              onChange={(value) => setFormData(prev => ({ ...prev, otherPresentLocality: value }))}
                              placeholder="Locality / Street"
                              icon={<img src={landmarkIcon} alt="" className="h-4 w-4" />}
                              required
                            />
                          </div>

                          {/* Building/Flat No and Landmark */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="otherPresentBuildingFlatNo"
                                value={formData.otherPresentBuildingFlatNo}
                                onChange={(value) => setFormData(prev => ({ ...prev, otherPresentBuildingFlatNo: value }))}
                                placeholder="Building / Flat No"
                              icon={<img src={locationIcon} alt="" className="h-4 w-4" />}
                                required
                              />
                            </div>
                            <div>
                              <FloatingLabelInput
                                id="otherPresentLandmark"
                                value={formData.otherPresentLandmark}
                                onChange={(value) => setFormData(prev => ({ ...prev, otherPresentLandmark: value }))}
                                placeholder="Landmark"
                              icon={<img src={flagIcon} alt="" className="h-4 w-4" />}
                              />
                            </div>
                          </div>

                          {/* PIN Code and City */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="otherPresentPincode"
                                value={formData.otherPresentPincode}
                                onChange={(val) => setFormData(prev => ({ ...prev, otherPresentPincode: val.replace(/\D/g,'').slice(0,6) }))}
                                placeholder="PINCode"
                                maxLength={6}
                                required
                              />
                            </div>
                            <div>
                              <FloatingLabelInput
                                id="otherPresentCity"
                                value={formData.otherPresentCity}
                                onChange={(value) => setFormData(prev => ({ ...prev, otherPresentCity: value }))}
                                placeholder="City"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                required
                              />
                            </div>
                          </div>

                          {/* State and Area */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FloatingLabelInput
                                id="otherPresentState"
                                value={formData.otherPresentState}
                                onChange={(value) => setFormData(prev => ({ ...prev, otherPresentState: value }))}
                                placeholder="State"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                required
                              />
                            </div>
                            <div>
                              <FloatingLabelInput
                                id="otherPresentArea"
                                value={formData.otherPresentArea}
                                onChange={(value) => setFormData(prev => ({ ...prev, otherPresentArea: value }))}
                                placeholder="Area"
                                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                <div>
                  <textarea
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
                    placeholder="Work Experience (if any)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Aadhar No */}
                <div>
                  <FloatingLabelInput
                    id="aadharNo"
                    value={formData.aadharNo}
                    onChange={(value) => setFormData(prev => ({ ...prev, aadharNo: formatAadhar(value) }))}
                    placeholder="Aadhar No"
                    maxLength={14}
                    error={errors.aadharNo}
                    required
                  />
                </div>

                {/* Email ID */}
                <div>
                  <FloatingLabelInput
                    id="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    placeholder="Email ID"
                    type="email"
                    icon={<Mail className="h-4 w-4 text-gray-400" />}
                    error={errors.email}
                    required
                  />
                </div>

                {/* Anniversary and Birthday */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FloatingLabelInput
                      id="anniversary"
                      value={formData.anniversary}
                      onChange={(value) => setFormData(prev => ({ ...prev, anniversary: value }))}
                      placeholder="Anniversary"
                      type="date"
                      icon={<Calendar className="h-4 w-4 text-gray-400" />}
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      id="birthday"
                      value={formData.birthday}
                      onChange={(value) => setFormData(prev => ({ ...prev, birthday: value }))}
                      placeholder="Birthday"
                      type="date"
                      icon={<Calendar className="h-4 w-4 text-gray-400" />}
                    />
                  </div>
                </div>

                {/* Salary and Date of Joining */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FloatingLabelInput
                      id="salary"
                      value={formData.salary}
                      onChange={(value) => setFormData(prev => ({ ...prev, salary: value }))}
                      placeholder="Salary"
                      icon={<span className="text-gray-400">₹</span>}
                      required
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      id="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={(value) => setFormData(prev => ({ ...prev, dateOfJoining: value }))}
                      placeholder="Date of Joining"
                      type="date"
                      icon={<Calendar className="h-4 w-4 text-gray-400" />}
                      required
                    />
                  </div>
                </div>

                {/* References Section */}
                <div className="rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200" style={{ backgroundColor: '#4451621a' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">References</h3>
                    <Button
                      type="button"
                      onClick={addReference}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Reference
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.references.map((ref, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-600">Reference {index + 1}</h4>
                          {formData.references.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeReference(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <FloatingLabelInput
                              id={`ref${index}Name`}
                              value={ref.name}
                              onChange={(value) => updateReference(index, 'name', value)}
                              placeholder="Name"
                              required
                            />
                          </div>
                          <div>
                            <FloatingLabelInput
                              id={`ref${index}Relation`}
                              value={ref.relation}
                              onChange={(value) => updateReference(index, 'relation', value)}
                              placeholder="Relation"
                              required
                            />
                          </div>
                          <div>
                            <FloatingLabelInput
                              id={`ref${index}Mobile`}
                              value={ref.mobile}
                              onChange={(value) => updateReference(index, 'mobile', value)}
                              placeholder="Mobile No"
                              type="tel"
                              icon={<Phone className="h-4 w-4 text-gray-400" />}
                              prefix="+91"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                
                {/* Upload Documents Section */}
                <div className="rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200" style={{ backgroundColor: '#4451621a' }}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Upload Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Photo Upload */}
                    <div>
                      <Label htmlFor="photo" className="text-sm font-medium text-gray-600 mb-2 block">
                        Photo Upload
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="photo"
                          accept="image/*"
                          onChange={(e) => handleFileChange('photoFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="photo" className="cursor-pointer">
                          {photoPreview ? (
                            <div>
                              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                              <p className="text-xs text-green-600">File selected</p>
                            </div>
                          ) : (
                            <div>
                              <Image className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Click to upload</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {photoPreview && (
                        <div className="mt-2 flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="h-4 w-4" />
                            <span>Photo uploaded</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-600 hover:text-blue-700" onClick={() => { setViewerUrl(photoPreview); setShowViewer(true); }}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => { setFormData(prev => ({ ...prev, photoFile: null })); setPhotoPreview(''); }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CV Upload */}
                    <div>
                      <Label htmlFor="cv" className="text-sm font-medium text-gray-600 mb-2 block">
                        CV Upload
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="cv"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('cvFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="cv" className="cursor-pointer">
                          {cvPreview ? (
                            <div>
                              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                              <p className="text-xs text-green-600">CV selected</p>
                            </div>
                          ) : (
                            <div>
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Click to upload</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {cvPreview && (
                        <div className="mt-2 flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="h-4 w-4" />
                            <span>CV uploaded</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-600 hover:text-blue-700" onClick={() => { setViewerUrl(cvPreview); setShowViewer(true); }}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="text-red-600 hover:text-red-700" onClick={() => { setFormData(prev => ({ ...prev, cvFile: null })); setCvPreview(''); }}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PAN Card Upload */}
                    <div>
                      <Label htmlFor="panCard" className="text-sm font-medium text-gray-600 mb-2 block">
                        PAN Card Upload
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="panCard"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('panCardFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="panCard" className="cursor-pointer">
                          {panPreview ? (
                            <div>
                              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                              <p className="text-xs text-green-600">File selected</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Click to upload</p>
                            </>
                          )}
                        </label>
                      </div>
                      {panPreview && (
                        <div className="mt-2 flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="h-4 w-4" />
                            <span>PAN file uploaded</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-600 hover:text-blue-700" onClick={() => { setViewerUrl(panPreview); setShowViewer(true); }}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="text-red-600 hover:text-red-700" onClick={() => { setFormData(prev => ({ ...prev, panCardFile: null })); setPanPreview(''); }}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aadhar Card Upload */}
                    <div>
                      <Label htmlFor="aadharCard" className="text-sm font-medium text-gray-600 mb-2 block">
                        Aadhar Card Upload
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="aadharCard"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('aadharCardFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="aadharCard" className="cursor-pointer">
                          {aadharPreview ? (
                            <div>
                              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                              <p className="text-xs text-green-600">File selected</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Click to upload</p>
                            </>
                          )}
                        </label>
                      </div>
                      {aadharPreview && (
                        <div className="mt-2 flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="h-4 w-4" />
                            <span>Aadhar file uploaded</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-600 hover:text-blue-700" onClick={() => { setViewerUrl(aadharPreview); setShowViewer(true); }}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="text-red-600 hover:text-red-700" onClick={() => { setFormData(prev => ({ ...prev, aadharCardFile: null })); setAadharPreview(''); }}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Mobile Button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={addPrimeMobile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Mobile
                  </Button>
                </div>

                {/* Prime Mobile Numbers */}
                <div className="space-y-3">
                  {formData.primeMobileNumbers.map((mobile, index) => (
                    <div key={index} className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex-1">
                        <FloatingLabelInput
                          id={`primeMobile${index}`}
                          value={mobile}
                          onChange={(value) => updatePrimeMobile(index, value)}
                          placeholder={index === 0 ? "Prime Mobile No" : "Mobile No"}
                          type="tel"
                          icon={<Phone className="h-4 w-4 text-gray-400" />}
                          prefix="+91"
                          required
                          rightButton={index === 0 ? (
                            <Button
                              type="button"
                              onClick={handleSendMobileOtp}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs font-medium"
                              disabled={mobile.length !== 10 || mobileOtpVerified}
                            >
                              {mobileOtpVerified ? '✓ Verified' : 'Send OTP'}
                            </Button>
                          ) : undefined}
                        />
                      </div>
                      {formData.primeMobileNumbers.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePrimeMobile(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit and New Buttons */}
                <div className="flex gap-4 justify-center pt-6">
                  <Button
                    onClick={handleFormSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!mobileOtpVerified}
                  >
                    SUBMIT
                  </Button>
                  <Button
                    onClick={handleNewForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    NEW
                  </Button>
                </div>                
              </div>
            )}

            {/* OTP Section */}
            {showOtpSection && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Email Verification</h3>
                {otpSent && !otpVerified && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FloatingLabelInput
                          id="otp"
                          value={formData.otp}
                          onChange={(value) => setFormData(prev => ({ ...prev, otp: value }))}
                          placeholder="OTP"
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <FloatingLabelInput
                          id="captcha"
                          value={formData.captcha}
                          onChange={(value) => setFormData(prev => ({ ...prev, captcha: value }))}
                          placeholder="Captcha"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyOtp}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={!formData.otp.trim()}
                      >
                        Verify OTP
                      </Button>
                      {otpTimer > 0 && (
                        <Button
                          onClick={handleSendOtp}
                          variant="outline"
                          disabled
                        >
                          Resend OTP ({Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')})
                        </Button>
                      )}
                      {otpTimer === 0 && (
                        <Button
                          onClick={handleSendOtp}
                          variant="outline"
                        >
                          Resend OTP
                        </Button>
                      )}
                    </div>
                    {showOtpSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Email verified successfully! You can now submit the form.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Removed extra submit button */}

            {/* Employee Code Display */}
            {generatedEmployeeCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-blue-800">
                  Employee Code: <span className="underline">{generatedEmployeeCode}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OTP Popup Modal */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" style={{ boxShadow: 'rgba(0, 0, 0, 0.56) 0px 22px 70px 4px' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Verify Mobile Number</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the OTP sent to +91 {formData.primeMobileNumbers[0]}
            </p>
            
            <div className="space-y-4">
              <div>
                <FloatingLabelInput
                  id="otpInput"
                  value={otpInput}
                  onChange={(value) => setOtpInput(value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleOtpVerification}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-10 text-sm font-semibold rounded-lg"
                  disabled={otpInput.length !== 6}
                >
                  Verify OTP
                </Button>
                <Button
                  onClick={() => setShowOtpPopup(false)}
                  variant="outline"
                  className="flex-1 h-10 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* OTP Success Message */}
            {showOtpSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">OTP Verified Successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile OTP Popup Modal */}
      {showMobileOtpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" style={{ boxShadow: 'rgba(0, 0, 0, 0.56) 0px 22px 70px 4px' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Mobile Number</h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter the OTP sent to +91 {formData.primeMobileNumbers[0]}
            </p>
            
            <div className="space-y-6" onPaste={handleOtpPaste}>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: otpBoxCount }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={mobileOtpInput[i] ?? ''}
                    onChange={(e) => handleOtpBoxChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpBoxKeyDown(i, e)}
                    className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md outline-none shadow-[0_3px_0_rgba(0,0,0,0.15)] focus:border-gray-500 focus:shadow-[0_4px_0_rgba(0,0,0,0.2)]"
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleMobileOtpVerification}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-10 text-sm font-semibold rounded-lg"
                  disabled={mobileOtpInput.length < 4}
                >
                  Verify OTP
                </Button>
                <Button
                  onClick={() => setShowMobileOtpPopup(false)}
                  variant="outline"
                  className="flex-1 h-10 text-sm font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Mobile OTP Success Message */}
            {showMobileOtpSuccess && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Mobile Number Verified Successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Submitted Successfully!</span>
          </div>
        </div>
      )}

      {/* Simple Viewer Modal for uploaded previews */}
      {showViewer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowViewer(false)}>
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button className="text-gray-600 hover:text-gray-800" onClick={() => setShowViewer(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              {/* For images this will render; for PDFs/data URLs it will still open */}
              <img src={viewerUrl} alt="Preview" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRegistration;
