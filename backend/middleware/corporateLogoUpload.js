import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage for temporary files (will be uploaded to S3)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Get corporate ID from request body or params
    const corporateId = req.body.corporateId || req.params.corporateId;
    
    if (!corporateId) {
      return cb(new Error('Corporate ID is required for logo upload'), null);
    }
    
    // Get file extension
    const fileExtension = path.extname(file.originalname);
    
    // Create filename using corporate ID and timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${corporateId}-${uniqueSuffix}${fileExtension}`;
    
    cb(null, fileName);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for company logo!'), false);
  }
};

// Configure multer for corporate logo upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for logo
    files: 1 // Only one logo file
  }
});

// Middleware for corporate logo upload
export const uploadCorporateLogo = upload.single('logo');

// Error handling middleware
export const handleCorporateLogoUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Logo file size must be less than 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one logo file is allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field'
      });
    }
  }
  
  if (err.message === 'Only image files are allowed for company logo!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files are allowed for company logo'
    });
  }
  
  if (err.message === 'Corporate ID is required for logo upload') {
    return res.status(400).json({
      error: 'Missing corporate ID',
      message: 'Corporate ID is required for logo upload'
    });
  }
  
  next(err);
};

export default upload;
