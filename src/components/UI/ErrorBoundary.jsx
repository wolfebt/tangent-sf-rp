import React from 'react';
import { TelemetryService } from '../../services/telemetryService';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      diagnosticSummary: ''
    };
  }

  static getDerivedStateFromError(error) {
    const isChunkError = Boolean(
      error?.name === 'TypeError' &&
      (error?.message?.includes('Failed to fetch dynamically imported module') ||
       error?.message?.includes('Expected a JavaScript-or-Wasm module script') ||
       error?.message?.includes('error loading dynamically imported module'))
    );
    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo);

    const isChunkError = Boolean(
      error?.name === 'TypeError' &&
      (error?.message?.includes('Failed to fetch dynamically imported module') ||
       error?.message?.includes('Expected a JavaScript-or-Wasm module script') ||
       error?.message?.includes('error loading dynamically imported module'))
    );

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'tangent_eb_chunk_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem(reloadKey, now.toString());
        console.warn('[ErrorBoundary] Detected stale deployment chunk error. Auto-reloading application to synchronize latest bundle...');
        window.location.reload();
        return;
      }
    }

    const report = TelemetryService.reportReactCrash(error, errorInfo?.componentStack);
    const diagnosticSummary = TelemetryService.exportDiagnosticSummary(report);
    this.setState({ error, errorInfo, diagnosticSummary, isChunkError });
  }

  handleCopyDiagnostics = () => {
    if (this.state.diagnosticSummary) {
      navigator.clipboard.writeText(this.state.diagnosticSummary).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2500);
      });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div 
            role="alert" 
            aria-live="assertive"
            className="flex flex-col items-center justify-center min-h-[60vh] h-full w-full bg-[#0a0d14] text-slate-200 p-4 sm:p-8"
          >
            <div className="bg-cyan-950/30 border border-cyan-500/80 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  🚀
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-mono font-bold uppercase tracking-wider text-cyan-400">
                    New Version Deployed
                  </h1>
                  <p className="text-xs font-mono text-slate-400">
                    A newer release of Tangent SF RP was published while this session was active.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Your browser session held references to previous code modules that have been upgraded on the server. Reloading will sync your runtime with the latest canonical suite components and data.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('tangent_eb_chunk_reload');
                      sessionStorage.removeItem('tangent_chunk_retry_timestamp');
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 rounded-lg font-mono text-xs uppercase font-bold text-black transition-colors shadow-lg cursor-pointer"
                  >
                    Refresh Application Now
                  </button>
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/'; }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs uppercase font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    Return to Hub
                  </button>
                </div>

                <button
                  type="button"
                  onClick={this.handleCopyDiagnostics}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-mono text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  {this.state.copied ? '✓ Copied Diagnostics' : 'Copy Diagnostics'}
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-[60vh] h-full w-full bg-[#0a0d14] text-slate-200 p-4 sm:p-8"
        >
          <div className="bg-red-950/30 border border-red-500/80 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                ⚠️
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-mono font-bold uppercase tracking-wider text-red-400">
                  Application Fault Detected
                </h1>
                <p className="text-xs font-mono text-slate-400">
                  Telemetry Sentinel captured crash telemetry and diagnostic breadcrumbs.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              An unexpected operational fault interrupted this module. Other components may remain unaffected. You can copy the diagnostic profile to report this incident or reload the runtime.
            </p>

            <div className="bg-black/60 border border-red-900/50 p-4 rounded-xl font-mono text-xs text-red-300 overflow-auto max-h-48 whitespace-pre-wrap select-all">
              {this.state.error && this.state.error.toString()}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/60 rounded-lg font-mono text-xs uppercase font-bold text-red-200 transition-colors shadow-lg cursor-pointer"
                >
                  Reload Application
                </button>
                <button
                  type="button"
                  onClick={() => { window.location.href = '/'; }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs uppercase font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Return to Hub
                </button>
              </div>

              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-mono text-xs text-slate-300 transition-colors cursor-pointer"
              >
                {this.state.copied ? '✓ Copied Diagnostics' : 'Copy Crash Diagnostics'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
