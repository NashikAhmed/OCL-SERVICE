import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  Package, 
  Truck,
  Calendar,
  Send,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Phone,
  Warehouse,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface MedicineUserInfo {
  id: string;
  name: string;
  email: string;
}

interface Coloader {
  _id: string;
  phoneNumber: string;
  busNumber: string;
  isActive: boolean;
}

interface ManifestConsignment {
  bookingId: {
    _id: string;
    consignmentNumber: number;
    origin: {
      city: string;
      state: string;
    };
    destination: {
      city: string;
      state: string;
    };
    shipment?: {
      chargeableWeight?: number;
      actualWeight?: string;
    };
    package?: {
      totalPackages?: string;
    };
  };
  consignmentNumber: number;
}

interface Manifest {
  _id: string;
  manifestNumber: string;
  path: string;
  totalCount: number;
  status: 'submitted' | 'dispatched' | 'delivered';
  consignments: ManifestConsignment[];
  createdAt: string;
  coloaderId?: Coloader;
  contentDescription?: string;
}

const MedicineManifest: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [coloaders, setColoaders] = useState<Coloader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddColoader, setShowAddColoader] = useState(false);
  const [dispatchFormData, setDispatchFormData] = useState({
    contentDescription: '',
    coloaderId: '',
    coloaderDocketNo: ''
  });
  const [newColoaderData, setNewColoaderData] = useState({
    phoneNumber: '',
    busNumber: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
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

  // Fetch manifests and coloaders
  useEffect(() => {
    fetchManifests();
    fetchColoaders();
  }, []);

  const fetchManifests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('medicineToken');
      const response = await axios.get(`${API_BASE}/api/medicine/manifests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setManifests(response.data.data || []);
      } else {
        setError('Failed to fetch manifests');
      }
    } catch (error: any) {
      console.error('Error fetching manifests:', error);
      setError(error.response?.data?.message || 'Failed to fetch manifests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColoaders = async () => {
    try {
      const token = localStorage.getItem('medicineToken');
      const response = await axios.get(`${API_BASE}/api/medicine/coloaders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setColoaders(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching coloaders:', error);
    }
  };

  // Calculate totals for a manifest
  const calculateManifestTotals = (manifest: Manifest) => {
    return manifest.consignments.reduce(
      (totals, consignment) => {
        const booking = consignment.bookingId;
        const weight = (booking?.shipment?.chargeableWeight as number) || 
                      parseFloat(booking?.shipment?.actualWeight || '0') || 0;
        const units = parseInt(booking?.package?.totalPackages || '0', 10) || 0;
        
        return {
          totalWeight: totals.totalWeight + weight,
          totalUnits: totals.totalUnits + units
        };
      },
      { totalWeight: 0, totalUnits: 0 }
    );
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

  // Handle dispatch all button click
  const handleDispatchAllClick = () => {
    if (manifests.length === 0) {
      toast({
        title: 'No Manifests',
        description: 'No manifests available to dispatch',
        variant: 'destructive'
      });
      return;
    }
    setShowDispatchForm(true);
    setDispatchFormData({
      contentDescription: '',
      coloaderId: '',
      coloaderDocketNo: ''
    });
    setFormError(null);
  };

  // Handle form submission - dispatch all manifests
  const handleDispatchSubmit = async () => {
    if (!dispatchFormData.coloaderId) {
      setFormError('Please select a coloader');
      return;
    }

    if (manifests.length === 0) {
      setFormError('No manifests to dispatch');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      const token = localStorage.getItem('medicineToken');
      
      // Dispatch all manifests
      const dispatchPromises = manifests.map(manifest =>
        axios.post(
          `${API_BASE}/api/medicine/manifests/${manifest._id}/dispatch`,
          {
            coloaderId: dispatchFormData.coloaderId,
            contentDescription: dispatchFormData.contentDescription,
            coloaderDocketNo: dispatchFormData.coloaderDocketNo
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      const results = await Promise.allSettled(dispatchPromises);
      
      // Count successful and failed dispatches
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.data.success)).length;

      if (successful > 0) {
        toast({
          title: 'Dispatch Successful',
          description: `Successfully dispatched ${successful} manifest${successful > 1 ? 's' : ''}${failed > 0 ? ` (${failed} failed)` : ''}`
        });
        
        setShowDispatchForm(false);
        setDispatchFormData({
          contentDescription: '',
          coloaderId: '',
          coloaderDocketNo: ''
        });
        
        // Refresh manifests
        await fetchManifests();
      } else {
        const firstError = results.find(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.data.success));
        const errorMessage = firstError?.status === 'rejected' 
          ? firstError.reason?.response?.data?.message || 'Failed to dispatch manifests'
          : firstError?.status === 'fulfilled' 
            ? firstError.value.data.message || 'Failed to dispatch manifests'
            : 'Failed to dispatch manifests';
        setFormError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error dispatching manifests:', error);
      setFormError(error.response?.data?.message || 'Failed to dispatch manifests');
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to dispatch manifests',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add new coloader
  const handleAddColoader = async () => {
    if (!newColoaderData.phoneNumber.trim() || !newColoaderData.busNumber.trim()) {
      setFormError('Phone number and bus number are required');
      return;
    }

    if (!/^\d{10}$/.test(newColoaderData.phoneNumber)) {
      setFormError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const token = localStorage.getItem('medicineToken');
      const response = await axios.post(
        `${API_BASE}/api/medicine/coloaders`,
        {
          phoneNumber: newColoaderData.phoneNumber.trim(),
          busNumber: newColoaderData.busNumber.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Add to coloaders list
        setColoaders([...coloaders, response.data.data]);
        // Select the new coloader
        setDispatchFormData(prev => ({
          ...prev,
          coloaderId: response.data.data._id
        }));
        // Close add coloader form
        setShowAddColoader(false);
        setNewColoaderData({ phoneNumber: '', busNumber: '' });
        setFormError(null);
        
        toast({
          title: 'Coloader Added',
          description: 'New coloader added successfully'
        });
      }
    } catch (error: any) {
      console.error('Error adding coloader:', error);
      setFormError(error.response?.data?.message || 'Failed to add coloader');
    }
  };

  // Close dispatch form
  const closeDispatchForm = () => {
    setShowDispatchForm(false);
    setDispatchFormData({
      contentDescription: '',
      coloaderId: '',
      coloaderDocketNo: ''
    });
    setShowAddColoader(false);
    setNewColoaderData({ phoneNumber: '', busNumber: '' });
    setFormError(null);
  };

  // Calculate total consignments across all manifests
  const getTotalConsignments = () => {
    return manifests.reduce((total, manifest) => total + manifest.totalCount, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
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
        <div className="space-y-6 px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Ready to Dispatch</h1>
              <p className="text-sm text-gray-500 mt-1">View all submitted manifests ready for dispatch</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Manifests List */}
              {manifests.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Package className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manifests Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No submitted manifests found. Submit manifests from the "Dispatch Consignment" section.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {manifests.map((manifest) => {
                    const totals = calculateManifestTotals(manifest);
                    return (
                      <Card key={manifest._id} className="border-0 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                        <CardHeader className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-gray-800">
                                  Manifest {manifest.manifestNumber}
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                  {manifest.path} • Created: {formatDate(manifest.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1.5">
                                <span className="font-medium">{manifest.totalCount}</span>
                                <span className="ml-1">Consignments</span>
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                              <thead className="bg-gray-50">
                                <tr className="text-left text-xs text-gray-600">
                                  <th className="px-4 py-3 border-b">Sr. No</th>
                                  <th className="px-4 py-3 border-b">AWB / Docket No</th>
                                  <th className="px-4 py-3 border-b">Destination</th>
                                  <th className="px-4 py-3 border-b text-center">Units</th>
                                  <th className="px-4 py-3 border-b text-right">Weight (Kg)</th>
                                </tr>
                              </thead>
                              <tbody className="text-sm">
                                {manifest.consignments.map((consignment, idx) => {
                                  const booking = consignment.bookingId;
                                  const weight = (booking?.shipment?.chargeableWeight as number) || 
                                               parseFloat(booking?.shipment?.actualWeight || '0') || 0;
                                  const units = parseInt(booking?.package?.totalPackages || '0', 10) || 0;
                                  return (
                                    <tr key={consignment.bookingId._id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700 font-medium">{idx + 1}</td>
                                      <td className="px-4 py-3 border-b border-gray-100 font-semibold text-blue-600">
                                        {consignment.consignmentNumber}
                                      </td>
                                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700">
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4 text-gray-400" />
                                          <span>{booking.destination.city}, {booking.destination.state}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700 text-center">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                          {units || '-'}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700 text-right font-medium">
                                        {weight ? weight.toFixed(2) : '-'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td className="px-4 py-3 border-t border-gray-200 font-semibold text-gray-800" colSpan={3}>
                                    <div className="flex items-center gap-2">
                                      <span>Total</span>
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {manifest.totalCount} Consignments
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 border-t border-gray-200 font-semibold text-gray-800 text-center">
                                    {totals.totalUnits}
                                  </td>
                                  <td className="px-4 py-3 border-t border-gray-200 font-semibold text-gray-800 text-right">
                                    {totals.totalWeight.toFixed(2)} Kg
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {/* Dispatch All Button at Bottom */}
              {manifests.length > 0 && (
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleDispatchAllClick}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 text-lg"
                    size="lg"
                  >
                    <Send className="h-5 w-5" />
                    Dispatch All ({getTotalConsignments()} consignments)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Dispatch Form Modal */}
      {showDispatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dispatch All Manifests</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Dispatching {manifests.length} manifest{manifests.length > 1 ? 's' : ''} with {getTotalConsignments()} total consignment{getTotalConsignments() > 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={closeDispatchForm}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}

              <div>
                <label htmlFor="contentDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Description
                </label>
                <Textarea
                  id="contentDescription"
                  name="contentDescription"
                  value={dispatchFormData.contentDescription}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, contentDescription: e.target.value }))}
                  placeholder="Enter content description"
                  rows={3}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="coloaderDocketNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Co-Loader Docket No.
                </label>
                <Input
                  id="coloaderDocketNo"
                  name="coloaderDocketNo"
                  value={dispatchFormData.coloaderDocketNo}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, coloaderDocketNo: e.target.value }))}
                  placeholder="Enter co-loader docket number (optional)"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="coloaderId" className="block text-sm font-medium text-gray-700 mb-1">
                  Coloader (Bus Number) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    id="coloaderId"
                    value={dispatchFormData.coloaderId}
                    onChange={(e) => {
                      setDispatchFormData(prev => ({ ...prev, coloaderId: e.target.value }));
                      setFormError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="">Select Coloader</option>
                    {coloaders.map((coloader) => (
                      <option key={coloader._id} value={coloader._id}>
                        {coloader.busNumber} ({coloader.phoneNumber})
                      </option>
                    ))}
                  </select>
                  
                  {!showAddColoader ? (
                    <button
                      type="button"
                      onClick={() => setShowAddColoader(true)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 w-full"
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Coloader
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Add New Coloader</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddColoader(false);
                            setNewColoaderData({ phoneNumber: '', busNumber: '' });
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={newColoaderData.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setNewColoaderData(prev => ({ ...prev, phoneNumber: value }));
                          }}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                          className="w-full"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Bus Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={newColoaderData.busNumber}
                          onChange={(e) => setNewColoaderData(prev => ({ ...prev, busNumber: e.target.value }))}
                          placeholder="Enter bus number"
                          className="w-full"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddColoader}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting || !newColoaderData.phoneNumber || !newColoaderData.busNumber}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Coloader
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={closeDispatchForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDispatchSubmit}
                  disabled={!dispatchFormData.coloaderId || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Dispatch All ({manifests.length} manifest{manifests.length > 1 ? 's' : ''})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManifest;
