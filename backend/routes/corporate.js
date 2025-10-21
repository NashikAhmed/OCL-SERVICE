import express from 'express';
import CorporateData from '../models/CorporateData.js';
import ConsignmentAssignment, { ConsignmentUsage } from '../models/ConsignmentAssignment.js';
import { generateToken, authenticateCorporate, validateLoginInput } from '../middleware/auth.js';
import { uploadCorporateLogo, handleCorporateLogoUploadError } from '../middleware/corporateLogoUpload.js';

const router = express.Router();

// Corporate login route
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`Corporate login attempt: ${username}`);
    
    // Find corporate by username (which is email or phone)
    const corporate = await CorporateData.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
        { contactNumber: username.replace(/\D/g, '') }
      ]
    });
    
    if (!corporate) {
      return res.status(401).json({ 
        error: 'Invalid username or password.' 
      });
    }
    
    if (!corporate.isActive) {
      return res.status(401).json({ 
        error: 'Corporate account is deactivated.' 
      });
    }
    
    // Check password
    const isPasswordValid = await corporate.verifyPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid username or password.' 
      });
    }
    
    // Update last login
    corporate.lastLogin = new Date();
    await corporate.save();
    
    // Generate JWT token
    const token = generateToken(corporate._id, 'corporate');
    
    console.log(`✅ Corporate login successful: ${corporate.companyName} (${corporate.corporateId})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      corporate: {
        id: corporate._id,
        corporateId: corporate.corporateId,
        companyName: corporate.companyName,
        email: corporate.email,
        contactNumber: corporate.contactNumber,
        username: corporate.username,
        lastLogin: corporate.lastLogin,
        isFirstLogin: corporate.isFirstLogin || false,
        logo: corporate.logo
      }
    });
    
  } catch (error) {
    console.error('Corporate login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Get current corporate profile
router.get('/profile', authenticateCorporate, async (req, res) => {
  try {
    res.json({
      success: true,
      corporate: {
        id: req.corporate._id,
        corporateId: req.corporate.corporateId,
        companyName: req.corporate.companyName,
        email: req.corporate.email,
        contactNumber: req.corporate.contactNumber,
        companyAddress: req.corporate.companyAddress,
        flatNumber: req.corporate.flatNumber,
        landmark: req.corporate.landmark,
        city: req.corporate.city,
        state: req.corporate.state,
        pin: req.corporate.pin,
        locality: req.corporate.locality,
        gstNumber: req.corporate.gstNumber,
        logo: req.corporate.logo,
        registrationDate: req.corporate.registrationDate,
        lastLogin: req.corporate.lastLogin,
        isActive: req.corporate.isActive
      }
    });
  } catch (error) {
    console.error('Get corporate profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile information.' 
    });
  }
});

// Change password (first time or regular change)
router.post('/change-password', authenticateCorporate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long.'
      });
    }
    
    // For first-time login, currentPassword might be the generated password
    // For regular password changes, verify current password
    if (!req.corporate.isFirstLogin) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Current password is required.'
        });
      }
      
      const isCurrentPasswordValid = await req.corporate.verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Current password is incorrect.'
        });
      }
    }
    
    // Update password
    req.corporate.password = newPassword;
    req.corporate.isFirstLogin = false; // Mark as no longer first login
    await req.corporate.save();
    
    console.log(`✅ Password changed for corporate: ${req.corporate.companyName} (${req.corporate.corporateId})`);
    
    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password.' 
    });
  }
});

// Get corporate dashboard stats
router.get('/dashboard-stats', authenticateCorporate, async (req, res) => {
  try {
    // Get basic corporate information
    const corporate = req.corporate;
    
    // Import ConsignmentUsage model
    const { ConsignmentUsage } = await import('../models/ConsignmentAssignment.js');
    
    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get all shipments for this corporate
    const allShipments = await ConsignmentUsage.find({
      corporateId: corporate._id
    }).lean();
    
    // Get monthly shipments
    const monthlyShipments = await ConsignmentUsage.find({
      corporateId: corporate._id,
      usedAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).lean();
    
    // Calculate summary statistics
    const totalShipments = allShipments.length;
    const pendingShipments = allShipments.filter(s => s.status === 'active').length;
    const completedShipments = allShipments.filter(s => s.status === 'completed').length;
    const totalSpent = allShipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    
    // Calculate TP metrics
    const tpPaidShipments = allShipments.filter(s => 
      s.paymentType === 'TP' && s.paymentStatus === 'paid'
    ).length;
    
    const fpUnpaidShipments = allShipments.filter(s => 
      s.paymentType === 'FP' && s.paymentStatus === 'unpaid' && s.status === 'active'
    ).length;
    
    const tpUnpaidShipments = allShipments.filter(s => 
      s.paymentType === 'TP' && s.paymentStatus === 'unpaid' && s.status === 'active'
    ).length;
    
    // Calculate monthly statistics
    const monthlyShipmentCount = monthlyShipments.length;
    const monthlySpend = monthlyShipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const deliveryRate = totalShipments > 0 ? Math.round((completedShipments / totalShipments) * 100) : 0;
    
    // Get recent shipments (last 5)
    const recentShipments = allShipments
      .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
      .slice(0, 5)
      .map(shipment => ({
        id: shipment._id.toString(),
        consignmentNumber: shipment.consignmentNumber.toString(),
        destination: `${shipment.bookingData?.destinationData?.city || 'Unknown'}, ${shipment.bookingData?.destinationData?.state || 'Unknown'}`,
        status: shipment.status === 'active' ? 'In Transit' : shipment.status === 'completed' ? 'Delivered' : 'Pending',
        date: new Date(shipment.usedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      }));
    
    const stats = {
      corporate: {
        id: corporate._id,
        corporateId: corporate.corporateId,
        companyName: corporate.companyName,
        email: corporate.email,
        contactNumber: corporate.contactNumber,
        registrationDate: corporate.registrationDate,
        lastLogin: corporate.lastLogin,
        isActive: corporate.isActive,
        billingType: corporate.billingType || 'Standard',
        manager: corporate.manager || 'Not Assigned',
        billingCycle: corporate.billingCycle || 'Monthly',
        companyAddress: corporate.companyAddress,
        city: corporate.city,
        state: corporate.state,
        pin: corporate.pin,
        locality: corporate.locality,
        gstNumber: corporate.gstNumber,
        logo: corporate.logo
      },
      summary: {
        totalShipments,
        pendingShipments,
        completedShipments,
        totalSpent
      },
      monthly: {
        shipments: monthlyShipmentCount,
        spend: monthlySpend,
        deliveryRate
      },
      recentShipments,
      complaints: {
        active: 0, // Placeholder - can be implemented later
        resolved: 0 // Placeholder - can be implemented later
      },
      tpMetrics: {
        tpPaidShipments,
        fpUnpaidShipments,
        tpUnpaidShipments
      }
    };
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Get corporate dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard statistics.' 
    });
  }
});

// Update corporate profile
router.put('/profile', authenticateCorporate, async (req, res) => {
  try {
    const allowedUpdates = ['contactNumber', 'email', 'companyAddress', 'flatNumber', 'landmark'];
    const updates = {};
    
    // Only allow certain fields to be updated
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update.'
      });
    }
    
    const updatedCorporate = await CorporateData.findByIdAndUpdate(
      req.corporate._id,
      updates,
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Corporate profile updated: ${updatedCorporate.companyName} (${updatedCorporate.corporateId})`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      corporate: {
        id: updatedCorporate._id,
        corporateId: updatedCorporate.corporateId,
        companyName: updatedCorporate.companyName,
        email: updatedCorporate.email,
        contactNumber: updatedCorporate.contactNumber,
        companyAddress: updatedCorporate.companyAddress,
        flatNumber: updatedCorporate.flatNumber,
        landmark: updatedCorporate.landmark,
        logo: updatedCorporate.logo
      }
    });
    
  } catch (error) {
    console.error('Update corporate profile error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  }
});

