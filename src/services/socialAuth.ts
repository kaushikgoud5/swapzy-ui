import { config } from '../config/env';

export function initGoogleLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      reject(new Error('Google SDK not loaded'));
      return;
    }
    google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: (response: { credential: string }) => {
        resolve(response.credential);
      },
    });
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: use button-based popup
        google.accounts.id.renderButton(
          document.createElement('div'),
          { type: 'standard' },
        );
        reject(new Error('Google sign-in was dismissed'));
      }
    });
  });
}

export function initGithubLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    const popup = window.open(url, 'github-oauth', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error('GitHub sign-in was cancelled'));
          return;
        }
        if (popup.location.origin === window.location.origin) {
          const params = new URLSearchParams(popup.location.search);
          const code = params.get('code');
          popup.close();
          clearInterval(interval);
          if (code) resolve(code);
          else reject(new Error('No code returned from GitHub'));
        }
      } catch {
        // Cross-origin — popup still on github.com, keep waiting
      }
    }, 500);
  });
}
