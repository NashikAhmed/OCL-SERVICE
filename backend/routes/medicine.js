import express from 'express';
import MedicineUser from '../models/MedicineUser.js';
import MedicineBooking from '../models/MedicineBooking.js';
import MedicineManifest from '../models/MedicineManifest.js';
import MedicineColoader from '../models/MedicineColoader.js';
import { generateToken, validateLoginInput, authenticateMedicine } from '../middleware/auth.js';
import { uploadPackageImages, uploadInvoiceImages, uploadScreenshots, handleUploadError } from '../middleware/upload.js';
import S3Service from '../services/s3Service.js';
import ConsignmentAssignment from '../models/ConsignmentAssignment.js';
import { ConsignmentUsage } from '../models/ConsignmentAssignment.js';

const router = express.Router();

// POST /api/medicine/login
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginId = (email || username || '').toLowerCase().trim();

    const user = await MedicineUser.findOne({ email: loginId });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await user.updateLoginInfo();
    const token = generateToken(user._id, 'medicine');
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Medicine login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/medicine/profile
router.get('/profile', authenticateMedicine, async (req, res) => {
  try {
    res.json({ success: true, user: req.medicine });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// POST /api/medicine/bookings - Create a new medicine booking
router.post('/bookings', async (req, res) => {
  try {
    console.log('Received medicine booking request:', req.body);
    
    const {
      medicineUserId,
      origin,
      destination,
      shipment,
      package: packageData,
      invoice,
      billing,
      charges,
      payment
    } = req.body;

    // Validate required fields
    if (!origin || !destination || !shipment || !packageData || !invoice || !billing) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide all required booking information'
      });
    }

    // Check if medicineUserId is provided (required for consignment number assignment)
    if (!medicineUserId) {
      return res.status(400).json({
        error: 'Medicine user ID required',
        message: 'You must be logged in to create a booking. Consignment numbers are assigned to medicine users.'
      });
    }

    // Check consignment availability first
    const assignments = await ConsignmentAssignment.find({
      assignmentType: 'medicine',
      medicineUserId: medicineUserId,
      isActive: true
    });
    
    if (!assignments || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No consignment numbers assigned',
        message: 'No consignment numbers assigned to your account. Please contact admin to get consignment numbers assigned.'
      });
    }

    // Check if any consignment numbers are available across all assignments
    const usedCount = await ConsignmentUsage.countDocuments({
      assignmentType: 'medicine',
      entityId: medicineUserId
    });
    
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.totalNumbers, 0);
    const availableCount = totalAssigned - usedCount;
    
    if (availableCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No consignment numbers available',
        message: 'All consignment numbers have been used. Please contact admin to get more consignment numbers assigned.'
      });
    }

    // Get next available consignment number for this medicine user
    let consignmentNumber;
    try {
      consignmentNumber = await ConsignmentAssignment.getNextConsignmentNumber('medicine', medicineUserId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'No consignment numbers available',
        message: error.message || 'No consignment numbers assigned to your account. Please contact admin.'
      });
    }

    // Create booking payload
    const bookingPayload = {
      medicineUserId: medicineUserId,
      origin,
      destination,
      shipment,
      package: {
        ...packageData,
        packageImages: packageData.packageImages || []
      },
      invoice: {
        ...invoice,
        invoiceImages: invoice.invoiceImages || []
      },
      billing,
      charges: charges || {},
      payment: payment || {}
    };

    // Create new booking with consignment number as bookingReference
    const booking = new MedicineBooking({
      ...bookingPayload,
      consignmentNumber: consignmentNumber,
      bookingReference: consignmentNumber.toString() // Use consignment number as booking reference
    });

    await booking.save();

    // Record consignment usage
    const usage = new ConsignmentUsage({
      assignmentType: 'medicine',
      entityId: medicineUserId,
      medicineUserId: medicineUserId,
      consignmentNumber: consignmentNumber,
      bookingReference: consignmentNumber.toString(),
      bookingData: bookingPayload,
      freightCharges: charges?.grandTotal ? parseFloat(charges.grandTotal) : 0,
      totalAmount: charges?.grandTotal ? parseFloat(charges.grandTotal) : 0,
      paymentType: payment?.mode === 'TP' ? 'TP' : 'FP'
    });

    await usage.save();

    console.log(`✅ Medicine booking created: Medicine User ${medicineUserId} - Consignment: ${consignmentNumber}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        consignmentNumber: booking.consignmentNumber,
        bookingReference: booking.bookingReference,
        status: booking.status,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating medicine booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

// POST /api/medicine/bookings/upload-images - Upload package and invoice images
router.post('/bookings/upload-images', uploadScreenshots, handleUploadError, async (req, res) => {
  try {
    const result = {
      packageImages: [],
      invoiceImages: []
    };

    // Upload package images to S3
    if (req.files && req.files.packageImages) {
      const packageUploadResult = await S3Service.uploadMultipleFiles(
        req.files.packageImages,
        'uploads/medicine-bookings/package-images'
      );
      if (packageUploadResult.success) {
        result.packageImages = packageUploadResult.files;
      }
    }

    // Upload invoice images to S3
    if (req.files && req.files.invoiceImages) {
      const invoiceUploadResult = await S3Service.uploadMultipleFiles(
        req.files.invoiceImages,
        'uploads/medicine-bookings/invoice-images'
      );
      if (invoiceUploadResult.success) {
        result.invoiceImages = invoiceUploadResult.files;
      }
    }

    const totalFiles = result.packageImages.length + result.invoiceImages.length;

    if (totalFiles === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one image'
      });
    }

    res.json({
      success: true,
      message: `${totalFiles} image(s) uploaded successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload images'
    });
  }
});

