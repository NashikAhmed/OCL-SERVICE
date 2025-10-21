import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Trash2, 
  RefreshCw,
  Download,
  X,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Globe,
  Plus
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Coloader {
  _id: string;
  companyName: string;
  concernPerson: string;
  email: string;
  website?: string;
  mobileNumbers: string[];
  mobileNumberNames: string[];
  serviceModes: string[];
  companyAddress: {
    state: string;
    city: string;
    area: string;
    pincode: string;
    address: string;
    flatNo: string;
    landmark?: string;
    gst: string;
  };
  fromLocations: Array<{
    concernPerson: string;
    mobile: string;
    email: string;
    state: string;
    city: string;
    area: string;
    pincode: string;
    address: string;
    flatNo: string;
    landmark?: string;
    gst: string;
  }>;
  toLocations: Array<{
    concernPerson: string;
    mobile: string;
    email: string;
    state: string;
    city: string;
    area: string;
    pincode: string;
    address: string;
    flatNo: string;
    landmark?: string;
    gst: string;
  }>;
  isActive: boolean;
  registrationDate: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const ColoaderManagement = () => {
  const [coloaders, setColoaders] = useState<Coloader[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedColoader, setSelectedColoader] = useState<Coloader | null>(null);
  const [coloaderToDelete, setColoaderToDelete] = useState<Coloader | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [originFocused, setOriginFocused] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingColoader, setEditingColoader] = useState<Coloader | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Coloader>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<Array<{city: string}>>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Array<{city: string}>>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [fromLocationAreas, setFromLocationAreas] = useState<Record<string, string[]>>({});
  const [toLocationAreas, setToLocationAreas] = useState<Record<string, string[]>>({});
  const [isLoadingFromPincode, setIsLoadingFromPincode] = useState<Record<string, boolean>>({});
  const [isLoadingToPincode, setIsLoadingToPincode] = useState<Record<string, boolean>>({});
  const [isCompanyFormMinimized, setIsCompanyFormMinimized] = useState(true);
  const [showFromLocationsForm, setShowFromLocationsForm] = useState(false);
  const [isFromLocationsMinimized, setIsFromLocationsMinimized] = useState(true);
  const [isToLocationsMinimized, setIsToLocationsMinimized] = useState(true);
  const [toLocationMinimizedStates, setToLocationMinimizedStates] = useState<Record<number, boolean>>({});
  const [fromLocationMinimizedStates, setFromLocationMinimizedStates] = useState<Record<number, boolean>>({});

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
  const handleGSTInput = (value: string, setter: (value: string) => void) => {
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
  };

  // Helper function to convert service mode IDs to proper labels
  const getServiceModeLabels = (serviceModeIds: string[]) => {
    return serviceModeIds.map(id => {
      const option = serviceModeOptions.find(opt => opt.id === id);
      return option ? option.label : id;
    });
  };

  // Helper function to format address in the specified format
  const formatAddress = (location: any) => {
    const parts = [
      location.area,
      location.flatNo,
      location.landmark ? `Near ${location.landmark}` : '',
      location.city,
      location.state,
      location.pincode
    ].filter(part => part && part.trim() !== '');
    
    return `${parts.join(', ')} - (${location.state.toUpperCase()})`;
  };

  // Function to lookup pincode and auto-fill state, city, and areas
  const lookupPincode = async (pincode: string, preserveExistingData = false) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setEditFormData(prev => ({
          ...prev,
          companyAddress: {
            ...prev.companyAddress!,
            ...(preserveExistingData ? {} : { state: data.state || '', city: data.city || '' }),
            ...(preserveExistingData ? {} : { area: '' }) // Only reset area when pincode changes, not when preserving data
          }
        }));
        setAvailableAreas(data.areas || []);
      } else {
        // Clear fields if pincode not found
        if (!preserveExistingData) {
          setEditFormData(prev => ({
            ...prev,
            companyAddress: {
              ...prev.companyAddress!,
              state: '',
              city: '',
              area: ''
            }
          }));
        }
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

  // Function to lookup pincode for FROM locations
  const lookupFromLocationPincode = async (locationIndex: number, pincode: string, preserveExistingData = false) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingFromPincode(prev => ({ ...prev, [locationIndex]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setEditFormData(prev => ({
          ...prev,
          fromLocations: prev.fromLocations?.map((location, index) => {
            if (index === locationIndex) {
              if (preserveExistingData) {
                // Only update areas, preserve existing city/state/area data
                return { ...location };
              } else {
                // Update city/state/area (for new pincode entry)
                return { ...location, state: data.state || '', city: data.city || '', area: '' };
              }
            }
            return location;
          }) || []
        }));
        setFromLocationAreas(prev => ({ ...prev, [locationIndex]: data.areas || [] }));
      } else {
        // Clear fields if pincode not found
        if (!preserveExistingData) {
          setEditFormData(prev => ({
            ...prev,
            fromLocations: prev.fromLocations?.map((location, index) =>
              index === locationIndex 
                ? { ...location, state: '', city: '', area: '' }
                : location
            ) || []
          }));
        }
        setFromLocationAreas(prev => ({ ...prev, [locationIndex]: [] }));
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
      setIsLoadingFromPincode(prev => ({ ...prev, [locationIndex]: false }));
    }
  };

  // Function to lookup pincode for TO locations
  const lookupToLocationPincode = async (locationIndex: number, pincode: string, preserveExistingData = false) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setIsLoadingToPincode(prev => ({ ...prev, [locationIndex]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}/simple`);
      if (response.ok) {
        const data = await response.json();
        setEditFormData(prev => ({
          ...prev,
          toLocations: prev.toLocations?.map((location, index) => {
            if (index === locationIndex) {
              if (preserveExistingData) {
                // Only update areas, preserve existing city/state/area data
                return { ...location };
              } else {
                // Update city/state/area (for new pincode entry)
                return { ...location, state: data.state || '', city: data.city || '', area: '' };
              }
            }
            return location;
          }) || []
        }));
        setToLocationAreas(prev => ({ ...prev, [locationIndex]: data.areas || [] }));
      } else {
        // Clear fields if pincode not found
        if (!preserveExistingData) {
          setEditFormData(prev => ({
            ...prev,
            toLocations: prev.toLocations?.map((location, index) =>
              index === locationIndex 
                ? { ...location, state: '', city: '', area: '' }
                : location
            ) || []
          }));
        }
        setToLocationAreas(prev => ({ ...prev, [locationIndex]: [] }));
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
      setIsLoadingToPincode(prev => ({ ...prev, [locationIndex]: false }));
    }
  };

  // Function to fetch city suggestions
  const fetchCitySuggestions = async (query: string, type: 'origin' | 'destination') => {
    if (!query || query.length < 1) {
      if (type === 'origin') {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }

    try {
      const response = await fetch(`/api/pincode/cities/suggestions?q=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        if (type === 'origin') {
          setOriginSuggestions(data.cities || []);
          setShowOriginSuggestions(true);
        } else {
          setDestinationSuggestions(data.cities || []);
          setShowDestinationSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchColoaders();
    }, 300); // Debounce search by 300ms
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, originFilter, destinationFilter]);

  // Debounced city suggestions for origin
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCitySuggestions(originFilter, 'origin');
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [originFilter]);

  // Debounced city suggestions for destination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCitySuggestions(destinationFilter, 'destination');
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [destinationFilter]);

  const fetchColoaders = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');
      
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        setError('No authentication token found. Please login again.');
        window.location.href = '/admin';
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(originFilter && { origin: originFilter }),
        ...(destinationFilter && { destination: destinationFilter })
      });
      
      const response = await fetch(`/api/admin/coloaders?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setColoaders(data.data || []);
        setPagination(data.pagination);
        setError('');
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin';
        return;
      } else if (response.status === 403) {
        setError('You do not have permission to view coloader management. Please contact your administrator.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load coloaders');
      }
    } catch (error) {
      console.error('Error fetching coloaders:', error);
      setError('Network error while loading coloaders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (coloader: Coloader) => {
    setSelectedColoader(coloader);
    setIsViewModalOpen(true);
  };

  const toggleRowExpansion = (coloaderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(coloaderId)) {
      newExpandedRows.delete(coloaderId);
    } else {
      newExpandedRows.add(coloaderId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleEdit = (coloader: Coloader) => {
    setEditingColoader(coloader);
    
    // Filter out FROM locations that are identical to company address
    const filteredFromLocations = coloader.fromLocations.filter(location => {
      const isDifferentPerson = location.concernPerson !== coloader.concernPerson;
      const isDifferentMobile = location.mobile !== coloader.mobileNumbers[0];
      const isDifferentEmail = location.email !== coloader.email;
      const isDifferentAddress = location.address !== coloader.companyAddress.address;
      const isDifferentFlatNo = location.flatNo !== coloader.companyAddress.flatNo;
      const isDifferentLandmark = location.landmark !== coloader.companyAddress.landmark;
      const isDifferentGST = location.gst !== coloader.companyAddress.gst;
      const isDifferentPincode = location.pincode !== coloader.companyAddress.pincode;
      const isDifferentState = location.state !== coloader.companyAddress.state;
      const isDifferentCity = location.city !== coloader.companyAddress.city;
      const isDifferentArea = location.area !== coloader.companyAddress.area;
      
      return isDifferentPerson || isDifferentMobile || isDifferentEmail || 
             isDifferentAddress || isDifferentFlatNo || isDifferentLandmark || 
             isDifferentGST || isDifferentPincode || isDifferentState || 
             isDifferentCity || isDifferentArea;
    });
    
    setEditFormData({
      ...coloader,
      mobileNumbers: [...coloader.mobileNumbers],
      mobileNumberNames: [...(coloader.mobileNumberNames || [])],
      serviceModes: [...coloader.serviceModes],
      companyAddress: { ...coloader.companyAddress },
      fromLocations: filteredFromLocations.map(loc => ({ ...loc })),
      toLocations: coloader.toLocations.map(loc => ({ ...loc }))
    });
    
    // Initialize areas for company address (preserve existing city/state data)
    if (coloader.companyAddress.pincode) {
      lookupPincode(coloader.companyAddress.pincode, true);
    }
    
    // Initialize areas for from locations (preserve existing city/state data)
    filteredFromLocations.forEach((location, index) => {
      if (location.pincode) {
        lookupFromLocationPincode(index, location.pincode, true);
      }
    });
    
    // Initialize areas for to locations (preserve existing city/state data)
    coloader.toLocations.forEach((location, index) => {
      if (location.pincode) {
        lookupToLocationPincode(index, location.pincode, true);
      }
    });
    
    // Set from locations form visibility based on whether there are additional from locations
    // Use the filtered locations to determine if we should show the form
    const hasAdditionalFromLocations = filteredFromLocations.length > 0;
    setShowFromLocationsForm(hasAdditionalFromLocations);
    
    // Set all forms as minimized by default
    setIsCompanyFormMinimized(true);
    setIsFromLocationsMinimized(true);
    setIsToLocationsMinimized(true);
    
    // Initialize individual location minimized states
    const toLocationStates: Record<number, boolean> = {};
    const fromLocationStates: Record<number, boolean> = {};
    
    // Set all to locations as minimized
    coloader.toLocations.forEach((_, index) => {
      toLocationStates[index] = true;
    });
    
    // Set all from locations as minimized
    filteredFromLocations.forEach((_, index) => {
      fromLocationStates[index] = true;
    });
    
    setToLocationMinimizedStates(toLocationStates);
    setFromLocationMinimizedStates(fromLocationStates);
    
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingColoader || !editFormData) return;

    try {
      setIsSaving(true);
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Error",
          description: 'No authentication token found. Please login again.',
          variant: "destructive",
        });
        window.location.href = '/admin';
        return;
      }
      
      // Filter out FROM locations that are identical to company address
      const filteredFromLocations = editFormData.fromLocations?.filter(location => {
        const isDifferentPerson = location.concernPerson !== editFormData.concernPerson;
        const isDifferentMobile = location.mobile !== editFormData.mobileNumbers?.[0];
        const isDifferentEmail = location.email !== editFormData.email;
        const isDifferentAddress = location.address !== editFormData.companyAddress?.address;
        const isDifferentFlatNo = location.flatNo !== editFormData.companyAddress?.flatNo;
        const isDifferentLandmark = location.landmark !== editFormData.companyAddress?.landmark;
        const isDifferentGST = location.gst !== editFormData.companyAddress?.gst;
        const isDifferentPincode = location.pincode !== editFormData.companyAddress?.pincode;
        const isDifferentState = location.state !== editFormData.companyAddress?.state;
        const isDifferentCity = location.city !== editFormData.companyAddress?.city;
        const isDifferentArea = location.area !== editFormData.companyAddress?.area;
        
        return isDifferentPerson || isDifferentMobile || isDifferentEmail || 
               isDifferentAddress || isDifferentFlatNo || isDifferentLandmark || 
               isDifferentGST || isDifferentPincode || isDifferentState || 
               isDifferentCity || isDifferentArea;
      }) || [];

      // The final fromLocations should only contain additional locations
      // The company address is already stored separately and serves as the primary FROM location
      const finalFromLocations = filteredFromLocations;

      // Ensure mobileNumberNames array matches mobileNumbers array length
      const mobileNumbers = editFormData.mobileNumbers || [];
      const mobileNumberNames = editFormData.mobileNumberNames || [];
      
      // Pad mobileNumberNames array to match mobileNumbers length
      const paddedMobileNumberNames = mobileNumbers.map((_, index) => 
        mobileNumberNames[index] || ''
      );

      // Get available areas for company address - use first available area if none selected
      const companyArea = editFormData.companyAddress?.area || 
        (availableAreas.length > 0 ? availableAreas[0] : 'Main Area');

      const dataToSave = {
        ...editFormData,
        fromLocations: finalFromLocations.map((location, index) => ({
          ...location,
          area: location.area || (fromLocationAreas[index] && fromLocationAreas[index].length > 0 ? fromLocationAreas[index][0] : 'Main Area')
        })),
        mobileNumberNames: paddedMobileNumberNames,
        // Ensure all required fields have values
        companyAddress: {
          ...editFormData.companyAddress,
          area: companyArea
        },
        toLocations: editFormData.toLocations?.map((location, index) => ({
          ...location,
          area: location.area || (toLocationAreas[index] && toLocationAreas[index].length > 0 ? toLocationAreas[index][0] : 'Main Area')
        })) || []
      };

      console.log('Saving coloader data:', dataToSave);
      console.log('Coloader ID:', editingColoader._id);
      
      const response = await fetch(`/api/admin/coloaders/${editingColoader._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        toast({
          title: "Success",
          description: responseData.message || "Coloader updated successfully.",
        });
        
        setIsEditModalOpen(false);
        setEditingColoader(null);
        setEditFormData({});
        fetchColoaders(pagination?.currentPage || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin';
        return;
      } else if (response.status === 403) {
        toast({
          title: "Error",
          description: 'You do not have permission to edit coloaders. Please contact your administrator.',
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: responseData.error || 'Failed to update coloader',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating coloader:', error);
      toast({
        title: "Error",
        description: 'Network error while updating coloader',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingColoader(null);
    setEditFormData({});
    setIsCompanyFormMinimized(true);
    setIsFromLocationsMinimized(true);
    setIsToLocationsMinimized(true);
    setToLocationMinimizedStates({});
    setFromLocationMinimizedStates({});
  };

  const updateFormData = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleToLocationMinimized = (index: number) => {
    setToLocationMinimizedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleFromLocationMinimized = (index: number) => {
    setFromLocationMinimizedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleServiceModeChange = (modeId: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      serviceModes: checked 
        ? [...(prev.serviceModes || []), modeId]
        : (prev.serviceModes || []).filter(mode => mode !== modeId)
    }));
  };

  const updateCompanyAddress = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      companyAddress: {
        ...prev.companyAddress!,
        [field]: value
      }
    }));

    // If pincode is being changed, trigger lookup
    if (field === 'pincode') {
      if (value.length === 6) {
        lookupPincode(value);
      } else {
        // Clear other fields if pincode is incomplete
        setEditFormData(prev => ({
          ...prev,
          companyAddress: {
            ...prev.companyAddress!,
            state: '',
            city: '',
            area: ''
          }
        }));
        setAvailableAreas([]);
      }
    }
  };

  const addMobileNumber = () => {
    setEditFormData(prev => ({
      ...prev,
      mobileNumbers: [...(prev.mobileNumbers || []), ''],
      mobileNumberNames: [...(prev.mobileNumberNames || []), '']
    }));
  };

  const removeMobileNumber = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers?.filter((_, i) => i !== index) || [],
      mobileNumberNames: prev.mobileNumberNames?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMobileNumber = (index: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers?.map((num, i) => i === index ? value : num) || []
    }));
  };

  const updateMobileNumberName = (index: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      mobileNumberNames: prev.mobileNumberNames?.map((name, i) => i === index ? value : name) || []
    }));
  };

  const addFromLocation = () => {
    setEditFormData(prev => ({
      ...prev,
      fromLocations: [...(prev.fromLocations || []), { 
        concernPerson: '', 
        mobile: '', 
        email: '', 
        state: '', 
        city: '', 
        area: '', 
        pincode: '', 
        address: '', 
        flatNo: '', 
        landmark: '', 
        gst: '' 
      }]
    }));
    
    // Initialize the new location as minimized
    const newIndex = editFormData.fromLocations?.length || 0;
    setFromLocationMinimizedStates(prev => ({
      ...prev,
      [newIndex]: true
    }));
  };

  const removeFromLocation = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      fromLocations: prev.fromLocations?.filter((_, i) => i !== index) || []
    }));
    
    // Clean up the minimized state for the removed location
    setFromLocationMinimizedStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      // Reindex the remaining states
      const reindexedStates: Record<number, boolean> = {};
      Object.keys(newStates).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedStates[oldIndex - 1] = newStates[oldIndex];
        } else if (oldIndex < index) {
          reindexedStates[oldIndex] = newStates[oldIndex];
        }
      });
      return reindexedStates;
    });
  };

  const updateFromLocation = (index: number, field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      fromLocations: prev.fromLocations?.map((loc, i) => 
        i === index ? { ...loc, [field]: value } : loc
      ) || []
    }));

    // If pincode is being changed, trigger lookup
    if (field === 'pincode') {
      if (value.length === 6) {
        lookupFromLocationPincode(index, value);
      } else {
        // Clear other fields if pincode is incomplete
        setEditFormData(prev => ({
          ...prev,
          fromLocations: prev.fromLocations?.map((loc, i) => 
            i === index ? { ...loc, state: '', city: '', area: '' } : loc
          ) || []
        }));
        setFromLocationAreas(prev => ({ ...prev, [index]: [] }));
      }
    }
  };

  const addToLocation = () => {
    setEditFormData(prev => ({
      ...prev,
      toLocations: [...(prev.toLocations || []), { 
        concernPerson: '', 
        mobile: '', 
        email: '', 
        state: '', 
        city: '', 
        area: '', 
        pincode: '', 
        address: '', 
        flatNo: '', 
        landmark: '', 
        gst: '' 
      }]
    }));
    
    // Initialize the new location as minimized
    const newIndex = editFormData.toLocations?.length || 0;
    setToLocationMinimizedStates(prev => ({
      ...prev,
      [newIndex]: true
    }));
  };

  const removeToLocation = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      toLocations: prev.toLocations?.filter((_, i) => i !== index) || []
    }));
    
    // Clean up the minimized state for the removed location
    setToLocationMinimizedStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      // Reindex the remaining states
      const reindexedStates: Record<number, boolean> = {};
      Object.keys(newStates).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedStates[oldIndex - 1] = newStates[oldIndex];
        } else if (oldIndex < index) {
          reindexedStates[oldIndex] = newStates[oldIndex];
        }
      });
      return reindexedStates;
    });
  };

  const updateToLocation = (index: number, field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      toLocations: prev.toLocations?.map((loc, i) => 
        i === index ? { ...loc, [field]: value } : loc
      ) || []
    }));

    // If pincode is being changed, trigger lookup
    if (field === 'pincode') {
      if (value.length === 6) {
        lookupToLocationPincode(index, value);
      } else {
        // Clear other fields if pincode is incomplete
        setEditFormData(prev => ({
          ...prev,
          toLocations: prev.toLocations?.map((loc, i) => 
            i === index ? { ...loc, state: '', city: '', area: '' } : loc
          ) || []
        }));
        setToLocationAreas(prev => ({ ...prev, [index]: [] }));
      }
    }
  };


  const handleDelete = (coloader: Coloader) => {
    setColoaderToDelete(coloader);
    setIsDeleteDialogOpen(true);
  };


  const confirmDelete = async () => {
    if (!coloaderToDelete) return;

    try {
      setIsDeleting(true);
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Error",
          description: 'No authentication token found. Please login again.',
          variant: "destructive",
        });
        window.location.href = '/admin';
        return;
      }
      
      const response = await fetch(`/api/admin/coloaders/${coloaderToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Coloader deleted successfully.",
        });
        
        setIsDeleteDialogOpen(false);
        setColoaderToDelete(null);
        fetchColoaders(pagination?.currentPage || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin';
        return;
      } else if (response.status === 403) {
        toast({
          title: "Error",
          description: 'You do not have permission to manage coloaders. Please contact your administrator.',
          variant: "destructive",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Failed to delete coloader',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting coloader:', error);
      toast({
        title: "Error",
        description: 'Network error while deleting coloader',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setColoaderToDelete(null);
    }
  };

  const exportData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (originFilter) params.append('origin', originFilter);
      if (destinationFilter) params.append('destination', destinationFilter);
      
      const response = await fetch(`/api/admin/coloaders?${params}&limit=10000`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, 'coloaders_export.csv');
        
        toast({
          title: "Export Successful",
          description: `${data.data.length} coloaders exported to CSV.`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: Coloader[]) => {
    if (data.length === 0) return '';
    
    const headers = ['Company Name', 'Concern Person', 'Email', 'Mobile', 'Service Modes', 'Company State', 'Company City', 'Company Pincode'];
    const rows = data.map(item => [
      item.companyName,
      item.concernPerson,
      item.email,
      item.mobileNumbers.join(', '),
      getServiceModeLabels(item.serviceModes).join(', '),
      item.companyAddress.state,
      item.companyAddress.city,
      item.companyAddress.pincode
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: {city: string}, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginFilter(suggestion.city);
      setShowOriginSuggestions(false);
    } else {
      setDestinationFilter(suggestion.city);
      setShowDestinationSuggestions(false);
    }
  };

  // Handle input change with suggestions
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginFilter(e.target.value);
    if (e.target.value.length > 0) {
      setShowOriginSuggestions(true);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationFilter(e.target.value);
    if (e.target.value.length > 0) {
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibr',fontSize:'32px' }}>Coloader Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>{pagination && `${pagination.totalCount} total coloaders`}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={exportData} className="rounded-full px-4">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button variant="outline" size="sm" onClick={() => fetchColoaders(1)} className="rounded-full px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 relative max-w-[720px] w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <div className="relative">
                <Input
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pl-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                  style={{ 
                    borderColor: searchFocused || searchTerm ? '#3b82f6' : '#d1d5db',
                    boxShadow: 'none'
                  }}
                />
                <label 
                  className={`absolute left-12 transition-all duration-200 pointer-events-none bg-white px-1 ${
                    searchFocused || searchTerm 
                      ? '-top-2 text-sm text-blue-600 font-medium' 
                      : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                  }`}
                >
                  Search by Co. Name / Concern Person / Email ID
                </label>
              </div>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={originFilter}
                onChange={handleOriginChange}
                onFocus={() => {
                  setOriginFocused(true);
                  if (originFilter.length > 0) {
                    setShowOriginSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setOriginFocused(false);
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowOriginSuggestions(false), 200);
                }}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: originFocused || originFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  originFocused || originFilter 
                    ? '-top-2 text-sm text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by ORGN
              </label>
              
              {/* City Suggestions Dropdown */}
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionSelect(suggestion, 'origin')}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      <div className="font-medium text-gray-800">{suggestion.city}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={destinationFilter}
                onChange={handleDestinationChange}
                onFocus={() => {
                  setDestinationFocused(true);
                  if (destinationFilter.length > 0) {
                    setShowDestinationSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setDestinationFocused(false);
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowDestinationSuggestions(false), 200);
                }}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: destinationFocused || destinationFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  destinationFocused || destinationFilter 
                    ? '-top-2 text-sm text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by DSTN
              </label>
              
              {/* City Suggestions Dropdown */}
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionSelect(suggestion, 'destination')}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      <div className="font-medium text-gray-800">{suggestion.city}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ fontFamily: 'Calibr',backgroundColor:'#406AB9' }} className="">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Company Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Concern Person</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Email</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Mobile</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Service Modes</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Company Location</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Company PINCode</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading coloaders...
                      </td>
                    </tr>
                  ) : coloaders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">No coloaders found</td>
                    </tr>
                  ) : (
                    coloaders.map((coloader) => (
                      <React.Fragment key={coloader._id}>
                        <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyName}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.concernPerson}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.email}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                            {coloader.mobileNumbers[0] || 'No number'}
                          </td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{getServiceModeLabels(coloader.serviceModes).join(', ')}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyAddress.city}, {coloader.companyAddress.state}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyAddress.pincode}</td>
                          <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleRowExpansion(coloader._id)} 
                                className="h-8 w-8 p-0"
                                title={expandedRows.has(coloader._id) ? "Hide details" : "Show details"}
                              >
                                {expandedRows.has(coloader._id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(coloader)} 
                                className="h-8 w-8 p-0"
                                title="Edit coloader"
                              >
                                <Edit className="h-4 w-4" style={{color:'#1e66f5'}} />
                              </Button>
                              <Button 
                                style={{color:'#dc2626'}} 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(coloader)} 
                                className="h-8 w-8 p-0"
                                title="Delete coloader"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.has(coloader._id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-4 py-6">
                              <div className="space-y-2">
                                {/* Main Coloader Card */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                  {/* Card Header */}
                                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                      <Truck className="h-5 w-5 text-blue-600" />
                                      <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                        {coloader.companyName} ({coloader.companyAddress.city})
                                      </h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleEdit(coloader)} 
                                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                        title="Edit coloader"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => toggleRowExpansion(coloader._id)} 
                                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                                        title="Close details"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Card Content - Two Column Layout */}
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Left Column - Company Details & FROM Locations */}
                                      <div className="space-y-6">
                                        {/* Company Details Section */}
                                        <div className="space-y-2">
                                          <h4 className="text-md font-semibold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                            {/* Company Details */}
                                          </h4>
                                          
                                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                                              <div className="flex items-center space-x-3">
                                                <Truck className="h-5 w-5 text-gray-600" />
                                                <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                                  :: CoLoader ::
                                                </h3>
                                              </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-3 space-y-3">

                                              {/* Concern Person */}
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <span className="font-medium">Concern Person:</span> {coloader.concernPerson} - {coloader.mobileNumbers[0] || 'No number'}
                                      </span>
                                    </div>
                                    
                                    
                                    
                                    
                                              {/* Company Address - Primary FROM Location */}
                                              <div className="flex items-start space-x-2">
                                                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  {/* <div className="font-medium text-blue-600">FROM Location 1 (Company Address):</div> */}
                                                  <div className="mt-0">{formatAddress(coloader.companyAddress)}</div>
                                                  <div className="mt-1">
                                                    <span className="font-medium">GST:</span> {coloader.companyAddress.gst}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Service Modes */}
                                    <div className="flex items-center space-x-2">
                                      <Truck className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <span className="font-medium">Service Modes:</span> {getServiceModeLabels(coloader.serviceModes).join(', ')}
                                      </span>
                                    </div>
                                    
                                    {/* Contact Information */}
                                              <div className="space-y-2 text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-red-500" />
                                                  <span><span className="font-medium">Email:</span> {coloader.email}</span>
                                      </div>
                                      
                                      {/* Alternate Mobile Numbers */}
                                      {coloader.mobileNumbers.length > 1 && (
                                        <div className="space-y-1">
                                          <span className="font-medium text-gray-600">Alternate Numbers:</span>
                                          {coloader.mobileNumbers.slice(1).map((number, index) => (
                                            <div key={index} className="flex items-center space-x-2 ml-4">
                                              <Phone className="h-3 w-3 text-green-500" />
                                              <span>
                                                {coloader.mobileNumberNames && coloader.mobileNumberNames[index + 1] 
                                                  ? `${coloader.mobileNumberNames[index + 1]} - ${number}`
                                                  : number
                                                }
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                        {/* Additional FROM Locations Section - Only show if different from company info */}
                                {coloader.fromLocations.length > 0 && (() => {
                                  // Filter out locations that are identical to company information
                                  const uniqueFromLocations = coloader.fromLocations.filter(location => {
                                    // Check if location is different from company info
                                    const isDifferentPerson = location.concernPerson !== coloader.concernPerson;
                                    const isDifferentMobile = location.mobile !== coloader.mobileNumbers[0];
                                    const isDifferentEmail = location.email !== coloader.email;
                                    const isDifferentAddress = formatAddress(location) !== formatAddress(coloader.companyAddress);
                                    const isDifferentGST = location.gst !== coloader.companyAddress.gst;
                                    
                                    return isDifferentPerson || isDifferentMobile || isDifferentEmail || isDifferentAddress || isDifferentGST;
                                  });
                                  
                                  return uniqueFromLocations.length > 0 && (
                                    <div className="space-y-2">
                                      {/* <h4 className="text-md font-semibold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                        Additional FROM Locations
                                      </h4> */}
                                      <div className="space-y-2">
                                        {uniqueFromLocations.map((location, index) => (
                                          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-blue-50">
                                              <div className="flex items-center space-x-3">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                                  FROM Location {index + 2}
                                                </h3>
                                              </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-3 space-y-3">
                                              {/* 1. Name */}
                                              <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <span className="font-medium">Contact Person:</span> {location.concernPerson}
                                                </span>
                                              </div>

                                              {/* 2. Address */}
                                              <div className="flex items-start space-x-2">
                                                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <div>{formatAddress(location)}</div>
                                                  <div className="mt-1">
                                                    <span className="font-medium">GST:</span> {location.gst}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* 3. Mobile and Email in 2-column style */}
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                <div className="flex items-center space-x-2">
                                                  <Phone className="h-4 w-4 text-green-500" />
                                                  <span><span className="font-medium">Mobile:</span> {location.mobile}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Mail className="h-4 w-4 text-red-500" />
                                                  <span><span className="font-medium">Email:</span> {location.email}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                                      </div>

                                      {/* Right Column - TO Locations - Only show if different from company info */}
                                      <div className="space-y-2">
                                {coloader.toLocations.length > 0 && (() => {
                                  // Filter out locations that are identical to company information
                                  const uniqueToLocations = coloader.toLocations.filter(location => {
                                    // Check if location is different from company info
                                    const isDifferentPerson = location.concernPerson !== coloader.concernPerson;
                                    const isDifferentMobile = location.mobile !== coloader.mobileNumbers[0];
                                    const isDifferentEmail = location.email !== coloader.email;
                                    const isDifferentAddress = formatAddress(location) !== formatAddress(coloader.companyAddress);
                                    const isDifferentGST = location.gst !== coloader.companyAddress.gst;
                                    
                                    return isDifferentPerson || isDifferentMobile || isDifferentEmail || isDifferentAddress || isDifferentGST;
                                  });
                                  
                                  return uniqueToLocations.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-md font-semibold text-gray-800" style={{ fontFamily: 'Calibr' }}>
                                        {coloader.companyName} ({coloader.companyAddress.city})
                                      </h4>
                                      <div className="space-y-2">
                                        {uniqueToLocations.map((location, index) => (
                                          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-orange-50">
                                              <div className="flex items-center space-x-3">
                                                <MapPin className="h-5 w-5 text-orange-600" />
                                                <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                                  To Location {index + 1}
                                                </h3>
                                              </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-3 space-y-3">
                                              {/* 1. Name */}
                                              <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <span className="font-medium">Contact Person:</span> {location.concernPerson}
                                                </span>
                                              </div>

                                              {/* 2. Address */}
                                              <div className="flex items-start space-x-2">
                                                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                  <div>{formatAddress(location)}</div>
                                                  <div className="mt-1">
                                                    <span className="font-medium">GST:</span> {location.gst}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* 3. Mobile and Email in 2-column style */}
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                                                <div className="flex items-center space-x-2">
                                                  <Phone className="h-4 w-4 text-green-500" />
                                                  <span><span className="font-medium">Mobile:</span> {location.mobile}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Mail className="h-4 w-4 text-red-500" />
                                                  <span><span className="font-medium">Email:</span> {location.email}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {(() => {
                  const startItem = (pagination.currentPage - 1) * pagination.limit + 1;
                  const endItem = Math.min(pagination.currentPage * pagination.limit, pagination.totalCount);
                  return `${startItem} to ${endItem} of ${pagination.totalCount} coloaders`;
                })()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => fetchColoaders(pagination.currentPage - 1)} className="rounded-full px-4">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => fetchColoaders(pagination.currentPage + 1)} className="rounded-full px-4">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Coloader Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => {
        setIsViewModalOpen(open);
        if (!open) {
          setSelectedColoader(null);
        }
      }}>
        <DialogContent className="max-w-4xl rounded-2xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Calibri', fontSize: '26px' }}>
                  Coloader Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Calibri' }}>
                  View complete coloader registration information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedColoader && (
            <div className="px-8 pb-6 space-y-6">
              {/* Company Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Company Name</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Concern Person</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.concernPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Email</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Mobile Numbers</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.mobileNumbers.join(', ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Service Modes</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{getServiceModeLabels(selectedColoader.serviceModes).join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Company Address */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Company Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.companyAddress.state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.companyAddress.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Area</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.companyAddress.area}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Pincode</label>
                    <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{selectedColoader.companyAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* FROM Locations */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  FROM Locations ({selectedColoader.fromLocations.length})
                </h3>
                
                <div className="space-y-3">
                  {selectedColoader.fromLocations.map((location, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>PINCode</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TO Locations */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  To Locations ({selectedColoader.toLocations.length})
                </h3>
                
                <div className="space-y-3">
                  {selectedColoader.toLocations.map((location, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>PINCode</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl px-6 py-2 border-2 border-gray-300 hover:border-gray-400"
                style={{ fontFamily: 'Calibri' }}
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Edit Coloader Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancelEdit();
        }
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto rounded-2xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Calibri', fontSize: '24px' }}>
                  Edit Coloader
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Calibri' }}>
                  Update coloader information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {editFormData && (
            <div className="px-6 pb-4">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Company Information and Address */}
                <div className="space-y-4">
                  {/* Company Information Card */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {isCompanyFormMinimized ? (
                  // Compact Card View
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              style={{
                                backgroundColor: '#eef1f9',
                                color: '#4274c6',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                              }}
                              className="font-bold text-gray-800 font-['Calibr'] text-sm"
                            >
                              {editFormData.companyName}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsCompanyFormMinimized(false)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-600 text-sm font-['Calibri'] mb-1 font-bold">
                            {editFormData.serviceModes?.map(mode => 
                              serviceModeOptions.find(opt => opt.id === mode)?.label
                            ).join(', ')}
                          </p>
                          <div className="border-t border-gray-200 pt-1">
                            <div className="space-y-1">
                              {/* Concern Person */}
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-600 font-['Calibri']">
                                  {editFormData.concernPerson} - {editFormData.mobileNumbers?.[0] || 'No number'}
                                </span>
                              </div>
                              
                              {/* Complete Address Line */}
                              <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 text-red-500 mt-0.5" />
                                <span className="text-sm text-gray-600 font-['Calibri']">
                                  {(() => {
                                    const addressParts = [
                                      editFormData.companyAddress?.address,
                                      editFormData.companyAddress?.flatNo,
                                      editFormData.companyAddress?.landmark,
                                      editFormData.companyAddress?.area,
                                      editFormData.companyAddress?.city
                                    ].filter(Boolean);
                                    
                                    const pincode = editFormData.companyAddress?.pincode;
                                    const state = editFormData.companyAddress?.state;
                                    
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
                              
                              {/* Additional Phone Numbers (if any) */}
                              {editFormData.mobileNumbers && editFormData.mobileNumbers.length > 1 && (
                                <div className="space-y-1">
                                  {editFormData.mobileNumbers.slice(1).map((number, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-green-500" />
                                      <span className="text-sm text-gray-600 font-['Calibri']">
                                        {editFormData.mobileNumberNames && editFormData.mobileNumberNames[index + 1] 
                                          ? `${editFormData.mobileNumberNames[index + 1]} - +91 ${number}`
                                          : `+91 ${number}`
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Email, GST, Website on same line */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <Mail className="h-3 w-3 text-red-500" />
                                <span className="text-sm text-gray-600 font-['Calibri']">{editFormData.email || 'No email'}</span>
                                <span className="text-gray-400 mx-1">•</span>
                                <FileText className="h-3 w-3 text-blue-500" />
                                <span className="text-sm text-gray-600 font-['Calibri']">
                                  {editFormData.companyAddress?.gst || 'No GST'}
                                </span>
                                {editFormData.website && (
                                  <>
                                    <span className="text-gray-400 mx-1">•</span>
                                    <Globe className="h-3 w-3 text-purple-500" />
                                    <span className="text-sm text-gray-600 font-['Calibri']">{editFormData.website}</span>
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
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Full Form View
                  <>
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                      Coloader Information & Company Address
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCompanyFormMinimized(true)}
                        className="text-gray-500 hover:text-gray-700 h-6 px-2 text-sm"
                      >
                        Minimize
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (!showFromLocationsForm) {
                            // If form is not showing, show it and add a new location
                            setShowFromLocationsForm(true);
                            addFromLocation();
                          } else {
                            // If form is showing, hide it
                            setShowFromLocationsForm(false);
                          }
                        }} 
                        className="rounded-md text-sm h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {showFromLocationsForm ? 'Hide' : 'Add'} From
                      </Button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-2 space-y-2">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Company Name</label>
                      <Input
                        value={editFormData.companyName || ''}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Concern Person</label>
                      <Input
                        value={editFormData.concernPerson || ''}
                        onChange={(e) => updateFormData('concernPerson', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Email</label>
                      <Input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Website</label>
                      <Input
                        type="url"
                        value={editFormData.website || ''}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Service Modes</label>
                      <div className="grid grid-cols-4 gap-2">
                        {serviceModeOptions.map((mode) => (
                          <div key={mode.id} className="flex items-center space-x-1">
                            <Checkbox
                              id={`edit-${mode.id}`}
                              checked={(editFormData.serviceModes || []).includes(mode.id)}
                              onCheckedChange={(checked) => handleServiceModeChange(mode.id, checked as boolean)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`edit-${mode.id}`} className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                              {mode.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Numbers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-600" style={{ fontFamily: 'Calibri' }}>Mobile Numbers</label>
                      <Button type="button" variant="outline" size="sm" onClick={addMobileNumber} className="rounded-md text-sm h-7 px-2">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {editFormData.mobileNumbers?.map((mobile, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {index === 0 ? (
                          <Input
                            value={mobile}
                            onChange={(e) => updateMobileNumber(index, e.target.value)}
                              placeholder="Concern Person Mobile"
                            className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                            style={{ fontFamily: 'Calibri' }}
                          />
                          ) : (
                            <>
                              <Input
                                value={editFormData.mobileNumberNames?.[index] || ''}
                                onChange={(e) => updateMobileNumberName(index, e.target.value)}
                                placeholder="Name"
                                className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                style={{ fontFamily: 'Calibri' }}
                              />
                              <Input
                                value={mobile}
                                onChange={(e) => updateMobileNumber(index, e.target.value)}
                                placeholder="Mobile"
                                className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                style={{ fontFamily: 'Calibri' }}
                              />
                            </>
                          )}
                          {editFormData.mobileNumbers && editFormData.mobileNumbers.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMobileNumber(index)}
                              className="rounded-md text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
              </div>

                  {/* Company Address Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1" style={{ fontFamily: 'Calibri' }}>
                              Company Address (Primary FROM Location)
                    </h4>
                  {/* Address and Building/Flat No */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Address</label>
                      <Input
                        value={editFormData.companyAddress?.address || ''}
                        onChange={(e) => updateCompanyAddress('address', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="Locality / Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Building / Flat No</label>
                      <Input
                        value={editFormData.companyAddress?.flatNo || ''}
                        onChange={(e) => updateCompanyAddress('flatNo', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="Building / Flat No."
                      />
                    </div>
                  </div>

                  {/* Landmark and GST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Landmark (Optional)</label>
                      <Input
                        value={editFormData.companyAddress?.landmark || ''}
                        onChange={(e) => updateCompanyAddress('landmark', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="Landmark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>GST Number</label>
                      <Input
                        value={editFormData.companyAddress?.gst || ''}
                        onChange={(e) => handleGSTInput(e.target.value, (value) => updateCompanyAddress('gst', value))}
                        onKeyDown={(e) => handleGSTKeyDown(e, editFormData.companyAddress?.gst || '')}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>PINCode</label>
                      <Input
                        value={editFormData.companyAddress?.pincode || ''}
                        onChange={(e) => updateCompanyAddress('pincode', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      />
                    </div>

                  {/* State and City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                      <Input
                        value={editFormData.companyAddress?.state || ''}
                        onChange={(e) => updateCompanyAddress('state', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="State"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                      <Input
                        value={editFormData.companyAddress?.city || ''}
                        onChange={(e) => updateCompanyAddress('city', e.target.value)}
                        className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                        style={{ fontFamily: 'Calibri' }}
                        placeholder="City"
                      />
                </div>
              </div>

                  {/* Area Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Area</label>
                    <select
                      value={editFormData.companyAddress?.area || ''}
                      onChange={(e) => updateCompanyAddress('area', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] text-sm h-8"
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
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>

                  {/* Add From Location Button - Always visible */}
                  <div className="flex justify-start">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addFromLocation} 
                      style={{ color: "grey", backgroundColor: "white" }}
                      className="rounded-md text-sm h-7 px-2 shadow-[0_0_0_2px_rgba(0,0,0,0.07)] border-0 !bg-white !text-gray-500 !hover:bg-white !hover:text-gray-500 !focus:bg-white !focus:text-gray-500"
                      tabIndex={0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add From Location
                    </Button>
                  </div>

                  {/* Additional FROM Locations - Only show when explicitly requested and there are additional locations */}
              {showFromLocationsForm && (
                <div className="space-y-4">
                  {/* Close Button for Additional From Locations */}
                  
                  {/* Individual From Location Boxes */}
                  {editFormData.fromLocations?.map((location, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {fromLocationMinimizedStates[index] ? (
                        // Compact Card View
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3
                                    style={{
                                      backgroundColor: '#eef1f9',
                                      color: '#4274c6',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '0.375rem',
                                    }}
                                    className="font-bold text-gray-800 font-['Calibri'] text-sm"
                                  >
                                    FROM Location {index + 2}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFromLocationMinimized(index)}
                                    className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="border-t border-gray-200 pt-1">
                                  <div className="space-y-1">
                                    {/* Concern Person and Primary Number */}
                                    {location.concernPerson && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          {location.concernPerson} - {location.mobile}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Complete Address Line */}
                                    {location.address && (
                                      <div className="flex items-start gap-1">
                                        <MapPin className="h-3 w-3 text-blue-500 mt-0.5" />
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
                                    )}
                                    
                                    {/* Email */}
                                    {location.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3 text-red-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          {location.email}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* GST Information */}
                                    {location.gst && (
                                      <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3 text-blue-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          <span className="font-medium">GST:</span> {location.gst}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFromLocationMinimized(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromLocation(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Full Form View
                        <>
                          {/* Header */}
                          <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-blue-50">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                FROM Location {index + 2}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFromLocationMinimized(index)}
                                className="text-gray-500 hover:text-gray-700 h-6 px-2 text-sm"
                              >
                                Minimize
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromLocation(index)}
                                className="rounded-md text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                      
                          {/* Content */}
                          <div className="p-2 space-y-2">
                            {/* Contact Information */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Concern Person</label>
                                <Input
                                  value={location.concernPerson}
                                  onChange={(e) => updateFromLocation(index, 'concernPerson', e.target.value)}
                                  className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                  style={{ fontFamily: 'Calibri' }}
                                  placeholder="Concern Person"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Mobile Number</label>
                                  <Input
                                    value={location.mobile}
                                    onChange={(e) => updateFromLocation(index, 'mobile', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Mobile Number"
                                    maxLength={10}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Email</label>
                                  <Input
                                    value={location.email}
                                    onChange={(e) => updateFromLocation(index, 'email', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Email"
                                    type="email"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Address</label>
                                  <Input
                                    value={location.address}
                                    onChange={(e) => updateFromLocation(index, 'address', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Locality / Street"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Building / Flat No</label>
                                  <Input
                                    value={location.flatNo}
                                    onChange={(e) => updateFromLocation(index, 'flatNo', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Building / Flat No."
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Landmark (Optional)</label>
                                  <Input
                                    value={location.landmark || ''}
                                    onChange={(e) => updateFromLocation(index, 'landmark', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Landmark"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>GST Number</label>
                                  <Input
                                    value={location.gst}
                                    onChange={(e) => handleGSTInput(e.target.value, (value) => updateFromLocation(index, 'gst', value))}
                                    onKeyDown={(e) => handleGSTKeyDown(e, location.gst)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                                    maxLength={15}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Location Information */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>PINCode</label>
                                <Input
                                  value={location.pincode}
                                  onChange={(e) => updateFromLocation(index, 'pincode', e.target.value)}
                                  className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                  style={{ fontFamily: 'Calibri' }}
                                  placeholder="6-digit pincode"
                                  maxLength={6}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                                  <Input
                                    value={location.state}
                                    onChange={(e) => updateFromLocation(index, 'state', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="State"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                                  <Input
                                    value={location.city}
                                    onChange={(e) => updateFromLocation(index, 'city', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="City"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Area</label>
                                <select
                                  value={location.area}
                                  onChange={(e) => updateFromLocation(index, 'area', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] text-sm h-8"
                                  disabled={!fromLocationAreas[index] || fromLocationAreas[index].length === 0}
                                >
                                  <option value="">
                                    {!fromLocationAreas[index] || fromLocationAreas[index].length === 0 
                                      ? 'Enter pincode first' 
                                      : 'Select Area'
                                    }
                                  </option>
                                  {fromLocationAreas[index]?.map((area) => (
                                    <option key={area} value={area}>
                                      {area}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
                </div>

                {/* Right Column - TO Locations */}
                <div className="space-y-4">
                  {/* Individual To Location Boxes */}
                  {editFormData.toLocations?.map((location, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {toLocationMinimizedStates[index] ? (
                        // Compact Card View
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3
                                    style={{
                                      backgroundColor: '#fef3e2',
                                      color: '#ea580c',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '0.375rem',
                                    }}
                                    className="font-bold text-gray-800 font-['Calibri'] text-sm"
                                  >
                                    To Location {index + 1}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleToLocationMinimized(index)}
                                    className="h-5 w-5 p-0 text-gray-400 hover:text-orange-600"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="border-t border-gray-200 pt-1">
                                  <div className="space-y-1">
                                    {/* Concern Person and Primary Number */}
                                    {location.concernPerson && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          {location.concernPerson} - {location.mobile}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Complete Address Line */}
                                    {location.address && (
                                      <div className="flex items-start gap-1">
                                        <MapPin className="h-3 w-3 text-orange-500 mt-0.5" />
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
                                    )}
                                    
                                    {/* Email */}
                                    {location.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3 text-red-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          {location.email}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* GST Information */}
                                    {location.gst && (
                                      <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3 text-blue-500" />
                                        <span className="text-sm text-gray-600 font-['Calibri']">
                                          <span className="font-medium">GST:</span> {location.gst}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleToLocationMinimized(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-orange-600"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeToLocation(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Full Form View
                        <>
                          {/* Header */}
                          <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-orange-50">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-orange-600" />
                              <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
                                To Location {index + 1}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleToLocationMinimized(index)}
                                className="text-gray-500 hover:text-gray-700 h-6 px-2 text-sm"
                              >
                                Minimize
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeToLocation(index)}
                                className="rounded-md text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                      
                          {/* Content */}
                          <div className="p-2 space-y-2">
                            {/* Contact Information */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Concern Person</label>
                                <Input
                                  value={location.concernPerson}
                                  onChange={(e) => updateToLocation(index, 'concernPerson', e.target.value)}
                                  className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                  style={{ fontFamily: 'Calibri' }}
                                  placeholder="Concern Person"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Mobile Number</label>
                                  <Input
                                    value={location.mobile}
                                    onChange={(e) => updateToLocation(index, 'mobile', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Mobile Number"
                                    maxLength={10}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Email</label>
                                  <Input
                                    value={location.email}
                                    onChange={(e) => updateToLocation(index, 'email', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Email"
                                    type="email"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Address</label>
                                  <Input
                                    value={location.address}
                                    onChange={(e) => updateToLocation(index, 'address', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Locality / Street"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Building / Flat No</label>
                                  <Input
                                    value={location.flatNo}
                                    onChange={(e) => updateToLocation(index, 'flatNo', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Building / Flat No."
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Landmark (Optional)</label>
                                  <Input
                                    value={location.landmark || ''}
                                    onChange={(e) => updateToLocation(index, 'landmark', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Landmark"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>GST Number</label>
                                  <Input
                                    value={location.gst}
                                    onChange={(e) => handleGSTInput(e.target.value, (value) => updateToLocation(index, 'gst', value))}
                                    onKeyDown={(e) => handleGSTKeyDown(e, location.gst)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="Enter GSTIN (e.g., 22AAAAA0000A1Z5)"
                                    maxLength={15}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Location Information */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>PINCode</label>
                                <Input
                                  value={location.pincode}
                                  onChange={(e) => updateToLocation(index, 'pincode', e.target.value)}
                                  className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                  style={{ fontFamily: 'Calibri' }}
                                  placeholder="6-digit pincode"
                                  maxLength={6}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                                  <Input
                                    value={location.state}
                                    onChange={(e) => updateToLocation(index, 'state', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="State"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                                  <Input
                                    value={location.city}
                                    onChange={(e) => updateToLocation(index, 'city', e.target.value)}
                                    className="rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-sm h-8"
                                    style={{ fontFamily: 'Calibri' }}
                                    placeholder="City"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Area</label>
                                <select
                                  value={location.area}
                                  onChange={(e) => updateToLocation(index, 'area', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Calibri'] text-sm h-8"
                                  disabled={!toLocationAreas[index] || toLocationAreas[index].length === 0}
                                >
                                  <option value="">
                                    {!toLocationAreas[index] || toLocationAreas[index].length === 0 
                                      ? 'Enter pincode first' 
                                      : 'Select Area'
                                    }
                                  </option>
                                  {toLocationAreas[index]?.map((area) => (
                                    <option key={area} value={area}>
                                      {area}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Add To Location Button - Always visible at the bottom */}
                  <div className="flex justify-end">
                    <Button
                      style={{ color: "grey", backgroundColor: "white" }}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addToLocation}
                      className="rounded-md text-sm h-7 px-2 shadow-[0_0_0_2px_rgba(0,0,0,0.07)] border-0"
                      tabIndex={0}
                      // No hover effect: no hover:bg, no hover color, force background and color static
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add To Location
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl border-t border-gray-200">
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-lg px-4 py-1.5 border-2 border-gray-300 hover:border-gray-400 text-sm"
                style={{ fontFamily: 'Calibri' }}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="rounded-lg px-4 py-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                style={{ fontFamily: 'Calibri' }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="mr-1 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setColoaderToDelete(null);
        }
      }}>
        <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <AlertDialogHeader className="px-8 py-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-2xl border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Calibri', fontSize: '22px' }}>
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Calibri' }}>
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="px-8 py-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-gray-700" style={{ fontFamily: 'Calibri' }}>
                Are you sure you want to delete the coloader <span className="font-semibold text-red-600">"{coloaderToDelete?.companyName}"</span>?
              </p>
            </div>
          </div>
          
          <AlertDialogFooter className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-end space-x-4">
              <AlertDialogCancel 
                disabled={isDeleting}
                className="rounded-xl px-8 py-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                style={{ fontFamily: 'Calibri' }}
              >

                <X className="mr-2 h-4 w-4" />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl px-8 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ fontFamily: 'Calibri' }}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Coloader
                  </>
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ColoaderManagement;