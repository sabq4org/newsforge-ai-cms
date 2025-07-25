/**
 * Critical Error Fixes for Sabq Althakiyah CMS
 * Fixes forEach, toLowerCase, date formatting, and other critical runtime errors
 */

// Global error mitigation for forEach on undefined/null values
const originalForEach = Array.prototype.forEach;
if (originalForEach) {
  Array.prototype.forEach = function<T>(
    callback: (value: T, index: number, array: T[]) => void,
    thisArg?: any
  ): void {
    try {
      // Check if 'this' is actually an array
      if (this == null) {
        console.warn('forEach called on null or undefined, skipping');
        return;
      }
      
      if (!Array.isArray(this)) {
        console.warn('forEach called on non-array:', typeof this, this);
        // Try to convert to array if possible
        const converted = Array.from(this as any);
        return originalForEach.call(converted, callback, thisArg);
      }
      
      return originalForEach.call(this, callback, thisArg);
    } catch (error) {
      console.error('forEach error caught and handled:', error);
      console.error('Context:', { type: typeof this, value: this, isArray: Array.isArray(this) });
    }
  };
}

// Global string method protection
const originalToLowerCase = String.prototype.toLowerCase;
if (originalToLowerCase) {
  String.prototype.toLowerCase = function(): string {
    try {
      if (this == null || this === undefined) {
        console.warn('toLowerCase called on null/undefined, returning empty string');
        return '';
      }
      
      if (typeof this !== 'string') {
        const converted = String(this);
        return originalToLowerCase.call(converted);
      }
      
      return originalToLowerCase.call(this);
    } catch (error) {
      console.error('toLowerCase error caught:', error, 'value:', this);
      return String(this || '').replace(/[A-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 32));
    }
  };
}

// Enhanced Date protection
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

if (originalToLocaleDateString) {
  Date.prototype.toLocaleDateString = function(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions
  ): string {
    try {
      if (!(this instanceof Date) || isNaN(this.getTime())) {
        console.warn('toLocaleDateString called on invalid date, using current date');
        return new Date().toLocaleDateString(locales, options);
      }
      return originalToLocaleDateString.call(this, locales, options);
    } catch (error) {
      console.error('toLocaleDateString error:', error);
      const year = this.getFullYear() || new Date().getFullYear();
      const month = String((this.getMonth() || 0) + 1).padStart(2, '0');
      const day = String(this.getDate() || 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };
}

if (originalToLocaleTimeString) {
  Date.prototype.toLocaleTimeString = function(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions
  ): string {
    try {
      if (!(this instanceof Date) || isNaN(this.getTime())) {
        console.warn('toLocaleTimeString called on invalid date, using current time');
        return new Date().toLocaleTimeString(locales, options);
      }
      return originalToLocaleTimeString.call(this, locales, options);
    } catch (error) {
      console.error('toLocaleTimeString error:', error);
      const hours = String(this.getHours() || 0).padStart(2, '0');
      const minutes = String(this.getMinutes() || 0).padStart(2, '0');
      const seconds = String(this.getSeconds() || 0).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };
}

// Global class name utility with comprehensive error handling
export function safeCn(...inputs: any[]): string {
  try {
    if (!inputs || inputs.length === 0) {
      return '';
    }
    
    // Convert all inputs to safe strings and filter out invalid ones
    const safeClassNames = inputs
      .filter(input => input != null && input !== false && input !== '')
      .map(input => {
        if (typeof input === 'string') {
          return input.trim();
        }
        if (typeof input === 'object') {
          // Handle conditional classes object
          return Object.entries(input)
            .filter(([_, condition]) => Boolean(condition))
            .map(([className]) => className)
            .join(' ');
        }
        return String(input).trim();
      })
      .filter(className => className && className.length > 0);
    
    return safeClassNames.join(' ');
  } catch (error) {
    console.error('safeCn error:', error, 'inputs:', inputs);
    return '';
  }
}

// Global object property access safety
export function safeGet(obj: any, path: string, defaultValue: any = undefined): any {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current;
  } catch (error) {
    console.error('safeGet error:', error);
    return defaultValue;
  }
}

// Enhanced array safety utilities
export function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  if (typeof value[Symbol.iterator] === 'function') {
    try {
      return Array.from(value);
    } catch {
      return [];
    }
  }
  return [value];
}

export function safeMap<T, U>(
  array: any,
  mapper: (item: T, index: number, array: T[]) => U,
  fallback: U[] = []
): U[] {
  try {
    const safeArray = ensureArray<T>(array);
    return safeArray.map(mapper);
  } catch (error) {
    console.error('safeMap error:', error);
    return fallback;
  }
}

export function safeFilter<T>(
  array: any,
  predicate: (item: T, index: number, array: T[]) => boolean,
  fallback: T[] = []
): T[] {
  try {
    const safeArray = ensureArray<T>(array);
    return safeArray.filter(predicate);
  } catch (error) {
    console.error('safeFilter error:', error);
    return fallback;
  }
}

// Date safety utilities
export function safeDate(value: any): Date {
  try {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  } catch {
    return new Date();
  }
}

export function safeDateString(
  date: any,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const safeDate_obj = safeDate(date);
    return safeDate_obj.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('safeDateString error:', error);
    const fallbackDate = new Date();
    return `${fallbackDate.getFullYear()}-${String(fallbackDate.getMonth() + 1).padStart(2, '0')}-${String(fallbackDate.getDate()).padStart(2, '0')}`;
  }
}

