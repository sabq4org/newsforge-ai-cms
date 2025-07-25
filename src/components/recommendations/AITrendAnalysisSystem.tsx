import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  Brain,
  Sparkles,
  Clock,
  Users,
  Heart,
  Share2,
  MessageSquare,
  Star,
  Zap,
  Target,
  Calendar,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  ChartLineUp,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Filter,
  Search,
  RefreshCw
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface TrendAnalysis {
  id: string;
  trendType: 'rising' | 'declining' | 'stable' | 'viral' | 'emerging';
  keyword: string;
  category: string;
  confidence: number;
  momentum: number;
  predictedDirection: 'up' | 'down' | 'stable';
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
  relatedArticles: string[];
  metrics: {
    searchVolume: number;
    socialMentions: number;
    engagementRate: number;
    viralityScore: number;
  };
  forecast: {
    nextHour: number;
    next6Hours: number;
    next24Hours: number;
    nextWeek: number;
  };
  insights: string[];
  recommendedActions: string[];
  generatedAt: Date;
}

interface ContentTrend {
  id: string;
  articleId: string;
  trendScore: number;
  viralPotential: number;
  engagementPrediction: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  peakTime: string;
  demographicAppeal: {
    ageGroups: string[];
    interests: string[];
    regions: string[];
  };
  competitiveLandscape: {
    similarContent: number;
    uniquenessScore: number;
    differentiators: string[];
  };
  monetizationPotential: number;
  aiInsights: string[];
}

interface TrendPrediction {
  id: string;
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  keyFactors: string[];
  potentialContent: string[];
  preparationActions: string[];
  generatedAt: Date;
}

