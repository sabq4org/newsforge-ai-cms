import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import BasicTestApp from './BasicTestApp.tsx'
import MinimalApp from './MinimalApp.tsx'
import DiagnosticApp from './DiagnosticApp.tsx'
import SimpleApp from './SimpleApp.tsx'
import EmergencyApp from './EmergencyApp.tsx'
import { ErrorFallback } from './ImprovedErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Critical error detection
let criticalErrorDetected = false;

// Enhanced error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error source:', event.filename, 'Line:', event.lineno);
  
  // Check for critical errors that require emergency mode
  if (event.message && (
    event.message.includes('forEach') ||
    event.message.includes('tailwind') ||
    event.message.includes('classGroup') ||
    event.message.includes("Can't find variable: cn") ||
    event.message.includes('ChartLine') ||
    event.message.includes('Trophy') ||
    event.message.includes('Award')
  )) {
    criticalErrorDetected = true;
    console.warn('Critical error detected, should use emergency mode');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check for critical promise rejections
  if (event.reason && event.reason.message && (
    event.reason.message.includes('forEach') ||
    event.reason.message.includes('tailwind') ||
    event.reason.message.includes('classGroup') ||
    event.reason.message.includes("Can't find variable: cn")
  )) {
    criticalErrorDetected = true;
    console.warn('Critical promise rejection detected, should use emergency mode');
  }
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
  
  // Emergency mode takes highest priority
  if (urlParams.get('emergency') === 'true' || mode === 'emergency' || criticalErrorDetected) {
    return EmergencyApp;
  }
  
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
        
        // Check for critical errors that require emergency mode
        if (error.message && (
          error.message.includes('forEach') ||
          error.message.includes('tailwind') ||
          error.message.includes('classGroup') ||
          error.message.includes("Can't find variable: cn") ||
          error.message.includes('ChartLine') ||
          error.message.includes('Trophy') ||
          error.message.includes('Award')
        )) {
          localStorage.setItem('app-mode', 'emergency');
          window.location.search = '?emergency=true';
          // Exit the callback early
          return;
        }
        
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
  
  // Check if this is a critical error that needs emergency mode
  if (error instanceof Error && (
    error.message.includes('forEach') ||
    error.message.includes('tailwind') ||
    error.message.includes('classGroup') ||
    error.message.includes("Can't find variable: cn")
  )) {
    // Redirect to emergency mode immediately
    window.location.search = '?emergency=true';
    // Exit early from the try-catch block
    throw new Error('Redirecting to emergency mode');
  }
  
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
      background: #f8fafc;
    ">
      <div style="
        max-width: 600px;
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 2rem;">🚨 خطأ حرج في بدء التطبيق</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
          فشل تحميل التطبيق بالكامل. يرجى اختيار أحد الخيارات التالية:
        </p>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
          <button onclick="window.location.search = '?emergency=true'" style="
            padding: 0.75rem 1.5rem;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">وضع الطوارئ</button>
          
          <button onclick="window.location.search = '?minimal=true'" style="
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">الوضع الأساسي</button>
          
          <button onclick="window.location.reload()" style="
            padding: 0.75rem 1.5rem;
            background: #f59e0b;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">إعادة التحميل</button>
          
          <button onclick="localStorage.clear(); window.location.reload();" style="
            padding: 0.75rem 1.5rem;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">إعادة تعيين كامل</button>
        </div>
        
        <details style="margin-top: 2rem;">
          <summary style="cursor: pointer; font-weight: 500; margin-bottom: 1rem;">تفاصيل الخطأ</summary>
          <pre style="
            padding: 1rem;
            background: #f3f4f6;
            border-radius: 0.375rem;
            text-align: left;
            font-size: 0.75rem;
            overflow: auto;
            max-height: 200px;
          ">${error.message}\n\n${error.stack || ''}</pre>
        </details>
      </div>
    </div>
  `;
}
