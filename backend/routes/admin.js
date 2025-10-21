import express from 'express';
import Admin from '../models/Admin.js';
import OfficeUser from '../models/OfficeUser.js';
import FormData from '../models/FormData.js';
import PinCodeArea from '../models/PinCodeArea.js';
import Coloader from '../models/Coloader.js';
import CorporatePricing from '../models/CorporatePricing.js';
import ConsignmentAssignment, { ConsignmentUsage } from '../models/ConsignmentAssignment.js';
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
    
    // Filter by assignment status if provided (e.g., status=received)
    if (req.query.status) {
      query['assignmentData.status'] = req.query.status;
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

// Get address form by consignment number
router.get('/addressforms/consignment/:consignmentNumber', authenticateAdmin, async (req, res) => {
  // Check permission
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms permission required.' 
    });
  }
  try {
    const consignmentNumber = req.params.consignmentNumber;
    // Try numeric match first, but support string storage too
    const numeric = Number(consignmentNumber);
    const form = await FormData.findOne({
      $or: [
        { consignmentNumber: numeric },
        { consignmentNumber: consignmentNumber }
      ]
    }).lean();
    if (!form) {
      return res.status(404).json({ error: 'Order not found for consignment number.' });
    }
    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Get by consignment error:', error);
    res.status(500).json({ error: 'Failed to fetch order by consignment number.' });
  }
});

// Mark order as received (optionally update weight)
router.post('/mark-order-received', authenticateAdmin, async (req, res) => {
  // Check permission
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms permission required.' 
    });
  }
  try {
    const { orderId, newWeight } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required.' });
    }

    const update = { 'assignmentData.status': 'received' };
    if (newWeight !== undefined && newWeight !== null && !Number.isNaN(Number(newWeight))) {
      update['shipmentData.actualWeight'] = Number(newWeight);
    }

    const updated = await FormData.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Address form not found.' });
    }

    res.json({ success: true, message: 'Order marked as received.', data: updated });
  } catch (error) {
    console.error('Mark order received error:', error);
    res.status(500).json({ error: 'Failed to mark order as received.' });
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
    const { pincode, areaname, cityname, districtname, statename, serviceable, bulkOrder, priority, standard, modes } = req.body;
    
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
    
    // Handle modes field
    if (updateBody.modes) {
      updateBody.modes = {
        byAir: typeof updateBody.modes.byAir === 'boolean' ? updateBody.modes.byAir : false,
        byTrain: typeof updateBody.modes.byTrain === 'boolean' ? updateBody.modes.byTrain : false,
        byRoad: typeof updateBody.modes.byRoad === 'boolean' ? updateBody.modes.byRoad : false
      };
    }

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

// Bulk update pincode bulk order status
router.patch('/pincodes/bulk-order', authenticateAdmin, async (req, res) => {
  try {
    const { pincodeIds, bulkOrder } = req.body;
    
    if (!Array.isArray(pincodeIds) || pincodeIds.length === 0) {
      return res.status(400).json({ 
        error: 'pincodeIds array is required and cannot be empty.' 
      });
    }
    
    if (typeof bulkOrder !== 'boolean') {
      return res.status(400).json({ 
        error: 'bulkOrder must be a boolean value.' 
      });
    }
    
    const result = await PinCodeArea.updateMany(
      { _id: { $in: pincodeIds } },
      { bulkOrder: bulkOrder }
    );
    
    console.log(`✅ Bulk order status updated by admin ${req.admin.name}: ${result.modifiedCount} pincodes`);
    
    res.json({
      success: true,
      message: `Bulk order status updated for ${result.modifiedCount} pincodes.`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Bulk update bulk order error:', error);
    res.status(500).json({ error: 'Failed to update bulk order status.' });
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
        coloaderRegistration: permissions?.coloaderRegistration || false,
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

// ==================== COLOADER MANAGEMENT ROUTES ====================

// Get all coloaders with filtering and pagination (Admin)
router.get('/coloaders', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    const orConditions = [];
    
    // Add search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      orConditions.push(
        { companyName: searchRegex },
        { concernPerson: searchRegex },
        { email: searchRegex },
        { 'companyAddress.state': searchRegex },
        { 'companyAddress.city': searchRegex }
      );
    }
    
    // Add origin filter
    if (req.query.origin) {
      const originRegex = new RegExp(req.query.origin, 'i');
      orConditions.push(
        { 'fromLocations.state': originRegex },
        { 'fromLocations.city': originRegex },
        { 'fromLocations.area': originRegex },
        { 'fromLocations.pincode': originRegex },
        { 'companyAddress.state': originRegex },
        { 'companyAddress.city': originRegex },
        { 'companyAddress.area': originRegex },
        { 'companyAddress.pincode': originRegex }
      );
    }
    
    // Add destination filter
    if (req.query.destination) {
      const destinationRegex = new RegExp(req.query.destination, 'i');
      orConditions.push(
        { 'toLocations.state': destinationRegex },
        { 'toLocations.city': destinationRegex },
        { 'toLocations.area': destinationRegex },
        { 'toLocations.pincode': destinationRegex }
      );
    }
    
    // Apply OR conditions if any exist
    if (orConditions.length > 0) {
      filters.$or = orConditions;
    }
    
    // Add other filters based on query parameters
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.active === 'true') {
      filters.isActive = true;
    } else if (req.query.active === 'false') {
      filters.isActive = false;
    }
    
    if (req.query.state) {
      filters['companyAddress.state'] = new RegExp(req.query.state, 'i');
    }
    
    if (req.query.city) {
      filters['companyAddress.city'] = new RegExp(req.query.city, 'i');
    }
    
    if (req.query.serviceMode) {
      filters.serviceModes = req.query.serviceMode;
    }

    const coloaders = await Coloader.find(filters)
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Coloader.countDocuments(filters);
    
    res.json({ 
      success: true, 
      data: coloaders, 
      count: coloaders.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit
      }
    });
    
  } catch (err) {
    console.error('Error fetching coloader data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update coloader by ID (Admin)
router.put('/coloaders/:id', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { status, rejectionReason, notes, approvedBy, ...coloaderData } = req.body;
    
    const updateData = { ...coloaderData };
    
    // Handle status-specific updates
    if (status) {
      updateData.status = status;
      
      if (status === 'approved') {
        updateData.approvedBy = approvedBy || req.admin._id;
        updateData.approvedAt = new Date();
        updateData.rejectionReason = null;
      } else if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason;
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const updatedColoader = await Coloader.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedColoader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    console.log('Coloader data updated successfully:', updatedColoader.coloaderId);
    res.json({ 
      success: true, 
      data: updatedColoader,
      message: 'Coloader data updated successfully!',
      completionPercentage: updatedColoader.getCompletionPercentage()
    });
    
  } catch (err) {
    console.error('Error updating coloader data:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid coloader ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete coloader by ID (Admin)
router.delete('/coloaders/:id', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const deletedColoader = await Coloader.findByIdAndDelete(req.params.id);
    
    if (!deletedColoader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    console.log('Coloader registration deleted successfully:', deletedColoader.coloaderId);
    res.json({ 
      success: true, 
      message: 'Coloader registration deleted successfully!',
      deletedData: deletedColoader
    });
    
  } catch (err) {
    console.error('Error deleting coloader registration:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid coloader ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ==================== ORDER ASSIGNMENT ROUTES ====================

// Assign coloader to order
router.post('/assign-coloader', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has address forms permission (more appropriate for order management)
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms management permission required.' 
    });
  }
  
  try {
    const { orderId, coloaderId, legNumber = 1, totalLegs = 1, isEditMode = false } = req.body;
    
    // Validate required fields
    if (!orderId || !coloaderId) {
      return res.status(400).json({ 
        error: 'Order ID and Coloader ID are required.'
      });
    }
    
    // Import models
    const FormData = (await import('../models/FormData.js')).default;
    const Coloader = (await import('../models/Coloader.js')).default;
    
    // Check if order exists
    const order = await FormData.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found.' 
      });
    }
    
    // Check if coloader exists
    const coloader = await Coloader.findById(coloaderId);
    if (!coloader) {
      return res.status(404).json({ 
        error: 'Coloader not found.' 
      });
    }
    
    // Check if coloader is active
    if (!coloader.isActive) {
      return res.status(400).json({ 
        error: 'Cannot assign to inactive coloader.' 
      });
    }
    
    // Handle multi-leg assignment
    let updateData = {};
    
    if (totalLegs === 1) {
      // Single leg assignment (original logic)
      updateData = {
        'assignmentData.assignedColoader': coloaderId,
        'assignmentData.assignedColoaderName': coloader.companyName,
        'assignmentData.assignedAt': new Date(),
        'assignmentData.assignedBy': req.admin._id,
        'assignmentData.status': 'assigned'
      };
      
      // If switching from multi-leg to single leg, clear leg assignments
      if (isEditMode) {
        updateData.$unset = {
          'assignmentData.totalLegs': 1,
          'assignmentData.legAssignments': 1
        };
      }
    } else {
      // Multi-leg assignment
      const legAssignment = {
        legNumber: legNumber,
        coloaderId: coloaderId,
        coloaderName: coloader.companyName,
        assignedAt: new Date(),
        assignedBy: req.admin._id
      };
      
      if (isEditMode) {
        // In edit mode, replace the specific leg assignment
        // First, get the current order to check existing assignments
        const currentOrder = await FormData.findById(orderId);
        if (!currentOrder) {
          return res.status(404).json({ error: 'Order not found.' });
        }
        
        // Get existing leg assignments and replace the specific leg
        const existingAssignments = currentOrder.assignmentData?.legAssignments || [];
        const updatedAssignments = existingAssignments.filter(a => a.legNumber !== legNumber);
        updatedAssignments.push(legAssignment);
        
        updateData = {
          $set: {
            'assignmentData.legAssignments': updatedAssignments,
            'assignmentData.totalLegs': totalLegs,
            'assignmentData.assignedBy': req.admin._id,
            'assignmentData.status': legNumber === totalLegs ? 'assigned' : 'partially_assigned'
          }
        };
      } else {
        // Normal assignment flow
        updateData = {
          $push: { 'assignmentData.legAssignments': legAssignment },
          $set: {
            'assignmentData.totalLegs': totalLegs,
            'assignmentData.assignedBy': req.admin._id,
            'assignmentData.status': legNumber === totalLegs ? 'assigned' : 'partially_assigned'
          }
        };
      }
    }
    
    // Update order with assignment data
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const updatedOrder = await FormData.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      console.error('Failed to update order:', orderId);
      return res.status(500).json({ error: 'Failed to update order.' });
    }
    
    console.log(`✅ Order ${orderId} assigned to coloader ${coloader.companyName} by admin ${req.admin.name}`);
    
    res.json({
      success: true,
      message: 'Coloader assigned successfully.',
      data: {
        orderId: updatedOrder._id,
        coloaderName: coloader.companyName,
        assignedAt: updatedOrder.assignmentData.assignedAt,
        status: updatedOrder.assignmentData.status
      }
    });
    
  } catch (error) {
    console.error('Assign coloader error:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to assign coloader.',
        details: error.message
      });
    }
  }
});

