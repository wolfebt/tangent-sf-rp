/**
 * @file WidgetErrorBoundary.tsx
 * @description React Error Boundary protecting Glass Cockpit dockable widgets.
 * Prevents any component failure from propagating to The Stage WebGPU canvas or the main UI.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  widgetId: string;
  widgetTitle?: string;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] Crash in widget [${this.props.widgetId}]:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[160px] p-4 bg-slate-950/95 border border-red-500/50 rounded-xl flex flex-col justify-between font-mono text-xs text-red-200 shadow-2xl backdrop-blur-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
              <AlertTriangle size={15} />
              <span>Widget Subsystem Fault: {this.props.widgetTitle || this.props.widgetId}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              An unexpected render exception occurred inside this dockable widget. The WebGPU Stage canvas and active session remain operational.
            </p>
            {this.state.error && (
              <div className="p-2 bg-red-950/40 border border-red-900/50 rounded text-[10px] font-mono text-red-300 max-h-20 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-red-900/40">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/60 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reinitialize Subsystem</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
