import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Envelope, 
  Eye, 
  EyeSlash, 
  GoogleLogo, 
  AppleLogo,
  Lock,
  Clock,
  Warning
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface LoginFormProps {
  onLogin: (userData: any) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful login
      if (formData.email && formData.password) {
        const userData = {
          id: `user_${Date.now()}`,
          name: 'مستخدم مسجل',
          email: formData.email,
          avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${formData.email}`,
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastLoginAt: new Date(),
          preferences: {
            categories: ['news', 'tech', 'sports'],
            readingTimes: ['morning', 'evening'],
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
          }
        };

        onLogin(userData);
        toast.success('تم تسجيل الدخول بنجاح!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setErrors({ general: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      toast.error('فشل في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    toast.info(`سيتم إضافة تسجيل الدخول عبر ${provider === 'google' ? 'Google' : 'Apple'} قريباً`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            تسجيل الدخول
          </CardTitle>
          <p className="text-muted-foreground">
            مرحباً بعودتك إلى سبق الذكية
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <Warning size={16} className="text-destructive" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

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
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10 pl-10"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  تذكرني
                </Label>
              </div>
              
              <Button
                type="button"
                variant="link"
                onClick={onForgotPassword}
                className="p-0 h-auto text-sm"
              >
                نسيت كلمة المرور؟
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          <Separator className="my-6" />

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

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="p-0 h-auto text-sm font-medium"
              >
                إنشاء حساب جديد
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}