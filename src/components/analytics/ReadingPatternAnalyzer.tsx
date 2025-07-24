import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, AreaChart, Area, ScatterChart, Scatter, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { BookOpen, Clock, Eye, Heart, Share, TrendingUp, Users, Target, Zap, Brain, Search } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';

interface ReadingPattern {
  sessionId: string;
  userId: string;
  articleId: string;
  startTime: Date;
  timeSpent: number;
  scrollEvents: ScrollEvent[];
  interactionEvents: InteractionEvent[];
  readingSpeed: number;
  comprehensionScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
  exitReason: 'completed' | 'bounced' | 'interrupted' | 'lost_interest';
}

interface ScrollEvent {
  timestamp: Date;
  scrollPosition: number;
  viewportHeight: number;
  documentHeight: number;
  scrollDirection: 'up' | 'down';
  scrollSpeed: number;
}

interface InteractionEvent {
  timestamp: Date;
  type: 'click' | 'hover' | 'highlight' | 'copy' | 'share' | 'bookmark' | 'comment';
  element: string;
  duration: number;
  coordinates?: { x: number; y: number };
}

interface ReadingBehaviorInsight {
  type: 'speed' | 'attention' | 'engagement' | 'preference' | 'pattern';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data: any;
}

interface ContentPerformanceMetric {
  articleId: string;
  title: string;
  avgReadingTime: number;
  completionRate: number;
  engagementScore: number;
  retentionRate: number;
  sharingRate: number;
  qualityScore: number;
}

