import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Test MSG91 configuration endpoint
router.get('/test-config', async (req, res) => {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    
    if (!authKey) {
      return res.status(500).json({
        success: false,
        error: 'MSG91_AUTH_KEY not found in environment variables'
      });
    }

    // Test MSG91 API connectivity
    const testResponse = await axios.get(
      `https://control.msg91.com/api/balance.php?authkey=${authKey}&type=4`
    );

    return res.json({
      success: true,
      message: 'MSG91 configuration test',
      authKey: authKey ? 'Present' : 'Missing',
      balance: testResponse.data,
      templateId: '68f38e33cb45e90f1c4a8003'
    });
  } catch (error) {
    console.error('MSG91 config test error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: 'MSG91 configuration test failed',
      details: error.response?.data || error.message
    });
  }
});

// MSG91 OTP send endpoint
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    console.log('=== BACKEND PHONE DEBUG ===');
    console.log('Received phone number:', phoneNumber);
    console.log('Phone number length:', phoneNumber.length);
    console.log('Phone number type:', typeof phoneNumber);
    console.log('Phone number JSON:', JSON.stringify(phoneNumber));
    console.log('============================');
    
    // Clean and format phone number for MSG91 API
    let cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove any non-digits
    console.log('After removing non-digits:', cleanPhoneNumber);
    
    // Handle different phone number formats
    if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 12) {
      // Format: 91XXXXXXXXXX (12 digits) - remove 91 prefix
      cleanPhoneNumber = cleanPhoneNumber.substring(2);
      console.log('Removed 91 prefix:', cleanPhoneNumber);
    } else if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 11) {
      // Format: 91XXXXXXXXX (11 digits) - this is wrong, remove 91 prefix
      cleanPhoneNumber = cleanPhoneNumber.substring(2);
      console.log('Removed 91 prefix from 11-digit number:', cleanPhoneNumber);
    } else if (cleanPhoneNumber.length === 10) {
      // Format: XXXXXXXXXX (10 digits) - this is correct
      console.log('10-digit number is correct:', cleanPhoneNumber);
    } else {
      console.log('Unexpected phone number format:', cleanPhoneNumber);
    }
    
    // Ensure we have exactly 10 digits
    if (cleanPhoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone number format. Expected 10 digits, got ${cleanPhoneNumber.length} digits: ${cleanPhoneNumber}`
      });
    }
    
    // Add 91 prefix for MSG91 API
    const msg91PhoneNumber = `91${cleanPhoneNumber}`;
    console.log('Original phone number:', phoneNumber);
    console.log('Cleaned phone number:', cleanPhoneNumber);
    console.log('MSG91 phone number:', msg91PhoneNumber);
    console.log('MSG91 phone number length:', msg91PhoneNumber.length);

    // Get MSG91 Auth Key from environment
    const authKey = process.env.MSG91_AUTH_KEY;
    
    if (!authKey) {
      console.error('MSG91_AUTH_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Send OTP using MSG91 API (try multiple approaches)
    let msg91Response;
    
    console.log('Attempting to send OTP via MSG91...');
    console.log('Phone number being sent:', cleanPhoneNumber);
    console.log('Auth key being used:', authKey ? 'Present' : 'Missing');
    
    try {
      // Primary: Use v5 API with MSG91-approved template
       console.log('Using MSG91 v5 API with MSG91-approved template...');
       console.log('Template ID: 68f38e33cb45e90f1c4a8003');
       console.log('Template Message: "Your OTP for login to OCL Services is ##OTP##. Do not share it with anyone. -OCL Services"');
       console.log('OTP Length: 6 digits');
       console.log('Status: Approved by MSG91');
      
       msg91Response = await axios.post(
         'https://control.msg91.com/api/v5/otp',
         {
           mobile: msg91PhoneNumber,
           authkey: authKey,
           template_id: '68f38e33cb45e90f1c4a8003', // MSG91-approved template ID
           otp_length: 6 // Ensure 6-digit OTP
         },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('v5 API response:', msg91Response.data);
      console.log('v5 API status:', msg91Response.status);
    } catch (error) {
      console.log('v5 API with DLT template failed:', error.response?.data || error.message);
      console.log('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Fallback: Try v4 API
      console.log('Falling back to v4 API...');
      try {
         msg91Response = await axios.get(
           `https://control.msg91.com/api/sendotp.php?authkey=${authKey}&mobile=${msg91PhoneNumber}&message=Your%20OTP%20is%20%23%23OTP%23%23&sender=MSGIND&otp_expiry=5&otp_length=6`
         );
        console.log('v4 API response:', msg91Response.data);
        console.log('v4 API status:', msg91Response.status);
      } catch (v4Error) {
        console.log('v4 API fallback also failed:', v4Error.response?.data || v4Error.message);
        throw v4Error;
      }
    }

    console.log('MSG91 OTP send response:', msg91Response.data);

    // Handle both v5 and v4 API responses
    const responseData = msg91Response.data;
    const isSuccess = (responseData && responseData.type === 'success') || 
                     (typeof responseData === 'string' && responseData.includes('OTP sent')) ||
                     (typeof responseData === 'string' && responseData.includes('success'));

    if (isSuccess) {
      console.log('OTP sent successfully to:', cleanPhoneNumber);
      return res.json({
        success: true,
        message: 'OTP sent successfully',
        data: responseData
      });
    } else {
      console.log('OTP send failed:', responseData);
      
      // Fallback: Return a test OTP for development
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        console.log('Using test OTP mode for development');
        return res.json({
          success: true,
          message: 'Test OTP mode - Use 1234 as OTP',
          testMode: true,
          testOtp: '1234',
          data: responseData
        });
      }
      
      return res.json({
        success: false,
        error: 'Failed to send OTP',
        details: responseData
      });
    }

  } catch (error) {
    console.error('Error sending OTP with MSG91:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error during OTP sending'
    });
  }
});

