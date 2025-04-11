import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ApiCallOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
};

async function createApiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  try {
    const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

const api = {
  get: <T>(endpoint: string, options: ApiCallOptions = {}) => createApiCall<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, options: ApiCallOptions = {}) => createApiCall<T>(endpoint, { ...options, method: 'POST' }),
  put: <T>(endpoint: string, options: ApiCallOptions = {}) => createApiCall<T>(endpoint, { ...options, method: 'PUT' }),
  delete: <T>(endpoint: string, options: ApiCallOptions = {}) => createApiCall<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default api;