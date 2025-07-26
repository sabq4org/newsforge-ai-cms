import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Newspaper, Globe } from '@phosphor-icons/react';
import { toast } from 'sonner';
import sabqLogoOfficial from '@/assets/images/sabq-logo-official.svg';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchLanguage, language } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        toast.success(language.code === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      } else {
        toast.error(language.code === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
      }
    } catch (error) {
      toast.error(language.code === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'sarah@newsflow.com', role: 'Admin', name: 'Sarah Ahmed' },
    { email: 'mohammed@newsflow.com', role: 'Editor', name: 'محمد عبدالله' },
    { email: 'lisa@newsflow.com', role: 'Reporter', name: 'Lisa Chen' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4 font-arabic">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Official Sabq Logo */}
            <img 
              src={sabqLogoOfficial} 
              alt={language.code === 'ar' ? "شعار سبق الذكية" : "Sabq Althakiyah Logo"}
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-semibold font-arabic">
            {language.code === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </h2>
          <p className="text-muted-foreground text-sm font-arabic">
            {language.code === 'ar' 
              ? 'ادخل إلى نظام إدارة المحتوى الذكي' 
              : 'Access your AI-powered content management system'}
          </p>
        </div>

        <Card className="font-arabic">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-arabic">
                {language.code === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </CardTitle>
              <Select value={language.code} onValueChange={(value: 'en' | 'ar') => switchLanguage(value)}>
                <SelectTrigger className="w-24 font-arabic">
                  <Globe size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-arabic">
                  <SelectItem value="en" className="font-arabic">EN</SelectItem>
                  <SelectItem value="ar" className="font-arabic">عر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-arabic">
                  {language.code === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language.code === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  required
                  className="font-arabic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-arabic">
                  {language.code === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language.code === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                  className="font-arabic"
                />
              </div>
              <Button type="submit" className="w-full font-arabic" disabled={isLoading}>
                {isLoading 
                  ? (language.code === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...') 
                  : (language.code === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="font-arabic">
          <CardHeader>
            <CardTitle className="text-sm font-arabic">
              {language.code === 'ar' ? 'حسابات تجريبية' : 'Demo Accounts'}
            </CardTitle>
            <CardDescription className="text-xs font-arabic">
              {language.code === 'ar' ? 'كلمة المرور: password' : 'Password: password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password');
                  }}
                  className="w-full p-2 text-xs text-left border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{cred.name}</div>
                  <div className="text-muted-foreground">{cred.email} • {cred.role}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}