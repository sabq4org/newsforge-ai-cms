import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnalytics } from '@/lib/mockData';
import { 
  TrendingUp, 
  TrendDown, 
  Eye, 
  Heart, 
  ShareNetwork, 
  Clock,
  Target,
  Users
} from '@phosphor-icons/react';

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-2))",
  },
};

interface AnalyticsSummaryProps {
  compact?: boolean;
}

export function AnalyticsSummary({ compact = false }: AnalyticsSummaryProps) {
  const { language } = useAuth();
  const analytics = mockAnalytics;

  const summaryMetrics = [
    {
      label: language.code === 'ar' ? 'إجمالي المشاهدات' : 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      label: language.code === 'ar' ? 'معدل التفاعل' : 'Engagement Rate',
      value: '7.2%',
      change: '+1.8%',
      trend: 'up' as const,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      label: language.code === 'ar' ? 'وقت القراءة' : 'Avg Read Time',
      value: `${Math.floor(analytics.readingTime.averageTime / 60)}:${String(analytics.readingTime.averageTime % 60).padStart(2, '0')}`,
      change: '+8.3%',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-green-600'
    },
    {
      label: language.code === 'ar' ? 'مستخدمون نشطون' : 'Active Users',
      value: '2.4K',
      change: '+15.2%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  // Simplified view data for the mini chart
  const miniChartData = analytics.viewsOverTime.slice(-7).map((item, index) => ({
    day: index + 1,
    views: item.views,
    engagement: item.views * 0.072 // 7.2% engagement rate
  }));

  if (compact) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryMetrics.map((metric, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <p className="text-lg font-bold">
                  {metric.value}
                </p>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp size={12} className="text-green-600" />
                  ) : (
                    <TrendDown size={12} className="text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <metric.icon size={16} className={metric.color} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, index) => (
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
                      <TrendingUp size={14} className="text-green-600" />
                    ) : (
                      <TrendDown size={14} className="text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mini Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language.code === 'ar' ? 'الاتجاه الأسبوعي' : 'Weekly Trend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <AreaChart data={miniChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
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
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                {language.code === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
              </h4>
              <Badge variant="outline">
                {analytics.readingTime.completionRate}%
              </Badge>
            </div>
            <Progress value={analytics.readingTime.completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language.code === 'ar' 
                ? 'نسبة القراء الذين أكملوا المقالة' 
                : 'Percentage of readers who finished articles'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                {language.code === 'ar' ? 'معدل الارتداد' : 'Bounce Rate'}
              </h4>
              <Badge variant="outline">
                {analytics.readingTime.bounceRate}%
              </Badge>
            </div>
            <Progress value={analytics.readingTime.bounceRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language.code === 'ar' 
                ? 'نسبة الزوار الذين غادروا بسرعة' 
                : 'Percentage of visitors who left quickly'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                {language.code === 'ar' ? 'الجودة الإجمالية' : 'Overall Quality'}
              </h4>
              <Badge variant="default">
                {language.code === 'ar' ? 'ممتاز' : 'Excellent'}
              </Badge>
            </div>
            <Progress value={87} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language.code === 'ar' 
                ? 'تقييم شامل لأداء المحتوى' 
                : 'Overall content performance rating'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}