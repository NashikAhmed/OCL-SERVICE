# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

OCL Services is a full-stack courier and logistics application with a React TypeScript frontend and Node.js/Express backend. The system handles booking management, pincode services, corporate registration, and image uploads for package tracking.

## Development Commands

### Frontend (React + TypeScript + Vite)
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Backend (Node.js + Express + MongoDB)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon (runs on port 5000)
npm run dev

# Start production server
npm start

# Clean dependencies
npm run clean
```

### Running the Full Application
1. **Backend first**: Start the backend server (`cd backend && npm run dev`)
2. **Frontend second**: Start the frontend dev server (`cd Frontend && npm run dev`)
3. **Access**: Frontend at http://localhost:8080, Backend API at http://localhost:5000

## Architecture Overview

### High-Level Structure
- **Monorepo**: Frontend and backend in separate directories
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + MongoDB Atlas + Mongoose
- **Communication**: Vite proxy routes `/api/*` requests to backend

### Backend Architecture

#### Core Models (MongoDB/Mongoose)
- **FormData**: Multi-step booking forms with sender/receiver data, shipment details, and upload information
- **PinCodeArea**: Indian postal code database with serviceability info
- **CorporateData**: Corporate client registration and management
- **Admin**: Admin user management with authentication
- **OfficeUser**: Office staff user management

#### API Structure
- **Form Management**: `/api/form/*` - CRUD operations for booking forms
- **Pincode Services**: `/api/pincode/*` - Fast pincode lookup with caching
- **Corporate API**: `/api/corporate/*` - Corporate registration and management
- **Admin Routes**: `/api/admin/*` - Admin authentication and management
- **Office Routes**: `/api/office/*` - Office user management
- **Upload System**: `/api/upload/*` - File upload handling with local storage
- **Statistics**: `/api/stats/*` - Analytics endpoints for forms, pincodes, corporate data

#### Key Features
- **Multi-step Forms**: Progressive form completion tracking (sender → receiver → full booking)
- **Pincode Validation**: Fast lookup with in-memory caching for Indian postal codes
- **Image Upload System**: Local file storage for package and invoice images
- **Role-based Access**: Admin, office staff, and public user roles
- **Data Export**: CSV/JSON export capabilities

### Frontend Architecture

#### Component Structure
- **Pages**: Route-level components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **UI Components**: shadcn/ui components in `src/components/ui/`
- **Admin Components**: Admin-specific components in `src/components/admin/`
- **Office Components**: Office-specific components in `src/components/office/`

#### Key Components
- **BookingPanel**: Multi-step booking flow with stepper UI
- **AddressForm**: Pincode-based address validation
- **ImageUploadWithPreview**: File upload with preview functionality
- **GlobalStickyTabs**: Site-wide navigation with sticky behavior
- **TrackingSection**: Package tracking with demo functionality

#### State Management
- **React Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Local State**: Component-level state with React hooks

#### Routing Structure
- **Public Routes**: Landing pages, tracking, serviceability
- **Auth Routes**: Login, signup, password reset
- **Protected Routes**: User dashboard, shipment management
- **Office Routes**: Office staff portal with authentication
- **Admin Routes**: Admin panel with role-based access

### Data Flow Patterns

#### Booking Flow
1. **Step 1**: Origin address data collection with pincode validation
2. **Step 2**: Destination address data collection
3. **Step 3**: Shipment details (weight, dimensions, service type)
4. **Step 4**: Image uploads (package photos, invoice documents)
5. **Step 5**: Payment information and confirmation

#### Pincode System
- **Fast Lookup**: Cached pincode data with fallback to MongoDB
- **Hierarchical Data**: State → City → District → Area structure
- **Serviceability**: Only serviceable areas are returned

#### Authentication Flow
- **JWT-based**: Tokens for admin and office user sessions
- **Role-based**: Different access levels and protected routes
- **Middleware**: Server-side authentication validation

## Development Guidelines

### Database Operations
- Always use the existing MongoDB models for consistency
- Leverage the pincode caching system for address validation
- Use the form progression tracking for multi-step processes

### Frontend Development
- Follow the existing shadcn/ui component patterns
- Use the floating input components for form consistency
- Implement proper loading states for API calls
- Use React Query for server state management

### API Integration
- The frontend uses Vite's proxy configuration for API calls
- All API endpoints are prefixed with `/api/`
- Error handling follows the established patterns with proper status codes

### File Structure Conventions
- Backend routes in `backend/routes/`
- Database models in `backend/models/`
- Middleware in `backend/middleware/`
- Frontend pages in `Frontend/src/pages/`
- Reusable components in `Frontend/src/components/`

### Environment Setup
- Backend requires `.env` file with `MONGO_URI` for database connection
- Frontend uses Vite environment variables with `VITE_` prefix
- Upload directory `backend/uploads/screenshots/` must exist with proper permissions

### Key Business Logic
- **Form Completion Tracking**: Forms can be saved partially and completed later
- **Corporate Registration**: Automatic ID generation and GST number validation
- **Image Upload**: Local storage with organized folder structure
- **Pincode Validation**: Real-time validation during address entry
- **Multi-role System**: Admin, office staff, and public user access levels