import React from 'react';

/**
 * Safe Component Renderer - Prevents runtime errors from undefined variables
 * Provides fallback values and null checks for common UI component issues
 */

export interface SafeRenderOptions {
  fallbackText?: string;
  fallbackArray?: any[];
  fallbackObject?: Record<string, any>;
}

/**
 * Safely access array with fallback
 */
export function safeArray<T>(
  array: T[] | undefined | null, 
  fallback: T[] = []
): T[] {
  if (!Array.isArray(array)) {
    return fallback;
  }
  return array;
}

/**
 * Safely access object property with fallback
 */
export function safeProperty<T>(
  obj: any,
  property: string,
  fallback: T
): T {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  
  const value = obj[property];
  return value !== undefined && value !== null ? value : fallback;
}

/**
 * Safely access nested object property with dot notation
 */
export function safeDeepProperty<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return fallback;
    }
    current = current[key];
  }
  
  return current !== undefined && current !== null ? current : fallback;
}

/**
 * Safely render array with map function
 */
export function safeMap<T, R>(
  array: T[] | undefined | null,
  mapFn: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  const safeArr = safeArray(array);
  if (safeArr.length === 0) {
    return fallback;
  }
  
  try {
    return safeArr.map(mapFn);
  } catch (error) {
    console.warn('safeMap: Error during mapping:', error);
    return fallback;
  }
}

/**
 * Safely access array element with index
 */
export function safeArrayElement<T>(
  array: T[] | undefined | null,
  index: number,
  fallback: T
): T {
  const safeArr = safeArray(array);
  if (index < 0 || index >= safeArr.length) {
    return fallback;
  }
  
  const element = safeArr[index];
  return element !== undefined && element !== null ? element : fallback;
}

/**
 * Safely format object values for display
 */
export function safeDisplayValue(
  value: any,
  fallback: string = 'غير متوفر'
): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }
  
  return fallback;
}

/**
 * Safely validate and return colors object
 */
export function safeColors(
  colors: any,
  fallback: Record<string, string> = {}
): Record<string, string> {
  if (!colors || typeof colors !== 'object') {
    return {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#3b82f6',
      accent: '#f59e0b',
      ...fallback
    };
  }
  
  return {
    background: colors.background || '#ffffff',
    foreground: colors.foreground || '#000000',
    primary: colors.primary || '#3b82f6',
    accent: colors.accent || '#f59e0b',
    secondary: colors.secondary || '#6b7280',
    card: colors.card || '#f9fafb',
    border: colors.border || '#e5e7eb',
    ...colors
  };
}

/**
 * Safely execute function with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  errorMessage?: string
): T {
  try {
    const result = fn();
    return result !== undefined && result !== null ? result : fallback;
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(
  jsonString: string | undefined | null,
  fallback: T
): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== undefined && parsed !== null ? parsed : fallback;
  } catch (error) {
    console.warn('safeJsonParse: Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Component wrapper for safe rendering
 */
export function withSafeRender<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = null
) {
  return function SafeComponent(props: P) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.warn('SafeComponent: Render error caught:', error);
      return fallback;
    }
  };
}

export default {
  safeArray,
  safeProperty,
  safeDeepProperty,
  safeMap,
  safeArrayElement,
  safeDisplayValue,
  safeColors,
  safeExecute,
  safeJsonParse,
  withSafeRender
};