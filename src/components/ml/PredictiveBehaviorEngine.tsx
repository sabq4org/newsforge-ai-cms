import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  ChartBar,
  Clock,
  BookOpen,
  Heart,
  Share2,
  Eye,
  MessageCircle,
  Bookmark,
  Zap,
  Award
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';

interface UserEngagementPattern {
  userId: string;
  patterns: {
    readingTime: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    contentPreferences: {
      categories: Record<string, number>;
      lengths: Record<'short' | 'medium' | 'long', number>;
      complexity: Record<'simple' | 'moderate' | 'complex', number>;
    };
    interactionStyle: {
      likesProbability: number;
      sharesProbability: number;
      commentsProbability: number;
      bookmarksProbability: number;
    };
    deviceBehavior: {
      mobile: { engagement: number; timeSpent: number };
      tablet: { engagement: number; timeSpent: number };
      desktop: { engagement: number; timeSpent: number };
    };
  };
  lastUpdated: Date;
}

interface PredictiveInsight {
  id: string;
  type: 'engagement' | 'timing' | 'content' | 'personalization';
  confidence: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
  dataPoints: number;
  accuracy: number;
}

interface BehaviorPrediction {
  userId: string;
  articleId: string;
  predictions: {
    willRead: number;
    readingTime: number;
    engagementScore: number;
    shareability: number;
    dropOffPoint: number;
  };
  personalizedElements: {
    title: string;
    summary: string;
    readingTimeEstimate: string;
    difficulty: string;
  };
  confidence: number;
  factors: string[];
}

