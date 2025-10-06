import express from 'express';
import Admin from '../models/Admin.js';
import OfficeUser from '../models/OfficeUser.js';
import FormData from '../models/FormData.js';
import PinCodeArea from '../models/PinCodeArea.js';
import { generateToken, authenticateAdmin, requireSuperAdmin, validateLoginInput, authenticateAdminOrOfficeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin login route
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Admin login attempt: ${email}`);
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid email or password.' 
      });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({ 
        error: 'Admin account is deactivated.' 
      });
    }
    
    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password.' 
      });
    }
    
    // Update login info
    await admin.updateLoginInfo();
    
    // Generate JWT token
    const token = generateToken(admin._id, 'admin');
    
    console.log(`✅ Admin login successful: ${admin.name} (${admin.email})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        permissions: admin.permissions,
        canAssignPermissions: admin.canAssignPermissions
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Get current admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile information.' 
    });
  }
});

// Admin dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get form statistics
    const totalForms = await FormData.countDocuments();
    const completedForms = await FormData.countDocuments({ formCompleted: true });
    const incompleteForms = totalForms - completedForms;
    
    // Get recent forms
    const recentForms = await FormData.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('senderName senderEmail receiverName receiverEmail createdAt formCompleted')
      .lean();
    
    // Get forms by completion status over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFormsStats = await FormData.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            completed: "$formCompleted"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);
    
    // Get pincode statistics
    const totalPincodes = await PinCodeArea.countDocuments();
    const uniqueStates = await PinCodeArea.distinct('statename');
    const uniqueCities = await PinCodeArea.distinct('cityname');
    
    // Get top states by form submissions
    const topStatesByForms = await FormData.aggregate([
      { $match: { senderState: { $exists: true, $ne: '' } } },
      { $group: { _id: '$senderState', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      stats: {
        forms: {
          total: totalForms,
          completed: completedForms,
          incomplete: incompleteForms,
          completionRate: totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0
        },
        pincodes: {
          total: totalPincodes,
          states: uniqueStates.length,
          cities: uniqueCities.length
        },
        recent: {
          forms: recentForms,
          stats: recentFormsStats,
          topStates: topStatesByForms
        }
      }
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard statistics.' 
    });
  }
});

// Get all address forms with pagination and search
router.get('/addressforms', authenticateAdmin, async (req, res) => {
  // Check if admin has address forms permission
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms permission required.' 
    });
  }
  try {
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

// Get single address form by ID
router.get('/addressforms/:id', authenticateAdmin, async (req, res) => {
  try {
    const form = await FormData.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ 
        error: 'Address form not found.' 
      });
    }
    
    res.json({
      success: true,
      data: form
    });
    
  } catch (error) {
    console.error('Get address form error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to get address form.' });
    }
  }
});

// Update address form by ID
router.put('/addressforms/:id', authenticateAdmin, async (req, res) => {
  try {
    const updatedForm = await FormData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedForm) {
      return res.status(404).json({ 
        error: 'Address form not found.' 
      });
    }
    
    console.log(`✅ Address form updated by admin ${req.admin.name}: ${updatedForm._id}`);
    
    res.json({
      success: true,
      message: 'Address form updated successfully.',
      data: updatedForm
    });
    
  } catch (error) {
    console.error('Update address form error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to update address form.' });
    }
  }
});

// Delete address form by ID
router.delete('/addressforms/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedForm = await FormData.findByIdAndDelete(req.params.id);
    
    if (!deletedForm) {
      return res.status(404).json({ 
        error: 'Address form not found.' 
      });
    }
    
    console.log(`🗑️ Address form deleted by admin ${req.admin.name}: ${deletedForm._id}`);
    
    res.json({
      success: true,
      message: 'Address form deleted successfully.',
      deletedData: {
        id: deletedForm._id,
        senderName: deletedForm.senderName,
        senderEmail: deletedForm.senderEmail
      }
    });
    
  } catch (error) {
    console.error('Delete address form error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to delete address form.' });
    }
  }
});

// Get all pincodes with pagination and search
router.get('/pincodes', authenticateAdmin, async (req, res) => {
  // Check if admin has pincode management permission
  if (!req.admin.hasPermission('pincodeManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Pincode management permission required.' 
    });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
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
    
    // Add filters
    if (req.query.state) {
      query.statename = new RegExp(req.query.state, 'i');
    }
    
    if (req.query.city) {
      query.cityname = new RegExp(req.query.city, 'i');
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
      },
      search: search
    });
    
  } catch (error) {
    console.error('Get pincodes error:', error);
    res.status(500).json({ 
      error: 'Failed to get pincodes.' 
    });
  }
});

