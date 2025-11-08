import mongoose from 'mongoose';

const courierComplaintSchema = new mongoose.Schema({
  // Corporate information
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
      required: true
    },
    email: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    }
  },

  // Shipment information
  consignmentNumber: {
    type: String,
    required: true
  },
  shipmentInfo: {
    destination: String,
    status: String,
    bookingDate: Date,
    courierName: String,
    courierContact: String
  },

  // Complaint details
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Delivery Delay',
      'Package Damage',
      'Wrong Delivery',
      'Courier Behavior',
      'Communication Issues',
      'Pickup Issues',
      'Other'
    ]
  },
  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Status tracking
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },

  // Response from support team
  response: {
    type: String,
    trim: true
  },
  responseDate: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Additional metadata
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Internal notes (for admin use only)
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
courierComplaintSchema.index({ corporateId: 1, createdAt: -1 });
courierComplaintSchema.index({ consignmentNumber: 1 });
courierComplaintSchema.index({ status: 1 });
courierComplaintSchema.index({ priority: 1 });
courierComplaintSchema.index({ category: 1 });

// Update the updatedAt field before saving
courierComplaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for complaint age in days
courierComplaintSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to update status
courierComplaintSchema.methods.updateStatus = function(newStatus, response, respondedBy) {
  this.status = newStatus;
  if (response) {
    this.response = response;
    this.responseDate = new Date();
    this.respondedBy = respondedBy;
  }
  this.updatedAt = new Date();
  return this.save();
};

// Method to add internal note
courierComplaintSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get complaints by corporate
courierComplaintSchema.statics.getByCorporate = function(corporateId, options = {}) {
  const query = { corporateId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('respondedBy', 'name email')
    .populate('assignedTo', 'name email');
};

// Static method to get complaint statistics
courierComplaintSchema.statics.getStats = function(corporateId = null) {
  const matchStage = corporateId ? { corporateId: new mongoose.Types.ObjectId(corporateId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('CourierComplaint', courierComplaintSchema);
