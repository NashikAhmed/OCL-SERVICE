import express from 'express';
import Invoice from '../models/Invoice.js';
import CorporateData from '../models/CorporateData.js';
import { ConsignmentUsage } from '../models/ConsignmentAssignment.js';
import { authenticateCorporate, authenticateAdmin } from '../middleware/auth.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();

// Function to generate HTML invoice
const generateHTMLInvoice = (invoiceData, corporate) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const currentDate = new Date().toLocaleDateString('en-IN');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consolidated Invoice</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #4a9b8e; color: white; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { margin: 5px 0; }
        .grand-total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONSOLIDATED INVOICE</h1>
        <h2>OCL Services</h2>
    </div>
    
    <div class="company-info">
        <h3>Bill To:</h3>
        <p><strong>${corporate.companyName}</strong></p>
        <p>${corporate.companyAddress || ''}</p>
        <p>GST: ${corporate.gstNumber || 'N/A'}</p>
        <p>Email: ${corporate.email || ''}</p>
        <p>Phone: ${corporate.contactNumber || ''}</p>
    </div>
    
    <div class="invoice-details">
        <div>
            <p><strong>Invoice Date:</strong> ${currentDate}</p>
            <p><strong>Invoice Period:</strong> ${invoiceData.invoicePeriod}</p>
        </div>
        <div>
            <p><strong>Total Shipments:</strong> ${invoiceData.shipments.length}</p>
            <p><strong>Status:</strong> ${invoiceData.status}</p>
        </div>
    </div>
    
    <table class="table">
        <thead>
            <tr>
                <th>Sl.No.</th>
                <th>Date</th>
                <th>Type</th>
                <th>Destination</th>
                <th>AWB No.</th>
                <th>Weight</th>
                <th>AWB</th>
                <th>Freight</th>
                <th>Fuel Charge</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceData.shipments.map((shipment, index) => {
              const bookingData = shipment.bookingData || {};
              const destinationData = bookingData.destinationData || {};
              const shipmentData = bookingData.shipmentData || {};
              
              return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>${bookingData.serviceType || 'NON-DOX'}</td>
                    <td>${destinationData.city || 'N/A'}</td>
                    <td>${shipment.consignmentNumber || 'N/A'}</td>
                    <td>${shipmentData.actualWeight || 0} kg</td>
                    <td>${formatCurrency(50)}</td>
                    <td>${formatCurrency(shipment.freightCharges || 0)}</td>
                    <td>${formatCurrency(shipment.fuelSurcharge || 0)}</td>
                    <td>${formatCurrency(shipment.cgst || 0)}</td>
                    <td>${formatCurrency(shipment.sgst || 0)}</td>
                    <td>${formatCurrency(shipment.totalAmount || 0)}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <div class="total-row">Subtotal: ${formatCurrency(invoiceData.subtotal)}</div>
        <div class="total-row">AWB Charges: ${formatCurrency(invoiceData.awbChargesTotal)}</div>
        <div class="total-row">Fuel Charge (${invoiceData.fuelChargePercentage}%): ${formatCurrency(invoiceData.fuelSurchargeTotal)}</div>
        <div class="total-row">CGST: ${formatCurrency(invoiceData.cgstTotal)}</div>
        <div class="total-row">SGST: ${formatCurrency(invoiceData.sgstTotal)}</div>
        <div class="total-row grand-total">Grand Total: ${formatCurrency(invoiceData.grandTotal)}</div>
    </div>
    
    <div class="footer">
        <p><strong>Disclaimer:</strong> This is a computer generated invoice and does not require any official signature.</p>
        <p>Kindly notify us immediately in case you find any discrepancy in the details of transactions.</p>
    </div>
</body>
</html>
  `;
};

// Get settlement summary for corporate
router.get('/summary', authenticateCorporate, async (req, res) => {
  try {
    const summary = await Invoice.getInvoiceSummary(req.corporate._id);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Settlement summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settlement summary'
    });
  }
});

// Get all invoices for corporate
router.get('/invoices', authenticateCorporate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { corporateId: req.corporate._id };
    if (status && ['unpaid', 'paid', 'overdue'].includes(status)) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await Invoice.find(query)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Invoice.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Get specific invoice details
router.get('/invoices/:invoiceId', authenticateCorporate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.invoiceId,
      corporateId: req.corporate._id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice details'
    });
  }
});

// Generate invoice for unpaid shipments (Admin only)
router.post('/generate-invoice', authenticateAdmin, async (req, res) => {
  try {
    const { corporateId, startDate, endDate, shipments } = req.body;
    
    // Validate required fields
    if (!corporateId || !startDate || !endDate || !shipments || !Array.isArray(shipments)) {
      return res.status(400).json({
        success: false,
        error: 'Corporate ID, date range, and shipments are required'
      });
    }
    
    // Get corporate details
    const corporate = await CorporateData.findById(corporateId);
    if (!corporate) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found'
      });
    }
    
    // Check if invoice already exists for this period
    const existingInvoice = await Invoice.findOne({
      corporateId: corporateId,
      'invoicePeriod.startDate': new Date(startDate),
      'invoicePeriod.endDate': new Date(endDate)
    });
    
    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        error: 'Invoice already exists for this period'
      });
    }
    
    // Get corporate pricing to get fuel charge percentage
    const CorporatePricing = (await import('../models/CorporatePricing.js')).default;
    const pricing = await CorporatePricing.findOne({ 
      corporateClient: corporateId,
      status: 'approved'
    });
    
    // Use fuel charge percentage from pricing, default to 15% if not found
    const fuelChargePercentage = pricing?.fuelChargePercentage || 15;
    
    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    
    // Calculate totals
    let subtotal = 0;
    let awbChargesTotal = 0;
    let fuelSurchargeTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    
    const processedShipments = shipments.map(shipment => {
      const freightCharges = parseFloat(shipment.freightCharges) || 0;
      const awbCharge = 50; // 50rs per AWB
      const fuelSurcharge = freightCharges * (fuelChargePercentage / 100); // Dynamic fuel surcharge percentage
      const cgst = freightCharges * 0.09; // 9% CGST
      const sgst = freightCharges * 0.09; // 9% SGST
      const totalAmount = freightCharges + awbCharge + fuelSurcharge + cgst + sgst;
      
      subtotal += freightCharges;
      awbChargesTotal += awbCharge;
      fuelSurchargeTotal += fuelSurcharge;
      cgstTotal += cgst;
      sgstTotal += sgst;
      
      return {
        consignmentNumber: shipment.consignmentNumber,
        bookingDate: new Date(shipment.bookingDate),
        destination: shipment.destination,
        serviceType: shipment.serviceType === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: parseFloat(shipment.weight) || 0,
        freightCharges: freightCharges,
        awbCharge: awbCharge,
        fuelSurcharge: fuelSurcharge,
        cgst: cgst,
        sgst: sgst,
        totalAmount: totalAmount
      };
    });
    
    const grandTotal = subtotal + awbChargesTotal + fuelSurchargeTotal + cgstTotal + sgstTotal;
    
    // Create invoice
    const invoice = new Invoice({
      invoiceNumber: invoiceNumber,
      corporateId: corporateId,
      companyName: corporate.companyName,
      companyAddress: corporate.fullAddress,
      gstNumber: corporate.gstNumber,
      state: corporate.state,
      stateCode: '18', // Default to Assam
      contactNumber: corporate.contactNumber,
      email: corporate.email,
      invoicePeriod: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      shipments: processedShipments,
      subtotal: subtotal,
      awbChargesTotal: awbChargesTotal,
      fuelSurchargeTotal: fuelSurchargeTotal,
      fuelChargePercentage: fuelChargePercentage,
      cgstTotal: cgstTotal,
      sgstTotal: sgstTotal,
      grandTotal: grandTotal,
      amountInWords: '', // Will be set by pre-save middleware
      status: 'unpaid',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // 30 days from now
      termsAndConditions: [
        'Invoice Amount To Be Paid By Same Days From The Date Of Invoice',
        'Payment Should Be Crossed Account Payee Cheque/Demand Draft or Digital Transfer Our Courier & Logistics Services (I) Pvt.Ltd',
        'Interest @ 3% Per Month Will Be Charged On Payment'
      ],
      createdBy: req.admin._id
    });
    
    await invoice.save();
    
    // Mark shipments as invoiced
    const shipmentIds = shipments.map(s => s._id);
    await ConsignmentUsage.markAsInvoiced(shipmentIds, invoice._id);
    
    console.log(`✅ Invoice generated: ${invoiceNumber} for ${corporate.companyName}`);
    
    res.json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: invoice.grandTotal,
        dueDate: invoice.dueDate,
        invoiceId: invoice._id
      }
    });
    
  } catch (error) {
    console.error('Generate invoice error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to generate invoice'
      });
    }
  }
});

// Mark invoice as paid (Admin only)
router.patch('/invoices/:invoiceId/mark-paid', authenticateAdmin, async (req, res) => {
  try {
    const { paymentMethod, paymentReference } = req.body;
    
    if (!paymentMethod || !paymentReference) {
      return res.status(400).json({
        success: false,
        error: 'Payment method and reference are required'
      });
    }
    
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    await invoice.markAsPaid(paymentMethod, paymentReference);
    invoice.lastModifiedBy = req.admin._id;
    await invoice.save();
    
    console.log(`✅ Invoice ${invoice.invoiceNumber} marked as paid`);
    
    res.json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        paymentDate: invoice.paymentDate,
        paymentMethod: invoice.paymentMethod,
        paymentReference: invoice.paymentReference
      }
    });
    
  } catch (error) {
    console.error('Mark invoice paid error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark invoice as paid'
    });
  }
});

// Get unpaid shipments for invoice generation (Admin only)
router.get('/unpaid-shipments/:corporateId', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    // Get unpaid shipments from consignment usage
    const unpaidShipments = await ConsignmentUsage.findUnpaidForInvoice(
      req.params.corporateId, 
      startDate, 
      endDate
    );
    
    // Format shipment data for invoice
    const formattedShipments = unpaidShipments.map(usage => {
      const bookingData = usage.bookingData;
      return {
        _id: usage._id,
        consignmentNumber: usage.consignmentNumber,
        bookingDate: usage.usedAt,
        destination: bookingData.destinationData?.city || 'N/A',
        serviceType: bookingData.shipmentData?.natureOfConsignment === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: bookingData.shipmentData?.actualWeight || bookingData.shipmentData?.chargeableWeight || 0,
        freightCharges: usage.freightCharges || 0,
        totalAmount: usage.totalAmount || 0
      };
    });
    
    res.json({
      success: true,
      data: {
        shipments: formattedShipments,
        totalShipments: formattedShipments.length,
        totalAmount: formattedShipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
      }
    });
    
  } catch (error) {
    console.error('Get unpaid shipments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unpaid shipments'
    });
  }
});

// Get consolidated invoice for admin (Admin only) - One invoice with all consignments
router.get('/admin/consolidated-invoice', authenticateAdmin, async (req, res) => {
  try {
    const { corporateId } = req.query;
    console.log('Admin consolidated invoice request - corporateId:', corporateId);
    
    if (!corporateId) {
      return res.status(400).json({
        success: false,
        error: 'Corporate ID is required'
      });
    }
    
    let actualCorporateId;
    
    // corporateId can be either ObjectId or string corporateId (like A00001)
    if (corporateId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      console.log('Using corporateId as ObjectId:', corporateId);
      actualCorporateId = corporateId;
    } else {
      // It's a string corporateId, need to find the actual ObjectId
      console.log('Looking up corporate by string corporateId:', corporateId);
      const CorporateData = (await import('../models/CorporateData.js')).default;
      const corporate = await CorporateData.findOne({ corporateId: corporateId });
      if (corporate) {
        console.log('Found corporate:', corporate.companyName, 'ObjectId:', corporate._id);
        actualCorporateId = corporate._id;
      } else {
        console.log('Corporate not found for corporateId:', corporateId);
        return res.json({
          success: true,
          data: {
            consolidatedInvoice: null,
            summary: {
              totalBills: 0,
              totalAmount: 0,
              totalFreight: 0,
              gstAmount: 0
            }
          }
        });
      }
    }
    
    // Get unpaid FP shipments (same query as corporate settlement)
    const query = {
      corporateId: actualCorporateId,
      paymentStatus: 'unpaid',
      paymentType: 'FP', // Only FP shipments are included in settlement
      status: 'active'
    };
    
    console.log('Querying ConsignmentUsage with:', query);
    
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    const unpaidShipments = await ConsignmentUsage.find(query)
      .sort({ usedAt: 1 }) // Sort by date ascending
      .lean();
    
    console.log('Found unpaid shipments:', unpaidShipments.length);
    
    if (unpaidShipments.length === 0) {
      return res.json({
        success: true,
        data: {
          consolidatedInvoice: null,
          summary: {
            totalBills: 0,
            totalAmount: 0,
            totalFreight: 0,
            gstAmount: 0
          }
        }
      });
    }
    
    // Get corporate details
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const corporate = await CorporateData.findById(actualCorporateId);
    
    // Format all shipments into a single consolidated invoice
    const shipments = unpaidShipments.map(usage => {
      const bookingData = usage.bookingData;
      return {
        _id: usage._id,
        consignmentNumber: usage.consignmentNumber,
        bookingReference: usage.bookingReference,
        bookingDate: usage.usedAt,
        destination: bookingData.destinationData?.city || 'N/A',
        serviceType: bookingData.shipmentData?.natureOfConsignment === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: bookingData.shipmentData?.actualWeight || bookingData.shipmentData?.chargeableWeight || 0,
        freightCharges: usage.freightCharges || 0,
        totalAmount: usage.totalAmount || 0,
        status: usage.status,
        paymentStatus: usage.paymentStatus
      };
    });
    
    // Calculate totals
    const totalAmount = unpaidShipments.reduce((sum, usage) => sum + (usage.totalAmount || 0), 0);
    const totalFreight = unpaidShipments.reduce((sum, usage) => sum + (usage.freightCharges || 0), 0);
    
    // Create consolidated invoice
    const consolidatedInvoice = {
      _id: `consolidated-${actualCorporateId}`,
      invoiceNumber: `CONS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
      corporateId: actualCorporateId,
      companyName: corporate?.companyName || 'Unknown Company',
      companyAddress: corporate?.companyAddress || 'Unknown Address',
      gstNumber: corporate?.gstNumber || '',
      state: corporate?.state || 'Unknown',
      contactNumber: corporate?.contactNumber || '',
      email: corporate?.email || '',
      invoiceDate: new Date().toISOString(),
      invoicePeriod: {
        startDate: shipments.length > 0 ? shipments[0].bookingDate : new Date().toISOString(),
        endDate: shipments.length > 0 ? shipments[shipments.length - 1].bookingDate : new Date().toISOString()
      },
      shipments: shipments,
      subtotal: totalFreight,
      fuelSurchargeTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      grandTotal: totalAmount,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      amountInWords: 'Amount in words'
    };
    
    res.json({
      success: true,
      data: {
        consolidatedInvoice: consolidatedInvoice,
        summary: {
          totalBills: unpaidShipments.length,
          totalAmount: totalAmount,
          totalFreight: totalFreight,
          gstAmount: totalAmount - totalFreight
        }
      }
    });
    
  } catch (error) {
    console.error('Get admin consolidated invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch consolidated invoice'
    });
  }
});