// GET /api/medicine/bookings - Get all bookings (optional: filter by medicineUserId)
router.get('/bookings', authenticateMedicine, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const medicineUserId = req.medicine?._id;

    const query = {};
    if (medicineUserId) {
      query.medicineUserId = medicineUserId;
    }
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await MedicineBooking.find(query)
      .populate('coloaderId', 'phoneNumber busNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await MedicineBooking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

// GET /api/medicine/bookings/lookup - Lookup past addresses by phone number
// IMPORTANT: This must be defined BEFORE '/bookings/:id' to avoid route conflicts
// Query: ?phone=XXXXXXXXXX&role=origin|destination
router.get('/bookings/lookup', async (req, res) => {
  try {
    const { phone, role } = req.query;

    console.log('[MedicineBooking Lookup] Request received:', { phone, role });

    const mobileNumber = (phone || '').toString().trim();
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      console.log('[MedicineBooking Lookup] Invalid phone number format:', mobileNumber);
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number',
        message: 'Phone must be a 10 digit number'
      });
    }

    // Build query based on role
    let query;
    if (role === 'origin') {
      query = { 'origin.mobileNumber': mobileNumber };
    } else if (role === 'destination') {
      query = { 'destination.mobileNumber': mobileNumber };
    } else {
      query = {
        $or: [
          { 'origin.mobileNumber': mobileNumber },
          { 'destination.mobileNumber': mobileNumber }
        ]
      };
    }

    console.log('[MedicineBooking Lookup] Query:', JSON.stringify(query));

    // Fetch recent bookings, limit to avoid large payloads
    const bookings = await MedicineBooking.find(query)
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    console.log(`[MedicineBooking Lookup] Found ${bookings.length} booking(s) for phone ${mobileNumber}`);

    // Deduplicate addresses by a signature of key fields
    const makeSignature = (addr) => [
      addr?.name || '',
      addr?.mobileNumber || '',
      addr?.email || '',
      addr?.companyName || '',
      addr?.flatBuilding || '',
      addr?.locality || '',
      addr?.landmark || '',
      addr?.pincode || '',
      addr?.city || '',
      addr?.district || '',
      addr?.state || '',
      addr?.gstNumber || '',
      addr?.addressType || ''
    ].join('|').toLowerCase();

    const addressesMap = new Map();

    for (const b of bookings) {
      if (role !== 'destination') {
        const o = b.origin || {};
        if (o.mobileNumber === mobileNumber) {
          const sig = makeSignature(o);
          if (!addressesMap.has(sig)) {
            addressesMap.set(sig, {
              id: `origin-${b._id.toString()}`,
              role: 'origin',
              name: o.name || '',
              mobileNumber: o.mobileNumber || '',
              email: o.email || '',
              companyName: o.companyName || '',
              flatBuilding: o.flatBuilding || '',
              locality: o.locality || '',
              landmark: o.landmark || '',
              pincode: o.pincode || '',
              city: o.city || '',
              district: o.district || '',
              state: o.state || '',
              gstNumber: o.gstNumber || '',
              addressType: o.addressType || 'Home'
            });
          }
        }
      }

      if (role !== 'origin') {
        const d = b.destination || {};
        if (d.mobileNumber === mobileNumber) {
          const sig = makeSignature(d);
          if (!addressesMap.has(sig)) {
            addressesMap.set(sig, {
              id: `destination-${b._id.toString()}`,
              role: 'destination',
              name: d.name || '',
              mobileNumber: d.mobileNumber || '',
              email: d.email || '',
              companyName: d.companyName || '',
              flatBuilding: d.flatBuilding || '',
              locality: d.locality || '',
              landmark: d.landmark || '',
              pincode: d.pincode || '',
              city: d.city || '',
              district: d.district || '',
              state: d.state || '',
              gstNumber: d.gstNumber || '',
              addressType: d.addressType || 'Home'
            });
          }
        }
      }
    }

    const addresses = Array.from(addressesMap.values());

    console.log(`[MedicineBooking Lookup] Returning ${addresses.length} unique address(es)`);

    return res.json({
      success: true,
      count: addresses.length,
      addresses
    });
  } catch (error) {
    console.error('[MedicineBooking Lookup] Error during lookup:', error);
    res.status(500).json({
      success: false,
      error: 'Lookup failed',
      message: error.message
    });
  }
});

