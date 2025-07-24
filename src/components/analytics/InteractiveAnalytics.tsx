import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { 
  TrendingUp, 
  Users,
  Clock,
  Target,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  Filter,
  Download
} from '@phosphor-icons/react';

interface PerformanceData {
  timestamp: Date;
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  engagementScore: number;
}

interface ContentPerformance {
  articleId: string;
  title: string;
  category: string;
  views: number;
  engagement: number;
  readTime: number;
  shareCount: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

const chartConfig = {
  pageViews: {
    label: "Page Views",
    color: "hsl(var(--chart-1))",
  },
  uniqueVisitors: {
    label: "Unique Visitors", 
    color: "hsl(var(--chart-2))",
  },
  sessionDuration: {
    label: "Session Duration",
    color: "hsl(var(--chart-3))",
  },
  bounceRate: {
    label: "Bounce Rate",
    color: "hsl(var(--chart-4))",
  },
  conversionRate: {
    label: "Conversion Rate",
    color: "hsl(var(--chart-5))",
  },
  engagementScore: {
    label: "Engagement Score",
    color: "hsl(var(--chart-1))",
  },
};

interface InteractiveAnalyticsProps {
  timeRange?: string;
  onExport?: (data: any) => void;
}

export function InteractiveAnalytics({ timeRange = '7d', onExport }: InteractiveAnalyticsProps) {
  const { language, hasPermission } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('pageViews');
  const [dateRange, setDateRange] = useState(timeRange);
  const [filter, setFilter] = useState('all');
  const [performanceData, setPerformanceData] = useKV<PerformanceData[]>('performance-analytics', []);
  const [contentPerformance, setContentPerformance] = useKV<ContentPerformance[]>('content-performance', []);

  // Generate sample performance data
  useEffect(() => {
    const generateData = () => {
      const data: PerformanceData[] = [];
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp: date,
          pageViews: Math.floor(Math.random() * 2000) + 1000,
          uniqueVisitors: Math.floor(Math.random() * 800) + 400,
          sessionDuration: Math.floor(Math.random() * 180) + 120,
          bounceRate: Math.floor(Math.random() * 30) + 25,
          conversionRate: Math.random() * 5 + 2,
          engagementScore: Math.floor(Math.random() * 40) + 60
        });
      }
      
      setPerformanceData(data);
    };

    const generateContentData = () => {
      const sampleArticles: ContentPerformance[] = [
        {
          articleId: '1',
          title: 'الذكاء الاصطناعي في الصحافة',
          category: 'تقنية',
          views: 15420,
          engagement: 8.5,
          readTime: 4.2,
          shareCount: 234,
          performance: 'excellent'
        },
        {
          articleId: '2',
          title: 'تطورات السوق السعودي',
          category: 'أعمال',
          views: 12890,
          engagement: 6.8,
          readTime: 3.8,
          shareCount: 187,
          performance: 'good'
        },
        {
          articleId: '3',
          title: 'مستجدات الرياضة المحلية',
          category: 'رياضة',
          views: 9780,
          engagement: 5.2,
          readTime: 2.9,
          shareCount: 156,
          performance: 'average'
        },
        {
          articleId: '4',
          title: 'أخبار المناخ والبيئة',
          category: 'بيئة',
          views: 6540,
          engagement: 4.1,
          readTime: 2.1,
          shareCount: 89,
          performance: 'poor'
        }
      ];
      
      setContentPerformance(sampleArticles);
    };