// Get all invoices (Admin only)
router.get('/admin/invoices', authenticateAdmin, async (req, res) => {
  try {
    const { corporateId, status, page = 1, limit = 10 } = req.query;
    console.log('Admin invoices request - corporateId:', corporateId, 'status:', status);
    
    const query = {};
    if (corporateId) {
      // corporateId can be either ObjectId or string corporateId (like A00001)
      // First try to find by ObjectId, if that fails, find by string corporateId
      if (corporateId.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        console.log('Using corporateId as ObjectId:', corporateId);
        query.corporateId = corporateId;
      } else {
        // It's a string corporateId, need to find the actual ObjectId
        console.log('Looking up corporate by string corporateId:', corporateId);
        const CorporateData = (await import('../models/CorporateData.js')).default;
        const corporate = await CorporateData.findOne({ corporateId: corporateId });
        if (corporate) {
          console.log('Found corporate:', corporate.companyName, 'ObjectId:', corporate._id);
          query.corporateId = corporate._id;
        } else {
          console.log('Corporate not found for corporateId:', corporateId);
          // Corporate not found, return empty result
          return res.json({
            success: true,
            data: {
              invoices: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit)
              }
            }
          });
        }
      }
    }
    if (status && ['unpaid', 'paid', 'overdue'].includes(status)) {
      query.status = status;
    }
    
    console.log('Final query:', query);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await Invoice.find(query)
      .populate('corporateId', 'companyName corporateId email contactNumber')
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Invoice.countDocuments(query);
    console.log('Found invoices:', invoices.length, 'Total:', total);
    
    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Get overdue invoices (Admin only)
router.get('/admin/overdue', authenticateAdmin, async (req, res) => {
  try {
    const overdueInvoices = await Invoice.findOverdue()
      .populate('corporateId', 'companyName corporateId email contactNumber')
      .sort({ dueDate: 1 })
      .lean();
    
    res.json({
      success: true,
      data: overdueInvoices
    });
    
  } catch (error) {
    console.error('Get overdue invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue invoices'
    });
  }
});