// GET /api/medicine/bookings/:id - Get a specific booking by ID
router.get('/bookings/:id', authenticateMedicine, async (req, res) => {
  try {
    const booking = await MedicineBooking.findById(req.params.id).lean();

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking does not exist'
      });
    }

    // Check if user has permission (optional - can be removed if all medicine users should see all bookings)
    if (req.medicine?._id && booking.medicineUserId && 
        booking.medicineUserId.toString() !== req.medicine._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
});

// GET /api/medicine/bookings/reference/:reference - Get booking by reference number
router.get('/bookings/reference/:reference', async (req, res) => {
  try {
    const booking = await MedicineBooking.findByReference(req.params.reference).lean();

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with this reference number'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by reference:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
});

// (moved above '/bookings/:id')

// GET /api/medicine/bookings/consignment/:consignmentNumber - Get booking by consignment number
router.get('/bookings/consignment/:consignmentNumber', authenticateMedicine, async (req, res) => {
  try {
    const consignmentNumber = parseInt(req.params.consignmentNumber);
    
    if (isNaN(consignmentNumber)) {
      return res.status(400).json({
        error: 'Invalid consignment number',
        message: 'Consignment number must be a valid number'
      });
    }

    const booking = await MedicineBooking.findOne({
      consignmentNumber: consignmentNumber,
      medicineUserId: req.medicine._id
    }).lean();

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: `No booking found with consignment number ${consignmentNumber}`
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking by consignment number:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
});

// POST /api/medicine/manifests - Create a manifest from scanned consignments
router.post('/manifests', authenticateMedicine, async (req, res) => {
  try {
    const { consignmentNumbers, notes, path } = req.body || {};

    if (!Array.isArray(consignmentNumbers) || consignmentNumbers.length === 0) {
      return res.status(400).json({
        error: 'No consignments provided',
        message: 'Provide an array of consignment numbers to create a manifest'
      });
    }

    if (!path) {
      return res.status(400).json({
        error: 'Path is required',
        message: 'Please provide a path for the manifest'
      });
    }

    // Fetch bookings belonging to this user and not already dispatched/delivered
    const bookings = await MedicineBooking.find({
      consignmentNumber: { $in: consignmentNumbers.map((n) => parseInt(n, 10)) },
      medicineUserId: req.medicine._id,
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        error: 'No bookings found',
        message: 'No valid bookings found for the provided consignments'
      });
    }

    // Parse path to extract origin and destination details
    // Path format: "OriginCity, OriginState → DestinationCity, DestinationState"
    let originCity = '';
    let originState = '';
    let destinationCity = '';
    let destinationState = '';

    if (path) {
      const pathMatch = path.match(/^(.+?),\s*(.+?)\s*→\s*(.+?),\s*(.+)$/);
      if (pathMatch) {
        originCity = pathMatch[1].trim();
        originState = pathMatch[2].trim();
        destinationCity = pathMatch[3].trim();
        destinationState = pathMatch[4].trim();
      }
    }

    // Build manifest document
    const manifestNumber = MedicineManifest.generateManifestNumber();
    const consignments = bookings.map((b) => ({
      bookingId: b._id,
      consignmentNumber: b.consignmentNumber
    }));

    const manifest = new MedicineManifest({
      medicineUserId: req.medicine._id,
      manifestNumber,
      consignments,
      totalCount: consignments.length,
      notes: notes || '',
      path: path,
      originCity: originCity,
      originState: originState,
      destinationCity: destinationCity,
      destinationState: destinationState,
      status: 'submitted'
    });
    await manifest.save();

    // Update the bookings: set status to in_transit if not already delivered/cancelled and link manifestId
    const updatableStatuses = ['pending', 'confirmed'];
    const bookingIds = bookings.map((b) => b._id);
    await MedicineBooking.updateMany(
      { _id: { $in: bookingIds }, status: { $in: updatableStatuses } },
      { $set: { status: 'in_transit', manifestId: manifest._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Manifest created successfully',
      manifest: {
        id: manifest._id,
        manifestNumber: manifest.manifestNumber,
        totalCount: manifest.totalCount,
        createdAt: manifest.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating medicine manifest:', error);
    res.status(500).json({
      error: 'Failed to create manifest',
      message: error.message
    });
  }
});

// PATCH /api/medicine/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', authenticateMedicine, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Please provide a valid status'
      });
    }

    const booking = await MedicineBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking does not exist'
      });
    }

    await booking.updateStatus(status);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      error: 'Failed to update booking status',
      message: error.message
    });
  }
});

