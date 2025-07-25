import React, { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, PlusCircle, BookOpen, BarChart3, Users } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Simple sidebar menu structure
const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3 },
  { id: 'articles', label: 'إدارة المقالات', icon: BookOpen },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

// Simple article type
interface SimpleArticle {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: Date;
}

// Simple user type  
interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'writer';
}

function SimpleApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [articles, setArticles] = useState<SimpleArticle[]>([
    {
      id: '1',
      title: 'مقال تجريبي أول',
      content: 'هذا محتوى المقال التجريبي الأول...',
      status: 'published',
      createdAt: new Date()
    },
    {
      id: '2', 
      title: 'مقال تجريبي ثاني',
      content: 'هذا محتوى المقال التجريبي الثاني...',
      status: 'draft',
      createdAt: new Date()
    }
  ]);

  const [users] = useState<SimpleUser[]>([
    { id: '1', name: 'أحمد محمد', email: 'ahmed@sabq.org', role: 'admin' },
    { id: '2', name: 'فاطمة علي', email: 'fatema@sabq.org', role: 'editor' },
    { id: '3', name: 'محمد سالم', email: 'mohammed@sabq.org', role: 'writer' }
  ]);

  // Dashboard view
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <Button onClick={() => toast.success('مرحباً بك في سبق الذكية!')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          إجراء سريع
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقالات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المقالات المنشورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">
              نشط الآن
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              +1 هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المشاهدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-muted-foreground">
              +18% من الأمس
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر المقالات</CardTitle>
          <CardDescription>
            المقالات المضافة مؤخراً في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.slice(0, 3).map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.createdAt.toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                  {article.status === 'published' ? 'منشور' : 'مسودة'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Articles view
  const ArticlesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المقالات</h1>
        <Button onClick={() => {
          const newArticle: SimpleArticle = {
            id: Date.now().toString(),
            title: 'مقال جديد',
            content: 'محتوى المقال الجديد...',
            status: 'draft',
            createdAt: new Date()
          };
          setArticles([...articles, newArticle]);
          toast.success('تم إنشاء مقال جديد');
        }}>
          <PlusCircle className="w-4 h-4 mr-2" />
          مقال جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>
                    تم الإنشاء في {article.createdAt.toLocaleDateString('ar-SA')}
                  </CardDescription>
                </div>
                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                  {article.status === 'published' ? 'منشور' : 'مسودة'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{article.content}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">تعديل</Button>
                <Button size="sm" variant="outline">معاينة</Button>
                {article.status === 'draft' && (
                  <Button size="sm" onClick={() => {
                    const updatedArticles = articles.map(a => 
                      a.id === article.id ? { ...a, status: 'published' as const } : a
                    );
                    setArticles(updatedArticles);
                    toast.success('تم نشر المقال');
                  }}>
                    نشر
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Users view
  const UsersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={() => toast.info('سيتم إضافة مستخدم جديد قريباً')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          مستخدم جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge>
                  {user.role === 'admin' ? 'مدير' : 
                   user.role === 'editor' ? 'محرر' : 'كاتب'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Settings view
  const SettingsView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الإعدادات</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الموقع</CardTitle>
          <CardDescription>إعدادات عامة للموقع والنظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">اسم الموقع</Label>
            <Input id="site-name" defaultValue="سبق الذكية" />
          </div>
          <div>
            <Label htmlFor="site-description">وصف الموقع</Label>
            <Textarea 
              id="site-description" 
              defaultValue="نظام إدارة المحتوى الذكي للصحافة الرقمية"
              rows={3}
            />
          </div>
          <Button onClick={() => toast.success('تم حفظ الإعدادات')}>
            حفظ الإعدادات
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'articles':
        return <ArticlesView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-l border-border">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">س</span>
              </div>
              <div>
                <h2 className="font-bold">سبق الذكية</h2>
                <p className="text-xs text-muted-foreground">نظام إدارة المحتوى</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-right rounded-lg transition-colors",
                      activeView === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h1 className="font-semibold">
                  {menuItems.find(item => item.id === activeView)?.label || 'لوحة التحكم'}
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('?mode=basic', '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  وضع الاختبار
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info('الملف الشخصي قيد التطوير')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
}

export default SimpleApp;