// Add new pincode
router.post('/pincodes', authenticateAdmin, async (req, res) => {
  try {
    const { pincode, areaname, cityname, districtname, statename, serviceable } = req.body;
    
    // Validate required fields
    if (!pincode || !areaname || !cityname || !statename) {
      return res.status(400).json({ 
        error: 'Pincode, area name, city name, and state name are required.' 
      });
    }
    
    // Check if pincode already exists
    const existingPincode = await PinCodeArea.findOne({ 
      pincode: parseInt(pincode),
      areaname: areaname.trim(),
      cityname: cityname.trim()
    });
    
    if (existingPincode) {
      return res.status(409).json({ 
        error: 'This pincode area combination already exists.' 
      });
    }
    
    const newPincode = new PinCodeArea({
      pincode: parseInt(pincode),
      areaname: areaname.trim(),
      cityname: cityname.trim(),
      distrcitname: districtname?.trim() || cityname.trim(), // Note: using the typo that exists in the model
      statename: statename.trim(),
      serviceable: typeof serviceable === 'boolean' ? serviceable : false
    });
    
    await newPincode.save();
    
    console.log(`✅ Pincode added by admin ${req.admin.name}: ${newPincode.pincode} - ${newPincode.areaname}`);
    
    res.json({
      success: true,
      message: 'Pincode added successfully.',
      data: newPincode
    });
    
  } catch (error) {
    console.error('Add pincode error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate pincode entry detected.' 
      });
    } else {
      res.status(500).json({ error: 'Failed to add pincode.' });
    }
  }
});

// Update pincode by ID
router.put('/pincodes/:id', authenticateAdmin, async (req, res) => {
  try {
    const updateBody = { ...req.body };
    if (typeof updateBody.pincode !== 'undefined') {
      updateBody.pincode = parseInt(updateBody.pincode);
    }
    if (typeof updateBody.areaname === 'string') updateBody.areaname = updateBody.areaname.trim();
    if (typeof updateBody.cityname === 'string') updateBody.cityname = updateBody.cityname.trim();
    if (typeof updateBody.districtname === 'string' || typeof updateBody.distrcitname === 'string') {
      updateBody.distrcitname = (updateBody.districtname || updateBody.distrcitname).trim();
      delete updateBody.districtname;
    }
    if (typeof updateBody.statename === 'string') updateBody.statename = updateBody.statename.trim();

    const updatedPincode = await PinCodeArea.findByIdAndUpdate(
      req.params.id,
      updateBody,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedPincode) {
      return res.status(404).json({ 
        error: 'Pincode not found.' 
      });
    }
    
    console.log(`✅ Pincode updated by admin ${req.admin.name}: ${updatedPincode.pincode} - ${updatedPincode.areaname}`);
    
    res.json({
      success: true,
      message: 'Pincode updated successfully.',
      data: updatedPincode
    });
    
  } catch (error) {
    console.error('Update pincode error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pincode ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to update pincode.' });
    }
  }
});

// Delete pincode by ID
router.delete('/pincodes/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedPincode = await PinCodeArea.findByIdAndDelete(req.params.id);
    
    if (!deletedPincode) {
      return res.status(404).json({ 
        error: 'Pincode not found.' 
      });
    }
    
    console.log(`🗑️ Pincode deleted by admin ${req.admin.name}: ${deletedPincode.pincode} - ${deletedPincode.areaname}`);
    
    res.json({
      success: true,
      message: 'Pincode deleted successfully.',
      deletedData: {
        id: deletedPincode._id,
        pincode: deletedPincode.pincode,
        areaname: deletedPincode.areaname
      }
    });
    
  } catch (error) {
    console.error('Delete pincode error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pincode ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to delete pincode.' });
    }
  }
});

// ADMIN MANAGEMENT ROUTES (Super Admin Only)

// Get all admins
router.get('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
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
          { name: searchRegex },
          { email: searchRegex }
        ]
      };
    }
    
    const admins = await Admin.find(query)
      .populate('assignedBy', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await Admin.countDocuments(query);
    
    res.json({
      success: true,
      data: admins,
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
    console.error('Get admins error:', error);
    res.status(500).json({ 
      error: 'Failed to get admins.' 
    });
  }
});

// Create new admin (assign admin role to office user)
router.post('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, permissions, canAssignPermissions } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required.'
      });
    }
    
    // Find the office user
    const officeUser = await OfficeUser.findById(userId);
    if (!officeUser) {
      return res.status(404).json({
        error: 'Office user not found.'
      });
    }
    
    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ email: officeUser.email });
    if (existingAdmin) {
      return res.status(409).json({
        error: 'This user is already an admin.'
      });
    }
    
    // Create new admin
    const newAdmin = new Admin({
      email: officeUser.email,
      password: officeUser.password, // Use existing password
      name: officeUser.name,
      role: 'admin',
      permissions: {
        dashboard: true, // Always true - default permission
        userManagement: permissions?.userManagement || false,
        pincodeManagement: permissions?.pincodeManagement || false,
        addressForms: permissions?.addressForms || false,
        reports: true, // Always true - default permission
        settings: true // Always true - default permission
      },
      canAssignPermissions: canAssignPermissions || false,
      assignedBy: req.admin._id
    });
    
    await newAdmin.save();
    
    console.log(`✅ Admin role assigned by super admin ${req.admin.name}: ${newAdmin.name} (${newAdmin.email})`);
    
    res.json({
      success: true,
      message: 'Admin role assigned successfully.',
      data: newAdmin
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Admin with this email already exists.' 
      });
    } else {
      res.status(500).json({ error: 'Failed to assign admin role.' });
    }
  }
});

