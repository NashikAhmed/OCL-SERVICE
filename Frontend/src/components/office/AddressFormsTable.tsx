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
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  consignmentNumber?: number;
  assignmentData?: {
    status?: 'booked' | 'assigned' | 'partially_assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'received';
  };
  // New booking data fields
  originData?: any;
  destinationData?: any;
  shipmentData?: any;
  uploadData?: any;
  paymentData?: any;
  billData?: any;
  detailsData?: any;
  [key: string]: any;
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  const { toast } = useToast();

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('officeToken');
      if (!token) return;

      const response = await fetch('/api/office/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('officeUser', JSON.stringify(userData.user));
        setHasPermission(userData.user.permissions?.addressForms || false);
      } else if (response.status === 401) {
        // Token expired
        localStorage.removeItem('officeToken');
        localStorage.removeItem('officeUser');
        window.location.href = '/office';
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Check user permissions on component mount
  useEffect(() => {
    const checkPermissions = () => {
      const userData = localStorage.getItem('officeUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setHasPermission(user.permissions?.addressForms || false);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setHasPermission(false);
        }
      } else {
        setHasPermission(false);
      }
    };
    
    checkPermissions();
  }, []);

  useEffect(() => {
    fetchForms();
  }, [searchTerm, completedFilter, stateFilter]);

  // Refresh when order status changes elsewhere (e.g., Admin Received Consignments)
  useEffect(() => {
    const onOrderStatusChanged = () => fetchForms();
    window.addEventListener('orderStatusChanged', onOrderStatusChanged as EventListener);
    return () => window.removeEventListener('orderStatusChanged', onOrderStatusChanged as EventListener);
  }, []);

  const fetchForms = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('officeToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(completedFilter !== 'all' && { completed: completedFilter }),
        ...(stateFilter && { state: stateFilter })
      });

      const response = await fetch(`/api/office/addressforms?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data);
        setPagination(data.pagination);
        setError('');
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('officeToken');
        localStorage.removeItem('officeUser');
        window.location.href = '/office';
        return;
      } else if (response.status === 403) {
        setHasPermission(false);
        setError('You do not have permission to view address forms. Please contact your administrator.');
        // Refresh user data to get latest permissions
        await refreshUserData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load address forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError('Network error while loading address forms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewForm = (form: AddressForm) => {
    setSelectedForm(form);
    setIsViewModalOpen(true);
  };

  const toggleRowExpansion = (formId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(formId)) {
      newExpandedRows.delete(formId);
    } else {
      newExpandedRows.add(formId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (form: AddressForm) => {
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
    return <Badge variant="default" className={styleMap[status]}>{labelMap[status] || status}</Badge>;
  };

  // If user doesn't have permission, don't render the component
  if (!hasPermission) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Address Forms</h2>
          <p className="text-gray-600">View and manage customer address forms</p>
        </div>
        <Button onClick={() => fetchForms()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={completedFilter} onValueChange={setCompletedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
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
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Forms Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading forms...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <React.Fragment key={form._id}>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-semibold">{form.senderName}</div>
                            <div className="text-sm text-gray-500">{form.senderEmail}</div>
                            <div className="text-xs text-gray-400">{form.senderPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {form.receiverName ? (
                            <div>
                              <div className="font-semibold">{form.receiverName}</div>
                              <div className="text-sm text-gray-500">{form.receiverEmail}</div>
                              <div className="text-xs text-gray-400">{form.receiverPhone}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(form)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(form.createdAt).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {new Date(form.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewForm(form)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRowExpansion(form._id)}
                            >
                              {expandedRows.has(form._id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(form._id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Sender Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Pincode:</span> {form.senderPincode}</div>
                                    {form.senderState && <div><span className="font-medium">State:</span> {form.senderState}</div>}
                                    {form.senderCity && <div><span className="font-medium">City:</span> {form.senderCity}</div>}
                                  </div>
                                </div>
                                {form.receiverName && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Receiver Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><span className="font-medium">Pincode:</span> {form.receiverPincode}</div>
                                      {form.receiverState && <div><span className="font-medium">State:</span> {form.receiverState}</div>}
                                      {form.receiverCity && <div><span className="font-medium">City:</span> {form.receiverCity}</div>}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* New Booking Data Section */}
                              {(form.originData || form.destinationData || form.shipmentData || form.uploadData || form.paymentData || form.billData || form.detailsData) && (
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold text-sm text-gray-700 mb-3">📦 Complete Booking Information</h4>
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
                                          {form.detailsData.grandTotal && <div><span className="font-medium">Total:</span> ₹{form.detailsData.grandTotal}</div>}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => fetchForms(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchForms(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Form Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedForm?.senderName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">Sender Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedForm.senderName}</div>
                    <div><span className="font-medium">Email:</span> {selectedForm.senderEmail}</div>
                    <div><span className="font-medium">Phone:</span> {selectedForm.senderPhone}</div>
                    <div><span className="font-medium">Pincode:</span> {selectedForm.senderPincode}</div>
                    {selectedForm.senderState && <div><span className="font-medium">State:</span> {selectedForm.senderState}</div>}
                    {selectedForm.senderCity && <div><span className="font-medium">City:</span> {selectedForm.senderCity}</div>}
                  </div>
                </div>
                
                {selectedForm.receiverName && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Receiver Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedForm.receiverName}</div>
                      <div><span className="font-medium">Email:</span> {selectedForm.receiverEmail}</div>
                      <div><span className="font-medium">Phone:</span> {selectedForm.receiverPhone}</div>
                      <div><span className="font-medium">Pincode:</span> {selectedForm.receiverPincode}</div>
                      {selectedForm.receiverState && <div><span className="font-medium">State:</span> {selectedForm.receiverState}</div>}
                      {selectedForm.receiverCity && <div><span className="font-medium">City:</span> {selectedForm.receiverCity}</div>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Form Status:</span>
                    {getCompletionBadge(selectedForm)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(selectedForm.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressFormsTable;
