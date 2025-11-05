import express from 'express';
import OfficeUser from '../models/OfficeUser.js';
import FormData from '../models/FormData.js';
import PinCodeArea from '../models/PinCodeArea.js';
import { generateToken, authenticateOfficeUser, authenticateAdminOrOfficeAdmin, validateLoginInput } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Office user login route
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Office user login attempt: ${email}`);
    
    // Find user by email
    const user = await OfficeUser.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password.' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated. Please contact administrator.' 
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password.' 
      });
    }
    
    // Check if this is first login and password needs to be changed
    if (user.isFirstLogin) {
      return res.status(200).json({
        success: true,
        message: 'First login detected. Password change required.',
        requiresPasswordChange: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    }
    
    // Check if user also has admin privileges
    const Admin = (await import('../models/Admin.js')).default;
    const adminAccount = await Admin.findOne({ email: email.toLowerCase() });
    
    // If user has admin privileges, include admin info in response
    let adminInfo = null;
    if (adminAccount && adminAccount.isActive) {
      adminInfo = {
        id: adminAccount._id,
        role: adminAccount.role,
        permissions: adminAccount.permissions,
        canAssignPermissions: adminAccount.canAssignPermissions
      };
    }
    
    // Update login info
    await user.updateLoginInfo();
    
    // Generate JWT token
    const token = generateToken(user._id, 'office');
    
    console.log(`✅ Office user login successful: ${user.name} (${user.email})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        department: user.department,
        lastLogin: user.lastLogin,
        adminInfo: adminInfo // Include admin privileges if they exist
      }
    });
    
  } catch (error) {
    console.error('Office user login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Change password route (for first-time login)
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Email, current password, and new password are required.'
      });
    }
    
    // Find user by email
    const user = await OfficeUser.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found.' 
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect.' 
      });
    }
    
    // Update password and mark first login as completed
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();
    
    // Also update the corresponding Employee record if it exists
    const Employee = (await import('../models/Employee.js')).default;
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (employee) {
      employee.password = newPassword;
      employee.isFirstLogin = false;
      await employee.save();
      console.log(`✅ Employee record also updated for: ${employee.name}`);
    }
    
    console.log(`✅ Password changed successfully for user: ${user.name} (${user.email})`);
    
    res.json({
      success: true,
      message: 'Password changed successfully. You can now login with your new password.'
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      error: 'Password change failed. Please try again.' 
    });
  }
});

// Office user signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, department, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required.'
      });
    }
    
    // Check if user already exists
    const existingUser = await OfficeUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists.'
      });
    }
    
    // Create new user
    const newUser = new OfficeUser({
      email: email.toLowerCase(),
      password,
      name,
      department,
      phone,
      role: 'office_user',
      isActive: true,
      permissions: {
        dashboard: true,
        booking: true,
        reports: true,
        settings: true,
        pincodeManagement: false,
        addressForms: false,
        coloaderRegistration: false,
        coloaderManagement: false,
        corporateRegistration: false,
        corporateManagement: false,
        corporatePricing: false,
        corporateApproval: false,
        employeeRegistration: false,
        employeeManagement: false,
        consignmentManagement: true,
        courierRequests: false,
        invoiceManagement: false,
        userManagement: false
      }
    });
    
    await newUser.save();
    
    console.log(`✅ New office user created: ${newUser.name} (${newUser.email})`);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully. Please login.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }
    });
    
  } catch (error) {
    console.error('Office user signup error:', error);
    res.status(500).json({ 
      error: 'Signup failed. Please try again.' 
    });
  }
});

// Google OAuth login route
router.post('/google-auth', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Google ID token is required.'
      });
    }
    
    console.log('Google OAuth login attempt');
    
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        error: 'Invalid Google token.'
      });
    }
    
    const { email, name, picture, email_verified } = payload;
    
    // Ensure the email is verified by Google
    if (!email_verified) {
      return res.status(401).json({
        error: 'Google email not verified.'
      });
    }
    
    console.log(`Google OAuth user: ${name} (${email})`);
    
    // Check if user already exists
    let user = await OfficeUser.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // User exists, check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated. Please contact administrator.'
        });
      }
      
      // Update login info
      await user.updateLoginInfo();
      
      console.log(`✅ Existing Google user login: ${user.name} (${user.email})`);
    } else {
      // Create new user with Google account
      user = new OfficeUser({
        email: email.toLowerCase(),
        name: name,
        password: null, // No password for Google OAuth users
        googleId: payload.sub,
        profilePicture: picture,
        role: 'office_user',
        isActive: true,
        authProvider: 'google',
        permissions: {
          dashboard: true,
          booking: true,
          reports: true,
          settings: true,
          pincodeManagement: false,
          addressForms: false,
          coloaderRegistration: false,
          coloaderManagement: false,
          corporateRegistration: false,
          corporateManagement: false,
          corporatePricing: false,
          corporateApproval: false,
          employeeRegistration: false,
          employeeManagement: false,
          consignmentManagement: true,
          courierRequests: false,
          invoiceManagement: false,
          userManagement: false,
          baggingManagement: false,
          receivedOrders: false,
          manageOrders: false
        }
      });
      
      await user.save();
      
      console.log(`✅ New Google user created: ${user.name} (${user.email})`);
    }
    
    // Check if user also has admin privileges
    const Admin = (await import('../models/Admin.js')).default;
    const adminAccount = await Admin.findOne({ email: email.toLowerCase() });
    
    // If user has admin privileges, include admin info in response
    let adminInfo = null;
    if (adminAccount && adminAccount.isActive) {
      adminInfo = {
        id: adminAccount._id,
        role: adminAccount.role,
        permissions: adminAccount.permissions,
        canAssignPermissions: adminAccount.canAssignPermissions
      };
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user._id, 'office');
    
    res.json({
      success: true,
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        department: user.department,
        profilePicture: user.profilePicture,
        authProvider: 'google',
        lastLogin: user.lastLogin,
        adminInfo: adminInfo
      }
    });
    
  } catch (error) {
    console.error('Google OAuth login error:', error);
    
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(401).json({ 
        error: 'Token not yet valid. Please try again.' 
      });
    }
    
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(401).json({ 
        error: 'Token expired. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Google authentication failed. Please try again.' 
    });
  }
});

// Get current user profile
router.get('/profile', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user also has admin privileges
    const Admin = (await import('../models/Admin.js')).default;
    const adminAccount = await Admin.findOne({ email: req.user.email });
    
    // If user has admin privileges, include admin info in response
    let adminInfo = null;
    if (adminAccount && adminAccount.isActive) {
      adminInfo = {
        id: adminAccount._id,
        role: adminAccount.role,
        permissions: adminAccount.permissions,
        canAssignPermissions: adminAccount.canAssignPermissions
      };
    }
    
    res.json({
      success: true,
      user: {
        ...req.user.toObject(),
        adminInfo: adminInfo
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile.' 
    });
  }
});

