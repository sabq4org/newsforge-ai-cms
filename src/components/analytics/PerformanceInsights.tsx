import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnalytics, mockArticles } from '@/lib/mockData';
import { 
  TrendUp, 
  TrendDown, 
  Eye, 
  Heart, 
  ShareNetwork, 
  Clock,
  Target,
  Trophy,
  Lightbulb,
  ChartBar
} from '@phosphor-icons/react';

const chartConfig = {
  performance: {
    label: "Performance Score",
    color: "hsl(var(--chart-1))",
  },
  engagement: {
    label: "Engagement Rate",
    color: "hsl(var(--chart-2))",
  },
  views: {
    label: "Views",
    color: "hsl(var(--chart-3))",
  },
  readTime: {
    label: "Read Time",
    color: "hsl(var(--chart-4))",
  },
};

// Mock performance insights data
const performanceInsights = {
  authorPerformance: [
    { 
      month: 'Jan', 
      averageViews: 1250, 
      engagementRate: 6.8, 
      articlesPublished: 8,
      performanceScore: 78
    },
    { 
      month: 'Feb', 
      averageViews: 1420, 
      engagementRate: 7.2, 
      articlesPublished: 10,
      performanceScore: 82
    },
    { 
      month: 'Mar', 
      averageViews: 1180, 
      engagementRate: 6.1, 
      articlesPublished: 7,
      performanceScore: 74
    },
    { 
      month: 'Apr', 
      averageViews: 1650, 
      engagementRate: 8.4, 
      articlesPublished: 12,
      performanceScore: 89
    }
  ],
  contentInsights: [
    {
      title: 'Optimal posting time',
      titleAr: 'أفضل وقت للنشر',
      value: '10:00 AM',
      description: 'Articles published around 10 AM get 23% more engagement',
      descriptionAr: 'المقالات المنشورة حوالي الساعة 10 صباحًا تحصل على تفاعل أكثر بنسبة 23%',
      impact: 'high',
      icon: Clock
    },
    {
      title: 'Content length sweet spot',
      titleAr: 'الطول الأمثل للمحتوى',
      value: '800-1200 words',
      description: 'Articles in this range have 35% better completion rates',
      descriptionAr: 'المقالات في هذا النطاق لديها معدلات إتمام أفضل بنسبة 35%',
      impact: 'high',
      icon: Target
    },
    {
      title: 'Top performing category',
      titleAr: 'أفضل فئة أداءً',
      value: 'Technology',
      description: 'Your tech articles get 2.3x more shares on average',
      descriptionAr: 'مقالاتك التقنية تحصل على مشاركات أكثر بـ 2.3 مرة في المتوسط',
      impact: 'medium',
      icon: Trophy
    },
    {
      title: 'Image impact',
      titleAr: 'تأثير الصور',
      value: '+40% engagement',
      description: 'Articles with 3-5 images perform significantly better',
      descriptionAr: 'المقالات التي تحتوي على 3-5 صور تؤدي بشكل أفضل بكثير',
      impact: 'medium',
      icon: Lightbulb
    }
  ],
  weeklyTrends: [
    { day: 'Mon', views: 1200, engagement: 6.2 },
    { day: 'Tue', views: 1450, engagement: 7.1 },
    { day: 'Wed', views: 1680, engagement: 8.3 },
    { day: 'Thu', views: 1520, engagement: 7.8 },
    { day: 'Fri', views: 1890, engagement: 9.1 },
    { day: 'Sat', views: 980, engagement: 5.4 },
    { day: 'Sun', views: 760, engagement: 4.2 }
  ]
};

