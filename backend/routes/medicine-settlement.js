import express from 'express';
import MedicineBooking from '../models/MedicineBooking.js';
import MedicineSettlement from '../models/MedicineSettlement.js';
import MedicineOclCharge from '../models/MedicineOclCharge.js';
import { authenticateMedicine } from '../middleware/auth.js';
import googleSheetsService from '../services/googleSheetsService.js';

const router = express.Router();

// GET /api/medicine/settlements - Get settlements for a specific month/year
router.get('/settlements', authenticateMedicine, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Validate month and year
    const settlementMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const settlementYear = year ? parseInt(year) : new Date().getFullYear();
    
    if (isNaN(settlementMonth) || settlementMonth < 1 || settlementMonth > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month',
        message: 'Month must be between 1 and 12'
      });
    }
    
    if (isNaN(settlementYear) || settlementYear < 2020 || settlementYear > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year',
        message: 'Year must be between 2020 and 2030'
      });
    }
    
    // Find settlements for the specified month/year
    const settlements = await MedicineSettlement.find({
      settlementMonth,
      settlementYear
    }).sort({ createdAt: -1 });
    
    // Check for bookings without settlement records
    const startDate = new Date(settlementYear, settlementMonth - 1, 1);
    const endDate = new Date(settlementYear, settlementMonth, 0, 23, 59, 59, 999);
    
    console.log(`🔍 Checking bookings between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    const allBookings = await MedicineBooking.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      medicineUserId: req.medicine._id
    });
    
    console.log(`📊 Found ${allBookings.length} total bookings for medicine user ${req.medicine._id}`);
    console.log(`📊 Existing settlements: ${settlements.length}`);
    if (allBookings.length > 0) {
      console.log('Booking details:', allBookings.map(b => ({
        id: b._id,
        consignment: b.consignmentNumber,
        createdAt: b.createdAt,
        sender: b.origin?.name,
        cost: b.charges?.grandTotal
      })));
    }
    
    // Get booking IDs that already have settlements
    const existingBookingIds = settlements.map(s => s.medicineBookingId.toString());
    
    // Find bookings that don't have settlement records yet
    // AND have consignment numbers assigned (skip pending bookings without consignment numbers)
    const newBookings = allBookings.filter(booking => 
      !existingBookingIds.includes(booking._id.toString()) && 
      booking.consignmentNumber  // Only include bookings with consignment numbers
    );
    
    console.log(`📦 New bookings with consignment numbers: ${newBookings.length}`);
    if (newBookings.length > 0) {
      console.log('New bookings to add:', newBookings.map(b => ({
        consignment: b.consignmentNumber,
        sender: b.origin?.name,
        cost: b.charges?.grandTotal
      })));
    }
    
    // Create settlement records for new bookings
    if (newBookings.length > 0) {
      const newSettlementPromises = newBookings.map(async (booking) => {
        const cost = booking.charges?.grandTotal 
          ? parseFloat(booking.charges.grandTotal) 
          : 0;
        
        // Extract weight from booking - try multiple sources
        let weight = 0;
        if (booking.shipment?.chargeableWeight && booking.shipment.chargeableWeight > 0) {
          weight = parseFloat(booking.shipment.chargeableWeight);
        } else if (booking.shipment?.actualWeight && booking.shipment.actualWeight !== '') {
          weight = parseFloat(booking.shipment.actualWeight);
        } else if (booking.shipment?.perKgWeight && booking.shipment.perKgWeight !== '') {
          weight = parseFloat(booking.shipment.perKgWeight);
        }
        
        // Calculate commission: weight × 10 rs per kg
        const commission = weight * 10;
        
        // Map 'recipient' to 'receiver' for paidBy field
        let paidBy = booking.billing?.partyType || 'sender';
        if (paidBy === 'recipient') {
          paidBy = 'receiver';
        }
        
        const settlement = new MedicineSettlement({
          medicineBookingId: booking._id,
          consignmentNumber: booking.consignmentNumber,
          senderName: booking.origin?.name || '',
          receiverName: booking.destination?.name || '',
          paidBy: paidBy,
          cost: cost,
          weight: weight,
          commission: commission,
          isPaid: booking.billing?.partyType === 'sender',
          settlementMonth,
          settlementYear
        });
        
        return await settlement.save();
      });
      
      await Promise.all(newSettlementPromises);
      console.log(`✅ Added ${newBookings.length} new bookings to settlements`);
    }
    
    // Re-fetch all settlements to include newly created ones
    const allSettlements = await MedicineSettlement.find({
      settlementMonth,
      settlementYear
    }).sort({ createdAt: -1 });
    
    // Populate weight and commission from bookings if missing in settlement records
    const settlementsWithWeight = await Promise.all(allSettlements.map(async (settlement) => {
      // If weight is already in settlement and is greater than 0, use it
      if (settlement.weight > 0 && settlement.commission > 0) {
        return settlement;
      }
      
      // Otherwise, fetch from booking and update
      try {
        const booking = await MedicineBooking.findById(settlement.medicineBookingId);
        if (booking) {
          console.log(`Found booking for settlement #${settlement.consignmentNumber}:`, {
            chargeableWeight: booking.shipment?.chargeableWeight,
            actualWeight: booking.shipment?.actualWeight,
            perKgWeight: booking.shipment?.perKgWeight
          });
          
          // Try multiple sources for weight
          let weight = 0;
          
          // First priority: chargeableWeight (Number)
          if (booking.shipment?.chargeableWeight && booking.shipment.chargeableWeight > 0) {
            weight = parseFloat(booking.shipment.chargeableWeight);
          }
          // Second priority: actualWeight (String)
          else if (booking.shipment?.actualWeight && booking.shipment.actualWeight !== '') {
            weight = parseFloat(booking.shipment.actualWeight);
          }
          // Third priority: perKgWeight (String)
          else if (booking.shipment?.perKgWeight && booking.shipment.perKgWeight !== '') {
            weight = parseFloat(booking.shipment.perKgWeight);
          }
          
          const commission = weight * 10;
          
          console.log(`Updating settlement #${settlement.consignmentNumber} with weight: ${weight}kg, commission: ₹${commission}`);
          
          // Update settlement with weight and commission
          settlement.weight = weight;
          settlement.commission = commission;
          await settlement.save();
        } else {
          console.log(`❌ No booking found for settlement #${settlement.consignmentNumber} (ID: ${settlement.medicineBookingId})`);
        }
      } catch (err) {
        console.error(`Error fetching booking for settlement ${settlement._id}:`, err.message);
      }
      
      return settlement;
    }));
    
    // If settlements were created or updated, auto-sync to Google Sheets
    if (settlementsWithWeight.length > 0 && (settlements.length === 0 || newBookings.length > 0)) {
      try {
        const grandTotal = settlementsWithWeight.reduce((sum, item) => sum + item.cost, 0);
        const totalWeight = settlementsWithWeight.reduce((sum, item) => sum + (item.weight || 0), 0);
        const totalCommission = settlementsWithWeight.reduce((sum, item) => sum + (item.commission || 0), 0);
        
        // Auto-calculate OCL charge as: Grand Total - Total Commission
        const autoCalculatedOclCharge = grandTotal - totalCommission;
        
        // Check if manual OCL charge exists, otherwise use auto-calculated
        let oclCharge = autoCalculatedOclCharge;
        try {
          const oclDoc = await MedicineOclCharge.findOne({ month: settlementMonth, year: settlementYear });
          if (oclDoc && oclDoc.amount !== undefined && oclDoc.amount !== null) {
            oclCharge = oclDoc.amount; // Use manual override if exists
          }
        } catch (e) {
          console.log('OCL charge not found, using auto-calculated value');
        }
        
        const settlementData = {
          settlements: settlementsWithWeight.map(s => ({
            consignmentNumber: s.consignmentNumber,
            senderName: s.senderName,
            receiverName: s.receiverName,
            paidBy: s.paidBy,
            cost: s.cost,
            weight: s.weight || 0,
            commission: s.commission || 0,
            createdAt: s.createdAt
          })),
          grandTotal,
          totalWeight,
          totalCommission,
          autoCalculatedOclCharge,
          oclCharge,
          remainingBalance: grandTotal - oclCharge,
          totalTransactions: settlementsWithWeight.length
        };
        
        await googleSheetsService.syncSettlementData(settlementData, settlementMonth, settlementYear);
        console.log(`✅ Auto-synced ${settlementsWithWeight.length} settlements to Google Sheets`);
      } catch (syncError) {
        console.error('Auto-sync to Google Sheets failed:', syncError.message);
      }
    }
    
    return res.json({
      success: true,
      data: settlementsWithWeight,
      message: newBookings.length > 0 
        ? `Found ${newBookings.length} new booking(s) and synced to settlements`
        : undefined
    });
    
    // Old code below - keeping for backward compatibility if no bookings exist at all
    // If no settlements exist, create them from bookings
    if (false && settlements.length === 0) {
      // Find bookings for the specified month/year
      const startDate = new Date(settlementYear, settlementMonth - 1, 1);
      const endDate = new Date(settlementYear, settlementMonth, 0, 23, 59, 59, 999);
      
      const bookings = await MedicineBooking.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        medicineUserId: req.medicine._id
      });
      
      // Create settlement records for each booking
      const settlementPromises = bookings.map(async (booking) => {
        // Calculate cost from charges
        const cost = booking.charges?.grandTotal 
          ? parseFloat(booking.charges.grandTotal) 
          : 0;
        
        // Extract weight from booking - try multiple sources
        let weight = 0;
        if (booking.shipment?.chargeableWeight && booking.shipment.chargeableWeight > 0) {
          weight = parseFloat(booking.shipment.chargeableWeight);
        } else if (booking.shipment?.actualWeight && booking.shipment.actualWeight !== '') {
          weight = parseFloat(booking.shipment.actualWeight);
        } else if (booking.shipment?.perKgWeight && booking.shipment.perKgWeight !== '') {
          weight = parseFloat(booking.shipment.perKgWeight);
        }
        
        // Calculate commission: weight × 10 rs per kg
        const commission = weight * 10;
        
        const settlement = new MedicineSettlement({
          medicineBookingId: booking._id,
          consignmentNumber: booking.consignmentNumber,
          senderName: booking.origin?.name || '',
          receiverName: booking.destination?.name || '',
          paidBy: booking.billing?.partyType || 'sender',
          cost: cost,
          weight: weight,
          commission: commission,
          isPaid: booking.billing?.partyType === 'sender', // Mark as paid if sender pays
          settlementMonth,
          settlementYear
        });
        
        return await settlement.save();
      });
      
      await Promise.all(settlementPromises);
      
      // Fetch the newly created settlements
      const newSettlements = await MedicineSettlement.find({
        settlementMonth,
        settlementYear
      }).sort({ createdAt: -1 });
      
      // Auto-sync to Google Sheets
      try {
        const grandTotal = newSettlements.reduce((sum, item) => sum + item.cost, 0);
        const totalWeight = newSettlements.reduce((sum, item) => sum + (item.weight || 0), 0);
        const totalCommission = newSettlements.reduce((sum, item) => sum + (item.commission || 0), 0);
        
        // Auto-calculate OCL charge
        const autoCalculatedOclCharge = grandTotal - totalCommission;
        
        let oclCharge = autoCalculatedOclCharge;
        try {
          const oclDoc = await MedicineOclCharge.findOne({ month: settlementMonth, year: settlementYear });
          if (oclDoc && oclDoc.amount !== undefined && oclDoc.amount !== null) {
            oclCharge = oclDoc.amount;
          }
        } catch (e) {
          console.log('OCL charge not found, using auto-calculated value');
        }
        
        const settlementData = {
          settlements: newSettlements.map(s => ({
            consignmentNumber: s.consignmentNumber,
            senderName: s.senderName,
            receiverName: s.receiverName,
            paidBy: s.paidBy,
            cost: s.cost,
            weight: s.weight || 0,
            commission: s.commission || 0,
            createdAt: s.createdAt
          })),
          grandTotal,
          totalWeight,
          totalCommission,
          autoCalculatedOclCharge,
          oclCharge,
          remainingBalance: grandTotal - oclCharge,
          totalTransactions: newSettlements.length
        };
        
        await googleSheetsService.syncSettlementData(settlementData, settlementMonth, settlementYear);
        console.log(`✅ Auto-synced ${newSettlements.length} settlements to Google Sheets`);
      } catch (syncError) {
        console.error('Auto-sync to Google Sheets failed:', syncError.message);
        // Don't fail the request if sync fails, just log it
      }
      
      return res.json({
        success: true,
        data: newSettlements,
        message: `Created ${newSettlements.length} settlement records and synced to Google Sheets`
      });
    }
    
    res.json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settlements',
      message: error.message
    });
  }
});

