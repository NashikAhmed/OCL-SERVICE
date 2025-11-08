import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineSidebar from '../../components/medicine/MedicineSidebar';
import { 
  ClipboardList, 
  Package, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  RefreshCw
} from 'lucide-react';

interface MedicineUserInfo {
  id: string;
  name: string;
  email: string;
}

interface ConsignmentAssignment {
  _id: string;
  startNumber: number;
  endNumber: number;
  totalNumbers: number;
  assignedAt: string;
  notes?: string;
}

interface ConsignmentData {
  success: boolean;
  hasAssignment: boolean;
  message: string;
  assignments?: ConsignmentAssignment[];
  summary?: {
    totalAssigned: number;
    usedCount: number;
    availableCount: number;
    usagePercentage: number;
  };
}

const MedicineConsignment: React.FC = () => {
  const [user, setUser] = useState<MedicineUserInfo | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [consignmentData, setConsignmentData] = useState<ConsignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchConsignments();
  }, []);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('medicineToken');
      
      const response = await fetch('/api/medicine/consignment/assignments', {
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
        throw new Error(errorData.message || 'Failed to fetch consignment assignments');
      }

      const data = await response.json();
      setConsignmentData(data);
    } catch (err: any) {
      console.error('Error fetching consignments:', err);
      setError(err.message || 'Failed to load consignment assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medicineToken');
    localStorage.removeItem('medicineInfo');
    navigate('/medicine');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,24,40,0.08)] border border-gray-100 p-6 min-h-[calc(100vh-3rem)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Consignment Assignments</h1>
                <p className="text-sm text-gray-500">View your assigned consignment number ranges</p>
              </div>
            </div>
            <button
              onClick={fetchConsignments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading consignments...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={fetchConsignments}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !consignmentData?.hasAssignment ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">No Consignments Assigned</p>
                <p className="text-gray-500 text-sm mt-2">{consignmentData?.message || 'Please contact admin to get consignment numbers assigned.'}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {consignmentData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-medium mb-1">Total Assigned</p>
                        <p className="text-2xl font-bold text-blue-900">{consignmentData.summary.totalAssigned.toLocaleString()}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">Available</p>
                        <p className="text-2xl font-bold text-green-900">{consignmentData.summary.availableCount.toLocaleString()}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Used</p>
                        <p className="text-2xl font-bold text-purple-900">{consignmentData.summary.usedCount.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-600 font-medium mb-1">Usage %</p>
                        <p className="text-2xl font-bold text-orange-900">{consignmentData.summary.usagePercentage}%</p>
                      </div>
                      <FileText className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {consignmentData.message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">{consignmentData.message}</p>
                  </div>
                </div>
              )}

              {/* Assignments Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Number</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">End Number</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Numbers</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consignmentData.assignments?.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono text-gray-900">{assignment._id.slice(-8)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{assignment.startNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{assignment.endNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-700">{assignment.totalNumbers.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDate(assignment.assignedAt)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{assignment.notes || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineConsignment;

