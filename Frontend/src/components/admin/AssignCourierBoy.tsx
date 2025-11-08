import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Truck,
  Package,
  Building,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Search,
  RefreshCw,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShipmentData {
  _id: string;
  bookingReference: string;
  consignmentNumber?: number;
  originData: {
    name: string;
    companyName: string;
    mobileNumber: string;
    city: string;
    state: string;
  };
  destinationData: {
    name: string;
    companyName: string;
    mobileNumber: string;
    city: string;
    state: string;
  };
  shipmentData: {
    natureOfConsignment: string;
    actualWeight: string;
    totalPackages: string;
  };
  invoiceData: {
    finalPrice: number;
  };
  paymentStatus: 'paid' | 'unpaid';
  paymentType: 'FP' | 'TP';
  bookingDate: string;
  assignedCourierBoy?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  assignedCourierBoyAt?: string | null;
}

interface CorporateGroup {
  corporate: {
    _id: string;
    corporateId: string;
    companyName: string;
    email: string;
    contactNumber: string;
  };
  shipments: ShipmentData[];
}

interface CourierBoy {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  area: string;
  status: string;
}

const AssignCourierBoy = () => {
  const [corporateGroups, setCorporateGroups] = useState<CorporateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [selectedCorporateGroup, setSelectedCorporateGroup] = useState<CorporateGroup | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [courierBoys, setCourierBoys] = useState<CourierBoy[]>([]);
  const [loadingCourierBoys, setLoadingCourierBoys] = useState(false);
  const [selectedCourierBoyId, setSelectedCourierBoyId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  // Fetch shipments grouped by corporate
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/admin/shipments/grouped-by-corporate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch shipments');
      }
      
      const data = await response.json();
      console.log('Fetched shipments:', data); // Debug log
      
      if (data.success && data.data) {
        setCorporateGroups(data.data || []);
      } else {
        setCorporateGroups([]);
      }
      
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load shipments. Please try again.",
        variant: "destructive",
      });
      setCorporateGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Fetch courier boys
  const fetchCourierBoys = async () => {
    try {
      setLoadingCourierBoys(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/courier-boy?status=approved&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourierBoys(data.courierBoys || []);
        }
      }
    } catch (error) {
      console.error('Error fetching courier boys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courier boys",
        variant: "destructive"
      });
    } finally {
      setLoadingCourierBoys(false);
    }
  };

  // Handle assign click for a corporate group
  const handleAssignClick = (group: CorporateGroup) => {
    setSelectedCorporateGroup(group);
    // Select all shipments in this group that don't have a courier assigned
    const unassignedShipmentIds = group.shipments
      .filter(s => !s.assignedCourierBoy)
      .map(s => s._id);
    setSelectedShipmentIds(unassignedShipmentIds);
    setSelectedCourierBoyId('');
    setShowAssignModal(true);
    fetchCourierBoys();
  };

  // Handle assign click for individual shipment
  const handleAssignIndividualClick = (group: CorporateGroup, shipmentId: string) => {
    setSelectedCorporateGroup(group);
    setSelectedShipmentIds([shipmentId]);
    setSelectedCourierBoyId('');
    setShowAssignModal(true);
    fetchCourierBoys();
  };

  // Handle assign courier to shipments
  const handleAssignCourier = async () => {
    if (!selectedCorporateGroup || !selectedCourierBoyId || selectedShipmentIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select a courier boy and at least one shipment",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssigning(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Assign courier to all selected shipments
      const assignmentPromises = selectedShipmentIds.map(shipmentId =>
        fetch(`/api/admin/shipments/${shipmentId}/assign-courier`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ courierBoyId: selectedCourierBoyId })
        })
      );

      const results = await Promise.all(assignmentPromises);
      const failed = results.filter(r => !r.ok);

      if (failed.length > 0) {
        throw new Error(`Failed to assign ${failed.length} shipment(s)`);
      }

      toast({
        title: "Success",
        description: `Courier boy assigned to ${selectedShipmentIds.length} shipment(s) successfully`,
      });
      
      // Refresh shipments
      await fetchShipments();
      
      setShowAssignModal(false);
      setSelectedCorporateGroup(null);
      setSelectedShipmentIds([]);
      setSelectedCourierBoyId('');
    } catch (error) {
      console.error('Error assigning courier boy:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign courier boy",
        variant: "destructive"
      });
    } finally {
      setAssigning(false);
    }
  };

  // Filter corporate groups based on search
  const filteredGroups = corporateGroups.filter(group => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      group.corporate.companyName.toLowerCase().includes(term) ||
      group.corporate.corporateId.toLowerCase().includes(term) ||
      group.shipments.some(s => 
        s.consignmentNumber?.toString().includes(term) ||
        s.bookingReference.toLowerCase().includes(term)
      )
    );
  });

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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Assign Courier Boy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading shipments...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Assign Courier Boy
              </CardTitle>
              <p className="text-gray-600 mt-1">Assign courier boys to corporate shipments</p>
            </div>
            <Button onClick={fetchShipments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company name, corporate ID, or consignment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Corporates</p>
                    <p className="text-2xl font-bold text-gray-900">{corporateGroups.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {corporateGroups.reduce((sum, group) => sum + group.shipments.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unassigned Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {corporateGroups.reduce((sum, group) => 
                        sum + group.shipments.filter(s => !s.assignedCourierBoy).length, 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Corporate Groups */}
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {corporateGroups.length === 0 
                    ? "No corporate shipments available" 
                    : "No shipments match your search criteria"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {corporateGroups.length === 0
                    ? "Corporate accounts will appear here once they create bookings. Check back later or ensure corporate accounts have made shipments."
                    : "Try adjusting your search terms to find shipments."}
                </p>
                {corporateGroups.length === 0 && (
                  <Button onClick={fetchShipments} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredGroups.map((group, groupIndex) => (
                <Card key={group.corporate._id} className={groupIndex > 0 ? "border-t-4 border-blue-300 shadow-md" : "shadow-md"}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-xl font-bold text-gray-800">
                            {group.corporate.companyName}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">ID:</span>
                            <span>{group.corporate.corporateId}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{group.corporate.contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{group.shipments.length} shipment(s)</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAssignClick(group)}
                        disabled={group.shipments.filter(s => !s.assignedCourierBoy).length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Assign Courier Boy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Consignment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Origin</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Destination</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Weight</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Assigned Courier</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.shipments.map((shipment) => (
                            <tr key={shipment._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">
                                {shipment.consignmentNumber || shipment.bookingReference}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <div className="font-medium">{shipment.originData.name}</div>
                                  <div className="text-gray-500 text-xs">{shipment.originData.city}, {shipment.originData.state}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <div className="font-medium">{shipment.destinationData.name}</div>
                                  <div className="text-gray-500 text-xs">{shipment.destinationData.city}, {shipment.destinationData.state}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">{shipment.shipmentData.actualWeight || 'N/A'} kg</td>
                              <td className="px-4 py-3 text-sm font-medium">₹{shipment.invoiceData.finalPrice?.toFixed(2) || '0.00'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(shipment.bookingDate)}</td>
                              <td className="px-4 py-3 text-sm">
                                {shipment.assignedCourierBoy ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3 text-green-600" />
                                      <span className="font-medium text-green-600">{shipment.assignedCourierBoy.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Phone className="h-3 w-3" />
                                      <span>{shipment.assignedCourierBoy.phone}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                                    <AlertCircle className="h-3 w-3" />
                                    Not Assigned
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <Badge 
                                  variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                  className={shipment.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                                >
                                  {shipment.paymentStatus === 'paid' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {shipment.paymentStatus}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {shipment.assignedCourierBoy ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Assigned
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAssignIndividualClick(group, shipment._id)}
                                    className="h-8 text-xs"
                                  >
                                    <Truck className="h-3 w-3 mr-1" />
                                    Assign
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Courier Modal */}
      <Dialog open={showAssignModal} onOpenChange={(open) => {
        if (!open && !assigning) {
          setShowAssignModal(false);
          setSelectedCorporateGroup(null);
          setSelectedShipmentIds([]);
          setSelectedCourierBoyId('');
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-600">
              <Truck className="h-5 w-5 mr-2" />
              Assign Courier Boy
            </DialogTitle>
          </DialogHeader>

          {selectedCorporateGroup && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Corporate Details
                </label>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <p className="text-sm">
                      <span className="font-medium">Company:</span> {selectedCorporateGroup.corporate.companyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Corporate ID:</span>
                    <Badge variant="outline">{selectedCorporateGroup.corporate.corporateId}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <p className="text-sm">{selectedCorporateGroup.corporate.contactNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200">
                    <Package className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold">
                      <span className="font-medium">Shipments to assign:</span> {selectedShipmentIds.length} shipment(s)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Courier Boy
                </label>
                {loadingCourierBoys ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Loading courier boys...</span>
                  </div>
                ) : courierBoys.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No approved courier boys available</p>
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {courierBoys.map((courier) => (
                      <div
                        key={courier._id}
                        onClick={() => setSelectedCourierBoyId(courier._id)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                          selectedCourierBoyId === courier._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900">{courier.fullName}</p>
                              {selectedCourierBoyId === courier._id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 ml-6">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                <span>{courier.phone}</span>
                              </div>
                              {courier.area && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{courier.area}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCorporateGroup(null);
                    setSelectedShipmentIds([]);
                    setSelectedCourierBoyId('');
                  }}
                  disabled={assigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCourier}
                  disabled={!selectedCourierBoyId || assigning || selectedShipmentIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Assign to {selectedShipmentIds.length} Shipment(s)
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignCourierBoy;
