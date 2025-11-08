import React, { useState, useEffect } from 'react';

interface SettlementItem {
  id: string;
  consignmentNumber: number;
  senderName: string;
  receiverName: string;
  paidBy: 'sender' | 'receiver';
  cost: number;
  weight: number;
  commission: number;
  isPaid: boolean;
  createdAt: string;
}

const Settlement: React.FC = () => {
  // State for month and year selection
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [settlementData, setSettlementData] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [oclCharge, setOclCharge] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [syncingBookings, setSyncingBookings] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sync bookings to Google Sheets
  const syncBookingsToSheets = async () => {
    setSyncingBookings(true);
    setSyncMessage(null);
    
    try {
      const token = localStorage.getItem('medicineToken');
      const response = await fetch('/api/medicine/sync-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSyncMessage(`✓ Successfully synced ${result.data.totalBookings} bookings to Google Sheets`);
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setSyncMessage(`✗ ${result.message || 'Failed to sync bookings'}`);
      }
    } catch (err) {
      console.error('Error syncing bookings:', err);
      setSyncMessage('✗ Failed to sync bookings to Google Sheets');
    } finally {
      setSyncingBookings(false);
    }
  };

  // Fetch settlement data from API
  const fetchSettlementData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('medicineToken');
      const response = await fetch(
        `/api/medicine/settlements?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setSettlementData(result.data);
        // Calculate grand total
        const total = result.data.reduce((sum: number, item: SettlementItem) => sum + item.cost, 0);
        setGrandTotal(total);
        
        // Calculate total weight and commission
        const weight = result.data.reduce((sum: number, item: SettlementItem) => sum + (item.weight || 0), 0);
        const commission = result.data.reduce((sum: number, item: SettlementItem) => sum + (item.commission || 0), 0);
        setTotalWeight(weight);
        setTotalCommission(commission);
        
        // Auto-calculate OCL charge as: Grand Total - Total Commission
        const autoCalculatedOclCharge = total - commission;
        
        try {
          const oclRes = await fetch(`/api/medicine/ocl-charge?month=${selectedMonth}&year=${selectedYear}` , {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const oclJson = await oclRes.json();
          if (oclJson.success) {
            const amt = Number(oclJson.data?.amount || 0);
            // Use manual OCL charge if set, otherwise use auto-calculated
            const finalOclCharge = (amt > 0) ? amt : autoCalculatedOclCharge;
            setOclCharge(finalOclCharge);
            setRemainingBalance(total - finalOclCharge);
          } else {
            setOclCharge(autoCalculatedOclCharge);
            setRemainingBalance(total - autoCalculatedOclCharge);
          }
        } catch {
          setOclCharge(autoCalculatedOclCharge);
          setRemainingBalance(total - autoCalculatedOclCharge);
        }
      } else {
        setError(result.message || 'Failed to fetch settlement data');
      }
    } catch (err) {
      setError('Failed to fetch settlement data');
      console.error('Error fetching settlement data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Fetch data when month or year changes
  useEffect(() => {
    fetchSettlementData();
  }, [selectedMonth, selectedYear]);

  // Auto-sync bookings to Google Sheets on component mount
  useEffect(() => {
    syncBookingsToSheets();
  }, []);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i + 1} value={i + 1}>
      {new Date(0, i).toLocaleString('default', { month: 'long' })}
    </option>
  ));

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => (
    <option key={currentYear - i} value={currentYear - i}>
      {currentYear - i}
    </option>
  ));

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Settlement Statement</h2>
              <p className="text-blue-100 mt-1">Monthly Payment Summary</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Period</p>
              <p className="text-xl font-semibold">{getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
              <p className="text-sm text-gray-600">Details of all transactions for the selected period</p>
              {settlementData.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {syncingBookings ? 'Syncing bookings...' : 'Auto-synced to Google Sheets'}
                  </p>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1_B3R2ecQAVVp8uFt1eEarU7G58O8btEz2yu3dS9Zek0/edit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Sheets
                  </a>
                  {syncMessage && (
                    <span className={`text-xs ${syncMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                      {syncMessage}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Month and Year Selection */}
            <div className="flex gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {monthOptions}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {yearOptions}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Moved to top */}
        {!loading && !error && settlementData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-gray-50 border-b border-gray-200">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{settlementData.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Weight (KG)</p>
                  <p className="text-2xl font-bold text-gray-900">{totalWeight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grand Total</p>
                  <p className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-cyan-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-rose-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3m0-12V6m0 2v10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">OCL Charge</p>
                  <p className="text-2xl font-bold text-gray-900">₹{oclCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center m-6">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment By</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (KG)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (₹)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {settlementData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
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
                          {(item.weight || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                          ₹{(item.commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                          ₹{item.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right text-sm text-gray-700">Totals:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {totalWeight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No settlement data</h3>
                <p className="text-gray-500">No transactions found for {getMonthName(selectedMonth)} {selectedYear}</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">Settlement statement generated on {new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

export default Settlement;