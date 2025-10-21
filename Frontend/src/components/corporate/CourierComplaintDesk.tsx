import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Truck,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  Search,
  Package,
  MapPin,
  User,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConsignmentSuggestions from './ConsignmentSuggestions';

interface CourierComplaint {
  id: string;
  consignmentNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  courierName?: string;
  courierContact?: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  responseDate?: string;
}

interface ShipmentInfo {
  consignmentNumber: string;
  destination: string;
  status: string;
  bookingDate: string;
  courierName?: string;
  courierContact?: string;
}

interface ConsignmentSuggestion {
  consignmentNumber: string;
  destination: string;
  bookingDate: string;
  status: string;
}

const CourierComplaintDesk: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [complaints, setComplaints] = useState<CourierComplaint[]>([]);
  const [shipmentInfo, setShipmentInfo] = useState<ShipmentInfo | null>(null);
  const [searchConsignment, setSearchConsignment] = useState('');

  const [newComplaint, setNewComplaint] = useState({
    consignmentNumber: '',
    subject: '',
    category: '',
    priority: '',
    description: '',
  });

  const { toast } = useToast();

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: ConsignmentSuggestion) => {
    setSearchConsignment(suggestion.consignmentNumber);
    // Automatically search for shipment details when suggestion is selected
    handleSearchShipmentWithNumber(suggestion.consignmentNumber);
  };

  // Search for shipment with a specific consignment number
  const handleSearchShipmentWithNumber = async (consignmentNumber: string) => {
    setIsSearching(true);
    
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch(`/api/courier-complaints/search-shipment/${consignmentNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setShipmentInfo(data.shipmentInfo);
        setNewComplaint(prev => ({ ...prev, consignmentNumber: consignmentNumber }));
        
        toast({
          title: "Success",
          description: "Shipment details found successfully",
        });
      } else {
        throw new Error(data.error || 'Shipment not found');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Shipment not found. Please check the consignment number.",
        variant: "destructive"
      });
      setShipmentInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Load existing complaints on component mount
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const token = localStorage.getItem('corporateToken');
        const response = await fetch('/api/courier-complaints', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setComplaints(data.complaints);
        }
      } catch (error) {
        console.error('Failed to load complaints:', error);
      }
    };

    loadComplaints();
  }, []);

  // Search for shipment by consignment number
  const handleSearchShipment = async () => {
    if (!searchConsignment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a consignment number",
        variant: "destructive"
      });
      return;
    }

    await handleSearchShipmentWithNumber(searchConsignment);
  };

  const handleSubmitComplaint = async () => {
    if (!newComplaint.consignmentNumber || !newComplaint.subject || !newComplaint.category || !newComplaint.priority || !newComplaint.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!shipmentInfo) {
      toast({
        title: "Error",
        description: "Please search and verify the consignment number first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/courier-complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComplaint)
      });

      const data = await response.json();

      if (data.success) {
        // Add the new complaint to the list
        const newComplaintData: CourierComplaint = {
          id: data.complaint.id,
          consignmentNumber: data.complaint.consignmentNumber,
          subject: data.complaint.subject,
          category: data.complaint.category,
          priority: data.complaint.priority,
          status: data.complaint.status,
          description: newComplaint.description,
          courierName: shipmentInfo.courierName,
          courierContact: shipmentInfo.courierContact,
          createdAt: data.complaint.createdAt,
          updatedAt: data.complaint.createdAt,
        };

        setComplaints(prev => [newComplaintData, ...prev]);
        
        setNewComplaint({
          consignmentNumber: '',
          subject: '',
          category: '',
          priority: '',
          description: '',
        });
        setShipmentInfo(null);
        setSearchConsignment('');

        toast({
          title: "Success",
          description: "Your courier complaint has been submitted successfully. We will investigate and get back to you soon.",
        });
      } else {
        throw new Error(data.error || 'Failed to submit complaint');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="destructive">Open</Badge>;
      case 'In Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-600" />
            Courier Complaint Desk
          </h1>
          <p className="text-xs text-gray-600">Report issues with specific couriers and shipments</p>
        </div>
      </div>

      {/* Search Shipment Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-orange-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Search className="h-4 w-4 text-orange-600" />
            Search Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <ConsignmentSuggestions
                  value={searchConsignment}
                  onChange={setSearchConsignment}
                  onSelect={handleSuggestionSelect}
                  placeholder="Type to search consignment numbers..."
                  label="Consignment Number"
                  required={true}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearchShipment}
                  disabled={isSearching}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 h-8"
                >
                  <Search className="h-3 w-3 mr-1" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Shipment Info Display */}
            {shipmentInfo && (
              <Alert className="bg-green-50 border-green-200 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="font-medium text-green-800 mb-1 text-xs">Shipment Found:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Consignment:</span> {shipmentInfo.consignmentNumber}
                    </div>
                    <div>
                      <span className="font-medium">Destination:</span> {shipmentInfo.destination}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {shipmentInfo.status}
                    </div>
                    <div>
                      <span className="font-medium">Booking Date:</span> {new Date(shipmentInfo.bookingDate).toLocaleDateString()}
                    </div>
                    {shipmentInfo.courierName && (
                      <div>
                        <span className="font-medium">Courier:</span> {shipmentInfo.courierName}
                      </div>
                    )}
                    {shipmentInfo.courierContact && (
                      <div>
                        <span className="font-medium">Contact:</span> {shipmentInfo.courierContact}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit New Complaint */}
      {shipmentInfo && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-gray-200 py-2">
            <CardTitle className="text-base font-semibold text-gray-800">Submit Courier Complaint</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-xs font-medium">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={newComplaint.subject}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the courier issue"
                    className="w-full h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-xs font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newComplaint.category}
                    onValueChange={(value) => setNewComplaint(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Select complaint category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delivery Delay">Delivery Delay</SelectItem>
                      <SelectItem value="Package Damage">Package Damage</SelectItem>
                      <SelectItem value="Wrong Delivery">Wrong Delivery</SelectItem>
                      <SelectItem value="Courier Behavior">Courier Behavior</SelectItem>
                      <SelectItem value="Communication Issues">Communication Issues</SelectItem>
                      <SelectItem value="Pickup Issues">Pickup Issues</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="priority" className="text-xs font-medium">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newComplaint.priority}
                  onValueChange={(value) => setNewComplaint(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High - Urgent attention required</SelectItem>
                    <SelectItem value="Medium">Medium - Normal processing</SelectItem>
                    <SelectItem value="Low">Low - Can be addressed later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs font-medium">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about the courier issue, including what happened, when it occurred, and any relevant details..."
                  className="w-full min-h-[80px]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComplaint}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 h-8"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800">Need Immediate Assistance?</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs">Phone Support</p>
                <p className="text-xs text-gray-600">+91 98765 43210</p>
                <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs">Email Support</p>
                <p className="text-xs text-gray-600">support@ocl.com</p>
                <p className="text-xs text-gray-500">24/7 Response</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs">Live Chat</p>
                <p className="text-xs text-gray-600">Available Now</p>
                <p className="text-xs text-gray-500">Instant Support</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint History */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800">Your Courier Complaints</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="p-4 text-center">
              <div className="p-2 bg-gray-50 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Truck className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium">No courier complaints submitted yet.</p>
              <p className="text-xs text-gray-500 mt-1">Submit your first complaint using the form above.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {complaints.map((complaint, index) => (
                <div
                  key={complaint.id}
                  className={`p-3 ${index !== complaints.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{complaint.subject}</h3>
                        {getStatusBadge(complaint.status)}
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Consignment: {complaint.consignmentNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{complaint.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted: {formatDate(complaint.createdAt)}</span>
                        </div>
                        {complaint.updatedAt !== complaint.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Updated: {formatDate(complaint.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                      {complaint.courierName && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Courier: {complaint.courierName}</span>
                          </div>
                          {complaint.courierContact && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{complaint.courierContact}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>
                      
                      {complaint.response && (
                        <Alert className="bg-green-50 border-green-200 p-2 mt-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <AlertDescription>
                            <div className="font-medium text-green-800 mb-1 text-xs">Response from Support:</div>
                            <p className="text-green-700 text-xs">{complaint.response}</p>
                            {complaint.responseDate && (
                              <p className="text-xs text-green-600 mt-1">
                                Responded on: {formatDate(complaint.responseDate)}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierComplaintDesk;
