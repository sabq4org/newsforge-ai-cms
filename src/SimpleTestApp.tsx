import React from 'react';

interface SimpleAppProps {}

const SimpleTestApp: React.FC<SimpleAppProps> = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      try {
        // Test basic functionality
        const testArray = [1, 2, 3];
        testArray.forEach(() => {});
        
        const testString = 'TEST';
        testString.toLowerCase();
        
        const testDate = new Date();
        testDate.toLocaleDateString('ar-SA');
        
        setIsLoading(false);
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    direction: 'rtl',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem'
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    color: '#666',
    marginBottom: '1.5rem'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>سبق الذكية</h1>
          <p style={messageStyle}>جاري تحميل النظام...</p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>خطأ في النظام</h1>
          <p style={{...messageStyle, color: '#dc3545'}}>
            حدث خطأ: {error}
          </p>
          <button 
            style={{...buttonStyle, backgroundColor: '#dc3545'}}
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>سبق الذكية</h1>
        <p style={messageStyle}>
          نظام إدارة المحتوى الذكي
        </p>
        <p style={{...messageStyle, fontSize: '1rem'}}>
          النظام يعمل بشكل طبيعي ✅
        </p>
        <button 
          style={buttonStyle}
          onClick={() => {
            window.location.search = '';
          }}
        >
          المتابعة للنظام الكامل
        </button>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SimpleTestApp;