// MSG91 OTP verify endpoint
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    console.log('Verifying OTP for phone:', phoneNumber);
    console.log('Phone number length:', phoneNumber.length);
    console.log('OTP:', otp);
    
    // Clean and format phone number for MSG91 API
    let cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove any non-digits
    
    // If phone number already starts with 91, remove it
    if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 12) {
      cleanPhoneNumber = cleanPhoneNumber.substring(2);
    }
    
    // Ensure we have exactly 10 digits
    if (cleanPhoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone number format. Expected 10 digits, got ${cleanPhoneNumber.length} digits: ${cleanPhoneNumber}`
      });
    }
    
    // Add 91 prefix for MSG91 API
    const msg91PhoneNumber = `91${cleanPhoneNumber}`;
    console.log('Original phone number:', phoneNumber);
    console.log('Cleaned phone number:', cleanPhoneNumber);
    console.log('MSG91 phone number for verification:', msg91PhoneNumber);

    // Get MSG91 Auth Key from environment
    const authKey = process.env.MSG91_AUTH_KEY;
    
    if (!authKey) {
      console.error('MSG91_AUTH_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Verify OTP using MSG91 API (try multiple approaches)
    let msg91Response;
    
    try {
      // First try: v5 API
      msg91Response = await axios.post(
        'https://control.msg91.com/api/v5/otp/verify',
        {
          mobile: msg91PhoneNumber,
          otp: otp,
          authkey: authKey
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.log('v5 verify API failed, trying v4 API...');
      // Fallback: v4 API
      msg91Response = await axios.get(
        `https://control.msg91.com/api/verifyRequestOTP.php?authkey=${authKey}&mobile=${msg91PhoneNumber}&otp=${otp}`
      );
    }

    console.log('MSG91 OTP verify response:', msg91Response.data);

    // Handle both v5 and v4 API responses
    const responseData = msg91Response.data;
    const isSuccess = (responseData && responseData.type === 'success') || 
                     (typeof responseData === 'string' && responseData.includes('OTP verified'));

    if (isSuccess) {
      console.log('OTP verified successfully for:', phoneNumber);
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        data: responseData
      });
    } else {
      console.log('OTP verification failed:', responseData);
      
      // Fallback: Accept test OTP for development
      if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') && otp === '1234') {
        console.log('Test OTP accepted for development');
        return res.json({
          success: true,
          message: 'Test OTP verified successfully',
          testMode: true
        });
      }
      
      return res.json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

  } catch (error) {
    console.error('Error verifying OTP with MSG91:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return res.json({
        success: false,
        error: 'Invalid OTP'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error during OTP verification'
      });
    }
  }
});

// MSG91 OTP verification endpoint (legacy - for access token verification)
router.post('/verify-access-token', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        verified: false,
        error: 'Access token is required'
      });
    }

    // Get MSG91 Auth Key from environment
    const authKey = process.env.MSG91_AUTH_KEY;
    
    if (!authKey) {
      console.error('MSG91_AUTH_KEY not found in environment variables');
      return res.status(500).json({
        verified: false,
        error: 'Server configuration error'
      });
    }

    // Verify access token with MSG91
    const msg91Response = await axios.post(
      'https://control.msg91.com/api/v5/widget/verifyAccessToken',
      {
        accessToken: accessToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        }
      }
    );

    // Check if verification was successful
    if (msg91Response.data && msg91Response.data.type === 'success') {
      console.log('OTP verified successfully via MSG91');
      return res.json({
        verified: true,
        message: 'OTP verified successfully'
      });
    } else {
      console.log('OTP verification failed via MSG91:', msg91Response.data);
      return res.json({
        verified: false,
        error: 'Invalid or expired OTP'
      });
    }

  } catch (error) {
    console.error('Error verifying OTP with MSG91:', error.response?.data || error.message);
    
    // Handle specific MSG91 API errors
    if (error.response?.status === 400) {
      return res.json({
        verified: false,
        error: 'Invalid access token'
      });
    } else if (error.response?.status === 401) {
      return res.json({
        verified: false,
        error: 'Unauthorized - check MSG91 configuration'
      });
    } else {
      return res.status(500).json({
        verified: false,
        error: 'Internal server error during OTP verification'
      });
    }
  }
});

export default router;
