import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import S3Service from './services/s3Service.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Test script to verify S3 integration
 * This script will test:
 * 1. S3 connection
 * 2. File upload
 * 3. File deletion
 * 4. URL generation
 */

async function testS3Integration() {
  console.log('🧪 Testing S3 Integration...');
  console.log('============================');
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log(`AWS_ACCESS_KEY: ${process.env.AWS_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`AWS_SECRET_KEY: ${process.env.AWS_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`AWS_REGION: ${process.env.AWS_REGION || 'ap-south-1'}`);
  console.log(`AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME || 'ocl-services-uploads'}`);
  
  if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    console.error('❌ AWS credentials not found. Please check your .env file.');
    process.exit(1);
  }
  
  try {
    // Create a test file
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, 'temp', testFileName);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create test file content
    const testContent = `S3 Integration Test
Created at: ${new Date().toISOString()}
Test ID: ${Math.random().toString(36).substring(7)}`;
    
    fs.writeFileSync(testFilePath, testContent);
    
    console.log(`\n📝 Created test file: ${testFileName}`);
    
    // Create file object for S3Service
    const testFile = {
      path: testFilePath,
      originalname: testFileName,
      mimetype: 'text/plain',
      size: fs.statSync(testFilePath).size
    };
    
    // Test 1: Upload file to S3
    console.log('\n🔄 Test 1: Uploading file to S3...');
    const uploadResult = await S3Service.uploadFile(testFile, 'uploads/test');
    
    if (uploadResult.success) {
      console.log('✅ Upload successful!');
      console.log(`   URL: ${uploadResult.url}`);
      console.log(`   Key: ${uploadResult.key}`);
      console.log(`   Size: ${uploadResult.size} bytes`);
    } else {
      throw new Error('Upload failed');
    }
    
    // Test 2: Check if URL is accessible
    console.log('\n🔄 Test 2: Checking URL accessibility...');
    try {
      const response = await fetch(uploadResult.url);
      if (response.ok) {
        console.log('✅ File is accessible via URL');
        const content = await response.text();
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      } else {
        console.log(`⚠️ File URL returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not verify URL accessibility: ${error.message}`);
    }
    
    // Test 3: Generate presigned URL
    console.log('\n🔄 Test 3: Generating presigned URL...');
    try {
      const presignedUrl = await S3Service.getPresignedUrl(uploadResult.key, 3600);
      console.log('✅ Presigned URL generated');
      console.log(`   URL: ${presignedUrl.substring(0, 100)}...`);
    } catch (error) {
      console.log(`⚠️ Could not generate presigned URL: ${error.message}`);
    }
    
    // Test 4: Extract key from URL
    console.log('\n🔄 Test 4: Testing URL utilities...');
    const extractedKey = S3Service.extractKeyFromUrl(uploadResult.url);
    console.log(`✅ Extracted key: ${extractedKey}`);
    
    const isS3Url = S3Service.isS3Url(uploadResult.url);
    console.log(`✅ Is S3 URL: ${isS3Url}`);
    
    const fileInfo = S3Service.getFileInfoFromUrl(uploadResult.url);
    console.log(`✅ File info:`, fileInfo);
    
    // Test 5: Delete file from S3
    console.log('\n🔄 Test 5: Deleting file from S3...');
    const deleteResult = await S3Service.deleteFile(uploadResult.key);
    
    if (deleteResult.success) {
      console.log('✅ File deleted successfully');
    } else {
      throw new Error('Delete failed');
    }
    
    // Test 6: Test multiple file upload
    console.log('\n🔄 Test 6: Testing multiple file upload...');
    const testFiles = [];
    
    for (let i = 0; i < 3; i++) {
      const fileName = `test-multiple-${i}-${Date.now()}.txt`;
      const filePath = path.join(__dirname, 'temp', fileName);
      const content = `Multiple upload test file ${i}\nCreated at: ${new Date().toISOString()}`;
      
      fs.writeFileSync(filePath, content);
      
      testFiles.push({
        path: filePath,
        originalname: fileName,
        mimetype: 'text/plain',
        size: fs.statSync(filePath).size
      });
    }
    
    const multipleUploadResult = await S3Service.uploadMultipleFiles(testFiles, 'uploads/test');
    
    if (multipleUploadResult.success) {
      console.log(`✅ Multiple upload successful: ${multipleUploadResult.count} files`);
      
      // Clean up multiple files
      for (const file of multipleUploadResult.files) {
        const key = S3Service.extractKeyFromUrl(file.url);
        await S3Service.deleteFile(key);
      }
      console.log('✅ Multiple files cleaned up');
    } else {
      throw new Error('Multiple upload failed');
    }
    
    // Clean up local test files
    console.log('\n🧹 Cleaning up local test files...');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    // Clean up multiple test files
    for (const file of testFiles) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    
    console.log('✅ Local files cleaned up');
    
    console.log('\n🎉 All tests passed! S3 integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testS3Integration();
}

export default testS3Integration;
