import React from 'react';

// Emergency diagnostic app with zero dependencies
const EmergencyApp: React.FC = () => {
  const [errorInfo, setErrorInfo] = React.useState<string[]>([]);

  React.useEffect(() => {
    const diagnostics: string[] = [];
    
    // Test basic JavaScript functionality
    try {
      const testArray = [1, 2, 3];
      testArray.forEach(x => x + 1);
      diagnostics.push('✅ Array.forEach working');
    } catch (e) {
      diagnostics.push('❌ Array.forEach failed: ' + String(e));
    }

    // Test string methods
    try {
      const testString = "test";
      testString.toLowerCase();
      diagnostics.push('✅ String.toLowerCase working');
    } catch (e) {
      diagnostics.push('❌ String.toLowerCase failed: ' + String(e));
    }

    // Test Date functionality
    try {
      const testDate = new Date();
      testDate.toLocaleDateString();
      diagnostics.push('✅ Date.toLocaleDateString working');
    } catch (e) {
      diagnostics.push('❌ Date.toLocaleDateString failed: ' + String(e));
    }

    // Test object methods
    try {
      const testObj = { a: 1, b: 2 };
      Object.entries(testObj).forEach(([k, v]) => console.log(k, v));
      diagnostics.push('✅ Object.entries working');
    } catch (e) {
      diagnostics.push('❌ Object.entries failed: ' + String(e));
    }

    setErrorInfo(diagnostics);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '2rem',
          color: '#1e293b',
          textAlign: 'center'
        }}>
          🚨 تشخيص طوارئ - سبق الذكية
        </h1>
        
        <div style={{
          padding: '1.5rem',
          border: '2px solid #e2e8f0',
          borderRadius: '0.75rem',
          backgroundColor: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: '#334155'
          }}>
            فحص النظام الأساسي
          </h2>
          
          <div style={{ 
            backgroundColor: '#f1f5f9',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {errorInfo.map((info, index) => (
              <div key={index} style={{ 
                marginBottom: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: info.includes('❌') ? '#dc2626' : '#059669'
              }}>
                {info}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          border: '2px solid #3b82f6',
          borderRadius: '0.75rem',
          backgroundColor: '#eff6ff',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            marginBottom: '1rem',
            color: '#1e40af'
          }}>
            خيارات الاستكشاف
          </h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button 
              onClick={() => {
                window.location.search = '?minimal=true';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              الوضع الأساسي
            </button>
            
            <button 
              onClick={() => {
                window.location.search = '?safe=true';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              الوضع الآمن
            </button>
            
            <button 
              onClick={() => {
                window.location.search = '?test=true';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              وضع الاختبار
            </button>
            
            <button 
              onClick={() => {
                window.location.search = '';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              التطبيق الكامل
            </button>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.75rem',
          textAlign: 'center'
        }}>
          <h4 style={{ 
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
            color: '#92400e'
          }}>
            📋 معلومات المطور
          </h4>
          <p style={{ 
            margin: 0, 
            color: '#92400e',
            lineHeight: '1.6'
          }}>
            هذا التطبيق يعمل في وضع الطوارئ لتشخيص الأخطاء. 
            إذا كانت الفحوصات أعلاه تعمل بنجاح، فالمشكلة قد تكون في إحدى المكتبات أو المكونات.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyApp;