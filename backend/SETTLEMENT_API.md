# Medicine Settlement API Documentation

## Overview
This API provides endpoints for managing medicine settlements, allowing users to view and manage payment information for medicine bookings on a monthly basis.

## Base URL
```
/api/medicine
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Get Settlements
Retrieve settlement data for a specific month and year.

**URL:** `GET /settlements`  
**Query Parameters:**
- `month` (optional): Month number (1-12). Defaults to current month.
- `year` (optional): Year (2020-2030). Defaults to current year.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "medicineBookingId": "ObjectId",
      "consignmentNumber": "number",
      "senderName": "string",
      "receiverName": "string",
      "paidBy": "sender|receiver",
      "cost": "number",
      "isPaid": "boolean",
      "settlementMonth": "number",
      "settlementYear": "number",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

### Generate Settlements
Generate settlement records for a specific month and year based on existing bookings.

**URL:** `POST /settlements/generate`  
**Request Body:**
```json
{
  "month": "number", // Required: Month number (1-12)
  "year": "number"   // Required: Year (2020-2030)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated X settlement records",
  "data": [
    {
      "_id": "string",
      "medicineBookingId": "ObjectId",
      "consignmentNumber": "number",
      "senderName": "string",
      "receiverName": "string",
      "paidBy": "sender|receiver",
      "cost": "number",
      "isPaid": "boolean",
      "settlementMonth": "number",
      "settlementYear": "number",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

## Error Responses
All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to process request",
  "message": "Detailed error description"
}
```

## Usage Notes
1. Settlement records are automatically generated when fetching data for a month/year if they don't already exist.
2. The cost is derived from the `charges.grandTotal` field of the associated medicine booking.
3. Payment status (`isPaid`) is determined by the `billing.partyType` field of the booking:
   - If `partyType` is "sender", the settlement is marked as paid.
   - If `partyType` is "receiver", the settlement is marked as not paid.