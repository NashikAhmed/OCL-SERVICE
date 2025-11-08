import mongoose from "mongoose";

const medicineBookingSchema = new mongoose.Schema({
  // Medicine User who created the booking
  medicineUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineUser',
    required: false // Can be optional if booking is made without login
  },

  // Origin/Sender Details
  origin: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobileNumber: {
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
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    flatBuilding: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    locality: {
      type: String,
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    },
    addressType: {
      type: String,
      enum: ['Home', 'Office'],
      default: 'Home'
    }
  },

  // Destination/Receiver Details
  destination: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobileNumber: {
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
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    flatBuilding: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    locality: {
      type: String,
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    },
    addressType: {
      type: String,
      enum: ['Home', 'Office'],
      default: 'Home'
    }
  },

  // Shipment Details
  shipment: {
    natureOfConsignment: {
      type: String,
      enum: ['NON-DOX', 'DOX'],
      required: true
    },
    services: {
      type: String,
      enum: ['Standard', 'Express', 'Same Day'],
      required: true
    },
    mode: {
      type: String,
      enum: ['Air', 'Surface', 'Cargo'],
      required: true
    },
    insurance: {
      type: String,
      required: true,
      trim: true
    },
    riskCoverage: {
      type: String,
      enum: ['Owner', 'Carrier'],
      required: true
    },
    dimensions: [{
      length: {
        type: String,
        default: ''
      },
      breadth: {
        type: String,
        default: ''
      },
      height: {
        type: String,
        default: ''
      },
      unit: {
        type: String,
        enum: ['cm', 'mm', 'm'],
        default: 'cm'
      }
    }],
    actualWeight: {
      type: String,
      default: ''
    },
    perKgWeight: {
      type: String,
      default: ''
    },
    volumetricWeight: {
      type: Number,
      default: 0
    },
    chargeableWeight: {
      type: Number,
      default: 0
    }
  },

  // Package Details
  package: {
    totalPackages: {
      type: String,
      required: true
    },
    materials: {
      type: String,
      trim: true,
      default: ''
    },
    packageImages: [{
      url: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number
      },
      mimeType: {
        type: String
      }
    }],
    contentDescription: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Invoice Details
  invoice: {
    invoiceNumber: {
      type: String,
      required: true,
      trim: true
    },
    invoiceValue: {
      type: String,
      required: true
    },
    invoiceImages: [{
      url: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number
      },
      mimeType: {
        type: String
      }
    }],
    eWaybillNumber: {
      type: String,
      trim: true,
      default: ''
    },
    acceptTerms: {
      type: Boolean,
      default: false
    }
  },

  // Billing Details
  billing: {
    gst: {
      type: String,
      enum: ['Yes', 'No'],
      required: true
    },
    partyType: {
      type: String,
      enum: ['sender', 'recipient'],
      required: true
    },
    billType: {
      type: String,
      enum: ['normal', 'rcm'],
      default: 'normal'
    }
  },

  // Charges Details (only if GST is Yes)
  charges: {
    freightCharge: {
      type: String,
      default: ''
    },
    awbCharge: {
      type: String,
      default: ''
    },
    localCollection: {
      type: String,
      default: ''
    },
    doorDelivery: {
      type: String,
      default: ''
    },
    loadingUnloading: {
      type: String,
      default: ''
    },
    demurrageCharge: {
      type: String,
      default: ''
    },
    ddaCharge: {
      type: String,
      default: ''
    },
    hamaliCharge: {
      type: String,
      default: ''
    },
    packingCharge: {
      type: String,
      default: ''
    },
    otherCharge: {
      type: String,
      default: ''
    },
    total: {
      type: String,
      default: ''
    },
    fuelCharge: {
      type: String,
      default: ''
    },
    fuelChargeType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    sgstAmount: {
      type: String,
      default: ''
    },
    cgstAmount: {
      type: String,
      default: ''
    },
    igstAmount: {
      type: String,
      default: ''
    },
    grandTotal: {
      type: String,
      default: ''
    }
  },

  // Payment Details
  payment: {
    mode: {
      type: String,
      trim: true,
      default: ''
    },
    deliveryType: {
      type: String,
      trim: true,
      default: ''
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Consignment Number (Assigned from consignment assignment)
  consignmentNumber: {
    type: Number,
    required: false,
    unique: true,
    sparse: true
  },

  // Optional link to manifest when dispatched in a batch
  manifestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineManifest',
    required: false,
    index: true
  },

  // Coloader assignment
  coloaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineColoader',
    required: false,
    index: true
  },

  // Booking Reference Number (Now uses consignment number instead of random)
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  collection: 'medicinebookings'
});

// Note: bookingReference is now set from consignmentNumber in the booking route
// The pre-save hook for random generation has been removed

// Indexes for better query performance
medicineBookingSchema.index({ medicineUserId: 1 });
medicineBookingSchema.index({ status: 1 });
medicineBookingSchema.index({ bookingReference: 1 });
medicineBookingSchema.index({ consignmentNumber: 1 });
medicineBookingSchema.index({ createdAt: -1 });
medicineBookingSchema.index({ 'origin.mobileNumber': 1 });
medicineBookingSchema.index({ 'destination.mobileNumber': 1 });

// Static method to find by booking reference
medicineBookingSchema.statics.findByReference = function(reference) {
  return this.findOne({ bookingReference: reference });
};

// Static method to find by status
medicineBookingSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Instance method to update status
medicineBookingSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

export default mongoose.model("MedicineBooking", medicineBookingSchema);

