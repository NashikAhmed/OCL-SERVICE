import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw,
  Filter,
  Download,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pincode {
  _id: string;
  pincode: number;
  areaname: string;
  cityname: string;
  distrcitname: string; // Note: using the typo that exists in the model
  statename: string;
  serviceable?: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const PincodeManagement = () => {
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState<Pincode | null>(null);
  const [pincodeToDelete, setPincodeToDelete] = useState<Pincode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pincode: '',
    areaname: '',
    cityname: '',
    distrcitname: '', // Note: using the typo that exists in the model
    statename: '',
    serviceable: false
  });
  const [updatingServiceableId, setUpdatingServiceableId] = useState<string | null>(null);

  const toggleServiceable = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingServiceableId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, serviceable: nextValue } : p));
      
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      const endpoint = adminToken ? '/api/admin/pincodes' : '/api/office/pincodes';
      
      const res = await fetch(`${endpoint}/${pin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceable: nextValue })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, serviceable: !nextValue } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update serviceable status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, serviceable: !nextValue } : p));
      toast({ title: 'Network error', description: 'Could not update serviceable status', variant: 'destructive' });
    } finally {
      setUpdatingServiceableId(null);
    }
  };
  
  const { toast } = useToast();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPincodes();
    }, 300); // Debounce search by 300ms
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, stateFilter, cityFilter]);

  const fetchPincodes = async (page = 1) => {
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
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(stateFilter && { state: stateFilter }),
        ...(cityFilter && { city: cityFilter })
      });
      
      // Use admin endpoint if admin token exists, otherwise use office endpoint
      const endpoint = adminToken ? '/api/admin/pincodes' : '/api/office/pincodes';
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPincodes(data.data || []);
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
        setError('You do not have permission to view pincode management. Please contact your administrator.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load pincodes');
      }
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setError('Network error while loading pincodes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      pincode: '',
      areaname: '',
      cityname: '',
      distrcitname: '',
      statename: '',
      serviceable: false
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (pincode: Pincode) => {
    setSelectedPincode(pincode);
    setFormData({
      pincode: pincode.pincode.toString(),
      areaname: pincode.areaname,
      cityname: pincode.cityname,
      distrcitname: pincode.distrcitname,
      statename: pincode.statename,
      serviceable: Boolean(pincode.serviceable)
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (pincode: Pincode) => {
    setPincodeToDelete(pincode);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (isEdit: boolean) => {
    try {
      setIsSaving(true);
      setError('');
      
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
      
      const baseEndpoint = adminToken ? '/api/admin/pincodes' : '/api/office/pincodes';
      
      const url = isEdit 
        ? `${baseEndpoint}/${selectedPincode?._id}`
        : baseEndpoint;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Pincode ${isEdit ? 'updated' : 'added'} successfully.`,
        });
        
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPincode(null);
        fetchPincodes(pagination?.currentPage || 1);
      } else if (response.status === 401) {
        const adminToken = localStorage.getItem('adminToken');
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
          description: 'You do not have permission to manage pincodes. Please contact your administrator.',
          variant: "destructive",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || `Failed to ${isEdit ? 'update' : 'add'} pincode`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving pincode:', error);
      toast({
        title: "Error",
        description: 'Network error while saving pincode',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pincodeToDelete) return;

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
      
      const endpoint = adminToken ? '/api/admin/pincodes' : '/api/office/pincodes';
      
      const response = await fetch(`${endpoint}/${pincodeToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pincode deleted successfully.",
        });
        
        setIsDeleteDialogOpen(false);
        setPincodeToDelete(null);
        fetchPincodes(pagination?.currentPage || 1);
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
          description: 'You do not have permission to manage pincodes. Please contact your administrator.',
          variant: "destructive",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Failed to delete pincode',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting pincode:', error);
      toast({
        title: "Error",
        description: 'Network error while deleting pincode',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPincodeToDelete(null);
    }
  };

  const exportData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      const endpoint = adminToken ? '/api/admin/pincodes' : '/api/office/pincodes';
      
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (stateFilter) params.append('state', stateFilter);
      if (cityFilter) params.append('city', cityFilter);
      
      const response = await fetch(`${endpoint}?${params}&limit=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, 'pincodes_export.csv');
        
        toast({
          title: "Export Successful",
          description: `${data.data.length} pincodes exported to CSV.`,
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

  const convertToCSV = (data: Pincode[]) => {
    if (data.length === 0) return '';
    
    const headers = ['Pincode', 'Area', 'City', 'District', 'State', 'Serviceable'];
    const rows = data.map(item => [
      item.pincode,
      item.areaname,
      item.cityname,
      item.distrcitname,
      item.statename,
      item.serviceable ? 'Yes' : 'No'
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pincode Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {pagination && `${pagination.totalCount} total pincodes`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchPincodes(1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pincode
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by pincode, area, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Input
              placeholder="Filter by state..."
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-40"
            />
            
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-40"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Serviceable</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading pincodes...
                    </TableCell>
                  </TableRow>
                ) : pincodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No pincodes found
                    </TableCell>
                  </TableRow>
                ) : (
                  pincodes.map((pincode) => (
                    <TableRow key={pincode._id}>
                      <TableCell className="font-mono">{pincode.pincode}</TableCell>
                      <TableCell>{pincode.areaname}</TableCell>
                      <TableCell>{pincode.cityname}</TableCell>
                      <TableCell>{pincode.distrcitname}</TableCell>
                      <TableCell>{pincode.statename}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={Boolean(pincode.serviceable)}
                            disabled={updatingServiceableId === pincode._id}
                            onChange={(e) => toggleServiceable(pincode, e.target.checked)}
                          />
                          <span className={Boolean(pincode.serviceable) ? 'text-green-700' : 'text-red-600'}>
                            {Boolean(pincode.serviceable) ? 'Serviceable' : 'Non - Serviceable'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pincode)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pincode)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalCount} total pincodes)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => fetchPincodes(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => fetchPincodes(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Pincode Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPincode(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? 'Edit Pincode' : 'Add New Pincode'}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Update pincode information' : 'Enter new pincode details'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(isEditModalOpen);
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                  onKeyDown={(e) => {
                    // Allow only numbers, backspace, delete, tab, escape, enter
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="areaname">Area Name</Label>
                <Input
                  id="areaname"
                  type="text"
                  value={formData.areaname}
                  onChange={(e) => setFormData(prev => ({ ...prev, areaname: e.target.value }))}
                  placeholder="Enter area name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cityname">City</Label>
                <Input
                  id="cityname"
                  type="text"
                  value={formData.cityname}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityname: e.target.value }))}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="distrcitname">District</Label>
                <Input
                  id="distrcitname"
                  type="text"
                  value={formData.distrcitname}
                  onChange={(e) => setFormData(prev => ({ ...prev, distrcitname: e.target.value }))}
                  placeholder="Enter district name"
                />
              </div>
              <div>
                <Label htmlFor="statename">State</Label>
                <Input
                  id="statename"
                  type="text"
                  value={formData.statename}
                  onChange={(e) => setFormData(prev => ({ ...prev, statename: e.target.value }))}
                  placeholder="Enter state name"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="serviceable"
                  type="checkbox"
                  checked={!!formData.serviceable}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceable: e.target.checked }))}
                />
                <Label htmlFor="serviceable">Serviceable</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedPincode(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !formData.pincode || !formData.areaname || !formData.cityname || !formData.statename}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {isEditModalOpen ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditModalOpen ? 'Update' : 'Add'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setPincodeToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the pincode "{pincodeToDelete?.pincode}" for {pincodeToDelete?.areaname}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PincodeManagement;
