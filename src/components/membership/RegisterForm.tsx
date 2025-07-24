import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Envelope, 
  Eye, 
  EyeSlash, 
  GoogleLogo, 
  AppleLogo,
  CheckCircle,
  Warning,
  Clock,
  Heart
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { UserPreferences } from '@/types/membership';

interface RegisterFormProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
}

const CATEGORIES = [
  { id: 'news', label: 'الأخبار العامة', icon: '📰' },
  { id: 'politics', label: 'السياسة', icon: '🏛️' },
  { id: 'sports', label: 'الرياضة', icon: '⚽' },
  { id: 'tech', label: 'التقنية', icon: '💻' },
  { id: 'business', label: 'الأعمال', icon: '💼' },
  { id: 'health', label: 'الصحة', icon: '🏥' },
  { id: 'culture', label: 'الثقافة', icon: '🎭' },
  { id: 'entertainment', label: 'الترفيه', icon: '🎬' },
  { id: 'travel', label: 'السفر والسياحة', icon: '✈️' },
  { id: 'food', label: 'الطعام', icon: '🍽️' },
  { id: 'education', label: 'التعليم', icon: '📚' },
  { id: 'science', label: 'العلوم', icon: '🔬' }
];

const READING_TIMES = [
  { id: 'morning', label: 'الصباح (6-12)', icon: '🌅' },
  { id: 'afternoon', label: 'بعد الظهر (12-18)', icon: '☀️' },
  { id: 'evening', label: 'المساء (18-22)', icon: '🌆' },
  { id: 'night', label: 'الليل (22-6)', icon: '🌙' }
];

