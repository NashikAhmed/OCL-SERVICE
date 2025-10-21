import mongoose from "mongoose";

// Location schema for FROM and TO locations
const locationSchema = new mongoose.Schema({
  concernPerson: {
    type: String,
    required: [true, 'Concern person is required'],
    trim: true,
    maxlength: [100, 'Concern person name cannot be longer than 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot be longer than 50 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot be longer than 50 characters']
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true,
    maxlength: [100, 'Area name cannot be longer than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot be longer than 200 characters']
  },
  flatNo: {
    type: String,
    required: [true, 'Flat No/Building Name is required'],
    trim: true,
    maxlength: [100, 'Flat No/Building Name cannot be longer than 100 characters']
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot be longer than 100 characters']
  },
  gst: {
    type: String,
    required: [true, 'GST Number is required'],
    trim: true,
    uppercase: true,
    maxlength: [15, 'GST Number cannot be longer than 15 characters']
  }
}, { _id: false });

// Company address schema
const companyAddressSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, 'Company pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
  },
  state: {
    type: String,
    required: [true, 'Company state is required'],
    trim: true,
    maxlength: [50, 'State name cannot be longer than 50 characters']
  },
  city: {
    type: String,
    required: [true, 'Company city is required'],
    trim: true,
    maxlength: [50, 'City name cannot be longer than 50 characters']
  },
  area: {
    type: String,
    required: [true, 'Company area is required'],
    trim: true,
    maxlength: [100, 'Area name cannot be longer than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Company address is required'],
    trim: true,
    maxlength: [200, 'Address cannot be longer than 200 characters']
  },
  flatNo: {
    type: String,
    required: [true, 'Flat No/Building Name is required'],
    trim: true,
    maxlength: [100, 'Flat No/Building Name cannot be longer than 100 characters']
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot be longer than 100 characters']
  },
  gst: {
    type: String,
    required: [true, 'GST Number is required'],
    trim: true,
    uppercase: true,
    maxlength: [15, 'GST Number cannot be longer than 15 characters']
  }
}, { _id: false });

// Main coloader schema
const coloaderSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot be longer than 200 characters'],
    index: true
  },
  serviceModes: {
    type: [String],
    required: [true, 'At least one service mode is required'],
    enum: {
      values: ['air', 'road', 'train', 'ship'],
      message: 'Service mode must be one of: air, road, train, ship'
    },
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one service mode must be selected'
    }
  },
  concernPerson: {
    type: String,
    required: [true, 'Concern person is required'],
    trim: true,
    maxlength: [100, 'Concern person name cannot be longer than 100 characters']
  },
  mobileNumbers: {
    type: [String],
    required: [true, 'At least one mobile number is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0 && v.every(num => /^\d{10}$/.test(num));
      },
      message: 'At least one valid 10-digit mobile number is required'
    }
  },
  mobileNumberNames: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Skip validation if mobileNumbers is not available (during updates)
        if (!this.mobileNumbers) return true;
        return !v || v.length <= this.mobileNumbers.length;
      },
      message: 'Number of names cannot exceed number of mobile numbers'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot be longer than 200 characters']
  },
  companyAddress: {
    type: companyAddressSchema,
    required: [true, 'Company address is required']
  },
  fromLocations: {
    type: [locationSchema],
    required: [true, 'At least one FROM location is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one FROM location is required'
    }
  },
  toLocations: {
    type: [locationSchema],
    required: [true, 'At least one TO location is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one TO location is required'
    }
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
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
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be longer than 1000 characters']
  }
}, {
  timestamps: true,
  collection: 'coloaders'
});

// Create indexes for better performance
// Removed duplicate indexes for companyName and email (already have index: true and unique: true)
coloaderSchema.index({ status: 1 });
coloaderSchema.index({ isActive: 1 });
coloaderSchema.index({ registrationDate: -1 });
coloaderSchema.index({ 'companyAddress.state': 1 });
coloaderSchema.index({ 'companyAddress.city': 1 });
coloaderSchema.index({ serviceModes: 1 });

// Static method to generate unique coloader ID
coloaderSchema.statics.generateColoaderId = async function(companyName) {
  const prefix = 'CL';
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Get company initials (first 3 characters of each word)
  const initials = companyName
    .split(' ')
    .map(word => word.substring(0, 3).toUpperCase())
    .join('')
    .substring(0, 6);
  
  let counter = 1;
  let coloaderId;
  
  do {
    const sequence = counter.toString().padStart(4, '0');
    coloaderId = `${prefix}${year}${month}${initials}${sequence}`;
    counter++;
  } while (await this.findOne({ coloaderId }));
  
  return coloaderId;
};

// Static method to find coloaders by status
coloaderSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true }).sort({ registrationDate: -1 });
};

// Static method to find coloaders by service mode
coloaderSchema.statics.findByServiceMode = function(serviceMode) {
  return this.find({ 
    serviceModes: serviceMode, 
    isActive: true 
  }).sort({ registrationDate: -1 });
};

// Static method to find coloaders by location
coloaderSchema.statics.findByLocation = function(state, city) {
  const query = { isActive: true };
  
  if (state) {
    query['companyAddress.state'] = new RegExp(state, 'i');
  }
  
  if (city) {
    query['companyAddress.city'] = new RegExp(city, 'i');
  }
  
  return this.find(query).sort({ registrationDate: -1 });
};

// Static method to search coloaders
coloaderSchema.statics.searchColoaders = function(searchQuery) {
  const regex = new RegExp(searchQuery, 'i');
  
  return this.find({
    $or: [
      { companyName: regex },
      { concernPerson: regex },
      { email: regex },
      { 'companyAddress.state': regex },
      { 'companyAddress.city': regex },
      { 'companyAddress.area': regex },
      { 'fromLocations.concernPerson': regex },
      { 'toLocations.concernPerson': regex }
    ],
    isActive: true
  }).sort({ registrationDate: -1 });
};

// Instance method to get completion percentage
coloaderSchema.methods.getCompletionPercentage = function() {
  let completedFields = 0;
  let totalFields = 0;
  
  // Company information fields
  const companyFields = ['companyName', 'serviceModes', 'concernPerson', 'mobileNumbers', 'email', 'companyAddress'];
  companyFields.forEach(field => {
    totalFields++;
    if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : this[field].toString().trim() !== '')) {
      completedFields++;
    }
  });
  
  // FROM locations
  if (this.fromLocations && this.fromLocations.length > 0) {
    totalFields++;
    const validFromLocations = this.fromLocations.filter(loc => 
      loc.concernPerson && loc.mobile && loc.email && loc.pincode && 
      loc.state && loc.city && loc.area && loc.address && loc.flatNo && loc.gst
    );
    if (validFromLocations.length > 0) {
      completedFields++;
    }
  } else {
    totalFields++;
  }
  
  // TO locations
  if (this.toLocations && this.toLocations.length > 0) {
    totalFields++;
    const validToLocations = this.toLocations.filter(loc => 
      loc.concernPerson && loc.mobile && loc.email && loc.pincode && 
      loc.state && loc.city && loc.area && loc.address && loc.flatNo && loc.gst
    );
    if (validToLocations.length > 0) {
      completedFields++;
    }
  } else {
    totalFields++;
  }
  
  return Math.round((completedFields / totalFields) * 100);
};

// Instance method to check if registration is complete
coloaderSchema.methods.isRegistrationComplete = function() {
  return this.getCompletionPercentage() === 100;
};

// Instance method to get service modes as readable text
coloaderSchema.methods.getServiceModesText = function() {
  const modeMap = {
    'air': 'By Air',
    'road': 'By Road',
    'train': 'By Train',
    'ship': 'By Ship'
  };
  
  return this.serviceModes.map(mode => modeMap[mode] || mode).join(', ');
};

// Pre-save middleware to generate coloader ID if not present
coloaderSchema.pre('save', async function(next) {
  if (this.isNew && !this.coloaderId) {
    this.coloaderId = await this.constructor.generateColoaderId(this.companyName);
  }
  next();
});

// Remove sensitive data from JSON output
coloaderSchema.methods.toJSON = function() {
  const coloaderObject = this.toObject();
  // Add any fields you want to exclude from JSON output
  return coloaderObject;
};

export default mongoose.model("Coloader", coloaderSchema);
