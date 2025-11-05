import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import pincodeRoutes from "./routes/pincode.js";
import adminRoutes from "./routes/admin.js";
import officeRoutes from "./routes/office.js";
import uploadRoutes from "./routes/upload.js";
import coloaderRoutes from "./routes/coloader.js";
import corporateRoutes from "./routes/corporate.js";
import settlementRoutes from "./routes/settlement.js";
import invoicePdfRoutes from "./routes/invoice-pdf.js";
import courierComplaintRoutes from "./routes/courier-complaints.js";
import employeeRoutes from "./routes/employee.js";
import courierBoyRoutes from "./routes/courier-boy.js";
import otpRoutes from "./routes/otp.js";
import imageProxyRoutes from "./routes/image-proxy.js";
import medicineRoutes from "./routes/medicine.js";
import FormData from "./models/FormData.js";
import PinCodeArea from "./models/PinCodeArea.js";
import CorporateData from "./models/CorporateData.js";
import CorporatePricing from "./models/CorporatePricing.js";
import Admin from "./models/Admin.js";
import OfficeUser from "./models/OfficeUser.js";
import MedicineUser from "./models/MedicineUser.js";
import Coloader from "./models/Coloader.js";
import Employee from "./models/Employee.js";

dotenv.config();
const app = express();

// Configure logo upload
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure corporate logos directory exists
const corporateLogosDir = path.join(__dirname, 'uploads/corporate-logos');
if (!fs.existsSync(corporateLogosDir)) {
  fs.mkdirSync(corporateLogosDir, { recursive: true });
}

