// Quick import check script
try {
  console.log('Checking import paths...');
  
  // Test critical import paths that were causing issues
  const tests = [
    () => require('./src/components/common/SafeIcon.tsx'),
    () => require('./src/SimpleApp.tsx'),
  ];
  
  tests.forEach((test, index) => {
    try {
      test();
      console.log(`✅ Test ${index + 1} passed`);
    } catch (error) {
      console.log(`❌ Test ${index + 1} failed:`, error.message);
    }
  });
  
} catch (error) {
  console.error('Critical error:', error.message);
}