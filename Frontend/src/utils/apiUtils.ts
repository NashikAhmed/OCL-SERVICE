// Utility functions for making admin components permission-aware

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  employees?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getApiEndpoint = (basePath: string): string => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? `/api${basePath}` : `/api/office${basePath}`;
};

export const getAuthToken = (): string | null => {
  const adminToken = localStorage.getItem('adminToken');
  const officeToken = localStorage.getItem('officeToken');
  return adminToken || officeToken;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const handleApiError = (response: Response, errorMessage: string = 'Request failed') => {
  if (response.status === 403) {
    return {
      title: "Access Denied",
      description: "You don't have permission to access this resource",
      variant: "destructive" as const,
    };
  } else if (response.status === 401) {
    return {
      title: "Authentication Error",
      description: "Please login again",
      variant: "destructive" as const,
    };
  } else {
    return {
      title: "Error",
      description: errorMessage,
      variant: "destructive" as const,
    };
  }
};

export const makePermissionAwareRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const fullEndpoint = getApiEndpoint(endpoint);
  
  const response = await fetch(fullEndpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};
