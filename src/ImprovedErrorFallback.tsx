import React from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '2rem',
          border: '1px solid #ef4444',
          borderRadius: '0.5rem',
          backgroundColor: '#fef2f2',
          marginBottom: '1rem'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#dc2626'
          }}>
            خطأ في النظام
          </h1>
          
          <p style={{ marginBottom: '1rem', color: '#991b1b' }}>
            حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو التواصل مع فريق التطوير إذا استمر الخطأ.
          </p>
          
          <details style={{ 
            textAlign: 'left',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              عرض المزيد من التفاصيل
            </summary>
            <pre style={{ 
              fontSize: '0.75rem',
              color: '#374151',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error.message}
              {error.stack && '\n\nمعلومات المكون:\n\n' + error.stack}
            </pre>
          </details>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={resetErrorBoundary}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #3b82f6',
              borderRadius: '0.375rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            إعادة المحاولة
          </button>
          
          <button 
            onClick={() => {
              localStorage.setItem('app-mode', 'simple');
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #10b981',
              borderRadius: '0.375rem',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            الوضع المبسط
          </button>
          
          <button 
            onClick={() => {
              localStorage.setItem('app-mode', 'basic');
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #6b7280',
              borderRadius: '0.375rem',
              backgroundColor: '#6b7280',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            الوضع الأساسي
          </button>
          
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #f59e0b',
              borderRadius: '0.375rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            إعادة تعيين كامل
          </button>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          <p style={{ margin: 0 }}>
            <strong>إرشادات استكشاف الأخطاء:</strong><br/>
            1. جرب الوضع المبسط للحصول على واجهة أساسية مستقرة<br/>
            2. استخدم الوضع الأساسي للاختبار الأولي<br/>
            3. إعادة التعيين الكامل يمحو جميع البيانات المحلية<br/>
            4. إذا استمر الخطأ، تواصل مع فريق التطوير
          </p>
        </div>
      </div>
    </div>
  );
};