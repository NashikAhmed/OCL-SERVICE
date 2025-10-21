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
  bulkOrder?: boolean;
  priority?: boolean;
  standard?: boolean;
  modes?: {
    byAir: boolean;
    byTrain: boolean;
    byRoad: boolean;
  };
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
    serviceable: false,
    bulkOrder: false,
    priority: false,
    standard: false,
    modes: {
      byAir: false,
      byTrain: false,
      byRoad: false
    }
  });
  const [updatingServiceableId, setUpdatingServiceableId] = useState<string | null>(null);
  const [updatingBulkOrderId, setUpdatingBulkOrderId] = useState<string | null>(null);
  const [updatingPriorityId, setUpdatingPriorityId] = useState<string | null>(null);
  const [updatingStandardId, setUpdatingStandardId] = useState<string | null>(null);
  const [updatingByAirId, setUpdatingByAirId] = useState<string | null>(null);
  const [updatingByTrainId, setUpdatingByTrainId] = useState<string | null>(null);
  const [updatingByRoadId, setUpdatingByRoadId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [stateFocused, setStateFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

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

  const toggleBulkOrder = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingBulkOrderId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, bulkOrder: nextValue } : p));
      
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
        body: JSON.stringify({ bulkOrder: nextValue })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, bulkOrder: !nextValue } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update bulk order status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, bulkOrder: !nextValue } : p));
      toast({ title: 'Network error', description: 'Could not update bulk order status', variant: 'destructive' });
    } finally {
      setUpdatingBulkOrderId(null);
    }
  };

  const togglePriority = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingPriorityId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, priority: nextValue } : p));
      
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
        body: JSON.stringify({ priority: nextValue })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, priority: !nextValue } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update priority status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, priority: !nextValue } : p));
      toast({ title: 'Network error', description: 'Could not update priority status', variant: 'destructive' });
    } finally {
      setUpdatingPriorityId(null);
    }
  };

  const toggleStandard = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingStandardId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, standard: nextValue } : p));
      
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
        body: JSON.stringify({ standard: nextValue })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, standard: !nextValue } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update standard status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { ...p, standard: !nextValue } : p));
      toast({ title: 'Network error', description: 'Could not update standard status', variant: 'destructive' });
    } finally {
      setUpdatingStandardId(null);
    }
  };

  const toggleByAir = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingByAirId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byAir: nextValue 
        } 
      } : p));
      
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
        body: JSON.stringify({ 
          modes: { 
            ...pin.modes, 
            byAir: nextValue 
          } 
        })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { 
          ...p, 
          modes: { 
            ...p.modes, 
            byAir: !nextValue 
          } 
        } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update air mode status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byAir: !nextValue 
        } 
      } : p));
      toast({ title: 'Network error', description: 'Could not update air mode status', variant: 'destructive' });
    } finally {
      setUpdatingByAirId(null);
    }
  };

  const toggleByTrain = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingByTrainId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byTrain: nextValue 
        } 
      } : p));
      
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
        body: JSON.stringify({ 
          modes: { 
            ...pin.modes, 
            byTrain: nextValue 
          } 
        })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { 
          ...p, 
          modes: { 
            ...p.modes, 
            byTrain: !nextValue 
          } 
        } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update train mode status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byTrain: !nextValue 
        } 
      } : p));
      toast({ title: 'Network error', description: 'Could not update train mode status', variant: 'destructive' });
    } finally {
      setUpdatingByTrainId(null);
    }
  };

  const toggleByRoad = async (pin: Pincode, nextValue: boolean) => {
    try {
      setUpdatingByRoadId(pin._id);
      // Optimistic update
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byRoad: nextValue 
        } 
      } : p));
      
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
        body: JSON.stringify({ 
          modes: { 
            ...pin.modes, 
            byRoad: nextValue 
          } 
        })
      });
      if (!res.ok) {
        // Revert on failure
        setPincodes(prev => prev.map(p => p._id === pin._id ? { 
          ...p, 
          modes: { 
            ...p.modes, 
            byRoad: !nextValue 
          } 
        } : p));
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Update failed', description: data.error || 'Could not update road mode status', variant: 'destructive' });
      }
    } catch (err) {
      // Revert on error
      setPincodes(prev => prev.map(p => p._id === pin._id ? { 
        ...p, 
        modes: { 
          ...p.modes, 
          byRoad: !nextValue 
        } 
      } : p));
      toast({ title: 'Network error', description: 'Could not update road mode status', variant: 'destructive' });
    } finally {
      setUpdatingByRoadId(null);
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
        limit: '20',
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
      serviceable: false,
      bulkOrder: false,
      priority: false,
      standard: false,
      modes: {
        byAir: false,
        byTrain: false,
        byRoad: false
      }
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
      serviceable: Boolean(pincode.serviceable),
      bulkOrder: Boolean(pincode.bulkOrder),
      priority: Boolean(pincode.priority),
      standard: Boolean(pincode.standard),
      modes: {
        byAir: Boolean(pincode.modes?.byAir),
        byTrain: Boolean(pincode.modes?.byTrain),
        byRoad: Boolean(pincode.modes?.byRoad)
      }
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
    
    const headers = ['Pincode', 'Area', 'City', 'District', 'State', 'Serviceable', 'Bulk Order', 'Priority', 'Standard', 'By Air', 'By Train', 'By Road'];
    const rows = data.map(item => [
      item.pincode,
      item.areaname,
      item.cityname,
      item.distrcitname,
      item.statename,
      item.serviceable ? 'Yes' : 'No',
      item.bulkOrder ? 'Yes' : 'No',
      item.priority ? 'Yes' : 'No',
      item.standard ? 'Yes' : 'No',
      item.modes?.byAir ? 'Yes' : 'No',
      item.modes?.byTrain ? 'Yes' : 'No',
      item.modes?.byRoad ? 'Yes' : 'No'
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
              <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibr',fontSize:'32px' }}>Pincode Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>{pagination && `${pagination.totalCount} total pincodes`}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={exportData} className="rounded-full px-4">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button variant="outline" size="sm" onClick={() => fetchPincodes(1)} className="rounded-full px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Button size="sm" onClick={handleAdd} className="rounded-full px-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                 Add Pincode
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
                  Search by pincode, area, city, or state...
                </label>
              </div>
            </div>
            
            <div className="relative w-56">
              <Input
                placeholder=""
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                onFocus={() => setStateFocused(true)}
                onBlur={() => setStateFocused(false)}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: stateFocused || stateFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  stateFocused || stateFilter 
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
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                onFocus={() => setCityFocused(true)}
                onBlur={() => setCityFocused(false)}
                className="rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ 
                  borderColor: cityFocused || cityFilter ? '#3b82f6' : '#d1d5db',
                  boxShadow: 'none'
                }}
              />
              <label 
                className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                  cityFocused || cityFilter 
                    ? '-top-2 text-xs text-blue-600 font-medium' 
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                }`}
              >
                Filter by city...
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
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Pincode</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Area</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>City</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>District</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>State</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Serviceable</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Bulk Order</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Priority</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Standard</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Modes</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 last:border-r-0" style={{ fontFamily: 'Calibr', color: '#4ec0f7' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-gray-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading pincodes...
                      </td>
                    </tr>
                  ) : pincodes.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-gray-500">No pincodes found</td>
                    </tr>
                  ) : (
                    pincodes.map((pincode) => (
                      <tr key={pincode._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{pincode.pincode}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{pincode.areaname}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{pincode.cityname}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{pincode.distrcitname}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>{pincode.statename}</td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(pincode.serviceable)}
                              disabled={updatingServiceableId === pincode._id}
                              onChange={(e) => toggleServiceable(pincode, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span className={`px-3 rounded-full text-sm font-medium ${
                              Boolean(pincode.serviceable) 
                                ? 'text-green-600 border border-green-300 bg-white' 
                                : 'text-gray-500 border border-gray-200 bg-white'
                            }`}>
                              {Boolean(pincode.serviceable) ? 'Serviceable' : 'Non - Serviceable'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(pincode.bulkOrder)}
                              disabled={updatingBulkOrderId === pincode._id}
                              onChange={(e) => toggleBulkOrder(pincode, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span className={`px-3 rounded-full text-sm font-medium ${
                              Boolean(pincode.bulkOrder) 
                                ? 'text-blue-600 border border-blue-300 bg-white' 
                                : 'text-gray-500 border border-gray-200 bg-white'
                            }`}>
                              {Boolean(pincode.bulkOrder) ? 'Bulk' : 'Regular'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(pincode.priority)}
                              disabled={updatingPriorityId === pincode._id}
                              onChange={(e) => togglePriority(pincode, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span className={`px-3 rounded-full text-sm font-medium ${
                              Boolean(pincode.priority) 
                                ? 'text-green-600 border border-green-300 bg-white' 
                                : 'text-gray-500 border border-gray-200 bg-white'
                            }`}>
                              {Boolean(pincode.priority) ? 'Priority' : 'Normal'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(pincode.standard)}
                              disabled={updatingStandardId === pincode._id}
                              onChange={(e) => toggleStandard(pincode, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span className={`px-3 rounded-full text-sm font-medium ${
                              Boolean(pincode.standard) 
                                ? 'text-blue-600 border border-blue-300 bg-white' 
                                : 'text-gray-500 border border-gray-200 bg-white'
                            }`}>
                              {Boolean(pincode.standard) ? 'Standard' : 'Custom'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(pincode.modes?.byAir)}
                                disabled={updatingByAirId === pincode._id}
                                onChange={(e) => toggleByAir(pincode, e.target.checked)}
                                className="h-3 w-3"
                              />
                              <span className="text-xs">Air</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(pincode.modes?.byTrain)}
                                disabled={updatingByTrainId === pincode._id}
                                onChange={(e) => toggleByTrain(pincode, e.target.checked)}
                                className="h-3 w-3"
                              />
                              <span className="text-xs">Train</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(pincode.modes?.byRoad)}
                                disabled={updatingByRoadId === pincode._id}
                                onChange={(e) => toggleByRoad(pincode, e.target.checked)}
                                className="h-3 w-3"
                              />
                              <span className="text-xs">Road</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 text-sm border-r border-gray-100 last:border-r-0" style={{ fontFamily: 'Calibri', lineHeight: '1' }}>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(pincode)} className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button style={{color:'#1e66f5'}} variant="ghost" size="sm" onClick={() => handleDelete(pincode)} className="h-8 w-8 p-0">
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
                  return `${startItem} to ${endItem} of ${pagination.totalCount} pincodes`;
                })()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => fetchPincodes(pagination.currentPage - 1)} className="rounded-full px-4">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => fetchPincodes(pagination.currentPage + 1)} className="rounded-full px-4">
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
        <DialogContent className="max-w-2xl rounded-2xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Calibri', fontSize: '26px' }}>
                  {isEditModalOpen ? 'Edit Pincode' : 'Add New Pincode'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Calibri' }}>
                  {isEditModalOpen ? 'Update pincode information and service options' : 'Enter new pincode details and configure service options'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(isEditModalOpen);
          }}>
            <div className="px-8 pb-6 space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <Input
                      id="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder=""
                      maxLength={6}
                      required
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      style={{ 
                        fontFamily: 'Calibri',
                        borderColor: formData.pincode ? '#3b82f6' : '#e5e7eb',
                        boxShadow: formData.pincode ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                      }}
                      onKeyDown={(e) => {
                        // Allow only numbers, backspace, delete, tab, escape, enter
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <label 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-2 ${
                        formData.pincode 
                          ? '-top-2 text-xs text-blue-600 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                      }`}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      Pincode *
                    </label>
                  </div>

                  <div className="relative">
                    <Input
                      id="areaname"
                      type="text"
                      value={formData.areaname}
                      onChange={(e) => setFormData(prev => ({ ...prev, areaname: e.target.value }))}
                      placeholder=""
                      required
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      style={{ 
                        fontFamily: 'Calibri',
                        borderColor: formData.areaname ? '#3b82f6' : '#e5e7eb',
                        boxShadow: formData.areaname ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                      }}
                    />
                    <label 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-2 ${
                        formData.areaname 
                          ? '-top-2 text-xs text-blue-600 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                      }`}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      Area Name *
                    </label>
                  </div>

                  <div className="relative">
                    <Input
                      id="cityname"
                      type="text"
                      value={formData.cityname}
                      onChange={(e) => setFormData(prev => ({ ...prev, cityname: e.target.value }))}
                      placeholder=""
                      required
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      style={{ 
                        fontFamily: 'Calibri',
                        borderColor: formData.cityname ? '#3b82f6' : '#e5e7eb',
                        boxShadow: formData.cityname ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                      }}
                    />
                    <label 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-2 ${
                        formData.cityname 
                          ? '-top-2 text-xs text-blue-600 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                      }`}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      City *
                    </label>
                  </div>

                  <div className="relative">
                    <Input
                      id="distrcitname"
                      type="text"
                      value={formData.distrcitname}
                      onChange={(e) => setFormData(prev => ({ ...prev, distrcitname: e.target.value }))}
                      placeholder=""
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      style={{ 
                        fontFamily: 'Calibri',
                        borderColor: formData.distrcitname ? '#3b82f6' : '#e5e7eb',
                        boxShadow: formData.distrcitname ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                      }}
                    />
                    <label 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-2 ${
                        formData.distrcitname 
                          ? '-top-2 text-xs text-blue-600 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                      }`}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      District
                    </label>
                  </div>

                  <div className="relative">
                    <Input
                      id="statename"
                      type="text"
                      value={formData.statename}
                      onChange={(e) => setFormData(prev => ({ ...prev, statename: e.target.value }))}
                      placeholder=""
                      required
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      style={{ 
                        fontFamily: 'Calibri',
                        borderColor: formData.statename ? '#3b82f6' : '#e5e7eb',
                        boxShadow: formData.statename ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                      }}
                    />
                    <label 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-2 ${
                        formData.statename 
                          ? '-top-2 text-xs text-blue-600 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
                      }`}
                      style={{ fontFamily: 'Calibri' }}
                    >
                      State *
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Service Options */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Service Options
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Serviceable */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.serviceable ? '#10b981' : '#e5e7eb',
                         backgroundColor: formData.serviceable ? '#f0fdf4' : '#fafafa'
                       }}>
                    <input
                      id="serviceable"
                      type="checkbox"
                      checked={!!formData.serviceable}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceable: e.target.checked }))}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="serviceable" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.serviceable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Serviceable
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Enable delivery to this pincode
                      </p>
                    </div>
                  </div>
                  
                  {/* Bulk Order */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.bulkOrder ? '#3b82f6' : '#e5e7eb',
                         backgroundColor: formData.bulkOrder ? '#eff6ff' : '#fafafa'
                       }}>
                    <input
                      id="bulkOrder"
                      type="checkbox"
                      checked={!!formData.bulkOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, bulkOrder: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="bulkOrder" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.bulkOrder ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        Bulk Order
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Allow bulk order processing
                      </p>
                    </div>
                  </div>
                  
                  {/* Priority Service */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.priority ? '#10b981' : '#e5e7eb',
                         backgroundColor: formData.priority ? '#f0fdf4' : '#fafafa'
                       }}>
                    <input
                      id="priority"
                      type="checkbox"
                      checked={!!formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.checked }))}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="priority" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.priority ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Priority Service
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Fast delivery service available
                      </p>
                    </div>
                  </div>
                  
                  {/* Standard Service */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.standard ? '#3b82f6' : '#e5e7eb',
                         backgroundColor: formData.standard ? '#eff6ff' : '#fafafa'
                       }}>
                    <input
                      id="standard"
                      type="checkbox"
                      checked={!!formData.standard}
                      onChange={(e) => setFormData(prev => ({ ...prev, standard: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="standard" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.standard ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        Standard Service
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Regular delivery service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Modes */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center" style={{ fontFamily: 'Calibri' }}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Delivery Modes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Air */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.modes.byAir ? '#8b5cf6' : '#e5e7eb',
                         backgroundColor: formData.modes.byAir ? '#faf5ff' : '#fafafa'
                       }}>
                    <input
                      id="byAir"
                      type="checkbox"
                      checked={!!formData.modes.byAir}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        modes: { 
                          ...prev.modes, 
                          byAir: e.target.checked 
                        } 
                      }))}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="byAir" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.modes.byAir ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                        By Air
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Air cargo delivery available
                      </p>
                    </div>
                  </div>
                  
                  {/* By Train */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.modes.byTrain ? '#8b5cf6' : '#e5e7eb',
                         backgroundColor: formData.modes.byTrain ? '#faf5ff' : '#fafafa'
                       }}>
                    <input
                      id="byTrain"
                      type="checkbox"
                      checked={!!formData.modes.byTrain}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        modes: { 
                          ...prev.modes, 
                          byTrain: e.target.checked 
                        } 
                      }))}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="byTrain" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.modes.byTrain ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                        By Train
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Railway cargo delivery available
                      </p>
                    </div>
                  </div>
                  
                  {/* By Road */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md" 
                       style={{ 
                         borderColor: formData.modes.byRoad ? '#8b5cf6' : '#e5e7eb',
                         backgroundColor: formData.modes.byRoad ? '#faf5ff' : '#fafafa'
                       }}>
                    <input
                      id="byRoad"
                      type="checkbox"
                      checked={!!formData.modes.byRoad}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        modes: { 
                          ...prev.modes, 
                          byRoad: e.target.checked 
                        } 
                      }))}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="byRoad" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        style={{ fontFamily: 'Calibri' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.modes.byRoad ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                        By Road
                      </Label>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                        Road transport delivery available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl border-t border-gray-200">
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-gray-500" style={{ fontFamily: 'Calibri' }}>
                  * Required fields
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setSelectedPincode(null);
                    }}
                    disabled={isSaving}
                    className="rounded-xl px-8 py-2 border-2 border-gray-300 hover:border-gray-400 "
                    style={{ fontFamily: 'Calibri' }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.pincode || !formData.areaname || !formData.cityname || !formData.statename}
                    className="rounded-xl px-8 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{ fontFamily: 'Calibri' }}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isEditModalOpen ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditModalOpen ? 'Update Pincode' : 'Add Pincode'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
                Are you sure you want to delete the pincode <span className="font-semibold text-red-600">"{pincodeToDelete?.pincode}"</span> for <span className="font-semibold text-red-600">{pincodeToDelete?.areaname}</span>?
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
                    Delete Pincode
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

export default PincodeManagement;