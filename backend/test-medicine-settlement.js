import MedicineSettlement from './models/MedicineSettlement.js';
import MedicineBooking from './models/MedicineBooking.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testMedicineSettlement = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ocl');
    console.log('Connected to MongoDB');

    // Create a sample medicine booking
    const sampleBooking = new MedicineBooking({
      medicineUserId: new mongoose.Types.ObjectId(),
      origin: {
        name: 'Sample Sender',
        mobileNumber: '9876543210',
        email: 'sender@example.com',
        companyName: 'Sender Company',
        flatBuilding: '123',
        locality: 'Sender Locality',
        landmark: 'Near Sender Landmark',
        pincode: '123456',
        city: 'Sender City',
        district: 'Sender District',
        state: 'Sender State',
        gstNumber: 'GST123456789',
        addressType: 'Office'
      },
      destination: {
        name: 'Sample Receiver',
        mobileNumber: '8765432109',
        email: 'receiver@example.com',
        companyName: 'Receiver Company',
        flatBuilding: '456',
        locality: 'Receiver Locality',
        landmark: 'Near Receiver Landmark',
        pincode: '654321',
        city: 'Receiver City',
        district: 'Receiver District',
        state: 'Receiver State',
        gstNumber: 'GST987654321',
        addressType: 'Office'
      },
      shipment: {
        natureOfConsignment: 'NON-DOX',
        services: 'Standard',
        mode: 'Surface',
        insurance: 'Yes',
        riskCoverage: 'Owner',
        dimensions: [{
          length: '10',
          breadth: '10',
          height: '10',
          unit: 'cm'
        }],
        actualWeight: '5',
        perKgWeight: '1',
        volumetricWeight: 2,
        chargeableWeight: 5
      },
      package: {
        totalPackages: '2',
        materials: 'Medicines',
        packageImages: [],
        contentDescription: 'Sample medicine package'
      },
      invoice: {
        invoiceNumber: 'INV-001',
        invoiceValue: '1000',
        invoiceImages: [],
        acceptTerms: true
      },
      billing: {
        gst: 'Yes',
        partyType: 'sender',
        billType: 'normal'
      },
      charges: {
        freightCharge: '500',
        awbCharge: '50',
        localCollection: '0',
        doorDelivery: '100',
        loadingUnloading: '0',
        demurrageCharge: '0',
        ddaCharge: '0',
        hamaliCharge: '0',
        packingCharge: '0',
        otherCharge: '0',
        total: '650',
        fuelCharge: '65',
        fuelChargeType: 'percentage',
        sgstAmount: '58.5',
        cgstAmount: '58.5',
        igstAmount: '0',
        grandTotal: '767'
      },
      payment: {
        mode: 'Online',
        deliveryType: 'Standard'
      },
      status: 'delivered',
      consignmentNumber: 100001
    });

    // Save the sample booking
    const savedBooking = await sampleBooking.save();
    console.log('Sample booking created:', savedBooking._id);

    // Create a sample medicine settlement
    const sampleSettlement = new MedicineSettlement({
      medicineBookingId: savedBooking._id,
      consignmentNumber: savedBooking.consignmentNumber,
      senderName: savedBooking.origin.name,
      receiverName: savedBooking.destination.name,
      paidBy: savedBooking.billing.partyType,
      cost: parseFloat(savedBooking.charges.grandTotal),
      isPaid: savedBooking.billing.partyType === 'sender',
      settlementMonth: new Date().getMonth() + 1,
      settlementYear: new Date().getFullYear()
    });

    // Save the sample settlement
    const savedSettlement = await sampleSettlement.save();
    console.log('Sample settlement created:', savedSettlement._id);

    // Fetch the settlement
    const fetchedSettlement = await MedicineSettlement.findById(savedSettlement._id);
    console.log('Fetched settlement:', fetchedSettlement);

    // Clean up - delete the test records
    await MedicineSettlement.findByIdAndDelete(savedSettlement._id);
    await MedicineBooking.findByIdAndDelete(savedBooking._id);
    console.log('Test records cleaned up');

    console.log('Medicine Settlement test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in Medicine Settlement test:', error);
    process.exit(1);
  }
};

testMedicineSettlement();