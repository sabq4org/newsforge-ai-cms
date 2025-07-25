import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Palette, Users, Clock, Star, TrendingUp, Eye, Share } from '@phosphor-icons/react';
import { PersonalizedThemeManager } from './PersonalizedThemeManager';
import { UserProfileTheme } from './UserProfileTheme';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ThemeAnalytics {
  totalUsers: number;
  activeThemes: number;
  mostPopularTheme: string;
  userEngagement: number;
  themeChangesThisWeek: number;
  personalizedUsers: number;
}

interface ThemeUsageStats {
  themeId: string;
  themeName: string;
  themeNameAr: string;
  usageCount: number;
  satisfaction: number;
  category: string;
}

export const PersonalizedThemesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useKV<ThemeAnalytics>('theme-analytics', {
    totalUsers: 1247,
    activeThemes: 12,
    mostPopularTheme: 'سبق التحريري',
    userEngagement: 87,
    themeChangesThisWeek: 156,
    personalizedUsers: 423,
  });

  const [themeStats, setThemeStats] = useKV<ThemeUsageStats[]>('theme-usage-stats', [
    {
      themeId: 'sabq-editorial',
      themeName: 'Sabq Editorial',
      themeNameAr: 'سبق التحريري',
      usageCount: 687,
      satisfaction: 92,
      category: 'editorial'
    },
    {
      themeId: 'midnight-professional',
      themeName: 'Midnight Professional',
      themeNameAr: 'احترافي داكن',
      usageCount: 234,
      satisfaction: 88,
      category: 'modern'
    },
    {
      themeId: 'royal-gold',
      themeName: 'Royal Gold',
      themeNameAr: 'ذهبي ملكي',
      usageCount: 123,
      satisfaction: 85,
      category: 'business'
    },
    {
      themeId: 'ocean-blue',
      themeName: 'Ocean Blue',
      themeNameAr: 'أزرق المحيط',
      usageCount: 89,
      satisfaction: 79,
      category: 'modern'
    },
    {
      themeId: 'warm-earth',
      themeName: 'Warm Earth',
      themeNameAr: 'ترابي دافئ',
      usageCount: 67,
      satisfaction: 82,
      category: 'classic'
    },
    {
      themeId: 'mint-fresh',
      themeName: 'Mint Fresh',
      themeNameAr: 'نعناع منعش',
      usageCount: 47,
      satisfaction: 75,
      category: 'modern'
    }
  ]);

  const [recentActivity] = useKV('recent-theme-activity', [
    { user: 'أحمد محمد', action: 'إنشاء ثيم شخصي', theme: 'ثيم التحرير الليلي', time: '5 دقائق' },
    { user: 'سارة علي', action: 'تطبيق ثيم', theme: 'أزرق المحيط', time: '12 دقيقة' },
    { user: 'محمد سالم', action: 'مشاركة ثيم', theme: 'ترابي دافئ', time: '25 دقيقة' },
    { user: 'فاطمة أحمد', action: 'جدولة ثيم', theme: 'احترافي داكن', time: '45 دقيقة' },
    { user: 'عبدالله خالد', action: 'تحديث تفضيلات', theme: 'سبق التحريري', time: 'ساعة' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الثيمات الشخصية</h1>
          <p className="text-muted-foreground">
            إدارة شاملة لتفضيلات المستخدمين وتخصيص التجربة البصرية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            تقرير شامل
          </Button>
          <Button className="gap-2">
            <Palette className="w-4 h-4" />
            إنشاء ثيم جديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="manage">إدارة الثيمات</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الثيمات النشطة</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeThemes}</div>
                <p className="text-xs text-muted-foreground">
                  +3 ثيمات جديدة هذا الأسبوع
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.userEngagement}%</div>
                <Progress value={analytics.userEngagement} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التخصيص الشخصي</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.personalizedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analytics.personalizedUsers / analytics.totalUsers) * 100)}% من المستخدمين
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Theme Popularity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أشهر الثيمات</CardTitle>
                <CardDescription>ترتيب الثيمات حسب الاستخدام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {themeStats
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .slice(0, 5)
                  .map((theme, index) => (
                    <div key={theme.themeId} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{theme.themeNameAr}</h4>
                        <p className="text-sm text-muted-foreground">
                          {theme.usageCount} مستخدم
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{theme.satisfaction}%</div>
                        <div className="text-xs text-muted-foreground">رضا</div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>النشاط الحديث</CardTitle>
                <CardDescription>آخر الأنشطة في النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}
                        {' '}<span className="text-primary">{activity.theme}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">منذ {activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>
                الوصول السريع للمهام الشائعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('manage')}
                >
                  <Palette className="w-6 h-6" />
                  إنشاء ثيم شخصي
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('profile')}
                >
                  <Users className="w-6 h-6" />
                  تخصيص الملف
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="w-6 h-6" />
                  عرض التحليلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="manage">
          <PersonalizedThemeManager 
            userId="demo-user" 
            currentUser={{ id: 'demo-user', name: 'مستخدم تجريبي' }}
          />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <UserProfileTheme 
            userId="demo-user"
            onThemeChange={(themeId) => {
              toast.success(`تم تطبيق الثيم: ${themeId}`);
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات التخصيص</CardTitle>
                <CardDescription>نسب استخدام خيارات التخصيص المختلفة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">حجم الخط المخصص</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">ألوان مخصصة</span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <Progress value={34} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">جدولة تلقائية</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <Progress value={23} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">أنماط قراءة متعددة</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التوزيع حسب الفئة</CardTitle>
                <CardDescription>تفضيلات المستخدمين لفئات الثيمات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['editorial', 'modern', 'business', 'classic'].map((category) => {
                  const categoryStats = themeStats.filter(theme => theme.category === category);
                  const totalUsage = categoryStats.reduce((sum, theme) => sum + theme.usageCount, 0);
                  const percentage = Math.round((totalUsage / themeStats.reduce((sum, theme) => sum + theme.usageCount, 0)) * 100);
                  
                  const categoryNames = {
                    editorial: 'تحريري',
                    modern: 'عصري',
                    business: 'أعمال',
                    classic: 'كلاسيكي'
                  };

                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{categoryNames[category as keyof typeof categoryNames]}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>أهداف ومؤشرات الأداء</CardTitle>
                <CardDescription>مراقبة تحقيق الأهداف الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">87%</div>
                    <div className="text-sm text-muted-foreground">رضا المستخدمين</div>
                    <div className="text-xs text-green-600 mt-1">+5% من الهدف</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">34%</div>
                    <div className="text-sm text-muted-foreground">معدل التخصيص</div>
                    <div className="text-xs text-green-600 mt-1">+8% من الشهر الماضي</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">156</div>
                    <div className="text-sm text-muted-foreground">تغييرات الثيم هذا الأسبوع</div>
                    <div className="text-xs text-green-600 mt-1">+23% من المتوسط</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedThemesDashboard;