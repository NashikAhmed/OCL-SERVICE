import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  Image,
  ChevronsUpDown,
  Save,
  User,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Floating Label Input Component (copied from coloader registration)
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
  disabled?: boolean;
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
  onKeyDown,
  disabled = false
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

interface CorporateFormData {
  concernName: string;
  companyName: string;
  companyAddress: {
    pincode: string;
    city: string;
    state: string;
    area: string;
    locality: string;
    flatNo: string;
    landmark: string;
  };
  gstNo: string;
  birthday: string;
  anniversary: string;
  contactNo: string;
  email: string;
  alternatePhones: string[];
  addressType: string[];
  logoFile: File | null;
  gstCertificateFile: File | null;
  otp: string;
  captcha: string;
}

const CorporateRegistration = () => {
  const [formData, setFormData] = useState<CorporateFormData>({
    concernName: '',
    companyName: '',
    companyAddress: {
      pincode: '',
      city: '',
      state: '',
      area: '',
      locality: '',
      flatNo: '',
      landmark: ''
    },
    gstNo: '',
    birthday: '',
    anniversary: '',
    contactNo: '',
    email: '',
    alternatePhones: [],
    addressType: [],
    logoFile: null,
    gstCertificateFile: null,
    otp: '',
    captcha: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isValidGST, setIsValidGST] = useState(true);
  const [generatedCustomerId, setGeneratedCustomerId] = useState<string>('');
  const [generatedUsername, setGeneratedUsername] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [gstPreview, setGstPreview] = useState<string>('');
  const [approvedPricingList, setApprovedPricingList] = useState([]);
  const [selectedPricingId, setSelectedPricingId] = useState('');
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);

  const { toast } = useToast();

  // Fetch approved pricing lists on component mount
  useEffect(() => {
    fetchApprovedPricing();
  }, []);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Hide OTP success message after 5 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showOtpSuccess) {
      timeout = setTimeout(() => {
        setShowOtpSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [showOtpSuccess]);

  // Fetch approved pricing lists (excluding already assigned ones)
  const fetchApprovedPricing = async () => {
    try {
      setLoadingPricing(true);
      const response = await fetch('/api/admin/corporate-pricing?status=approved&excludeAssigned=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setApprovedPricingList(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch pricing lists');
      }
    } catch (error) {
      console.error('Fetch pricing error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approved pricing lists",
        variant: "destructive"
      });
    } finally {
      setLoadingPricing(false);
    }
  };

  const addressTypeOptions = [
    { value: 'corporate', label: 'Corporate' },
    { value: 'govt', label: 'Govt' },
    { value: 'firm', label: 'Firm' },
    { value: 'others', label: 'Others' }
  ];

  // GST Input Handler with character blocking (copied from coloader registration)
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

  // GST Validation Helper Function
  const validateGST = (gst: string): { isValid: boolean; error?: string } => {
    if (!gst.trim()) {
      return { isValid: false, error: 'GST Number is required' };
    }

    const cleanGST = gst.trim().toUpperCase();
    
    if (cleanGST.length !== 15) {
      return { 
        isValid: false, 
        error: 'GST Number must be exactly 15 characters' 
      };
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstRegex.test(cleanGST)) {
      return { 
        isValid: false, 
        error: 'Please enter a valid 15-character GSTIN (e.g., 22AAAAA0000A1Z5)' 
      };
    }

    return { isValid: true };
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

  // Handle pincode change with number-only restriction
  const handlePincodeChange = (pincode: string) => {
    // Only allow digits and limit to 6 characters
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    
    setFormData(prev => ({
      ...prev,
      companyAddress: {
        ...prev.companyAddress,
        pincode: numericPincode
      }
    }));
    
    if (numericPincode.length === 6) {
      lookupPincode(numericPincode);
    }
  };

  // Handle phone number change with number-only restriction (for alternate phones)
  const handlePhoneChange = (phone: string) => {
    // Only allow digits and limit to 10 characters
    const numericPhone = phone.replace(/\D/g, '').slice(0, 10);
    
    setFormData(prev => ({
      ...prev,
      contactNo: numericPhone
    }));
  };

  // Handle send OTP
  const handleSendOtp = () => {
    const phoneNumber = formData.contactNo?.replace(/\D/g, '') || '';
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }
    
    setOtpSent(true);
    setShowOtpSection(true);
    setOtpTimer(60); // 60 seconds timer
    setOtpVerified(false);
    setFormData(prev => ({ ...prev, otp: '' })); // Clear previous OTP
    setShowOtpSuccess(true); // Show success message
    toast({
      title: "OTP Sent",
      description: "OTP has been sent to your phone number. Use 1234 for testing.",
    });
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) {
      toast({
        title: "Please Wait",
        description: `Please wait ${otpTimer} seconds before resending OTP`,
        variant: "destructive"
      });
      return;
    }
    
    setOtpTimer(60);
    setOtpVerified(false);
    setFormData(prev => ({ ...prev, otp: '' }));
    setShowOtpSuccess(true); // Show success message
    toast({
      title: "OTP Resent",
      description: "New OTP has been sent to your phone number.",
    });
  };

  // Handle OTP verification
  const handleVerifyOtp = (otpToVerify?: string) => {
    const otp = otpToVerify || formData.otp;
    if (otp === '1234') {
      setOtpVerified(true);
      setShowOtpSection(false); // Close the popup
      setShowOtpSuccess(true); // Show success message
      toast({
        title: "OTP Verified",
        description: "Phone number verified successfully!",
      });
    } else {
      // Clear all OTP inputs and focus on first input
      setFormData(prev => ({ ...prev, otp: '' }));
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  // Handle alternate phone change
  const handleAlternatePhoneChange = (index: number, value: string) => {
    const numericPhone = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      alternatePhones: prev.alternatePhones.map((phone, i) => 
        i === index ? numericPhone : phone
      )
    }));
  };

  // Add alternate phone
  const addAlternatePhone = () => {
    setFormData(prev => ({
      ...prev,
      alternatePhones: [...prev.alternatePhones, '']
    }));
  };

  // Remove alternate phone
  const removeAlternatePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternatePhones: prev.alternatePhones.filter((_, i) => i !== index)
    }));
  };

  // Handle GST validation with character blocking
  const handleGSTChange = (gst: string) => {
    handleGSTInput(gst, (value) => {
      setFormData(prev => ({
        ...prev,
        gstNo: value
      }));
    }, (isValid) => {
      setIsValidGST(isValid);
      
      if (!isValid && gst.length > 0) {
        setErrors(prev => ({
          ...prev,
          gstNo: 'Please enter a valid GSTIN format'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.gstNo;
          return newErrors;
        });
      }
    });
  };

  // Handle file uploads
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGstCertificateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, gstCertificateFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setGstPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate customer ID
  const generateCustomerId = (companyName: string): string => {
    if (!companyName.trim()) return '';
    
    const firstWord = companyName.trim().split(' ')[0].toUpperCase();
    const serialNumber = Math.floor(Math.random() * 9999) + 1;
    return `${firstWord}${serialNumber.toString().padStart(4, '0')}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate pricing selection
      if (!selectedPricingId) {
        toast({
          title: "Validation Error",
          description: "Please select a pricing plan",
          variant: "destructive"
        });
        return;
      }

      // Prepare data for API call
      const registrationData = {
        companyName: formData.companyName.trim(),
        companyAddress: `${formData.companyAddress.flatNo}, ${formData.companyAddress.area}, ${formData.companyAddress.locality}`.trim(),
        pin: formData.companyAddress.pincode.trim(),
        city: formData.companyAddress.city.trim(),
        state: formData.companyAddress.state.trim(),
        locality: formData.companyAddress.locality.trim(),
        flatNumber: formData.companyAddress.flatNo?.trim() || '',
        landmark: formData.companyAddress.landmark?.trim() || '',
        gstNumber: formData.gstNo?.trim() || '',
        birthday: formData.birthday || null,
        anniversary: formData.anniversary || null,
        contactNumber: formData.contactNo.trim(),
        email: formData.email.trim(),
        addressType: formData.addressType.length > 0 ? formData.addressType[0] : 'corporate'
        // Password will be auto-generated by the backend
      };

      console.log('Submitting corporate registration data:', registrationData);

      // Call the actual API
      const response = await fetch('/api/corporate/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register corporate customer');
      }

      if (result.success) {
        const customerId = result.corporateId;
        const username = result.data.username;
        const emailSent = result.data.emailSent;
        const emailResult = result.data.emailResult;
        
        setGeneratedCustomerId(customerId);
        setGeneratedUsername(username);
        setEmailSent(emailSent);
        
        // Connect pricing to corporate client
        if (selectedPricingId) {
          try {
            console.log('🔗 Attempting to connect pricing:', selectedPricingId, 'to corporate client:', customerId);
            
            const pricingResponse = await fetch(`/api/admin/corporate-pricing/${selectedPricingId}/connect`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
              },
              body: JSON.stringify({ corporateClientId: customerId })
            });

            const pricingResult = await pricingResponse.json();
            console.log('🔗 Pricing connection response:', pricingResult);

            if (!pricingResponse.ok) {
              console.error('❌ Failed to connect pricing to corporate client:', pricingResult);
              toast({
                title: "Warning",
                description: `Corporate registered but pricing connection failed: ${pricingResult.error || 'Unknown error'}`,
                variant: "destructive"
              });
            } else {
              console.log('✅ Pricing connected successfully:', pricingResult.message);
              toast({
                title: "Success",
                description: `Corporate registered and pricing plan connected successfully!`,
              });
            }
          } catch (error) {
            console.error('❌ Error connecting pricing:', error);
            toast({
              title: "Warning",
              description: `Corporate registered but pricing connection failed: ${error.message}`,
              variant: "destructive"
            });
          }
        }
        
        setShowSuccess(true);
        
        // Show appropriate success message based on email status
        if (emailSent && emailResult?.success) {
          toast({
            title: "Registration Successful",
            description: `Corporate customer registered with ID: ${customerId}. Welcome email with login credentials sent to ${formData.email}`,
          });
        } else if (emailSent === false || !emailResult?.success) {
          toast({
            title: "Registration Successful",
            description: `Corporate customer registered with ID: ${customerId}. Username: ${username}. Email notification failed - please contact support.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration Successful",
            description: `Corporate customer registered with ID: ${customerId}. Username: ${username}`,
          });
        }
      } else {
        throw new Error(result.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register corporate customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      concernName: '',
      companyName: '',
      companyAddress: {
        pincode: '',
        city: '',
        state: '',
        area: '',
        locality: '',
        flatNo: '',
        landmark: ''
      },
      gstNo: '',
      birthday: '',
      anniversary: '',
      contactNo: '',
      email: '',
      alternatePhones: [],
      addressType: [],
      logoFile: null,
      gstCertificateFile: null,
      otp: '',
      captcha: ''
    });
    setErrors({});
    setAvailableAreas([]);
    setLogoPreview('');
    setGstPreview('');
    setShowSuccess(false);
    setGeneratedCustomerId('');
    setGeneratedUsername('');
    setEmailSent(false);
    setSelectedPricingId('');
    setShowOtpSection(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpTimer(0);
    setShowOtpSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Corporate Registration</h2>
            <p className="text-gray-600">Registration completed successfully</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-6">Your corporate customer has been registered successfully.</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Corporate Customer ID</h4>
                <Badge variant="outline" className="text-2xl font-bold text-green-700 bg-green-100">
                  {generatedCustomerId}
                </Badge>
                <p className="text-sm text-green-600 mt-2">Please save this ID for future reference</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Login Credentials</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Username:</span>
                    <Badge variant="outline" className="text-sm font-mono text-blue-700 bg-blue-100">
                      {generatedUsername}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-600">Password has been sent via email</p>
                </div>
              </div>

              <div className={`border rounded-lg p-6 mb-6 ${emailSent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <h4 className={`text-lg font-semibold mb-2 ${emailSent ? 'text-green-800' : 'text-yellow-800'}`}>
                  Email Notification Status
                </h4>
                <div className="flex items-center gap-2">
                  {emailSent ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700">Welcome email with login credentials sent successfully</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-700">Email notification failed - please contact support</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleReset} variant="outline">
                  Register Another
                </Button>
                <Button onClick={() => setShowSuccess(false)}>
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate form completion progress
  const calculateProgress = () => {
    const totalFields = 13; // Total required fields
    let completedFields = 0;
    
    if (formData.concernName) completedFields++;
    if (formData.companyName) completedFields++;
    if (formData.companyAddress.pincode) completedFields++;
    if (formData.companyAddress.locality) completedFields++;
    if (formData.companyAddress.flatNo) completedFields++;
    if (formData.gstNo) completedFields++;
    if (formData.contactNo) completedFields++;
    if (formData.email) completedFields++;
    if (formData.addressType.length > 0) completedFields++;
    if (formData.otp) completedFields++;
    if (formData.captcha) completedFields++;
    if (logoPreview) completedFields++;
    if (gstPreview) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  // Show OTP verification first if phone is not verified
  if (!otpVerified) {
    return (
      <div className="space-y-8 px-[10vw] min-h-screen bg-white py-8">
        <div className='corporate-registration-box-main'>
          {/* Phone Verification Section */}
          <Card className="shadow-lg border border-gray-200 bg-white rounded-lg">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <span className="font-['Calibr'] text-xl text-white">Phone Verification Required</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-6">Please verify your phone number to continue with corporate registration</p>
                  
                  {/* Phone Input Container */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* Country Code */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg h-12">
                      <img style={{width: '20px', height: '20px'}} src="/src/Icon-images/flag.png" alt="" />
                        <span className="text-sm font-semibold text-gray-700">+91</span>
                      </div>

                      {/* 10 Digit Blocks */}
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                          <div key={index} className="relative group">
                            <input
                              type="text"
                              maxLength={1}
                              value={formData.contactNo[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 1) {
                                  const currentPhone = formData.contactNo || '';
                                  const phoneArray = currentPhone.split('');
                                  
                                  // Ensure we have 10 positions
                                  while (phoneArray.length < 10) {
                                    phoneArray.push('');
                                  }
                                  
                                  phoneArray[index] = value;
                                  const updatedPhone = phoneArray.join('').slice(0, 10);
                                  
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    contactNo: updatedPhone
                                  }));
                                  
                                  // Auto-focus next input
                                  if (value && index < 9) {
                                    const nextInput = document.getElementById(`phone-${index + 1}`);
                                    nextInput?.focus();
                                  }

                                  // Auto-send OTP when 10 digits are entered
                                  if (updatedPhone.length === 10 && /^\d{10}$/.test(updatedPhone)) {
                                    // If OTP was already sent but user is editing, reopen popup
                                    if (otpSent && !otpVerified) {
                                      setTimeout(() => {
                                        setShowOtpSection(true);
                                      }, 800);
                                      setFormData(prev => ({ ...prev, otp: '' }));
                                      toast({
                                        title: "OTP Popup Reopened",
                                        description: "Please enter the OTP to verify your phone number.",
                                      });
                                    } else if (!otpSent) {
                                      // First time - send OTP with delay
                                      setOtpSent(true);
                                      setOtpTimer(60);
                                      setOtpVerified(false);
                                      setFormData(prev => ({ ...prev, otp: '' }));
                                      setShowOtpSuccess(true);
                                      
                                      // Add delay before opening popup
                                      setTimeout(() => {
                                        setShowOtpSection(true);
                                      }, 1200);
                                      
                                      toast({
                                        title: "OTP Sent",
                                        description: "OTP has been sent to your phone number. Use 1234 for testing.",
                                      });
                                    }
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !formData.contactNo[index] && index > 0) {
                                  const prevInput = document.getElementById(`phone-${index - 1}`);
                                  prevInput?.focus();
                                }
                              }}
                              id={`phone-${index}`}
                              disabled={otpVerified}
                              className={`w-10 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                                formData.contactNo[index] 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                                  : 'border-gray-300 bg-white text-gray-500 hover:border-blue-300 hover:bg-blue-25'
                              } ${
                                otpVerified 
                                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                  : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-blue-50'
                              }`}
                              placeholder=""
                              />
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Status */}
                    {otpVerified && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status messages */}
                <div className="space-y-3">

                  {/* Preparing OTP message */}
                  {formData.contactNo.length === 10 && !otpSent && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="font-medium">Preparing OTP verification...</span>
                    </div>
                  )}

                  {/* OTP success message */}
                  {showOtpSuccess && otpVerified && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">OTP verified successfully!</span>
                    </div>
                  )}

                  {/* Error message */}
                  {errors.contactNo && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{errors.contactNo}</span>
                    </div>
                  )}
                </div>

                {/* Info message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Verification Required</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Please verify your phone number to continue with corporate registration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OTP Popup Modal */}
        {showOtpSection && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 flex items-center justify-center z-50 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-200/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Enter OTP</h3>
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-blue-200/50 shadow-lg animate-in slide-in-from-top-2 fade-in duration-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-gray-600 font-medium">An OTP had been sent : </p>
                    <p className="text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-lg shadow-sm">
                      {formData.contactNo && formData.contactNo.length >= 4
                        ? "XXXXXX" + formData.contactNo.slice(-4)
                        : "XXXXXX"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOtpSection(false)}
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
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative group">
                    <input
                      type="text"
                      maxLength={1}
                      value={formData.otp[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 1) {
                          const newOtp = formData.otp.split('');
                          newOtp[index] = value;
                          const updatedOtp = newOtp.join('').slice(0, 4);
                          setFormData(prev => ({ 
                            ...prev, 
                            otp: updatedOtp
                          }));
                          
                          // Auto-focus next input
                          if (value && index < 3) {
                            const nextInput = document.getElementById(`otp-${index + 1}`);
                            nextInput?.focus();
                          }

                          // Auto-verify when 4 digits are entered
                          if (updatedOtp.length === 4) {
                            setTimeout(() => {
                              handleVerifyOtp(updatedOtp);
                            }, 100); // Small delay to ensure state is updated
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      id={`otp-${index}`}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400"
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 border border-gray-200/50 shadow-md">
                  <span className="text-xs text-gray-500 font-medium">Didn't receive ?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpTimer > 0}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-all duration-300 ${
                      otpTimer > 0 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                        : 'text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-100 hover:bg-blue-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Resend OTP
                  </button>
                  {otpTimer > 0 && (
                    <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-600 font-medium">
                        {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 px-[10vw] min-h-screen bg-white py-8">
      <div className='corporate-registration-box-main'>
        {/* Corporate Registration Form */}
        <Card className="shadow-lg border border-gray-200 bg-white rounded-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-700 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <span className="font-['Calibr'] text-xl text-white">Corporate Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <div className="space-y-8">
              {/* Company Information Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Company Information</h3>
                </div>
                
                <div className="space-y-4">
                  {/* 1. Concern Name */}
                  <FloatingLabelInput
                        id="concernName"
                        value={formData.concernName}
                        onChange={(value) => setFormData(prev => ({ ...prev, concernName: value }))}
                        placeholder="Concern Name"
                        icon={<img src="/src/Icon-images/user.png" alt="user" className="h-4 w-4" />}
                        error={errors.concernName}
                        required
                      />

                  {/* 2. Company Name */}
                  <FloatingLabelInput
                        id="companyName"
                        value={formData.companyName}
                        onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                        placeholder="Company Name"
                        icon={<img src="/src/Icon-images/Building.png" alt="building" className="h-4 w-4" />}
                        error={errors.companyName}
                        required
                      />
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Address Details</h3>
                </div>
                
                <div className="space-y-4">

                  {/* Locality and Building/Flat No in single line */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="companyLocality"
                        value={formData.companyAddress.locality}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, locality: value }
                        }))}
                        placeholder="Locality / Street"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/streets.png" alt="streets" className="h-4 w-4" />}
                        error={errors.companyLocality}
                        required
                      />

                      <FloatingLabelInput
                        id="companyFlatNo"
                        value={formData.companyAddress.flatNo}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, flatNo: value }
                        }))}
                        placeholder="Building / Flat No."
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/Building.png" alt="building" className="h-4 w-4" />}
                        error={errors.companyFlatNo}
                        required
                      />
                  </div>

                  {/* Landmark and GST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="companyLandmark"
                        value={formData.companyAddress.landmark}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, landmark: value }
                        }))}
                        placeholder="Landmark (Optional)"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/landmark.png" alt="landmark" className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        id="companyGst"
                        value={formData.gstNo}
                        onChange={(value) => handleGSTChange(value)}
                        placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/calculate.png" alt="calculate" className="h-4 w-4" />}
                        error={errors.companyGst}
                        required
                      />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Location Details</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Pincode */}
                    <FloatingLabelInput
                      id="companyPincode"
                      value={formData.companyAddress.pincode}
                      onChange={(value) => handlePincodeChange(value)}
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
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, state: value }
                        }))}
                        placeholder="State"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        error={errors.companyState}
                        required
                      />

                      <FloatingLabelInput
                        id="companyCity"
                        value={formData.companyAddress.city}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, city: value }
                        }))}
                        placeholder="City"
                        className="font-['Calibri']"
                        icon={<img src="/src/Icon-images/location.png" alt="location" className="h-4 w-4" />}
                        error={errors.companyCity}
                        required
                      />
                  </div>

                  {/* Area Dropdown */}
                  <div className="space-y-2">
                      <select
                        value={formData.companyAddress.area}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          companyAddress: { ...prev.companyAddress, area: e.target.value }
                        }))}
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
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Phone className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Contact Information</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Email Address */}
                  <FloatingLabelInput
                    id="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    placeholder="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    error={errors.email}
                    required
                  />

                  {/* Contact Number - 10 Block Design */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />
                      <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                      <span className="text-red-500">*</span>
                    </div>
                    
                    {/* Phone Input Container */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {/* Country Code */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg h-12">
                        <img style={{width: '20px', height: '20px'}} src="/src/Icon-images/flag.png" alt="" />
                          <span className="text-sm font-semibold text-gray-700">+91</span>
                        </div>

                        {/* 10 Digit Blocks */}
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                            <div key={index} className="relative group">
                              <input
                                type="text"
                                maxLength={1}
                                value={formData.contactNo[index] || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  if (value.length <= 1) {
                                    const currentPhone = formData.contactNo || '';
                                    const phoneArray = currentPhone.split('');
                                    
                                    // Ensure we have 10 positions
                                    while (phoneArray.length < 10) {
                                      phoneArray.push('');
                                    }
                                    
                                    phoneArray[index] = value;
                                    const updatedPhone = phoneArray.join('').slice(0, 10);
                                    
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      contactNo: updatedPhone
                                    }));
                                    
                                    // Auto-focus next input
                                    if (value && index < 9) {
                                      const nextInput = document.getElementById(`phone-${index + 1}`);
                                      nextInput?.focus();
                                    }

                                    // Auto-send OTP when 10 digits are entered
                                    if (updatedPhone.length === 10 && /^\d{10}$/.test(updatedPhone)) {
                                      // If OTP was already sent but user is editing, reopen popup
                                      if (otpSent && !otpVerified) {
                                        setTimeout(() => {
                                          setShowOtpSection(true);
                                        }, 800);
                                        setFormData(prev => ({ ...prev, otp: '' }));
                                        toast({
                                          title: "OTP Popup Reopened",
                                          description: "Please enter the OTP to verify your phone number.",
                                        });
                                      } else if (!otpSent) {
                                        // First time - send OTP with delay
                                        setOtpSent(true);
                                        setOtpTimer(60);
                                        setOtpVerified(false);
                                        setFormData(prev => ({ ...prev, otp: '' }));
                                        setShowOtpSuccess(true);
                                        
                                        // Add delay before opening popup
                                        setTimeout(() => {
                                          setShowOtpSection(true);
                                        }, 1200);
                                        
                                        toast({
                                          title: "OTP Sent",
                                          description: "OTP has been sent to your phone number. Use 1234 for testing.",
                                        });
                                      }
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !formData.contactNo[index] && index > 0) {
                                    const prevInput = document.getElementById(`phone-${index - 1}`);
                                    prevInput?.focus();
                                  }
                                }}
                                id={`phone-${index}`}
                                disabled={otpVerified}
                                className={`w-10 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                                  formData.contactNo[index] 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                                    : 'border-gray-300 bg-white text-gray-500 hover:border-blue-300 hover:bg-blue-25'
                                } ${
                                  otpVerified 
                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                    : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-blue-50'
                                }`}
                                placeholder=""
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Verified Status */}
                      {otpVerified && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Verified</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status messages */}
                    <div className="space-y-2">

                      {/* Preparing OTP message */}
                      {formData.contactNo.length === 10 && !otpSent && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          <span className="text-sm font-medium">Preparing OTP verification...</span>
                        </div>
                      )}

                      {/* OTP success message */}
                      {showOtpSuccess && otpVerified && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">OTP verified successfully!</span>
                        </div>
                      )}

                      {/* Error message */}
                      {errors.contactNo && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-md border border-red-200">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium">{errors.contactNo}</span>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Alternate Phone Numbers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">Alternate Phone Numbers</h4>
                      <Button
                        type="button"
                        onClick={addAlternatePhone}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        + Add Phone
                      </Button>
                    </div>
                    
                    {formData.alternatePhones.map((phone, phoneIndex) => (
                      <div key={phoneIndex} className="space-y-2">
                        <FloatingLabelInput
                          id={`alt-phone-${phoneIndex}`}
                          value={phone}
                          onChange={(value) => handleAlternatePhoneChange(phoneIndex, value)}
                          placeholder={`Alternate Phone ${phoneIndex + 1}`}
                          type="tel"
                          maxLength={10}
                          icon={<img src="/src/Icon-images/mobile.png" alt="phone" className="h-4 w-4" />}
                        />
                        
                        <div className="flex">
                          <Button
                            type="button"
                            onClick={() => removeAlternatePhone(phoneIndex)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Birthday and Anniversary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthday" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <img src="/src/Icon-images/birthday.png" alt="birthday" className="h-4 w-4" />
                        Birthday
                      </Label>
                      <input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Calibri']"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anniversary" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <img src="/src/Icon-images/anniversary.png" alt="anniversary" className="h-4 w-4" />
                        Anniversary
                      </Label>
                      <input
                        id="anniversary"
                        type="date"
                        value={formData.anniversary}
                        onChange={(e) => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Calibri']"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Type Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Building className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Address Type</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {addressTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={option.value}
                          name="addressType"
                          value={option.value}
                          checked={formData.addressType.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                addressType: [option.value]
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <Label style={{fontWeight:900}} htmlFor={option.value} className="text-sm text-gray-700 font-['Calibri'] cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.addressType && (
                    <p className="text-sm text-red-600">{errors.addressType}</p>
                  )}
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Upload className="h-4 w-4 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Document Uploads</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="logo" className="text-sm font-semibold text-gray-700">Company Logo</Label>
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                          <input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label htmlFor="logo" className="cursor-pointer">
                            {logoPreview ? (
                              <div className="space-y-2">
                                <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain mx-auto" />
                                <p className="text-sm text-gray-600">Click to change logo</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Image className="w-8 h-8 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">Click to upload logo</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gstCertificate" className="text-sm font-semibold text-gray-700">GST Certificate</Label>
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
                          <input
                            id="gstCertificate"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleGstCertificateUpload}
                            className="hidden"
                          />
                          <label htmlFor="gstCertificate" className="cursor-pointer">
                            {gstPreview ? (
                              <div className="space-y-2">
                                <img src={gstPreview} alt="GST certificate preview" className="w-20 h-20 object-contain mx-auto" />
                                <p className="text-sm text-gray-600">Click to change certificate</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="w-8 h-8 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">Click to upload GST certificate</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                  </div>
                </div>
              </div>


              {/* Pricing Selection Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Calibr']">Pricing Selection</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricingSelect" className="text-sm font-medium text-gray-700">
                      Select Approved Pricing Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={selectedPricingId} 
                      onValueChange={setSelectedPricingId}
                      disabled={loadingPricing}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingPricing ? "Loading pricing plans..." : "Choose a pricing plan"} />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedPricingList.map((pricing: any) => (
                          <SelectItem key={pricing._id} value={pricing._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{pricing.name}</span>
                              <span className="text-xs text-gray-500">
                                Created: {new Date(pricing.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {approvedPricingList.length === 0 && !loadingPricing && (
                      <p className="text-sm text-amber-600">
                        No approved pricing plans available. Please create and approve pricing plans first.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Captcha Section */}
              

              {/* Submit Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Register Corporate Customer
                          </>
                        )}
                      </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OTP Popup Modal */}
      {showOtpSection && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-200/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Enter OTP</h3>
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-blue-200/50 shadow-lg animate-in slide-in-from-top-2 fade-in duration-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-600 font-medium">An OTP had been sent : </p>
                  <p className="text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-lg shadow-sm">
                    {formData.contactNo && formData.contactNo.length >= 4
                      ? "XXXXXX" + formData.contactNo.slice(-4)
                      : "XXXXXX"}
                  </p>
              </div>
                <button
                  type="button"
                  onClick={() => setShowOtpSection(false)}
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
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative group">
                  <input
                    type="text"
                    maxLength={1}
                    value={formData.otp[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 1) {
                        const newOtp = formData.otp.split('');
                        newOtp[index] = value;
                        const updatedOtp = newOtp.join('').slice(0, 4);
                        setFormData(prev => ({ 
                          ...prev, 
                          otp: updatedOtp
                        }));
                        
                        // Auto-focus next input
                        if (value && index < 3) {
                          const nextInput = document.getElementById(`otp-${index + 1}`);
                          nextInput?.focus();
                        }

                        // Auto-verify when 4 digits are entered
                        if (updatedOtp.length === 4) {
                          setTimeout(() => {
                            handleVerifyOtp(updatedOtp);
                          }, 100); // Small delay to ensure state is updated
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    id={`otp-${index}`}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400"
                    placeholder=""
                  />
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 border border-gray-200/50 shadow-md">
                <span className="text-xs text-gray-500 font-medium">Didn't receive ?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-all duration-300 ${
                    otpTimer > 0 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                      : 'text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-100 hover:bg-blue-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  Resend OTP
                </button>
                {otpTimer > 0 && (
                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-orange-600 font-medium">
                      {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    };

export default CorporateRegistration;
