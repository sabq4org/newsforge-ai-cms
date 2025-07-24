import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Users,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Lightbulb
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { Article, User } from '@/types';
import { toast } from 'sonner';

interface RecommendationInsight {
  id: string;
  type: 'performance' | 'user-behavior' | 'content-gap' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  actionItems: string[];
  metrics: {
    before: number;
    after?: number;
    target: number;
  };
  timeframe: string;
  category?: string;
  generatedAt: Date;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  characteristics: string[];
  recommendationPreferences: {
    avgRating: number;
    preferredContentTypes: string[];
    activeTimes: string[];
    engagementRate: number;
  };
  performanceMetrics: {
    clickThroughRate: number;
    satisfactionScore: number;
    retentionRate: number;
  };
}

interface RecommendationInsightsProps {
  onInsightAction?: (insight: RecommendationInsight, action: string) => void;
}

export function RecommendationInsights({ onInsightAction }: RecommendationInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useKV<RecommendationInsight[]>('recommendation-insights', []);
  const [userSegments, setUserSegments] = useKV<UserSegment[]>('user-segments', []);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedInsightType, setSelectedInsightType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  // Generate AI-powered insights
  const generateInsights = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI analysis with mock insights
      const newInsights: RecommendationInsight[] = [
        {
          id: `insight_${Date.now()}_1`,
          type: 'performance',
          title: 'انخفاض في معدل النقر لقسم التقنية',
          description: 'لوحظ انخفاض بنسبة 15% في معدل النقر على توصيات قسم التقنية خلال الأسبوع الماضي',
          impact: 'high',
          confidence: 85,
          actionItems: [
            'مراجعة عناوين المقالات التقنية لجعلها أكثر جاذبية',
            'تحسين توقيت عرض المحتوى التقني',
            'إضافة محتوى تقني أكثر تنوعاً'
          ],
          metrics: {
            before: 12.5,
            after: 10.6,
            target: 15.0
          },
          timeframe: 'آخر 7 أيام',
          category: 'تقنية',
          generatedAt: new Date()
        },
        {
          id: `insight_${Date.now()}_2`,
          type: 'user-behavior',
          title: 'تفضيل المحتوى القصير في المساء',
          description: 'المستخدمون يفضلون المقالات القصيرة (أقل من 3 دقائق قراءة) بنسبة 70% في الفترة المسائية',
          impact: 'medium',
          confidence: 92,
          actionItems: [
            'إنشاء ملخصات سريعة للمقالات الطويلة',
            'توصية المحتوى القصير في المساء',
            'تطوير صيغة "قراءة سريعة" للمقالات الطويلة'
          ],
          metrics: {
            before: 45,
            after: 70,
            target: 75
          },
          timeframe: 'آخر 30 يوم',
          generatedAt: new Date()
        },
        {
          id: `insight_${Date.now()}_3`,
          type: 'content-gap',
          title: 'نقص في المحتوى الاقتصادي',
          description: 'يبحث 25% من المستخدمين عن محتوى اقتصادي ولكن توصياتنا تغطي فقط 8% من هذا المحتوى',
          impact: 'high',
          confidence: 78,
          actionItems: [
            'زيادة إنتاج المحتوى الاقتصادي',
            'تحسين خوارزمية اكتشاف المحتوى الاقتصادي',
            'إنشاء شراكات مع خبراء اقتصاديين'
          ],
          metrics: {
            before: 8,
            target: 25
          },
          timeframe: 'آخر 60 يوم',
          category: 'أعمال',
          generatedAt: new Date()
        },
        {
          id: `insight_${Date.now()}_4`,
          type: 'optimization',
          title: 'تحسين توصيات الصباح الباكر',
          description: 'فرصة لتحسين معدل التفاعل بنسبة 20% من خلال تخصيص توصيات أفضل للفترة 6-9 صباحاً',
          impact: 'medium',
          confidence: 82,
          actionItems: [
            'تحليل أنماط قراءة الصباح الباكر',
            'إنشاء نموذج توصية مخصص للصباح',
            'اختبار أنواع محتوى مختلفة في الصباح'
          ],
          metrics: {
            before: 18.5,
            target: 22.2
          },
          timeframe: 'آخر 14 يوم',
          generatedAt: new Date()
        }
      ];

      // Mock user segments
      const newUserSegments: UserSegment[] = [
        {
          id: 'segment_1',
          name: 'قراء الصباح النشطون',
          description: 'مستخدمون يتفاعلون بشكل أساسي في الفترة الصباحية',
          userCount: 1250,
          characteristics: ['قراءة صباحية', 'تفاعل عالي', 'محتوى إخباري'],
          recommendationPreferences: {
            avgRating: 4.2,
            preferredContentTypes: ['أخبار', 'تحليلات', 'محليات'],
            activeTimes: ['6-9 ص', '7-10 ص'],
            engagementRate: 0.78
          },
          performanceMetrics: {
            clickThroughRate: 15.2,
            satisfactionScore: 4.1,
            retentionRate: 0.85
          }
        },
        {
          id: 'segment_2',
          name: 'محبو المحتوى التقني',
          description: 'مستخدمون مهتمون بشكل أساسي بالتقنية والابتكار',
          userCount: 820,
          characteristics: ['اهتمام تقني', 'قراءة متأنية', 'مشاركة عالية'],
          recommendationPreferences: {
            avgRating: 4.5,
            preferredContentTypes: ['تقنية', 'ذكاء اصطناعي', 'ابتكار'],
            activeTimes: ['14-16 م', '20-22 م'],
            engagementRate: 0.82
          },
          performanceMetrics: {
            clickThroughRate: 18.7,
            satisfactionScore: 4.4,
            retentionRate: 0.91
          }
        },
        {
          id: 'segment_3',
          name: 'قراء المساء الاجتماعيون',
          description: 'مستخدمون يفضلون المحتوى الاجتماعي والحياتي مساءً',
          userCount: 950,
          characteristics: ['قراءة مسائية', 'محتوى اجتماعي', 'مشاركة متوسطة'],
          recommendationPreferences: {
            avgRating: 3.8,
            preferredContentTypes: ['حياتنا', 'مجتمع', 'ترفيه'],
            activeTimes: ['18-21 م', '21-23 م'],
            engagementRate: 0.65
          },
          performanceMetrics: {
            clickThroughRate: 12.3,
            satisfactionScore: 3.7,
            retentionRate: 0.72
          }
        }
      ];

      setInsights(current => [...newInsights, ...current.slice(0, 10)]);
      setUserSegments(newUserSegments);
      
      toast.success('تم تحديث الرؤى والتحليلات');
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('حدث خطأ في توليد الرؤى');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter insights based on selections
  const filteredInsights = insights.filter(insight => {
    if (selectedInsightType !== 'all' && insight.type !== selectedInsightType) return false;
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    return true;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BarChart3 size={16} />;
      case 'user-behavior': return <Users size={16} />;
      case 'content-gap': return <AlertCircle size={16} />;
      case 'optimization': return <Zap size={16} />;
      default: return <Brain size={16} />;
    }
  };

  const renderInsightCard = (insight: RecommendationInsight) => (
    <Card key={insight.id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded">
              {getTypeIcon(insight.type)}
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getImpactColor(insight.impact)}`}
                >
                  تأثير {insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ثقة {insight.confidence}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {insight.description}
        </CardDescription>

        {/* Metrics */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-sm mb-2">المقاييس</h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">الحالي: </span>
              <span className="font-medium">{insight.metrics.before}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">الهدف: </span>
              <span className="font-medium text-green-600">{insight.metrics.target}%</span>
            </div>
            {insight.metrics.after && (
              <div className="col-span-2">
                <span className="text-muted-foreground">بعد التحسين: </span>
                <span className="font-medium text-blue-600">{insight.metrics.after}%</span>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <Progress 
              value={(insight.metrics.before / insight.metrics.target) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* Action Items */}
        <div>
          <h5 className="font-medium text-sm mb-2">خطوات العمل المقترحة</h5>
          <ul className="space-y-1">
            {insight.actionItems.slice(0, 3).map((item, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onInsightAction?.(insight, 'implement')}
          >
            تطبيق
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onInsightAction?.(insight, 'details')}
          >
            تفاصيل
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          تم التحليل: {insight.timeframe}
        </div>
      </CardContent>
    </Card>
  );

  const renderUserSegmentCard = (segment: UserSegment) => (
    <Card key={segment.id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{segment.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {segment.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {segment.userCount.toLocaleString()} مستخدم
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Characteristics */}
        <div>
          <h5 className="font-medium text-sm mb-2">الخصائص</h5>
          <div className="flex flex-wrap gap-1">
            {segment.characteristics.map(char => (
              <Badge key={char} variant="secondary" className="text-xs">
                {char}
              </Badge>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">معدل النقر</span>
              <span className="text-sm font-medium">{segment.performanceMetrics.clickThroughRate}%</span>
            </div>
            <Progress value={segment.performanceMetrics.clickThroughRate} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الرضا</span>
              <span className="text-sm font-medium">{segment.performanceMetrics.satisfactionScore}/5</span>
            </div>
            <Progress value={segment.performanceMetrics.satisfactionScore * 20} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الاحتفاظ</span>
              <span className="text-sm font-medium">{Math.round(segment.performanceMetrics.retentionRate * 100)}%</span>
            </div>
            <Progress value={segment.performanceMetrics.retentionRate * 100} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">التفاعل</span>
              <span className="text-sm font-medium">{Math.round(segment.recommendationPreferences.engagementRate * 100)}%</span>
            </div>
            <Progress value={segment.recommendationPreferences.engagementRate * 100} className="h-1.5" />
          </div>
        </div>

        {/* Preferred Content */}
        <div>
          <h5 className="font-medium text-sm mb-2">المحتوى المفضل</h5>
          <div className="text-xs text-muted-foreground">
            {segment.recommendationPreferences.preferredContentTypes.join('، ')}
          </div>
        </div>

        {/* Active Times */}
        <div>
          <h5 className="font-medium text-sm mb-2">أوقات النشاط</h5>
          <div className="text-xs text-muted-foreground">
            {segment.recommendationPreferences.activeTimes.join('، ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    if (insights.length === 0) {
      generateInsights();
    }
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">رؤى نظام التوصيات</h1>
          <p className="text-muted-foreground mt-1">
            تحليلات متقدمة ورؤى ذكية لتحسين أداء نظام التوصيات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={generateInsights} 
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                جاري التحليل...
              </div>
            ) : (
              <>
                <Brain size={16} className="ml-1" />
                تحديث الرؤى
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download size={16} className="ml-1" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb size={16} />
            الرؤى الذكية
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users size={16} />
            شرائح المستخدمين
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp size={16} />
            الاتجاهات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={selectedInsightType} onValueChange={setSelectedInsightType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع الرؤية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الرؤى</SelectItem>
                <SelectItem value="performance">الأداء</SelectItem>
                <SelectItem value="user-behavior">سلوك المستخدم</SelectItem>
                <SelectItem value="content-gap">فجوات المحتوى</SelectItem>
                <SelectItem value="optimization">التحسين</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="محليات">محليات</SelectItem>
                <SelectItem value="العالم">العالم</SelectItem>
                <SelectItem value="تقنية">تقنية</SelectItem>
                <SelectItem value="أعمال">أعمال</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
                <SelectItem value="month">الشهر</SelectItem>
                <SelectItem value="quarter">3 أشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insights Grid */}
          {filteredInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInsights.map(renderInsightCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد رؤى متاحة</h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على رؤى تطابق المرشحات المحددة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSegments.map(renderUserSegmentCard)}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  اتجاه الأداء العام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل النقر</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <span className="text-sm font-medium">+12%</span>
                    </div>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل الرضا</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <span className="text-sm font-medium">+8%</span>
                    </div>
                  </div>
                  <Progress value={82} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">دقة التوصيات</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown size={16} className="text-red-500" />
                      <span className="text-sm font-medium">-3%</span>
                    </div>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={20} />
                  أداء الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'تقنية', performance: 85, trend: 'up' },
                    { name: 'محليات', performance: 78, trend: 'up' },
                    { name: 'أعمال', performance: 65, trend: 'down' },
                    { name: 'رياضة', performance: 72, trend: 'stable' }
                  ].map(category => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        {category.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                        {category.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                        {category.trend === 'stable' && <div className="w-3.5 h-0.5 bg-gray-400 rounded" />}
                        <span className="text-sm font-medium w-8">{category.performance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}