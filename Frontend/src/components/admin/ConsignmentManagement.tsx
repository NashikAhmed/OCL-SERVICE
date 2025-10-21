import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Search, Eye, Hash, Building2, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Corporate {
  _id: string;
  corporateId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  registrationDate: string;
  consignmentAssignments?: ConsignmentAssignment[];
  hasAssignments?: boolean;
}

interface OfficeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  consignmentAssignments?: ConsignmentAssignment[];
  hasAssignments?: boolean;
}


interface ConsignmentAssignment {
  _id: string;
  assignmentType: 'corporate' | 'office_user';
  corporateId?: {
    _id: string;
    corporateId: string;
    companyName: string;
    email: string;
    contactNumber: string;
  };
  officeUserId?: string;
  assignedToName: string;
  assignedToEmail: string;
  companyName?: string;
  startNumber: number;
  endNumber: number;
  totalNumbers: number;
  assignedBy: {
    name: string;
    email: string;
  };
  assignedAt: string;
  notes: string;
  usedCount?: number;
  availableCount?: number;
  usagePercentage?: number;
  corporateTotalUsed?: number;
  corporateTotalAssigned?: number;
  corporateUsagePercentage?: number;
}

interface ConsignmentUsage {
  _id: string;
  consignmentNumber: number;
  bookingReference: string;
  usedAt: string;
  status: string;
}

