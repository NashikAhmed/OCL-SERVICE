import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'ocl-services-uploads';

// Generate pre-signed URL for secure file access
router.get('/get-file-url', async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({
        error: 'Missing file key',
        message: 'Please provide a file key parameter'
      });
    }

    // Create the command to get the object
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    // Generate pre-signed URL (valid for 5 minutes)
    const readUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    });

    res.json({
      success: true,
      readUrl: readUrl,
      expiresIn: 300
    });

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate file URL',
      message: error.message
    });
  }
});

// Permanent image proxy for email images (no expiration)
router.get('/permanent/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    
    // Create the command to get the object
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    // Generate pre-signed URL with maximum expiration (7 days)
    const readUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 604800 // 7 days (maximum allowed by AWS)
    });

    // Redirect to the pre-signed URL
    res.redirect(readUrl);

  } catch (error) {
    console.error('Error generating permanent image URL:', error);
    res.status(404).json({
      error: 'File not found',
      message: 'The requested file could not be found or accessed'
    });
  }
});

// Legacy route for backward compatibility
router.get('/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    
    // Create the command to get the object
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    // Generate pre-signed URL (valid for 5 minutes)
    const readUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    });

    // Redirect to the pre-signed URL
    res.redirect(readUrl);

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(404).json({
      error: 'File not found',
      message: 'The requested file could not be found or accessed'
    });
  }
});

export default router;
