import mongoose from "mongoose";

const consignmentAssignmentSchema = new mongoose.Schema({
  // Assignment type: 'corporate', 'office_user', 'courier_boy', 'medicine'
  assignmentType: {
    type: String,
    enum: ['corporate', 'office_user', 'courier_boy', 'medicine'],
    required: true,
    default: 'corporate'
  },
  // For corporate assignments
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateData',
    required: function() {
      return this.assignmentType === 'corporate';
    }
  },
  // For office user assignments
  officeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfficeUser',
    required: function() {
      return this.assignmentType === 'office_user';
    }
  },
  // For courier boy assignments
  courierBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourierBoy',
    required: function() {
      return this.assignmentType === 'courier_boy';
    }
  },
  // For medicine user assignments
  medicineUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineUser',
    required: function() {
      return this.assignmentType === 'medicine';
    }
  },
  // Display name for the assigned entity
  assignedToName: {
    type: String,
    required: true
  },
  // Email for the assigned entity
  assignedToEmail: {
    type: String,
    required: true
  },
  // Legacy field for backward compatibility
  companyName: {
    type: String,
    required: function() {
      return this.assignmentType === 'corporate';
    }
  },
  startNumber: {
    type: Number,
    required: true,
    min: 871026572
  },
  endNumber: {
    type: Number,
    required: true,
    min: 871026572
  },
  totalNumbers: {
    type: Number,
    required: true,
    min: 1
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  }
}, {
  timestamps: true,
  collection: 'consignmentassignments'
});

// Create indexes
consignmentAssignmentSchema.index({ assignmentType: 1 });
consignmentAssignmentSchema.index({ corporateId: 1 });
consignmentAssignmentSchema.index({ officeUserId: 1 });
consignmentAssignmentSchema.index({ courierBoyId: 1 });
consignmentAssignmentSchema.index({ medicineUserId: 1 });
consignmentAssignmentSchema.index({ startNumber: 1, endNumber: 1 });
consignmentAssignmentSchema.index({ assignedBy: 1 });
consignmentAssignmentSchema.index({ isActive: 1 });

// Virtual for range display
consignmentAssignmentSchema.virtual('rangeDisplay').get(function() {
  return `${this.startNumber} - ${this.endNumber}`;
});

// Ensure virtual fields are serialized
consignmentAssignmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to check if number range is available
consignmentAssignmentSchema.statics.isRangeAvailable = async function(startNumber, endNumber, excludeId = null) {
  const query = {
    isActive: true,
    $or: [
      // Check if new range overlaps with existing ranges
      {
        $and: [
          { startNumber: { $lte: endNumber } },
          { endNumber: { $gte: startNumber } }
        ]
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingAssignment = await this.findOne(query);
  return !existingAssignment;
};

// Static method to get next available consignment number for any assignment type
consignmentAssignmentSchema.statics.getNextConsignmentNumber = async function(assignmentType, entityId) {
  let query = {
    assignmentType: assignmentType,
    isActive: true
  };
  
  // Set the appropriate ID field based on assignment type
  if (assignmentType === 'corporate') {
    query.corporateId = entityId;
  } else if (assignmentType === 'office_user') {
    query.officeUserId = entityId;
  } else if (assignmentType === 'courier_boy') {
    query.courierBoyId = entityId;
  } else if (assignmentType === 'medicine') {
    query.medicineUserId = entityId;
  }
  
  const assignments = await this.find(query).sort({ startNumber: 1 });
  
  if (!assignments || assignments.length === 0) {
    throw new Error(`No consignment numbers assigned to this ${assignmentType}`);
  }
  
  // Get all used numbers across all assignments for this entity
  const usedNumbers = await ConsignmentUsage.find({
    assignmentType: assignmentType,
    entityId: entityId
  }).select('consignmentNumber').lean();
  
  const usedNumberSet = new Set(usedNumbers.map(u => u.consignmentNumber));
  
  // Find the next sequential number starting from the first assignment
  // This ensures we use numbers in order: first assignment range, then second, etc.
  for (const assignment of assignments) {
    for (let num = assignment.startNumber; num <= assignment.endNumber; num++) {
      if (!usedNumberSet.has(num)) {
        return num;
      }
    }
  }
  
  throw new Error('All consignment numbers in all assigned ranges have been used');
};

// Static method to validate range
consignmentAssignmentSchema.statics.validateRange = function(startNumber, endNumber) {
  if (startNumber < 871026572) {
    throw new Error('Start number must be at least 871026572');
  }
  
  if (endNumber < startNumber) {
    throw new Error('End number must be greater than or equal to start number');
  }
  
  if (endNumber - startNumber + 1 > 10000) {
    throw new Error('Maximum 10,000 numbers can be assigned at once');
  }
  
  return true;
};

export default mongoose.model("ConsignmentAssignment", consignmentAssignmentSchema);

// Consignment Usage Model to track which numbers are used
const consignmentUsageSchema = new mongoose.Schema({
  // Assignment type: 'corporate', 'office_user', 'courier_boy', 'medicine'
  assignmentType: {
    type: String,
    enum: ['corporate', 'office_user', 'courier_boy', 'medicine'],
    required: true,
    default: 'corporate'
  },
  // Generic entity ID field
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Legacy field for backward compatibility
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateData',
    required: function() {
      return this.assignmentType === 'corporate';
    }
  },
  // For office user usage
  officeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfficeUser',
    required: function() {
      return this.assignmentType === 'office_user';
    }
  },
  // For courier boy usage
  courierBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourierBoy',
    required: function() {
      return this.assignmentType === 'courier_boy';
    }
  },
  // For medicine user usage
  medicineUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineUser',
    required: function() {
      return this.assignmentType === 'medicine';
    }
  },
  consignmentNumber: {
    type: Number,
    required: true
  },
  bookingReference: {
    type: String,
    required: true
  },
  bookingData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'invoiced'],
    default: 'unpaid'
  },
  paymentType: {
    type: String,
    enum: ['FP', 'TP'], // FP = Freight Paid, TP = To Pay
    default: 'FP'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  },
  freightCharges: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  // Assigned courier boy for handling this shipment (for corporate shipments)
  assignedCourierBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourierBoy',
    default: null
  },
  assignedCourierBoyAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'consignmentusage'
});

