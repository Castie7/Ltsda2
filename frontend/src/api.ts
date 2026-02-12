/**
 * API Helper — wraps fetch() to automatically attach the auth token.
 * Usage:
 *   import { api } from '@/api';
 *   const data = await api('/api/members');
 *   const data = await api('/api/members/create', { method: 'POST', body: formData });
 */

const API_BASE = 'http://localhost:8080';

export function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
    localStorage.removeItem('auth_token');
}

/**
 * Authenticated fetch wrapper.
 * - Automatically prepends API_BASE if path starts with '/'
 * - Automatically adds Authorization header
 * - On 401 response, clears auth and redirects to login
 */
export async function api(path: string, options: RequestInit = {}): Promise<Response> {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const headers = new Headers(options.headers || {});

    const token = getAuthToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // If 401, redirect to login
    if (response.status === 401) {
        clearAuthToken();
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    return response;
}
