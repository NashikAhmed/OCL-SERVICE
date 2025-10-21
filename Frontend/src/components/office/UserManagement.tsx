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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Edit, 
  RefreshCw,
  Plus,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OfficeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  loginCount: number;
  permissions: {
    dashboard: boolean;
    booking: boolean;
    reports: boolean;
    settings: boolean;
    pincodeManagement: boolean;
    addressForms: boolean;
    coloaderRegistration: boolean;
    coloaderManagement: boolean;
    corporateRegistration: boolean;
    corporateManagement: boolean;
    corporatePricing: boolean;
    corporateApproval: boolean;
    employeeRegistration: boolean;
    employeeManagement: boolean;
    consignmentManagement: boolean;
    courierRequests: boolean;
    invoiceManagement: boolean;
    userManagement: boolean;
    baggingManagement: boolean;
    receivedOrders: boolean;
    manageOrders: boolean;
  };
  department?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<OfficeUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<OfficeUser | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<OfficeUser | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    officeUserId: '',
    startNumber: '',
    endNumber: '',
    notes: '',
    quantity: 100
  });
  const [highestNumber, setHighestNumber] = useState<number>(871026571);
  const [permissions, setPermissions] = useState({
    dashboard: true,
    booking: true,
    reports: true,
    settings: true,
    pincodeManagement: false,
    addressForms: false,
    coloaderRegistration: false,
    coloaderManagement: false,
    corporateRegistration: false,
    corporateManagement: false,
    corporatePricing: false,
    corporateApproval: false,
    employeeRegistration: false,
    employeeManagement: false,
    consignmentManagement: false,
    courierRequests: false,
    invoiceManagement: false,
    userManagement: false,
    baggingManagement: false,
    receivedOrders: false,
    manageOrders: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchHighestNumber();
  }, [searchTerm, statusFilter]);

  // Fetch highest consignment number
  const fetchHighestNumber = async () => {
    try {
      const token = localStorage.getItem('officeToken');
      const response = await fetch('/api/office/consignment/highest', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHighestNumber(data.data.highestNumber);
        setAssignmentForm(prev => ({
          ...prev,
          startNumber: data.data.nextStartNumber.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching highest number:', error);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('officeToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      // Use office API endpoint for fetching users
      const response = await fetch(`/api/office/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setPagination(data.pagination);
        setError('');
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('officeToken');
        localStorage.removeItem('officeUser');
        window.location.href = '/office';
        return;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error while loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPermissions = (user: OfficeUser) => {
    setSelectedUser(user);
    // Ensure the new permission fields exist when editing
    const userPermissions = {
      ...user.permissions,
      coloaderRegistration: user.permissions.coloaderRegistration !== undefined ? user.permissions.coloaderRegistration : false,
      userManagement: user.permissions.userManagement !== undefined ? user.permissions.userManagement : false,
      baggingManagement: user.permissions.baggingManagement !== undefined ? user.permissions.baggingManagement : false,
      receivedOrders: user.permissions.receivedOrders !== undefined ? user.permissions.receivedOrders : false,
      manageOrders: user.permissions.manageOrders !== undefined ? user.permissions.manageOrders : false
    };
    setPermissions(userPermissions);
    setIsPermissionsModalOpen(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('officeToken');
      
      // Use office API endpoint for permission updates
      const response = await fetch(`/api/office/users/${selectedUser._id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Permissions Updated",
          description: `Permissions for ${selectedUser.name} have been updated successfully.`,
        });
        
        // Update the user in the list
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, permissions: data.data.permissions }
            : user
        ));
        
        // Update localStorage if the updated user is the current user
        const currentUser = localStorage.getItem('officeUser');
        if (currentUser) {
          try {
            const currentUserData = JSON.parse(currentUser);
            if (currentUserData.id === selectedUser._id) {
              currentUserData.permissions = data.data.permissions;
              localStorage.setItem('officeUser', JSON.stringify(currentUserData));
              // Dispatch custom event to notify other components
              console.log('🚀 Dispatching officeUserPermissionsUpdated event for user:', selectedUser._id);
              window.dispatchEvent(new CustomEvent('officeUserPermissionsUpdated'));
              // Also dispatch a more specific event
              console.log('🚀 Dispatching permissionsUpdated event for user:', selectedUser._id);
              window.dispatchEvent(new CustomEvent('permissionsUpdated', { 
                detail: { userId: selectedUser._id, source: 'office' } 
              }));
              
              // Also call the global refresh function as a fallback
              if ((window as any).refreshOfficePermissions) {
                console.log('🚀 Calling global refresh function');
                (window as any).refreshOfficePermissions();
              }
            }
          } catch (error) {
            console.error('Error updating current user permissions in localStorage:', error);
          }
        }
        
        // Also update admin user localStorage if this user is also an admin
        const currentAdminUser = localStorage.getItem('adminUser');
        if (currentAdminUser) {
          try {
            const currentAdminUserData = JSON.parse(currentAdminUser);
            if (currentAdminUserData.id === selectedUser._id) {
              currentAdminUserData.permissions = data.data.permissions;
              localStorage.setItem('adminUser', JSON.stringify(currentAdminUserData));
              // Dispatch custom event to notify admin components
              window.dispatchEvent(new CustomEvent('adminUserPermissionsUpdated'));
            }
          } catch (error) {
            console.error('Error updating current admin user permissions in localStorage:', error);
          }
        }
        
        setIsPermissionsModalOpen(false);
        setSelectedUser(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Update Failed",
          description: errorData.error || 'Failed to update permissions',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Update Failed",
        description: 'Network error while updating permissions',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle assignment button click
  const handleAssignClick = (user: OfficeUser) => {
    setSelectedUserForAssignment(user);
    setAssignmentForm(prev => ({
      ...prev,
      officeUserId: user._id,
      startNumber: (highestNumber + 1).toString(),
      endNumber: (highestNumber + prev.quantity).toString()
    }));
    setShowAssignDialog(true);
  };

  // Handle quantity change and update end number
  const handleQuantityChange = (quantity: number) => {
    const startNum = parseInt(assignmentForm.startNumber) || highestNumber + 1;
    const endNum = startNum + quantity - 1;
    setAssignmentForm(prev => ({
      ...prev,
      quantity: quantity,
      endNumber: endNum.toString()
    }));
  };

  // Assign consignment numbers
  const handleAssign = async () => {
    const { officeUserId, startNumber, endNumber } = assignmentForm;
    
    if (!officeUserId) {
      toast({
        title: "Error",
        description: "Please select an office user",
        variant: "destructive",
      });
      return;
    }
    
    if (!startNumber || !endNumber) {
      toast({
        title: "Error",
        description: "Please fill in start and end numbers",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('officeToken');
      
      const response = await fetch('/api/office/consignment/assign-office-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          officeUserId, 
          startNumber: parseInt(startNumber), 
          endNumber: parseInt(endNumber), 
          notes: assignmentForm.notes 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        setShowAssignDialog(false);
        setAssignmentForm({
          officeUserId: '',
          startNumber: '',
          endNumber: '',
          notes: '',
          quantity: 100
        });
        fetchHighestNumber(); // Update the highest number after assignment
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign consignment numbers');
      }
    } catch (error) {
      console.error('Error assigning consignment numbers:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign consignment numbers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Office users can only manage permissions, not delete users or change status

  const getPermissionBadges = (permissions: OfficeUser['permissions']) => {
    const badges = [];
    if (permissions.pincodeManagement) badges.push('Pincode Management');
    if (permissions.addressForms) badges.push('Address Forms');
    if (permissions.coloaderRegistration) badges.push('Coloader Registration');
    if (permissions.coloaderManagement) badges.push('Coloader Management');
    if (permissions.corporateRegistration) badges.push('Corporate Registration');
    if (permissions.corporateManagement) badges.push('Corporate Management');
    if (permissions.corporatePricing) badges.push('Corporate Pricing');
    if (permissions.corporateApproval) badges.push('Corporate Approval');
    if (permissions.employeeRegistration) badges.push('Employee Registration');
    if (permissions.employeeManagement) badges.push('Employee Management');
    if (permissions.consignmentManagement) badges.push('Assign Consignment');
    if (permissions.courierRequests) badges.push('Courier Requests');
    if (permissions.invoiceManagement) badges.push('Invoice Management');
    if (permissions.userManagement) badges.push('User Management');
    if (permissions.baggingManagement) badges.push('Bagging Management');
    if (permissions.receivedOrders) badges.push('Received Consignments');
    if (permissions.manageOrders) badges.push('Assign Coloaders');
    return badges;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Office User Management</h2>
          <p className="text-gray-600">Manage office users and their permissions</p>
        </div>
        <Button onClick={() => fetchUsers()} disabled={isLoading}>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.department && (
                            <div className="text-xs text-gray-400">{user.department}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'office_manager' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getPermissionBadges(user.permissions).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {getPermissionBadges(user.permissions).length === 0 && (
                            <span className="text-xs text-gray-400">Basic access only</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-sm">
                            {new Date(user.lastLogin).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {user.loginCount} logins
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPermissions(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignClick(user)}
                            className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-md flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
            onClick={() => fetchUsers(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchUsers(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Permissions Modal */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Pincode Management</label>
                <input
                  type="checkbox"
                  checked={permissions.pincodeManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    pincodeManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Address Forms</label>
                <input
                  type="checkbox"
                  checked={permissions.addressForms}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    addressForms: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Coloader Registration</label>
                <input
                  type="checkbox"
                  checked={permissions.coloaderRegistration}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    coloaderRegistration: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Coloader Management</label>
                <input
                  type="checkbox"
                  checked={permissions.coloaderManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    coloaderManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Corporate Registration</label>
                <input
                  type="checkbox"
                  checked={permissions.corporateRegistration}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    corporateRegistration: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Corporate Management</label>
                <input
                  type="checkbox"
                  checked={permissions.corporateManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    corporateManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Corporate Pricing</label>
                <input
                  type="checkbox"
                  checked={permissions.corporatePricing}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    corporatePricing: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Corporate Approval</label>
                <input
                  type="checkbox"
                  checked={permissions.corporateApproval}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    corporateApproval: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Employee Registration</label>
                <input
                  type="checkbox"
                  checked={permissions.employeeRegistration}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    employeeRegistration: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Employee Management</label>
                <input
                  type="checkbox"
                  checked={permissions.employeeManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    employeeManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Assign Consignment</label>
                <input
                  type="checkbox"
                  checked={permissions.consignmentManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    consignmentManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Courier Requests</label>
                <input
                  type="checkbox"
                  checked={permissions.courierRequests}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    courierRequests: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Invoice Management</label>
                <input
                  type="checkbox"
                  checked={permissions.invoiceManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    invoiceManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">User Management</label>
                <input
                  type="checkbox"
                  checked={permissions.userManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    userManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Bagging Management</label>
                <input
                  type="checkbox"
                  checked={permissions.baggingManagement}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    baggingManagement: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Received Consignments</label>
                <input
                  type="checkbox"
                  checked={permissions.receivedOrders}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    receivedOrders: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Assign Coloaders</label>
                <input
                  type="checkbox"
                  checked={permissions.manageOrders}
                  onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    manageOrders: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Consignment Numbers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Office User Selection */}
            {selectedUserForAssignment ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">{selectedUserForAssignment.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedUserForAssignment.email} • {selectedUserForAssignment.role}
                </div>
              </div>
            ) : null}
            
            <div className="space-y-2">
              <label htmlFor="startNumber" className="text-sm font-medium">Start Number (Auto-filled)</label>
              <input
                id="startNumber"
                value={assignmentForm.startNumber}
                onChange={(e) => {
                  const startNum = parseInt(e.target.value) || highestNumber + 1;
                  const endNum = startNum + assignmentForm.quantity - 1;
                  setAssignmentForm(prev => ({ 
                    ...prev, 
                    startNumber: e.target.value,
                    endNumber: endNum.toString()
                  }));
                }}
                placeholder="871026572"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Last highest number: {highestNumber}
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">Number of Consignments</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((qty) => (
                  <Button
                    key={qty}
                    type="button"
                    variant={assignmentForm.quantity === qty ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuantityChange(qty)}
                    className="text-xs"
                  >
                    {qty}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={assignmentForm.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 100)}
                  min="1"
                  max="10000"
                  className="w-20 p-2 border border-gray-300 rounded-md"
                />
                <span className="text-sm text-gray-500">numbers</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endNumber" className="text-sm font-medium">End Number (Auto-calculated)</label>
              <input
                id="endNumber"
                value={assignmentForm.endNumber}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Range: {assignmentForm.startNumber} - {assignmentForm.endNumber} ({assignmentForm.quantity} numbers)
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                id="notes"
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this assignment..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={isLoading}>
                {isLoading ? 'Assigning...' : 'Assign Numbers'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UserManagement;
