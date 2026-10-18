/**
 * Centralized API utility for making HTTP requests
 * Handles authentication headers and API URL configuration
 */

// Simple: Just use the env variable
// Make sure .env and .env.production are configured correctly
const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/$/, "");

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (e.g., "/api/transaction/all")
 * @param options - Fetch options
 * @returns Response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET request
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}

/**
 * Get the base API URL
 */
export function getApiUrl(): string {
  return API_URL;
}
