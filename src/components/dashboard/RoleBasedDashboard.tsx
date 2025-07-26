import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChartBarHorizontal, 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  Share, 
  MessageCircle,
  Clock,
  Target,
  Zap,
  Crown,
  Globe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Star,
  MapPin,
  Microphone,
  Drop,
  Sparkles,
  Palette,
  Bell,
  Cpu
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { safeDateFormat, safeTimeFormat } from '@/lib/utils';
import { mockAnalytics, mockArticles } from '@/lib/mockData';
import { normalizeActivityTimestamps } from '@/lib/utils';
import { Analytics, Article } from '@/types';
import { ComprehensiveServiceMap } from './ComprehensiveServiceMap';

interface RoleBasedDashboardProps {
  onNavigate: (view: string) => void;
}

export function RoleBasedDashboard({ onNavigate }: RoleBasedDashboardProps) {
  const { user, language } = useAuth();
  const typography = useOptimizedTypography();
  const [analytics] = useKV<Analytics>('sabq-analytics', mockAnalytics);
  const [articles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [personalStats, setPersonalStats] = useState<any>(null);

  const { isRTL, isArabic } = typography;

  useEffect(() => {
    if (user) {
      // Calculate personal statistics based on user role
      const userArticles = articles.filter(article => article.author.id === user.id);
      const totalViews = userArticles.reduce((sum, article) => sum + article.analytics.views, 0);
      const totalEngagement = userArticles.reduce((sum, article) => 
        sum + article.analytics.likes + article.analytics.shares + article.analytics.comments, 0);
      
      setPersonalStats({
        totalArticles: userArticles.length,
        totalViews,
        totalEngagement,
        averageReadTime: userArticles.length > 0 
          ? userArticles.reduce((sum, article) => sum + article.analytics.readTime, 0) / userArticles.length 
          : 0,
        publishedThisWeek: userArticles.filter(article => 
          article.publishedAt && 
          new Date(article.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      });
    }
  }, [user, articles]);

  const getRoleBasedGreeting = () => {
    if (!user) return '';
    
    const greetings = {
      'admin': isArabic ? 'مرحباً بالمدير' : 'Welcome, Administrator',
      'editor-in-chief': isArabic ? 'مرحباً برئيس التحرير' : 'Welcome, Editor-in-Chief',
      'section-editor': isArabic ? 'مرحباً بمحرر القسم' : 'Welcome, Section Editor',
      'journalist': isArabic ? 'مرحباً بالصحفي' : 'Welcome, Journalist',
      'opinion-writer': isArabic ? 'مرحباً بكاتب الرأي' : 'Welcome, Opinion Writer',
      'analyst': isArabic ? 'مرحباً بالمحلل' : 'Welcome, Analyst'
    };

    return greetings[user.role] || (isArabic ? 'مرحباً' : 'Welcome');
  };

  const getQuickActions = () => {
    if (!user) return [];

    const actions = {
      'admin': [
        { label: isArabic ? 'إدارة المستخدمين' : 'Manage Users', view: 'users', icon: Users },
        { label: isArabic ? 'التحليلات المتقدمة' : 'Advanced Analytics', view: 'analytics', icon: ChartBarHorizontal },
        { label: isArabic ? 'إعدادات النظام' : 'System Settings', view: 'settings', icon: Target }
      ],
      'editor-in-chief': [
        { label: isArabic ? 'مراجعة المقالات' : 'Review Articles', view: 'articles', icon: FileText },
        { label: isArabic ? 'تحليلات الأداء' : 'Performance Analytics', view: 'insights', icon: TrendingUp },
        { label: isArabic ? 'جدولة النشر' : 'Publishing Schedule', view: 'scheduled', icon: Calendar }
      ],
      'section-editor': [
        { label: isArabic ? 'مقالات القسم' : 'Section Articles', view: 'articles', icon: FileText },
        { label: isArabic ? 'التحليلات' : 'Analytics', view: 'analytics', icon: ChartBarHorizontal },
        { label: isArabic ? 'إنشاء مقال' : 'Create Article', view: 'create-article', icon: Zap }
      ],
      'journalist': [
        { label: isArabic ? 'مقالاتي' : 'My Articles', view: 'articles', icon: FileText },
        { label: isArabic ? 'إنشاء مقال جديد' : 'New Article', view: 'create-article', icon: Zap },
        { label: isArabic ? 'أدوات الذكاء الاصطناعي' : 'AI Tools', view: 'ai-tools', icon: Star }
      ],
      'opinion-writer': [
        { label: isArabic ? 'مقالات الرأي' : 'Opinion Articles', view: 'articles', icon: FileText },
        { label: isArabic ? 'كتابة رأي جديد' : 'New Opinion', view: 'create-article', icon: Zap },
        { label: isArabic ? 'أداء المقالات' : 'Article Performance', view: 'analytics', icon: TrendingUp }
      ],
      'analyst': [
        { label: isArabic ? 'التحليلات المتقدمة' : 'Advanced Analytics', view: 'analytics', icon: ChartBarHorizontal },
        { label: isArabic ? 'رؤى الأداء' : 'Performance Insights', view: 'insights', icon: TrendingUp },
        { label: isArabic ? 'التحليل الزمني' : 'Real-time Analytics', view: 'realtime', icon: Eye }
      ]
    };

    return actions[user.role] || [];
  };

  const getPriorityAlerts = () => {
    if (!user) return [];

    const alerts = [];

    // Role-specific alerts
    if (user.role === 'admin' || user.role === 'editor-in-chief') {
      const pendingArticles = articles.filter(a => a.status === 'review').length;
      if (pendingArticles > 0) {
        alerts.push({
          type: 'warning' as const,
          message: isArabic 
            ? `${pendingArticles} مقال في انتظار المراجعة`
            : `${pendingArticles} articles pending review`,
          action: () => onNavigate('articles')
        });
      }
    }

    if (user.role === 'journalist' || user.role === 'opinion-writer') {
      const userDrafts = articles.filter(a => a.author.id === user.id && a.status === 'draft').length;
      if (userDrafts > 0) {
        alerts.push({
          type: 'info' as const,
          message: isArabic 
            ? `لديك ${userDrafts} مسودة غير منشورة`
            : `You have ${userDrafts} unpublished drafts`,
          action: () => onNavigate('articles')
        });
      }
    }

    // High-performing content alert
    const highPerformingArticles = articles.filter(a => 
      a.analytics.views > 10000 && 
      a.publishedAt && 
      new Date(a.publishedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    if (highPerformingArticles > 0) {
      alerts.push({
        type: 'success' as const,
        message: isArabic 
          ? `${highPerformingArticles} مقال حقق أداءً ممتازاً اليوم`
          : `${highPerformingArticles} articles performing excellently today`,
        action: () => onNavigate('analytics')
      });
    }

    return alerts;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const getDashboardMetrics = () => {
    if (!user) return [];

    const baseMetrics = [
      {
        title: isArabic ? 'إجمالي المشاهدات' : 'Total Views',
        value: formatNumber(analytics.totalViews),
        icon: Eye,
        trend: '+12.5%',
        color: 'text-blue-600'
      },
      {
        title: isArabic ? 'المقالات المنشورة' : 'Published Articles',
        value: formatNumber(analytics.totalArticles),
        icon: FileText,
        trend: '+5.2%',
        color: 'text-green-600'
      },
      {
        title: isArabic ? 'التفاعل اليومي' : 'Daily Engagement',
        value: formatNumber(analytics.engagement.likes + analytics.engagement.shares),
        icon: Heart,
        trend: '+8.1%',
        color: 'text-red-600'
      },
      {
        title: isArabic ? 'نشر اليوم' : 'Published Today',
        value: formatNumber(analytics.publishedToday),
        icon: Clock,
        trend: '+3',
        color: 'text-purple-600'
      }
    ];

    // Add personal metrics for content creators
    if (user.role === 'journalist' || user.role === 'opinion-writer') {
      return [
        {
          title: isArabic ? 'مقالاتي' : 'My Articles',
          value: personalStats?.totalArticles || 0,
          icon: FileText,
          trend: `+${personalStats?.publishedThisWeek || 0} ${isArabic ? 'هذا الأسبوع' : 'this week'}`,
          color: 'text-blue-600'
        },
        {
          title: isArabic ? 'مشاهدات مقالاتي' : 'My Article Views',
          value: formatNumber(personalStats?.totalViews || 0),
          icon: Eye,
          trend: '',
          color: 'text-green-600'
        },
        ...baseMetrics.slice(2)
      ];
    }

    return baseMetrics;
  };

  const getRecentActivity = () => {
    // Filter activity based on user role
    let filteredActivity = normalizeActivityTimestamps(analytics.recentActivity);

    if (user?.role === 'journalist' || user?.role === 'opinion-writer') {
      filteredActivity = filteredActivity.filter(activity => 
        activity.user === user.name || activity.user === user.nameAr
      );
    }

    return filteredActivity.slice(0, 5);
  };

  return (
    <div className={`space-y-6 ${typography.rtlText}`}>
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={typography.heading}>
            {getRoleBasedGreeting()}
            {user && (
              <span className="text-accent mr-2">
                {isArabic ? user.nameAr : user.name}
              </span>
            )}
          </h1>
          <p className={typography.summary}>
            {isArabic 
              ? `مرحباً بك في منصة سبق الذكية - ${safeDateFormat(new Date(), 'ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Welcome to Sabq Althakiyah - ${safeDateFormat(new Date(), 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onNavigate('service-map')}
            className="flex items-center gap-2 font-arabic"
          >
            <MapPin className="w-4 h-4" />
            {isArabic ? 'خريطة الخدمات' : 'Services Map'}
            <Badge variant="secondary" className="text-xs">
              50+
            </Badge>
          </Button>
          <Badge variant="outline" className={`flex items-center gap-1 ${typography.caption}`}>
            <Crown className="w-3 h-3" />
            {user?.role === 'admin' ? (isArabic ? 'مدير' : 'Administrator') :
             user?.role === 'editor-in-chief' ? (isArabic ? 'رئيس تحرير' : 'Editor-in-Chief') :
             user?.role === 'section-editor' ? (isArabic ? 'محرر قسم' : 'Section Editor') :
             user?.role === 'journalist' ? (isArabic ? 'صحفي' : 'Journalist') :
             user?.role === 'opinion-writer' ? (isArabic ? 'كاتب رأي' : 'Opinion Writer') :
             user?.role === 'analyst' ? (isArabic ? 'محلل' : 'Analyst') : ''}
          </Badge>
        </div>
      </div>

      {/* Priority Alerts */}
      {getPriorityAlerts().map((alert, index) => (
        <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'} className="font-arabic">
          {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : 
           alert.type === 'success' ? <CheckCircle className="w-4 h-4" /> : 
           <Globe className="w-4 h-4" />}
          <AlertDescription className="flex items-center justify-between font-arabic">
            <span className="font-arabic">{alert.message}</span>
            <Button variant="outline" size="sm" onClick={alert.action} className="font-arabic">
              {isArabic ? 'عرض' : 'View'}
            </Button>
          </AlertDescription>
        </Alert>
      ))}

      {/* System Status Alert */}
      <Alert className="border-green-200 bg-green-50 font-arabic">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between font-arabic text-green-800">
          <div>
            <span className="font-semibold">
              {isArabic ? '✅ جميع الخدمات المتقدمة نشطة!' : '✅ All Advanced Services Active!'}
            </span>
            <div className="text-sm mt-1">
              {isArabic ? '78+ وحدة ذكية متاحة | الذكاء الاصطناعي | التحليل العميق | البودكاست | التخصيص' : '78+ Smart Modules Available | AI | Deep Analysis | Podcast | Personalization'}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('service-map')} className="font-arabic">
            {isArabic ? 'استكشف الخدمات' : 'Explore Services'}
          </Button>
        </AlertDescription>
      </Alert>

      {/* Featured Services Showcase */}
      <Card className="border-2 border-accent/20 font-arabic">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 font-arabic">
            <Star className="w-5 h-5 text-accent" />
            {isArabic ? 'الخدمات المتقدمة المتاحة' : 'Available Advanced Services'}
          </CardTitle>
          <CardDescription className="font-arabic">
            {isArabic ? 'اكتشف جميع الأدوات الذكية المطورة في النظام' : 'Discover all the smart tools developed in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI & ML Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 font-arabic flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              {isArabic ? 'الذكاء الاصطناعي والتعلم الآلي' : 'AI & Machine Learning'}
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-blue-50"
                onClick={() => onNavigate('deep-analysis')}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'التحليل العميق' : 'Deep Analysis'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'ذكي' : 'AI'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-purple-50"
                onClick={() => onNavigate('machine-learning-engine')}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'محرك التعلم الآلي' : 'ML Engine'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'متطور' : 'Advanced'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-green-50"
                onClick={() => onNavigate('generative-recommendations')}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'التوصيات التوليدية' : 'Generative AI'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'GPT' : 'GPT'}</Badge>
              </Button>
            </div>
          </div>

          {/* Content & Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 font-arabic flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              {isArabic ? 'إدارة المحتوى والوسائط' : 'Content & Media Management'}
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-amber-50"
                onClick={() => onNavigate('daily-doses')}
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Drop className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'الجرعات الذكية' : 'Smart Doses'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'يومي' : 'Daily'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-pink-50"
                onClick={() => onNavigate('audio-editor')}
              >
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Microphone className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'محرر البودكاست' : 'Audio Editor'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'بودكاست' : 'Podcast'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-cyan-50"
                onClick={() => onNavigate('media-generator')}
              >
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'مولد الوسائط' : 'Media Generator'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'ذكي' : 'Smart'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-orange-50"
                onClick={() => onNavigate('external-data')}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'المصادر الخارجية' : 'External Data'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'جديد' : 'New'}</Badge>
              </Button>
            </div>
          </div>

          {/* User Experience Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 font-arabic flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              {isArabic ? 'تجربة المستخدم والتخصيص' : 'User Experience & Personalization'}
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-indigo-50"
                onClick={() => onNavigate('personalized-themes')}
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'الثيمات الشخصية' : 'Personal Themes'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'شخصي' : 'Personal'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-red-50"
                onClick={() => onNavigate('adaptive-color-learning')}
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'التكييف اللوني' : 'Color Adaptation'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'ذكي' : 'Smart'}</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic hover:bg-teal-50"
                onClick={() => onNavigate('smart-notifications')}
              >
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium font-arabic">{isArabic ? 'الإشعارات الذكية' : 'Smart Notifications'}</span>
                <Badge variant="secondary" className="text-xs">{isArabic ? 'ذكي' : 'AI'}</Badge>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Current Role */}
      <Card className="font-arabic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-arabic">
            <Target className="w-5 h-5 text-accent" />
            {isArabic ? 'الإجراءات السريعة لدورك' : 'Quick Actions for Your Role'}
          </CardTitle>
          <CardDescription className="font-arabic">
            {isArabic ? 'مهام مخصصة حسب صلاحياتك' : 'Tasks tailored to your permissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 font-arabic"
                onClick={() => onNavigate(action.view)}
              >
                <action.icon className="w-6 h-6 text-accent" />
                <span className="text-sm font-medium font-arabic">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getDashboardMetrics().map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {metric.trend}
                    </p>
                  )}
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentActivity().map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'publish' ? 'bg-green-500' :
                    activity.type === 'edit' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.article}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {(() => {
                        try {
                          let date = activity.timestamp;
                          
                          // Handle different timestamp formats
                          if (typeof date === 'string') {
                            date = new Date(date);
                          } else if (typeof date === 'number') {
                            date = new Date(date);
                          } else if (!date || !(date instanceof Date)) {
                            date = new Date(); // fallback to current date
                          }
                          
                          // Ensure the Date object is valid
                          if (isNaN(date.getTime())) {
                            date = new Date(); // fallback to current date for invalid dates
                          }
                          
                          // Use the normalized date
                          return safeDateFormat(date, isArabic ? 'ar-SA' : 'en-US');
                        } catch (e) {
                          console.warn('Date formatting error for activity:', activity, e);
                          return safeDateFormat(new Date(), isArabic ? 'ar-SA' : 'en-US');
                        }
                      })()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'publish' ? (isArabic ? 'نشر' : 'Published') :
                     activity.type === 'edit' ? (isArabic ? 'تحرير' : 'Edited') :
                     (isArabic ? 'إنشاء' : 'Created')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {isArabic ? 'المحتوى الأكثر أداءً' : 'Top Performing Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topArticles.map((article, index) => (
                <div key={article.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      {formatNumber(article.views)} {isArabic ? 'مشاهدة' : 'views'}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    article.trend === 'up' ? 'text-green-600' :
                    article.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${article.trend === 'down' ? 'rotate-180' : ''}`} />
                    {article.trend === 'up' ? (isArabic ? 'صاعد' : 'Rising') :
                     article.trend === 'down' ? (isArabic ? 'هابط' : 'Falling') :
                     (isArabic ? 'مستقر' : 'Stable')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary for Content Creators */}
      {(user?.role === 'journalist' || user?.role === 'opinion-writer') && personalStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {isArabic ? 'ملخص أدائي' : 'My Performance Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {personalStats.totalArticles}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي المقالات' : 'Total Articles'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(personalStats.totalViews)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(personalStats.averageReadTime)}s
                </div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'متوسط وقت القراءة' : 'Avg. Read Time'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {personalStats.publishedThisWeek}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'نشر هذا الأسبوع' : 'Published This Week'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}