// Get unpaid bills for corporate (Corporate users)
router.get('/unpaid-bills', authenticateCorporate, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.usedAt = {};
      if (startDate) {
        dateFilter.usedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        dateFilter.usedAt.$lt = endDateObj;
      }
    }
    
    // Get unpaid FP shipments with date filter (TP shipments are excluded from settlement)
    const query = {
      corporateId: req.corporate._id,
      paymentStatus: 'unpaid',
      paymentType: 'FP', // Only FP shipments are included in settlement
      status: 'active',
      ...dateFilter
    };
    
    const unpaidShipments = await ConsignmentUsage.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await ConsignmentUsage.countDocuments(query);
    
    // Format shipment data for display
    const formattedBills = unpaidShipments.map(usage => {
      const bookingData = usage.bookingData;
      return {
        _id: usage._id,
        consignmentNumber: usage.consignmentNumber,
        bookingReference: usage.bookingReference,
        bookingDate: usage.usedAt,
        destination: bookingData.destinationData?.city || 'N/A',
        serviceType: bookingData.shipmentData?.natureOfConsignment === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: bookingData.shipmentData?.actualWeight || bookingData.shipmentData?.chargeableWeight || 0,
        freightCharges: usage.freightCharges || 0,
        totalAmount: usage.totalAmount || 0,
        status: usage.status,
        paymentStatus: usage.paymentStatus
      };
    });
    
    // Calculate totals
    const totalAmount = unpaidShipments.reduce((sum, usage) => sum + (usage.totalAmount || 0), 0);
    const totalFreight = unpaidShipments.reduce((sum, usage) => sum + (usage.freightCharges || 0), 0);
    
    res.json({
      success: true,
      data: {
        bills: formattedBills,
        summary: {
          totalBills: total,
          totalAmount: totalAmount,
          totalFreight: totalFreight,
          gstAmount: totalAmount - totalFreight
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get unpaid bills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unpaid bills'
    });
  }
});

// Generate consolidated invoice from unpaid bills (Corporate users)
router.post('/generate-invoice', authenticateCorporate, async (req, res) => {
  try {
    const { bills } = req.body;
    
    // Validate required fields
    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bills array is required and must not be empty'
      });
    }
    
    // Get all unpaid FP shipments for this corporate (TP shipments are excluded from settlement)
    const unpaidShipments = await ConsignmentUsage.find({
      _id: { $in: bills },
      corporateId: req.corporate._id,
      paymentStatus: 'unpaid',
      paymentType: 'FP', // Only FP shipments are included in settlement
      status: 'active'
    }).lean();
    
    if (unpaidShipments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No unpaid bills found for the specified IDs'
      });
    }
    
    // Get corporate details
    const corporate = await CorporateData.findById(req.corporate._id);
    if (!corporate) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found'
      });
    }
    
    // Get corporate pricing to get fuel charge percentage
    const CorporatePricing = (await import('../models/CorporatePricing.js')).default;
    const pricing = await CorporatePricing.findOne({ 
      corporateClient: req.corporate._id,
      status: 'approved'
    });
    
    // Use fuel charge percentage from pricing, default to 15% if not found
    const fuelChargePercentage = pricing?.fuelChargePercentage || 15;
    
    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    
    // Calculate totals
    let subtotal = 0;
    let awbChargesTotal = 0;
    let fuelSurchargeTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    
    const processedShipments = unpaidShipments.map(usage => {
      const bookingData = usage.bookingData;
      const freightCharges = parseFloat(usage.freightCharges) || 0;
      const awbCharge = 50; // 50rs per AWB
      const fuelSurcharge = freightCharges * (fuelChargePercentage / 100); // Dynamic fuel surcharge percentage
      const cgst = freightCharges * 0.09; // 9% CGST
      const sgst = freightCharges * 0.09; // 9% SGST
      const totalAmount = freightCharges + awbCharge + fuelSurcharge + cgst + sgst;
      
      subtotal += freightCharges;
      awbChargesTotal += awbCharge;
      fuelSurchargeTotal += fuelSurcharge;
      cgstTotal += cgst;
      sgstTotal += sgst;
      
      return {
        consignmentNumber: usage.consignmentNumber,
        bookingDate: usage.usedAt,
        destination: bookingData.destinationData?.city || 'N/A',
        serviceType: bookingData.shipmentData?.natureOfConsignment === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: bookingData.shipmentData?.actualWeight || bookingData.shipmentData?.chargeableWeight || 0,
        freightCharges: freightCharges,
        awbCharge: awbCharge,
        fuelSurcharge: fuelSurcharge,
        cgst: cgst,
        sgst: sgst,
        totalAmount: totalAmount
      };
    });
    
    const grandTotal = subtotal + awbChargesTotal + fuelSurchargeTotal + cgstTotal + sgstTotal;
    
    // Create invoice
    const invoice = new Invoice({
      invoiceNumber: invoiceNumber,
      corporateId: req.corporate._id,
      companyName: corporate.companyName,
      companyAddress: corporate.fullAddress,
      gstNumber: corporate.gstNumber,
      state: corporate.state,
      stateCode: '18', // Default to Assam
      contactNumber: corporate.contactNumber,
      email: corporate.email,
      invoicePeriod: {
        startDate: new Date(Math.min(...unpaidShipments.map(s => new Date(s.usedAt)))),
        endDate: new Date(Math.max(...unpaidShipments.map(s => new Date(s.usedAt))))
      },
      shipments: processedShipments,
      subtotal: subtotal,
      awbChargesTotal: awbChargesTotal,
      fuelSurchargeTotal: fuelSurchargeTotal,
      fuelChargePercentage: fuelChargePercentage,
      cgstTotal: cgstTotal,
      sgstTotal: sgstTotal,
      grandTotal: grandTotal,
      amountInWords: '', // Will be set by pre-save middleware
      status: 'unpaid',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // 30 days from now
      termsAndConditions: [
        'Invoice Amount To Be Paid By Same Days From The Date Of Invoice',
        'Payment Should Be Crossed Account Payee Cheque/Demand Draft or Digital Transfer Our Courier & Logistics Services (I) Pvt.Ltd',
        'Interest @ 3% Per Month Will Be Charged On Payment'
      ],
      createdBy: req.corporate._id
    });
    
    await invoice.save();
    
    // Mark shipments as invoiced
    const shipmentIds = unpaidShipments.map(s => s._id);
    await ConsignmentUsage.markAsInvoiced(shipmentIds, invoice._id);
    
    console.log(`✅ Consolidated invoice generated: ${invoiceNumber} for ${corporate.companyName}`);
    
    res.json({
      success: true,
      message: 'Consolidated invoice generated successfully',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: invoice.grandTotal,
        dueDate: invoice.dueDate,
        invoiceId: invoice._id,
        totalBills: unpaidShipments.length
      }
    });
    
  } catch (error) {
    console.error('Generate consolidated invoice error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to generate consolidated invoice'
      });
    }
  }
});

// Download consolidated invoice (Corporate users)
router.get('/download-consolidated-invoice', authenticateCorporate, async (req, res) => {
  try {
    // Get all unpaid FP bills for this corporate (TP shipments are excluded from settlement)
    const unpaidShipments = await ConsignmentUsage.findUnpaidFPByCorporate(req.corporate._id).lean();
    
    if (unpaidShipments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No unpaid bills found'
      });
    }
    
    // Get corporate details
    const corporate = await CorporateData.findById(req.corporate._id);
    if (!corporate) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found'
      });
    }
    
    // Get corporate pricing to get fuel charge percentage
    const CorporatePricing = (await import('../models/CorporatePricing.js')).default;
    const pricing = await CorporatePricing.findOne({ 
      corporateClient: req.corporate._id,
      status: 'approved'
    });
    
    // Use fuel charge percentage from pricing, default to 15% if not found
    const fuelChargePercentage = pricing?.fuelChargePercentage || 15;
    
    // Calculate totals
    let subtotal = 0;
    let awbChargesTotal = 0;
    let fuelSurchargeTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    
    const processedShipments = unpaidShipments.map(usage => {
      const bookingData = usage.bookingData;
      const freightCharges = parseFloat(usage.freightCharges) || 0;
      const awbCharge = 50; // 50rs per AWB
      const fuelSurcharge = freightCharges * (fuelChargePercentage / 100); // Dynamic fuel surcharge percentage
      const cgst = freightCharges * 0.09; // 9% CGST
      const sgst = freightCharges * 0.09; // 9% SGST
      const totalAmount = freightCharges + awbCharge + fuelSurcharge + cgst + sgst;
      
      subtotal += freightCharges;
      awbChargesTotal += awbCharge;
      fuelSurchargeTotal += fuelSurcharge;
      cgstTotal += cgst;
      sgstTotal += sgst;
      
      return {
        consignmentNumber: usage.consignmentNumber,
        bookingDate: usage.usedAt,
        destination: bookingData.destinationData?.city || 'N/A',
        serviceType: bookingData.shipmentData?.natureOfConsignment === 'DOX' ? 'DOX' : 'NON-DOX',
        weight: bookingData.shipmentData?.actualWeight || bookingData.shipmentData?.chargeableWeight || 0,
        freightCharges: freightCharges,
        awbCharge: awbCharge,
        fuelSurcharge: fuelSurcharge,
        cgst: cgst,
        sgst: sgst,
        totalAmount: totalAmount
      };
    });
    
    const grandTotal = subtotal + awbChargesTotal + fuelSurchargeTotal + cgstTotal + sgstTotal;
    
    // Create temporary invoice data for PDF generation
    const invoiceData = {
      invoiceNumber: `CONS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
      invoiceDate: new Date(),
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      companyName: corporate.companyName,
      companyAddress: corporate.fullAddress,
      gstNumber: corporate.gstNumber,
      contactNumber: corporate.contactNumber,
      email: corporate.email,
      shipments: processedShipments,
      subtotal: subtotal,
      awbChargesTotal: awbChargesTotal,
      fuelSurchargeTotal: fuelSurchargeTotal,
      fuelChargePercentage: fuelChargePercentage,
      cgstTotal: cgstTotal,
      sgstTotal: sgstTotal,
      grandTotal: grandTotal,
      status: 'pending'
    };
    
    // Generate HTML invoice
    const htmlInvoice = generateHTMLInvoice(invoiceData, corporate);
    
    try {
      // Use puppeteer for PDF generation
      const puppeteer = (await import('puppeteer')).default;
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlInvoice, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true
      });
      
      await browser.close();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="consolidated-invoice-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to HTML if PDF generation fails
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="consolidated-invoice-${new Date().toISOString().split('T')[0]}.html"`);
      res.send(htmlInvoice);
    }
    
  } catch (error) {
    console.error('Download consolidated invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download consolidated invoice'
    });
  }
});

export default router;