// Get all office users (for admin)
router.get('/users', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has admin privileges
    const Admin = (await import('../models/Admin.js')).default;
    const adminAccount = await Admin.findOne({ email: req.user.email });
    
    // Allow access if user is office_manager OR has admin privileges with userManagement permission
    const hasAdminAccess = adminAccount && adminAccount.isActive && adminAccount.hasPermission('userManagement');
    
    if (req.user.role !== 'office_manager' && !hasAdminAccess) {
      return res.status(403).json({
        error: 'Access denied. Manager role or admin privileges required.'
      });
    }
    
    const users = await OfficeUser.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: users.length,
        hasNext: false,
        hasPrev: false,
        limit: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users.' 
    });
  }
});

// Update user permissions (for admin)
router.put('/users/:id/permissions', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has admin privileges
    const Admin = (await import('../models/Admin.js')).default;
    const adminAccount = await Admin.findOne({ email: req.user.email });
    
    // Allow access if user is office_manager OR has admin privileges with userManagement permission
    const hasAdminAccess = adminAccount && adminAccount.isActive && adminAccount.hasPermission('userManagement');
    
    if (req.user.role !== 'office_manager' && !hasAdminAccess) {
      return res.status(403).json({
        error: 'Access denied. Manager role or admin privileges required.'
      });
    }
    
    const { permissions } = req.body;
    const userId = req.params.id;
    
    const user = await OfficeUser.findByIdAndUpdate(
      userId,
      { permissions },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'User permissions updated successfully.',
      user
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ 
      error: 'Failed to update permissions.' 
    });
  }
});

// Get address forms (with permission check)
router.get('/addressforms', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has permission to access address forms
    const hasPermission = req.user.permissions.addressForms;
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to view address forms.'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { senderName: searchRegex },
          { senderEmail: searchRegex },
          { senderPhone: searchRegex },
          { senderPincode: searchRegex },
          { receiverName: searchRegex },
          { receiverEmail: searchRegex },
          { receiverPhone: searchRegex },
          { receiverPincode: searchRegex }
        ]
      };
    }
    
    // Add filters
    if (req.query.completed === 'true') {
      query.formCompleted = true;
    } else if (req.query.completed === 'false') {
      query.formCompleted = false;
    }
    
    if (req.query.state) {
      query.senderState = new RegExp(req.query.state, 'i');
    }
    
    const forms = await FormData.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await FormData.countDocuments(query);
    
    res.json({
      success: true,
      data: forms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      },
      search: search
    });
    
  } catch (error) {
    console.error('Get address forms error:', error);
    res.status(500).json({ 
      error: 'Failed to get address forms.' 
    });
  }
});

// Get pincodes (with permission check)
router.get('/pincodes', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has permission to access pincode management
    const hasPermission = req.user.permissions.pincodeManagement;
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to view pincode management.'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const state = req.query.state || '';
    const city = req.query.city || '';
    
    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { areaname: searchRegex },
        { cityname: searchRegex },
        { statename: searchRegex },
        { distrcitname: searchRegex } // Note: using the typo that exists in the model
      ];
      
      // If search term is numeric, also search by pincode
      if (!isNaN(search)) {
        searchConditions.push({ pincode: parseInt(search) });
      }
      
      query = { $or: searchConditions };
    }
    
    if (state) {
      query.statename = new RegExp(state, 'i');
    }
    
    if (city) {
      query.cityname = new RegExp(city, 'i');
    }
    
    const pincodes = await PinCodeArea.find(query)
      .sort({ pincode: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await PinCodeArea.countDocuments(query);
    
    res.json({
      success: true,
      data: pincodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get pincodes error:', error);
    res.status(500).json({ 
      error: 'Failed to get pincodes.' 
    });
  }
});

// Add new pincode (with permission check)
router.post('/pincodes', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has permission to access pincode management
    const hasPermission = req.user.permissions.pincodeManagement;
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to manage pincodes.'
      });
    }
    
    const { pincode, areaname, cityname, districtname, distrcitname, statename, serviceable, bulkOrder, priority, standard, modes } = req.body;
    
    // Validate required fields
    if (!pincode || !areaname || !cityname || !statename) {
      return res.status(400).json({
        error: 'Pincode, area name, city name, and state name are required.'
      });
    }
    
    // Check if pincode already exists
    const existingPincode = await PinCodeArea.findOne({ pincode });
    if (existingPincode) {
      return res.status(400).json({
        error: 'Pincode already exists.'
      });
    }
    
    const newPincode = new PinCodeArea({
      pincode: parseInt(pincode),
      areaname: areaname.trim(),
      cityname: cityname.trim(),
      distrcitname: (districtname || distrcitname || cityname)?.trim(), // Handle both field names
      statename: statename.trim(),
      serviceable: typeof serviceable === 'boolean' ? serviceable : false,
      bulkOrder: typeof bulkOrder === 'boolean' ? bulkOrder : false,
      priority: typeof priority === 'boolean' ? priority : false,
      standard: typeof standard === 'boolean' ? standard : false,
      modes: {
        byAir: typeof modes?.byAir === 'boolean' ? modes.byAir : false,
        byTrain: typeof modes?.byTrain === 'boolean' ? modes.byTrain : false,
        byRoad: typeof modes?.byRoad === 'boolean' ? modes.byRoad : false
      }
    });
    
    await newPincode.save();
    
    res.status(201).json({
      success: true,
      message: 'Pincode added successfully.',
      data: newPincode
    });
    
  } catch (error) {
    console.error('Add pincode error:', error);
    res.status(500).json({ 
      error: 'Failed to add pincode.' 
    });
  }
});

// Update pincode (with permission check)
router.put('/pincodes/:id', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has permission to access pincode management
    const hasPermission = req.user.permissions.pincodeManagement;
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to manage pincodes.'
      });
    }
    
    const { pincode, areaname, cityname, districtname, distrcitname, statename, serviceable, bulkOrder, priority, standard, modes } = req.body;
    const pincodeId = req.params.id;
    
    const updateData = {
      pincode: parseInt(pincode),
      areaname: areaname.trim(),
      cityname: cityname.trim(),
      distrcitname: (districtname || distrcitname || cityname)?.trim(), // Handle both field names
      statename: statename.trim()
    };
    if (typeof serviceable === 'boolean') {
      updateData.serviceable = serviceable;
    }
    if (typeof bulkOrder === 'boolean') {
      updateData.bulkOrder = bulkOrder;
    }
    if (typeof priority === 'boolean') {
      updateData.priority = priority;
    }
    if (typeof standard === 'boolean') {
      updateData.standard = standard;
    }
    if (modes) {
      updateData.modes = {
        byAir: typeof modes.byAir === 'boolean' ? modes.byAir : false,
        byTrain: typeof modes.byTrain === 'boolean' ? modes.byTrain : false,
        byRoad: typeof modes.byRoad === 'boolean' ? modes.byRoad : false
      };
    }
    
    const updatedPincode = await PinCodeArea.findByIdAndUpdate(
      pincodeId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPincode) {
      return res.status(404).json({
        error: 'Pincode not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'Pincode updated successfully.',
      data: updatedPincode
    });
    
  } catch (error) {
    console.error('Update pincode error:', error);
    res.status(500).json({ 
      error: 'Failed to update pincode.' 
    });
  }
});

