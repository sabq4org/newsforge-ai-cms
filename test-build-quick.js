#!/usr/bin/env node

// Quick test for build issues
const fs = require('fs');

console.log('🔍 Quick Build Issue Check...');

// Check for duplicate exports
const duplicateExportCheck = () => {
  const authLoginForm = './src/components/auth/LoginForm.tsx';
  const membershipLoginForm = './src/components/membership/LoginForm.tsx';
  
  if (fs.existsSync(authLoginForm)) {
    const content = fs.readFileSync(authLoginForm, 'utf8');
    const exportCount = (content.match(/export.*LoginForm/g) || []).length;
    if (exportCount > 1) {
      console.log(`❌ Auth LoginForm has ${exportCount} exports`);
      return false;
    } else {
      console.log('✅ Auth LoginForm has single export');
    }
  }
  
  if (fs.existsSync(membershipLoginForm)) {
    const content = fs.readFileSync(membershipLoginForm, 'utf8');
    const exportCount = (content.match(/export.*LoginForm/g) || []).length;
    if (exportCount > 1) {
      console.log(`❌ Membership LoginForm has ${exportCount} exports`);
      return false;
    } else {
      console.log('✅ Membership LoginForm has single export');
    }
  }
  
  return true;
};

// Check App.tsx imports
const appImportCheck = () => {
  const appFile = './src/App.tsx';
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    // Check for proper naming import
    if (content.includes('LoginForm as MemberLoginForm')) {
      console.log('✅ App.tsx uses proper import aliasing');
      return true;
    } else if (content.includes('import { LoginForm }') && content.includes('from \'@/components/auth/LoginForm\'')) {
      console.log('⚠️  App.tsx imports auth LoginForm but needs membership aliasing');
      return false;
    }
  }
  return false;
};

// Check utils.ts
const utilsCheck = () => {
  const utilsFile = './src/lib/utils.ts';
  if (fs.existsSync(utilsFile)) {
    const content = fs.readFileSync(utilsFile, 'utf8');
    if (content.includes('export function cn')) {
      console.log('✅ utils.ts exports cn function');
      return true;
    } else {
      console.log('❌ utils.ts missing cn function export');
      return false;
    }
  }
  return false;
};

// Run checks
const duplicateOk = duplicateExportCheck();
const appOk = appImportCheck();
const utilsOk = utilsCheck();

if (duplicateOk && appOk && utilsOk) {
  console.log('🎉 All checks passed! Build should work now.');
} else {
  console.log('⚠️  Some issues remain. Check output above.');
}

console.log('Quick check completed.');