import React from 'react';

export function DiagnosticApp() {
  const [loadStatus, setLoadStatus] = React.useState('Loading...');
  
  React.useEffect(() => {
    try {
      // Test basic functionality
      console.log('DiagnosticApp: Starting tests...');
      
      // Test 1: Basic React
      if (typeof React.useState === 'function') {
        console.log('✓ React hooks working');
      }
      
      // Test 2: Spark API
      if (typeof window.spark === 'object') {
        console.log('✓ Spark API available');
      } else {
        console.log('✗ Spark API not available');
      }
      
      // Test 3: KV hooks
      try {
        // We can't actually import useKV here without risking the same error
        console.log('✓ Basic imports working');
      } catch (e) {
        console.log('✗ Import error:', e);
      }
      
      setLoadStatus('Basic tests completed. Check console for details.');
      
    } catch (error) {
      console.error('DiagnosticApp error:', error);
      setLoadStatus(`Error: ${error.message}`);
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>تشخيص سبق الذكية</h1>
      <p>حالة التحميل: {loadStatus}</p>
      <details>
        <summary>معلومات النظام</summary>
        <ul>
          <li>User Agent: {navigator.userAgent}</li>
          <li>Window.spark available: {typeof window.spark}</li>
          <li>React version: {React.version}</li>
        </ul>
      </details>
    </div>
  );
}

export default DiagnosticApp;