import express from 'express';
import Invoice from '../models/Invoice.js';
import { authenticateCorporate, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Generate PDF for invoice
router.get('/:invoiceId/pdf', authenticateCorporate, async (req, res) => {
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
    
    // Generate HTML content first
    const htmlContent = generateInvoiceHTML(invoice);
    
    try {
      // Use puppeteer for PDF generation
      const puppeteer = (await import('puppeteer')).default;
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
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
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to HTML if PDF generation fails
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNumber}.html"`);
      res.send(htmlContent);
    }
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate invoice PDF'
    });
  }
});

// Generate HTML for invoice (temporary solution)
function generateInvoiceHTML(invoice) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n) => {
      let result = '';
      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n > 9) {
        result += teens[n - 10] + ' ';
        return result.trim();
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result.trim();
    };

    let result = '';
    let scaleIndex = 0;
    
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        const chunkWords = convertHundreds(chunk);
        if (scaleIndex > 0) {
          result = chunkWords + ' ' + scales[scaleIndex] + ' ' + result;
        } else {
          result = chunkWords;
        }
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    return result.trim() + ' Rupees Only';
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #e5e5e5;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .company-details, .invoice-details {
                flex: 1;
            }
            .invoice-details {
                text-align: right;
            }
            .invoice-title {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
            }
            .invoice-number {
                font-size: 18px;
                color: #666;
            }
            .details-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .details-table th,
            .details-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .details-table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .details-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .amount-summary {
                float: right;
                width: 300px;
                margin-top: 20px;
            }
            .amount-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .amount-row.total {
                font-weight: bold;
                font-size: 18px;
                border-top: 2px solid #333;
                border-bottom: 2px solid #333;
                margin-top: 10px;
                padding-top: 15px;
            }
            .amount-in-words {
                margin-top: 20px;
                font-style: italic;
                color: #666;
                min-height: 40px;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 4px;
                word-wrap: break-word;
            }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status-paid {
                background-color: #d4edda;
                color: #155724;
            }
            .status-unpaid {
                background-color: #fff3cd;
                color: #856404;
            }
            .status-overdue {
                background-color: #f8d7da;
                color: #721c24;
            }
            @media print {
                body { background-color: white; }
                .invoice-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <h1 class="invoice-title">TAX INVOICE</h1>
                <p class="invoice-number">Invoice No: ${invoice.invoiceNumber}</p>
            </div>
            
            <div class="company-info">
                <div class="company-details">
                    <h3>Our Courier & Logistics Services (I) Pvt.Ltd</h3>
                    <p>Rehabari, Guwahati, Kamrup</p>
                    <p>GSTIN/UIN: 18AACCO3877C1ZE</p>
                    <p>State Name: Assam, Code: 18</p>
                    <p>Contact: 9085969696</p>
                    <p>E-Mail: oclindia2016@gmail.com</p>
                </div>
                <div class="invoice-details">
                    <h3>${invoice.companyName}</h3>
                    <p>${invoice.companyAddress}</p>
                    <p>GSTIN/UIN: ${invoice.gstNumber || 'N/A'}</p>
                    <p>State: ${invoice.state}</p>
                    <p>Contact: ${invoice.contactNumber}</p>
                    <p>E-Mail: ${invoice.email}</p>
                </div>
            </div>
            
            <div class="company-info">
                <div class="company-details">
                    <p><strong>Invoice Period:</strong> ${formatDate(invoice.invoicePeriod.startDate)} to ${formatDate(invoice.invoicePeriod.endDate)}</p>
                    <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
                </div>
                <div class="invoice-details">
                    <p><strong>Status:</strong> 
                        <span class="status-badge status-${invoice.status}">${invoice.status}</span>
                    </p>
                    <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                </div>
            </div>
            
            <table class="details-table">
                <thead>
                    <tr>
                        <th>SN</th>
                        <th>Date</th>
                        <th>Type of</th>
                        <th>Destination</th>
                        <th>AWB</th>
                        <th>Other</th>
                        <th>Freight Charges</th>
                        <th>Amount INR</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.shipments.map((shipment, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${formatDate(shipment.bookingDate)}</td>
                            <td>${shipment.serviceType === 'DOX' ? 'DOX' : 'NON-DOX'}</td>
                            <td>${shipment.destination}</td>
                            <td>${shipment.consignmentNumber}</td>
                            <td>${shipment.weight} kg</td>
                            <td>₹50</td>
                            <td>${formatCurrency(shipment.freightCharges)}</td>
                            <td>${formatCurrency(shipment.totalAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="amount-summary">
                <div class="amount-row">
                    <span>Total (Subtotal of services):</span>
                    <span>${formatCurrency(invoice.subtotal)}</span>
                </div>
                <div class="amount-row">
                    <span>AWB CHARGES:</span>
                    <span>${formatCurrency(invoice.shipments.length * 50)}</span>
                </div>
                <div class="amount-row">
                    <span>FUEL SURCHARGE (${invoice.fuelChargePercentage || 15}%):</span>
                    <span>${formatCurrency(invoice.fuelSurchargeTotal)}</span>
                </div>
                <div class="amount-row">
                    <span>CGST@9%:</span>
                    <span>${formatCurrency(invoice.cgstTotal)}</span>
                </div>
                <div class="amount-row">
                    <span>SGST@9%:</span>
                    <span>${formatCurrency(invoice.sgstTotal)}</span>
                </div>
                <div class="amount-row total">
                    <span>Grand Total:</span>
                    <span>${formatCurrency(invoice.grandTotal + (invoice.shipments.length * 50))}</span>
                </div>
                <div class="amount-in-words">
                    <strong>In Words: INR ${numberToWords(Math.floor(invoice.grandTotal + (invoice.shipments.length * 50)))}</strong>
                </div>
            </div>
            
            <div style="clear: both;"></div>
            
            ${invoice.status === 'paid' && invoice.paymentDate ? `
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin-top: 30px;">
                    <h4 style="color: #155724; margin: 0 0 10px 0;">Payment Information</h4>
                    <p style="margin: 5px 0; color: #155724;"><strong>Payment Date:</strong> ${formatDate(invoice.paymentDate)}</p>
                    <p style="margin: 5px 0; color: #155724;"><strong>Payment Method:</strong> ${invoice.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
                    <p style="margin: 5px 0; color: #155724;"><strong>Reference:</strong> ${invoice.paymentReference}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p><strong>Terms and Conditions:</strong></p>
                <p>1. Invoice Amount To Be Paid By Same Days From The Date Of Invoice</p>
                <p>2. Payment Should Be Crossed Account Payee Cheque/Demand Draft or Digital Transfer Our Courier & Logistics Services (I) Pvt.Ltd</p>
                <p>3. Interest @ 3% Per Month Will Be Charged On Payment</p>
                <br>
                <p><strong>Disclaimer:</strong> This Is a Computer Generated Invoice and does not require any official signature. Kindly notify us immediately in case you find any discrepancy in the details of transactions.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export default router;