// Upload corporate logo
router.post('/upload-logo', authenticateCorporate, uploadCorporateLogo, handleCorporateLogoUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No logo file uploaded'
      });
    }
    
    // Update corporate record with logo path
    const logoPath = `/uploads/corporate-logos/${req.file.filename}`;
    
    const updatedCorporate = await CorporateData.findByIdAndUpdate(
      req.corporate._id,
      { logo: logoPath },
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Corporate logo uploaded: ${updatedCorporate.companyName} (${updatedCorporate.corporateId})`);
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: logoPath,
      corporate: {
        id: updatedCorporate._id,
        corporateId: updatedCorporate.corporateId,
        companyName: updatedCorporate.companyName,
        logo: updatedCorporate.logo
      }
    });
    
  } catch (error) {
    console.error('Upload corporate logo error:', error);
    res.status(500).json({ 
      error: 'Failed to upload logo' 
    });
  }
});

// Get corporate pricing assigned to this corporate client
router.get('/pricing', authenticateCorporate, async (req, res) => {
  try {
    const CorporatePricing = (await import('../models/CorporatePricing.js')).default;
    
    // Find the pricing plan assigned to this corporate client
    const pricing = await CorporatePricing.findOne({ 
      corporateClient: req.corporate._id,
      status: 'approved' // Only return approved pricing
    }).select('-__v -createdBy -approvedBy -rejectionReason -clientEmail -clientName -clientCompany -approvalToken -emailSentAt -emailApprovedAt -emailApprovedBy -emailRejectedAt -emailRejectionReason -notes');
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'No pricing plan has been assigned to your corporate account yet.'
      });
    }
    
    console.log(`✅ Corporate pricing retrieved for: ${req.corporate.companyName} (${req.corporate.corporateId})`);
    
    res.json({
      success: true,
      pricing
    });
    
  } catch (error) {
    console.error('Get corporate pricing error:', error);
    res.status(500).json({ 
      error: 'Failed to get pricing information.' 
    });
  }
});

// Calculate price based on corporate pricing
router.post('/calculate-price', authenticateCorporate, async (req, res) => {
  try {
    const { fromPincode, toPincode, weight, serviceType, deliveryType, transportMode } = req.body;
    
    // Validate required fields
    if (!fromPincode || !toPincode || !weight || !serviceType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fromPincode, toPincode, weight, serviceType'
      });
    }
    
    const CorporatePricing = (await import('../models/CorporatePricing.js')).default;
    
    // Find the pricing plan assigned to this corporate client
    const pricing = await CorporatePricing.findOne({ 
      corporateClient: req.corporate._id,
      status: 'approved'
    });
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'No approved pricing plan found for your corporate account.'
      });
    }
    
    // Helper functions for location classification
    const classifyLocation = (pincode) => {
      const pincodeNum = parseInt(pincode);
      
      // Assam pincodes (780xxx, 781xxx, 782xxx, 783xxx, 784xxx, 785xxx, 786xxx, 787xxx, 788xxx)
      if (pincodeNum >= 780000 && pincodeNum <= 788999) {
        return 'assam';
      }
      
      // North East pincodes (790xxx, 791xxx, 792xxx, 793xxx, 794xxx, 795xxx, 796xxx, 797xxx, 798xxx, 799xxx)
      if (pincodeNum >= 790000 && pincodeNum <= 799999) {
        return 'neBySurface';
      }
      
      // Rest of India
      return 'restOfIndia';
    };
    
    const isAssamPincode = (pincode) => {
      const pincodeNum = parseInt(pincode);
      return pincodeNum >= 780000 && pincodeNum <= 788999;
    };
    
    const isNorthEastPincode = (pincode) => {
      const pincodeNum = parseInt(pincode);
      return pincodeNum >= 790000 && pincodeNum <= 799999;
    };
    
    // Calculate price based on service type and conditions
    let price = 0;
    let location = '';
    let transportModeUsed = transportMode || 'byRoad';
    let chargeableWeight = parseFloat(weight);
    let isMinimumWeightApplied = false;
    let breakdown = {
      weightSlab: '',
      pricePerUnit: 0,
      units: 0,
      subtotal: 0
    };
    
    // Check if this is reverse pricing (from pincode provided and destination is Assam/North East)
    if (fromPincode && serviceType === 'non-dox') {
      // Reverse pricing logic
      const minChargeableWeights = {
        byRoad: 500,
        byTrain: 100,
        byFlight: 25
      };
      
      chargeableWeight = Math.max(parseFloat(weight), minChargeableWeights[transportModeUsed]);
      isMinimumWeightApplied = chargeableWeight > parseFloat(weight);

      if (isAssamPincode(toPincode)) {
        location = 'Assam';
        const pricePerKg = parseFloat(pricing.reversePricing.toAssam[transportModeUsed][deliveryType || 'normal']) || 0;
        price = pricePerKg * chargeableWeight;
        breakdown = {
          weightSlab: `${weight}kg (min: ${chargeableWeight}kg)`,
          pricePerUnit: pricePerKg,
          units: chargeableWeight,
          subtotal: price
        };
      } else if (isNorthEastPincode(toPincode)) {
        location = 'North East';
        const pricePerKg = parseFloat(pricing.reversePricing.toNorthEast[transportModeUsed][deliveryType || 'normal']) || 0;
        price = pricePerKg * chargeableWeight;
        breakdown = {
          weightSlab: `${weight}kg (min: ${chargeableWeight}kg)`,
          pricePerUnit: pricePerKg,
          units: chargeableWeight,
          subtotal: price
        };
      } else {
        return res.status(400).json({
          success: false,
          error: 'Reverse pricing is only available for Assam and North East destinations'
        });
      }
    } else {
      // Forward pricing logic
      const destinationLocation = classifyLocation(toPincode);
      location = destinationLocation;

      if (serviceType === 'dox') {
        // DOX pricing
        const weightNum = parseFloat(weight);
        
        if (weightNum <= 250) {
          const pricePerUnit = pricing.doxPricing['01gm-250gm'][destinationLocation] || 0;
          price = pricePerUnit;
          breakdown = {
            weightSlab: '0-250gm',
            pricePerUnit,
            units: weightNum,
            subtotal: pricePerUnit
          };
        } else if (weightNum <= 500) {
          const pricePerUnit = pricing.doxPricing['251gm-500gm'][destinationLocation] || 0;
          price = pricePerUnit;
          breakdown = {
            weightSlab: '251-500gm',
            pricePerUnit,
            units: weightNum,
            subtotal: pricePerUnit
          };
        } else {
          // For weights above 500gm, calculate base price + additional weight
          const basePrice = pricing.doxPricing['251gm-500gm'][destinationLocation] || 0;
          const additionalWeight = weightNum - 500;
          const additionalPrice = (pricing.doxPricing.add500gm[destinationLocation] || 0) * Math.ceil(additionalWeight / 500);
          
          breakdown = {
            weightSlab: `500gm + ${Math.ceil(additionalWeight / 500)} × 500gm`,
            pricePerUnit: pricing.doxPricing.add500gm[destinationLocation] || 0,
            units: Math.ceil(additionalWeight / 500),
            subtotal: basePrice + additionalPrice
          };
          price = basePrice + additionalPrice;
        }
      } else if (serviceType === 'non-dox') {
        // Non-DOX pricing
        const weightNum = parseFloat(weight);
        
        if (transportModeUsed === 'byRoad') {
          const pricePerKg = pricing.nonDoxSurfacePricing[destinationLocation] || 0;
          price = pricePerKg * weightNum;
          breakdown = {
            weightSlab: `${weight}kg`,
            pricePerUnit: pricePerKg,
            units: weightNum,
            subtotal: price
          };
        } else {
          const pricePerKg = pricing.nonDoxAirPricing[destinationLocation] || 0;
          price = pricePerKg * weightNum;
          breakdown = {
            weightSlab: `${weight}kg`,
            pricePerUnit: pricePerKg,
            units: weightNum,
            subtotal: price
          };
        }
      } else if (serviceType === 'priority') {
        // Priority pricing
        const weightNum = parseFloat(weight);
        
        if (weightNum <= 500) {
          const pricePerUnit = pricing.priorityPricing['01gm-500gm'][destinationLocation] || 0;
          price = pricePerUnit;
          breakdown = {
            weightSlab: '0-500gm',
            pricePerUnit,
            units: weightNum,
            subtotal: pricePerUnit
          };
        } else {
          const basePrice = pricing.priorityPricing['01gm-500gm'][destinationLocation] || 0;
          const additionalWeight = weightNum - 500;
          const additionalPrice = (pricing.priorityPricing.add500gm[destinationLocation] || 0) * Math.ceil(additionalWeight / 500);
          
          breakdown = {
            weightSlab: `500gm + ${Math.ceil(additionalWeight / 500)} × 500gm`,
            pricePerUnit: pricing.priorityPricing.add500gm[destinationLocation] || 0,
            units: Math.ceil(additionalWeight / 500),
            subtotal: basePrice + additionalPrice
          };
          price = basePrice + additionalPrice;
        }
      }
    }
    
    const gst = price * 0.18; // 18% GST
    const finalPrice = price + gst;
    
    const result = {
      basePrice: price,
      totalPrice: price,
      gst,
      finalPrice,
      serviceType,
      location,
      transportMode: transportModeUsed,
      chargeableWeight,
      isMinimumWeightApplied,
      breakdown
    };
    
    console.log(`✅ Price calculated for corporate: ${req.corporate.companyName} (${req.corporate.corporateId})`);
    
    res.json({
      success: true,
      calculation: result
    });
    
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate price. Please try again.' 
    });
  }
});

// Check if corporate has assigned consignment numbers
router.get('/consignment/check', authenticateCorporate, async (req, res) => {
  try {
    // Check if corporate has active consignment assignments
    const assignments = await ConsignmentAssignment.find({
      corporateId: req.corporate._id,
      isActive: true
    }).sort({ startNumber: 1 });
    
    if (!assignments || assignments.length === 0) {
      return res.json({
        success: false,
        hasAssignment: false,
        message: 'No consignment numbers assigned to your corporate account. Please contact admin to get consignment numbers assigned before making bookings.'
      });
    }
    
    // Get usage statistics across all assignments
    const usedCount = await ConsignmentUsage.countDocuments({
      corporateId: req.corporate._id
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
    console.error('Check consignment assignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check consignment assignment status'
    });
  }
});

// Corporate booking endpoint
router.post('/bookings', authenticateCorporate, async (req, res) => {
  try {
    const { originData, destinationData, shipmentData, invoiceData, paymentData } = req.body;
    
    // Validate required fields
    if (!originData || !destinationData || !shipmentData || !invoiceData || !paymentData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required booking data'
      });
    }
    
    // Check consignment availability first
    const assignments = await ConsignmentAssignment.find({
      corporateId: req.corporate._id,
      isActive: true
    });
    
    if (!assignments || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No consignment numbers assigned to your corporate account. Please contact admin.'
      });
    }

    // Check if any consignment numbers are available across all assignments
    const usedCount = await ConsignmentUsage.countDocuments({
      corporateId: req.corporate._id
    });
    
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.totalNumbers, 0);
    const availableCount = totalAssigned - usedCount;
    
    if (availableCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'All consignment numbers have been used. Please contact admin to get more consignment numbers assigned.'
      });
    }

    // Get next available consignment number for this corporate
    let consignmentNumber;
    try {
      consignmentNumber = await ConsignmentAssignment.getNextConsignmentNumber(req.corporate._id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'No consignment numbers assigned to your corporate account. Please contact admin.'
      });
    }
    
    // Create booking payload
    const bookingPayload = {
      corporateId: req.corporate._id,
      corporateInfo: {
        corporateId: req.corporate.corporateId,
        companyName: req.corporate.companyName,
        email: req.corporate.email,
        contactNumber: req.corporate.contactNumber
      },
      originData,
      destinationData,
      shipmentData,
      invoiceData,
      paymentData,
      consignmentNumber,
      bookingReference: consignmentNumber.toString(), // Use consignment number as booking reference
      bookingDate: new Date(),
      status: 'booked'
    };
    
    // Record consignment usage
    const usage = new ConsignmentUsage({
      corporateId: req.corporate._id,
      consignmentNumber: consignmentNumber,
      bookingReference: consignmentNumber.toString(),
      bookingData: bookingPayload,
      freightCharges: invoiceData.calculatedPrice || 0,
      totalAmount: invoiceData.finalPrice || 0,
      paymentType: paymentData?.paymentType || 'FP'
    });
    
    await usage.save();
    
    console.log(`✅ Corporate booking created: ${req.corporate.companyName} - Consignment: ${consignmentNumber}`);
    
    res.json({
      success: true,
      message: 'Booking created successfully',
      bookingReference: consignmentNumber.toString(),
      consignmentNumber: consignmentNumber,
      bookingData: bookingPayload
    });
    
  } catch (error) {
    console.error('Corporate booking error:', error);
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
        error: 'Failed to create booking'
      });
    }
  }
});

// Get corporate bookings
router.get('/bookings', authenticateCorporate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const bookings = await ConsignmentUsage.find({
      corporateId: req.corporate._id
    })
    .sort({ usedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    const totalCount = await ConsignmentUsage.countDocuments({
      corporateId: req.corporate._id
    });
    
    res.json({
      success: true,
      data: bookings,
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
    console.error('Get corporate bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookings'
    });
  }
});

// Get previous destinations by phone number
router.get('/destinations/phone/:phone', authenticateCorporate, async (req, res) => {
  try {
    const phone = req.params.phone;
    
    // Clean the phone number (remove any non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    console.log(`🔍 Searching for destinations with phone: ${cleanPhone} for corporate: ${req.corporate._id}`);
    
    // Find all bookings for this corporate that have matching destination phone numbers
    const bookings = await ConsignmentUsage.find({
      corporateId: req.corporate._id,
      'bookingData.destinationData.mobileNumber': { $regex: cleanPhone, $options: 'i' }
    })
    .sort({ usedAt: -1 })
    .lean();
    
    console.log(`📞 Found ${bookings.length} bookings with matching destination phone`);
    
    // Extract and transform destination data
    const destinations = bookings.map(booking => {
      const destData = booking.bookingData.destinationData;
      return {
        id: booking._id,
        bookingReference: booking.bookingReference,
        consignmentNumber: booking.consignmentNumber,
        usedAt: booking.usedAt,
        name: destData.name || '',
        companyName: destData.companyName || '',
        email: destData.email || '',
        mobileNumber: destData.mobileNumber || '',
        locality: destData.locality || '',
        flatBuilding: destData.flatBuilding || '',
        landmark: destData.landmark || '',
        pincode: destData.pincode || '',
        area: destData.area || '',
        city: destData.city || '',
        district: destData.district || '',
        state: destData.state || '',
        gstNumber: destData.gstNumber || '',
        addressType: destData.addressType || 'Office'
      };
    });
    
    // Remove duplicates based on phone number, name, and address
    const uniqueDestinations = destinations.filter((dest, index, self) => 
      index === self.findIndex(d => 
        d.mobileNumber === dest.mobileNumber && 
        d.name === dest.name && 
        d.flatBuilding === dest.flatBuilding &&
        d.pincode === dest.pincode
      )
    );
    
    console.log(`✅ Returning ${uniqueDestinations.length} unique destinations`);
    
    res.json({
      success: true,
      data: uniqueDestinations,
      count: uniqueDestinations.length
    });
    
  } catch (error) {
    console.error('Get destinations by phone error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get destinations by phone number'
    });
  }
});

// Request a courier
router.post('/request-courier', authenticateCorporate, async (req, res) => {
  try {
    const {
      pickupAddress,
      contactPerson,
      contactPhone,
      urgency,
      specialInstructions,
      packageCount
    } = req.body;

    // Validate required fields
    if (!pickupAddress || !contactPerson || !contactPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pickupAddress, contactPerson, contactPhone'
      });
    }

    // Create courier request record
    const courierRequest = {
      corporateId: req.corporate._id,
      corporateInfo: {
        corporateId: req.corporate.corporateId,
        companyName: req.corporate.companyName,
        email: req.corporate.email,
        contactNumber: req.corporate.contactNumber
      },
      requestData: {
        pickupAddress,
        contactPerson,
        contactPhone,
        urgency: urgency || 'normal',
        specialInstructions: specialInstructions || '',
        packageCount: packageCount || 1
      },
      status: 'pending',
      requestedAt: new Date(),
      estimatedResponseTime: '10-15 minutes'
    };

    // Store courier request in global variable for admin access
    if (!global.courierRequests) {
      global.courierRequests = [];
    }
    
    const requestWithId = {
      ...courierRequest,
      id: `CR-${Date.now()}`,
      status: 'pending'
    };
    
    global.courierRequests.unshift(requestWithId); // Add to beginning of array
    
    // Keep only last 100 requests to prevent memory issues
    if (global.courierRequests.length > 100) {
      global.courierRequests = global.courierRequests.slice(0, 100);
    }

    // Log the courier request for admin notification
    console.log('🚚 NEW COURIER REQUEST:', {
      timestamp: new Date().toISOString(),
      corporate: req.corporate.companyName,
      corporateId: req.corporate.corporateId,
      requestId: requestWithId.id,
      request: requestWithId
    });

    // TODO: Send notification to admin/operations team
    // This could be:
    // - Email notification
    // - SMS to operations team
    // - Push notification to admin dashboard
    // - Integration with courier management system

    res.json({
      success: true,
      message: 'Courier request submitted successfully',
      requestId: requestWithId.id,
      estimatedResponseTime: '10-15 minutes',
      data: requestWithId
    });

  } catch (error) {
    console.error('Courier request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit courier request'
    });
  }
});

// Get single booking by consignment number
router.get('/bookings/:consignmentNumber', authenticateCorporate, async (req, res) => {
  try {
    const { consignmentNumber } = req.params;
    
    const booking = await ConsignmentUsage.findOne({
      corporateId: req.corporate._id,
      consignmentNumber: parseInt(consignmentNumber)
    }).lean();
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get booking'
    });
  }
});

// Track consignment number (public endpoint)
router.get('/track/:consignmentNumber', async (req, res) => {
  try {
    const { consignmentNumber } = req.params;
    
    // Find the consignment usage record
    const usage = await ConsignmentUsage.findOne({
      consignmentNumber: parseInt(consignmentNumber)
    }).populate('corporateId', 'corporateId companyName').lean();
    
    if (!usage) {
      return res.status(404).json({
        success: false,
        error: 'Consignment number not found'
      });
    }
    
    // Return tracking information
    res.json({
      success: true,
      data: {
        consignmentNumber: usage.consignmentNumber,
        bookingReference: usage.bookingReference,
        corporate: {
          corporateId: usage.corporateId.corporateId,
          companyName: usage.corporateId.companyName
        },
        bookingData: usage.bookingData,
        status: usage.status,
        usedAt: usage.usedAt,
        timeline: [
          {
            status: 'booked',
            location: usage.bookingData.originData.city,
            timestamp: usage.usedAt,
            description: 'Shipment booked and ready for pickup'
          }
        ]
      }
    });
    
  } catch (error) {
    console.error('Track consignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track consignment'
    });
  }
});

export default router;
