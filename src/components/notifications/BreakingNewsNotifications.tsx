import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellRinging, 
  BellSlash, 
  Lightning, 
  Clock, 
  Users, 
  Send,
  Eye,
  Check,
  X,
  Plus,
  Settings,
  Volume,
  Vibrate,
  Globe,
  Target
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { mockCategories } from '@/lib/mockData';

interface BreakingNews {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  author: string;
  isActive: boolean;
  viewCount: number;
  targetAudience: string[];
  expiresAt?: Date;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  channels: string[];
}

interface NotificationSettings {
  globalEnabled: boolean;
  categories: Record<string, boolean>;
  priorities: Record<string, boolean>;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  globalEnabled: true,
  categories: {},
  priorities: {
    low: false,
    medium: true,
    high: true,
    critical: true
  },
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  },
  channels: {
    push: true,
    email: true,
    sms: false,
    inApp: true
  }
};

export function BreakingNewsNotifications() {
  const [breakingNews, setBreakingNews] = useKV<BreakingNews[]>('breaking-news', []);
  const [settings, setSettings] = useKV<NotificationSettings>('notification-settings', defaultSettings);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings' | 'analytics'>('create');
  const [isCreating, setIsCreating] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<BreakingNews>>({
    priority: 'medium',
    soundEnabled: true,
    vibrationEnabled: true,
    channels: ['push', 'inApp'],
    targetAudience: ['all']
  });

  // Initialize category settings
  useEffect(() => {
    if (Object.keys(settings.categories).length === 0) {
      const categorySettings: Record<string, boolean> = {};
      mockCategories.forEach(cat => {
        categorySettings[cat.id] = true;
      });
      setSettings(prev => ({
        ...prev,
        categories: categorySettings
      }));
    }
  }, [settings.categories, setSettings]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const activeNotifications = breakingNews.filter(n => n.isActive);
      activeNotifications.forEach(notification => {
        if (shouldShowNotification(notification)) {
          showBrowserNotification(notification);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [breakingNews, settings]);

  const shouldShowNotification = (notification: BreakingNews): boolean => {
    if (!settings.globalEnabled) return false;
    if (!settings.categories[notification.category]) return false;
    if (!settings.priorities[notification.priority]) return false;
    
    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.replace(':', ''));
      const endTime = parseInt(settings.quietHours.end.replace(':', ''));
      
      if (startTime > endTime) { // Overnight quiet hours
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }
    
    return true;
  };

  const showBrowserNotification = (notification: BreakingNews) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(`🚨 خبر عاجل - ${notification.title}`, {
        body: notification.content,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        silent: !settings.soundEnabled
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('تم تفعيل الإشعارات بنجاح');
      } else {
        toast.error('لم يتم منح إذن الإشعارات');
      }
    }
  };

  const createBreakingNews = async () => {
    if (!newNotification.title || !newNotification.content) {
      toast.error('يرجى ملء العنوان والمحتوى');
      return;
    }

    setIsCreating(true);
    
    const notification: BreakingNews = {
      id: `breaking_${Date.now()}`,
      title: newNotification.title!,
      content: newNotification.content!,
      category: newNotification.category || mockCategories[0].id,
      priority: newNotification.priority as any || 'medium',
      timestamp: new Date(),
      author: 'المحرر الحالي',
      isActive: true,
      viewCount: 0,
      targetAudience: newNotification.targetAudience || ['all'],
      soundEnabled: newNotification.soundEnabled ?? true,
      vibrationEnabled: newNotification.vibrationEnabled ?? true,
      channels: newNotification.channels || ['push', 'inApp'],
      expiresAt: newNotification.expiresAt
    };

    setBreakingNews(prev => [notification, ...prev]);
    
    // Show immediate notification
    if (shouldShowNotification(notification)) {
      showBrowserNotification(notification);
      toast.success('تم إرسال الخبر العاجل');
    }
    
    // Reset form
    setNewNotification({
      priority: 'medium',
      soundEnabled: true,
      vibrationEnabled: true,
      channels: ['push', 'inApp'],
      targetAudience: ['all']
    });
    
    setIsCreating(false);
    setActiveTab('manage');
  };

  const toggleNotificationStatus = (id: string) => {
    setBreakingNews(prev => 
      prev.map(n => 
        n.id === id ? { ...n, isActive: !n.isActive } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setBreakingNews(prev => prev.filter(n => n.id !== id));
    toast.success('تم حذف الإشعار');
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

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-right">عنوان الخبر العاجل</Label>
            <Input
              id="title"
              value={newNotification.title || ''}
              onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              placeholder="عنوان مختصر وواضح للخبر العاجل"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-right">محتوى الإشعار</Label>
            <Textarea
              id="content"
              value={newNotification.content || ''}
              onChange={(e) => setNewNotification(prev => ({ ...prev, content: e.target.value }))}
              placeholder="نص الإشعار الذي سيظهر للمستخدمين"
              className="text-right min-h-[120px]"
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-right">التصنيف</Label>
            <Select
              value={newNotification.category}
              onValueChange={(value) => setNewNotification(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="priority" className="text-right">مستوى الأولوية</Label>
            <Select
              value={newNotification.priority}
              onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>منخفضة</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>متوسطة</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <BellRinging className="w-4 h-4" />
                    <span>عالية</span>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <Lightning className="w-4 h-4" />
                    <span>حرجة</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-right">خيارات الإشعار</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-sm">تفعيل الصوت</Label>
              <Switch
                id="sound"
                checked={newNotification.soundEnabled}
                onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, soundEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="text-sm">تفعيل الاهتزاز</Label>
              <Switch
                id="vibration"
                checked={newNotification.vibrationEnabled}
                onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, vibrationEnabled: checked }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expires" className="text-right">تاريخ انتهاء الصلاحية (اختياري)</Label>
            <Input
              id="expires"
              type="datetime-local"
              value={newNotification.expiresAt ? new Date(newNotification.expiresAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setNewNotification(prev => ({ 
                ...prev, 
                expiresAt: e.target.value ? new Date(e.target.value) : undefined 
              }))}
              className="text-right"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setNewNotification({
            priority: 'medium',
            soundEnabled: true,
            vibrationEnabled: true,
            channels: ['push', 'inApp'],
            targetAudience: ['all']
          })}
        >
          إعادة تعيين
        </Button>
        
        <Button
          onClick={createBreakingNews}
          disabled={isCreating || !newNotification.title || !newNotification.content}
          className="gap-2"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              إرسال الخبر العاجل
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {breakingNews.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد أخبار عاجلة</h3>
            <p className="text-muted-foreground">ابدأ بإنشاء أول خبر عاجل</p>
          </div>
        ) : (
          breakingNews.map((notification) => (
            <Card key={notification.id} className={`transition-all ${notification.isActive ? 'border-l-4 border-l-primary' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(notification.priority)}>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(notification.priority)}
                          <span>{notification.priority === 'critical' ? 'حرجة' : 
                                 notification.priority === 'high' ? 'عالية' :
                                 notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                        </div>
                      </Badge>
                      
                      <Badge variant="outline">
                        {mockCategories.find(c => c.id === notification.category)?.name || notification.category}
                      </Badge>
                      
                      {notification.isActive ? (
                        <Badge className="bg-green-100 text-green-800">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">متوقف</Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg font-semibold text-right">
                      {notification.title}
                    </CardTitle>
                    
                    <p className="text-muted-foreground text-right mt-2">
                      {notification.content}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleNotificationStatus(notification.id)}
                      className="gap-2"
                    >
                      {notification.isActive ? <BellSlash className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      {notification.isActive ? 'إيقاف' : 'تفعيل'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{notification.viewCount} مشاهدة</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(notification.timestamp).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notification.soundEnabled && <Volume className="w-4 h-4" />}
                    {notification.vibrationEnabled && <Vibrate className="w-4 h-4" />}
                  </div>
                </div>
                
                {notification.expiresAt && (
                  <div className="mt-2 text-sm text-orange-600">
                    ينتهي في: {new Date(notification.expiresAt).toLocaleString('ar-SA')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">الإعدادات العامة</h3>
            <p className="text-muted-foreground">تحكم في كيفية تلقي الإشعارات</p>
          </div>
          
          <Button
            onClick={requestNotificationPermission}
            variant="outline"
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            طلب إذن الإشعارات
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="global-enabled" className="text-base">تفعيل جميع الإشعارات</Label>
            <Switch
              id="global-enabled"
              checked={settings.globalEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, globalEnabled: checked }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">إشعارات حسب التصنيف</Label>
            {mockCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <Label htmlFor={`cat-${category.id}`} className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Label>
                <Switch
                  id={`cat-${category.id}`}
                  checked={settings.categories[category.id] ?? true}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    categories: { ...prev.categories, [category.id]: checked }
                  }))}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">إشعارات حسب الأولوية</Label>
            {Object.entries(settings.priorities).map(([priority, enabled]) => (
              <div key={priority} className="flex items-center justify-between">
                <Label htmlFor={`priority-${priority}`} className="flex items-center gap-2">
                  {getPriorityIcon(priority)}
                  <span>
                    {priority === 'critical' ? 'حرجة' : 
                     priority === 'high' ? 'عالية' :
                     priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </Label>
                <Switch
                  id={`priority-${priority}`}
                  checked={enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    priorities: { ...prev.priorities, [priority]: checked }
                  }))}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours" className="text-base">ساعات الهدوء</Label>
              <Switch
                id="quiet-hours"
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
                  <Label htmlFor="quiet-start">بداية الهدوء</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">نهاية الهدوء</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإشعارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breakingNews.length}</div>
            <p className="text-xs text-muted-foreground">
              {breakingNews.filter(n => n.isActive).length} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breakingNews.reduce((sum, n) => sum + n.viewCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              عبر جميع الإشعارات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط المشاهدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breakingNews.length > 0 
                ? Math.round(breakingNews.reduce((sum, n) => sum + n.viewCount, 0) / breakingNews.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              لكل إشعار
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الإشعارات حسب الأولوية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              breakingNews.reduce((acc, n) => {
                acc[n.priority] = (acc[n.priority] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(priority)}
                  <span>
                    {priority === 'critical' ? 'حرجة' : 
                     priority === 'high' ? 'عالية' :
                     priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام الإشعارات الفورية</h1>
          <p className="text-muted-foreground">إدارة وإرسال الأخبار العاجلة للمستخدمين</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="gap-1">
            <Users className="w-4 h-4" />
            {breakingNews.filter(n => n.isActive).length} إشعار نشط
          </Badge>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8 space-x-reverse">
          {[
            { id: 'create', label: 'إنشاء إشعار', icon: Plus },
            { id: 'manage', label: 'إدارة الإشعارات', icon: Bell },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
            { id: 'analytics', label: 'الإحصائيات', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <CardContent className="p-6">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'manage' && renderManageTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </CardContent>
      </Card>
    </div>
  );
}