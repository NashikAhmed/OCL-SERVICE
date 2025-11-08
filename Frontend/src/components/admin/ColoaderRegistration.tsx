import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Save,
  Truck,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User
  ,ChevronsUpDown
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
  error,
  required = false,
  onKeyDown
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
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
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        placeholder=""
      />
      <Label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${
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

// Floating Label Textarea Component
interface FloatingLabelTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  rows?: number;
}

const FloatingLabelTextarea: React.FC<FloatingLabelTextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className = "",
  icon,
  error,
  required = false,
  rows = 3
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3 z-10">
          {icon}
        </div>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={rows}
        className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        placeholder=""
      />
      <Label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none font-['Calibri'] ${
          isFloating
            ? `${icon ? 'left-8' : 'left-3'} -top-2 text-xs bg-white px-1 text-blue-600 font-medium`
            : `${icon ? 'left-10' : 'left-3'} top-3 text-gray-500`
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

interface FromLocation {
  id: string;
  concernPerson: string;
  mobile: string;
  email: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  address: string;
  flatNo: string;
  landmark: string;
  gst: string;
}

interface ToLocation {
  id: string;
  concernPerson: string;
  mobile: string;
  email: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  address: string;
  flatNo: string;
  landmark: string;
  gst: string;
}

interface ColoaderFormData {
  companyName: string;
  serviceModes: string[];
  concernPerson: string;
  mobileNumbers: string[];
  mobileNumberNames: string[];
  email: string;
  website: string;
  companyAddress: {
    pincode: string;
    state: string;
    city: string;
    area: string;
    address: string;
    flatNo: string;
    landmark: string;
    gst: string;
  };
  fromLocations: FromLocation[];
  toLocations: ToLocation[];
}

const ColoaderRegistration = () => {
  const [formData, setFormData] = useState<ColoaderFormData>({
    companyName: '',
    serviceModes: [],
    concernPerson: '',
    mobileNumbers: [''],
    mobileNumberNames: [''],
    email: '',
    website: '',
    companyAddress: {
      pincode: '',
      state: '',
      city: '',
      area: '',
      address: '',
      flatNo: '',
      landmark: '',
      gst: ''
    },
    fromLocations: [],
    toLocations: [{ id: '1', concernPerson: '', mobile: '', email: '', pincode: '', state: '', city: '', area: '', address: '', flatNo: '', landmark: '', gst: '' }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCompanyFormMinimized, setIsCompanyFormMinimized] = useState(false);
  const [isFromFormMinimized, setIsFromFormMinimized] = useState(false);
  const [showAdditionalFromLocations, setShowAdditionalFromLocations] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [fromLocationAreas, setFromLocationAreas] = useState<Record<string, string[]>>({});
  const [toLocationAreas, setToLocationAreas] = useState<Record<string, string[]>>({});
  const [isLoadingFromPincode, setIsLoadingFromPincode] = useState<Record<string, boolean>>({});
  const [isLoadingToPincode, setIsLoadingToPincode] = useState<Record<string, boolean>>({});
  const [isValidCompanyGST, setIsValidCompanyGST] = useState(true);
  const [isValidFromGST, setIsValidFromGST] = useState<Record<string, boolean>>({});
  const [isValidToGST, setIsValidToGST] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const serviceModeOptions = [
    { id: 'air', label: 'By Air' },
    { id: 'road', label: 'By Road' },
    { id: 'train', label: 'By Train' },
    { id: 'ship', label: 'By Ship' }
  ];

  // GST Validation Helper Function
  const validateGST = (gst: string): { isValid: boolean; error?: string } => {
    if (!gst.trim()) {
      return { isValid: false, error: 'GST Number is required' };
    }

    // Remove any spaces and convert to uppercase
    const cleanGST = gst.trim().toUpperCase();
    
    // Check if it's exactly 15 characters
    if (cleanGST.length !== 15) {
      return { 
        isValid: false, 
        error: 'GST Number must be exactly 15 characters' 
      };
    }

    // Improved GST regex pattern: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstRegex.test(cleanGST)) {
      return { 
        isValid: false, 
        error: 'Please enter a valid 15-character GSTIN (e.g., 22AAAAA0000A1Z5)' 
      };
    }

    return { isValid: true };
  };

  // Enhanced Email Validation Helper Function
  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }

    // Enhanced email regex that's more strict
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      return { 
        isValid: false, 
        error: 'Please enter a valid email address (e.g., user@example.com)' 
      };
    }

    // Additional checks
    const trimmedEmail = email.trim();
    
    // Check for consecutive dots
    if (trimmedEmail.includes('..')) {
      return { 
        isValid: false, 
        error: 'Email cannot contain consecutive dots' 
      };
    }

    // Check for spaces
    if (trimmedEmail.includes(' ')) {
      return { 
        isValid: false, 
        error: 'Email cannot contain spaces' 
      };
    }

    // Check domain length
    const domain = trimmedEmail.split('@')[1];
    if (domain && domain.length > 253) {
      return { 
        isValid: false, 
        error: 'Email domain is too long' 
      };
    }

    return { isValid: true };
  };

  // GST Key Down Handler to prevent invalid characters
  const handleGSTKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentValue: string) => {
    const key = e.key;
    const currentLength = currentValue.length;
    
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key) || key.startsWith('Arrow')) {
      return;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
      return;
    }
    
    // Prevent if already at 15 characters
    if (currentLength >= 15) {
      e.preventDefault();
      return;
    }
    
    // Check character validity based on position
    const char = key.toUpperCase();
    
    if (currentLength < 2) {
      // First 2 positions: only digits (state code)
      if (!/[0-9]/.test(char)) {
        e.preventDefault();
        return;
      }
    } else if (currentLength < 7) {
      // Positions 2-6: only letters (first part of PAN)
      if (!/[A-Z]/.test(char)) {
        e.preventDefault();
        return;
      }
    } else if (currentLength < 11) {
      // Positions 7-10: only digits (second part of PAN)
      if (!/[0-9]/.test(char)) {
        e.preventDefault();
        return;
      }
    } else if (currentLength === 11) {
      // Position 11: only letters (third part of PAN)
      if (!/[A-Z]/.test(char)) {
        e.preventDefault();
        return;
      }
    } else if (currentLength === 12) {
      // Position 12: only letters and numbers 1-9 (registration number)
      if (!/[1-9A-Z]/.test(char)) {
        e.preventDefault();
        return;
      }
    } else if (currentLength === 13) {
      // Position 13: only 'Z'
      if (char !== 'Z') {
        e.preventDefault();
        return;
      }
    } else if (currentLength === 14) {
      // Position 14: only letters and digits (check code)
      if (!/[0-9A-Z]/.test(char)) {
        e.preventDefault();
        return;
      }
    }
  };

  // GST Input Handler with character blocking
  const handleGSTInput = (value: string, setter: (value: string) => void, validator: (isValid: boolean) => void) => {
    const upperValue = value.toUpperCase();
    
    // Block input if it exceeds 15 characters
    if (upperValue.length > 15) {
      return;
    }
    
    // Filter characters based on position
    let filteredValue = '';
    for (let i = 0; i < upperValue.length; i++) {
      const char = upperValue[i];
      
      if (i < 2) {
        // First 2 positions: only digits (state code)
        if (/[0-9]/.test(char)) {
          filteredValue += char;
        }
      } else if (i < 7) {
        // Positions 2-6: only letters (first part of PAN)
        if (/[A-Z]/.test(char)) {
          filteredValue += char;
        }
      } else if (i < 11) {
        // Positions 7-10: only digits (second part of PAN)
        if (/[0-9]/.test(char)) {
          filteredValue += char;
        }
      } else if (i === 11) {
        // Position 11: only letters (third part of PAN)
        if (/[A-Z]/.test(char)) {
          filteredValue += char;
        }
      } else if (i === 12) {
        // Position 12: only letters and numbers 1-9 (registration number)
        if (/[1-9A-Z]/.test(char)) {
          filteredValue += char;
        }
      } else if (i === 13) {
        // Position 13: only 'Z'
        if (char === 'Z') {
          filteredValue += char;
        }
      } else if (i === 14) {
        // Position 14: only letters and digits (check code)
        if (/[0-9A-Z]/.test(char)) {
          filteredValue += char;
        }
      }
    }
    
    // Only update if the filtered value is different (prevents invalid characters)
    if (filteredValue !== value) {
      return; // Don't update if invalid characters were blocked
    }
    
    setter(filteredValue);
    
    // Validate the complete GST format
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    validator(gstRegex.test(filteredValue));
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
          companyAddress: {
            ...prev.companyAddress,
            state: data.state || '',
            city: data.city || '',
            area: '' // Reset area when pincode changes
          }
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          companyAddress: {
            ...prev.companyAddress,
            state: '',
            city: '',
            area: ''
          }
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

  // Handle company address changes
  const handleCompanyAddressChange = (field: keyof typeof formData.companyAddress, value: string) => {
    if (field === 'gst') {
      // Use the new GST input handler for GST field
      handleGSTInput(value, (gstValue) => {
        setFormData(prev => ({
          ...prev,
          companyAddress: {
            ...prev.companyAddress,
            gst: gstValue
          }
        }));
      }, setIsValidCompanyGST);
    } else {
      // Handle other fields normally
      setFormData(prev => ({
        ...prev,
        companyAddress: {
          ...prev.companyAddress,
          [field]: value
        }
      }));

      // If pincode is being changed, trigger lookup
      if (field === 'pincode') {
        if (value.length === 6) {
          lookupPincode(value);
        } else {
          // Clear other fields if pincode is incomplete
          setFormData(prev => ({
            ...prev,
            companyAddress: {
              ...prev.companyAddress,
              state: '',
              city: '',
              area: ''
            }
          }));
          setAvailableAreas([]);
        }
      }
    }
  };

  // Function to lookup pincode for FROM locations
  const lookupFromLocationPincode = async (locationId: string, pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingFromPincode(prev => ({ ...prev, [locationId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          fromLocations: prev.fromLocations.map(location =>
            location.id === locationId 
              ? { ...location, state: data.state || '', city: data.city || '', area: '' }
              : location
          )
        }));
        setFromLocationAreas(prev => ({ ...prev, [locationId]: data.areas || [] }));
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          fromLocations: prev.fromLocations.map(location =>
            location.id === locationId 
              ? { ...location, state: '', city: '', area: '' }
              : location
          )
        }));
        setFromLocationAreas(prev => ({ ...prev, [locationId]: [] }));
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
      setIsLoadingFromPincode(prev => ({ ...prev, [locationId]: false }));
    }
  };

  // Function to lookup pincode for TO locations
  const lookupToLocationPincode = async (locationId: string, pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingToPincode(prev => ({ ...prev, [locationId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          toLocations: prev.toLocations.map(location =>
            location.id === locationId 
              ? { ...location, state: data.state || '', city: data.city || '', area: '' }
              : location
          )
        }));
        setToLocationAreas(prev => ({ ...prev, [locationId]: data.areas || [] }));
      } else {
        // Clear fields if pincode not found
        setFormData(prev => ({
          ...prev,
          toLocations: prev.toLocations.map(location =>
            location.id === locationId 
              ? { ...location, state: '', city: '', area: '' }
              : location
          )
        }));
        setToLocationAreas(prev => ({ ...prev, [locationId]: [] }));
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
      setIsLoadingToPincode(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const handleServiceModeChange = (modeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceModes: checked 
        ? [...prev.serviceModes, modeId]
        : prev.serviceModes.filter(mode => mode !== modeId)
    }));
  };

  const handleMobileNumberChange = (index: number, value: string) => {
    const newMobileNumbers = [...formData.mobileNumbers];
    newMobileNumbers[index] = value;
    setFormData(prev => ({
      ...prev,
      mobileNumbers: newMobileNumbers
    }));
  };

  const handleMobileNumberNameChange = (index: number, value: string) => {
    const newMobileNumberNames = [...formData.mobileNumberNames];
    newMobileNumberNames[index] = value;
    setFormData(prev => ({
      ...prev,
      mobileNumberNames: newMobileNumberNames
    }));
  };

  const addMobileNumber = () => {
    setFormData(prev => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, ''],
      mobileNumberNames: [...prev.mobileNumberNames, '']
    }));
  };

  const removeMobileNumber = (index: number) => {
    if (formData.mobileNumbers.length > 1) {
      const newMobileNumbers = formData.mobileNumbers.filter((_, i) => i !== index);
      const newMobileNumberNames = formData.mobileNumberNames.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        mobileNumbers: newMobileNumbers,
        mobileNumberNames: newMobileNumberNames
      }));
    }
  };

  const handleFromLocationChange = (locationId: string, field: keyof FromLocation, value: string) => {
    if (field === 'gst') {
      // Use the new GST input handler for GST field
      handleGSTInput(value, (gstValue) => {
        setFormData(prev => ({
          ...prev,
          fromLocations: prev.fromLocations.map(location =>
            location.id === locationId ? { ...location, gst: gstValue } : location
          )
        }));
      }, (isValid) => {
        setIsValidFromGST(prev => ({ ...prev, [locationId]: isValid }));
      });
    } else {
      // Handle other fields normally
      setFormData(prev => ({
        ...prev,
        fromLocations: prev.fromLocations.map(location =>
          location.id === locationId ? { ...location, [field]: value } : location
        )
      }));

      // If pincode is being changed, trigger lookup
      if (field === 'pincode') {
        if (value.length === 6) {
          lookupFromLocationPincode(locationId, value);
        } else {
          // Clear other fields if pincode is incomplete
          setFormData(prev => ({
            ...prev,
            fromLocations: prev.fromLocations.map(location =>
              location.id === locationId 
                ? { ...location, state: '', city: '', area: '' }
                : location
            )
          }));
          setFromLocationAreas(prev => ({ ...prev, [locationId]: [] }));
        }
      }
    }
  };

  const handleToLocationChange = (locationId: string, field: keyof ToLocation, value: string) => {
    if (field === 'gst') {
      // Use the new GST input handler for GST field
      handleGSTInput(value, (gstValue) => {
        setFormData(prev => ({
          ...prev,
          toLocations: prev.toLocations.map(location =>
            location.id === locationId ? { ...location, gst: gstValue } : location
          )
        }));
      }, (isValid) => {
        setIsValidToGST(prev => ({ ...prev, [locationId]: isValid }));
      });
    } else {
      // Handle other fields normally
      setFormData(prev => ({
        ...prev,
        toLocations: prev.toLocations.map(location =>
          location.id === locationId ? { ...location, [field]: value } : location
        )
      }));

      // If pincode is being changed, trigger lookup
      if (field === 'pincode') {
        if (value.length === 6) {
          lookupToLocationPincode(locationId, value);
        } else {
          // Clear other fields if pincode is incomplete
          setFormData(prev => ({
            ...prev,
            toLocations: prev.toLocations.map(location =>
              location.id === locationId 
                ? { ...location, state: '', city: '', area: '' }
                : location
            )
          }));
          setToLocationAreas(prev => ({ ...prev, [locationId]: [] }));
        }
      }
    }
  };

  const addFromLocation = () => {
    const newLocation: FromLocation = {
      id: Date.now().toString(),
      concernPerson: '',
      mobile: '',
      email: '',
      pincode: '',
      state: '',
      city: '',
      area: '',
      address: '',
      flatNo: '',
      landmark: '',
      gst: ''
    };
    setFormData(prev => ({
      ...prev,
      fromLocations: [...prev.fromLocations, newLocation]
    }));
  };

  const addToLocation = () => {
    const newLocation: ToLocation = {
      id: Date.now().toString(),
      concernPerson: '',
      mobile: '',
      email: '',
      pincode: '',
      state: '',
      city: '',
      area: '',
      address: '',
      flatNo: '',
      landmark: '',
      gst: ''
    };
    setFormData(prev => ({
      ...prev,
      toLocations: [...prev.toLocations, newLocation]
    }));
  };

  const removeFromLocation = (locationId: string) => {
    if (formData.fromLocations.length > 1) {
      setFormData(prev => ({
        ...prev,
        fromLocations: prev.fromLocations.filter(location => location.id !== locationId)
      }));
    }
  };

  const removeToLocation = (locationId: string) => {
    if (formData.toLocations.length > 1) {
      setFormData(prev => ({
        ...prev,
        toLocations: prev.toLocations.filter(location => location.id !== locationId)
      }));
    }
  };

  const validateCompanyForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (formData.serviceModes.length === 0) {
      newErrors.serviceModes = 'Please select at least one service mode';
    }

    if (!formData.concernPerson.trim()) {
      newErrors.concernPerson = 'Concern person is required';
    }

    const validMobileNumbers = formData.mobileNumbers.filter(num => num.trim() !== '');
    if (validMobileNumbers.length === 0) {
      newErrors.mobileNumbers = 'At least one mobile number is required';
    } else {
      // Validate mobile number format (10 digits)
      const invalidMobileNumbers = validMobileNumbers.filter(num => !/^\d{10}$/.test(num.trim()));
      if (invalidMobileNumbers.length > 0) {
        newErrors.mobileNumbers = 'Mobile numbers must be exactly 10 digits';
      }
    }

    // Enhanced email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    // Company address validation
    if (!formData.companyAddress.pincode.trim()) {
      newErrors.companyPincode = 'Company pincode is required';
    } else if (!/^\d{6}$/.test(formData.companyAddress.pincode)) {
      newErrors.companyPincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.companyAddress.state.trim()) {
      newErrors.companyState = 'Company state is required';
    }

    if (!formData.companyAddress.city.trim()) {
      newErrors.companyCity = 'Company city is required';
    }

    if (!formData.companyAddress.area.trim()) {
      newErrors.companyArea = 'Company area is required';
    }

    if (!formData.companyAddress.address.trim()) {
      newErrors.companyAddress = 'Company address is required';
    }

    if (!formData.companyAddress.flatNo.trim()) {
      newErrors.companyFlatNo = 'Flat No/Building Name is required';
    }

    // Enhanced GST validation
    const gstValidation = validateGST(formData.companyAddress.gst);
    if (!gstValidation.isValid) {
      newErrors.companyGst = gstValidation.error || 'Invalid GST';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFromLocations = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // If additional from locations are shown, validate them
    if (showAdditionalFromLocations) {
      formData.fromLocations.forEach((location, index) => {
        // Validate email
        const emailValidation = validateEmail(location.email);
        if (!emailValidation.isValid) {
          newErrors[`fromEmail-${location.id}`] = emailValidation.error || 'Invalid email';
        }

        // Validate GST
        const gstValidation = validateGST(location.gst);
        if (!gstValidation.isValid) {
          newErrors[`fromGst-${location.id}`] = gstValidation.error || 'Invalid GST';
        }

        // Validate mobile number
        if (!/^\d{10}$/.test(location.mobile.trim())) {
          newErrors[`fromMobile-${location.id}`] = 'Mobile number must be exactly 10 digits';
        }
      });

      const validFromLocations = formData.fromLocations.filter(location => 
        location.concernPerson.trim() !== '' && location.mobile.trim() !== '' && 
        /^\d{10}$/.test(location.mobile.trim()) && location.email.trim() !== '' && 
        validateEmail(location.email).isValid && location.pincode.trim() !== '' && 
        location.state.trim() !== '' && location.city.trim() !== '' && 
        location.area.trim() !== '' && location.address.trim() !== '' && 
        location.flatNo.trim() !== '' && location.gst.trim() !== '' &&
        validateGST(location.gst).isValid
      );
      
      if (validFromLocations.length === 0) {
        newErrors.fromLocations = 'At least one complete FROM location is required';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateToLocations = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate each TO location
    formData.toLocations.forEach((location, index) => {
      // Validate email
      const emailValidation = validateEmail(location.email);
      if (!emailValidation.isValid) {
        newErrors[`toEmail-${location.id}`] = emailValidation.error || 'Invalid email';
      }

      // Validate GST
      const gstValidation = validateGST(location.gst);
      if (!gstValidation.isValid) {
        newErrors[`toGst-${location.id}`] = gstValidation.error || 'Invalid GST';
      }

      // Validate mobile number
      if (!/^\d{10}$/.test(location.mobile.trim())) {
        newErrors[`toMobile-${location.id}`] = 'Mobile number must be exactly 10 digits';
      }
    });
    
    const validToLocations = formData.toLocations.filter(location => 
      location.concernPerson.trim() !== '' && location.mobile.trim() !== '' && 
      /^\d{10}$/.test(location.mobile.trim()) && location.email.trim() !== '' && 
      validateEmail(location.email).isValid && location.pincode.trim() !== '' && 
      location.state.trim() !== '' && location.city.trim() !== '' && 
      location.area.trim() !== '' && location.address.trim() !== '' && 
      location.flatNo.trim() !== '' && location.gst.trim() !== '' &&
      validateGST(location.gst).isValid
    );
    
    if (validToLocations.length === 0) {
      newErrors.toLocations = 'At least one complete TO location is required';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleCompanyFormSubmit = () => {
    if (validateCompanyForm()) {
      setIsCompanyFormMinimized(true);
      toast({
        title: "Success",
        description: "Company details saved successfully!",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
        variant: "destructive"
      });
    }
  };

  const handleFromFormSubmit = () => {
    if (validateFromLocations()) {
      setIsFromFormMinimized(true);
      toast({
        title: "Success",
        description: "FROM locations saved successfully!",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
        variant: "destructive"
      });
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateToLocations()) {
      toast({
        title: "Validation Error",
        description: "Please complete all TO locations before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting coloader registration:', formData);
      
      // Prepare data for API submission
      // Create the primary from location from company information
      const primaryFromLocation = {
        id: 'company',
        concernPerson: formData.concernPerson,
        mobile: formData.mobileNumbers[0] || '',
        email: formData.email,
        pincode: formData.companyAddress.pincode,
        state: formData.companyAddress.state,
        city: formData.companyAddress.city,
        area: formData.companyAddress.area,
        address: formData.companyAddress.address,
        flatNo: formData.companyAddress.flatNo,
        landmark: formData.companyAddress.landmark,
        gst: formData.companyAddress.gst
      };

      // Combine primary location with additional from locations
      const allFromLocations = [
        primaryFromLocation,
        ...formData.fromLocations.filter(location => 
          location.concernPerson.trim() !== '' && location.mobile.trim() !== '' && 
          location.email.trim() !== '' && location.pincode.trim() !== '' && 
          location.state.trim() !== '' && location.city.trim() !== '' && 
          location.area.trim() !== '' && location.address.trim() !== '' && 
          location.flatNo.trim() !== '' && location.gst.trim() !== ''
        )
      ];

      const submissionData = {
        companyName: formData.companyName,
        serviceModes: formData.serviceModes,
        concernPerson: formData.concernPerson,
        mobileNumbers: formData.mobileNumbers.filter(num => num.trim() !== ''),
        email: formData.email,
        website: formData.website,
        companyAddress: formData.companyAddress,
        fromLocations: allFromLocations,
        toLocations: formData.toLocations.filter(location => 
          location.concernPerson.trim() !== '' && location.mobile.trim() !== '' && 
          location.email.trim() !== '' && location.pincode.trim() !== '' && 
          location.state.trim() !== '' && location.city.trim() !== '' && 
          location.area.trim() !== '' && location.address.trim() !== '' && 
          location.flatNo.trim() !== '' && location.gst.trim() !== ''
        )
      };

      const response = await fetch('http://localhost:5000/api/coloader/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Coloader registration submitted successfully! Your Coloader ID is: ${result.coloaderId}`,
        });

        // Reset form
        setFormData({
          companyName: '',
          serviceModes: [],
          concernPerson: '',
          mobileNumbers: [''],
          mobileNumberNames: [''],
          email: '',
          website: '',
          companyAddress: {
            pincode: '',
            state: '',
            city: '',
            area: '',
            address: '',
            flatNo: '',
            landmark: '',
            gst: ''
          },
          fromLocations: [],
          toLocations: [{ id: '1', concernPerson: '', mobile: '', email: '', pincode: '', state: '', city: '', area: '', address: '', flatNo: '', landmark: '', gst: '' }]
        });
        setErrors({});
        setAvailableAreas([]);
        setFromLocationAreas({});
        setToLocationAreas({});
        setIsCompanyFormMinimized(false);
        setIsFromFormMinimized(false);
        setShowAdditionalFromLocations(false);
      } else {
        throw new Error(result.error || 'Failed to submit registration');
      }
      
    } catch (error) {
      console.error('Error submitting coloader registration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit coloader registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 px-[10vw]">
      <div className="flex items-center gap-3">
        <div style={{ backgroundColor: '#416bba' }} className="p-3 rounded-xl">
          <Truck color="#eef1f9" className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-['Calibr']">Coloader Registration</h1>
        </div>
      </div>

<div className='coloader-registration-box-main'>
      {/* Company Information Section */}
      <Card className="shadow-lg border-0 bg-white">
        {isCompanyFormMinimized ? (
          // Compact Card View
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <img src="/src/Icon-images/distribution.png" alt="building" className="h-8 w-8" />
                  {/* <Building2 className="h-6 w-6 text-blue-600" /> */}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      style={{
                        backgroundColor: '#eef1f9',
                        color: '#4274c6',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                      }}
                      className="font-bold text-gray-800 font-['Calibr'] text-lg"
                    >
                      {formData.companyName}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCompanyFormMinimized(false)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm font-['Calibri'] mb-2 font-extrabold">
                    {formData.serviceModes.map(mode => 
                      serviceModeOptions.find(opt => opt.id === mode)?.label
                    ).join(', ')}
                  </p>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="space-y-2">
                      {/* First Name */}
                        <div className="flex items-center gap-2">
                        <img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />
                          <span className="text-sm text-gray-600 font-['Calibri']">{formData.concernPerson}</span>
                        </div>
                      
                      {/* Complete Address Line */}
                      <div className="flex items-start gap-2">
                        <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4 mt-0.5" />
                          <span className="text-sm text-gray-600 font-['Calibri']">
                          {(() => {
                            const addressParts = [
                              formData.companyAddress.address,
                              formData.companyAddress.flatNo,
                              formData.companyAddress.landmark,
                              formData.companyAddress.area,
                              formData.companyAddress.city
                            ].filter(Boolean);
                            
                            const pincode = formData.companyAddress.pincode;
                            const state = formData.companyAddress.state;
                            
                            let result = addressParts.join(', ');
                            
                            if (pincode) {
                              result += result ? `, ${pincode}` : pincode;
                            }
                            
                            if (state) {
                              result += result ? ` - (${state})` : `(${state})`;
                            }
                            
                            return result || 'No address information';
                          })()}
                          </span>
                        </div>
                      
                      {/* Phone, Email, GST, Website on same line */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />
                          <span className="text-sm text-gray-600 font-['Calibri']">
                          {formData.mobileNumbers[0] ? `+91 ${formData.mobileNumbers[0]}` : 'No number'}
                          </span>
                        <span className="text-gray-400 mx-1">•</span>
                        <img src="/src/Icon-images/communication.png" alt="email" className="h-4 w-4" />
                        <span className="text-sm text-gray-600 font-['Calibri']">{formData.email || 'No email'}</span>
                        <span className="text-gray-400 mx-1">•</span>
                        <img src="/src/Icon-images/calculate.png" alt="gst" className="h-4 w-4" />
                            <span className="text-sm text-gray-600 font-['Calibri']">
                          {formData.companyAddress.gst || 'No GST'}
                            </span>
                        {formData.website && (
                          <>
                            <span className="text-gray-400 mx-1">•</span>
                            <img src="/src/Icon-images/world-wide-web.png" alt="website" className="h-4 w-4" />
                            <span className="text-sm text-gray-600 font-['Calibri']">{formData.website}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompanyFormMinimized(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          // Full Form View
          <>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="flex items-center justify-between text-gray-800">
                <div className="flex items-center gap-2">
                  <img style={{width:'40px',height:'40px',borderRadius:'20px'}} src="https://cdn.pixabay.com/photo/2023/06/16/03/08/seagull-8066874_1280.jpg" alt="seegal image" />
                  <span className="font-['Calibr']">Company Information</span>
                  <Truck/>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCompanyFormMinimized(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronsUpDown color="#6b7280" />
                  Minimize
                </Button>
          </CardTitle>
        </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
             {/* 1. Company Name */}
            <FloatingLabelInput
              id="companyName"
              value={formData.companyName}
              onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
              placeholder="Company Name"
              error={errors.companyName}
              required
            />

             {/* 2. Service Modes */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 font-['Calibr']">
                Service Mode *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serviceModeOptions.map((mode) => (
                  <div key={mode.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={mode.id}
                      checked={formData.serviceModes.includes(mode.id)}
                      onCheckedChange={(checked) => handleServiceModeChange(mode.id, checked as boolean)}
                    />
                      <Label style={{fontWeight:900}} htmlFor={mode.id} className="text-sm text-gray-700 font-['Calibri']">
                      {mode.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.serviceModes && (
                <p className="text-sm text-red-600">{errors.serviceModes}</p>
              )}
            </div>

             {/* 3. Concern Person */}
            <FloatingLabelInput
              id="concernPerson"
              value={formData.concernPerson}
              onChange={(value) => setFormData(prev => ({ ...prev, concernPerson: value }))}
              placeholder="Concern Person"
              icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
              error={errors.concernPerson}
              required
            />

             {/* 4. Address Inputs Section */}
             <div className="space-y-4">
               <div className="border-t border-gray-200 pt-4">
                 <Label className="text-sm font-semibold text-gray-700 font-['Calibr'] flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-blue-600" />
                   Address Details *
              </Label>
               </div>

               {/* Address and Building/Flat No in single line */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                 id="companyAddress"
                 value={formData.companyAddress.address}
                 onChange={(value) => handleCompanyAddressChange('address', value)}
                 placeholder="Locality / Street "
                 className="font-['Calibri']"
                 icon={<img src="/src/Icon-images/streets.png" alt="streets" className="h-4 w-4" />}
                 error={errors.companyAddress}
                 required
               />

              <FloatingLabelInput
                 id="companyFlatNo"
                 value={formData.companyAddress.flatNo}
                 onChange={(value) => handleCompanyAddressChange('flatNo', value)}
                 placeholder="Building / Flat No."
                 className="font-['Calibri']"
                 icon={<img src="/src/Icon-images/building.png" alt="building" className="h-4 w-4" />}
                 error={errors.companyFlatNo}
                required
              />
               </div>

               {/* Landmark and GST */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                   id="companyLandmark"
                   value={formData.companyAddress.landmark}
                   onChange={(value) => handleCompanyAddressChange('landmark', value)}
                   placeholder="Landmark (Optional)"
                   className="font-['Calibri']"
                   icon={<img src="/src/Icon-images/landmark.png" alt="landmark" className="h-4 w-4" />}
                 />

                 <FloatingLabelInput
                   id="companyGst"
                   value={formData.companyAddress.gst}
                   onChange={(value) => handleCompanyAddressChange('gst', value)}
                   onKeyDown={(e) => handleGSTKeyDown(e, formData.companyAddress.gst)}
                   placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                   className="font-['Calibri']"
                   icon={<img src="/src/Icon-images/calculate.png" alt="calculate" className="h-4 w-4" />}
                   error={errors.companyGst}
                   required
                 />
               </div>
            </div>

             {/* 5. Company Address Section (Location) */}
            <div className="space-y-4">
              
              
              {/* Pincode */}
              <FloatingLabelInput
                id="companyPincode"
                value={formData.companyAddress.pincode}
                onChange={(value) => handleCompanyAddressChange('pincode', value)}
                placeholder="Pincode"
                type="text"
                maxLength={6}
                className="font-['Calibri']"
                icon={isLoadingPincode ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />
                )}
                error={errors.companyPincode}
                required
              />

              {/* State and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelInput
                  id="companyState"
                  value={formData.companyAddress.state}
                  onChange={(value) => handleCompanyAddressChange('state', value)}
                  placeholder="State"
                  className="font-['Calibri']"
                  icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                  error={errors.companyState}
                  required
                />

                <FloatingLabelInput
                  id="companyCity"
                  value={formData.companyAddress.city}
                  onChange={(value) => handleCompanyAddressChange('city', value)}
                  placeholder="City"
                  className="font-['Calibri']"
                  icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                  error={errors.companyCity}
                  required
                />
              </div>

              {/* Area Dropdown */}
              <div className="space-y-2">
                {/* <Label className="text-sm font-semibold text-gray-700 font-['Calibr']">
                  Area *
                </Label> */}
                <select
                  value={formData.companyAddress.area}
                  onChange={(e) => handleCompanyAddressChange('area', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] ${
                    errors.companyArea ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={availableAreas.length === 0}
                >
                  <option value="">
                    {availableAreas.length === 0 ? 'Enter pincode first' : 'Select Area'}
                  </option>
                  {availableAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {errors.companyArea && (
                  <p className="text-sm text-red-600">{errors.companyArea}</p>
                )}
               </div>
              </div>

             {/* 6. Contact Information */}
             <div className="space-y-4">
               

               {/* Mobile Numbers */}
               <div className="space-y-3">
                 {/* <Label className="text-sm font-semibold text-gray-700 font-['Calibr']">
                   Mobile Numbers123 *
                 </Label> */}
                 {formData.mobileNumbers.map((number, index) => (
                   <div key={index} className="space-y-2">
                     {index === 0 ? (
                       // First mobile number (concern person's number)
                       <div className="flex items-center gap-2">
                         <div className="flex-1">
                           <FloatingLabelInput
                             id={`mobile-${index}`}
                             value={number}
                             onChange={(value) => handleMobileNumberChange(index, value)}
                             placeholder="Mobile Number (Concern Person)"
                             type="tel"
                             maxLength={10}
                             icon={<img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />}
                           />
                         </div>
                       </div>
                     ) : (
                       // Additional mobile numbers with names
                       <div className="flex items-center gap-2">
                         <div className="flex-1">
                           <FloatingLabelInput
                             id={`mobile-name-${index}`}
                             value={formData.mobileNumberNames[index] || ''}
                             onChange={(value) => handleMobileNumberNameChange(index, value)}
                             placeholder="Person Name"
                             icon={<User className="h-4 w-4" />}
                           />
                         </div>
                         <div className="flex-1">
                           <FloatingLabelInput
                             id={`mobile-${index}`}
                             value={number}
                             onChange={(value) => handleMobileNumberChange(index, value)}
                             placeholder="Mobile Number"
                             type="tel"
                             maxLength={10}
                             icon={<img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />}
                           />
                         </div>
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => removeMobileNumber(index)}
                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     )}
                   </div>
                 ))}
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={addMobileNumber}
                   className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Add Mobile Number
                 </Button>
                 {errors.mobileNumbers && (
                   <p className="text-sm text-red-600">{errors.mobileNumbers}</p>
                 )}
              </div>

               {/* Email and Website */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                   id="email"
                   value={formData.email}
                   onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                   placeholder="Email"
                   type="email"
                   icon={<img src="/src/Icon-images/communication.png" alt="email" className="h-4 w-4" />}
                   error={errors.email}
                required
              />

                <FloatingLabelInput
                   id="website"
                   value={formData.website}
                   onChange={(value) => setFormData(prev => ({ ...prev, website: value }))}
                   placeholder="Website"
                   icon={<img src="/src/Icon-images/world-wide-web.png" alt="website" className="h-4 w-4" />}
                />
              </div>
            </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAdditionalFromLocations(true);
                      addFromLocation();
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add From Location
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCompanyFormSubmit}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Company Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* FROM Locations Section - Only show when additional locations are needed */}
      {showAdditionalFromLocations && (
        <Card className="shadow-lg border-0 bg-white">
        {isFromFormMinimized ? (
          // Compact Card View
          <div className="p-4 mt-5">
            <div className="space-y-3">
              {formData.fromLocations.map((location, index) => (
                <div key={location.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div  className="flex-1  ">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          style={{
                            backgroundColor: '#eef1f9',
                            color: '#4274c6',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                          }}
                          className="font-bold text-gray-800 font-['Calibr'] text-lg"
                        >
                          Office {index + 1}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFromFormMinimized(false)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                      </div>
                      <div className="space-y-2">
                         {/* First Name */}
                        <div className="flex items-center gap-2">
                           <img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />
                          <span className="text-sm text-gray-600 font-['Calibri'] font-semibold">
                            {location.concernPerson || 'No contact person'}
                          </span>
                        </div>
                         
                         {/* Complete Address Line */}
                         <div className="flex items-start gap-2">
                           <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4 mt-0.5" />
                            <span className="text-sm text-gray-600 font-['Calibri']">
                             {(() => {
                               const addressParts = [
                                 location.address,
                                 location.flatNo,
                                 location.landmark,
                                 location.area,
                                 location.city
                               ].filter(Boolean);
                               
                               const pincode = location.pincode;
                               const state = location.state;
                               
                               let result = addressParts.join(', ');
                               
                               if (pincode) {
                                 result += result ? `, ${pincode}` : pincode;
                               }
                               
                               if (state) {
                                 result += result ? ` - (${state})` : `(${state})`;
                               }
                               
                               return result || 'No address information';
                             })()}
                            </span>
                          </div>
                         
                         {/* Phone, Email, GST on same line */}
                         <div className="flex items-center gap-2 flex-wrap">
                           <img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />
                            <span className="text-sm text-gray-600 font-['Calibri']">
                             {location.mobile || 'No mobile'}
                            </span>
                           <span className="text-gray-400 mx-1">•</span>
                           <img src="/src/Icon-images/communication.png" alt="email" className="h-4 w-4" />
                            <span className="text-sm text-gray-600 font-['Calibri']">
                             {location.email || 'No email'}
                            </span>
                           <span className="text-gray-400 mx-1">•</span>
                           <img src="/src/Icon-images/calculate.png" alt="gst" className="h-4 w-4" />
                              <span className="text-sm text-gray-600 font-['Calibri']">
                             {location.gst || 'No GST'}
                              </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFromFormMinimized(false)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Full Form View
          <>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 mt-8">
              <CardTitle className="flex items-center justify-between text-gray-800">
                <div className="flex items-center gap-2">
                  <img src="/src/Icon-images/location.png" alt="location" className="h-8 w-8" />
                  <span className="font-['Calibr']">FROM Locations</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFromFormMinimized(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronsUpDown color="#6b7280" />
                  Minimize
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
              {formData.fromLocations.map((location, index) => (
                <div key={location.id} className="p-4 ">
                    <div className="flex items-center justify-between mb-3">
                    <h4
                      style={{
                        padding: '0.5rem 1rem'
                      }}
                      className="text-sm font-semibold text-gray-700 font-['Calibr']"
                    >
                      Office - {index + 1}
                    </h4>
                    {formData.fromLocations.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                        onClick={() => removeFromLocation(location.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  <div className="space-y-3">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      
                      
                      <FloatingLabelInput
                        id={`from-concern-person-${location.id}`}
                        value={location.concernPerson}
                        onChange={(value) => handleFromLocationChange(location.id, 'concernPerson', value)}
                        placeholder="Concern Person"
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                          id={`from-mobile-${location.id}`}
                          value={location.mobile}
                          onChange={(value) => handleFromLocationChange(location.id, 'mobile', value)}
                          placeholder="Mobile Number"
                          type="tel"
                          maxLength={10}
                          className="font-['Calibri']"
                           icon={<img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />}
                          required
                        />

                        <FloatingLabelInput
                          id={`from-email-${location.id}`}
                          value={location.email}
                          onChange={(value) => handleFromLocationChange(location.id, 'email', value)}
                          placeholder="Email"
                          type="email"
                          className="font-['Calibri']"
                          icon={<img src="/src/Icon-images/communication.png" alt="email" className="h-4 w-4" />}
                          error={errors[`fromEmail-${location.id}`]}
                          required
                        />
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-3">
                      
                      {/* Pincode */}
                      <FloatingLabelInput
                        id={`from-pincode-${location.id}`}
                        value={location.pincode}
                        onChange={(value) => handleFromLocationChange(location.id, 'pincode', value)}
                        placeholder="Pincode"
                        type="text"
                        maxLength={6}
                        className="font-['Calibri']"
                        icon={isLoadingFromPincode[location.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                           <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />
                        )}
                        required
                      />

                      {/* State and City */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                          id={`from-state-${location.id}`}
                          value={location.state}
                          onChange={(value) => handleFromLocationChange(location.id, 'state', value)}
                          placeholder="State"
                          className="font-['Calibri']"
                           icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                          required
                        />

                        <FloatingLabelInput
                          id={`from-city-${location.id}`}
                          value={location.city}
                          onChange={(value) => handleFromLocationChange(location.id, 'city', value)}
                          placeholder="City"
                          className="font-['Calibri']"
                           icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                          required
                        />
                      </div>

                      {/* Area Dropdown */}
                      <div className="space-y-2">
                       
                        <select
                          value={location.area}
                          onChange={(e) => handleFromLocationChange(location.id, 'area', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] border-gray-300`}
                          disabled={!fromLocationAreas[location.id] || fromLocationAreas[location.id].length === 0}
                        >
                          <option value="">
                            {!fromLocationAreas[location.id] || fromLocationAreas[location.id].length === 0 
                              ? 'Enter pincode first' 
                              : 'Select Area'
                            }
                          </option>
                          {fromLocationAreas[location.id]?.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Address and Building/Flat No in single line */}
                    <div className="space-y-2">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                          id={`from-address-${location.id}`}
                          value={location.address}
                          onChange={(value) => handleFromLocationChange(location.id, 'address', value)}
                          placeholder="Locality / Street"
                          className="font-['Calibri']"
                           icon={<img src="/src/Icon-images/streets.png" alt="location" className="h-4 w-4" />}
                          required
                        />

                        <FloatingLabelInput
                          id={`from-flat-no-${location.id}`}
                          value={location.flatNo}
                          onChange={(value) => handleFromLocationChange(location.id, 'flatNo', value)}
                          placeholder="Building Name / Flat No."
                          className="font-['Calibri']"
                           icon={<img src="/src/Icon-images/building.png" alt="location" className="h-4 w-4" />}
                          required
                        />
                      </div>
                    </div>

                    {/* Landmark and GST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id={`from-landmark-${location.id}`}
                        value={location.landmark}
                        onChange={(value) => handleFromLocationChange(location.id, 'landmark', value)}
                        placeholder="Landmark (Optional)"
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/landmark.png" alt="location" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id={`from-gst-${location.id}`}
                        value={location.gst}
                        onChange={(value) => handleFromLocationChange(location.id, 'gst', value)}
                        onKeyDown={(e) => handleGSTKeyDown(e, location.gst)}
                        placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/calculate.png" alt="gst" className="h-4 w-4" />}
                        error={errors[`fromGst-${location.id}`]}
                        required
                      />
                    </div>
                    </div>
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFromLocation}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FROM Location
              </Button>
              {errors.fromLocations && (
                <p className="text-sm text-red-600">{errors.fromLocations}</p>
              )}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={handleFromFormSubmit}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save FROM Locations
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
        </Card>
      )}

      {/* TO Locations Section */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 mt-8">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <img src="/src/Icon-images/location.png" alt="location" className="h-8 w-8" />
            <span className="font-['Calibr']">To Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {formData.toLocations.map((location, index) => (
              <div key={location.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4
                  style={{padding:'10px 20px'}}
                  
                    className="text-sm font-semibold text-gray-700 font-['Calibr']"
                  >
                    TO - Location - {index + 1}
                  </h4>
                  {formData.toLocations.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeToLocation(location.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
              )}
            </div>
                <div className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    
                    
                    <FloatingLabelInput
                      id={`to-concern-person-${location.id}`}
                      value={location.concernPerson}
                      onChange={(value) => handleToLocationChange(location.id, 'concernPerson', value)}
                      placeholder="Concern Person"
                      className="font-['Calibri']"
                       icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id={`to-mobile-${location.id}`}
                        value={location.mobile}
                        onChange={(value) => handleToLocationChange(location.id, 'mobile', value)}
                        placeholder="Mobile Number"
                        type="tel"
                        maxLength={10}
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />}
                        required
                      />

                      <FloatingLabelInput
                        id={`to-email-${location.id}`}
                        value={location.email}
                        onChange={(value) => handleToLocationChange(location.id, 'email', value)}
                        placeholder="Email"
                        type="email"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/communication.png" alt="email" className="h-4 w-4" />}
                        error={errors[`toEmail-${location.id}`]}
                        required
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-3">
                  
                    
                    {/* Pincode */}
                    <FloatingLabelInput
                      id={`to-pincode-${location.id}`}
                      value={location.pincode}
                      onChange={(value) => handleToLocationChange(location.id, 'pincode', value)}
                      placeholder="Pincode"
                      type="text"
                      maxLength={6}
                      className="font-['Calibri']"
                      icon={isLoadingToPincode[location.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                         <img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />
                      )}
                      required
                    />

                    {/* State and City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id={`to-state-${location.id}`}
                        value={location.state}
                        onChange={(value) => handleToLocationChange(location.id, 'state', value)}
                        placeholder="State"
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        required
                      />

                      <FloatingLabelInput
                        id={`to-city-${location.id}`}
                        value={location.city}
                        onChange={(value) => handleToLocationChange(location.id, 'city', value)}
                        placeholder="City"
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        required
                      />
                    </div>

                    {/* Area Dropdown */}
                    <div className="space-y-2">
                      <select
                        value={location.area}
                        onChange={(e) => handleToLocationChange(location.id, 'area', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] border-gray-300`}
                        disabled={!toLocationAreas[location.id] || toLocationAreas[location.id].length === 0}
                      >
                        <option value="">
                          {!toLocationAreas[location.id] || toLocationAreas[location.id].length === 0 
                            ? 'Enter pincode first' 
                            : 'Select Area'
                          }
                        </option>
                        {toLocationAreas[location.id]?.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address and Building/Flat No in single line */}
                  <div className="space-y-2">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id={`to-address-${location.id}`}
                        value={location.address}
                        onChange={(value) => handleToLocationChange(location.id, 'address', value)}
                        placeholder="Locality / Street"
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/streets.png" alt="location" className="h-4 w-4" />}
                        required
                      />

                      <FloatingLabelInput
                        id={`to-flat-no-${location.id}`}
                        value={location.flatNo}
                        onChange={(value) => handleToLocationChange(location.id, 'flatNo', value)}
                        placeholder="Building / Flat No."
                        className="font-['Calibri']"
                         icon={<img src="/src/Icon-images/building.png" alt="location" className="h-4 w-4" />}
                        required
                      />
                    </div>
                  </div>

                  {/* Landmark and GST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id={`to-landmark-${location.id}`}
                      value={location.landmark}
                      onChange={(value) => handleToLocationChange(location.id, 'landmark', value)}
                      placeholder="Landmark (Optional)"
                      className="font-['Calibri']"
                       icon={<img src="/src/Icon-images/landmark.png" alt="location" className="h-4 w-4" />}
                    />

                    <FloatingLabelInput
                      id={`to-gst-${location.id}`}
                      value={location.gst}
                      onChange={(value) => handleToLocationChange(location.id, 'gst', value)}
                      onKeyDown={(e) => handleGSTKeyDown(e, location.gst)}
                      placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                      className="font-['Calibri']"
                      icon={<img src="/src/Icon-images/calculate.png" alt="gst" className="h-4 w-4" />}
                      error={errors[`toGst-${location.id}`]}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addToLocation}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add TO Location
            </Button>
            {errors.toLocations && (
              <p className="text-sm text-red-600">{errors.toLocations}</p>
            )}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Registration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ColoaderRegistration;