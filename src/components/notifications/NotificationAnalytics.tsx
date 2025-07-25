import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRinging, 
  Lightning, 
  Clock, 
  Eye,
  Vibrate,
  Volume,
  Smartphone,
  Mail,
  Globe,
  ChartBarHorizontal,
  Target,
  TrendingUp,
  Users,
  Settings,
  AlertTriangle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface NotificationStats {
  totalSent: number;
  totalViews: number;
  clickThroughRate: number;
  deliveryRate: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  channelPerformance: Record<string, { sent: number; delivered: number; opened: number }>;
  timeBasedStats: {
    hourly: Record<number, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    optOutRate: number;
    averageResponseTime: number;
  };
}

const mockStats: NotificationStats = {
  totalSent: 15420,
  totalViews: 12336,
  clickThroughRate: 0.23,
  deliveryRate: 0.96,
  categoryBreakdown: {
    'local': 5200,
    'world': 3800,
    'sports': 2900,
    'business': 2100,
    'technology': 1420
  },
  priorityBreakdown: {
    'critical': 340,
    'high': 2800,
    'medium': 8900,
    'low': 3380
  },
  channelPerformance: {
    'browser': { sent: 15420, delivered: 14803, opened: 11842 },
    'email': { sent: 12400, delivered: 11936, opened: 6758 },
    'sms': { sent: 3200, delivered: 3136, opened: 2504 },
    'inApp': { sent: 15420, delivered: 15420, opened: 12336 }
  },
  timeBasedStats: {
    hourly: {
      6: 1200, 7: 1800, 8: 2400, 9: 1900, 10: 1600, 11: 1400,
      12: 2100, 13: 1700, 14: 1500, 15: 1300, 16: 1800, 17: 2200,
      18: 2600, 19: 2400, 20: 2000, 21: 1600, 22: 800, 23: 400
    },
    daily: {
      'Mon': 2800, 'Tue': 3200, 'Wed': 3100, 'Thu': 3400,
      'Fri': 2200, 'Sat': 1800, 'Sun': 2100
    },
    weekly: {
      'Week 1': 18600, 'Week 2': 19200, 'Week 3': 17800, 'Week 4': 20400
    }
  },
  userEngagement: {
    totalUsers: 45000,
    activeUsers: 38400,
    optOutRate: 0.08,
    averageResponseTime: 45 // in seconds
  }
};

export function NotificationAnalytics() {
  const [stats] = useKV<NotificationStats>('notification-stats', mockStats);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hourly' | 'daily' | 'weekly'>('daily');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}م`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}ك`;
    }
    return num.toString();
  };

  const formatPercentage = (decimal: number): string => {
    return `${(decimal * 100).toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Lightning className="w-4 h-4" />;
      case 'high': return <BellRinging className="w-4 h-4" />;
      case 'medium': return <Bell className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'browser': return <Globe className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'inApp': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إحصائيات الإشعارات</h1>
          <p className="text-muted-foreground">تحليل شامل لأداء نظام الإشعارات والتفاعل</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="gap-1">
            <TrendingUp className="w-4 h-4" />
            معدل التفاعل {formatPercentage(stats.clickThroughRate)}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              إجمالي الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalSent)}</div>
            <p className="text-xs text-muted-foreground">
              تم إرسالها هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              إجمالي المشاهدات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              معدل الوصول {formatPercentage(stats.totalViews / stats.totalSent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              معدل النقر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.clickThroughRate)}</div>
            <p className="text-xs text-muted-foreground">
              من المشاهدات إلى النقرات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              معدل التسليم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.deliveryRate)}</div>
            <p className="text-xs text-muted-foreground">
              إشعارات تم تسليمها بنجاح
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              توزيع الإشعارات حسب الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(priority)}>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(priority)}
                        <span>
                          {priority === 'critical' ? 'حرجة' : 
                           priority === 'high' ? 'عالية' :
                           priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatNumber(count)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPercentage(count / stats.totalSent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarHorizontal className="w-5 h-5" />
              الإشعارات حسب التصنيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => {
                const categoryNames = {
                  'local': 'محليات',
                  'world': 'العالم',
                  'sports': 'رياضة',
                  'business': 'أعمال',
                  'technology': 'تقنية'
                };
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{categoryNames[category as keyof typeof categoryNames] || category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(stats.categoryBreakdown))) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-sm w-12 text-right">{formatNumber(count)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              أداء قنوات التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.channelPerformance).map(([channel, performance]) => {
                const channelNames = {
                  'browser': 'المتصفح',
                  'email': 'الإيميل',
                  'sms': 'الرسائل النصية',
                  'inApp': 'داخل التطبيق'
                };
                
                const deliveryRate = performance.delivered / performance.sent;
                const openRate = performance.opened / performance.delivered;
                
                return (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel)}
                        <span className="font-medium">
                          {channelNames[channel as keyof typeof channelNames] || channel}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(performance.sent)} مرسل
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">معدل التسليم</div>
                        <div className="font-semibold">{formatPercentage(deliveryRate)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">معدل الفتح</div>
                        <div className="font-semibold">{formatPercentage(openRate)}</div>
                      </div>
                    </div>
                    
                    <Separator />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              تفاعل المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{formatNumber(stats.userEngagement.totalUsers)}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(stats.userEngagement.activeUsers)}</div>
                  <div className="text-sm text-muted-foreground">المستخدمون النشطون</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold">{formatPercentage(stats.userEngagement.optOutRate)}</div>
                  <div className="text-sm text-muted-foreground">معدل إلغاء الاشتراك</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.userEngagement.averageResponseTime}ث</div>
                  <div className="text-sm text-muted-foreground">متوسط وقت الاستجابة</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">معدل التفاعل العام</span>
                  <span className="font-semibold">
                    {formatPercentage(stats.userEngagement.activeUsers / stats.userEngagement.totalUsers)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: `${(stats.userEngagement.activeUsers / stats.userEngagement.totalUsers) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              تحليل التوقيت
            </div>
            <div className="flex gap-2">
              {(['hourly', 'daily', 'weekly'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe === 'hourly' ? 'ساعي' : 
                   timeframe === 'daily' ? 'يومي' : 'أسبوعي'}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {Object.entries(stats.timeBasedStats[selectedTimeframe]).map(([time, count]) => {
              const maxCount = Math.max(...Object.values(stats.timeBasedStats[selectedTimeframe]));
              const heightPercentage = (count / maxCount) * 100;
              
              return (
                <div key={time} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-muted-foreground">{time}</div>
                  <div 
                    className="w-4 bg-primary rounded-t"
                    style={{ height: `${Math.max(heightPercentage, 5)}px` }}
                    title={`${count} إشعار`}
                  />
                  <div className="text-xs font-medium">{formatNumber(count)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            تنبيهات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>معدل إلغاء الاشتراك مرتفع نسبياً ({formatPercentage(stats.userEngagement.optOutRate)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>انخفاض في الإشعارات الحرجة - قد تحتاج لمراجعة معايير التصنيف</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>أداء ممتاز لقناة "داخل التطبيق" - معدل فتح {formatPercentage(stats.channelPerformance.inApp.opened / stats.channelPerformance.inApp.delivered)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}