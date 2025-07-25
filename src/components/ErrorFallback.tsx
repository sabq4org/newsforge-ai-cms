import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  componentName?: string;
  children?: React.ReactNode;
}

export function ErrorFallback({ error, componentName = 'Component', children }: ErrorFallbackProps) {
  return (
    <div className="border border-red-200 bg-red-50 p-4 rounded-md">
      <h3 className="text-red-800 font-semibold">خطأ في تحميل {componentName}</h3>
      <p className="text-red-600 text-sm mt-2">
        عذراً، حدث خطأ في تحميل هذا المكون. يرجى إعادة تحميل الصفحة.
      </p>
      {error && (
        <details className="mt-2">
          <summary className="text-xs text-red-500 cursor-pointer">تفاصيل الخطأ</summary>
          <pre className="text-xs text-red-400 mt-1 whitespace-pre-wrap">
            {error.message || 'Unknown error'}
          </pre>
        </details>
      )}
      {children && (
        <div className="mt-4 border-t border-red-200 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default ErrorFallback;