// POST /api/medicine/settlements/generate - Generate settlements for a specific month/year
router.post('/settlements/generate', authenticateMedicine, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Validate month and year
    const settlementMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const settlementYear = year ? parseInt(year) : new Date().getFullYear();
    
    if (isNaN(settlementMonth) || settlementMonth < 1 || settlementMonth > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month',
        message: 'Month must be between 1 and 12'
      });
    }
    
    if (isNaN(settlementYear) || settlementYear < 2020 || settlementYear > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year',
        message: 'Year must be between 2020 and 2030'
      });
    }
    
    // Check if settlements already exist for this month/year
    const existingSettlements = await MedicineSettlement.find({
      settlementMonth,
      settlementYear
    });
    
    if (existingSettlements.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Settlements already exist',
        message: `Settlements for ${settlementMonth}/${settlementYear} already exist`
      });
    }
    
    // Find bookings for the specified month/year
    const startDate = new Date(settlementYear, settlementMonth - 1, 1);
    const endDate = new Date(settlementYear, settlementMonth, 0, 23, 59, 59, 999);
    
    const bookings = await MedicineBooking.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      medicineUserId: req.medicine._id
    });
    
      // Create settlement records for each booking
      const settlementPromises = bookings.map(async (booking) => {
        // Calculate cost from charges
        const cost = booking.charges?.grandTotal 
          ? parseFloat(booking.charges.grandTotal) 
          : 0;
        
        // Extract weight from booking - try multiple sources
        let weight = 0;
        if (booking.shipment?.chargeableWeight && booking.shipment.chargeableWeight > 0) {
          weight = parseFloat(booking.shipment.chargeableWeight);
        } else if (booking.shipment?.actualWeight && booking.shipment.actualWeight !== '') {
          weight = parseFloat(booking.shipment.actualWeight);
        } else if (booking.shipment?.perKgWeight && booking.shipment.perKgWeight !== '') {
          weight = parseFloat(booking.shipment.perKgWeight);
        }
        
        // Calculate commission: weight × 10 rs per kg
        const commission = weight * 10;
        
        // Map 'recipient' to 'receiver' for paidBy field
        let paidBy = booking.billing?.partyType || 'sender';
        if (paidBy === 'recipient') {
          paidBy = 'receiver';
        }
        
        const settlement = new MedicineSettlement({
          medicineBookingId: booking._id,
          consignmentNumber: booking.consignmentNumber,
          senderName: booking.origin?.name || '',
          receiverName: booking.destination?.name || '',
          paidBy: paidBy,
          cost: cost,
          weight: weight,
          commission: commission,
          isPaid: booking.billing?.partyType === 'sender', // Mark as paid if sender pays
          settlementMonth,
          settlementYear
        });
        
        return await settlement.save();
      });
    
    const createdSettlements = await Promise.all(settlementPromises);
    
    // Auto-sync to Google Sheets
    try {
      const grandTotal = createdSettlements.reduce((sum, item) => sum + item.cost, 0);
      const totalWeight = createdSettlements.reduce((sum, item) => sum + (item.weight || 0), 0);
      const totalCommission = createdSettlements.reduce((sum, item) => sum + (item.commission || 0), 0);
      
      // Auto-calculate OCL charge
      const autoCalculatedOclCharge = grandTotal - totalCommission;
      
      let oclCharge = autoCalculatedOclCharge;
      try {
        const oclDoc = await MedicineOclCharge.findOne({ month: settlementMonth, year: settlementYear });
        if (oclDoc && oclDoc.amount !== undefined && oclDoc.amount !== null) {
          oclCharge = oclDoc.amount;
        }
      } catch (e) {
        console.log('OCL charge not found, using auto-calculated value');
      }
      
      const settlementData = {
        settlements: createdSettlements.map(s => ({
          consignmentNumber: s.consignmentNumber,
          senderName: s.senderName,
          receiverName: s.receiverName,
          paidBy: s.paidBy,
          cost: s.cost,
          weight: s.weight || 0,
          commission: s.commission || 0,
          createdAt: s.createdAt
        })),
        grandTotal,
        totalWeight,
        totalCommission,
        autoCalculatedOclCharge,
        oclCharge,
        remainingBalance: grandTotal - oclCharge,
        totalTransactions: createdSettlements.length
      };
      
      await googleSheetsService.syncSettlementData(settlementData, settlementMonth, settlementYear);
      console.log(`✅ Auto-synced ${createdSettlements.length} settlements to Google Sheets`);
    } catch (syncError) {
      console.error('Auto-sync to Google Sheets failed:', syncError.message);
      // Don't fail the request if sync fails, just log it
    }
    
    res.status(201).json({
      success: true,
      message: `Generated ${createdSettlements.length} settlement records and synced to Google Sheets`,
      data: createdSettlements
    });
  } catch (error) {
    console.error('Error generating settlements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate settlements',
      message: error.message
    });
  }
});

