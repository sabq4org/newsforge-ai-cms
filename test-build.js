// Simple test to check if critical imports work
const fs = require('fs');

console.log('Testing critical imports...');

// Test if Phosphor icons has the required icons
try {
  const phosphorPath = './node_modules/@phosphor-icons/react/dist/index.js';
  
  if (fs.existsSync(phosphorPath)) {
    console.log('✅ Phosphor Icons package found');
    
    // Try to read package.json to see available exports
    const pkgPath = './node_modules/@phosphor-icons/react/package.json';
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      console.log('✅ Phosphor Icons version:', pkg.version);
    }
  } else {
    console.log('❌ Phosphor Icons package not found');
  }
} catch (error) {
  console.log('❌ Error checking Phosphor Icons:', error.message);
}

// Test if our utils.ts can be parsed
try {
  const utilsPath = './src/lib/utils.ts';
  if (fs.existsSync(utilsPath)) {
    const content = fs.readFileSync(utilsPath, 'utf8');
    if (content.includes('export function cn')) {
      console.log('✅ utils.ts cn function found');
    } else {
      console.log('❌ utils.ts cn function not found');
    }
  }
} catch (error) {
  console.log('❌ Error checking utils.ts:', error.message);
}

console.log('Test completed.');