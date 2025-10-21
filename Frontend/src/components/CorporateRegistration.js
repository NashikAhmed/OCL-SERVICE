import React, { useState, useCallback } from "react";
import axios from "axios";
import { Phone, CheckCircle, ArrowRight, Building2, MapPin, Calendar, User, Lock, FileText, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import LogoUpload from "./LogoUpload";

const CorporateRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    pin: "",
    city: "",
    state: "",
    locality: "",
    flatNumber: "",
    landmark: "",
    gstNumber: "",
    birthday: "",
    anniversary: "",
    contactNumber: "",
    addressType: "corporate", // corporate, branch, firm, other
    password: "",
    confirmPassword: ""
  });

  const [pincodeData, setPincodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [responseTime, setResponseTime] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // Clear success message after 5 seconds
  React.useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear submit success message when user starts editing
    if (submitSuccess) {
      setSubmitSuccess(false);
      setGeneratedId("");
    }
  };

  const handleLogoSelect = (file) => {
    setLogoFile(file);
    
    // Clear submit success message when user uploads logo
    if (submitSuccess) {
      setSubmitSuccess(false);
      setGeneratedId("");
    }
  };

  const handlePincodeChange = useCallback(async (e) => {
    const pin = e.target.value;
    
    // Update pincode and reset dependent fields
    setFormData(prev => ({ 
      ...prev, 
      pin: pin, 
      state: "", 
      city: "", 
      locality: "" 
    }));
    setPincodeData(null);
    setError("");
    setResponseTime(null);

    // Validate pincode format first
    if (pin.length > 0 && !/^\d+$/.test(pin)) {
      setError("Pincode should contain only numbers");
      return;
    }
    
    if (pin.length > 6) {
      setError("Pincode should be exactly 6 digits");
      return;
    }

    // Only proceed if pincode is exactly 6 digits
    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      setLoading(true);
      const startTime = performance.now();
      
      try {
        const res = await axios.get(`http://localhost:5000/api/pincode/${pin}`, {
          timeout: 10000
        });
        
        const endTime = performance.now();
        const clientTime = Math.round(endTime - startTime);
        
        const { state, cities, totalAreas, responseTime: serverTime, cached } = res.data;
        
        setPincodeData({ state, cities });
        
        // Auto-populate state and get the first available city and district
        const firstCity = Object.keys(cities)[0];
        const firstDistrict = Object.keys(cities[firstCity].districts)[0];
        
        setFormData(prev => ({ 
          ...prev, 
          state,
          city: firstCity,
          locality: firstDistrict
        }));
        
        setResponseTime({
          client: clientTime,
          server: serverTime,
          cached: cached,
          totalAreas: totalAreas
        });
        
      } catch (err) {
        console.error('Pincode lookup error:', err);
        
        const endTime = performance.now();
        const clientTime = Math.round(endTime - startTime);
        
        if (err.response?.status === 404) {
          setError("Pincode not found. Please check and try again.");
        } else if (err.response?.status === 400) {
          setError("Invalid pincode format. Please enter a 6-digit pincode.");
        } else if (err.code === 'ECONNABORTED') {
          setError("Request timeout. The pincode lookup is taking too long.");
        } else if (err.code === 'ECONNREFUSED') {
          setError("Cannot connect to server. Please check if the server is running.");
        } else {
          setError("Error fetching pincode data. Please try again.");
        }
        
        setPincodeData(null);
        setFormData(prev => ({ ...prev, state: "", city: "", locality: "" }));
        setResponseTime({ client: clientTime, error: true });
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const validateForm = () => {
    // Basic validation
    if (!formData.companyName.trim()) {
      setError("Please enter company name");
      return false;
    }
    
    if (!formData.companyAddress.trim()) {
      setError("Please enter company address");
      return false;
    }

    if (!formData.pin) {
      setError("Please enter a pincode");
      return false;
    }
    
    if (!pincodeData) {
      setError("Please wait for pincode validation to complete");
      return false;
    }
    
    if (!formData.city.trim()) {
      setError("Invalid pincode - no city data found");
      return false;
    }
    
    if (!formData.locality.trim()) {
      setError("Please select locality/area");
      return false;
    }

    if (!formData.contactNumber.trim()) {
      setError("Please enter contact number");
      return false;
    }

    if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit contact number");
      return false;
    }

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      setError("Please enter a valid GST number (15 characters)");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Please enter a password");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError("");
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add logo file if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      
      const response = await axios.post('http://localhost:5000/api/corporate/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000
      });
      
      console.log('Corporate registration successful:', response.data);
      setSubmitSuccess(true);
      setGeneratedId(response.data.corporateId);
      
      // Reset form after successful submission
      setFormData({
        companyName: "",
        companyAddress: "",
        pin: "",
        city: "",
        state: "",
        locality: "",
        flatNumber: "",
        landmark: "",
        gstNumber: "",
        birthday: "",
        anniversary: "",
        contactNumber: "",
        addressType: "corporate",
        password: "",
        confirmPassword: ""
      });
      setPincodeData(null);
      setResponseTime(null);
      setLogoFile(null);
      
    } catch (err) {
      console.error('Corporate registration error:', err);
      if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to server. Please check if the server is running.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Registration timeout. Please try again.");
      } else if (err.response?.status === 409) {
        setError(err.response.data.error || "A company with this information already exists.");
      } else {
        setError(err.response?.data?.error || "Failed to register company. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const getPerformanceColor = () => {
    if (!responseTime || responseTime.error) return 'text-gray-500';
    if (responseTime.cached) return 'text-green-600';
    if (responseTime.client < 500) return 'text-green-600';
    if (responseTime.client < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailableAreas = () => {
    if (!pincodeData || !formData.city || !formData.locality) return [];
    return pincodeData.cities[formData.city]?.districts[formData.locality]?.areas || [];
  };

  // Calculate form completion progress
  const calculateProgress = () => {
    const fields = [
      formData.companyName,
      formData.companyAddress,
      formData.pin,
      formData.city,
      formData.locality,
      formData.contactNumber,
      formData.password,
      formData.confirmPassword
    ];
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    // Logo is optional, so we don't include it in progress calculation
    return Math.round((completedFields / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Modern Header with Progress */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
            Corporate Registration
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our network of trusted corporate partners and unlock premium logistics solutions
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Registration Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        {/* Success Message with Modern Design */}
        {submitSuccess && generatedId && (
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 animate-slide-up">
            <CardContent className="p-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h3>
                <p className="text-green-700 mb-6">Your corporate registration has been completed successfully.</p>
                <Card className="bg-white border-2 border-green-300 shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-sm text-green-600 mb-2 font-medium">Your Corporate Customer ID</p>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border border-green-200">
                      <p className="text-3xl font-bold text-green-800 font-mono tracking-wider">{generatedId}</p>
                    </div>
                    <p className="text-xs text-green-600 mt-3">Please save this ID for future reference and account access</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Registration Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Building2 className="w-6 h-6" />
              Company Information
            </CardTitle>
            <CardDescription className="text-white/90">
              Provide your company details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Registration Error:</strong> {error}
                  </div>
            </div>
          )}

              {/* Company Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
                </div>

                {/* Company Logo Upload */}
                <LogoUpload 
                  onLogoSelect={handleLogoSelect}
                  disabled={submitLoading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
              type="text"
              name="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleChange}
                      className="h-12"
              required
            />
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      GST Number
                    </Label>
                    <Input
                      id="gstNumber"
                      type="text"
                      name="gstNumber"
                      placeholder="Enter GST number (optional)"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      maxLength="15"
                      className="h-12"
                    />
                  </div>
          </div>

          {/* Company Address */}
                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Company Address *
                  </Label>
                  <Textarea
                    id="companyAddress"
              name="companyAddress"
                    placeholder="Enter your complete company address"
              value={formData.companyAddress}
              onChange={handleChange}
              rows="3"
                    className="resize-none"
              required
            />
          </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Location Details</h3>
                </div>

                {/* Pincode with Modern Loading */}
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pin Code *
                  </Label>
          <div className="relative">
                    <Input
                      id="pin"
              type="text"
              name="pin"
              placeholder="Enter 6-digit pincode"
              value={formData.pin}
              onChange={handlePincodeChange}
              maxLength="6"
                      className="h-12 pr-12"
              required
            />
            {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>

          {responseTime && !responseTime.error && (
                    <div className={`text-xs flex justify-between items-center ${getPerformanceColor()}`}>
                      <Badge variant="outline" className="text-xs">
                  {responseTime.cached ? 'Cached' : 'Searched'}: {responseTime.client}ms
                      </Badge>
                      <span className="text-muted-foreground">Areas: {responseTime.totalAreas}</span>
            </div>
          )}
                </div>

          {pincodeData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* State */}
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                      <Input
                        id="state"
                  type="text"
                  name="state"
                  value={formData.state}
                  disabled
                        className="h-12 bg-muted"
                  required
                />
              </div>

              {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input
                        id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  disabled
                        className="h-12 bg-muted"
                  required
                />
              </div>

              {/* Locality/Area/District */}
                    <div className="space-y-2">
                      <Label htmlFor="locality" className="text-sm font-medium">Locality/Area *</Label>
                      <Input
                        id="locality"
                  type="text"
                  name="locality"
                  value={formData.locality}
                  disabled
                        className="h-12 bg-muted"
                  required
                />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="flatNumber" className="text-sm font-medium">Flat No./Building Name</Label>
                  <Input
                    id="flatNumber"
              type="text"
              name="flatNumber"
              placeholder="Enter flat number or building name"
              value={formData.flatNumber}
              onChange={handleChange}
                    className="h-12"
            />
          </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark" className="text-sm font-medium">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
              type="text"
              name="landmark"
              placeholder="Enter landmark"
              value={formData.landmark}
              onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Contact & Personal Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Contact & Personal Information</h3>
                </div>

                {/* Ultra-Modern Phone Verification with Premium Design */}
                <div className="space-y-8">
                  {/* Enhanced Header Section with Advanced Animations */}
                  <div className="text-center relative">
                    <div className="relative inline-block">
                      {/* Multi-layer animated background rings */}
                      <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full animate-pulse"></div>
                      <div className="absolute inset-1 w-22 h-22 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-3 w-18 h-18 bg-gradient-to-r from-indigo-300/30 to-pink-300/30 rounded-full animate-bounce"></div>
                      
                      {/* Main icon container with enhanced styling */}
                      <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                        <Phone className="w-12 h-12 text-white drop-shadow-lg relative z-10" />
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                        Phone Verification Required
                      </h3>
                      <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Please verify your phone number to continue with corporate registration
                      </p>
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>End-to-end encrypted</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span>Instant verification</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ultra-Premium Phone Input Container */}
                  <div className="relative">
                    {/* Enhanced background decoration */}
                    <div className="absolute -inset-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl blur-2xl opacity-70"></div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-indigo-100/30 rounded-3xl blur-xl opacity-50"></div>
                    
                    {/* Main container with glass morphism */}
                    <div className="relative bg-white/90 backdrop-blur-md border border-gray-200/60 rounded-3xl p-10 shadow-2xl">
                      {/* Enhanced top accent line */}
                      <div className="absolute top-0 left-10 right-10 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full shadow-lg"></div>
                      
                      <div className="space-y-10">
                        {/* Enhanced phone number input section */}
                        <div className="space-y-6">
                          <div className="text-center">
                            <label className="text-lg font-bold text-gray-800 mb-2 block">
                              Phone No. *
                            </label>
                            <p className="text-sm text-gray-500">Enter your 10-digit mobile number</p>
                          </div>
                          
                          {/* Enhanced country code + phone input */}
                          <div className="flex justify-center">
                            <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-6 border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-8 focus-within:ring-blue-100/50 transition-all duration-500 shadow-lg hover:shadow-xl">
                              {/* Enhanced country code */}
                              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-md">
                                <div className="w-7 h-5 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-sm shadow-sm"></div>
                                <span className="text-base font-bold text-gray-800">+91</span>
                              </div>

                              {/* Enhanced phone number digits */}
                              <div className="flex gap-3">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                                  <div key={index} className="relative group">
                                    <input
                                      type="text"
                                      maxLength="1"
                                      value={formData.contactNumber[index] || ''}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 1) {
                                          const newContact = [...formData.contactNumber];
                                          newContact[index] = value;
                                          setFormData(prev => ({ ...prev, contactNumber: newContact.join('') }));
                                          
                                          // Auto-focus next input
                                          if (value && index < 9) {
                                            const nextInput = document.getElementById(`phone-${index + 1}`);
                                            nextInput?.focus();
                                          }
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !formData.contactNumber[index] && index > 0) {
                                          const prevInput = document.getElementById(`phone-${index - 1}`);
                                          prevInput?.focus();
                                        }
                                      }}
                                      id={`phone-${index}`}
                                      className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 group-hover:border-blue-400"
                                      placeholder=""
                                    />
                                    {/* Enhanced active indicator */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-all duration-300 animate-pulse"></div>
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced progress indicator */}
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="w-full max-w-md bg-gray-200 rounded-full h-3 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                                style={{ width: `${(formData.contactNumber.length / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Enhanced status message */}
                          <div className="text-center">
                            {formData.contactNumber.length === 10 ? (
                              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-3xl border-2 border-green-200 shadow-xl animate-pulse">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg">Phone number verified!</span>
                              </div>
                            ) : formData.contactNumber.length > 0 ? (
                              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-3xl border-2 border-blue-200 shadow-lg">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Phone className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-lg">
                                  {formData.contactNumber.length}/10 digits entered
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-3xl border-2 border-gray-200 shadow-lg">
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Phone className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-lg">Enter your 10-digit mobile number</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced verification benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-bold text-blue-700">Secure</p>
                            <p className="text-xs text-blue-600 mt-1">Bank-level encryption</p>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-bold text-purple-700">Verified</p>
                            <p className="text-xs text-purple-600 mt-1">Instant validation</p>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <ArrowRight className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-bold text-indigo-700">Quick</p>
                            <p className="text-xs text-indigo-600 mt-1">Fast processing</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
          </div>

          {/* Birthday and Anniversary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Birthday
                    </Label>
                    <Input
                      id="birthday"
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                      className="h-12"
              />
            </div>
                  <div className="space-y-2">
                    <Label htmlFor="anniversary" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Anniversary
                    </Label>
                    <Input
                      id="anniversary"
                type="date"
                name="anniversary"
                value={formData.anniversary}
                onChange={handleChange}
                      className="h-12"
              />
                  </div>
            </div>
          </div>

              {/* Account Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Account Security</h3>
          </div>

          {/* Address Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Type of Address *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['corporate', 'branch', 'firm', 'other'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 transition-colors duration-200">
                  <input
                    type="radio"
                    name="addressType"
                    value={type}
                    checked={formData.addressType === type}
                    onChange={handleChange}
                          className="text-primary focus:ring-primary"
                  />
                        <span className="capitalize text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password *
                    </Label>
                    <Input
                      id="password"
              type="password"
              name="password"
              placeholder="Enter password (minimum 6 characters)"
              value={formData.password}
              onChange={handleChange}
                      className="h-12"
              required
            />
          </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
                      className="h-12"
              required
            />
                  </div>
                </div>
          </div>

          {/* Submit Button */}
              <div className="pt-6">
                <Button 
            type="submit" 
            disabled={submitLoading || loading || !formData.city}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {submitLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Registering Company...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Complete Registration</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
        </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorporateRegistration;