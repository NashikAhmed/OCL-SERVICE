import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot be longer than 100 characters']
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
  alternativePhone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  
  // Aadhar and PAN Information
  aadharNo: {
    type: String,
    required: true,
    trim: true
  },
  panNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  
  // Present Address
  presentAddress: {
    locality: { type: String, required: true, trim: true },
    buildingFlatNo: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    area: { type: String, trim: true }
  },
  
  // Address Type and Permanent Address
  addressType: {
    type: String,
    required: true,
    enum: ['present', 'permanent']
  },
  permanentAddress: {
    locality: { type: String, trim: true },
    buildingFlatNo: { type: String, trim: true },
    landmark: { type: String, trim: true },
    pincode: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    area: { type: String, trim: true }
  },
  
  // Other Information
  gst: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  anniversary: {
    type: Date
  },
  birthday: {
    type: Date
  },
  workExperience: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date
  },
  
  // References
  references: [{
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true }
  }],
  
  // Prime Mobile Numbers
  primeMobileNumbers: [{
    type: String,
    trim: true
  }],
  
  // File paths for uploaded documents
  photoFilePath: {
    type: String,
    trim: true
  },
  cvFilePath: {
    type: String,
    trim: true
  },
  documentFilePath: {
    type: String,
    trim: true
  },
  panCardFilePath: {
    type: String,
    trim: true
  },
  aadharCardFilePath: {
    type: String,
    trim: true
  },
  otherDocumentsPaths: [{
    type: String,
    trim: true
  }],
  
  // Login credentials
  username: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  generatedPassword: {
    type: String,
    trim: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  isFirstLogin: {
    type: Boolean,
    default: true
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
  collection: 'employees'
});

// Indexes for better query performance
// Note: employeeCode, uniqueId, and email indexes are automatically created due to unique: true
employeeSchema.index({ phone: 1 });
employeeSchema.index({ name: 1 });
employeeSchema.index({ designation: 1 });
employeeSchema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to get full address based on address type
employeeSchema.methods.getFullAddress = function() {
  if (this.addressType === 'present') {
    return `${this.presentAddress.buildingFlatNo}, ${this.presentAddress.locality}, ${this.presentAddress.landmark ? this.presentAddress.landmark + ', ' : ''}${this.presentAddress.city}, ${this.presentAddress.state} - ${this.presentAddress.pincode}`;
  } else {
    return `${this.permanentAddress.buildingFlatNo}, ${this.permanentAddress.locality}, ${this.permanentAddress.landmark ? this.permanentAddress.landmark + ', ' : ''}${this.permanentAddress.city}, ${this.permanentAddress.state} - ${this.permanentAddress.pincode}`;
  }
};

// Virtual for photo URL (handles both S3 and local paths)
employeeSchema.virtual('photoUrl').get(function() {
  if (!this.photoFilePath) return null;
  
  // If it's already an S3 URL, return as is
  if (this.photoFilePath.startsWith('https://') && this.photoFilePath.includes('.s3.') && this.photoFilePath.includes('.amazonaws.com/')) {
    return this.photoFilePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (this.photoFilePath.startsWith('/uploads/')) {
    const filename = this.photoFilePath.split('/').pop();
    return `/api/upload/serve/${filename}`;
  }
  
  return this.photoFilePath;
});

// Virtual for CV URL (handles both S3 and local paths)
employeeSchema.virtual('cvUrl').get(function() {
  if (!this.cvFilePath) return null;
  
  // If it's already an S3 URL, return as is
  if (this.cvFilePath.startsWith('https://') && this.cvFilePath.includes('.s3.') && this.cvFilePath.includes('.amazonaws.com/')) {
    return this.cvFilePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (this.cvFilePath.startsWith('/uploads/')) {
    const filename = this.cvFilePath.split('/').pop();
    return `/api/upload/serve/${filename}`;
  }
  
  return this.cvFilePath;
});

// Virtual for document URL (handles both S3 and local paths)
employeeSchema.virtual('documentUrl').get(function() {
  if (!this.documentFilePath) return null;
  
  // If it's already an S3 URL, return as is
  if (this.documentFilePath.startsWith('https://') && this.documentFilePath.includes('.s3.') && this.documentFilePath.includes('.amazonaws.com/')) {
    return this.documentFilePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (this.documentFilePath.startsWith('/uploads/')) {
    const filename = this.documentFilePath.split('/').pop();
    return `/api/upload/serve/${filename}`;
  }
  
  return this.documentFilePath;
});

// Virtual for PAN card URL (handles both S3 and local paths)
employeeSchema.virtual('panCardUrl').get(function() {
  if (!this.panCardFilePath) return null;
  
  // If it's already an S3 URL, return as is
  if (this.panCardFilePath.startsWith('https://') && this.panCardFilePath.includes('.s3.') && this.panCardFilePath.includes('.amazonaws.com/')) {
    return this.panCardFilePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (this.panCardFilePath.startsWith('/uploads/')) {
    const filename = this.panCardFilePath.split('/').pop();
    return `/api/upload/serve/${filename}`;
  }
  
  return this.panCardFilePath;
});

// Virtual for Aadhar card URL (handles both S3 and local paths)
employeeSchema.virtual('aadharCardUrl').get(function() {
  if (!this.aadharCardFilePath) return null;
  
  // If it's already an S3 URL, return as is
  if (this.aadharCardFilePath.startsWith('https://') && this.aadharCardFilePath.includes('.s3.') && this.aadharCardFilePath.includes('.amazonaws.com/')) {
    return this.aadharCardFilePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (this.aadharCardFilePath.startsWith('/uploads/')) {
    const filename = this.aadharCardFilePath.split('/').pop();
    return `/api/upload/serve/${filename}`;
  }
  
  return this.aadharCardFilePath;
});

// Virtual for other documents URLs (handles both S3 and local paths)
employeeSchema.virtual('otherDocumentsUrls').get(function() {
  if (!this.otherDocumentsPaths || !Array.isArray(this.otherDocumentsPaths)) return [];
  
  return this.otherDocumentsPaths.map(filePath => {
    // If it's already an S3 URL, return as is
    if (filePath.startsWith('https://') && filePath.includes('.s3.') && filePath.includes('.amazonaws.com/')) {
      return filePath;
    }
    
    // If it's a local path, return with API endpoint for serving
    if (filePath.startsWith('/uploads/')) {
      const filename = filePath.split('/').pop();
      return `/api/upload/serve/${filename}`;
    }
    
    return filePath;
  });
});

// Static method to find employees by designation
employeeSchema.statics.findByDesignation = function(designation) {
  return this.find({ designation: new RegExp(designation, 'i') });
};

// Static method to find employees by name
employeeSchema.statics.findByName = function(name) {
  return this.find({ name: new RegExp(name, 'i') });
};

// Instance method to mark email as sent
employeeSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Instance method to mark first login as completed
employeeSchema.methods.markFirstLoginCompleted = function() {
  this.isFirstLogin = false;
  return this.save();
};

export default mongoose.model("Employee", employeeSchema);