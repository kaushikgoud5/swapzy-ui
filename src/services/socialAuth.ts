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
        google.accounts.id.renderButton(
          document.createElement('div'),
          { type: 'standard' },
        );
        reject(new Error('Google sign-in was dismissed'));
      }
    });
  });
}
