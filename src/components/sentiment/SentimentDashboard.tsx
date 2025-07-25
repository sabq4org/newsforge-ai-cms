import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArabicSentimentAnalyzer, type SentimentResult } from './ArabicSentimentAnalyzer';
import { 
  ChartBarHorizontal, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Calendar,
  Filter,
  Download,
  Refresh,
  Heart,
  AlertCircle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { Article } from '@/types';

interface SentimentAnalysis {
  id: string;
  articleId: string;
  articleTitle: string;
  analysis: SentimentResult;
  timestamp: Date;
  category: string;
  author: string;
}

interface SentimentDashboardProps {
  articles?: Article[];
  onAnalysisSelect?: (analysis: SentimentAnalysis) => void;
}

export function SentimentDashboard({ articles = [], onAnalysisSelect }: SentimentDashboardProps) {
  const [analyses, setAnalyses] = useKV<SentimentAnalysis[]>('sentiment-analyses', []);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // تحليل شامل لجميع المقالات
  const handleBulkAnalysis = async () => {
    if (!articles.length) {
      toast.error('لا توجد مقالات للتحليل');
      return;
    }

    setIsAnalyzing(true);
    const newAnalyses: SentimentAnalysis[] = [];

    try {
      for (const article of articles.slice(0, 5)) { // تحليل أول 5 مقالات كمثال
        if (article.content) {
          const prompt = spark.llmPrompt`
            قم بتحليل المشاعر في هذا المقال الإخباري العربي:
            
            العنوان: ${article.title}
            المحتوى: ${article.content.slice(0, 1000)}...
            
            أعطني تحليل شامل للمشاعر والعواطف في النص.
          `;

          // محاكاة نتيجة التحليل
          const mockAnalysis: SentimentResult = {
            overall: {
              sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
              confidence: Math.random() * 0.3 + 0.7,
              intensity: Math.random() * 0.5 + 0.5
            },
            emotions: {
              joy: Math.random() * 100,
              sadness: Math.random() * 100,
              anger: Math.random() * 100,
              fear: Math.random() * 100,
              surprise: Math.random() * 100,
              disgust: Math.random() * 100,
              trust: Math.random() * 100,
              anticipation: Math.random() * 100
            },
            aspects: [
              { aspect: 'الموضوع', sentiment: 'positive', confidence: 0.8, mentions: 3 },
              { aspect: 'الأسلوب', sentiment: 'neutral', confidence: 0.7, mentions: 2 }
            ],
            keywords: [
              { word: 'مهم', sentiment: 'positive', weight: 0.8, category: 'صفة' },
              { word: 'جديد', sentiment: 'neutral', weight: 0.6, category: 'صفة' }
            ],
            tone: {
              formal: Math.random() * 100,
              informal: Math.random() * 100,
              emotional: Math.random() * 100,
              factual: Math.random() * 100
            },
            readability: {
              complexity: Math.random() * 100,
              clarity: Math.random() * 100,
              engagement: Math.random() * 100
            }
          };

          newAnalyses.push({
            id: `analysis_${Date.now()}_${article.id}`,
            articleId: article.id,
            articleTitle: article.title,
            analysis: mockAnalysis,
            timestamp: new Date(),
            category: article.category?.name || 'عام',
            author: article.author.name
          });
        }
      }

      setAnalyses(current => [...current, ...newAnalyses]);
      toast.success(`تم تحليل ${newAnalyses.length} مقال بنجاح`);
      
    } catch (error) {
      console.error('Error in bulk analysis:', error);
      toast.error('حدث خطأ في التحليل الشامل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // حساب الإحصائيات
  const calculateStats = () => {
    const filteredAnalyses = analyses.filter(analysis => {
      const daysDiff = Math.floor((Date.now() - new Date(analysis.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      
      const withinPeriod = daysDiff <= periodDays;
      const categoryMatch = selectedCategory === 'all' || analysis.category === selectedCategory;
      
      return withinPeriod && categoryMatch;
    });

    const totalAnalyses = filteredAnalyses.length;
    
    if (totalAnalyses === 0) {
      return {
        totalAnalyses: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        neutralPercentage: 0,
        averageConfidence: 0,
        topEmotion: 'غير محدد',
        mostActiveCategory: 'غير محدد'
      };
    }

    const positive = filteredAnalyses.filter(a => a.analysis.overall.sentiment === 'positive').length;
    const negative = filteredAnalyses.filter(a => a.analysis.overall.sentiment === 'negative').length;
    const neutral = filteredAnalyses.filter(a => a.analysis.overall.sentiment === 'neutral').length;

    const avgConfidence = filteredAnalyses.reduce((sum, a) => sum + a.analysis.overall.confidence, 0) / totalAnalyses;

    // حساب أكثر المشاعر شيوعاً
    const emotionTotals = filteredAnalyses.reduce((acc, analysis) => {
      Object.entries(analysis.analysis.emotions).forEach(([emotion, value]) => {
        acc[emotion] = (acc[emotion] || 0) + value;
      });
      return acc;
    }, {} as Record<string, number>);

    const topEmotion = Object.entries(emotionTotals).reduce((max, [emotion, total]) => 
      total > max.total ? { emotion, total } : max, { emotion: 'غير محدد', total: 0 }
    ).emotion;

    // حساب أكثر التصنيفات نشاطاً
    const categoryCount = filteredAnalyses.reduce((acc, analysis) => {
      acc[analysis.category] = (acc[analysis.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveCategory = Object.entries(categoryCount).reduce((max, [cat, count]) => 
      count > max.count ? { category: cat, count } : max, { category: 'غير محدد', count: 0 }
    ).category;

    return {
      totalAnalyses,
      positivePercentage: Math.round((positive / totalAnalyses) * 100),
      negativePercentage: Math.round((negative / totalAnalyses) * 100),
      neutralPercentage: Math.round((neutral / totalAnalyses) * 100),
      averageConfidence: Math.round(avgConfidence * 100),
      topEmotion,
      mostActiveCategory
    };
  };

  const stats = calculateStats();

  const getEmotionNameArabic = (emotion: string) => {
    const names = {
      joy: 'الفرح',
      sadness: 'الحزن',
      anger: 'الغضب',
      fear: 'الخوف',
      surprise: 'المفاجأة',
      disgust: 'الاشمئزاز',
      trust: 'الثقة',
      anticipation: 'التوقع'
    };
    return names[emotion as keyof typeof names] || emotion;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const categories = Array.from(new Set(analyses.map(a => a.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">لوحة تحليل المشاعر العربي</h2>
          <p className="text-muted-foreground">
            تحليل شامل للمشاعر والعواطف في المحتوى الإخباري
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleBulkAnalysis} 
            disabled={isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Refresh className="w-4 h-4" />
                تحليل شامل
              </>
            )}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="analyzer">المحلل</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي التحليلات</p>
                    <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                  </div>
                  <ChartBarHorizontal className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المشاعر الإيجابية</p>
                    <p className="text-2xl font-bold text-green-600">{stats.positivePercentage}%</p>
                  </div>
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">متوسط الثقة</p>
                    <p className="text-2xl font-bold">{stats.averageConfidence}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">أكثر المشاعر</p>
                    <p className="text-lg font-bold">{getEmotionNameArabic(stats.topEmotion)}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المشاعر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.positivePercentage}%
                  </div>
                  <Badge className="bg-green-100 text-green-800">إيجابي</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {stats.neutralPercentage}%
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">محايد</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {stats.negativePercentage}%
                  </div>
                  <Badge className="bg-red-100 text-red-800">سلبي</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Active Category */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر التصنيفات نشاطاً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">{stats.mostActiveCategory}</p>
                  <p className="text-sm text-muted-foreground">
                    التصنيف الأكثر تحليلاً في الفترة المحددة
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات المشاعر عبر الزمن</CardTitle>
              <CardDescription>
                تطور المشاعر في المحتوى خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <p>سيتم عرض الرسوم البيانية للاتجاهات هنا</p>
                <p className="text-sm">تحتاج لمزيد من البيانات لعرض الاتجاهات</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد تحليلات</h3>
                <p className="text-muted-foreground mb-4">
                  قم بتشغيل التحليل الشامل لبدء تحليل المشاعر في المقالات
                </p>
                <Button onClick={handleBulkAnalysis} disabled={isAnalyzing}>
                  ابدأ التحليل
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 10).map((analysis) => (
                <Card key={analysis.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{analysis.articleTitle}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{analysis.author}</span>
                          <span>•</span>
                          <span>{analysis.category}</span>
                          <span>•</span>
                          <span>{new Date(analysis.timestamp).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSentimentColor(analysis.analysis.overall.sentiment)}>
                          {analysis.analysis.overall.sentiment === 'positive' ? 'إيجابي' :
                           analysis.analysis.overall.sentiment === 'negative' ? 'سلبي' :
                           analysis.analysis.overall.sentiment === 'neutral' ? 'محايد' : 'مختلط'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(analysis.analysis.overall.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analyzer Tab */}
        <TabsContent value="analyzer">
          <ArabicSentimentAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
}