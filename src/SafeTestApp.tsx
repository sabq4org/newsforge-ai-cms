import React from 'react';

// Safe minimal application with basic UI
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoToFull = () => {
    window.location.search = '';
  };

  const handleGoToTest = () => {
    window.location.search = '?test=true';
  };

  const handleGoToEmergency = () => {
    window.location.search = '?emergency=true';
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleString('ar-SA');
    } catch {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }
  };

  return (
    <div style={{
      fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
      direction: 'rtl',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#2563eb', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🛡️ الوضع الآمن - سبق الذكية
        </h1>
        
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#047857', margin: '0 0 0.5rem 0' }}>
            النظام يعمل بشكل آمن
          </h3>
          <p style={{ color: '#047857', margin: 0 }}>
            تم تحميل واجهة مبسطة بدون مكونات معقدة لضمان الاستقرار.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>معلومات النظام:</h3>
          
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '1rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>الوقت الحالي:</strong> {formatTime(currentTime)}
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>حالة النظام:</strong> الوضع الآمن نشط
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>المتصفح:</strong> {navigator.userAgent.split(' ')[0]}
            </p>
            <p style={{ margin: 0 }}>
              <strong>اللغة:</strong> {navigator.language}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>الخيارات المتاحة:</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <button
              onClick={handleGoToFull}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              🚀 تجربة التطبيق الكامل
            </button>
            
            <button
              onClick={handleGoToTest}
              style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
              }}
            >
              🧪 تشغيل اختبارات النظام
            </button>
            
            <button
              onClick={handleGoToEmergency}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
            >
              🚨 الوضع الطارئ
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            سبق الذكية - نظام إدارة المحتوى الذكي<br/>
            الوضع الآمن النشط | الإصدار 1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default SafeTestApp;