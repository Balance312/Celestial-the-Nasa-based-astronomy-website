import React from 'react';

/**
 * Error Boundary component to catch rendering errors
 * Prevents entire app from crashing on component errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1 className="error-boundary-title">⚠️ Oops! Something went wrong</h1>
            <p className="error-boundary-message">
              We encountered an unexpected error. Please try refreshing the page or going back to the home page.
            </p>
            <div className="error-boundary-buttons">
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </button>
              <button
                className="btn btn-outline-light"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details (Dev Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
