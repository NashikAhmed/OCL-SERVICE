import express from 'express';
import CourierComplaint from '../models/CourierComplaint.js';
import { ConsignmentUsage } from '../models/ConsignmentAssignment.js';
import { authenticateCorporate } from '../middleware/auth.js';

const router = express.Router();

// Get all courier complaints for a corporate
router.get('/', authenticateCorporate, async (req, res) => {
  try {
    const { status, category, priority, limit = 50 } = req.query;
    
    const complaints = await CourierComplaint.getByCorporate(req.corporate._id, {
      status,
      category,
      priority,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      complaints,
      count: complaints.length
    });
  } catch (error) {
    console.error('Get courier complaints error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courier complaints'
    });
  }
});

// Get courier complaint statistics
router.get('/stats', authenticateCorporate, async (req, res) => {
  try {
    const stats = await CourierComplaint.getStats(req.corporate._id);
    
    // Format stats for easier consumption
    const formattedStats = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id.toLowerCase().replace(' ', '')] = stat.count;
    });

    res.json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Get courier complaint stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint statistics'
    });
  }
});

// Search shipment by consignment number
router.get('/search-shipment/:consignmentNumber', authenticateCorporate, async (req, res) => {
  try {
    const { consignmentNumber } = req.params;
    
    // Search for the shipment in ConsignmentUsage
    const shipment = await ConsignmentUsage.findOne({
      corporateId: req.corporate._id,
      consignmentNumber: consignmentNumber
    }).select('consignmentNumber bookingData freightCharges totalAmount usedAt');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found. Please check the consignment number.'
      });
    }

    // Extract relevant information
    const shipmentInfo = {
      consignmentNumber: shipment.consignmentNumber,
      destination: shipment.bookingData?.destinationData ? 
        `${shipment.bookingData.destinationData.city}, ${shipment.bookingData.destinationData.state}` : 
        'Unknown',
      status: shipment.bookingData?.status || 'Unknown',
      bookingDate: shipment.usedAt,
      courierName: shipment.bookingData?.courierInfo?.name || 'Not Assigned',
      courierContact: shipment.bookingData?.courierInfo?.contact || 'Not Available',
      freightCharges: shipment.freightCharges,
      totalAmount: shipment.totalAmount
    };

    res.json({
      success: true,
      shipmentInfo
    });
  } catch (error) {
    console.error('Search shipment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search shipment'
    });
  }
});

// Submit a new courier complaint
router.post('/', authenticateCorporate, async (req, res) => {
  try {
    const {
      consignmentNumber,
      subject,
      category,
      priority,
      description
    } = req.body;

    // Validate required fields
    if (!consignmentNumber || !subject || !category || !priority || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: consignmentNumber, subject, category, priority, description'
      });
    }

    // Verify the shipment exists and belongs to this corporate
    const shipment = await ConsignmentUsage.findOne({
      corporateId: req.corporate._id,
      consignmentNumber: consignmentNumber
    });

    if (!shipment) {
      return res.status(400).json({
        success: false,
        error: 'Shipment not found. Please verify the consignment number.'
      });
    }

    // Extract shipment information
    const shipmentInfo = {
      destination: shipment.bookingData?.destinationData ? 
        `${shipment.bookingData.destinationData.city}, ${shipment.bookingData.destinationData.state}` : 
        'Unknown',
      status: shipment.bookingData?.status || 'Unknown',
      bookingDate: shipment.usedAt,
      courierName: shipment.bookingData?.courierInfo?.name || 'Not Assigned',
      courierContact: shipment.bookingData?.courierInfo?.contact || 'Not Available'
    };

    // Create the complaint
    const complaint = new CourierComplaint({
      corporateId: req.corporate._id,
      corporateInfo: {
        corporateId: req.corporate.corporateId,
        companyName: req.corporate.companyName,
        email: req.corporate.email,
        contactNumber: req.corporate.contactNumber
      },
      consignmentNumber,
      shipmentInfo,
      subject,
      category,
      priority,
      description,
      status: 'Open'
    });

    await complaint.save();

    console.log(`✅ Courier complaint submitted: ${req.corporate.companyName} - Consignment: ${consignmentNumber} - Category: ${category}`);

    res.status(201).json({
      success: true,
      message: 'Courier complaint submitted successfully',
      complaint: {
        id: complaint._id,
        consignmentNumber: complaint.consignmentNumber,
        subject: complaint.subject,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });

  } catch (error) {
    console.error('Submit courier complaint error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to submit courier complaint'
      });
    }
  }
});

// Get consignment numbers for suggestions dropdown
router.get('/consignment-suggestions', authenticateCorporate, async (req, res) => {
  try {
    const { limit = 20, search = '' } = req.query;
    
    // Build search query
    const searchQuery = {
      corporateId: req.corporate._id
    };
    
    if (search) {
      searchQuery.consignmentNumber = { $regex: search, $options: 'i' };
    }
    
    // Get consignment numbers from ConsignmentUsage
    const consignments = await ConsignmentUsage.find(searchQuery)
      .select('consignmentNumber bookingData usedAt')
      .sort({ usedAt: -1 })
      .limit(parseInt(limit));

    // Format the response
    const suggestions = consignments.map(consignment => ({
      consignmentNumber: consignment.consignmentNumber,
      destination: consignment.bookingData?.destinationData ? 
        `${consignment.bookingData.destinationData.city}, ${consignment.bookingData.destinationData.state}` : 
        'Unknown',
      bookingDate: consignment.usedAt,
      status: consignment.bookingData?.status || 'Unknown'
    }));

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get consignment suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch consignment suggestions'
    });
  }
});

// Get recent courier complaints (for dashboard)
router.get('/recent/:limit?', authenticateCorporate, async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    
    const complaints = await CourierComplaint.find({
      corporateId: req.corporate._id
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('consignmentNumber subject category priority status createdAt')
    .populate('respondedBy', 'name');

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error('Get recent courier complaints error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent complaints'
    });
  }
});

// Get a specific courier complaint
router.get('/:id', authenticateCorporate, async (req, res) => {
  try {
    const complaint = await CourierComplaint.findOne({
      _id: req.params.id,
      corporateId: req.corporate._id
    })
    .populate('respondedBy', 'name email')
    .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get courier complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint'
    });
  }
});

// Update a courier complaint (limited updates for corporate users)
router.patch('/:id', authenticateCorporate, async (req, res) => {
  try {
    const { description } = req.body;
    
    const complaint = await CourierComplaint.findOne({
      _id: req.params.id,
      corporateId: req.corporate._id,
      status: 'Open' // Only allow updates to open complaints
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found or cannot be updated'
      });
    }

    // Corporate users can only update the description of open complaints
    if (description) {
      complaint.description = description;
      complaint.updatedAt = new Date();
      await complaint.save();
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: {
        id: complaint._id,
        description: complaint.description,
        updatedAt: complaint.updatedAt
      }
    });

  } catch (error) {
    console.error('Update courier complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update complaint'
    });
  }
});

export default router;
