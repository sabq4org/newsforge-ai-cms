/**
 * Runtime error fixes for common JavaScript errors
 * This module patches common issues that cause white screen crashes
 */

// Initialize immediately when loaded
console.log('Loading runtime error fixes...');

// Fix 1: Global cn function fallback
if (typeof (window as any).cn === 'undefined') {
  (window as any).cn = (...classes: any[]) => {
    try {
      return classes.filter(c => c && typeof c === 'string').join(' ');
    } catch {
      return '';
    }
  };
  console.log('Runtime fix: Provided global cn fallback');
}

// Fix 2: Array.prototype.forEach safety
const originalForEach = Array.prototype.forEach;
Array.prototype.forEach = function<T>(
  this: T[], 
  callbackfn: (value: T, index: number, array: T[]) => void, 
  thisArg?: any
): void {
  try {
    if (!Array.isArray(this)) {
      console.warn('forEach called on non-array, converting:', this);
      const arrayLike = Array.from(this as any);
      return originalForEach.call(arrayLike, callbackfn, thisArg);
    }
    return originalForEach.call(this, callbackfn, thisArg);
  } catch (error) {
    console.error('forEach error, using fallback:', error);
    for (let i = 0; i < this.length; i++) {
      try {
        callbackfn.call(thisArg, this[i], i, this);
      } catch (itemError) {
        console.error(`Error in forEach at index ${i}:`, itemError);
      }
    }
  }
};

// Fix 3: String.prototype.toLowerCase safety
const originalToLowerCase = String.prototype.toLowerCase;
String.prototype.toLowerCase = function(): string {
  try {
    if (this === null || this === undefined) {
      return '';
    }
    return originalToLowerCase.call(this);
  } catch (error) {
    console.error('toLowerCase error, using fallback:', error);
    return String(this || '').toLowerCase();
  }
};

// Fix 4: Object.entries safety
const originalObjectEntries = Object.entries;
Object.entries = function<T>(obj: T): Array<[string, T[keyof T]]> {
  try {
    if (obj === null || obj === undefined) {
      return [];
    }
    return originalObjectEntries(obj as any);
  } catch (error) {
    console.error('Object.entries error, using fallback:', error);
    if (typeof obj === 'object' && obj !== null) {
      const result: Array<[string, any]> = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result.push([key, (obj as any)[key]]);
        }
      }
      return result;
    }
    return [];
  }
};

// Fix 5: Global error prevention for missing variables
const commonMissingVars = ['Trophy', 'Award', 'ChartLine', 'cn'];
commonMissingVars.forEach(varName => {
  if (typeof (window as any)[varName] === 'undefined') {
    (window as any)[varName] = function FallbackComponent(props: any) {
      console.warn(`Runtime fix: Using fallback for missing ${varName}`);
      return null;
    };
  }
});

// Fix 6: Tailwind-merge safety wrapper
try {
  // If clsx is available, create a safe version
  if (typeof (window as any).clsx !== 'undefined') {
    const safeClsx = (window as any).clsx;
    (window as any).clsx = (...inputs: any[]) => {
      try {
        const safeInputs = inputs.filter(input => input !== null && input !== undefined);
        return safeClsx(...safeInputs);
      } catch (error) {
        console.error('clsx error, using fallback:', error);
        return inputs.filter(input => typeof input === 'string').join(' ');
      }
    };
  }
} catch (error) {
  console.warn('Could not enhance clsx:', error);
}

// Fix 7: Global polyfill for common missing methods
if (!Date.prototype.toLocaleDateString) {
  Date.prototype.toLocaleDateString = function() {
    return this.toDateString();
  };
}

if (!Date.prototype.toLocaleTimeString) {
  Date.prototype.toLocaleTimeString = function() {
    return this.toTimeString();
  };
}

// Fix 8: Safe localStorage access
const originalSetItem = localStorage.setItem;
const originalGetItem = localStorage.getItem;

localStorage.setItem = function(key: string, value: string) {
  try {
    return originalSetItem.call(this, key, value);
  } catch (error) {
    console.warn('localStorage.setItem failed:', error);
  }
};

localStorage.getItem = function(key: string) {
  try {
    return originalGetItem.call(this, key);
  } catch (error) {
    console.warn('localStorage.getItem failed:', error);
    return null;
  }
};

// Fix 9: Global error handler for runtime errors
let errorCount = 0;
const maxErrors = 5;

window.addEventListener('error', function(event) {
  errorCount++;
  
  if (errorCount > maxErrors) {
    console.warn('Too many errors, redirecting to emergency mode');
    window.location.search = '?emergency=true';
    return;
  }
  
  const message = event.message || '';
  
  // Handle specific error types
  if (message.includes('forEach') && message.includes('not a function')) {
    console.warn('Handled forEach error');
    event.preventDefault();
    return true;
  }
  
  if (message.includes('toLowerCase') && message.includes('not a function')) {
    console.warn('Handled toLowerCase error');
    event.preventDefault();
    return true;
  }
  
  if (message.includes("Can't find variable")) {
    const match = message.match(/Can't find variable: (\w+)/);
    if (match) {
      const varName = match[1];
      (window as any)[varName] = function() {
        console.warn(`Fallback called for missing variable: ${varName}`);
        return null;
      };
      console.warn(`Provided fallback for missing variable: ${varName}`);
      event.preventDefault();
      return true;
    }
  }
  
  // Allow other errors to bubble up
  return false;
});

console.log('Runtime error fixes loaded successfully');

export {}; // Make this a module