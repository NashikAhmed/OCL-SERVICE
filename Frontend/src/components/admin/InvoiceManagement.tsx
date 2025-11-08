import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Search, 
  Eye, 
  Edit, 
  Building2, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Invoice from '@/components/corporate/Invoice';

interface Corporate {
  _id: string;
  corporateId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  registrationDate: string;
  isActive: boolean;
  companyAddress?: string;
  gstNumber?: string;
  state?: string;
}

interface InvoiceItem {
  _id: string;
  consignmentNumber: string;
  bookingDate: string;
  origin: string;
  destination: string;
  serviceType: string;
  weight: number;
  freightCharges: number;
  fuelSurcharge?: number;
  cgst?: number;
  sgst?: number;
  totalAmount: number;
}

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  corporateId: string;
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  state: string;
  contactNumber: string;
  email: string;
  invoiceDate: string;
  invoicePeriod: {
    startDate: string;
    endDate: string;
  };
  shipments: InvoiceItem[];
  subtotal: number;
  fuelSurchargeTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  grandTotal: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  remarks?: string;
}

const InvoiceManagement = () => {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InvoiceData>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCorporates();
  }, []);

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/corporates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCorporates(data.corporates || []);
      } else {
        console.error('Failed to fetch corporates');
        toast({
          title: "Error",
          description: "Failed to fetch corporate list",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching corporates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch corporate list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async (corporateId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching consolidated invoice for corporateId:', corporateId);
      const response = await fetch(`/api/settlement/admin/consolidated-invoice?corporateId=${corporateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched consolidated invoice data:', data);
        
        if (data.data.consolidatedInvoice) {
          console.log('Number of consignments in consolidated invoice:', data.data.consolidatedInvoice.shipments?.length || 0);
          // Set as single invoice in array
          setInvoices([data.data.consolidatedInvoice]);
        } else {
          console.log('No consolidated invoice found');
          setInvoices([]);
        }
      } else {
        console.error('Failed to fetch consolidated invoice, response:', response);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        toast({
          title: "Error",
          description: `Failed to fetch consolidated invoice: ${errorData.error || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching consolidated invoice:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consolidated invoice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCorporateClick = (corporate: Corporate) => {
    setSelectedCorporate(corporate);
    fetchInvoices(corporate._id);
  };

  // Auto-open the invoice when it's loaded (only if dialog is not already closed by user)
  useEffect(() => {
    if (invoices.length > 0 && !showInvoiceDialog && !selectedInvoice) {
      setSelectedInvoice(invoices[0]);
      setShowInvoiceDialog(true);
    }
  }, [invoices, showInvoiceDialog, selectedInvoice]);

  const handleViewInvoice = (invoice: InvoiceData) => {
    console.log('Viewing invoice:', invoice);
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleCloseInvoiceDialog = () => {
    setShowInvoiceDialog(false);
    // Don't reset selectedInvoice here - keep it so we can show the table view
  };

  const handleEditInvoice = (invoice: InvoiceData) => {
    setEditingInvoice(invoice);
    setEditFormData({
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      paymentReference: invoice.paymentReference,
      remarks: invoice.remarks
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
        setShowEditDialog(false);
        setEditingInvoice(null);
        setEditFormData({});
        
        // Refresh invoices if we have a selected corporate
        if (selectedCorporate) {
          fetchInvoices(selectedCorporate._id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update invoice",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
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

  const filteredCorporates = corporates.filter(corporate =>
    corporate.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corporate.corporateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corporate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert invoice data to the format expected by the Invoice component
  const convertToInvoiceFormat = (invoice: InvoiceData) => {
    console.log('Converting invoice data:', invoice);
    
    // Ensure we have shipments data
    if (!invoice.shipments || !Array.isArray(invoice.shipments)) {
      console.error('No shipments data found in invoice:', invoice);
      return null;
    }
    
    const items = invoice.shipments.map(shipment => ({
      _id: shipment._id || 'unknown',
      consignmentNumber: parseInt(shipment.consignmentNumber) || 0,
      bookingDate: shipment.bookingDate || new Date().toISOString(),
      serviceType: shipment.serviceType || 'NON-DOX',
      destination: shipment.destination || 'Unknown',
      awbNumber: shipment.awbNumber || '-',
      weight: shipment.weight || 0,
      freightCharges: shipment.freightCharges || 0,
      totalAmount: shipment.totalAmount || 0
    }));

    const summary = {
      totalBills: invoice.shipments.length,
      totalAmount: invoice.grandTotal || 0,
      totalFreight: invoice.subtotal || 0,
      gstAmount: (invoice.cgstTotal || 0) + (invoice.sgstTotal || 0)
    };

    const convertedData = {
      items,
      summary,
      invoiceNumber: invoice.invoiceNumber || 'N/A',
      invoiceDate: invoice.invoiceDate ? formatDate(invoice.invoiceDate) : formatDate(new Date().toISOString()),
      invoicePeriod: invoice.invoicePeriod 
        ? `${formatDate(invoice.invoicePeriod.startDate)} to ${formatDate(invoice.invoicePeriod.endDate)}`
        : formatDate(new Date().toISOString()),
      corporateName: invoice.companyName || 'Unknown Company',
      corporateAddress: invoice.companyAddress || 'Unknown Address',
      corporateGstNumber: invoice.gstNumber || '',
      corporateState: invoice.state || 'Unknown',
      corporateContact: invoice.contactNumber || '',
      corporateEmail: invoice.email || '',
      billerState: "Assam"
    };

    console.log('Converted invoice data:', convertedData);
    return convertedData;
  };

  if (selectedCorporate) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCorporate(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Corporates
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Invoice Management</h2>
              <p className="text-gray-600">{selectedCorporate.companyName} - {selectedCorporate.corporateId}</p>
            </div>
          </div>
        </div>

        {/* Consolidated Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Consolidated Invoice ({invoices.length > 0 ? invoices[0].shipments?.length || 0 : 0} consignments)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading consolidated invoice...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No unpaid consignments found for this corporate</p>
                <p className="text-sm">This corporate has no unpaid consignments yet.</p>
              </div>
            ) : (
              <div>
                {!showInvoiceDialog ? (
                  // Show table view when dialog is closed
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Consignments</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                          <TableCell>
                            {formatDate(invoice.invoicePeriod.startDate)} - {formatDate(invoice.invoicePeriod.endDate)}
                          </TableCell>
                          <TableCell>{invoice.shipments?.length || 0}</TableCell>
                          <TableCell>{formatCurrency(invoice.grandTotal)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditInvoice(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  // Show summary card when dialog is open
                  <div className="space-y-4">
                    {/* Invoice Summary Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Invoice Number</p>
                          <p className="font-medium">{invoices[0].invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{formatDate(invoices[0].invoiceDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Consignments</p>
                          <p className="font-medium">{invoices[0].shipments?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-medium text-lg">{formatCurrency(invoices[0].grandTotal)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          {getStatusBadge(invoices[0].status)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewInvoice(invoices[0])}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEditInvoice(invoices[0])}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Auto-open message */}
                    <div className="text-center text-sm text-gray-500">
                      <p>Invoice will open automatically when loaded...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice View Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={handleCloseInvoiceDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {selectedInvoice ? (
              (() => {
                try {
                  const invoiceData = convertToInvoiceFormat(selectedInvoice);
                  if (!invoiceData) {
                    return (
                      <div className="p-4 text-center text-red-600">
                        <p>Invalid invoice data</p>
                        <p className="text-sm text-gray-500 mt-2">
                          The invoice data is missing required fields
                        </p>
                      </div>
                    );
                  }
                  return <Invoice {...invoiceData} />;
                } catch (error) {
                  console.error('Error rendering invoice:', error);
                  return (
                    <div className="p-4 text-center text-red-600">
                      <p>Error loading invoice details</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Please check the console for more details
                      </p>
                    </div>
                  );
                }
              })()
            ) : (
              <div className="p-4 text-center text-gray-500">
                No invoice selected
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Invoice Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editFormData.status || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editFormData.paymentMethod || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="">Select Payment Method</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Reference</label>
                <Input
                  value={editFormData.paymentReference || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                  placeholder="Enter payment reference"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Remarks</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={editFormData.remarks || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Invoice Management</h2>
        <p className="text-gray-600">Select a corporate to view and manage their invoices</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Corporate List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search corporates by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading corporates...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Corporate ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCorporates.map((corporate) => (
                  <TableRow key={corporate._id}>
                    <TableCell className="font-medium">{corporate.corporateId}</TableCell>
                    <TableCell>{corporate.companyName}</TableCell>
                    <TableCell>{corporate.email}</TableCell>
                    <TableCell>{corporate.contactNumber}</TableCell>
                    <TableCell>{formatDate(corporate.registrationDate)}</TableCell>
                    <TableCell>
                      {corporate.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCorporateClick(corporate)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Invoices
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManagement;