const ConsignmentManagement = () => {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [officeUsers, setOfficeUsers] = useState<OfficeUser[]>([]);
  const [assignments, setAssignments] = useState<ConsignmentAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [selectedOfficeUser, setSelectedOfficeUser] = useState<OfficeUser | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    corporateId: '',
    officeUserId: '',
    assignmentType: 'corporate' as 'corporate' | 'office_user',
    startNumber: '',
    endNumber: '',
    notes: '',
    quantity: 100
  });
  const [highestNumber, setHighestNumber] = useState<number>(871026571);
  const { toast } = useToast();

  // Get the appropriate token and API base
  const getTokenAndBase = () => {
    const adminToken = localStorage.getItem('adminToken');
    const officeToken = localStorage.getItem('officeToken');
    const token = adminToken || officeToken;
    const isAdmin = !!adminToken;
    const basePath = isAdmin ? '/api/admin' : '/api/office';
    return { token, isAdmin, basePath };
  };

  // Fetch highest consignment number
  const fetchHighestNumber = async () => {
    try {
      const { token, basePath } = getTokenAndBase();
      const response = await fetch(`${basePath}/consignment/highest`, {
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

  // Fetch office users with their assignments
  const fetchOfficeUsers = async () => {
    try {
      const { token, basePath } = getTokenAndBase();
      console.log('🔍 Fetching office users with assignments...');
      console.log('Token present:', !!token);
      console.log('Base path:', basePath);
      
      // Fetch office users and their assignments
      const [usersResponse, assignmentsResponse] = await Promise.all([
        fetch(`${basePath}/consignment/office-users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${basePath}/consignment/assignments?assignmentType=office_user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      console.log('Users response status:', usersResponse.status);
      console.log('Assignments response status:', assignmentsResponse.status);
      
      if (usersResponse.ok && assignmentsResponse.ok) {
        const [usersData, assignmentsData] = await Promise.all([
          usersResponse.json(),
          assignmentsResponse.json()
        ]);
        
        console.log('Office users received:', usersData);
        console.log('Office user assignments received:', assignmentsData);
        
        // Map assignments to users (handle both populated and unpopulated officeUserId)
        const usersWithAssignments = usersData.data.map((user: any) => {
          const userAssignments = (assignmentsData.data || []).filter((assignment: any) => {
            const officeUserId = assignment?.officeUserId;
            const matchId = typeof officeUserId === 'string'
              ? officeUserId
              : officeUserId?._id;
            return String(matchId) === String(user._id);
          }).map((assignment: any) => {
            // Normalize usage fields to avoid UI blanks
            const usedCount = Number(assignment.usedCount || assignment.usedCountInRange || 0);
            const totalNumbers = Number(assignment.totalNumbers || 0);
            const usagePercentage = totalNumbers > 0
              ? Math.round((usedCount / totalNumbers) * 100)
              : 0;
            return {
              ...assignment,
              usedCount,
              usagePercentage
            };
          });

          return {
            ...user,
            consignmentAssignments: userAssignments,
            hasAssignments: userAssignments.length > 0
          };
        });
        
        console.log('Users with assignments:', usersWithAssignments);
        setOfficeUsers(usersWithAssignments);
      } else {
        const errorData = await usersResponse.json().catch(() => ({}));
        console.error('❌ Error fetching office users:', errorData);
      }
    } catch (error) {
      console.error('❌ Network error fetching office users:', error);
    }
  };


  // Fetch all data (corporates with their assignments and all assignments)
  const fetchData = async () => {
    try {
      setLoading(true);
      const { token, basePath } = getTokenAndBase();
      
      // Fetch corporates, assignments, office users, and employees in parallel
      const [corporatesResponse, assignmentsResponse] = await Promise.all([
        fetch(`${basePath}/consignment/corporates?search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${basePath}/consignment/assignments?search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      if (corporatesResponse.ok && assignmentsResponse.ok) {
        const [corporatesData, assignmentsData] = await Promise.all([
          corporatesResponse.json(),
          assignmentsResponse.json()
        ]);
        setCorporates(corporatesData.data);
        setAssignments(assignmentsData.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consignment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch usage data for a corporate or office user
  const fetchUsageData = async (id: string, type: 'corporate' | 'office_user' = 'corporate') => {
    try {
      setLoading(true);
      const { token, basePath } = getTokenAndBase();
      
      // Try different endpoint approaches for office users
      let endpoint;
      if (type === 'office_user') {
        // Try the office user specific endpoint first
        endpoint = `${basePath}/consignment/usage/office-user/${id}`;
      } else {
        endpoint = `${basePath}/consignment/usage/${id}`;
      }
      
      console.log('Fetching usage data from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Usage data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usage data received:', data);
        setUsageData(data.data);
        setShowUsageDialog(true);
      } else {
        // If office user endpoint fails, try the general usage endpoint with assignment type
        if (type === 'office_user') {
          console.log('Office user endpoint failed, trying general endpoint with type parameter');
          const fallbackEndpoint = `${basePath}/consignment/usage/${id}?assignmentType=office_user`;
          const fallbackResponse = await fetch(fallbackEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback usage data received:', fallbackData);
            setUsageData(fallbackData.data);
            setShowUsageDialog(true);
            return;
          }
        }
        
        const errorText = await response.text();
        console.error('Usage data error response:', errorText);
        throw new Error(`Failed to fetch usage data: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch usage data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Assign consignment numbers
  const handleAssign = async () => {
    const { assignmentType, corporateId, officeUserId, startNumber, endNumber } = assignmentForm;
    
    // Validate based on assignment type
    if (assignmentType === 'corporate' && !corporateId) {
      toast({
        title: "Error",
        description: "Please select a corporate company",
        variant: "destructive",
      });
      return;
    }
    
    if (assignmentType === 'office_user' && !officeUserId) {
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
      setLoading(true);
      const { token, basePath } = getTokenAndBase();
      
      // Determine the correct endpoint based on assignment type
      let endpoint = `${basePath}/consignment/assign`;
      let body = assignmentForm;
      
      if (assignmentType === 'office_user') {
        endpoint = `${basePath}/consignment/assign-office-user`;
        body = { officeUserId, startNumber, endNumber, notes: assignmentForm.notes };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        setShowAssignDialog(false);
        setAssignmentForm({
          corporateId: '',
          officeUserId: '',
          assignmentType: 'corporate',
          startNumber: '',
          endNumber: '',
          notes: '',
          quantity: 100
        });
        fetchData();
        fetchOfficeUsers(); // Refresh office users data to show new assignments
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOfficeUsers();
    fetchHighestNumber();
  }, [searchTerm]);


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

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Consignment Management</h1>
            <p className="text-sm text-gray-500">Manage consignment assignments and usage</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedCorporate(null);
            setSelectedOfficeUser(null);
            setAssignmentForm({
              corporateId: '',
              officeUserId: '',
              assignmentType: 'corporate',
              startNumber: (highestNumber + 1).toString(),
              endNumber: (highestNumber + 100).toString(),
              notes: '',
              quantity: 100
            });
            setShowAssignDialog(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign Range
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
            <Input
              placeholder="Search companies, users, or assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-shadow"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different assignment types */}
      <Tabs defaultValue="corporate" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 h-10 bg-white/80 backdrop-blur-sm shadow-sm border-0 rounded-lg">
          <TabsTrigger value="corporate" className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Corporate Companies</TabsTrigger>
          <TabsTrigger value="office" className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Office Users</TabsTrigger>
        </TabsList>

        {/* Corporate Tab */}
        <TabsContent value="corporate" className="space-y-3">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-t-lg">
              <CardTitle className="text-lg text-gray-800">Corporate Companies & Assignments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
                      <TableHead className="font-semibold text-gray-700 py-4">Company</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Corporate ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Assignments</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Usage</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {corporates.map((corporate, index) => (
                      <TableRow key={corporate._id} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-blue-50/20'} hover:bg-blue-50/40 border-0 transition-all duration-200`}>
                        <TableCell className="py-4 border-0">
                          <div>
                            <div className="font-medium text-sm text-gray-800">{corporate.companyName}</div>
                            <div className="text-xs text-gray-500">
                              {corporate.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 border-0">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{corporate.corporateId}</Badge>
                        </TableCell>
                        <TableCell className="py-4 border-0 text-sm text-gray-600">{corporate.contactNumber}</TableCell>
                        <TableCell className="py-4 border-0">
                          <div className="space-y-1">
                            {corporate.consignmentAssignments && corporate.consignmentAssignments.length > 0 ? (
                              corporate.consignmentAssignments.map((assignment, index) => (
                                <div key={assignment._id} className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
                                    {assignment.startNumber}-{assignment.endNumber}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    ({assignment.totalNumbers})
                                  </span>
                                </div>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                No Assignments
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 border-0">
                          {corporate.consignmentAssignments && corporate.consignmentAssignments.length > 0 ? (
                            <div className="space-y-1">
                              {corporate.consignmentAssignments.map((assignment) => (
                                <div key={assignment._id} className="flex items-center gap-2">
                                  <div className="w-12 bg-gray-200 rounded-full h-2 shadow-inner">
                                    <div
                                      className={`h-2 rounded-full shadow-sm ${getUsageColor(assignment.usagePercentage || 0)}`}
                                      style={{ width: `${assignment.usagePercentage || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium">
                                    {assignment.usedCount || 0}/{assignment.totalNumbers}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 border-0">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all"
                              onClick={() => {
                                setSelectedCorporate(corporate);
                                setAssignmentForm(prev => ({
                                  ...prev,
                                  assignmentType: 'corporate',
                                  corporateId: corporate._id,
                                  startNumber: (highestNumber + 1).toString(),
                                  endNumber: (highestNumber + prev.quantity).toString()
                                }));
                                setShowAssignDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                            {corporate.hasAssignments && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all"
                                onClick={() => fetchUsageData(corporate._id, 'corporate')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Office Users Tab */}
        <TabsContent value="office" className="space-y-3">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-green-50/30 to-emerald-50/30 rounded-t-lg">
              <CardTitle className="text-lg text-gray-800">Office Users & Assignments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 bg-gradient-to-r from-gray-50/50 to-green-50/30">
                      <TableHead className="font-semibold text-gray-700 py-4">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Role</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Assignments</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Usage</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {console.log('📊 Rendering office users table. Count:', officeUsers.length)}
                    {officeUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No office users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      officeUsers.map((user, index) => {
                        console.log('👤 Rendering user:', user.name, user._id);
                        return (
                        <TableRow key={user._id} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-green-50/20'} hover:bg-green-50/40 border-0 transition-all duration-200`}>
                          <TableCell className="py-4 border-0">
                            <div className="font-medium text-sm text-gray-800">{user.name}</div>
                          </TableCell>
                          <TableCell className="py-4 border-0 text-sm text-gray-600">{user.email}</TableCell>
                          <TableCell className="py-4 border-0">
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="py-4 border-0">
                            <div className="space-y-1">
                              {user.consignmentAssignments && user.consignmentAssignments.length > 0 ? (
                                user.consignmentAssignments.map((assignment, index) => (
                                  <div key={assignment._id} className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
                                      {assignment.startNumber}-{assignment.endNumber}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      ({assignment.totalNumbers})
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                  No Assignments
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 border-0">
                            {user.consignmentAssignments && user.consignmentAssignments.length > 0 ? (
                              <div className="space-y-1">
                                {user.consignmentAssignments.map((assignment) => (
                                  <div key={assignment._id} className="flex items-center gap-2">
                                    <div className="w-12 bg-gray-200 rounded-full h-2 shadow-inner">
                                      <div
                                        className={`h-2 rounded-full shadow-sm ${getUsageColor(assignment.usagePercentage || 0)}`}
                                        style={{ width: `${assignment.usagePercentage || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {assignment.usedCount || 0}/{assignment.totalNumbers}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 border-0">
                            <div className="flex items-center gap-1">
                              <button
                              type="button"
                              className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-md flex items-center gap-1"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🚀 ASSIGN BUTTON CLICKED!', user);
                                setSelectedOfficeUser(user);
                                setAssignmentForm(prev => ({
                                  ...prev,
                                  assignmentType: 'office_user',
                                  officeUserId: user._id,
                                  startNumber: (highestNumber + 1).toString(),
                                  endNumber: (highestNumber + prev.quantity).toString()
                                }));
                                setShowAssignDialog(true);
                                console.log('Dialog should now be open');
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </button>
                            {user.hasAssignments && (
                              <button
                                type="button"
                                className="h-7 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all rounded-md flex items-center gap-1"
                                onClick={() => {
                                  // Since the office user usage endpoint doesn't exist, show basic assignment info directly
                                  const assignmentInfo = {
                                    assignment: {
                                      assignmentType: 'office_user',
                                      assignedToName: user.name,
                                      assignedToEmail: user.email,
                                      startNumber: user.consignmentAssignments?.[0]?.startNumber || 0,
                                      endNumber: user.consignmentAssignments?.[0]?.endNumber || 0,
                                      totalNumbers: user.consignmentAssignments?.[0]?.totalNumbers || 0
                                    },
                                    statistics: {
                                      totalAssigned: user.consignmentAssignments?.reduce((sum, a) => sum + a.totalNumbers, 0) || 0,
                                      totalUsed: user.consignmentAssignments?.reduce((sum, a) => sum + (a.usedCount || 0), 0) || 0,
                                      available: user.consignmentAssignments?.reduce((sum, a) => sum + (a.availableCount || 0), 0) || 0,
                                      usagePercentage: user.consignmentAssignments?.[0]?.usagePercentage || 0
                                    },
                                    usage: [] // No detailed usage data available
                                  };
                                  console.log('Showing office user assignment info:', assignmentInfo);
                                  setUsageData(assignmentInfo);
                                  setShowUsageDialog(true);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                            )}
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Assign Consignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Consignment Numbers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Assignment Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <select
                id="assignmentType"
                value={assignmentForm.assignmentType}
                onChange={(e) => setAssignmentForm(prev => ({ 
                  ...prev, 
                  assignmentType: e.target.value as 'corporate' | 'office_user',
                  corporateId: '',
                  officeUserId: ''
                }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="corporate">Corporate Company</option>
                <option value="office_user">Office User</option>
              </select>
            </div>

            {/* Corporate Selection */}
            {assignmentForm.assignmentType === 'corporate' && (
              selectedCorporate ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{selectedCorporate.companyName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {selectedCorporate.corporateId}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="corporateSelect">Select Corporate Company</Label>
                  <select
                    id="corporateSelect"
                    value={assignmentForm.corporateId}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, corporateId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a corporate company...</option>
                    {corporates.map((corporate) => (
                      <option key={corporate._id} value={corporate._id}>
                        {corporate.companyName} ({corporate.corporateId})
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            {/* Office User Selection */}
            {assignmentForm.assignmentType === 'office_user' && (
              selectedOfficeUser ? (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedOfficeUser.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedOfficeUser.email} • {selectedOfficeUser.role}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="officeUserSelect">Select Office User</Label>
                  <select
                    id="officeUserSelect"
                    value={assignmentForm.officeUserId}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, officeUserId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an office user...</option>
                    {officeUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            
            <div className="space-y-2">
              <Label htmlFor="startNumber">Start Number (Auto-filled)</Label>
              <Input
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
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Last highest number: {highestNumber}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Consignments</Label>
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
                <Input
                  type="number"
                  value={assignmentForm.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 100)}
                  min="1"
                  max="10000"
                  className="w-20"
                />
                <span className="text-sm text-gray-500">numbers</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endNumber">End Number (Auto-calculated)</Label>
              <Input
                id="endNumber"
                value={assignmentForm.endNumber}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Range: {assignmentForm.startNumber} - {assignmentForm.endNumber} ({assignmentForm.quantity} numbers)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this assignment..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Numbers'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Usage Details Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Consignment Usage Details</DialogTitle>
          </DialogHeader>
          {usageData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {usageData.assignment.assignmentType === 'corporate' ? 'Company' : 'Office User'}
                  </div>
                  <div className="font-medium">
                    {usageData.assignment.assignmentType === 'corporate' 
                      ? usageData.assignment.corporateId.companyName
                      : usageData.assignment.assignedToName
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Range</div>
                  <div className="font-medium">
                    {usageData.assignment.startNumber} - {usageData.assignment.endNumber}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Assigned</div>
                  <div className="font-medium">{usageData.statistics.totalAssigned}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Used</div>
                  <div className="font-medium">{usageData.statistics.totalUsed}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Available</div>
                  <div className="font-medium">{usageData.statistics.available}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Usage</div>
                  <div className="font-medium">{usageData.statistics.usagePercentage}%</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Used Consignment Numbers</h4>
                {usageData.usage && usageData.usage.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Consignment Number</TableHead>
                        <TableHead>Booking Reference</TableHead>
                        <TableHead>Used Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageData.usage.map((usage: ConsignmentUsage) => (
                        <TableRow key={usage._id}>
                          <TableCell>
                            <Badge variant="outline">
                              <Hash className="h-3 w-3 mr-1" />
                              {usage.consignmentNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>{usage.bookingReference}</TableCell>
                          <TableCell>
                            {new Date(usage.usedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={usage.status === 'active' ? 'default' : 'secondary'}>
                              {usage.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No detailed usage data available</p>
                    <p className="text-sm mt-2">This assignment has not been used yet or detailed usage tracking is not available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsignmentManagement;
