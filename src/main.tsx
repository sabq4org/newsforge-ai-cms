import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import BasicTestApp from './BasicTestApp.tsx'
import MinimalApp from './MinimalApp.tsx'
import DiagnosticApp from './DiagnosticApp.tsx'
import SimpleApp from './SimpleApp.tsx'
import { ErrorFallback } from './ImprovedErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Enhanced error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error source:', event.filename, 'Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Debug: Log what mode we're starting in
console.log('Starting Sabq Althakiyah CMS...');
console.log('URL params:', window.location.search);
console.log('Stored mode:', localStorage.getItem('app-mode'));

// Determine which app to load based on mode
const getAppComponent = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const storedMode = localStorage.getItem('app-mode');
  
  // URL parameters take priority
  if (urlParams.get('minimal') === 'true' || mode === 'minimal' || storedMode === 'minimal') {
    return MinimalApp;
  } else if (urlParams.get('safe') === 'true' || mode === 'safe') {
    return BasicTestApp;
  } else if (urlParams.get('test') === 'true' || mode === 'test') {
    return DiagnosticApp;
  } else if (urlParams.get('simple') === 'true' || mode === 'simple' || storedMode === 'simple') {
    return SimpleApp;
  } else if (mode === 'basic' || storedMode === 'basic') {
    return BasicTestApp;
  } else if (mode === 'diagnostic' || storedMode === 'diagnostic') {
    return DiagnosticApp;
  } else if (mode === 'full' || storedMode === 'full') {
    return App;
  } else if (mode === null && !storedMode) {
    // Default to simple app for safety
    return SimpleApp;
  } else {
    // Fallback to minimal for safety
    return MinimalApp;
  }
};

const AppComponent = getAppComponent();

// Debug: Log which component we selected
console.log('Selected app component:', AppComponent.name || 'Unknown');

console.log('Rendering application...');

try {
  console.log('Creating root element...');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering with ErrorBoundary...');
  root.render(
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Auto-switch to simple mode if anything fails
        localStorage.setItem('app-mode', 'simple');
        // Don't reload immediately, let user see the error first
        setTimeout(() => {
          if (confirm('حدث خطأ في التطبيق. هل تريد الانتقال إلى الوضع المبسط؟')) {
            window.location.search = '?mode=simple';
          }
        }, 2000);
      }}
    >
      <AppComponent />
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
      font-family: system-ui, sans-serif;
      direction: rtl;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h1 style="color: #dc2626; margin-bottom: 1rem;">خطأ حرج في بدء التطبيق</h1>
        <p style="margin-bottom: 2rem;">فشل تحميل التطبيق بالكامل. يرجى المحاولة مرة أخرى.</p>
        <button onclick="window.location.reload()" style="
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          margin-right: 0.5rem;
        ">إعادة تحميل الصفحة</button>
        <button onclick="localStorage.clear(); window.location.reload();" style="
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        ">إعادة تعيين كامل</button>
        <pre style="
          margin-top: 2rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
          text-align: left;
          font-size: 0.75rem;
          overflow: auto;
        ">${error.message}\n\n${error.stack || ''}</pre>
      </div>
    </div>
  `;
}