// Delete pincode (with permission check)
router.delete('/pincodes/:id', authenticateOfficeUser, async (req, res) => {
  try {
    // Check if user has permission to access pincode management
    const hasPermission = req.user.permissions.pincodeManagement;
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to manage pincodes.'
      });
    }
    
    const pincodeId = req.params.id;
    
    const deletedPincode = await PinCodeArea.findByIdAndDelete(pincodeId);
    
    if (!deletedPincode) {
      return res.status(404).json({
        error: 'Pincode not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'Pincode deleted successfully.'
    });
    
  } catch (error) {
    console.error('Delete pincode error:', error);
    res.status(500).json({ 
      error: 'Failed to delete pincode.' 
    });
  }
});

// Lookup user by phone number (for booking system)
router.get('/user-lookup/:phoneNumber', authenticateOfficeUser, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Validate phone number format
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Must be exactly 10 digits.'
      });
    }
    
    console.log(`Looking up user by phone number: ${phoneNumber}`);
    
    // Search for users in FormData by both sender and receiver phone numbers
    const userForms = await FormData.find({
      $or: [
        { senderPhone: phoneNumber },
        { receiverPhone: phoneNumber }
      ]
    }).sort({ createdAt: -1 }).lean();
    
    if (userForms.length === 0) {
      return res.json({
        success: true,
        found: false,
        message: 'No user found with this phone number.'
      });
    }
    
    // Group addresses by user (sender vs receiver)
    const userAddresses = [];
    const processedAddresses = new Set(); // To avoid duplicates
    
    userForms.forEach(form => {
      // Check if this form has sender data with the phone number
      if (form.senderPhone === phoneNumber && form.senderName) {
        const addressKey = `${form.senderName}-${form.senderAddressLine1}-${form.senderPincode}`;
        if (!processedAddresses.has(addressKey)) {
          userAddresses.push({
            id: `sender_${form._id}`,
            name: form.senderName,
            mobileNumber: form.senderPhone,
            email: form.senderEmail,
            addressType: 'HOME', // Default type
            flatBuilding: form.senderAddressLine1,
            locality: form.senderAddressLine2 || '',
            landmark: form.senderLandmark || '',
            city: form.senderCity,
            state: form.senderState,
            pincode: form.senderPincode,
            area: form.senderArea,
            district: form.senderDistrict,
            gstNumber: form.senderGstNumber || '',
            companyName: form.senderCompanyName || '',
            role: 'sender'
          });
          processedAddresses.add(addressKey);
        }
      }
      
      // Check if this form has receiver data with the phone number
      if (form.receiverPhone === phoneNumber && form.receiverName) {
        const addressKey = `${form.receiverName}-${form.receiverAddressLine1}-${form.receiverPincode}`;
        if (!processedAddresses.has(addressKey)) {
          userAddresses.push({
            id: `receiver_${form._id}`,
            name: form.receiverName,
            mobileNumber: form.receiverPhone,
            email: form.receiverEmail,
            addressType: 'HOME', // Default type
            flatBuilding: form.receiverAddressLine1,
            locality: form.receiverAddressLine2 || '',
            landmark: form.receiverLandmark || '',
            city: form.receiverCity,
            state: form.receiverState,
            pincode: form.receiverPincode,
            area: form.receiverArea,
            district: form.receiverDistrict,
            gstNumber: form.receiverGstNumber || '',
            companyName: form.receiverCompanyName || '',
            role: 'receiver'
          });
          processedAddresses.add(addressKey);
        }
      }
    });
    
    // Get the most recent user info for summary
    const mostRecentForm = userForms[0];
    const isSender = mostRecentForm.senderPhone === phoneNumber;
    const userSummary = {
      name: isSender ? mostRecentForm.senderName : mostRecentForm.receiverName,
      email: isSender ? mostRecentForm.senderEmail : mostRecentForm.receiverEmail,
      phoneNumber: phoneNumber,
      totalForms: userForms.length,
      lastUsed: mostRecentForm.createdAt
    };
    
    console.log(`Found ${userAddresses.length} addresses for user: ${userSummary.name}`);
    
    res.json({
      success: true,
      found: true,
      user: userSummary,
      addresses: userAddresses
    });
    
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup user.'
    });
  }
});

// Permission check middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user.permissions || !user.permissions[permission]) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Employee Management Routes
router.get('/employees', authenticateOfficeUser, checkPermission('employeeManagement'), async (req, res) => {
  try {
    const Employee = (await import('../models/Employee.js')).default;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? { $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } }
    ]} : {};
    
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      success: true,
      data: employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees.' });
  }
});

