import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  Package, 
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  RefreshCw,
  Clock,
  Navigation,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicineUserInfo {
  id: string;
  name: string;
  email: string;
}

interface MedicineBooking {
  _id: string;
  bookingReference: string;
  consignmentNumber?: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
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
    packageImages: any[];
    contentDescription: string;
  };
  invoice: {
    invoiceNumber: string;
    invoiceValue: string;
    invoiceImages: any[];
    eWaybillNumber?: string;
    acceptTerms: boolean;
  };
  billing: {
    gst: string;
    partyType: string;
    billType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MedicineTracking: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<MedicineBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});
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

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
      const token = localStorage.getItem('medicineToken');
      
      const response = await fetch(`/api/medicine/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/medicine');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update the booking in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus as MedicineBooking['status'] }
            : booking
        )
      );
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleReached = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'delivered');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; border: string; label: string; icon: React.ElementType } } = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending', icon: Clock },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed', icon: CheckCircle },
      booked: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Booked', icon: CheckCircle },
      in_transit: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Dispatched', icon: Truck },
      delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Delivered', icon: CheckCircle },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Cancelled', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatRoute = (origin: MedicineBooking['origin'], destination: MedicineBooking['destination']) => {
    return `${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Shipment Tracking</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor the status of your medicine shipments</p>
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
                <Package className="h-4 w-4" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Shipments</p>
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
                      <AlertCircle className="h-5 w-5 text-red-600" />
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
                <Navigation className="h-5 w-5 text-blue-600" />
                Shipment Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading shipments...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading shipments</h3>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">You haven't created any medicine shipment bookings yet.</p>
                  <Button
                    onClick={() => navigate('/medicine/booking')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Package className="h-4 w-4" />
                    Create Your First Shipment
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => {
                          const isUpdating = updatingStatus[booking._id] || false;
                          const showReached = booking.status === 'in_transit';

                          return (
                            <tr 
                              key={booking._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="font-medium text-gray-900">#{booking.consignmentNumber || booking.bookingReference}</div>
                                <div className="text-sm text-gray-500 mt-1">{booking.shipment.services}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{booking.origin.city}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="font-medium">{booking.destination.city}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{booking.origin.state} to {booking.destination.state}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{formatDate(booking.createdAt)}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1 text-sm">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{booking.destination.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{booking.destination.mobileNumber}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {getStatusBadge(booking.status)}
                              </td>
                              <td className="py-4 px-6">
                                {showReached && (
                                  <Button
                                    onClick={() => handleReached(booking._id)}
                                    disabled={isUpdating}
                                    size="sm"
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                  >
                                    {isUpdating ? (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        Mark Delivered
                                      </>
                                    )}
                                  </Button>
                                )}
                                {!showReached && booking.status === 'delivered' && (
                                  <span className="text-xs text-gray-500">Completed</span>
                                )}
                                {!showReached && booking.status !== 'delivered' && booking.status !== 'in_transit' && (
                                  <span className="text-xs text-gray-500">Awaiting Dispatch</span>
                                )}
                              </td>
                            </tr>
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

export default MedicineTracking;