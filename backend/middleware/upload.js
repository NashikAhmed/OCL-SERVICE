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
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter to allow images and PDFs
const fileFilter = (req, file, cb) => {
  // Check if file is an image or PDF
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files per upload
  }
});

// Middleware for package images
export const uploadPackageImages = upload.array('packageImages', 10);

// Middleware for invoice images
export const uploadInvoiceImages = upload.array('invoiceImages', 10);

// Middleware for both types
export const uploadScreenshots = upload.fields([
  { name: 'packageImages', maxCount: 10 },
  { name: 'invoiceImages', maxCount: 10 }
]);

// Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed per upload'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field'
      });
    }
  }
  
  if (err.message === 'Only image and PDF files are allowed!' || err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image and PDF files are allowed'
    });
  }
  
  next(err);
};

export default upload;
