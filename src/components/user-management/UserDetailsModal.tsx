import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ChartBarHorizontal,
  Medal,
  Crown,
  Shield,
  UserCheck,
  Clock,
  Heart,
  MessageCircle,
  Share,
  BookOpen,
  Star,
  Flame,
  Target,
  Settings,
  Ban,
  CheckCircle
} from '@phosphor-icons/react';
import { UserProfile } from '@/types/user-management';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UserDetailsModalProps {
  user: UserProfile;
  onClose: () => void;
  onUserUpdate: (updates: Partial<UserProfile>) => void;
}

export function UserDetailsModal({ user, onClose, onUserUpdate }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'banned': return 'text-red-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'moderator': return 'text-purple-600';
      case 'vip': return 'text-yellow-600';
      case 'media': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const loyaltyTierColors = {
    bronze: 'text-orange-600',
    silver: 'text-gray-600',
    gold: 'text-yellow-600',
    platinum: 'text-purple-600'
  };

  const loyaltyTierNames = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    platinum: 'بلاتيني'
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {user.name}
                {user.isVerified && <UserCheck className="w-5 h-5 text-green-500" />}
                {user.role === 'vip' && <Crown className="w-5 h-5 text-yellow-500" />}
                {user.role === 'admin' && <Shield className="w-5 h-5 text-red-500" />}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span>{user.email}</span>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status === 'active' ? 'نشط' : user.status === 'banned' ? 'محظور' : 'غير نشط'}
                </Badge>
                <Badge variant="outline">
                  {user.role === 'admin' ? 'مدير' : user.role === 'vip' ? 'VIP' : user.role === 'media' ? 'إعلامي' : 'عادي'}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
            <TabsTrigger value="loyalty">الولاء</TabsTrigger>
            <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع</p>
                      <p className="font-medium">
                        {user.city && user.country ? `${user.city}, ${user.country}` : user.country || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                      <p className="font-medium">
                        {format(user.joinedAt, 'dd MMMM yyyy', { locale: ar })}
                      </p>
                    </div>
                  </div>
                  
                  {user.lastLogin && (
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">آخر دخول</p>
                        <p className="font-medium">
                          {formatDistanceToNow(user.lastLogin, { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBarHorizontal className="w-5 h-5" />
                    الإحصائيات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-2xl font-bold">{user.stats.totalArticlesRead}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">مقال مقروء</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <span className="text-2xl font-bold">{user.stats.commentsCount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">تعليق</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-2xl font-bold">{user.stats.likesCount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">إعجاب</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Share className="w-4 h-4 text-purple-500" />
                        <span className="text-2xl font-bold">{user.stats.sharesCount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">مشاركة</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المتوسط اليومي للقراءة</span>
                      <span>{user.stats.averageReadingTime} دقيقة</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>السلسلة الحالية</span>
                      <span>{user.stats.currentStreak} يوم</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>أطول سلسلة</span>
                      <span>{user.stats.longestStreak} يوم</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags and Interests */}
            <Card>
              <CardHeader>
                <CardTitle>الاهتمامات والوسوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">الوسوم:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">الاهتمامات:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.interests.map(interest => (
                        <Badge key={interest} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">الفئات المفضلة:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.stats.favoriteCategories.map(category => (
                        <Badge key={category} variant="default">{category}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  نشاط المستخدم
                </CardTitle>
                <CardDescription>
                  آخر الأنشطة والتفاعلات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">قرأ مقال "التطورات التقنية الحديثة"</p>
                      <p className="text-sm text-muted-foreground">منذ ساعتين</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">علق على مقال "الذكاء الاصطناعي"</p>
                      <p className="text-sm text-muted-foreground">منذ 4 ساعات</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">أعجب بـ 3 مقالات</p>
                      <p className="text-sm text-muted-foreground">أمس</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Share className="w-5 h-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium">شارك مقال "مستقبل الصحافة"</p>
                      <p className="text-sm text-muted-foreground">منذ يومين</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            {user.loyaltyInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    برنامج الولاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <Badge variant="outline" className={`text-lg px-4 py-2 ${loyaltyTierColors[user.loyaltyInfo.tier]}`}>
                        {loyaltyTierNames[user.loyaltyInfo.tier]}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2">{user.loyaltyInfo.points}</div>
                    <p className="text-muted-foreground">نقطة ولاء</p>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">المستوى {user.loyaltyInfo.level}</p>
                      <Progress value={(user.loyaltyInfo.level % 10) * 10} className="h-2" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      الشارات المكتسبة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.loyaltyInfo.badges.map(badge => (
                        <Badge key={badge} variant="secondary">
                          {badge === 'early_adopter' ? 'مستخدم مبكر' : 
                           badge === 'frequent_reader' ? 'قارئ نشط' :
                           badge === 'social_sharer' ? 'مشارك اجتماعي' : badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      الإنجازات
                    </h4>
                    <div className="space-y-2">
                      {user.loyaltyInfo.achievements.map(achievement => (
                        <div key={achievement} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {achievement === 'first_article' ? 'أول مقال مقروء' :
                             achievement === 'weekly_reader' ? 'قارئ أسبوعي' :
                             achievement === 'social_butterfly' ? 'نشط اجتماعياً' : achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  التفضيلات والإعدادات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">اللغة</p>
                    <p className="font-medium">{user.preferences.language === 'ar' ? 'العربية' : 'English'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">المنطقة الزمنية</p>
                    <p className="font-medium">{user.preferences.timezone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">النشرة الإخبارية</p>
                    <Badge variant={user.preferences.newsletter ? 'default' : 'secondary'}>
                      {user.preferences.newsletter ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إشعارات البريد</p>
                    <Badge variant={user.preferences.emailNotifications ? 'default' : 'secondary'}>
                      {user.preferences.emailNotifications ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الإشعارات المباشرة</p>
                    <Badge variant={user.preferences.pushNotifications ? 'default' : 'secondary'}>
                      {user.preferences.pushNotifications ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت القراءة المفضل</p>
                    <p className="font-medium">
                      {user.preferences.readingTime === 'morning' ? 'الصباح' :
                       user.preferences.readingTime === 'afternoon' ? 'بعد الظهر' :
                       user.preferences.readingTime === 'evening' ? 'المساء' : 'الليل'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          {user.status === 'banned' ? (
            <Button 
              onClick={() => onUserUpdate({ status: 'active' })}
              className="gap-2"
            >
              <UserCheck className="w-4 h-4" />
              إلغاء الحظر
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={() => onUserUpdate({ status: 'banned' })}
              className="gap-2"
            >
              <Ban className="w-4 h-4" />
              حظر المستخدم
            </Button>
          )}
          
          {!user.isVerified && (
            <Button 
              onClick={() => onUserUpdate({ isVerified: true })}
              className="gap-2"
            >
              <UserCheck className="w-4 h-4" />
              تفعيل الحساب
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}