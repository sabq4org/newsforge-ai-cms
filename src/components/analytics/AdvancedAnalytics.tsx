import { useState } from 'react';
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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnalytics } from '@/lib/mockData';
import { 
  Eye, 
  Heart, 
  ShareNetwork, 
  FileText, 
  TrendUp, 
  TrendDown, 
  Calendar,
  Users,
  DeviceMobile,
  Desktop,
  DeviceTablet,
  Clock,
  Target,
  Globe
} from '@phosphor-icons/react';

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  uniqueVisitors: {
    label: "Unique Visitors", 
    color: "hsl(var(--chart-2))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-1))",
  },
  shares: {
    label: "Shares",
    color: "hsl(var(--chart-2))",
  },
  comments: {
    label: "Comments",
    color: "hsl(var(--chart-3))",
  },
};

interface AdvancedAnalyticsProps {
  onNavigate?: (view: string) => void;
}

export function AdvancedAnalytics({ onNavigate }: AdvancedAnalyticsProps) {
  const { language, hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('views');
  const analytics = mockAnalytics;

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

  const deviceIcons = {
    Mobile: DeviceMobile,
    Desktop: Desktop,
    Tablet: DeviceTablet
  };

  // Enhanced KPI cards with more metrics
  const kpiCards = [
    {
      title: language.code === 'ar' ? 'إجمالي المشاهدات' : 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      change: '+12.5%',
      icon: Eye,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      title: language.code === 'ar' ? 'معدل التفاعل' : 'Engagement Rate',
      value: '7.2%',
      change: '+2.1%',
      icon: Heart,
      color: 'text-red-600',
      trend: 'up'
    },
    {
      title: language.code === 'ar' ? 'متوسط وقت القراءة' : 'Avg. Reading Time',
      value: `${Math.floor(analytics.readingTime.averageTime / 60)}:${String(analytics.readingTime.averageTime % 60).padStart(2, '0')}`,
      change: '+8.3%',
      icon: Clock,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      title: language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate',
      value: `${analytics.readingTime.bounceRate}%`,
      change: '-3.2%',
      icon: Target,
      color: 'text-orange-600',
      trend: 'down'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language.code === 'ar' ? 'التحليلات المتقدمة' : 'Advanced Analytics'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language.code === 'ar' 
              ? 'تحليل شامل لأداء المحتوى وسلوك المستخدمين' 
              : 'Comprehensive insights into content performance and user behavior'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{language.code === 'ar' ? '7 أيام' : '7 Days'}</SelectItem>
              <SelectItem value="30d">{language.code === 'ar' ? '30 يوم' : '30 Days'}</SelectItem>
              <SelectItem value="90d">{language.code === 'ar' ? '90 يوم' : '90 Days'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate?.('insights')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {language.code === 'ar' ? 'رؤى الأداء' : 'Performance Insights'}
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {kpi.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendUp size={14} className="text-green-600" />
                    ) : (
                      <TrendDown size={14} className="text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                  <kpi.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="traffic">
            {language.code === 'ar' ? 'حركة المرور' : 'Traffic'}
          </TabsTrigger>
          <TabsTrigger value="engagement">
            {language.code === 'ar' ? 'التفاعل' : 'Engagement'}
          </TabsTrigger>
          <TabsTrigger value="content">
            {language.code === 'ar' ? 'المحتوى' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="audience">
            {language.code === 'ar' ? 'الجمهور' : 'Audience'}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {language.code === 'ar' ? 'الأداء' : 'Performance'}
          </TabsTrigger>
        </TabsList>

        {/* Traffic Analytics */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Views Over Time Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={20} />
                  {language.code === 'ar' ? 'المشاهدات عبر الزمن' : 'Views Over Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={analytics.viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1"
                      stroke="var(--color-views)" 
                      fill="var(--color-views)" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uniqueVisitors" 
                      stackId="2"
                      stroke="var(--color-uniqueVisitors)" 
                      fill="var(--color-uniqueVisitors)" 
                      fillOpacity={0.6}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={20} />
                  {language.code === 'ar' ? 'مصادر الزيارات' : 'Traffic Sources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trafficSources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-muted-foreground">{source.percentage}%</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {source.visitors.toLocaleString()} {language.code === 'ar' ? 'زائر' : 'visitors'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Analytics */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'التفاعل عبر الزمن' : 'Engagement Over Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={analytics.engagementOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="likes" 
                      stroke="var(--color-likes)" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shares" 
                      stroke="var(--color-shares)" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comments" 
                      stroke="var(--color-comments)" 
                      strokeWidth={2} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Reading Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'مقاييس القراءة' : 'Reading Metrics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {Math.floor(analytics.readingTime.averageTime / 60)}:{String(analytics.readingTime.averageTime % 60).padStart(2, '0')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language.code === 'ar' ? 'متوسط وقت القراءة' : 'Average Reading Time'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {language.code === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {analytics.readingTime.completionRate}%
                        </span>
                      </div>
                      <Progress value={analytics.readingTime.completionRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {analytics.readingTime.bounceRate}%
                        </span>
                      </div>
                      <Progress value={analytics.readingTime.bounceRate} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Performance */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'أداء الفئات' : 'Category Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={analytics.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Author Performance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'أداء الكُتاب' : 'Author Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.authorPerformance.map((author, index) => (
                    <div key={author.authorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{author.authorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {author.totalArticles} {language.code === 'ar' ? 'مقال' : 'articles'} • {author.totalViews.toLocaleString()} {language.code === 'ar' ? 'مشاهدة' : 'views'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {author.avgEngagement}% {language.code === 'ar' ? 'تفاعل' : 'engagement'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Analytics */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'توزيع الأجهزة' : 'Device Breakdown'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.deviceBreakdown.map((device) => {
                    const IconComponent = deviceIcons[device.device as keyof typeof deviceIcons];
                    return (
                      <div key={device.device} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <IconComponent size={20} />
                          </div>
                          <div>
                            <p className="font-medium">{device.device}</p>
                            <p className="text-sm text-muted-foreground">
                              {device.users.toLocaleString()} {language.code === 'ar' ? 'مستخدم' : 'users'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{device.percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Articles */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'أفضل المقالات' : 'Top Performing Articles'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topArticles.map((article, index) => (
                    <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {article.views.toLocaleString()} {language.code === 'ar' ? 'مشاهدة' : 'views'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {article.trend === 'up' && <TrendUp size={16} className="text-green-600" />}
                        {article.trend === 'down' && <TrendDown size={16} className="text-red-600" />}
                        {article.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Overview */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'ملخص الأداء' : 'Performance Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {(analytics.totalViews / analytics.totalArticles).toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language.code === 'ar' ? 'مشاهدة/مقال' : 'Views/Article'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {((analytics.engagement.likes + analytics.engagement.shares + analytics.engagement.comments) / analytics.totalViews * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language.code === 'ar' ? 'معدل التفاعل' : 'Engagement Rate'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {analytics.publishedToday}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language.code === 'ar' ? 'منشور اليوم' : 'Published Today'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {analytics.totalArticles.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language.code === 'ar' ? 'إجمالي المقالات' : 'Total Articles'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    {language.code === 'ar' ? 'تقرير مفصل' : 'Detailed Report'}
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {language.code === 'ar' ? 'جدولة تقرير' : 'Schedule Report'}
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <ShareNetwork className="w-4 h-4 mr-2" />
                    {language.code === 'ar' ? 'تصدير البيانات' : 'Export Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}