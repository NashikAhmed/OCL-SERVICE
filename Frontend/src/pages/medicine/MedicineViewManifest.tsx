import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  Package, 
  Truck,
  Calendar,
  Warehouse,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  updatedAt: string;
  coloaderId?: Coloader;
  contentDescription?: string;
}

const MedicineViewManifest: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const navigate = useNavigate();
  const financialYearMonths = [
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
  ];

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

  // Calculate current financial year (April to March)
  const getCurrentFinancialYear = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    // Financial year starts from April (month 4)
    if (currentMonth >= 4) {
      return now.getFullYear();
    } else {
      return now.getFullYear() - 1;
    }
  };

  // Generate available years (last 5 years + current year)
  useEffect(() => {
    const currentYear = getCurrentFinancialYear();
    const years: number[] = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
    
    // Year: restore from localStorage or use current financial year
    const savedYear = localStorage.getItem('medicineManifestYear');
    if (savedYear) {
      const year = parseInt(savedYear);
      if (years.includes(year)) {
        setSelectedYear(year);
      } else {
        setSelectedYear(currentYear);
        localStorage.setItem('medicineManifestYear', currentYear.toString());
      }
    } else {
      setSelectedYear(currentYear);
      localStorage.setItem('medicineManifestYear', currentYear.toString());
    }

    // Month: restore from localStorage if present
    const savedMonth = localStorage.getItem('medicineManifestMonth');
    if (savedMonth) {
      const m = parseInt(savedMonth);
      if (!isNaN(m) && m >= 1 && m <= 12) {
        setSelectedMonth(m);
      } else {
        setSelectedMonth(null);
      }
    } else {
      setSelectedMonth(null);
    }
  }, []);

  // Save selected year to localStorage when it changes
  useEffect(() => {
    if (selectedYear) {
      localStorage.setItem('medicineManifestYear', selectedYear.toString());
    }
  }, [selectedYear]);

  // Save selected month to localStorage when it changes
  useEffect(() => {
    if (selectedMonth !== null) {
      localStorage.setItem('medicineManifestMonth', selectedMonth.toString());
    } else {
      localStorage.removeItem('medicineManifestMonth');
    }
  }, [selectedMonth]);

  // Fetch manifests when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchManifests();
    }
  }, [selectedYear]);

  const fetchManifests = async () => {
    if (!selectedYear) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('medicineToken');
      const monthParam = selectedMonth ? `&month=${selectedMonth}` : '';
      const response = await axios.get(
        `${API_BASE}/api/medicine/manifests/all?year=${selectedYear}${monthParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

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

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200', 
        icon: Clock, 
        label: 'Submitted' 
      },
      dispatched: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-700', 
        border: 'border-purple-200', 
        icon: Truck, 
        label: 'Dispatched' 
      },
      delivered: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200', 
        icon: CheckCircle, 
        label: 'Delivered' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
              <h1 className="text-2xl font-semibold text-gray-900">View Manifests</h1>
              <p className="text-sm text-gray-500 mt-1">View all manifests with status and coloader information</p>
            </div>
            {/* Year & Month Selectors */}
            <div className="flex items-center gap-3">
              <label htmlFor="yearSelect" className="text-sm font-medium text-gray-700">
                Financial Year:
              </label>
              <select
                id="yearSelect"
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year} - {year + 1} (Apr - Mar)
                  </option>
                ))}
              </select>

              <label htmlFor="monthSelect" className="text-sm font-medium text-gray-700">
                Month:
              </label>
              <select
                id="monthSelect"
                value={selectedMonth ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMonth(val ? parseInt(val) : null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All months</option>
                {financialYearMonths.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
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
              {/* Stats Cards */}
              {manifests.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Manifests</p>
                          <p className="text-xl font-semibold">{manifests.length}</p>
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
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="text-xl font-semibold">
                            {manifests.filter(m => m.status === 'submitted').length}
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
                          <p className="text-sm text-gray-500">Dispatched</p>
                          <p className="text-xl font-semibold">
                            {manifests.filter(m => m.status === 'dispatched').length}
                          </p>
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
                          <p className="text-xl font-semibold">
                            {manifests.filter(m => m.status === 'delivered').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Manifests List */}
              {manifests.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <FileText className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manifests Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No manifests found for the selected financial year {selectedYear} - {selectedYear ? selectedYear + 1 : ''}.
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
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-lg font-semibold text-gray-800">
                                    Manifest {manifest.manifestNumber}
                                  </CardTitle>
                                  {getStatusBadge(manifest.status)}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{manifest.path}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>Created: {formatDate(manifest.createdAt)}</span>
                                  </div>
                                  {manifest.status === 'dispatched' && manifest.updatedAt && (
                                    <div className="flex items-center gap-1">
                                      <Truck className="h-4 w-4 text-gray-400" />
                                      <span>Dispatched: {formatDate(manifest.updatedAt)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1.5">
                                <span className="font-medium">{manifest.totalCount}</span>
                                <span className="ml-1">Consignments</span>
                              </Badge>
                              {manifest.coloaderId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Warehouse className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-gray-700">
                                    {typeof manifest.coloaderId === 'object' 
                                      ? `${manifest.coloaderId.busNumber} (${manifest.coloaderId.phoneNumber})`
                                      : 'Coloader Assigned'}
                                  </span>
                                </div>
                              )}
                              {!manifest.coloaderId && manifest.status === 'dispatched' && (
                                <span className="text-xs text-gray-500">No coloader assigned</span>
                              )}
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
                          {/* Content Description if available */}
                          {manifest.contentDescription && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">Content Description:</p>
                                  <p className="text-sm text-gray-700">{manifest.contentDescription}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineViewManifest;

