# Permission System Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Features Not Showing Despite Having Permissions

**Symptoms:**
- User has been granted a permission (e.g., Coloader Registration)
- User logs in but doesn't see the feature in the sidebar
- Permission badge shows correctly in user management

**Possible Causes and Solutions:**

1. **Missing Permission Field in User Data**
   - **Cause**: Existing users don't have the new `coloaderRegistration` field in their data
   - **Solution**: The code now includes a fix to ensure the field exists:
     ```javascript
     if (userData.permissions && userData.permissions.coloaderRegistration === undefined) {
       userData.permissions.coloaderRegistration = false;
     }
     ```

2. **Incorrect Permission Check Logic**
   - **Cause**: The conditional rendering might not be checking the right fields
   - **Solution**: Verify the sidebar logic:
     ```jsx
     {(user?.permissions?.coloaderRegistration || user?.adminInfo?.permissions?.coloaderRegistration) && (
       // Render menu item
     )}
     ```

3. **Cached User Data**
   - **Cause**: Old user data is cached in localStorage without the new permission
   - **Solution**: Clear browser cache or have the user log out and log back in

### Issue 2: Permission Not Saving Correctly

**Symptoms:**
- Admin grants a permission
- Success message appears
- But the permission doesn't persist

**Possible Causes and Solutions:**

1. **API Not Handling New Field**
   - **Cause**: Backend API might not be accepting or returning the new permission field
   - **Solution**: Verify that the backend API supports the new field

2. **Frontend Not Sending New Field**
   - **Cause**: The frontend might not be including the new field in the API request
   - **Solution**: Check the `handleUpdatePermissions` function:
     ```javascript
     body: JSON.stringify({ permissions }),
     ```

### Issue 3: Admin Users Not Seeing Admin Features

**Symptoms:**
- User has admin privileges
- But doesn't see admin-only features like User Management

**Possible Causes and Solutions:**

1. **Incorrect Admin Check**
   - **Cause**: The admin check logic might be wrong
   - **Solution**: Verify the admin check:
     ```jsx
     {(user?.adminInfo?.permissions?.userManagement) && (
       // Render User Management menu item
     )}
     ```

## Debugging Steps

### Step 1: Check User Data in Browser Console
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Type and execute:
   ```javascript
   JSON.parse(localStorage.getItem('officeUser'))
   ```
4. Check if the permissions object includes `coloaderRegistration`

### Step 2: Verify API Response
1. Open browser developer tools
2. Go to the Network tab
3. Perform an action that loads user data
4. Find the API request (e.g., `/api/admin/users`)
5. Check the response to see if it includes the new permission field

### Step 3: Check Conditional Rendering
1. Add console.log statements in the OfficeDashboard component:
   ```javascript
   console.log('User permissions:', user?.permissions);
   console.log('Admin permissions:', user?.adminInfo?.permissions);
   console.log('Should show coloader:', user?.permissions?.coloaderRegistration || user?.adminInfo?.permissions?.coloaderRegistration);
   ```

## Testing Checklist

### For Admin Users:
- [ ] Can see all features in sidebar
- [ ] Can grant/revoke Coloader Registration permission
- [ ] Permission badge appears correctly in user list
- [ ] Changes persist after page refresh

### For Regular Office Users:
- [ ] Can see Settings and Reports by default
- [ ] Can see additional features when granted permission
- [ ] Cannot see User Management
- [ ] Features appear/disappear correctly when permissions change

### For Users with Coloader Registration Permission:
- [ ] Can see Coloader Registration in sidebar
- [ ] Can access Coloader Registration feature
- [ ] Feature disappears when permission is revoked

## Code Verification Points

### 1. User Interface Definitions
- [ ] `OfficeUser` interface includes `coloaderRegistration`
- [ ] `adminInfo.permissions` includes `coloaderRegistration`

### 2. Default Permissions
- [ ] Default permissions state includes `coloaderRegistration: false`

### 3. Permission Handling
- [ ] `handleEditPermissions` function handles missing permission fields
- [ ] `getPermissionBadges` function includes new permission

### 4. UI Rendering
- [ ] Sidebar conditionally renders Coloader Registration menu item
- [ ] User Management only visible to admins
- [ ] Default features always visible

## Backend Considerations

If the issue persists, check the backend API:

1. Ensure the user model includes the new permission field
2. Verify that API endpoints properly handle and return the new field
3. Check that database schema has been updated if necessary

## Additional Notes

1. **Backward Compatibility**: The fixes include handling for users who don't have the new permission field yet
2. **Data Migration**: Existing users will have the new permission set to `false` by default
3. **Browser Cache**: Users may need to refresh or clear cache to see changes