export function PredictiveBehaviorEngine() {
  const [engagementPatterns, setEngagementPatterns] = useKV<UserEngagementPattern[]>('engagement-patterns', []);
  const [insights, setInsights] = useKV<PredictiveInsight[]>('predictive-insights', []);
  const [predictions, setPredictions] = useKV<BehaviorPrediction[]>('behavior-predictions', []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight | null>(null);

  useEffect(() => {
    generateMockData();
    runPredictiveAnalysis();
  }, []);

  const generateMockData = () => {
    // Generate engagement patterns
    if (engagementPatterns.length === 0) {
      const patterns: UserEngagementPattern[] = Array.from({ length: 150 }, (_, i) => ({
        userId: `user_${i + 1}`,
        patterns: {
          readingTime: {
            morning: Math.random() * 0.4,
            afternoon: Math.random() * 0.3,
            evening: Math.random() * 0.5,
            night: Math.random() * 0.2
          },
          contentPreferences: {
            categories: {
              'تقنية': Math.random(),
              'رياضة': Math.random(),
              'محليات': Math.random(),
              'عالم': Math.random(),
              'اقتصاد': Math.random()
            },
            lengths: {
              short: Math.random(),
              medium: Math.random(),
              long: Math.random()
            },
            complexity: {
              simple: Math.random(),
              moderate: Math.random(),
              complex: Math.random()
            }
          },
          interactionStyle: {
            likesProbability: Math.random() * 0.3,
            sharesProbability: Math.random() * 0.1,
            commentsProbability: Math.random() * 0.05,
            bookmarksProbability: Math.random() * 0.15
          },
          deviceBehavior: {
            mobile: { engagement: Math.random() * 0.8, timeSpent: Math.random() * 300 },
            tablet: { engagement: Math.random() * 0.6, timeSpent: Math.random() * 400 },
            desktop: { engagement: Math.random() * 0.9, timeSpent: Math.random() * 600 }
          }
        },
        lastUpdated: new Date()
      }));
      setEngagementPatterns(patterns);
    }

    // Generate insights
    if (insights.length === 0) {
      const mockInsights: PredictiveInsight[] = [
        {
          id: 'insight_1',
          type: 'timing',
          confidence: 94.2,
          title: 'أفضل وقت لنشر المحتوى التقني',
          description: 'المحتوى التقني يحقق أعلى معدل تفاعل عند نشره بين 7-9 مساءً',
          impact: 'high',
          recommendations: [
            'جدولة المقالات التقنية في المساء',
            'إرسال إشعارات فورية للمهتمين بالتقنية',
            'تحسين العناوين للقراءة المسائية'
          ],
          dataPoints: 2430,
          accuracy: 89.7
        },
        {
          id: 'insight_2',
          type: 'engagement',
          confidence: 87.8,
          title: 'نمط قراءة المحتوى الطويل',
          description: 'القراء يفضلون المقالات الطويلة في نهاية الأسبوع بنسبة 34% أكثر',
          impact: 'medium',
          recommendations: [
            'نشر التحليلات العميقة يوم الجمعة',
            'إضافة ملخص تنفيذي للمقالات الطويلة',
            'تحسين تجربة القراءة على الأجهزة المحمولة'
          ],
          dataPoints: 1820,
          accuracy: 82.3
        },
        {
          id: 'insight_3',
          type: 'personalization',
          confidence: 91.5,
          title: 'تخصيص المحتوى حسب السلوك',
          description: 'المستخدمون النشطون صباحاً يفضلون الأخبار السريعة، بينما القراء المسائيون يفضلون التحليل',
          impact: 'high',
          recommendations: [
            'تخصيص الصفحة الرئيسية حسب وقت الزيارة',
            'إنشاء نشرات مختلفة لفترات اليوم',
            'تطبيق خوارزمية التوصية الزمنية'
          ],
          dataPoints: 3150,
          accuracy: 93.1
        }
      ];
      setInsights(mockInsights);
    }
  };

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);

    // Simulate analysis process
    setTimeout(() => {
      const newPredictions: BehaviorPrediction[] = Array.from({ length: 20 }, (_, i) => ({
        userId: `user_${i + 1}`,
        articleId: `article_${Math.floor(Math.random() * 50) + 1}`,
        predictions: {
          willRead: Math.random(),
          readingTime: Math.random() * 600,
          engagementScore: Math.random() * 10,
          shareability: Math.random(),
          dropOffPoint: Math.random()
        },
        personalizedElements: {
          title: `عنوان مخصص للمستخدم ${i + 1}`,
          summary: `ملخص مُحسن بناءً على تفضيلات المستخدم`,
          readingTimeEstimate: `${Math.floor(Math.random() * 10) + 1} دقائق`,
          difficulty: ['بسيط', 'متوسط', 'متقدم'][Math.floor(Math.random() * 3)]
        },
        confidence: 0.7 + Math.random() * 0.3,
        factors: [
          'تفضيل الفئة',
          'وقت القراءة المعتاد',
          'سلوك التفاعل السابق',
          'نوع الجهاز'
        ]
      }));

      setPredictions(newPredictions);
      setIsAnalyzing(false);
    }, 3000);
  };

  const InsightCard = ({ insight }: { insight: PredictiveInsight }) => (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent/50"
      onClick={() => setSelectedInsight(insight)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
          <Badge 
            variant={insight.impact === 'high' ? 'default' : 
                    insight.impact === 'medium' ? 'secondary' : 'outline'}
            className="shrink-0 mr-2"
          >
            {insight.impact === 'high' ? 'تأثير عالي' :
             insight.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              ثقة: {insight.confidence}%
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              دقة: {insight.accuracy}%
            </span>
          </div>
          <span className="text-muted-foreground">
            {insight.dataPoints.toLocaleString()} نقطة بيانات
          </span>
        </div>
        
        <Progress value={insight.confidence} className="h-2" />
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {insight.type === 'timing' && <Clock className="w-3 h-3" />}
          {insight.type === 'engagement' && <Heart className="w-3 h-3" />}
          {insight.type === 'content' && <BookOpen className="w-3 h-3" />}
          {insight.type === 'personalization' && <Users className="w-3 h-3" />}
          <span>
            {insight.type === 'timing' && 'توقيت'}
            {insight.type === 'engagement' && 'تفاعل'}
            {insight.type === 'content' && 'محتوى'}
            {insight.type === 'personalization' && 'تخصيص'}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const PredictionCard = ({ prediction }: { prediction: BehaviorPrediction }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">المستخدم #{prediction.userId.split('_')[1]}</h3>
          <Badge variant="outline" className="text-xs">
            ثقة: {(prediction.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>سيقرأ: {(prediction.predictions.willRead * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>وقت: {Math.floor(prediction.predictions.readingTime / 60)}د</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>تفاعل: {prediction.predictions.engagementScore.toFixed(1)}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            <span>مشاركة: {(prediction.predictions.shareability * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-medium">التخصيص المقترح:</p>
          <p className="text-xs text-muted-foreground">
            صعوبة: {prediction.personalizedElements.difficulty} | 
            وقت القراءة: {prediction.personalizedElements.readingTimeEstimate}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {prediction.factors.slice(0, 2).map((factor, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
              {factor}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-accent" />
          محرك التنبؤ السلوكي التفاعلي
        </h1>
        <p className="text-muted-foreground text-lg">
          تحليل وتوقع سلوك القراء لتحسين تجربة المحتوى المخصص
        </p>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">الرؤى التنبؤية</TabsTrigger>
          <TabsTrigger value="predictions">التوقعات</TabsTrigger>
          <TabsTrigger value="patterns">أنماط السلوك</TabsTrigger>
          <TabsTrigger value="optimization">التحسين</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {selectedInsight && (
            <Card className="border-accent">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{selectedInsight.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInsight(null)}
                  >
                    إغلاق
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedInsight.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-1 text-accent" />
                    <p className="text-lg font-bold">{selectedInsight.confidence}%</p>
                    <p className="text-xs text-muted-foreground">مستوى الثقة</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <ChartBar className="w-6 h-6 mx-auto mb-1 text-accent" />
                    <p className="text-lg font-bold">{selectedInsight.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">دقة التوقع</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-1 text-accent" />
                    <p className="text-lg font-bold">{selectedInsight.dataPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">نقاط البيانات</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">التوصيات المقترحة:</h4>
                  <ul className="space-y-1">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button className="w-full" variant="default">
                  تطبيق التوصيات
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">توقعات السلوك الفردي</h2>
            <Button
              onClick={runPredictiveAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  تشغيل التحليل
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <PredictionCard key={index} prediction={prediction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  أنماط القراءة الزمنية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { period: 'الصباح (6-12)', engagement: 67, users: 1240 },
                    { period: 'بعد الظهر (12-6)', engagement: 45, users: 890 },
                    { period: 'المساء (6-10)', engagement: 82, users: 1560 },
                    { period: 'الليل (10-6)', engagement: 34, users: 420 }
                  ].map((pattern) => (
                    <div key={pattern.period} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{pattern.period}</span>
                        <span>{pattern.engagement}% نشاط</span>
                      </div>
                      <Progress value={pattern.engagement} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {pattern.users.toLocaleString()} مستخدم نشط
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  تفضيلات المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'تقنية', preference: 89, trend: '+12%' },
                    { category: 'رياضة', preference: 72, trend: '+5%' },
                    { category: 'محليات', preference: 85, trend: '+8%' },
                    { category: 'اقتصاد', preference: 56, trend: '-3%' },
                    { category: 'عالم', preference: 64, trend: '+1%' }
                  ].map((pref) => (
                    <div key={pref.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{pref.category}</span>
                        <div className="flex items-center gap-2">
                          <span>{pref.preference}%</span>
                          <Badge variant="outline" className="text-xs">
                            {pref.trend}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={pref.preference} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                تحليل شرائح المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    segment: 'القراء النشطون',
                    count: 1250,
                    engagement: 92,
                    characteristics: ['قراءة يومية', 'تفاعل عالي', 'مشاركة متكررة']
                  },
                  {
                    segment: 'القراء العاديون',
                    count: 3420,
                    engagement: 67,
                    characteristics: ['قراءة أسبوعية', 'تفاعل متوسط', 'تصفح سريع']
                  },
                  {
                    segment: 'القراء الجدد',
                    count: 890,
                    engagement: 45,
                    characteristics: ['استكشاف المحتوى', 'قراءة متقطعة', 'تفاعل منخفض']
                  }
                ].map((segment) => (
                  <Card key={segment.segment} className="border-2">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold">{segment.segment}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>معدل التفاعل</span>
                          <span>{segment.engagement}%</span>
                        </div>
                        <Progress value={segment.engagement} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {segment.count.toLocaleString()} مستخدم
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">الخصائص:</p>
                        {segment.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  تحسينات مقترحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'تحسين أوقات النشر',
                    description: 'جدولة المحتوى حسب نشاط الجمهور',
                    impact: '+23% تفاعل',
                    status: 'جاهز للتطبيق'
                  },
                  {
                    title: 'تخصيص العناوين',
                    description: 'عناوين مختلفة لشرائح مختلفة',
                    impact: '+18% معدل النقر',
                    status: 'قيد التطوير'
                  },
                  {
                    title: 'توصيات المحتوى',
                    description: 'خوارزمية متقدمة للتوصيات',
                    impact: '+31% وقت القراءة',
                    status: 'جاهز للاختبار'
                  }
                ].map((optimization, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">{optimization.title}</h4>
                    <p className="text-xs text-muted-foreground">{optimization.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {optimization.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {optimization.status}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      تطبيق التحسين
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  مؤشرات الأداء المتوقعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'دقة التنبؤ', current: 87.3, target: 94.2, trend: '+6.9%' },
                    { metric: 'معدل التفاعل', current: 12.5, target: 16.8, trend: '+34%' },
                    { metric: 'وقت القراءة', current: 185, target: 243, trend: '+31%' },
                    { metric: 'معدل الاحتفاظ', current: 68.2, target: 78.9, trend: '+16%' }
                  ].map((kpi) => (
                    <div key={kpi.metric} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{kpi.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{kpi.current}</span>
                          <span>→</span>
                          <span className="font-medium">{kpi.target}</span>
                          <Badge variant="outline" className="text-xs">
                            {kpi.trend}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Progress value={(kpi.current / kpi.target) * 100} className="h-2 flex-1" />
                        <Progress value={100} className="h-2 flex-1 opacity-30" />
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