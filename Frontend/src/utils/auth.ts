// Authentication utility functions for persistent login

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  permissions: {
    dashboard: boolean;
    userManagement: boolean;
    pincodeManagement: boolean;
    addressForms: boolean;
    coloaderRegistration: boolean;
    corporatePricing: boolean;
    corporateRegistration: boolean;
    corporateManagement: boolean;
    consignmentManagement: boolean;
    reports: boolean;
    settings: boolean;
  };
}

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'adminToken',
  ADMIN_INFO: 'adminInfo',
  LOGIN_TIME: 'adminLoginTime'
} as const;

export const TOKEN_EXPIRY_HOURS = 24;

/**
 * Check if admin is currently logged in and token is valid
 */
export const isAdminLoggedIn = (): boolean => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  const adminInfo = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_INFO);
  const loginTime = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIME);

  if (!token || !adminInfo || !loginTime) {
    return false;
  }

  // Check if token is expired
  const loginDate = new Date(loginTime);
  const now = new Date();
  const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLogin < TOKEN_EXPIRY_HOURS;
};

/**
 * Get stored admin info
 */
export const getStoredAdminInfo = (): AdminInfo | null => {
  try {
    const adminInfo = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_INFO);
    return adminInfo ? JSON.parse(adminInfo) : null;
  } catch (error) {
    console.error('Error parsing stored admin info:', error);
    return null;
  }
};

/**
 * Get stored token
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

/**
 * Store authentication data
 */
export const storeAuthData = (token: string, adminInfo: AdminInfo): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_INFO, JSON.stringify(adminInfo));
  localStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_INFO);
  localStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_TIME);
};

/**
 * Check if token is expired based on login time
 */
export const isTokenExpired = (): boolean => {
  const loginTime = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIME);
  
  if (!loginTime) {
    return true;
  }

  const loginDate = new Date(loginTime);
  const now = new Date();
  const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLogin >= TOKEN_EXPIRY_HOURS;
};

/**
 * Get time remaining until token expires (in hours)
 */
export const getTimeUntilExpiry = (): number => {
  const loginTime = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIME);
  
  if (!loginTime) {
    return 0;
  }

  const loginDate = new Date(loginTime);
  const now = new Date();
  const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  
  return Math.max(0, TOKEN_EXPIRY_HOURS - hoursSinceLogin);
};
