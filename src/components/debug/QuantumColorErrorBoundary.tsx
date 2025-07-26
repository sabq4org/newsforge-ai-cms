import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * QuantumColorErrorBoundary - Catches and handles quantum color adaptation errors
 */
export class QuantumColorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Quantum color error boundary caught error:', error);
    
    // If this is a quantum-related error, ensure safe globals
    if (error?.message?.includes('context') || 
        error?.message?.includes('ambientLight') ||
        error?.message?.includes('q.context') ||
        error?.message?.includes('reasoning') ||
        error?.message?.includes('colors.accent')) {
      
      try {
        // Emergency quantum object initialization
        if (typeof window !== 'undefined') {
          (window as any).q = {
            context: {
              ambientLight: 0.5,
              timeOfDay: 'morning',
              userActivity: 'browsing',
              eyeStrain: 'low',
              sessionLength: 0
            },
            reasoning: ['Emergency quantum adaptation'],
            colors: {
              accent: '#007acc',
              primary: '#0066cc',
              secondary: '#6c757d'
            }
          };
          console.log('Emergency quantum object initialized in error boundary');
        }
      } catch (initError) {
        console.error('Emergency quantum initialization failed:', initError);
      }
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Quantum color error boundary details:', { error, errorInfo });
    
    // Additional error handling for quantum-specific issues
    if (error?.message?.includes('ambientLight') || error?.message?.includes('q.context')) {
      // Try to reinitialize quantum system
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            (window as any).q = (window as any).q || {};
            (window as any).q.context = (window as any).q.context || {};
            (window as any).q.context.ambientLight = 0.5;
            (window as any).q.reasoning = ['Recovered quantum adaptation'];
            (window as any).q.colors = {
              accent: '#007acc',
              primary: '#0066cc',
              secondary: '#6c757d'
            };
            
            // Try to recover by resetting state
            this.setState({ hasError: false, error: undefined });
          }
        } catch (recoveryError) {
          console.error('Quantum error recovery failed:', recoveryError);
        }
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or continue with original children
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // For quantum errors, try to continue rendering children after a brief delay
      if (this.state.error?.message?.includes('ambientLight') || 
          this.state.error?.message?.includes('q.context')) {
        
        // Auto-recover for quantum errors
        setTimeout(() => {
          this.setState({ hasError: false, error: undefined });
        }, 100);
        
        // Return children immediately since quantum errors shouldn't stop rendering
        return this.props.children;
      }
      
      // For other errors, show minimal error message
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">تم اكتشاف خطأ مؤقت في النظام. جاري المحاولة مرة أخرى...</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with quantum error boundary
 */
export function withQuantumErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function QuantumBoundaryWrapper(props: P) {
    return (
      <QuantumColorErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </QuantumColorErrorBoundary>
    );
  };
}

export default QuantumColorErrorBoundary;