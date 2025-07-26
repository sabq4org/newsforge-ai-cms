import React from 'react';

// Minimal startup component - no dependencies, pure React
  const [status, setStatus] = React.useState('initializing');
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    const performChecks = async () => {
      const errorList: string[] = [];
      
      // Basic environment checks
      try {
        if (typeof window === 'undefined') {
          errorList.push('Window object not available');
        }
        
        if (typeof document === 'undefined') {
          errorList.push('Document object not available');
        }
        
        // Test basic array functionality
        try {
          const testArray = [1, 2, 3];
          testArray.forEach(() => {});
        } catch (e) {
          errorList.push('Array.forEach not working');
        }
        
        // Test basic string functionality
        try {
          'test'.toLowerCase();
        } catch (e) {
          errorList.push('String.toLowerCase not working');
        }
        
        // Test basic date functionality
        try {
          const date = new Date();
          date.toLocaleDateString();
        } catch (e) {
          errorList.push('Date methods not working');
        }
        
        setErrors(errorList);
        setStatus(errorList.length > 0 ? 'errors_detected' : 'ready');
      } catch (error) {
        setErrors(['Critical initialization error']);
        setStatus('critical_error');
      }
    };

    performChecks();
  }, []);

  const handleTryFull = () => {
    window.location.search = '';
  };

  const handleTryTest = () => {
    window.location.search = '?test=true';
  };

  const handleTrySafe = () => {
    window.location.search = '?safe=true';
  };

  const handleTryEmergency = () => {
    window.location.search = '?emergency=true';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'initializing': return '#6b7280';
      case 'ready': return '#10b981';
      case 'errors_detected': return '#f59e0b';
      case 'critical_error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'initializing': return 'جاري التهيئة...';
      case 'ready': return 'النظام جاهز';
      case 'errors_detected': return 'تم اكتشاف مشاكل';
      case 'critical_error': return 'خطأ حرج';
      default: return 'حالة غير معروفة';
    }
  };

  return (
    <div style={{
      fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
      direction: 'rtl',
      backgroundColor: '#111827',
      color: '#f9fafb',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#1f2937',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #374151',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#3b82f6',
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }}>
          سبق الذكية
        </h1>

        <div style={{
          backgroundColor: '#374151',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          border: `2px solid ${getStatusColor()}`
        }}>
          <div style={{
            color: getStatusColor(),
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {getStatusText()}
          </div>
          
          {status === 'initializing' && (
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              يتم فحص النظام...
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div style={{
            backgroundColor: '#451a03',
            border: '1px solid #ea580c',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'right'
          }}>
            <h4 style={{ color: '#fed7aa', margin: '0 0 0.5rem 0' }}>
              المشاكل المكتشفة:
            </h4>
            <ul style={{ 
              color: '#fed7aa', 
              margin: 0, 
              paddingRight: '1rem',
              fontSize: '0.875rem'
            }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={handleTryFull}
            disabled={status === 'initializing'}
            style={{
              backgroundColor: status === 'ready' ? '#10b981' : '#6b7280',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: status === 'ready' ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: status === 'ready' ? 1 : 0.6
            }}
          >
            {status === 'ready' ? '🚀 ' : '⏳ '}
            التطبيق الكامل
          </button>

          <button
            onClick={handleTryTest}
            disabled={status === 'initializing'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: status !== 'initializing' ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: status !== 'initializing' ? 1 : 0.6
            }}
          >
            🧪 وضع الاختبار
          </button>

          <button
            onClick={handleTrySafe}
            disabled={status === 'initializing'}
            style={{
              backgroundColor: '#6366f1',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: status !== 'initializing' ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: status !== 'initializing' ? 1 : 0.6
            }}
          >
            🛡️ الوضع الآمن
          </button>

          <button
            onClick={handleTryEmergency}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            🚨 الوضع الطارئ
          </button>
        </div>

        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          borderTop: '1px solid #374151',
          paddingTop: '1rem'
        }}>
          نظام بدء التشغيل المبسط<br/>
          {new Date().toLocaleString('ar-SA')}
        </div>
      </div>
    </div>
  );
}

export default MinimalStartup;