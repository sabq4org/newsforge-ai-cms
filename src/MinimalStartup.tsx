import React from 'react';

/**
 * MinimalStartup - Ultra-minimal React app for debugging
 */
const MinimalStartup: React.FC = () => {
  const [testsPassed, setTestsPassed] = React.useState<Record<string, boolean>>({});
  
  React.useEffect(() => {
    // Run basic compatibility tests
    const tests: Record<string, () => boolean> = {
      'React': () => typeof React !== 'undefined',
      'useState': () => typeof React.useState === 'function',
      'useEffect': () => typeof React.useEffect === 'function',
      'Array.forEach': () => typeof Array.prototype.forEach === 'function',
      'String.toLowerCase': () => typeof String.prototype.toLowerCase === 'function',
      'JSON': () => typeof JSON !== 'undefined',
      'localStorage': () => typeof localStorage !== 'undefined',
      'fetch': () => typeof fetch !== 'undefined'
    };
    
    const results: Record<string, boolean> = {};
    
    Object.entries(tests).forEach(([testName, testFn]) => {
      try {
        results[testName] = testFn();
      } catch (error) {
        console.error(`Test ${testName} failed:`, error);
        results[testName] = false;
      }
    });
    
    setTestsPassed(results);
  }, []);
  
  const allTestsPassed = Object.values(testsPassed).every(Boolean);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '24px',
          color: '#333',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          🚀 تشخيص النظام - سبق الذكية
        </h1>
        
        <div style={{
          backgroundColor: allTestsPassed ? '#d4edda' : '#f8d7da',
          border: `1px solid ${allTestsPassed ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '18px',
            color: allTestsPassed ? '#155724' : '#721c24',
            margin: '0'
          }}>
            {allTestsPassed ? '✅ جميع الاختبارات نجحت' : '❌ يوجد مشاكل في النظام'}
          </h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {Object.entries(testsPassed).map(([testName, passed]) => (
            <div
              key={testName}
              style={{
                padding: '12px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: passed ? '#f8fff9' : '#fff5f5',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '20px',
                marginBottom: '5px'
              }}>
                {passed ? '✅' : '❌'}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                {testName}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.search = ''}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🚀 تشغيل التطبيق الكامل
          </button>
          
          <button
            onClick={() => window.location.search = '?test=true'}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🧪 الوضع التجريبي
          </button>
          
          <button
            onClick={() => window.location.search = '?safe=true'}
            style={{
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🛡️ الوضع الآمن
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🗑️ مسح البيانات وإعادة التشغيل
          </button>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          <strong>معلومات النظام:</strong>
          <br />
          المتصفح: {navigator.userAgent}
          <br />
          الوقت: {new Date().toLocaleString('ar-SA')}
          <br />
          الرابط: {window.location.href}
        </div>
      </div>
    </div>
  );
};

export default MinimalStartup;