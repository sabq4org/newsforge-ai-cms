import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Eye, 
  BarChart3, 
  Calendar,
  Zap,
  Target,
  Sparkles
} from '@phosphor-icons/react';
import { PredictiveAnalytics as PredictiveAnalyticsType, Article } from '@/types';
import { aiOptimizationService } from '@/lib/aiOptimizationService';
import { toast } from 'sonner';

interface PredictiveAnalyticsProps {
  article: Partial<Article>;
  onAnalyticsUpdate?: (analytics: PredictiveAnalyticsType) => void;
}

export function PredictiveAnalytics({ article, onAnalyticsUpdate }: PredictiveAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PredictiveAnalyticsType | null>(
    article.predictiveAnalytics || null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (article.predictiveAnalytics) {
      setAnalytics(article.predictiveAnalytics);
    }
  }, [article.predictiveAnalytics]);

  const generateAnalytics = async () => {
    if (!article.title && !article.content) {
      toast.error('Please add title and content before generating predictions');
      return;
    }

    setIsLoading(true);
    try {
      const newAnalytics = await aiOptimizationService.generatePredictiveAnalytics(article);
      setAnalytics(newAnalytics);
      onAnalyticsUpdate?.(newAnalytics);
      toast.success('Performance predictions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate predictions. Please try again.');
      console.error('Analytics generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReachScoreColor = (score: 'low' | 'medium' | 'high') => {
    switch (score) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  if (!analytics && !isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Performance Prediction</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get AI-powered insights about your article's potential performance, optimal publishing time, and improvement recommendations.
          </p>
          <Button onClick={generateAnalytics} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Predictions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Performance Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predicted Performance Score
            {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Analyzing content and generating predictions...</p>
              </div>
            </div>
          ) : analytics && (
            <div className="space-y-6">
              {/* Reach Score Badge */}
              <div className="text-center">
                <Badge 
                  variant="secondary" 
                  className={`text-lg px-4 py-2 ${getReachScoreColor(analytics.reachScore)}`}
                >
                  {analytics.reachScore.toUpperCase()} REACH POTENTIAL
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Confidence: {analytics.confidence}%
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{analytics.predictedViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Predicted Views</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{analytics.predictedEngagement}%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </div>
              </div>

              {/* Optimal Publish Time */}
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">Optimal Publish Time</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.optimalPublishTime.toLocaleDateString()} at{' '}
                    {analytics.optimalPublishTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Performance Factors */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance Factors
                </h4>
                <div className="space-y-3">
                  {Object.entries(analytics.factors).map(([factor, score]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={getScoreColor(score)}>{score}/100</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {analytics.recommendations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {analytics.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Regenerate Button */}
              <Button 
                variant="outline" 
                onClick={generateAnalytics}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Brain className="h-4 w-4" />
                Regenerate Predictions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}