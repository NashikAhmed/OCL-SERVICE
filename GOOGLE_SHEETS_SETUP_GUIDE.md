# Google Sheets Sync Setup Guide

This guide will help you set up Google Sheets integration for syncing medicine settlement data.

## Prerequisites
- A Google account
- Access to Google Cloud Console
- The spreadsheet ID already configured: `1_B3R2ecQAVVp8uFt1eEarU7G58O8btEz2yu3dS9Zek0`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "OCL Medicine Settlement Sync")
5. Click "CREATE"

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to "APIs & Services" > "Library" (from the left sidebar)
3. Search for "Google Sheets API"
4. Click on "Google Sheets API"
5. Click "ENABLE"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" at the top
3. Select "Service account"
4. Fill in the service account details:
   - **Service account name**: `ocl-sheets-sync` (or any name you prefer)
   - **Service account ID**: Will be auto-generated
   - **Description**: "Service account for syncing settlement data to Google Sheets"
5. Click "CREATE AND CONTINUE"
6. For "Grant this service account access to project":
   - Skip this step (click "CONTINUE")
7. For "Grant users access to this service account":
   - Skip this step (click "DONE")

## Step 4: Create and Download Service Account Key

1. In the "Credentials" page, find your newly created service account under "Service Accounts"
2. Click on the service account email (it will look like: `ocl-sheets-sync@your-project-id.iam.gserviceaccount.com`)
3. Go to the "KEYS" tab
4. Click "ADD KEY" > "Create new key"
5. Select "JSON" as the key type
6. Click "CREATE"
7. A JSON file will be downloaded to your computer automatically
8. **IMPORTANT**: Copy the service account email address - you'll need it in the next step

## Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1_B3R2ecQAVVp8uFt1eEarU7G58O8btEz2yu3dS9Zek0/edit
2. Click the "Share" button in the top-right corner
3. In the "Add people and groups" field, paste the service account email (from Step 4)
   - Example: `ocl-sheets-sync@your-project-id.iam.gserviceaccount.com`
4. Set permission to "Editor"
5. **UNCHECK** "Notify people" (service accounts don't need notifications)
6. Click "Share"

## Step 6: Configure Backend

1. Rename the downloaded JSON key file to `google-credentials.json`
2. Move the file to the `backend` directory of your project:
   ```
   OCL-SERVICE-main/backend/google-credentials.json
   ```
3. The `.env` file already has the spreadsheet ID configured:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=1_B3R2ecQAVVp8uFt1eEarU7G58O8btEz2yu3dS9Zek0
   ```

## Step 7: Security Considerations

⚠️ **IMPORTANT**: The `google-credentials.json` file contains sensitive credentials.

1. Add `google-credentials.json` to `.gitignore`:
   ```
   # Google Service Account Credentials
   google-credentials.json
   ```

2. **NEVER** commit this file to version control
3. Store it securely and back it up in a secure location
4. If compromised, immediately delete the key from Google Cloud Console and create a new one

## Step 8: Test the Integration

1. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Log in to the medicine panel
3. Go to "View Settlement"
4. Select a month/year with settlement data
5. Click the "Sync to Sheets" button
6. Check your Google Sheet - a new tab should be created with the month/year name (e.g., "November 2024")

## How It Works

### Data Sync Process:
1. Medicine user clicks "Sync to Sheets" button
2. Backend fetches settlement data for selected month/year
3. Creates or uses existing sheet tab named with month/year
4. Appends data to the sheet with:
   - Title header
   - Summary section (Total Transactions, Grand Total, OCL Charge, Remaining Balance)
   - Data table (Date, Consignment #, Sender, Receiver, Payment By, Amount)
   - Formatted headers and styling

### Sheet Structure:
```
Settlement Statement - [Month] [Year]

Summary
Total Transactions    [count]
Grand Total          ₹[amount]
OCL Charge           ₹[amount]
Remaining Balance    ₹[amount]

Date          Consignment #  Sender  Receiver  Payment By  Amount (₹)
[date]        [number]       [name]  [name]    [type]      [amount]
...
                                                Grand Total: [total]
```

## Troubleshooting

### Error: "Google credentials file not found"
- Ensure `google-credentials.json` is in the `backend` directory
- Check file name is exactly `google-credentials.json`

### Error: "GOOGLE_SHEETS_SPREADSHEET_ID not configured"
- Check `.env` file has the spreadsheet ID
- Restart backend server after modifying `.env`

### Error: "The caller does not have permission"
- Ensure the service account email is shared with the Google Sheet
- Check the service account has "Editor" permission

### No data appears in sheet
- Verify settlement data exists for the selected month/year
- Check browser console and server logs for errors
- Ensure Google Sheets API is enabled in Google Cloud Console

## API Endpoint

**POST** `/api/medicine/settlements/sync-to-sheets`

**Headers:**
- `Authorization`: Bearer [medicineToken]
- `Content-Type`: application/json

**Body:**
```json
{
  "month": 11,
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settlement data synced to Google Sheets: November 2024",
  "data": {
    "sheetName": "November 2024",
    "rowsAdded": 25,
    "totalTransactions": 15,
    "grandTotal": 50000,
    "oclCharge": 5000,
    "remainingBalance": 45000
  }
}
```

## Support

If you encounter any issues:
1. Check the server console logs
2. Verify all credentials are correct
3. Ensure Google Sheets API is enabled
4. Confirm service account has sheet access