// GET /api/medicine/consignment/assignments - Get consignment assignments for medicine user
router.get('/consignment/assignments', authenticateMedicine, async (req, res) => {
  try {
    const ConsignmentAssignment = (await import('../models/ConsignmentAssignment.js')).default;
    const ConsignmentUsage = (await import('../models/ConsignmentAssignment.js')).ConsignmentUsage;
    
    // Get assignments for this medicine user
    const assignments = await ConsignmentAssignment.find({
      assignmentType: 'medicine',
      medicineUserId: req.medicine._id,
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
      assignmentType: 'medicine',
      entityId: req.medicine._id
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

// GET /api/medicine/paths/pending - Get all paths with pending orders (city-wise)
router.get('/paths/pending', authenticateMedicine, async (req, res) => {
  try {
    const medicineUserId = req.medicine?._id;
    
    // Fetch all pending bookings for this medicine user
    const bookings = await MedicineBooking.find({
      medicineUserId: medicineUserId,
      status: 'pending'
    }).lean();
    
    // Group by path (city-wise: origin city, state → destination city, state)
    const pathGroups = {};
    
    bookings.forEach(booking => {
      const originCity = booking.origin?.city || 'N/A';
      const originState = booking.origin?.state || 'N/A';
      const destinationCity = booking.destination?.city || 'N/A';
      const destinationState = booking.destination?.state || 'N/A';
      
      const path = `${originCity}, ${originState} → ${destinationCity}, ${destinationState}`;
      
      if (!pathGroups[path]) {
        pathGroups[path] = {
          path,
          count: 0,
          originCity,
          originState,
          destinationCity,
          destinationState
        };
      }
      
      pathGroups[path].count += 1;
    });
    
    // Convert to array and sort by count (descending)
    const paths = Object.values(pathGroups).sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      paths,
      total: paths.length
    });
    
  } catch (error) {
    console.error('Error fetching paths with pending orders:', error);
    res.status(500).json({
      error: 'Failed to fetch paths',
      message: error.message
    });
  }
});

// GET /api/medicine/coloaders - Get all coloaders
router.get('/coloaders', authenticateMedicine, async (req, res) => {
  try {
    const coloaders = await MedicineColoader.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('medicineUserId', 'name email');
    
    res.status(200).json({
      success: true,
      data: coloaders,
      count: coloaders.length
    });
  } catch (error) {
    console.error('Error fetching coloaders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coloaders',
      message: error.message
    });
  }
});

// POST /api/medicine/coloaders - Create a new coloader
router.post('/coloaders', authenticateMedicine, async (req, res) => {
  try {
    const { phoneNumber, busNumber } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !busNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Phone number and bus number are required'
      });
    }
    
    // Validate phone number format
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number',
        message: 'Phone number must be exactly 10 digits'
      });
    }
    
    // Check if coloader with same phone number and bus number already exists
    const existingColoader = await MedicineColoader.findOne({
      phoneNumber,
      busNumber,
      isActive: true
    });
    
    if (existingColoader) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate coloader',
        message: 'A coloader with this phone number and bus number already exists'
      });
    }
    
    // Get medicine user ID from token
    const medicineUserId = req.user?.id || null;
    
    // Create new coloader
    const coloader = new MedicineColoader({
      medicineUserId,
      phoneNumber,
      busNumber,
      isActive: true
    });
    
    await coloader.save();
    
    // Populate medicine user info
    await coloader.populate('medicineUserId', 'name email');
    
    console.log(`✅ Medicine coloader created: ${phoneNumber} - ${busNumber}`);
    
    res.status(201).json({
      success: true,
      message: 'Coloader created successfully',
      data: coloader
    });
  } catch (error) {
    console.error('Error creating coloader:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create coloader',
      message: error.message
    });
  }
});

