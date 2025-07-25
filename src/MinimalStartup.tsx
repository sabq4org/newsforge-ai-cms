import React from 'react';

const MinimalStartup: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          سبق الذكية - التحقق من النظام
        </h1>
        
        <div style={{
          padding: '1rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>System Status</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✅ React rendering</li>
            <li>✅ Basic styling</li>
            <li>✅ Arabic text support</li>
            <li>✅ Page structure</li>
          </ul>
        </div>
        
        <div style={{
          padding: '1rem',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem',
          backgroundColor: '#eff6ff'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Navigation Options</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.location.search = '?safe=true'}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #3b82f6',
                borderRadius: '0.25rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Safe Mode
            </button>
            <button 
              onClick={() => window.location.search = '?test=true'}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #10b981',
                borderRadius: '0.25rem',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Test Mode
            </button>
            <button 
              onClick={() => window.location.search = ''}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #6b7280',
                borderRadius: '0.25rem',
                backgroundColor: '#6b7280',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Full App
            </button>
          </div>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem'
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            <strong>إرشادات:</strong> إذا ظهرت هذه الصفحة، فإن React يعمل بشكل صحيح. 
            اختبر الأوضاع المختلفة لتحديد مصدر المشكلة في التطبيق الرئيسي.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalStartup;