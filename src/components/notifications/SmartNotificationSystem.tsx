import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell,
  Clock,
  Brain,
  Coffee,
  Moon,
  Sunrise,
  Target,
  Settings,
  Sparkles,
  Calendar,
  TrendingUp,
  Heart,
  Eye
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, PersonalizationData } from '@/types/membership';
import { Article } from '@/types';
import { toast } from 'sonner';

interface SmartNotificationSystemProps {
  userId: string;
  articles: Article[];
  userProfile: UserProfile;
}

interface NotificationSettings {
  smartRecommendations: boolean;
  timeBasedAlerts: boolean;
  trendingContent: boolean;
  personalizedDigest: boolean;
  readingReminders: boolean;
  preferredTimes: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface SmartNotification {
  id: string;
  type: 'recommendation' | 'trending' | 'reminder' | 'digest';
  title: string;
  message: string;
  articleId?: string;
  priority: 'low' | 'medium' | 'high';
  scheduledFor: Date;
  sent: boolean;
  personalizationScore: number;
  reasonTags: string[];
}

export function SmartNotificationSystem({ userId, articles, userProfile }: SmartNotificationSystemProps) {
  const [settings, setSettings] = useKV<NotificationSettings>(`notification-settings-${userId}`, {
    smartRecommendations: true,
    timeBasedAlerts: true,
    trendingContent: false,
    personalizedDigest: true,
    readingReminders: true,
    preferredTimes: {
      morning: true,
      afternoon: true,
      evening: true,
      night: false
    },
    frequency: 'daily',
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    }
  });

  const [pendingNotifications, setPendingNotifications] = useKV<SmartNotification[]>(`pending-notifications-${userId}`, []);
  const [sentNotifications, setSentNotifications] = useKV<SmartNotification[]>(`sent-notifications-${userId}`, []);
  const [personalizationData] = useKV<PersonalizationData>(`personalization-${userId}`, {
    readingPattern: {
      preferredTimes: [],
      sessionDuration: 0,
      contentPreferences: [],
      deviceUsage: { mobile: 0, desktop: 0 }
    },
    behaviorScore: 0,
    lastAnalysis: new Date()
  });

  // Generate smart notifications based on user behavior
  const generateSmartNotifications = async () => {
    const now = new Date();
    const notifications: SmartNotification[] = [];

    // 1. Time-based recommendations
    if (settings.timeBasedAlerts && settings.smartRecommendations) {
      const currentHour = now.getHours();
      const preferredTimes = personalizationData.readingPattern?.preferredTimes || [];
      
      const isPreferredTime = preferredTimes.some(pt => 
        Math.abs(pt.hour - currentHour) <= 1
      );

      if (isPreferredTime) {
        const topArticles = getPersonalizedArticles().slice(0, 3);
        
        topArticles.forEach((article, index) => {
          notifications.push({
            id: `time-rec-${Date.now()}-${index}`,
            type: 'recommendation',
            title: 'محتوى مناسب لوقتك المفضل',
            message: `"${article.title}" - مقال قد يهمك في وقت القراءة المفضل لديك`,
            articleId: article.id,
            priority: index === 0 ? 'high' : 'medium',
            scheduledFor: new Date(now.getTime() + (index * 5 * 60 * 1000)), // 5 minutes apart
            sent: false,
            personalizationScore: 0.9,
            reasonTags: ['وقت_مفضل', 'محتوى_مطابق']
          });
        });
      }
    }

    // 2. Reading streak reminders
    if (settings.readingReminders) {
      const lastActiveDate = new Date(userProfile.readingStats.lastActiveDate);
      const daysSinceLastRead = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastRead >= 1 && userProfile.readingStats.readingStreak >= 3) {
        notifications.push({
          id: `streak-reminder-${Date.now()}`,
          type: 'reminder',
          title: 'حافظ على سلسلة القراءة',
          message: `لديك سلسلة ${userProfile.readingStats.readingStreak} أيام! لا تدعها تنقطع`,
          priority: 'high',
          scheduledFor: getNextPreferredTime(),
          sent: false,
          personalizationScore: 0.8,
          reasonTags: ['سلسلة_قراءة', 'تذكير']
        });
      }
    }

