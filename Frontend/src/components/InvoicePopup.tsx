import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CurrencyInput from './ui/CurrencyInput';
import FloatingLabelInput from './ui/FloatingLabelInput';
import DisplayField from './ui/DisplayField';

type BookingData = {
  originData: any;
  destinationData: any;
  shipmentData: any;
  uploadData: any;
  paymentData: { mode: string; deliveryType?: string };
  billData: any;
  detailsData: any;
};

interface InvoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (invoice: any) => void;
  bookingData: BookingData;
}

const fontStyle: React.CSSProperties = {
  fontFamily: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

const headingClass = 'font-semibold';
const bodyClass = '';

const borderCls = '';

const toUpper = (v?: string) => (v || '').toUpperCase();

export default function InvoicePopup({ isOpen, onClose, onConfirm, bookingData }: InvoicePopupProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [consignmentNo, setConsignmentNo] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  // Manual editable fields inside popup
  const [manualPaymentMode, setManualPaymentMode] = useState<string>('');
  const [manualFreightDetails, setManualFreightDetails] = useState<string>('');
  
  // Currency field states
  const [inFigure, setInFigure] = useState<string>('');
  const [inWord, setInWord] = useState<string>('');
  const [freight, setFreight] = useState<string>('');
  const [awbCharge, setAwbCharge] = useState<string>('');
  const [collectionCharge, setCollectionCharge] = useState<string>('');
  const [loadingCharge, setLoadingCharge] = useState<string>('');
  const [odaCharge, setOdaCharge] = useState<string>('');
  const [hamaliCharge, setHamaliCharge] = useState<string>('');
  const [packingCharge, setPackingCharge] = useState<string>('');
  const [demurrageCharge, setDemurrageCharge] = useState<string>('');
  const [otherCharge, setOtherCharge] = useState<string>('');
  
  // Auto-filled field states
  const [freightMode, setFreightMode] = useState<string>('');
  const [billingParty, setBillingParty] = useState<string>('');
  const [billingLocation, setBillingLocation] = useState<string>('');
  const [mrChequeNo, setMrChequeNo] = useState<string>('');
  const [mrDate, setMrDate] = useState<string>('');
  const [printDateTime, setPrintDateTime] = useState<string>('');
  
  // Totals section states
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [fuelSurcharge, setFuelSurcharge] = useState<string>('');
  const [cgstAmount, setCgstAmount] = useState<string>('');
  const [sgstAmount, setSgstAmount] = useState<string>('');
  const [igstAmount, setIgstAmount] = useState<string>('');
  const [grandTotal, setGrandTotal] = useState<string>('');
  
  // Consignor states
  const [consignorGst, setConsignorGst] = useState<string>('');
  const [consignorPhone, setConsignorPhone] = useState<string>('');
  const [consignorName, setConsignorName] = useState<string>('');
  const [consignorCompany, setConsignorCompany] = useState<string>('');
  const [consignorEmail, setConsignorEmail] = useState<string>('');
  const [consignorAddress, setConsignorAddress] = useState<string>('');
  const [consignorCity, setConsignorCity] = useState<string>('');
  
  // Consignee states
  const [consigneeGst, setConsigneeGst] = useState<string>('');
  const [consigneePhone, setConsigneePhone] = useState<string>('');
  const [consigneeName, setConsigneeName] = useState<string>('');
  const [consigneeCompany, setConsigneeCompany] = useState<string>('');
  const [consigneeEmail, setConsigneeEmail] = useState<string>('');
  const [consigneeAddress, setConsigneeAddress] = useState<string>('');
  const [consigneeCity, setConsigneeCity] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCreatedAt(new Date());
      // Use actual consignment number from booking data (not invoice number)
      const consignmentFromBooking = bookingData?.consignmentNumber;
      if (consignmentFromBooking) {
        setConsignmentNo(consignmentFromBooking.toString());
      } else {
        // Fallback: 8-digit placeholder (for preview only)
        setConsignmentNo(() => `${Date.now().toString().slice(-8)}`);
      }

      // Generate unique invoice number starting from OCL2025-0001
      const generateInvoiceNumber = () => {
        const currentYear = new Date().getFullYear();
        const baseNumber = `OCL${currentYear}`;

        // Get the last used number from localStorage or start from 0001
        const lastNumber = localStorage.getItem('lastInvoiceNumber');
        const nextNumber = lastNumber ? parseInt(lastNumber) + 1 : 1;

        // Update localStorage with new number
        localStorage.setItem('lastInvoiceNumber', nextNumber.toString());

        // Format with leading zeros (4 digits)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        return `${baseNumber}-${formattedNumber}`;
      };

      setInvoiceNumber(generateInvoiceNumber());
      setConfirmed(false);
      setBarcode(null);
      setManualPaymentMode('');
      setManualFreightDetails('');
      
      // Auto-fill fields from booking data
      setFreightMode(bookingData?.paymentData?.mode || '');
      setBillingParty(bookingData?.originData?.name || '');
      setBillingLocation(bookingData?.originData?.city || '');
      setMrChequeNo(''); // Will be filled manually if needed
      setMrDate(''); // Will be filled manually if needed
      setPrintDateTime(new Date().toLocaleString('en-IN'));
      
      // Auto-fill totals section
      setTotalAmount(totals.total.toString());
      setFuelSurcharge(bookingData?.detailsData?.fuelCharge || '0');
      setCgstAmount(totals.cgst.toString());
      setSgstAmount(totals.sgst.toString());
      setIgstAmount(totals.igst.toString());
      setGrandTotal(totals.grand.toString());
      
      // Auto-fill Consignor fields
      setConsignorGst(bookingData?.originData?.gstNumber || '');
      setConsignorPhone(bookingData?.originData?.mobileNumber || '');
      setConsignorName(bookingData?.originData?.name || '');
      setConsignorCompany(bookingData?.originData?.companyName || '');
      setConsignorEmail(bookingData?.originData?.email || '');
      setConsignorAddress(`${bookingData?.originData?.flatBuilding || ''}, ${bookingData?.originData?.locality || ''}`);
      setConsignorCity(`${bookingData?.originData?.city || ''}, ${toUpper(bookingData?.originData?.state || '')} - ${bookingData?.originData?.pincode || ''}`);
      
      // Auto-fill Consignee fields
      setConsigneeGst(bookingData?.destinationData?.gstNumber || '');
      setConsigneePhone(bookingData?.destinationData?.mobileNumber || '');
      setConsigneeName(bookingData?.destinationData?.name || '');
      setConsigneeCompany(bookingData?.destinationData?.companyName || '');
      setConsigneeEmail(bookingData?.destinationData?.email || '');
      setConsigneeAddress(`${bookingData?.destinationData?.flatBuilding || ''}, ${bookingData?.destinationData?.locality || ''}`);
      setConsigneeCity(`${bookingData?.destinationData?.city || ''}, ${toUpper(bookingData?.destinationData?.state || '')} - ${bookingData?.destinationData?.pincode || ''}`);
    }
  }, [isOpen, bookingData]);

  const basisOfBooking = useMemo(() => {
    const mode = (bookingData?.paymentData?.mode || '').toLowerCase();
    if (mode === 'cash') return 'PAID';
    if (mode === 'to pay' || mode === 'topay' || mode === 'to-pay') return 'TO PAY';
    return '—';
  }, [bookingData?.paymentData?.mode]);

  const bookingDateTime = useMemo(() =>
    createdAt ? createdAt.toLocaleString() : '', [createdAt]
  );

  const totals = useMemo(() => {
    const d = bookingData?.detailsData || {};
    const parse = (v: any) => {
      if (typeof v === 'string') return Number((v || '0').toString().replace(/,/g, '')) || 0;
      return Number(v) || 0;
    };
    const sgst = parse(d.sgstAmount);
    const cgst = parse(d.cgstAmount);
    const igst = parse(d.igstAmount);
    const total = parse(d.total) || 0;
    const grand = parse(d.grandTotal) || total + sgst + cgst + igst;
    return { sgst, cgst, igst, total, grand };
  }, [bookingData?.detailsData]);

  const handleConfirm = async () => {
    if (confirmed) return;
    const newBarcode = `BC${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setBarcode(newBarcode);
    setConfirmed(true);

    // Call the onConfirm callback with invoice data
    onConfirm?.({
      consignmentNo,
      barcode: newBarcode,
      createdAt: createdAt?.toISOString(),
      manualPaymentMode,
      manualFreightDetails,
      basisOfBooking,
      bookingData
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="invoice-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
          style={fontStyle}
        >
          {/* Backdrop (non-dismissable by click) */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <motion.div
              key="invoice-dialog"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-6xl bg-white text-black shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex items-center justify-end p-2 border-b border-gray-300 bg-[#406ab9]">
                <button aria-label="Close" onClick={onClose} className="p-2 rounded hover:bg-white/10">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Top Header Section */}
                <div className="grid grid-cols-3 border-b border-gray-300">
                  {/* Left Block */}
                  <div className="p-4 border-r border-gray-300">
                    <div className="space-y-1 text-sm">
                      <div>PAN No.: AJRPG5984</div>
                      <div>GST No.: 18AJRPG5984B1ZV</div>
                      <div>MSME No.: UDYAM-AS-03-0034807</div>
                      <div>HSN Code: 996812</div>
                      <div>Taxable Services: Goods, Transport, Courier Services.</div>
                    </div>
                  </div>
                  
                  {/* Middle Block - OCL Logo */}
                  <div className="p-4 border-r border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <img 
                        src="/src/assets/ocl-logo.jpg" 
                        alt="OCL Logo" 
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                      />
                      <div className="text-sm text-gray-600">Services</div>
                    </div>
                  </div>
                  
                  {/* Right Block */}
                  <div className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">Corporate Office:</div>
                      <div>PP Road,</div>
                      <div>Rehabari,</div>
                      <div>Guwahati, Assam</div>
                      <div>Ph: +91361-2637373 / 8453994809</div>
                    </div>
                  </div>
                </div>

                {/* Second Header Row */}
                <div className="grid grid-cols-3 border-b border-gray-300">
                  <div className="p-4 border-r border-gray-300">
                    <div className="font-semibold">Basis of Booking: {basisOfBooking}</div>
                  </div>
                  <div className="p-4 border-r border-gray-300 text-center">
                    <div className="font-bold">DUPLICATE COPY</div>
                  </div>
                  <div className="p-4 text-right">
                    <div className="font-bold">{bookingData?.paymentData?.deliveryType || 'GODOWN DELIVERY/DOOR DELIVERY'}</div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="border-b border-gray-300">
                  {/* Row 1 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="p-4 border-r border-gray-300">
                      <div className="font-bold">AT OWNER RISK</div>
                    </div>
                    <div className="p-4 border-r border-gray-300 text-center">
                      <div className="font-bold">CONSIGNMENT No.</div>
                      <div className="font-bold mt-2">{consignmentNo}</div>
                    </div>
                    <div className="p-4 text-right">
                      <div className="font-bold">Barcode for CN Number (Auto generated)</div>
                    </div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="p-4 border-r border-gray-300">
                      <div>Subject to Guwahati Jurisdiction</div>
                    </div>
                    <div className="p-4 border-r border-gray-300 text-center">
                      <div className="font-bold">Invoice Number</div>
                      <div className="font-bold mt-2">{invoiceNumber}</div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 h-full">
                        <div className="text-center font-bold flex items-center justify-center">Booking Mode</div>
                        <div className="text-center font-bold border-l border-gray-300 pl-2 flex items-center justify-center">Services Mode</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="grid grid-cols-4 border-b border-gray-300">
                    <div className="p-4 border-r border-gray-300">
                      <div>Consignment Booking Date & Time</div>
                    </div>
                    <div className="p-4 border-r border-gray-300 text-center">
                      <div>Email:</div>
                    </div>
                    <div className="p-4 border-r border-gray-300">
                      <div className="font-bold">BOOKING MODE</div>
                    </div>
                    <div className="p-4 text-right">
                      <div className="font-bold">SERVICE</div>
                    </div>
                  </div>
                  
                  {/* Row 4 */}
                  <div className="grid grid-cols-4">
                    <div className="p-4 border-r border-gray-300">
                      <div>{bookingDateTime}</div>
                    </div>
                    <div className="p-4 border-r border-gray-300 text-center">
                      <div>info@oclservices.com</div>
                    </div>
                    <div className="p-4 border-r border-gray-300">
                      <div>{bookingData?.shipmentData?.mode || 'SURFACE'}</div>
                    </div>
                    <div className="p-4 text-right">
                      <div>{bookingData?.shipmentData?.services || 'PRIORITY'}</div>
                    </div>
                  </div>
                </div>

                {/* Consignor / Consignee */}
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="p-4 border-r border-gray-300">
                    <div className="font-bold mb-4">Consignor -</div>
                    <div className="space-y-2 text-sm">
                      <DisplayField
                        label="GST No."
                        value={consignorGst || '—'}
                      />
                      <DisplayField
                        label="Phone No."
                        value={consignorPhone ? `+91 ${consignorPhone}` : '—'}
                      />
                      <DisplayField
                        label="Name"
                        value={consignorName || '—'}
                      />
                      <DisplayField
                        label="Company"
                        value={consignorCompany || '—'}
                      />
                      <DisplayField
                        label="Email"
                        value={consignorEmail || '—'}
                      />
                      <DisplayField
                        label="Address"
                        value={consignorAddress || '—'}
                      />
                      <DisplayField
                        label="City"
                        value={consignorCity || '—'}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-bold mb-4">Consignee -</div>
                    <div className="space-y-2 text-sm">
                      <DisplayField
                        label="GST No."
                        value={consigneeGst || '—'}
                      />
                      <DisplayField
                        label="Phone No."
                        value={consigneePhone ? `+91 ${consigneePhone}` : '—'}
                      />
                      <DisplayField
                        label="Name"
                        value={consigneeName || '—'}
                      />
                      <DisplayField
                        label="Company"
                        value={consigneeCompany || '—'}
                      />
                      <DisplayField
                        label="Email"
                        value={consigneeEmail || '—'}
                      />
                      <DisplayField
                        label="Address"
                        value={consigneeAddress || '—'}
                      />
                      <DisplayField
                        label="City"
                        value={consigneeCity || '—'}
                      />
                    </div>
                  </div>
                </div>

                {/* Origin/Destination/Freight */}
                <div className="border-b border-gray-300">
                  {/* Row 1: Origin/Destination */}
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-4 border-r border-gray-300 flex justify-between items-center">
                      <div className="font-bold">ORIGIN:</div>
                      <div>{bookingData?.originData?.city || 'MANGALDAI'}</div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div className="font-bold">DESTINATION:</div>
                      <div>{bookingData?.destinationData?.city || 'DELHI'}</div>
                    </div>
                  </div>
                  
                  {/* Row 2: Payment Mode / Freight Details */}
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-4 border-r border-gray-300 text-center">
                      <div className="font-bold">PAYMENT MODE</div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="font-bold">FREIGHT DETAILS</div>
                    </div>
                  </div>
                  
                  {/* Payment Mode and Freight Details Grid */}
                  <div className="grid grid-cols-2">
                    {/* Left Column - Payment Mode */}
                    <div className="p-4 border-r border-gray-300">
                      <div className="space-y-2 text-sm">
                        <DisplayField
                          label="Freight Mode"
                          value={freightMode}
                        />
                        <DisplayField
                          label="Billing Party"
                          value={billingParty}
                        />
                        <DisplayField
                          label="Billing Location"
                          value={billingLocation}
                        />
                        <div className="py-3 text-sm text-gray-600">IF PAID By CASH / CHEQUE</div>
                        <CurrencyInput
                          label="In Figure (Rs.)"
                          value={inFigure}
                          onChange={setInFigure}
                          className="mb-2"
                        />
                        <FloatingLabelInput
                          label="In Word (Rs.)"
                          value={inWord}
                          onChange={setInWord}
                          className="mb-2"
                        />
                        <DisplayField
                          label="MR / Cheque No."
                          value={mrChequeNo}
                        />
                        <DisplayField
                          label="MR Date"
                          value={mrDate}
                        />
                        <DisplayField
                          label="Print Date / Time"
                          value={printDateTime}
                        />
                      </div>
                    </div>
                    
                    {/* Right Column - Freight Details */}
                    <div className="p-4">
                      <div className="space-y-4 text-sm">
                        <CurrencyInput
                          label="Freight"
                          value={freight}
                          onChange={setFreight}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="AWB Charge"
                          value={awbCharge}
                          onChange={setAwbCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Collection Charge"
                          value={collectionCharge}
                          onChange={setCollectionCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Loading / Unloading Charge"
                          value={loadingCharge}
                          onChange={setLoadingCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="ODA Charge"
                          value={odaCharge}
                          onChange={setOdaCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Hamali Charge"
                          value={hamaliCharge}
                          onChange={setHamaliCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Packing Charge"
                          value={packingCharge}
                          onChange={setPackingCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Demurrage Charge"
                          value={demurrageCharge}
                          onChange={setDemurrageCharge}
                          className="mb-2"
                        />
                        <CurrencyInput
                          label="Other Charge"
                          value={otherCharge}
                          onChange={setOtherCharge}
                          className="mb-2"
                        />
                        <div className="py-4 space-y-4">
                          {/* First Total */}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-calibri text-gray-700 font-bold">Total:</span>
                            <CurrencyInput
                              label=""
                              value={totalAmount}
                              onChange={setTotalAmount}
                              className="w-32"
                              isBold={true}
                            />
                          </div>
                          
                          {/* Fuel Surcharge */}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-calibri text-gray-700">Fuel Surcharge:</span>
                            <span className="text-sm font-calibri text-gray-900 text-right">{fuelSurcharge}%</span>
                          </div>
                          
                          {/* Separator */}
                          <div className="border-t border-gray-300 mt-2 pt-2"></div>
                          
                          {/* Second Total */}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-calibri text-gray-700 font-bold">Total:</span>
                            <CurrencyInput
                              label=""
                              value={totalAmount}
                              onChange={setTotalAmount}
                              className="w-32"
                              isBold={true}
                            />
                          </div>
                          
                          {/* Tax Fields */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-calibri text-gray-700">CGST @9%:</span>
                              <CurrencyInput
                                label=""
                                value={cgstAmount}
                                onChange={setCgstAmount}
                                className="w-32"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-calibri text-gray-700">SGST @9%:</span>
                              <CurrencyInput
                                label=""
                                value={sgstAmount}
                                onChange={setSgstAmount}
                                className="w-32"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-calibri text-gray-700">IGST @18%:</span>
                              <CurrencyInput
                                label=""
                                value={igstAmount}
                                onChange={setIgstAmount}
                                className="w-32"
                              />
                            </div>
                          </div>
                          
                          {/* Final TOTAL */}
                          <div className="border-t-2 border-gray-400 mt-4 pt-4">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-base font-calibri text-gray-900 font-bold">TOTAL:</span>
                              <CurrencyInput
                                label=""
                                value={grandTotal}
                                onChange={setGrandTotal}
                                className="w-32"
                                isBold={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consignment Details Table */}
                <div className="border-b border-gray-300">
                  <div className="p-4 border-b border-gray-300">
                    <div className="font-bold">CONSIGNMENT DETAILS -</div>
                  </div>
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 border-b border-gray-300">
                    <div className="p-2 border-r border-gray-300 text-center font-bold">No. of Pkg</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Packing Type</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Item Description</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Inv No.</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Inv Date</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Inv Value</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Vol. Weight</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Actual Weight</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">Chargeable Weight</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">EWB No.</div>
                    <div className="p-2 border-r border-gray-300 text-center font-bold">EWB Date</div>
                    <div className="p-2 text-center font-bold">EWB Valid</div>
                  </div>
                  
                  {/* Table Data Row */}
                  <div className="grid grid-cols-12">
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.totalPackages || '1'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.shipmentData?.packagingType || 'OTH'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.contentDescription || 'Parts'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{consignmentNo || '4361'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.invoiceDate || '20/01/25'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.invoiceValue || '12'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.shipmentData?.volumetricWeight || '70 Kgs'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.shipmentData?.actualWeight || '90 Kgs'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.shipmentData?.chargeableWeight || '90 Kgs'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.eWaybillNumber || '8888 888'}</div>
                    <div className="p-2 border-r border-gray-300 text-center">{bookingData?.uploadData?.eWaybillDate || '01-01-2025'}</div>
                    <div className="p-2 text-center">{bookingData?.uploadData?.eWaybillValidity || '31-02-2025'}</div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 text-right">
                  <div className="text-2xl font-bold">{bookingData?.uploadData?.invoiceValue || '12323232323'}</div>
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-gray-300">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={handleConfirm} 
                      className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                    >
                      {confirmed ? 'Confirmed' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