// Corporate Management Routes
router.get('/corporates', authenticateOfficeUser, checkPermission('corporateManagement'), async (req, res) => {
  try {
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? { $or: [
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { corporateId: { $regex: search, $options: 'i' } }
    ]} : {};
    
    const corporates = await CorporateData.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CorporateData.countDocuments(query);
    
    res.json({
      success: true,
      data: corporates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get corporates error:', error);
    res.status(500).json({ error: 'Failed to get corporates.' });
  }
});

// Coloader Management Routes
router.get('/coloaders', authenticateOfficeUser, checkPermission('coloaderManagement'), async (req, res) => {
  try {
    const Coloader = (await import('../models/Coloader.js')).default;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? { $or: [
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } }
    ]} : {};
    
    const coloaders = await Coloader.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Coloader.countDocuments(query);
    
    res.json({
      success: true,
      data: coloaders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get coloaders error:', error);
    res.status(500).json({ error: 'Failed to get coloaders.' });
  }
});

// Invoice Management Routes
router.get('/invoices', authenticateOfficeUser, checkPermission('invoiceManagement'), async (req, res) => {
  try {
    const Invoice = (await import('../models/Invoice.js')).default;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? { $or: [
      { consignmentNumber: { $regex: search, $options: 'i' } },
      { corporateId: { $regex: search, $options: 'i' } }
    ]} : {};
    
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Invoice.countDocuments(query);
    
    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices.' });
  }
});

// Consignment Management Routes
router.get('/consignments', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? { $or: [
      { consignmentNumber: { $regex: search, $options: 'i' } },
      { corporateId: { $regex: search, $options: 'i' } }
    ]} : {};
    
    const consignments = await ConsignmentAssignment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ConsignmentAssignment.countDocuments(query);
    
    res.json({
      success: true,
      data: consignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get consignments error:', error);
    res.status(500).json({ error: 'Failed to get consignments.' });
  }
});

// Courier Requests Routes
router.get('/courier-requests', authenticateOfficeUser, checkPermission('courierRequests'), async (req, res) => {
  try {
    const CourierRequest = (await import('../models/CourierRequest.js')).default;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const urgency = req.query.urgency;
    const search = req.query.search || '';
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (urgency && urgency !== 'all') {
      query['requestData.urgency'] = urgency;
    }
    if (search) {
      query.$or = [
        { 'corporateInfo.companyName': { $regex: search, $options: 'i' } },
        { 'corporateInfo.corporateId': { $regex: search, $options: 'i' } },
        { 'requestData.contactPerson': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch courier requests from database
    const [requests, totalCount] = await Promise.all([
      CourierRequest.find(query)
        .populate('corporateId', 'corporateId companyName email contactNumber')
        .populate('assignedCourier.courierBoyId', 'fullName email phone')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CourierRequest.countDocuments(query)
    ]);
    
    // Format requests to match frontend interface
    const formattedRequests = requests.map(request => ({
      id: `CR-${request._id}`,
      _id: request._id,
      corporateId: request.corporateId?._id || request.corporateInfo?.corporateId,
      corporateInfo: {
        corporateId: request.corporateId?.corporateId || request.corporateInfo?.corporateId,
        companyName: request.corporateId?.companyName || request.corporateInfo?.companyName,
        email: request.corporateId?.email || request.corporateInfo?.email,
        contactNumber: request.corporateId?.contactNumber || request.corporateInfo?.contactNumber
      },
      requestData: request.requestData,
      status: request.status,
      requestedAt: request.requestedAt || request.createdAt,
      estimatedResponseTime: request.estimatedResponseTime,
      assignedCourier: request.assignedCourier?.courierBoyId ? {
        id: request.assignedCourier.courierBoyId._id,
        name: request.assignedCourier.courierBoyId.fullName || request.assignedCourier.name,
        phone: request.assignedCourier.courierBoyId.phone || request.assignedCourier.phone
      } : request.assignedCourier ? {
        id: request.assignedCourier.courierBoyId,
        name: request.assignedCourier.name,
        phone: request.assignedCourier.phone
      } : undefined,
      assignedAt: request.assignedAt,
      completedAt: request.completedAt
    }));
    
    res.json({
      success: true,
      requests: formattedRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get courier requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courier requests'
    });
  }
});

// Update courier request status (Office)
router.put('/courier-requests/:requestId/status', authenticateOfficeUser, checkPermission('courierRequests'), async (req, res) => {
  try {
    const CourierRequest = (await import('../models/CourierRequest.js')).default;
    const { requestId } = req.params;
    const { status } = req.body;
    
    // Extract MongoDB _id from requestId (format: CR-{_id})
    const dbId = requestId.startsWith('CR-') ? requestId.substring(3) : requestId;
    
    const courierRequest = await CourierRequest.findById(dbId);
    if (!courierRequest) {
      return res.status(404).json({
        success: false,
        error: 'Courier request not found'
      });
    }
    
    await courierRequest.updateStatus(status);
    
    console.log(`🚚 Office user updating courier request ${requestId} to status: ${status}`, {
      updatedBy: req.officeUser.username,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Courier request status updated successfully',
      requestId,
      status
    });
    
  } catch (error) {
    console.error('Update courier request status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update courier request status'
    });
  }
});

// Assign courier boy to courier request (Office)
router.put('/courier-requests/:requestId/assign', authenticateOfficeUser, checkPermission('courierRequests'), async (req, res) => {
  try {
    const CourierRequest = (await import('../models/CourierRequest.js')).default;
    const CourierBoy = (await import('../models/CourierBoy.js')).default;
    const { requestId } = req.params;
    const { courierBoyId } = req.body;
    
    if (!courierBoyId) {
      return res.status(400).json({
        success: false,
        error: 'Courier boy ID is required'
      });
    }
    
    // Extract MongoDB _id from requestId (format: CR-{_id})
    const dbId = requestId.startsWith('CR-') ? requestId.substring(3) : requestId;
    
    // Find courier request
    const courierRequest = await CourierRequest.findById(dbId);
    if (!courierRequest) {
      return res.status(404).json({
        success: false,
        error: 'Courier request not found'
      });
    }
    
    // Find courier boy
    const courierBoy = await CourierBoy.findById(courierBoyId);
    if (!courierBoy) {
      return res.status(404).json({
        success: false,
        error: 'Courier boy not found'
      });
    }
    
    // Check if courier boy is approved
    if (courierBoy.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Only approved courier boys can be assigned'
      });
    }
    
    // Assign courier boy
    await courierRequest.assignCourier(courierBoy);
    
    console.log(`🚚 Office user assigned courier boy to request ${requestId}`, {
      courierBoyId: courierBoy._id,
      courierBoyName: courierBoy.fullName,
      updatedBy: req.officeUser.username,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Courier boy assigned successfully',
      requestId,
      assignedCourier: {
        id: courierBoy._id,
        name: courierBoy.fullName,
        phone: courierBoy.phone
      }
    });
    
  } catch (error) {
    console.error('Assign courier boy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign courier boy'
    });
  }
});

// Get consignment assignments for office user
router.get('/consignment/assignments', authenticateOfficeUser, async (req, res) => {
  try {
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    
    // Get assignments for this office user
    const assignments = await ConsignmentAssignment.find({
      assignmentType: 'office_user',
      officeUserId: req.user._id,
      isActive: true
    }).sort({ startNumber: 1 });
    
    if (!assignments || assignments.length === 0) {
      return res.json({
        success: true,
        hasAssignment: false,
        message: 'No consignment numbers assigned to your account. Please contact admin to get consignment numbers assigned.'
      });
    }
    
    // Get usage statistics
    const usedCount = await ConsignmentUsage.countDocuments({
      assignmentType: 'office_user',
      entityId: req.user._id
    });
    
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.totalNumbers, 0);
    const availableCount = totalAssigned - usedCount;
    
    res.json({
      success: true,
      hasAssignment: true,
      assignments: assignments.map(assignment => ({
        _id: assignment._id,
        startNumber: assignment.startNumber,
        endNumber: assignment.endNumber,
        totalNumbers: assignment.totalNumbers,
        assignedAt: assignment.assignedAt,
        notes: assignment.notes
      })),
      summary: {
        totalAssigned: totalAssigned,
        usedCount: usedCount,
        availableCount: availableCount,
        usagePercentage: Math.round((usedCount / totalAssigned) * 100)
      },
      message: `You have ${availableCount} consignment numbers available for booking across ${assignments.length} assignment(s).`
    });
    
  } catch (error) {
    console.error('Get consignment assignments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consignment assignments'
    });
  }
});

