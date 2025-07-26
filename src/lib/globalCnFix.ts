/**
 * Global CN Function Fix for Sabq Althakiyah CMS
 * Provides a safe cn function that works without tailwind-merge dependencies
 */

// Enhanced safe class name utility with comprehensive error handling
function createSafeCn() {
  return function safeCn(...inputs: any[]): string {
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
          if (typeof input === 'object' && input !== null) {
            // Handle conditional classes object like { 'class': true, 'other': false }
            return Object.entries(input)
              .filter(([_, condition]) => Boolean(condition))
              .map(([className]) => String(className).trim())
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
  };
}

// Create the safe cn function
const safeCn = createSafeCn();

// Try to provide it globally for components that might need it
if (typeof window !== 'undefined') {
  try {
    // Register as global cn
    (window as any).cn = safeCn;
    
    // Also try to provide tailwind-merge compatibility
    (window as any).twMerge = safeCn;
    (window as any).clsx = safeCn;
    
    console.log('Global cn function registered successfully');
  } catch (error) {
    console.warn('Could not register global cn function:', error);
  }
}

// Export for use in modules
export { safeCn };
export const cn = safeCn;
export const twMerge = safeCn;
export const clsx = safeCn;

// Default export
export default safeCn;