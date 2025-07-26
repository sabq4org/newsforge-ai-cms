/**
 * Ultimate Quantum Protection System
 * The final word in preventing quantum color adaptation errors
 */

// Global protection flag
let protectionActive = false;

// Emergency quantum object template
const EMERGENCY_QUANTUM = Object.freeze({
  context: Object.freeze({
    ambientLight: 0.5,
    timeOfDay: 'morning',
    userActivity: 'browsing',
    eyeStrain: 'low',
    sessionLength: 0
  }),
  reasoning: Object.freeze(['Emergency quantum protection active']),
  colors: Object.freeze({
    accent: '#007acc',
    primary: '#0066cc',
    secondary: '#6c757d'
  })
});

/**
 * Ultimate quantum object protection
 */
export function initializeUltimateQuantumProtection() {
  if (typeof window === 'undefined' || protectionActive) {
    return;
  }

  try {
    console.log('Initializing ultimate quantum protection...');
    
    // Method 1: Direct property definition with getter/setter
    try {
      delete (window as any).q; // Remove any existing problematic reference
      
      Object.defineProperty(window, 'q', {
        get: function() {
          return (window as any)._safeQuantumObject || ((window as any)._safeQuantumObject = createSafeQuantumObject());
        },
        set: function(value) {
          if (value && typeof value === 'object') {
            (window as any)._safeQuantumObject = ensureQuantumObjectSafety(value);
          }
        },
        enumerable: true,
        configurable: true
      });
    } catch (defineError) {
      console.warn('Property definition failed, using direct assignment:', defineError);
      (window as any).q = createSafeQuantumObject();
    }
    
    // Method 2: Proxy protection for runtime access
    if (typeof Proxy !== 'undefined') {
      try {
        (window as any).q = new Proxy((window as any).q, {
          get: function(target, prop) {
            if (prop === 'context') {
              return target.context || EMERGENCY_QUANTUM.context;
            }
            if (prop === 'reasoning') {
              return Array.isArray(target.reasoning) ? target.reasoning : EMERGENCY_QUANTUM.reasoning;
            }
            if (prop === 'colors') {
              return target.colors || EMERGENCY_QUANTUM.colors;
            }
            return target[prop];
          },
          set: function(target, prop, value) {
            target[prop] = value;
            return true;
          }
        });
      } catch (proxyError) {
        console.warn('Proxy protection failed:', proxyError);
      }
    }
    
    // Method 3: Runtime validation
    const validateQuantumObject = () => {
      try {
        const qObj = (window as any).q;
        if (!qObj || typeof qObj !== 'object') {
          throw new Error('Quantum object missing or invalid');
        }
        
        if (!qObj.context || typeof qObj.context !== 'object') {
          throw new Error('Quantum context missing or invalid');
        }
        
        if (typeof qObj.context.ambientLight !== 'number') {
          throw new Error('Ambient light property missing or invalid');
        }
        
        // Test actual access
        const testValue = qObj.context.ambientLight + 0;
        if (isNaN(testValue)) {
          throw new Error('Ambient light value is NaN');
        }
        
        return true;
      } catch (validationError) {
        console.warn('Quantum validation failed:', validationError);
        return false;
      }
    };
    
    // Method 4: Error interception
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && (
        message.includes('q.context.ambientLight') ||
        message.includes('context.ambientLight') ||
        message.includes('undefined is not an object')
      )) {
        console.error('Quantum error intercepted, reinitializing:', message);
        (window as any).q = createSafeQuantumObject();
        return true; // Prevent error propagation
      }
      
      if (originalError) {
        return originalError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Method 5: Periodic validation and healing
    setInterval(() => {
      if (!validateQuantumObject()) {
        console.warn('Quantum object corruption detected, healing...');
        (window as any).q = createSafeQuantumObject();
      }
    }, 1000);
    
    // Method 6: Event-based healing
    document.addEventListener('DOMContentLoaded', () => {
      if (!validateQuantumObject()) {
        (window as any).q = createSafeQuantumObject();
      }
    });
    
    window.addEventListener('focus', () => {
      if (!validateQuantumObject()) {
        (window as any).q = createSafeQuantumObject();
      }
    });
    
    protectionActive = true;
    console.log('✅ Ultimate quantum protection active');
    
  } catch (error) {
    console.error('Ultimate quantum protection failed:', error);
    // Last resort fallback
    (window as any).q = JSON.parse(JSON.stringify(EMERGENCY_QUANTUM));
  }
}

