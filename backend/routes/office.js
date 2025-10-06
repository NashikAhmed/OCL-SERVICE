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
        addressForms: false
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
          addressForms: false
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
    
    const { pincode, areaname, cityname, districtname, distrcitname, statename, serviceable } = req.body;
    
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
      serviceable: typeof serviceable === 'boolean' ? serviceable : false
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
    
    const { pincode, areaname, cityname, districtname, distrcitname, statename, serviceable } = req.body;
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

export default router;
