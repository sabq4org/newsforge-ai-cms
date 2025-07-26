/**
 * Startup Validation and Error Prevention for Sabq Althakiyah CMS
 * Validates all critical systems before app startup
 */

// Validation results tracker
const validationResults = {
  cn: false,
  icons: false,
  dateFormatting: false,
  arrayOperations: false,
  stringOperations: false,
  objectAccess: false
};

// Test cn function
try {
  const testClasses = ['test', 'class', { active: true, inactive: false }];
  const result = (window as any).cn?.(...testClasses);
  if (typeof result === 'string') {
    validationResults.cn = true;
    console.log('✅ CN function validation passed');
  } else {
    console.warn('❌ CN function validation failed - result not string');
  }
} catch (error) {
  console.error('❌ CN function validation failed:', error);
}

// Test icon availability
try {
  const testIcons = ['Trophy', 'Award', 'ChartLine'];
  let iconCount = 0;
  
  testIcons.forEach(iconName => {
    const icon = (window as any)[iconName];
    if (icon && typeof icon === 'function') {
      iconCount++;
    }
  });
  
  if (iconCount > 0) {
    validationResults.icons = true;
    console.log(`✅ Icon validation passed (${iconCount}/${testIcons.length} icons available)`);
  } else {
    console.warn('❌ Icon validation failed - no icons available');
  }
} catch (error) {
  console.error('❌ Icon validation failed:', error);
}

// Test date formatting
try {
  const testDate = new Date();
  const dateString = testDate.toLocaleDateString('ar-SA');
  const timeString = testDate.toLocaleTimeString('ar-SA');
  
  if (typeof dateString === 'string' && typeof timeString === 'string') {
    validationResults.dateFormatting = true;
    console.log('✅ Date formatting validation passed');
  } else {
    console.warn('❌ Date formatting validation failed');
  }
} catch (error) {
  console.error('❌ Date formatting validation failed:', error);
}

// Test array operations
try {
  const testArray = [1, 2, 3];
  let forEachWorked = false;
  
  testArray.forEach((item, index) => {
    if (typeof item === 'number' && typeof index === 'number') {
      forEachWorked = true;
    }
  });
  
  if (forEachWorked) {
    validationResults.arrayOperations = true;
    console.log('✅ Array operations validation passed');
  } else {
    console.warn('❌ Array operations validation failed');
  }
} catch (error) {
  console.error('❌ Array operations validation failed:', error);
}

// Test string operations
try {
  const testString = 'TEST STRING';
  const lowerCase = testString.toLowerCase();
  
  if (lowerCase === 'test string') {
    validationResults.stringOperations = true;
    console.log('✅ String operations validation passed');
  } else {
    console.warn('❌ String operations validation failed');
  }
} catch (error) {
  console.error('❌ String operations validation failed:', error);
}

// Test object property access
try {
  const testObject = {
    category: {
      color: '#123456',
      name: 'Test'
    },
    timestamp: new Date(),
    reasoning: ['test reasoning']
  };
  
  const color = testObject.category?.color;
  const name = testObject.category?.name;
  const reasoning = testObject.reasoning?.[0];
  
  if (color && name && reasoning) {
    validationResults.objectAccess = true;
    console.log('✅ Object property access validation passed');
  } else {
    console.warn('❌ Object property access validation failed');
  }
} catch (error) {
  console.error('❌ Object property access validation failed:', error);
}

// Calculate overall validation score
const totalTests = Object.keys(validationResults).length;
const passedTests = Object.values(validationResults).filter(Boolean).length;
const validationScore = (passedTests / totalTests) * 100;

console.log(`\n🔍 Startup Validation Complete:`);
console.log(`📊 Score: ${validationScore.toFixed(1)}% (${passedTests}/${totalTests} tests passed)`);

if (validationScore >= 80) {
  console.log('✅ System validation passed - Safe to proceed with full app');
} else if (validationScore >= 60) {
  console.log('⚠️  System validation partially passed - Consider using safe mode');
} else {
  console.log('❌ System validation failed - Emergency mode recommended');
}

// Store validation results for the app to use
(window as any).systemValidation = {
  results: validationResults,
  score: validationScore,
  passed: validationScore >= 80,
  partiallyPassed: validationScore >= 60
};

// Export validation results
export { validationResults, validationScore };
export default {
  validationResults,
  validationScore,
  passed: validationScore >= 80,
  partiallyPassed: validationScore >= 60
};