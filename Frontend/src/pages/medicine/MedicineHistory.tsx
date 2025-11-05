import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  History, 
  Package, 
  MapPin, 
  Truck, 
  FileText, 
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Building,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Warehouse
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicineUserInfo {
  id: string;
  name: string;
  email: string;
}

interface BookingImage {
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

interface Coloader {
  _id: string;
  phoneNumber: string;
  busNumber: string;
}

interface MedicineBooking {
  _id: string;
  bookingReference: string;
  consignmentNumber?: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  coloaderId?: Coloader | string;
  origin: {
    name: string;
    mobileNumber: string;
    email: string;
    companyName?: string;
    flatBuilding: string;
    locality: string;
    landmark?: string;
    pincode: string;
    city: string;
    district: string;
    state: string;
    gstNumber?: string;
    addressType: string;
  };
  destination: {
    name: string;
    mobileNumber: string;
    email: string;
    companyName?: string;
    flatBuilding: string;
    locality: string;
    landmark?: string;
    pincode: string;
    city: string;
    district: string;
    state: string;
    gstNumber?: string;
    addressType: string;
  };
  shipment: {
    natureOfConsignment: string;
    services: string;
    mode: string;
    insurance: string;
    riskCoverage: string;
    dimensions: Array<{
      length: string;
      breadth: string;
      height: string;
      unit: string;
    }>;
    actualWeight: string;
    perKgWeight: string;
    volumetricWeight: number;
    chargeableWeight: number;
  };
  package: {
    totalPackages: string;
    materials?: string;
    packageImages: BookingImage[];
    contentDescription: string;
  };
  invoice: {
    invoiceNumber: string;
    invoiceValue: string;
    invoiceImages: BookingImage[];
    eWaybillNumber?: string;
    acceptTerms: boolean;
  };
  billing: {
    gst: string;
    partyType: string;
    billType?: string;
  };
  charges?: {
    freightCharge?: string;
    awbCharge?: string;
    localCollection?: string;
    doorDelivery?: string;
    loadingUnloading?: string;
    demurrageCharge?: string;
    ddaCharge?: string;
    hamaliCharge?: string;
    packingCharge?: string;
    otherCharge?: string;
    total?: string;
    fuelCharge?: string;
    fuelChargeType?: string;
    sgstAmount?: string;
    cgstAmount?: string;
    igstAmount?: string;
    gstAmount?: string;
    grandTotal?: string;
  };
  payment?: {
    mode?: string;
    deliveryType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MedicineHistory: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<MedicineBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('medicineToken');
    const info = localStorage.getItem('medicineInfo');
    if (!token || !info) {
      navigate('/medicine');
      return;
    }
    try {
      setUser(JSON.parse(info));
    } catch {
      navigate('/medicine');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('medicineToken');
      
      const response = await fetch('/api/medicine/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/medicine');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
  };

  const getStatusBadge = (status: string, consignmentNumber?: number) => {
    // Check if the booking is in the manifest (ready to dispatch)
    const storedManifest = localStorage.getItem('medicineManifest');
    let isInManifest = false;
    if (storedManifest && consignmentNumber) {
      try {
        const manifestArray = JSON.parse(storedManifest);
        isInManifest = manifestArray.some((b: any) => b.consignmentNumber === consignmentNumber);
      } catch (error) {
        console.error('Error parsing manifest data:', error);
      }
    }

    // If in manifest, show "Ready to Dispatch" status
    if (isInManifest) {
      const config = {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: Clock,
        label: 'Ready to Dispatch'
      };
      const Icon = config.icon;

      return (
        <Badge className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      );
    }

    const statusConfig = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle, label: 'Confirmed' },
      in_transit: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Truck, label: 'In Transit' },
      delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleRow = (bookingId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <MedicineSidebar 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} 
      />
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <div className="space-y-6 pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Booking History</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage your medicine shipment bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchBookings}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/medicine/booking')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="text-xl font-semibold">{bookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-xl font-semibold">{bookings.filter(b => b.status === 'pending').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ready to Dispatch</p>
                      <p className="text-xl font-semibold">
                        {(() => {
                          const storedManifest = localStorage.getItem('medicineManifest');
                          if (storedManifest) {
                            try {
                              const manifestArray = JSON.parse(storedManifest);
                              return manifestArray.length;
                            } catch (error) {
                              return 0;
                            }
                          }
                          return 0;
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Transit</p>
                      <p className="text-xl font-semibold">{bookings.filter(b => b.status === 'in_transit').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivered</p>
                      <p className="text-xl font-semibold">{bookings.filter(b => b.status === 'delivered').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cancelled</p>
                      <p className="text-xl font-semibold">{bookings.filter(b => b.status === 'cancelled').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Booking Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading bookings...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bookings</h3>
                  <p className="text-gray-500 text-center max-w-md mb-4">{error}</p>
                  <Button
                    onClick={fetchBookings}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">You haven't created any medicine shipment bookings yet.</p>
                  <Button
                    onClick={() => navigate('/medicine/booking')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Booking
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => {
                          const isExpanded = expandedRows.has(booking._id);
                          return (
                            <React.Fragment key={booking._id}>
                              <tr 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => toggleRow(booking._id)}
                              >
                                <td className="py-4 px-6">
                                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-medium text-gray-900">#{booking.consignmentNumber || booking.bookingReference}</div>
                                  <div className="text-sm text-gray-500 mt-1">{booking.shipment.services}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="text-sm text-gray-900">{formatShortDate(booking.createdAt)}</div>
                                  <div className="text-xs text-gray-500">{booking.shipment.mode}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="font-medium">{booking.origin.city}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-medium">{booking.destination.city}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{booking.origin.state} to {booking.destination.state}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="text-sm text-gray-900">{booking.package.totalPackages}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-medium text-gray-900">₹{parseFloat(booking.invoice.invoiceValue).toLocaleString()}</div>
                                </td>
                                <td className="py-4 px-6">
                                  {getStatusBadge(booking.status, booking.consignmentNumber)}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-gray-50">
                                  <td colSpan={7} className="px-6 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                      {/* Origin Details */}
                                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-blue-500" />
                                          Origin
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{booking.origin.name}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="font-medium text-gray-900">{booking.origin.city}, {booking.origin.state}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Pincode</p>
                                            <p className="font-medium text-gray-900">{booking.origin.pincode}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Destination Details */}
                                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-green-500" />
                                          Destination
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{booking.destination.name}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="font-medium text-gray-900">{booking.destination.city}, {booking.destination.state}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Pincode</p>
                                            <p className="font-medium text-gray-900">{booking.destination.pincode}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Shipment Details */}
                                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <Truck className="h-4 w-4 text-purple-500" />
                                          Shipment
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <p className="text-xs text-gray-500">Nature</p>
                                            <p className="font-medium text-gray-900">{booking.shipment.natureOfConsignment}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Weight</p>
                                            <p className="font-medium text-gray-900">{booking.shipment.actualWeight} kg</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Chargeable</p>
                                            <p className="font-medium text-gray-900">{booking.shipment.chargeableWeight} kg</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Billing Details */}
                                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <CreditCard className="h-4 w-4 text-amber-500" />
                                          Billing
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <p className="text-xs text-gray-500">Freight Charge</p>
                                            <p className="font-medium text-gray-900">₹{booking.charges?.freightCharge ? parseFloat(booking.charges.freightCharge).toLocaleString() : 'N/A'}</p>
                                          </div>
                                          {booking.billing?.gst === 'Yes' && booking.charges?.gstAmount && (
                                            <div>
                                              <p className="text-xs text-gray-500">GST (18%)</p>
                                              <p className="font-medium text-gray-900">₹{parseFloat(booking.charges.gstAmount).toLocaleString()}</p>
                                            </div>
                                          )}
                                          {booking.charges && booking.charges.grandTotal && (
                                            <div>
                                              <p className="text-xs text-gray-500">Grand Total</p>
                                              <p className="font-medium text-gray-900">₹{parseFloat(booking.charges.grandTotal).toLocaleString()}</p>
                                            </div>
                                          )}
                                          <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <div className="mt-1">{getStatusBadge(booking.status, booking.consignmentNumber)}</div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Coloader Details - Show only if coloader is assigned */}
                                      {booking.coloaderId && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <Warehouse className="h-4 w-4 text-purple-500" />
                                            Coloader
                                          </h4>
                                          <div className="space-y-3 text-sm">
                                            <div>
                                              <p className="text-xs text-gray-500">Bus Number</p>
                                              <p className="font-medium text-gray-900">
                                                {typeof booking.coloaderId === 'object' ? booking.coloaderId.busNumber : 'N/A'}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">Phone Number</p>
                                              <p className="font-medium text-gray-900 flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-gray-400" />
                                                {typeof booking.coloaderId === 'object' ? booking.coloaderId.phoneNumber : 'N/A'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MedicineHistory;