// DELETE /api/medicine/coloaders/:id - Soft delete a coloader
router.delete('/coloaders/:id', authenticateMedicine, async (req, res) => {
  try {
    const { id } = req.params;
    
    const coloader = await MedicineColoader.findById(id);
    
    if (!coloader) {
      return res.status(404).json({
        success: false,
        error: 'Coloader not found'
      });
    }
    
    // Soft delete by setting isActive to false
    coloader.isActive = false;
    await coloader.save();
    
    res.status(200).json({
      success: true,
      message: 'Coloader deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coloader:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete coloader',
      message: error.message
    });
  }
});

// GET /api/medicine/manifests - Get all submitted manifests (for dispatch)
router.get('/manifests', authenticateMedicine, async (req, res) => {
  try {
    const manifests = await MedicineManifest.find({
      medicineUserId: req.medicine._id,
      status: 'submitted'
    })
      .sort({ createdAt: -1 })
      .populate('coloaderId', 'phoneNumber busNumber')
      .populate('consignments.bookingId', 'consignmentNumber origin destination shipment package');
    
    res.status(200).json({
      success: true,
      data: manifests,
      count: manifests.length
    });
  } catch (error) {
    console.error('Error fetching manifests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manifests',
      message: error.message
    });
  }
});

// GET /api/medicine/manifests/all - Get all manifests with year filtering (for viewing)
router.get('/manifests/all', authenticateMedicine, async (req, res) => {
  try {
    const { year } = req.query;
    
    // Default to current financial year if not provided
    let financialYear = year ? parseInt(year) : null;
    
    if (!financialYear) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      // Financial year starts from April (month 4)
      if (currentMonth >= 4) {
        financialYear = now.getFullYear();
      } else {
        financialYear = now.getFullYear() - 1;
      }
    }
    
    // Financial year runs from April 1 to March 31
    const startDate = new Date(financialYear, 3, 1); // April 1 (month 3 = April)
    const endDate = new Date(financialYear + 1, 2, 31, 23, 59, 59, 999); // March 31
    
    const manifests = await MedicineManifest.find({
      medicineUserId: req.medicine._id,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ createdAt: -1 })
      .populate('coloaderId', 'phoneNumber busNumber')
      .populate('consignments.bookingId', 'consignmentNumber origin destination shipment package');
    
    res.status(200).json({
      success: true,
      data: manifests,
      count: manifests.length,
      financialYear: financialYear,
      startDate: startDate,
      endDate: endDate
    });
  } catch (error) {
    console.error('Error fetching all manifests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manifests',
      message: error.message
    });
  }
});

