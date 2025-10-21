import mongoose from "mongoose";
import bcrypt from "bcrypt";

const officeUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider !== 'google';
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be longer than 100 characters']
  },
  role: {
    type: String,
    enum: ['office_user', 'office_manager'],
    default: 'office_user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  // Feature access permissions
  permissions: {
    dashboard: { type: Boolean, default: true },
    booking: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    settings: { type: Boolean, default: true },
    pincodeManagement: { type: Boolean, default: false },
    addressForms: { type: Boolean, default: false },
    coloaderRegistration: { type: Boolean, default: false },
    coloaderManagement: { type: Boolean, default: false },
    corporateRegistration: { type: Boolean, default: false },
    corporateManagement: { type: Boolean, default: false },
    corporatePricing: { type: Boolean, default: false },
    corporateApproval: { type: Boolean, default: false },
    employeeRegistration: { type: Boolean, default: false },
    employeeManagement: { type: Boolean, default: false },
    consignmentManagement: { type: Boolean, default: false },
    courierRequests: { type: Boolean, default: false },
    invoiceManagement: { type: Boolean, default: false },
    userManagement: { type: Boolean, default: false },
    baggingManagement: { type: Boolean, default: false },
    receivedOrders: { type: Boolean, default: false },
    manageOrders: { type: Boolean, default: false }
  },
  // Additional user info
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot be longer than 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
  },
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows null values but unique when present
    unique: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'office_users'
});

// Create indexes (removed duplicate unique indexes since they're already defined in schema)
officeUserSchema.index({ isActive: 1 });
officeUserSchema.index({ role: 1 });

// Pre-save middleware to hash password
officeUserSchema.pre('save', async function(next) {
  // Skip password hashing for Google OAuth users or if password is not modified
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
officeUserSchema.methods.comparePassword = async function(candidatePassword) {
  // Google OAuth users don't have passwords to compare
  if (!this.password || this.authProvider === 'google') {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update login info
officeUserSchema.methods.updateLoginInfo = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Static method to find active users
officeUserSchema.statics.findActive = function() {
  return this.find({ isActive: true }).select('-password');
};

// Remove password from JSON output
officeUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model("OfficeUser", officeUserSchema);
