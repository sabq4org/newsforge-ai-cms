/**
 * Quantum Color Adaptation Safety System
 * Provides comprehensive error handling and safety checks for the quantum color system
 */

export interface SafeColorProfile {
  red: number;
  green: number;
  blue: number;
  warmth: number;
  contrast: number;
  intensity: number;
  timestamp: number;
}

export interface SafeEnvironmentalContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  activity: 'reading' | 'writing' | 'browsing' | 'analytics';
  eyeStrain: 'low' | 'medium' | 'high';
  sessionLength: number;
}

/**
 * Validates and normalizes a color profile object
 */
export function validateColorProfile(profile: any): SafeColorProfile {
  if (!profile || typeof profile !== 'object') {
    return createDefaultColorProfile();
  }

  return {
    red: validateNumber(profile.red, 0, -10, 10),
    green: validateNumber(profile.green, 0, -10, 10),
    blue: validateNumber(profile.blue, 0, -10, 10),
    warmth: validateNumber(profile.warmth, 0, -0.3, 0.3),
    contrast: validateNumber(profile.contrast, 1, 0.7, 1.3),
    intensity: validateNumber(profile.intensity, 1, 0.5, 1.2),
    timestamp: validateNumber(profile.timestamp, Date.now(), 0, Infinity)
  };
}

/**
 * Validates and normalizes an environmental context object
 */
export function validateEnvironmentalContext(context: any): SafeEnvironmentalContext {
  if (!context || typeof context !== 'object') {
    return createDefaultEnvironmentalContext();
  }

  const validTimeOfDay: SafeEnvironmentalContext['timeOfDay'][] = ['morning', 'afternoon', 'evening', 'night'];
  const validActivity: SafeEnvironmentalContext['activity'][] = ['reading', 'writing', 'browsing', 'analytics'];
  const validEyeStrain: SafeEnvironmentalContext['eyeStrain'][] = ['low', 'medium', 'high'];

  return {
    timeOfDay: validTimeOfDay.includes(context.timeOfDay) ? context.timeOfDay : 'morning',
    activity: validActivity.includes(context.activity) ? context.activity : 'browsing',
    eyeStrain: validEyeStrain.includes(context.eyeStrain) ? context.eyeStrain : 'low',
    sessionLength: validateNumber(context.sessionLength, 0, 0, Infinity)
  };
}

/**
 * Creates a default color profile
 */
export function createDefaultColorProfile(): SafeColorProfile {
  return {
    red: 0,
    green: 0,
    blue: 0,
    warmth: 0,
    contrast: 1,
    intensity: 1,
    timestamp: Date.now()
  };
}

/**
 * Creates a default environmental context
 */
export function createDefaultEnvironmentalContext(): SafeEnvironmentalContext {
  return {
    timeOfDay: 'morning',
    activity: 'browsing',
    eyeStrain: 'low',
    sessionLength: 0
  };
}

/**
 * Validates a number with bounds checking
 */
function validateNumber(value: any, defaultValue: number, min: number = -Infinity, max: number = Infinity): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely applies CSS variables to the document
 */
export function safelyApplyCSSVariables(variables: Record<string, string | number>): boolean {
  try {
    const root = document?.documentElement;
    if (!root || !root.style || typeof root.style.setProperty !== 'function') {
      console.warn('Document root not available for CSS variable application');
      return false;
    }

    for (const [key, value] of Object.entries(variables)) {
      try {
        root.style.setProperty(key, String(value));
      } catch (propError) {
        console.warn(`Error setting CSS property ${key}:`, propError);
      }
    }

    return true;
  } catch (error) {
    console.warn('Error applying CSS variables:', error);
    return false;
  }
}

/**
 * Safely applies CSS classes to elements
 */
export function safelyApplyClasses(
  selector: string, 
  classesToAdd: string[] = [], 
  classesToRemove: string[] = []
): boolean {
  try {
    const elements = document.querySelectorAll(selector);
    if (!elements || typeof elements.forEach !== 'function') {
      return false;
    }

    elements.forEach(element => {
      try {
        if (element && element.classList) {
          if (classesToRemove.length > 0 && typeof element.classList.remove === 'function') {
            element.classList.remove(...classesToRemove);
          }
          if (classesToAdd.length > 0 && typeof element.classList.add === 'function') {
            element.classList.add(...classesToAdd);
          }
        }
      } catch (elementError) {
        console.warn('Error applying classes to element:', elementError);
      }
    });

    return true;
  } catch (error) {
    console.warn(`Error applying classes to selector ${selector}:`, error);
    return false;
  }
}

/**
 * Safely accesses session storage
 */
export function safeSessionStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => boolean;
} {
  return {
    getItem: (key: string) => {
      try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem) {
          return sessionStorage.getItem(key);
        }
      } catch (error) {
        console.warn('Error accessing session storage getItem:', error);
      }
      return null;
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage.setItem) {
          sessionStorage.setItem(key, value);
          return true;
        }
      } catch (error) {
        console.warn('Error accessing session storage setItem:', error);
      }
      return false;
    }
  };
}

/**
 * Safely detects current time of day
 */
export function safelyDetectTimeOfDay(): SafeEnvironmentalContext['timeOfDay'] {
  try {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  } catch (error) {
    console.warn('Error detecting time of day:', error);
    return 'morning';
  }
}

/**
 * Safely detects user activity
 */
export function safelyDetectActivity(): SafeEnvironmentalContext['activity'] {
  try {
    const url = window?.location?.pathname || '';
    const activeElement = document?.activeElement;
    
    if (url.includes('editor') || activeElement?.tagName === 'TEXTAREA' || 
        activeElement?.hasAttribute('contenteditable')) {
      return 'writing';
    }
    if (url.includes('analytics') || url.includes('dashboard')) {
      return 'analytics';
    }
    if (document.querySelector('.article-view, .reading-mode')) {
      return 'reading';
    }
    return 'browsing';
  } catch (error) {
    console.warn('Error detecting activity:', error);
    return 'browsing';
  }
}

/**
 * Error boundary wrapper for quantum color functions
 */
export function withQuantumColorSafety<T extends any[], R>(
  fn: (...args: T) => R,
  errorMessage: string = 'Quantum color operation failed'
): (...args: T) => R | null {
  return (...args: T) => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn(`${errorMessage}:`, error);
      return null;
    }
  };
}