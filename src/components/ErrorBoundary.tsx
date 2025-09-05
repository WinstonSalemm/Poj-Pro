'use client';

import React from 'react';

// Define a type for the window object to include Sentry for type safety
interface WindowWithSentry extends Window {
  Sentry?: {
    captureException: (error: Error, context: { contexts: { errorInfo: React.ErrorInfo } }) => void;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send to Sentry or other error tracking service
    const customWindow = window as WindowWithSentry;
    if (typeof customWindow !== 'undefined' && customWindow.Sentry) {
      customWindow.Sentry.captureException(error, {
        contexts: { errorInfo },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Что-то пошло не так
        </h2>
        <p className="text-gray-600 mb-6">
          Произошла ошибка при загрузке этого раздела. Попробуйте обновить страницу.
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2"
        >
          Попробовать снова
        </button>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Детали ошибки (dev)
            </summary>
            <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
