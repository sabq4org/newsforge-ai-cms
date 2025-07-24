import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Eye, 
  Heart, 
  ShareNetwork, 
  Users,
  TrendUp,
  Activity,
  Clock
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { safeTimeFormat } from '@/lib/utils';

interface RealTimeData {
  timestamp: Date;
  activeUsers: number;
  pageViews: number;
  newLikes: number;
  newShares: number;
}

interface LiveMetric {
  label: string;
  labelAr: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
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
};

export function RealTimeAnalytics() {
  const { language } = useAuth();
  const [realtimeData, setRealtimeData] = useKV<RealTimeData[]>('realtime-analytics', []);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: RealTimeData = {
        timestamp: now,
        activeUsers: Math.floor(Math.random() * 50) + 20,
        pageViews: Math.floor(Math.random() * 100) + 50,
        newLikes: Math.floor(Math.random() * 10),
        newShares: Math.floor(Math.random() * 5),
      };

      setRealtimeData(current => {
        const updated = [...current, newDataPoint];
        // Keep only last 20 data points
        return updated.slice(-20);
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, setRealtimeData]);

  // Calculate current metrics
  const latestData = realtimeData[realtimeData.length - 1];
  const previousData = realtimeData[realtimeData.length - 2];
  
  const liveMetrics: LiveMetric[] = [
    {
      label: 'Active Users',
      labelAr: 'المستخدمون النشطون',
      value: latestData?.activeUsers || 0,
      change: latestData && previousData ? latestData.activeUsers - previousData.activeUsers : 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Page Views',
      labelAr: 'مشاهدات الصفحة',
      value: latestData?.pageViews || 0,
      change: latestData && previousData ? latestData.pageViews - previousData.pageViews : 0,
      icon: Eye,
      color: 'text-green-600'
    },
    {
      label: 'New Likes',
      labelAr: 'إعجابات جديدة',
      value: latestData?.newLikes || 0,
      change: latestData && previousData ? latestData.newLikes - previousData.newLikes : 0,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      label: 'New Shares',
      labelAr: 'مشاركات جديدة',
      value: latestData?.newShares || 0,
      change: latestData && previousData ? latestData.newShares - previousData.newShares : 0,
      icon: ShareNetwork,
      color: 'text-purple-600'
    }
  ];

  // Format data for chart display
  const chartData = realtimeData.map((data, index) => ({
    time: safeTimeFormat(data.timestamp, language.code === 'ar' ? 'ar-SA' : 'en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    activeUsers: data.activeUsers,
    pageViews: data.pageViews
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language.code === 'ar' ? 'التحليلات المباشرة' : 'Real-Time Analytics'}
          </h2>
          <p className="text-muted-foreground">
            {language.code === 'ar' ? 'مراقبة النشاط الحالي في الوقت الفعلي' : 'Monitor current activity in real-time'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isLive ? (language.code === 'ar' ? 'مباشر' : 'Live') : (language.code === 'ar' ? 'متوقف' : 'Paused')}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                {language.code === 'ar' ? 'إيقاف' : 'Pause'}
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                {language.code === 'ar' ? 'استئناف' : 'Resume'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language.code === 'ar' ? metric.labelAr : metric.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendUp 
                      size={14} 
                      className={metric.change >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'} 
                    />
                    <span className={`text-xs font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}
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

      {/* Real-Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            {language.code === 'ar' ? 'النشاط المباشر' : 'Live Activity'}
            <Badge variant="outline" className="ml-auto">
              {language.code === 'ar' ? 'آخر 5 دقائق' : 'Last 5 min'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={chartData}>
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
                  dot={{ fill: "var(--color-activeUsers)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  stroke="var(--color-pageViews)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-pageViews)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>{language.code === 'ar' ? 'انتظار البيانات المباشرة...' : 'Waiting for real-time data...'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language.code === 'ar' ? 'الأحداث الأخيرة' : 'Recent Events'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realtimeData.slice(-5).reverse().map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">
                      {language.code === 'ar' ? 'نشاط جديد' : 'New Activity'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.activeUsers} {language.code === 'ar' ? 'مستخدم نشط' : 'active users'} • {data.pageViews} {language.code === 'ar' ? 'مشاهدة' : 'views'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {safeTimeFormat(data.timestamp)}
                </div>
              </div>
            ))}
            
            {realtimeData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>{language.code === 'ar' ? 'لا توجد أحداث حديثة' : 'No recent events'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}