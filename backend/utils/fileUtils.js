import S3Service from '../services/s3Service.js';
import path from 'path';

/**
 * Utility functions for handling file paths and URLs
 * Provides backward compatibility between local files and S3 URLs
 */

/**
 * Get the appropriate URL for a file path (S3 or local)
 * @param {string} filePath - File path (local or S3 URL)
 * @returns {string} Accessible URL
 */
export function getFileUrl(filePath) {
  if (!filePath) return null;
  
  // If it's already an S3 URL, return as is
  if (S3Service.isS3Url(filePath)) {
    return filePath;
  }
  
  // If it's a local path, return with API endpoint for serving
  if (filePath.startsWith('/uploads/')) {
    // Extract filename from path
    const filename = path.basename(filePath);
    return `/api/upload/serve/${filename}`;
  }
  
  return filePath;
}

/**
 * Check if a file path is an S3 URL
 * @param {string} filePath - File path to check
 * @returns {boolean} True if S3 URL
 */
export function isS3Url(filePath) {
  return S3Service.isS3Url(filePath);
}

/**
 * Check if a file path is a local path
 * @param {string} filePath - File path to check
 * @returns {boolean} True if local path
 */
export function isLocalPath(filePath) {
  return filePath && filePath.startsWith('/uploads/');
}

/**
 * Get file info from any file path
 * @param {string} filePath - File path (local or S3)
 * @returns {Object} File info
 */
export function getFileInfo(filePath) {
  if (!filePath) return null;
  
  if (S3Service.isS3Url(filePath)) {
    return {
      ...S3Service.getFileInfoFromUrl(filePath),
      type: 's3',
      url: filePath
    };
  }
  
  if (isLocalPath(filePath)) {
    return {
      type: 'local',
      path: filePath,
      filename: path.basename(filePath),
      url: getFileUrl(filePath)
    };
  }
  
  return null;
}

/**
 * Delete a file (S3 or local)
 * @param {string} filePath - File path to delete
 * @returns {Promise<Object>} Delete result
 */
export async function deleteFile(filePath) {
  if (!filePath) {
    throw new Error('File path is required');
  }
  
  if (S3Service.isS3Url(filePath)) {
    const s3Key = S3Service.extractKeyFromUrl(filePath);
    if (!s3Key) {
      throw new Error('Could not extract S3 key from URL');
    }
    return await S3Service.deleteFile(s3Key);
  }
  
  if (isLocalPath(filePath)) {
    // For local files, we would need to implement local file deletion
    // This is kept for backward compatibility
    console.warn('Local file deletion not implemented:', filePath);
    return { success: true, message: 'Local file deletion not implemented' };
  }
  
  throw new Error('Unsupported file path type');
}

/**
 * Get multiple file URLs
 * @param {Array} filePaths - Array of file paths
 * @returns {Array} Array of accessible URLs
 */
export function getFileUrls(filePaths) {
  if (!Array.isArray(filePaths)) return [];
  
  return filePaths.map(filePath => getFileUrl(filePath)).filter(Boolean);
}

/**
 * Transform file paths in an object to URLs
 * @param {Object} obj - Object containing file paths
 * @param {Array} fileFields - Array of field names that contain file paths
 * @returns {Object} Object with file paths transformed to URLs
 */
export function transformFilePathsToUrls(obj, fileFields = []) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  fileFields.forEach(field => {
    if (result[field]) {
      if (Array.isArray(result[field])) {
        result[field] = getFileUrls(result[field]);
      } else {
        result[field] = getFileUrl(result[field]);
      }
    }
  });
  
  return result;
}

/**
 * Default file fields for different models
 */
export const FILE_FIELDS = {
  corporate: ['logo'],
  employee: ['photoFilePath', 'cvFilePath', 'documentFilePath', 'panCardFilePath', 'aadharCardFilePath', 'otherDocumentsPaths'],
  // Add more models as needed
};

export default {
  getFileUrl,
  isS3Url,
  isLocalPath,
  getFileInfo,
  deleteFile,
  getFileUrls,
  transformFilePathsToUrls,
  FILE_FIELDS
};
