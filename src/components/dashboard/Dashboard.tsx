import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnalytics } from '@/lib/mockData';
import { RealTimeAnalytics, AnalyticsSummary } from '@/components/analytics';
import { 
  Eye, 
  Heart, 
  ShareNetwork, 
  FileText, 
  TrendingUp, 
  TrendDown, 
  Calendar,
  Users,
  TrendingUp,
  Activity
} from '@phosphor-icons/react';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { language, hasPermission } = useAuth();
  const analytics = mockAnalytics;

  const stats = [
    {
      title: language.code === 'ar' ? 'إجمالي المشاهدات' : 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      change: '+12.5%',
      trend: 'up' as const
    },
    {
      title: language.code === 'ar' ? 'إجمالي المقالات' : 'Total Articles',
      value: analytics.totalArticles.toLocaleString(),
      icon: FileText,
      color: 'text-green-600',
      change: '+3.2%',
      trend: 'up' as const
    },
    {
      title: language.code === 'ar' ? 'نُشر اليوم' : 'Published Today',
      value: analytics.publishedToday.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      change: '+1',
      trend: 'up' as const
    },
    {
      title: language.code === 'ar' ? 'الإعجابات' : 'Total Likes',
      value: analytics.engagement.likes.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      change: '+8.7%',
      trend: 'up' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language.code === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language.code === 'ar' 
            ? 'نظرة عامة على أداء المحتوى والنشاط الحديث' 
            : 'Overview of content performance and recent activity'}
        </p>
      </div>

      {/* Analytics Overview */}
      {hasPermission('view-analytics') && (
        <AnalyticsSummary compact />
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp size={14} className="text-green-600" />
                    ) : (
                      <TrendDown size={14} className="text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={() => onNavigate?.('analytics')}
        >
          <TrendingUp size={16} />
          {language.code === 'ar' ? 'عرض التحليلات المتقدمة' : 'View Advanced Analytics'}
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => onNavigate?.('realtime')}
        >
          <Activity size={16} />
          {language.code === 'ar' ? 'المراقبة المباشرة' : 'Real-time Monitor'}
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText size={16} />
          {language.code === 'ar' ? 'تقرير شهري' : 'Monthly Report'}
        </Button>
      </div>

      {/* Real-Time Analytics Section */}
      {hasPermission('view-analytics') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              {language.code === 'ar' ? 'النشاط المباشر' : 'Live Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeAnalytics />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        {hasPermission('view-analytics') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                {language.code === 'ar' ? 'أفضل المقالات' : 'Top Articles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.views.toLocaleString()} {language.code === 'ar' ? 'مشاهدة' : 'views'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      {article.trend === 'up' && <TrendingUp size={16} className="text-green-600" />}
                      {article.trend === 'down' && <TrendDown size={16} className="text-red-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              {language.code === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {activity.type === 'publish' && <Calendar size={16} className="text-primary" />}
                    {activity.type === 'edit' && <FileText size={16} className="text-orange-600" />}
                    {activity.type === 'create' && <FileText size={16} className="text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.user} {' '}
                      {language.code === 'ar' 
                        ? activity.type === 'publish' ? 'نشر' : activity.type === 'edit' ? 'عدّل' : 'أنشأ'
                        : activity.type === 'publish' ? 'published' : activity.type === 'edit' ? 'edited' : 'created'
                      } {' '}
                      {activity.article}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString(
                        language.code === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Overview */}
      {hasPermission('view-analytics') && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language.code === 'ar' ? 'نظرة عامة على التفاعل' : 'Engagement Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-600" />
                    <span className="text-sm font-medium">
                      {language.code === 'ar' ? 'الإعجابات' : 'Likes'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {analytics.engagement.likes.toLocaleString()}
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShareNetwork size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">
                      {language.code === 'ar' ? 'المشاركات' : 'Shares'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {analytics.engagement.shares.toLocaleString()}
                  </span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-green-600" />
                    <span className="text-sm font-medium">
                      {language.code === 'ar' ? 'التعليقات' : 'Comments'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {analytics.engagement.comments.toLocaleString()}
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}