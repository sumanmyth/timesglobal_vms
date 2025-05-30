
import { getAuthToken } from './tokenService';

const BASE_URL = 'http://localhost:8000/api'; // Your Django backend API URL

interface ApiErrorData {
  detail?: string;
  [key: string]: any; // For other specific error fields from Django REST framework
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

async function request<T>(endpoint: string, options: RequestInit = {}, isFormData: boolean = false): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = options.headers || {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData && options.body && typeof options.body === 'string') { // only set if not FormData and body is string
    headers['Content-Type'] = 'application/json';
  }


  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: ApiErrorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use statusText
        errorData = { detail: response.statusText || 'Unknown server error' };
      }
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`, 
        errorData,
        response.status
      );
    }
    
    // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as T; // Or null, or an empty object, depending on expected T
    }

    return await response.json() as T;

  } catch (error) {
    if (error instanceof ApiError) {
        console.error('API Error:', error.message, 'Status:', error.status, 'Data:', error.data);
    } else {
        console.error('Network or other error:', error);
    }
    throw error; // Re-throw to be caught by the calling component
  }
}

export const apiService = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'POST', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  put: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'PUT', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  patch: <T>(endpoint: string, body: any, isFormData: boolean = false, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body: isFormData ? body : JSON.stringify(body) }, isFormData),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
