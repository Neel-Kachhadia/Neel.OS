'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message ?? String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[NEEL.OS ErrorBoundary]', error.message, '\n', error.stack, '\n', info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100vh',
            background: '#0A0A0A',
            color: '#F5F0E8',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div>
            <div style={{ opacity: 0.45, marginBottom: '8px' }}>NEEL.OS</div>
            <div>runtime fault. reload required.</div>
            {this.state.errorMessage && (
              <div data-error-message style={{ opacity: 0.4, fontSize: '11px', marginTop: '8px', maxWidth: '600px' }}>
                {this.state.errorMessage}
              </div>
            )}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