export function ReadingPatternAnalyzer() {
  const [patterns, setPatterns] = useKV<ReadingPattern[]>('reading-patterns', []);
  const [insights, setInsights] = useKV<ReadingBehaviorInsight[]>('reading-insights', []);
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'engagement' | 'completion'>('engagement');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);

  // Generate mock data for demonstration
  useEffect(() => {
    if (patterns.length === 0) {
      generateMockReadingPatterns();
    }
  }, []);

  const generateMockReadingPatterns = () => {
    const mockPatterns: ReadingPattern[] = [];
    const mockInsights: ReadingBehaviorInsight[] = [];

    // Generate reading patterns
    for (let i = 0; i < 200; i++) {
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const timeSpent = Math.random() * 600 + 30; // 30s to 10min
      
      mockPatterns.push({
        sessionId: `session_${i}`,
        userId: `user_${Math.floor(Math.random() * 50)}`,
        articleId: `article_${Math.floor(Math.random() * 20)}`,
        startTime,
        timeSpent,
        scrollEvents: generateScrollEvents(startTime, timeSpent),
        interactionEvents: generateInteractionEvents(startTime, timeSpent),
        readingSpeed: Math.random() * 100 + 150, // 150-250 wpm
        comprehensionScore: Math.random() * 100,
        engagementLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        exitReason: ['completed', 'bounced', 'interrupted', 'lost_interest'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate insights
    mockInsights.push(
      {
        type: 'speed',
        title: 'سرعة القراءة المثلى',
        description: 'المقالات بطول 500-800 كلمة تحقق أعلى معدلات الإكمال',
        impact: 'high',
        recommendation: 'اجعل المقالات ضمن هذا النطاق لزيادة التفاعل',
        data: { optimalLength: 650, completionRate: 78 }
      },
      {
        type: 'attention',
        title: 'نقاط فقدان الانتباه',
        description: 'معظم القراء يتوقفون عند الفقرة الثالثة إذا لم تكن جذابة',
        impact: 'high',
        recommendation: 'ضع المعلومات المهمة في بداية المقال',
        data: { criticalParagraph: 3, dropoffRate: 35 }
      },
      {
        type: 'engagement',
        title: 'أوقات التفاعل العالي',
        description: 'التفاعل يزيد بنسبة 40% في الفترة المسائية (6-9م)',
        impact: 'medium',
        recommendation: 'جدول نشر المقالات المهمة في هذا الوقت',
        data: { peakHours: [18, 19, 20, 21], engagementBoost: 40 }
      }
    );

    setPatterns(mockPatterns);
    setInsights(mockInsights);
  };

  const generateScrollEvents = (startTime: Date, duration: number): ScrollEvent[] => {
    const events: ScrollEvent[] = [];
    const eventCount = Math.floor(duration / 10); // Event every 10 seconds
    
    for (let i = 0; i < eventCount; i++) {
      events.push({
        timestamp: new Date(startTime.getTime() + i * 10000),
        scrollPosition: Math.random() * 100,
        viewportHeight: 800,
        documentHeight: 2000 + Math.random() * 1000,
        scrollDirection: Math.random() > 0.5 ? 'down' : 'up',
        scrollSpeed: Math.random() * 100
      });
    }
    
    return events;
  };

  const generateInteractionEvents = (startTime: Date, duration: number): InteractionEvent[] => {
    const events: InteractionEvent[] = [];
    const eventCount = Math.floor(Math.random() * 5); // 0-5 interactions per session
    
    for (let i = 0; i < eventCount; i++) {
      events.push({
        timestamp: new Date(startTime.getTime() + Math.random() * duration * 1000),
        type: ['click', 'hover', 'highlight', 'copy', 'share'][Math.floor(Math.random() * 5)] as any,
        element: ['title', 'paragraph', 'image', 'link', 'button'][Math.floor(Math.random() * 5)],
        duration: Math.random() * 5000,
        coordinates: { x: Math.random() * 1000, y: Math.random() * 800 }
      });
    }
    
    return events;
  };

  const getReadingTimeDistribution = () => {
    const buckets = [
      { range: '0-30s', count: 0, color: '#ff6b6b' },
      { range: '30s-2m', count: 0, color: '#feca57' },
      { range: '2-5m', count: 0, color: '#48dbfb' },
      { range: '5-10m', count: 0, color: '#0abde3' },
      { range: '10m+', count: 0, color: '#006ba6' }
    ];

    patterns.forEach(pattern => {
      const timeInMinutes = pattern.timeSpent / 60;
      if (timeInMinutes < 0.5) buckets[0].count++;
      else if (timeInMinutes < 2) buckets[1].count++;
      else if (timeInMinutes < 5) buckets[2].count++;
      else if (timeInMinutes < 10) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  };

  const getEngagementHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, hour) => {
      const hourPatterns = patterns.filter(p => p.startTime.getHours() === hour);
      const avgEngagement = hourPatterns.length > 0 
        ? hourPatterns.reduce((sum, p) => sum + (p.engagementLevel === 'high' ? 3 : p.engagementLevel === 'medium' ? 2 : 1), 0) / hourPatterns.length
        : 0;
      
      return {
        hour,
        engagement: avgEngagement,
        sessions: hourPatterns.length
      };
    });

    return hours;
  };

  const getScrollBehaviorAnalysis = () => {
    const analysis = patterns.map(pattern => {
      const scrollEvents = pattern.scrollEvents;
      const avgScrollSpeed = scrollEvents.length > 0 
        ? scrollEvents.reduce((sum, e) => sum + e.scrollSpeed, 0) / scrollEvents.length 
        : 0;
      
      const maxScroll = scrollEvents.length > 0 
        ? Math.max(...scrollEvents.map(e => e.scrollPosition)) 
        : 0;

      return {
        sessionId: pattern.sessionId,
        avgScrollSpeed,
        maxScrollDepth: maxScroll,
        engagementLevel: pattern.engagementLevel === 'high' ? 3 : pattern.engagementLevel === 'medium' ? 2 : 1,
        timeSpent: pattern.timeSpent / 60, // Convert to minutes
        comprehensionScore: pattern.comprehensionScore
      };
    });

    return analysis;
  };

  const getContentPerformanceMetrics = (): ContentPerformanceMetric[] => {
    const articleMetrics = new Map<string, any>();
    
    patterns.forEach(pattern => {
      if (!articleMetrics.has(pattern.articleId)) {
        articleMetrics.set(pattern.articleId, {
          articleId: pattern.articleId,
          title: `مقال ${pattern.articleId.split('_')[1]}`,
          readingTimes: [],
          completions: 0,
          engagementScores: [],
          sessions: 0
        });
      }
      
      const metric = articleMetrics.get(pattern.articleId);
      metric.readingTimes.push(pattern.timeSpent);
      metric.engagementScores.push(pattern.engagementLevel === 'high' ? 3 : pattern.engagementLevel === 'medium' ? 2 : 1);
      metric.sessions++;
      
      if (pattern.exitReason === 'completed') {
        metric.completions++;
      }
    });

    return Array.from(articleMetrics.values()).map(metric => ({
      articleId: metric.articleId,
      title: metric.title,
      avgReadingTime: metric.readingTimes.reduce((sum: number, time: number) => sum + time, 0) / metric.readingTimes.length / 60,
      completionRate: (metric.completions / metric.sessions) * 100,
      engagementScore: metric.engagementScores.reduce((sum: number, score: number) => sum + score, 0) / metric.engagementScores.length * 33.33,
      retentionRate: Math.random() * 100, // Mock data
      sharingRate: Math.random() * 30,
      qualityScore: Math.random() * 100
    })).sort((a, b) => b.engagementScore - a.engagementScore);
  };

  const readingTimeDistribution = getReadingTimeDistribution();
  const engagementHeatmap = getEngagementHeatmap();
  const scrollBehavior = getScrollBehaviorAnalysis();
  const contentMetrics = getContentPerformanceMetrics();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تحليل أنماط القراءة</h1>
          <p className="text-muted-foreground mt-2">
            فهم عميق لسلوك القراء وتحسين المحتوى
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">التفاعل</SelectItem>
              <SelectItem value="time">الوقت</SelectItem>
              <SelectItem value="completion">الإكمال</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">يوم</SelectItem>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.slice(0, 3).map((insight, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                  {insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
              <p className="text-sm font-medium">{insight.recommendation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="reading-time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reading-time">أوقات القراءة</TabsTrigger>
          <TabsTrigger value="engagement">الخريطة الحرارية</TabsTrigger>
          <TabsTrigger value="scroll-behavior">سلوك التمرير</TabsTrigger>
          <TabsTrigger value="content-performance">أداء المحتوى</TabsTrigger>
        </TabsList>

        <TabsContent value="reading-time" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reading Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع أوقات القراءة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  كم من الوقت يقضي المستخدمون في قراءة المحتوى
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={readingTimeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count }) => `${range}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {readingTimeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Reading Speed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل سرعة القراءة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  متوسط سرعة القراءة لكل المستخدمين
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">185</div>
                    <div className="text-sm text-muted-foreground">كلمة/دقيقة</div>
                    <div className="text-xs">متوسط السرعة</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">68%</div>
                    <div className="text-sm text-muted-foreground">معدل الفهم</div>
                    <div className="text-xs">متوسط الاستيعاب</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">قراءة سريعة (&gt;250 كلمة/دقيقة)</span>
                    <Badge variant="secondary">15%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">قراءة متوسطة (150-250 كلمة/دقيقة)</span>
                    <Badge variant="secondary">65%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">قراءة بطيئة (&lt;150 كلمة/دقيقة)</span>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>خريطة التفاعل الحرارية</CardTitle>
              <p className="text-sm text-muted-foreground">
                مستويات التفاعل حسب ساعات اليوم
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={engagementHeatmap}>
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(hour) => `الساعة ${hour}:00`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      name="مستوى التفاعل"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scroll-behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل سلوك التمرير</CardTitle>
              <p className="text-sm text-muted-foreground">
                العلاقة بين سرعة التمرير وعمق القراءة والتفاعل
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={scrollBehavior}>
                    <XAxis 
                      dataKey="maxScrollDepth" 
                      name="عمق التمرير"
                      unit="%"
                    />
                    <YAxis 
                      dataKey="timeSpent" 
                      name="وقت القراءة"
                      unit=" دقيقة"
                    />
                    <ChartTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={<ChartTooltipContent />}
                    />
                    <Scatter 
                      dataKey="engagementLevel" 
                      fill="#8884d8"
                      name="مستوى التفاعل"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المحتوى</CardTitle>
              <p className="text-sm text-muted-foreground">
                مقاييس الأداء لكل مقال
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentMetrics.slice(0, 10).map((metric, index) => (
                  <div key={metric.articleId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{metric.title}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>🕒 {metric.avgReadingTime.toFixed(1)} د</span>
                        <span>✅ {metric.completionRate.toFixed(1)}%</span>
                        <span>❤️ {metric.engagementScore.toFixed(1)}%</span>
                        <span>↗️ {metric.sharingRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {metric.qualityScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">نقاط الجودة</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI-Powered Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            توصيات الذكاء الاصطناعي
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            اقتراحات مدعومة بالذكاء الاصطناعي لتحسين أنماط القراءة
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium">تحسين العناوين</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                العناوين القصيرة (5-8 كلمات) تحقق معدل نقر أعلى بنسبة 35%
              </p>
              <Button size="sm" variant="outline">تطبيق</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium">تحسين التوقيت</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                النشر بين 7-9 صباحاً يزيد التفاعل بنسبة 28%
              </p>
              <Button size="sm" variant="outline">جدولة</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">تحسين المحتوى</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                إضافة نقاط أو قوائم تزيد معدل الإكمال بنسبة 22%
              </p>
              <Button size="sm" variant="outline">تطبيق</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}