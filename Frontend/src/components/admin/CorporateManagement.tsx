import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  RefreshCw,
  FileText,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Error Boundary Component
class CorporateManagementErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CorporateManagement Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-red-50">
              <Building2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Corporate Management</h1>
              <p className="text-red-500">Component Error</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Component Error</h3>
              <p className="text-red-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CorporateData {
  _id: string;
  corporateId: string;
  companyName: string;
  companyAddress: string;
  pin: string;
  city: string;
  state: string;
  locality: string;
  flatNumber?: string;
  landmark?: string;
  gstNumber?: string;
  birthday?: string;
  anniversary?: string;
  contactNumber: string;
  email: string;
  addressType: string;
  username: string;
  generatedPassword?: string;
  emailSent: boolean;
  emailSentAt?: string;
  isActive: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CorporateResponse {
  success: boolean;
  data: CorporateData[];
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const CorporateManagement = () => {
  console.log('CorporateManagement component rendering...');
  const [corporateData, setCorporateData] = useState<CorporateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterAddressType, setFilterAddressType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  // View and Edit states
  const [selectedCorporate, setSelectedCorporate] = useState<CorporateData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CorporateData>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pricing view states
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [assignedPricing, setAssignedPricing] = useState<any>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  
  // Delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();

  // Fetch assigned pricing for a corporate client
  const fetchAssignedPricing = async (corporateId: string) => {
    try {
      setLoadingPricing(true);
      const response = await fetch(`/api/admin/corporate/${corporateId}/pricing`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setAssignedPricing(result.data.assignedPricing);
        setShowPricingDialog(true);
      } else {
        throw new Error(result.error || 'Failed to fetch assigned pricing');
      }
    } catch (error) {
      console.error('Fetch assigned pricing error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assigned pricing plan",
        variant: "destructive"
      });
    } finally {
      setLoadingPricing(false);
    }
  };

  // Handle delete corporate
  const handleDelete = (corporate: CorporateData) => {
    setSelectedCorporate(corporate);
    setShowDeleteDialog(true);
  };

  // Confirm delete corporate
  const confirmDelete = async () => {
    if (!selectedCorporate) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/corporate/${selectedCorporate.corporateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Corporate client deleted successfully!",
        });
        setShowDeleteDialog(false);
        fetchCorporateData(currentPage);
      } else {
        throw new Error(result.error || 'Failed to delete corporate client');
      }
    } catch (error) {
      console.error('Delete corporate error:', error);
      toast({
        title: "Error",
        description: "Failed to delete corporate client",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch corporate data
  const fetchCorporateData = async (page = 1) => {
    try {
      console.log('Fetching corporate data for page:', page);
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      // Add filters
      if (filterState && filterState !== 'all') params.append('state', filterState);
      if (filterCity && filterCity !== 'all') params.append('city', filterCity);
      if (filterAddressType && filterAddressType !== 'all') params.append('addressType', filterAddressType);
      if (filterActive && filterActive !== 'all') params.append('active', filterActive);

      const url = `/api/corporate?${params}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result: CorporateResponse = await response.json();
      console.log('Response data:', result);
      console.log('Corporate data received:', result.data?.length || 0, 'items');
      
      setCorporateData(result.data || []);
      setCurrentPage(result.currentPage || 1);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);
      setHasNext(result.hasNext || false);
      setHasPrev(result.hasPrev || false);
      setError('');
      
    } catch (err) {
      console.error('Error fetching corporate data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load corporate data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Search corporate data
  const searchCorporateData = async (query: string) => {
    if (!query.trim()) {
      fetchCorporateData(1);
      return;
    }

    try {
      console.log('Searching corporate data for:', query);
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/corporate/search/${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API Error:', response.status, errorText);
        throw new Error('Failed to search corporate data');
      }

      const result = await response.json();
      console.log('Search result:', result);
      setCorporateData(result.data || []);
      setError('');
      
    } catch (err) {
      console.error('Error searching corporate data:', err);
      setError('Failed to search corporate data');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchCorporateData(value);
    } else {
      fetchCorporateData(1);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchCorporateData(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState('all');
    setFilterCity('all');
    setFilterAddressType('all');
    setFilterActive('all');
    setSearchTerm('');
    setCurrentPage(1);
    fetchCorporateData(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get address type badge variant
  const getAddressTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'corporate': 'default',
      'branch': 'secondary',
      'firm': 'outline',
      'other': 'destructive'
    };
    return variants[type] || 'outline';
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  // Handle view corporate details
  const handleView = (corporate: CorporateData) => {
    setSelectedCorporate(corporate);
    setShowViewDialog(true);
  };

  // Handle edit corporate details
  const handleEdit = (corporate: CorporateData) => {
    setSelectedCorporate(corporate);
    setEditFormData({
      companyName: corporate.companyName,
      companyAddress: corporate.companyAddress,
      pin: corporate.pin,
      city: corporate.city,
      state: corporate.state,
      locality: corporate.locality,
      flatNumber: corporate.flatNumber,
      landmark: corporate.landmark,
      gstNumber: corporate.gstNumber,
      birthday: corporate.birthday,
      anniversary: corporate.anniversary,
      contactNumber: corporate.contactNumber,
      email: corporate.email,
      addressType: corporate.addressType,
      isActive: corporate.isActive
    });
    setShowEditDialog(true);
  };

  // Handle update corporate data
  const handleUpdate = async () => {
    if (!selectedCorporate) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/corporate/${selectedCorporate.corporateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editFormData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Corporate data updated successfully!",
        });
        setShowEditDialog(false);
        fetchCorporateData(currentPage); // Refresh the data
      } else {
        throw new Error(result.error || 'Failed to update corporate data');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update corporate data",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    console.log('CorporateManagement useEffect triggered, fetching data...');
    fetchCorporateData(1);
  }, []);

  // Add error boundary fallback
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-50">
            <Building2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Corporate Management</h1>
            <p className="text-red-500">Error loading data</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchCorporateData(1)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to format region names
  const formatRegionName = (region: string) => {
    return region
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Ne By Surface', 'NE by Surface')
      .replace('Ne By Air Agt Imp', 'NE by Air (Agent Import)')
      .replace('Rest Of India', 'Rest of India');
  };

  // Helper function to format weight ranges
  const formatWeightRange = (weight: string) => {
    return weight
      .replace('01gm-250gm', '0.1g - 250g')
      .replace('251gm-500gm', '251g - 500g')
      .replace('add500gm', 'Additional 500g');
  };

  // Component to render pricing table
  const renderPricingTable = (title: string, data: any, isWeightBased = false, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
          <div className="flex items-center space-x-4">
            {icon}
            <h3 className="text-base font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
              {title}
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full h-full">
            <thead style={{ fontFamily: 'Calibr', backgroundColor: '#406AB9' }}>
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Weight Range</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Assam</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>NE by Surface</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>NE by Air (Agent Import)</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Rest of India</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isWeightBased ? (
                Object.entries(data).map(([weight, prices]: [string, any], index) => (
                  <tr key={weight} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Calibri' }}>
                      {formatWeightRange(weight)}
                    </td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{prices.assam || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{prices.neBySurface || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{prices.neByAirAgtImp || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{prices.restOfIndia || 0}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-blue-50 transition-colors bg-white">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Calibri' }}>All Weights</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{data.assam || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{data.neBySurface || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{data.neByAirAgtImp || 0}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{data.restOfIndia || 0}</td>
                  </tr>
                  {/* Add empty rows to match height with weight-based tables */}
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-5 py-4 text-sm text-center text-transparent" style={{ fontFamily: 'Calibri' }}>₹0</td>
                  </tr>
                  <tr className="bg-white">
                    <td colSpan={5} className="px-5 py-4 text-sm text-center text-transparent" style={{ fontFamily: 'Calibri' }}>₹0</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Component to render reverse pricing table
  const renderReversePricingTable = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
              {title}
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ fontFamily: 'Calibr', backgroundColor: '#406AB9' }}>
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Region</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Transport Mode</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Normal</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-white" style={{ fontFamily: 'Calibr' }}>Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {Object.entries(data).map(([region, transport]: [string, any], regionIndex) => (
                Object.entries(transport).map(([mode, pricing]: [string, any], modeIndex) => {
                  const rowIndex = regionIndex * Object.keys(transport).length + modeIndex;
                  return (
                    <tr key={`${region}-${mode}`} className={`hover:bg-purple-50 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Calibri' }}>
                        {formatRegionName(region)}
                      </td>
                      <td className="px-5 py-4 text-sm text-center text-gray-700 capitalize font-semibold" style={{ fontFamily: 'Calibri' }}>{mode}</td>
                      <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{pricing?.normal || 0}</td>
                      <td className="px-5 py-4 text-sm text-center text-gray-700 font-semibold" style={{ fontFamily: 'Calibri' }}>₹{pricing?.priority || 0}</td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  console.log('CorporateManagement render - loading:', loading, 'error:', error, 'data length:', corporateData.length);
  
  // Ensure we always render something
  if (!loading && !error && corporateData.length === 0) {
    console.log('Rendering empty state');
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="px-6 py-5">
      <div className="flex items-center justify-between">
          <div>
              <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibr', fontSize: '32px' }}>Corporate Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>{totalCount} total corporate registrations</p>
          </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => fetchCorporateData(currentPage)} className="rounded-full px-4">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

              <Button variant="outline" size="sm" className="rounded-full px-4">
            <Download className="h-4 w-4 mr-2" />
                Export CSV
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                  style={{ 
                    borderColor: searchTerm ? '#3b82f6' : '#d1d5db',
                    boxShadow: 'none'
                  }}
                />
                <label 
                  className={`absolute left-12 transition-all duration-200 pointer-events-none bg-white px-1 ${
                    searchTerm 
                      ? '-top-2 text-sm text-blue-600 font-medium' 
                      : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                  }`}
                >
                  Search by company name, ID, or contact...
                </label>
              </div>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={filterState === 'all' ? '' : filterState}
                onChange={(e) => { setFilterState(e.target.value || 'all'); handleFilterChange(); }}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: filterState !== 'all' ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  filterState !== 'all' 
                    ? '-top-2 text-xs text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by state...
              </label>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={filterAddressType === 'all' ? '' : filterAddressType}
                onChange={(e) => { setFilterAddressType(e.target.value || 'all'); handleFilterChange(); }}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: filterAddressType !== 'all' ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  filterAddressType !== 'all' 
                    ? '-top-2 text-xs text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by type...
              </label>
          </div>
            
            <Button 
              onClick={clearFilters} 
              variant="outline"
              className="rounded-full px-4"
            >
              Reset Filters
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ fontFamily: 'Calibr', backgroundColor: '#406AB9' }} className="">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Corporate ID</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Company Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Username</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Email</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>City</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>PIN Code</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>GST</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Phone Number</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading corporate data...
                      </td>
                    </tr>
          ) : error ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchCorporateData(currentPage)}>
                Try Again
              </Button>
                      </td>
                    </tr>
          ) : corporateData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">No corporate registrations found</td>
                    </tr>
                  ) : (
                    corporateData.map((corporate) => (
                      <tr key={corporate._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {corporate.corporateId}
                          </code>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <p className="font-medium">{corporate.companyName}</p>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <code className="bg-blue-50 px-2 py-1 rounded text-sm text-blue-700">
                            {corporate.username}
                          </code>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <span className="text-sm text-blue-600">{corporate.email}</span>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <span className="text-sm">{corporate.city}</span>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <span className="text-sm font-mono">{corporate.pin}</span>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          {corporate.gstNumber ? (
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {corporate.gstNumber}
                            </code>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <span className="text-sm font-mono">+91 {corporate.contactNumber}</span>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleView(corporate)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => fetchAssignedPricing(corporate._id)}
                              disabled={loadingPricing}
                              title="View assigned pricing plan"
                            >
                              <DollarSign className="h-4 w-4" style={{color:'#16a34a'}} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(corporate)}
                              title="Edit details"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(corporate)}
                              title="Delete corporate"
                            >
                              <Trash2 className="h-4 w-4" style={{color:'#dc2626'}} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-primary">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-primary">{Math.min(currentPage * 10, totalCount)}</span> of <span className="font-semibold text-primary">{totalCount}</span> results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCorporateData(currentPage - 1)}
                  disabled={!hasPrev || loading}
                  className="ocl-btn-outline"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCorporateData(currentPage + 1)}
                  disabled={!hasNext || loading}
                  className="ocl-btn-outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Corporate Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about the corporate registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedCorporate && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Corporate ID</Label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{selectedCorporate.corporateId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                  <p className="text-sm">{selectedCorporate.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Username</Label>
                  <p className="text-sm font-mono bg-blue-50 px-2 py-1 rounded text-blue-700">{selectedCorporate.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact Number</Label>
                  <p className="text-sm">{selectedCorporate.contactNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm text-blue-600">{selectedCorporate.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email Status</Label>
                  <div className="flex items-center gap-2">
                    {selectedCorporate.emailSent ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Email Sent</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-600">Email Not Sent</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Address Type</Label>
                  <Badge variant={getAddressTypeBadge(selectedCorporate.addressType)}>
                    {selectedCorporate.addressType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">GST Number</Label>
                  <p className="text-sm">{selectedCorporate.gstNumber || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={getStatusBadge(selectedCorporate.isActive)}>
                    {selectedCorporate.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Registration Date</Label>
                  <p className="text-sm">{formatDate(selectedCorporate.registrationDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Birthday</Label>
                  <p className="text-sm">{selectedCorporate.birthday || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Anniversary</Label>
                  <p className="text-sm">{selectedCorporate.anniversary || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Company Address</Label>
                <p className="text-sm">{selectedCorporate.companyAddress}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">City</Label>
                  <p className="text-sm">{selectedCorporate.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">State</Label>
                  <p className="text-sm">{selectedCorporate.state}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">PIN Code</Label>
                  <p className="text-sm">{selectedCorporate.pin}</p>
                </div>
              </div>
              
              {selectedCorporate.locality && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Locality</Label>
                  <p className="text-sm">{selectedCorporate.locality}</p>
                </div>
              )}
              
              {selectedCorporate.flatNumber && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Flat Number</Label>
                  <p className="text-sm">{selectedCorporate.flatNumber}</p>
                </div>
              )}
              
              {selectedCorporate.landmark && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Landmark</Label>
                  <p className="text-sm">{selectedCorporate.landmark}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewDialog(false);
              handleEdit(selectedCorporate!);
            }}>
              Edit Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-green-600" />
              Edit Corporate Details
            </DialogTitle>
            <DialogDescription>
              Update the corporate registration information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCompanyName">Company Name</Label>
                <Input
                  id="editCompanyName"
                  value={editFormData.companyName || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editContactNumber">Contact Number</Label>
                <Input
                  id="editContactNumber"
                  value={editFormData.contactNumber || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editGstNumber">GST Number</Label>
                <Input
                  id="editGstNumber"
                  value={editFormData.gstNumber || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editAddressType">Address Type</Label>
                <Select 
                  value={editFormData.addressType || 'corporate'} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, addressType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="firm">Firm</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCity">City</Label>
                <Input
                  id="editCity"
                  value={editFormData.city || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editState">State</Label>
                <Input
                  id="editState"
                  value={editFormData.state || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editPin">PIN Code</Label>
                <Input
                  id="editPin"
                  value={editFormData.pin || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, pin: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editLocality">Locality</Label>
                <Input
                  id="editLocality"
                  value={editFormData.locality || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, locality: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editFlatNumber">Flat Number</Label>
                <Input
                  id="editFlatNumber"
                  value={editFormData.flatNumber || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, flatNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editLandmark">Landmark</Label>
                <Input
                  id="editLandmark"
                  value={editFormData.landmark || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editBirthday">Birthday</Label>
                <Input
                  id="editBirthday"
                  type="date"
                  value={editFormData.birthday || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, birthday: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editAnniversary">Anniversary</Label>
                <Input
                  id="editAnniversary"
                  type="date"
                  value={editFormData.anniversary || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, anniversary: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editCompanyAddress">Company Address</Label>
              <Textarea
                id="editCompanyAddress"
                value={editFormData.companyAddress || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="editIsActive">Status</Label>
              <Select 
                value={editFormData.isActive ? 'true' : 'false'} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, isActive: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Details'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing View Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="sm:max-w-[1200px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3" style={{ fontFamily: 'Calibri' }}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              Assigned Pricing Plan: {selectedCorporate?.companyName}
            </DialogTitle>
            <DialogDescription className="text-gray-600" style={{ fontFamily: 'Calibri' }}>
              View the pricing plan assigned to this corporate client.
            </DialogDescription>
          </DialogHeader>
          
          {loadingPricing ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading pricing plan...</span>
            </div>
          ) : assignedPricing ? (
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Calibri' }}>Pricing Name</p>
                      <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Calibri' }}>{assignedPricing.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Calibri' }}>Status</p>
                      <Badge variant="default" className="text-xs">
                        {assignedPricing.status.charAt(0).toUpperCase() + assignedPricing.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Calibri' }}>Created By</p>
                      <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Calibri' }}>{assignedPricing.createdBy?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Calibri' }}>Created At</p>
                      <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Calibri' }}>{new Date(assignedPricing.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Tables Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>Pricing Structure</h3>
                </div>

                {/* Main Pricing Tables - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6 flex flex-col">
                    <div className="flex-1">
                      {renderPricingTable("DOX Pricing", assignedPricing.doxPricing, true, 
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {renderPricingTable("Non-DOX Surface Pricing", assignedPricing.nonDoxSurfacePricing, false, 
                        <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6 flex flex-col">
                    <div className="flex-1">
                      {renderPricingTable("Non-DOX Air Pricing", assignedPricing.nonDoxAirPricing, false, 
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {renderPricingTable("Priority Pricing", assignedPricing.priorityPricing, true, 
                        <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reverse Pricing - Full Width */}
                <div className="mt-8">
                  {renderReversePricingTable("Reverse Pricing", assignedPricing.reversePricing)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pricing Plan Assigned</h3>
              <p className="text-gray-600">This corporate client doesn't have an assigned pricing plan yet.</p>
            </div>
          )}
          
          <DialogFooter className="pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowPricingDialog(false)} className="rounded-full px-6">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Calibri' }}>
              Delete Corporate Client: {selectedCorporate?.companyName}
            </DialogTitle>
            <DialogDescription className="text-gray-600" style={{ fontFamily: 'Calibri' }}>
              Are you sure you want to delete this corporate client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800" style={{ fontFamily: 'Calibri' }}>
                    Warning: This will permanently delete the corporate client
                  </p>
                  <p className="text-xs text-red-600 mt-1" style={{ fontFamily: 'Calibri' }}>
                    All associated data including company information, contact details, and assigned pricing plans will be lost and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-full px-4">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-full px-4"
            >
              {isDeleting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Corporate Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap the component with error boundary
const CorporateManagementWithErrorBoundary = () => {
  return (
    <CorporateManagementErrorBoundary>
      <CorporateManagement />
    </CorporateManagementErrorBoundary>
  );
};

export default CorporateManagementWithErrorBoundary;
