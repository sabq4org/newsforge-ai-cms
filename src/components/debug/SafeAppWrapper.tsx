import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AlertTriangle, RefreshCw } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface SafeAppWrapperProps {
  children: React.ReactNode;
}

interface AppError {
  error: Error;
  timestamp: Date;
  retryCount: number;
}

const SafeAppWrapper: React.FC<SafeAppWrapperProps> = ({ children }) => {
  const [appError, setAppError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a specific runtime error we can handle
      const errorMessage = String(event.reason);
      if (errorMessage.includes('toLowerCase') || 
          errorMessage.includes('undefined is not an object') ||
          errorMessage.includes("Can't find variable")) {
        
        // Prevent the error from breaking the app
        event.preventDefault();
        
        setAppError({
          error: new Error(`Runtime Error: ${errorMessage}`),
          timestamp: new Date(),
          retryCount: 0
        });
      }
    };

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error);
      
      const errorMessage = event.message || String(event.error);
      if (errorMessage.includes('toLowerCase') || 
          errorMessage.includes('undefined is not an object') ||
          errorMessage.includes("Can't find variable")) {
        
        setAppError({
          error: event.error || new Error(errorMessage),
          timestamp: new Date(),
          retryCount: 0
        });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = () => {
    if (appError && appError.retryCount < 3) {
      setAppError({
        ...appError,
        retryCount: appError.retryCount + 1
      });
      
      // Clear error after a short delay to allow component to reinitialize
      setTimeout(() => {
        setAppError(null);
      }, 100);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل سبق الذكية...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (appError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card border rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          
          <h1 className="text-xl font-semibold mb-2">
            خطأ في النظام
          </h1>
          
          <p className="text-muted-foreground mb-4">
            حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو التواصل مع فريق التطوير إذا استمر الخطأ.
          </p>
          
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              تفاصيل الخطأ
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {appError.error.message}
              {appError.error.stack && (
                <>
                  {'\n\nStack Trace:'}
                  {appError.error.stack}
                </>
              )}
            </pre>
          </details>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleRetry} 
              disabled={appError.retryCount >= 3}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة المحاولة ({3 - appError.retryCount} متبقية)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReload}
            >
              تحديث الصفحة
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            وقت الخطأ: {appError.timestamp.toLocaleString('ar-SA')}
          </p>
        </div>
        
        <Toaster position="top-right" />
      </div>
    );
  }

  // Normal state - render children
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};

export default SafeAppWrapper;