const CONTENT_TYPES = [
  { id: 'news', label: 'الأخبار العاجلة' },
  { id: 'analysis', label: 'التحليلات المعمقة' },
  { id: 'opinion', label: 'المقالات الرأي' },
  { id: 'interviews', label: 'المقابلات' },
  { id: 'reports', label: 'التقارير الخاصة' },
  { id: 'features', label: 'المواضيع المميزة' }
];

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    readingTimes: ['morning'],
    contentTypes: ['news', 'analysis'],
    language: 'ar' as const,
    notificationSettings: {
      email: true,
      push: true,
      weeklyDigest: true,
      breakingNews: true,
      dailyRecommendations: true,
      followedTopics: true
    },
    privacySettings: {
      profileVisibility: 'private' as const,
      readingHistoryVisible: false,
      analyticsOptOut: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (preferences.categories.length === 0) {
      toast.error('يرجى اختيار تصنيف واحد على الأقل');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userData = {
        id: `user_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${formData.name}`,
        joinedAt: new Date(),
        lastLoginAt: new Date(),
        preferences
      };

      onRegister(userData);
      toast.success('تم إنشاء الحساب بنجاح! مرحباً بك في سبق الذكية');
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    toast.info(`سيتم إضافة تسجيل الدخول عبر ${provider === 'google' ? 'Google' : 'Apple'} قريباً`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            انضم إلى سبق الذكية
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 1 && "إنشاء حساب جديد"}
            {step === 2 && "تخصيص اهتماماتك"}
            {step === 3 && "إعدادات الخصوصية"}
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum === step 
                    ? 'bg-primary text-primary-foreground' 
                    : stepNum < step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNum < step ? <CheckCircle size={16} /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    stepNum < step ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pr-10"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Envelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pr-10"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة مرور قوية"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    أوافق على <button type="button" className="text-primary hover:underline">الشروط والأحكام</button> و 
                    <button type="button" className="text-primary hover:underline">سياسة الخصوصية</button>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => setFormData({ ...formData, subscribeNewsletter: checked as boolean })}
                  />
                  <Label htmlFor="subscribeNewsletter" className="text-sm">
                    أرغب في تلقي النشرة الإخبارية والتحديثات
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">أو التسجيل باستخدام</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialAuth('google')}
                    className="gap-2"
                  >
                    <GoogleLogo size={18} />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialAuth('apple')}
                    className="gap-2"
                  >
                    <AppleLogo size={18} />
                    Apple
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests and Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">ما هي اهتماماتك؟</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  اختر التصنيفات التي تهمك لنتمكن من تقديم محتوى مخصص لك
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map(category => (
                    <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={category.id}
                        checked={preferences.categories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              categories: [...prev.categories, category.id]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              categories: prev.categories.filter(id => id !== category.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">متى تفضل القراءة؟</h3>
                <div className="grid grid-cols-2 gap-3">
                  {READING_TIMES.map(time => (
                    <div key={time.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={time.id}
                        checked={preferences.readingTimes.includes(time.id as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              readingTimes: [...prev.readingTimes, time.id as any]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              readingTimes: prev.readingTimes.filter(id => id !== time.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={time.id} className="text-sm flex items-center gap-2">
                        <span>{time.icon}</span>
                        {time.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">نوع المحتوى المفضل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONTENT_TYPES.map(type => (
                    <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={type.id}
                        checked={preferences.contentTypes.includes(type.id as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              contentTypes: [...prev.contentTypes, type.id as any]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              contentTypes: prev.contentTypes.filter(id => id !== type.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type.id} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Privacy and Notifications */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">إعدادات الإشعارات</h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'إشعارات البريد الإلكتروني' },
                    { key: 'push', label: 'الإشعارات الفورية' },
                    { key: 'weeklyDigest', label: 'الملخص الأسبوعي' },
                    { key: 'breakingNews', label: 'الأخبار العاجلة' },
                    { key: 'dailyRecommendations', label: 'التوصيات اليومية' },
                    { key: 'followedTopics', label: 'إشعارات المواضيع المتابعة' }
                  ].map(notification => (
                    <div key={notification.key} className="flex items-center justify-between">
                      <Label htmlFor={notification.key} className="text-sm">
                        {notification.label}
                      </Label>
                      <Checkbox
                        id={notification.key}
                        checked={preferences.notificationSettings[notification.key as keyof typeof preferences.notificationSettings]}
                        onCheckedChange={(checked) => {
                          setPreferences(prev => ({
                            ...prev,
                            notificationSettings: {
                              ...prev.notificationSettings,
                              [notification.key]: checked
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">إعدادات الخصوصية</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileVisibility" className="text-sm">
                      مستوى رؤية الملف الشخصي
                    </Label>
                    <Select
                      value={preferences.privacySettings.profileVisibility}
                      onValueChange={(value) => {
                        setPreferences(prev => ({
                          ...prev,
                          privacySettings: {
                            ...prev.privacySettings,
                            profileVisibility: value as any
                          }
                        }));
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
                    <Label htmlFor="readingHistoryVisible" className="text-sm">
                      إظهار سجل القراءة للآخرين
                    </Label>
                    <Checkbox
                      id="readingHistoryVisible"
                      checked={preferences.privacySettings.readingHistoryVisible}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({
                          ...prev,
                          privacySettings: {
                            ...prev.privacySettings,
                            readingHistoryVisible: checked as boolean
                          }
                        }));
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="analyticsOptOut" className="text-sm">
                      عدم المشاركة في التحليلات
                    </Label>
                    <Checkbox
                      id="analyticsOptOut"
                      checked={preferences.privacySettings.analyticsOptOut}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({
                          ...prev,
                          privacySettings: {
                            ...prev.privacySettings,
                            analyticsOptOut: checked as boolean
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Heart size={16} className="text-primary" />
                  ملخص اختياراتك
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">التصنيفات المختارة: </span>
                    {preferences.categories.length} تصنيف
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.categories.map(catId => {
                      const category = CATEGORIES.find(c => c.id === catId);
                      return category ? (
                        <Badge key={catId} variant="secondary" className="text-xs">
                          {category.icon} {category.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  السابق
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {step === 1 && (
                <Button variant="ghost" onClick={onSwitchToLogin}>
                  لديك حساب؟ تسجيل دخول
                </Button>
              )}
              
              {step < 3 ? (
                <Button onClick={handleNextStep}>
                  التالي
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="animate-spin" />
                      جاري الإنشاء...
                    </div>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}