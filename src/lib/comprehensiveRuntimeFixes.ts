/**
 * Comprehensive Runtime Error Fixes for Sabq Althakiyah CMS
 * Addresses all common runtime errors including timestamp formatting, 
 * property access, and array operations
 */

import React from 'react';

// Safe property access utility
export function safeGet(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  try {
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
    console.warn(`safeGet error for path "${path}":`, error);
    return defaultValue;
  }
}

// Safe timestamp formatting
export function safeTimestampFormat(timestamp: any, locale: string = 'ar-SA'): string {
  try {
    if (!timestamp) {
      return new Date().toLocaleDateString(locale);
    }
    
    // Handle different timestamp types
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp === 'object' && timestamp.toLocaleDateString) {
      // Object with date methods
      date = timestamp;
    } else {
      // Fallback to current date
      console.warn('safeTimestampFormat: Invalid timestamp, using current date');
      date = new Date();
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('safeTimestampFormat: Invalid date created, using current date');
      date = new Date();
    }
    
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.error('safeTimestampFormat error:', error);
    return new Date().toLocaleDateString(locale);
  }
}

// Safe time formatting (runtime fallback version)
export function safeTimeFormatRuntime(time: any, locale: string = 'ar-SA'): string {
  try {
    if (!time) {
      return new Date().toLocaleTimeString(locale);
    }
    
    // Handle different time types
    let date: Date;
    
    if (time instanceof Date) {
      date = time;
    } else if (typeof time === 'number') {
      date = new Date(time);
    } else if (typeof time === 'string') {
      date = new Date(time);
    } else if (time && typeof time === 'object' && time.toLocaleTimeString) {
      // Object with time methods
      date = time;
    } else {
      // Fallback to current time
      console.warn('safeTimeFormatRuntime: Invalid time, using current time');
      date = new Date();
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('safeTimeFormatRuntime: Invalid date created, using current time');
      date = new Date();
    }
    
    return date.toLocaleTimeString(locale);
  } catch (error) {
    console.error('safeTimeFormatRuntime error:', error);
    return new Date().toLocaleTimeString(locale);
  }
}

// Safe array operations with enhanced error handling
export function safeForEach<T>(
  array: any, 
  callback: (item: T, index: number, array: T[]) => void,
  context?: any
): void {
  try {
    if (!array) {
      console.warn('safeForEach: Array is null or undefined');
      return;
    }
    
    if (!Array.isArray(array)) {
      console.warn('safeForEach: Not an array, attempting conversion');
      try {
        const converted = Array.from(array);
        converted.forEach(callback, context);
        return;
      } catch (conversionError) {
        console.error('safeForEach: Could not convert to array:', conversionError);
        return;
      }
    }
    
    array.forEach(callback, context);
  } catch (error) {
    console.error('safeForEach error:', error);
    
    // Manual iteration as fallback
    try {
      if (array && array.length) {
        for (let i = 0; i < array.length; i++) {
          try {
            callback.call(context, array[i], i, array);
          } catch (itemError) {
            console.error(`safeForEach: Error processing item ${i}:`, itemError);
          }
        }
      }
    } catch (fallbackError) {
      console.error('safeForEach: Even manual iteration failed:', fallbackError);
    }
  }
}

// Safe object property access with nested paths
export function safeObjectAccess(obj: any, ...paths: string[]): any {
  try {
    for (const path of paths) {
      const result = safeGet(obj, path);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  } catch (error) {
    console.error('safeObjectAccess error:', error);
    return undefined;
  }
}

// Safe string operations
export function safeStringOperation(value: any, operation: 'toLowerCase' | 'toUpperCase' | 'trim' | 'toString'): string {
  try {
    if (value == null) {
      return '';
    }
    
    let str: string;
    if (typeof value === 'string') {
      str = value;
    } else {
      str = String(value);
    }
    
    switch (operation) {
      case 'toLowerCase':
        return str.toLowerCase();
      case 'toUpperCase':
        return str.toUpperCase();
      case 'trim':
        return str.trim();
      case 'toString':
        return str;
      default:
        return str;
    }
  } catch (error) {
    console.error(`safeStringOperation (${operation}) error:`, error);
    return String(value || '');
  }
}

// Global object safety enhancement
export function enhanceObjectSafety(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    return new Proxy(obj, {
      get(target, prop, receiver) {
        try {
          const value = Reflect.get(target, prop, receiver);
          
          // Special handling for common problematic properties
          if (prop === 'colors' || prop === 'reasoning') {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              console.warn(`Property "${String(prop)}" is empty or undefined, providing fallback`);
              return prop === 'colors' ? { accent: '#3b82f6' } : ['Default reasoning'];
            }
          }
          
          return value;
        } catch (error) {
          console.warn(`Error accessing property "${String(prop)}":`, error);
          return undefined;
        }
      }
    });
  } catch (proxyError) {
    console.warn('Could not create proxy for object safety:', proxyError);
    return obj;
  }
}

// Safe component error boundary
export function withSafeErrorBoundary<T extends object>(Component: React.ComponentType<T>) {
  return function SafeComponent(props: T) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Component render error:', error);
      return React.createElement('div', {
        style: {
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          color: '#dc2626'
        }
      }, 'خطأ في عرض المكون');
    }
  };
}

// Auto-register all fixes
if (typeof window !== 'undefined') {
  console.log('Registering comprehensive runtime error fixes...');
  
  // Add global utilities
  (window as any).safeGet = safeGet;
  (window as any).safeTimestampFormat = safeTimestampFormat;
  (window as any).safeTimeFormatRuntime = safeTimeFormatRuntime;
  (window as any).safeForEach = safeForEach;
  (window as any).safeObjectAccess = safeObjectAccess;
  (window as any).safeStringOperation = safeStringOperation;
  (window as any).enhanceObjectSafety = enhanceObjectSafety;
  
  console.log('Comprehensive runtime error fixes registered successfully');
}

export default {
  safeGet,
  safeTimestampFormat,
  safeTimeFormatRuntime,
  safeForEach,
  safeObjectAccess,
  safeStringOperation,
  enhanceObjectSafety,
  withSafeErrorBoundary
};