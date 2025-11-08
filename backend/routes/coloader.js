import express from "express";
import Coloader from "../models/Coloader.js";
import { authenticateAdminOrOfficeAdmin } from "../middleware/auth.js";

const router = express.Router();

// Register new coloader
router.post("/register", async (req, res) => {
  try {
    console.log('Received coloader registration data:', req.body);
    
    const {
      companyName,
      serviceModes,
      concernPerson,
      mobileNumbers,
      email,
      website,
      companyAddress,
      fromLocations,
      toLocations
    } = req.body;
    
    // Validate required fields
    const requiredFields = [
      'companyName', 'serviceModes', 'concernPerson', 
      'mobileNumbers', 'email', 'companyAddress', 
      'fromLocations', 'toLocations'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate service modes
    if (!Array.isArray(serviceModes) || serviceModes.length === 0) {
      return res.status(400).json({ 
        error: 'At least one service mode is required' 
      });
    }

    // Validate mobile numbers
    if (!Array.isArray(mobileNumbers) || mobileNumbers.length === 0) {
      return res.status(400).json({ 
        error: 'At least one mobile number is required' 
      });
    }

    // Validate locations
    if (!Array.isArray(fromLocations) || fromLocations.length === 0) {
      return res.status(400).json({ 
        error: 'At least one FROM location is required' 
      });
    }

    if (!Array.isArray(toLocations) || toLocations.length === 0) {
      return res.status(400).json({ 
        error: 'At least one TO location is required' 
      });
    }

    // Check if company with same email already exists
    const existingColoader = await Coloader.findOne({
      email: email.toLowerCase()
    });

    if (existingColoader) {
      return res.status(409).json({ 
        error: 'A coloader with this email already exists' 
      });
    }

    // Check if company with same name already exists
    const existingCompany = await Coloader.findOne({
      companyName: companyName.trim()
    });

    if (existingCompany) {
      return res.status(409).json({ 
        error: 'A coloader with this company name already exists' 
      });
    }

    // Create new coloader registration
    const coloaderData = new Coloader({
      companyName: companyName.trim(),
      serviceModes: serviceModes,
      concernPerson: concernPerson.trim(),
      mobileNumbers: mobileNumbers.map(num => num.trim()),
      email: email.toLowerCase().trim(),
      website: website?.trim() || '',
      companyAddress: {
        pincode: companyAddress.pincode.trim(),
        state: companyAddress.state.trim(),
        city: companyAddress.city.trim(),
        area: companyAddress.area.trim(),
        address: companyAddress.address.trim(),
        flatNo: companyAddress.flatNo.trim(),
        landmark: companyAddress.landmark?.trim() || '',
        gst: companyAddress.gst.trim().toUpperCase()
      },
      fromLocations: fromLocations.map(location => ({
        concernPerson: location.concernPerson.trim(),
        mobile: location.mobile.trim(),
        email: location.email.toLowerCase().trim(),
        pincode: location.pincode.trim(),
        state: location.state.trim(),
        city: location.city.trim(),
        area: location.area.trim(),
        address: location.address.trim(),
        flatNo: location.flatNo.trim(),
        landmark: location.landmark?.trim() || '',
        gst: location.gst.trim().toUpperCase()
      })),
      toLocations: toLocations.map(location => ({
        concernPerson: location.concernPerson.trim(),
        mobile: location.mobile.trim(),
        email: location.email.toLowerCase().trim(),
        pincode: location.pincode.trim(),
        state: location.state.trim(),
        city: location.city.trim(),
        area: location.area.trim(),
        address: location.address.trim(),
        flatNo: location.flatNo.trim(),
        landmark: location.landmark?.trim() || '',
        gst: location.gst.trim().toUpperCase()
      })),
      status: 'approved' // Automatically approve upon registration completion
    });

    await coloaderData.save();
    
    console.log('Coloader registration successful:', coloaderData.coloaderId);
    
    res.json({ 
      success: true, 
      message: 'Coloader registration completed and approved successfully!',
      coloaderId: coloaderData.coloaderId,
      data: {
        coloaderId: coloaderData.coloaderId,
        companyName: coloaderData.companyName,
        email: coloaderData.email,
        status: coloaderData.status,
        registrationDate: coloaderData.registrationDate,
        completionPercentage: coloaderData.getCompletionPercentage()
      }
    });
    
  } catch (err) {
    console.error('Error in coloader registration:', err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (err.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate entry detected',
        details: 'A coloader with this information already exists'
      });
    } else {
      res.status(500).json({ 
        error: err.message || 'Internal server error'
      });
    }
  }
});

