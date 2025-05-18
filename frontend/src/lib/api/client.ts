import { useAuthStore } from '../store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('API error:', {
      status: response.status,
      statusText: response.statusText,
      error,
    });
    throw new Error(error.message || `API error: ${response.status} ${response.statusText}`);
  }
  
  // Handle 204 No Content response
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...init } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers = new Headers(init.headers);
  
  // Add auth token if available
  const token = useAuthStore.getState().token;
  console.log('Current auth state:', {
    token: token ? 'present' : 'missing',
    isAuthenticated: useAuthStore.getState().isAuthenticated,
    user: useAuthStore.getState().user
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  console.log('Making API request:', {
    url,
    method: init.method || 'GET',
    headers: Object.fromEntries(headers.entries()),
    body: init.body ? JSON.parse(init.body as string) : undefined
  });

  const response = await fetch(url, {
    ...init,
    headers,
  });

  console.log('API response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  });

  return handleResponse<T>(response);
}

// API Methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}; 