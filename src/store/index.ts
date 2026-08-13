import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { PayloadAction } from '@reduxjs/toolkit';


type User = { id: string; email: string; name: string };

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
};

const savedAuth = (): AuthState => {
  try {
    return JSON.parse(localStorage.getItem('auth') ?? 'null') ?? { token: null, refreshToken: null, user: null };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: savedAuth(),
  reducers: {
    setAuth: (_, a: PayloadAction<AuthState>) => a.payload,
    setTokens: (s, a: PayloadAction<{ token: string; refreshToken?: string }>) => {
      s.token = a.payload.token;
      if (a.payload.refreshToken) s.refreshToken = a.payload.refreshToken;
    },
    logout: () => ({ token: null, refreshToken: null, user: null }),
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

// Persist auth to localStorage — no redux-persist needed
store.subscribe(() => {
  localStorage.setItem('auth', JSON.stringify(store.getState().auth));
});

// ── Exports ───────────────────────────────────────────────────────────────────

export const { setAuth, setTokens, logout } = authSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
