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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { safeDateFormat, safeTimeFormat } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';
import { mockAnalytics } from '@/lib/mockData';
import { 
  Eye, 
  Heart, 
  ShareNetwork, 
  Users,
  Clock,
  TrendingUp,
  TrendDown,
  Activity,
  Target,
  Globe,
  DeviceMobile,
  Desktop,
  DeviceTablet,
  Calendar,
  FileText,
  Download,
  RefreshCw
} from '@phosphor-icons/react';

interface RealTimeData {
  timestamp: Date;
  activeUsers: number;
  pageViews: number;
  newLikes: number;
  newShares: number;
  bounceRate: number;
  avgSessionTime: number;
}

interface MetricCard {
  id: string;
  title: string;
  titleAr: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  description?: string;
  descriptionAr?: string;
}

const chartConfig = {
  activeUsers: {
    label: "Active Users",
    color: "hsl(var(--chart-1))",
  },
  pageViews: {
    label: "Page Views", 
    color: "hsl(var(--chart-2))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-3))",
  },
  shares: {
    label: "Shares",
    color: "hsl(var(--chart-4))",
  },
  bounceRate: {
    label: "Bounce Rate",
    color: "hsl(var(--chart-5))",
  },
};

interface AnalyticsDashboardProps {
  onNavigate?: (view: string) => void;
}

