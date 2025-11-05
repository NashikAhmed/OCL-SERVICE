import mongoose from "mongoose";

const assignedCourierSchema = new mongoose.Schema({
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
  
  // Type field - for now all will be 'corporate', but extensible later
  type: {
    type: String,
    enum: ['corporate', 'office_user', 'courier_boy'], // Extensible for future
    default: 'corporate',
    required: true
  },
  
  // Work type - 'pickup' for orders assigned from assign courier boy component
  work: {
    type: String,
    enum: ['pickup', 'delivery', 'both'], // Extensible for future
    default: 'pickup',
    required: true
  },
  
  // Consignment Numbers and Order Details
  orders: [{
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsignmentUsage',
      required: true
    },
    consignmentNumber: {
      type: Number,
      required: true
    },
    bookingReference: {
      type: String,
      required: true
    },
    originData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    destinationData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    shipmentData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    invoiceData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
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
    },
    email: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    }
  },
  
  // Assigned by (Admin who assigned)
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Timestamps
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  }
}, {
  timestamps: true,
  collection: 'assignedcouriers'
});

// Indexes for better query performance
assignedCourierSchema.index({ corporateId: 1 });
assignedCourierSchema.index({ type: 1 });
assignedCourierSchema.index({ work: 1 });
assignedCourierSchema.index({ status: 1 });
assignedCourierSchema.index({ assignedAt: -1 });
assignedCourierSchema.index({ 'assignedCourier.courierBoyId': 1 });
assignedCourierSchema.index({ 'orders.consignmentNumber': 1 });

// Static method to find by status
assignedCourierSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ assignedAt: -1 });
};

// Static method to find by courier boy
assignedCourierSchema.statics.findByCourierBoy = function(courierBoyId) {
  return this.find({ 'assignedCourier.courierBoyId': courierBoyId }).sort({ assignedAt: -1 });
};

// Static method to find by type
assignedCourierSchema.statics.findByType = function(type) {
  return this.find({ type: type }).sort({ assignedAt: -1 });
};

// Static method to find by work
assignedCourierSchema.statics.findByWork = function(work) {
  return this.find({ work: work }).sort({ assignedAt: -1 });
};

// Instance method to assign courier boy
assignedCourierSchema.methods.assignCourier = function(courierBoy) {
  this.status = 'assigned';
  this.assignedCourier = {
    courierBoyId: courierBoy._id,
    name: courierBoy.fullName,
    phone: courierBoy.phone,
    email: courierBoy.email || '',
    area: courierBoy.area || ''
  };
  this.assignedAt = new Date();
  return this.save();
};

// Instance method to update status
assignedCourierSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'in_progress' && !this.startedAt) {
    this.startedAt = new Date();
  } else if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  return this.save();
};

export default mongoose.model("AssignedCourier", assignedCourierSchema);

