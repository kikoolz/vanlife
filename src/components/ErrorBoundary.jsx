import { Component } from "react";
import { Link } from "react-router-dom";
import { Monitoring } from "../utils/monitoring";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    Monitoring.logError(error, {
      componentStack: errorInfo.componentStack,
      location: window.location.href,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
            
            <div className="error-boundary-actions">
              <Link to="/" className="link-button">
                Go to Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="link-button secondary"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
