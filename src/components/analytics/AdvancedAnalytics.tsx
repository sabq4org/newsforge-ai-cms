import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  BarChart3,
  Lightbulb,
  Sparkles,
  Brain,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  BookOpen,
  Filter,
  ArrowRight
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article, User } from '@/types';
import { mockArticles } from '@/lib/mockData';

interface ContentInsight {
  type: 'engagement' | 'timing' | 'category' | 'length' | 'style';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  articles?: string[];
}

interface AdvancedAnalyticsProps {
  articles?: Article[];
  onNavigate?: (view: string) => void;
  onArticleSelect?: (article: Article) => void;
}

export function AdvancedAnalytics({ 
  articles = mockArticles, 
  onNavigate,
  onArticleSelect 
}: AdvancedAnalyticsProps) {
  const [insights, setInsights] = useKV<ContentInsight[]>('content-insights', []);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Generate AI-powered content insights
  const generateContentInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      const newInsights: ContentInsight[] = [];
      
      // Analyze engagement patterns
      const engagementAnalysis = analyzeEngagementPatterns();
      newInsights.push(...engagementAnalysis);
      
      // Analyze timing patterns
      const timingAnalysis = analyzeTimingPatterns();
      newInsights.push(...timingAnalysis);
      
      // Analyze category performance
      const categoryAnalysis = analyzeCategoryPerformance();
      newInsights.push(...categoryAnalysis);
      
      // Analyze content length optimization
      const lengthAnalysis = analyzeContentLength();
      newInsights.push(...lengthAnalysis);
      
      // Sort by priority and impact
      newInsights.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] * b.impact) - (priorityWeight[a.priority] * a.impact);
      });
      
      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Analyze engagement patterns
  const analyzeEngagementPatterns = (): ContentInsight[] => {
    const insights: ContentInsight[] = [];
    
    // Calculate average engagement metrics
    const publishedArticles = articles.filter(a => a.status === 'published');
    const avgViews = publishedArticles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0) / publishedArticles.length;
    const avgLikes = publishedArticles.reduce((sum, a) => sum + (a.analytics?.likes || 0), 0) / publishedArticles.length;
    const avgShares = publishedArticles.reduce((sum, a) => sum + (a.analytics?.shares || 0), 0) / publishedArticles.length;
    
    // Find top performing articles
    const topArticles = publishedArticles
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, 5);
    
    // Find underperforming articles
    const underperformingArticles = publishedArticles
      .filter(a => (a.analytics?.views || 0) < avgViews * 0.5)
      .slice(0, 3);

    if (topArticles.length > 0) {
      insights.push({
        type: 'engagement',
        title: 'مقالات عالية الأداء',
        description: `${topArticles.length} مقالات تحقق نتائج استثنائية في التفاعل`,
        recommendation: 'استخدم نفس أسلوب وتوقيت هذه المقالات في المحتوى القادم',
        priority: 'high',
        impact: 85,
        articles: topArticles.map(a => a.id)
      });
    }

    if (underperformingArticles.length > 0) {
      insights.push({
        type: 'engagement',
        title: 'مقالات تحتاج تحسين',
        description: `${underperformingArticles.length} مقالات أداؤها أقل من المتوسط`,
        recommendation: 'راجع العناوين والمحتوى وأعد صياغتها أو روّج لها أكثر',
        priority: 'medium',
        impact: 65,
        articles: underperformingArticles.map(a => a.id)
      });
    }

    return insights;
  };

  // Analyze timing patterns
  const analyzeTimingPatterns = (): ContentInsight[] => {
    const insights: ContentInsight[] = [];
    
    // Group articles by hour of publication
    const hourlyPerformance: { [hour: number]: { count: number; avgViews: number; articles: Article[] } } = {};
    
    articles.filter(a => a.status === 'published').forEach(article => {
      const hour = new Date(article.createdAt).getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { count: 0, avgViews: 0, articles: [] };
      }
      hourlyPerformance[hour].count++;
      hourlyPerformance[hour].avgViews += article.analytics?.views || 0;
      hourlyPerformance[hour].articles.push(article);
    });

    // Calculate averages and find best times
    const hourlyStats = Object.entries(hourlyPerformance).map(([hour, data]) => ({
      hour: parseInt(hour),
      avgViews: data.avgViews / data.count,
      count: data.count,
      articles: data.articles
    })).sort((a, b) => b.avgViews - a.avgViews);

    if (hourlyStats.length > 0) {
      const bestHour = hourlyStats[0];
      const timeRange = `${bestHour.hour}:00 - ${bestHour.hour + 1}:00`;
      
      insights.push({
        type: 'timing',
        title: 'أفضل وقت للنشر',
        description: `الساعة ${timeRange} تحقق أعلى معدل مشاهدة (${Math.round(bestHour.avgViews)} مشاهدة متوسط)`,
        recommendation: 'ركز على النشر في هذا التوقيت لزيادة الوصول',
        priority: 'high',
        impact: 80,
        articles: bestHour.articles.slice(0, 3).map(a => a.id)
      });
    }

    return insights;
  };

  // Analyze category performance
  const analyzeCategoryPerformance = (): ContentInsight[] => {
    const insights: ContentInsight[] = [];
    
    // Group by category
    const categoryPerformance: { [category: string]: { views: number; engagement: number; count: number; articles: Article[] } } = {};
    
    articles.filter(a => a.status === 'published').forEach(article => {
      const categoryName = article.category?.name || 'غير مصنف';
      if (!categoryPerformance[categoryName]) {
        categoryPerformance[categoryName] = { views: 0, engagement: 0, count: 0, articles: [] };
      }
      
      const views = article.analytics?.views || 0;
      const engagement = (article.analytics?.likes || 0) + (article.analytics?.shares || 0) + (article.analytics?.comments || 0);
      
      categoryPerformance[categoryName].views += views;
      categoryPerformance[categoryName].engagement += engagement;
      categoryPerformance[categoryName].count++;
      categoryPerformance[categoryName].articles.push(article);
    });

    // Find best and worst performing categories
    const categoryStats = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        avgViews: data.views / data.count,
        avgEngagement: data.engagement / data.count,
        count: data.count,
        articles: data.articles
      }))
      .sort((a, b) => b.avgViews - a.avgViews);

    if (categoryStats.length > 0) {
      const bestCategory = categoryStats[0];
      const worstCategory = categoryStats[categoryStats.length - 1];
      
      insights.push({
        type: 'category',
        title: `قسم "${bestCategory.category}" الأكثر جذباً`,
        description: `يحقق معدل ${Math.round(bestCategory.avgViews)} مشاهدة و ${Math.round(bestCategory.avgEngagement)} تفاعل`,
        recommendation: 'زد من المحتوى في هذا القسم واستثمر في تطويره أكثر',
        priority: 'high',
        impact: 90,
        articles: bestCategory.articles.slice(0, 3).map(a => a.id)
      });

      if (worstCategory.avgViews < bestCategory.avgViews * 0.3) {
        insights.push({
          type: 'category',
          title: `قسم "${worstCategory.category}" يحتاج انتباه`,
          description: `أداء أقل من المتوقع مع ${Math.round(worstCategory.avgViews)} مشاهدة متوسط`,
          recommendation: 'راجع استراتيجية المحتوى لهذا القسم أو أعد النظر في أهميته',
          priority: 'medium',
          impact: 60
        });
      }
    }

    return insights;
  };

  // Analyze content length optimization
  const analyzeContentLength = (): ContentInsight[] => {
    const insights: ContentInsight[] = [];
    
    // Group articles by content length
    const publishedArticles = articles.filter(a => a.status === 'published');
    const lengthGroups = {
      short: publishedArticles.filter(a => a.content.length < 1000),
      medium: publishedArticles.filter(a => a.content.length >= 1000 && a.content.length < 3000),
      long: publishedArticles.filter(a => a.content.length >= 3000)
    };

    // Calculate performance for each group
    const lengthPerformance = Object.entries(lengthGroups).map(([length, articles]) => {
      const avgViews = articles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0) / articles.length || 0;
      const avgReadTime = articles.reduce((sum, a) => sum + (a.analytics?.readTime || 0), 0) / articles.length || 0;
      return { length, avgViews, avgReadTime, count: articles.length, articles };
    }).filter(group => group.count > 0);

    const bestPerforming = lengthPerformance.sort((a, b) => b.avgViews - a.avgViews)[0];
    
    if (bestPerforming) {
      const lengthLabels = { short: 'قصيرة', medium: 'متوسطة', long: 'طويلة' };
      const lengthLabel = lengthLabels[bestPerforming.length as keyof typeof lengthLabels];
      
      insights.push({
        type: 'length',
        title: `المقالات ${lengthLabel} تحقق أفضل النتائج`,
        description: `معدل ${Math.round(bestPerforming.avgViews)} مشاهدة و ${Math.round(bestPerforming.avgReadTime)} ثانية قراءة`,
        recommendation: `ركز على إنتاج مقالات ${lengthLabel} لتحقيق أفضل تفاعل`,
        priority: 'medium',
        impact: 70
      });
    }

    return insights;
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    const publishedArticles = articles.filter(a => a.status === 'published');
    const totalViews = publishedArticles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0);
    const totalEngagement = publishedArticles.reduce((sum, a) => 
      sum + (a.analytics?.likes || 0) + (a.analytics?.shares || 0) + (a.analytics?.comments || 0), 0);
    const avgReadTime = publishedArticles.reduce((sum, a) => sum + (a.analytics?.readTime || 0), 0) / publishedArticles.length || 0;
    
    return {
      totalViews,
      totalEngagement,
      avgReadTime: Math.round(avgReadTime),
      totalArticles: publishedArticles.length,
      engagementRate: publishedArticles.length > 0 ? totalEngagement / totalViews * 100 : 0
    };
  };

  useEffect(() => {
    generateContentInsights();
  }, [articles, selectedTimeframe]);

  const summary = getAnalyticsSummary();

  const renderInsightCard = (insight: ContentInsight) => {
    const priorityColors = {
      high: 'destructive',
      medium: 'accent',
      low: 'secondary'
    };

    const typeIcons = {
      engagement: TrendingUp,
      timing: Clock,
      category: Target,
      length: BookOpen,
      style: Sparkles
    };

    const Icon = typeIcons[insight.type];

    return (
      <Card key={`${insight.type}-${insight.title}`} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon size={20} className="text-primary" />
              <CardTitle className="text-lg">{insight.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={priorityColors[insight.priority] as any}>
                {insight.priority === 'high' ? 'عالي' : insight.priority === 'medium' ? 'متوسط' : 'منخفض'}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium">{insight.impact}%</div>
                <div className="text-xs text-muted-foreground">تأثير</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {insight.description}
          </CardDescription>
          
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-accent-foreground">
                {insight.recommendation}
              </p>
            </div>
          </div>
          
          {insight.articles && insight.articles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">مقالات ذات صلة:</h4>
              <div className="space-y-1">
                {insight.articles.slice(0, 2).map(articleId => {
                  const article = articles.find(a => a.id === articleId);
                  return article ? (
                    <div 
                      key={articleId}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => onArticleSelect?.(article)}
                    >
                      <span className="flex-1 line-clamp-1">{article.title}</span>
                      <ArrowRight size={14} className="text-muted-foreground" />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          <Progress value={insight.impact} className="h-2" />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التحليلات المتقدمة</h1>
          <p className="text-muted-foreground mt-1">
            رؤى ذكية لتحسين أداء المحتوى والوصول
          </p>
        </div>
        
        <Button 
          onClick={generateContentInsights} 
          disabled={isGeneratingInsights}
        >
          {isGeneratingInsights ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              جاري التحليل...
            </div>
          ) : (
            <>
              <Brain size={16} className="ml-1" />
              تحديث الرؤى
            </>
          )}
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</p>
              </div>
              <Eye size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التفاعل</p>
                <p className="text-2xl font-bold">{summary.totalEngagement.toLocaleString()}</p>
              </div>
              <Heart size={24} className="text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط وقت القراءة</p>
                <p className="text-2xl font-bold">{summary.avgReadTime}ث</p>
              </div>
              <Clock size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل التفاعل</p>
                <p className="text-2xl font-bold">{summary.engagementRate.toFixed(1)}%</p>
              </div>
              <BarChart3 size={24} className="text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={20} />
            رؤى المحتوى الذكية
          </CardTitle>
          <CardDescription>
            تحليلات مدعومة بالذكاء الاصطناعي لتحسين استراتيجية المحتوى
          </CardDescription>
        </CardHeader>
      </Card>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map(renderInsightCard)}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">جاري تحليل البيانات</h3>
            <p className="text-muted-foreground">
              يتم الآن تحليل أداء المحتوى لتقديم رؤى مخصصة
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex-col items-start"
          onClick={() => onNavigate?.('recommendations')}
        >
          <Target size={20} className="mb-2" />
          <span className="font-medium">نظام التوصيات</span>
          <span className="text-sm text-muted-foreground">محتوى مخصص للقراء</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex-col items-start"
          onClick={() => onNavigate?.('category-analytics')}
        >
          <BarChart3 size={20} className="mb-2" />
          <span className="font-medium">تحليلات الأقسام</span>
          <span className="text-sm text-muted-foreground">أداء كل قسم تفصيلياً</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex-col items-start"
          onClick={() => onNavigate?.('realtime')}
        >
          <TrendingUp size={20} className="mb-2" />
          <span className="font-medium">التحليلات المباشرة</span>
          <span className="text-sm text-muted-foreground">متابعة الأداء لحظياً</span>
        </Button>
      </div>
    </div>
  );
}