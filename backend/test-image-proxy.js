import fetch from 'node-fetch';

// Test the image proxy endpoint
const testImageProxy = async () => {
  try {
    console.log('🧪 Testing image proxy endpoint...');
    
    // Test with a sample S3 key
    const testKey = 'uploads/screenshots/package-images/1761128592199-522707385.png';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/images/get-file-url?key=${encodeURIComponent(testKey)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Image proxy working!');
      console.log('📋 Response:', data);
      console.log('🔗 Pre-signed URL:', data.readUrl);
    } else {
      console.log('❌ Image proxy failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testImageProxy();