    // 3. Trending content based on interests
    if (settings.trendingContent) {
      const trendingInCategories = getTrendingArticlesInUserCategories();
      
      if (trendingInCategories.length > 0) {
        notifications.push({
          id: `trending-${Date.now()}`,
          type: 'trending',
          title: 'محتوى رائج في اهتماماتك',
          message: `"${trendingInCategories[0].title}" يحقق انتشاراً واسعاً`,
          articleId: trendingInCategories[0].id,
          priority: 'medium',
          scheduledFor: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
          sent: false,
          personalizationScore: 0.7,
          reasonTags: ['رائج', 'اهتمامات']
        });
      }
    }

    // 4. Personalized daily digest
    if (settings.personalizedDigest && settings.frequency === 'daily') {
      const digestTime = getOptimalDigestTime();
      
      if (isTimeForDigest(digestTime)) {
        notifications.push({
          id: `digest-${Date.now()}`,
          type: 'digest',
          title: 'ملخصك اليومي المخصص',
          message: `${getPersonalizedArticles().length} مقال مخصص لك اليوم`,
          priority: 'medium',
          scheduledFor: digestTime,
          sent: false,
          personalizationScore: 0.85,
          reasonTags: ['ملخص_يومي', 'مخصص']
        });
      }
    }

    // Filter out notifications during quiet hours
    const filteredNotifications = notifications.filter(notif => 
      !isQuietHour(notif.scheduledFor)
    );

