import React from 'react';

interface ThemeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ThemeErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ThemeErrorBoundary extends React.Component<
  ThemeErrorBoundaryProps,
  ThemeErrorBoundaryState
> {
  constructor(props: ThemeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ThemeErrorBoundaryState {
    // Check if this is a theme-related error
    const isThemeError = error.message.includes('colors') || 
                        error.message.includes('accent') ||
                        error.message.includes('undefined is not an object');
    
    if (isThemeError) {
      console.warn('Theme error caught by boundary:', error.message);
      return { hasError: true, error };
    }
    
    // Re-throw if not a theme error
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Theme error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or just render children with default theme
      return this.props.fallback || (
        <div className="min-h-screen bg-white text-black">
          {this.props.children}
        </div>
      );
    }

    return this.props.children;
  }
}