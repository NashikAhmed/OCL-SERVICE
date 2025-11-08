import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import S3Service from '../services/s3Service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import CorporateData from '../models/CorporateData.js';
import Employee from '../models/Employee.js';

/**
 * Migration script to move existing local files to S3
 * This script will:
 * 1. Find all records with local file paths
 * 2. Upload the files to S3
 * 3. Update the database with S3 URLs
 * 4. Keep local files for backup (optional)
 */

class S3Migration {
  constructor() {
    this.stats = {
      corporate: { processed: 0, migrated: 0, errors: 0 },
      employee: { processed: 0, migrated: 0, errors: 0 }
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }

  /**
   * Check if a local file exists
   */
  fileExists(filePath) {
    if (!filePath || !filePath.startsWith('/uploads/')) return false;
    
    const fullPath = path.join(__dirname, '..', filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Upload a local file to S3
   */
  async uploadLocalFileToS3(localPath, s3Folder) {
    try {
      const fullPath = path.join(__dirname, '..', localPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      // Create a temporary file object for S3Service
      const fileObj = {
        path: fullPath,
        originalname: path.basename(localPath),
        mimetype: this.getMimeType(localPath),
        size: fs.statSync(fullPath).size
      };

      const result = await S3Service.uploadFile(fileObj, s3Folder);
      return result.url;
    } catch (error) {
      console.error(`Error uploading ${localPath} to S3:`, error.message);
      throw error;
    }
  }

  /**
   * Get MIME type based on file extension
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Migrate corporate logos
   */
  async migrateCorporateLogos() {
    console.log('\n🔄 Migrating corporate logos...');
    
    const corporates = await CorporateData.find({
      logo: { $exists: true, $ne: null, $regex: '^/uploads/' }
    });

    console.log(`Found ${corporates.length} corporate records with local logo paths`);

    for (const corporate of corporates) {
      this.stats.corporate.processed++;
      
      try {
        if (this.fileExists(corporate.logo)) {
          console.log(`📤 Uploading logo for ${corporate.companyName} (${corporate.corporateId})`);
          
          const s3Url = await this.uploadLocalFileToS3(corporate.logo, 'uploads/corporate-logos');
          
          // Update database
          await CorporateData.findByIdAndUpdate(corporate._id, { logo: s3Url });
          
          console.log(`✅ Migrated: ${corporate.logo} → ${s3Url}`);
          this.stats.corporate.migrated++;
        } else {
          console.log(`⚠️ File not found: ${corporate.logo} for ${corporate.companyName}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating logo for ${corporate.companyName}:`, error.message);
        this.stats.corporate.errors++;
      }
    }
  }

  /**
   * Migrate employee documents
   */
  async migrateEmployeeDocuments() {
    console.log('\n🔄 Migrating employee documents...');
    
    const employees = await Employee.find({
      $or: [
        { photoFilePath: { $regex: '^/uploads/' } },
        { cvFilePath: { $regex: '^/uploads/' } },
        { documentFilePath: { $regex: '^/uploads/' } },
        { panCardFilePath: { $regex: '^/uploads/' } },
        { aadharCardFilePath: { $regex: '^/uploads/' } },
        { otherDocumentsPaths: { $elemMatch: { $regex: '^/uploads/' } } }
      ]
    });

    console.log(`Found ${employees.length} employee records with local file paths`);

    for (const employee of employees) {
      this.stats.employee.processed++;
      
      try {
        const updates = {};
        let hasUpdates = false;

        // Migrate individual file paths
        const fileFields = [
          'photoFilePath',
          'cvFilePath', 
          'documentFilePath',
          'panCardFilePath',
          'aadharCardFilePath'
        ];

        for (const field of fileFields) {
          if (employee[field] && this.fileExists(employee[field])) {
            console.log(`📤 Uploading ${field} for ${employee.name} (${employee.uniqueId})`);
            
            const s3Url = await this.uploadLocalFileToS3(employee[field], 'uploads/employee-docs');
            updates[field] = s3Url;
            hasUpdates = true;
            
            console.log(`✅ Migrated: ${employee[field]} → ${s3Url}`);
          }
        }

        // Migrate other documents array
        if (employee.otherDocumentsPaths && Array.isArray(employee.otherDocumentsPaths)) {
          const migratedUrls = [];
          
          for (const docPath of employee.otherDocumentsPaths) {
            if (this.fileExists(docPath)) {
              console.log(`📤 Uploading other document for ${employee.name} (${employee.uniqueId})`);
              
              const s3Url = await this.uploadLocalFileToS3(docPath, 'uploads/employee-docs');
              migratedUrls.push(s3Url);
              
              console.log(`✅ Migrated: ${docPath} → ${s3Url}`);
            } else {
              // Keep existing URL if file doesn't exist locally
              migratedUrls.push(docPath);
            }
          }
          
          if (migratedUrls.length > 0) {
            updates.otherDocumentsPaths = migratedUrls;
            hasUpdates = true;
          }
        }

        // Update database if there are changes
        if (hasUpdates) {
          await Employee.findByIdAndUpdate(employee._id, updates);
          this.stats.employee.migrated++;
        }

      } catch (error) {
        console.error(`❌ Error migrating documents for ${employee.name}:`, error.message);
        this.stats.employee.errors++;
      }
    }
  }

  /**
   * Print migration statistics
   */
  printStats() {
    console.log('\n📊 Migration Statistics:');
    console.log('========================');
    
    console.log('\nCorporate Logos:');
    console.log(`  Processed: ${this.stats.corporate.processed}`);
    console.log(`  Migrated: ${this.stats.corporate.migrated}`);
    console.log(`  Errors: ${this.stats.corporate.errors}`);
    
    console.log('\nEmployee Documents:');
    console.log(`  Processed: ${this.stats.employee.processed}`);
    console.log(`  Migrated: ${this.stats.employee.migrated}`);
    console.log(`  Errors: ${this.stats.employee.errors}`);
    
    const totalProcessed = this.stats.corporate.processed + this.stats.employee.processed;
    const totalMigrated = this.stats.corporate.migrated + this.stats.employee.migrated;
    const totalErrors = this.stats.corporate.errors + this.stats.employee.errors;
    
    console.log('\nTotal:');
    console.log(`  Processed: ${totalProcessed}`);
    console.log(`  Migrated: ${totalMigrated}`);
    console.log(`  Errors: ${totalErrors}`);
  }

  /**
   * Run the complete migration
   */
  async run() {
    try {
      console.log('🚀 Starting S3 Migration...');
      console.log('============================');
      
      await this.connect();
      
      // Check AWS credentials
      if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
        throw new Error('AWS credentials not found in environment variables');
      }
      
      console.log('✅ AWS credentials found');
      console.log(`📦 Target S3 bucket: ${process.env.AWS_BUCKET_NAME || 'ocl-services-uploads'}`);
      
      // Run migrations
      await this.migrateCorporateLogos();
      await this.migrateEmployeeDocuments();
      
      this.printStats();
      
      console.log('\n✅ Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new S3Migration();
  migration.run();
}

export default S3Migration;
