import express from 'express';
import Employee from '../models/Employee.js';
import { authenticateAdmin } from '../middleware/auth.js';
import S3Service from '../services/s3Service.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for employee document uploads (temporary storage for S3 upload)
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.body.uniqueId || 'employee'}-${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  }
});

const router = express.Router();

// Get next employee ID
router.get('/next-id', authenticateAdmin, async (req, res) => {
  try {
    // Find the highest existing uniqueId
    const lastEmployee = await Employee.findOne({}, { uniqueId: 1 })
      .sort({ uniqueId: -1 });
    
    let nextId = 1;
    if (lastEmployee && lastEmployee.uniqueId) {
      // Extract number from OCL0001 format
      const match = lastEmployee.uniqueId.match(/OCL(\d+)/);
      if (match) {
        nextId = parseInt(match[1]) + 1;
      }
    }
    
    const nextUniqueId = `OCL${String(nextId).padStart(4, '0')}`;
    
    res.json({
      success: true,
      nextId: nextUniqueId
    });
    
  } catch (error) {
    console.error('Error getting next employee ID:', error);
    res.status(500).json({ 
      error: 'Failed to get next employee ID.' 
    });
  }
});

// Register new employee
router.post('/register', authenticateAdmin, documentUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('Employee registration request received:', req.body);
    
    // Check if employee with same email or phone already exists
    const existingEmployee = await Employee.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone },
        { aadharNo: req.body.aadharNo },
        { panNo: req.body.panNo }
      ]
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        error: 'Employee with this email, phone, Aadhar, or PAN already exists.' 
      });
    }
    
    // Upload files to S3 and extract URLs
    const filePaths = {};
    if (req.files) {
      try {
        if (req.files.photo && req.files.photo[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.photo[0], 'uploads/employee-docs');
          filePaths.photoFilePath = uploadResult.url;
        }
        if (req.files.cv && req.files.cv[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.cv[0], 'uploads/employee-docs');
          filePaths.cvFilePath = uploadResult.url;
        }
        if (req.files.document && req.files.document[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.document[0], 'uploads/employee-docs');
          filePaths.documentFilePath = uploadResult.url;
        }
        if (req.files.panCard && req.files.panCard[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.panCard[0], 'uploads/employee-docs');
          filePaths.panCardFilePath = uploadResult.url;
        }
        if (req.files.aadharCard && req.files.aadharCard[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.aadharCard[0], 'uploads/employee-docs');
          filePaths.aadharCardFilePath = uploadResult.url;
        }
        if (req.files.otherDocuments && req.files.otherDocuments.length > 0) {
          const uploadResult = await S3Service.uploadMultipleFiles(req.files.otherDocuments, 'uploads/employee-docs');
          filePaths.otherDocumentsPaths = uploadResult.files.map(file => file.url);
        }
      } catch (uploadError) {
        console.error('Error uploading employee documents to S3:', uploadError);
        return res.status(500).json({
          error: 'Failed to upload documents to S3',
          message: uploadError.message
        });
      }
    }
    
    // Parse references array from JSON string if needed
    let references = [];
    if (typeof req.body.references === 'string') {
      try {
        references = JSON.parse(req.body.references);
      } catch (e) {
        references = req.body.references;
      }
    } else {
      references = req.body.references || [];
    }
    
    // Parse primeMobileNumbers array from JSON string if needed
    let primeMobileNumbers = [];
    if (typeof req.body.primeMobileNumbers === 'string') {
      try {
        primeMobileNumbers = JSON.parse(req.body.primeMobileNumbers);
      } catch (e) {
        primeMobileNumbers = req.body.primeMobileNumbers;
      }
    } else {
      primeMobileNumbers = req.body.primeMobileNumbers || [];
    }
    
    // Create new employee object
    const employeeData = {
      employeeCode: req.body.employeeCode,
      uniqueId: req.body.uniqueId,
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      alternativePhone: req.body.alternativePhone || '',
      dateOfBirth: req.body.dateOfBirth,
      designation: req.body.designation,
      aadharNo: req.body.aadharNo,
      panNo: req.body.panNo.toUpperCase(),
      qualification: req.body.qualification,
      presentAddress: {
        locality: req.body.locality,
        buildingFlatNo: req.body.buildingFlatNo,
        landmark: req.body.landmark || '',
        pincode: req.body.pincode,
        city: req.body.city,
        state: req.body.state,
        area: req.body.area || ''
      },
      addressType: req.body.addressType,
      permanentAddress: {
        locality: req.body.permanentLocality || '',
        buildingFlatNo: req.body.permanentBuildingFlatNo || '',
        landmark: req.body.permanentLandmark || '',
        pincode: req.body.permanentPincode || '',
        city: req.body.permanentCity || '',
        state: req.body.permanentState || '',
        area: req.body.permanentArea || ''
      },
      gst: req.body.gst || '',
      website: req.body.website || '',
      anniversary: req.body.anniversary || null,
      birthday: req.body.birthday || null,
      workExperience: req.body.workExperience || '',
      salary: req.body.salary || '',
      dateOfJoining: req.body.dateOfJoining || null,
      references: references,
      primeMobileNumbers: primeMobileNumbers,
      ...filePaths
    };
    
    // Debug: Log the data being saved
    console.log('Creating employee with data:', JSON.stringify(employeeData, null, 2));
    
    // Validate required fields before creating employee
    if (!employeeData.name) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Name is required']
      });
    }
    
    if (!employeeData.email) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Email is required']
      });
    }
    
    if (!employeeData.phone) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Phone number is required']
      });
    }
    
    if (!employeeData.dateOfBirth) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Date of birth is required']
      });
    }
    
    if (!employeeData.designation) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Designation is required']
      });
    }
    
    if (!employeeData.aadharNo) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Aadhar number is required']
      });
    }
    
    if (!employeeData.panNo) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['PAN number is required']
      });
    }
    
    if (!employeeData.qualification) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Qualification is required']
      });
    }
    
    // Validate present address fields
    if (!employeeData.presentAddress.locality) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Locality is required']
      });
    }
    
    if (!employeeData.presentAddress.buildingFlatNo) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Building/Flat number is required']
      });
    }
    
    if (!employeeData.presentAddress.pincode) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Pincode is required']
      });
    }
    
    if (!employeeData.presentAddress.city) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['City is required']
      });
    }
    
    if (!employeeData.presentAddress.state) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['State is required']
      });
    }
    
    if (!employeeData.addressType) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['Address type is required']
      });
    }
    
    // Generate username and temporary password
    const username = employeeData.email;
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    
    // Add login credentials to employee data
    employeeData.username = username;
    employeeData.generatedPassword = generatedPassword;
    employeeData.password = generatedPassword; // Store the generated password for login
    
    // Create and save employee
    const employee = new Employee(employeeData);
    await employee.save();
    
    // Also create office user for login access
    const OfficeUser = (await import('../models/OfficeUser.js')).default;
    const officeUser = new OfficeUser({
      email: employeeData.email.toLowerCase(),
      password: employeeData.password,
      name: employeeData.name,
      department: employeeData.department || 'General',
      phone: employeeData.phone,
      role: 'office_user', // Use valid enum value
      isActive: true,
      isFirstLogin: true, // Employee needs to change password on first login
      permissions: {
        dashboard: true,
        booking: true,
        reports: true,
        settings: false,
        pincodeManagement: false,
        addressForms: false,
        coloaderRegistration: false,
        userManagement: false
      }
    });
    
    await officeUser.save();
    
    console.log('Office user created for login:', officeUser._id);
    
    // Send email notification with credentials
    let emailResult = null;
    try {
      console.log('📧 Attempting to send employee registration email...');
      
      // Import email service
      const emailService = (await import('../services/emailService.js')).default;
      
      // Prepare data for email
      const emailData = {
        employeeId: employee.uniqueId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        username: employee.username,
        password: employee.generatedPassword
      };
      
      // Send email
      emailResult = await emailService.sendEmployeeRegistrationEmail(emailData);
      
      // Mark email as sent
      await employee.markEmailSent();
      
      console.log(`✅ Employee registration email sent to ${employee.email} for employee: ${employee.name}`);
    } catch (emailError) {
      console.error('❌ Failed to send employee registration email:', emailError);
      console.error('❌ Email error details:', emailError.message);
      
      // Don't fail the entire request if email fails
      emailResult = { 
        error: emailError.message,
        success: false 
      };
      
      // Still log the registration as successful
      console.log(`⚠️ Employee registration successful but email failed: ${employee.name}`);
    }
    
    console.log('Employee registered successfully:', employee._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Employee registered successfully!',
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        uniqueId: employee.uniqueId,
        name: employee.name,
        email: employee.email,
        username: employee.username,
        emailSent: employee.emailSent,
        emailResult: emailResult
      }
    });
    
  } catch (error) {
    console.error('Employee registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Duplicate entry detected',
        details: 'An employee with this information already exists'
      });
    } else {
      return res.status(500).json({ 
        error: error.message || 'Internal server error during employee registration'
      });
    }
  }
});

