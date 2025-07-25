import React from 'react';

/**
 * Emergency App - Minimal functionality when everything else fails
 */
const EmergencyApp: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontSize: '28px',
          color: '#1a1a1a',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          🛠️ وضع الطوارئ - سبق الذكية
        </h1>
        
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'right'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
            📋 معلومات النظام
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            تم تشغيل وضع الطوارئ بسبب خطأ في النظام الأساسي.
            <br />
            يتم حالياً استخدام واجهة مبسطة لضمان استمرارية الخدمة.
          </p>
        </div>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'right'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#856404' }}>
            ⚠️ الخطوات التالية
          </h3>
          <ol style={{ 
            color: '#856404', 
            lineHeight: '1.6',
            textAlign: 'right',
            listStyle: 'arabic-indic inside'
          }}>
            <li>تحديث الصفحة (F5 أو Ctrl+R)</li>
            <li>مسح ذاكرة التخزين المؤقت للمتصفح</li>
            <li>التواصل مع فريق الدعم الفني</li>
          </ol>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.reload()}
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
            🔄 إعادة تحميل الصفحة
          </button>
          
          <button
            onClick={() => window.location.href = '?test=true'}
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
            onClick={() => window.location.href = '?safe=true'}
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
        </div>
        
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
            📊 معلومات تقنية
          </h4>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '12px', 
            color: '#495057',
            textAlign: 'left'
          }}>
            <div>User Agent: {navigator.userAgent}</div>
            <div>Timestamp: {new Date().toISOString()}</div>
            <div>URL: {window.location.href}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyApp;