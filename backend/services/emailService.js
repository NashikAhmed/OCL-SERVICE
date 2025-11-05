import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import S3Service from './s3Service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class EmailService {
  constructor() {
    this.oauth2Client = null;
    this.transporter = null;
    this.isInitialized = false;
    this.initializeEmailService();
  }

  async initializeEmailService() {
    try {
      // Try SMTP first if credentials are available
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📧 Using Gmail SMTP configuration...');
        this.initializeSMTPFallback();
      } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('📧 Using Google OAuth configuration...');
        await this.initializeOAuth();
      } else {
        console.log('⚠️ No email credentials found, using default SMTP fallback');
        this.initializeSMTPFallback();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      console.log('🔄 Falling back to SMTP configuration...');
      this.initializeSMTPFallback();
      this.isInitialized = true;
    }
  }

  async initializeOAuth() {
    try {
      // Initialize OAuth2 client (using the same client as login)
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, // This should be your login OAuth client ID
        process.env.GOOGLE_CLIENT_SECRET, // This should be your login OAuth client secret
        'urn:ietf:wg:oauth:2.0:oob' // For installed applications
      );

      // Set refresh token if available
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
      }

      // Create transporter with OAuth2
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GOOGLE_EMAIL || 'your-email@gmail.com',
          clientId: this.oauth2Client._clientId,
          clientSecret: this.oauth2Client._clientSecret,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: null // Will be set automatically
        }
      });

      console.log('✅ Google OAuth email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google OAuth email service:', error);
      throw error; // Re-throw to trigger fallback
    }
  }

  initializeSMTPFallback() {
    console.log('🔄 Falling back to SMTP configuration...');
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'your-email@gmail.com',
          pass: process.env.SMTP_PASS || 'your-app-password'
        }
      });
      console.log('✅ SMTP transporter created successfully');
    } catch (error) {
      console.error('❌ Failed to create SMTP transporter:', error);
      throw error;
    }
  }

  // Generate OAuth2 authorization URL for initial setup
  generateAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      console.log('✅ OAuth2 tokens obtained successfully');
      console.log('Refresh Token:', tokens.refresh_token);
      console.log('Add this to your .env file: GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      throw error;
    }
  }

  // Generate HTML email template for pricing approval
  generatePricingApprovalEmail(pricingData, approvalUrl, rejectionUrl) {
    const { name, clientName, clientCompany, doxPricing, nonDoxSurfacePricing, nonDoxAirPricing, priorityPricing, reversePricing } = pricingData;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Corporate Pricing Approval - ${name}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                border:1px solid black;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .pricing-section {
                margin: 25px 0;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .pricing-header {
                background-color: #f8f9fa;
                padding: 15px 20px;
                font-weight: bold;
                color: #495057;
                border-bottom: 1px solid #e0e0e0;
            }
            .pricing-table {
                width: 100%;
                border-collapse: collapse;
                margin: 0;
            }
            .pricing-table th,
            .pricing-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            .pricing-table th {
                background-color: #f8f9fa;
                font-weight: 600;
                color: #495057;
            }
            .pricing-table tr:hover {
                background-color: #f8f9fa;
            }
            .action-buttons {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            .btn-approve {
                background-color: #28a745;
                color: white;
            }
            .btn-approve:hover {
                background-color: #218838;
                transform: translateY(-2px);
            }
            .btn-reject {
                background-color: #dc3545;
                color: white;
            }
            .btn-reject:hover {
                background-color: #c82333;
                transform: translateY(-2px);
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
            .company-info {
                margin: 20px 0;
                padding: 20px;
                background-color: #e3f2fd;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }
            .urgent-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Corporate Pricing Approval</h1>
                <p>OCL Courier & Logistics</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Dear ${clientName || 'Valued Client'},
                </div>
                
                <p>We are pleased to present the corporate pricing proposal for <strong>${clientCompany || 'your company'}</strong>. Please review the pricing details below and take action to approve or reject this proposal.</p>
                
                <div class="urgent-notice">
                    <strong>⏰ Action Required:</strong> Please review and respond to this pricing proposal within 7 days to ensure timely processing.
                </div>

                <div class="company-info">
                    <h3>📊 Pricing Proposal: ${name}</h3>
                    <p><strong>Proposal Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Company:</strong> ${clientCompany || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${clientName || 'N/A'}</p>
                </div>

                ${this.generatePricingTables(doxPricing, nonDoxSurfacePricing, nonDoxAirPricing, priorityPricing, reversePricing)}

                <div class="action-buttons">
                    <h3>🎯 Take Action</h3>
                    <p>Please review the pricing details above and choose your response:</p>
                    <a href="${approvalUrl}" class="btn btn-approve">✅ Approve Pricing</a>
                    <a href="${rejectionUrl}" class="btn btn-reject">❌ Reject Pricing</a>
                </div>

                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h4>📞 Need Help?</h4>
                    <p>If you have any questions about this pricing proposal, please contact our corporate team:</p>
                    <ul>
                        <li><strong>Email:</strong> corporate@oclcourier.com</li>
                        <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                        <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from OCL Courier & Logistics.</p>
                <p>Please do not reply to this email. For support, contact us at support@oclcourier.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate pricing tables HTML
  generatePricingTables(doxPricing, nonDoxSurfacePricing, nonDoxAirPricing, priorityPricing, reversePricing) {
    let html = '';

    // DOX Pricing Table
    if (doxPricing) {
      html += `
        <div class="pricing-section">
          <div class="pricing-header">📦 Standard Service - DOX Pricing</div>
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Weight Range</th>
                <th>Assam</th>
                <th>NE by Surface</th>
                <th>NE by Air (Agent Import)</th>
                <th>Rest of India</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(doxPricing).map(([weight, prices]) => `
                <tr>
                  <td><strong>${weight}</strong></td>
                  <td>₹${prices.assam || 0}</td>
                  <td>₹${prices.neBySurface || 0}</td>
                  <td>₹${prices.neByAirAgtImp || 0}</td>
                  <td>₹${prices.restOfIndia || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // NON DOX Surface Pricing
    if (nonDoxSurfacePricing) {
      html += `
        <div class="pricing-section">
          <div class="pricing-header">🚛 NON DOX Surface Pricing</div>
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Assam</th>
                <th>NE by Surface</th>
                <th>NE by Air (Agent Import)</th>
                <th>Rest of India</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₹${nonDoxSurfacePricing.assam || 0}</td>
                <td>₹${nonDoxSurfacePricing.neBySurface || 0}</td>
                <td>₹${nonDoxSurfacePricing.neByAirAgtImp || 0}</td>
                <td>₹${nonDoxSurfacePricing.restOfIndia || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // NON DOX Air Pricing
    if (nonDoxAirPricing) {
      html += `
        <div class="pricing-section">
          <div class="pricing-header">✈️ NON DOX Air Pricing</div>
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Assam</th>
                <th>NE by Surface</th>
                <th>NE by Air (Agent Import)</th>
                <th>Rest of India</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₹${nonDoxAirPricing.assam || 0}</td>
                <td>₹${nonDoxAirPricing.neBySurface || 0}</td>
                <td>₹${nonDoxAirPricing.neByAirAgtImp || 0}</td>
                <td>₹${nonDoxAirPricing.restOfIndia || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Priority Pricing
    if (priorityPricing) {
      html += `
        <div class="pricing-section">
          <div class="pricing-header">⚡ Priority Service - DOX Pricing</div>
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Weight Range</th>
                <th>Assam</th>
                <th>NE by Surface</th>
                <th>NE by Air (Agent Import)</th>
                <th>Rest of India</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(priorityPricing).map(([weight, prices]) => `
                <tr>
                  <td><strong>${weight}</strong></td>
                  <td>₹${prices.assam || 0}</td>
                  <td>₹${prices.neBySurface || 0}</td>
                  <td>₹${prices.neByAirAgtImp || 0}</td>
                  <td>₹${prices.restOfIndia || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Reverse Pricing
    if (reversePricing) {
      html += `
        <div class="pricing-section">
          <div class="pricing-header">🔄 Reverse Pricing (To Assam & North East)</div>
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>By Road (Normal)</th>
                <th>By Road (Priority)</th>
                <th>By Train (Normal)</th>
                <th>By Train (Priority)</th>
                <th>By Flight (Normal)</th>
                <th>By Flight (Priority)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>To Assam</strong></td>
                <td>₹${reversePricing.toAssam?.byRoad?.normal || 0}</td>
                <td>₹${reversePricing.toAssam?.byRoad?.priority || 0}</td>
                <td>₹${reversePricing.toAssam?.byTrain?.normal || 0}</td>
                <td>₹${reversePricing.toAssam?.byTrain?.priority || 0}</td>
                <td>₹${reversePricing.toAssam?.byFlight?.normal || 0}</td>
                <td>₹${reversePricing.toAssam?.byFlight?.priority || 0}</td>
              </tr>
              <tr>
                <td><strong>To North East</strong></td>
                <td>₹${reversePricing.toNorthEast?.byRoad?.normal || 0}</td>
                <td>₹${reversePricing.toNorthEast?.byRoad?.priority || 0}</td>
                <td>₹${reversePricing.toNorthEast?.byTrain?.normal || 0}</td>
                <td>₹${reversePricing.toNorthEast?.byTrain?.priority || 0}</td>
                <td>₹${reversePricing.toNorthEast?.byFlight?.normal || 0}</td>
                <td>₹${reversePricing.toNorthEast?.byFlight?.priority || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    return html;
  }

  // Send pricing approval email
  async sendPricingApprovalEmail(pricingData, approvalUrl, rejectionUrl) {
    try {
      const { clientEmail, clientName, name } = pricingData;
      
      if (!clientEmail) {
        throw new Error('Client email is required to send approval email');
      }

      // Ensure email service is initialized
      if (!this.isInitialized) {
        await this.initializeEmailService();
      }

      if (!this.transporter) {
        throw new Error('Email service not properly initialized');
      }

      // Ensure OAuth2 access token is fresh
      if (this.oauth2Client && process.env.GOOGLE_REFRESH_TOKEN) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          this.oauth2Client.setCredentials(credentials);
          
          // Update transporter with new access token
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.GOOGLE_EMAIL || 'your-email@gmail.com',
              clientId: this.oauth2Client._clientId,
              clientSecret: this.oauth2Client._clientSecret,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: credentials.access_token
            }
          });
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh OAuth2 token, using existing credentials:', refreshError.message);
        }
      }

      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to: clientEmail,
        subject: `📋 Corporate Pricing Approval Required - ${name}`,
        html: this.generatePricingApprovalEmail(pricingData, approvalUrl, rejectionUrl),
        text: this.generateTextVersion(pricingData, approvalUrl, rejectionUrl),
        attachments: []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Pricing approval email sent to ${clientEmail}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending pricing approval email:', error);
      throw error;
    }
  }

  // Generate text version of the email
  generateTextVersion(pricingData, approvalUrl, rejectionUrl) {
    const { name, clientName, clientCompany } = pricingData;
    
    return `
Corporate Pricing Approval - ${name}

Dear ${clientName || 'Valued Client'},

We are pleased to present the corporate pricing proposal for ${clientCompany || 'your company'}.

Please review the pricing details and take action:

APPROVE: ${approvalUrl}
REJECT: ${rejectionUrl}

This proposal requires your response within 7 days.

For questions, contact us at:
- Email: corporate@oclcourier.com
- Phone: +91-XXX-XXXX-XXXX

Best regards,
OCL Courier & Logistics Team
    `;
  }

  // Generate HTML email template for corporate registration completion
  generateCorporateRegistrationEmail(corporateData) {
    const { corporateId, companyName, email, contactNumber, username, password } = corporateData;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Corporate Registration Complete - ${companyName}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .credentials-section {
                margin: 25px 0;
                border: 2px solid #28a745;
                border-radius: 8px;
                overflow: hidden;
                background-color: #f8fff9;
            }
            .credentials-header {
                background-color: #28a745;
                padding: 15px 20px;
                font-weight: bold;
                color: white;
                text-align: center;
            }
            .credentials-content {
                padding: 20px;
            }
            .credential-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .credential-item:last-child {
                border-bottom: none;
            }
            .credential-label {
                font-weight: 600;
                color: #495057;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                color: #495057;
            }
            .company-info {
                margin: 20px 0;
                padding: 20px;
                background-color: #e3f2fd;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }
            .important-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
            .login-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }
            .login-button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Registration Complete!</h1>
                <p>OCL Courier & Logistics</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Dear ${companyName} Team,
                </div>
                
                <p>Congratulations! Your corporate registration with OCL Courier & Logistics has been successfully completed.</p>
                
                <div class="company-info">
                    <h3>📋 Registration Details</h3>
                    <p><strong>Corporate ID:</strong> ${corporateId}</p>
                    <p><strong>Company Name:</strong> ${companyName}</p>
                    <p><strong>Contact Email:</strong> ${email}</p>
                    <p><strong>Contact Number:</strong> ${contactNumber}</p>
                    <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="credentials-section">
                    <div class="credentials-header">
                        🔐 Your Login Credentials
                    </div>
                    <div class="credentials-content">
                        <div class="credential-item">
                            <span class="credential-label">Username:</span>
                            <span class="credential-value">${username}</span>
                        </div>
                        <div class="credential-item">
                            <span class="credential-label">Password:</span>
                            <span class="credential-value">${password}</span>
                        </div>
                    </div>
                </div>

                <div class="important-notice">
                    <strong>🔒 Important Security Notice:</strong>
                    <ul>
                        <li>Please save these credentials in a secure location</li>
                        <li>We recommend changing your password after first login</li>
                        <li>Do not share these credentials with unauthorized personnel</li>
                        <li>Your username is your ${email.includes('@') ? 'email address' : 'phone number'}</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/corporate-login" class="login-button">
                        🚀 Access Your Dashboard
                    </a>
                </div>

                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h4>📞 Need Help?</h4>
                    <p>If you have any questions or need assistance, please contact our corporate team:</p>
                    <ul>
                        <li><strong>Email:</strong> corporate@oclcourier.com</li>
                        <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                        <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from OCL Courier & Logistics.</p>
                <p>Please do not reply to this email. For support, contact us at support@oclcourier.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send corporate registration completion email
  async sendCorporateRegistrationEmail(corporateData) {
    try {
      const { email, companyName, corporateId } = corporateData;
      
      if (!email) {
        throw new Error('Corporate email is required to send registration email');
      }

      // Ensure email service is initialized
      if (!this.isInitialized) {
        await this.initializeEmailService();
      }

      if (!this.transporter) {
        throw new Error('Email service not properly initialized');
      }

      // Ensure OAuth2 access token is fresh
      if (this.oauth2Client && process.env.GOOGLE_REFRESH_TOKEN) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          this.oauth2Client.setCredentials(credentials);
          
          // Update transporter with new access token
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.GOOGLE_EMAIL || 'your-email@gmail.com',
              clientId: this.oauth2Client._clientId,
              clientSecret: this.oauth2Client._clientSecret,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: credentials.access_token
            }
          });
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh OAuth2 token, using existing credentials:', refreshError.message);
        }
      }

      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to: email,
        subject: `🎉 Corporate Registration Complete - ${companyName} (${corporateId})`,
        html: this.generateCorporateRegistrationEmail(corporateData),
        text: this.generateCorporateRegistrationTextVersion(corporateData),
        attachments: []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Corporate registration email sent to ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Error sending corporate registration email:', error);
      throw error;
    }
  }

  // Generate text version of corporate registration email
  generateCorporateRegistrationTextVersion(corporateData) {
    const { corporateId, companyName, email, contactNumber, username, password } = corporateData;
    
    return `
Corporate Registration Complete - ${companyName}

Dear ${companyName} Team,

Congratulations! Your corporate registration with OCL Courier & Logistics has been successfully completed.

REGISTRATION DETAILS:
- Corporate ID: ${corporateId}
- Company Name: ${companyName}
- Contact Email: ${email}
- Contact Number: ${contactNumber}
- Registration Date: ${new Date().toLocaleDateString()}

YOUR LOGIN CREDENTIALS:
- Username: ${username}
- Password: ${password}

IMPORTANT SECURITY NOTICE:
- Please save these credentials in a secure location
- We recommend changing your password after first login
- Do not share these credentials with unauthorized personnel
- Your username is your ${email.includes('@') ? 'email address' : 'phone number'}

LOGIN URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/corporate-login

For questions or assistance, contact our corporate team:
- Email: corporate@oclcourier.com
- Phone: +91-XXX-XXXX-XXXX
- Business Hours: Monday - Friday, 9:00 AM - 6:00 PM

Best regards,
OCL Courier & Logistics Team
    `;
  }

  // Send approval confirmation email
  async sendApprovalConfirmationEmail(pricingData, action) {
    try {
      const { clientEmail, clientName, name } = pricingData;
      
      const subject = action === 'approved' 
        ? `✅ Pricing Approved - ${name}` 
        : `❌ Pricing Rejected - ${name}`;
      
      const message = action === 'approved'
        ? `Your pricing proposal "${name}" has been approved and is now active.`
        : `Your pricing proposal "${name}" has been rejected. Please contact us for further discussion.`;

      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to: clientEmail,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: ${action === 'approved' ? '#28a745' : '#dc3545'};">
              ${action === 'approved' ? '✅ Approved' : '❌ Rejected'}
            </h2>
            <p>Dear ${clientName || 'Valued Client'},</p>
            <p>${message}</p>
            <p>Thank you for your business with OCL Courier & Logistics.</p>
            <hr>
            <p><small>This is an automated message. For support, contact us at support@oclcourier.com</small></p>
          </div>
        `,
        text: `Dear ${clientName || 'Valued Client'},\n\n${message}\n\nThank you for your business with OCL Courier & Logistics.`,
        attachments: []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to ${clientEmail}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      throw error;
    }
  }

  // Generate HTML email template for employee registration completion
  generateEmployeeRegistrationEmail(employeeData) {
    const { employeeId, name, email, phone, username, password } = employeeData;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Employee Registration Complete - ${name}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .credentials-section {
                margin: 25px 0;
                border: 2px solid #28a745;
                border-radius: 8px;
                overflow: hidden;
                background-color: #f8fff9;
            }
            .credentials-header {
                background-color: #28a745;
                padding: 15px 20px;
                font-weight: bold;
                color: white;
                text-align: center;
            }
            .credentials-content {
                padding: 20px;
            }
            .credential-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .credential-item:last-child {
                border-bottom: none;
            }
            .credential-label {
                font-weight: 600;
                color: #495057;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                color: #495057;
            }
            .employee-info {
                margin: 20px 0;
                padding: 20px;
                background-color: #e3f2fd;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }
            .important-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
            .login-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }
            .login-button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Employee Registration Complete!</h1>
                <p>OCL Courier & Logistics</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Dear ${name},
                </div>
                
                <p>Congratulations! Your employee registration with OCL Courier & Logistics has been successfully completed.</p>
                
                <div class="employee-info">
                    <h3>📋 Registration Details</h3>
                    <p><strong>Employee ID:</strong> ${employeeId}</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="credentials-section">
                    <div class="credentials-header">
                        🔐 Your Login Credentials
                    </div>
                    <div class="credentials-content">
                        <div class="credential-item">
                            <span class="credential-label">Username:</span>
                            <span class="credential-value">${username}</span>
                        </div>
                        <div class="credential-item">
                            <span class="credential-label">Password:</span>
                            <span class="credential-value">${password}</span>
                        </div>
                    </div>
                </div>

                <div class="important-notice">
                    <strong>🔒 Important Security Notice:</strong>
                    <ul>
                        <li>Please save these credentials in a secure location</li>
                        <li>You will be required to change your password on first login</li>
                        <li>Do not share these credentials with unauthorized personnel</li>
                        <li>Your username is your email address</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/office-login" class="login-button">
                        🚀 Access Your Dashboard
                    </a>
                </div>

                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h4>📞 Need Help?</h4>
                    <p>If you have any questions or need assistance, please contact our HR team:</p>
                    <ul>
                        <li><strong>Email:</strong> hr@oclcourier.com</li>
                        <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                        <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from OCL Courier & Logistics.</p>
                <p>Please do not reply to this email. For support, contact us at support@oclcourier.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send employee registration completion email
  async sendEmployeeRegistrationEmail(employeeData) {
    try {
      const { email, name, employeeId } = employeeData;
      
      if (!email) {
        throw new Error('Employee email is required to send registration email');
      }

      // Ensure email service is initialized
      if (!this.isInitialized) {
        await this.initializeEmailService();
      }

      if (!this.transporter) {
        throw new Error('Email service not properly initialized');
      }

      // Ensure OAuth2 access token is fresh
      if (this.oauth2Client && process.env.GOOGLE_REFRESH_TOKEN) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          this.oauth2Client.setCredentials(credentials);
          
          // Update transporter with new access token
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.GOOGLE_EMAIL || 'your-email@gmail.com',
              clientId: this.oauth2Client._clientId,
              clientSecret: this.oauth2Client._clientSecret,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: credentials.access_token
            }
          });
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh OAuth2 token, using existing credentials:', refreshError.message);
        }
      }

      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to: email,
        subject: `🎉 Employee Registration Complete - ${name} (${employeeId})`,
        html: this.generateEmployeeRegistrationEmail(employeeData),
        text: this.generateEmployeeRegistrationTextVersion(employeeData),
        attachments: []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Employee registration email sent to ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Error sending employee registration email:', error);
      throw error;
    }
  }

  // Generate text version of employee registration email
  generateEmployeeRegistrationTextVersion(employeeData) {
    const { employeeId, name, email, phone, username, password } = employeeData;
    
    return `
Employee Registration Complete - ${name}

Dear ${name},

Congratulations! Your employee registration with OCL Courier & Logistics has been successfully completed.

REGISTRATION DETAILS:
- Employee ID: ${employeeId}
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Registration Date: ${new Date().toLocaleDateString()}

YOUR LOGIN CREDENTIALS:
- Username: ${username}
- Password: ${password}

IMPORTANT SECURITY NOTICE:
- Please save these credentials in a secure location
- You will be required to change your password on first login
- Do not share these credentials with unauthorized personnel
- Your username is your email address

LOGIN URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/office-login

For questions or assistance, contact our HR team:
- Email: hr@oclcourier.com
- Phone: +91-XXX-XXXX-XXXX
- Business Hours: Monday - Friday, 9:00 AM - 6:00 PM

Best regards,
OCL Courier & Logistics Team
    `;
  }

  // Validate image URLs before using them in emails
  async validateImageUrls(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    const validatedUrls = [];
    for (const imageUrl of imageUrls) {
      try {
        // Check if URL is valid
        new URL(imageUrl);
        validatedUrls.push(imageUrl);
        console.log(`✅ Valid image URL: ${imageUrl.substring(0, 50)}...`);
      } catch (error) {
        console.warn(`⚠️ Invalid image URL: ${imageUrl}`, error.message);
        // Skip invalid URLs
      }
    }
    
    return validatedUrls;
  }

  // Generate HTML email template for shipment confirmation
  async generateShipmentConfirmationEmail(shipmentData) {
    const {
      consignmentNumber,
      invoiceNumber,
      receiverCompanyName,
      receiverConcernPerson,
      destinationCity,
      bookingDate,
      senderCompanyName,
      senderConcernPerson,
      recipientConcernPerson,
      recipientPinCode,
      recipientMobileNumber,
      invoiceValue,
      packageImages,
      invoiceImages
    } = shipmentData;

    // Calculate estimated delivery date (booking date + 5 days)
    const estimatedDeliveryDate = new Date(bookingDate);
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
    const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format arrival date
    const arrivalDate = estimatedDeliveryDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    });

    // Determine sender name (company name or concern person)
    const senderName = senderCompanyName || senderConcernPerson;
    
    // Determine receiver display (company name or concern person)
    const receiverDisplay = receiverCompanyName || receiverConcernPerson;
    
    // Debug: Log the image URLs being used
    console.log('📧 Email Debug - Package Images:', packageImages);
    console.log('📧 Email Debug - Invoice Images:', invoiceImages);

    // Validate image URLs first
    const validatedPackageImages = await this.validateImageUrls(packageImages);
    const validatedInvoiceImages = await this.validateImageUrls(invoiceImages);
    
    console.log(`📧 Validated ${validatedPackageImages.length}/${packageImages?.length || 0} package images`);
    console.log(`📧 Validated ${validatedInvoiceImages.length}/${invoiceImages?.length || 0} invoice images`);

    // Generate direct presigned URLs for email access (7 days expiration)
    console.log('🔗 Generating direct presigned URLs for email images...');
    const [packageImageUrls, invoiceImageUrls, logoPermanentUrl] = await Promise.all([
      S3Service.convertToPermanentUrlsForEmail(validatedPackageImages), // Direct presigned URLs
      S3Service.convertToPermanentUrlsForEmail(validatedInvoiceImages), // Direct presigned URLs
      S3Service.convertToPermanentUrlsForEmail(['https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/Own-Upload/logo/Group_5-removebg-preview.png']) // Direct presigned URL for logo
    ]);

    // Log presigned URL usage
    console.log('📧 Using direct presigned URLs for email images:');
    console.log(`📦 Package Images: ${packageImageUrls.length} presigned URLs generated`);
    console.log(`📄 Invoice Images: ${invoiceImageUrls.length} presigned URLs generated`);
    console.log(`🏢 OCL Logo: Presigned URL generated - ${logoPermanentUrl[0] ? logoPermanentUrl[0].substring(0, 100) + '...' : 'N/A'}`);

    // Generate package images HTML with error handling
    const packageImagesHtml = packageImageUrls && packageImageUrls.length > 0 
      ? packageImageUrls.map((imageUrl, index) => {
          console.log(`📧 Using presigned package image URL ${index + 1}:`, imageUrl.substring(0, 100) + '...');
          return `<img src="${imageUrl}" alt="Package Image ${index + 1}" class="package-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #E5E5E5; background-color: #EFEFEF; margin: 5px;" onerror="this.style.display='none'; console.log('Failed to load package image ${index + 1}');">`;
        }).join('')
      : '';

    // Generate invoice images HTML with error handling
    const invoiceImagesHtml = invoiceImageUrls && invoiceImageUrls.length > 0 
      ? invoiceImageUrls.map((imageUrl, index) => {
          console.log(`📧 Using presigned invoice image URL ${index + 1}:`, imageUrl.substring(0, 100) + '...');
          return `<img src="${imageUrl}" alt="Invoice Image ${index + 1}" class="invoice-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #E5E5E5; background-color: #EFEFEF; margin: 5px;" onerror="this.style.display='none'; console.log('Failed to load invoice image ${index + 1}');">`;
        }).join('')
      : '';

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shipment Confirmed - ${consignmentNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;line-height:1.5;color:#000;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;">
<tr><td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

  <!-- Header -->
  <tr>
    <td style="background-color:#233700;color:#fff;padding:22px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="left">
            <img src="${logoPermanentUrl[0] || 'https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/Own-Upload/logo/Group_5-removebg-preview.png'}" alt="OCL Logo" width="80" height="25" style="display:block;object-fit:contain;" onerror="this.src='https://ocl-services-uploads.s3.ap-south-1.amazonaws.com/Own-Upload/logo/Group_5-removebg-preview.png';">
          </td>
          <td align="right" style="font-size:11px;line-height:1.4;">
            <div style="font-weight:bold;"><a href="#" style="color:#fff;text-decoration:underline;">Your Shipment Details</a></div>
            <div style="font-weight:bold;"><a href="http://oclservices.com/" style="color:#fff;text-decoration:underline;">oclservices.com</a></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Safety Banner -->
  <tr>
    <td style="background-color:#b3c3b4;color:#0c0b42;padding:0px 15px;text-align:center;font-size:10px;font-weight:500;">
      Your safety matters. Every shipment is sanitized and safely handled.
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:15px 18px 10px;background-color:#ffffff;">
      <p style="margin:0;font-size:14px;">Hi ${senderName},</p>
      <p style="margin:5px 0 10px;font-size:13px;">Your shipment has been placed successfully.</p>
      <p style="font-size:13px;margin:0 0 6px;">
        We aim to deliver by <strong>${formattedDeliveryDate}</strong>. Once packed and shipped, you’ll be updated with tracking info.
      </p>
    </td>
  </tr>

  <!-- Order Details -->
  <tr>
    <td style="background-color:#efc4c4;padding:15px 18px;border-top:1px solid #eee;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top">
            <h3 style="font-size:14px;margin:0 0 5px;font-weight:bold;">Shipment Details</h3>
            <p style="margin:0;font-size:12px;">AWB: <a href="#" style="color:#0077cc;text-decoration:none;">${consignmentNumber}</a></p>
            <p style="margin:0;font-size:12px;">Placed: ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p style="margin:0;font-size:12px;">Delivered to: ${recipientConcernPerson}, ${recipientPinCode}</p>
          </td>
          <td align="right" valign="top">
            <a href="#" style="display:inline-block;background-color:#000;color:#fff;text-decoration:none;padding:8px 15px;border-radius:4px;font-size:12px;margin-top:15px;">Track</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Package/Invoice Images -->
  <tr>
    <td style="padding:10px 18px;background-color:#ffffff;">
      ${packageImageUrls && packageImageUrls.length > 0 ? `
      <div>
        <h5 style="color:#FF8C00;font-size:13px;margin:0 0 5px;">Package Images:</h5>
        <table role="presentation" width="100%" cellpadding="3" cellspacing="0"><tr>${packageImagesHtml}</tr></table>
      </div>` : ''}
      ${invoiceImageUrls && invoiceImageUrls.length > 0 ? `
      <div style="margin-top:10px;">
        <h5 style="color:#FF8C00;font-size:13px;margin:0 0 5px;">Invoice Images:</h5>
        <table role="presentation" width="100%" cellpadding="3" cellspacing="0"><tr>${invoiceImagesHtml}</tr></table>
      </div>` : ''}
    </td>
  </tr>

  <!-- Please Note -->
  <tr>
    <td style="background-color:#5c6f6c;padding:15px 18px;">
      <h4 style="font-size:13px;font-weight:bold;margin:0 0 5px;color:white;">Please note:</h4>
      <p style="font-size:12px;margin:0 0 6px;line-height:1.4;color:white;">
        We never ask for banking details. Avoid sharing personal info with callers claiming to be from OCL.
      </p>
      <p style="font-size:12px;margin:0;color:white;">
        Need help? Contact <a href="tel:+918453994809" style="color:white;text-decoration:none;">+91 8453994809</a> or 
        <a href="mailto:info@oclservices.com" style="color:white;text-decoration:none;">info@oclservices.com</a>.
      </p>
    </td>
  </tr>

  <!-- Footer Icons -->
  <tr>
    <td style="background-color:#ffffff;padding:15px 18px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" width="33%">
            <div style="width:35px;height:35px;border-radius:50%;margin:0 auto 5px;line-height:35px;font-size:16px;">🛡️</div>
            <div style="font-size:11px;">Assured Quality</div>
          </td>
          <td align="center" width="33%">
            <div style="width:35px;height:35px;border-radius:50%;margin:0 auto 5px;line-height:35px;font-size:16px;">📦</div>
            <div style="font-size:11px;">100% Handpicked</div>
          </td>
          <td align="center" width="33%">
            <div style="width:35px;height:35px;border-radius:50%;margin:0 auto 5px;line-height:35px;font-size:16px;">↩️</div>
            <div style="font-size:11px;">Easy Returns</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Social Footer -->
  <tr>
    <td style="background-color:#012A02;color:#fff;padding:12px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="left">
            <!-- Facebook Icon -->
            <a href="https://facebook.com/oclcourier" style="display:inline-block;background-color:#1877F2;border-radius:50%;width:32px;height:32px;text-align:center;line-height:32px;margin-right:8px;text-decoration:none;vertical-align:middle;">
              <span style="color:#fff;font-size:16px;font-weight:bold;">f</span>
            </a>
            <!-- Instagram Icon -->
            <a href="https://www.instagram.com/ocl_services/" style="display:inline-block;background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);border-radius:50%;width:32px;height:32px;text-align:center;line-height:32px;margin-right:8px;text-decoration:none;vertical-align:middle;">
              <span style="color:#fff;font-size:16px;font-weight:bold;">📷</span>
            </a>
            <!-- LinkedIn Icon -->
            <a href="https://www.linkedin.com/company/our-courier-and-logistics/" style="display:inline-block;background-color:#0077B5;border-radius:50%;width:32px;height:32px;text-align:center;line-height:32px;margin-right:8px;text-decoration:none;vertical-align:middle;">
              <span style="color:#fff;font-size:16px;font-weight:bold;">in</span>
            </a>
          </td>
          <td align="right" style="font-size:11px;">
            <a href="mailto:info@oclservices.com" style="color:#fff;text-decoration:underline;margin-right:6px;">Contact</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/faq" style="color:#fff;text-decoration:underline;margin-right:6px;">FAQ</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color:#fff;text-decoration:underline;">Website</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr></table>

</body>
</html>


    `;
  }

  // Send shipment confirmation email
  async sendShipmentConfirmationEmail(shipmentData) {
    try {
      const { senderEmail, consignmentNumber } = shipmentData;
      
      if (!senderEmail) {
        throw new Error('Sender email is required to send shipment confirmation');
      }

      // Ensure email service is initialized
      if (!this.isInitialized) {
        await this.initializeEmailService();
      }

      if (!this.transporter) {
        throw new Error('Email service not properly initialized');
      }

      // Ensure OAuth2 access token is fresh
      if (this.oauth2Client && process.env.GOOGLE_REFRESH_TOKEN) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          this.oauth2Client.setCredentials(credentials);
          
          // Update transporter with new access token
          this.transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.GOOGLE_EMAIL || 'your-email@gmail.com',
              clientId: this.oauth2Client._clientId,
              clientSecret: this.oauth2Client._clientSecret,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: credentials.access_token
            }
          });
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh OAuth2 token, using existing credentials:', refreshError.message);
        }
      }

      // Generate email content with error handling for images
      let emailHtml;
      try {
        emailHtml = await this.generateShipmentConfirmationEmail(shipmentData);
        console.log('✅ Email HTML generated successfully');
      } catch (htmlError) {
        console.error('❌ Error generating email HTML:', htmlError);
        // Fallback to text-only email if HTML generation fails
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>📦 Shipment Confirmed - AWB: ${consignmentNumber}</h2>
            <p>Your shipment has been successfully booked with OCL Courier & Logistics.</p>
            <p>Due to technical issues, images could not be included in this email.</p>
            <p>Please contact support if you need to view your shipment images.</p>
            <hr>
            <p><small>This is an automated message. For support, contact us at support@oclcourier.com</small></p>
          </div>
        `;
      }

      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to: senderEmail,
        subject: `📦 Shipment Confirmed - AWB: ${consignmentNumber}`,
        html: emailHtml,
        text: this.generateShipmentConfirmationTextVersion(shipmentData),
        attachments: []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Shipment confirmation email sent to ${senderEmail}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: senderEmail
      };
    } catch (error) {
      console.error('❌ Error sending shipment confirmation email:', error);
      throw error;
    }
  }

  // Generate text version of shipment confirmation email
  generateShipmentConfirmationTextVersion(shipmentData) {
    const {
      consignmentNumber,
      invoiceNumber,
      receiverCompanyName,
      receiverConcernPerson,
      destinationCity,
      bookingDate,
      senderCompanyName,
      senderConcernPerson,
      recipientConcernPerson,
      recipientPinCode,
      recipientMobileNumber,
      invoiceValue,
      packageImages,
      invoiceImages
    } = shipmentData;

    // Calculate estimated delivery date (booking date + 5 days)
    const estimatedDeliveryDate = new Date(bookingDate);
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
    const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const senderName = senderCompanyName || senderConcernPerson;
    const receiverDisplay = receiverCompanyName || receiverConcernPerson;
    
    return `
SHIPMENT CONFIRMED - AWB: ${consignmentNumber}

Dear ${senderName},

Your shipment has been successfully booked with OCL Courier & Logistics.

SHIPMENT DETAILS:
- AWB Number: ${consignmentNumber}
- Invoice Number: ${invoiceNumber}
- Receiver: ${recipientConcernPerson} - ${receiverDisplay} - ${destinationCity}
- Pin Code: ${recipientPinCode}
- Mobile: ${recipientMobileNumber}
- Estimated Delivery: ${formattedDeliveryDate}
- Status: BOOKED

PACKAGE DETAILS:
- Invoice Value: ₹${invoiceValue?.toLocaleString() || '0'}
${packageImages && packageImages.length > 0 ? `- Package Images: ${packageImages.length} image(s) with secure access links` : ''}
${invoiceImages && invoiceImages.length > 0 ? `- Invoice Images: ${invoiceImages.length} image(s) with secure access links` : ''}

TRACK YOUR SHIPMENT:
Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/track?awb=${consignmentNumber}

Thank you for choosing OCL Courier & Logistics!

Best regards,
OCL Courier & Logistics Team

This is an automated message. Please do not reply to this email.
For support, contact us at support@oclcourier.com
    `;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  // Helper method to get social media icon attachments (DISABLED)
  getSocialMediaIconAttachments() {
    // Social media attachments have been disabled
    return [];
  }

  async sendEmailWithPdfAttachment({ to, subject, html, text, pdfBuffer, filename = 'manifest.pdf' }) {
    try {
      const mailOptions = {
        from: `"OCL Courier & Logistics" <${process.env.GOOGLE_EMAIL || process.env.SMTP_USER || 'noreply@oclcourier.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email with PDF:', error);
      throw error;
    }
  }
}

export default new EmailService();