export function AnalyticsDashboard({ onNavigate }: AnalyticsDashboardProps) {
  const { language, hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState('30s');
  const [isLive, setIsLive] = useState(true);
  const [realtimeData, setRealtimeData] = useKV<RealTimeData[]>('analytics-realtime-data', []);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate real-time data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: RealTimeData = {
        timestamp: now,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        pageViews: Math.floor(Math.random() * 200) + 100,
        newLikes: Math.floor(Math.random() * 20) + 5,
        newShares: Math.floor(Math.random() * 10) + 2,
        bounceRate: Math.floor(Math.random() * 20) + 25,
        avgSessionTime: Math.floor(Math.random() * 180) + 120
      };

      setRealtimeData(current => {
        const updated = [...current, newDataPoint];
        return updated.slice(-50); // Keep last 50 data points
      });
      setLastUpdated(now);
    }, refreshInterval === '30s' ? 30000 : refreshInterval === '1m' ? 60000 : 5000);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval, setRealtimeData]);

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

  // Calculate current metrics
  const latestData = realtimeData[realtimeData.length - 1];
  const previousData = realtimeData[realtimeData.length - 2];

  const calculateChange = (current: number, previous: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100);
  };

  const metricCards: MetricCard[] = [
    {
      id: 'active-users',
      title: 'Active Users',
      titleAr: 'المستخدمون النشطون',
      value: latestData?.activeUsers || 0,
      change: latestData && previousData ? calculateChange(latestData.activeUsers, previousData.activeUsers) : 0,
      changeType: latestData && previousData && latestData.activeUsers >= previousData.activeUsers ? 'up' : 'down',
      icon: Users,
      color: 'text-blue-600',
      description: 'Users currently browsing',
      descriptionAr: 'المستخدمون الذين يتصفحون حالياً'
    },
    {
      id: 'page-views',
      title: 'Page Views',
      titleAr: 'مشاهدات الصفحة',
      value: latestData?.pageViews || 0,
      change: latestData && previousData ? calculateChange(latestData.pageViews, previousData.pageViews) : 0,
      changeType: latestData && previousData && latestData.pageViews >= previousData.pageViews ? 'up' : 'down',
      icon: Eye,
      color: 'text-green-600',
      description: 'Total page views',
      descriptionAr: 'إجمالي مشاهدات الصفحة'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      titleAr: 'التفاعل',
      value: `${((latestData?.newLikes || 0) + (latestData?.newShares || 0))}`,
      change: latestData && previousData ? calculateChange(
        (latestData.newLikes + latestData.newShares),
        (previousData.newLikes + previousData.newShares)
      ) : 0,
      changeType: 'up',
      icon: Heart,
      color: 'text-red-600',
      description: 'Likes + Shares',
      descriptionAr: 'الإعجابات + المشاركات'
    },
    {
      id: 'bounce-rate',
      title: 'Bounce Rate',
      titleAr: 'معدل الارتداد',
      value: `${latestData?.bounceRate || 0}%`,
      change: latestData && previousData ? calculateChange(latestData.bounceRate, previousData.bounceRate) : 0,
      changeType: latestData && previousData && latestData.bounceRate <= previousData.bounceRate ? 'up' : 'down',
      icon: Target,
      color: 'text-orange-600',
      description: 'Users leaving quickly',
      descriptionAr: 'المستخدمون الذين يغادرون بسرعة'
    }
  ];

  const formatChartData = () => {
    return realtimeData.map(data => ({
      time: safeTimeFormat(data.timestamp, language.code === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      activeUsers: data.activeUsers,
      pageViews: data.pageViews,
      likes: data.newLikes,
      shares: data.newShares,
      bounceRate: data.bounceRate
    }));
  };

  const deviceData = [
    { name: 'Mobile', value: 65, color: 'hsl(var(--chart-1))' },
    { name: 'Desktop', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Tablet', value: 10, color: 'hsl(var(--chart-3))' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language.code === 'ar' ? 'لوحة التحليلات المباشرة' : 'Real-Time Analytics Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language.code === 'ar' 
              ? 'مراقبة شاملة للأداء والتفاعل في الوقت الفعلي' 
              : 'Comprehensive real-time performance and engagement monitoring'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {language.code === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {safeTimeFormat(lastUpdated)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5s">5s</SelectItem>
              <SelectItem value="30s">30s</SelectItem>
              <SelectItem value="1m">1m</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">{language.code === 'ar' ? 'ساعة واحدة' : '1 Hour'}</SelectItem>
              <SelectItem value="24h">{language.code === 'ar' ? '24 ساعة' : '24 Hours'}</SelectItem>
              <SelectItem value="7d">{language.code === 'ar' ? '7 أيام' : '7 Days'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <Activity className="w-4 h-4 mr-2" />
                {language.code === 'ar' ? 'إيقاف' : 'Pause'}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {language.code === 'ar' ? 'استئناف' : 'Resume'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {language.code === 'ar' ? metric.titleAr : metric.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {metric.changeType === 'up' ? (
                      <TrendingUp size={14} className="text-green-600" />
                    ) : metric.changeType === 'down' ? (
                      <TrendDown size={14} className="text-red-600" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                    <span className={`text-xs font-medium ${
                      metric.changeType === 'up' ? 'text-green-600' : 
                      metric.changeType === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language.code === 'ar' ? metric.descriptionAr : metric.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">
            {language.code === 'ar' ? 'المباشر' : 'Real-Time'}
          </TabsTrigger>
          <TabsTrigger value="traffic">
            {language.code === 'ar' ? 'حركة المرور' : 'Traffic'}
          </TabsTrigger>
          <TabsTrigger value="engagement">
            {language.code === 'ar' ? 'التفاعل' : 'Engagement'}
          </TabsTrigger>
          <TabsTrigger value="devices">
            {language.code === 'ar' ? 'الأجهزة' : 'Devices'}
          </TabsTrigger>
        </TabsList>

        {/* Real-Time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  {language.code === 'ar' ? 'النشاط المباشر' : 'Live Activity'}
                  <Badge variant="outline" className="ml-auto">
                    {language.code === 'ar' ? 'مباشر' : 'Live'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="var(--color-activeUsers)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-activeUsers)", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke="var(--color-pageViews)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-pageViews)", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Live Events */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'الأحداث المباشرة' : 'Live Events'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {realtimeData.slice(-10).reverse().map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-medium">
                            {language.code === 'ar' ? 'نشاط جديد' : 'New Activity'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.activeUsers} {language.code === 'ar' ? 'مستخدم' : 'users'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {safeTimeFormat(data.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'حركة المرور عبر الزمن' : 'Traffic Over Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      stackId="1"
                      stroke="var(--color-pageViews)" 
                      fill="var(--color-pageViews)" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stackId="2"
                      stroke="var(--color-activeUsers)" 
                      fill="var(--color-activeUsers)" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'مصادر الزيارات' : 'Traffic Sources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.trafficSources.map((source) => (
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

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'مقاييس التفاعل' : 'Engagement Metrics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={formatChartData().slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="likes" fill="var(--color-likes)" />
                    <Bar dataKey="shares" fill="var(--color-shares)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bounce Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'اتجاه معدل الارتداد' : 'Bounce Rate Trend'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="bounceRate" 
                      stroke="var(--color-bounceRate)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-bounceRate)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'توزيع الأجهزة' : 'Device Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Device Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'تفاصيل الأجهزة' : 'Device Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.deviceBreakdown.map((device) => {
                    const deviceIcons: Record<string, React.ElementType> = {
                      Mobile: DeviceMobile,
                      Desktop: Desktop,
                      Tablet: DeviceTablet
                    };
                    const IconComponent = deviceIcons[device.device] || DeviceMobile;
                    
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language.code === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => onNavigate?.('insights')}>
              <FileText className="w-4 h-4 mr-2" />
              {language.code === 'ar' ? 'رؤى الأداء' : 'Performance Insights'}
            </Button>
            
            <Button variant="outline" className="justify-start" onClick={() => onNavigate?.('category-analytics')}>
              <Target className="w-4 h-4 mr-2" />
              {language.code === 'ar' ? 'تحليل الفئات' : 'Category Analytics'}
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              {language.code === 'ar' ? 'تصدير التقرير' : 'Export Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}