// Configure multer for corporate logo upload during registration
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, corporateLogosDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp for registration
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `temp-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for company logo!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for logo
    files: 1 // Only one logo file
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add multer middleware for multipart form data (for file uploads)
app.use((req, res, next) => {
  if (req.path === '/api/corporate/register' && req.method === 'POST') {
    // Skip multer for corporate registration as it's handled by the route
    next();
  } else {
    next();
  }
});

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/pincode", pincodeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/office", officeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coloader", coloaderRoutes);
app.use("/api/corporate", corporateRoutes);
app.use("/api/settlement", settlementRoutes);
app.use("/api/invoice", invoicePdfRoutes);
app.use("/api/courier-complaints", courierComplaintRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/courier-boy", courierBoyRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/images", imageProxyRoutes);
app.use("/api/medicine", medicineRoutes);

// Serve corporate logos
app.use('/uploads/corporate-logos', express.static(path.join(__dirname, 'uploads/corporate-logos')));

// Serve employee documents
app.use('/uploads/employee-docs', express.static(path.join(__dirname, 'uploads/employee-docs')));

// FORM DATA ROUTES

// Save or update form data (handles both sender and receiver)
app.post("/api/form", async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    const { formType, ...formData } = req.body;
    
    if (!formType || !['sender', 'receiver', 'full'].includes(formType)) {
      return res.status(400).json({ 
        error: 'formType must be either "sender", "receiver" or "full"' 
      });
    }
    
    // Validate required fields based on form type
    let requiredFields;
    if (formType === 'sender') {
      requiredFields = ['name', 'email', 'phone', 'pincode', 'state', 'city', 'district', 'area', 'addressLine1'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
    } else if (formType === 'receiver') {
      requiredFields = ['name', 'email', 'phone', 'pincode', 'state', 'city', 'district', 'area', 'addressLine1'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
    } else if (formType === 'full') {
      const { originData, destinationData, shipmentData, uploadData, paymentData } = req.body;
      if (!originData || !destinationData || !shipmentData || !uploadData || !paymentData) {
        return res.status(400).json({ error: 'All of originData, destinationData, shipmentData, uploadData, paymentData are required' });
      }
      // Basic validations
      const checkReq = (obj, fields) => fields.filter(f => !obj?.[f] || String(obj[f]).trim() === '');
      const originMissing = checkReq(originData, ['name','mobileNumber','pincode','city','state']);
      const destinationMissing = checkReq(destinationData, ['name','mobileNumber','pincode','city','state']);
      const paymentMissing = checkReq(paymentData, ['mode']);
      const totalPackagesNum = Number(uploadData?.totalPackages);
      const packagesOk = Number.isFinite(totalPackagesNum) && totalPackagesNum > 0;
      const missing = [];
      if (originMissing.length) missing.push(`originData: ${originMissing.join(', ')}`);
      if (destinationMissing.length) missing.push(`destinationData: ${destinationMissing.join(', ')}`);
      if (paymentMissing.length) missing.push(`paymentData: ${paymentMissing.join(', ')}`);
      if (!packagesOk) missing.push('uploadData: totalPackages');
      if (missing.length) {
        return res.status(400).json({ error: `Missing required fields -> ${missing.join(' | ')}` });
      }
    }

    let existingForm = null;
    
    if (formType === 'sender') {
      // For sender, check if form already exists with this sender email
      existingForm = await FormData.findOne({
        senderEmail: formData.email.toLowerCase()
      });
    } else if (formType === 'receiver') {
      // For receiver, we need the sender email to find the existing form
      // This should be passed from the frontend as senderEmail
      if (!req.body.senderEmail) {
        return res.status(400).json({ 
          error: 'Sender email is required for receiver form submission' 
        });
      }
      
      existingForm = await FormData.findOne({
        senderEmail: req.body.senderEmail.toLowerCase()
      });
      
      if (!existingForm) {
        return res.status(400).json({ 
          error: 'No sender form found. Please submit sender form first.' 
        });
      }
    } else if (formType === 'full') {
      // For full booking submissions, always create new forms
      // Don't look for existing forms to allow multiple bookings with same email
      existingForm = null;
    }
    
    // Helper: normalize possibly mixed inputs to array of strings
    const normalizeToStringArray = (input) => {
      if (Array.isArray(input)) {
        return input
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              // Check for serverPath first (from uploaded files), then other common path properties
              return item.serverPath || item.url || item.path || item.dataURL || item.data || item.name || '';
            }
            return '';
          })
          .filter((s) => typeof s === 'string' && s.trim() !== '');
      }
      if (typeof input === 'string') {
        try {
          const parsed = JSON.parse(input);
          return normalizeToStringArray(parsed);
        } catch {
          return input.trim() ? [input] : [];
        }
      }
      return [];
    };

    // Prepare the update data with proper field prefixes
    const updateData = {};
    if (formType === 'sender') {
      updateData.senderName = formData.name;
      updateData.senderEmail = formData.email.toLowerCase();
      updateData.senderPhone = formData.phone;
      updateData.senderPincode = formData.pincode;
      updateData.senderState = formData.state;
      updateData.senderCity = formData.city;
      updateData.senderDistrict = formData.district;
      updateData.senderArea = formData.area;
      updateData.senderAddressLine1 = formData.addressLine1;
      updateData.senderAddressLine2 = formData.addressLine2 || '';
      updateData.senderLandmark = formData.landmark || '';
    } else if (formType === 'receiver') {
      updateData.receiverName = formData.name;
      updateData.receiverEmail = formData.email.toLowerCase();
      updateData.receiverPhone = formData.phone;
      updateData.receiverPincode = formData.pincode;
      updateData.receiverState = formData.state;
      updateData.receiverCity = formData.city;
      updateData.receiverDistrict = formData.district;
      updateData.receiverArea = formData.area;
      updateData.receiverAddressLine1 = formData.addressLine1;
      updateData.receiverAddressLine2 = formData.addressLine2 || '';
      updateData.receiverLandmark = formData.landmark || '';
    } else if (formType === 'full') {
      // Merge all steps into one document
      const { originData, destinationData, shipmentData, uploadData, paymentData, consignmentNumber } = req.body;
      // Debug: Log the original invoice number
      console.log('🔍 DEBUG - Original invoice number from frontend:', uploadData?.invoiceNumber);
      console.log('🔍 DEBUG - Consignment number from frontend:', consignmentNumber);
      
      // sanitize uploadData
      const sanitizedUploadData = {
        ...uploadData,
        totalPackages: Number(uploadData?.totalPackages),
        packageImages: normalizeToStringArray(uploadData?.packageImages),
        invoiceImages: normalizeToStringArray(uploadData?.invoiceImages),
        invoiceValue: uploadData?.invoiceValue !== undefined ? Number(uploadData.invoiceValue) : undefined,
        acceptTerms: Boolean(uploadData?.acceptTerms),
        // Preserve the original invoice number as entered by user
        invoiceNumber: uploadData?.invoiceNumber || ''
      };
      
      // Debug: Log the sanitized invoice number
      console.log('🔍 DEBUG - Sanitized invoice number:', sanitizedUploadData.invoiceNumber);
      updateData.originData = originData;
      updateData.destinationData = destinationData;
      updateData.shipmentData = shipmentData;
      updateData.uploadData = sanitizedUploadData;
      
      // Use the consignment number provided by the frontend (from office user assignment)
      // If no consignment number provided, fall back to timestamp-based generation
      if (consignmentNumber && typeof consignmentNumber === 'number') {
        updateData.consignmentNumber = consignmentNumber;
        console.log('✅ Using provided consignment number:', consignmentNumber);
      } else {
        // Fallback: Generate unique consignment number (separate from invoice number)
        // Use timestamp-based approach for unique consignment numbers
        const generateConsignmentNumber = () => {
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return parseInt(`${timestamp.toString().slice(-8)}${randomSuffix}`);
        };
        
        updateData.consignmentNumber = generateConsignmentNumber();
        console.log('⚠️ No consignment number provided, generated fallback:', updateData.consignmentNumber);
      }
      updateData.paymentData = paymentData;
      // Also backfill flat fields for backward compatibility/queries
      if (originData) {
        updateData.senderName = originData.name;
        updateData.senderEmail = originData.email?.toLowerCase();
        updateData.senderPhone = originData.mobileNumber;
        updateData.senderPincode = originData.pincode;
        updateData.senderState = originData.state;
        updateData.senderCity = originData.city;
        updateData.senderDistrict = originData.district;
        updateData.senderArea = originData.area;
        updateData.senderAddressLine1 = originData.flatBuilding;
        updateData.senderAddressLine2 = originData.locality || '';
        updateData.senderLandmark = originData.landmark || '';
      }
      if (destinationData) {
        updateData.receiverName = destinationData.name;
        updateData.receiverEmail = destinationData.email?.toLowerCase();
        updateData.receiverPhone = destinationData.mobileNumber;
        updateData.receiverPincode = destinationData.pincode;
        updateData.receiverState = destinationData.state;
        updateData.receiverCity = destinationData.city;
        updateData.receiverDistrict = destinationData.district;
        updateData.receiverArea = destinationData.area;
        updateData.receiverAddressLine1 = destinationData.flatBuilding;
        updateData.receiverAddressLine2 = destinationData.locality || '';
        updateData.receiverLandmark = destinationData.landmark || '';
      }
      updateData.formCompleted = true;
    }

    // Debug: Log what we're about to save
    console.log('🔍 DEBUG - About to save invoice number:', updateData.uploadData?.invoiceNumber);
    
    let savedForm;
    
    if (existingForm) {
      // Update existing form
      Object.assign(existingForm, updateData);
      savedForm = await existingForm.save();
      console.log('Form data updated successfully:', savedForm._id);
    } else {
      // Create new form
      savedForm = new FormData(updateData);
      await savedForm.save();
      console.log('Form data created successfully:', savedForm._id);
    }
    
    // Debug: Log what was actually saved
    console.log('🔍 DEBUG - Saved invoice number in database:', savedForm.uploadData?.invoiceNumber);
    
    // Send shipment confirmation email if this is a full booking
    if (formType === 'full' && savedForm.consignmentNumber) {
      try {
        const emailService = (await import('./services/emailService.js')).default;
        
        // Prepare shipment data for email
        const shipmentData = {
          consignmentNumber: savedForm.consignmentNumber,
          invoiceNumber: savedForm.uploadData?.invoiceNumber || 'N/A',
          receiverCompanyName: savedForm.destinationData?.companyName,
          receiverConcernPerson: savedForm.destinationData?.name,
          destinationCity: savedForm.destinationData?.city,
          bookingDate: savedForm.createdAt,
          senderCompanyName: savedForm.originData?.companyName,
          senderConcernPerson: savedForm.originData?.name,
          recipientConcernPerson: savedForm.destinationData?.name,
          recipientPinCode: savedForm.destinationData?.pincode,
          recipientMobileNumber: savedForm.destinationData?.mobileNumber,
          invoiceValue: savedForm.uploadData?.invoiceValue,
          packageImages: (savedForm.uploadData?.packageImages || []).map(imagePath => {
            // Clean up any @ symbol at the beginning of the URL
            let cleanPath = imagePath;
            if (cleanPath.startsWith('@')) {
              cleanPath = cleanPath.substring(1);
            }
            
            // If it's already a full URL, return as is, otherwise convert filename to full S3 URL
            if (cleanPath.startsWith('https://')) {
              return cleanPath;
            }
            const bucketName = process.env.AWS_BUCKET_NAME || 'ocl-services-uploads';
            const region = process.env.AWS_REGION || 'ap-south-1';
            return `https://${bucketName}.s3.${region}.amazonaws.com/uploads/screenshots/package-images/${cleanPath}`;
          }),
          invoiceImages: (savedForm.uploadData?.invoiceImages || []).map(imagePath => {
            // Clean up any @ symbol at the beginning of the URL
            let cleanPath = imagePath;
            if (cleanPath.startsWith('@')) {
              cleanPath = cleanPath.substring(1);
            }
            
            // If it's already a full URL, return as is, otherwise convert filename to full S3 URL
            if (cleanPath.startsWith('https://')) {
              return cleanPath;
            }
            const bucketName = process.env.AWS_BUCKET_NAME || 'ocl-services-uploads';
            const region = process.env.AWS_REGION || 'ap-south-1';
            return `https://${bucketName}.s3.${region}.amazonaws.com/uploads/screenshots/invoice-images/${cleanPath}`;
          }),
          senderEmail: savedForm.originData?.email
        };
        
        // Send confirmation email
        await emailService.sendShipmentConfirmationEmail(shipmentData);
        console.log(`✅ Shipment confirmation email sent to ${shipmentData.senderEmail}`);
        
      } catch (emailError) {
        console.error('❌ Failed to send shipment confirmation email:', emailError);
        // Don't fail the booking if email fails
      }
    }

    res.json({ 
      success: true, 
      data: savedForm,
      message: `${formType.charAt(0).toUpperCase() + formType.slice(1)} data submitted successfully!`,
      completionPercentage: savedForm.getCompletionPercentage(),
      formCompleted: savedForm.formCompleted
    });
    
  } catch (err) {
    console.error('Error saving form data:', err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (err.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate entry detected',
        details: 'A form with this information already exists'
      });
    } else {
      res.status(500).json({ 
        error: err.message || 'Internal server error'
      });
    }
  }
});

