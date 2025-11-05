import express from 'express';
import CourierBoy from '../models/CourierBoy.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all courier boys with pagination and filtering
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courierBoys = await CourierBoy.find(query)
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await CourierBoy.countDocuments(query);
    
    res.json({
      success: true,
      courierBoys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching courier boys:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courier boys.' 
    });
  }
});

// Get courier boy by ID with full details
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const courierBoy = await CourierBoy.findById(req.params.id);
    
    if (!courierBoy) {
      return res.status(404).json({ 
        success: false,
        error: 'Courier boy not found.' 
      });
    }
    
    res.json({
      success: true,
      courierBoy
    });
    
  } catch (error) {
    console.error('Error fetching courier boy:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courier boy.' 
    });
  }
});

// Update courier boy status
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected.'
      });
    }
    
    const courierBoy = await CourierBoy.findById(req.params.id);
    
    if (!courierBoy) {
      return res.status(404).json({ 
        success: false,
        error: 'Courier boy not found.' 
      });
    }
    
    // Update status
    await courierBoy.updateStatus(status);
    
    res.json({
      success: true,
      message: `Courier boy status updated to ${status}`,
      courierBoy: {
        id: courierBoy._id,
        fullName: courierBoy.fullName,
        email: courierBoy.email,
        status: courierBoy.status,
        isVerified: courierBoy.isVerified,
        lastUpdated: courierBoy.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error updating courier boy status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update courier boy status.' 
    });
  }
});

// Approve courier boy
router.put('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const courierBoy = await CourierBoy.findById(req.params.id);
    
    if (!courierBoy) {
      return res.status(404).json({ 
        success: false,
        error: 'Courier boy not found.' 
      });
    }
    
    await courierBoy.approve();
    
    res.json({
      success: true,
      message: 'Courier boy approved successfully',
      courierBoy: {
        id: courierBoy._id,
        fullName: courierBoy.fullName,
        email: courierBoy.email,
        status: courierBoy.status,
        isVerified: courierBoy.isVerified,
        lastUpdated: courierBoy.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error approving courier boy:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve courier boy.' 
    });
  }
});

// Reject courier boy
router.put('/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const courierBoy = await CourierBoy.findById(req.params.id);
    
    if (!courierBoy) {
      return res.status(404).json({ 
        success: false,
        error: 'Courier boy not found.' 
      });
    }
    
    await courierBoy.reject();
    
    res.json({
      success: true,
      message: 'Courier boy rejected',
      courierBoy: {
        id: courierBoy._id,
        fullName: courierBoy.fullName,
        email: courierBoy.email,
        status: courierBoy.status,
        isVerified: courierBoy.isVerified,
        lastUpdated: courierBoy.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error rejecting courier boy:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject courier boy.' 
    });
  }
});

// Get courier boy statistics
router.get('/stats/overview', authenticateAdmin, async (req, res) => {
  try {
    const total = await CourierBoy.countDocuments();
    const pending = await CourierBoy.countDocuments({ status: 'pending' });
    const approved = await CourierBoy.countDocuments({ status: 'approved' });
    const rejected = await CourierBoy.countDocuments({ status: 'rejected' });
    const verified = await CourierBoy.countDocuments({ isVerified: true });
    
    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        verified
      }
    });
    
  } catch (error) {
    console.error('Error fetching courier boy statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courier boy statistics.' 
    });
  }
});

export default router;
