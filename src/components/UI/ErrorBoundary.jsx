import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 text-slate-200 p-8">
          <div className="bg-red-950/40 border border-red-500 rounded-lg p-6 max-w-2xl w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span>⚠️</span> Application Error
            </h1>
            <p className="mb-4 text-slate-300">
              An unexpected error occurred in this module. The rest of the application should remain functional if you navigate away.
            </p>
            <div className="bg-black/50 p-4 rounded font-mono text-sm text-red-300 overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 font-bold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
