/**
 * Safe Stable App for Sabq Althakiyah CMS
 * Minimal working version to fix deployment issues
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Settings, Users, FileText, BarChart3, Calendar } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

// Safe cn function
function cn(...inputs: any[]): string {
  try {
    return inputs
      .filter(input => input != null && input !== false && input !== '')
      .map(input => {
        if (typeof input === 'string') return input.trim();
        if (typeof input === 'object' && input !== null) {
          return Object.entries(input)
            .filter(([_, condition]) => Boolean(condition))
            .map(([className]) => String(className).trim())
            .join(' ');
        }
        return String(input).trim();
      })
      .filter(className => className && className.length > 0)
      .join(' ');
  } catch {
    return '';
  }
}

// Mock data
const mockArticles = [
  {
    id: '1',
    title: 'مرحباً بكم في سبق الذكية',
    content: 'نظام إدارة المحتوى الذكي المدعوم بالذكاء الاصطناعي',
    author: { id: '1', name: 'Admin', role: 'admin' },
    category: { id: '1', name: 'محليات', color: '#3b82f6' },
    createdAt: new Date(),
    status: 'published'
  }
];

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3 },
  { id: 'articles', label: 'المقالات', icon: FileText },
  { id: 'users', label: 'المستخدمون', icon: Users },
  { id: 'calendar', label: 'التقويم', icon: Calendar },
];

// Simple toast function without sonner
function showToast(message: string) {
  // Create a simple toast element
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

export default function SafeStableApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isRTL, setIsRTL] = useState(true);
  const [articles, setArticles] = useKV('sabq-articles', mockArticles);

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
    document.title = 'سبق الذكية - نظام إدارة المحتوى الذكي';
  }, [isRTL]);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-2">المقالات</h3>
                <p className="text-3xl font-bold text-primary">{articles.length}</p>
              </div>
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-2">المستخدمون</h3>
                <p className="text-3xl font-bold text-accent">150</p>
              </div>
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-2">المشاهدات</h3>
                <p className="text-3xl font-bold text-secondary">12,500</p>
              </div>
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-2">التفاعل</h3>
                <p className="text-3xl font-bold text-chart-1">85%</p>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">مرحباً بكم في سبق الذكية</h2>
              <p className="text-muted-foreground mb-4">
                نظام إدارة المحتوى الذكي المدعوم بالذكاء الاصطناعي للمؤسسات الإعلامية العربية
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setActiveView('articles')}>
                  <FileText className="ml-2 h-4 w-4" />
                  إدارة المقالات
                </Button>
                <Button variant="outline" onClick={() => setActiveView('users')}>
                  <Users className="ml-2 h-4 w-4" />
                  إدارة المستخدمين
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'articles':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">إدارة المقالات</h1>
              <Button onClick={() => showToast('سيتم إضافة هذه الميزة قريباً')}>
                إضافة مقال جديد
              </Button>
            </div>
            
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">المقالات المنشورة</h2>
              </div>
              <div className="divide-y">
                {articles.map((article) => (
                  <div key={article.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{article.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>الكاتب: {article.author.name}</span>
                          <span>القسم: {article.category.name}</span>
                          <span>الحالة: {article.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">تعديل</Button>
                        <Button size="sm" variant="outline">حذف</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
              <Button onClick={() => showToast('سيتم إضافة هذه الميزة قريباً')}>
                إضافة مستخدم جديد
              </Button>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <p className="text-muted-foreground">
                سيتم إضافة نظام إدارة المستخدمين في التحديث القادم
              </p>
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">التقويم</h1>
            <div className="bg-card rounded-lg border p-6">
              <p className="text-muted-foreground">
                سيتم إضافة نظام التقويم والجدولة في التحديث القادم
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">الصفحة غير موجودة</h2>
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">سبق الذكية</h1>
            <p className="text-sm text-muted-foreground">نظام إدارة المحتوى</p>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors",
                        activeView === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => showToast('سيتم إضافة عرض الموقع العام قريباً')}
              className="w-full gap-2"
            >
              <Globe className="h-4 w-4" />
              عرض الموقع العام
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="bg-card border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {menuItems.find(item => item.id === activeView)?.label || 'سبق الذكية'}
              </h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRTL(!isRTL)}
                >
                  {isRTL ? 'EN' : 'عربي'}
                </Button>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">الإعدادات</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}