import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Sparkles, 
  Check, 
  X, 
  RefreshCcw,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  MessageSquare,
  Edit3,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Heart,
  Sun,
  Plus,
  AlertTriangle
} from '@phosphor-icons/react';
import { ContentAnalysis, AIOptimization, Article } from '@/types';
import { aiOptimizationService } from '@/lib/aiOptimizationService';
import { toast } from 'sonner';

interface AIOptimizationAssistantProps {
  article: Partial<Article>;
  onContentUpdate?: (updates: Partial<Article>) => void;
  onAnalysisUpdate?: (analysis: ContentAnalysis) => void;
}

export function AIOptimizationAssistant({ 
  article, 
  onContentUpdate,
  onAnalysisUpdate 
}: AIOptimizationAssistantProps) {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(
    article.contentAnalysis || null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [expandedOptimization, setExpandedOptimization] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomOptimizing, setIsCustomOptimizing] = useState(false);

  useEffect(() => {
    if (article.contentAnalysis) {
      setAnalysis(article.contentAnalysis);
    }
  }, [article.contentAnalysis]);

  const analyzeContent = async () => {
    if (!article.title && !article.content) {
      toast.error('Please add title and content before analyzing');
      return;
    }

    setIsAnalyzing(true);
    try {
      const newAnalysis = await aiOptimizationService.analyzeContent(article);
      setAnalysis(newAnalysis);
      onAnalysisUpdate?.(newAnalysis);
      toast.success('Content analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze content. Please try again.');
      console.error('Content analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (optimization: AIOptimization) => {
    setIsOptimizing(optimization.id);
    try {
      // Apply the optimization to the article
      const updates: Partial<Article> = {};
      
      if (optimization.type === 'headline') {
        updates.title = optimization.optimizedText;
      } else if (optimization.type === 'content') {
        updates.content = optimization.optimizedText;
      }
      
      onContentUpdate?.(updates);
      
      // Mark optimization as applied
      if (analysis) {
        const updatedOptimizations = analysis.optimizations.map(opt =>
          opt.id === optimization.id ? { ...opt, applied: true } : opt
        );
        setAnalysis({ ...analysis, optimizations: updatedOptimizations });
      }
      
      toast.success('Optimization applied successfully!');
    } catch (error) {
      toast.error('Failed to apply optimization');
      console.error('Optimization application failed:', error);
    } finally {
      setIsOptimizing(null);
    }
  };

  const handleCustomOptimization = async (scenario: string) => {
    if (!article.content) {
      toast.error('Please add content before requesting optimizations');
      return;
    }

    setIsCustomOptimizing(true);
    try {
      const prompts = await aiOptimizationService.generateOptimizationPrompts(article, scenario);
      const prompt = spark.llmPrompt`${prompts[0]}\n\nContent: ${article.content}\nTitle: ${article.title}`;
      
      const optimization = await spark.llm(prompt);
      
      // Create a temporary optimization suggestion
      const newOptimization: AIOptimization = {
        id: `custom-${Date.now()}`,
        articleId: article.id || '',
        type: 'content',
        priority: 'medium',
        suggestion: `Custom optimization: ${scenario}`,
        originalText: article.content.substring(0, 100) + '...',
        optimizedText: optimization,
        reason: `AI-optimized for: ${scenario}`,
        impact: 'engagement',
        estimatedImprovement: 20,
        applied: false,
        createdAt: new Date()
      };

      if (analysis) {
        setAnalysis({
          ...analysis,
          optimizations: [...analysis.optimizations, newOptimization]
        });
      }
      
      toast.success('Custom optimization generated!');
    } catch (error) {
      toast.error('Failed to generate custom optimization');
      console.error('Custom optimization failed:', error);
    } finally {
      setIsCustomOptimizing(false);
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'engagement': return <Heart className="h-4 w-4" />;
      case 'readability': return <BookOpen className="h-4 w-4" />;
      case 'seo': return <TrendingUp className="h-4 w-4" />;
      case 'clarity': return <Lightbulb className="h-4 w-4" />;
      case 'tone': return <MessageSquare className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Content Analysis</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get AI-powered insights about your content's readability, tone, SEO potential, and receive specific optimization recommendations.
          </p>
          <Button onClick={analyzeContent} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze Content
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Analysis Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Analysis
            {isAnalyzing && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Analyzing content with AI...</p>
              </div>
            </div>
          ) : analysis && (
            <div className="space-y-6">
              {/* Content Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{analysis.readabilityScore}/100</p>
                  <p className="text-sm text-muted-foreground">Readability Score</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Edit3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{analysis.structureAnalysis.wordCount}</p>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold capitalize">{analysis.toneAnalysis.sentiment}</p>
                  <p className="text-sm text-muted-foreground">Tone</p>
                </div>
              </div>

              {/* Language Detection */}
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Language: {analysis.languageDetection === 'ar' ? 'Arabic' : 'English'}
                </Badge>
                <Badge variant="outline">
                  Formality: {analysis.toneAnalysis.formality}
                </Badge>
                <Badge variant="outline">
                  Urgency: {analysis.toneAnalysis.urgency}
                </Badge>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold mb-3">Quick AI Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomOptimization('rewrite-higher-impact')}
                    disabled={isCustomOptimizing}
                    className="gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Rewrite for Higher Impact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomOptimization('optimize-morning-audience')}
                    disabled={isCustomOptimizing}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Optimize for Morning Audience
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomOptimization('add-missing-context')}
                    disabled={isCustomOptimizing}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Missing Context
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomOptimization('suggest-emotional-hooks')}
                    disabled={isCustomOptimizing}
                    className="gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Suggest Emotional Hooks
                  </Button>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="w-full gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Re-analyze Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Optimizations */}
      {analysis && analysis.optimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Optimization Recommendations
              <Badge variant="secondary">{analysis.optimizations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.optimizations.map((optimization) => (
                <div key={optimization.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getImpactIcon(optimization.impact)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{optimization.suggestion}</h4>
                          <Badge 
                            variant="secondary" 
                            className={getPriorityColor(optimization.priority)}
                          >
                            {optimization.priority}
                          </Badge>
                          {optimization.applied && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <Check className="h-3 w-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {optimization.reason}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Impact: {optimization.impact}
                          </span>
                          <span className="text-muted-foreground">
                            Est. improvement: +{optimization.estimatedImprovement}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedOptimization(
                                expandedOptimization === optimization.id ? null : optimization.id
                              )}
                            >
                              {expandedOptimization === optimization.id ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {!optimization.applied && (
                        <Button
                          size="sm"
                          onClick={() => applyOptimization(optimization)}
                          disabled={isOptimizing === optimization.id}
                          className="gap-2"
                        >
                          {isOptimizing === optimization.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOptimization === optimization.id && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">Original Text</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(optimization.originalText)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                          <p className="text-sm">{optimization.originalText}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">Optimized Text</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(optimization.optimizedText)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <p className="text-sm">{optimization.optimizedText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SEO Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Top Keywords */}
              <div>
                <h4 className="font-medium mb-2">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.seoAnalysis.keywordDensity)
                    .slice(0, 8)
                    .map(([keyword, density]) => (
                      <Badge key={keyword} variant="outline">
                        {keyword} ({density.toFixed(1)}%)
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Suggested Tags */}
              <div>
                <h4 className="font-medium mb-2">Suggested Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.seoAnalysis.suggestedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Internal Link Opportunities */}
              <div>
                <h4 className="font-medium mb-2">Internal Link Opportunities</h4>
                <div className="space-y-1">
                  {analysis.seoAnalysis.internalLinkOpportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span>{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}