// Get all coloaders with filtering and pagination
router.get("/", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters = {};
    
    // Add filters based on query parameters
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
      hasPrev: page > 1
    });
    
  } catch (err) {
    console.error('Error fetching coloader data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloader by ID
router.get("/:id", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const coloader = await Coloader.findById(req.params.id);
    
    if (!coloader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: coloader,
      completionPercentage: coloader.getCompletionPercentage(),
      serviceModesText: coloader.getServiceModesText()
    });
    
  } catch (err) {
    console.error('Error fetching coloader by ID:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid coloader ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get coloader by coloader ID
router.get("/coloader-id/:coloaderId", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const coloader = await Coloader.findOne({ 
      coloaderId: req.params.coloaderId 
    });
    
    if (!coloader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: coloader,
      completionPercentage: coloader.getCompletionPercentage(),
      serviceModesText: coloader.getServiceModesText()
    });
    
  } catch (err) {
    console.error('Error fetching coloader by coloader ID:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloader by email
router.get("/email/:email", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const coloader = await Coloader.findOne({ 
      email: req.params.email.toLowerCase() 
    });
    
    if (!coloader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: coloader,
      completionPercentage: coloader.getCompletionPercentage(),
      serviceModesText: coloader.getServiceModesText()
    });
    
  } catch (err) {
    console.error('Error fetching coloader by email:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update coloader by ID
router.put("/:id", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const updatedColoader = await Coloader.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// Update coloader status (approve/reject)
router.patch("/:id/status", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { status, approvedBy, rejectionReason, notes } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, approved, rejected, suspended' 
      });
    }
    
    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      updateData.rejectionReason = null;
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    const updatedColoader = await Coloader.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedColoader) {
      return res.status(404).json({ 
        error: 'Coloader registration not found' 
      });
    }
    
    console.log(`Coloader status updated to ${status}:`, updatedColoader.coloaderId);
    res.json({ 
      success: true, 
      data: updatedColoader,
      message: `Coloader status updated to ${status} successfully!`
    });
    
  } catch (err) {
    console.error('Error updating coloader status:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid coloader ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete coloader by ID
router.delete("/:id", authenticateAdminOrOfficeAdmin, async (req, res) => {
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

// Search coloaders
router.get("/search/:query", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const results = await Coloader.searchColoaders(query.trim());
    
    res.json({ 
      success: true, 
      data: results, 
      count: results.length,
      searchQuery: query.trim()
    });
    
  } catch (err) {
    console.error('Error in coloader search:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloaders by status
router.get("/status/:status", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { status } = req.params;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, approved, rejected, suspended' 
      });
    }
    
    const coloaders = await Coloader.findByStatus(status);
    
    res.json({ 
      success: true, 
      data: coloaders, 
      count: coloaders.length,
      status: status
    });
    
  } catch (err) {
    console.error('Error fetching coloaders by status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloaders by service mode
router.get("/service-mode/:serviceMode", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { serviceMode } = req.params;
    
    if (!['air', 'road', 'train', 'ship'].includes(serviceMode)) {
      return res.status(400).json({ 
        error: 'Invalid service mode. Must be one of: air, road, train, ship' 
      });
    }
    
    const coloaders = await Coloader.findByServiceMode(serviceMode);
    
    res.json({ 
      success: true, 
      data: coloaders, 
      count: coloaders.length,
      serviceMode: serviceMode
    });
    
  } catch (err) {
    console.error('Error fetching coloaders by service mode:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloaders by location
router.get("/location/:state/:city?", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const { state, city } = req.params;
    
    const coloaders = await Coloader.findByLocation(state, city);
    
    res.json({ 
      success: true, 
      data: coloaders, 
      count: coloaders.length,
      location: { state, city }
    });
    
  } catch (err) {
    console.error('Error fetching coloaders by location:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get coloader statistics
router.get("/stats/overview", authenticateAdminOrOfficeAdmin, async (req, res) => {
  // Check if user has coloader registration permission
  if (!req.admin.hasPermission('coloaderRegistration')) {
    return res.status(403).json({ 
      error: 'Access denied. Coloader registration permission required.' 
    });
  }
  try {
    const totalColoaders = await Coloader.countDocuments();
    const pendingColoaders = await Coloader.countDocuments({ status: 'pending' });
    const approvedColoaders = await Coloader.countDocuments({ status: 'approved' });
    const rejectedColoaders = await Coloader.countDocuments({ status: 'rejected' });
    const suspendedColoaders = await Coloader.countDocuments({ status: 'suspended' });
    const activeColoaders = await Coloader.countDocuments({ isActive: true });
    
    // Get coloaders by service mode
    const serviceModeStats = await Coloader.aggregate([
      { $unwind: '$serviceModes' },
      { $group: { _id: '$serviceModes', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get coloaders by state
    const stateStats = await Coloader.aggregate([
      { $match: { 'companyAddress.state': { $exists: true, $ne: '' } } },
      { $group: { _id: '$companyAddress.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent registrations
    const recentRegistrations = await Coloader.find()
      .sort({ registrationDate: -1 })
      .limit(5)
      .select('coloaderId companyName email status registrationDate companyAddress.state companyAddress.city')
      .lean();
    
    // Monthly registration stats for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Coloader.aggregate([
      {
        $match: {
          registrationDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$registrationDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({ 
      success: true, 
      stats: {
        totalColoaders,
        pendingColoaders,
        approvedColoaders,
        rejectedColoaders,
        suspendedColoaders,
        activeColoaders,
        serviceModeStats,
        stateStats,
        recentRegistrations,
        monthlyStats,
        currentYear
      }
    });
    
  } catch (err) {
    console.error('Error fetching coloader statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
