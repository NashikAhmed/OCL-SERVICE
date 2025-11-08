import mongoose from "mongoose";

const medicineOclChargeSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  note: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  collection: 'medicineoclcharges'
});

medicineOclChargeSchema.index({ year: 1, month: 1 }, { unique: true });

export default mongoose.model('MedicineOclCharge', medicineOclChargeSchema);


