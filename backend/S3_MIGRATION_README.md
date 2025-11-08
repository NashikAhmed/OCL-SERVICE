# S3 Migration Guide

This document outlines the complete migration from local file storage to AWS S3 for the OCL backend application.

## Overview

The application has been migrated from storing files locally in the `backend/uploads/` directory to using AWS S3 for cloud storage. This migration provides:

- **Scalability**: Unlimited storage capacity
- **Reliability**: 99.999999999% (11 9's) durability
- **Performance**: Global CDN access
- **Cost-effectiveness**: Pay only for what you use
- **Security**: Fine-grained access controls

## Architecture Changes

### Before (Local Storage)
```
backend/uploads/
├── corporate-logos/
├── employee-docs/
└── screenshots/
    ├── invoice-images/
    └── package-images/
```

### After (S3 Storage)
```
S3 Bucket: ocl-services-uploads
└── uploads/
    ├── corporate-logos/
    ├── employee-docs/
    └── screenshots/
        ├── invoice-images/
        └── package-images/
```

## New Components

### 1. S3Service (`backend/services/s3Service.js`)
Centralized service for all S3 operations:
- File upload (single and multiple)
- File deletion
- URL generation
- Presigned URL creation
- File info extraction

### 2. File Utils (`backend/utils/fileUtils.js`)
Utility functions for file path handling:
- Backward compatibility for local files
- URL transformation
- File type detection

### 3. Migration Script (`backend/scripts/migrate-to-s3.js`)
Automated script to migrate existing local files to S3.

### 4. Test Script (`backend/test-s3-upload.js`)
Comprehensive test suite for S3 integration.

## Environment Variables

Ensure these are set in your `.env` file:

```env
AWS_ACCESS_KEY=your_access_key_here
AWS_SECRET_KEY=your_secret_key_here
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=ocl-services-uploads
```

## Database Changes

### CorporateData Model
- Added `logoUrl` virtual field for backward compatibility
- Existing `logo` field now stores S3 URLs instead of local paths

### Employee Model
- Added virtual fields: `photoUrl`, `cvUrl`, `documentUrl`, `panCardUrl`, `aadharCardUrl`, `otherDocumentsUrls`
- Existing file path fields now store S3 URLs instead of local paths

## API Changes

### Upload Endpoints
All upload endpoints now return S3 URLs instead of local paths:

**Before:**
```json
{
  "success": true,
  "files": [{
    "filename": "packageImages-1234567890-123456789.jpg",
    "url": "/api/upload/serve/packageImages-1234567890-123456789.jpg"
  }]
}
```

**After:**
```json
{
  "success": true,
  "files": [{
    "filename": "packageImages-1234567890-123456789.jpg",
    "url": "https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/uploads/screenshots/package-images/packageImages-1234567890-123456789.jpg"
  }]
}
```

### New Endpoints
- `DELETE /api/upload/delete-s3` - Delete files from S3 by URL

## Backward Compatibility

The system maintains full backward compatibility:

1. **Virtual Fields**: Models include virtual fields that automatically handle both S3 URLs and local paths
2. **Serve Endpoint**: `/api/upload/serve/:filename` still works for existing local files
3. **Database**: Existing local file paths continue to work through virtual field transformations

## Migration Process

### 1. Test S3 Integration
```bash
cd backend
node test-s3-upload.js
```

### 2. Run Migration Script
```bash
cd backend
node scripts/migrate-to-s3.js
```

### 3. Verify Migration
Check the migration statistics and verify files are accessible via S3 URLs.

## File Upload Flow

### New Upload Process
1. **Multer**: Files are temporarily stored in `backend/temp/`
2. **S3Service**: Files are uploaded to S3 with proper folder structure
3. **Database**: S3 URLs are stored in the database
4. **Cleanup**: Temporary local files are automatically deleted

### Folder Structure on S3
```
uploads/
├── corporate-logos/
│   └── T00001-1234567890-123456789.png
├── employee-docs/
│   ├── OCL0001-photo-1234567890-123456789.jpg
│   ├── OCL0001-cv-1234567890-123456789.pdf
│   └── OCL0001-panCard-1234567890-123456789.jpg
└── screenshots/
    ├── invoice-images/
    │   └── invoiceImages-1234567890-123456789.jpg
    └── package-images/
        └── packageImages-1234567890-123456789.jpg
```

## Security Considerations

1. **Public Access**: Files are uploaded with `ACL: 'public-read'` for direct access
2. **Access Control**: Consider implementing signed URLs for sensitive documents
3. **CORS**: Ensure S3 bucket CORS policy allows your frontend domain
4. **IAM**: Use least-privilege IAM policies for S3 access

## Performance Optimizations

1. **Parallel Uploads**: Multiple files are uploaded concurrently
2. **Error Handling**: Failed uploads are properly cleaned up
3. **Caching**: S3 URLs can be cached for better performance
4. **CDN**: Consider CloudFront for global content delivery

## Monitoring and Logging

The system includes comprehensive logging:
- Upload success/failure
- S3 operation results
- Error details with stack traces
- Migration statistics

## Troubleshooting

### Common Issues

1. **AWS Credentials**: Verify credentials are correctly set in `.env`
2. **Bucket Permissions**: Ensure the bucket exists and is accessible
3. **Network Issues**: Check internet connectivity and AWS service status
4. **File Size Limits**: Verify files don't exceed S3 limits (5TB per object)

### Debug Commands

```bash
# Test S3 connection
node test-s3-upload.js

# Check environment variables
echo $AWS_ACCESS_KEY
echo $AWS_BUCKET_NAME

# Verify bucket access
aws s3 ls s3://ocl-services-uploads/
```

## Rollback Plan

If issues arise, the system can be rolled back:

1. **Database**: Existing local file paths are preserved
2. **Serve Endpoint**: Local file serving still works
3. **Virtual Fields**: Automatically fall back to local paths
4. **Configuration**: Switch back to local storage by modifying upload routes

## Future Enhancements

1. **Signed URLs**: Implement time-limited access for sensitive files
2. **Image Processing**: Add automatic image resizing/optimization
3. **Backup Strategy**: Implement cross-region replication
4. **Analytics**: Add file access analytics and monitoring
5. **Compression**: Implement automatic file compression

## Support

For issues or questions regarding the S3 migration:
1. Check the logs for detailed error messages
2. Run the test script to verify S3 connectivity
3. Review the migration statistics for any failed uploads
4. Ensure all environment variables are correctly configured

## Cost Optimization

1. **Lifecycle Policies**: Set up S3 lifecycle rules for old files
2. **Storage Classes**: Use appropriate storage classes (Standard, IA, Glacier)
3. **Monitoring**: Set up CloudWatch alarms for unexpected usage
4. **Cleanup**: Regularly clean up unused files and temporary uploads
