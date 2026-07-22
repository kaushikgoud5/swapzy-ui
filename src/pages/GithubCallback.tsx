import { useEffect } from 'react';

export function GithubCallback() {
  useEffect(() => {
    // This page is loaded inside the OAuth popup.
    // The opener reads the ?code param via the interval in socialAuth.ts,
    // so we just show a brief message while it closes.
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