    if (performanceData.length === 0) generateData();
    if (contentPerformance.length === 0) generateContentData();
  }, [performanceData.length, contentPerformance.length, setPerformanceData, setContentPerformance]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    const labels = {
      excellent: language.code === 'ar' ? 'ممتاز' : 'Excellent',
      good: language.code === 'ar' ? 'جيد' : 'Good',
      average: language.code === 'ar' ? 'متوسط' : 'Average',
      poor: language.code === 'ar' ? 'ضعيف' : 'Poor'
    };
    return labels[performance as keyof typeof labels] || performance;
  };

  // Format data for charts
  const chartData = performanceData.map(item => ({
    date: item.timestamp.toLocaleDateString(language.code === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    }),
    pageViews: item.pageViews,
    uniqueVisitors: item.uniqueVisitors,
    sessionDuration: item.sessionDuration,
    bounceRate: item.bounceRate,
    conversionRate: item.conversionRate,
    engagementScore: item.engagementScore
  }));

  // Radar chart data for performance overview
  const radarData = [
    {
      metric: language.code === 'ar' ? 'المشاهدات' : 'Views',
      value: 85,
      fullMark: 100
    },
    {
      metric: language.code === 'ar' ? 'التفاعل' : 'Engagement',
      value: 72,
      fullMark: 100
    },
    {
      metric: language.code === 'ar' ? 'وقت القراءة' : 'Read Time',
      value: 68,
      fullMark: 100
    },
    {
      metric: language.code === 'ar' ? 'المشاركات' : 'Shares',
      value: 91,
      fullMark: 100
    },
    {
      metric: language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate',
      value: 76,
      fullMark: 100
    }
  ];

  const handleExport = () => {
    const exportData = {
      performanceData,
      contentPerformance,
      summary: {
        totalViews: performanceData.reduce((sum, item) => sum + item.pageViews, 0),
        avgEngagement: performanceData.reduce((sum, item) => sum + item.engagementScore, 0) / performanceData.length,
        topPerformingContent: contentPerformance.filter(item => item.performance === 'excellent')
      }
    };
    onExport?.(exportData);
  };

  if (!hasPermission('view-analytics')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">
          {language.code === 'ar' ? 'غير مصرح' : 'Access Denied'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language.code === 'ar' ? 'ليس لديك صلاحية لعرض التحليلات' : 'You do not have permission to view analytics'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language.code === 'ar' ? 'التحليلات التفاعلية' : 'Interactive Analytics'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language.code === 'ar' 
              ? 'تحليل تفصيلي للأداء مع إمكانية التخصيص والتفاعل' 
              : 'Detailed performance analysis with customization and interaction capabilities'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language.code === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="excellent">{language.code === 'ar' ? 'ممتاز' : 'Excellent'}</SelectItem>
              <SelectItem value="good">{language.code === 'ar' ? 'جيد' : 'Good'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{language.code === 'ar' ? '7 أيام' : '7 Days'}</SelectItem>
              <SelectItem value="30d">{language.code === 'ar' ? '30 يوم' : '30 Days'}</SelectItem>
              <SelectItem value="90d">{language.code === 'ar' ? '90 يوم' : '90 Days'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {language.code === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Radar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {language.code === 'ar' ? 'نظرة عامة على الأداء' : 'Performance Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {language.code === 'ar' ? 'المؤشرات الرئيسية' : 'Key Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {performanceData.reduce((sum, item) => sum + item.pageViews, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language.code === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {(performanceData.reduce((sum, item) => sum + item.engagementScore, 0) / performanceData.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {language.code === 'ar' ? 'معدل التفاعل' : 'Avg Engagement'}
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {Math.floor(performanceData.reduce((sum, item) => sum + item.sessionDuration, 0) / performanceData.length / 60)}:{String(Math.floor(performanceData.reduce((sum, item) => sum + item.sessionDuration, 0) / performanceData.length % 60)).padStart(2, '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language.code === 'ar' ? 'متوسط وقت الجلسة' : 'Avg Session Time'}
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {(performanceData.reduce((sum, item) => sum + item.bounceRate, 0) / performanceData.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">
            {language.code === 'ar' ? 'الاتجاهات' : 'Trends'}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {language.code === 'ar' ? 'الأداء' : 'Performance'}
          </TabsTrigger>
          <TabsTrigger value="content">
            {language.code === 'ar' ? 'المحتوى' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="comparison">
            {language.code === 'ar' ? 'المقارنة' : 'Comparison'}
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {language.code === 'ar' ? 'اتجاهات الأداء' : 'Performance Trends'}
                </div>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pageViews">{language.code === 'ar' ? 'مشاهدات الصفحة' : 'Page Views'}</SelectItem>
                    <SelectItem value="uniqueVisitors">{language.code === 'ar' ? 'زوار فريدون' : 'Unique Visitors'}</SelectItem>
                    <SelectItem value="engagementScore">{language.code === 'ar' ? 'درجة التفاعل' : 'Engagement Score'}</SelectItem>
                    <SelectItem value="sessionDuration">{language.code === 'ar' ? 'مدة الجلسة' : 'Session Duration'}</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={`var(--color-${selectedMetric})`}
                    fill={`var(--color-${selectedMetric})`}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="var(--color-conversionRate)" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="bounceRate" fill="var(--color-bounceRate)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language.code === 'ar' ? 'أداء المحتوى' : 'Content Performance'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance
                  .filter(item => filter === 'all' || item.performance === filter)
                  .map((item, index) => (
                  <div key={item.articleId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge className={getPerformanceColor(item.performance)}>
                          {getPerformanceLabel(item.performance)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">{item.views.toLocaleString()}</span>
                          <span className="block text-xs">{language.code === 'ar' ? 'مشاهدة' : 'Views'}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.engagement}%</span>
                          <span className="block text-xs">{language.code === 'ar' ? 'تفاعل' : 'Engagement'}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.readTime}m</span>
                          <span className="block text-xs">{language.code === 'ar' ? 'وقت قراءة' : 'Read Time'}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.shareCount}</span>
                          <span className="block text-xs">{language.code === 'ar' ? 'مشاركة' : 'Shares'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language.code === 'ar' ? 'مقارنة المقاييس' : 'Metrics Comparison'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="var(--color-pageViews)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="var(--color-uniqueVisitors)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagementScore" 
                    stroke="var(--color-engagementScore)" 
                    strokeWidth={2}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}