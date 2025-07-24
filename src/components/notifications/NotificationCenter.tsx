import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRinging, 
  Lightning, 
  Clock, 
  X,
  Volume,
  Vibrate,
  Eye,
  CheckCircle
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

export function NotificationCenter() {
  const [breakingNews, setBreakingNews] = useKV<BreakingNews[]>('breaking-news', []);
  const [settings] = useKV<NotificationSettings>('notification-settings', defaultSettings);
  const [unreadNotifications, setUnreadNotifications] = useKV<string[]>('unread-notifications', []);
  const [isVisible, setIsVisible] = useState(false);

  const activeNotifications = breakingNews.filter(n => 
    n.isActive && 
    (!n.expiresAt || new Date(n.expiresAt) > new Date())
  );

  const unreadActiveNotifications = activeNotifications.filter(n => 
    unreadNotifications.includes(n.id)
  );

  const markAsRead = (notificationId: string) => {
    setUnreadNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const markAllAsRead = () => {
    setUnreadNotifications([]);
  };

  const dismissNotification = (notificationId: string) => {
    markAsRead(notificationId);
    setBreakingNews(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isActive: false } : n
      )
    );
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

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  // Auto-show urgent notifications
  useEffect(() => {
    const criticalUnread = unreadActiveNotifications.filter(n => n.priority === 'critical');
    if (criticalUnread.length > 0 && !isVisible) {
      setIsVisible(true);
    }
  }, [unreadActiveNotifications, isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {unreadActiveNotifications.length > 0 && (
          <Button
            onClick={() => setIsVisible(true)}
            className="gap-2 shadow-lg relative"
            size="lg"
          >
            <BellRinging className="w-5 h-5" />
            <span>إشعارات جديدة</span>
            <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center">
              {unreadActiveNotifications.length}
            </Badge>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[70vh]" dir="rtl">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              {unreadActiveNotifications.length > 0 && (
                <Badge className="gap-1">
                  {unreadActiveNotifications.length} جديد
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadActiveNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  تعيين الكل كمقروء
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeNotifications.length === 0 ? (
            <div className="text-center py-8 px-6">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">لا توجد إشعارات</h3>
              <p className="text-sm text-muted-foreground">ستظهر الأخبار العاجلة هنا</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2 p-4">
                {activeNotifications.map((notification) => {
                  const isUnread = unreadNotifications.includes(notification.id);
                  const category = mockCategories.find(c => c.id === notification.category);
                  
                  return (
                    <Alert
                      key={notification.id}
                      className={`transition-all cursor-pointer ${
                        isUnread 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      } ${
                        notification.priority === 'critical' 
                          ? 'border-red-500 bg-red-50' 
                          : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        // Here you could navigate to the full article
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority === 'critical' ? 'عاجل جداً' : 
                               notification.priority === 'high' ? 'عاجل' :
                               notification.priority === 'medium' ? 'مهم' : 'عادي'}
                            </Badge>
                            
                            {category && (
                              <Badge variant="outline" className="text-xs">
                                <span className="mr-1">{category.icon}</span>
                                {category.name}
                              </Badge>
                            )}
                          </div>
                          
                          <AlertDescription className="text-right">
                            <div className="font-semibold text-foreground mb-1">
                              {notification.title}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {notification.content}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              
                              <div className="flex items-center gap-2">
                                {notification.soundEnabled && (
                                  <Volume className="w-3 h-3" />
                                )}
                                {notification.vibrationEnabled && (
                                  <Vibrate className="w-3 h-3" />
                                )}
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{notification.viewCount}</span>
                                </div>
                              </div>
                            </div>
                          </AlertDescription>
                        </div>
                        
                        <div className="flex-shrink-0 flex flex-col gap-1">
                          {isUnread && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                              toast.success('تم إخفاء الإشعار');
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Live Notification Banner Component
export function LiveNotificationBanner() {
  const [breakingNews] = useKV<BreakingNews[]>('breaking-news', []);
  const [settings] = useKV<NotificationSettings>('notification-settings', defaultSettings);
  const [dismissedBanners, setDismissedBanners] = useKV<string[]>('dismissed-banners', []);

  const criticalNotifications = breakingNews.filter(n => 
    n.isActive && 
    n.priority === 'critical' && 
    !dismissedBanners.includes(n.id) &&
    (!n.expiresAt || new Date(n.expiresAt) > new Date()) &&
    settings.globalEnabled &&
    settings.priorities.critical
  );

  const dismissBanner = (notificationId: string) => {
    setDismissedBanners(prev => [...prev, notificationId]);
  };

  if (criticalNotifications.length === 0) {
    return null;
  }

  const latestCritical = criticalNotifications[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg" dir="rtl">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <Lightning className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">عاجل</span>
            </div>
            
            <div className="flex-1">
              <div className="font-semibold">{latestCritical.title}</div>
              <div className="text-sm opacity-90">{latestCritical.content}</div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissBanner(latestCritical.id)}
            className="text-white hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {criticalNotifications.length > 1 && (
          <div className="text-xs opacity-75 mt-1">
            +{criticalNotifications.length - 1} إشعار عاجل آخر
          </div>
        )}
      </div>
    </div>
  );
}