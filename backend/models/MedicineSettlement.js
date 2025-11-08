import mongoose from "mongoose";

const medicineSettlementSchema = new mongoose.Schema({
  // Reference to the medicine booking
  medicineBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineBooking',
    required: true
  },

  // Consignment number from the booking
  consignmentNumber: {
    type: Number,
    required: true
  },

  // Sender details
  senderName: {
    type: String,
    required: true,
    trim: true
  },

  // Receiver details
  receiverName: {
    type: String,
    required: true,
    trim: true
  },

  // Payment information
  paidBy: {
    type: String,
    enum: ['sender', 'receiver'],
    required: true
  },

  // Cost/amount
  cost: {
    type: Number,
    required: true
  },

  // Weight in KG
  weight: {
    type: Number,
    default: 0
  },

  // Commission (weight × 10 rs)
  commission: {
    type: Number,
    default: 0
  },

  // Settlement status
  isPaid: {
    type: Boolean,
    default: false
  },

  // Month and year for filtering
  settlementMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },

  settlementYear: {
    type: Number,
    required: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'medicinesettlements'
});

// Indexes for better query performance
medicineSettlementSchema.index({ medicineBookingId: 1 });
medicineSettlementSchema.index({ consignmentNumber: 1 });
medicineSettlementSchema.index({ paidBy: 1 });
medicineSettlementSchema.index({ isPaid: 1 });
medicineSettlementSchema.index({ settlementMonth: 1, settlementYear: 1 });

export default mongoose.model("MedicineSettlement", medicineSettlementSchema);