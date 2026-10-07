/**
 * Centralized API Client abstraction for RETAINLY.
 * Dispatches real HTTP requests to the NestJS REST API Gateway.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const DEFAULT_DEV_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1MGU4MTgwYS0yNWYwLTQ0OTQtYTVmOC0zOGI2YWYyN2I4M2YiLCJvcmdfcm9sZSI6Im9yZzpvd25lciIsInN1YiI6InVzZXItb3duZXItMSIsImlzcyI6Imh0dHBzOi8veW91ci10ZW5hbnQuY2xlcmsuYWNjb3VudHMuZGV2IiwiYXVkIjoicmV0YWlubHkiLCJpYXQiOjE3OTExMjI5ODYsImV4cCI6MTgyMjY1ODk4Nn0.prxfcNBcEXQCkgWuSuBYzGzuj5dcBUaJpAF73ZoRkSQ';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return DEFAULT_DEV_TOKEN;
  const stored = localStorage.getItem('retainly_token');
  if (!stored) {
    localStorage.setItem('retainly_token', DEFAULT_DEV_TOKEN);
    return DEFAULT_DEV_TOKEN;
  }
  try {
    const parts = stored.split('.');
    if (parts.length === 3) {
      const jsonStr = typeof atob !== 'undefined' ? atob(parts[1]) : Buffer.from(parts[1], 'base64').toString('utf-8');
      const payload = JSON.parse(jsonStr);
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.setItem('retainly_token', DEFAULT_DEV_TOKEN);
        return DEFAULT_DEV_TOKEN;
      }
    }
  } catch {
    localStorage.setItem('retainly_token', DEFAULT_DEV_TOKEN);
    return DEFAULT_DEV_TOKEN;
  }
  return stored;
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('retainly_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('retainly_token');
}

export interface AuthUserPayload {
  sub: string;
  org_id: string;
  org_role: string;
  email?: string;
}

export function getAuthUser(): AuthUserPayload | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const jsonStr = typeof atob !== 'undefined' ? atob(parts[1]) : Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...customOptions } = options;
  const token = getAuthToken();

  let url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
    const queryStr = searchParams.toString();
    if (queryStr) {
      url += (url.includes('?') ? '&' : '?') + queryStr;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...customOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.message) {
        errorMessage = Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
