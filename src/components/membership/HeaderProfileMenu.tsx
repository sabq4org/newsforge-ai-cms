import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  UserCircle,
  Settings,
  LogOut,
  Heart,
  BookOpen,
  Clock,
  TrendingUp,
  Bell,
  Star
} from '@phosphor-icons/react';
import { UserProfile } from '@/types/membership';
import { useKV } from '@github/spark/hooks';

interface HeaderProfileMenuProps {
  user: UserProfile | null;
  onShowProfile: () => void;
  onShowSettings: () => void;
  onLogout: () => void;
  unreadNotifications?: number;
}

export function HeaderProfileMenu({ 
  user, 
  onShowProfile, 
  onShowSettings, 
  onLogout,
  unreadNotifications = 0 
}: HeaderProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userStats] = useKV(`user-stats-${user?.id}`, {
    articlesRead: 0,
    savedArticles: 0,
    readingStreak: 0,
    totalTimeSpent: 0
  });

  if (!user) {
    return (
      <Button variant="outline" className="gap-2">
        <User size={16} />
        تسجيل الدخول
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 relative"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline">{user.name}</span>
        
        {/* Notification indicator */}
        {unreadNotifications > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    عضو منذ {new Date(user.joinedAt).getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <BookOpen size={14} />
                  <span>مقروء</span>
                </div>
                <p className="font-semibold text-lg">{userStats.articlesRead}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Heart size={14} />
                  <span>محفوظ</span>
                </div>
                <p className="font-semibold text-lg">{userStats.savedArticles}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp size={14} />
                  <span>متتالي</span>
                </div>
                <p className="font-semibold text-lg">{userStats.readingStreak} يوم</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>ساعات</span>
                </div>
                <p className="font-semibold text-lg">{Math.round(userStats.totalTimeSpent / 60)}</p>
              </div>
            </div>
          </div>

          {/* Reading Recommendations */}
          <div className="p-4 border-b border-border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              توصيات شخصية
            </h4>
            <p className="text-sm text-muted-foreground">
              لديك 3 مقالات جديدة بناءً على اهتماماتك
            </p>
            <Button variant="outline" size="sm" className="w-full mt-2">
              عرض التوصيات
            </Button>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                onShowProfile();
                setIsOpen(false);
              }}
            >
              <UserCircle size={16} />
              الملف الشخصي
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setIsOpen(false);
                // Navigate to notifications
              }}
            >
              <Bell size={16} />
              الإشعارات
              {unreadNotifications > 0 && (
                <Badge className="ml-auto">{unreadNotifications}</Badge>
              )}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                onShowSettings();
                setIsOpen(false);
              }}
            >
              <Settings size={16} />
              الإعدادات
            </Button>
            
            <Separator className="my-2" />
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}