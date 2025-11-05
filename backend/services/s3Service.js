import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'ocl-services-uploads';

class S3Service {
  /**
   * Upload a file to S3
   * @param {Object} file - Multer file object
   * @param {string} folder - S3 folder path (e.g., 'uploads/corporate-logos')
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result with S3 URL
   */
  static async uploadFile(file, folder, options = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
      const s3Key = `${folder}/${fileName}`;
      
      // Read file content
      const fileContent = fs.readFileSync(file.path);
      
      // Upload parameters
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: file.mimetype,
        // ACL: 'public-read', 
        ...options
      };
      
      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      
      // Generate S3 URL
      const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;
      
      // Clean up local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return {
        success: true,
        url: s3Url,
        key: s3Key,
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
      
    } catch (error) {
      console.error('S3 upload error:', error);
      
      // Clean up local temp file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }
  
  /**
   * Upload multiple files to S3
   * @param {Array} files - Array of multer file objects
   * @param {string} folder - S3 folder path
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of upload results
   */
  static async uploadMultipleFiles(files, folder, options = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder, options));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        files: results,
        count: results.length
      };
      
    } catch (error) {
      console.error('S3 multiple upload error:', error);
      throw new Error(`Failed to upload files to S3: ${error.message}`);
    }
  }
  
  /**
   * Delete a file from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<Object>} Delete result
   */
  static async deleteFile(s3Key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });
      
      await s3Client.send(command);
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
      
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }
  
  /**
   * Delete multiple files from S3
   * @param {Array} s3Keys - Array of S3 object keys
   * @returns {Promise<Object>} Delete result
   */
  static async deleteMultipleFiles(s3Keys) {
    try {
      const deletePromises = s3Keys.map(key => this.deleteFile(key));
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: `${s3Keys.length} files deleted successfully`
      };
      
    } catch (error) {
      console.error('S3 multiple delete error:', error);
      throw new Error(`Failed to delete files from S3: ${error.message}`);
    }
  }
  
  /**
   * Generate a presigned URL for file access
   * @param {string} s3Key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
   * @returns {Promise<string>} Presigned URL
   */
  static async getPresignedUrl(s3Key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });
      
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return presignedUrl;
      
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Generate presigned URLs for multiple images (for email use)
   * @param {Array} imageUrls - Array of S3 image URLs
   * @param {number} expiresIn - URL expiration time in seconds (default: 604800 = 7 days)
   * @returns {Promise<Array>} Array of presigned URLs
   */
  static async generatePresignedUrlsForImages(imageUrls, expiresIn = 604800) {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    try {
      console.log(`🔗 Generating ${imageUrls.length} presigned URLs (expires in ${expiresIn}s)`);
      
      const presignedPromises = imageUrls.map(async (imageUrl) => {
        try {
          // Extract S3 key from URL
          const s3Key = this.extractKeyFromUrl(imageUrl);
          if (!s3Key) {
            console.warn('⚠️ Could not extract S3 key from URL:', imageUrl);
            return imageUrl; // Return original URL as fallback
          }

          // Generate presigned URL
          const presignedUrl = await this.getPresignedUrl(s3Key, expiresIn);
          console.log(`✅ Generated presigned URL for: ${s3Key}`);
          return presignedUrl;
        } catch (error) {
          console.error('❌ Failed to generate presigned URL for:', imageUrl, error.message);
          return imageUrl; // Return original URL as fallback
        }
      });

      const presignedUrls = await Promise.all(presignedPromises);
      console.log(`✅ Successfully generated ${presignedUrls.length} presigned URLs`);
      
      return presignedUrls;
    } catch (error) {
      console.error('❌ Error generating presigned URLs for images:', error);
      // Return original URLs as fallback
      return imageUrls;
    }
  }
  
  /**
   * Extract S3 key from S3 URL
   * @param {string} s3Url - Full S3 URL
   * @returns {string} S3 key
   */
  static extractKeyFromUrl(s3Url) {
    try {
      const url = new URL(s3Url);
      return url.pathname.substring(1); // Remove leading slash
    } catch (error) {
      console.error('Error extracting S3 key from URL:', error);
      return null;
    }
  }
  
  /**
   * Check if a URL is an S3 URL
   * @param {string} url - URL to check
   * @returns {boolean} True if S3 URL
   */
  static isS3Url(url) {
    return url && url.startsWith('https://') && url.includes('.s3.') && url.includes('.amazonaws.com/');
  }
  
  /**
   * Get file info from S3 URL
   * @param {string} s3Url - S3 URL
   * @returns {Object} File info
   */
  static getFileInfoFromUrl(s3Url) {
    try {
      const key = this.extractKeyFromUrl(s3Url);
      if (!key) return null;
      
      const fileName = path.basename(key);
      const folder = path.dirname(key);
      
      return {
        key,
        fileName,
        folder,
        url: s3Url
      };
    } catch (error) {
      console.error('Error getting file info from URL:', error);
      return null;
    }
  }
  
  /**
   * Upload file for email use with public access (permanent URLs)
   * @param {Object} file - Multer file object
   * @param {string} folder - S3 folder path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result with permanent public URL
   */
  static async uploadFileForEmail(file, folder, options = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
      const s3Key = `${folder}/${fileName}`;
      
      // Read file content
      const fileContent = fs.readFileSync(file.path);
      
      // Upload parameters with public-read ACL for permanent access
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make publicly accessible
        ...options
      };
      
      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      
      // Generate public S3 URL (no presigned needed)
      const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;
      
      // Clean up local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return {
        success: true,
        url: publicUrl,
        key: s3Key,
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        isPublic: true
      };
      
    } catch (error) {
      console.error('S3 public upload error:', error);
      
      // Clean up local temp file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new Error(`Failed to upload file to S3 with public access: ${error.message}`);
    }
  }

  /**
   * Convert private S3 images to direct presigned URLs for email access
   * @param {Array} imageUrls - Array of S3 image URLs
   * @returns {Promise<Array>} Array of direct presigned URLs
   */
  static async convertToPermanentUrlsForEmail(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    try {
      console.log(`🔗 Converting ${imageUrls.length} images to direct presigned URLs for email...`);
      
      const presignedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
        try {
          // Extract S3 key from URL
          const s3Key = this.extractKeyFromUrl(imageUrl);
          if (!s3Key) {
            console.warn('⚠️ Could not extract S3 key from URL:', imageUrl);
            return imageUrl; // Return original URL as fallback
          }

          // Generate direct presigned URL (7 days expiration)
          const presignedUrl = await this.getPresignedUrl(s3Key, 604800); // 7 days
          console.log(`✅ Generated direct presigned URL for: ${s3Key}`);
          return presignedUrl;
        } catch (error) {
          console.error('❌ Failed to generate presigned URL for:', imageUrl, error.message);
          return imageUrl; // Return original URL as fallback
        }
      }));

      console.log(`✅ Successfully converted ${presignedUrls.length} images to direct presigned URLs`);
      return presignedUrls;
    } catch (error) {
      console.error('❌ Error converting images to presigned URLs:', error);
      // Return original URLs as fallback
      return imageUrls;
    }
  }

  /**
   * Handle backward compatibility for local file paths
   * @param {string} filePath - File path (local or S3)
   * @returns {Object} File info with proper URL
   */
  static handleFilePath(filePath) {
    if (!filePath) return null;
    
    // If it's already an S3 URL, return as is
    if (this.isS3Url(filePath)) {
      return {
        url: filePath,
        isS3: true,
        key: this.extractKeyFromUrl(filePath)
      };
    }
    
    // If it's a local path, return with local URL (for backward compatibility)
    if (filePath.startsWith('/uploads/')) {
      return {
        url: filePath,
        isS3: false,
        localPath: filePath
      };
    }
    
    return null;
  }
}

export default S3Service;
