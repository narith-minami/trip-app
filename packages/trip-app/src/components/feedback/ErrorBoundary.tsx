/**
 * src/components/feedback/ErrorBoundary.tsx
 *
 * React error boundary that renders a fallback instead of crashing the tree.
 */

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-red-600">Something went wrong</p>
            {this.state.message && (
              <p className="mt-1 text-sm text-ink-muted">{this.state.message}</p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
