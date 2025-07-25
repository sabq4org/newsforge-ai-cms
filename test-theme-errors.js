// Simple test script to check for potential theme-related errors
const fs = require('fs');
const path = require('path');

// Test function to check for potential undefined color access patterns
function checkForUndefinedColorAccess(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for .colors. access without optional chaining
  const colorAccessPattern = /(\w+)\.colors\.(\w+)/g;
  let match;
  
  while ((match = colorAccessPattern.exec(content)) !== null) {
    const varName = match[1];
    const colorProp = match[2];
    const line = content.substring(0, match.index).split('\n').length;
    
    // Check if it's already using optional chaining
    const beforeMatch = content.substring(Math.max(0, match.index - 10), match.index);
    if (!beforeMatch.includes('?.colors')) {
      issues.push({
        file: filePath,
        line: line,
        variable: varName,
        property: colorProp,
        pattern: match[0]
      });
    }
  }
  
  return issues;
}

// Scan all TypeScript and TSX files in src directory
function scanDirectory(dir) {
  const allIssues = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      allIssues.push(...scanDirectory(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      allIssues.push(...checkForUndefinedColorAccess(filePath));
    }
  }
  
  return allIssues;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const issues = scanDirectory(srcDir);

if (issues.length === 0) {
  console.log('✅ No potential undefined color access patterns found!');
} else {
  console.log(`❌ Found ${issues.length} potential issues:`);
  issues.forEach(issue => {
    console.log(`  - ${issue.file}:${issue.line} - ${issue.pattern}`);
  });
}

// Also check the themePresets to ensure they all have valid colors
try {
  const themeContextPath = path.join(srcDir, 'contexts', 'ThemeContext.tsx');
  const themeContextContent = fs.readFileSync(themeContextPath, 'utf8');
  
  // Look for themePresets definition
  const presetMatch = themeContextContent.match(/export const themePresets[\s\S]*?(?=\];)/);
  if (presetMatch) {
    const presetContent = presetMatch[0];
    const colorCount = (presetContent.match(/colors:/g) || []).length;
    console.log(`✅ Found ${colorCount} theme presets with colors defined`);
  }
} catch (error) {
  console.log('❌ Error checking theme presets:', error.message);
}