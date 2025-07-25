import { safeDateFormat, safeTimeFormat } from './utils';

/**
 * Global error handler for date formatting issues
 * This intercepts common date formatting errors and provides safe fallbacks
 */

// Store original Date methods
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

// Override Date.prototype.toLocaleDateString with error handling
Date.prototype.toLocaleDateString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
  try {
    if (isNaN(this.getTime())) {
      console.warn('globalErrorHandler: Invalid date object, using current date');
      return safeDateFormat(new Date(), locales as string, options);
    }
    return originalToLocaleDateString.call(this, locales, options);
  } catch (error) {
    console.error('globalErrorHandler: Date formatting error:', error);
    return safeDateFormat(new Date(), locales as string, options);
  }
};

// Override Date.prototype.toLocaleTimeString with error handling
Date.prototype.toLocaleTimeString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
  try {
    if (isNaN(this.getTime())) {
      console.warn('globalErrorHandler: Invalid date object, using current time');
      return safeTimeFormat(new Date(), locales as string, options);
    }
    return originalToLocaleTimeString.call(this, locales, options);
  } catch (error) {
    console.error('globalErrorHandler: Time formatting error:', error);
    return safeTimeFormat(new Date(), locales as string, options);
  }
};

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('toLocaleDateString') ||
    event.message.includes('toLocaleTimeString') ||
    event.message.includes('is not a function')
  )) {
    console.error('Global date formatting error caught:', event.error);
    event.preventDefault(); // Prevent the error from crashing the app
    return true;
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && (
    event.reason.message.includes('toLocaleDateString') ||
    event.reason.message.includes('toLocaleTimeString')
  )) {
    console.error('Global async date formatting error caught:', event.reason);
    event.preventDefault(); // Prevent the error from crashing the app
  }
});

export function initializeGlobalErrorHandler() {
  console.log('Global date formatting error handler initialized');
}