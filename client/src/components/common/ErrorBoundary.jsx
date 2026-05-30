import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary">
          <h1>Something went wrong</h1>
          <p className="text-muted">An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn--primary"
          >
            Refresh Page
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