// Remove assignment (single leg or specific leg from multi-leg)
router.post('/remove-assignment', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has address forms permission
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms management permission required.' 
    });
  }
  
  try {
    const { orderId, legNumber } = req.body;
    
    // Validate required fields
    if (!orderId || !legNumber) {
      return res.status(400).json({ 
        error: 'Order ID and Leg Number are required.'
      });
    }
    
    // Import models
    const FormData = (await import('../models/FormData.js')).default;
    
    // Check if order exists
    const order = await FormData.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found.' 
      });
    }
    
    let updateData = {};
    
    if (legNumber === 1 && order.assignmentData?.legAssignments?.length === 1) {
      // Remove single leg assignment - clear all assignment data
      updateData = {
        $unset: {
          'assignmentData.assignedColoader': 1,
          'assignmentData.assignedColoaderName': 1,
          'assignmentData.assignedAt': 1,
          'assignmentData.totalLegs': 1,
          'assignmentData.legAssignments': 1,
          'assignmentData.status': 1
        },
        $set: {
          'assignmentData.status': 'booked'
        }
      };
    } else {
      // Remove specific leg from multi-leg assignment
      updateData = {
        $pull: { 'assignmentData.legAssignments': { legNumber: legNumber } },
        $set: {
          'assignmentData.status': order.assignmentData.legAssignments.length <= 1 ? 'booked' : 'partially_assigned'
        }
      };
    }
    
    // Update order
    const updatedOrder = await FormData.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Assignment removed from order ${orderId} by admin ${req.admin.name}`);
    
    res.json({
      success: true,
      message: 'Assignment removed successfully.',
      data: {
        orderId: updatedOrder._id,
        remainingAssignments: updatedOrder.assignmentData?.legAssignments?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Remove assignment error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to remove assignment.' });
    }
  }
});

// Clear all assignments for an order
router.post('/clear-all-assignments', authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has address forms permission
  if (!req.admin.hasPermission('addressForms')) {
    return res.status(403).json({ 
      error: 'Access denied. Address forms management permission required.' 
    });
  }
  
  try {
    const { orderId } = req.body;
    
    // Validate required fields
    if (!orderId) {
      return res.status(400).json({ 
        error: 'Order ID is required.'
      });
    }
    
    // Import models
    const FormData = (await import('../models/FormData.js')).default;
    
    // Check if order exists
    const order = await FormData.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found.' 
      });
    }
    
    // Clear all assignment data
    const updateData = {
      $unset: {
        'assignmentData.assignedColoader': 1,
        'assignmentData.assignedColoaderName': 1,
        'assignmentData.assignedAt': 1,
        'assignmentData.totalLegs': 1,
        'assignmentData.legAssignments': 1
      },
      $set: {
        'assignmentData.status': 'booked'
      }
    };
    
    // Update order
    const updatedOrder = await FormData.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log(`✅ All assignments cleared from order ${orderId} by admin ${req.admin.name}`);
    
    res.json({
      success: true,
      message: 'All assignments cleared successfully.',
      data: {
        orderId: updatedOrder._id,
        status: updatedOrder.assignmentData?.status
      }
    });
    
  } catch (error) {
    console.error('Clear all assignments error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to clear assignments.' });
    }
  }
});

// ==================== CORPORATE PRICING MANAGEMENT ROUTES ====================

// Test route to verify the endpoint is working
router.get('/corporate-pricing-test', authenticateAdmin, async (req, res) => {
  try {
    console.log('Corporate pricing test endpoint hit');
    res.json({
      success: true,
      message: 'Corporate pricing endpoint is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

// Create new corporate pricing
router.post('/corporate-pricing', authenticateAdmin, async (req, res) => {
  try {
    const { 
      name, 
      doxPricing, 
      nonDoxSurfacePricing, 
      nonDoxAirPricing, 
      priorityPricing, 
      reversePricing,
      fuelChargePercentage,
      clientEmail,
      clientName,
      clientCompany,
      sendEmailApproval
    } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Pricing name is required.' 
      });
    }
    
    // Check if pricing name already exists
    const existingPricing = await CorporatePricing.findOne({ 
      name: name.trim(),
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingPricing) {
      return res.status(409).json({ 
        error: 'A pricing list with this name already exists.' 
      });
    }
    
    const newPricing = new CorporatePricing({
      name: name.trim(),
      doxPricing: doxPricing || {},
      nonDoxSurfacePricing: nonDoxSurfacePricing || {},
      nonDoxAirPricing: nonDoxAirPricing || {},
      priorityPricing: priorityPricing || {},
      reversePricing: reversePricing || {},
      fuelChargePercentage: fuelChargePercentage || 15,
      clientEmail: clientEmail || null,
      clientName: clientName || null,
      clientCompany: clientCompany || null,
      createdBy: req.admin._id,
      status: 'pending'
    });
    
    await newPricing.save();
    
    // Send email approval if requested and email is provided
    let emailResult = null;
    if (sendEmailApproval && clientEmail) {
      try {
        console.log('📧 Attempting to send pricing approval email...');
        
        // Import email service with error handling
        let emailService;
        try {
          emailService = (await import('../services/emailService.js')).default;
        } catch (importError) {
          console.error('❌ Failed to import email service:', importError);
          throw new Error('Email service not available');
        }
        
        // Generate approval token
        const approvalToken = newPricing.generateApprovalToken();
        await newPricing.save();
        
        // Generate approval URLs
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const approvalUrl = `${baseUrl}/pricing-approval/${approvalToken}/approve`;
        const rejectionUrl = `${baseUrl}/pricing-approval/${approvalToken}/reject`;
        
        console.log('📧 Sending email to:', clientEmail);
        
        // Send email
        emailResult = await emailService.sendPricingApprovalEmail(
          newPricing.toObject(), 
          approvalUrl, 
          rejectionUrl
        );
        
        // Mark email as sent
        await newPricing.markEmailSent();
        
        console.log(`✅ Pricing approval email sent to ${clientEmail} for pricing: ${newPricing.name}`);
      } catch (emailError) {
        console.error('❌ Failed to send pricing approval email:', emailError);
        console.error('❌ Email error details:', emailError.message);
        console.error('❌ Email error stack:', emailError.stack);
        
        // Don't fail the entire request if email fails
        emailResult = { 
          error: emailError.message,
          success: false 
        };
        
        // Still log the pricing creation as successful
        console.log(`⚠️ Pricing created successfully but email failed: ${newPricing.name}`);
      }
    }
    
    console.log(`✅ Corporate pricing created by admin ${req.admin.name}: ${newPricing.name}`);
    
    res.json({
      success: true,
      message: sendEmailApproval && clientEmail 
        ? 'Corporate pricing created and approval email sent successfully!'
        : 'Corporate pricing created successfully. It will be sent to corporate clients for approval.',
      data: newPricing,
      emailResult: emailResult
    });
    
  } catch (error) {
    console.error('Create corporate pricing error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({ error: 'Failed to create corporate pricing.' });
    }
  }
});

// Get all corporate pricing with pagination and search
router.get('/corporate-pricing', authenticateAdmin, async (req, res) => {
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
          { name: searchRegex }
        ]
      };
    }
    
    // Add status filter
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // If requesting approved pricing for registration, exclude already assigned ones
    if (req.query.status === 'approved' && req.query.excludeAssigned === 'true') {
      query.corporateClient = null;
      console.log('🔍 Filtering for unassigned approved pricing:', query);
    }
    
    const pricing = await CorporatePricing.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('corporateClient', 'companyName corporateId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await CorporatePricing.countDocuments(query);
    
    // Debug logging for unassigned pricing requests
    if (req.query.status === 'approved' && req.query.excludeAssigned === 'true') {
      console.log(`📊 Found ${pricing.length} unassigned approved pricing records out of ${totalCount} total`);
      pricing.forEach(p => console.log(`  - ${p.name} (ID: ${p._id})`));
    }
    
    res.json({
      success: true,
      data: pricing,
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
    console.error('Get corporate pricing error:', error);
    res.status(500).json({ 
      error: 'Failed to get corporate pricing.' 
    });
  }
});

// Get single corporate pricing by ID
router.get('/corporate-pricing/:id', authenticateAdmin, async (req, res) => {
  try {
    const pricing = await CorporatePricing.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('corporateClient', 'companyName corporateId')
      .lean();
    
    if (!pricing) {
      return res.status(404).json({ 
        error: 'Corporate pricing not found.' 
      });
    }
    
    res.json({
      success: true,
      data: pricing
    });
    
  } catch (error) {
    console.error('Get corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to get corporate pricing.' });
    }
  }
});

// Update corporate pricing by ID
router.put('/corporate-pricing/:id', authenticateAdmin, async (req, res) => {
  try {
    const { 
      name, 
      doxPricing, 
      nonDoxSurfacePricing, 
      nonDoxAirPricing, 
      priorityPricing, 
      reversePricing,
      fuelChargePercentage,
      notes 
    } = req.body;
    
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (doxPricing !== undefined) updateData.doxPricing = doxPricing;
    if (nonDoxSurfacePricing !== undefined) updateData.nonDoxSurfacePricing = nonDoxSurfacePricing;
    if (nonDoxAirPricing !== undefined) updateData.nonDoxAirPricing = nonDoxAirPricing;
    if (priorityPricing !== undefined) updateData.priorityPricing = priorityPricing;
    if (reversePricing !== undefined) updateData.reversePricing = reversePricing;
    if (fuelChargePercentage !== undefined) updateData.fuelChargePercentage = fuelChargePercentage;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedPricing = await CorporatePricing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('createdBy', 'name email')
     .populate('approvedBy', 'name email')
     .populate('corporateClient', 'companyName corporateId');
    
    if (!updatedPricing) {
      return res.status(404).json({ 
        error: 'Corporate pricing not found.' 
      });
    }
    
    console.log(`✅ Corporate pricing updated by admin ${req.admin.name}: ${updatedPricing.name}`);
    
    res.json({
      success: true,
      message: 'Corporate pricing updated successfully.',
      data: updatedPricing
    });
    
  } catch (error) {
    console.error('Update corporate pricing error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to update corporate pricing.' });
    }
  }
});

// Approve corporate pricing
router.patch('/corporate-pricing/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const pricing = await CorporatePricing.findById(req.params.id);
    
    if (!pricing) {
      return res.status(404).json({
        error: 'Corporate pricing not found.'
      });
    }
    
    if (pricing.status === 'approved') {
      return res.status(400).json({
        error: 'This pricing is already approved.'
      });
    }
    
    await pricing.approve(req.admin._id);
    
    console.log(`✅ Corporate pricing approved by admin ${req.admin.name}: ${pricing.name}`);
    
    res.json({
      success: true,
      message: 'Corporate pricing approved successfully.',
      data: pricing
    });
    
  } catch (error) {
    console.error('Approve corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to approve corporate pricing.' });
    }
  }
});

// Reject corporate pricing
router.patch('/corporate-pricing/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const pricing = await CorporatePricing.findById(req.params.id);
    
    if (!pricing) {
      return res.status(404).json({
        error: 'Corporate pricing not found.'
      });
    }
    
    if (pricing.status === 'rejected') {
      return res.status(400).json({
        error: 'This pricing is already rejected.'
      });
    }
    
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        error: 'Rejection reason is required.'
      });
    }
    
    await pricing.reject(rejectionReason.trim());
    
    console.log(`❌ Corporate pricing rejected by admin ${req.admin.name}: ${pricing.name}`);
    
    res.json({
      success: true,
      message: 'Corporate pricing rejected successfully.',
      data: pricing
    });
    
  } catch (error) {
    console.error('Reject corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to reject corporate pricing.' });
    }
  }
});

// Connect corporate pricing to corporate client
router.patch('/corporate-pricing/:id/connect', authenticateAdmin, async (req, res) => {
  try {
    const { corporateClientId } = req.body;
    console.log(`🔗 Connecting pricing ${req.params.id} to corporate client ${corporateClientId}`);
    
    if (!corporateClientId) {
      return res.status(400).json({
        error: 'Corporate client ID is required.'
      });
    }
    
    const pricing = await CorporatePricing.findById(req.params.id);
    
    if (!pricing) {
      console.log(`❌ Pricing not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Corporate pricing not found.'
      });
    }
    
    console.log(`📋 Found pricing: ${pricing.name}, status: ${pricing.status}`);
    
    if (pricing.status !== 'approved') {
      console.log(`❌ Pricing not approved: ${pricing.status}`);
      return res.status(400).json({
        error: `Only approved pricing can be connected to corporate clients. Current status: ${pricing.status}`
      });
    }
    
    // Import CorporateData model
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const corporateClient = await CorporateData.findByCorporateId(corporateClientId);
    
    if (!corporateClient) {
      console.log(`❌ Corporate client not found: ${corporateClientId}`);
      return res.status(404).json({
        error: `Corporate client with ID ${corporateClientId} not found.`
      });
    }
    
    console.log(`🏢 Found corporate client: ${corporateClient.companyName} (${corporateClient.corporateId})`);
    
    await pricing.connectToCorporate(corporateClient._id);
    
    console.log(`✅ Corporate pricing connected to client by admin ${req.admin.name}: ${pricing.name} -> ${corporateClient.companyName}`);
    
    res.json({
      success: true,
      message: 'Corporate pricing connected to client successfully.',
      data: {
        pricing: pricing,
        corporate: {
          id: corporateClient._id,
          corporateId: corporateClient.corporateId,
          companyName: corporateClient.companyName
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Connect corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: `Failed to connect corporate pricing: ${error.message}` });
    }
  }
});

