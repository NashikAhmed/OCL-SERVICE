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
  Shield,
  ShieldCheck,
  ShieldX,
  UserPlus,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  loginCount: number;
  permissions: {
    dashboard: boolean;
    userManagement: boolean;
    pincodeManagement: boolean;
    addressForms: boolean;
    corporateRegistration: boolean;
    reports: boolean;
    settings: boolean;
  };
  canAssignPermissions: boolean;
  assignedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OfficeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [officeUsers, setOfficeUsers] = useState<OfficeUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permissions, setPermissions] = useState({
    dashboard: true,
    userManagement: false,
    pincodeManagement: false,
    addressForms: false,
    corporateRegistration: false,
    reports: false,
    settings: false
  });
  const [canAssignPermissions, setCanAssignPermissions] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
    fetchOfficeUsers();
  }, [searchTerm]);

  const fetchAdmins = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/admins?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data);
        setPagination(data.pagination);
        setError('');
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/admin';
        return;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Network error while loading admins');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficeUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOfficeUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching office users:', error);
    }
  };

  const handleEditPermissions = (admin: Admin) => {
    setSelectedAdmin(admin);
    setPermissions(admin.permissions);
    setCanAssignPermissions(admin.canAssignPermissions);
    setIsPermissionsModalOpen(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/admins/${selectedAdmin._id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions, canAssignPermissions }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Permissions Updated",
          description: `Permissions for ${selectedAdmin.name} have been updated successfully.`,
        });
        
        setAdmins(admins.map(admin => 
          admin._id === selectedAdmin._id 
            ? { ...admin, permissions: data.data.permissions, canAssignPermissions: data.data.canAssignPermissions }
            : admin
        ));
        
        setIsPermissionsModalOpen(false);
        setSelectedAdmin(null);
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

  const handleAssignAdminRole = async () => {
    if (!selectedUserId) return;

    try {
      setIsAssigning(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          permissions, 
          canAssignPermissions 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Admin Role Assigned",
          description: `Admin role has been assigned successfully.`,
        });
        
        fetchAdmins();
        fetchOfficeUsers();
        setIsAssignModalOpen(false);
        setSelectedUserId('');
        setPermissions({
          dashboard: true,
          userManagement: false,
          pincodeManagement: false,
          addressForms: false,
          corporateRegistration: false,
          reports: false,
          settings: false
        });
        setCanAssignPermissions(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Assignment Failed",
          description: errorData.error || 'Failed to assign admin role',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Assignment Failed",
        description: 'Network error while assigning admin role',
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/admins/${adminToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Admin Role Removed",
          description: `${adminToDelete.name}'s admin role has been removed successfully.`,
        });
        
        setAdmins(admins.filter(admin => admin._id !== adminToDelete._id));
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
        fetchOfficeUsers(); // Refresh office users list
      } else {
        const errorData = await response.json();
        toast({
          title: "Removal Failed",
          description: errorData.error || 'Failed to remove admin role',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        title: "Removal Failed",
        description: 'Network error while removing admin role',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPermissionBadges = (admin: Admin) => {
    const badges = [];
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') {
      badges.push('User Management', 'Pincode Management', 'Address Forms', 'All Permissions');
    } else {
      if (admin.permissions.userManagement) badges.push('User Management');
      if (admin.permissions.pincodeManagement) badges.push('Pincode Management');
      if (admin.permissions.addressForms) badges.push('Address Forms');
    }
    // Dashboard, Reports, and Settings are default permissions - not shown in badges
    return badges;
  };

  // Filter out users who are already admins
  const availableUsers = officeUsers.filter(user => 
    !admins.some(admin => admin.email === user.email)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontWeight: '500', fontSize: '32px', color:'black' }} className="admin-heading text-gray-800">Admin Management</h2>
          <p className="text-gray-600">Manage admin roles and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Admin Role
          </Button>
          <Button onClick={() => fetchAdmins()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Can Assign</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading admins...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold flex items-center">
                            {admin.name}
                            {admin.role === 'super_admin' && (
                              <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.isActive ? 'default' : 'destructive'}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getPermissionBadges(admin).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {getPermissionBadges(admin).length === 0 && (
                            <span className="text-xs text-gray-400">Basic access only</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.role === 'super_admin' || admin.canAssignPermissions ? 'default' : 'secondary'}>
                          {admin.role === 'super_admin' || admin.canAssignPermissions ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.assignedBy ? (
                          <div className="text-sm">
                            <div className="font-medium">{admin.assignedBy.name}</div>
                            <div className="text-xs text-gray-500">{admin.assignedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {admin.lastLogin ? (
                          <div className="text-sm">
                            {new Date(admin.lastLogin).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {admin.loginCount} logins
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {admin.role !== 'super_admin' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPermissions(admin)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAdmin(admin)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
            onClick={() => fetchAdmins(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchAdmins(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assign Admin Role Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Admin Role</DialogTitle>
            <DialogDescription>
              Select a user and assign admin permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Permissions</h4>
              {Object.entries(permissions)
                .filter(([key]) => !['dashboard', 'reports', 'settings'].includes(key))
                .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPermissions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="rounded"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Can Assign Permissions</label>
              <input
                type="checkbox"
                checked={canAssignPermissions}
                onChange={(e) => setCanAssignPermissions(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignAdminRole}
              disabled={isAssigning || !selectedUserId}
            >
              {isAssigning ? 'Assigning...' : 'Assign Admin Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedAdmin?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Permissions</h4>
              {Object.entries(permissions)
                .filter(([key]) => !['dashboard', 'reports', 'settings'].includes(key))
                .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPermissions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="rounded"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Can Assign Permissions</label>
              <input
                type="checkbox"
                checked={canAssignPermissions}
                onChange={(e) => setCanAssignPermissions(e.target.checked)}
                className="rounded"
              />
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
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the admin role from "{adminToDelete?.name}"?
              This will convert them back to a regular office user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Removing...' : 'Remove Admin Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManagement;
