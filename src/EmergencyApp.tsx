import React from 'react';

// Absolute minimal emergency app for critical errors
function EmergencyApp() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Clear any problematic storage or cache
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage in emergency mode');
    }
    
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleResetApp = () => {
    // Clear URL parameters and reload
    window.location.href = window.location.pathname;
  };

  const handleTestMode = () => {
    window.location.search = '?test=true';
  };

  const handleSafeMode = () => {
    window.location.search = '?safe=true';
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>سبق الذكية</h1>
          <p>جاري تهيئة الوضع الآمن...</p>
        </div>
      </div>
    );
  }

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
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>
            تم تفعيل الوضع الآمن
          </h3>
          <p style={{ color: '#92400e', margin: 0 }}>
            تم اكتشاف خطأ تقني وتم تفعيل النظام الاحتياطي لضمان استمرارية الخدمة.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>الخيارات المتاحة:</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <button
              onClick={handleResetApp}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 إعادة تشغيل النظام
            </button>
            
            <button
              onClick={handleTestMode}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🧪 وضع الاختبار
            </button>
            
            <button
              onClick={handleSafeMode}
              style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🛡️ الوضع الآمن المحدود
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>معلومات تقنية:</h4>
          <p style={{ margin: 0 }}>
            النظام: الوضع الآمن الطارئ<br/>
            التوقيت: {new Date().toLocaleString('ar-SA')}<br/>
            الإصدار: Emergency v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmergencyApp;