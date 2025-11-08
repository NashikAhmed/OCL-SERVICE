import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FormData from '../models/FormData.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ocl-services');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean up image URLs by removing @ symbol
const cleanImageUrls = async () => {
  try {
    console.log('🧹 Starting image URL cleanup...');
    
    // Find all forms with uploadData
    const forms = await FormData.find({
      'uploadData.packageImages': { $exists: true, $ne: [] }
    });
    
    console.log(`📊 Found ${forms.length} forms with package images`);
    
    let updatedCount = 0;
    
    for (const form of forms) {
      let needsUpdate = false;
      const updatedForm = form.toObject();
      
      // Clean package images
      if (updatedForm.uploadData?.packageImages) {
        updatedForm.uploadData.packageImages = updatedForm.uploadData.packageImages.map(url => {
          if (url && url.startsWith('@')) {
            needsUpdate = true;
            return url.substring(1);
          }
          return url;
        });
      }
      
      // Clean invoice images
      if (updatedForm.uploadData?.invoiceImages) {
        updatedForm.uploadData.invoiceImages = updatedForm.uploadData.invoiceImages.map(url => {
          if (url && url.startsWith('@')) {
            needsUpdate = true;
            return url.substring(1);
          }
          return url;
        });
      }
      
      // Update the form if needed
      if (needsUpdate) {
        await FormData.findByIdAndUpdate(form._id, {
          'uploadData.packageImages': updatedForm.uploadData.packageImages,
          'uploadData.invoiceImages': updatedForm.uploadData.invoiceImages
        });
        updatedCount++;
        console.log(`✅ Updated form ${form._id}`);
      }
    }
    
    console.log(`🎉 Cleanup complete! Updated ${updatedCount} forms`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await cleanImageUrls();
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
