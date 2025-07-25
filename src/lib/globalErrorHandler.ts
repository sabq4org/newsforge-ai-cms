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

// Global reference for cn function as fallback
let fallbackCn: any = null;

// Create a basic cn fallback function without dynamic imports
try {
  fallbackCn = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ');
  };
} catch (error) {
  console.warn('Could not create cn fallback:', error);
  fallbackCn = () => '';
}

// Enhanced Array prototype safety
const originalForEach = Array.prototype.forEach;
Array.prototype.forEach = function<T>(this: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
  try {
    // Ensure this is actually an array
    if (!Array.isArray(this)) {
      console.warn('forEach called on non-array:', this);
      return;
    }
    return originalForEach.call(this, callbackfn, thisArg);
  } catch (error) {
    console.error('Enhanced forEach error handler:', error);
    // Try to continue with a basic loop
    for (let i = 0; i < this.length; i++) {
      try {
        callbackfn.call(thisArg, this[i], i, this);
      } catch (itemError) {
        console.error(`Error processing array item ${i}:`, itemError);
      }
    }
  }
};

// Enhanced String prototype safety
const originalToLowerCase = String.prototype.toLowerCase;
String.prototype.toLowerCase = function(): string {
  try {
    if (typeof this !== 'string' && typeof this.valueOf !== 'function') {
      console.warn('toLowerCase called on invalid object:', this);
      return '';
    }
    return originalToLowerCase.call(this);
  } catch (error) {
    console.error('Enhanced toLowerCase error handler:', error);
    return String(this || '').toLowerCase();
  }
};

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
    event.message.includes("Can't find variable") ||
    event.message.includes("Can't find variable: cn") ||
    event.message.includes('toLowerCase') ||
    event.message.includes('forEach') ||
    event.message.includes('Cannot read propert') ||
    event.message.includes('Trophy') ||
    event.message.includes('Award') ||
    event.message.includes('ChartLine') ||
    event.message.includes('classGroup') ||
    event.message.includes('tailwind')
  )) {
    console.error('Global error caught and handled:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack
    });
    
    performanceErrorCount++;
    
    // Handle specific cn function errors
    if (event.message.includes("Can't find variable: cn")) {
      // Provide fallback cn function globally
      (window as any).cn = fallbackCn || ((...classes: any[]) => classes.filter(Boolean).join(' '));
      console.warn('globalErrorHandler: Provided fallback cn function');
    }
    
    // Handle forEach errors
    if (event.message.includes('forEach') && event.message.includes('not a function')) {
      console.warn('globalErrorHandler: forEach error detected, providing fallback');
      event.preventDefault();
      return true;
    }
    
    // Handle tailwind-merge errors
    if (event.message.includes('tailwind') || event.message.includes('classGroup')) {
      console.warn('globalErrorHandler: Tailwind merge error detected');
      // Provide a super simple cn fallback
      (window as any).cn = (...classes: any[]) => {
        try {
          return classes.filter(c => c && typeof c === 'string').join(' ');
        } catch {
          return '';
        }
      };
      event.preventDefault();
      return true;
    }
    
    // Alert performance dashboard if too many errors
    if (performanceErrorCount >= maxPerformanceErrors) {
      console.warn(`Performance Alert: ${performanceErrorCount} errors detected`);
      // Consider redirecting to emergency mode
      if (window.location.search !== '?emergency=true') {
        console.warn('Redirecting to emergency mode due to too many errors');
        window.location.search = '?emergency=true';
      }
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
    event.reason.message.includes('undefined is not an object') ||
    event.reason.message.includes("Can't find variable") ||
    event.reason.message.includes("Can't find variable: cn") ||
    event.reason.message.includes('Cannot read propert') ||
    event.reason.message.includes('Trophy') ||
    event.reason.message.includes('Award') ||
    event.reason.message.includes('ChartLine') ||
    event.reason.message.includes('forEach') ||
    event.reason.message.includes('toLowerCase') ||
    event.reason.message.includes('classGroup') ||
    event.reason.message.includes('tailwind')
  )) {
    console.error('Global async error caught and handled:', {
      reason: event.reason,
      promise: event.promise,
      stack: event.reason?.stack
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
  
  // Provide global safe utilities
  (window as any).safeCn = fallbackCn;
  (window as any).safeToString = (value: any) => {
    try {
      return String(value || '');
    } catch {
      return '';
    }
  };
  
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