import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  MessageSquare,
  Share2,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { SabqAIService } from '@/lib/sabqAIService';
import { ContentAnalysis, AIOptimization, PredictiveAnalytics } from '@/types';
import { toast } from 'sonner';

interface AIOptimizationEngineProps {
  articleId: string;
  title: string;
  content: string;
  category: string;
  onOptimizationApplied: (optimization: AIOptimization) => void;
}

export function AIOptimizationEngine({
  articleId,
  title,
  content,
  category,
  onOptimizationApplied
}: AIOptimizationEngineProps) {
  const { language } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [optimizations, setOptimizations] = useState<AIOptimization[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [socialSnippets, setSocialSnippets] = useState<any>(null);
  const [moderationFlags, setModerationFlags] = useState<any>(null);

  const isRTL = language.direction === 'rtl';

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info(isRTL ? 'جاري تحليل المحتوى...' : 'Analyzing content...');
    
    try {
      // Run all AI analyses in parallel
      const [
        analysisResult,
        headlineOpts,
        contentOpts,
        seoOpts,
        predictiveResult,
        socialResult,
        moderationResult
      ] = await Promise.all([
        SabqAIService.analyzeContent(content, title),
        SabqAIService.generateContentOptimizations(title, 'headline'),
        SabqAIService.generateContentOptimizations(content, 'structure'),
        SabqAIService.generateContentOptimizations(content, 'seo'),
        SabqAIService.generatePredictiveAnalytics(title, content, category, new Date()),
        SabqAIService.generateSocialSnippets(title, content),
        SabqAIService.detectModerationFlags(content)
      ]);

      setContentAnalysis(analysisResult);
      setOptimizations([...headlineOpts, ...contentOpts, ...seoOpts]);
      setPredictiveAnalytics(predictiveResult);
      setSocialSnippets(socialResult);
      setModerationFlags(moderationResult);

      toast.success(isRTL ? 'تم تحليل المحتوى بنجاح' : 'Content analysis completed');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في تحليل المحتوى' : 'Analysis failed');
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = (optimization: AIOptimization) => {
    onOptimizationApplied(optimization);
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === optimization.id ? { ...opt, applied: true } : opt
      )
    );
    toast.success(isRTL ? 'تم تطبيق التحسين' : 'Optimization applied');
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReachScoreColor = (score: string) => {
    switch (score) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* AI Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-accent" />
            <div>
              <CardTitle className="text-xl">
                {isRTL ? 'محرك التحسين الذكي' : 'AI Optimization Engine'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'تحليل شامل للمحتوى مع اقتراحات ذكية للتحسين'
                  : 'Comprehensive content analysis with intelligent optimization suggestions'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runFullAnalysis} 
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 ml-2" />
            {isAnalyzing 
              ? (isRTL ? 'جاري التحليل...' : 'Analyzing...') 
              : (isRTL ? 'تشغيل التحليل الذكي' : 'Run AI Analysis')
            }
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {(contentAnalysis || predictiveAnalytics || optimizations.length > 0) && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {isRTL ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="optimizations">
              {isRTL ? 'التحسينات' : 'Optimizations'}
            </TabsTrigger>
            <TabsTrigger value="predictions">
              {isRTL ? 'التوقعات' : 'Predictions'}
            </TabsTrigger>
            <TabsTrigger value="social">
              {isRTL ? 'وسائل التواصل' : 'Social Media'}
            </TabsTrigger>
            <TabsTrigger value="moderation">
              {isRTL ? 'المراجعة' : 'Moderation'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {contentAnalysis && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {isRTL ? 'سهولة القراءة' : 'Readability'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getReadabilityColor(contentAnalysis.readabilityScore)}`}>
                        {contentAnalysis.readabilityScore}%
                      </span>
                      <Progress value={contentAnalysis.readabilityScore} className="flex-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {isRTL ? 'تحليل النبرة' : 'Tone Analysis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant={contentAnalysis.toneAnalysis.sentiment === 'positive' ? 'default' : 'secondary'}>
                        {isRTL ? 'المشاعر:' : 'Sentiment:'} {contentAnalysis.toneAnalysis.sentiment}
                      </Badge>
                      <Badge variant="outline">
                        {isRTL ? 'الرسمية:' : 'Formality:'} {contentAnalysis.toneAnalysis.formality}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {isRTL ? 'إحصائيات البنية' : 'Structure Stats'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{isRTL ? 'عدد الكلمات:' : 'Words:'}</span>
                        <span className="font-medium">{contentAnalysis.structureAnalysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isRTL ? 'الفقرات:' : 'Paragraphs:'}</span>
                        <span className="font-medium">{contentAnalysis.structureAnalysis.paragraphCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Optimizations Tab */}
          <TabsContent value="optimizations" className="space-y-4">
            {optimizations.length > 0 ? (
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <Card key={optimization.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={optimization.priority === 'high' ? 'destructive' : optimization.priority === 'medium' ? 'default' : 'secondary'}>
                              {optimization.priority}
                            </Badge>
                            <Badge variant="outline">
                              {optimization.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{optimization.suggestion}</CardTitle>
                          <CardDescription>{optimization.reason}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">
                            +{optimization.estimatedImprovement}%
                          </span>
                          {optimization.applied ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => applyOptimization(optimization)}
                            >
                              {isRTL ? 'تطبيق' : 'Apply'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {(optimization.originalText && optimization.optimizedText) && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {isRTL ? 'النص الأصلي:' : 'Original:'}
                            </label>
                            <p className="text-sm bg-muted p-2 rounded mt-1">{optimization.originalText}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {isRTL ? 'النص المحسن:' : 'Optimized:'}
                            </label>
                            <p className="text-sm bg-accent/10 p-2 rounded mt-1">{optimization.optimizedText}</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'قم بتشغيل التحليل للحصول على اقتراحات التحسين' : 'Run analysis to get optimization suggestions'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            {predictiveAnalytics ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {isRTL ? 'توقعات الأداء' : 'Performance Predictions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <Badge className={getReachScoreColor(predictiveAnalytics.reachScore)} variant="secondary">
                          {isRTL ? 'مستوى الوصول:' : 'Reach Score:'} {predictiveAnalytics.reachScore}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {isRTL ? 'الثقة:' : 'Confidence:'} {predictiveAnalytics.confidence}%
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {predictiveAnalytics.predictedViews.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'مشاهدات متوقعة' : 'Predicted Views'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {predictiveAnalytics.predictedEngagement}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'تفاعل متوقع' : 'Predicted Engagement'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'العوامل المؤثرة' : 'Performance Factors'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(predictiveAnalytics.factors).map(([factor, score]) => (
                        <div key={factor} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-32">
                            {factor === 'titleScore' ? (isRTL ? 'العنوان' : 'Title') :
                             factor === 'lengthScore' ? (isRTL ? 'الطول' : 'Length') :
                             factor === 'categoryTrend' ? (isRTL ? 'الفئة' : 'Category') :
                             factor === 'timingScore' ? (isRTL ? 'التوقيت' : 'Timing') :
                             factor === 'seasonalityScore' ? (isRTL ? 'الموسمية' : 'Seasonality') : factor}:
                          </span>
                          <Progress value={score} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">{score}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'التوصيات' : 'Recommendations'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictiveAnalytics.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'قم بتشغيل التحليل لرؤية توقعات الأداء' : 'Run analysis to see performance predictions'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4">
            {socialSnippets ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(socialSnippets).map(([platform, text]) => (
                  <Card key={platform}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <Share2 className="w-4 h-4" />
                        {platform}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-muted p-3 rounded">{text as string}</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        {isRTL ? 'نسخ' : 'Copy'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'قم بتشغيل التحليل للحصول على منشورات وسائل التواصل' : 'Run analysis to generate social media posts'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-4">
            {moderationFlags ? (
              <div className="space-y-4">
                <Alert variant={moderationFlags.overall === 'safe' ? 'default' : 'destructive'}>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    {isRTL ? 'الحالة العامة:' : 'Overall Status:'} 
                    <Badge variant={moderationFlags.overall === 'safe' ? 'default' : 'destructive'} className="ml-2">
                      {moderationFlags.overall === 'safe' ? (isRTL ? 'آمن' : 'Safe') :
                       moderationFlags.overall === 'review' ? (isRTL ? 'يحتاج مراجعة' : 'Needs Review') :
                       (isRTL ? 'محظور' : 'Blocked')}
                    </Badge>
                  </AlertDescription>
                </Alert>

                {moderationFlags.flags.length > 0 ? (
                  <div className="space-y-3">
                    {moderationFlags.flags.map((flag: any, index: number) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getSeverityColor(flag.severity)}>
                              {flag.type} - {flag.severity}
                            </Badge>
                            {flag.severity === 'critical' && <XCircle className="w-5 h-5 text-red-600" />}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm font-medium mb-2">{flag.description}</p>
                          <p className="text-sm text-muted-foreground">{flag.suggestion}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">
                        {isRTL ? 'لم يتم العثور على مشاكل في المحتوى' : 'No content issues detected'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'قم بتشغيل التحليل لفحص المحتوى' : 'Run analysis to check content moderation'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}