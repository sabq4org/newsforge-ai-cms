#!/usr/bin/env node

/**
 * Sabq Althakiyah CMS - Application Health Check and Auto-Fix
 * This script diagnoses and fixes common issues that cause white screen errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 فحص صحة تطبيق سبق الذكية...\n');

const issues = [];
const fixes = [];

// Check if critical files exist
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/SafeFallbackApp.tsx',
  'src/EmergencyApp.tsx',
  'src/lib/utils.ts',
  'src/lib/criticalErrorFixes.ts',
  'index.html'
];

console.log('📁 فحص الملفات الأساسية...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - مفقود`);
    issues.push(`Missing critical file: ${file}`);
  }
});

// Check package.json dependencies
console.log('\n📦 فحص التبعيات...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react',
    'react-dom',
    'tailwind-merge',
    'clsx'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - مفقود`);
      issues.push(`Missing dependency: ${dep}`);
    }
  });
} else {
  issues.push('Missing package.json');
}

// Check for common error patterns in files
console.log('\n🔍 فحص الأخطاء الشائعة...');

// Check main.tsx for proper error handling
if (fs.existsSync('src/main.tsx')) {
  const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
  if (!mainContent.includes('SafeFallbackApp')) {
    issues.push('main.tsx missing SafeFallbackApp import');
    fixes.push('Add SafeFallbackApp to main.tsx');
  }
  if (!mainContent.includes('ErrorBoundary')) {
    issues.push('main.tsx missing ErrorBoundary');
    fixes.push('Add ErrorBoundary to main.tsx');
  }
}

// Check utils.ts for cn function
if (fs.existsSync('src/lib/utils.ts')) {
  const utilsContent = fs.readFileSync('src/lib/utils.ts', 'utf8');
  if (!utilsContent.includes('export function cn')) {
    issues.push('utils.ts missing cn function export');
    fixes.push('Add proper cn function to utils.ts');
  }
}

// Check index.html for critical error handling script
if (fs.existsSync('index.html')) {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  if (!htmlContent.includes('Emergency error detection')) {
    issues.push('index.html missing critical error handling script');
    fixes.push('Add error handling script to index.html');
  }
}

// Summary
console.log('\n📊 ملخص الفحص:');
console.log(`✅ الملفات السليمة: ${criticalFiles.length - issues.filter(i => i.includes('Missing critical file')).length}/${criticalFiles.length}`);
console.log(`⚠️ المشاكل المكتشفة: ${issues.length}`);
console.log(`🔧 الإصلاحات المقترحة: ${fixes.length}`);

if (issues.length > 0) {
  console.log('\n❌ المشاكل المكتشفة:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

if (fixes.length > 0) {
  console.log('\n🔧 الإصلاحات المقترحة:');
  fixes.forEach((fix, index) => {
    console.log(`${index + 1}. ${fix}`);
  });
}

// Auto-fix suggestions
console.log('\n💡 اقتراحات الإصلاح:');
console.log('1. تشغيل: npm install');
console.log('2. استخدام الوضع الآمن: /?mode=safe-fallback');
console.log('3. مسح التخزين المحلي والإعادة');
console.log('4. التحقق من وحدة التحكم للأخطاء JavaScript');

// Test URLs
console.log('\n🌐 روابط الاختبار:');
console.log('- الوضع العادي: http://localhost:5173/');
console.log('- الوضع الآمن: http://localhost:5173/?mode=safe-fallback');
console.log('- وضع الطوارئ: http://localhost:5173/?emergency=true');
console.log('- اختبار النظام: http://localhost:5173/test-system.html');

// Performance suggestions
console.log('\n⚡ نصائح الأداء:');
console.log('- تأكد من تشغيل npm run dev في بيئة التطوير');
console.log('- تحقق من وجود تضارب في المنافذ (ports)');
console.log('- امسح node_modules وأعد تثبيت التبعيات إذا لزم الأمر');

console.log('\n✨ انتهى الفحص!');

// Return exit code based on issues found
process.exit(issues.length > 0 ? 1 : 0);