// Get consignment usage for office user
router.get('/consignment/usage', authenticateOfficeUser, async (req, res) => {
  try {
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get usage details
    const usage = await ConsignmentUsage.find({
      assignmentType: 'office_user',
      entityId: req.user._id
    })
    .sort({ usedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    const totalUsage = await ConsignmentUsage.countDocuments({
      assignmentType: 'office_user',
      entityId: req.user._id
    });
    
    res.json({
      success: true,
      data: {
        usage: usage,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsage / limit),
          totalItems: totalUsage,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('Get consignment usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consignment usage'
    });
  }
});

// Get next available consignment number for the logged-in office user
router.get('/consignment/next', authenticateOfficeUser, async (req, res) => {
  try {
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;

    try {
      const nextNumber = await ConsignmentAssignment.getNextConsignmentNumber('office_user', req.user._id);
      return res.json({ success: true, consignmentNumber: nextNumber });
    } catch (e) {
      return res.status(409).json({ success: false, error: e.message || 'No consignment numbers available' });
    }
  } catch (error) {
    console.error('Get next consignment number error:', error);
    res.status(500).json({ success: false, error: 'Failed to get next consignment number' });
  }
});

// Record consignment usage for the logged-in office user (called after booking is completed)
router.post('/consignment/use', authenticateOfficeUser, async (req, res) => {
  try {
    const { consignmentNumber, bookingReference, bookingData } = req.body;

    if (!consignmentNumber || !bookingReference || !bookingData) {
      return res.status(400).json({ error: 'Consignment number, booking reference, and booking data are required.' });
    }

    const { default: ConsignmentAssignment, ConsignmentUsage } = await import('../models/ConsignmentAssignment.js');

    const parsedNumber = parseInt(consignmentNumber);

    // Verify the number is within any active assigned range for this office user
    const assignment = await ConsignmentAssignment.findOne({
      assignmentType: 'office_user',
      officeUserId: req.user._id,
      isActive: true,
      startNumber: { $lte: parsedNumber },
      endNumber: { $gte: parsedNumber }
    });

    if (!assignment) {
      return res.status(400).json({ error: 'Consignment number is not within your assigned range.' });
    }

    // Ensure the number has not been used by this office user
    const alreadyUsed = await ConsignmentUsage.findOne({
      assignmentType: 'office_user',
      entityId: req.user._id,
      consignmentNumber: parsedNumber
    });

    if (alreadyUsed) {
      return res.status(409).json({ error: 'This consignment number is already in use.' });
    }

    // Record usage
    const usage = new ConsignmentUsage({
      assignmentType: 'office_user',
      entityId: req.user._id,
      officeUserId: req.user._id,
      consignmentNumber: parsedNumber,
      bookingReference,
      bookingData
    });

    await usage.save();

    return res.json({ success: true, data: usage });
  } catch (error) {
    console.error('Record consignment usage error:', error);
    res.status(500).json({ error: 'Failed to record consignment usage.' });
  }
});

// Get highest assigned consignment number
router.get('/consignment/highest', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    
    // Find the highest endNumber across all active assignments
    const highestAssignment = await ConsignmentAssignment.findOne({
      isActive: true
    }).sort({ endNumber: -1 }).lean();
    
    const highestNumber = highestAssignment ? highestAssignment.endNumber : 871026571; // Default to one less than minimum
    
    res.json({
      success: true,
      data: {
        highestNumber: highestNumber,
        nextStartNumber: highestNumber + 1
      }
    });
    
  } catch (error) {
    console.error('Get highest consignment number error:', error);
    res.status(500).json({ 
      error: 'Failed to get highest consignment number.' 
    });
  }
});

// Get all corporate companies for consignment assignment
router.get('/consignment/corporates', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    let query = { isActive: true };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        ...query,
        $or: [
          { companyName: searchRegex },
          { corporateId: searchRegex },
          { email: searchRegex },
          { contactNumber: searchRegex }
        ]
      };
    }
    
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const corporates = await CorporateData.find(query)
      .select('corporateId companyName email contactNumber registrationDate')
      .sort({ companyName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await CorporateData.countDocuments(query);
    
    // Get consignment assignments for each corporate
    const corporateIds = corporates.map(c => c._id);
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const assignments = await ConsignmentAssignment.find({
      corporateId: { $in: corporateIds },
      isActive: true
    }).lean();
    
    // Map assignments to corporates (now supporting multiple assignments per corporate)
    const assignmentMap = {};
    assignments.forEach(assignment => {
      if (!assignmentMap[assignment.corporateId]) {
        assignmentMap[assignment.corporateId] = [];
      }
      assignmentMap[assignment.corporateId].push(assignment);
    });
    
    // Get usage statistics for each corporate
    const corporatesWithStats = await Promise.all(
      corporates.map(async (corporate) => {
        const corporateAssignments = assignmentMap[corporate._id] || [];
        
        // Calculate total assigned and used for this corporate
        const totalAssigned = corporateAssignments.reduce((sum, assignment) => sum + assignment.totalNumbers, 0);
        
        // Get usage count for this corporate
        const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
        const totalUsed = await ConsignmentUsage.countDocuments({
          assignmentType: 'corporate',
          entityId: corporate._id
        });
        
        const availableCount = totalAssigned - totalUsed;
        const usagePercentage = totalAssigned > 0 ? Math.round((totalUsed / totalAssigned) * 100) : 0;
        
        return {
          ...corporate,
          consignmentAssignments: corporateAssignments.map(assignment => ({
            _id: assignment._id,
            startNumber: assignment.startNumber,
            endNumber: assignment.endNumber,
            totalNumbers: assignment.totalNumbers,
            assignedAt: assignment.assignedAt,
            notes: assignment.notes,
            usedCount: 0, // Will be calculated per assignment if needed
            availableCount: assignment.totalNumbers,
            usagePercentage: 0
          })),
          hasAssignments: corporateAssignments.length > 0,
          totalAssigned,
          totalUsed,
          availableCount,
          usagePercentage
        };
      })
    );
    
    res.json({
      success: true,
      data: corporatesWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      },
      search: search
    });
    
  } catch (error) {
    console.error('Get corporates error:', error);
    res.status(500).json({ 
      error: 'Failed to get corporate companies.' 
    });
  }
});

// Get all consignment assignments
router.get('/consignment/assignments', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    let query = { isActive: true };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        ...query,
        $or: [
          { assignedToName: searchRegex },
          { assignedToEmail: searchRegex },
          { companyName: searchRegex }
        ]
      };
    }
    
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const assignments = await ConsignmentAssignment.find(query)
      .populate('corporateId', 'corporateId companyName email contactNumber')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await ConsignmentAssignment.countDocuments(query);
    
    // Get usage statistics for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        // Skip assignments with null or invalid corporateId
        if (assignment.assignmentType === 'corporate' && !assignment.corporateId) {
          return {
            ...assignment,
            usedCount: 0,
            availableCount: assignment.totalNumbers,
            usagePercentage: 0,
            corporateInfo: {
              corporateId: 'N/A',
              companyName: 'Unknown Company',
              email: 'N/A',
              contactNumber: 'N/A'
            }
          };
        }
        
        // Get usage count for this specific assignment range
        const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
        let entityIdForUsage = null;
        if (assignment.assignmentType === 'corporate' && assignment.corporateId) {
          entityIdForUsage = assignment.corporateId._id;
        } else if (assignment.assignmentType === 'office_user' && assignment.officeUserId) {
          entityIdForUsage = assignment.officeUserId;
        } else if (assignment.assignmentType === 'courier_boy' && assignment.courierBoyId) {
          entityIdForUsage = assignment.courierBoyId;
        }

        const usedCountInRange = await ConsignmentUsage.countDocuments({
          assignmentType: assignment.assignmentType,
          entityId: entityIdForUsage,
          consignmentNumber: {
            $gte: assignment.startNumber,
            $lte: assignment.endNumber
          }
        });
        
        // Get total usage for this corporate (across all their assignments)
        let totalUsedForCorporate = 0;
        let totalAssignedForCorporate = 0;
        
        if (assignment.assignmentType === 'corporate' && assignment.corporateId) {
          const allCorporateAssignments = await ConsignmentAssignment.find({
            corporateId: assignment.corporateId._id,
            isActive: true
          }).lean();
          
          totalUsedForCorporate = await ConsignmentUsage.countDocuments({
            assignmentType: 'corporate',
            entityId: assignment.corporateId._id
          });
          
          totalAssignedForCorporate = allCorporateAssignments.reduce(
            (sum, assign) => sum + assign.totalNumbers, 0
          );
        }
        
        return {
          ...assignment,
          usedCount: usedCountInRange,
          availableCount: assignment.totalNumbers - usedCountInRange,
          usagePercentage: Math.round((usedCountInRange / assignment.totalNumbers) * 100),
          corporateTotalUsed: totalUsedForCorporate,
          corporateTotalAssigned: totalAssignedForCorporate,
          corporateUsagePercentage: totalAssignedForCorporate > 0 ? Math.round((totalUsedForCorporate / totalAssignedForCorporate) * 100) : 0,
          corporateInfo: assignment.corporateId ? {
            corporateId: assignment.corporateId.corporateId,
            companyName: assignment.corporateId.companyName,
            email: assignment.corporateId.email,
            contactNumber: assignment.corporateId.contactNumber
          } : null
        };
      })
    );
    
    res.json({
      success: true,
      data: assignmentsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      },
      search: search
    });
    
  } catch (error) {
    console.error('Get consignment assignments error:', error);
    res.status(500).json({ 
      error: 'Failed to get consignment assignments.' 
    });
  }
});

