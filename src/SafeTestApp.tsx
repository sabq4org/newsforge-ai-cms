import React from 'react';

/**
 * SafeTestApp - Minimal UI test without dependencies
 */
const SafeTestApp: React.FC = () => {
  const [status, setStatus] = React.useState('جاري التحقق...');
  
  React.useEffect(() => {
    // Test basic functionality
    setTimeout(() => {
      try {
        setStatus('✅ React يعمل بشكل صحيح');
      } catch (error) {
        setStatus('❌ خطأ في React');
      }
    }, 1000);
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '20px',
      fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif',
      direction: 'rtl',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px'
      }}>
        <h1 style={{
          fontSize: '32px',
          color: '#2d3748',
          marginBottom: '30px',
          fontWeight: 'bold'
        }}>
          سبق الذكية - الوضع الآمن
        </h1>
        
        <div style={{
          backgroundColor: '#f7fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#4a5568',
            marginBottom: '20px'
          }}>
            حالة النظام
          </h2>
          
          <div style={{
            fontSize: '18px',
            color: '#2d3748',
            padding: '15px',
            backgroundColor: '#edf2f7',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {status}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginTop: '20px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: '#f0fff4',
              border: '1px solid #9ae6b4',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>⚛️</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>React</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f0fff4',
              border: '1px solid #9ae6b4',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🎨</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>الواجهة</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f0fff4',
              border: '1px solid #9ae6b4',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔤</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>الخطوط</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f0fff4',
              border: '1px solid #9ae6b4',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🌐</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>RTL</div>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.search = ''}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            🚀 تشغيل التطبيق
          </button>
          
          <button
            onClick={() => window.location.search = '?test=true'}
            style={{
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            🧪 اختبار متقدم
          </button>
          
          <button
            onClick={() => window.location.search = '?minimal=true'}
            style={{
              backgroundColor: '#ed8936',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            🔧 التشخيص
          </button>
        </div>
        
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#718096',
          textAlign: 'right'
        }}>
          <strong>ملاحظة:</strong> هذا هو الوضع الآمن لتطبيق "سبق الذكية". 
          يتم استخدام هذا الوضع للتأكد من أن جميع المكونات الأساسية تعمل بشكل صحيح 
          قبل تحميل النظام الكامل.
        </div>
      </div>
    </div>
  );
};

export default SafeTestApp;