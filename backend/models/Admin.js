import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
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
    required: [true, 'Password is required'],
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
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  // Admin permissions (only for admin role, super_admin has all permissions)
  permissions: {
    dashboard: { type: Boolean, default: true },
    userManagement: { type: Boolean, default: false },
    pincodeManagement: { type: Boolean, default: false },
    addressForms: { type: Boolean, default: false },
    coloaderRegistration: { type: Boolean, default: false },
    consignmentManagement: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    settings: { type: Boolean, default: false }
  },
  // Whether this admin can assign permissions to office users
  canAssignPermissions: {
    type: Boolean,
    default: false
  },
  // Who assigned this admin role (for audit trail)
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
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
  }
}, {
  timestamps: true,
  collection: 'admins'
});

// Create indexes (removed duplicate email index since it's already unique)
adminSchema.index({ isActive: 1 });
adminSchema.index({ role: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update login info
adminSchema.methods.updateLoginInfo = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).select('-password');
};

// Static method to create default admin if none exists
adminSchema.statics.createDefaultAdmin = async function() {
  const adminCount = await this.countDocuments();
  
  if (adminCount === 0) {
    const defaultAdmin = new this({
      email: 'admin@ocl.com',
      password: 'admin123', // This will be hashed by pre-save middleware
      name: 'Default Admin',
      role: 'super_admin',
      permissions: {
        dashboard: true,
        userManagement: true,
        pincodeManagement: true,
        addressForms: true,
        coloaderRegistration: true,
        consignmentManagement: true,
        reports: true,
        settings: true
      },
      canAssignPermissions: true
    });
    
    await defaultAdmin.save();
    console.log('✅ Default admin created: admin@ocl.com / admin123');
    return defaultAdmin;
  }
  
  return null;
};

// Instance method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') {
    return true; // Super admin has all permissions
  }
  return this.permissions && this.permissions[permission] === true;
};

// Instance method to check if admin can assign permissions
adminSchema.methods.canAssignPermissionsToUsers = function() {
  if (this.role === 'super_admin') {
    return true; // Super admin can always assign permissions
  }
  return this.canAssignPermissions === true;
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

export default mongoose.model("Admin", adminSchema);