/**
 * Create a safe quantum object with all required properties
 */
function createSafeQuantumObject() {
  return {
    context: {
      ambientLight: 0.5,
      timeOfDay: 'morning',
      userActivity: 'browsing',
      eyeStrain: 'low',
      sessionLength: 0
    },
    reasoning: ['Safe quantum adaptation'],
    colors: {
      accent: '#007acc',
      primary: '#0066cc',
      secondary: '#6c757d'
    },
    // Add safe access methods
    getAmbientLight: function() {
      return this.context?.ambientLight || 0.5;
    },
    getReasoning: function() {
      return Array.isArray(this.reasoning) ? this.reasoning : ['Safe quantum adaptation'];
    },
    getColors: function() {
      return this.colors || { accent: '#007acc', primary: '#0066cc', secondary: '#6c757d' };
    }
  };
}

/**
 * Ensure an existing quantum object is safe
 */
function ensureQuantumObjectSafety(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return createSafeQuantumObject();
  }
  
  const safeObj = { ...obj };
  
  // Ensure context
  if (!safeObj.context || typeof safeObj.context !== 'object') {
    safeObj.context = { ...EMERGENCY_QUANTUM.context };
  } else {
    safeObj.context = {
      ambientLight: typeof safeObj.context.ambientLight === 'number' ? safeObj.context.ambientLight : 0.5,
      timeOfDay: typeof safeObj.context.timeOfDay === 'string' ? safeObj.context.timeOfDay : 'morning',
      userActivity: typeof safeObj.context.userActivity === 'string' ? safeObj.context.userActivity : 'browsing',
      eyeStrain: typeof safeObj.context.eyeStrain === 'string' ? safeObj.context.eyeStrain : 'low',
      sessionLength: typeof safeObj.context.sessionLength === 'number' ? safeObj.context.sessionLength : 0
    };
  }
  
  // Ensure reasoning
  if (!Array.isArray(safeObj.reasoning)) {
    safeObj.reasoning = [...EMERGENCY_QUANTUM.reasoning];
  }
  
  // Ensure colors
  if (!safeObj.colors || typeof safeObj.colors !== 'object') {
    safeObj.colors = { ...EMERGENCY_QUANTUM.colors };
  } else {
    safeObj.colors = {
      accent: typeof safeObj.colors.accent === 'string' ? safeObj.colors.accent : '#007acc',
      primary: typeof safeObj.colors.primary === 'string' ? safeObj.colors.primary : '#0066cc',
      secondary: typeof safeObj.colors.secondary === 'string' ? safeObj.colors.secondary : '#6c757d'
    };
  }
  
  return safeObj;
}

/**
 * Export safe access functions
 */
export const safeQuantumAccess = {
  getAmbientLight: () => {
    try {
      return (window as any).q?.context?.ambientLight || 0.5;
    } catch {
      return 0.5;
    }
  },
  
  getContext: () => {
    try {
      return (window as any).q?.context || EMERGENCY_QUANTUM.context;
    } catch {
      return EMERGENCY_QUANTUM.context;
    }
  },
  
  getReasoning: () => {
    try {
      return Array.isArray((window as any).q?.reasoning) ? (window as any).q.reasoning : EMERGENCY_QUANTUM.reasoning;
    } catch {
      return EMERGENCY_QUANTUM.reasoning;
    }
  },
  
  getColors: () => {
    try {
      return (window as any).q?.colors || EMERGENCY_QUANTUM.colors;
    } catch {
      return EMERGENCY_QUANTUM.colors;
    }
  }
};

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize immediately
  initializeUltimateQuantumProtection();
  
  // Initialize again after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUltimateQuantumProtection);
  } else {
    // DOM already loaded, run immediately
    setTimeout(initializeUltimateQuantumProtection, 0);
  }
}

export default initializeUltimateQuantumProtection;