export function PerformanceInsights() {
  const { language, user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const performanceMetrics = [
    {
      label: language.code === 'ar' ? 'نقاط الأداء' : 'Performance Score',
      value: 85,
      change: '+7',
      trend: 'up' as const,
      color: 'text-blue-600',
      icon: ChartBar
    },
    {
      label: language.code === 'ar' ? 'متوسط المشاهدات' : 'Avg Views/Article',
      value: '1,520',
      change: '+12%',
      trend: 'up' as const,
      color: 'text-green-600',
      icon: Eye
    },
    {
      label: language.code === 'ar' ? 'معدل التفاعل' : 'Engagement Rate',
      value: '7.8%',
      change: '+1.2%',
      trend: 'up' as const,
      color: 'text-purple-600',
      icon: Heart
    },
    {
      label: language.code === 'ar' ? 'مقالات هذا الشهر' : 'Articles This Month',
      value: '12',
      change: '+3',
      trend: 'up' as const,
      color: 'text-orange-600',
      icon: Target
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language.code === 'ar' ? 'رؤى الأداء' : 'Performance Insights'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {language.code === 'ar' 
            ? 'تحليل مفصل لأداء المحتوى واقتراحات للتحسين' 
            : 'Detailed analysis of your content performance and improvement suggestions'}
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendUp size={14} className="text-green-600" />
                    ) : (
                      <TrendDown size={14} className="text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${metric.color}`}>
                  <metric.icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">
            {language.code === 'ar' ? 'الاتجاهات' : 'Trends'}
          </TabsTrigger>
          <TabsTrigger value="insights">
            {language.code === 'ar' ? 'الرؤى' : 'Insights'}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            {language.code === 'ar' ? 'التوصيات' : 'Recommendations'}
          </TabsTrigger>
        </TabsList>

        {/* Performance Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'الأداء الشهري' : 'Monthly Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={performanceInsights.authorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="performanceScore" 
                      stroke="var(--color-performance)" 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagementRate" 
                      stroke="var(--color-engagement)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Weekly Engagement Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'نمط التفاعل الأسبوعي' : 'Weekly Engagement Pattern'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={performanceInsights.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceInsights.contentInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-muted ${
                      insight.impact === 'high' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      <insight.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {language.code === 'ar' ? insight.titleAr : insight.title}
                        </h3>
                        <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                          {insight.impact === 'high' 
                            ? (language.code === 'ar' ? 'تأثير عالي' : 'High Impact')
                            : (language.code === 'ar' ? 'تأثير متوسط' : 'Medium Impact')
                          }
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-primary mb-2">
                        {insight.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language.code === 'ar' ? insight.descriptionAr : insight.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI-Powered Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb size={20} />
                {language.code === 'ar' ? 'توصيات مدعومة بالذكاء الاصطناعي' : 'AI-Powered Recommendations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        {language.code === 'ar' 
                          ? 'استخدم المزيد من الصور التفاعلية' 
                          : 'Use More Interactive Images'}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {language.code === 'ar'
                          ? 'المقالات التي تحتوي على 3-5 صور تحصل على تفاعل أكثر بنسبة 40%. جرب إضافة المزيد من الرسوم البيانية والصور التوضيحية.'
                          : 'Articles with 3-5 images get 40% more engagement. Try adding more infographics and illustrative images.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        {language.code === 'ar' 
                          ? 'انشر في الأوقات المثلى' 
                          : 'Publish at Optimal Times'}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {language.code === 'ar'
                          ? 'جمهورك أكثر نشاطًا في الساعة 10:00 صباحًا و 3:00 مساءً. جدولة المقالات في هذه الأوقات يمكن أن تزيد المشاهدات بنسبة 25%.'
                          : 'Your audience is most active at 10:00 AM and 3:00 PM. Scheduling articles at these times can increase views by 25%.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                        {language.code === 'ar' 
                          ? 'ركز على المحتوى التقني' 
                          : 'Focus on Technology Content'}
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        {language.code === 'ar'
                          ? 'مقالاتك التقنية تؤدي بشكل استثنائي مع معدل مشاركة أعلى بـ 2.3 مرة. فكر في زيادة تركيزك على هذه المواضيع.'
                          : 'Your technology articles perform exceptionally well with 2.3x higher share rates. Consider increasing your focus on these topics.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}