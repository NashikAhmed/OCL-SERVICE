# Corporate Pricing Calculator

## Overview
The Corporate Pricing Calculator is a feature integrated into the corporate dashboard that allows corporate users to input pincodes and check shipping prices based on their assigned corporate pricing conditions. This implementation uses the proven logic from the admin dashboard's corporate pricing section.

## Features

### 1. Price Calculator Section
- **Location**: Corporate Dashboard → Pricing section
- **Functionality**: 
  - Input origin and destination pincodes
  - Enter package weight
  - Select service type (DOX, Non-DOX, Priority)
  - Choose delivery type (Normal, Priority)
  - Select transport mode (for Non-DOX and reverse pricing)
  - Get real-time price calculation with detailed breakdown

### 2. Pricing Rates Section
- **Location**: Corporate Dashboard → Pricing section (below calculator)
- **Functionality**: View detailed pricing tables for all service types

## Service Types Supported

### 1. DOX (Documents)
- **Weight Slabs**: 0-250gm, 251-500gm, Additional 500gm increments
- **Pricing**: Fixed rates per weight slab
- **Locations**: Assam, North East (Surface), North East (Air), Rest of India

### 2. Non-DOX (Parcels)
- **Pricing**: Per kg rates
- **Transport Modes**: By Road (Surface), By Air
- **Locations**: Assam, North East (Surface), North East (Air), Rest of India

### 3. Priority Service
- **Weight Slabs**: 0-500gm, Additional 500gm increments
- **Pricing**: Premium rates for faster delivery
- **Locations**: Assam, North East (Surface), North East (Air), Rest of India

### 4. Reverse Pricing
- **Available for**: Non-DOX service only
- **Destinations**: Assam and North East only
- **Transport Modes**: By Road, By Train, By Flight
- **Minimum Weights**: Road (500kg), Train (100kg), Flight (25kg)

## Location Classification

### Assam Pincodes
- **Range**: 780000 - 788999
- **Examples**: 781001 (Guwahati), 784001 (Dibrugarh)

### North East Pincodes
- **Range**: 790000 - 799999
- **Examples**: 790001 (Itanagar), 799001 (Agartala)

### Rest of India
- **All other pincodes**

## API Endpoints

### GET /api/corporate/pricing
- **Purpose**: Retrieve corporate pricing plan
- **Authentication**: Required (Corporate token)
- **Response**: Pricing data for the corporate client

### POST /api/corporate/calculate-price
- **Purpose**: Calculate shipping price
- **Authentication**: Required (Corporate token)
- **Request Body**:
  ```json
  {
    "fromPincode": "110001",
    "toPincode": "781001",
    "weight": "1.5",
    "serviceType": "non-dox",
    "deliveryType": "normal",
    "transportMode": "byRoad"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "calculation": {
      "basePrice": 150.00,
      "gst": 27.00,
      "finalPrice": 177.00,
      "serviceType": "non-dox",
      "location": "assam",
      "transportMode": "byRoad",
      "chargeableWeight": 1.5,
      "isMinimumWeightApplied": false,
      "breakdown": {
        "weightSlab": "1.5kg",
        "pricePerUnit": 100.00,
        "units": 1.5,
        "subtotal": 150.00
      }
    }
  }
  ```

## Usage Instructions

### For Corporate Users:

1. **Access the Calculator**:
   - Login to Corporate Dashboard
   - Navigate to "Pricing" section
   - The calculator is displayed at the top of the page

2. **Enter Shipment Details**:
   - **From Pincode**: Enter origin pincode (6 digits) - Optional for reverse pricing
   - **To Pincode**: Enter destination pincode (6 digits)
   - **Weight**: Enter weight (grams for DOX, kg for Non-DOX)
   - **Service Type**: Select DOX, Non-DOX, or Priority
   - **Delivery Type**: Choose Normal or Priority
   - **Transport Mode**: Select for Non-DOX and reverse pricing

3. **Calculate Price**:
   - Click "Calculate Price" button
   - View detailed price breakdown with location classification
   - See service details and final price

### Features:
- **Real-time Pincode Validation**: Automatically checks if pincodes are serviceable
- **Dynamic Pricing**: Prices update based on location classification
- **Weight Slab Calculation**: Automatic weight slab determination
- **GST Calculation**: 18% GST automatically added
- **Minimum Weight Application**: For reverse pricing, minimum weights are applied
- **Detailed Breakdown**: Shows weight slab, price per unit, and subtotal

## Technical Implementation

### Frontend Components:
- `CorporatePricingCalculator.tsx`: Main calculator component
- `CorporatePricingDisplay.tsx`: Updated with tabs for calculator and rates
- Uses shadcn/ui components for consistent UI

### Backend Implementation:
- New API endpoint: `POST /api/corporate/calculate-price`
- Location classification logic
- Weight slab calculation
- GST calculation (18%)
- Minimum weight application for reverse pricing

### Database Integration:
- Uses existing `CorporatePricing` model
- Validates corporate client has approved pricing plan
- Applies corporate-specific rates

## Error Handling

### Common Errors:
1. **Missing Pricing Plan**: "No pricing plan has been assigned to your corporate account yet"
2. **Invalid Pincodes**: "Pincode not serviceable"
3. **Missing Fields**: "Please fill in all required fields"
4. **Invalid Service Type**: "Reverse pricing is only available for Assam and North East destinations"

### Validation:
- Pincode format validation (6 digits)
- Weight validation (positive numbers)
- Service type validation
- Transport mode validation for applicable services

## Future Enhancements

1. **Bulk Price Calculation**: Calculate prices for multiple shipments
2. **Price History**: Track price calculations over time
3. **Export Functionality**: Export price calculations to Excel/PDF
4. **Advanced Filters**: Filter by service type, location, etc.
5. **Price Comparison**: Compare prices across different service types
6. **Scheduled Calculations**: Save and schedule price calculations

## Support

For technical support or questions about the pricing calculator:
- Contact your system administrator
- Check the corporate pricing plan assignment
- Verify pincode serviceability
- Review service type and transport mode selections
