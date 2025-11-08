# 📧 Google OAuth Email Setup Guide

## 🎯 Overview

This guide will help you set up Google OAuth for sending emails directly through Gmail in your OCL Courier & Logistics system. This replaces the traditional SMTP method with a more secure and reliable OAuth2 authentication.

## 🔧 Prerequisites

- Google Cloud Console account
- Gmail account for sending emails
- Node.js backend with the updated email service

## 📋 Step-by-Step Setup

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Create a new project or select an existing one
   - Note down your project ID

3. **Enable Gmail API**
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application" as the application type
   - Give it a name (e.g., "OCL Email Service")
   - Click "Create"

5. **Get Your Credentials**
   - Copy the **Client ID** and **Client Secret**
   - You already have these:
     - Client ID: `1014231011235-5ch20vsj6rdlmpkvf33sod9cujs3a4a6.apps.googleusercontent.com`
     - Client Secret: `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`

### **Step 2: Backend Configuration**

1. **Install Dependencies**
   ```bash
   cd backend
   npm install googleapis
   ```

2. **Update Environment Variables**
   Add these to your `.env` file:
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=1014231011235-5ch20vsj6rdlmpkvf33sod9cujs3a4a6.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   GOOGLE_EMAIL=your-email@gmail.com
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   
   # Frontend URL for approval links
   FRONTEND_URL=http://localhost:3000
   ```

### **Step 3: OAuth Setup via Admin Dashboard**

1. **Access Admin Dashboard**
   - Login to your admin dashboard
   - Navigate to "Email Setup" in the sidebar

2. **Generate Authorization URL**
   - Click "Generate Authorization URL"
   - Copy the generated URL

3. **Authorize Gmail Access**
   - Open the authorization URL in a new tab
   - Sign in with the Gmail account you want to use for sending emails
   - Grant the requested permissions
   - Copy the authorization code from the success page

4. **Complete OAuth Setup**
   - Paste the authorization code in the "Authorization Code" field
   - Click "Complete OAuth Setup"
   - Copy the refresh token that appears

5. **Update Environment Variables**
   - Add the refresh token to your `.env` file:
   ```env
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

6. **Test Email Service**
   - Click "Test Email Service" to verify everything is working
   - You should see a success message

### **Step 4: Test the Complete Workflow**

1. **Create Corporate Pricing**
   - Go to "Corporate Pricing" in admin dashboard
   - Create a new pricing list
   - Enable "Email Approval" checkbox
   - Fill in client information (email, name, company)
   - Save the pricing

2. **Check Email Delivery**
   - The client should receive a professional email with the pricing table
   - The email should contain approval/rejection buttons

3. **Test Approval Process**
   - Click the approval button in the email
   - Fill in the client name
   - Submit the approval
   - Check that the admin dashboard updates automatically

## 🔒 Security Features

### **OAuth2 Benefits**
- **No Password Storage**: No need to store Gmail passwords
- **Token-Based**: Uses secure access tokens
- **Automatic Refresh**: Tokens refresh automatically
- **Revocable**: Can be revoked from Google account settings

### **Token Management**
- **Access Tokens**: Short-lived (1 hour), auto-refreshed
- **Refresh Tokens**: Long-lived, stored securely
- **Automatic Cleanup**: Expired tokens are handled automatically

## 🚨 Troubleshooting

### **Common Issues**

1. **"Invalid Grant" Error**
   - The refresh token may have expired
   - Re-run the OAuth setup process
   - Generate a new refresh token

2. **"Access Denied" Error**
   - Check that Gmail API is enabled in Google Cloud Console
   - Verify OAuth consent screen is configured
   - Ensure the Gmail account has proper permissions

3. **"Quota Exceeded" Error**
   - Gmail API has daily sending limits
   - Check your Google Cloud Console quotas
   - Consider upgrading your Google Cloud plan

4. **Email Not Sending**
   - Check the backend logs for error messages
   - Verify all environment variables are set correctly
   - Test the email service using the admin dashboard

### **Debug Steps**

1. **Check Backend Logs**
   ```bash
   cd backend
   npm run dev
   # Look for email service initialization messages
   ```

2. **Test OAuth Connection**
   - Use the "Test Email Service" button in admin dashboard
   - Check for success/error messages

3. **Verify Environment Variables**
   ```bash
   # Check if all required variables are set
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   echo $GOOGLE_EMAIL
   echo $GOOGLE_REFRESH_TOKEN
   ```

## 📊 Monitoring & Maintenance

### **Token Refresh**
- Access tokens refresh automatically every hour
- Refresh tokens are long-lived but may expire
- Monitor backend logs for refresh errors

### **Email Delivery Tracking**
- Check Gmail "Sent" folder for sent emails
- Monitor backend logs for delivery confirmations
- Use Google Cloud Console for API usage statistics

### **Quota Management**
- Gmail API has daily sending limits
- Monitor usage in Google Cloud Console
- Consider implementing email queuing for high volume

## 🔄 Fallback Options

### **SMTP Fallback**
The system includes automatic SMTP fallback if OAuth fails:
```env
# SMTP Configuration (fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Multiple Email Providers**
You can configure multiple email providers for redundancy:
- Gmail (OAuth2)
- Outlook (OAuth2)
- Custom SMTP servers

## 📈 Performance Optimization

### **Email Caching**
- Templates are cached for faster rendering
- Connection pooling for better performance
- Batch email sending for multiple recipients

### **Error Handling**
- Automatic retry for failed emails
- Graceful degradation to SMTP
- Comprehensive error logging

## 🎯 Best Practices

### **Security**
- Never commit refresh tokens to version control
- Use environment variables for all sensitive data
- Regularly rotate OAuth credentials
- Monitor for suspicious activity

### **Reliability**
- Implement email queuing for high volume
- Use multiple email providers for redundancy
- Monitor delivery rates and bounce handling
- Set up alerts for email service failures

### **User Experience**
- Test email templates on multiple devices
- Ensure responsive design for mobile
- Provide clear instructions for clients
- Include support contact information

## 📞 Support

### **Google Cloud Support**
- Google Cloud Console Help Center
- Gmail API Documentation
- OAuth 2.0 Documentation

### **System Support**
- Check backend logs for detailed error messages
- Use the admin dashboard test functions
- Monitor email delivery in Gmail

---

## 🎉 Success Checklist

- [ ] Google Cloud Console project created
- [ ] Gmail API enabled
- [ ] OAuth 2.0 credentials configured
- [ ] Backend dependencies installed
- [ ] Environment variables set
- [ ] OAuth authorization completed
- [ ] Refresh token obtained and configured
- [ ] Email service tested successfully
- [ ] Corporate pricing email workflow tested
- [ ] Client approval process verified

**🎊 Your Google OAuth email system is now ready for production use!**