// Test shipment confirmation email endpoint
app.post("/api/test-shipment-email", async (req, res) => {
  try {
    const emailService = (await import('./services/emailService.js')).default;
    
    // Test data based on the design requirements
    const testShipmentData = {
      consignmentNumber: 12345678,
      invoiceNumber: 12345678,
      receiverCompanyName: 'L&T',
      receiverConcernPerson: 'L&T',
      destinationCity: 'Sivsagar',
      bookingDate: new Date(),
      senderCompanyName: 'Schwing Stetter',
      senderConcernPerson: 'Schiwing',
      recipientConcernPerson: 'Ramesh Agarawal',
      recipientPinCode: '781002',
      recipientMobileNumber: '9861242135',
      invoiceValue: 243000,
      packageImages: [
        'https://via.placeholder.com/80x80/ff6b6b/ffffff?text=Package1',
        'https://via.placeholder.com/80x80/4ecdc4/ffffff?text=Package2',
        'https://via.placeholder.com/80x80/45b7d1/ffffff?text=Package3'
      ],
      senderEmail: req.body.testEmail || 'test@example.com'
    };
    
    const result = await emailService.sendShipmentConfirmationEmail(testShipmentData);
    
    res.json({
      success: true,
      message: 'Test shipment confirmation email sent successfully!',
      result: result
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

// Get form data by sender email to check completion status
app.get("/api/form/check/:email", async (req, res) => {
  try {
    const form = await FormData.findOne({ 
      senderEmail: req.params.email.toLowerCase() 
    });
    
    if (!form) {
      return res.json({ 
        success: true, 
        exists: false,
        data: null
      });
    }
    
    res.json({ 
      success: true, 
      exists: true,
      data: form,
      completionPercentage: form.getCompletionPercentage(),
      senderCompleted: form.senderCompleted,
      receiverCompleted: form.receiverCompleted,
      formCompleted: form.formCompleted
    });
    
  } catch (err) {
    console.error('Error checking form status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Check if sender phone number exists in address form data
app.get("/api/form/check-phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    
    // Clean the phone number (remove any non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone number exists in sender phone field
    const form = await FormData.findOne({ 
      senderPhone: cleanPhone 
    });
    
    if (!form) {
      return res.json({ 
        success: true, 
        exists: false,
        data: null
      });
    }
    
    res.json({ 
      success: true, 
      exists: true,
      data: {
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        senderPhone: form.senderPhone,
        senderPincode: form.senderPincode,
        senderState: form.senderState,
        senderCity: form.senderCity,
        senderDistrict: form.senderDistrict,
        senderArea: form.senderArea,
        senderAddressLine1: form.senderAddressLine1,
        senderAddressLine2: form.senderAddressLine2,
        senderLandmark: form.senderLandmark
      }
    });
    
  } catch (err) {
    console.error('Error checking phone number:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all form data with filtering and pagination
app.get("/api/form", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters = {};
    
    // Add filters based on query parameters
    if (req.query.completed === 'true') {
      filters.formCompleted = true;
    } else if (req.query.completed === 'false') {
      filters.formCompleted = false;
    }
    
    if (req.query.senderState) {
      filters.senderState = new RegExp(req.query.senderState, 'i');
    }
    
    if (req.query.senderCity) {
      filters.senderCity = new RegExp(req.query.senderCity, 'i');
    }
    
    if (req.query.senderPincode) {
      filters.senderPincode = req.query.senderPincode;
    }
    
    if (req.query.senderEmail) {
      filters.senderEmail = new RegExp(req.query.senderEmail, 'i');
    }

    const forms = await FormData.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await FormData.countDocuments(filters);
    
    res.json({ 
      success: true, 
      data: forms, 
      count: forms.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    });
    
  } catch (err) {
    console.error('Error fetching form data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific form by ID
app.get("/api/form/:id", async (req, res) => {
  try {
    const form = await FormData.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ 
        error: 'Form not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: form,
      completionPercentage: form.getCompletionPercentage()
    });
    
  } catch (err) {
    console.error('Error fetching form by ID:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update form by ID
app.put("/api/form/:id", async (req, res) => {
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
        error: 'Form not found' 
      });
    }
    
    console.log('Form updated successfully:', updatedForm._id);
    res.json({ 
      success: true, 
      data: updatedForm,
      message: 'Form updated successfully!',
      completionPercentage: updatedForm.getCompletionPercentage()
    });
    
  } catch (err) {
    console.error('Error updating form:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete form by ID
app.delete("/api/form/:id", async (req, res) => {
  try {
    const deletedForm = await FormData.findByIdAndDelete(req.params.id);
    
    if (!deletedForm) {
      return res.status(404).json({ 
        error: 'Form not found' 
      });
    }
    
    console.log('Form deleted successfully:', deletedForm._id);
    res.json({ 
      success: true, 
      message: 'Form deleted successfully!',
      deletedData: deletedForm
    });
    
  } catch (err) {
    console.error('Error deleting form:', err);
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid form ID format' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get forms by email (either sender or receiver)
app.get("/api/form/email/:email", async (req, res) => {
  try {
    const forms = await FormData.findByEmail(req.params.email);
    
    res.json({ 
      success: true, 
      data: forms, 
      count: forms.length 
    });
    
  } catch (err) {
    console.error('Error fetching forms by email:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get forms by phone
app.get("/api/form/phone/:phone", async (req, res) => {
  try {
    const cleanPhone = req.params.phone.replace(/\D/g, '');
    const forms = await FormData.find({
      $or: [
        { senderPhone: cleanPhone },
        { receiverPhone: cleanPhone }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: forms, 
      count: forms.length 
    });
    
  } catch (err) {
    console.error('Error fetching forms by phone:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get form statistics
app.get("/api/stats/forms", async (req, res) => {
  try {
    const totalForms = await FormData.countDocuments();
    const completedForms = await FormData.countDocuments({ formCompleted: true });
    const incompleteForms = await FormData.countDocuments({ formCompleted: false });
    const senderOnlyForms = await FormData.countDocuments({ 
      senderCompleted: true, 
      receiverCompleted: false 
    });
    const receiverOnlyForms = await FormData.countDocuments({ 
      senderCompleted: false, 
      receiverCompleted: true 
    });
    
    // Get forms by sender state
    const formsByState = await FormData.aggregate([
      { $match: { senderState: { $exists: true, $ne: '' } } },
      { $group: { _id: '$senderState', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent forms
    const recentForms = await FormData.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('senderName senderEmail receiverName receiverEmail createdAt senderState senderCity formCompleted')
      .lean();
    
    res.json({ 
      success: true, 
      stats: {
        totalForms,
        completedForms,
        incompleteForms,
        senderOnlyForms,
        receiverOnlyForms,
        formsByState,
        recentForms
      }
    });
    
  } catch (err) {
    console.error('Error fetching form statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get pincode statistics
app.get("/api/stats/pincode", async (req, res) => {
  try {
    const totalPincodes = await PinCodeArea.countDocuments();
    const uniquePincodes = await PinCodeArea.distinct('pincode');
    const uniqueStates = await PinCodeArea.distinct('statename');
    const uniqueCities = await PinCodeArea.distinct('cityname');
    
    // Get top states by area count
    const stateStats = await PinCodeArea.aggregate([
      { $group: { _id: '$statename', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top cities by area count
    const cityStats = await PinCodeArea.aggregate([
      { $group: { _id: { state: '$statename', city: '$cityname' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, state: '$_id.state', city: '$_id.city', count: 1 } }
    ]);
    
    res.json({ 
      success: true, 
      stats: {
        totalAreas: totalPincodes,
        uniquePincodes: uniquePincodes.length,
        uniqueStates: uniqueStates.length,
        uniqueCities: uniqueCities.length,
        topStates: stateStats,
        topCities: cityStats
      }
    });
    
  } catch (err) {
    console.error('Error fetching pincode statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

// Search endpoint for forms
app.get("/api/search", async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const searchRegex = new RegExp(q, 'i');
    let searchQuery = {};
    
    if (type === 'all') {
      searchQuery = {
        $or: [
          { senderName: searchRegex },
          { senderEmail: searchRegex },
          { senderPhone: searchRegex },
          { senderState: searchRegex },
          { senderCity: searchRegex },
          { senderDistrict: searchRegex },
          { senderArea: searchRegex },
          { senderPincode: searchRegex },
          { receiverName: searchRegex },
          { receiverEmail: searchRegex },
          { receiverPhone: searchRegex },
          { receiverState: searchRegex },
          { receiverCity: searchRegex },
          { receiverDistrict: searchRegex },
          { receiverArea: searchRegex },
          { receiverPincode: searchRegex }
        ]
      };
    } else if (type === 'sender') {
      searchQuery = {
        $or: [
          { senderName: searchRegex },
          { senderEmail: searchRegex },
          { senderPhone: searchRegex },
          { senderState: searchRegex },
          { senderCity: searchRegex },
          { senderDistrict: searchRegex },
          { senderArea: searchRegex },
          { senderPincode: searchRegex }
        ]
      };
    } else if (type === 'receiver') {
      searchQuery = {
        $or: [
          { receiverName: searchRegex },
          { receiverEmail: searchRegex },
          { receiverPhone: searchRegex },
          { receiverState: searchRegex },
          { receiverCity: searchRegex },
          { receiverDistrict: searchRegex },
          { receiverArea: searchRegex },
          { receiverPincode: searchRegex }
        ]
      };
    }
    
    const results = await FormData.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    res.json({ 
      success: true, 
      data: results, 
      count: results.length,
      searchQuery: q,
      searchType: type
    });
    
  } catch (err) {
    console.error('Error in search:', err);
    res.status(500).json({ error: err.message });
  }
});

// CORPORATE REGISTRATION ROUTES

// Register new corporate
app.post("/api/corporate/register", logoUpload.single('logo'), async (req, res) => {
  try {
    console.log('Received corporate registration data:', req.body);
    
    // Handle logo upload errors
    if (req.fileValidationError) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only image files are allowed for company logo'
      });
    }
    
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File too large',
        message: 'Logo file size must be less than 5MB'
      });
    }
    
    const {
      companyName,
      companyAddress,
      pin,
      city,
      state,
      locality,
      flatNumber,
      landmark,
      gstNumber,
      birthday,
      anniversary,
      contactNumber,
      email,
      addressType
    } = req.body;
    
    // Validate required fields (password is auto-generated, not required from frontend)
    const requiredFields = ['companyName', 'companyAddress', 'pin', 'city', 'state', 'locality', 'contactNumber', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if company with same name, contact, or email already exists
    const existingCompany = await CorporateData.findOne({
      $or: [
        { companyName: companyName.trim() },
        { contactNumber: contactNumber.replace(/\D/g, '') },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existingCompany) {
      return res.status(409).json({ 
        error: 'A company with this name, contact number, or email already exists' 
      });
    }

    // Check GST number if provided
    if (gstNumber && gstNumber.trim()) {
      const existingGST = await CorporateData.findOne({ gstNumber: gstNumber.trim().toUpperCase() });
      if (existingGST) {
        return res.status(409).json({ 
          error: 'A company with this GST number already exists' 
        });
      }
    }

    // Generate unique corporate ID
    const corporateId = await CorporateData.generateCorporateId(companyName);
    
    // Handle logo upload if provided
    let logoPath = null;
    if (req.file) {
      // Rename the temporary file to use corporate ID
      const fileExtension = path.extname(req.file.filename);
      const newFileName = `${corporateId}${fileExtension}`;
      const oldPath = path.join(corporateLogosDir, req.file.filename);
      const newPath = path.join(corporateLogosDir, newFileName);
      
      // Rename the file
      fs.renameSync(oldPath, newPath);
      logoPath = `/uploads/corporate-logos/${newFileName}`;
    }
    
    // Generate username and password
    const username = CorporateData.generateUsername(email, contactNumber);
    const generatedPassword = CorporateData.generatePassword();
    
    // Create new corporate registration
    const corporateData = new CorporateData({
      corporateId,
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim(),
      pin: pin.trim(),
      city: city.trim(),
      state: state.trim(),
      locality: locality.trim(),
      flatNumber: flatNumber?.trim() || '',
      landmark: landmark?.trim() || '',
      gstNumber: gstNumber?.trim().toUpperCase() || '',
      birthday: birthday || null,
      anniversary: anniversary || null,
      contactNumber: contactNumber.trim(),
      email: email.trim().toLowerCase(),
      addressType: addressType || 'corporate',
      password: generatedPassword, // Use generated password instead of provided one
      username: username,
      generatedPassword: generatedPassword,
      logo: logoPath
    });

    await corporateData.save();
    
    // Send email notification with credentials
    let emailResult = null;
    try {
      console.log('📧 Attempting to send corporate registration email...');
      
      // Import email service
      const emailService = (await import('./services/emailService.js')).default;
      
      // Prepare data for email
      const emailData = {
        corporateId: corporateData.corporateId,
        companyName: corporateData.companyName,
        email: corporateData.email,
        contactNumber: corporateData.contactNumber,
        username: corporateData.username,
        password: corporateData.generatedPassword
      };
      
      // Send email
      emailResult = await emailService.sendCorporateRegistrationEmail(emailData);
      
      // Mark email as sent
      await corporateData.markEmailSent();
      
      console.log(`✅ Corporate registration email sent to ${email} for company: ${companyName}`);
    } catch (emailError) {
      console.error('❌ Failed to send corporate registration email:', emailError);
      console.error('❌ Email error details:', emailError.message);
      
      // Don't fail the entire request if email fails
      emailResult = { 
        error: emailError.message,
        success: false 
      };
      
      // Still log the registration as successful
      console.log(`⚠️ Corporate registration successful but email failed: ${companyName}`);
    }
    
    console.log('Corporate registration successful:', corporateId);
    
    res.json({ 
      success: true, 
      message: 'Corporate registration successful!',
      corporateId: corporateId,
      logo: logoPath,
      data: {
        corporateId: corporateData.corporateId,
        companyName: corporateData.companyName,
        city: corporateData.city,
        state: corporateData.state,
        logo: corporateData.logo,
        registrationDate: corporateData.registrationDate,
        username: corporateData.username,
        emailSent: corporateData.emailSent,
        emailResult: emailResult
      }
    });
    
  } catch (err) {
    console.error('Error in corporate registration:', err);
    
    // Clean up uploaded logo file if registration fails
    if (req.file) {
      try {
        const filePath = path.join(corporateLogosDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Cleaned up uploaded logo file:', req.file.filename);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up logo file:', cleanupError);
      }
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (err.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate entry detected',
        details: 'A company with this information already exists'
      });
    } else {
      res.status(500).json({ 
        error: err.message || 'Internal server error'
      });
    }
  }
});

// Get corporate by ID
app.get("/api/corporate/:corporateId", async (req, res) => {
  try {
    const corporate = await CorporateData.findByCorporateId(req.params.corporateId)
      .select('corporateId companyName companyAddress pin city state locality flatNumber landmark gstNumber birthday anniversary contactNumber email addressType username emailSent emailSentAt isActive registrationDate createdAt updatedAt')
      .lean();
    
    if (!corporate) {
      return res.status(404).json({ 
        error: 'Corporate registration not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: corporate
    });
    
  } catch (err) {
    console.error('Error fetching corporate data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all corporate registrations with filtering and pagination
app.get("/api/corporate", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters = {};
    
    // Add filters based on query parameters
    if (req.query.active === 'true') {
      filters.isActive = true;
    } else if (req.query.active === 'false') {
      filters.isActive = false;
    }
    
    if (req.query.state) {
      filters.state = new RegExp(req.query.state, 'i');
    }
    
    if (req.query.city) {
      filters.city = new RegExp(req.query.city, 'i');
    }
    
    if (req.query.addressType) {
      filters.addressType = req.query.addressType;
    }

    const corporates = await CorporateData.find(filters)
      .select('corporateId companyName companyAddress pin city state locality flatNumber landmark gstNumber birthday anniversary contactNumber email addressType username emailSent emailSentAt isActive registrationDate createdAt updatedAt')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await CorporateData.countDocuments(filters);
    
    res.json({ 
      success: true, 
      data: corporates, 
      count: corporates.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    });
    
  } catch (err) {
    console.error('Error fetching corporate data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Search corporate registrations
app.get("/api/corporate/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const results = await CorporateData.searchCompanies(query.trim())
      .select('corporateId companyName companyAddress pin city state locality flatNumber landmark gstNumber birthday anniversary contactNumber email addressType isActive registrationDate createdAt updatedAt')
      .lean();
    
    res.json({ 
      success: true, 
      data: results, 
      count: results.length,
      searchQuery: query.trim()
    });
    
  } catch (err) {
    console.error('Error in corporate search:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update corporate data
app.put("/api/corporate/:corporateId", async (req, res) => {
  try {
    const updatedCorporate = await CorporateData.findOneAndUpdate(
      { corporateId: req.params.corporateId },
      { $set: req.body },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedCorporate) {
      return res.status(404).json({ 
        error: 'Corporate registration not found' 
      });
    }
    
    console.log('Corporate data updated successfully:', updatedCorporate.corporateId);
    res.json({ 
      success: true, 
      data: updatedCorporate,
      message: 'Corporate data updated successfully!'
    });
    
  } catch (err) {
    console.error('Error updating corporate data:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete corporate registration
app.delete("/api/corporate/:corporateId", async (req, res) => {
  try {
    const deletedCorporate = await CorporateData.findOneAndDelete({ 
      corporateId: req.params.corporateId 
    });
    
    if (!deletedCorporate) {
      return res.status(404).json({ 
        error: 'Corporate registration not found' 
      });
    }
    
    console.log('Corporate registration deleted successfully:', deletedCorporate.corporateId);
    res.json({ 
      success: true, 
      message: 'Corporate registration deleted successfully!',
      deletedData: deletedCorporate
    });
    
  } catch (err) {
    console.error('Error deleting corporate registration:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get corporate statistics
app.get("/api/stats/corporate", async (req, res) => {
  try {
    const totalCorporates = await CorporateData.countDocuments();
    const activeCorporates = await CorporateData.countDocuments({ isActive: true });
    const inactiveCorporates = await CorporateData.countDocuments({ isActive: false });
    
    // Get registrations by state
    const corporatesByState = await CorporateData.aggregate([
      { $match: { state: { $exists: true, $ne: '' } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get registrations by address type
    const corporatesByType = await CorporateData.aggregate([
      { $group: { _id: '$addressType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent registrations
    const recentRegistrations = await CorporateData.find()
      .sort({ registrationDate: -1 })
      .limit(5)
      .select('corporateId companyName city state registrationDate addressType isActive')
      .lean();
    
    // Monthly registration stats for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await CorporateData.aggregate([
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
        totalCorporates,
        activeCorporates,
        inactiveCorporates,
        corporatesByState,
        corporatesByType,
        recentRegistrations,
        monthlyStats,
        currentYear
      }
    });
    
  } catch (err) {
    console.error('Error fetching corporate statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test CorporatePricing endpoint
app.get("/api/test-corporate-pricing", async (req, res) => {
  try {
    console.log('Testing CorporatePricing model...');
    
    // Test if model can be accessed
    const count = await CorporatePricing.countDocuments();
    console.log('CorporatePricing count:', count);
    
    // Test creating a simple document
    const testPricing = new CorporatePricing({
      name: 'Test Pricing ' + Date.now(),
      status: 'pending',
      createdBy: new mongoose.Types.ObjectId(), // Use a dummy ObjectId for testing
      doxPricing: {
        '01gm-250gm': {
          assam: 10,
          neBySurface: 15,
          neByAirAgtImp: 20,
          restOfIndia: 25
        }
      }
    });
    
    const saved = await testPricing.save();
    console.log('Test pricing saved:', saved._id);
    
    // Clean up test document
    await CorporatePricing.findByIdAndDelete(saved._id);
    console.log('Test pricing cleaned up');
    
    res.json({
      success: true,
      message: 'CorporatePricing model is working correctly',
      count: count,
      testId: saved._id
    });
    
  } catch (error) {
    console.error('CorporatePricing test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting' : 'Disconnected';
    
    // Get collection counts
    const formCount = await FormData.countDocuments();
    const completedFormCount = await FormData.countDocuments({ formCompleted: true });
    const pincodeCount = await PinCodeArea.countDocuments();
    const corporateCount = await CorporateData.countDocuments();
    const coloaderCount = await Coloader.countDocuments();
    const corporatePricingCount = await CorporatePricing.countDocuments();
    
    res.json({ 
      status: "Server is running",
      database: dbStatus,
      environment: "MongoDB Atlas Cloud",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      collections: {
        forms: formCount,
        completedForms: completedFormCount,
        pincodeAreas: pincodeCount,
        corporateRegistrations: corporateCount,
        coloaderRegistrations: coloaderCount,
        corporatePricing: corporatePricingCount
      },
      version: "3.2.0"
    });
  } catch (err) {
    res.status(500).json({
      status: "Server running but database error",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export data endpoint
app.get("/api/export", async (req, res) => {
  try {
    const { format = 'json', type = 'all' } = req.query;
    
    let query = {};
    if (type === 'completed') {
      query.formCompleted = true;
    } else if (type === 'incomplete') {
      query.formCompleted = false;
    }
    
    const forms = await FormData.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    if (format === 'csv') {
      if (forms.length === 0) {
        return res.status(404).json({ error: 'No data to export' });
      }
      
      const headers = Object.keys(forms[0]).filter(key => key !== '__v').join(',');
      const csvData = forms.map(form => 
        Object.keys(form)
          .filter(key => key !== '__v')
          .map(key => `"${form[key] || ''}"`)
          .join(',')
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=forms_export_${Date.now()}.csv`);
      res.send(`${headers}\n${csvData}`);
    } else {
      res.json({ 
        success: true, 
        data: forms, 
        count: forms.length,
        exportedAt: new Date().toISOString(),
        type: type
      });
    }
    
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ocl';
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Atlas Connected Successfully");
    
    // Verify pincode collection exists and has data
    const pincodeCount = await PinCodeArea.countDocuments();
    if (pincodeCount === 0) {
      console.log("⚠️  Warning: Pin_Code_Area collection appears to be empty");
    } else {
      console.log(`📊 Pin_Code_Area collection has ${pincodeCount} records`);
    }
    
    // Check form collection
    const formCount = await FormData.countDocuments();
    const completedFormCount = await FormData.countDocuments({ formCompleted: true });
    console.log(`📋 FormData collection has ${formCount} records (${completedFormCount} completed)`);
    
    // Check corporate collection
    const corporateCount = await CorporateData.countDocuments();
    console.log(`🏢 CorporateData collection has ${corporateCount} records`);
    
    // Check coloader collection
    const coloaderCount = await Coloader.countDocuments();
    console.log(`🚛 Coloader collection has ${coloaderCount} records`);
    
    // Initialize default admin if none exists
    await Admin.createDefaultAdmin();
    const adminCount = await Admin.countDocuments();
    console.log(`👤 Admin collection has ${adminCount} records`);
    
    // Check office users collection
    const officeUserCount = await OfficeUser.countDocuments();
    console.log(`🏢 OfficeUser collection has ${officeUserCount} records`);
    // Initialize default medicine user
    await MedicineUser.createDefaultMedicineUser();
    const medicineUserCount = await MedicineUser.countDocuments();
    console.log(`💊 MedicineUser collection has ${medicineUserCount} records`);
    
    // Check employees collection
    const employeeCount = await Employee.countDocuments();
    console.log(`👥 Employee collection has ${employeeCount} records`);
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`☁️ Connected to MongoDB Atlas (Cloud Database)`);
      console.log(`🔗 Server ready for MongoDB operations`);
      console.log(`📗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 Form stats: http://localhost:${PORT}/api/stats/forms`);
      console.log(`📊 Pincode stats: http://localhost:${PORT}/api/stats/pincode`);
      console.log(`🏢 Corporate stats: http://localhost:${PORT}/api/stats/corporate`);
      console.log(`🔎 Search API: http://localhost:${PORT}/api/search?q=<query>`);
      console.log(`🛒 Corporate API: http://localhost:${PORT}/api/corporate`);
      console.log(`👥 Employee API: http://localhost:${PORT}/api/employee`);
    });
    
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err);
    console.error("Please check your MONGO_URI in .env file");
    process.exit(1);
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB Atlas connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't call gracefulShutdown here to prevent infinite loops
  // Just log the error and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Exit immediately for uncaught exceptions
  process.exit(1);
});

// Start the server
startServer();