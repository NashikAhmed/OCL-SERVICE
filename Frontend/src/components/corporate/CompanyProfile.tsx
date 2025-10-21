import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Upload,
  User,
  Hash,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface CorporateProfile {
  id: string;
  corporateId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  companyAddress: string;
  flatNumber?: string;
  landmark?: string;
  city: string;
  state: string;
  pin: string;
  locality: string;
  gstNumber?: string;
  logo?: string;
  registrationDate: string;
  lastLogin: string;
  isActive: boolean;
}

const CompanyProfile = () => {
  const [profile, setProfile] = useState<CorporateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editData, setEditData] = useState<Partial<CorporateProfile>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.corporate);
        setEditData(data.corporate);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(editData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    if (!editData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(editData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!editData.companyAddress?.trim()) {
      newErrors.companyAddress = 'Company address is required';
    }

    if (editData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(editData.gstNumber)) {
      newErrors.gstNumber = 'Please enter a valid GST number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contactNumber: editData.contactNumber,
          email: editData.email,
          companyAddress: editData.companyAddress,
          flatNumber: editData.flatNumber,
          landmark: editData.landmark
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.corporate);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Company profile updated successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, logo: data.logo } : null);
        toast({
          title: "Success",
          description: "Company logo uploaded successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading company profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-600" />
        <span className="ml-2 text-red-600">Failed to load company profile</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Company Profile
          </h1>
          <p className="text-gray-600 mt-1 text-sm">View and manage your company information</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={handleEdit} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm px-4 py-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Company Logo Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 py-4">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
            <Building2 className="h-4 w-4 text-blue-600" />
            Company Logo
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Upload or update your company logo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  alt="Company Logo"
                  className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                  </span>
                </div>
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Recommended: 200x200px, PNG or JPG format, max 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 py-4">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
            <FileText className="h-4 w-4 text-green-600" />
            Company Information
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Basic company details and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="companyName"
                value={profile.companyName}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>

            {/* Corporate ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="corporateId" className="text-sm font-medium text-gray-700">Corporate ID</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="corporateId"
                value={profile.corporateId}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                value={isEditing ? editData.email || '' : profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={`shadow-sm border-0 rounded-lg text-sm h-9 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.email 
                    ? 'bg-red-50 border-red-200 focus:ring-red-500/20' 
                    : isEditing 
                      ? 'bg-white hover:shadow-md' 
                      : 'bg-gray-50'
                }`}
              />
              {errors.email && <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">Contact Number</Label>
              <Input
                id="contactNumber"
                value={isEditing ? editData.contactNumber || '' : profile.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                disabled={!isEditing}
                className={`shadow-sm border-0 rounded-lg text-sm h-9 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.contactNumber 
                    ? 'bg-red-50 border-red-200 focus:ring-red-500/20' 
                    : isEditing 
                      ? 'bg-white hover:shadow-md' 
                      : 'bg-gray-50'
                }`}
              />
              {errors.contactNumber && <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.contactNumber}
              </p>}
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-sm font-medium text-gray-700">GST Number (Optional)</Label>
              <Input
                id="gstNumber"
                value={isEditing ? editData.gstNumber || '' : profile.gstNumber || ''}
                onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                disabled={!isEditing}
                placeholder="22ABCDE1234F1Z5"
                className={`shadow-sm border-0 rounded-lg text-sm h-9 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.gstNumber 
                    ? 'bg-red-50 border-red-200 focus:ring-red-500/20' 
                    : isEditing 
                      ? 'bg-white hover:shadow-md' 
                      : 'bg-gray-50'
                }`}
              />
              {errors.gstNumber && <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gstNumber}
              </p>}
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Account Status</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={profile.isActive ? "default" : "destructive"}
                  className={`text-xs ${
                    profile.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </Badge>
                {profile.isActive && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 py-4">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
            <MapPin className="h-4 w-4 text-purple-600" />
            Address Information
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Company address and location details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyAddress" className="text-sm font-medium text-gray-700">Company Address</Label>
              <Textarea
                id="companyAddress"
                value={isEditing ? editData.companyAddress || '' : profile.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`shadow-sm border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none ${
                  errors.companyAddress 
                    ? 'bg-red-50 border-red-200 focus:ring-red-500/20' 
                    : isEditing 
                      ? 'bg-white hover:shadow-md' 
                      : 'bg-gray-50'
                }`}
              />
              {errors.companyAddress && <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.companyAddress}
              </p>}
            </div>

            {/* Flat Number */}
            <div className="space-y-2">
              <Label htmlFor="flatNumber" className="text-sm font-medium text-gray-700">Flat/Building Number</Label>
              <Input
                id="flatNumber"
                value={isEditing ? editData.flatNumber || '' : profile.flatNumber || ''}
                onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="Optional"
                className={`shadow-sm border-0 rounded-lg text-sm h-9 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  isEditing 
                    ? 'bg-white hover:shadow-md' 
                    : 'bg-gray-50'
                }`}
              />
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark" className="text-sm font-medium text-gray-700">Landmark</Label>
              <Input
                id="landmark"
                value={isEditing ? editData.landmark || '' : profile.landmark || ''}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                disabled={!isEditing}
                placeholder="Optional"
                className={`shadow-sm border-0 rounded-lg text-sm h-9 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  isEditing 
                    ? 'bg-white hover:shadow-md' 
                    : 'bg-gray-50'
                }`}
              />
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="locality" className="text-sm font-medium text-gray-700">Locality/Area</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="locality"
                value={profile.locality}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="city"
                value={profile.city}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="state"
                value={profile.state}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>

            {/* Pin Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700">Pin Code</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read Only</span>
              </div>
              <Input
                id="pin"
                value={profile.pin}
                disabled
                className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 py-4">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
            <Calendar className="h-4 w-4 text-orange-600" />
            Account Information
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Account registration and activity details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formatDate(profile.registrationDate)}
                  disabled
                  className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
                />
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Last Login</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formatDate(profile.lastLogin)}
                  disabled
                  className="bg-gray-50 shadow-sm border-0 rounded-lg text-sm h-9"
                />
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex items-center gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 rounded-lg text-sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-2 rounded-lg text-sm bg-white"
          >
            <X className="h-4 w-4" />
            <span className="font-medium">Cancel</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
