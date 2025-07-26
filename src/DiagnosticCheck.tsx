import React from 'react';

// Simple diagnostic component to check for basic functionality
const DiagnosticCheck: React.FC = () => {
  const [status, setStatus] = React.useState<string>('Checking...');
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    const checkErrors = () => {
      const foundErrors: string[] = [];
      
      try {
        // Check if basic React is working
        if (!React) {
          foundErrors.push('React is not available');
        }
        
        // Check if useState works
        const [test, setTest] = React.useState('test');
        if (!test) {
          foundErrors.push('useState not working');
        }
        
        // Check if basic DOM manipulation works
        const element = document.createElement('div');
        if (!element) {
          foundErrors.push('DOM manipulation failed');
        }
        
        // Check if we can access window object
        if (typeof window === 'undefined') {
          foundErrors.push('Window object not available');
        }
        
        // Test array methods
        try {
          const testArray = [1, 2, 3];
          testArray.forEach(() => {});
        } catch (error) {
          foundErrors.push(`Array.forEach error: ${error}`);
        }
        
        // Test string methods
        try {
          const testString = 'TEST';
          testString.toLowerCase();
        } catch (error) {
          foundErrors.push(`String.toLowerCase error: ${error}`);
        }
        
        // Test date methods
        try {
          const testDate = new Date();
          testDate.toLocaleDateString('ar-SA');
        } catch (error) {
          foundErrors.push(`Date methods error: ${error}`);
        }
        
        if (foundErrors.length === 0) {
          setStatus('All checks passed ✅');
        } else {
          setStatus('Errors found ❌');
          setErrors(foundErrors);
        }
        
      } catch (error) {
        setStatus('Critical error during diagnostic');
        setErrors([String(error)]);
      }
    };
    
    checkErrors();
  }, []);

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
      direction: 'rtl',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: '#333',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        فحص تشخيصي للنظام
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          حالة النظام: {status}
        </h2>
        
        {errors.length > 0 && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#c33' }}>الأخطاء المكتشفة:</h3>
            <ul style={{ marginTop: '0.5rem', paddingRight: '1.5rem' }}>
              {errors.map((error, index) => (
                <li key={index} style={{ marginBottom: '0.5rem', color: '#c33' }}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>معلومات البيئة:</h3>
          <p>نوع المتصفح: {navigator.userAgent}</p>
          <p>الوقت الحالي: {new Date().toLocaleString('ar-SA')}</p>
          <p>حالة الذاكرة: متاحة</p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticCheck;