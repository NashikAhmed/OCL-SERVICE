import mongoose from "mongoose";

const courierRequestSchema = new mongoose.Schema({
  // Corporate Information
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateData',
    required: true
  },
  corporateInfo: {
    corporateId: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Request Details
  requestData: {
    pickupAddress: {
      type: String,
      required: false,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'immediate'],
      default: 'normal'
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: ''
    },
    packageCount: {
      type: Number,
      default: 1,
      min: 1
    },
    weight: {
      type: Number,
      required: true,
      min: 0.1
    }
  },
  
  // Status and Assignment
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Assigned Courier Boy Information
  assignedCourier: {
    courierBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourierBoy'
    },
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  assignedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Estimated response time
  estimatedResponseTime: {
    type: String,
    default: '10-15 minutes'
  }
}, {
  timestamps: true,
  collection: 'courierrequests'
});

// Indexes for better query performance
courierRequestSchema.index({ corporateId: 1 });
courierRequestSchema.index({ status: 1 });
courierRequestSchema.index({ requestedAt: -1 });
courierRequestSchema.index({ 'requestData.urgency': 1 });
courierRequestSchema.index({ 'assignedCourier.courierBoyId': 1 });

// Static method to find by status
courierRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ requestedAt: -1 });
};

// Static method to find pending requests
courierRequestSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ requestedAt: -1 });
};

// Instance method to assign courier boy
courierRequestSchema.methods.assignCourier = function(courierBoy) {
  this.status = 'assigned';
  this.assignedCourier = {
    courierBoyId: courierBoy._id,
    name: courierBoy.fullName,
    phone: courierBoy.phone
  };
  this.assignedAt = new Date();
  return this.save();
};

// Instance method to update status
courierRequestSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  return this.save();
};

export default mongoose.model("CourierRequest", courierRequestSchema);

