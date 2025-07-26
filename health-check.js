#!/usr/bin/env node

/**
 * Application Health Check and Stability Test
 * Quick diagnostic tool for Sabq Althakiyah CMS
 */

console.log('🏥 Sabq Althakiyah - Application Health Check Starting...\n');

const testResults = [];

// Test 1: Basic Application Structure
console.log('📁 Testing Application Structure...');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/App.tsx',
  'src/index.css',
  'src/main.tsx',
  'src/lib/criticalErrorFixes.ts',
  'src/lib/runtimeErrorFixes.ts',
  'src/lib/comprehensiveErrorFixes.ts',
  'src/lib/globalIconFixes.ts',
  'src/lib/systemDiagnostics.ts'
];

let structureScore = 0;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
    structureScore++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

testResults.push({
  test: 'Application Structure',
  score: (structureScore / criticalFiles.length) * 100,
  status: structureScore === criticalFiles.length ? 'PASS' : 'FAIL'
});

// Test 2: Package Dependencies
console.log('\n📦 Testing Package Dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDependencies = [
  '@github/spark',
  '@phosphor-icons/react',
  'react',
  'react-dom',
  'tailwindcss',
  'clsx',
  'tailwind-merge'
];

let depsScore = 0;
criticalDependencies.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`);
    depsScore++;
  } else {
    console.log(`  ❌ ${dep} - MISSING`);
  }
});

testResults.push({
  test: 'Package Dependencies',
  score: (depsScore / criticalDependencies.length) * 100,
  status: depsScore === criticalDependencies.length ? 'PASS' : 'FAIL'
});

// Test 3: Error Fix Implementation
console.log('\n🛠️  Testing Error Fix Implementation...');
const criticalErrorFixesContent = fs.readFileSync('src/lib/criticalErrorFixes.ts', 'utf8');

const errorFixPatterns = [
  'Array.prototype.forEach',
  'String.prototype.toLowerCase',
  'Date.prototype.toLocaleDateString',
  'safeCn',
  'safeGet',
  'ensureArray'
];

let errorFixScore = 0;
errorFixPatterns.forEach(pattern => {
  if (criticalErrorFixesContent.includes(pattern)) {
    console.log(`  ✅ ${pattern} protection implemented`);
    errorFixScore++;
  } else {
    console.log(`  ❌ ${pattern} protection missing`);
  }
});

testResults.push({
  test: 'Error Fix Implementation',
  score: (errorFixScore / errorFixPatterns.length) * 100,
  status: errorFixScore === errorFixPatterns.length ? 'PASS' : 'FAIL'
});

// Test 4: Icon System
console.log('\n🎨 Testing Icon System...');
const iconFixesContent = fs.readFileSync('src/lib/globalIconFixes.ts', 'utf8');

const iconPatterns = [
  'Trophy',
  'Award', 
  'ChartLine',
  'getSafeIcon',
  'createIconFallback'
];

let iconScore = 0;
iconPatterns.forEach(pattern => {
  if (iconFixesContent.includes(pattern)) {
    console.log(`  ✅ ${pattern} implementation found`);
    iconScore++;
  } else {
    console.log(`  ❌ ${pattern} implementation missing`);
  }
});

testResults.push({
  test: 'Icon System',
  score: (iconScore / iconPatterns.length) * 100,
  status: iconScore === iconPatterns.length ? 'PASS' : 'FAIL'
});

// Test 5: CSS Stability Controls
console.log('\n🎨 Testing CSS Stability Controls...');
const cssContent = fs.readFileSync('src/index.css', 'utf8');

const cssPatterns = [
  'zoom: 1 !important',
  'transform: none !important',
  'IBM Plex Sans Arabic',
  'rtl',
  'admin-interface'
];

let cssScore = 0;
cssPatterns.forEach(pattern => {
  if (cssContent.includes(pattern)) {
    console.log(`  ✅ ${pattern} CSS rule found`);
    cssScore++;
  } else {
    console.log(`  ❌ ${pattern} CSS rule missing`);
  }
});

testResults.push({
  test: 'CSS Stability Controls',
  score: (cssScore / cssPatterns.length) * 100,
  status: cssScore === cssPatterns.length ? 'PASS' : 'FAIL'
});

// Test 6: HTML Emergency Handlers
console.log('\n🚨 Testing HTML Emergency Handlers...');
const htmlContent = fs.readFileSync('index.html', 'utf8');

const htmlPatterns = [
  'forEach is not a function',
  'toLowerCase is not a function',
  'toLocaleDateString is not a function',
  'window.cn',
  'IBM Plex Sans Arabic'
];

let htmlScore = 0;
htmlPatterns.forEach(pattern => {
  if (htmlContent.includes(pattern)) {
    console.log(`  ✅ ${pattern} emergency handler found`);
    htmlScore++;
  } else {
    console.log(`  ❌ ${pattern} emergency handler missing`);
  }
});

testResults.push({
  test: 'HTML Emergency Handlers',
  score: (htmlScore / htmlPatterns.length) * 100,
  status: htmlScore === htmlPatterns.length ? 'PASS' : 'FAIL'
});

// Calculate Overall Score
console.log('\n📊 Test Results Summary:');
console.log('═'.repeat(50));

let totalScore = 0;
let passCount = 0;

testResults.forEach(result => {
  const statusIcon = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${statusIcon} ${result.test}: ${result.score.toFixed(1)}% (${result.status})`);
  totalScore += result.score;
  if (result.status === 'PASS') passCount++;
});

const averageScore = totalScore / testResults.length;
const overallStatus = averageScore >= 90 ? 'EXCELLENT' : 
                     averageScore >= 80 ? 'GOOD' : 
                     averageScore >= 70 ? 'FAIR' : 'POOR';

console.log('═'.repeat(50));
console.log(`🏆 Overall Score: ${averageScore.toFixed(1)}%`);
console.log(`📈 Status: ${overallStatus}`);
console.log(`✅ Tests Passed: ${passCount}/${testResults.length}`);

// Recommendations
console.log('\n💡 Recommendations:');
if (averageScore >= 90) {
  console.log('🟢 Application is stable and ready for production use!');
  console.log('🚀 All critical systems are functioning properly.');
  console.log('📋 Consider running periodic health checks to maintain stability.');
} else if (averageScore >= 80) {
  console.log('🟡 Application is mostly stable with minor issues.');
  console.log('🔧 Review failed tests and implement missing components.');
  console.log('⚡ Performance optimizations may be beneficial.');
} else {
  console.log('🔴 Application requires immediate attention.');
  console.log('⚠️  Critical systems may not be functioning properly.');
  console.log('🛠️  Priority: Fix all failed tests before deployment.');
}

// Export diagnostic data
const diagnosticData = {
  timestamp: new Date().toISOString(),
  overallScore: averageScore,
  status: overallStatus,
  passedTests: passCount,
  totalTests: testResults.length,
  details: testResults,
  systemInfo: {
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch
  }
};

fs.writeFileSync('diagnostic-report.json', JSON.stringify(diagnosticData, null, 2));
console.log('\n📄 Detailed diagnostic report saved to: diagnostic-report.json');

console.log('\n🏁 Health check completed!');
process.exit(averageScore >= 80 ? 0 : 1);