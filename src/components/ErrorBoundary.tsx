import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unhandled React Exception', { error: error.message, componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
            
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-slate-100 text-center mb-2">Critical System Error</h1>
            <p className="text-sm text-slate-400 text-center mb-6">
              The intelligence layer encountered an unexpected failure. Our telemetry has logged the incident for review.
            </p>
            
            <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800/50">
              <p className="text-xs text-red-400 font-mono break-words">
                {this.state.error?.message || 'Unknown render error'}
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-xl font-medium transition-colors border border-slate-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Reboot Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
