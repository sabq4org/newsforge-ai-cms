import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, RotateCcw, Bug } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                خطأ في النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو التواصل مع فريق التطوير إذا استمر الخطأ.
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">تفاصيل الخطأ:</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-mono text-destructive">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer hover:text-primary">
                          عرض المزيد من التفاصيل
                        </summary>
                        <pre className="text-xs mt-2 whitespace-pre-wrap break-words">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {this.state.errorInfo && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">معلومات المكون:</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  إعادة تحميل الصفحة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You could integrate with error reporting service here
    // e.g., Sentry, LogRocket, etc.
  };
}