#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/components/media/MediaGenerator.tsx',
  'src/components/analysis/ComprehensiveDeepAnalysisModule.tsx',
  'src/components/analysis/DeepContentAnalysis.tsx',
  'src/components/articles/ArticleList.tsx',
  'src/components/categories/CategoryManager.tsx',
  'src/components/collaborative/CollaborativeManager.tsx',
  'src/components/loyalty/LoyaltySystem.tsx',
  'src/components/maintenance/SystemMaintenance.tsx',
  'src/components/optimization/PredictiveAnalytics.tsx',
  'src/components/optimization/ABTestingFramework.tsx',
  'src/components/recommendations/PersonalizedRecommendations.tsx',
  'src/components/recommendations/GenerativeAIRecommendationSystem.tsx',
  'src/components/membership/UserProfilePage.tsx',
  'src/components/membership/SmartRecommendationDashboard.tsx',
  'src/components/search/AISearch.tsx',
  'src/components/scheduling/SchedulingCalendar.tsx',
  'src/components/dashboard/RoleBasedDashboard.tsx',
  'src/components/moderation/ContentModeration.tsx',
  'src/components/notifications/NotificationPreferences.tsx',
  'src/components/notifications/SmartNotificationSystem.tsx',
  'src/components/analytics/ReadingBehaviorTracker.tsx',
  'src/components/analytics/UserBehaviorAnalytics.tsx',
  'src/components/analytics/PredictiveUserAnalytics.tsx',
  'src/components/analytics/CategoryAnalytics.tsx',
  'src/components/analytics/AnalyticsDashboard.tsx',
  'src/components/analytics/RealTimeAnalytics.tsx',
  'src/components/editor/EnhancedArticleEditor.tsx',
  'src/components/audio/AudioLibrary.tsx'
];

function fixDateInFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Add import if not present
  if (!content.includes('safeDateFormat') && !content.includes('safeTimeFormat')) {
    // Find the import section
    const importMatch = content.match(/from '@\/lib\/utils';?\s*$/m);
    if (importMatch) {
      content = content.replace(
        /from '@\/lib\/utils';?\s*$/m,
        match => match.replace(/;?\s*$/, ', safeDateFormat, safeTimeFormat;')
      );
      modified = true;
    } else {
      // Add new import if utils import doesn't exist
      const lastImport = content.match(/^import.*from.*;?\s*$/gm);
      if (lastImport && lastImport.length > 0) {
        const insertIndex = content.indexOf(lastImport[lastImport.length - 1]) + lastImport[lastImport.length - 1].length;
        content = content.slice(0, insertIndex) + 
                 `\nimport { safeDateFormat, safeTimeFormat } from '@/lib/utils';` + 
                 content.slice(insertIndex);
        modified = true;
      }
    }
  }
  
  // Replace .toLocaleDateString patterns
  const datePatterns = [
    // Simple direct calls
    {
      pattern: /(\w+)\.toLocaleDateString\((['"`][^'"`]*['"`])\)/g,
      replacement: 'safeDateFormat($1, $2)'
    },
    // Calls with ternary operators
    {
      pattern: /(\w+)\.toLocaleDateString\(\s*(isRTL|language\.code === 'ar'|d)\s*\?\s*(['"`][^'"`]*['"`])\s*:\s*(['"`][^'"`]*['"`])\s*\)/g,
      replacement: 'safeDateFormat($1, $2 ? $3 : $4)'
    },
    // More complex patterns
    {
      pattern: /new Date\(([^)]+)\)\.toLocaleDateString\((['"`][^'"`]*['"`])\)/g,
      replacement: 'safeDateFormat(new Date($1), $2)'
    },
    // Basic patterns without arguments
    {
      pattern: /(\w+)\.toLocaleDateString\(\)/g,
      replacement: 'safeDateFormat($1)'
    }
  ];
  
  // Replace .toLocaleTimeString patterns
  const timePatterns = [
    {
      pattern: /(\w+)\.toLocaleTimeString\((['"`][^'"`]*['"`])\)/g,
      replacement: 'safeTimeFormat($1, $2)'
    },
    {
      pattern: /(\w+)\.toLocaleTimeString\(\s*(isRTL|language\.code === 'ar'|d)\s*\?\s*(['"`][^'"`]*['"`])\s*:\s*(['"`][^'"`]*['"`])\s*\)/g,
      replacement: 'safeTimeFormat($1, $2 ? $3 : $4)'
    },
    {
      pattern: /new Date\(([^)]+)\)\.toLocaleTimeString\((['"`][^'"`]*['"`])\)/g,
      replacement: 'safeTimeFormat(new Date($1), $2)'
    },
    {
      pattern: /(\w+)\.toLocaleTimeString\(\)/g,
      replacement: 'safeTimeFormat($1)'
    },
    // Handle complex time formatting with options
    {
      pattern: /(\w+)\.toLocaleTimeString\((['"`][^'"`]*['"`]),\s*\{[^}]+\}\)/g,
      replacement: 'safeTimeFormat($1, $2)'
    }
  ];
  
  // Apply all patterns
  [...datePatterns, ...timePatterns].forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix all files
files.forEach(fixDateInFile);

console.log('Date formatting fix complete!');