// Get all employees with pagination
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const employees = await Employee.find()
      .select('-photoFilePath -cvFilePath -documentFilePath -panCardFilePath -aadharCardFilePath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Employee.countDocuments();
    
    res.json({
      success: true,
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees.' 
    });
  }
});

// Get employee by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee not found.' 
      });
    }
    
    res.json({
      success: true,
      employee
    });
    
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employee.' 
    });
  }
});

// Update employee by ID
router.put('/:id', authenticateAdmin, documentUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 }
]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee not found.' 
      });
    }
    
    // Update employee fields
    const updateFields = [
      'name', 'email', 'phone', 'alternativePhone', 'dateOfBirth', 'designation',
      'aadharNo', 'panNo', 'qualification', 'addressType', 'gst', 'website',
      'anniversary', 'birthday', 'workExperience', 'salary', 'dateOfJoining'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });
    
    // Update present address
    if (req.body.locality) {
      employee.presentAddress.locality = req.body.locality;
      employee.presentAddress.buildingFlatNo = req.body.buildingFlatNo;
      employee.presentAddress.landmark = req.body.landmark || '';
      employee.presentAddress.pincode = req.body.pincode;
      employee.presentAddress.city = req.body.city;
      employee.presentAddress.state = req.body.state;
      employee.presentAddress.area = req.body.area || '';
    }
    
    // Update permanent address
    if (req.body.permanentLocality !== undefined) {
      employee.permanentAddress.locality = req.body.permanentLocality || '';
      employee.permanentAddress.buildingFlatNo = req.body.permanentBuildingFlatNo || '';
      employee.permanentAddress.landmark = req.body.permanentLandmark || '';
      employee.permanentAddress.pincode = req.body.permanentPincode || '';
      employee.permanentAddress.city = req.body.permanentCity || '';
      employee.permanentAddress.state = req.body.permanentState || '';
      employee.permanentAddress.area = req.body.permanentArea || '';
    }
    
    // Update references if provided
    if (req.body.references) {
      let references = [];
      if (typeof req.body.references === 'string') {
        try {
          references = JSON.parse(req.body.references);
        } catch (e) {
          references = req.body.references;
        }
      } else {
        references = req.body.references;
      }
      employee.references = references;
    }
    
    // Update prime mobile numbers if provided
    if (req.body.primeMobileNumbers) {
      let primeMobileNumbers = [];
      if (typeof req.body.primeMobileNumbers === 'string') {
        try {
          primeMobileNumbers = JSON.parse(req.body.primeMobileNumbers);
        } catch (e) {
          primeMobileNumbers = req.body.primeMobileNumbers;
        }
      } else {
        primeMobileNumbers = req.body.primeMobileNumbers;
      }
      employee.primeMobileNumbers = primeMobileNumbers;
    }
    
    // Update file paths if new files were uploaded to S3
    if (req.files) {
      try {
        if (req.files.photo && req.files.photo[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.photo[0], 'uploads/employee-docs');
          employee.photoFilePath = uploadResult.url;
        }
        if (req.files.cv && req.files.cv[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.cv[0], 'uploads/employee-docs');
          employee.cvFilePath = uploadResult.url;
        }
        if (req.files.document && req.files.document[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.document[0], 'uploads/employee-docs');
          employee.documentFilePath = uploadResult.url;
        }
        if (req.files.panCard && req.files.panCard[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.panCard[0], 'uploads/employee-docs');
          employee.panCardFilePath = uploadResult.url;
        }
        if (req.files.aadharCard && req.files.aadharCard[0]) {
          const uploadResult = await S3Service.uploadFile(req.files.aadharCard[0], 'uploads/employee-docs');
          employee.aadharCardFilePath = uploadResult.url;
        }
      } catch (uploadError) {
        console.error('Error uploading employee documents to S3:', uploadError);
        return res.status(500).json({
          error: 'Failed to upload documents to S3',
          message: uploadError.message
        });
      }
    }
    
    // Save updated employee
    await employee.save();
    
    res.json({ 
      success: true,
      message: 'Employee updated successfully!',
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        uniqueId: employee.uniqueId,
        name: employee.name,
        email: employee.email
      }
    });
    
  } catch (error) {
    console.error('Employee update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    } else if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Duplicate entry detected',
        details: 'An employee with this information already exists'
      });
    } else {
      return res.status(500).json({ 
        error: error.message || 'Internal server error during employee update'
      });
    }
  }
});

// Delete employee by ID
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee not found.' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Employee deleted successfully!'
    });
    
  } catch (error) {
    console.error('Employee deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete employee.' 
    });
  }
});


export default router;