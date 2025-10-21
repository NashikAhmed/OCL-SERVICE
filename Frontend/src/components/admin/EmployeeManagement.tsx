import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Eye, 
  Edit,
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Building2,
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { makePermissionAwareRequest, handleApiError } from '@/utils/apiUtils';

interface Employee {
  _id: string;
  employeeCode: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  alternativePhone: string;
  dateOfBirth: string;
  designation: string;
  aadharNo: string;
  panNo: string;
  qualification: string;
  presentAddress: {
    locality: string;
    buildingFlatNo: string;
    landmark: string;
    pincode: string;
    city: string;
    state: string;
    area: string;
  };
  permanentAddress: {
    locality: string;
    buildingFlatNo: string;
    landmark: string;
    pincode: string;
    city: string;
    state: string;
    area: string;
  };
  workExperience: string;
  salary: string;
  dateOfJoining: string;
  references: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  photoFilePath?: string;
  cvFilePath?: string;
  documentFilePath?: string;
  aadharCardFilePath?: string;
  panCardFilePath?: string;
  createdAt: string;
  emailSent: boolean;
  emailSentAt?: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      const data = await makePermissionAwareRequest('/employee');
      setEmployees(data.employees || data.data || []);
      setTotalPages(Math.ceil((data.employees || data.data || []).length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorToast = handleApiError(error as Response, "Failed to fetch employees");
      toast(errorToast);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage and view all registered employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{employees.length} employees</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name, email, code, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Designation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee) => (
                  <tr 
                    key={employee._id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{employee.designation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(employee.dateOfJoining)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmployeeClick(employee);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                            toast({
                              title: "Edit Employee",
                              description: "Edit functionality will be implemented soon.",
                            });
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Modal */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Details - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employee Code</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.employeeCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Alternative Phone</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.alternativePhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Designation</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-sm text-gray-900">{formatDate(selectedEmployee.dateOfBirth)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Joining</Label>
                    <p className="text-sm text-gray-900">{formatDate(selectedEmployee.dateOfJoining)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Present Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Locality</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.locality}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Building/Flat No.</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.buildingFlatNo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Landmark</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.landmark}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Pincode</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.pincode}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">City</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">State</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.state}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Area</Label>
                        <p className="text-gray-900">{selectedEmployee.presentAddress.area}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Permanent Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Locality</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.locality}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Building/Flat No.</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.buildingFlatNo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Landmark</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.landmark}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Pincode</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.pincode}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">City</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">State</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.state}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Area</Label>
                        <p className="text-gray-900">{selectedEmployee.permanentAddress.area}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.qualification}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Work Experience</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.workExperience}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Salary</Label>
                    <p className="text-sm text-gray-900">₹{selectedEmployee.salary}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Aadhar No.</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.aadharNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">PAN No.</Label>
                    <p className="text-sm text-gray-900">{selectedEmployee.panNo}</p>
                  </div>
                </CardContent>
              </Card>

              {/* References */}
              {selectedEmployee.references && selectedEmployee.references.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEmployee.references.map((ref, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Name</Label>
                              <p className="text-gray-900">{ref.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Relation</Label>
                              <p className="text-gray-900">{ref.relation}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Mobile</Label>
                              <p className="text-gray-900">{ref.mobile}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.photoFilePath && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Photo</Label>
                        <div className="mt-1">
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedEmployee.photoFilePath} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View Photo
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedEmployee.cvFilePath && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">CV</Label>
                        <div className="mt-1">
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedEmployee.cvFilePath} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View CV
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedEmployee.aadharCardFilePath && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Aadhar Card</Label>
                        <div className="mt-1">
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedEmployee.aadharCardFilePath} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View Aadhar
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedEmployee.panCardFilePath && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">PAN Card</Label>
                        <div className="mt-1">
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedEmployee.panCardFilePath} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View PAN
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
