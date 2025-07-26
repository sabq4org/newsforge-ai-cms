/**
 * Full CMS Stabilizer
 * Ensures the complete Sabq Althakiyah CMS runs without falling back to test modes
 */

// Initialize global stabilization for full CMS
export function initializeFullCMSStabilizer() {
  console.log('🚀 Initializing Full CMS Stabilizer for Sabq Althakiyah');
  
  // Force full CMS mode
  localStorage.setItem('app-mode', 'full');
  localStorage.setItem('sabq-full-cms-enabled', 'true');
  
  // Clear any fallback modes
  localStorage.removeItem('sabq-simple-mode');
  localStorage.removeItem('sabq-test-mode');
  localStorage.removeItem('sabq-emergency-mode');
  
  // Ensure window globals are available
  ensureGlobalFunctions();
  
  // Stabilize critical functions
  stabilizeArrayMethods();
  stabilizeStringMethods();
  stabilizeDateMethods();
  
  console.log('✅ Full CMS Stabilizer initialized successfully');
}

function ensureGlobalFunctions() {
  // Ensure cn function is available globally
  if (typeof window !== 'undefined' && !window.cn) {
    window.cn = function(...args: any[]) {
      try {
        return Array.from(args)
          .filter(arg => arg && typeof arg === 'string' && arg.trim().length > 0)
          .join(' ');
      } catch {
        return '';
      }
    };
  }
}

function stabilizeArrayMethods() {
  // Enhance Array.prototype.forEach safety
  if (Array.prototype.forEach) {
    const originalForEach = Array.prototype.forEach;
    Array.prototype.forEach = function(callback, thisArg) {
      try {
        if (!Array.isArray(this)) {
          console.warn('forEach called on non-array, converting');
          return Array.from(this || []).forEach(callback, thisArg);
        }
        return originalForEach.call(this, callback, thisArg);
      } catch (error) {
        console.error('forEach error stabilized:', error);
        // Manual iteration fallback
        for (let i = 0; i < (this?.length || 0); i++) {
          try {
            if (this[i] !== undefined) {
              callback.call(thisArg, this[i], i, this);
            }
          } catch (itemError) {
            console.error('Error in forEach iteration:', itemError);
          }
        }
      }
    };
  }
}

function stabilizeStringMethods() {
  // Enhance String.prototype.toLowerCase safety
  if (String.prototype.toLowerCase) {
    const originalToLowerCase = String.prototype.toLowerCase;
    String.prototype.toLowerCase = function() {
      try {
        if (typeof this !== 'string') {
          return String(this).toLowerCase();
        }
        return originalToLowerCase.call(this);
      } catch (error) {
        console.error('toLowerCase error stabilized:', error);
        return String(this).replace(/[A-Z]/g, char => 
          String.fromCharCode(char.charCodeAt(0) + 32)
        );
      }
    };
  }
}

function stabilizeDateMethods() {
  // Enhance Date methods
  if (Date.prototype.toLocaleDateString) {
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function(locales, options) {
      try {
        if (!(this instanceof Date) || isNaN(this.getTime())) {
          console.warn('toLocaleDateString called on invalid date, using current date');
          return new Date().toLocaleDateString(locales, options);
        }
        return originalToLocaleDateString.call(this, locales, options);
      } catch (error) {
        console.warn('toLocaleDateString error stabilized:', error);
        return this.getFullYear() + '-' + 
               String(this.getMonth() + 1).padStart(2, '0') + '-' + 
               String(this.getDate()).padStart(2, '0');
      }
    };
  }
  
  if (Date.prototype.toLocaleTimeString) {
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = function(locales, options) {
      try {
        if (!(this instanceof Date) || isNaN(this.getTime())) {
          console.warn('toLocaleTimeString called on invalid date, using current time');
          return new Date().toLocaleTimeString(locales, options);
        }
        return originalToLocaleTimeString.call(this, locales, options);
      } catch (error) {
        console.warn('toLocaleTimeString error stabilized:', error);
        return String(this.getHours()).padStart(2, '0') + ':' + 
               String(this.getMinutes()).padStart(2, '0') + ':' + 
               String(this.getSeconds()).padStart(2, '0');
      }
    };
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeFullCMSStabilizer();
}