// POST /api/medicine/manifests/:id/dispatch - Dispatch manifest with coloader assignment
router.post('/manifests/:id/dispatch', authenticateMedicine, async (req, res) => {
  try {
    const { id } = req.params;
    const { coloaderId, contentDescription } = req.body;
    
    if (!coloaderId) {
      return res.status(400).json({
        success: false,
        error: 'Coloader is required',
        message: 'Please select a coloader to dispatch'
      });
    }
    
    // Find the manifest
    const manifest = await MedicineManifest.findById(id);
    
    if (!manifest) {
      return res.status(404).json({
        success: false,
        error: 'Manifest not found'
      });
    }
    
    // Check if manifest belongs to the user
    if (manifest.medicineUserId.toString() !== req.medicine._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to dispatch this manifest'
      });
    }
    
    // Check if manifest is already dispatched
    if (manifest.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'Manifest already dispatched',
        message: 'This manifest has already been dispatched'
      });
    }
    
    // Verify coloader exists
    const coloader = await MedicineColoader.findById(coloaderId);
    if (!coloader || !coloader.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Coloader not found',
        message: 'The selected coloader does not exist or is inactive'
      });
    }
    
    // Get all booking IDs from manifest
    const bookingIds = manifest.consignments.map(c => c.bookingId);
    
    // Update manifest
    manifest.status = 'dispatched';
    manifest.coloaderId = coloaderId;
    manifest.contentDescription = contentDescription || '';
    await manifest.save();
    
    // Update all bookings in the manifest with coloader assignment
    await MedicineBooking.updateMany(
      { _id: { $in: bookingIds } },
      { 
        $set: { 
          coloaderId: coloaderId,
          status: 'in_transit'
        } 
      }
    );
    
    console.log(`✅ Manifest ${manifest.manifestNumber} dispatched with coloader ${coloader.busNumber}`);
    
    res.status(200).json({
      success: true,
      message: 'Manifest dispatched successfully',
      data: {
        manifestId: manifest._id,
        manifestNumber: manifest.manifestNumber,
        coloaderId: coloader._id,
        coloaderBusNumber: coloader.busNumber,
        bookingsCount: bookingIds.length
      }
    });
  } catch (error) {
    console.error('Error dispatching manifest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dispatch manifest',
      message: error.message
    });
  }
});

export default router;


