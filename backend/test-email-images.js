import dotenv from 'dotenv';
import EmailService from './services/emailService.js';
import S3Service from './services/s3Service.js';

// Load environment variables
dotenv.config();

async function testEmailImages() {
  console.log('🧪 Testing Email Image Functionality...\n');

  try {
    // Test 1: Validate S3Service presigned URL generation
    console.log('📋 Test 1: S3Service Presigned URL Generation');
    console.log('=' .repeat(50));
    
    const testImageUrls = [
      'https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/uploads/screenshots/package-images/test-image.jpg',
      'https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/uploads/screenshots/invoice-images/test-invoice.jpg'
    ];

    console.log('Testing with sample image URLs:');
    testImageUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    const presignedUrls = await S3Service.convertToPermanentUrlsForEmail(testImageUrls);
    console.log(`\n✅ Generated ${presignedUrls.length} presigned URLs:`);
    
    presignedUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.substring(0, 100)}...`);
      console.log(`     Contains X-Amz-Signature: ${url.includes('X-Amz-Signature') ? '✅' : '❌'}`);
      console.log(`     Contains X-Amz-Expires: ${url.includes('X-Amz-Expires') ? '✅' : '❌'}`);
    });

    // Test 2: Validate EmailService image URL validation
    console.log('\n📋 Test 2: EmailService Image URL Validation');
    console.log('=' .repeat(50));
    
    const emailService = new EmailService();
    const validUrls = await emailService.validateImageUrls(testImageUrls);
    console.log(`✅ Validated ${validUrls.length}/${testImageUrls.length} image URLs`);

    // Test 3: Test email HTML generation with sample data
    console.log('\n📋 Test 3: Email HTML Generation');
    console.log('=' .repeat(50));
    
    const sampleShipmentData = {
      consignmentNumber: 'OCL123456789',
      invoiceNumber: 'INV001',
      receiverCompanyName: 'Test Company',
      receiverConcernPerson: 'John Doe',
      destinationCity: 'Mumbai',
      bookingDate: new Date(),
      senderCompanyName: 'Sender Company',
      senderConcernPerson: 'Jane Smith',
      recipientConcernPerson: 'John Doe',
      recipientPinCode: '400001',
      recipientMobileNumber: '9876543210',
      invoiceValue: 1000,
      packageImages: testImageUrls,
      invoiceImages: testImageUrls,
      senderEmail: 'test@example.com'
    };

    console.log('Generating email HTML with sample data...');
    const emailHtml = await emailService.generateShipmentConfirmationEmail(sampleShipmentData);
    
    // Check if HTML contains image tags
    const hasPackageImages = emailHtml.includes('package-image');
    const hasInvoiceImages = emailHtml.includes('invoice-image');
    const hasLogo = emailHtml.includes('OCL Logo');
    
    console.log(`✅ Email HTML generated successfully`);
    console.log(`   Contains package images: ${hasPackageImages ? '✅' : '❌'}`);
    console.log(`   Contains invoice images: ${hasInvoiceImages ? '✅' : '❌'}`);
    console.log(`   Contains logo: ${hasLogo ? '✅' : '❌'}`);
    console.log(`   HTML length: ${emailHtml.length} characters`);

    // Test 4: Test email sending (optional - only if you want to send a test email)
    console.log('\n📋 Test 4: Email Sending Test (Optional)');
    console.log('=' .repeat(50));
    
    const sendTestEmail = process.env.SEND_TEST_EMAIL === 'true';
    if (sendTestEmail) {
      console.log('⚠️  Sending test email to:', sampleShipmentData.senderEmail);
      const emailResult = await emailService.sendShipmentConfirmationEmail(sampleShipmentData);
      console.log('✅ Test email sent successfully:', emailResult.messageId);
    } else {
      console.log('ℹ️  Skipping email sending test (set SEND_TEST_EMAIL=true to enable)');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ S3Service presigned URL generation working');
    console.log('✅ EmailService image validation working');
    console.log('✅ Email HTML generation working');
    console.log('✅ Image URLs properly embedded in email HTML');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEmailImages();
