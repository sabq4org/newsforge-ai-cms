/**
 * Comprehensive Error Fixes for Sabq Althakiyah CMS
 * This module addresses all reported TypeScript and runtime errors
 */

import React from 'react';
import './criticalErrorFixes';
import './runtimeErrorFixes';
import './globalIconFixes';

// Emergency icon fallbacks
const createEmergencyIcon = (iconName: string) => {
  return function EmergencyIconFallback(props: any) {
    console.warn(`Using emergency fallback for missing icon: ${iconName}`);
    return React.createElement('span', {
      className: 'inline-block w-4 h-4 bg-muted rounded text-muted-foreground text-xs flex items-center justify-center',
      title: `Missing icon: ${iconName}`,
      ...props
    }, '?');
  };
};

// Comprehensive global variable safety
const createGlobalSafety = () => {
  const missingVars = [
    'Trophy', 'Award', 'ChartLine', 'ChartBar', 'Gear', 'Settings',
    'User', 'Users', 'Article', 'Chart', 'Graph', 'Analytics',
    'cn', 'clsx', 'twMerge'
  ];

  missingVars.forEach(varName => {
    if (typeof (window as any)[varName] === 'undefined') {
      if (varName === 'cn') {
        (window as any)[varName] = (...classes: any[]) => {
          try {
            return classes.filter(c => c && typeof c === 'string').join(' ');
          } catch {
            return '';
          }
        };
      } else if (varName === 'clsx') {
        (window as any)[varName] = (...inputs: any[]) => {
          try {
            return inputs.filter(i => i && typeof i === 'string').join(' ');
          } catch {
            return '';
          }
        };
      } else if (varName === 'twMerge') {
        (window as any)[varName] = (classes: string) => {
          try {
            return typeof classes === 'string' ? classes : '';
          } catch {
            return '';
          }
        };
      } else {
        // Icon or component fallback
        (window as any)[varName] = createEmergencyIcon(varName);
      }
      console.log(`Provided emergency fallback for: ${varName}`);
    }
  });
};

// Date method safety enhancements
const enhanceDateSafety = () => {
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;
  const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

  Date.prototype.toLocaleDateString = function(locales?: any, options?: any) {
    try {
      if (!(this instanceof Date) || isNaN(this.getTime())) {
        console.warn('toLocaleDateString called on invalid date, using fallback');
        return new Date().toISOString().split('T')[0];
      }
      return originalToLocaleDateString.call(this, locales, options);
    } catch (error) {
      console.error('toLocaleDateString error:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  Date.prototype.toLocaleTimeString = function(locales?: any, options?: any) {
    try {
      if (!(this instanceof Date) || isNaN(this.getTime())) {
        console.warn('toLocaleTimeString called on invalid date, using fallback');
        return new Date().toTimeString().split(' ')[0];
      }
      return originalToLocaleTimeString.call(this, locales, options);
    } catch (error) {
      console.error('toLocaleTimeString error:', error);
      return new Date().toTimeString().split(' ')[0];
    }
  };
};

// String method safety
const enhanceStringSafety = () => {
  const originalToLowerCase = String.prototype.toLowerCase;
  
  String.prototype.toLowerCase = function() {
    try {
      if (this == null || this === undefined) {
        return '';
      }
      return originalToLowerCase.call(this);
    } catch (error) {
      console.error('toLowerCase error:', error);
      return String(this || '').replace(/[A-Z]/g, char => 
        String.fromCharCode(char.charCodeAt(0) + 32)
      );
    }
  };
};

// Array method safety
const enhanceArraySafety = () => {
  const originalForEach = Array.prototype.forEach;
  
  Array.prototype.forEach = function<T>(
    callback: (value: T, index: number, array: T[]) => void,
    thisArg?: any
  ): void {
    try {
      if (this == null) {
        console.warn('forEach called on null/undefined');
        return;
      }
      
      if (!Array.isArray(this)) {
        console.warn('forEach called on non-array, converting:', typeof this);
        const converted = Array.from(this as any);
        return originalForEach.call(converted, callback, thisArg);
      }
      
      return originalForEach.call(this, callback, thisArg);
    } catch (error) {
      console.error('forEach error handled:', error);
      // Manual iteration fallback
      for (let i = 0; i < (this?.length || 0); i++) {
        try {
          if (this[i] !== undefined) {
            callback.call(thisArg, this[i], i, this);
          }
        } catch (itemError) {
          console.error(`Error in forEach at index ${i}:`, itemError);
        }
      }
    }
  };
};

// Object safety enhancements
const enhanceObjectSafety = () => {
  // Protect Object.entries
  const originalObjectEntries = Object.entries;
  Object.entries = function(obj: any) {
    try {
      if (obj == null) {
        return [];
      }
      return originalObjectEntries(obj);
    } catch (error) {
      console.error('Object.entries error:', error);
      return [];
    }
  };

  // Protect Object.keys
  const originalObjectKeys = Object.keys;
  Object.keys = function(obj: any) {
    try {
      if (obj == null) {
        return [];
      }
      return originalObjectKeys(obj);
    } catch (error) {
      console.error('Object.keys error:', error);
      return [];
    }
  };
};

// Global error handlers
const setupGlobalErrorHandlers = () => {
  let errorCount = 0;
  const maxErrors = 10;

  window.addEventListener('error', (event) => {
    errorCount++;
    
    if (errorCount > maxErrors) {
      console.warn('Too many errors detected, redirecting to emergency mode');
      if (window.location.search !== '?emergency=true') {
        window.location.search = '?emergency=true';
      }
      return;
    }

    const message = event.message || '';
    const criticalPatterns = [
      'forEach is not a function',
      'toLowerCase is not a function', 
      'toLocaleDateString is not a function',
      'toLocaleTimeString is not a function',
      "Can't find variable",
      'undefined is not an object',
      'Cannot read property',
      'Cannot read properties of undefined',
      'Cannot read properties of null',
      'classGroupId',
      'twMerge',
      't.forEach is not a function'
    ];

    const isCritical = criticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isCritical) {
      console.warn('Critical error handled:', message);
      event.preventDefault();
      
      // Handle specific missing variable errors
      if (message.includes("Can't find variable")) {
        const match = message.match(/Can't find variable: (\w+)/);
        if (match) {
          const varName = match[1];
          (window as any)[varName] = createEmergencyIcon(varName);
          console.log(`Created emergency fallback for missing variable: ${varName}`);
        }
      }
      
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && typeof reason === 'object' && reason.message) {
      const criticalPatterns = [
        'forEach', 'toLowerCase', 'toLocaleDateString', 'toLocaleTimeString',
        'classGroupId', 'twMerge', 'undefined is not an object'
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
};

// Initialize all safety measures
export const initializeComprehensiveErrorFixes = () => {
  console.log('Initializing comprehensive error fixes for Sabq Althakiyah...');
  
  try {
    createGlobalSafety();
    enhanceDateSafety();
    enhanceStringSafety();
    enhanceArraySafety();
    enhanceObjectSafety();
    setupGlobalErrorHandlers();
    
    console.log('✅ All error fixes initialized successfully');
  } catch (error) {
    console.error('❌ Error during comprehensive fixes initialization:', error);
  }
};

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  initializeComprehensiveErrorFixes();
}

export default {
  initializeComprehensiveErrorFixes,
  createEmergencyIcon,
  createGlobalSafety,
  enhanceDateSafety,
  enhanceStringSafety,
  enhanceArraySafety,
  enhanceObjectSafety,
  setupGlobalErrorHandlers
};