// Get corporate client with assigned pricing plan
router.get('/corporate/:id/pricing', authenticateAdmin, async (req, res) => {
  try {
    console.log(`🔍 Fetching pricing for corporate client: ${req.params.id}`);
    
    const CorporateData = (await import('../models/CorporateData.js')).default;
    const corporateClient = await CorporateData.findById(req.params.id);
    
    if (!corporateClient) {
      console.log(`❌ Corporate client not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Corporate client not found.'
      });
    }
    
    console.log(`🏢 Found corporate client: ${corporateClient.companyName} (${corporateClient.corporateId})`);
    
    // Find the pricing plan assigned to this corporate client
    const assignedPricing = await CorporatePricing.findOne({ 
      corporateClient: req.params.id,
      status: 'approved'
    })
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .lean();
    
    console.log(`📋 Assigned pricing found:`, assignedPricing ? `${assignedPricing.name} (${assignedPricing.status})` : 'None');
    
    // Also check if there are any pricing plans connected to this client (regardless of status)
    const allConnectedPricing = await CorporatePricing.find({ 
      corporateClient: req.params.id
    }).select('name status').lean();
    
    console.log(`📊 All connected pricing plans:`, allConnectedPricing.map(p => `${p.name} (${p.status})`));
    
    res.json({
      success: true,
      data: {
        corporate: corporateClient,
        assignedPricing: assignedPricing
      }
    });
    
  } catch (error) {
    console.error('❌ Get corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid corporate ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to get corporate pricing.' });
    }
  }
});

// Public endpoint to get pricing by approval token (for email approval page)
router.get('/public/pricing-approval/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const pricing = await CorporatePricing.findByApprovalToken(token)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired approval link.'
      });
    }
    
    // Check if already processed
    if (pricing.emailApprovedAt || pricing.emailRejectedAt) {
      return res.status(400).json({
        success: false,
        error: 'This pricing proposal has already been processed.',
        status: pricing.status,
        processedAt: pricing.emailApprovedAt || pricing.emailRejectedAt
      });
    }
    
    res.json({
      success: true,
      data: pricing
    });
    
  } catch (error) {
    console.error('Get pricing by token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pricing information.'
    });
  }
});

// Public endpoint to approve pricing via email
router.post('/public/pricing-approval/:token/approve', async (req, res) => {
  try {
    const { token } = req.params;
    const { approvedBy } = req.body;
    
    const pricing = await CorporatePricing.findByApprovalToken(token);
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired approval link.'
      });
    }
    
    // Check if already processed
    if (pricing.emailApprovedAt || pricing.emailRejectedAt) {
      return res.status(400).json({
        success: false,
        error: 'This pricing proposal has already been processed.',
        status: pricing.status
      });
    }
    
    // Approve the pricing
    await pricing.approveViaEmail(approvedBy || pricing.clientName || 'Email Approval');
    
    // Send confirmation email
    try {
      const emailService = (await import('../services/emailService.js')).default;
      await emailService.sendApprovalConfirmationEmail(pricing.toObject(), 'approved');
    } catch (emailError) {
      console.error('Failed to send approval confirmation email:', emailError);
    }
    
    console.log(`✅ Pricing approved via email: ${pricing.name} by ${approvedBy || 'Unknown'}`);
    
    res.json({
      success: true,
      message: 'Pricing proposal approved successfully!',
      data: {
        name: pricing.name,
        status: pricing.status,
        approvedAt: pricing.emailApprovedAt
      }
    });
    
  } catch (error) {
    console.error('Approve pricing via email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve pricing proposal.'
    });
  }
});

// Public endpoint to reject pricing via email
router.post('/public/pricing-approval/:token/reject', async (req, res) => {
  try {
    const { token } = req.params;
    const { rejectionReason, rejectedBy } = req.body;
    
    const pricing = await CorporatePricing.findByApprovalToken(token);
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired approval link.'
      });
    }
    
    // Check if already processed
    if (pricing.emailApprovedAt || pricing.emailRejectedAt) {
      return res.status(400).json({
        success: false,
        error: 'This pricing proposal has already been processed.',
        status: pricing.status
      });
    }
    
    // Reject the pricing
    await pricing.rejectViaEmail(
      rejectionReason || 'Rejected via email approval', 
      rejectedBy || pricing.clientName || 'Email Rejection'
    );
    
    // Send confirmation email
    try {
      const emailService = (await import('../services/emailService.js')).default;
      await emailService.sendApprovalConfirmationEmail(pricing.toObject(), 'rejected');
    } catch (emailError) {
      console.error('Failed to send rejection confirmation email:', emailError);
    }
    
    console.log(`❌ Pricing rejected via email: ${pricing.name} by ${rejectedBy || 'Unknown'}`);
    
    res.json({
      success: true,
      message: 'Pricing proposal rejected successfully.',
      data: {
        name: pricing.name,
        status: pricing.status,
        rejectedAt: pricing.emailRejectedAt,
        rejectionReason: pricing.emailRejectionReason
      }
    });
    
  } catch (error) {
    console.error('Reject pricing via email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject pricing proposal.'
    });
  }
});

// Send pricing approval email for existing pricing
router.post('/corporate-pricing/:id/send-approval-email', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { clientEmail, clientName, clientCompany } = req.body;
    
    const pricing = await CorporatePricing.findById(id);
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Corporate pricing not found.'
      });
    }
    
    if (pricing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending pricing can be sent for email approval.'
      });
    }
    
    // Update client information if provided
    if (clientEmail) pricing.clientEmail = clientEmail;
    if (clientName) pricing.clientName = clientName;
    if (clientCompany) pricing.clientCompany = clientCompany;
    
    // Generate approval token
    const approvalToken = pricing.generateApprovalToken();
    await pricing.save();
    
    // Generate approval URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const approvalUrl = `${baseUrl}/pricing-approval/${approvalToken}/approve`;
    const rejectionUrl = `${baseUrl}/pricing-approval/${approvalToken}/reject`;
    
    // Send email
    const emailService = (await import('../services/emailService.js')).default;
    const emailResult = await emailService.sendPricingApprovalEmail(
      pricing.toObject(), 
      approvalUrl, 
      rejectionUrl
    );
    
    // Mark email as sent
    await pricing.markEmailSent();
    
    console.log(`📧 Pricing approval email sent to ${pricing.clientEmail} for pricing: ${pricing.name}`);
    
    res.json({
      success: true,
      message: 'Approval email sent successfully!',
      data: pricing,
      emailResult: emailResult
    });
    
  } catch (error) {
    console.error('Send approval email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send approval email.'
    });
  }
});

// Google OAuth setup endpoints for email service
router.get('/email/oauth/setup', authenticateAdmin, async (req, res) => {
  try {
    const emailService = (await import('../services/emailService.js')).default;
    const authUrl = emailService.generateAuthUrl();
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Visit this URL to authorize Gmail access. After authorization, you will receive a code to complete the setup.'
    });
  } catch (error) {
    console.error('OAuth setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate OAuth URL'
    });
  }
});

router.post('/email/oauth/complete', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }
    
    const emailService = (await import('../services/emailService.js')).default;
    const tokens = await emailService.getTokensFromCode(code);
    
    res.json({
      success: true,
      message: 'Gmail OAuth setup completed successfully!',
      refreshToken: tokens.refresh_token,
      instructions: 'Add the refresh token to your .env file as GOOGLE_REFRESH_TOKEN'
    });
  } catch (error) {
    console.error('OAuth completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete OAuth setup: ' + error.message
    });
  }
});

router.get('/email/test', authenticateAdmin, async (req, res) => {
  try {
    console.log('🧪 Testing email service...');
    
    // Test email service import
    let emailService;
    try {
      emailService = (await import('../services/emailService.js')).default;
      console.log('✅ Email service imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import email service:', importError);
      return res.status(500).json({
        success: false,
        error: 'Failed to import email service: ' + importError.message
      });
    }
    
    // Test connection
    const isConnected = await emailService.testConnection();
    
    res.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Email service is working correctly' : 'Email service connection failed',
      details: {
        hasTransporter: !!emailService.transporter,
        hasOAuthClient: !!emailService.oauth2Client,
        isInitialized: emailService.isInitialized
      }
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      error: 'Email service test failed: ' + error.message,
      stack: error.stack
    });
  }
});

// Delete corporate pricing by ID
router.delete('/corporate-pricing/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedPricing = await CorporatePricing.findByIdAndDelete(req.params.id);
    
    if (!deletedPricing) {
      return res.status(404).json({ 
        error: 'Corporate pricing not found.' 
      });
    }
    
    console.log(`🗑️ Corporate pricing deleted by admin ${req.admin.name}: ${deletedPricing.name}`);
    
    res.json({
      success: true,
      message: 'Corporate pricing deleted successfully.',
      deletedData: {
        id: deletedPricing._id,
        name: deletedPricing.name
      }
    });
    
  } catch (error) {
    console.error('Delete corporate pricing error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid pricing ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to delete corporate pricing.' });
    }
  }
});

// ==================== CONSIGNMENT MANAGEMENT ROUTES ====================

// Get all corporate companies for consignment assignment
router.get('/consignment/corporates', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
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
    const assignments = await ConsignmentAssignment.find({
      corporateId: { $in: corporateIds },
      isActive: true
    }).lean();
    
    // Map assignments to corporates (now supporting multiple assignments per corporate)
    const assignmentMap = {};
    assignments.forEach(assignment => {
      if (!assignmentMap[assignment.corporateId.toString()]) {
        assignmentMap[assignment.corporateId.toString()] = [];
      }
      assignmentMap[assignment.corporateId.toString()].push(assignment);
    });
    
    const corporatesWithAssignments = corporates.map(corporate => ({
      ...corporate,
      consignmentAssignments: assignmentMap[corporate._id.toString()] || [],
      hasAssignments: (assignmentMap[corporate._id.toString()] || []).length > 0
    }));
    
    res.json({
      success: true,
      data: corporatesWithAssignments,
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
    console.error('Get corporates for consignment error:', error);
    res.status(500).json({ 
      error: 'Failed to get corporate companies.' 
    });
  }
});

// Assign consignment numbers to corporate
router.post('/consignment/assign', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const { corporateId, startNumber, endNumber, notes } = req.body;
    
    // Validate required fields
    if (!corporateId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Corporate ID, start number, and end number are required.' 
      });
    }
    
    // Validate range
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
    
    // Note: Removed the restriction that prevents multiple assignments per corporate
    // Now corporates can have multiple consignment number ranges assigned
    
    // Check if range is available
    const isAvailable = await ConsignmentAssignment.isRangeAvailable(
      parseInt(startNumber), 
      parseInt(endNumber)
    );
    
    if (!isAvailable) {
      return res.status(409).json({ 
        error: 'The specified number range is already assigned to another corporate company.' 
      });
    }
    
    // Create assignment
    const assignment = new ConsignmentAssignment({
      corporateId: corporateId,
      companyName: corporate.companyName,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
      totalNumbers: parseInt(endNumber) - parseInt(startNumber) + 1,
      assignedBy: req.admin._id,
      notes: notes || ''
    });
    
    await assignment.save();
    
    console.log(`✅ Consignment numbers assigned by admin ${req.admin.name}: ${corporate.companyName} (${startNumber}-${endNumber})`);
    
    res.json({
      success: true,
      message: 'Consignment numbers assigned successfully.',
      data: assignment
    });
    
  } catch (error) {
    console.error('Assign consignment numbers error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to assign consignment numbers.' });
    }
  }
});

// Get all consignment assignments
router.get('/consignment/assignments', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { companyName: searchRegex },
          { assignedToName: searchRegex }
        ]
      };
    }
    
    // Add assignmentType filter if provided
    if (req.query.assignmentType) {
      query.assignmentType = req.query.assignmentType;
    }
    
    const assignments = await ConsignmentAssignment.find(query)
      .populate('corporateId', 'corporateId companyName email contactNumber')
      .populate('officeUserId', 'name email role department')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await ConsignmentAssignment.countDocuments(query);
    
    // Get usage statistics for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        if (assignment.assignmentType === 'office_user') {
          // Handle office user assignments
          if (!assignment.officeUserId || !assignment.officeUserId._id) {
            return {
              ...assignment,
              usedCount: 0,
              availableCount: assignment.totalNumbers,
              usagePercentage: 0,
              officeUserInfo: {
                name: assignment.assignedToName || 'Unknown User',
                email: assignment.assignedToEmail || 'N/A',
                role: 'N/A',
                department: 'N/A'
              }
            };
          }

          // Count usage within this specific assignment range for office user
          const usedCountInRange = await ConsignmentUsage.countDocuments({
            assignmentType: 'office_user',
            officeUserId: assignment.officeUserId._id,
            consignmentNumber: { 
              $gte: assignment.startNumber, 
              $lte: assignment.endNumber 
            }
          });
          
          return {
            ...assignment,
            usedCount: usedCountInRange,
            availableCount: assignment.totalNumbers - usedCountInRange,
            usagePercentage: Math.round((usedCountInRange / assignment.totalNumbers) * 100),
            officeUserInfo: {
              name: assignment.officeUserId.name,
              email: assignment.officeUserId.email,
              role: assignment.officeUserId.role,
              department: assignment.officeUserId.department
            }
          };
        } else {
          // Handle corporate assignments (existing logic)
          if (!assignment.corporateId || !assignment.corporateId._id) {
            return {
              ...assignment,
              usedCount: 0,
              availableCount: assignment.totalNumbers,
              usagePercentage: 0,
              corporateInfo: {
                corporateId: 'N/A',
                companyName: assignment.companyName || 'Unknown Company',
                email: 'N/A',
                contactNumber: 'N/A'
              }
            };
          }

          // Count usage within this specific assignment range
          const usedCountInRange = await ConsignmentUsage.countDocuments({
            assignmentType: 'corporate',
            corporateId: assignment.corporateId._id,
            consignmentNumber: { 
              $gte: assignment.startNumber, 
              $lte: assignment.endNumber 
            }
          });
          
          // Get total usage across all assignments for this corporate
          const totalUsedForCorporate = await ConsignmentUsage.countDocuments({
            assignmentType: 'corporate',
            corporateId: assignment.corporateId._id
          });
          
          // Get total assigned across all assignments for this corporate
          const allAssignmentsForCorporate = await ConsignmentAssignment.find({
            assignmentType: 'corporate',
            corporateId: assignment.corporateId._id,
            isActive: true
          });
          const totalAssignedForCorporate = allAssignmentsForCorporate.reduce(
            (sum, assign) => sum + assign.totalNumbers, 0
          );
          
          return {
            ...assignment,
            usedCount: usedCountInRange,
            availableCount: assignment.totalNumbers - usedCountInRange,
            usagePercentage: Math.round((usedCountInRange / assignment.totalNumbers) * 100),
            corporateTotalUsed: totalUsedForCorporate,
            corporateTotalAssigned: totalAssignedForCorporate,
            corporateUsagePercentage: totalAssignedForCorporate > 0 ? Math.round((totalUsedForCorporate / totalAssignedForCorporate) * 100) : 0,
            corporateInfo: {
              corporateId: assignment.corporateId.corporateId,
              companyName: assignment.corporateId.companyName,
              email: assignment.corporateId.email,
              contactNumber: assignment.corporateId.contactNumber
            }
          };
        }
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

// Clean up orphaned consignment assignments
router.get('/consignment/cleanup', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    // Find assignments with null or invalid corporateId references
    const orphanedAssignments = await ConsignmentAssignment.find({
      $or: [
        { corporateId: null },
        { corporateId: { $exists: false } }
      ]
    }).populate('corporateId');

    // Find assignments where corporateId doesn't exist in CorporateData
    const assignmentsWithInvalidRefs = await ConsignmentAssignment.find({
      corporateId: { $ne: null }
    }).populate('corporateId');

    const invalidRefs = assignmentsWithInvalidRefs.filter(assignment => 
      !assignment.corporateId || !assignment.corporateId._id
    );

    const allOrphaned = [...orphanedAssignments, ...invalidRefs];

    res.json({
      success: true,
      data: {
        orphanedCount: allOrphaned.length,
        orphanedAssignments: allOrphaned.map(assignment => ({
          _id: assignment._id,
          companyName: assignment.companyName,
          startNumber: assignment.startNumber,
          endNumber: assignment.endNumber,
          totalNumbers: assignment.totalNumbers,
          assignedAt: assignment.assignedAt,
          isActive: assignment.isActive,
          corporateId: assignment.corporateId,
          issue: !assignment.corporateId ? 'Null corporateId' : 'Invalid corporateId reference'
        }))
      },
      message: `Found ${allOrphaned.length} orphaned consignment assignments`
    });

  } catch (error) {
    console.error('Cleanup consignment assignments error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup consignment assignments.' 
    });
  }
});

// Debug endpoint to check consignment usage data
router.get('/consignment/debug', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 Debug: Checking ConsignmentUsage data...');
    
    // Check if there's any usage data
    const usageCount = await ConsignmentUsage.countDocuments();
    console.log('📊 Total ConsignmentUsage records:', usageCount);
    
    let usageData = [];
    if (usageCount > 0) {
      usageData = await ConsignmentUsage.find().lean();
      console.log('📋 Found usage records:', usageData.length);
    }
    
    // Check assignments
    const assignmentCount = await ConsignmentAssignment.countDocuments();
    console.log('📊 Total ConsignmentAssignment records:', assignmentCount);
    
    let assignments = [];
    if (assignmentCount > 0) {
      assignments = await ConsignmentAssignment.find().populate('corporateId').lean();
      console.log('📋 Found assignments:', assignments.length);
    }
    
    res.json({
      success: true,
      data: {
        usageCount,
        usageData: usageData.map(usage => ({
          _id: usage._id,
          corporateId: usage.corporateId,
          consignmentNumber: usage.consignmentNumber,
          bookingReference: usage.bookingReference,
          status: usage.status,
          paymentStatus: usage.paymentStatus,
          usedAt: usage.usedAt
        })),
        assignmentCount,
        assignments: assignments.map(assignment => ({
          _id: assignment._id,
          companyName: assignment.companyName,
          corporateId: assignment.corporateId?._id || 'NULL',
          corporateInfo: assignment.corporateId,
          startNumber: assignment.startNumber,
          endNumber: assignment.endNumber,
          totalNumbers: assignment.totalNumbers,
          isActive: assignment.isActive
        }))
      }
    });
    
  } catch (error) {
    console.error('Debug consignment data error:', error);
    res.status(500).json({ 
      error: 'Failed to debug consignment data.' 
    });
  }
});

// Get consignment usage for a specific corporate
router.get('/consignment/usage/:corporateId', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const { corporateId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get assignment details
    const assignment = await ConsignmentAssignment.findOne({
      corporateId: corporateId,
      isActive: true
    }).populate('corporateId', 'corporateId companyName');
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'No consignment assignment found for this corporate company.' 
      });
    }
    
    // Get usage details
    const usage = await ConsignmentUsage.find({
      corporateId: corporateId,
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
      corporateId: corporateId,
      consignmentNumber: { 
        $gte: assignment.startNumber, 
        $lte: assignment.endNumber 
      }
    });
    
    res.json({
      success: true,
      data: {
        assignment: assignment,
        usage: usage,
        statistics: {
          totalAssigned: assignment.totalNumbers,
          totalUsed: totalUsage,
          available: assignment.totalNumbers - totalUsage,
          usagePercentage: Math.round((totalUsage / assignment.totalNumbers) * 100)
        }
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsage / limit),
        totalCount: totalUsage,
        hasNext: page * limit < totalUsage,
        hasPrev: page > 1,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get consignment usage error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid corporate ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to get consignment usage.' });
    }
  }
});

// Get highest assigned consignment number
router.get('/consignment/highest', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
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

// Get next available consignment number for corporate booking
router.get('/consignment/next/:corporateId', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const { corporateId } = req.params;
    
    const nextNumber = await ConsignmentAssignment.getNextConsignmentNumber(corporateId);
    
    res.json({
      success: true,
      data: {
        consignmentNumber: nextNumber,
        corporateId: corporateId
      }
    });
    
  } catch (error) {
    console.error('Get next consignment number error:', error);
    res.status(400).json({ 
      error: error.message 
    });
  }
});

// Record consignment usage (called when booking is completed)
router.post('/consignment/use', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const { corporateId, consignmentNumber, bookingReference, bookingData } = req.body;
    
    // Validate required fields
    if (!corporateId || !consignmentNumber || !bookingReference || !bookingData) {
      return res.status(400).json({ 
        error: 'Corporate ID, consignment number, booking reference, and booking data are required.' 
      });
    }
    
    // Check if number is already used
    const existingUsage = await ConsignmentUsage.findOne({
      corporateId: corporateId,
      consignmentNumber: parseInt(consignmentNumber)
    });
    
    if (existingUsage) {
      return res.status(409).json({ 
        error: 'This consignment number is already in use.' 
      });
    }
    
    // Verify the number is within assigned range
    const assignment = await ConsignmentAssignment.findOne({
      corporateId: corporateId,
      isActive: true,
      startNumber: { $lte: parseInt(consignmentNumber) },
      endNumber: { $gte: parseInt(consignmentNumber) }
    });
    
    if (!assignment) {
      return res.status(400).json({ 
        error: 'This consignment number is not within the assigned range for this corporate company.' 
      });
    }
    
    // Record usage
    const usage = new ConsignmentUsage({
      corporateId: corporateId,
      consignmentNumber: parseInt(consignmentNumber),
      bookingReference: bookingReference,
      bookingData: bookingData
    });
    
    await usage.save();
    
    console.log(`✅ Consignment number ${consignmentNumber} used for booking ${bookingReference} by corporate ${corporateId}`);
    
    res.json({
      success: true,
      message: 'Consignment number usage recorded successfully.',
      data: usage
    });
    
  } catch (error) {
    console.error('Record consignment usage error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to record consignment usage.' });
    }
  }
});

// Get courier requests for admin
router.get('/courier-requests', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const urgency = req.query.urgency;
    
    // Get courier requests from global storage (populated by corporate requests)
    let allRequests = global.courierRequests || [];
    
    // Add some mock data if no real requests exist yet
    if (allRequests.length === 0) {
      allRequests = [
        {
          id: 'CR-1703123456789',
          corporateId: 'CORP001',
          corporateInfo: {
            corporateId: 'CORP001',
            companyName: 'Tech Solutions Pvt Ltd',
            email: 'admin@techsolutions.com',
            contactNumber: '+91 9876543210'
          },
          requestData: {
            pickupAddress: '123 Business Park, Sector 5, Gurgaon, Haryana - 122001',
            contactPerson: 'Rajesh Kumar',
            contactPhone: '+91 9876543210',
            urgency: 'urgent',
            specialInstructions: 'Please call before arriving. Office is on 3rd floor.',
            packageCount: 3
          },
          status: 'pending',
          requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          estimatedResponseTime: '10-15 minutes'
        },
        {
          id: 'CR-1703123456790',
          corporateId: 'CORP002',
          corporateInfo: {
            corporateId: 'CORP002',
            companyName: 'Global Logistics Inc',
            email: 'ops@globallogistics.com',
            contactNumber: '+91 8765432109'
          },
          requestData: {
            pickupAddress: '456 Industrial Area, Phase 2, Noida, UP - 201301',
            contactPerson: 'Priya Sharma',
            contactPhone: '+91 8765432109',
            urgency: 'normal',
            specialInstructions: 'Regular pickup, no special requirements',
            packageCount: 1
          },
          status: 'assigned',
          requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          estimatedResponseTime: '10-15 minutes',
          assignedCourier: {
            name: 'Amit Singh',
            phone: '+91 7654321098',
            id: 'COURIER001'
          },
          assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ];
    }
    
    // Apply filters to requests
    let filteredRequests = allRequests;
    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    if (urgency && urgency !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.requestData.urgency === urgency);
    }
    
    // Apply pagination
    const totalCount = filteredRequests.length;
    const paginatedRequests = filteredRequests.slice(skip, skip + limit);
    
    res.json({
      success: true,
      requests: paginatedRequests,
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

// Update courier request status
router.put('/courier-requests/:requestId/status', authenticateAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, assignedCourier } = req.body;
    
    // Update courier request in global storage
    if (global.courierRequests) {
      const requestIndex = global.courierRequests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        global.courierRequests[requestIndex].status = status;
        if (assignedCourier) {
          global.courierRequests[requestIndex].assignedCourier = assignedCourier;
        }
        if (status === 'assigned' || status === 'in_progress') {
          global.courierRequests[requestIndex].assignedAt = new Date().toISOString();
        }
        if (status === 'completed') {
          global.courierRequests[requestIndex].completedAt = new Date().toISOString();
        }
      }
    }
    
    console.log(`🚚 Admin updating courier request ${requestId} to status: ${status}`, {
      assignedCourier,
      updatedBy: req.admin.username,
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

// ==================== INVOICE MANAGEMENT ROUTES ====================

// Get all corporates for admin (for invoice management)
router.get('/corporates', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
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
      .select('corporateId companyName email contactNumber registrationDate isActive companyAddress gstNumber state')
      .sort({ companyName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await CorporateData.countDocuments(query);
    
    res.json({
      success: true,
      corporates,
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
    console.error('Get corporates for admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch corporates'
    });
  }
});

// Update invoice (Admin only)
router.put('/invoices/:invoiceId', authenticateAdmin, async (req, res) => {
  try {
    const { status, paymentMethod, paymentReference, remarks } = req.body;
    
    const Invoice = (await import('../models/Invoice.js')).default;
    const invoice = await Invoice.findById(req.params.invoiceId);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    // Update fields
    if (status) invoice.status = status;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentReference) invoice.paymentReference = paymentReference;
    if (remarks) invoice.remarks = remarks;
    
    // Set payment date if status is changed to paid
    if (status === 'paid' && !invoice.paymentDate) {
      invoice.paymentDate = new Date();
    }
    
    // Update last modified by
    invoice.lastModifiedBy = req.admin._id;
    
    await invoice.save();
    
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
    
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice'
    });
  }
});

// Get all address forms (bookings) with pagination and filters
router.get('/address-forms', authenticateAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      fromDate, 
      toDate,
      originPincode,
      destinationPincode,
      formCompleted
    } = req.query;

    const query = {};
    
    // Form completion filter
    if (formCompleted && formCompleted !== 'all') {
      query.formCompleted = formCompleted === 'true';
    }
    
    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }
    
    // Location filters
    if (originPincode) {
      query.$or = [
        { 'originData.pincode': originPincode },
        { 'senderPincode': originPincode }
      ];
    }
    if (destinationPincode) {
      query.$or = [
        { 'destinationData.pincode': destinationPincode },
        { 'receiverPincode': destinationPincode }
      ];
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { 'originData.name': { $regex: search, $options: 'i' } },
        { 'destinationData.name': { $regex: search, $options: 'i' } },
        { 'senderName': { $regex: search, $options: 'i' } },
        { 'receiverName': { $regex: search, $options: 'i' } },
        { 'originData.city': { $regex: search, $options: 'i' } },
        { 'destinationData.city': { $regex: search, $options: 'i' } },
        { 'senderCity': { $regex: search, $options: 'i' } },
        { 'receiverCity': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const addressForms = await FormData.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await FormData.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        addressForms,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching address forms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch address forms' 
    });
  }
});

// Assign consignment numbers to office user
router.post('/consignment/assign-office-user', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
  try {
    const { officeUserId, startNumber, endNumber, notes } = req.body;
    
    // Validate required fields
    if (!officeUserId || !startNumber || !endNumber) {
      return res.status(400).json({ 
        error: 'Office User ID, start number, and end number are required.' 
      });
    }
    
    // Validate range
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
      assignedBy: req.admin._id,
      notes: notes || ''
    });
    
    await assignment.save();
    
    console.log(`✅ Consignment numbers assigned by admin ${req.admin.name}: Office User ${officeUser.name} (${startNumber}-${endNumber})`);
    
    res.json({
      success: true,
      message: 'Consignment numbers assigned successfully to office user.',
      data: assignment
    });
    
  } catch (error) {
    console.error('Assign consignment numbers to office user error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ID format.' });
    } else {
      res.status(500).json({ error: 'Failed to assign consignment numbers to office user.' });
    }
  }
});


// Get office users for consignment assignment
router.get('/consignment/office-users', authenticateAdmin, async (req, res) => {
  // Check if admin has consignment management permission
  if (!req.admin.hasPermission('consignmentManagement')) {
    return res.status(403).json({ 
      error: 'Access denied. Consignment management permission required.' 
    });
  }
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

// Send manifest PDF via email
router.post('/send-manifest', authenticateAdmin, async (req, res) => {
  try {
    const { email, route, rows, sentAt } = req.body;
    if (!email || !route || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, error: 'Missing email, route or rows' });
    }

    const emailService = (await import('../services/emailService.js')).default;

    // Build HTML for PDF
    const title = 'Manifest';
    const dateStr = sentAt || new Date().toISOString();
    const dateOnly = new Date(dateStr).toLocaleDateString();
    const tableRows = rows.map((r, idx) => `
      <tr>
        <td style="border:1px solid #D1D5DB;padding:8px;">${idx + 1}</td>
        <td style="border:1px solid #D1D5DB;padding:8px;">${r.consignment || ''}</td>
        <td style="border:1px solid #D1D5DB;padding:8px;">${r.weight ?? ''}</td>
        <td style="border:1px solid #D1D5DB;padding:8px;">${typeof r.units === 'number' ? r.units : 1}</td>
      </tr>
    `).join('');
    const totalWeightValue = rows.reduce((s, r) => s + (typeof r.weight === 'number' ? r.weight : 0), 0);
    const totalUnitsValue = rows.reduce((s, r) => s + (typeof r.units === 'number' ? r.units : 1), 0);

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
            .meta { color:#6B7280; font-size:12px; }
            table { width:100%; border-collapse:collapse; }
            th { background:#F9FAFB; text-align:left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">Manifest</h2>
          </div>
          <div class="meta">Route: <strong>${route}</strong> | Total Consignments: <strong>${rows.length}</strong></div>
          <table style="margin-top:12px;">
            <thead>
              <tr>
                <th style="border:1px solid #D1D5DB;padding:8px;">S/N</th>
                <th style="border:1px solid #D1D5DB;padding:8px;">Consignment No</th>
                <th style="border:1px solid #D1D5DB;padding:8px;">Weight (kg)</th>
                <th style="border:1px solid #D1D5DB;padding:8px;">Units</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td style=\"border:1px solid #D1D5DB;padding:8px;\"></td>
                <td style=\"border:1px solid #D1D5DB;padding:8px;text-align:right;font-weight:600;\">Total</td>
                <td style=\"border:1px solid #D1D5DB;padding:8px;font-weight:600;\">${totalWeightValue}</td>
                <td style=\"border:1px solid #D1D5DB;padding:8px;font-weight:600;\">${totalUnitsValue}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:14px; font-size:12px; color:#374151;">Date: <strong>${dateOnly}</strong></div>
        </body>
      </html>
    `;

    let pdfBuffer;
    try {
      const puppeteer = (await import('puppeteer')).default;
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' } });
      await browser.close();
    } catch (puppeteerErr) {
      console.warn('Puppeteer failed, falling back to html-pdf:', puppeteerErr?.message);
      const pdfModule = await import('html-pdf');
      const pdfCreate = pdfModule.default?.create || pdfModule.create;
      pdfBuffer = await new Promise((resolve, reject) => {
        try {
          pdfCreate(html, { format: 'A4', border: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' } }).toBuffer((err, buffer) => {
            if (err) return reject(err);
            resolve(buffer);
          });
        } catch (e) {
          reject(e);
        }
      });
    }

    const subject = `Bag Manifest - ${route}`;
    const emailHtml = `<p>Please find attached the manifest sent on ${dateOnly}.</p>`;
    const text = `Manifest attached. Sent on ${dateOnly}`;

    await emailService.sendEmailWithPdfAttachment({
      to: email,
      subject,
      html: emailHtml,
      text,
      pdfBuffer,
      filename: `manifest_${Date.now()}.pdf`
    });

    res.json({ success: true });
  } catch (error) {
    console.error('send-manifest error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
