import mongoose from "mongoose";

const courierBoySchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Full name cannot be longer than 100 characters']
  },
  designation: {
    type: String,
    required: true,
    trim: true,
    default: 'Courier Boy'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Address Information
  locality: {
    type: String,
    required: true,
    trim: true
  },
  building: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  
  // Document Information
  aadharCard: {
    type: String,
    required: true,
    trim: true
  },
  aadharCardUrl: {
    type: String,
    required: true,
    trim: true
  },
  panCard: {
    type: String,
    required: true,
    trim: true
  },
  panCardUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  // Vehicle Information
  vehicleType: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Bicycle',
      'Scooter',
      'Motorcycle',
      'Electric Bike (E-Bike)',
      'Cargo Auto Rickshaw',
      'Electric Loader (E-Rickshaw)',
      'Mini Truck (Tata Ace / Dost / Jeeto)',
      'Pickup Van (Bolero Pickup / Similar)',
      'Small Truck (10ft–14ft)',
      'Large Truck (17ft–22ft)',
      'Container Truck / Lorry',
      'Others'
    ]
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status and Verification
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'courierboys'
});

// Indexes for better query performance
// Note: email index is automatically created due to unique: true
courierBoySchema.index({ phone: 1 });
courierBoySchema.index({ status: 1 });
courierBoySchema.index({ isVerified: 1 });
courierBoySchema.index({ registrationDate: -1 });

// Static method to find courier boys by status
courierBoySchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find verified courier boys
courierBoySchema.statics.findVerified = function() {
  return this.find({ isVerified: true });
};

// Instance method to approve courier boy
courierBoySchema.methods.approve = function() {
  this.status = 'approved';
  this.isVerified = true;
  this.lastUpdated = new Date();
  
  // Handle missing URL fields by setting them to the document paths if URLs are null
  if (!this.aadharCardUrl && this.aadharCard) {
    this.aadharCardUrl = this.aadharCard;
  }
  if (!this.panCardUrl && this.panCard) {
    this.panCardUrl = this.panCard;
  }
  
  return this.save();
};

// Instance method to reject courier boy
courierBoySchema.methods.reject = function() {
  this.status = 'rejected';
  this.isVerified = false;
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update status
courierBoySchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.isVerified = newStatus === 'approved';
  this.lastUpdated = new Date();
  
  // Handle missing URL fields by setting them to the document paths if URLs are null
  if (newStatus === 'approved') {
    if (!this.aadharCardUrl && this.aadharCard) {
      this.aadharCardUrl = this.aadharCard;
    }
    if (!this.panCardUrl && this.panCard) {
      this.panCardUrl = this.panCard;
    }
  }
  
  return this.save();
};

export default mongoose.model("CourierBoy", courierBoySchema);
