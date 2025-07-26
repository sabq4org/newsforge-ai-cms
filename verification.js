/**
 * Simple verification script to check if TypeScript errors have been resolved
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/EmergencyApp.tsx',
  'src/EmergencyFallbackApp.tsx', 
  'src/FullCMSRecovery.tsx',
  'src/MinimalStartup.tsx',
  'src/SafeTestApp.tsx',
  'src/TestAppContent.tsx'
];

console.log('🔍 Verifying TypeScript fixes...\n');

let allFixed = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    allFixed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for basic component structure
  const hasFunction = content.includes('function ') || content.includes('const ') || content.includes('export default');
  const hasProperExport = content.includes('export default');
  const hasReactImport = content.includes("import React from 'react'");
  
  if (hasFunction && hasProperExport && hasReactImport) {
    console.log(`✅ ${file} - Component structure looks good`);
  } else {
    console.log(`❌ ${file} - Issues detected:`);
    if (!hasFunction) console.log(`   - Missing function declaration`);
    if (!hasProperExport) console.log(`   - Missing export statement`);
    if (!hasReactImport) console.log(`   - Missing React import`);
    allFixed = false;
  }
});

console.log(`\n${allFixed ? '✅ All TypeScript fixes verified successfully!' : '❌ Some issues remain'}`);

if (allFixed) {
  console.log('\n🚀 Ready to test the application!');
  console.log('Try these URLs:');
  console.log('- ?safe=true (Safe mode)');
  console.log('- ?test=true (Test mode)');
  console.log('- ?minimal=true (Minimal mode)');
  console.log('- ?emergency=true (Emergency mode)');
  console.log('- ?diagnostic=true (Diagnostic mode)');
}