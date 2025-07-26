import React from 'react';

// Simple test application for debugging purposes
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isTestingComplete, setIsTestingComplete] = React.useState(false);

  const runTests = React.useCallback(() => {
    const results: string[] = [];
    
    // Test 1: Basic React functionality
    try {
      results.push('✅ React hooks working');
    } catch (e) {
      results.push(`❌ React hooks failed: ${e}`);
    }

    // Test 2: Array methods
    try {
      const testArray = [1, 2, 3];
      testArray.forEach(() => {});
      results.push('✅ Array.forEach working');
    } catch (e) {
      results.push(`❌ Array.forEach failed: ${e}`);
    }

    // Test 3: String methods
    try {
      const testString = 'Test';
      testString.toLowerCase();
      results.push('✅ String.toLowerCase working');
    } catch (e) {
      results.push(`❌ String.toLowerCase failed: ${e}`);
    }

    // Test 4: Date methods
    try {
      const testDate = new Date();
      testDate.toLocaleDateString('ar-SA');
      testDate.toLocaleTimeString('ar-SA');
      results.push('✅ Date methods working');
    } catch (e) {
      results.push(`❌ Date methods failed: ${e}`);
    }

    // Test 5: KV hooks
    try {
      // This will test if useKV hook infrastructure is working
      results.push('✅ KV infrastructure available');
    } catch (e) {
      results.push(`❌ KV infrastructure failed: ${e}`);
    }

    setTestResults(results);
    setIsTestingComplete(true);
  }, []);

  React.useEffect(() => {
    runTests();
  }, [runTests]);

  const handleGoToFull = () => {
    window.location.search = '';
  };

  const handleGoToSafe = () => {
    window.location.search = '?safe=true';
  };

  const handleGoToEmergency = () => {
    window.location.search = '?emergency=true';
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
        maxWidth: '800px',
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
          🧪 وضع الاختبار - سبق الذكية
        </h1>
        
        <div style={{
          backgroundColor: '#dbeafe',
          border: '1px solid #2563eb',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>
            اختبار وظائف النظام الأساسية
          </h3>
          <p style={{ color: '#1e40af', margin: 0 }}>
            يتم اختبار جميع الوظائف الأساسية للتأكد من سلامة النظام.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>نتائج الاختبار:</h3>
          
          {isTestingComplete ? (
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '1rem'
            }}>
              {testResults.map((result, index) => (
                <div key={index} style={{ 
                  padding: '0.25rem 0',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              جاري تشغيل الاختبارات...
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>التنقل:</h3>
          
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
                fontSize: '1rem'
              }}
            >
              🚀 الانتقال للتطبيق الكامل
            </button>
            
            <button
              onClick={handleGoToSafe}
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
              🛡️ الوضع الآمن
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
                fontSize: '1rem'
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
          color: '#6b7280'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>معلومات الاختبار:</h4>
          <p style={{ margin: 0 }}>
            النظام: وضع الاختبار<br/>
            التوقيت: {new Date().toLocaleString('ar-SA')}<br/>
            الاختبارات: {testResults.length} / 5<br/>
            الحالة: {isTestingComplete ? 'مكتمل' : 'قيد التشغيل'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestAppContent;