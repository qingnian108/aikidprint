import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public readonly props: Props;
  public state: State;
  public setState: <K extends keyof State>(
    state: ((prevState: Readonly<State>, props: Readonly<Props>) => (Pick<State, K> | State | null)) | (Pick<State, K> | State | null),
    callback?: () => void
  ) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border-4 border-black rounded-3xl shadow-brutal-lg p-8 md:p-12 animate-pop-in">
            <div className="flex flex-col items-center text-center">
              {/* Error Icon */}
              <div className="w-24 h-24 bg-red-100 border-4 border-black rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertTriangle size={48} className="text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4 uppercase tracking-tight">
                Oops! Something Went Wrong
              </h1>

              {/* Error Message */}
              <p className="text-lg text-slate-600 mb-6 font-medium">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl p-4 mb-6 text-left">
                  <p className="font-mono text-sm text-red-600 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-mono text-xs text-slate-600 hover:text-black">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-slate-600 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 bg-duck-blue text-black border-2 border-black rounded-xl px-6 py-3 font-bold shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase"
                >
                  <RefreshCw size={20} />
                  Go to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 bg-white text-black border-2 border-black rounded-xl px-6 py-3 font-bold shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase"
                >
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <p className="mt-8 text-sm text-slate-500 font-mono">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
