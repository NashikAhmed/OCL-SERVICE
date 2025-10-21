import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Receipt,
  Download,
  DollarSign,
  Clock,
  Truck,
  List,
  Calendar,
  Filter,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Invoice from './Invoice';


interface UnpaidBill {
  _id: string;
  consignmentNumber: number;
  bookingReference: string;
  bookingDate: string;
  destination: string;
  serviceType: string;
  weight: number;
  freightCharges: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

interface UnpaidBillsSummary {
  totalBills: number;
  totalAmount: number;
  totalFreight: number;
  gstAmount: number;
}

const SettlementSection: React.FC = () => {
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([]);
  const [unpaidBillsSummary, setUnpaidBillsSummary] = useState<UnpaidBillsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [corporateProfile, setCorporateProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnpaidBills();
    fetchCorporateProfile();
  }, []);

  const fetchCorporateProfile = async () => {
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCorporateProfile(data.corporate);
      }
    } catch (error) {
      console.error('Error fetching corporate profile:', error);
    }
  };


  const fetchUnpaidBills = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '1000'
      });
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      // Fetch unpaid bills with optional date filtering
      const response = await fetch(`/api/settlement/unpaid-bills?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corporateToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnpaidBills(data.data.bills);
        setUnpaidBillsSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
      toast({
        title: "Error",
        description: "Failed to fetch unpaid bills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleApplyFilter = () => {
    if (fromDate && toDate) {
      if (new Date(fromDate) > new Date(toDate)) {
        toast({
          title: "Invalid Date Range",
          description: "From date cannot be greater than To date",
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsFilterApplied(true);
    fetchUnpaidBills(fromDate || undefined, toDate || undefined);
  };

  const handleResetFilter = () => {
    setFromDate('');
    setToDate('');
    setIsFilterApplied(false);
    fetchUnpaidBills();
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch('/api/settlement/download-consolidated-invoice', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corporateToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consolidated-invoice-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Downloading consolidated invoice",
        });
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download consolidated invoice",
        variant: "destructive"
      });
    }
  };




  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="h-7 w-7 text-purple-600" />
              Settlement
            </h1>
            <p className="text-gray-600 mt-1">Manage your financial settlements and billing information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settlement data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-purple-600" />
            Settlement
          </h1>
          <p className="text-gray-600 mt-1">View and manage your consolidated invoice with all unpaid bills</p>
        </div>
        {unpaidBills.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        )}
      </div>

      {/* Date Filter Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-8 h-8 text-sm w-44"
                  placeholder="From"
                />
              </div>
              
              <span className="text-gray-400 text-sm">to</span>
              
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="pl-8 h-8 text-sm w-44"
                  placeholder="To"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFilter}
                size="sm"
                disabled={!fromDate && !toDate}
                className="h-8 px-3 text-sm"
              >
                <Filter className="h-3 w-3 mr-1" />
                Apply
              </Button>
              {isFilterApplied && (
                <Button
                  variant="outline"
                  onClick={handleResetFilter}
                  size="sm"
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {isFilterApplied && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <span>
                Filter applied: 
                {fromDate && ` From ${formatDate(fromDate)}`}
                {toDate && ` To ${formatDate(toDate)}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Consolidated Invoice */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-600" />
            Consolidated Invoice
          </CardTitle>
          <CardDescription>
            All unpaid bills consolidated into a single invoice format
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unpaidBills.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No unpaid bills found</h3>
              <p className="text-gray-500">All your shipments have been invoiced</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden shadow-xl p-6">
              <Invoice
                items={unpaidBills.map(bill => ({
                  _id: bill._id,
                  consignmentNumber: bill.consignmentNumber,
                  bookingDate: bill.bookingDate,
                  serviceType: bill.serviceType,
                  destination: bill.destination,
                  awbNumber: bill.bookingReference,
                  weight: bill.weight,
                  freightCharges: bill.freightCharges,
                  totalAmount: bill.totalAmount
                }))}
                summary={unpaidBillsSummary || {
                  totalBills: 0,
                  totalAmount: 0,
                  totalFreight: 0,
                  gstAmount: 0
                }}
                corporateName={corporateProfile?.companyName || "Corporate Client"}
                corporateAddress={corporateProfile?.companyAddress || "Corporate Address"}
                corporateGstNumber={corporateProfile?.gstNumber || ""}
                corporateState={corporateProfile?.state || ""}
                corporateContact={corporateProfile?.contactNumber || ""}
                corporateEmail={corporateProfile?.email || ""}
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default SettlementSection;
