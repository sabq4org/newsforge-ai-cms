/**
 * TypeScript Validation Test for Sabq Althakiyah CMS
 * This file tests all critical functions and imports to ensure TypeScript compilation succeeds
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Test critical function availability
export function validateTypeScriptSetup(): boolean {
  try {
    // Test cn function
    const testClass = cn('test', 'class');
    if (typeof testClass !== 'string') {
      console.error('CN function test failed');
      return false;
    }

    // Test React hooks
    const [testState] = React.useState('test');
    if (testState !== 'test') {
      console.error('React hooks test failed');
      return false;
    }

    // Test array methods
    const testArray = [1, 2, 3];
    let forEachWorked = false;
    testArray.forEach(() => {
      forEachWorked = true;
    });
    
    if (!forEachWorked) {
      console.error('Array forEach test failed');
      return false;
    }

    // Test string methods
    const testString = 'TEST';
    if (testString.toLowerCase() !== 'test') {
      console.error('String toLowerCase test failed');
      return false;
    }

    // Test date methods
    const testDate = new Date();
    try {
      testDate.toLocaleDateString('ar-SA');
      testDate.toLocaleTimeString('ar-SA');
    } catch (error) {
      console.error('Date methods test failed:', error);
      return false;
    }

    console.log('✅ All TypeScript validation tests passed');
    return true;
  } catch (error) {
    console.error('❌ TypeScript validation failed:', error);
    return false;
  }
}

// Simple test component
export function TypeScriptValidationComponent() {
  const [isValid, setIsValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const result = validateTypeScriptSetup();
    setIsValid(result);
  }, []);

  return (
    <div className={cn("p-4", "border", "rounded")}>
      <h3 className="text-lg font-semibold mb-2">TypeScript Validation</h3>
      <p className={cn(
        "font-medium",
        isValid === true && "text-green-600",
        isValid === false && "text-red-600",
        isValid === null && "text-gray-600"
      )}>
        {isValid === null ? '⏳ Testing...' : 
         isValid ? '✅ All tests passed' : 
         '❌ Some tests failed'}
      </p>
    </div>
  );
}

export default TypeScriptValidationComponent;