import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Eye, 
  Download, 
  Upload,
  Play,
  Settings,
  Sparkles,
  Monitor,
  Sun,
  Moon,
  PaintBrush,
  Package,
  TestTube,
  Gear
} from '@phosphor-icons/react';
import { LiveThemePreview } from './LiveThemePreview';
import { ThemeImportExport } from './ThemeImportExport';
import { InteractiveThemeDemo } from './InteractiveThemeDemo';
import { ThemeTestingShowcase } from './ThemeTestingShowcase';
import { TypographyShowcase } from './TypographyShowcase';

interface ThemeManagerSection {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  category: 'design' | 'tools' | 'advanced';
  featured?: boolean;
}

const themeManagerSections: ThemeManagerSection[] = [
  {
    id: 'live-preview',
    title: 'Live Theme Preview',
    titleAr: 'المعاينة المباشرة للثيمات',
    description: 'Preview and test themes in real-time before applying',
    descriptionAr: 'معاينة واختبار الثيمات في الوقت الفعلي قبل التطبيق',
    icon: Eye,
    component: LiveThemePreview,
    category: 'design',
    featured: true
  },
  {
    id: 'interactive-demo',
    title: 'Interactive Theme Demo',
    titleAr: 'العرض التفاعلي للثيمات',
    description: 'Watch animated theme transitions and color changes',
    descriptionAr: 'شاهد انتقالات الثيمات المتحركة وتغيرات الألوان',
    icon: Play,
    component: InteractiveThemeDemo,
    category: 'design',
    featured: true
  },
  {
    id: 'import-export',
    title: 'Import & Export Themes',
    titleAr: 'استيراد وتصدير الثيمات',
    description: 'Share and backup your custom themes',
    descriptionAr: 'شارك واحفظ نسخ احتياطية من ثيماتك المخصصة',
    icon: Package,
    component: ThemeImportExport,
    category: 'tools'
  },
  {
    id: 'theme-testing',
    title: 'Theme Testing Suite',
    titleAr: 'مجموعة اختبار الثيمات',
    description: 'Comprehensive testing tools for theme validation',
    descriptionAr: 'أدوات اختبار شاملة للتحقق من صحة الثيمات',
    icon: TestTube,
    component: ThemeTestingShowcase,
    category: 'advanced'
  },
  {
    id: 'typography',
    title: 'Typography & Fonts',
    titleAr: 'الطباعة والخطوط',
    description: 'Manage fonts and typography settings',
    descriptionAr: 'إدارة الخطوط وإعدادات الطباعة',
    icon: PaintBrush,
    component: TypographyShowcase,
    category: 'design'
  }
];

const categories = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Palette },
  { id: 'design', name: 'التصميم', nameEn: 'Design', icon: Sparkles },
  { id: 'tools', name: 'الأدوات', nameEn: 'Tools', icon: Settings },
  { id: 'advanced', name: 'متقدم', nameEn: 'Advanced', icon: Gear }
];

export const ComprehensiveThemeManager: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredSections = selectedCategory === 'all' 
    ? themeManagerSections 
    : themeManagerSections.filter(section => section.category === selectedCategory);

  const featuredSections = themeManagerSections.filter(section => section.featured);

  if (activeSection) {
    const section = themeManagerSections.find(s => s.id === activeSection);
    if (section) {
      const Component = section.component;
      return (
        <div className="space-y-4">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveSection(null)}
              className="gap-2"
            >
              ← العودة إلى إدارة الثيمات
            </Button>
            <Badge variant="secondary" className="gap-2">
              <section.icon className="w-3 h-3" />
              {section.titleAr}
            </Badge>
          </div>
          <Component />
        </div>
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          إدارة الثيمات الشاملة
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          مركز التحكم الكامل في ثيمات وألوان منصة سبق الذكية - صمم، اختبر، وطبق ثيماتك المخصصة
        </p>
      </div>

      {/* Quick Access Cards */}
      {featuredSections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">الأدوات المميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredSections.map(section => (
              <Card 
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-all group border-2 border-transparent hover:border-primary/20"
                onClick={() => setActiveSection(section.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                        <section.icon className="w-6 h-6" />
                        {section.titleAr}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {section.descriptionAr}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      مميز
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection(section.id);
                    }}
                  >
                    <section.icon className="w-4 h-4" />
                    فتح الأداة
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">تصفح الأدوات</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const CategoryIcon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <CategoryIcon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* All Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map(section => (
          <Card 
            key={section.id}
            className="cursor-pointer hover:shadow-md transition-all group"
            onClick={() => setActiveSection(section.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {section.titleAr}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize"
                      >
                        {categories.find(c => c.id === section.category)?.name}
                      </Badge>
                      {section.featured && (
                        <Badge variant="secondary" className="text-xs">
                          مميز
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm mt-2">
                {section.descriptionAr}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection(section.id);
                }}
              >
                <section.icon className="w-3 h-3" />
                فتح
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Theme Switcher */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            التبديل السريع للثيمات
          </CardTitle>
          <CardDescription>
            غيّر مظهر النظام فوراً باستخدام الثيمات الجاهزة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Sun className="w-4 h-4" />
              فاتح
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Moon className="w-4 h-4" />
              داكن
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              تباين عالي
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Monitor className="w-4 h-4" />
              افتراضي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ثيمات متاحة</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Palette className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ثيمات مخصصة</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <PaintBrush className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">أدوات متاحة</p>
                <p className="text-2xl font-bold">{themeManagerSections.length}</p>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الثيم النشط</p>
                <p className="text-2xl font-bold">افتراضي</p>
              </div>
              <Monitor className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveThemeManager;