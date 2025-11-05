import mongoose from "mongoose";

const medicineColoaderSchema = new mongoose.Schema({
  // Medicine User who created the coloader (optional for now)
  medicineUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineUser',
    required: false
  },
  
  // Phone number of the coloader
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    index: true
  },
  
  // Bus number / Coloader number
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    trim: true,
    index: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'medicine_coloaders'
});

// Create indexes for better performance
medicineColoaderSchema.index({ phoneNumber: 1, busNumber: 1 });
medicineColoaderSchema.index({ isActive: 1 });
medicineColoaderSchema.index({ createdAt: -1 });

// Static method to find active coloaders
medicineColoaderSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find by phone number
medicineColoaderSchema.statics.findByPhone = function(phoneNumber) {
  return this.find({ phoneNumber, isActive: true });
};

// Static method to find by bus number
medicineColoaderSchema.statics.findByBusNumber = function(busNumber) {
  return this.find({ busNumber, isActive: true });
};

export default mongoose.model("MedicineColoader", medicineColoaderSchema);