// Create indexes
consignmentUsageSchema.index({ assignmentType: 1, entityId: 1, consignmentNumber: 1 }, { unique: true });
consignmentUsageSchema.index({ corporateId: 1, consignmentNumber: 1 }, { unique: true });
consignmentUsageSchema.index({ officeUserId: 1 });
consignmentUsageSchema.index({ courierBoyId: 1 });
consignmentUsageSchema.index({ medicineUserId: 1 });
consignmentUsageSchema.index({ bookingReference: 1 });
consignmentUsageSchema.index({ usedAt: -1 });
consignmentUsageSchema.index({ paymentStatus: 1 });
consignmentUsageSchema.index({ corporateId: 1, paymentStatus: 1 });
consignmentUsageSchema.index({ invoiceId: 1 });
consignmentUsageSchema.index({ assignedCourierBoyId: 1 });

// Static method to find unpaid shipments for any entity
consignmentUsageSchema.statics.findUnpaidByEntity = function(assignmentType, entityId) {
  return this.find({
    assignmentType: assignmentType,
    entityId: entityId,
    paymentStatus: 'unpaid',
    status: 'active'
  }).sort({ usedAt: -1 });
};

// Static method to find unpaid shipments for a corporate (legacy)
consignmentUsageSchema.statics.findUnpaidByCorporate = function(corporateId) {
  return this.find({
    corporateId: corporateId,
    paymentStatus: 'unpaid',
    status: 'active'
  }).sort({ usedAt: -1 });
};

// Static method to find unpaid FP shipments for a corporate (for settlement)
consignmentUsageSchema.statics.findUnpaidFPByCorporate = function(corporateId) {
  return this.find({
    corporateId: corporateId,
    paymentStatus: 'unpaid',
    paymentType: 'FP', // Only FP shipments are included in settlement
    status: 'active'
  }).sort({ usedAt: -1 });
};

// Static method to find unpaid shipments for invoice generation
consignmentUsageSchema.statics.findUnpaidForInvoice = function(corporateId, startDate, endDate) {
  return this.find({
    corporateId: corporateId,
    paymentStatus: 'unpaid',
    paymentType: 'FP', // Only FP shipments are included in invoice generation
    status: 'active',
    usedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ usedAt: 1 });
};

// Static method to mark shipments as invoiced
consignmentUsageSchema.statics.markAsInvoiced = function(shipmentIds, invoiceId) {
  return this.updateMany(
    { _id: { $in: shipmentIds } },
    { 
      paymentStatus: 'invoiced',
      invoiceId: invoiceId
    }
  );
};

export const ConsignmentUsage = mongoose.model("ConsignmentUsage", consignmentUsageSchema);