// Update admin permissions
router.put('/admins/:id/permissions', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { permissions, canAssignPermissions } = req.body;
    const adminId = req.params.id;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        error: 'Permissions object is required.'
      });
    }
    
    // Ensure dashboard, reports, and settings are always true
    const updatedPermissions = {
      ...permissions,
      dashboard: true, // Always true - default permission
      reports: true, // Always true - default permission
      settings: true // Always true - default permission
    };
    
    const updateData = { permissions: updatedPermissions };
    if (typeof canAssignPermissions === 'boolean') {
      updateData.canAssignPermissions = canAssignPermissions;
    }
    
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found.'
      });
    }
    
    console.log(`✅ Admin permissions updated by super admin ${req.admin.name}: ${admin.name} (${admin.email})`);
    
    res.json({
      success: true,
      message: 'Admin permissions updated successfully.',
      data: admin
    });
    
  } catch (error) {
    console.error('Update admin permissions error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid admin ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to update admin permissions.' 
      });
    }
  }
});

// Remove admin role (convert back to office user)
router.delete('/admins/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found.'
      });
    }
    
    // Don't allow deleting super admin
    if (admin.role === 'super_admin') {
      return res.status(403).json({
        error: 'Cannot remove super admin role.'
      });
    }
    
    // Delete the admin record
    await Admin.findByIdAndDelete(req.params.id);
    
    console.log(`🗑️ Admin role removed by super admin ${req.admin.name}: ${admin.name} (${admin.email})`);
    
    res.json({
      success: true,
      message: 'Admin role removed successfully.',
      deletedData: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
    
  } catch (error) {
    console.error('Remove admin role error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid admin ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to remove admin role.' 
      });
    }
  }
});

// OFFICE USER MANAGEMENT ROUTES

// Get all office users
router.get('/users', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if admin has user management permission
  if (!req.admin.hasPermission('userManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. User management permission required.' 
    });
  }
  try {
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
          { name: searchRegex },
          { email: searchRegex },
          { department: searchRegex }
        ]
      };
    }
    
    // Get all admin emails to exclude them from office users list
    // Users who have admin privileges should only appear in Admin Management, not User Management
    const Admin = (await import('../models/Admin.js')).default;
    const adminEmails = await Admin.find({ isActive: true }).select('email').lean();
    const adminEmailList = adminEmails.map(admin => admin.email);
    
    // Add exclusion for users who are also admins
    query.email = { $nin: adminEmailList };
    
    const users = await OfficeUser.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await OfficeUser.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
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
    console.error('Get office users error:', error);
    res.status(500).json({ 
      error: 'Failed to get office users.' 
    });
  }
});

// Get single office user by ID
router.get('/users/:id', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if admin has user management permission
  if (!req.admin.hasPermission('userManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. User management permission required.' 
    });
  }
  try {
    const user = await OfficeUser.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Get office user error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid user ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to get user.' });
    }
  }
});

// Update user permissions
router.put('/users/:id/permissions', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if admin has user management permission and can assign permissions
  if (!req.admin.hasPermission('userManagement') || !req.admin.canAssignPermissionsToUsers()) {
    return res.status(403).json({ 
      error: 'Access denied. User management and permission assignment required.' 
    });
  }
  try {
    const { permissions } = req.body;
    const userId = req.params.id;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        error: 'Permissions object is required.'
      });
    }
    
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
    
    console.log(`✅ User permissions updated by admin ${req.admin.name}: ${user.name} (${user.email})`);
    
    res.json({
      success: true,
      message: 'User permissions updated successfully.',
      data: user
    });
    
  } catch (error) {
    console.error('Update user permissions error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid user ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to update user permissions.' 
      });
    }
  }
});

// Update user status (activate/deactivate)
router.put('/users/:id/status', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if admin has user management permission
  if (!req.admin.hasPermission('userManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. User management permission required.' 
    });
  }
  try {
    const { isActive } = req.body;
    const userId = req.params.id;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'isActive must be a boolean value.'
      });
    }
    
    const user = await OfficeUser.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    
    console.log(`✅ User status updated by admin ${req.admin.name}: ${user.name} (${user.email}) - ${isActive ? 'Activated' : 'Deactivated'}`);
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: user
    });
    
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid user ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to update user status.' 
      });
    }
  }
});

// Delete office user
router.delete('/users/:id', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if admin has user management permission
  if (!req.admin.hasPermission('userManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. User management permission required.' 
    });
  }
  try {
    const deletedUser = await OfficeUser.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    
    console.log(`🗑️ Office user deleted by admin ${req.admin.name}: ${deletedUser.name} (${deletedUser.email})`);
    
    res.json({
      success: true,
      message: 'User deleted successfully.',
      deletedData: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    console.error('Delete office user error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid user ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete user.' 
      });
    }
  }
});

export default router;
