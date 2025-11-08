import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressFormEditModal from "./AddressFormEditModal";

interface AddressForm {
  _id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderPincode: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverPincode?: string;
  formCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  senderState?: string;
  senderCity?: string;
  receiverState?: string;
  receiverCity?: string;
  // New booking data fields
  originData?: any;
  destinationData?: any;
  shipmentData?: any;
  uploadData?: any;
  paymentData?: any;
  billData?: any;
  detailsData?: any;
  consignmentNumber?: number;
  assignmentData?: {
    status?: 'booked' | 'assigned' | 'partially_assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'received';
  };
  [key: string]: any;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  origin: {
    name: string;
    address: {
      pincode: string;
      city: string;
      state: string;
    };
  };
  destination: {
    name: string;
    address: {
      pincode: string;
      city: string;
      state: string;
    };
  };
  assignments: Array<{
    _id: string;
    type: 'coloader' | 'courier_boy';
    assignedTo: {
      _id: string;
      name: string;
      companyName?: string;
      phone: string;
    };
    fromLocation: {
      pincode: string;
      city: string;
      state: string;
    };
    toLocation: {
      pincode: string;
      city: string;
      state: string;
    };
    status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
    assignedAt: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    notes?: string;
  }>;
  currentLocation: {
    pincode: string;
    city: string;
    state: string;
    lastUpdated: string;
  };
  deliveryStatus: {
    isDelivered: boolean;
    deliveredAt?: string;
    deliveredBy?: string;
    deliveryNotes?: string;
  };
  createdAt: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const AddressFormsTable = () => {
  const [forms, setForms] = useState<AddressForm[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [completedFilter, setCompletedFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedForm, setSelectedForm] = useState<AddressForm | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<AddressForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Order-related state
  const [orders, setOrders] = useState<Record<string, Order[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, [searchTerm, completedFilter, stateFilter]);

  // Listen for order status changes from other components
  useEffect(() => {
    const handleOrderStatusChange = (event: CustomEvent) => {
      const { orderId, newStatus, consignmentNumber } = event.detail;
      console.log(`Order status changed: ${consignmentNumber} -> ${newStatus}`);
      
      // Refresh the forms data to reflect the status change
      fetchForms(pagination?.currentPage || 1);
      
      // Show a toast notification
      toast({
        title: "Status Updated",
        description: `Order ${consignmentNumber} status changed to ${newStatus}`,
      });
    };

    const handleOrderWeightUpdate = (event: CustomEvent) => {
      const { orderId, newWeight } = event.detail;
      console.log(`Order weight updated: ${orderId} -> ${newWeight}kg`);
      
      // Refresh the forms data to reflect the weight change
      fetchForms(pagination?.currentPage || 1);
    };

    // Add event listeners
    window.addEventListener('orderStatusChanged', handleOrderStatusChange as EventListener);
    window.addEventListener('orderWeightUpdated', handleOrderWeightUpdate as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('orderStatusChanged', handleOrderStatusChange as EventListener);
      window.removeEventListener('orderWeightUpdated', handleOrderWeightUpdate as EventListener);
    };
  }, [pagination?.currentPage]);

  const fetchForms = async (page = 1) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Try admin token first, then office token (for admin users in office dashboard)
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (completedFilter !== 'all') params.append('completed', completedFilter);
      if (stateFilter) params.append('state', stateFilter);
      
      // Use admin endpoint if admin token exists, otherwise use office endpoint
      const endpoint = adminToken ? '/api/admin/addressforms' : '/api/office/addressforms';
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        // Redirect to appropriate login page
        const adminToken = localStorage.getItem('adminToken');
        window.location.href = adminToken ? '/admin' : '/office';
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load address forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError('Network error while loading forms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (form: AddressForm) => {
    setSelectedForm(form);
    setIsEditModalOpen(true);
  };

  const handleDelete = (form: AddressForm) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!formToDelete) return;
    
    setIsDeleting(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      const endpoint = adminToken ? '/api/admin/addressforms' : '/api/office/addressforms';
      
      const response = await fetch(`${endpoint}/${formToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Form Deleted",
          description: "Address form has been successfully deleted.",
        });
        fetchForms(pagination?.currentPage || 1);
      } else {
        const data = await response.json();
        toast({
          title: "Delete Failed",
          description: data.error || "Failed to delete the form.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Network error while deleting the form.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const toggleRowExpansion = (formId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(formId)) {
      newExpandedRows.delete(formId);
    } else {
      newExpandedRows.add(formId);
      // Fetch orders when expanding a row
      fetchOrdersForForm(formId);
    }
    setExpandedRows(newExpandedRows);
  };

  const fetchOrdersForForm = async (formId: string) => {
    if (orders[formId] || loadingOrders.has(formId)) return;
    
    setLoadingOrders(prev => new Set(prev).add(formId));
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      
      const response = await fetch(`/api/orders?bookingId=${formId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => ({
          ...prev,
          [formId]: data.data.orders || []
        }));
      }
    } catch (error) {
      console.error('Error fetching orders for form:', error);
    } finally {
      setLoadingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(formId);
        return newSet;
      });
    }
  };

  const handleFormUpdate = () => {
    setIsEditModalOpen(false);
    setSelectedForm(null);
    fetchForms(pagination?.currentPage || 1);
  };

  const exportData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const officeToken = localStorage.getItem('officeToken');
      const token = adminToken || officeToken;
      const endpoint = adminToken ? '/api/admin/addressforms' : '/api/office/addressforms';
      
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (completedFilter !== 'all') params.append('completed', completedFilter);
      if (stateFilter) params.append('state', stateFilter);
      
      const response = await fetch(`${endpoint}?${params}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, 'address_forms_export.csv');
        
        toast({
          title: "Export Successful",
          description: `${data.data.length} forms exported to CSV.`,
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

  const convertToCSV = (data: AddressForm[]) => {
    if (data.length === 0) return '';
    
    const headers = [
      'ID', 'Sender Name', 'Sender Email', 'Sender Phone', 'Sender Pincode',
      'Receiver Name', 'Receiver Email', 'Receiver Phone', 'Receiver Pincode',
      'Form Completed', 'Created At', 'Updated At'
    ];
    
    const rows = data.map(form => [
      form._id,
      form.senderName || '',
      form.senderEmail || '',
      form.senderPhone || '',
      form.senderPincode || '',
      form.receiverName || '',
      form.receiverEmail || '',
      form.receiverPhone || '',
      form.receiverPincode || '',
      form.formCompleted ? 'Yes' : 'No',
      new Date(form.createdAt).toLocaleString(),
      new Date(form.updatedAt).toLocaleString()
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

  const getFormStatusBadge = (form: AddressForm) => {
    const status = form.assignmentData?.status || 'booked';
    const labelMap: Record<string, string> = {
      booked: 'Booked',
      assigned: 'Assigned',
      partially_assigned: 'Partially Assigned',
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      failed: 'Failed',
      received: 'Received'
    };
    const styleMap: Record<string, string> = {
      booked: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      partially_assigned: 'bg-blue-50 text-blue-700',
      picked_up: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-amber-100 text-amber-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      received: 'bg-green-100 text-green-800'
    };
    return (
      <Badge variant="default" className={styleMap[status]}>
        {labelMap[status] || status}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      assigned: { color: 'bg-blue-100 text-blue-800', icon: Package },
      in_transit: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800' },
      normal: { color: 'bg-blue-100 text-blue-800' },
      high: { color: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

    return (
      <Badge className={`${config.color} border-0`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Address Forms Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {pagination && `${pagination.totalCount} total forms`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchForms(1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
                  placeholder="Search by name, email, phone, or pincode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={completedFilter} onValueChange={setCompletedFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                <SelectItem value="true">Completed</SelectItem>
                <SelectItem value="false">Incomplete</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Filter by state..."
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
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
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Consignment</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading forms...
                    </TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No address forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <React.Fragment key={form._id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(form._id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(form._id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{form.senderName}</p>
                            <p className="text-sm text-gray-500">{form.senderEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{form.senderPhone}</p>
                            <p className="text-sm text-gray-500">{form.senderPincode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{form.senderCity}</p>
                            <p className="text-sm text-gray-500">{form.senderState}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {form.consignmentNumber ? (
                              <Badge variant='outline'>#{String(form.consignmentNumber)}</Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {form.receiverName ? (
                            <div>
                              <p className="text-sm">{form.receiverName}</p>
                              <p className="text-sm text-gray-500">{form.receiverPhone}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getFormStatusBadge(form)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(form)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(form)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {expandedRows.has(form._id) && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sender Details */}
                                <div>
                                  <h4 className="font-semibold mb-2">Sender Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {form.senderName}</p>
                                    <p><span className="font-medium">Email:</span> {form.senderEmail}</p>
                                    <p><span className="font-medium">Phone:</span> {form.senderPhone}</p>
                                    <p><span className="font-medium">Address:</span> {form.senderAddressLine1}</p>
                                    {form.senderAddressLine2 && (
                                      <p className="ml-16">{form.senderAddressLine2}</p>
                                    )}
                                    <p><span className="font-medium">Area:</span> {form.senderArea}</p>
                                    <p><span className="font-medium">City:</span> {form.senderCity}</p>
                                    <p><span className="font-medium">District:</span> {form.senderDistrict}</p>
                                    <p><span className="font-medium">State:</span> {form.senderState}</p>
                                    <p><span className="font-medium">Pincode:</span> {form.senderPincode}</p>
                                    {form.senderLandmark && (
                                      <p><span className="font-medium">Landmark:</span> {form.senderLandmark}</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Receiver Details */}
                                <div>
                                  <h4 className="font-semibold mb-2">Receiver Details</h4>
                                  {form.receiverName ? (
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Name:</span> {form.receiverName}</p>
                                      <p><span className="font-medium">Email:</span> {form.receiverEmail}</p>
                                      <p><span className="font-medium">Phone:</span> {form.receiverPhone}</p>
                                      <p><span className="font-medium">Address:</span> {form.receiverAddressLine1}</p>
                                      {form.receiverAddressLine2 && (
                                        <p className="ml-16">{form.receiverAddressLine2}</p>
                                      )}
                                      <p><span className="font-medium">Area:</span> {form.receiverArea}</p>
                                      <p><span className="font-medium">City:</span> {form.receiverCity}</p>
                                      <p><span className="font-medium">District:</span> {form.receiverDistrict}</p>
                                      <p><span className="font-medium">State:</span> {form.receiverState}</p>
                                      <p><span className="font-medium">Pincode:</span> {form.receiverPincode}</p>
                                      {form.receiverLandmark && (
                                        <p><span className="font-medium">Landmark:</span> {form.receiverLandmark}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm">Receiver details not provided</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Complete Booking Data */}
                              {(form.originData || form.destinationData || form.shipmentData || form.uploadData || form.paymentData || form.billData || form.detailsData) && (
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-3">📦 Complete Booking Information</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    
                                    {/* Origin Data */}
                                    {form.originData && (
                                      <div className="bg-blue-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-blue-800 mb-2">📍 Origin</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Name:</span> {form.originData.name}</div>
                                          <div><span className="font-medium">Phone:</span> {form.originData.mobileNumber}</div>
                                          <div><span className="font-medium">City:</span> {form.originData.city}</div>
                                          <div><span className="font-medium">State:</span> {form.originData.state}</div>
                                          {form.originData.gstNumber && <div><span className="font-medium">GST:</span> {form.originData.gstNumber}</div>}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Destination Data */}
                                    {form.destinationData && (
                                      <div className="bg-green-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-green-800 mb-2">🎯 Destination</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Name:</span> {form.destinationData.name}</div>
                                          <div><span className="font-medium">Phone:</span> {form.destinationData.mobileNumber}</div>
                                          <div><span className="font-medium">City:</span> {form.destinationData.city}</div>
                                          <div><span className="font-medium">State:</span> {form.destinationData.state}</div>
                                          {form.destinationData.gstNumber && <div><span className="font-medium">GST:</span> {form.destinationData.gstNumber}</div>}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Shipment Data */}
                                    {form.shipmentData && (
                                      <div className="bg-orange-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-orange-800 mb-2">📦 Shipment</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Type:</span> {form.shipmentData.natureOfConsignment}</div>
                                          <div><span className="font-medium">Service:</span> {form.shipmentData.services}</div>
                                          <div><span className="font-medium">Mode:</span> {form.shipmentData.mode}</div>
                                          <div><span className="font-medium">Weight:</span> {form.shipmentData.actualWeight} kg</div>
                                          <div><span className="font-medium">Packages:</span> {form.shipmentData.totalPackages}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Upload Data */}
                                    {form.uploadData && (
                                      <div className="bg-purple-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-purple-800 mb-2">📎 Documents</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Packages:</span> {form.uploadData.totalPackages}</div>
                                          <div><span className="font-medium">Content:</span> {form.uploadData.contentDescription}</div>
                                          {form.consignmentNumber && <div><span className="font-medium">Consignment:</span> {form.consignmentNumber}</div>}
                                          {form.uploadData.invoiceValue && <div><span className="font-medium">Value:</span> ₹{form.uploadData.invoiceValue}</div>}
                                          {form.uploadData.eWaybillNumber && <div><span className="font-medium">eWaybill:</span> {form.uploadData.eWaybillNumber}</div>}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Payment Data */}
                                    {form.paymentData && (
                                      <div className="bg-yellow-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-yellow-800 mb-2">💳 Payment</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Mode:</span> {form.paymentData.mode}</div>
                                          {form.paymentData.deliveryType && <div><span className="font-medium">Delivery:</span> {form.paymentData.deliveryType}</div>}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Bill Data */}
                                    {form.billData && (
                                      <div className="bg-indigo-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-indigo-800 mb-2">🧾 Billing</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Party:</span> {form.billData.partyType}</div>
                                          {form.billData.billType && <div><span className="font-medium">Type:</span> {form.billData.billType}</div>}
                                          {form.billData.otherPartyDetails && (
                                      <div>
                                              <div><span className="font-medium">Company:</span> {form.billData.otherPartyDetails.concernName}</div>
                                              {form.billData.otherPartyDetails.gstNumber && <div><span className="font-medium">GST:</span> {form.billData.otherPartyDetails.gstNumber}</div>}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Details Data */}
                                    {form.detailsData && (
                                      <div className="bg-red-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-red-800 mb-2">💰 Charges</h5>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Freight:</span> ₹{form.detailsData.freightCharge}</div>
                                          <div><span className="font-medium">AWB:</span> ₹{form.detailsData.awbCharge}</div>
                                          <div><span className="font-medium">Collection:</span> ₹{form.detailsData.localCollection}</div>
                                          <div><span className="font-medium">Door Delivery:</span> ₹{form.detailsData.doorDelivery}</div>
                                          <div><span className="font-medium">Loading:</span> ₹{form.detailsData.loadingUnloading}</div>
                                          {form.detailsData.grandTotal && <div><span className="font-medium">Total:</span> ₹{form.detailsData.grandTotal}</div>}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Orders Section */}
                              <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Associated Orders
                                  </h4>
                                  {loadingOrders.has(form._id) && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
                                  )}
                                </div>
                                
                                {orders[form._id] ? (
                                  orders[form._id].length > 0 ? (
                                    <div className="space-y-3">
                                      {orders[form._id].map((order) => (
                                        <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                              <div className="font-medium text-lg">{order.orderNumber}</div>
                                              {getStatusBadge(order.status)}
                                              {getPriorityBadge(order.priority)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              Created: {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                              <div className="text-sm font-medium text-gray-600 mb-1">Origin</div>
                                              <div className="text-sm">
                                                {order.origin.name} - {order.origin.address.city}, {order.origin.address.pincode}
                                              </div>
                                            </div>
                                            <div>
                                              <div className="text-sm font-medium text-gray-600 mb-1">Destination</div>
                                              <div className="text-sm">
                                                {order.destination.name} - {order.destination.address.city}, {order.destination.address.pincode}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="mb-3">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Current Location</div>
                                            <div className="flex items-center gap-2 text-sm">
                                              <MapPin className="h-4 w-4 text-gray-500" />
                                              {order.currentLocation.city}, {order.currentLocation.pincode}
                                              <span className="text-gray-500">
                                                (Updated: {new Date(order.currentLocation.lastUpdated).toLocaleString()})
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {order.assignments.length > 0 && (
                                            <div>
                                              <div className="text-sm font-medium text-gray-600 mb-2">Assignments</div>
                                              <div className="space-y-2">
                                                {order.assignments.map((assignment) => (
                                                  <div key={assignment._id} className="bg-gray-50 rounded p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                          {assignment.type === 'coloader' ? 'Coloader' : 'Courier Boy'}
                                                        </Badge>
                                                        <span className="font-medium text-sm">{assignment.assignedTo.name}</span>
                                                        {assignment.assignedTo.companyName && (
                                                          <span className="text-xs text-gray-500">
                                                            ({assignment.assignedTo.companyName})
                                                          </span>
                                                        )}
                                                      </div>
                                                      {getStatusBadge(assignment.status)}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div>
                                                        <span className="text-gray-600">From:</span> {assignment.fromLocation.city}, {assignment.fromLocation.pincode}
                                                      </div>
                                                      <div>
                                                        <span className="text-gray-600">To:</span> {assignment.toLocation.city}, {assignment.toLocation.pincode}
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                                                      {assignment.deliveredAt && (
                                                        <span className="ml-2">
                                                          Delivered: {new Date(assignment.deliveredAt).toLocaleString()}
                                                        </span>
                                                      )}
                                                    </div>
                                                    
                                                    {assignment.notes && (
                                                      <div className="text-xs text-gray-600 mt-1">
                                                        <span className="font-medium">Notes:</span> {assignment.notes}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {order.deliveryStatus.isDelivered && (
                                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                                              <div className="flex items-center gap-2 text-green-800">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="font-medium">Order Delivered</span>
                                              </div>
                                              <div className="text-sm text-green-700 mt-1">
                                                Delivered on: {new Date(order.deliveryStatus.deliveredAt!).toLocaleString()}
                                                {order.deliveryStatus.deliveryNotes && (
                                                  <div className="mt-1">
                                                    Notes: {order.deliveryStatus.deliveryNotes}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                      <p>No orders found for this booking</p>
                                      <p className="text-sm">Orders are automatically created when bookings are completed</p>
                                    </div>
                                  )
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-gray-400" />
                                    <p>Loading orders...</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500 border-t pt-2">
                                <p>Created: {new Date(form.createdAt).toLocaleString()}</p>
                                <p>Updated: {new Date(form.updatedAt).toLocaleString()}</p>
                                <p>ID: {form._id}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
                ({pagination.totalCount} total forms)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => fetchForms(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => fetchForms(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedForm && (
        <AddressFormEditModal
          form={selectedForm}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedForm(null);
          }}
          onUpdate={handleFormUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the form for "{formToDelete?.senderName}"?
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

export default AddressFormsTable;
