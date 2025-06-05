

import { getAuthToken, setAuthToken, getRefreshToken, removeAuthToken } from './tokenService';

// Updated BASE_URL with your network IP
const BASE_URL = 'http://192.168.55.61:8000/api'; 

interface ApiErrorData {
  detail?: string;
  code?: string; // Often included by simplejwt for token errors
  [key: string]: any; 
}

class ApiError extends Error {
  data?: ApiErrorData;
  status?: number;

  constructor(message: string, data?: ApiErrorData, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
    this.status = status;
  }
}

let isRefreshing = false;
let failedQueue: Array<{resolve: (value?: any) => void, reject: (reason?: any) => void}> = [];

const processFailedQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // If we resolve, it means the original request should be retried.
      // The `request` function will handle adding the new token.
      prom.resolve(); 
    }
  });
  failedQueue = [];
};

async function handleRefreshToken(): Promise<boolean> {
  isRefreshing = true;
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    removeAuthToken(); // Ensure all tokens are cleared if refresh token is missing
    isRefreshing = false;
    processFailedQueue(new ApiError("Session expired. No refresh token available.", undefined, 401), null);
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: currentRefreshToken }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      removeAuthToken(); // Clear tokens if refresh failed
      throw new ApiError(
        responseData.detail || 'Session expired. Please log in again.', 
        responseData, 
        response.status
      );
    }

    if (responseData.access) {
      setAuthToken(responseData.access);
      // Note: We are NOT updating the refresh token here because the backend's
      // ROTATE_REFRESH_TOKENS is False, so it doesn't send a new one.
      processFailedQueue(null, responseData.access);
      return true;
    } else {
      removeAuthToken(); // Clear tokens if no access token in response
      throw new ApiError('Failed to refresh session: No new access token received.', responseData, response.status);
    }
  } catch (error) {
    removeAuthToken(); // Ensure tokens are cleared on any error during refresh
    processFailedQueue(error, null);
    return false;
  } finally {
    isRefreshing = false;
  }
}


async function request<T>(endpoint: string, options: RequestInit = {}, isFormData: boolean = false, isRetry: boolean = false): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const makeRequest = async (token: string | null) => {
    const headers: HeadersInit = { ...(options.headers || {}) };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData && options.body && (typeof options.body === 'string' || options.body instanceof FormData === false) ) { 
      if (!(options.body instanceof FormData)) { // Ensure Content-Type is not set for FormData
         headers['Content-Type'] = 'application/json';
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: ApiErrorData = { detail: response.statusText || 'Unknown server error' };
      try {
        errorData = await response.json();
      } catch (e) {
        // Keep default errorData if parsing fails
      }
      
      // Handle token expiration and refresh
      if (response.status === 401 && !isRetry && endpoint !== '/auth/token/refresh/') {
        if (isRefreshing) {
          // Queue the request if another refresh is already in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve: () => resolve(makeRequest(getAuthToken())), reject });
          });
        } else {
          const refreshSuccessful = await handleRefreshToken();
          if (refreshSuccessful) {
            return makeRequest(getAuthToken()); // Retry with new token
          } else {
             removeAuthToken(); // Ensure tokens are definitely cleared
             throw new ApiError(
                errorData.detail || 'Session expired. Please log in again.',
                errorData,
                401 // Keep 401 status
             );
          }
        }
      }
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`, 
        errorData,
        response.status
      );
    }
    
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as T; 
    }
    return await response.json() as T;
  };

  return makeRequest(getAuthToken());
}

export const apiService = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'POST', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  put: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'PUT', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  patch: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  delete: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};