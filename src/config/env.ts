export const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || 'https://swapzy.onrender.com',
  isProd: import.meta.env.VITE_ENV === 'production',
  isDev: import.meta.env.VITE_ENV !== 'production',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID as string,
};