// Get consignment usage for a specific courier boy
router.get('/consignment/usage/courier-boy/:courierBoyId', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { courierBoyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    const CourierBoy = (await import('../models/CourierBoy.js')).default;

    // Get an active assignment for this courier boy (latest by assignedAt)
    const assignment = await ConsignmentAssignment.findOne({
      assignmentType: 'courier_boy',
      courierBoyId: courierBoyId,
      isActive: true
    })
    .sort({ assignedAt: -1 })
    .populate('courierBoyId', 'fullName email phone area');

    if (!assignment) {
      // If no single active assignment found, still return summary across all courier boy assignments
      const courier = await CourierBoy.findById(courierBoyId).select('fullName email phone area');
      if (!courier) {
        return res.status(404).json({ error: 'Courier boy not found.' });
      }

      const allAssignments = await ConsignmentAssignment.find({
        assignmentType: 'courier_boy',
        courierBoyId: courierBoyId,
        isActive: true
      }).lean();

      const totalAssigned = allAssignments.reduce((sum, a) => sum + a.totalNumbers, 0);
      const totalUsed = await ConsignmentUsage.countDocuments({ assignmentType: 'courier_boy', entityId: courierBoyId });

      return res.json({
        success: true,
        data: {
          assignment: {
            assignmentType: 'courier_boy',
            assignedToName: courier.fullName,
            assignedToEmail: courier.email,
            courierBoy: courier,
            startNumber: allAssignments.length ? Math.min(...allAssignments.map(a => a.startNumber)) : 0,
            endNumber: allAssignments.length ? Math.max(...allAssignments.map(a => a.endNumber)) : 0,
            totalNumbers: totalAssigned
          },
          usage: [],
          statistics: {
            totalAssigned,
            totalUsed,
            available: totalAssigned - totalUsed,
            usagePercentage: totalAssigned > 0 ? Math.round((totalUsed / totalAssigned) * 100) : 0
          },
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalUsage: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    // Get usage within this assignment range
    const usage = await ConsignmentUsage.find({
      assignmentType: 'courier_boy',
      entityId: courierBoyId,
      consignmentNumber: {
        $gte: assignment.startNumber,
        $lte: assignment.endNumber
      }
    })
    .sort({ usedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const totalUsage = await ConsignmentUsage.countDocuments({
      assignmentType: 'courier_boy',
      entityId: courierBoyId,
      consignmentNumber: {
        $gte: assignment.startNumber,
        $lte: assignment.endNumber
      }
    });

    const totalAssigned = assignment.totalNumbers;
    const totalUsed = usage.length; // within the page; compute full used in range
    const fullUsed = await ConsignmentUsage.countDocuments({
      assignmentType: 'courier_boy',
      entityId: courierBoyId,
      consignmentNumber: {
        $gte: assignment.startNumber,
        $lte: assignment.endNumber
      }
    });

    res.json({
      success: true,
      data: {
        assignment: {
          _id: assignment._id,
          assignmentType: 'courier_boy',
          assignedToName: assignment.assignedToName,
          assignedToEmail: assignment.assignedToEmail,
          startNumber: assignment.startNumber,
          endNumber: assignment.endNumber,
          totalNumbers: assignment.totalNumbers,
          assignedAt: assignment.assignedAt,
          notes: assignment.notes,
          courierBoy: assignment.courierBoyId
        },
        usage: usage,
        statistics: {
          totalAssigned,
          totalUsed: fullUsed,
          available: totalAssigned - fullUsed,
          usagePercentage: totalAssigned > 0 ? Math.round((fullUsed / totalAssigned) * 100) : 0
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsage / limit),
          totalUsage: totalUsage,
          hasNextPage: page < Math.ceil(totalUsage / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get courier boy consignment usage error:', error);
    res.status(500).json({ 
      error: 'Failed to get courier boy consignment usage.' 
    });
  }
});

// Get consignment usage for a specific office user
router.get('/consignment/usage/office-user/:officeUserId', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { officeUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    const OfficeUser = (await import('../models/OfficeUser.js')).default;
    
    // Get assignment details
    const assignment = await ConsignmentAssignment.findOne({
      assignmentType: 'office_user',
      officeUserId: officeUserId,
      isActive: true
    }).populate('officeUserId', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'No consignment assignment found for this office user.' 
      });
    }
    
    // Get usage details
    const usage = await ConsignmentUsage.find({
      assignmentType: 'office_user',
      officeUserId: officeUserId,
      consignmentNumber: { 
        $gte: assignment.startNumber, 
        $lte: assignment.endNumber 
      }
    })
    .sort({ usedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    const totalUsage = await ConsignmentUsage.countDocuments({
      assignmentType: 'office_user',
      officeUserId: officeUserId,
      consignmentNumber: { 
        $gte: assignment.startNumber, 
        $lte: assignment.endNumber 
      }
    });
    
    res.json({
      success: true,
      data: {
        assignment: {
          _id: assignment._id,
          startNumber: assignment.startNumber,
          endNumber: assignment.endNumber,
          totalNumbers: assignment.totalNumbers,
          assignedAt: assignment.assignedAt,
          notes: assignment.notes,
          officeUser: assignment.officeUserId
        },
        usage: usage,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsage / limit),
          totalUsage: totalUsage,
          hasNextPage: page < Math.ceil(totalUsage / limit),
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get office user consignment usage error:', error);
    res.status(500).json({ 
      error: 'Failed to get consignment usage.' 
    });
  }
});

// Get office users for consignment assignment
router.get('/consignment/office-users', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const OfficeUser = (await import('../models/OfficeUser.js')).default;
    const officeUsers = await OfficeUser.find({ isActive: true })
      .select('_id name email role department')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: officeUsers
    });
    
  } catch (error) {
    console.error('Get office users error:', error);
    res.status(500).json({ error: 'Failed to fetch office users.' });
  }
});

// Get courier boys for consignment assignment
router.get('/consignment/courier-boys', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const CourierBoy = (await import('../models/CourierBoy.js')).default;
    const { default: ConsignmentAssignment, ConsignmentUsage } = await import('../models/ConsignmentAssignment.js');
    
    // Fetch courier boys and their assignments in parallel
    const [courierBoys, assignments] = await Promise.all([
      CourierBoy.find({ status: 'approved' })
        .select('_id fullName email phone area')
        .sort({ fullName: 1 })
        .lean(),
      ConsignmentAssignment.find({ 
        assignmentType: 'courier_boy',
        isActive: true 
      })
        .populate('courierBoyId', 'fullName email phone area')
        .lean()
    ]);

    // Map assignments to courier boys and calculate usage
    const courierBoysWithAssignments = courierBoys.map(async (courier) => {
      const courierAssignments = assignments.filter(assignment => {
        // Handle both populated and unpopulated courierBoyId
        const assignmentCourierId = assignment.courierBoyId?._id || assignment.courierBoyId;
        return String(assignmentCourierId) === String(courier._id);
      }).map(async (assignment) => {
        // Calculate usage for this assignment
        const usedCount = await ConsignmentUsage.countDocuments({
          assignmentType: 'courier_boy',
          entityId: courier._id,
          consignmentNumber: { $gte: assignment.startNumber, $lte: assignment.endNumber }
        });
        
        const totalNumbers = assignment.totalNumbers;
        const usagePercentage = totalNumbers > 0 ? Math.round((usedCount / totalNumbers) * 100) : 0;
        
        return {
          ...assignment,
          usedCount,
          availableCount: totalNumbers - usedCount,
          usagePercentage
        };
      });

      // Wait for all usage calculations to complete
      const resolvedAssignments = await Promise.all(courierAssignments);

      return {
        ...courier,
        consignmentAssignments: resolvedAssignments,
        hasAssignments: resolvedAssignments.length > 0
      };
    });

    // Wait for all courier boys to be processed
    const finalCourierBoys = await Promise.all(courierBoysWithAssignments);

    res.json({
      success: true,
      data: finalCourierBoys
    });
  } catch (error) {
    console.error('Get courier boys error:', error);
    res.status(500).json({ error: 'Failed to fetch courier boys.' });
  }
});

// Assign consignment numbers to corporate
router.post('/consignment/assign', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { corporateId, startNumber, endNumber, notes } = req.body;
    
    // Validate required fields
    if (!corporateId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Corporate ID, start number, and end number are required.' 
      });
    }
    
    // Validate range
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    try {
      ConsignmentAssignment.validateRange(parseInt(startNumber), parseInt(endNumber));
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }
    
    // Check if corporate exists
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const corporate = await CorporateData.findById(corporateId);
    
    if (!corporate) {
      return res.status(404).json({ 
        error: 'Corporate company not found.' 
      });
    }
    
    // Check if range is available
    const isAvailable = await ConsignmentAssignment.isRangeAvailable(
      parseInt(startNumber), 
      parseInt(endNumber)
    );
    
    if (!isAvailable) {
      return res.status(409).json({ 
        error: 'The specified number range is already assigned to another company.' 
      });
    }
    
    // Create assignment
    const assignment = new ConsignmentAssignment({
      assignmentType: 'corporate',
      corporateId: corporateId,
      assignedToName: corporate.companyName,
      assignedToEmail: corporate.email,
      companyName: corporate.companyName,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
      totalNumbers: parseInt(endNumber) - parseInt(startNumber) + 1,
      assignedBy: req.user._id,
      notes: notes || ''
    });
    
    await assignment.save();
    
    res.json({
      success: true,
      message: `Successfully assigned consignment numbers ${startNumber}-${endNumber} to ${corporate.companyName}`,
      data: assignment
    });
    
  } catch (error) {
    console.error('Assign consignment numbers error:', error);
    res.status(500).json({ 
      error: 'Failed to assign consignment numbers.' 
    });
  }
});

