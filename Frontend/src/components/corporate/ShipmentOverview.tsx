import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShipmentData {
  _id: string;
  bookingReference: string;
  consignmentNumber?: number;
  originData: {
    name: string;
    companyName: string;
    mobileNumber: string;
    email: string;
    locality: string;
    flatBuilding: string;
    landmark: string;
    pincode: string;
    area: string;
    city: string;
    district: string;
    state: string;
    gstNumber: string;
    addressType: string;
  };
  destinationData: {
    name: string;
    companyName: string;
    mobileNumber: string;
    email: string;
    locality: string;
    flatBuilding: string;
    landmark: string;
    pincode: string;
    area: string;
    city: string;
    district: string;
    state: string;
    gstNumber: string;
    addressType: string;
  };
  shipmentData: {
    natureOfConsignment: string;
    services: string;
    mode: string;
    actualWeight: string;
    totalPackages: string;
    materials: string;
    description: string;
    specialInstructions: string;
  };
  invoiceData: {
    calculatedPrice: number;
    gst: number;
    finalPrice: number;
    serviceType: string;
    location: string;
    transportMode: string;
    chargeableWeight: string;
  };
  status: 'booked' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  paymentType: 'FP' | 'TP'; // FP = Freight Paid, TP = To Pay
  bookingDate: string;
  pickupDate?: string;
  deliveryDate?: string;
  trackingUpdates: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

const ShipmentOverview: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load shipments data
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem('corporateToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        try {
          const response = await fetch('/api/corporate/bookings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch shipments');
          }

          const data = await response.json();
          // Transform the booking data to match the expected format
          const transformedShipments = data.data.map((booking: any) => ({
            _id: booking._id,
            bookingReference: booking.bookingReference,
            consignmentNumber: booking.consignmentNumber,
            originData: booking.bookingData.originData,
            destinationData: booking.bookingData.destinationData,
            shipmentData: booking.bookingData.shipmentData,
            invoiceData: booking.bookingData.invoiceData,
            status: 'booked', // Default status
            paymentStatus: 'unpaid', // Default payment status
            paymentType: booking.paymentType || 'FP', // Include payment type from backend
            bookingDate: booking.usedAt,
            trackingUpdates: [
              {
                status: 'booked',
                location: booking.bookingData.originData.city,
                timestamp: booking.usedAt,
                description: 'Shipment booked and ready for pickup'
              }
            ]
          }));
          setShipments(transformedShipments);
        } catch (apiError) {
          // If API fails, fall back to local storage
          console.log('Loading shipments from local storage');
          
          const localBookings = JSON.parse(localStorage.getItem('corporateBookings') || '[]');
          const shipmentsWithTracking = localBookings.map((booking: any) => ({
            ...booking,
            paymentStatus: booking.paymentStatus || 'unpaid', // Default to unpaid if not set
            paymentType: booking.paymentData?.paymentType || 'FP', // Include payment type from local storage
            trackingUpdates: [
              {
                status: 'booked',
                location: booking.originData.city,
                timestamp: booking.bookingDate,
                description: 'Shipment booked and ready for pickup'
              }
            ]
          }));
          
          setShipments(shipmentsWithTracking);
          
          // Silent fallback - no need to show demo message
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast({
          title: "Error",
          description: "Failed to load shipments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [toast]);

  // Filter shipments based on search, status, payment status, and month
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.originData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destinationData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.originData.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destinationData.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || shipment.paymentStatus === paymentFilter;
    
    // Month filtering
    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const shipmentDate = new Date(shipment.bookingDate);
      const shipmentMonth = shipmentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      matchesMonth = shipmentMonth.toString() === monthFilter;
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesMonth;
  });

  // Toggle row expansion
  const toggleRowExpansion = (shipmentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(shipmentId)) {
      newExpandedRows.delete(shipmentId);
    } else {
      newExpandedRows.add(shipmentId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Get status badge variant and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'booked':
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      case 'picked_up':
        return {
          variant: 'default' as const,
          icon: <Truck className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'in_transit':
        return {
          variant: 'default' as const,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'out_for_delivery':
        return {
          variant: 'default' as const,
          icon: <Truck className="h-4 w-4" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      case 'delivered':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading shipments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Shipment Overview
          </h1>
          <p className="text-sm text-gray-600">Track and manage all your shipments</p>
        </div>
      </div>

      {/* Filters - Compact */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs font-medium text-gray-700">
                Search Shipments
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by reference, name, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <Label htmlFor="status-filter" className="text-xs font-medium text-gray-700">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-40">
              <Label htmlFor="payment-filter" className="text-xs font-medium text-gray-700">
                Payment
              </Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-40">
              <Label htmlFor="month-filter" className="text-xs font-medium text-gray-700">
                Month
              </Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table - Compact */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-4 w-4 text-blue-600" />
            Shipments ({filteredShipments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-8 h-8 p-1"></TableHead>
                <TableHead className="text-xs font-medium">Consignment</TableHead>
                <TableHead className="text-xs font-medium">Origin</TableHead>
                <TableHead className="text-xs font-medium">Destination</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium">Payment</TableHead>
                <TableHead className="text-xs font-medium">Type</TableHead>
                <TableHead className="text-xs font-medium">Amount</TableHead>
                <TableHead className="text-xs font-medium">Date</TableHead>
                <TableHead className="w-16 text-xs font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No shipments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => {
                  const isExpanded = expandedRows.has(shipment._id);
                  const statusInfo = getStatusInfo(shipment.status);
                  
                  return (
                    <React.Fragment key={shipment._id}>
                      <TableRow className="hover:bg-gray-50 h-10">
                        <TableCell className="p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(shipment._id)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {shipment.consignmentNumber || shipment.bookingReference}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <div className="font-medium text-xs">{shipment.originData.name}</div>
                            <div className="text-xs text-gray-500">{shipment.originData.city}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <div className="font-medium text-xs">{shipment.destinationData.name}</div>
                            <div className="text-xs text-gray-500">{shipment.destinationData.city}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusInfo.variant}
                            className={`${statusInfo.bgColor} ${statusInfo.color} border-0 text-xs px-2 py-1`}
                          >
                            {statusInfo.icon}
                            <span className="ml-1 capitalize">
                              {shipment.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className={`${shipment.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} border-0 text-xs px-2 py-1`}
                          >
                            {shipment.paymentStatus === 'paid' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            <span className="capitalize">{shipment.paymentStatus}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={shipment.paymentType === 'FP' ? 'default' : 'secondary'}
                            className={`${shipment.paymentType === 'FP' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} border-0 text-xs px-2 py-1`}
                          >
                            {shipment.paymentType === 'FP' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            <span>{shipment.paymentType}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          ₹{shipment.invoiceData.finalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {formatDate(shipment.bookingDate)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(shipment._id)}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row - Compact */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="bg-gray-50 border-t">
                              <div className="p-3 space-y-3">
                                {/* All 4 Detail Boxes in Single Row - Ultra Compact */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                  <div className="bg-white rounded p-2 border border-gray-200">
                                    <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-1 text-xs">
                                      <MapPin className="h-3 w-3" />
                                      Origin
                                    </h4>
                                    <div className="space-y-0.5 text-xs">
                                      <div><strong>Name:</strong> {shipment.originData.name}</div>
                                      <div><strong>Mobile:</strong> +91 {shipment.originData.mobileNumber}</div>
                                      <div><strong>Address:</strong> {shipment.originData.flatBuilding}, {shipment.originData.locality}</div>
                                      <div><strong>City:</strong> {shipment.originData.city}, {shipment.originData.state} - {shipment.originData.pincode}</div>
                                      <div><strong>GST:</strong> {shipment.originData.gstNumber || 'N/A'}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white rounded p-2 border border-gray-200">
                                    <h4 className="font-semibold text-green-800 mb-1 flex items-center gap-1 text-xs">
                                      <Truck className="h-3 w-3" />
                                      Destination
                                    </h4>
                                    <div className="space-y-0.5 text-xs">
                                      <div><strong>Name:</strong> {shipment.destinationData.name}</div>
                                      <div><strong>Mobile:</strong> +91 {shipment.destinationData.mobileNumber}</div>
                                      <div><strong>Address:</strong> {shipment.destinationData.flatBuilding}, {shipment.destinationData.locality}</div>
                                      <div><strong>City:</strong> {shipment.destinationData.city}, {shipment.destinationData.state} - {shipment.destinationData.pincode}</div>
                                      <div><strong>GST:</strong> {shipment.destinationData.gstNumber || 'N/A'}</div>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded p-2 border border-gray-200">
                                    <h4 className="font-semibold text-orange-800 mb-1 flex items-center gap-1 text-xs">
                                      <Package className="h-3 w-3" />
                                      Shipment
                                    </h4>
                                    <div className="space-y-0.5 text-xs">
                                      <div><strong>Nature:</strong> {shipment.shipmentData.natureOfConsignment}</div>
                                      <div><strong>Service:</strong> {shipment.shipmentData.services}</div>
                                      <div><strong>Mode:</strong> {shipment.shipmentData.mode}</div>
                                      <div><strong>Weight:</strong> {shipment.shipmentData.actualWeight} kg</div>
                                      <div><strong>Packages:</strong> {shipment.shipmentData.totalPackages}</div>
                                      <div><strong>Description:</strong> {shipment.shipmentData.description}</div>
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded p-2 border border-purple-200">
                                    <h4 className="font-semibold text-purple-800 mb-1 flex items-center gap-1 text-xs">
                                      <DollarSign className="h-3 w-3" />
                                      Invoice
                                    </h4>
                                    <div className="space-y-0.5 text-xs">
                                      <div><strong>Service Type:</strong> {shipment.invoiceData.serviceType}</div>
                                      <div><strong>Location Zone:</strong> {shipment.invoiceData.location}</div>
                                      <div><strong>Transport Mode:</strong> {shipment.invoiceData.transportMode}</div>
                                      <div><strong>Base Price:</strong> ₹{shipment.invoiceData.calculatedPrice.toFixed(2)}</div>
                                      <div><strong>GST (18%):</strong> ₹{shipment.invoiceData.gst.toFixed(2)}</div>
                                      <div className="font-semibold text-xs"><strong>Total:</strong> ₹{shipment.invoiceData.finalPrice.toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentOverview;
