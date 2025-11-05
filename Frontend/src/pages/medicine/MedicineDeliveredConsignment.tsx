import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  Package, 
  MapPin,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
    city: string;
    state: string;
  };
  destination: {
    name: string;
    mobileNumber: string;
    email: string;
    companyName?: string;
    city: string;
    state: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MedicineDeliveredConsignment: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<MedicineBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
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
    fetchInTransitBookings();
  }, []);

  const fetchInTransitBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('medicineToken');
      
      const response = await fetch('/api/medicine/bookings?status=in_transit', {
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

      // Remove the booking from the list since it's no longer in_transit
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking._id !== bookingId)
      );

      toast({
        title: "Success",
        description: "Consignment marked as delivered successfully",
      });
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to update status',
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleComplete = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'delivered');
  };

  const formatRoute = (origin: MedicineBooking['origin'], destination: MedicineBooking['destination']) => {
    return `${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <MedicineSidebar 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} 
      />
      <main className={`${isSidebarCollapsed ? 'ml-16 w-[calc(100vw-4rem)]' : 'ml-64 w-[calc(100vw-16rem)]'} h-screen overflow-y-auto p-6 transition-all duration-300 ease-in-out`}>
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibri', fontSize: '32px' }}>
                    Delivered Consignment
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                    Complete dispatched consignments ({bookings.length})
                  </p>
                </div>
              </div>
              <button
                onClick={fetchInTransitBookings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading dispatched consignments...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={fetchInTransitBookings}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No Dispatched Consignments</p>
                  <p className="text-gray-500 text-sm mt-2">All dispatched consignments have been marked as delivered</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isUpdating = updatingStatus[booking._id] || false;

                  return (
                    <Card key={booking._id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  #{booking.consignmentNumber || booking.bookingReference}
                                </p>
                                <p className="text-xs text-gray-500">Consignment</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-700">{formatRoute(booking.origin, booking.destination)}</p>
                                <p className="text-xs text-gray-500">Route</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-700">{booking.destination.mobileNumber}</p>
                                <p className="text-xs text-gray-500">Receiver Phone</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-purple-100 text-purple-800">
                                Dispatched
                              </Badge>
                              <div>
                                <p className="text-xs text-gray-500">{formatDate(booking.updatedAt)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <button
                              onClick={() => handleComplete(booking._id)}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Complete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MedicineDeliveredConsignment;

