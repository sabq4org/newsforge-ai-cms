import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import BasicTestApp from './BasicTestApp.tsx'
import MinimalApp from './MinimalApp.tsx'
import DiagnosticApp from './DiagnosticApp.tsx'
import SimpleApp from './SimpleApp.tsx'
import EmergencyApp from './EmergencyApp.tsx'
import SafeFallbackApp from './SafeFallbackApp.tsx'
import UltimateSafeApp from './UltimateSafeApp.tsx'
import { ErrorFallback } from './ImprovedErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Critical fixes - import these first
import "./typeScriptFix"
import "./lib/globalCnFix"
import "./lib/globalIconFixes"
import "./lib/criticalErrorFixes"
import "./lib/runtimeErrorFixes"
import "./lib/comprehensiveErrorFixes"
import "./lib/startupValidation"

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

// Determine which app to load - SIMPLIFIED FOR FULL CMS
const getAppComponent = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Only allow diagnostic and emergency for actual debugging
  if (urlParams.get('diagnostic') === 'true') {
    return DiagnosticApp;
  }
  
  if (urlParams.get('emergency') === 'true') {
    return EmergencyApp;
  }
  
  // Force full CMS mode - Always return the main App
  localStorage.setItem('app-mode', 'full');
  localStorage.setItem('sabq-full-cms-enabled', 'true');
  
  console.log('🚀 Loading Full Sabq Althakiyah CMS');
  return App;
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
        console.warn('Error logged, but continuing with full CMS application');
        // Don't auto-redirect to test modes - just log the error
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
          
          <button onclick="window.location.search = '?mode=ultimate-safe'" style="
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">الوضع الآمن المحسن</button>
          
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
