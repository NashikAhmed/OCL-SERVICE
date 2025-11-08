import mongoose from "mongoose";

const medicineManifestSchema = new mongoose.Schema(
  {
    medicineUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineUser",
      required: true,
      index: true
    },
    manifestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    consignments: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MedicineBooking",
          required: true
        },
        consignmentNumber: {
          type: Number,
          required: true
        }
      }
    ],
    totalCount: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ""
    },
    path: {
      type: String,
      required: true,
      index: true
    },
    originCity: {
      type: String,
      default: ""
    },
    originState: {
      type: String,
      default: ""
    },
    destinationCity: {
      type: String,
      default: ""
    },
    destinationState: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ['submitted', 'dispatched', 'delivered'],
      default: 'submitted',
      index: true
    },
    coloaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineColoader',
      required: false,
      index: true
    },
    contentDescription: {
      type: String,
      default: ""
    },
    coloaderDocketNo: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "medicinemanifests"
  }
);

// Simple manifest number generator: MM-YYYYMMDD-HHMMSS-<random>
medicineManifestSchema.statics.generateManifestNumber = function () {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const seg = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.floor(100 + Math.random() * 900);
  return `MM-${seg}-${rand}`;
};

export default mongoose.model("MedicineManifest", medicineManifestSchema);


