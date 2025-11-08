import mongoose from "mongoose";
import crypto from "node:crypto";

const corporatePricingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pricing name is required'],
    trim: true,
    maxlength: [200, 'Pricing name cannot be longer than 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  // Standard Service - DOX pricing
  doxPricing: {
    '01gm-250gm': {
      assam: { type: Number, default: 0 },
      neBySurface: { type: Number, default: 0 },
      neByAirAgtImp: { type: Number, default: 0 },
      restOfIndia: { type: Number, default: 0 }
    },
    '251gm-500gm': {
      assam: { type: Number, default: 0 },
      neBySurface: { type: Number, default: 0 },
      neByAirAgtImp: { type: Number, default: 0 },
      restOfIndia: { type: Number, default: 0 }
    },
    add500gm: {
      assam: { type: Number, default: 0 },
      neBySurface: { type: Number, default: 0 },
      neByAirAgtImp: { type: Number, default: 0 },
      restOfIndia: { type: Number, default: 0 }
    }
  },
  // NON DOX Surface pricing
  nonDoxSurfacePricing: {
    assam: { type: Number, default: 0 },
    neBySurface: { type: Number, default: 0 },
    neByAirAgtImp: { type: Number, default: 0 },
    restOfIndia: { type: Number, default: 0 }
  },
  // NON DOX Air pricing
  nonDoxAirPricing: {
    assam: { type: Number, default: 0 },
    neBySurface: { type: Number, default: 0 },
    neByAirAgtImp: { type: Number, default: 0 },
    restOfIndia: { type: Number, default: 0 }
  },
  // Priority Service - DOX pricing
  priorityPricing: {
    '01gm-500gm': {
      assam: { type: Number, default: 0 },
      neBySurface: { type: Number, default: 0 },
      neByAirAgtImp: { type: Number, default: 0 },
      restOfIndia: { type: Number, default: 0 }
    },
    add500gm: {
      assam: { type: Number, default: 0 },
      neBySurface: { type: Number, default: 0 },
      neByAirAgtImp: { type: Number, default: 0 },
      restOfIndia: { type: Number, default: 0 }
    }
  },
  // Reverse Pricing
  reversePricing: {
    toAssam: {
      byRoad: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      },
      byTrain: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      },
      byFlight: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      }
    },
    toNorthEast: {
      byRoad: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      },
      byTrain: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      },
      byFlight: {
        normal: { type: Number, default: 0 },
        priority: { type: Number, default: 0 }
      }
    }
  },
  // Fuel Charge Percentage
  fuelChargePercentage: {
    type: Number,
    default: 15,
    min: [0, 'Fuel charge percentage cannot be negative'],
    max: [100, 'Fuel charge percentage cannot exceed 100%']
  },
  // Approval information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot be longer than 500 characters']
  },
  // Corporate client information (when connected to a corporate registration)
  corporateClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateData',
    default: null
  },
  // Email approval workflow fields
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  clientName: {
    type: String,
    trim: true,
    maxlength: [200, 'Client name cannot be longer than 200 characters']
  },
  clientCompany: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot be longer than 200 characters']
  },
  approvalToken: {
    type: String,
    sparse: true
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  emailApprovedAt: {
    type: Date,
    default: null
  },
  emailApprovedBy: {
    type: String,
    trim: true
  },
  emailRejectedAt: {
    type: Date,
    default: null
  },
  emailRejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Email rejection reason cannot be longer than 500 characters']
  },
  // Notes for internal use
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be longer than 1000 characters']
  },
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'corporatepricing'
});

// Create indexes for better query performance
corporatePricingSchema.index({ name: 1 });
corporatePricingSchema.index({ status: 1 });
corporatePricingSchema.index({ createdBy: 1 });
corporatePricingSchema.index({ corporateClient: 1 });
corporatePricingSchema.index({ createdAt: -1 });

// Virtual for status display
corporatePricingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for approval status
corporatePricingSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Virtual for pending status
corporatePricingSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Ensure virtual fields are serialized
corporatePricingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find by status
corporatePricingSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to find approved pricing
corporatePricingSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' }).sort({ createdAt: -1 });
};

// Static method to find pending pricing
corporatePricingSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Static method to search pricing by name
corporatePricingSchema.statics.searchByName = function(searchQuery) {
  const searchRegex = new RegExp(searchQuery, 'i');
  return this.find({ name: searchRegex }).sort({ createdAt: -1 });
};

// Instance method to approve pricing
corporatePricingSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = null;
  return this.save();
};

// Instance method to reject pricing
corporatePricingSchema.methods.reject = function(reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.approvedBy = null;
  this.approvedAt = null;
  return this.save();
};

// Instance method to connect to corporate client
corporatePricingSchema.methods.connectToCorporate = function(corporateId) {
  this.corporateClient = corporateId;
  return this.save();
};

// Instance method to generate approval token
corporatePricingSchema.methods.generateApprovalToken = function() {
  this.approvalToken = crypto.randomBytes(32).toString('hex');
  return this.approvalToken;
};

// Instance method to approve via email
corporatePricingSchema.methods.approveViaEmail = function(approvedBy) {
  this.status = 'approved';
  this.emailApprovedAt = new Date();
  this.emailApprovedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvedBy = this.createdBy; // Set admin as approver
  this.approvalToken = null; // Clear token after use
  return this.save();
};

// Instance method to reject via email
corporatePricingSchema.methods.rejectViaEmail = function(reason, rejectedBy) {
  this.status = 'rejected';
  this.emailRejectedAt = new Date();
  this.emailRejectionReason = reason;
  this.rejectionReason = reason;
  this.approvalToken = null; // Clear token after use
  return this.save();
};

// Instance method to send email notification
corporatePricingSchema.methods.markEmailSent = function() {
  this.emailSentAt = new Date();
  return this.save();
};

// Static method to find by approval token
corporatePricingSchema.statics.findByApprovalToken = function(token) {
  return this.findOne({ approvalToken: token });
};

// Static method to find pending email approvals
corporatePricingSchema.statics.findPendingEmailApprovals = function() {
  return this.find({ 
    status: 'pending', 
    clientEmail: { $exists: true, $ne: null },
    emailSentAt: { $exists: true, $ne: null },
    emailApprovedAt: null,
    emailRejectedAt: null
  }).sort({ emailSentAt: -1 });
};

export default mongoose.model("CorporatePricing", corporatePricingSchema);
