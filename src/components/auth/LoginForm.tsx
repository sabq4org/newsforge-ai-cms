import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Newspaper, Globe } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Newspaper size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">NewsFlow</h1>
          </div>
          <h2 className="text-xl font-semibold">
            {language.code === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language.code === 'ar' 
              ? 'ادخل إلى نظام إدارة المحتوى الذكي' 
              : 'Access your AI-powered content management system'}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {language.code === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </CardTitle>
              <Select value={language.code} onValueChange={(value: 'en' | 'ar') => switchLanguage(value)}>
                <SelectTrigger className="w-24">
                  <Globe size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ar">عر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language.code === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language.code === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language.code === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language.code === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (language.code === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...') 
                  : (language.code === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {language.code === 'ar' ? 'حسابات تجريبية' : 'Demo Accounts'}
            </CardTitle>
            <CardDescription className="text-xs">
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