    setPendingNotifications(prev => [...prev, ...filteredNotifications]);
  };

  // Helper functions
  const getPersonalizedArticles = (): Article[] => {
    const userCategories = userProfile.preferences.categories;
    return articles
      .filter(article => userCategories.includes(article.category?.name || ''))
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, 10);
  };

  const getTrendingArticlesInUserCategories = (): Article[] => {
    const userCategories = userProfile.preferences.categories;
    return articles
      .filter(article => userCategories.includes(article.category?.name || ''))
      .filter(article => (article.analytics?.views || 0) > 1000)
      .sort((a, b) => (b.analytics?.shares || 0) - (a.analytics?.shares || 0))
      .slice(0, 3);
  };

  const getNextPreferredTime = (): Date => {
    const now = new Date();
    const preferredTimes = personalizationData.readingPattern?.preferredTimes || [];
    
    if (preferredTimes.length === 0) {
      return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    }

    const nextTime = preferredTimes.find(pt => pt.hour > now.getHours());
    if (nextTime) {
      const nextDate = new Date(now);
      nextDate.setHours(nextTime.hour, 0, 0, 0);
      return nextDate;
    }

    // Next day's first preferred time
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(preferredTimes[0].hour, 0, 0, 0);
    return nextDate;
  };

  const getOptimalDigestTime = (): Date => {
    const now = new Date();
    const preferredTimes = personalizationData.readingPattern?.preferredTimes || [];
    
    // Find morning preferred time or default to 8 AM
    const morningTime = preferredTimes.find(pt => pt.hour >= 6 && pt.hour <= 10)?.hour || 8;
    
    const digestTime = new Date(now);
    digestTime.setHours(morningTime, 0, 0, 0);
    
    return digestTime;
  };

  const isTimeForDigest = (digestTime: Date): boolean => {
    const now = new Date();
    const lastDigest = sentNotifications
      .filter(n => n.type === 'digest')
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())[0];

    if (!lastDigest) return true;

    const daysSinceLastDigest = Math.floor(
      (now.getTime() - new Date(lastDigest.scheduledFor).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDigest >= 1;
  };

  const isQuietHour = (time: Date): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const hour = time.getHours();
    const startHour = parseInt(settings.quietHours.start.split(':')[0]);
    const endHour = parseInt(settings.quietHours.end.split(':')[0]);
    
    if (startHour > endHour) {
      // Quiet hours span midnight
      return hour >= startHour || hour <= endHour;
    } else {
      return hour >= startHour && hour <= endHour;
    }
  };

  // Send pending notifications
  const processPendingNotifications = () => {
    const now = new Date();
    const readyToSend = pendingNotifications.filter(notif => 
      !notif.sent && new Date(notif.scheduledFor) <= now
    );

    readyToSend.forEach(notif => {
      // Simulate sending notification
      toast(notif.title, {
        description: notif.message,
        action: notif.articleId ? {
          label: 'اقرأ الآن',
          onClick: () => console.log('Navigate to article:', notif.articleId)
        } : undefined
      });

      // Mark as sent
      setSentNotifications(prev => [...prev, { ...notif, sent: true }]);
    });

    // Remove sent notifications from pending
    setPendingNotifications(prev => 
      prev.filter(notif => !readyToSend.some(sent => sent.id === notif.id))
    );
  };

  // Auto-generate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      generateSmartNotifications();
      processPendingNotifications();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [settings, userProfile, articles]);

  const getTimeIcon = (hour: number) => {
    if (hour < 9) return <Sunrise className="w-4 h-4" />;
    if (hour < 17) return <Coffee className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-primary" />
            نظام الإشعارات الذكي
          </h1>
          <p className="text-muted-foreground mt-2">
            إشعارات مخصصة بناءً على سلوك القراءة والأوقات المفضلة
          </p>
        </div>
        
        <Button onClick={generateSmartNotifications} className="gap-2">
          <Sparkles className="w-4 h-4" />
          توليد إشعارات ذكية
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">إعدادات الإشعارات</TabsTrigger>
          <TabsTrigger value="pending">الإشعارات المنتظرة</TabsTrigger>
          <TabsTrigger value="history">تاريخ الإشعارات</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings />
                  أنواع الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">التوصيات الذكية</label>
                  <Switch 
                    checked={settings.smartRecommendations}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smartRecommendations: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-medium">تنبيهات حسب الوقت</label>
                  <Switch 
                    checked={settings.timeBasedAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, timeBasedAlerts: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-medium">المحتوى الرائج</label>
                  <Switch 
                    checked={settings.trendingContent}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, trendingContent: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-medium">الملخص اليومي</label>
                  <Switch 
                    checked={settings.personalizedDigest}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, personalizedDigest: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-medium">تذكيرات القراءة</label>
                  <Switch 
                    checked={settings.readingReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, readingReminders: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock />
                  الأوقات المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4" />
                    <label>الصباح</label>
                  </div>
                  <Switch 
                    checked={settings.preferredTimes.morning}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      preferredTimes: { ...prev.preferredTimes, morning: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <label>بعد الظهر</label>
                  </div>
                  <Switch 
                    checked={settings.preferredTimes.afternoon}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      preferredTimes: { ...prev.preferredTimes, afternoon: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <label>المساء</label>
                  </div>
                  <Switch 
                    checked={settings.preferredTimes.evening}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      preferredTimes: { ...prev.preferredTimes, evening: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <label>الليل</label>
                  </div>
                  <Switch 
                    checked={settings.preferredTimes.night}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      preferredTimes: { ...prev.preferredTimes, night: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ساعات الهدوء</CardTitle>
              <CardDescription>أوقات عدم إرسال الإشعارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">تفعيل ساعات الهدوء</label>
                <Switch 
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    quietHours: { ...prev.quietHours, enabled: checked }
                  }))}
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">من</label>
                    <input 
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">إلى</label>
                    <input 
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Notifications */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar />
                الإشعارات المنتظرة ({pendingNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingNotifications.map(notif => (
                  <div key={notif.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTimeIcon(new Date(notif.scheduledFor).getHours())}
                        <h4 className="font-medium">{notif.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={notif.priority === 'high' ? 'default' : 'secondary'}>
                          {notif.priority === 'high' ? 'عالي' : notif.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(notif.personalizationScore * 100)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(notif.scheduledFor).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {notif.reasonTags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingNotifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد إشعارات منتظرة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp />
                تاريخ الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentNotifications.slice(-10).reverse().map(notif => (
                  <div key={notif.id} className="border rounded-lg p-3 opacity-75">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.scheduledFor).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                ))}
                
                {sentNotifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد إشعارات مرسلة بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}