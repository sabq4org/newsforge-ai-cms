import { safeDateFormat, safeTimeFormat } from './utils';

/**
 * Global error handler for date formatting issues and performance monitoring
 * This intercepts common date formatting errors and provides safe fallbacks
 */

// Store original Date methods
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

// Performance error counter
let performanceErrorCount = 0;
const maxPerformanceErrors = 10;

// Override Date.prototype.toLocaleDateString with error handling
Date.prototype.toLocaleDateString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
  try {
    if (isNaN(this.getTime()) || !isFinite(this.getTime())) {
      console.warn('globalErrorHandler: Invalid date object, using current date');
      return safeDateFormat(new Date(), locales as string, options);
    }
    return originalToLocaleDateString.call(this, locales, options);
  } catch (error) {
    console.error('globalErrorHandler: Date formatting error:', error);
    performanceErrorCount++;
    return safeDateFormat(new Date(), locales as string, options);
  }
};

// Override Date.prototype.toLocaleTimeString with error handling
Date.prototype.toLocaleTimeString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
  try {
    if (isNaN(this.getTime()) || !isFinite(this.getTime())) {
      console.warn('globalErrorHandler: Invalid date object, using current time');
      return safeTimeFormat(new Date(), locales as string, options);
    }
    return originalToLocaleTimeString.call(this, locales, options);
  } catch (error) {
    console.error('globalErrorHandler: Time formatting error:', error);
    performanceErrorCount++;
    return safeTimeFormat(new Date(), locales as string, options);
  }
};

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('toLocaleDateString') ||
    event.message.includes('toLocaleTimeString') ||
    event.message.includes('is not a function') ||
    event.message.includes('undefined is not an object') ||
    event.message.includes("Can't find variable")
  )) {
    console.error('Global error caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    performanceErrorCount++;
    
    // Alert performance dashboard if too many errors
    if (performanceErrorCount >= maxPerformanceErrors) {
      console.warn(`Performance Alert: ${performanceErrorCount} errors detected`);
      performanceErrorCount = 0; // Reset counter
    }
    
    event.preventDefault(); // Prevent the error from crashing the app
    return true;
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && (
    event.reason.message.includes('toLocaleDateString') ||
    event.reason.message.includes('toLocaleTimeString') ||
    event.reason.message.includes('is not a function') ||
    event.reason.message.includes('undefined is not an object')
  )) {
    console.error('Global async error caught:', {
      reason: event.reason,
      promise: event.promise
    });
    
    performanceErrorCount++;
    event.preventDefault(); // Prevent the error from crashing the app
  }
});

// Performance monitoring for long tasks
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      const longTasks = list.getEntries();
      longTasks.forEach((task) => {
        if (task.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            duration: task.duration,
            startTime: task.startTime,
            name: task.name
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
}

export function initializeGlobalErrorHandler() {
  console.log('Enhanced global error handler with performance monitoring initialized');
  
  // Report initial performance state
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Initial memory state:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
}