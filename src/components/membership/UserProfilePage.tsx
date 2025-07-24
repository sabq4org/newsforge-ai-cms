import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Envelope, 
  Calendar, 
  MapPin, 
  Eye, 
  Heart, 
  BookOpen,
  Clock,
  Settings,
  Bell,
  Shield,
  Medal,
  Target,
  TrendingUp,
  Camera,
  Edit,
  Save,
  X
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { UserProfile, UserActivity, UserBehaviorAnalysis } from '@/types/membership';
import { Article } from '@/types';

interface UserProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  articles?: Article[];
}

export function UserProfilePage({ user, onUpdateProfile, articles = [] }: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: '',
    location: '',
    website: ''
  });

  const [userActivities, setUserActivities] = useKV<UserActivity[]>(`user-activities-${user.id}`, []);
  const [savedArticles, setSavedArticles] = useKV<string[]>(`saved-articles-${user.id}`, []);
  const [likedArticles, setLikedArticles] = useKV<string[]>(`liked-articles-${user.id}`, []);
  const [behaviorAnalysis, setBehaviorAnalysis] = useKV<UserBehaviorAnalysis | null>(`behavior-analysis-${user.id}`, null);

  // Generate mock data for demonstration
  useEffect(() => {
    generateMockAnalysis();
  }, []);

  const generateMockAnalysis = async () => {
    if (behaviorAnalysis) return;

    const analysis: UserBehaviorAnalysis = {
      userId: user.id,
      analysisDate: new Date(),
      readingPatterns: {
        preferredTimes: ['morning', 'evening'],
        averageSessionDuration: 12.5,
        averageArticlesPerSession: 3.2,
        mostActiveDay: 'الأحد',
        readingSpeed: 250
      },
      contentPreferences: {
        topCategories: [
          { category: 'الأخبار العامة', percentage: 35 },
          { category: 'التقنية', percentage: 25 },
          { category: 'الرياضة', percentage: 20 },
          { category: 'السياسة', percentage: 20 }
        ],
        contentLength: 'medium',
        contentType: ['news', 'analysis', 'opinion']
      },
      engagementMetrics: {
        interactionRate: 0.78,
        returnVisitorRate: 0.92,
        averageTimeOnSite: 18.3,
        bounceRate: 0.23
      },
      personalityProfile: {
        explorationLevel: 'moderate',
        socialEngagement: 'medium',
        newsConsumption: 'regular'
      }
    };

    setBehaviorAnalysis(analysis);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editData.name,
      // Add other profile fields here
    });
    setIsEditing(false);
    toast.success('تم حفظ التغييرات بنجاح');
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updatedPreferences = {
      ...user.preferences,
      [key]: value
    };
    onUpdateProfile({ preferences: updatedPreferences });
    toast.success('تم تحديث الإعدادات');
  };

  const getEngagementLevel = () => {
    const totalActivities = userActivities.length;
    if (totalActivities > 100) return { level: 'عالي', color: 'bg-green-500' };
    if (totalActivities > 30) return { level: 'متوسط', color: 'bg-yellow-500' };
    return { level: 'منخفض', color: 'bg-gray-500' };
  };

  const getReadingStreak = () => {
    // Mock calculation - in real app, calculate from activities
    return Math.floor(Math.random() * 30) + 1;
  };

  const engagement = getEngagementLevel();
  const readingStreak = getReadingStreak();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute -bottom-2 -left-2 rounded-full">
                <Camera size={16} />
              </Button>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="الاسم"
                  />
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="نبذة عنك"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save size={16} className="ml-1" />
                      حفظ
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                      <X size={16} className="ml-1" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                      <Edit size={16} />
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      انضم في {new Date(user.joinedAt).toLocaleDateString('ar')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      آخر نشاط: {new Date(user.lastLoginAt).toLocaleDateString('ar')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{userActivities.length}</p>
                <p className="text-sm text-muted-foreground">نشاط</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{savedArticles.length}</p>
                <p className="text-sm text-muted-foreground">محفوظ</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{readingStreak}</p>
                <p className="text-sm text-muted-foreground">يوم متتالي</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full ${engagement.color} mx-auto mb-1`} />
              <p className="text-sm font-medium">{engagement.level}</p>
              <p className="text-xs text-muted-foreground">مستوى التفاعل</p>
            </div>
            <div className="text-center">
              <Medal className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm font-medium">15</p>
              <p className="text-xs text-muted-foreground">الشارات</p>
            </div>
            <div className="text-center">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-medium">92%</p>
              <p className="text-xs text-muted-foreground">دقة التوصيات</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-medium">+23%</p>
              <p className="text-xs text-muted-foreground">تحسن هذا الشهر</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="interests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="interests">الاهتمامات</TabsTrigger>
          <TabsTrigger value="activities">النشاطات</TabsTrigger>
          <TabsTrigger value="saved">المحفوظات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Interests Tab */}
        <TabsContent value="interests">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>التصنيفات المفضلة</CardTitle>
                <CardDescription>المواضيع التي تهمك أكثر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.categories.map(category => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أوقات القراءة المفضلة</CardTitle>
                <CardDescription>متى تفضل قراءة الأخبار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.readingTimes.map(time => (
                    <Badge key={time} variant="outline">
                      {time === 'morning' && '🌅 الصباح'}
                      {time === 'afternoon' && '☀️ بعد الظهر'}
                      {time === 'evening' && '🌆 المساء'}
                      {time === 'night' && '🌙 الليل'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أنواع المحتوى</CardTitle>
                <CardDescription>المحتوى الذي تفضل قراءته</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.contentTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات السريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>إجمالي المقالات المقروءة</span>
                  <span className="font-medium">{userActivities.filter(a => a.type === 'read').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>المقالات المحفوظة</span>
                  <span className="font-medium">{savedArticles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>المقالات المعجب بها</span>
                  <span className="font-medium">{likedArticles.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                النشاطات الأخيرة
              </CardTitle>
              <CardDescription>سجل تفاعلك مع المحتوى</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد نشاطات بعد
                  </p>
                ) : (
                  userActivities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'read' && <BookOpen size={20} className="text-blue-500" />}
                        {activity.type === 'like' && <Heart size={20} className="text-red-500" />}
                        {activity.type === 'share' && <TrendingUp size={20} className="text-green-500" />}
                        {activity.type === 'save' && <BookOpen size={20} className="text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.type === 'read' && 'قرأ مقال'}
                          {activity.type === 'like' && 'أعجب بمقال'}
                          {activity.type === 'share' && 'شارك مقال'}
                          {activity.type === 'save' && 'حفظ مقال'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString('ar')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Articles Tab */}
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                المقالات المحفوظة
              </CardTitle>
              <CardDescription>المقالات التي حفظتها للقراءة لاحقاً</CardDescription>
            </CardHeader>
            <CardContent>
              {savedArticles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لم تحفظ أي مقالات بعد
                </p>
              ) : (
                <div className="space-y-4">
                  {articles
                    .filter(article => savedArticles.includes(article.id))
                    .slice(0, 5)
                    .map(article => (
                      <div key={article.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.excerpt?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{article.category?.name}</Badge>
                          <Button variant="outline" size="sm">
                            قراءة
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {behaviorAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أنماط القراءة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>متوسط مدة الجلسة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.averageSessionDuration} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط المقالات في الجلسة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.averageArticlesPerSession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سرعة القراءة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.readingSpeed} كلمة/دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>اليوم الأكثر نشاطاً</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.mostActiveDay}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التصنيفات الأكثر قراءة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {behaviorAnalysis.contentPreferences.topCategories.map(cat => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{cat.category}</span>
                        <span>{cat.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>مقاييس التفاعل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>معدل التفاعل</span>
                    <span className="font-medium">{Math.round(behaviorAnalysis.engagementMetrics.interactionRate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل العودة</span>
                    <span className="font-medium">{Math.round(behaviorAnalysis.engagementMetrics.returnVisitorRate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط الوقت في الموقع</span>
                    <span className="font-medium">{behaviorAnalysis.engagementMetrics.averageTimeOnSite} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل الارتداد</span>
                    <span className="font-medium">{Math.round(behaviorAnalysis.engagementMetrics.bounceRate * 100)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>مستوى الاستكشاف</span>
                    <Badge variant="secondary">{behaviorAnalysis.personalityProfile.explorationLevel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>التفاعل الاجتماعي</span>
                    <Badge variant="secondary">{behaviorAnalysis.personalityProfile.socialEngagement}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>استهلاك الأخبار</span>
                    <Badge variant="secondary">{behaviorAnalysis.personalityProfile.newsConsumption}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(user.preferences.notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key}>
                      {key === 'email' && 'إشعارات البريد الإلكتروني'}
                      {key === 'push' && 'الإشعارات الفورية'}
                      {key === 'weeklyDigest' && 'الملخص الأسبوعي'}
                      {key === 'breakingNews' && 'الأخبار العاجلة'}
                      {key === 'dailyRecommendations' && 'التوصيات اليومية'}
                      {key === 'followedTopics' && 'إشعارات المواضيع المتابعة'}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => {
                        handlePreferenceChange('notificationSettings', {
                          ...user.preferences.notificationSettings,
                          [key]: checked
                        });
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  إعدادات الخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>مستوى رؤية الملف الشخصي</Label>
                  <Select
                    value={user.preferences.privacySettings.profileVisibility}
                    onValueChange={(value) => {
                      handlePreferenceChange('privacySettings', {
                        ...user.preferences.privacySettings,
                        profileVisibility: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">خاص</SelectItem>
                      <SelectItem value="friends">الأصدقاء فقط</SelectItem>
                      <SelectItem value="public">عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="readingHistoryVisible">
                    إظهار سجل القراءة للآخرين
                  </Label>
                  <Switch
                    id="readingHistoryVisible"
                    checked={user.preferences.privacySettings.readingHistoryVisible}
                    onCheckedChange={(checked) => {
                      handlePreferenceChange('privacySettings', {
                        ...user.preferences.privacySettings,
                        readingHistoryVisible: checked
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="analyticsOptOut">
                    عدم المشاركة في التحليلات
                  </Label>
                  <Switch
                    id="analyticsOptOut"
                    checked={user.preferences.privacySettings.analyticsOptOut}
                    onCheckedChange={(checked) => {
                      handlePreferenceChange('privacySettings', {
                        ...user.preferences.privacySettings,
                        analyticsOptOut: checked
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إدارة الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full">
                  تصدير البيانات
                </Button>
                <Button variant="destructive" className="w-full">
                  حذف الحساب
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}