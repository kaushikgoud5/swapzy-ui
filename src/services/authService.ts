import { config } from '../config/env';
import { apiClient } from './apiClient';
import { store, setAuth, logout } from '../store';

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: { id: string; email: string; name: string };
}

const mockUser = { id: 'dev-user', email: '', name: 'Dev User' };

function normalizeAuthResponse(res: unknown): AuthResponse {
  const raw = res as Record<string, unknown>;
  const data = (raw?.body
    ? (typeof raw.body === 'string' ? JSON.parse(raw.body as string) : raw.body)
    : raw) as Record<string, any>;

  const user = data?.user as Record<string, string> | undefined;
  return {
    token: data.token || data.accessToken || data.AccessToken || '',
    refreshToken: data.refreshToken || data.RefreshToken || '',
    user: {
      id: user?.id || user?.Id || data.userId || data.sub || '',
      email: user?.email || user?.Email || data.email || '',
      name: user?.name || user?.Name || data.name || '',
    },
  };
}

export const authService = {
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    if (config.isDev) {
      await new Promise((r) => setTimeout(r, 500));
      return { token: 'dev-token', refreshToken: 'dev-refresh', user: { ...mockUser, email: payload.email } };
    }
    const res = await apiClient.post<unknown>('/auth/login', payload);
    return normalizeAuthResponse(res);
  },

  async signup(payload: { email: string; password: string; name: string }): Promise<AuthResponse> {
    if (config.isDev) {
      await new Promise((r) => setTimeout(r, 500));
      return { token: 'dev-token', refreshToken: 'dev-refresh', user: { ...mockUser, email: payload.email, name: payload.name } };
    }
    const res = await apiClient.post<unknown>('/auth/register', {
      email: payload.email,
      password: payload.password,
      username: payload.name,
    });
    return normalizeAuthResponse(res);
  },

  async socialLogin(provider: 'google' | 'github', token: string): Promise<AuthResponse> {
    if (config.isDev) {
      await new Promise((r) => setTimeout(r, 500));
      return { token: 'dev-token', refreshToken: 'dev-refresh', user: { ...mockUser, name: `${provider} user` } };
    }
    const res = await apiClient.post<unknown>(`/auth/${provider}`, { token });
    return normalizeAuthResponse(res);
  },

  async logoutUser(): Promise<void> {
    const refreshToken = store.getState().auth.refreshToken;
    if (!config.isDev && refreshToken) {
      await apiClient.post<unknown>('/auth/logout', { refreshToken }).catch(() => {});
    }
    store.dispatch(logout());
  },
};

// Write a successful auth response into the store
export function commitAuth(res: AuthResponse) {
  store.dispatch(setAuth({
    token: res.token,
    refreshToken: res.refreshToken ?? null,
    user: res.user,
  }));
}