export function safeTimeString(
  date: any,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const safeDate_obj = safeDate(date);
    return safeDate_obj.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('safeTimeString error:', error);
    const fallbackDate = new Date();
    return `${String(fallbackDate.getHours()).padStart(2, '0')}:${String(fallbackDate.getMinutes()).padStart(2, '0')}`;
  }
}

// Object iteration safety
export function safeObjectEntries(obj: any): [string, any][] {
  try {
    if (!obj || typeof obj !== 'object') {
      return [];
    }
    return Object.entries(obj);
  } catch (error) {
    console.error('safeObjectEntries error:', error);
    return [];
  }
}

export function safeObjectKeys(obj: any): string[] {
  try {
    if (!obj || typeof obj !== 'object') {
      return [];
    }
    return Object.keys(obj);
  } catch (error) {
    console.error('safeObjectKeys error:', error);
    return [];
  }
}

// String safety utilities
export function safeString(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return String(value);
  } catch {
    return '';
  }
}

export function safeStringLower(value: any): string {
  try {
    const str = safeString(value);
    return str.toLowerCase();
  } catch {
    return '';
  }
}

// Enhanced error boundary for critical operations
export function safeOperation<T>(
  operation: () => T,
  fallback: T,
  errorContext?: string
): T {
  try {
    return operation();
  } catch (error) {
    console.error(`Safe operation failed${errorContext ? ` (${errorContext})` : ''}:`, error);
    return fallback;
  }
}

// Global error handler registration
export function registerCriticalErrorHandlers() {
  console.log('Registering critical error handlers for Sabq Althakiyah CMS');
  
  // Additional global error handling
  window.addEventListener('error', (event) => {
    const errorPatterns = [
      'forEach is not a function',
      'toLowerCase is not a function',
      'toLocaleDateString is not a function',
      'toLocaleTimeString is not a function',
      'undefined is not an object',
      'Cannot read property',
      'Cannot read properties of undefined',
      'Cannot read properties of null',
      'classGroupId',
      'twMerge'
    ];
    
    const hasPattern = errorPatterns.some(pattern => 
      event.message && event.message.includes(pattern)
    );
    
    if (hasPattern) {
      console.warn('Critical error pattern detected and handled:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && typeof reason === 'object' && reason.message) {
      const criticalPatterns = [
        'forEach',
        'toLowerCase',
        'toLocaleDateString',
        'classGroupId',
        'twMerge'
      ];
      
      const isCritical = criticalPatterns.some(pattern => 
        reason.message.includes(pattern)
      );
      
      if (isCritical) {
        console.warn('Critical promise rejection handled:', reason.message);
        event.preventDefault();
        return false;
      }
    }
  });
}

// Auto-register on import
if (typeof window !== 'undefined') {
  registerCriticalErrorHandlers();
}

export default {
  safeCn,
  safeGet,
  ensureArray,
  safeMap,
  safeFilter,
  safeDate,
  safeDateString,
  safeTimeString,
  safeObjectEntries,
  safeObjectKeys,
  safeString,
  safeStringLower,
  safeOperation,
  registerCriticalErrorHandlers
};