// Assign consignment numbers to office user
router.post('/consignment/assign-office-user', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { officeUserId, startNumber, endNumber, notes } = req.body;
    
    // Validate required fields
    if (!officeUserId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Office User ID, start number, and end number are required.' 
      });
    }
    
    // Validate range
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    try {
      ConsignmentAssignment.validateRange(parseInt(startNumber), parseInt(endNumber));
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }
    
    // Check if office user exists
    const OfficeUser = (await import('../models/OfficeUser.js')).default;
    const officeUser = await OfficeUser.findById(officeUserId);
    
    if (!officeUser) {
      return res.status(404).json({ 
        error: 'Office user not found.' 
      });
    }
    
    // Check if range is available
    const isAvailable = await ConsignmentAssignment.isRangeAvailable(
      parseInt(startNumber), 
      parseInt(endNumber)
    );
    
    if (!isAvailable) {
      return res.status(409).json({ 
        error: 'The specified number range is already assigned to another user.' 
      });
    }
    
    // Create assignment
    const assignment = new ConsignmentAssignment({
      assignmentType: 'office_user',
      officeUserId: officeUserId,
      assignedToName: officeUser.name,
      assignedToEmail: officeUser.email,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
      totalNumbers: parseInt(endNumber) - parseInt(startNumber) + 1,
      assignedBy: req.user._id,
      notes: notes || ''
    });
    
    await assignment.save();
    
    res.json({
      success: true,
      message: `Successfully assigned consignment numbers ${startNumber}-${endNumber} to ${officeUser.name}`,
      data: assignment
    });
    
  } catch (error) {
    console.error('Assign consignment numbers to office user error:', error);
    res.status(500).json({ 
      error: 'Failed to assign consignment numbers to office user.' 
    });
  }
});

// Assign consignment numbers to courier boy
router.post('/consignment/assign-courier-boy', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { courierBoyId, startNumber, endNumber, notes } = req.body;

    // Validate required fields
    if (!courierBoyId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Courier Boy ID, start number, and end number are required.' 
      });
    }

    // Validate range
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    try {
      ConsignmentAssignment.validateRange(parseInt(startNumber), parseInt(endNumber));
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }

    // Check if courier boy exists
    const CourierBoy = (await import('../models/CourierBoy.js')).default;
    const courierBoy = await CourierBoy.findById(courierBoyId);

    if (!courierBoy) {
      return res.status(404).json({ 
        error: 'Courier boy not found.' 
      });
    }

    // Check if range is available
    const isAvailable = await ConsignmentAssignment.isRangeAvailable(
      parseInt(startNumber), 
      parseInt(endNumber)
    );

    if (!isAvailable) {
      return res.status(409).json({ 
        error: 'The specified number range is already assigned to another entity.' 
      });
    }

    // Create assignment
    const assignment = new ConsignmentAssignment({
      assignmentType: 'courier_boy',
      courierBoyId: courierBoyId,
      assignedToName: courierBoy.fullName,
      assignedToEmail: courierBoy.email,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
      totalNumbers: parseInt(endNumber) - parseInt(startNumber) + 1,
      assignedBy: req.user._id,
      notes: notes || ''
    });

    await assignment.save();

    res.json({
      success: true,
      message: `Successfully assigned consignment numbers ${startNumber}-${endNumber} to ${courierBoy.fullName}`,
      data: assignment
    });
  } catch (error) {
    console.error('Assign consignment numbers to courier boy error:', error);
    res.status(500).json({ 
      error: 'Failed to assign consignment numbers to courier boy.' 
    });
  }
});

