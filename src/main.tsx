import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import BasicTestApp from './BasicTestApp.tsx'
import MinimalApp from './MinimalApp.tsx'
import DiagnosticApp from './DiagnosticApp.tsx'
import ErrorFallback from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Enhanced error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Determine which app to load based on mode
const getAppComponent = () => {
  const mode = new URLSearchParams(window.location.search).get('mode');
  const storedMode = localStorage.getItem('app-mode');
  
  if (mode === 'basic' || storedMode === 'basic') {
    return BasicTestApp;
  } else if (mode === 'diagnostic' || storedMode === 'diagnostic') {
    return DiagnosticApp;
  } else if (mode === 'minimal' || storedMode === 'minimal') {
    return MinimalApp;
  } else if (mode === 'full' || storedMode === 'full') {
    return App;
  } else {
    // Default to basic test to ensure something loads
    return BasicTestApp;
  }
};

const AppComponent = getAppComponent();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      // Auto-switch to basic mode if anything fails
      localStorage.setItem('app-mode', 'basic');
      window.location.search = '?mode=basic';
    }}
  >
    <AppComponent />
   </ErrorBoundary>
)
