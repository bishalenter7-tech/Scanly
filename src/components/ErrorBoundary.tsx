import React, { Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const state = this.state as ErrorBoundaryState;
    const props = this.props as ErrorBoundaryProps;
    if (state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0fdf4] text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-[#064e3b] mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">The application encountered an unexpected error.</p>
          <Button onClick={() => window.location.href = '/'} className="bg-[#16a34a] hover:bg-[#15803d]">
            Return to Home
          </Button>
        </div>
      );
    }
    return props.children;
  }
}

export default ErrorBoundary;