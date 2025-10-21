import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  MapPin,
  Weight,
  Edit,
  Check,
  X,
  Scan,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AddressFormData {
  _id: string;
  consignmentNumber?: number;
  originData?: {
    name: string;
    city: string;
    state: string;
    pincode: string;
    flatBuilding?: string;
    locality?: string;
    landmark?: string;
    area?: string;
    district?: string;
  };
  destinationData?: {
    name: string;
    city: string;
    state: string;
    pincode: string;
    flatBuilding?: string;
    locality?: string;
    landmark?: string;
    area?: string;
    district?: string;
  };
  shipmentData?: {
    actualWeight: number;
    totalPackages: string;
    natureOfConsignment: string;
  };
  senderName?: string;
  senderCity?: string;
  senderState?: string;
  senderPincode?: string;
  senderAddressLine1?: string;
  senderAddressLine2?: string;
  senderLandmark?: string;
  senderArea?: string;
  senderDistrict?: string;
  receiverName?: string;
  receiverCity?: string;
  receiverState?: string;
  receiverPincode?: string;
  receiverAddressLine1?: string;
  receiverAddressLine2?: string;
  receiverLandmark?: string;
  receiverArea?: string;
  receiverDistrict?: string;
  formCompleted: boolean;
  createdAt: string;
  assignmentData?: {
    assignedColoader?: string;
    assignedColoaderName?: string;
    assignedAt?: string;
    totalLegs?: number;
    legAssignments?: Array<{
      legNumber: number;
      coloaderId: string;
      coloaderName: string;
      assignedAt: string;
      assignedBy: string;
    }>;
    status?: 'booked' | 'assigned' | 'partially_assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'received';
  };
}

