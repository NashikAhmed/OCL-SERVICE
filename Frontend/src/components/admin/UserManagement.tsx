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
  RefreshCw,
  Filter,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OfficeUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/consignment/highest', {
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
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/admin';
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
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/users/${selectedUser._id}/permissions`, {
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
        const currentAdminUser = localStorage.getItem('adminUser');
        if (currentAdminUser) {
          try {
            const currentAdminUserData = JSON.parse(currentAdminUser);
            if (currentAdminUserData.id === selectedUser._id) {
              currentAdminUserData.permissions = data.data.permissions;
              localStorage.setItem('adminUser', JSON.stringify(currentAdminUserData));
              // Dispatch custom event to notify other components
              window.dispatchEvent(new CustomEvent('userPermissionsUpdated'));
            }
          } catch (error) {
            console.error('Error updating current admin user permissions in localStorage:', error);
          }
        }

        // Also update office user localStorage if the updated user is currently logged in as office user
        const currentOfficeUser = localStorage.getItem('officeUser');
        if (currentOfficeUser) {
          try {
            const currentOfficeUserData = JSON.parse(currentOfficeUser);
            if (currentOfficeUserData.id === selectedUser._id) {
              currentOfficeUserData.permissions = data.data.permissions;
              localStorage.setItem('officeUser', JSON.stringify(currentOfficeUserData));
              // Dispatch custom event to notify office dashboard components
              console.log('🚀 Dispatching officeUserPermissionsUpdated event for user:', selectedUser._id);
              window.dispatchEvent(new CustomEvent('officeUserPermissionsUpdated'));
              // Also dispatch a more specific event
              console.log('🚀 Dispatching permissionsUpdated event for user:', selectedUser._id);
              window.dispatchEvent(new CustomEvent('permissionsUpdated', { 
                detail: { userId: selectedUser._id, source: 'admin' } 
              }));
              
              // Also call the global refresh function as a fallback
              if ((window as any).refreshOfficePermissions) {
                console.log('🚀 Calling global refresh function');
                (window as any).refreshOfficePermissions();
              }
            }
          } catch (error) {
            console.error('Error updating current office user permissions in localStorage:', error);
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

  const handleToggleStatus = async (user: OfficeUser) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/users/${user._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Status Updated",
          description: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}.`,
        });
        
        // Update the user in the list
        setUsers(users.map(u => 
          u._id === user._id 
            ? { ...u, isActive: !u.isActive }
            : u
        ));
      } else {
        const errorData = await response.json();
        toast({
          title: "Update Failed",
          description: errorData.error || 'Failed to update user status',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Update Failed",
        description: 'Network error while updating user status',
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (user: OfficeUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "User Deleted",
          description: `${userToDelete.name} has been deleted successfully.`,
        });
        
        // Remove the user from the list
        setUsers(users.filter(user => user._id !== userToDelete._id));
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Delete Failed",
          description: errorData.error || 'Failed to delete user',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Delete Failed",
        description: 'Network error while deleting user',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/consignment/assign-office-user', {
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
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage office users and their permissions</p>
              </div>
            </div>
            <Button 
              onClick={() => fetchUsers()} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Compact Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {users.filter(u => u.isActive).length} Active
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                {users.filter(u => !u.isActive).length} Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Users ({users.length})</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 py-3 px-4">User</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-4">Role</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-4">Status</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-4">Permissions</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-4">Last Login</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-gray-600">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserX className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-500">No users found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge 
                          variant={user.role === 'office_manager' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {getPermissionBadges(user.permissions).slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {getPermissionBadges(user.permissions).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{getPermissionBadges(user.permissions).length - 2}
                            </Badge>
                          )}
                          {getPermissionBadges(user.permissions).length === 0 && (
                            <span className="text-xs text-gray-400">Basic access</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {user.lastLogin ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{new Date(user.lastLogin).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{user.loginCount} logins</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPermissions(user)}
                            className="h-7 w-7 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            title="Edit Permissions"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className={`h-7 w-7 p-0 ${
                              user.isActive 
                                ? 'hover:bg-red-50 hover:border-red-300 hover:text-red-600' 
                                : 'hover:bg-green-50 hover:border-green-300 hover:text-green-600'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? (
                              <UserX className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignClick(user)}
                            className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-md flex items-center gap-1"
                            title="Assign Consignment Numbers"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Simple Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev || isLoading}
                  className="px-3 py-1 h-8 text-sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext || isLoading}
                  className="px-3 py-1 h-8 text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Permissions</DialogTitle>
            <DialogDescription className="text-base">
              Manage permissions for <span className="font-semibold text-blue-600">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
              {/* Pincode Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.pincodeManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  pincodeManagement: !prev.pincodeManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Pincode Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage pincode areas</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.pincodeManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address Forms */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.addressForms 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  addressForms: !prev.addressForms
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Address Forms</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage address forms</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.addressForms}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Coloader Registration */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.coloaderRegistration 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  coloaderRegistration: !prev.coloaderRegistration
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Coloader Registration</h3>
                    <p className="text-xs text-gray-500 mt-1">Register new coloaders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.coloaderRegistration}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Coloader Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.coloaderManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  coloaderManagement: !prev.coloaderManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Coloader Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage coloaders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.coloaderManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Corporate Registration */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.corporateRegistration 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  corporateRegistration: !prev.corporateRegistration
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Corporate Registration</h3>
                    <p className="text-xs text-gray-500 mt-1">Register corporate clients</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.corporateRegistration}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Corporate Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.corporateManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  corporateManagement: !prev.corporateManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Corporate Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage corporate clients</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.corporateManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Corporate Pricing */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.corporatePricing 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  corporatePricing: !prev.corporatePricing
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Corporate Pricing</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage pricing plans</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.corporatePricing}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Corporate Approval */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.corporateApproval 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  corporateApproval: !prev.corporateApproval
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Corporate Approval</h3>
                    <p className="text-xs text-gray-500 mt-1">Approve corporate requests</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.corporateApproval}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Employee Registration */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.employeeRegistration 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  employeeRegistration: !prev.employeeRegistration
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Employee Registration</h3>
                    <p className="text-xs text-gray-500 mt-1">Register new employees</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.employeeRegistration}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Employee Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.employeeManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  employeeManagement: !prev.employeeManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Employee Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage employees</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.employeeManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assign Consignment */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.consignmentManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  consignmentManagement: !prev.consignmentManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Assign Consignment</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage consignments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.consignmentManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Courier Requests */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.courierRequests 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  courierRequests: !prev.courierRequests
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Courier Requests</h3>
                    <p className="text-xs text-gray-500 mt-1">Handle courier requests</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.courierRequests}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Invoice Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.invoiceManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  invoiceManagement: !prev.invoiceManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Invoice Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage invoices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.invoiceManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bagging Management */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.baggingManagement 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  baggingManagement: !prev.baggingManagement
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Bagging Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage bagging operations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.baggingManagement}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Received Consignments */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.receivedOrders 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  receivedOrders: !prev.receivedOrders
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Received Consignments</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage received consignments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.receivedOrders}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assign Coloaders */}
              <div 
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  permissions.manageOrders 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  manageOrders: !prev.manageOrders
                }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">Assign Coloaders</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage and edit orders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.manageOrders}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete?.name}"?
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
    </div>
  );
};

export default UserManagement;
