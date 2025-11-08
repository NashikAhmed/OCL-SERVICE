# Google OAuth Setup Instructions

## Fix for "Access blocked: Authorization Error - origin_mismatch"

To resolve this error, you need to configure the authorized origins in your Google Cloud Console.

### Steps:

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Select the project associated with your OAuth credentials

2. **Navigate to OAuth Settings**
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 client ID: `778314946823-h9g0lnr53ag58gh2s3d6pm06f64f0ha1.apps.googleusercontent.com`
   - Click on the client ID to edit it

3. **Add Authorized JavaScript Origins**
   Add these URLs to the "Authorized JavaScript origins" section:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   http://localhost:3000
   http://127.0.0.1:3000
   ```

4. **Add Authorized Redirect URIs (if needed)**
   Add these URLs to the "Authorized redirect URIs" section:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   http://localhost:8080/office
   http://127.0.0.1:8080/office
   ```

5. **Save Changes**
   - Click "Save" at the bottom of the page
   - Wait a few minutes for changes to propagate

6. **Test Again**
   - Restart your frontend application
   - Try the Google login again

### Notes:
- Your frontend is configured to run on port 8080
- Both `localhost` and `127.0.0.1` variations are added for compatibility
- Changes may take a few minutes to take effect

### Current OAuth Configuration:
- **Client ID**: `778314946823-h9g0lnr53ag58gh2s3d6pm06f64f0ha1.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Frontend URL**: `http://localhost:8080/office`
- **Backend API**: `http://localhost:5000/api/office/google-auth`

### Troubleshooting:
If you still get errors after configuration:
1. Clear browser cache and cookies
2. Try using an incognito/private window
3. Ensure both frontend and backend servers are running
4. Check that environment variables are loaded correctly