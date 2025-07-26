import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import SafeStableApp from './SafeStableApp.tsx'

import "./main.css"
import "./index.css"

// Basic error fallback
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'center',
      padding: '2rem',
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '2rem' }}>خطأ في التطبيق</h1>
        <p style={{ marginBottom: '2rem', color: '#374151', lineHeight: '1.6' }}>
          حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          إعادة التحميل
        </button>
        <details style={{ marginTop: '2rem', textAlign: 'left' }}>
          <summary>Error Details</summary>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto', marginTop: '1rem' }}>
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Simple error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting Sabq Althakiyah CMS...');

try {
  console.log('Creating root element...');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering application...');
  root.render(
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      <SafeStableApp />
    </ErrorBoundary>
  );
  
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Critical error during startup:', error);
  
  // Emergency fallback - inject basic HTML directly
  document.body.innerHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      direction: rtl;
      text-align: center;
      padding: 2rem;
      background: #f8fafc;
    ">
      <div style="
        max-width: 600px;
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 2rem;">🚨 فشل بدء التطبيق</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
          فشل تحميل التطبيق. يرجى إعادة تحميل الصفحة.
        </p>
        <button onclick="window.location.reload()" style="
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        ">إعادة التحميل</button>
      </div>
    </div>
  `;
}
