import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
        text: this.generateTextVersion(pricingData, approvalUrl, rejectionUrl)
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
        text: this.generateCorporateRegistrationTextVersion(corporateData)
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
        text: `Dear ${clientName || 'Valued Client'},\n\n${message}\n\nThank you for your business with OCL Courier & Logistics.`
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
        text: this.generateEmployeeRegistrationTextVersion(employeeData)
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
