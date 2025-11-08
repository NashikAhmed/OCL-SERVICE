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
  Eye, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourierBoy {
  _id: string;
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  locality: string;
  building: string;
  landmark: string;
  pincode: string;
  area: string;
  aadharCard: string;
  aadharCardUrl: string;
  panCard: string;
  panCardUrl: string;
  vehicleType: string;
  licenseNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  registrationDate: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const CourierBoyManagement = () => {
  const [courierBoys, setCourierBoys] = useState<CourierBoy[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCourierBoy, setSelectedCourierBoy] = useState<CourierBoy | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCourierBoys();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchCourierBoys = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/courier-boy?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCourierBoys(data.courierBoys);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch courier boys');
      }
    } catch (error) {
      console.error('Error fetching courier boys:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch courier boys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (courierBoy: CourierBoy) => {
    setSelectedCourierBoy(courierBoy);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedCourierBoy) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/courier-boy/${selectedCourierBoy._id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Courier boy approved successfully",
        });
        
        // Update the courier boy in the list
        setCourierBoys(prev => 
          prev.map(cb => 
            cb._id === selectedCourierBoy._id 
              ? { ...cb, status: 'approved', isVerified: true, lastUpdated: data.courierBoy.lastUpdated }
              : cb
          )
        );
        
        setIsApproveDialogOpen(false);
        setSelectedCourierBoy(null);
      } else {
        throw new Error(data.error || 'Failed to approve courier boy');
      }
    } catch (error) {
      console.error('Error approving courier boy:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve courier boy",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourierBoy) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/courier-boy/${selectedCourierBoy._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Courier boy rejected",
        });
        
        // Update the courier boy in the list
        setCourierBoys(prev => 
          prev.map(cb => 
            cb._id === selectedCourierBoy._id 
              ? { ...cb, status: 'rejected', isVerified: false, lastUpdated: data.courierBoy.lastUpdated }
              : cb
          )
        );
        
        setIsRejectDialogOpen(false);
        setSelectedCourierBoy(null);
      } else {
        throw new Error(data.error || 'Failed to reject courier boy');
      }
    } catch (error) {
      console.error('Error rejecting courier boy:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject courier boy",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontWeight: '500', fontSize: '32px', color:'black' }} className="admin-heading text-gray-800">Courier Boy Management</h2>
        <p className="text-gray-600">Manage courier boy registrations and approvals</p>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={fetchCourierBoys} 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Courier Boys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Courier Boys ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading courier boys...
            </div>
          ) : courierBoys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No courier boys found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courierBoys.map((courierBoy) => (
                    <TableRow key={courierBoy._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{courierBoy.fullName}</div>
                          <div className="text-sm text-gray-500">{courierBoy.designation}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {courierBoy.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {courierBoy.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {courierBoy.area}
                          </div>
                          <div className="text-xs text-gray-500">
                            {courierBoy.pincode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{courierBoy.vehicleType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(courierBoy.status, courierBoy.isVerified)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(courierBoy.registrationDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(courierBoy)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {courierBoy.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedCourierBoy(courierBoy);
                                  setIsApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedCourierBoy(courierBoy);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Courier Boy Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the courier boy registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourierBoy && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm">{selectedCourierBoy.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Designation</label>
                      <p className="text-sm">{selectedCourierBoy.designation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{selectedCourierBoy.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{selectedCourierBoy.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Locality</label>
                      <p className="text-sm">{selectedCourierBoy.locality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Building</label>
                      <p className="text-sm">{selectedCourierBoy.building}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Landmark</label>
                      <p className="text-sm">{selectedCourierBoy.landmark || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pincode</label>
                      <p className="text-sm">{selectedCourierBoy.pincode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Area</label>
                      <p className="text-sm">{selectedCourierBoy.area}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                    <p className="text-sm">{selectedCourierBoy.vehicleType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-sm">{selectedCourierBoy.licenseNumber}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Aadhar Card</label>
                    <div className="mt-2">
                      <a 
                        href={selectedCourierBoy.aadharCardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        View Aadhar Card
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">PAN Card</label>
                    <div className="mt-2">
                      <a 
                        href={selectedCourierBoy.panCardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        View PAN Card
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedCourierBoy.status, selectedCourierBoy.isVerified)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registration Date</label>
                    <p className="text-sm">{formatDate(selectedCourierBoy.registrationDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm">{formatDate(selectedCourierBoy.lastUpdated)}</p>
                  </div>
                </div>
              </div>
      </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Courier Boy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedCourierBoy?.fullName}? This action will mark them as verified and approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Courier Boy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedCourierBoy?.fullName}? This action will mark them as rejected and unverified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourierBoyManagement;