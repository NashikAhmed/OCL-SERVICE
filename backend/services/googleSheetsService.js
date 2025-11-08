import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Google Sheets Service for syncing settlement data
 */
class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  /**
   * Initialize Google Sheets API client
   */
  async initialize() {
    try {
      // Path to service account credentials
      const credentialsPath = path.join(__dirname, '..', 'google-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error('Google credentials file not found. Please add google-credentials.json to the backend directory.');
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      // Create auth client
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Create sheets client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Sync medicine booking data to Google Sheets in Excel format
   * @param {Array} bookings - Array of booking documents with populated fields
   */
  async syncMedicineBookings(bookings) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      if (!this.spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured in environment variables');
      }

      const sheetName = 'Medicine_Deliveries';

      // Check if sheet exists, create if not
      await this.ensureSheetExists(sheetName);

      // Prepare header row with all columns from Excel
      const headers = [
        'STATUS', 'DSTN:', 'Pckup Dt:', 'AWB Dt:', 'Forwarding Dt:', 'Arrived Dt.', 'DLV DT.',
        'Co-Loader', 'Co-Loader Bus No.', 'Co-Loader Docket No.', 'CoLdr Mob. No.', 'Docket No.',
        'Sender Add.', 'Sender Ph. No.', 'Recipients', 'ADDRESS', 'DLV Area',
        'M No. 1', 'Mob No. 2', 'Units', 'Weight',
        'TO PAY INR', 'INV No.', 'GST', 'Total',
        'Payment Upd', 'Amount Collected', 'UPI Ref: No.', 'Payment Dt:',
        'Remarks', 'FU Date:', 'FUp Time:', 'Receiver Name', 'Receiver Mob No.', 'POD'
      ];

      const rows = [headers];

      // Track totals
      let totalWeightSum = 0;
      let totalToPaySum = 0;

      // Process each booking
      bookings.forEach(booking => {
        // 1. STATUS - from booking.status
        let status = '';
        if (booking.status === 'delivered') status = 'DLVD';
        else if (booking.status === 'in_transit') status = 'IN TRANSIT';
        else if (booking.status === 'confirmed') status = 'CONFIRMED';
        else if (booking.status === 'pending') status = 'PENDING';
        else if (booking.status === 'cancelled') status = 'CANCELLED';

        // 2. DSTN (Destination - full city name)
        const dstn = booking.destination?.city || '';

        // 3. Pickup Date (booking creation date)
        const pickupDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : '';

        // 4. AWB Date (same as pickup for now)
        const awbDate = pickupDate;

        // 5. Forwarding Date (dispatch date - from manifest createdAt if available)
        let forwardingDate = '';
        if (booking.manifestId && booking.manifestId.createdAt) {
          forwardingDate = new Date(booking.manifestId.createdAt).toLocaleDateString('en-GB');
        }

        // 6. Arrived Date (blank for now)
        const arrivedDate = '';

        // 7. Delivery Date (blank for now)
        const deliveryDate = '';

        // 8-11. Co-Loader info
        const coLoader = 'BY BUS'; // Default as requested
        const coLoaderBusNo = booking.coloaderId?.busNumber || '';
        const coLoaderDocketNo = booking.manifestId?.coloaderDocketNo || '';
        const coLoaderMobNo = booking.coloaderId?.phoneNumber || '';

        // 12. Docket No (Consignment Number)
        const docketNo = booking.consignmentNumber || '';

        // 13-14. Sender Info
        let senderAdd = '';
        if (booking.origin) {
          const parts = [];
          if (booking.origin.companyName) parts.push(booking.origin.companyName);
          if (booking.origin.flatBuilding) parts.push(booking.origin.flatBuilding);
          if (booking.origin.locality) parts.push(booking.origin.locality);
          if (booking.origin.city) parts.push(booking.origin.city);
          senderAdd = parts.join(', ');
        }
        const senderPhNo = booking.origin?.mobileNumber || '';

        // 15-16. Recipient Info
        const recipients = booking.destination?.companyName || booking.destination?.name || '';
        let recipientAddress = '';
        if (booking.destination) {
          const parts = [];
          if (booking.destination.flatBuilding) parts.push(booking.destination.flatBuilding);
          if (booking.destination.locality) parts.push(booking.destination.locality);
          if (booking.destination.landmark) parts.push(booking.destination.landmark);
          recipientAddress = parts.join(', ');
        }

        // 17. Delivery Area (locality from destination - the dropdown selected after pincode)
        const dlvArea = booking.destination?.locality || '';

        // 18-19. Mobile Numbers
        const mNo1 = booking.destination?.mobileNumber || '';
        const mobNo2 = ''; // No second mobile in DB

        // 20-21. Units and Weight
        const units = booking.package?.totalPackages || '';
        const weight = parseFloat(booking.shipment?.actualWeight || booking.shipment?.chargeableWeight || 0);
        
        // 22-25. Payment Info
        const toPayINR = parseFloat(booking.charges?.grandTotal || 0);
        const invNo = booking.invoice?.invoiceNumber || '';
        const gst = ''; // Calculate if needed: SGST + CGST + IGST
        const total = booking.charges?.grandTotal || '';

        // Add to totals
        totalWeightSum += weight;
        totalToPaySum += toPayINR;

        // 26-29. Payment Status (blank for now)
        const paymentUpd = '';
        const amountCollected = '';
        const upiRefNo = '';
        const paymentDt = '';

        // 30-35. Delivery Tracking (blank for now)
        const remarks = '';
        const fuDate = '';
        const fupTime = '';
        const receiverName = '';
        const receiverMobNo = '';
        const pod = '';

        // Add row
        rows.push([
          status, dstn, pickupDate, awbDate, forwardingDate, arrivedDate, deliveryDate,
          coLoader, coLoaderBusNo, coLoaderDocketNo, coLoaderMobNo, docketNo,
          senderAdd, senderPhNo, recipients, recipientAddress, dlvArea,
          mNo1, mobNo2, units, weight,
          toPayINR, invNo, gst, total,
          paymentUpd, amountCollected, upiRefNo, paymentDt,
          remarks, fuDate, fupTime, receiverName, receiverMobNo, pod
        ]);
      });

      // Add empty rows for spacing before totals
      rows.push(Array(35).fill(''));
      rows.push(Array(35).fill(''));
      
      // Add totals row with colored status cells
      rows.push([
        '', '', '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', 
        '', // Units column
        totalWeightSum.toFixed(2), // Weight total
        totalToPaySum.toFixed(2), // To Pay INR total
        '', // INV No
        '', // GST
        '', // Total
        'WILL PAY', // Payment Upd - Green
        '', '', '',
        '', '', '', '', '', ''
      ]);

      // Add status indicator rows
      rows.push([
        '', '', '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'WILL PAY', // Green
        '', '', '',
        '', '', '', '', '', ''
      ]);

      rows.push([
        '', '', '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'NOT PAID', // Yellow
        '', '', '',
        '', '', '', '', '', ''
      ]);

      rows.push([
        '', '', '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'PAID', // Purple
        '', '', '',
        '', '', '', '', '', ''
      ]);

      rows.push([
        '', '', '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'PAID @', // Pink
        '', '', '',
        '', '', '', '', '', ''
      ]);

      // Clear and update the sheet
      const range = `${sheetName}!A1`;
      
      try {
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A:AI`,
        });
      } catch (error) {
        console.log('Sheet might be empty, proceeding...');
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });

      // Format the sheet with colored status cells
      await this.formatMedicineSheet(sheetName, rows.length, totalWeightSum, totalToPaySum);

      return {
        success: true,
        message: `${bookings.length} bookings synced to Google Sheets: ${sheetName}`,
        sheetName,
        rowsAdded: rows.length
      };
    } catch (error) {
      console.error('Error syncing medicine bookings to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Sync settlement data to Google Sheets
   * @param {Object} settlementData - Settlement data to sync
   * @param {number} month - Settlement month
   * @param {number} year - Settlement year
   */
  async syncSettlementData(settlementData, month, year) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      if (!this.spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured in environment variables');
      }

      const { settlements, grandTotal, totalWeight, totalCommission, oclCharge, remainingBalance, totalTransactions } = settlementData;

      // Get month name
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[month - 1];
      const sheetName = `${monthName} ${year}`;

      // Check if sheet exists, create if not
      await this.ensureSheetExists(sheetName);

      // Prepare data rows
      const rows = [
        // Header section
        [`Settlement Statement - ${monthName} ${year}`],
        [''],
        // Summary section
        ['Summary'],
        ['Total Transactions', totalTransactions],
        ['Total Weight (KG)', totalWeight ? totalWeight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'],
        ['Total Commission', `₹${(totalCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
        ['Grand Total (To Pay INR)', `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
        ['OCL Charge', `₹${oclCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
        ['Remaining Balance', `₹${remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
        [''],
        // Table headers
        ['Date', 'Consignment #', 'Sender', 'Receiver', 'Payment By', 'Weight (KG)', 'Commission (₹)', 'Amount (₹)'],
      ];

      // Add settlement data rows
      settlements.forEach(item => {
        const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        rows.push([
          date,
          item.consignmentNumber,
          item.senderName,
          item.receiverName,
          item.paidBy === 'sender' ? 'Sender' : 'Receiver',
          item.weight || 0,
          item.commission || 0,
          item.cost
        ]);
      });

      // Add total row
      rows.push([
        '',
        '',
        '',
        '',
        'Totals:',
        totalWeight || 0,
        totalCommission || 0,
        grandTotal
      ]);

      // Clear and replace the entire sheet content (not append)
      const range = `${sheetName}!A1`;
      
      // Clear existing content first
      try {
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A:Z`,
        });
      } catch (error) {
        console.log('Sheet might be empty, proceeding...');
      }

      // Update with new data (replaces entire content)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });

      // Format the sheet
      await this.formatSettlementSheet(sheetName, 1, rows.length);

      return {
        success: true,
        message: `Settlement data synced to Google Sheets: ${sheetName}`,
        sheetName,
        rowsAdded: rows.length
      };
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Ensure sheet exists in the spreadsheet
   * @param {string} sheetName - Name of the sheet
   */
  async ensureSheetExists(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheets = response.data.sheets;
      const sheetExists = sheets.some(sheet => sheet.properties.title === sheetName);

      if (!sheetExists) {
        // Create new sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            }],
          },
        });
      }
    } catch (error) {
      console.error('Error ensuring sheet exists:', error);
      throw error;
    }
  }

  /**
   * Format the settlement sheet with styling
   * @param {string} sheetName - Name of the sheet
   * @param {number} startRow - Starting row number (1-indexed)
   * @param {number} numRows - Number of rows
   */
  async formatSettlementSheet(sheetName, startRow, numRows) {
    try {
      // Get sheet ID
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      if (!sheet) return;

      const sheetId = sheet.properties.gridProperties?.sheetId || sheet.properties.sheetId;

      const requests = [
        // Bold the header row (title) - row 1
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true, fontSize: 14 },
              },
            },
            fields: 'userEnteredFormat.textFormat',
          },
        },
        // Bold summary section - row 3
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 2,
              endRowIndex: 3,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
              },
            },
            fields: 'userEnteredFormat.textFormat',
          },
        },
        // Bold table headers - row 11 (updated from row 9)
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 10,
              endRowIndex: 11,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: { bold: true },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 8,
            },
          },
        },
      ];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { requests },
      });
    } catch (error) {
      console.error('Error formatting settlement sheet:', error);
      // Don't throw error for formatting issues
    }
  }

  /**
   * Format the sheet with styling (legacy function for backward compatibility)
   * @param {string} sheetName - Name of the sheet
   * @param {number} startRow - Starting row number (1-indexed)
   * @param {number} numRows - Number of rows
   */
  async formatSheet(sheetName, startRow, numRows) {
    // Use the new settlement sheet formatter
    return this.formatSettlementSheet(sheetName, startRow, numRows);
  }

  /**
   * Format the medicine bookings sheet with styling
   * @param {string} sheetName - Name of the sheet
   * @param {number} numRows - Number of rows
   */
  async formatMedicineSheet(sheetName, numRows) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      if (!sheet) return;

      const sheetId = sheet.properties.gridProperties?.sheetId || sheet.properties.sheetId;

      // Calculate row indices for status cells (Payment Upd column is index 24)
      const totalsRowIndex = numRows - 5; // First totals row
      const willPayRow1 = numRows - 4;
      const willPayRow2 = numRows - 3;
      const notPaidRow = numRows - 2;
      const paidRow = numRows - 1;

      const requests = [
        // Freeze header row
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        },
        // Format header row - green background with bold black text
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 35,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.6, green: 0.8, blue: 0.6 },
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Format "WILL PAY" cell (first one) - Green background
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: totalsRowIndex,
              endRowIndex: totalsRowIndex + 1,
              startColumnIndex: 24, // Payment Upd column
              endColumnIndex: 25,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0, green: 1, blue: 0 }, // Bright green
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Format "WILL PAY" cells (rows below totals) - Green background
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: willPayRow1,
              endRowIndex: willPayRow2 + 1,
              startColumnIndex: 24,
              endColumnIndex: 25,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0, green: 1, blue: 0 }, // Bright green
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Format "NOT PAID" cell - Yellow background
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: notPaidRow,
              endRowIndex: notPaidRow + 1,
              startColumnIndex: 24,
              endColumnIndex: 25,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 1, green: 1, blue: 0 }, // Yellow
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Format "PAID" cell - Purple background
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: paidRow,
              endRowIndex: paidRow + 1,
              startColumnIndex: 24,
              endColumnIndex: 25,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.6, green: 0, blue: 0.6 }, // Purple
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Auto-resize all columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 35,
            },
          },
        },
      ];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { requests },
      });
    } catch (error) {
      console.error('Error formatting medicine sheet:', error);
      // Don't throw error for formatting issues
    }
  }
}

export default new GoogleSheetsService();
