import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { Clock, Eye, BookOpen, MousePointer, Smartphone, Monitor, Calendar, TrendingUp, Users, Heart, Share, Bookmark, MessageCircle } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';

interface ReadingSession {
  id: string;
  userId: string;
  articleId: string;
  startTime: Date;
  endTime: Date;
  scrollDepth: number;
  readingProgress: number;
  device: string;
  referrer: string;
  exitPoint: string;
  interactionEvents: InteractionEvent[];
}

interface InteractionEvent {
  type: 'scroll' | 'click' | 'pause' | 'resume' | 'share' | 'bookmark' | 'comment';
  timestamp: Date;
  data: any;
}

interface UserBehaviorPattern {
  userId: string;
  preferredReadingTime: string[];
  averageReadingSpeed: number;
  contentPreferences: string[];
  deviceUsage: Record<string, number>;
  engagementScore: number;
  loyaltyLevel: 'new' | 'casual' | 'regular' | 'loyal' | 'champion';
}

interface ReadingMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  averageReadingTime: number;
  completionRate: number;
  bounceRate: number;
  returnVisitorRate: number;
  engagementRate: number;
}

export function UserBehaviorAnalytics() {
  const [sessions, setSessions] = useKV<ReadingSession[]>('reading-sessions', []);
  const [userPatterns, setUserPatterns] = useKV<UserBehaviorPattern[]>('user-patterns', []);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (sessions.length === 0) {
      generateMockData();
    }
  }, []);

  const generateMockData = () => {
    const mockSessions: ReadingSession[] = [];
    const mockPatterns: UserBehaviorPattern[] = [];
    
    // Generate sessions for last 30 days
    for (let i = 0; i < 500; i++) {
      const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.random() * 10 * 60 * 1000 + 30000; // 30s to 10min
      
      mockSessions.push({
        id: `session_${i}`,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        articleId: `article_${Math.floor(Math.random() * 50)}`,
        startTime,
        endTime: new Date(startTime.getTime() + duration),
        scrollDepth: Math.random() * 100,
        readingProgress: Math.random() * 100,
        device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        referrer: ['direct', 'social', 'search', 'newsletter'][Math.floor(Math.random() * 4)],
        exitPoint: ['end', 'middle', 'beginning'][Math.floor(Math.random() * 3)],
        interactionEvents: []
      });
    }

    // Generate user patterns
    for (let i = 0; i < 100; i++) {
      mockPatterns.push({
        userId: `user_${i}`,
        preferredReadingTime: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)],
        averageReadingSpeed: Math.random() * 200 + 150, // 150-350 wpm
        contentPreferences: ['tech', 'politics', 'sports', 'lifestyle'].slice(0, Math.floor(Math.random() * 3) + 1),
        deviceUsage: {
          mobile: Math.random() * 60 + 20,
          desktop: Math.random() * 40 + 10,
          tablet: Math.random() * 20 + 5
        },
        engagementScore: Math.random() * 100,
        loyaltyLevel: ['new', 'casual', 'regular', 'loyal', 'champion'][Math.floor(Math.random() * 5)] as any
      });
    }

    setSessions(mockSessions);
    setUserPatterns(mockPatterns);
  };

  const calculateMetrics = (): ReadingMetrics => {
    const filteredSessions = filterSessionsByTimeframe(sessions);
    
    return {
      totalSessions: filteredSessions.length,
      averageSessionDuration: filteredSessions.reduce((sum, s) => sum + (s.endTime.getTime() - s.startTime.getTime()), 0) / filteredSessions.length / 1000 / 60,
      averageReadingTime: filteredSessions.reduce((sum, s) => sum + s.readingProgress, 0) / filteredSessions.length,
      completionRate: (filteredSessions.filter(s => s.readingProgress > 80).length / filteredSessions.length) * 100,
      bounceRate: (filteredSessions.filter(s => s.readingProgress < 20).length / filteredSessions.length) * 100,
      returnVisitorRate: 65, // Mock data
      engagementRate: filteredSessions.reduce((sum, s) => sum + s.scrollDepth, 0) / filteredSessions.length
    };
  };

  const filterSessionsByTimeframe = (sessions: ReadingSession[]) => {
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return sessions.filter(s => s.startTime >= cutoff);
  };

  const getReadingTimeDistribution = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessions: sessions.filter(s => s.startTime.getHours() === i).length,
      avgEngagement: sessions
        .filter(s => s.startTime.getHours() === i)
        .reduce((sum, s) => sum + s.readingProgress, 0) / 
        Math.max(1, sessions.filter(s => s.startTime.getHours() === i).length)
    }));
    
    return hours;
  };

  const getDeviceUsageData = () => {
    const deviceCounts = sessions.reduce((acc, session) => {
      acc[session.device] = (acc[session.device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percentage: (count / sessions.length) * 100
    }));
  };

  const getEngagementTrends = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const daySessions = sessions.filter(s => 
        s.startTime.toDateString() === date.toDateString()
      );
      
      return {
        date: date.toLocaleDateString('ar-SA'),
        sessions: daySessions.length,
        avgReadingTime: daySessions.reduce((sum, s) => sum + s.readingProgress, 0) / Math.max(1, daySessions.length),
        completionRate: (daySessions.filter(s => s.readingProgress > 80).length / Math.max(1, daySessions.length)) * 100
      };
    }).reverse();

    return last30Days;
  };

  const getUserSegments = () => {
    const segments = userPatterns.reduce((acc, pattern) => {
      acc[pattern.loyaltyLevel] = (acc[pattern.loyaltyLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(segments).map(([level, count]) => ({
      level,
      count,
      percentage: (count / userPatterns.length) * 100
    }));
  };

  const metrics = calculateMetrics();
  const timeDistribution = getReadingTimeDistribution();
  const deviceUsage = getDeviceUsageData();
  const engagementTrends = getEngagementTrends();
  const userSegments = getUserSegments();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تحليلات سلوك المستخدمين</h1>
          <p className="text-muted-foreground mt-2">
            فهم أنماط القراءة والتفاعل لتحسين تجربة المستخدم
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedTimeframe === period ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe(period)}
              size="sm"
            >
              {period === '7d' ? '7 أيام' : period === '30d' ? '30 يوم' : '90 يوم'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجلسات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% من الفترة السابقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت القراءة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageSessionDuration.toFixed(1)} د</div>
            <p className="text-xs text-muted-foreground">
              +5% من الفترة السابقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +8% من الفترة السابقة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="reading-patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reading-patterns">أنماط القراءة</TabsTrigger>
          <TabsTrigger value="engagement">التفاعل</TabsTrigger>
          <TabsTrigger value="devices">الأجهزة</TabsTrigger>
          <TabsTrigger value="user-segments">شرائح المستخدمين</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        <TabsContent value="reading-patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reading Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع أوقات القراءة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  عدد الجلسات حسب ساعات اليوم
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeDistribution}>
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
                        dataKey="sessions" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                        name="عدد الجلسات"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Reading Behavior Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>أنماط السلوك القرائي</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تحليل عادات القراءة المختلفة
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">القراءة السريعة (أقل من دقيقتين)</span>
                    <Badge variant="secondary">32%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">القراءة المتوسطة (2-5 دقائق)</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">القراءة العميقة (أكثر من 5 دقائق)</span>
                    <Badge variant="secondary">23%</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">نقاط الخروج الشائعة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">بداية المقال</span>
                      <span className="text-sm text-muted-foreground">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">منتصف المقال</span>
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">نهاية المقال</span>
                      <span className="text-sm text-muted-foreground">50%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات التفاعل</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تطور معدلات التفاعل عبر الزمن
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementTrends}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="avgReadingTime" 
                        stroke="#8884d8" 
                        name="متوسط وقت القراءة"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completionRate" 
                        stroke="#82ca9d" 
                        name="معدل الإكمال"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Interaction Types */}
            <Card>
              <CardHeader>
                <CardTitle>أنواع التفاعل</CardTitle>
                <p className="text-sm text-muted-foreground">
                  توزيع أنواع التفاعل المختلفة
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-sm text-muted-foreground">مشاهدة</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">23%</div>
                    <div className="text-sm text-muted-foreground">إعجاب</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Share className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">12%</div>
                    <div className="text-sm text-muted-foreground">مشاركة</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Bookmark className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">8%</div>
                    <div className="text-sm text-muted-foreground">حفظ</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Usage */}
            <Card>
              <CardHeader>
                <CardTitle>استخدام الأجهزة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  توزيع الجلسات حسب نوع الجهاز
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }) => `${device}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {deviceUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Device Performance */}
            <Card>
              <CardHeader>
                <CardTitle>أداء الأجهزة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  مقاييس الأداء حسب نوع الجهاز
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceUsage.map((device, index) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {device.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device.device === 'desktop' && <Monitor className="h-4 w-4" />}
                        {device.device === 'tablet' && <Monitor className="h-4 w-4" />}
                        <span className="capitalize">{device.device}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {device.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={device.percentage} />
                  </div>
                ))}
                
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium">متوسط وقت القراءة حسب الجهاز</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">الهاتف المحمول</span>
                      <span className="text-sm font-medium">2.3 دقيقة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">سطح المكتب</span>
                      <span className="text-sm font-medium">4.7 دقيقة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">الجهاز اللوحي</span>
                      <span className="text-sm font-medium">3.5 دقيقة</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Loyalty Segments */}
            <Card>
              <CardHeader>
                <CardTitle>شرائح الولاء</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تصنيف المستخدمين حسب مستوى الولاء
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userSegments}>
                      <XAxis dataKey="level" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Segment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل الشرائح</CardTitle>
                <p className="text-sm text-muted-foreground">
                  خصائص كل شريحة من المستخدمين
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSegments.map((segment) => (
                  <div key={segment.level} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{segment.level}</span>
                      <Badge variant="outline">{segment.count} مستخدم</Badge>
                    </div>
                    <Progress value={segment.percentage} className="mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {segment.percentage.toFixed(1)}% من إجمالي المستخدمين
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الاتجاهات والتوقعات</CardTitle>
              <p className="text-sm text-muted-foreground">
                تحليل الاتجاهات المستقبلية وتوقعات النمو
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={engagementTrends}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#8884d8" 
                      name="عدد الجلسات"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgReadingTime" 
                      stroke="#82ca9d" 
                      name="متوسط وقت القراءة"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#ffc658" 
                      name="معدل الإكمال"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>التوصيات والإجراءات</CardTitle>
          <p className="text-sm text-muted-foreground">
            اقتراحات لتحسين تجربة المستخدم بناءً على التحليلات
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">زيادة التفاعل</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                تحسين المحتوى للفترات ذات التفاعل المنخفض
              </p>
              <Button size="sm" variant="outline">تطبيق</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span className="font-medium">تحسين الجوال</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                تطوير تجربة القراءة على الأجهزة المحمولة
              </p>
              <Button size="sm" variant="outline">تطبيق</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">أوقات النشر</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                جدولة المحتوى في أوقات الذروة
              </p>
              <Button size="sm" variant="outline">تطبيق</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}