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
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Coloader {
  _id: string;
  companyName: string;
  concernPerson: string;
  email: string;
  mobileNumbers: string[];
  serviceModes: string[];
  companyAddress: {
    state: string;
    city: string;
    area: string;
    pincode: string;
  };
  fromLocations: Array<{
    state: string;
    city: string;
    area: string;
    pincode: string;
  }>;
  toLocations: Array<{
    state: string;
    city: string;
    area: string;
    pincode: string;
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

  const { toast } = useToast();

  const serviceModeOptions = [
    { id: 'air', label: 'By Air' },
    { id: 'road', label: 'By Road' },
    { id: 'train', label: 'By Train' },
    { id: 'ship', label: 'By Ship' }
  ];

  // Helper function to convert service mode IDs to proper labels
  const getServiceModeLabels = (serviceModeIds: string[]) => {
    return serviceModeIds.map(id => {
      const option = serviceModeOptions.find(opt => opt.id === id);
      return option ? option.label : id;
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchColoaders();
    }, 300); // Debounce search by 300ms
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, originFilter, destinationFilter]);

  const fetchColoaders = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');
      
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        const redirectPath = adminToken ? '/admin' : '/office';
        window.location.href = redirectPath;
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(originFilter && { origin: originFilter }),
        ...(destinationFilter && { destination: destinationFilter })
      });
      
      // Use admin endpoint if admin token exists, otherwise use office endpoint
      const endpoint = adminToken ? '/api/admin/coloaders' : '/api/office/coloaders';
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setColoaders(data.data || []);
        setPagination(data.pagination);
        setError('');
      } else if (response.status === 401) {
        // Token expired or invalid
        if (adminToken) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin';
        } else {
          localStorage.removeItem('officeToken');
          localStorage.removeItem('officeUser');
          window.location.href = '/office';
        }
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


  const handleDelete = (coloader: Coloader) => {
    setColoaderToDelete(coloader);
    setIsDeleteDialogOpen(true);
  };


  const confirmDelete = async () => {
    if (!coloaderToDelete) return;

    try {
      setIsDeleting(true);
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      
      if (!token) {
        toast({
          title: "Error",
          description: 'No authentication token found. Please login again.',
          variant: "destructive",
        });
        const redirectPath = adminToken ? '/admin' : '/office';
        window.location.href = redirectPath;
        return;
      }
      
      const endpoint = adminToken ? '/api/admin/coloaders' : '/api/office/coloaders';
      
      const response = await fetch(`${endpoint}/${coloaderToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        if (adminToken) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin';
        } else {
          localStorage.removeItem('officeToken');
          localStorage.removeItem('officeUser');
          window.location.href = '/office';
        }
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
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      const endpoint = adminToken ? '/api/admin/coloaders' : '/api/office/coloaders';
      
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (originFilter) params.append('origin', originFilter);
      if (destinationFilter) params.append('destination', destinationFilter);
      
      const response = await fetch(`${endpoint}?${params}&limit=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
                      ? '-top-2 text-xs text-blue-600 font-medium' 
                      : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                  }`}
                >
                  Search by company name, concern person, or email...
                </label>
              </div>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                onFocus={() => setOriginFocused(true)}
                onBlur={() => setOriginFocused(false)}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: originFocused || originFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  originFocused || originFilter 
                    ? '-top-2 text-xs text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by origin...
              </label>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                onFocus={() => setDestinationFocused(true)}
                onBlur={() => setDestinationFocused(false)}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: destinationFocused || destinationFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  destinationFocused || destinationFilter 
                    ? '-top-2 text-xs text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by destination...
              </label>
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
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Company Pincode</th>
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
                      <tr key={coloader._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyName}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.concernPerson}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.email}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.mobileNumbers.join(', ')}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{getServiceModeLabels(coloader.serviceModes).join(', ')}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyAddress.city}, {coloader.companyAddress.state}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{coloader.companyAddress.pincode}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(coloader)} className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button style={{color:'#1e66f5'}} variant="ghost" size="sm" onClick={() => handleDelete(coloader)} className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
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
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Company Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  FROM Locations ({selectedColoader.fromLocations.length})
                </h3>
                
                <div className="space-y-4">
                  {selectedColoader.fromLocations.map((location, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Pincode</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TO Locations */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  TO Locations ({selectedColoader.toLocations.length})
                </h3>
                
                <div className="space-y-4">
                  {selectedColoader.toLocations.map((location, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>State</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>City</label>
                          <p className="text-sm text-gray-800" style={{ fontFamily: 'Calibri' }}>{location.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Calibri' }}>Pincode</label>
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
                className="rounded-xl px-8 py-2 border-2 border-gray-300 hover:border-gray-400"
                style={{ fontFamily: 'Calibri' }}
              >
                <X className="mr-2 h-4 w-4" />
                Close
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
