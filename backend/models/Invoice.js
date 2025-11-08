import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateData',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyAddress: {
    type: String,
    required: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  stateCode: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  invoicePeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  shipments: [{
    consignmentNumber: {
      type: String,
      required: true
    },
    bookingDate: {
      type: Date,
      required: true
    },
    origin: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    freightCharges: {
      type: Number,
      required: true
    },
    fuelSurcharge: {
      type: Number,
      default: 0
    },
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  fuelSurchargeTotal: {
    type: Number,
    default: 0
  },
  fuelChargePercentage: {
    type: Number,
    default: 15,
    min: [0, 'Fuel charge percentage cannot be negative'],
    max: [100, 'Fuel charge percentage cannot exceed 100%']
  },
  cgstTotal: {
    type: Number,
    default: 0
  },
  sgstTotal: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  amountInWords: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cheque', 'bank_transfer', 'cash', 'other']
  },
  paymentReference: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot be longer than 500 characters']
  },
  bankDetails: {
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    }
  },
  termsAndConditions: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  collection: 'invoices'
});

// Create indexes for better query performance
invoiceSchema.index({ corporateId: 1 });
// invoiceNumber index is automatically created by unique: true constraint
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ 'invoicePeriod.startDate': 1, 'invoicePeriod.endDate': 1 });

// Virtual for invoice period display
invoiceSchema.virtual('invoicePeriodDisplay').get(function() {
  if (this.invoicePeriod && this.invoicePeriod.startDate && this.invoicePeriod.endDate) {
    const startDate = new Date(this.invoicePeriod.startDate).toLocaleDateString('en-GB');
    const endDate = new Date(this.invoicePeriod.endDate).toLocaleDateString('en-GB');
    return `${startDate} to ${endDate}`;
  }
  return '';
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'unpaid' && this.dueDate) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Ensure virtual fields are serialized
invoiceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to calculate totals and format data
invoiceSchema.pre('save', function(next) {
  try {
    // Calculate subtotal from shipments
    this.subtotal = this.shipments.reduce((sum, shipment) => sum + shipment.freightCharges, 0);
    
    // Calculate fuel surcharge total
    this.fuelSurchargeTotal = this.shipments.reduce((sum, shipment) => sum + (shipment.fuelSurcharge || 0), 0);
    
    // Calculate CGST total
    this.cgstTotal = this.shipments.reduce((sum, shipment) => sum + (shipment.cgst || 0), 0);
    
    // Calculate SGST total
    this.sgstTotal = this.shipments.reduce((sum, shipment) => sum + (shipment.sgst || 0), 0);
    
    // Calculate grand total
    this.grandTotal = this.subtotal + this.fuelSurchargeTotal + this.cgstTotal + this.sgstTotal;
    
    // Generate amount in words
    this.amountInWords = this.numberToWords(this.grandTotal);
    
    // Set due date (30 days from invoice date)
    if (!this.dueDate) {
      const dueDate = new Date(this.invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      this.dueDate = dueDate;
    }
    
    // Update status based on due date
    if (this.status === 'unpaid' && this.dueDate) {
      const today = new Date();
      if (today > this.dueDate) {
        this.status = 'overdue';
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const yearMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    // Find the highest existing invoice number for this year-month
    const existingInvoices = await this.find({
      invoiceNumber: new RegExp(`^${yearMonth}/\\d+$`)
    }).select('invoiceNumber').lean();
    
    let maxNumber = 0;
    existingInvoices.forEach(doc => {
      const number = parseInt(doc.invoiceNumber.split('/')[1]);
      if (number > maxNumber) {
        maxNumber = number;
      }
    });
    
    // Generate next number
    const nextNumber = maxNumber + 1;
    const invoiceNumber = `${yearMonth}/${nextNumber.toString().padStart(3, '0')}`;
    
    return invoiceNumber;
  } catch (error) {
    throw new Error('Error generating invoice number: ' + error.message);
  }
};

// Static method to find unpaid invoices for a corporate
invoiceSchema.statics.findUnpaidByCorporate = function(corporateId) {
  return this.find({
    corporateId: corporateId,
    status: { $in: ['unpaid', 'overdue'] }
  }).sort({ invoiceDate: -1 });
};

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function() {
  const today = new Date();
  return this.find({
    status: 'unpaid',
    dueDate: { $lt: today }
  }).sort({ dueDate: 1 });
};

// Static method to get invoice summary for corporate
invoiceSchema.statics.getInvoiceSummary = async function(corporateId) {
  try {
    const invoices = await this.find({ corporateId: corporateId });
    
    const summary = {
      totalInvoices: invoices.length,
      unpaidInvoices: invoices.filter(inv => inv.status === 'unpaid').length,
      overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      unpaidAmount: invoices
        .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.grandTotal, 0),
      paidAmount: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.grandTotal, 0)
    };
    
    return summary;
  } catch (error) {
    throw new Error('Error getting invoice summary: ' + error.message);
  }
};

// Instance method to mark as paid
invoiceSchema.methods.markAsPaid = function(paymentMethod, paymentReference) {
  this.status = 'paid';
  this.paymentDate = new Date();
  this.paymentMethod = paymentMethod;
  this.paymentReference = paymentReference;
  return this.save();
};

// Helper method to convert number to words
invoiceSchema.methods.numberToWords = function(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertHundreds(n) {
    let result = '';
    
    if (n > 99) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n > 19) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n > 9) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  }
  
  if (num === 0) return 'Zero';
  
  let result = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;
  
  if (crore > 0) {
    result += convertHundreds(crore) + 'Crore ';
  }
  
  if (lakh > 0) {
    result += convertHundreds(lakh) + 'Lakh ';
  }
  
  if (thousand > 0) {
    result += convertHundreds(thousand) + 'Thousand ';
  }
  
  if (hundred > 0) {
    result += convertHundreds(hundred);
  }
  
  return result.trim() + ' Only';
};

export default mongoose.model("Invoice", invoiceSchema);
