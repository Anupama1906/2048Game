import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                        <AlertTriangle size={64} className="text-orange-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            The game encountered an unexpected error. Don't worry, your progress is saved!
                        </p>
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
                        >
                            <RefreshCw size={20} />
                            Restart Game
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;