export function AITrendAnalysisSystem({ 
  onArticleSelect 
}: { 
  onArticleSelect: (article: Article) => void;
}) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysis[]>([]);
  const [contentTrends, setContentTrends] = useState<ContentTrend[]>([]);
  const [trendPredictions, setTrendPredictions] = useState<TrendPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [activeTab, setActiveTab] = useState('trends');

  // Generate trend analysis using AI
  const generateTrendAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Analyze current content for trends
      const trendPrompt = spark.llmPrompt`
        حلل الاتجاهات الحالية في هذا المحتوى العربي:

        المقالات الحالية:
        ${articles.slice(0, 10).map((article, idx) => `
        ${idx + 1}. "${article.title}"
        الفئة: ${article.category?.name}
        المشاهدات: ${article.analytics?.views || 0}
        الإعجابات: ${article.analytics?.likes || 0}
        المشاركات: ${article.analytics?.shares || 0}
        `).join('\n')}

        قم بتحليل:
        1. الكلمات المفتاحية الرائجة والناشئة
        2. الفئات الأكثر تفاعلاً
        3. الاتجاهات الصاعدة والهابطة
        4. التوقعات للساعات والأيام القادمة
        5. المحتوى المرشح للانتشار
        6. التوصيات العملية للمحررين

        اعط نتائج مفصلة بصيغة JSON مع:
        - تحليل الاتجاهات
        - توقعات الأداء
        - رؤى استراتيجية
        - توصيات محتوى
      `;

      const trendResult = await spark.llm(trendPrompt, 'gpt-4o', true);
      const trendData = JSON.parse(trendResult);

      // Generate trend analyses
      if (trendData.trends) {
        const trends: TrendAnalysis[] = trendData.trends.map((trend: any, idx: number) => ({
          id: `trend_${idx}_${Date.now()}`,
          trendType: trend.type || 'emerging',
          keyword: trend.keyword || `اتجاه ${idx + 1}`,
          category: trend.category || 'عام',
          confidence: trend.confidence || 0.8,
          momentum: trend.momentum || 0.6,
          predictedDirection: trend.direction || 'up',
          timeframe: selectedTimeframe,
          relatedArticles: trend.relatedArticles || [],
          metrics: {
            searchVolume: trend.searchVolume || Math.floor(Math.random() * 10000) + 1000,
            socialMentions: trend.socialMentions || Math.floor(Math.random() * 5000) + 500,
            engagementRate: trend.engagementRate || Math.random() * 0.2 + 0.05,
            viralityScore: trend.viralityScore || Math.random() * 100
          },
          forecast: {
            nextHour: trend.forecast?.nextHour || Math.random() * 100,
            next6Hours: trend.forecast?.next6Hours || Math.random() * 100,
            next24Hours: trend.forecast?.next24Hours || Math.random() * 100,
            nextWeek: trend.forecast?.nextWeek || Math.random() * 100
          },
          insights: trend.insights || ['اتجاه واعد يستحق المتابعة'],
          recommendedActions: trend.actions || ['إنتاج محتوى ذي صلة'],
          generatedAt: new Date()
        }));

        setTrendAnalyses(trends);
      }

      // Analyze individual articles for trend potential
      const contentAnalyses: ContentTrend[] = [];
      for (const article of articles.slice(0, 5)) {
        const contentPrompt = spark.llmPrompt`
          حلل إمكانية انتشار هذا المقال:

          العنوان: ${article.title}
          الملخص: ${article.excerpt}
          الفئة: ${article.category?.name}
          الإحصائيات الحالية: ${JSON.stringify(article.analytics)}

          قدم تحليلاً شاملاً يتضمن:
          1. نقاط الانتشار المحتملة (0-100)
          2. توقع التفاعل خلال 24 ساعة
          3. أفضل وقت للترويج
          4. الجمهور المستهدف
          5. المنافسة والتميز
          6. الإمكانيات المالية
          7. رؤى تحسين الأداء

          أجب بصيغة JSON مفصلة.
        `;

        try {
          const contentResult = await spark.llm(contentPrompt, 'gpt-4o-mini', true);
          const contentData = JSON.parse(contentResult);

          contentAnalyses.push({
            id: `content_trend_${article.id}_${Date.now()}`,
            articleId: article.id,
            trendScore: contentData.trendScore || Math.random() * 100,
            viralPotential: contentData.viralPotential || Math.random() * 100,
            engagementPrediction: {
              views: contentData.engagement?.views || Math.floor(Math.random() * 10000) + 1000,
              likes: contentData.engagement?.likes || Math.floor(Math.random() * 1000) + 100,
              shares: contentData.engagement?.shares || Math.floor(Math.random() * 500) + 50,
              comments: contentData.engagement?.comments || Math.floor(Math.random() * 200) + 20
            },
            peakTime: contentData.peakTime || 'المساء',
            demographicAppeal: {
              ageGroups: contentData.demographics?.ageGroups || ['25-35', '35-45'],
              interests: contentData.demographics?.interests || ['تقنية', 'أعمال'],
              regions: contentData.demographics?.regions || ['الخليج', 'المشرق']
            },
            competitiveLandscape: {
              similarContent: contentData.competition?.similarContent || Math.floor(Math.random() * 50) + 10,
              uniquenessScore: contentData.competition?.uniquenessScore || Math.random() * 100,
              differentiators: contentData.competition?.differentiators || ['زاوية جديدة', 'محتوى حصري']
            },
            monetizationPotential: contentData.monetization || Math.random() * 100,
            aiInsights: contentData.insights || ['محتوى واعد للانتشار']
          });
        } catch (error) {
          // Fallback with mock data
          contentAnalyses.push({
            id: `content_trend_${article.id}_${Date.now()}`,
            articleId: article.id,
            trendScore: Math.random() * 100,
            viralPotential: Math.random() * 100,
            engagementPrediction: {
              views: Math.floor(Math.random() * 10000) + 1000,
              likes: Math.floor(Math.random() * 1000) + 100,
              shares: Math.floor(Math.random() * 500) + 50,
              comments: Math.floor(Math.random() * 200) + 20
            },
            peakTime: 'المساء',
            demographicAppeal: {
              ageGroups: ['25-35'],
              interests: ['عام'],
              regions: ['عام']
            },
            competitiveLandscape: {
              similarContent: Math.floor(Math.random() * 50) + 10,
              uniquenessScore: Math.random() * 100,
              differentiators: ['محتوى متميز']
            },
            monetizationPotential: Math.random() * 100,
            aiInsights: ['تحليل أساسي متاح']
          });
        }
      }

      setContentTrends(contentAnalyses);

      // Generate future predictions
      const predictionsPrompt = spark.llmPrompt`
        بناءً على التحليل الحالي، توقع الاتجاهات المستقبلية في المحتوى العربي:

        السياق الحالي:
        - الفئات الرائجة: ${trendData.trends?.map((t: any) => t.category).join(', ') || 'تقنية، سياسة، رياضة'}
        - الكلمات المفتاحية الصاعدة: ${trendData.trends?.map((t: any) => t.keyword).join(', ') || 'ذكاء اصطناعي، استدامة'}

        توقع:
        1. الاتجاهات الناشئة (الأسبوع القادم)
        2. المواضيع المرشحة للانتشار
        3. التحولات المتوقعة في اهتمامات الجمهور
        4. الفرص الاستراتيجية للمحتوى
        5. التحديات والمخاطر المحتملة

        قدم 5-7 توقعات مفصلة بصيغة JSON.
      `;

      try {
        const predictionsResult = await spark.llm(predictionsPrompt, 'gpt-4o', true);
        const predictionsData = JSON.parse(predictionsResult);

        if (predictionsData.predictions) {
          const predictions: TrendPrediction[] = predictionsData.predictions.map((pred: any, idx: number) => ({
            id: `prediction_${idx}_${Date.now()}`,
            title: pred.title || `توقع ${idx + 1}`,
            description: pred.description || 'توقع اتجاه مستقبلي',
            probability: pred.probability || Math.random() * 100,
            timeframe: pred.timeframe || 'الأسبوع القادم',
            impact: pred.impact || 'medium',
            category: pred.category || 'عام',
            keyFactors: pred.factors || ['عوامل متنوعة'],
            potentialContent: pred.content || ['محتوى مقترح'],
            preparationActions: pred.actions || ['إجراءات موصى بها'],
            generatedAt: new Date()
          }));

          setTrendPredictions(predictions);
        }
      } catch (error) {
        console.error('Error generating predictions:', error);
      }

      toast.success('تم إنتاج تحليل الاتجاهات بنجاح');

    } catch (error) {
      console.error('Error generating trend analysis:', error);
      toast.error('خطأ في تحليل الاتجاهات');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (type: TrendAnalysis['trendType']) => {
    switch (type) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      case 'viral': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'emerging': return <Sparkles className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendLabel = (type: TrendAnalysis['trendType']) => {
    switch (type) {
      case 'rising': return 'صاعد';
      case 'declining': return 'هابط';
      case 'stable': return 'مستقر';
      case 'viral': return 'فيروسي';
      case 'emerging': return 'ناشئ';
      default: return 'عام';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-gray-500 bg-gray-100';
      case 'medium': return 'text-blue-500 bg-blue-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'critical': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const renderTrendAnalysisCard = (trend: TrendAnalysis) => (
    <Card key={trend.id} className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(trend.trendType)}
              <h3 className="font-bold text-lg">{trend.keyword}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getTrendLabel(trend.trendType)}</Badge>
              <Badge variant="secondary">{trend.category}</Badge>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>ثقة: {Math.round(trend.confidence * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>زخم: {Math.round(trend.momentum * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-green-500" />
              <span>بحث: {trend.metrics.searchVolume.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-orange-500" />
              <span>ذكر: {trend.metrics.socialMentions.toLocaleString()}</span>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">التوقعات:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>الساعة القادمة:</span>
                <span className="font-medium">{Math.round(trend.forecast.nextHour)}%</span>
              </div>
              <div className="flex justify-between">
                <span>6 ساعات:</span>
                <span className="font-medium">{Math.round(trend.forecast.next6Hours)}%</span>
              </div>
              <div className="flex justify-between">
                <span>24 ساعة:</span>
                <span className="font-medium">{Math.round(trend.forecast.next24Hours)}%</span>
              </div>
              <div className="flex justify-between">
                <span>الأسبوع:</span>
                <span className="font-medium">{Math.round(trend.forecast.nextWeek)}%</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">رؤى:</h4>
            <div className="space-y-1">
              {trend.insights.map((insight, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {insight}</p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">التوصيات:</h4>
            <div className="space-y-1">
              {trend.recommendedActions.map((action, idx) => (
                <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContentTrendCard = (contentTrend: ContentTrend) => {
    const article = articles.find(a => a.id === contentTrend.articleId);
    if (!article) return null;

    return (
      <Card key={contentTrend.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6" onClick={() => onArticleSelect(article)}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg line-clamp-2">{article.title}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{Math.round(contentTrend.trendScore)}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">إمكانية الانتشار</div>
                <Progress value={contentTrend.viralPotential} className="h-2" />
                <div className="text-xs font-medium">{Math.round(contentTrend.viralPotential)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">إمكانية الربح</div>
                <Progress value={contentTrend.monetizationPotential} className="h-2" />
                <div className="text-xs font-medium">{Math.round(contentTrend.monetizationPotential)}%</div>
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <h4 className="font-medium text-sm text-blue-900">التوقعات (24 ساعة):</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <Eye className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium">{contentTrend.engagementPrediction.views.toLocaleString()}</div>
                  <div className="text-muted-foreground">مشاهدة</div>
                </div>
                <div className="text-center">
                  <Heart className="h-3 w-3 mx-auto mb-1 text-red-600" />
                  <div className="font-medium">{contentTrend.engagementPrediction.likes.toLocaleString()}</div>
                  <div className="text-muted-foreground">إعجاب</div>
                </div>
                <div className="text-center">
                  <Share2 className="h-3 w-3 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">{contentTrend.engagementPrediction.shares.toLocaleString()}</div>
                  <div className="text-muted-foreground">مشاركة</div>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-3 w-3 mx-auto mb-1 text-purple-600" />
                  <div className="font-medium">{contentTrend.engagementPrediction.comments.toLocaleString()}</div>
                  <div className="text-muted-foreground">تعليق</div>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">الجمهور المستهدف:</h4>
              <div className="flex flex-wrap gap-1">
                {contentTrend.demographicAppeal.ageGroups.map((age, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {age}
                  </Badge>
                ))}
                {contentTrend.demographicAppeal.interests.map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Best time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>أفضل وقت للنشر: {contentTrend.peakTime}</span>
            </div>

            {/* AI Insights */}
            <div className="space-y-1">
              {contentTrend.aiInsights.map((insight, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">💡 {insight}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPredictionCard = (prediction: TrendPrediction) => (
    <Card key={prediction.id} className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg line-clamp-2">{prediction.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getImpactColor(prediction.impact)}>
                {prediction.impact === 'low' && 'منخفض'}
                {prediction.impact === 'medium' && 'متوسط'}
                {prediction.impact === 'high' && 'عالي'}
                {prediction.impact === 'critical' && 'حرج'}
              </Badge>
              <Badge variant="outline">{Math.round(prediction.probability)}%</Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{prediction.description}</p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{prediction.timeframe}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>{prediction.category}</span>
            </div>
          </div>

          {/* Key factors */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">العوامل الرئيسية:</h4>
            <div className="space-y-1">
              {prediction.keyFactors.map((factor, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {factor}</p>
              ))}
            </div>
          </div>

          {/* Potential content */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">محتوى مقترح:</h4>
            <div className="flex flex-wrap gap-1">
              {prediction.potentialContent.map((content, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {content}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preparation actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">إجراءات التحضير:</h4>
            <div className="space-y-1">
              {prediction.preparationActions.map((action, idx) => (
                <p key={idx} className="text-xs text-blue-600">→ {action}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    generateTrendAnalysis();
  }, [selectedTimeframe]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              نظام تحليل الاتجاهات بالذكاء الاصطناعي
            </h1>
            <p className="text-muted-foreground">تحليل وتوقع الاتجاهات باستخدام الذكاء الاصطناعي المتقدم</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {['1h', '6h', '24h', '7d', '30d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe as any)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
          <Button 
            onClick={generateTrendAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">اتجاهات صاعدة</p>
                <p className="text-2xl font-bold text-green-600">
                  {trendAnalyses.filter(t => t.trendType === 'rising').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">محتوى فيروسي</p>
                <p className="text-2xl font-bold text-purple-600">
                  {trendAnalyses.filter(t => t.trendType === 'viral').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">اتجاهات ناشئة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trendAnalyses.filter(t => t.trendType === 'emerging').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">متوسط الثقة</p>
                <p className="text-2xl font-bold text-orange-600">
                  {trendAnalyses.length > 0 ? Math.round(trendAnalyses.reduce((acc, t) => acc + t.confidence, 0) / trendAnalyses.length * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">تحليل الاتجاهات</TabsTrigger>
          <TabsTrigger value="content">تحليل المحتوى</TabsTrigger>
          <TabsTrigger value="predictions">التوقعات المستقبلية</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {trendAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <ChartLineUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد تحليلات متاحة</h3>
              <p className="text-muted-foreground mb-4">اضغط على "تحليل جديد" لبدء تحليل الاتجاهات</p>
              <Button onClick={generateTrendAnalysis} disabled={isAnalyzing}>
                بدء التحليل
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendAnalyses.map(renderTrendAnalysisCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {contentTrends.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد تحليلات محتوى متاحة</h3>
              <p className="text-muted-foreground mb-4">قم بإجراء تحليل جديد لرؤية إمكانيات المحتوى</p>
              <Button onClick={generateTrendAnalysis} disabled={isAnalyzing}>
                تحليل المحتوى
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contentTrends.map(renderContentTrendCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {trendPredictions.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد توقعات متاحة</h3>
              <p className="text-muted-foreground mb-4">قم بإجراء تحليل لإنتاج توقعات الاتجاهات المستقبلية</p>
              <Button onClick={generateTrendAnalysis} disabled={isAnalyzing}>
                إنتاج التوقعات
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendPredictions.map(renderPredictionCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}