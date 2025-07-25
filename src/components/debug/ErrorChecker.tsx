import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories, mockAnalytics } from '@/lib/mockData';
import { normalizeArticles, normalizeActivityTimestamps, safeDateFormat } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from '@phosphor-icons/react';

export function ErrorChecker() {
  const [rawArticles] = useKV('sabq-articles', mockArticles);
  const [categories] = useKV('sabq-categories', mockCategories);
  const [analytics] = useKV('sabq-analytics', mockAnalytics);

  const checkResults = [];

  // Test article normalization
  try {
    const normalizedArticles = normalizeArticles(rawArticles);
    const invalidArticles = normalizedArticles.filter(article => 
      !article.category || !article.category.color || !article.author
    );
    
    checkResults.push({
      test: 'Article Normalization',
      passed: invalidArticles.length === 0,
      details: invalidArticles.length === 0 
        ? `All ${normalizedArticles.length} articles properly normalized`
        : `${invalidArticles.length} articles have missing data`
    });
  } catch (error) {
    checkResults.push({
      test: 'Article Normalization',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test categories
  try {
    const invalidCategories = categories.filter(cat => !cat.color || !cat.id);
    checkResults.push({
      test: 'Category Validation',
      passed: invalidCategories.length === 0,
      details: invalidCategories.length === 0
        ? `All ${categories.length} categories have valid color and ID`
        : `${invalidCategories.length} categories missing color or ID`
    });
  } catch (error) {
    checkResults.push({
      test: 'Category Validation',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test activity timestamps
  try {
    const normalizedActivity = normalizeActivityTimestamps(analytics.recentActivity);
    const invalidActivity = normalizedActivity.filter(activity => 
      !activity.timestamp || !(activity.timestamp instanceof Date) || isNaN(activity.timestamp.getTime())
    );
    
    checkResults.push({
      test: 'Activity Timestamps',
      passed: invalidActivity.length === 0,
      details: invalidActivity.length === 0
        ? `All ${normalizedActivity.length} activities have valid timestamps`
        : `${invalidActivity.length} activities have invalid timestamps`
    });
  } catch (error) {
    checkResults.push({
      test: 'Activity Timestamps',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test date formatting
  try {
    const testDate = new Date();
    const arabicDate = safeDateFormat(testDate, 'ar-SA');
    const englishDate = safeDateFormat(testDate, 'en-US');
    
    checkResults.push({
      test: 'Date Formatting',
      passed: arabicDate.length > 0 && englishDate.length > 0,
      details: `Arabic: ${arabicDate}, English: ${englishDate}`
    });
  } catch (error) {
    checkResults.push({
      test: 'Date Formatting',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  const allPassed = checkResults.every(result => result.passed);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allPassed ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
          System Error Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={allPassed ? "default" : "destructive"}>
          <AlertDescription>
            {allPassed 
              ? "All system checks passed successfully! No runtime errors detected."
              : "Some issues were detected. Check the details below."
            }
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          {checkResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded border ${
                result.passed 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {result.passed ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {result.test}
              </div>
              <div className="text-sm mt-1">{result.details}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}