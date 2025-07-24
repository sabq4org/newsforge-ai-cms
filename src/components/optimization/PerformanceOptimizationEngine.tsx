import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FlaskConical, 
  Sparkles, 
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Settings,
  Info
} from '@phosphor-icons/react';
import { Article, PredictiveAnalytics as PredictiveAnalyticsType, ContentAnalysis, ABTest } from '@/types';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { ABTestingFramework } from './ABTestingFramework';
import { AIOptimizationAssistant } from './AIOptimizationAssistant';

interface PerformanceOptimizationEngineProps {
  article: Partial<Article>;
  onArticleUpdate?: (updates: Partial<Article>) => void;
}

export function PerformanceOptimizationEngine({ 
  article, 
  onArticleUpdate 
}: PerformanceOptimizationEngineProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handlePredictiveAnalyticsUpdate = (analytics: PredictiveAnalyticsType) => {
    onArticleUpdate?.({
      predictiveAnalytics: analytics
    });
  };

  const handleContentAnalysisUpdate = (analysis: ContentAnalysis) => {
    onArticleUpdate?.({
      contentAnalysis: analysis
    });
  };

  const handleABTestUpdate = (tests: ABTest[]) => {
    onArticleUpdate?.({
      abTests: tests
    });
  };

  const handleContentUpdate = (updates: Partial<Article>) => {
    onArticleUpdate?.(updates);
  };

  // Calculate overall optimization score
  const getOptimizationScore = () => {
    let score = 0;
    let factors = 0;

    // Predictive analytics score
    if (article.predictiveAnalytics) {
      score += article.predictiveAnalytics.confidence;
      factors++;
    }

    // Content analysis score
    if (article.contentAnalysis) {
      score += article.contentAnalysis.readabilityScore;
      factors++;
    }

    // A/B testing score (based on number of completed tests)
    if (article.abTests) {
      const completedTests = article.abTests.filter(test => test.status === 'completed').length;
      const testScore = Math.min(100, completedTests * 25); // Each completed test adds 25 points
      score += testScore;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  };

  const getOptimizationStatus = () => {
    const score = getOptimizationScore();
    if (score >= 80) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { status: 'fair', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'needs improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const optimizationStatus = getOptimizationStatus();
  const optimizationScore = getOptimizationScore();

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Performance Optimization Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted stroke-current"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${optimizationStatus.color} stroke-current`}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${optimizationScore}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{optimizationScore}</span>
                </div>
              </div>
              <p className="font-medium">Optimization Score</p>
              <Badge variant="secondary" className={`${optimizationStatus.bg} ${optimizationStatus.color}`}>
                {optimizationStatus.status}
              </Badge>
            </div>

            {/* Module Status */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">MODULE STATUS</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Predictive Analytics</span>
                  {article.predictiveAnalytics ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  <span className="text-sm">A/B Testing</span>
                  {article.abTests && article.abTests.length > 0 ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {article.abTests.filter(t => t.status === 'running').length} Running
                    </Badge>
                  ) : (
                    <Badge variant="outline">None</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">AI Assistant</span>
                  {article.contentAnalysis ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {article.contentAnalysis.optimizations.length} Suggestions
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">PERFORMANCE INSIGHTS</h4>
              <div className="space-y-2">
                {article.predictiveAnalytics ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Reach Score:</span>
                      <Badge 
                        variant="secondary" 
                        className={
                          article.predictiveAnalytics.reachScore === 'high' ? 'bg-green-100 text-green-800' :
                          article.predictiveAnalytics.reachScore === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {article.predictiveAnalytics.reachScore}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted Views:</span>
                      <span className="font-medium">{article.predictiveAnalytics.predictedViews.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Run predictive analysis to see insights</p>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">ACTION ITEMS</h4>
              <div className="space-y-2">
                {!article.predictiveAnalytics && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Generate predictions</span>
                  </div>
                )}
                {!article.contentAnalysis && (
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>Analyze content</span>
                  </div>
                )}
                {(!article.abTests || article.abTests.length === 0) && (
                  <div className="flex items-center gap-2 text-sm">
                    <FlaskConical className="h-4 w-4 text-purple-500" />
                    <span>Create A/B tests</span>
                  </div>
                )}
                {article.contentAnalysis && 
                 article.contentAnalysis.optimizations.filter(opt => !opt.applied).length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Apply {article.contentAnalysis.optimizations.filter(opt => !opt.applied).length} suggestions</span>
                  </div>
                )}
                {article.predictiveAnalytics && 
                 article.contentAnalysis && 
                 article.abTests && 
                 article.abTests.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Target className="h-4 w-4" />
                    <span>All systems active!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictive" className="gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="assistant" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Analytics Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {article.predictiveAnalytics ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-base px-3 py-1 ${
                          article.predictiveAnalytics.reachScore === 'high' ? 'bg-green-100 text-green-800' :
                          article.predictiveAnalytics.reachScore === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {article.predictiveAnalytics.reachScore.toUpperCase()} REACH
                      </Badge>
                      <p className="text-2xl font-bold mt-2">
                        {article.predictiveAnalytics.predictedViews.toLocaleString()} views
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {article.predictiveAnalytics.confidence}%
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('predictive')}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate AI predictions for your content
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('predictive')}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistant Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Optimization Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                {article.contentAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">{article.contentAnalysis.readabilityScore}</p>
                        <p className="text-xs text-muted-foreground">Readability</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{article.contentAnalysis.optimizations.length}</p>
                        <p className="text-xs text-muted-foreground">Suggestions</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('assistant')}
                    >
                      View Optimizations
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Analyze content for AI-powered improvements
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('assistant')}
                    >
                      Analyze Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* A/B Testing Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                A/B Testing Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              {article.abTests && article.abTests.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">{article.abTests.length}</p>
                      <p className="text-xs text-muted-foreground">Total Tests</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {article.abTests.filter(t => t.status === 'running').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Running</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {article.abTests.filter(t => t.status === 'completed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('testing')}
                  >
                    Manage Tests
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FlaskConical className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Create A/B tests to optimize your content performance
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('testing')}
                  >
                    Create First Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics
            article={article}
            onAnalyticsUpdate={handlePredictiveAnalyticsUpdate}
          />
        </TabsContent>

        <TabsContent value="testing">
          <ABTestingFramework
            article={article}
            onTestUpdate={handleABTestUpdate}
          />
        </TabsContent>

        <TabsContent value="assistant">
          <AIOptimizationAssistant
            article={article}
            onContentUpdate={handleContentUpdate}
            onAnalysisUpdate={handleContentAnalysisUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}