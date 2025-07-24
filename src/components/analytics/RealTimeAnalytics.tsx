import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { mockArticles } from '@/lib/mockData';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface LiveActivity {
  id: string;
  type: 'view' | 'like' | 'share' | 'comment';
  articleId: string;
  articleTitle: string;
  timestamp: Date;
  userId?: string;
  location?: string;
}

interface RealTimeAnalyticsProps {
  articles?: Article[];
}

export function RealTimeAnalytics({ articles = mockArticles }: RealTimeAnalyticsProps) {
  const [currentMetrics, setCurrentMetrics] = useKV<RealTimeMetric[]>('realtime-metrics', []);
  const [liveActivities, setLiveActivities] = useKV<LiveActivity[]>('live-activities', []);
  const [isLive, setIsLive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize real-time metrics
  const initializeMetrics = () => {
    const metrics: RealTimeMetric[] = [
      {
        id: 'active-readers',
        label: 'القراء النشطون',
        value: Math.floor(Math.random() * 500) + 100,
        change: Math.random() * 20 - 10,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: Users,
        color: 'text-primary'
      },
      {
        id: 'page-views',
        label: 'مشاهدات الصفحة',
        value: Math.floor(Math.random() * 2000) + 500,
        change: Math.random() * 15 - 5,
        changeType: Math.random() > 0.3 ? 'increase' : 'decrease',
        icon: Eye,
        color: 'text-blue-500'
      },
      {
        id: 'engagement-rate',
        label: 'معدل التفاعل',
        value: Math.random() * 15 + 5,
        change: Math.random() * 3 - 1,
        changeType: Math.random() > 0.4 ? 'increase' : 'decrease',
        icon: Heart,
        color: 'text-red-500'
      },
      {
        id: 'shares',
        label: 'المشاركات',
        value: Math.floor(Math.random() * 150) + 20,
        change: Math.random() * 25 - 10,
        changeType: Math.random() > 0.6 ? 'increase' : 'decrease',
        icon: Share2,
        color: 'text-green-500'
      },
      {
        id: 'comments',
        label: 'التعليقات',
        value: Math.floor(Math.random() * 80) + 10,
        change: Math.random() * 30 - 15,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: MessageCircle,
        color: 'text-orange-500'
      },
      {
        id: 'avg-time',
        label: 'متوسط وقت القراءة',
        value: Math.random() * 180 + 60,
        change: Math.random() * 20 - 10,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: Clock,
        color: 'text-purple-500'
      }
    ];

    setCurrentMetrics(metrics);
  };

  // Generate live activities
  const generateLiveActivities = () => {
    const activityTypes: Array<LiveActivity['type']> = ['view', 'like', 'share', 'comment'];
    const locations = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'أبها', 'القصيم'];
    
    const newActivities: LiveActivity[] = [];
    
    // Generate 10-15 recent activities
    for (let i = 0; i < Math.floor(Math.random() * 6) + 10; i++) {
      const article = articles[Math.floor(Math.random() * articles.length)];
      const activity: LiveActivity = {
        id: `activity_${Date.now()}_${i}`,
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        articleId: article.id,
        articleTitle: article.title,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        location: locations[Math.floor(Math.random() * locations.length)]
      };
      newActivities.push(activity);
    }
    
    // Sort by timestamp (newest first)
    newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setLiveActivities(currentActivities => {
      const combined = [...newActivities, ...currentActivities];
      return combined.slice(0, 50); // Keep only latest 50
    });
  };

  // Update metrics periodically
  const updateMetrics = () => {
    setCurrentMetrics(current => 
      current.map(metric => ({
        ...metric,
        value: metric.id === 'avg-time' 
          ? Math.max(30, metric.value + (Math.random() * 20 - 10))
          : Math.max(0, metric.value + Math.floor(Math.random() * 10 - 5)),
        change: Math.random() * 20 - 10,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease'
      }))
    );
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isLive) return;

    const interval = setInterval(() => {
      updateMetrics();
      if (Math.random() > 0.7) { // 30% chance to generate new activities
        generateLiveActivities();
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isLive]);

  // Initialize on mount
  useEffect(() => {
    initializeMetrics();
    generateLiveActivities();
  }, []);

  // Get trending articles based on recent activity
  const getTrendingArticles = () => {
    const articleActivity: { [articleId: string]: number } = {};
    
    // Count recent activities for each article
    liveActivities.forEach(activity => {
      if (!articleActivity[activity.articleId]) {
        articleActivity[activity.articleId] = 0;
      }
      
      // Weight different activity types
      const weights = { view: 1, like: 3, share: 5, comment: 4 };
      articleActivity[activity.articleId] += weights[activity.type];
    });
    
    // Sort articles by activity score
    return Object.entries(articleActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([articleId, score]) => {
        const article = articles.find(a => a.id === articleId);
        return article ? { article, score } : null;
      })
      .filter(Boolean);
  };

  // Format metric values
  const formatMetricValue = (metric: RealTimeMetric) => {
    if (metric.id === 'avg-time') {
      const minutes = Math.floor(metric.value / 60);
      const seconds = Math.floor(metric.value % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (metric.id === 'engagement-rate') {
      return `${metric.value.toFixed(1)}%`;
    }
    
    return metric.value.toLocaleString();
  };

  // Get activity type label and color
  const getActivityInfo = (type: LiveActivity['type']) => {
    const info = {
      view: { label: 'عرض', color: 'text-blue-500', bgColor: 'bg-blue-50' },
      like: { label: 'إعجاب', color: 'text-red-500', bgColor: 'bg-red-50' },
      share: { label: 'مشاركة', color: 'text-green-500', bgColor: 'bg-green-50' },
      comment: { label: 'تعليق', color: 'text-orange-500', bgColor: 'bg-orange-50' }
    };
    return info[type];
  };

  const trendingArticles = getTrendingArticles();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التحليلات المباشرة</h1>
          <p className="text-muted-foreground mt-1">
            متابعة الأداء والتفاعل في الوقت الفعلي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isLive ? 'مباشر' : 'متوقف'}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} className={`ml-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'إيقاف التحديث' : 'تحديث تلقائي'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download size={16} className="ml-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMetrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold mb-1">{formatMetricValue(metric)}</p>
                    <div className="flex items-center gap-1">
                      {metric.changeType === 'increase' ? (
                        <TrendingUp size={14} className="text-green-500" />
                      ) : metric.changeType === 'decrease' ? (
                        <TrendingDown size={14} className="text-red-500" />
                      ) : null}
                      <span className={`text-xs ${
                        metric.changeType === 'increase' ? 'text-green-500' : 
                        metric.changeType === 'decrease' ? 'text-red-500' : 
                        'text-gray-500'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">آخر ساعة</span>
                    </div>
                  </div>
                  <Icon size={32} className={metric.color} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              النشاط المباشر
            </CardTitle>
            <CardDescription>
              آخر التفاعلات مع المحتوى
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveActivities.slice(0, 15).map(activity => {
                const activityInfo = getActivityInfo(activity.type);
                const timeAgo = Math.floor((Date.now() - activity.timestamp.getTime()) / 60000);
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activityInfo.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${activityInfo.color}`}>
                          {activityInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo === 0 ? 'الآن' : `${timeAgo} د`}
                        </span>
                        {activity.location && (
                          <span className="text-xs text-muted-foreground">• {activity.location}</span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-1" title={activity.articleTitle}>
                        {activity.articleTitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trending Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              المقالات المُتداولة الآن
            </CardTitle>
            <CardDescription>
              الأكثر تفاعلاً في الوقت الحالي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingArticles.map((item, index) => {
                if (!item) return null;
                const { article, score } = item;
                
                return (
                  <div key={article.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2 mb-1">{article.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.category?.name}</span>
                        <span>نقاط النشاط: {score}</span>
                        <span>{new Date(article.createdAt).toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={Math.min((score / 20) * 100, 100)} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {trendingArticles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 size={32} className="mx-auto mb-2" />
                  <p>لا توجد مقالات متداولة حالياً</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart size={20} />
            خط زمني للتفاعل
          </CardTitle>
          <CardDescription>
            تطور التفاعل خلال الساعات الماضية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2 h-32">
            {Array.from({ length: 12 }, (_, i) => {
              const value = Math.random() * 100;
              return (
                <div key={i} className="flex flex-col justify-end items-center">
                  <div 
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(Date.now() - (11 - i) * 300000).toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل الارتداد</p>
                <p className="text-2xl font-bold">32.5%</p>
                <p className="text-xs text-green-500">↓ 2.1% من الأمس</p>
              </div>
              <PieChart size={32} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الصفحات لكل جلسة</p>
                <p className="text-2xl font-bold">2.8</p>
                <p className="text-xs text-green-500">↑ 0.3 من الأمس</p>
              </div>
              <BarChart3 size={32} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مدة الجلسة المتوسطة</p>
                <p className="text-2xl font-bold">4:32</p>
                <p className="text-xs text-green-500">↑ 0:15 من الأمس</p>
              </div>
              <Clock size={32} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}