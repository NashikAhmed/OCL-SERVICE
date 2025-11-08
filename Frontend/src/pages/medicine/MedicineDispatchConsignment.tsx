import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  Package, 
  Search, 
  RefreshCw, 
  MapPin,
  Loader2,
  Scan,
  Send,
  CheckCircle,
  AlertCircle,
  Truck,
  Calendar,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    city: string;
    state: string;
  };
  destination: {
    name: string;
    mobileNumber: string;
    email: string;
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
  invoice?: {
    invoiceNumber?: string;
  };
  createdAt: string;
}

interface PathInfo {
  path: string;
  count: number;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
}

const MedicineDispatchConsignment: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAlreadyDispatchedPopup, setShowAlreadyDispatchedPopup] = useState(false);
  const [showPathMismatchPopup, setShowPathMismatchPopup] = useState(false);
  const [manifestData, setManifestData] = useState<MedicineBooking[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<PathInfo[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);
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
    
    // Load manifest data from localStorage
    loadManifestData();
    
    // Fetch paths with pending orders
    fetchPaths();
  }, [navigate]);

  // Fetch paths with pending orders
  const fetchPaths = async () => {
    try {
      setLoadingPaths(true);
      const token = localStorage.getItem('medicineToken');
      const response = await fetch('/api/medicine/paths/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.paths) {
          setPaths(result.paths);
        }
      }
    } catch (error) {
      console.error('Error fetching paths:', error);
      toast({
        title: "Error",
        description: "Failed to fetch paths",
        variant: "destructive"
      });
    } finally {
      setLoadingPaths(false);
    }
  };

  // Helper function to create path key from booking
  const makePathKey = (booking: MedicineBooking): string => {
    const originCity = booking.origin?.city || 'N/A';
    const originState = booking.origin?.state || 'N/A';
    const destinationCity = booking.destination?.city || 'N/A';
    const destinationState = booking.destination?.state || 'N/A';
    return `${originCity}, ${originState} → ${destinationCity}, ${destinationState}`;
  };

  // Load manifest data from localStorage
  const loadManifestData = () => {
    const storedManifest = localStorage.getItem('medicineManifest');
    if (storedManifest) {
      try {
        setManifestData(JSON.parse(storedManifest));
      } catch (error) {
        console.error('Error parsing manifest data:', error);
        setManifestData([]);
      }
    }
  };

  // Handle barcode scan and directly add to manifest
  const handleBarcodeScan = async (consignmentNumber: string) => {
    if (!consignmentNumber.trim()) return;

    // Check if path is selected
    if (!selectedPath) {
      toast({
        title: "Select a Path",
        description: "Please select a path before scanning",
        variant: "destructive"
      });
      setBarcodeInput('');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('medicineToken');
      const response = await fetch(`/api/medicine/bookings/consignment/${consignmentNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          // Check if booking is already dispatched
          if (result.data.status === 'in_transit' || result.data.status === 'delivered') {
            // Show "Already Dispatched" popup for 2 seconds
            setShowAlreadyDispatchedPopup(true);
            setTimeout(() => {
              setShowAlreadyDispatchedPopup(false);
            }, 2000);
            
            // Clear the input
            setBarcodeInput('');
            return;
          }

          // Check if booking is pending
          if (result.data.status !== 'pending') {
            toast({
              title: "Invalid Status",
              description: `Consignment ${consignmentNumber} is not in pending status`,
              variant: "destructive"
            });
            setBarcodeInput('');
            return;
          }
          
          // Check if path matches selected path
          const bookingPath = makePathKey(result.data);
          if (bookingPath !== selectedPath) {
            // Show path mismatch popup for 2 seconds
            setShowPathMismatchPopup(true);
            setTimeout(() => {
              setShowPathMismatchPopup(false);
            }, 2000);
            setBarcodeInput('');
            return;
          }
          
          // Check if consignment already exists in manifest
          const existsInManifest = manifestData.some(booking => booking.consignmentNumber === result.data.consignmentNumber);
          if (existsInManifest) {
            toast({
              title: "Already in Manifest",
              description: `Consignment ${consignmentNumber} is already in the manifest`,
              variant: "destructive"
            });
            setBarcodeInput('');
            return;
          }
          
          // Directly add to manifest (no queue needed)
          const booking = { ...result.data };
          
          // Save to localStorage for the manifest section
          const existingManifest = localStorage.getItem('medicineManifest');
          let manifestArray = existingManifest ? JSON.parse(existingManifest) : [];
          
          // Check if consignment already exists in localStorage
          const existsInStorage = manifestArray.some((b: MedicineBooking) => b.consignmentNumber === result.data.consignmentNumber);
          if (existsInStorage) {
            toast({
              title: "Already in Manifest",
              description: `Consignment ${consignmentNumber} is already in the manifest`,
              variant: "destructive"
            });
            setBarcodeInput('');
            return;
          }
          
          manifestArray = [booking, ...manifestArray];
          localStorage.setItem('medicineManifest', JSON.stringify(manifestArray));
          
          // Update manifest data state
          setManifestData(manifestArray);
          
          // Show success message
          toast({
            title: "Added to Manifest",
            description: `Consignment ${consignmentNumber} added to manifest`,
          });
          
          // Clear the input
          setBarcodeInput('');
        } else {
          toast({
            title: "No booking found",
            description: `No booking found with consignment number ${consignmentNumber}`,
            variant: "destructive"
          });
          setBarcodeInput('');
        }
      } else if (response.status === 404) {
        toast({
          title: "No booking found",
          description: `No booking found with consignment number ${consignmentNumber}`,
          variant: "destructive"
        });
        setBarcodeInput('');
      } else {
        throw new Error('Failed to fetch booking');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast({
        title: "Error",
        description: "Failed to scan consignment",
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

  // Calculate totals for manifest
  const calculateTotals = () => {
    return manifestData.reduce(
      (totals, booking) => {
        const weight = (booking?.shipment?.chargeableWeight as number) || parseFloat(booking?.shipment?.actualWeight || '0') || 0;
        const units = parseInt(booking?.package?.totalPackages || '0', 10) || 0;
        
        return {
          totalWeight: totals.totalWeight + weight,
          totalUnits: totals.totalUnits + units
        };
      },
      { totalWeight: 0, totalUnits: 0 }
    );
  };

  const totals = calculateTotals();

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    localStorage.removeItem('medicineManifest');
    navigate('/medicine');
  };

  // Submit manifest to backend
  const handleSubmitManifest = async () => {
    if (manifestData.length === 0) return;
    if (!selectedPath) {
      toast({
        title: 'Error',
        description: 'Please select a path before submitting',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSubmitting(true);
      setSubmitSuccess(false);
      const token = localStorage.getItem('medicineToken');
      const consignmentNumbers = manifestData
        .map((b) => b.consignmentNumber)
        .filter((n): n is number => typeof n === 'number');

      const response = await fetch('/api/medicine/manifests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          consignmentNumbers,
          path: selectedPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create manifest');
      }

      const result = await response.json();
      toast({
        title: 'Manifest Submitted',
        description: `Manifest ${result?.manifest?.manifestNumber || ''} submitted successfully with ${result?.manifest?.totalCount || manifestData.length} consignments.`
      });
      
      // Show success animation
      setSubmitSuccess(true);
      
      // Clear manifest data after successful submission
      setManifestData([]);
      localStorage.removeItem('medicineManifest');
      
      // Clear selected path
      setSelectedPath(null);
      
      // Refresh paths list
      fetchPaths();
      
      // Reset success state after animation
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting manifest:', error);
      toast({ title: 'Error', description: 'Failed to submit manifest', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle path selection change
  const handlePathChange = (path: string) => {
    setSelectedPath(path);
    // Clear manifest when path changes
    setManifestData([]);
    localStorage.removeItem('medicineManifest');
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
              <h1 className="text-2xl font-semibold text-gray-900">Dispatch Consignment</h1>
              <p className="text-sm text-gray-500 mt-1">Select a path and scan consignment numbers to mark as dispatched</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                fetchPaths();
                loadManifestData();
              }}
              className="flex items-center gap-2"
              disabled={loadingPaths}
            >
              <RefreshCw className={`h-4 w-4 ${loadingPaths ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Path Selection Dropdown */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Select Path
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-w-2xl">
                <Select value={selectedPath || ''} onValueChange={handlePathChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingPaths ? "Loading paths..." : "Select a path to dispatch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {paths.length === 0 ? (
                      <SelectItem value="no-paths" disabled>
                        No paths with pending orders
                      </SelectItem>
                    ) : (
                      paths.map((pathInfo) => (
                        <SelectItem key={pathInfo.path} value={pathInfo.path}>
                          <div className="flex items-center justify-between w-full">
                            <span>{pathInfo.path}</span>
                            <Badge variant="outline" className="ml-2">
                              {pathInfo.count} orders
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedPath && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected path: <span className="font-medium">{selectedPath}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scanner Section */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Scan className="h-5 w-5 text-blue-600" />
                Scan Consignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Scan barcode or enter consignment number"
                    value={barcodeInput}
                    onChange={(e) => handleBarcodeInputChange(e.target.value)}
                    className="text-center text-lg py-6 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                    autoFocus
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Place barcode in scanner or manually enter consignment number
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Already Dispatched Popup */}
          {showAlreadyDispatchedPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm mx-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Already Dispatched</h3>
                  <p className="text-gray-600">This consignment has already been dispatched</p>
                </div>
              </div>
            </div>
          )}

          {/* Path Mismatch Popup */}
          {showPathMismatchPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm mx-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Path Mismatch</h3>
                  <p className="text-gray-600">This consignment does not belong to the selected path</p>
                </div>
              </div>
            </div>
          )}

          {/* Manifest Section */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Dispatched Consignments Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {manifestData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-600">
                          <th className="px-3 py-2 border-b">Sr. No</th>
                          <th className="px-3 py-2 border-b">AWB / Docket No</th>
                          <th className="px-3 py-2 border-b">Destination</th>
                          <th className="px-3 py-2 border-b">Units</th>
                          <th className="px-3 py-2 border-b">Weight (Kg)</th>
                          <th className="px-3 py-2 border-b">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {manifestData.map((booking, idx) => {
                          const weight = (booking?.shipment?.chargeableWeight as number) || parseFloat(booking?.shipment?.actualWeight || '0') || 0;
                          const units = parseInt(booking?.package?.totalPackages || '0', 10) || 0;
                          return (
                            <tr key={booking._id} className="odd:bg-white even:bg-gray-50">
                              <td className="px-3 py-2 border-b text-gray-700">{idx + 1}</td>
                              <td className="px-3 py-2 border-b font-medium text-gray-900">{booking.consignmentNumber}</td>
                              <td className="px-3 py-2 border-b text-gray-700">{booking.destination.city}, {booking.destination.state}</td>
                              <td className="px-3 py-2 border-b text-gray-700">{units || '-'}</td>
                              <td className="px-3 py-2 border-b text-gray-700">{weight ? weight.toFixed(2) : '-'}</td>
                              <td className="px-3 py-2 border-b text-gray-400">—</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 text-sm">
                          <td className="px-3 py-2 border-t font-semibold" colSpan={3}>Total</td>
                          <td className="px-3 py-2 border-t font-semibold">{totals.totalUnits}</td>
                          <td className="px-3 py-2 border-t font-semibold">{totals.totalWeight.toFixed(2)}</td>
                          <td className="px-3 py-2 border-t"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {/* Submit Manifest Button */}
                  <div className="p-4 border-t border-gray-200 flex justify-end">
                    <Button 
                      onClick={handleSubmitManifest} 
                      disabled={submitting}
                      className="flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : submitSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Submitted!
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Manifest
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Package className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manifest Data</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No consignments have been dispatched yet. Scan consignment numbers above to add them to the manifest.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empty State */}
          {!loading && barcodeInput === '' && manifestData.length === 0 && (
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Scan className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Dispatch</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Scan or enter consignment numbers to mark them as dispatched. 
                    All dispatched consignments will appear in the manifest above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineDispatchConsignment;