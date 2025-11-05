import mongoose from "mongoose";
import bcrypt from "bcrypt";

const medicineUserSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'medicine_users'
});

medicineUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

medicineUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

medicineUserSchema.methods.updateLoginInfo = async function() {
  this.lastLogin = new Date();
  return this.save();
};

medicineUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

medicineUserSchema.statics.createDefaultMedicineUser = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultUser = new this({
      email: 'medicine@ocl.com',
      password: 'medicine123',
      name: 'Default Medicine User'
    });
    await defaultUser.save();
    console.log('✅ Default medicine user created: medicine@ocl.com / medicine123');
    return defaultUser;
  }
  return null;
};

export default mongoose.model("MedicineUser", medicineUserSchema);


