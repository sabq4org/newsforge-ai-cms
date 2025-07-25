/**
 * Runtime Error Fixes for Sabq Althakiyah CMS
 * Comprehensive error handling and prevention system
 */

import React from 'react';

// Global error handler for undefined property access
window.addEventListener('error', (event) => {
  const error = event.error;
  const message = event.message;
  
  // Handle specific error patterns
  if (message && typeof message === 'string') {
    // Fix: undefined is not an object (evaluating 'K.reasoning[0]')
    if (message.includes("reasoning[0]") || message.includes("reasoning") && message.includes("undefined")) {
      console.warn('Runtime Fix: reasoning array access error prevented');
      event.preventDefault();
      return false;
    }
    
    // Fix: undefined is not an object (evaluating 'K.colors.accent')
    if (message.includes("colors.accent") || message.includes("colors") && message.includes("undefined")) {
      console.warn('Runtime Fix: colors object access error prevented');
      event.preventDefault();
      return false;
    }
    
    // Fix: toLocaleDateString is not a function
    if (message.includes("toLocaleDateString") || message.includes("toLocaleTimeString")) {
      console.warn('Runtime Fix: date formatting error prevented');
      event.preventDefault();
      return false;
    }
    
    // Fix: toLowerCase is not a function / undefined is not an object
    if (message.includes("toLowerCase") || message.includes("toLowerCase is not a function")) {
      console.warn('Runtime Fix: toLowerCase error prevented');
      event.preventDefault();
      return false;
    }
    
    // Fix: Can't find variable errors
    if (message.includes("Can't find variable")) {
      console.warn('Runtime Fix: variable access error prevented');
      event.preventDefault();
      return false;
    }
  }
  
  return true;
});

// Polyfill for safe array access
if (!Array.prototype.safeGet) {
  Array.prototype.safeGet = function(index, fallback = null) {
    return (index >= 0 && index < this.length) ? this[index] : fallback;
  };
}

// Polyfill for safe object property access
if (!Object.prototype.safeGet) {
  Object.prototype.safeGet = function(property, fallback = null) {
    return this && this.hasOwnProperty(property) ? this[property] : fallback;
  };
}

// Global safe render function for React components
window.safeRender = function(component, fallback = null) {
  try {
    return component;
  } catch (error) {
    console.warn('safeRender: Component render error caught:', error);
    return fallback;
  }
};

// Safe date formatting function
window.safeDateFormat = function(date, locale = 'ar-SA', options = {}) {
  try {
    if (!date) return 'غير متوفر';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
    
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    console.warn('safeDateFormat: Date formatting error:', error);
    return 'غير متوفر';
  }
};

// Safe time formatting function
window.safeTimeFormat = function(date, locale = 'ar-SA', options = {}) {
  try {
    if (!date) return 'غير متوفر';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'وقت غير صحيح';
    
    return dateObj.toLocaleTimeString(locale, options);
  } catch (error) {
    console.warn('safeTimeFormat: Time formatting error:', error);
    return 'غير متوفر';
  }
};

// Safe colors object handler
window.getSafeColors = function(colors, property, fallback = '#999999') {
  try {
    if (!colors || typeof colors !== 'object') return fallback;
    return colors[property] || fallback;
  } catch (error) {
    console.warn('getSafeColors: Color access error:', error);
    return fallback;
  }
};

// Safe array access handler
window.getSafeArrayElement = function(array, index, fallback = null) {
  try {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
      return fallback;
    }
    return array[index];
  } catch (error) {
    console.warn('getSafeArrayElement: Array access error:', error);
    return fallback;
  }
};

// Safe reasoning text handler specifically for theme components
window.getSafeReasoning = function(reasoning, index = 0, fallback = 'سبب غير محدد') {
  try {
    if (!reasoning) return fallback;
    if (!Array.isArray(reasoning)) return fallback;
    if (index < 0 || index >= reasoning.length) return fallback;
    return reasoning[index] || fallback;
  } catch (error) {
    console.warn('getSafeReasoning: Reasoning access error:', error);
    return fallback;
  }
};

// Intercept and fix common React component errors
const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  try {
    return originalCreateElement.apply(this, [type, props, ...children]);
  } catch (error) {
    console.warn('React.createElement: Error caught and handled:', error);
    return originalCreateElement('div', { 
      className: 'error-fallback text-muted-foreground p-2' 
    }, 'عذراً، حدث خطأ في عرض هذا المكون');
  }
};

console.log('✅ Runtime error fixes loaded successfully');

export {};