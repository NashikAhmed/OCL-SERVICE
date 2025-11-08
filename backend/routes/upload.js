import express from 'express';
import { uploadPackageImages, uploadInvoiceImages, uploadScreenshots, handleUploadError } from '../middleware/upload.js';
import S3Service from '../services/s3Service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload package images
router.post('/package-images', uploadPackageImages, handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one package image'
      });
    }

    // Upload files to S3
    const uploadResult = await S3Service.uploadMultipleFiles(req.files, 'uploads/screenshots/package-images');
    
    if (!uploadResult.success) {
      return res.status(500).json({
        error: 'Upload failed',
        message: 'Failed to upload package images to S3'
      });
    }

    res.json({
      success: true,
      message: `${req.files.length} package image(s) uploaded successfully`,
      files: uploadResult.files
    });
  } catch (error) {
    console.error('Error uploading package images:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload package images'
    });
  }
});

// Upload invoice images
router.post('/invoice-images', uploadInvoiceImages, handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one invoice image'
      });
    }

    // Upload files to S3
    const uploadResult = await S3Service.uploadMultipleFiles(req.files, 'uploads/screenshots/invoice-images');
    
    if (!uploadResult.success) {
      return res.status(500).json({
        error: 'Upload failed',
        message: 'Failed to upload invoice images to S3'
      });
    }

    res.json({
      success: true,
      message: `${req.files.length} invoice image(s) uploaded successfully`,
      files: uploadResult.files
    });
  } catch (error) {
    console.error('Error uploading invoice images:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload invoice images'
    });
  }
});

// Upload both package and invoice images
router.post('/screenshots', uploadScreenshots, handleUploadError, async (req, res) => {
  try {
    const result = {
      packageImages: [],
      invoiceImages: []
    };

    // Upload package images to S3
    if (req.files.packageImages) {
      const packageUploadResult = await S3Service.uploadMultipleFiles(req.files.packageImages, 'uploads/screenshots/package-images');
      if (packageUploadResult.success) {
        result.packageImages = packageUploadResult.files;
      }
    }

    // Upload invoice images to S3
    if (req.files.invoiceImages) {
      const invoiceUploadResult = await S3Service.uploadMultipleFiles(req.files.invoiceImages, 'uploads/screenshots/invoice-images');
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
    console.error('Error uploading screenshots:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload screenshots'
    });
  }
});

// Serve uploaded images (backward compatibility for local files)
router.get('/serve/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Determine which folder to look in based on filename
    let filePath;
    if (filename.startsWith('packageImages-')) {
      filePath = path.join(__dirname, '../uploads/screenshots/package-images', filename);
    } else if (filename.startsWith('invoiceImages-')) {
      filePath = path.join(__dirname, '../uploads/screenshots/invoice-images', filename);
    } else {
      // Try both folders
      const packagePath = path.join(__dirname, '../uploads/screenshots/package-images', filename);
      const invoicePath = path.join(__dirname, '../uploads/screenshots/invoice-images', filename);
      
      if (fs.existsSync(packagePath)) {
        filePath = packagePath;
      } else if (fs.existsSync(invoicePath)) {
        filePath = invoicePath;
      } else {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested image file was not found'
        });
      }
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested image file was not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to serve image'
    });
  }
});

// Delete uploaded image (backward compatibility for local files)
router.delete('/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Try to find and delete the file from both folders
    const packagePath = path.join(__dirname, '../uploads/screenshots/package-images', filename);
    const invoicePath = path.join(__dirname, '../uploads/screenshots/invoice-images', filename);
    
    let deleted = false;
    
    if (fs.existsSync(packagePath)) {
      fs.unlinkSync(packagePath);
      deleted = true;
    } else if (fs.existsSync(invoicePath)) {
      fs.unlinkSync(invoicePath);
      deleted = true;
    }
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'File not found',
        message: 'The requested image file was not found'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Failed to delete image'
    });
  }
});

// Delete S3 file by URL
router.delete('/delete-s3', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL required',
        message: 'File URL is required for deletion'
      });
    }
    
    if (!S3Service.isS3Url(url)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Only S3 URLs can be deleted through this endpoint'
      });
    }
    
    const s3Key = S3Service.extractKeyFromUrl(url);
    if (!s3Key) {
      return res.status(400).json({
        error: 'Invalid S3 URL',
        message: 'Could not extract S3 key from URL'
      });
    }
    
    await S3Service.deleteFile(s3Key);
    
    res.json({
      success: true,
      message: 'File deleted successfully from S3'
    });
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Failed to delete file from S3'
    });
  }
});

// Get upload statistics
router.get('/stats', (req, res) => {
  try {
    const packageImagesPath = path.join(__dirname, '../uploads/screenshots/package-images');
    const invoiceImagesPath = path.join(__dirname, '../uploads/screenshots/invoice-images');
    
    let packageImageCount = 0;
    let invoiceImageCount = 0;
    let totalSize = 0;
    
    // Count package images
    if (fs.existsSync(packageImagesPath)) {
      const packageFiles = fs.readdirSync(packageImagesPath);
      packageImageCount = packageFiles.length;
      
      packageFiles.forEach(file => {
        const filePath = path.join(packageImagesPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
    }
    
    // Count invoice images
    if (fs.existsSync(invoiceImagesPath)) {
      const invoiceFiles = fs.readdirSync(invoiceImagesPath);
      invoiceImageCount = invoiceFiles.length;
      
      invoiceFiles.forEach(file => {
        const filePath = path.join(invoiceImagesPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
    }
    
    res.json({
      success: true,
      stats: {
        packageImages: packageImageCount,
        invoiceImages: invoiceImageCount,
        totalImages: packageImageCount + invoiceImageCount,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting upload stats:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get upload statistics'
    });
  }
});

export default router;