const ReceivedConsignment = () => {
  const [activeTab, setActiveTab] = useState<'newReceived' | 'receivedList'>('newReceived');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedOrders, setScannedOrders] = useState<AddressFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [receivedOrders, setReceivedOrders] = useState<AddressFormData[]>([]);
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [showAlreadyScannedPopup, setShowAlreadyScannedPopup] = useState(false);
  const { toast } = useToast();

  // Fetch received consignments
  const fetchReceivedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/addressforms?status=received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setReceivedOrders(result.data || []);
      } else {
        throw new Error('Failed to fetch received consignments');
      }
    } catch (error) {
      console.error('Error fetching received consignments:', error);
      toast({
        title: "Error",
        description: "Failed to load received consignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle barcode scan and auto-mark as received
  const handleBarcodeScan = async (consignmentNumber: string) => {
    if (!consignmentNumber.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/addressforms/consignment/${consignmentNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          // Check if order is already received
          if (result.data.assignmentData?.status === 'received') {
            // Show "Already Scanned Order" popup for 2 seconds
            setShowAlreadyScannedPopup(true);
            setTimeout(() => {
              setShowAlreadyScannedPopup(false);
            }, 2000);
            
            // Clear the input
            setBarcodeInput('');
            return;
          }
          
          // Automatically mark as received
          await markOrderAsReceived(result.data);
          toast({
            title: "Order Received",
            description: `Consignment ${consignmentNumber} marked as received`,
          });
        } else {
          toast({
            title: "No order found",
            description: `No order found with consignment number ${consignmentNumber}`
          });
          setBarcodeInput('');
        }
      } else if (response.status === 404) {
        toast({
          title: "No order found",
          description: `No order found with consignment number ${consignmentNumber}`
        });
        setBarcodeInput('');
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast({
        title: "Error",
        description: "Failed to scan order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle barcode input change
  const handleBarcodeInputChange = (value: string) => {
    setBarcodeInput(value);
    // Auto-trigger scan when barcode is entered (simulating barcode scanner)
    if (value.length >= 6) {
      handleBarcodeScan(value);
    }
  };

  // Mark order as received and add to scanned orders list
  const markOrderAsReceived = async (order: AddressFormData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/mark-order-received', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order._id,
          newWeight: order.shipmentData?.actualWeight
        })
      });

      if (response.ok) {
        // Add to scanned orders list
        setScannedOrders(prev => [order, ...prev]);
        setBarcodeInput('');
        // Refresh received orders list
        fetchReceivedOrders();
        
        // Dispatch custom event to notify other components
        const statusChangeEvent = new CustomEvent('orderStatusChanged', {
          detail: {
            orderId: order._id,
            consignmentNumber: order.consignmentNumber,
            newStatus: 'received',
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(statusChangeEvent);
      } else {
        throw new Error('Failed to mark order as received');
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as received",
        variant: "destructive"
      });
    }
  };

  // Handle weight update for scanned orders
  const handleWeightUpdate = async (orderId: string, newWeight: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/mark-order-received', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          newWeight
        })
      });

      if (response.ok) {
        // Update the scanned orders list
        setScannedOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, shipmentData: { ...order.shipmentData, actualWeight: newWeight } }
              : order
          )
        );
        setEditingWeight(null);
        setNewWeight('');
        toast({
          title: "Success",
          description: "Weight updated successfully",
        });
        
        // Dispatch custom event to notify other components about weight update
        const weightUpdateEvent = new CustomEvent('orderWeightUpdated', {
          detail: {
            orderId,
            newWeight,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(weightUpdateEvent);
      } else {
        throw new Error('Failed to update weight');
      }
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight",
        variant: "destructive"
      });
    }
  };

  // Get location string
  const getLocationString = (form: AddressFormData, isOrigin: boolean) => {
    if (isOrigin) {
      if (form.originData) {
        return `${form.originData.city}, ${form.originData.state}`;
      }
      return `${form.senderCity || 'N/A'}, ${form.senderState || 'N/A'}`;
    } else {
      if (form.destinationData) {
        return `${form.destinationData.city}, ${form.destinationData.state}`;
      }
      return `${form.receiverCity || 'N/A'}, ${form.receiverState || 'N/A'}`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (activeTab === 'receivedList') {
      fetchReceivedOrders();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibr', fontSize: '32px' }}>
                Received Consignments
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                Manage received consignments and barcode scanning
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('newReceived')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
                activeTab === 'newReceived'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Scan className="h-4 w-4" />
              <span className="font-medium">New Received</span>
            </button>
            <button
              onClick={() => setActiveTab('receivedList')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
                activeTab === 'receivedList'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="font-medium">Received List</span>
            </button>
          </div>

          {/* New Received Tab */}
          {activeTab === 'newReceived' && (
            <div className="space-y-4">
              {/* Minimal Barcode Scanner Input - Top Left */}
              <div className="flex justify-start">
                <div className="w-80">
                  <Input
                    type="text"
                    placeholder="Scan barcode or enter consignment number"
                    value={barcodeInput}
                    onChange={(e) => handleBarcodeInputChange(e.target.value)}
                    className="text-center text-lg border-2 border-blue-300 focus:border-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Already Scanned Order Popup */}
              {showAlreadyScannedPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Already Scanned Order</h3>
                      <p className="text-gray-600">This order has already been received</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanned Orders List - One-liner format */}
              {scannedOrders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Recently Scanned Orders</h3>
                  {scannedOrders.map((order) => (
                    <div key={order._id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-blue-600">{order.consignmentNumber}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">
                              {getLocationString(order, true)} → {getLocationString(order, false)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Weight className="h-4 w-4 text-orange-500" />
                            {editingWeight === order._id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={newWeight}
                                  onChange={(e) => setNewWeight(e.target.value)}
                                  className="w-16 h-8 text-sm"
                                  step="0.1"
                                  autoFocus
                                />
                                <span className="text-xs">kg</span>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (newWeight) {
                                      handleWeightUpdate(order._id, parseFloat(newWeight));
                                    }
                                  }}
                                  className="h-6 px-2"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setEditingWeight(null);
                                    setNewWeight('');
                                  }}
                                  variant="outline"
                                  className="h-6 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{order.shipmentData?.actualWeight || 'N/A'} kg</span>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setEditingWeight(order._id);
                                    setNewWeight(order.shipmentData?.actualWeight?.toString() || '');
                                  }}
                                  variant="outline"
                                  className="h-6 px-2"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Received
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Received List Tab */}
          {activeTab === 'receivedList' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Received Consignments ({receivedOrders.length})</h3>
                <Button
                  onClick={fetchReceivedOrders}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading received consignments...</p>
                </div>
              ) : receivedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Received Consignments</h3>
                  <p className="text-gray-600">No consignments have been marked as received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedOrders.map((order) => (
                    <Card key={order._id} className="border-green-200 bg-green-50/30">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium">{order.consignmentNumber}</p>
                              <p className="text-xs text-gray-500">Consignment</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm">
                                {getLocationString(order, true)} → {getLocationString(order, false)}
                              </p>
                              <p className="text-xs text-gray-500">Route</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm">{order.shipmentData?.actualWeight || 'N/A'} kg</p>
                              <p className="text-xs text-gray-500">Weight</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Received
                            </Badge>
                            <div>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivedConsignment;
