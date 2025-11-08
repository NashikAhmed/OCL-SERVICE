import React from 'react';
import { Badge } from "@/components/ui/badge";

interface InvoiceItem {
  _id: string;
  consignmentNumber: number;
  bookingDate: string;
  serviceType: string;
  destination: string;
  awbNumber?: string;
  weight: number;
  freightCharges: number;
  totalAmount: number;
}

interface InvoiceSummary {
  totalBills: number;
  totalAmount: number;
  totalFreight: number;
  gstAmount: number;
}

interface InvoiceProps {
  items: InvoiceItem[];
  summary: InvoiceSummary;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoicePeriod?: string;
  corporateName?: string;
  corporateAddress?: string;
  corporateGstNumber?: string;
  corporateState?: string;
  corporateContact?: string;
  corporateEmail?: string;
  billerState?: string; // State code of the company issuing the invoice
}

const Invoice: React.FC<InvoiceProps> = ({
  items,
  summary,
  invoiceNumber,
  invoiceDate,
  invoicePeriod,
  corporateName = "Corporate Client",
  corporateAddress = "Corporate Address",
  corporateGstNumber = "",
  corporateState = "",
  corporateContact = "",
  corporateEmail = "",
  billerState = "Assam" // Default to Assam
}) => {
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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB');
  };

  const getCurrentInvoiceNumber = () => {
    const now = new Date();
    return `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getInvoicePeriod = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${formatDate(firstDay.toISOString())} to ${formatDate(lastDay.toISOString())}`;
  };

  // Function to convert number to words
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n: number): string => {
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

  // Calculate fuel charge (assuming 10% of freight)
  const fuelCharge = summary.totalFreight * 0.1;
  const awbCharges = items.length * 50; // 50rs per AWB
  const subtotalAfterFuel = summary.totalAmount + fuelCharge;
  
  // GST Logic based on state codes
  const isSameState = billerState.toLowerCase() === corporateState.toLowerCase();
  let cgst, sgst, igst;
  
  if (isSameState) {
    // Same state: CGST + SGST (9% each), IGST = 0%
    cgst = subtotalAfterFuel * 0.09;
    sgst = subtotalAfterFuel * 0.09;
    igst = 0;
  } else {
    // Different states: IGST (18%), CGST + SGST = 0%
    cgst = 0;
    sgst = 0;
    igst = subtotalAfterFuel * 0.18;
  }
  
  const grandTotal = subtotalAfterFuel + cgst + sgst + igst;

  return (
    <div className="bg-white p-4 max-w-5xl mx-auto font-sans text-sm">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        {/* Logo Placeholder */}
        <div className="w-20 h-12 bg-[#f5f5dc] rounded flex items-center justify-center">
          <div className="text-[#8b7355] text-xs font-medium">LOGO</div>
        </div>

        {/* Company Contact Info */}
        <div className="text-center flex-1">
          <div className="text-black text-xs space-y-0.5">
            <div className="font-medium">www.oclservices.com</div>
            <div>account@oclservices.com</div>
            <div>+91 9085969696</div>
            <div>+91 123456789</div>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="bg-[#4a9b8e] text-white px-6 py-8 rounded transform rotate-1 flex items-center justify-center min-h-[80px]">
          <div className="font-bold text-lg">Invoice</div>
        </div>
      </div>

      {/* Biller and Bill To Section */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Biller */}
        <div className="bg-[#fde2d1] rounded p-2">
          <div className="font-bold text-black text-xs mb-1">Biller</div>
          <div className="text-xs text-black">
            <div>Our Courier & Logistics Services (I) Pvt.Ltd</div>
            <div>Rehabari, Guwahati, Kamrup</div>
            <div>GSTIN/UIN: 18AACCO3877C1ZE</div>
            <div>State Name: Assam, Code: 18</div>
            <div>Contact: 9085969696</div>
            <div>E-Mail: oclindia2016@gmail.com</div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-[#fde2d1] rounded p-2">
          <div className="font-bold text-black text-xs mb-1">Bill To</div>
          <div className="text-xs text-black">
            <div className="font-medium">{corporateName}</div>
            <div>{corporateAddress}</div>
            {corporateGstNumber && <div>GSTIN/UIN: {corporateGstNumber}</div>}
            {corporateState && <div>State: {corporateState}</div>}
            {corporateContact && <div>Contact: {corporateContact}</div>}
            {corporateEmail && <div>E-Mail: {corporateEmail}</div>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-[#f0f0f0] rounded p-2 mb-3">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Invoice Date:</span>
            <span className="ml-1 font-medium">{invoiceDate || getCurrentDate()}</span>
          </div>
          <div>
            <span className="text-gray-600">Invoice No.:</span>
            <span className="ml-1 font-medium">{invoiceNumber || getCurrentInvoiceNumber()}</span>
          </div>
          <div>
            <span className="text-gray-600">Invoice Period:</span>
            <span className="ml-1 font-medium">{invoicePeriod || getInvoicePeriod()}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-3">
        {/* Table Header */}
        <div className="bg-[#4a9b8e] text-white rounded p-2">
          <div className="grid grid-cols-10 text-xs font-medium" style={{
            gridTemplateColumns: '0.5fr 1.2fr 1fr 1.5fr 1.8fr 1.2fr 0.8fr 0.8fr 1.3fr 1.3fr',
            gap: '8px'
          }}>
            <div className="pl-2">Sl.No.</div>
            <div className="border-l border-gray-300 pl-2">Date</div>
            <div className="border-l border-gray-300 pl-2">Type</div>
            <div className="border-l border-gray-300 pl-2">Destination</div>
            <div className="border-l border-gray-300 pl-2">AWB No.</div>
            <div className="border-l border-gray-300 pl-2">Weight</div>
            <div className="border-l border-gray-300 pl-2">AWB</div>
            <div className="border-l border-gray-300 pl-2">Others</div>
            <div className="border-l border-gray-300 pl-2">Freight</div>
            <div className="border-l border-gray-300 pl-2">Amount</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-0.5">
          {items.map((item, index) => (
            <div
              key={item._id}
              className={`grid grid-cols-10 p-2 rounded text-xs ${
                index % 2 === 0 ? 'bg-[#f0f0f0]' : 'bg-[#fde2d1]'
              }`}
              style={{
                gridTemplateColumns: '0.5fr 1.2fr 1fr 1.5fr 1.8fr 1.2fr 0.8fr 0.8fr 1.3fr 1.3fr',
                gap: '8px'
              }}
            >
              <div className="pl-2 text-center">{index + 1}</div>
              <div className="border-l border-gray-300 pl-2">{formatDate(item.bookingDate)}</div>
              <div className="border-l border-gray-300 pl-2">{item.serviceType === 'DOX' ? 'DOX' : 'NON-DOX'}</div>
              <div className="border-l border-gray-300 pl-2">{item.destination}</div>
              <div className="border-l border-gray-300 pl-2">{item.awbNumber || '-'}</div>
              <div className="border-l border-gray-300 pl-2">{item.weight} kg</div>
              <div className="border-l border-gray-300 pl-2">₹50</div>
              <div className="border-l border-gray-300 pl-2">-</div>
              <div className="border-l border-gray-300 pl-2">{formatCurrency(item.freightCharges)}</div>
              <div className="border-l border-gray-300 pl-2 font-medium">{formatCurrency(50 + item.freightCharges)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Section */}
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-sm">Total</div>
          <div className="bg-[#4a9b8e] text-white px-4 py-1 rounded font-medium text-sm">
            {formatCurrency(items.reduce((sum, item) => sum + 50 + item.freightCharges, 0))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Amount In Words */}
        <div className="col-span-3">
          <div className="font-medium text-xs mb-1">Amount In Words:</div>
          <div className="bg-[#f0f0f0] rounded p-2 h-24 text-xs">
            {summary.totalAmount > 0 ? numberToWords(Math.floor(grandTotal)) : ''}
          </div>
        </div>

        {/* Terms & Condition */}
        <div className="col-span-4">
          <div className="font-medium text-xs mb-1">Terms & Condition</div>
          <div className="bg-[#f0f0f0] rounded p-2 h-24 text-xs leading-tight">
            <div className="mb-1">1. Invoice Amount To Be Paid By Same Days From The Date Of Invoice</div>
            <div className="mb-1">2. Payment Should Be Crossed Account Payee Cheque/Demand Draft or Digital Transfer</div>
            <div>3. Interest @ 3% Per Month Will Be Charged On Payment</div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="col-span-2">
          <div className="font-medium text-xs mb-1">Bank Details</div>
          <div className="bg-[#f0f0f0] rounded p-2 h-24 text-xs">
            <div>Bank: SBI</div>
            <div>Acc: 1234567890</div>
            <div>IFSC: SBIN0001234</div>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="col-span-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Fuel Charge:</span>
              <span>{formatCurrency(fuelCharge)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-1">
              <span className="font-semibold">Total:</span>
              <div className="bg-[#4a9b8e] text-white px-3 py-1 rounded font-bold text-sm">
                {formatCurrency(subtotalAfterFuel)}
              </div>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>{formatCurrency(sgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>{formatCurrency(cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST:</span>
              <span>{formatCurrency(igst)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="flex justify-end items-center pt-2 border-t border-gray-300">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-base">Grand Total</div>
          <div className="bg-[#4a9b8e] text-white px-6 py-2 rounded font-bold text-base">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">Disclaimer:</div>
          <div>This Is a Computer Generated Invoice and does not require any official signature. Kindly notify us immediately in case you find any discrepancy in the details of transactions.</div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