// GET /api/medicine/ocl-charge - Get OCL charge for month/year (read-only for medicine user)
router.get('/ocl-charge', authenticateMedicine, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    if (isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month' });
    }
    if (isNaN(y) || y < 2020 || y > 2030) {
      return res.status(400).json({ success: false, message: 'Invalid year' });
    }

    const doc = await MedicineOclCharge.findOne({ month: m, year: y });
    return res.json({ success: true, data: { amount: doc?.amount || 0 } });
  } catch (error) {
    console.error('Error fetching OCL charge for medicine:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch OCL charge' });
  }
});

// POST /api/medicine/settlements/sync-to-sheets - Sync settlement data to Google Sheets
router.post('/settlements/sync-to-sheets', authenticateMedicine, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Validate month and year
    const settlementMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const settlementYear = year ? parseInt(year) : new Date().getFullYear();
    
    if (isNaN(settlementMonth) || settlementMonth < 1 || settlementMonth > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month',
        message: 'Month must be between 1 and 12'
      });
    }
    
    if (isNaN(settlementYear) || settlementYear < 2020 || settlementYear > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year',
        message: 'Year must be between 2020 and 2030'
      });
    }
    
    // Find settlements for the specified month/year
    const settlements = await MedicineSettlement.find({
      settlementMonth,
      settlementYear
    }).sort({ createdAt: -1 });
    
    if (settlements.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No settlements found',
        message: `No settlement data found for ${settlementMonth}/${settlementYear}`
      });
    }
    
    // Calculate totals
    const grandTotal = settlements.reduce((sum, item) => sum + item.cost, 0);
    const totalWeight = settlements.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalCommission = settlements.reduce((sum, item) => sum + (item.commission || 0), 0);
    
    // Auto-calculate OCL charge
    const autoCalculatedOclCharge = grandTotal - totalCommission;
    
    // Get OCL charge (manual override if exists)
    let oclCharge = autoCalculatedOclCharge;
    try {
      const oclDoc = await MedicineOclCharge.findOne({ 
        month: settlementMonth, 
        year: settlementYear 
      });
      if (oclDoc && oclDoc.amount !== undefined && oclDoc.amount !== null) {
        oclCharge = oclDoc.amount;
      }
    } catch (error) {
      console.log('OCL charge not found, using auto-calculated value');
    }
    
    const remainingBalance = grandTotal - oclCharge;
    
    // Prepare data for Google Sheets
    const settlementData = {
      settlements: settlements.map(s => ({
        consignmentNumber: s.consignmentNumber,
        senderName: s.senderName,
        receiverName: s.receiverName,
        paidBy: s.paidBy,
        cost: s.cost,
        weight: s.weight || 0,
        commission: s.commission || 0,
        createdAt: s.createdAt
      })),
      grandTotal,
      totalWeight,
      totalCommission,
      autoCalculatedOclCharge,
      oclCharge,
      remainingBalance,
      totalTransactions: settlements.length
    };
    
    // Sync to Google Sheets
    const result = await googleSheetsService.syncSettlementData(
      settlementData,
      settlementMonth,
      settlementYear
    );
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        sheetName: result.sheetName,
        rowsAdded: result.rowsAdded,
        totalTransactions: settlements.length,
        grandTotal,
        totalWeight,
        totalCommission,
        autoCalculatedOclCharge,
        oclCharge,
        remainingBalance
      }
    });
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync to Google Sheets',
      message: error.message || 'An error occurred while syncing data'
    });
  }
});

export default router;