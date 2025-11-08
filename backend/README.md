# OCL Service Backend

This is the backend service for the OCL (OUR Courier & Logistics) system, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Medicine booking management
- Corporate shipping services
- Courier management
- Admin and office panel functionality
- Document generation (invoices, PDFs)
- File upload and management with AWS S3 integration
- Email services
- Settlement management for medicine bookings

## New: Medicine Settlement Feature

The medicine settlement feature allows medicine users to view and manage payment information for their bookings on a monthly basis.

### Key Components

1. **MedicineSettlement Model** - Database model for storing settlement information
2. **Medicine Settlement Routes** - API endpoints for managing settlements
3. **Frontend Integration** - Settlement component in the medicine panel sidebar

### API Documentation

See [SETTLEMENT_API.md](SETTLEMENT_API.md) for detailed API documentation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   AWS_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Testing

Run the medicine settlement test:
```bash
npm run test-medicine-settlement
```

## Directory Structure

- `models/` - MongoDB models
- `routes/` - API route handlers
- `middleware/` - Custom middleware functions
- `services/` - Business logic and external service integrations
- `scripts/` - Utility scripts for data migration and maintenance
- `uploads/` - Local file storage (for development)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- AWS S3 for file storage
- JSON Web Tokens for authentication
- Nodemailer for email services