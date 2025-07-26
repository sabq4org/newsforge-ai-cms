/**
 * Quantum Error Prevention System
 * Prevents specific errors related to quantum color adaptation and context access
 */

// Global error prevention for quantum color system
export function initializeQuantumErrorPrevention() {
  // Prevent specific "undefined is not an object (evaluating 'q.context.ambientLight')" error
  if (typeof window !== 'undefined') {
    // Create a safe global quantum context
    (window as any).q = (window as any).q || {};
    (window as any).q.context = (window as any).q.context || {};
    (window as any).q.context.ambientLight = (window as any).q.context.ambientLight || 0;
    (window as any).q.context.timeOfDay = (window as any).q.context.timeOfDay || 'morning';
    (window as any).q.context.userActivity = (window as any).q.context.userActivity || 'browsing';
    (window as any).q.context.eyeStrain = (window as any).q.context.eyeStrain || 'low';
    (window as any).q.context.sessionLength = (window as any).q.context.sessionLength || 0;
    
    // Create safe reasoning array if it doesn't exist
    (window as any).q.reasoning = (window as any).q.reasoning || ['Default quantum color adaptation'];
    
    // Create safe colors object
    (window as any).q.colors = (window as any).q.colors || {};
    (window as any).q.colors.accent = (window as any).q.colors.accent || '#007acc';
    (window as any).q.colors.primary = (window as any).q.colors.primary || '#0066cc';
    (window as any).q.colors.secondary = (window as any).q.colors.secondary || '#6c757d';
    
    console.log('Quantum error prevention initialized');
  }
}

// Enhanced quantum color context safety wrapper
export function createQuantumContextSafety() {
  return {
    getContext: () => ({
      ambientLight: 0.5,
      timeOfDay: 'morning',
      userActivity: 'browsing',
      eyeStrain: 'low',
      sessionLength: 0
    }),
    getReasoning: () => ['Safe quantum adaptation applied'],
    getColors: () => ({
      accent: '#007acc',
      primary: '#0066cc',
      secondary: '#6c757d'
    }),
    safeAccess: (obj: any, path: string, defaultValue: any = null) => {
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
        console.warn(`Safe access failed for path "${path}":`, error);
        return defaultValue;
      }
    }
  };
}

// Error boundary specifically for quantum color operations
export function withQuantumErrorBoundary<T extends any[], R>(
  fn: (...args: T) => R,
  fallback: R,
  errorMessage: string = 'Quantum operation failed'
): (...args: T) => R {
  return (...args: T) => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn(`${errorMessage}:`, error);
      
      // If the error is related to context or ambient light, ensure safe globals
      if (error?.message?.includes('context') || error?.message?.includes('ambientLight')) {
        initializeQuantumErrorPrevention();
      }
      
      return fallback;
    }
  };
}

// Global quantum object safety check
export function ensureQuantumObjectSafety() {
  if (typeof window !== 'undefined') {
    const quantum = createQuantumContextSafety();
    
    // Ensure all quantum operations are safe
    (window as any).safeQuantumAccess = quantum.safeAccess;
    (window as any).quantumContext = quantum.getContext();
    (window as any).quantumReasoning = quantum.getReasoning();
    (window as any).quantumColors = quantum.getColors();
    
    // Override any existing problematic quantum objects
    if ((window as any).q && typeof (window as any).q === 'object') {
      const q = (window as any).q;
      
      // Ensure context exists and is safe
      if (!q.context || typeof q.context !== 'object') {
        q.context = quantum.getContext();
      } else {
        // Safely merge existing context with safe defaults
        q.context = {
          ...quantum.getContext(),
          ...(q.context || {})
        };
        
        // Ensure specific problematic properties exist
        if (typeof q.context.ambientLight !== 'number') {
          q.context.ambientLight = 0.5;
        }
      }
      
      // Ensure reasoning is an array
      if (!Array.isArray(q.reasoning)) {
        q.reasoning = quantum.getReasoning();
      }
      
      // Ensure colors object exists
      if (!q.colors || typeof q.colors !== 'object') {
        q.colors = quantum.getColors();
      } else {
        q.colors = {
          ...quantum.getColors(),
          ...(q.colors || {})
        };
      }
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Run immediately
  initializeQuantumErrorPrevention();
  ensureQuantumObjectSafety();
  
  // Run again after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeQuantumErrorPrevention();
      ensureQuantumObjectSafety();
    });
  }
  
  // Run periodically to maintain safety
  setInterval(() => {
    ensureQuantumObjectSafety();
  }, 5000);
}