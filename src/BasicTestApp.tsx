import React from 'react';

/**
 * Ultra-basic test component to verify if React is working
 */
export function BasicTestApp() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      <h1>سبق الذكية - اختبار أساسي</h1>
      <p>إذا كنت ترى هذا النص، فإن React يعمل بشكل صحيح.</p>
      
      <div style={{ marginTop: '20px' }}>
        <p>عداد الاختبار: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '8px 16px',
            marginRight: '8px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          زيادة العداد
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          إعادة تعيين
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>معلومات النظام:</h3>
        <ul>
          <li>React Version: {React.version}</li>
          <li>User Agent: {navigator.userAgent.substring(0, 50)}...</li>
          <li>Window.spark available: {typeof window.spark}</li>
          <li>Timestamp: {new Date().toLocaleString('ar-SA')}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            localStorage.setItem('app-mode', 'simple');
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            marginLeft: '8px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          تجربة التطبيق المبسط
        </button>
        <button 
          onClick={() => {
            localStorage.setItem('app-mode', 'full');
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          تحميل التطبيق الكامل
        </button>
      </div>
    </div>
  );
}

export default BasicTestApp;