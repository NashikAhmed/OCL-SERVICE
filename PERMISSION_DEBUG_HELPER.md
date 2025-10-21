# Permission Debug Helper

This document contains code snippets that can be added temporarily to help debug permission issues.

## 1. Add to OfficeDashboard.tsx for Debugging

Add this code snippet inside the OfficeDashboard component to see what permissions are being loaded:

```typescript
// Add this inside the OfficeDashboard component, just after the useState declarations
useEffect(() => {
  if (user) {
    console.log('=== USER PERMISSION DEBUG INFO ===');
    console.log('User object:', user);
    console.log('User permissions:', user.permissions);
    console.log('Admin info:', user.adminInfo);
    console.log('Admin permissions:', user.adminInfo?.permissions);
    console.log('Should show Address Forms:', user.permissions?.addressForms || user.adminInfo?.permissions?.addressForms);
    console.log('Should show Pincode Management:', user.permissions?.pincodeManagement || user.adminInfo?.permissions?.pincodeManagement);
    console.log('Should show Coloader Registration:', user.permissions?.coloaderRegistration || user.adminInfo?.permissions?.coloaderRegistration);
    console.log('Should show User Management:', user.adminInfo?.permissions?.userManagement);
    console.log('====================================');
  }
}, [user]);
```

## 2. Add to UserManagement Components for Debugging

Add this code snippet to both admin and office UserManagement components:

```typescript
// Add this inside the UserManagement component, just after the useState declarations
useEffect(() => {
  console.log('=== PERMISSION STATE DEBUG INFO ===');
  console.log('Permissions state:', permissions);
  console.log('Selected user:', selectedUser);
  if (selectedUser) {
    console.log('User permissions:', selectedUser.permissions);
  }
  console.log('====================================');
}, [permissions, selectedUser]);
```

## 3. Console Commands for Browser Debugging

Open the browser console and run these commands to inspect user data:

```javascript
// Check current user data
console.log(JSON.parse(localStorage.getItem('officeUser')));

// Check if permission fields exist
const user = JSON.parse(localStorage.getItem('officeUser'));
console.log('Coloader Registration Permission:', user?.permissions?.coloaderRegistration);
console.log('Admin Coloader Registration Permission:', user?.adminInfo?.permissions?.coloaderRegistration);

// Force refresh user data from API (if needed)
// This would require implementing a function to re-fetch user data
```

## 4. Network Request Debugging

To check what's being sent to and received from the API:

1. Open browser developer tools
2. Go to the Network tab
3. Perform a permission update action
4. Look for requests to:
   - `/api/admin/users/{userId}/permissions` (PUT request)
   - `/api/admin/users` (GET request for user list)

Check that:
- The PUT request includes the `coloaderRegistration` field in the body
- The GET response includes the `coloaderRegistration` field for all users

## 5. Quick Test Script

Add this temporary button to the OfficeDashboard for quick testing:

```tsx
{/* Add this temporarily for debugging */}
{process.env.NODE_ENV === 'development' && (
  <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg m-4">
    <h3 className="font-bold text-yellow-800">Permission Debug Info</h3>
    <p className="text-sm">Check console for detailed info</p>
    <button 
      onClick={() => {
        console.log('=== CURRENT USER PERMISSIONS ===');
        console.log('User:', user);
        console.log('User Permissions:', user?.permissions);
        console.log('Admin Info:', user?.adminInfo);
        console.log('Admin Permissions:', user?.adminInfo?.permissions);
      }}
      className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
    >
      Log Permission Info
    </button>
  </div>
)}
```

## 6. Common Issues Checklist

When troubleshooting, check these items:

1. **Field Existence**: Does the user object have the `coloaderRegistration` field?
2. **Field Value**: Is the field set to `true` for users who should have access?
3. **Conditional Logic**: Is the sidebar correctly checking both `user.permissions` and `user.adminInfo.permissions`?
4. **State Updates**: When permissions are updated, is the local state being updated correctly?
5. **Local Storage**: Is the updated user data being saved to localStorage?
6. **Page Refresh**: Do the permissions persist after a page refresh?

## 7. Verification Steps

After implementing fixes, verify:

1. Log in as an admin user
2. Grant Coloader Registration permission to a test user
3. Log out and log in as the test user
4. Verify the Coloader Registration feature appears in the sidebar
5. Revoke the permission as admin
6. Refresh the test user's session
7. Verify the feature disappears from the sidebar

## 8. Backend API Verification

If frontend fixes don't resolve the issue, check the backend:

1. Ensure the user model/schema includes `coloaderRegistration`
2. Verify API endpoints handle the new field correctly
3. Check that database records include the new field
4. Confirm API responses include the field when returning user data