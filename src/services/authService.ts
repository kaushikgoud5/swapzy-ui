import { apiClient } from './apiClient';
import { store, setAuth, logout } from '../store';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: { id: string; email: string; name: string };
}

export const authService = {
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  // Register returns full auth response — tokens issued immediately on signup
  async signup(payload: { email: string; password: string; name: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', {
      email: payload.email,
      password: payload.password,
      username: payload.name,
    });
  },

  async socialLogin(provider: 'google' | 'github', token: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`/auth/${provider}`, { token });
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  async logoutUser(): Promise<void> {
    const refreshToken = store.getState().auth.refreshToken;
    if (refreshToken) {
      await apiClient.post<unknown>('/auth/logout', { refreshToken }).catch(() => {});
    }
    store.dispatch(logout());
  },
};


export function commitAuth(res: AuthResponse) {
  store.dispatch(setAuth({
    token: res.accessToken,
    refreshToken: res.refreshToken,
    user: res.user,
  }));
}
