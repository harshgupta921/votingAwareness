'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl border border-red-100 dark:border-red-900/30 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>

            {process.env.NODE_SET !== 'production' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Error Details</summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl text-[10px] text-red-500 overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.error.stack}
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

export default ErrorBoundary;
