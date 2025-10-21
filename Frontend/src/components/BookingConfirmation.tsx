import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  Printer,
  Plus
} from 'lucide-react';

interface BookingConfirmationProps {
  bookingData: {
    originData: any;
    destinationData: any;
    shipmentData: any;
    uploadData: any;
    billData: any;
    paymentData: any;
    detailsData: any;
  };
  customerId: string;
  onBookMore: () => void;
  onViewInvoice: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  customerId,
  onBookMore,
  onViewInvoice
}) => {
  const {
    originData,
    destinationData,
    shipmentData,
    uploadData,
    billData,
    paymentData,
    detailsData
  } = bookingData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-4"
    >
      {/* Header */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-[#406ab9]/5 to-[#4ec0f7]/5 rounded-2xl p-8 border border-[#406ab9]/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-[#406ab9] rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Booking Confirmed!</h3>
          <p className="text-[#64748b] mb-4">Your shipment has been successfully registered and saved to the database.</p>
          <div className="bg-white rounded-xl p-4 border border-[#406ab9]/20 inline-block">
            <p className="text-sm text-[#64748b]">Customer ID</p>
            <p className="text-xl font-bold text-[#406ab9]">{customerId || 'Loading...'}</p>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={onViewInvoice}
              className="px-6 py-3 bg-[#406ab9] text-white rounded-lg hover:bg-[#355a9a] font-semibold transition-colors duration-200 shadow-lg flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Invoice
            </button>
            <button
              onClick={onBookMore}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-semibold transition-colors duration-200 shadow-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book More
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Data Display */}
      <div className="bg-white shadow-2xl rounded-2xl border-2 border-gray-200 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Origin Section */}
          <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">
              📍 ORIGIN DETAILS
            </h3>
            <div className="space-y-2">
              <div><strong>Name:</strong> {originData?.name}</div>
              <div><strong>Mobile:</strong> +91 {originData?.mobileNumber}</div>
              <div><strong>Company:</strong> {originData?.companyName || 'N/A'}</div>
              <div><strong>Email:</strong> {originData?.email}</div>
              <div><strong>Address:</strong> {originData?.flatBuilding}, {originData?.locality}</div>
              <div><strong>Landmark:</strong> {originData?.landmark || 'N/A'}</div>
              <div><strong>Pincode:</strong> {originData?.pincode}</div>
              <div><strong>City:</strong> {originData?.city}</div>
              <div><strong>District:</strong> {originData?.district}</div>
              <div><strong>State:</strong> {originData?.state}</div>
              <div><strong>GST:</strong> {originData?.gstNumber || 'N/A'}</div>
              <div><strong>Type:</strong> {originData?.addressType}</div>
            </div>
          </div>

          {/* Destination Section */}
          <div className="border border-green-200 rounded-xl p-6 bg-green-50">
            <h3 className="text-xl font-bold text-green-800 mb-4 border-b border-green-200 pb-2">
              🎯 DESTINATION DETAILS
            </h3>
            <div className="space-y-2">
              <div><strong>Name:</strong> {destinationData?.name}</div>
              <div><strong>Mobile:</strong> +91 {destinationData?.mobileNumber}</div>
              <div><strong>Company:</strong> {destinationData?.companyName || 'N/A'}</div>
              <div><strong>Email:</strong> {destinationData?.email}</div>
              <div><strong>Address:</strong> {destinationData?.flatBuilding}, {destinationData?.locality}</div>
              <div><strong>Landmark:</strong> {destinationData?.landmark || 'N/A'}</div>
              <div><strong>Pincode:</strong> {destinationData?.pincode}</div>
              <div><strong>City:</strong> {destinationData?.city}</div>
              <div><strong>District:</strong> {destinationData?.district}</div>
              <div><strong>State:</strong> {destinationData?.state}</div>
              <div><strong>GST:</strong> {destinationData?.gstNumber || 'N/A'}</div>
              <div><strong>Type:</strong> {destinationData?.addressType}</div>
            </div>
          </div>

          {/* Shipment Section */}
          <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
            <h3 className="text-xl font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2">
              📦 SHIPMENT DETAILS
            </h3>
            <div className="space-y-2">
              <div><strong>Nature:</strong> {shipmentData?.natureOfConsignment}</div>
              <div><strong>Service:</strong> {shipmentData?.services}</div>
              <div><strong>Mode:</strong> {shipmentData?.mode}</div>
              <div><strong>Insurance:</strong> {shipmentData?.insurance}</div>
              <div><strong>Risk Coverage:</strong> {shipmentData?.riskCoverage}</div>
              <div><strong>Actual Weight:</strong> {shipmentData?.actualWeight} Kg</div>
              {shipmentData?.perKgWeight && (
                <div><strong>Per Kg Rate:</strong> ₹{shipmentData?.perKgWeight}</div>
              )}
              <div><strong>Volumetric Weight:</strong> {shipmentData?.volumetricWeight} Kg</div>
              <div><strong>Chargeable Weight:</strong> {shipmentData?.chargeableWeight} Kg</div>
            </div>
          </div>

          {/* Package & Payment Section */}
          <div className="space-y-6">
            {/* Package Details */}
            <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
              <h3 className="text-xl font-bold text-purple-800 mb-4 border-b border-purple-200 pb-2">
                📋 PACKAGE DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Total Packages:</strong> {uploadData?.totalPackages}</div>
                <div><strong>Content:</strong> {uploadData?.contentDescription}</div>
                <div><strong>Invoice No:</strong> {uploadData?.invoiceNumber}</div>
                <div><strong>Invoice Value:</strong> ₹{uploadData?.invoiceValue}</div>
                {uploadData?.eWaybillNumber && (
                  <div><strong>E-Waybill:</strong> {uploadData.eWaybillNumber}</div>
                )}
              </div>
            </div>

            {/* Billing Details */}
            <div className="border border-cyan-200 rounded-xl p-6 bg-cyan-50">
              <h3 className="text-xl font-bold text-cyan-800 mb-4 border-b border-cyan-200 pb-2">
                🧾 BILLING DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Bill To:</strong> {billData?.partyType === 'sender' ? 'Sender' : billData?.partyType === 'recipient' ? 'Recipient' : 'Other Party'}</div>
                {billData?.partyType === 'other' && (
                  <>
                    <div><strong>Concern Name:</strong> {billData?.otherPartyDetails?.concernName}</div>
                    <div><strong>Company:</strong> {billData?.otherPartyDetails?.companyName}</div>
                    <div><strong>Phone:</strong> {billData?.otherPartyDetails?.phoneNumber}</div>
                    <div><strong>Address:</strong> {billData?.otherPartyDetails?.flatBuilding}, {billData?.otherPartyDetails?.locality}</div>
                    <div><strong>City:</strong> {billData?.otherPartyDetails?.city}</div>
                    <div><strong>State:</strong> {billData?.otherPartyDetails?.state}</div>
                    <div><strong>GST:</strong> {billData?.otherPartyDetails?.gstNumber || 'N/A'}</div>
                  </>
                )}
                <div><strong>Bill Type:</strong> {billData?.billType === 'normal' ? 'Normal GST' : 'RCM'}</div>
              </div>
            </div>

            {/* Charges Details */}
            <div className="border border-emerald-200 rounded-xl p-6 bg-emerald-50">
              <h3 className="text-xl font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">
                💰 CHARGES DETAILS
              </h3>
              <div className="space-y-2">
                <div><strong>Freight Charge:</strong> ₹{detailsData?.freightCharge || '0'}</div>
                <div><strong>AWB Charge:</strong> ₹{detailsData?.awbCharge || '0'}</div>
                <div><strong>Local Collection:</strong> ₹{detailsData?.localCollection || '0'}</div>
                <div><strong>Door Delivery:</strong> ₹{detailsData?.doorDelivery || '0'}</div>
                <div><strong>Loading/Unloading:</strong> ₹{detailsData?.loadingUnloading || '0'}</div>
                <div><strong>Demurrage Charge:</strong> ₹{detailsData?.demurrageCharge || '0'}</div>
                <div><strong>DDA Charge:</strong> ₹{detailsData?.ddaCharge || '0'}</div>
                <div><strong>Hamali Charge:</strong> ₹{detailsData?.hamaliCharge || '0'}</div>
                <div><strong>Packing Charge:</strong> ₹{detailsData?.packingCharge || '0'}</div>
                <div><strong>Other Charge:</strong> ₹{detailsData?.otherCharge || '0'}</div>
                <div><strong>Fuel Charge:</strong> {detailsData?.fuelCharge || '0'}%</div>
                <div className="border-t border-emerald-300 pt-2 mt-2">
                  <div><strong>SGST:</strong> ₹{detailsData?.sgstAmount || '0'}</div>
                  <div><strong>CGST:</strong> ₹{detailsData?.cgstAmount || '0'}</div>
                  <div><strong>IGST:</strong> ₹{detailsData?.igstAmount || '0'}</div>
                  <div className="font-bold text-lg"><strong>Total:</strong> ₹{detailsData?.total || '0'}</div>
                </div>
              </div>
            </div>

            {/* Payment & Delivery Details */}
            <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50">
              <h3 className="text-xl font-bold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">
                💳 PAYMENT & DELIVERY
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-lg font-bold">
                    Payment: {paymentData?.mode}
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-bold">
                    Delivery: {paymentData?.deliveryType}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Document
          </button>
          <button
            onClick={onBookMore}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          Please save this document for your records. Your booking reference is: <strong>{customerId}</strong>
        </p>
      </div>
    </motion.div>
  );
};

export default BookingConfirmation;