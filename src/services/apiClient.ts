import { config } from '../config/env';
import { store, setTokens, logout } from '../store';
import { getToast } from '../components/Toast';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function getToken(): string | null {
  return store.getState().auth.token;
}

function getRefreshToken(): string | null {
  return store.getState().auth.refreshToken;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    if (newToken) {
      store.dispatch(setTokens({ token: newToken, refreshToken: data.refreshToken }));
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

function forceLogout() {
  store.dispatch(logout());
  window.location.href = '/login';
}

function makeHeaders(token: string | null, overrides?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...overrides,
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...options,
    headers: makeHeaders(getToken(), options.headers),
  });

  if (res.status === 401) {
    if (isRefreshing) {
      // Queue this request — resolved once the in-flight refresh completes
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push((newToken) => {
          fetch(`${config.apiBaseUrl}${endpoint}`, {
            ...options,
            headers: makeHeaders(newToken, options.headers),
          })
            .then((r) => {
              if (!r.ok) reject(new Error('Request failed after token refresh'));
              else r.json().then(resolve).catch(reject);
            })
            .catch(reject);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (newToken) {
      // Drain the queue — each queued request gets the new token directly
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      const retry = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        ...options,
        headers: makeHeaders(newToken, options.headers),
      });
      if (!retry.ok) {
        if (retry.status === 401) forceLogout();
        const err = await retry.json().catch(() => ({ message: retry.statusText }));
        throw new Error(err.message || 'Request failed');
      }
      return retry.json();
    }

    refreshQueue = [];
    forceLogout();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = err.message || 'API request failed';
    getToast().showToast(msg, 'error');
    throw new Error(msg);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
};
