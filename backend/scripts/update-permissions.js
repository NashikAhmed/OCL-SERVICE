import mongoose from 'mongoose';
import OfficeUser from '../models/OfficeUser.js';

const updatePermissions = async () => {
  try {
    console.log('🔄 Updating office user permissions with new fields...');
    
    // Update all office users to include the new permission fields
    const result = await OfficeUser.updateMany(
      {},
      { 
        $set: { 
          'permissions.baggingManagement': false,
          'permissions.receivedOrders': false,
          'permissions.manageOrders': false
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} office users with new permission fields`);
    
    // Get updated users to verify
    const users = await OfficeUser.find({}).select('name email permissions');
    console.log('📋 Updated users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}):`, {
        baggingManagement: user.permissions.baggingManagement,
        receivedOrders: user.permissions.receivedOrders,
        manageOrders: user.permissions.manageOrders
      });
    });
    
    console.log('✅ Permission update completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    process.exit(1);
  }
};

// Connect to MongoDB and run the update
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ocl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('📡 Connected to MongoDB');
  updatePermissions();
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
