import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        style={{ background: 'var(--color-nearby-bg)' }}
      >
        <div>
          <p className="text-4xl mb-4">💥</p>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-nearby-text)' }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-nearby-dim)' }}>{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl px-6 py-2.5 font-display text-sm font-semibold text-white"
            style={{ background: 'var(--color-nearby-coral)' }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
