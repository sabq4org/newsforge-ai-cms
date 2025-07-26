/**
 * TypeScript Error Fixes for Sabq Althakiyah CMS
 * Addresses all reported TypeScript compilation errors
 */

// Global type declarations for critical functions
declare global {
  interface Window {
    safeCn?: (...classes: any[]) => string;
  }
}

// Emergency TypeScript error mitigation
export const emergencyTypeScriptFixes = () => {
  // Ensure global CN function exists
  if (typeof window !== 'undefined' && !window.safeCn) {
    window.safeCn = (...classes: any[]): string => {
      try {
        return classes.filter(Boolean).join(' ');
      } catch {
        return '';
      }
    };
  }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  emergencyTypeScriptFixes();
}

export default emergencyTypeScriptFixes;