import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getStoredToken } from '@/utils/auth';

const monthNames = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

interface SettlementItem {
  _id: string;
  consignmentNumber: number;
  senderName: string;
  receiverName: string;
  paidBy: 'sender' | 'receiver';
  cost: number;
  isPaid: boolean;
  createdAt: string;
}

const MedicineSettlement: React.FC = () => {
  const { toast } = useToast();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [total, setTotal] = useState<number>(0);
  const [oclCharge, setOclCharge] = useState<string>('');
  const [settlementData, setSettlementData] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = useMemo(() => {
    const ocl = Number(oclCharge) || 0;
    return total - ocl;
  }, [total, oclCharge]);

  const adminToken = getStoredToken('adminToken');

  const fetchSettlementData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch summary (total and OCL charge)
      const summaryRes = await fetch(`/api/admin/medicine/settlements/summary?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const summaryJson = await summaryRes.json();
      if (summaryJson.success) {
        setTotal(summaryJson.data.total || 0);
        setOclCharge(String(summaryJson.data.oclCharge ?? ''));
      }

      // Fetch full settlement data
      const settlementsRes = await fetch(`/api/admin/medicine/settlements?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const settlementsJson = await settlementsRes.json();
      if (settlementsJson.success) {
        setSettlementData(settlementsJson.data || []);
      } else {
        setError(settlementsJson.message || 'Failed to fetch settlement data');
      }
    } catch (e) {
      setError('Network error while fetching data');
      toast({ title: 'Network error', description: 'Unable to fetch settlement data' });
    } finally {
      setLoading(false);
    }
  };

  const saveOclCharge = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/medicine/ocl-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ month, year, amount: Number(oclCharge) || 0 })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Saved', description: 'OCL charge saved successfully' });
        await fetchSettlementData();
      } else {
        toast({ title: 'Save failed', description: json.message || 'Unable to save OCL charge' });
      }
    } catch (e) {
      toast({ title: 'Network error', description: 'Unable to save OCL charge' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettlementData();
  }, [month, year]);

  const yearOptions = Array.from({ length: 7 }).map((_, idx) => new Date().getFullYear() - 3 + idx);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medicine Settlement - Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Month and Year Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-500">Total for {monthNames[month-1]} {year}</div>
              <div className="text-2xl font-semibold">₹{total.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-500">OCL Charge</div>
              <div className="text-2xl font-semibold">₹{(Number(oclCharge) || 0).toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-500">Grand Total (after OCL)</div>
              <div className="text-2xl font-semibold">₹{remaining.toFixed(2)}</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchSettlementData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <>
              {settlementData.length > 0 ? (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment By</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settlementData.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{item.consignmentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.senderName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.receiverName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.paidBy === 'sender' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.paidBy === 'sender' ? 'Sender' : 'Receiver'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                            ₹{item.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-right text-sm text-gray-700">Grand Total:</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 mb-6">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No settlement data</h3>
                  <p className="text-gray-500">No transactions found for {monthNames[month-1]} {year}</p>
                </div>
              )}
            </>
          )}

          {/* OCL Charge Input - At the bottom */}
          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OCL Charge</label>
                <Input
                  type="number"
                  value={oclCharge}
                  onChange={(e) => setOclCharge(e.target.value)}
                  placeholder="Enter OCL charge"
                />
              </div>
            </div>
            <Button onClick={saveOclCharge} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save OCL Charge'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineSettlement;
