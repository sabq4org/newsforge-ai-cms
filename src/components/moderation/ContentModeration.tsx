import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Brain,
  Flag,
  Settings,
  TrendingUp,
  Users,
  FileText,
  Zap,
  RefreshCw,
  MessageSquare,
  Globe,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from '@phosphor-icons/react';
import { contentModerationService, ModerationResult, ModerationRule, ModerationSettings } from '@/lib/contentModerationService';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { Article } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ContentModerationProps {
  onArticleSelect?: (articleId: string) => void;
  className?: string;
}

export function ContentModeration({ onArticleSelect, className }: ContentModerationProps) {
  const { language, canAccess } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [articles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [moderationResults, setModerationResults] = useKV<ModerationResult[]>('moderation-results', []);
  const [moderationSettings, setModerationSettings] = useKV<ModerationSettings>('moderation-settings', contentModerationService.getSettings());
  const [moderationRules, setModerationRules] = useKV<ModerationRule[]>('moderation-rules', contentModerationService.getModerationRules());
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queue' | 'rules' | 'settings' | 'test'>('dashboard');

  // Update moderation service settings when they change
  useEffect(() => {
    contentModerationService.updateSettings(moderationSettings);
  }, [moderationSettings]);

  // Check if user has moderation access
  if (!canAccess('moderation')) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isArabic ? 'غير مصرح بالوصول' : 'Access Denied'}
          </h3>
          <p className="text-muted-foreground">
            {isArabic 
              ? 'ليس لديك صلاحية للوصول إلى نظام الإشراف على المحتوى'
              : 'You do not have permission to access the content moderation system'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process a single article through moderation
  const moderateArticle = async (article: Article) => {
    setIsProcessing(true);
    try {
      const result = await contentModerationService.moderateArticle(article);
      setModerationResults(prev => {
        const existing = prev.findIndex(r => r.articleId === article.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        } else {
          return [...prev, result];
        }
      });
      
      toast.success(
        isArabic 
          ? `تم تحليل المقال: ${result.status}`
          : `Article analyzed: ${result.status}`
      );
    } catch (error) {
      console.error('Moderation failed:', error);
      toast.error(
        isArabic 
          ? 'فشل في تحليل المقال'
          : 'Failed to analyze article'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Process all articles
  const moderateAllArticles = async () => {
    if (articles.length === 0) return;
    
    setIsProcessing(true);
    const results: ModerationResult[] = [];
    
    try {
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const result = await contentModerationService.moderateArticle(article);
        results.push(result);
        
        // Update progress
        toast.info(
          isArabic 
            ? `تم تحليل ${i + 1} من ${articles.length} مقال`
            : `Analyzed ${i + 1} of ${articles.length} articles`
        );
      }
      
      setModerationResults(results);
      toast.success(
        isArabic 
          ? 'تم تحليل جميع المقالات بنجاح'
          : 'All articles analyzed successfully'
      );
    } catch (error) {
      console.error('Bulk moderation failed:', error);
      toast.error(
        isArabic 
          ? 'فشل في تحليل بعض المقالات'
          : 'Failed to analyze some articles'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Test content moderation
  const testContentModeration = async () => {
    if (!testContent.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await contentModerationService.quickModerationCheck(testContent);
      setTestResult(result);
    } catch (error) {
      console.error('Test moderation failed:', error);
      toast.error(
        isArabic 
          ? 'فشل في اختبار المحتوى'
          : 'Failed to test content'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Get moderation statistics
  const getModerationStats = () => {
    const total = moderationResults.length;
    const approved = moderationResults.filter(r => r.status === 'approved').length;
    const flagged = moderationResults.filter(r => r.status === 'flagged').length;
    const rejected = moderationResults.filter(r => r.status === 'rejected').length;
    const needsReview = moderationResults.filter(r => r.status === 'requires-review').length;
    
    const totalFlags = moderationResults.reduce((sum, r) => sum + r.flags.length, 0);
    const avgScore = total > 0 ? moderationResults.reduce((sum, r) => sum + r.score, 0) / total : 0;
    
    return { total, approved, flagged, rejected, needsReview, totalFlags, avgScore };
  };

  const stats = getModerationStats();

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'flagged': return 'secondary';
      case 'rejected': return 'destructive';
      case 'requires-review': return 'outline';
      default: return 'outline';
    }
  };

  // Render moderation result card
  const renderModerationResult = (result: ModerationResult) => {
    const article = articles.find(a => a.id === result.articleId);
    if (!article) return null;
    
    return (
      <Card key={result.articleId} className="cursor-pointer hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{article.title}</h4>
              <p className="text-sm text-muted-foreground">
                {article.author.name} • {format(new Date(result.moderatedAt), 'PPp', { locale: isArabic ? ar : undefined })}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge variant={getStatusColor(result.status) as any}>
                {result.status}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium">{result.score.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? 'نقاط' : 'score'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Language Detection */}
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {result.languageDetection.primary} ({(result.languageDetection.confidence * 100).toFixed(0)}%)
            </span>
            {result.languageDetection.arabicRatio > 0 && (
              <span className="text-xs text-muted-foreground">
                • {(result.languageDetection.arabicRatio * 100).toFixed(0)}% Arabic
              </span>
            )}
          </div>
          
          {/* Flags */}
          {result.flags.length > 0 && (
            <div className="space-y-2 mb-3">
              {result.flags.slice(0, 3).map((flag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(flag.severity) as any} className="text-xs">
                    {flag.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">
                    {flag.description}
                  </span>
                </div>
              ))}
              {result.flags.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{result.flags.length - 3} more flags
                </p>
              )}
            </div>
          )}
          
          {/* Content Analysis Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Readability:</span>
              <span className="ml-1 font-medium">{result.contentAnalysis.readabilityScore}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sentiment:</span>
              <span className="ml-1 font-medium">{(result.contentAnalysis.sentimentScore * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedArticle(article);
                if (onArticleSelect) onArticleSelect(article.id);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              {isArabic ? 'عرض' : 'View'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => moderateArticle(article)}
              disabled={isProcessing}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {isArabic ? 'إعادة تحليل' : 'Re-analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? 'الإشراف على المحتوى' : 'Content Moderation'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic 
                ? 'نظام ذكي لمراقبة وتحليل المحتوى تلقائياً'
                : 'AI-powered content monitoring and analysis system'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={moderateAllArticles}
            disabled={isProcessing || articles.length === 0}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {isArabic ? 'تحليل الكل' : 'Analyze All'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            {isArabic ? 'الإحصائيات' : 'Dashboard'}
          </TabsTrigger>
          <TabsTrigger value="queue">
            <FileText className="w-4 h-4 mr-2" />
            {isArabic ? 'قائمة المراجعة' : 'Review Queue'}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Flag className="w-4 h-4 mr-2" />
            {isArabic ? 'القواعد' : 'Rules'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
          <TabsTrigger value="test">
            <Zap className="w-4 h-4 mr-2" />
            {isArabic ? 'اختبار' : 'Test'}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'المجموع' : 'Total Articles'}
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'موافق عليها' : 'Approved'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'مرفوضة' : 'Rejected'}
                    </p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'تحتاج مراجعة' : 'Needs Review'}
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.needsReview}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {isArabic ? 'نقاط صحة المحتوى العامة' : 'Overall Content Health Score'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'متوسط النقاط' : 'Average Score'}</span>
                  <span className="font-bold">{stats.avgScore.toFixed(1)}%</span>
                </div>
                <Progress value={stats.avgScore} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إجمالي العلامات' : 'Total Flags'}
                    </p>
                    <p className="text-xl font-bold">{stats.totalFlags}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'معدل الموافقة' : 'Approval Rate'}
                    </p>
                    <p className="text-xl font-bold">
                      {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {moderationResults.slice(0, 10).map(renderModerationResult)}
                {moderationResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {isArabic ? 'لا توجد نتائج تحليل بعد' : 'No moderation results yet'}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {isArabic ? 'قائمة انتظار المراجعة' : 'Moderation Queue'}
            </h3>
            <Badge variant="outline">
              {moderationResults.filter(r => r.requiresReview).length} {isArabic ? 'مقال' : 'items'}
            </Badge>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {moderationResults
                .filter(r => r.requiresReview || r.status === 'requires-review' || r.status === 'flagged')
                .map(renderModerationResult)}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {isArabic ? 'قواعد الإشراف' : 'Moderation Rules'}
            </h3>
            <Button size="sm">
              {isArabic ? 'إضافة قاعدة' : 'Add Rule'}
            </Button>
          </div>
          
          <div className="space-y-4">
            {moderationRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          {isArabic && rule.nameAr ? rule.nameAr : rule.name}
                        </h4>
                        <Badge variant={getSeverityColor(rule.severity) as any}>
                          {rule.severity}
                        </Badge>
                        <Badge variant="outline">
                          {rule.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic && rule.descriptionAr ? rule.descriptionAr : rule.description}
                      </p>
                      {rule.keywords && rule.keywords.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Keywords: </span>
                          <span className="text-xs">{rule.keywords.slice(0, 3).join(', ')}</span>
                          {rule.keywords.length > 3 && <span className="text-xs text-muted-foreground"> +{rule.keywords.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) => {
                          setModerationRules(prev => 
                            prev.map(r => r.id === rule.id ? { ...r, active: checked } : r)
                          );
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'إعدادات الإشراف' : 'Moderation Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="auto-approval">
                      {isArabic ? 'حد الموافقة التلقائية' : 'Auto-approval Threshold'}
                    </Label>
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={moderationSettings.autoApprovalThreshold}
                        onChange={(e) => setModerationSettings(prev => ({
                          ...prev,
                          autoApprovalThreshold: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {moderationSettings.autoApprovalThreshold}% or higher
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="review-threshold">
                      {isArabic ? 'حد المراجعة المطلوبة' : 'Review Required Threshold'}
                    </Label>
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={moderationSettings.requireReviewThreshold}
                        onChange={(e) => setModerationSettings(prev => ({
                          ...prev,
                          requireReviewThreshold: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {moderationSettings.requireReviewThreshold}% or lower
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="strict-mode">
                      {isArabic ? 'الوضع الصارم' : 'Strict Mode'}
                    </Label>
                    <Switch
                      id="strict-mode"
                      checked={moderationSettings.strictMode}
                      onCheckedChange={(checked) => setModerationSettings(prev => ({
                        ...prev,
                        strictMode: checked
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-analysis">
                      {isArabic ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                    </Label>
                    <Switch
                      id="ai-analysis"
                      checked={moderationSettings.enableAIAnalysis}
                      onCheckedChange={(checked) => setModerationSettings(prev => ({
                        ...prev,
                        enableAIAnalysis: checked
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-editors">
                      {isArabic ? 'إشعار المحررين' : 'Notify Editors'}
                    </Label>
                    <Switch
                      id="notify-editors"
                      checked={moderationSettings.notifyEditorsOnFlag}
                      onCheckedChange={(checked) => setModerationSettings(prev => ({
                        ...prev,
                        notifyEditorsOnFlag: checked
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="log-all">
                      {isArabic ? 'تسجيل جميع العمليات' : 'Log All Moderation'}
                    </Label>
                    <Switch
                      id="log-all"
                      checked={moderationSettings.logAllModeration}
                      onCheckedChange={(checked) => setModerationSettings(prev => ({
                        ...prev,
                        logAllModeration: checked
                      }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {isArabic ? 'اختبار نظام الإشراف' : 'Test Moderation System'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'اختبر المحتوى للحصول على تحليل سريع قبل النشر'
                  : 'Test content for quick analysis before publishing'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-content">
                  {isArabic ? 'المحتوى المراد اختباره' : 'Content to Test'}
                </Label>
                <Textarea
                  id="test-content"
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder={isArabic ? 'أدخل النص المراد تحليله...' : 'Enter text to analyze...'}
                  rows={6}
                  className="mt-2"
                />
              </div>
              
              <Button
                onClick={testContentModeration}
                disabled={!testContent.trim() || isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isArabic ? 'تحليل المحتوى' : 'Analyze Content'}
              </Button>
              
              {testResult && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {isArabic ? 'النتيجة' : 'Result'}
                        </span>
                        <Badge variant={testResult.safe ? 'default' : 'destructive'}>
                          {testResult.safe ? (isArabic ? 'آمن' : 'Safe') : (isArabic ? 'مشكوك' : 'Flagged')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isArabic ? 'مستوى الخطورة' : 'Severity Level'}
                        </span>
                        <Badge variant={getSeverityColor(testResult.severity) as any}>
                          {testResult.severity}
                        </Badge>
                      </div>
                      
                      {testResult.issues.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">
                            {isArabic ? 'المشاكل المكتشفة' : 'Detected Issues'}
                          </h4>
                          <ul className="space-y-1">
                            {testResult.issues.map((issue: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}