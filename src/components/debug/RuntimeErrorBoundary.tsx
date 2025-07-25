import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, Code } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Runtime Error Boundary specifically designed to catch toLowerCase and similar runtime errors
 * Provides detailed debugging information and graceful fallback UI
 */
export class RuntimeErrorBoundary extends Component<Props, State> {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `runtime_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RuntimeErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount
    });

    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to global error handler
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('runtime-error', {
        detail: {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId
        }
      }));
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`RuntimeErrorBoundary: Retrying (${this.retryCount}/${this.maxRetries})`);
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    } else {
      console.error('RuntimeErrorBoundary: Max retries exceeded');
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const isStringError = error?.message?.includes('toLowerCase') || 
                           error?.message?.includes('undefined is not an object');

      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    خطأ في النظام
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    حدث خطأ غير متوقع في التطبيق
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription className="font-mono text-sm">
                  {error?.message || 'خطأ غير معروف'}
                </AlertDescription>
              </Alert>

              {isStringError && (
                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <strong>تشخيص المشكلة:</strong> يبدو أن هناك مشكلة في معالجة النصوص. 
                    هذا عادة ما يحدث عندما تكون قيمة غير متوقعة (null أو undefined) تحاول استخدام دالة toLowerCase.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Badge variant="outline" className="justify-center p-2">
                  <span className="text-xs">
                    معرف الخطأ: {errorId.slice(-8)}
                  </span>
                </Badge>
                <Badge variant="outline" className="justify-center p-2">
                  <span className="text-xs">
                    المحاولات: {this.retryCount}/{this.maxRetries}
                  </span>
                </Badge>
              </div>

              <div className="flex gap-3">
                {this.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    إعادة المحاولة
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة تحميل الصفحة
                </Button>
              </div>

              {/* Debug information (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    معلومات تقنية للمطورين
                  </summary>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                      <strong>Error Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {error?.stack}
                      </pre>
                    </div>
                    {errorInfo && (
                      <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RuntimeErrorBoundary;