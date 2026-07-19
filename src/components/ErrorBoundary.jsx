import React from 'react';

/**
 * ErrorBoundary - A React Class component that catches JavaScript errors
 * anywhere in its child component tree and renders a fallback UI.
 * Prevents the entire application from crashing due to unhandled runtime exceptions.
 * 
 * @component
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FIFA 2026 Nexus] Runtime Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#c6ff00',
            fontFamily: 'monospace',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            ⚠️ FIFA 2026 NEXUS — SYSTEM ERROR
          </h1>
          <p style={{ color: '#999', maxWidth: '500px', lineHeight: 1.6 }}>
            An unexpected error occurred in the application. This has been logged for review.
          </p>
          <pre style={{ 
            marginTop: '1rem', 
            padding: '0.75rem 1rem', 
            background: '#111', 
            border: '2px solid #333', 
            borderRadius: '6px',
            color: '#ff6b6b',
            fontSize: '0.75rem',
            maxWidth: '600px',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={this.handleReset}
            aria-label="Reload Application"
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 1.5rem',
              background: '#c6ff00',
              color: '#000',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'monospace',
              textTransform: 'uppercase'
            }}
          >
            ↻ Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
