import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  X, 
  DollarSign, 
  Building, 
  User, 
  Mail, 
  Calendar,
  Loader2,
  AlertCircle,
  Check,
  XCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PricingData {
  _id: string;
  name: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  status: string;
  createdAt: string;
  doxPricing?: any;
  nonDoxSurfacePricing?: any;
  nonDoxAirPricing?: any;
  priorityPricing?: any;
  reversePricing?: any;
  createdBy?: {
    name: string;
    email: string;
  };
}

const PricingApproval = () => {
  const { token, action } = useParams<{ token: string; action?: string }>();
  const navigate = useNavigate();
  
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvedBy, setApprovedBy] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectedBy, setRejectedBy] = useState('');

  useEffect(() => {
    if (token) {
      fetchPricingData();
    }
  }, [token]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/public/pricing-approval/${token}`);
      const result = await response.json();

      if (result.success) {
        setPricingData(result.data);
      } else {
        setError(result.error || 'Failed to load pricing data');
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approvedBy.trim()) {
      setError('Please enter your name to approve');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/public/pricing-approval/${token}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvedBy: approvedBy.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Pricing proposal approved successfully!');
        setPricingData(prev => prev ? { ...prev, status: 'approved' } : null);
      } else {
        setError(result.error || 'Failed to approve pricing');
      }
    } catch (error) {
      console.error('Error approving pricing:', error);
      setError('Failed to approve pricing');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectedBy.trim()) {
      setError('Please enter your name to reject');
      return;
    }

    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/public/pricing-approval/${token}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rejectedBy: rejectedBy.trim(),
          rejectionReason: rejectionReason.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Pricing proposal rejected successfully.');
        setPricingData(prev => prev ? { ...prev, status: 'rejected' } : null);
      } else {
        setError(result.error || 'Failed to reject pricing');
      }
    } catch (error) {
      console.error('Error rejecting pricing:', error);
      setError('Failed to reject pricing');
    } finally {
      setProcessing(false);
    }
  };

  const renderPricingTable = (title: string, data: any, isWeightBased = false) => {
    if (!data) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="rounded-lg overflow-hidden shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                {isWeightBased && <TableHead>Weight Range</TableHead>}
                <TableHead>Assam</TableHead>
                <TableHead>NE by Surface</TableHead>
                <TableHead>NE by Air (Agent Import)</TableHead>
                <TableHead>Rest of India</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isWeightBased ? (
                Object.entries(data).map(([weight, prices]: [string, any]) => (
                  <TableRow key={weight}>
                    <TableCell className="font-medium">{weight}</TableCell>
                    <TableCell>₹{prices.assam || 0}</TableCell>
                    <TableCell>₹{prices.neBySurface || 0}</TableCell>
                    <TableCell>₹{prices.neByAirAgtImp || 0}</TableCell>
                    <TableCell>₹{prices.restOfIndia || 0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>₹{data.assam || 0}</TableCell>
                  <TableCell>₹{data.neBySurface || 0}</TableCell>
                  <TableCell>₹{data.neByAirAgtImp || 0}</TableCell>
                  <TableCell>₹{data.restOfIndia || 0}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderReversePricingTable = (title: string, data: any) => {
    if (!data) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="rounded-lg overflow-hidden shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>By Road (Normal)</TableHead>
                <TableHead>By Road (Priority)</TableHead>
                <TableHead>By Train (Normal)</TableHead>
                <TableHead>By Train (Priority)</TableHead>
                <TableHead>By Flight (Normal)</TableHead>
                <TableHead>By Flight (Priority)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">To Assam</TableCell>
                <TableCell>₹{data.toAssam?.byRoad?.normal || 0}</TableCell>
                <TableCell>₹{data.toAssam?.byRoad?.priority || 0}</TableCell>
                <TableCell>₹{data.toAssam?.byTrain?.normal || 0}</TableCell>
                <TableCell>₹{data.toAssam?.byTrain?.priority || 0}</TableCell>
                <TableCell>₹{data.toAssam?.byFlight?.normal || 0}</TableCell>
                <TableCell>₹{data.toAssam?.byFlight?.priority || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">To North East</TableCell>
                <TableCell>₹{data.toNorthEast?.byRoad?.normal || 0}</TableCell>
                <TableCell>₹{data.toNorthEast?.byRoad?.priority || 0}</TableCell>
                <TableCell>₹{data.toNorthEast?.byTrain?.normal || 0}</TableCell>
                <TableCell>₹{data.toNorthEast?.byTrain?.priority || 0}</TableCell>
                <TableCell>₹{data.toNorthEast?.byFlight?.normal || 0}</TableCell>
                <TableCell>₹{data.toNorthEast?.byFlight?.priority || 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading pricing proposal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pricingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Not Found</h2>
              <p className="text-gray-600">Pricing proposal not found or link has expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProcessed = pricingData.status === 'approved' || pricingData.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/public/assets/ocl-logo.png" alt="OCL Logo" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Corporate Pricing Approval</h1>
          <p className="text-gray-600">OCL Courier & Logistics</p>
        </div>

        {/* Status Alert */}
        {isProcessed && (
          <Alert className={`mb-6 ${pricingData.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center">
              {pricingData.status === 'approved' ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 mr-2" />
              )}
              <AlertDescription className={pricingData.status === 'approved' ? 'text-green-800' : 'text-red-800'}>
                This pricing proposal has been {pricingData.status}.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Pricing Details - Scrollable */}
          <div className="flex-1 lg:w-2/3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Pricing Proposal: {pricingData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Company Information */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="font-medium">{pricingData.clientCompany || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Contact:</span>
                      <span className="font-medium">{pricingData.clientName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{pricingData.clientEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(pricingData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Tables */}
                {renderPricingTable('📦 Standard Service - DOX Pricing', pricingData.doxPricing, true)}
                {renderPricingTable('🚛 NON DOX Surface Pricing', pricingData.nonDoxSurfacePricing)}
                {renderPricingTable('✈️ NON DOX Air Pricing', pricingData.nonDoxAirPricing)}
                {renderPricingTable('⚡ Priority Service - DOX Pricing', pricingData.priorityPricing, true)}
                {renderReversePricingTable('🔄 Reverse Pricing (To Assam & North East)', pricingData.reversePricing)}
              </CardContent>
            </Card>
          </div>

          {/* Action Panel - Sticky */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-4 lg:top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Take Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {!isProcessed ? (
                  <div className="space-y-6">
                    {/* Approve Section */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-md">
                      <h3 className="font-semibold text-green-800 mb-3">✅ Approve Pricing</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="approvedBy" className="text-sm font-medium text-gray-700">
                            Your Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="approvedBy"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                            placeholder="Enter your full name"
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={handleApprove}
                          disabled={processing || !approvedBy.trim()}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Approve Pricing
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Reject Section */}
                    <div className="p-4 bg-red-50 rounded-lg shadow-md">
                      <h3 className="font-semibold text-red-800 mb-3">❌ Reject Pricing</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rejectedBy" className="text-sm font-medium text-gray-700">
                            Your Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="rejectedBy"
                            value={rejectedBy}
                            onChange={(e) => setRejectedBy(e.target.value)}
                            placeholder="Enter your full name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rejectionReason" className="text-sm font-medium text-gray-700">
                            Reason for Rejection <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <Button
                          onClick={handleReject}
                          disabled={processing || !rejectedBy.trim() || !rejectionReason.trim()}
                          variant="destructive"
                          className="w-full"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Reject Pricing
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`p-4 rounded-lg shadow-md ${pricingData.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {pricingData.status === 'approved' ? (
                        <>
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-green-800 mb-2">Approved</h3>
                          <p className="text-green-700">This pricing proposal has been approved and is now active.</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-red-800 mb-2">Rejected</h3>
                          <p className="text-red-700">This pricing proposal has been rejected.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">📞 Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-2">If you have any questions about this pricing proposal, please contact our corporate team:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Email:</strong> corporate@oclcourier.com</li>
                    <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                    <li><strong>Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM</li>
                  </ul>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingApproval;
