import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/90 text-center select-none">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-4 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {this.props.fallbackTitle || 'Display Error Encountered'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {this.state.error?.message || 'An unexpected rendering error occurred while loading this view.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recover View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