// Get medicine users for consignment assignment
router.get('/consignment/medicine-users', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const MedicineUser = (await import('../models/MedicineUser.js')).default;
    const { default: ConsignmentAssignment, ConsignmentUsage } = await import('../models/ConsignmentAssignment.js');
    
    // Fetch medicine users and their assignments in parallel
    const [medicineUsers, assignments] = await Promise.all([
      MedicineUser.find({ isActive: true })
        .select('_id name email')
        .sort({ name: 1 })
        .lean(),
      ConsignmentAssignment.find({ 
        assignmentType: 'medicine',
        isActive: true 
      })
        .populate('medicineUserId', 'name email')
        .lean()
    ]);

    // Map assignments to medicine users and calculate usage
    const medicineUsersWithAssignments = medicineUsers.map(async (user) => {
      const userAssignments = assignments.filter(assignment => 
        assignment.medicineUserId && String(assignment.medicineUserId._id) === String(user._id)
      ).map(async (assignment) => {
        // Calculate usage for this assignment
        const usedCount = await ConsignmentUsage.countDocuments({
          assignmentType: 'medicine',
          entityId: user._id,
          consignmentNumber: { $gte: assignment.startNumber, $lte: assignment.endNumber }
        });
        
        const totalNumbers = assignment.totalNumbers;
        const usagePercentage = totalNumbers > 0 ? Math.round((usedCount / totalNumbers) * 100) : 0;
        
        return {
          ...assignment,
          usedCount,
          availableCount: totalNumbers - usedCount,
          usagePercentage
        };
      });

      // Wait for all usage calculations to complete
      const resolvedAssignments = await Promise.all(userAssignments);

      return {
        ...user,
        consignmentAssignments: resolvedAssignments,
        hasAssignments: resolvedAssignments.length > 0
      };
    });

    // Wait for all medicine users to be processed
    const finalMedicineUsers = await Promise.all(medicineUsersWithAssignments);

    res.json({
      success: true,
      data: finalMedicineUsers
    });
  } catch (error) {
    console.error('Get medicine users error:', error);
    res.status(500).json({ error: 'Failed to fetch medicine users.' });
  }
});

// Assign consignment numbers to medicine user
router.post('/consignment/assign-medicine-user', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { medicineUserId, startNumber, endNumber, notes } = req.body;

    // Validate required fields
    if (!medicineUserId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Medicine User ID, start number, and end number are required.' 
      });
    }

    // Validate range
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    try {
      ConsignmentAssignment.validateRange(parseInt(startNumber), parseInt(endNumber));
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }

    // Check if medicine user exists
    const MedicineUser = (await import('../models/MedicineUser.js')).default;
    const medicineUser = await MedicineUser.findById(medicineUserId);

    if (!medicineUser) {
      return res.status(404).json({ 
        error: 'Medicine user not found.' 
      });
    }

    // Check if range is available
    const isAvailable = await ConsignmentAssignment.isRangeAvailable(
      parseInt(startNumber), 
      parseInt(endNumber)
    );

    if (!isAvailable) {
      return res.status(409).json({ 
        error: 'The specified number range is already assigned to another entity.' 
      });
    }

    // Create assignment
    const assignment = new ConsignmentAssignment({
      assignmentType: 'medicine',
      medicineUserId: medicineUserId,
      assignedToName: medicineUser.name,
      assignedToEmail: medicineUser.email,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
      totalNumbers: parseInt(endNumber) - parseInt(startNumber) + 1,
      assignedBy: req.user._id,
      notes: notes || ''
    });

    await assignment.save();

    res.json({
      success: true,
      message: `Successfully assigned consignment numbers ${startNumber}-${endNumber} to ${medicineUser.name}`,
      data: assignment
    });
  } catch (error) {
    console.error('Assign consignment numbers to medicine user error:', error);
    res.status(500).json({ 
      error: 'Failed to assign consignment numbers to medicine user.' 
    });
  }
});

// Get usage data for a corporate
router.get('/consignment/usage/:corporateId', authenticateOfficeUser, checkPermission('consignmentManagement'), async (req, res) => {
  try {
    const { corporateId } = req.params;
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    
    // Get the assignment
    const assignment = await ConsignmentAssignment.findById(corporateId)
      .populate('corporateId', 'corporateId companyName email contactNumber');
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'Assignment not found.' 
      });
    }
    
    // Get usage details
    const usage = await ConsignmentUsage.find({
      assignmentType: 'corporate',
      entityId: assignment.corporateId._id,
      consignmentNumber: {
        $gte: assignment.startNumber,
        $lte: assignment.endNumber
      }
    }).sort({ usedAt: -1 });
    
    // Calculate statistics
    const totalAssigned = assignment.totalNumbers;
    const totalUsed = usage.length;
    const available = totalAssigned - totalUsed;
    const usagePercentage = Math.round((totalUsed / totalAssigned) * 100);
    
    res.json({
      success: true,
      data: {
        assignment: assignment,
        usage: usage,
        statistics: {
          totalAssigned,
          totalUsed,
          available,
          usagePercentage
        }
      }
    });
    
  } catch (error) {
    console.error('Get usage data error:', error);
    res.status(500).json({ 
      error: 'Failed to get usage data.' 
    });
  }
});

// Update all office users to have consignmentManagement permission (one-time script)
router.post('/update-permissions', async (req, res) => {
  try {
    console.log('🔄 Updating office user permissions...');
    
    // Update all office users to have consignmentManagement permission
    const result = await OfficeUser.updateMany(
      { isActive: true },
      { 
        $set: { 
          'permissions.consignmentManagement': true,
          'permissions.coloaderManagement': false,
          'permissions.corporateRegistration': false,
          'permissions.corporateManagement': false,
          'permissions.corporatePricing': false,
          'permissions.corporateApproval': false,
          'permissions.employeeRegistration': false,
          'permissions.employeeManagement': false,
          'permissions.courierRequests': false,
          'permissions.invoiceManagement': false
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} office users with consignmentManagement permission`);
    
    // Get updated users
    const users = await OfficeUser.find({ isActive: true }).select('name email permissions.consignmentManagement');
    
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} office users with consignmentManagement permission`,
      users: users.map(user => ({
        name: user.name,
        email: user.email,
        consignmentManagement: user.permissions.consignmentManagement
      }))
    });
    
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    res.status(500).json({ 
      error: 'Failed to update permissions.' 
    });
  }
});

export default router;
