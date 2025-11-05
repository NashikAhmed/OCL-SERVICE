// Test script for Courier Boy API
import mongoose from 'mongoose';
import CourierBoy from './models/CourierBoy.js';
import dotenv from 'dotenv';

dotenv.config();

const testCourierBoyData = {
  fullName: "Priyangshu",
  designation: "Courier Boy",
  email: "priyangshu898@gmail.com",
  phone: "6002519325",
  locality: "Locality",
  building: "Building",
  landmark: "Landmark",
  pincode: "781017",
  area: "Piyali Phukan",
  aadharCard: "Aadhar Card",
  aadharCardUrl: "https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/68fefe4acbb50729c7c2298e/aadharCard_1761541706556_38ujophlatk.jpg",
  panCard: "PAN Card",
  panCardUrl: "https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/68fefe4acbb50729c7c2298e/panCard_1761541706943_blu52jh7efq.jpg",
  vehicleType: "Biker",
  licenseNumber: "Acg1234",
  status: "pending",
  isVerified: false
};

async function testCourierBoyAPI() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ocl';
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Test creating a courier boy
    console.log("🧪 Testing Courier Boy creation...");
    const courierBoy = new CourierBoy(testCourierBoyData);
    const savedCourierBoy = await courierBoy.save();
    console.log("✅ Courier Boy created successfully:", savedCourierBoy._id);

    // Test finding courier boys
    console.log("🧪 Testing Courier Boy retrieval...");
    const allCourierBoys = await CourierBoy.find();
    console.log("✅ Found courier boys:", allCourierBoys.length);

    // Test status update
    console.log("🧪 Testing status update...");
    await savedCourierBoy.approve();
    console.log("✅ Courier Boy approved successfully");

    // Test finding by status
    console.log("🧪 Testing find by status...");
    const approvedCourierBoys = await CourierBoy.findByStatus('approved');
    console.log("✅ Found approved courier boys:", approvedCourierBoys.length);

    // Clean up test data
    console.log("🧹 Cleaning up test data...");
    await CourierBoy.findByIdAndDelete(savedCourierBoy._id);
    console.log("✅ Test data cleaned up");

    console.log("🎉 All tests passed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run the test
testCourierBoyAPI();
