import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Star, 
  Heart, 
  Share, 
  BookOpen, 
  Clock,
  Users,
  TrendingUp,
  Eye,
  Lightbulb,
  Moon,
  Sun,
  Sparkles,
  Play,
  Pause
} from '@phosphor-icons/react';
import { useTheme, themePresets } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface ThemePreviewCardProps {
  preset: typeof themePresets[0];
  isActive: boolean;
  onPreview: () => void;
  onApply: () => void;
}

const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ 
  preset, 
  isActive, 
  onPreview, 
  onApply 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'editorial': return <Lightbulb className="w-4 h-4" />;
      case 'business': return <Sparkles className="w-4 h-4" />;
      case 'modern': return <Moon className="w-4 h-4" />;
      case 'classic': return <Sun className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'editorial': return 'تحريري';
      case 'business': return 'تجاري';
      case 'modern': return 'عصري';
      case 'classic': return 'كلاسيكي';
      default: return 'عام';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isActive ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{preset.nameAr}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            {getCategoryIcon(preset.category)}
            {getCategoryLabel(preset.category)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{preset.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Color Palette Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">لوحة الألوان</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div 
                className="w-full h-8 rounded border mb-1"
                style={{ backgroundColor: preset.colors.primary }}
                title="Primary"
              />
              <p className="text-xs">أساسي</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-8 rounded border mb-1"
                style={{ backgroundColor: preset.colors.accent }}
                title="Accent"
              />
              <p className="text-xs">تمييز</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-8 rounded border mb-1"
                style={{ backgroundColor: preset.colors.secondary }}
                title="Secondary"
              />
              <p className="text-xs">ثانوي</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-8 rounded border mb-1"
                style={{ backgroundColor: preset.colors.card }}
                title="Card"
              />
              <p className="text-xs">بطاقة</p>
            </div>
          </div>
        </div>

        {/* Sample Components */}
        <div className="space-y-3" style={{ 
          '--preview-primary': preset.colors.primary,
          '--preview-accent': preset.colors.accent,
          '--preview-secondary': preset.colors.secondary,
          '--preview-background': preset.colors.background,
          '--preview-foreground': preset.colors.foreground,
          '--preview-card': preset.colors.card,
          '--preview-muted': preset.colors.muted,
        } as React.CSSProperties}>
          
          {/* Button Preview */}
          <div className="flex gap-2 flex-wrap">
            <button 
              className="px-3 py-1 text-xs rounded text-white"
              style={{ backgroundColor: preset.colors.primary }}
            >
              زر أساسي
            </button>
            <button 
              className="px-3 py-1 text-xs rounded border"
              style={{ 
                backgroundColor: preset.colors.secondary,
                borderColor: preset.colors.border,
                color: preset.colors.foreground
              }}
            >
              ثانوي
            </button>
          </div>

          {/* Card Preview */}
          <div 
            className="p-3 rounded border text-xs"
            style={{ 
              backgroundColor: preset.colors.card,
              borderColor: preset.colors.border,
              color: preset.colors.cardForeground
            }}
          >
            <div className="font-medium mb-1">عنوان المقال</div>
            <div style={{ color: preset.colors.mutedForeground }}>
              نص تجريبي لعرض شكل المحتوى
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPreview}
            className="flex-1 gap-1"
          >
            <Eye className="w-3 h-3" />
            معاينة
          </Button>
          <Button 
            variant={isActive ? "default" : "secondary"}
            size="sm"
            onClick={onApply}
            className="flex-1"
            disabled={isActive}
          >
            {isActive ? 'مُطبّق' : 'تطبيق'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ThemeTestingShowcase: React.FC = () => {
  const { themeSettings, applyPreset, getCurrentColors } = useTheme();
  const [previewingTheme, setPreviewingTheme] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentColors = getCurrentColors();

  const handlePreviewTheme = (themeId: string) => {
    if (previewingTheme === themeId) {
      setPreviewingTheme(null);
      toast.info('تم إنهاء المعاينة');
    } else {
      setPreviewingTheme(themeId);
      setIsAnimating(true);
      
      // Temporarily apply theme colors for preview
      const preset = themePresets.find(p => p.id === themeId);
      if (preset) {
        // Apply preview colors to CSS variables temporarily
        const root = document.documentElement;
        Object.entries(preset.colors).forEach(([key, value]) => {
          const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(cssVar, value);
        });
        
        toast.success(`معاينة ثيم: ${preset.nameAr}`);
        
        // Reset animation after transition
        setTimeout(() => setIsAnimating(false), 300);
      }
    }
  };

  const handleApplyTheme = (themeId: string) => {
    const preset = themePresets.find(p => p.id === themeId);
    if (preset) {
      applyPreset(themeId);
      setPreviewingTheme(null);
      toast.success(`تم تطبيق ثيم: ${preset.nameAr}`);
    }
  };

  const stopPreview = () => {
    if (previewingTheme) {
      // Restore original theme
      const root = document.documentElement;
      Object.entries(currentColors).forEach(([key, value]) => {
        const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(cssVar, value);
      });
      
      setPreviewingTheme(null);
      toast.info('تم إعادة الثيم الأصلي');
    }
  };

  const categoryGroups = themePresets.reduce((groups, preset) => {
    if (!groups[preset.category]) {
      groups[preset.category] = [];
    }
    groups[preset.category].push(preset);
    return groups;
  }, {} as Record<string, typeof themePresets>);

  const categoryLabels = {
    editorial: 'ثيمات تحريرية',
    business: 'ثيمات تجارية', 
    modern: 'ثيمات عصرية',
    classic: 'ثيمات كلاسيكية'
  };

  const sampleArticles = [
    {
      id: '1',
      title: 'الذكاء الاصطناعي يحول مستقبل الصحافة الرقمية',
      category: 'تقنية',
      author: 'أحمد محمد',
      readTime: '5 دقائق',
      views: 1250,
      likes: 89
    },
    {
      id: '2', 
      title: 'تطوير نظام إدارة المحتوى الذكي لسبق',
      category: 'محليات',
      author: 'فاطمة أحمد',
      readTime: '3 دقائق',
      views: 897,
      likes: 67
    }
  ];

  return (
    <div className={`space-y-6 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تجربة الثيمات الجاهزة</h1>
          <p className="text-muted-foreground mt-2">
            اكتشف وجرب جميع الثيمات المتاحة لصحيفة سبق الذكية
          </p>
        </div>
        
        {previewingTheme && (
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              في وضع المعاينة
            </Badge>
            <Button
              variant="outline"
              onClick={stopPreview}
              className="gap-2"
            >
              <Pause className="w-4 h-4" />
              إنهاء المعاينة
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="all-themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-themes">جميع الثيمات</TabsTrigger>
          <TabsTrigger value="comparison">مقارنة الثيمات</TabsTrigger>
          <TabsTrigger value="live-preview">معاينة مباشرة</TabsTrigger>
        </TabsList>

        {/* All Themes */}
        <TabsContent value="all-themes" className="space-y-8">
          {Object.entries(categoryGroups).map(([category, presets]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {category === 'editorial' && <Lightbulb className="w-5 h-5" />}
                {category === 'business' && <Sparkles className="w-5 h-5" />}
                {category === 'modern' && <Moon className="w-5 h-5" />}
                {category === 'classic' && <Sun className="w-5 h-5" />}
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {presets.map((preset) => (
                  <ThemePreviewCard
                    key={preset.id}
                    preset={preset}
                    isActive={themeSettings.activePreset === preset.id}
                    onPreview={() => handlePreviewTheme(preset.id)}
                    onApply={() => handleApplyTheme(preset.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Theme Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة الثيمات</CardTitle>
              <p className="text-sm text-muted-foreground">
                مقارنة سريعة بين جميع الثيمات المتاحة
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {themePresets.map((preset) => (
                  <div key={preset.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{preset.nameAr}</h3>
                      <Badge variant="outline">{preset.category}</Badge>
                    </div>
                    
                    {/* Color swatches */}
                    <div className="flex gap-1">
                      {Object.entries(preset.colors).slice(0, 6).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handlePreviewTheme(preset.id)}
                      >
                        معاينة
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleApplyTheme(preset.id)}
                        disabled={themeSettings.activePreset === preset.id}
                      >
                        تطبيق
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Preview */}
        <TabsContent value="live-preview" className="space-y-6">
          {previewingTheme ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-500" />
                  معاينة مباشرة: {themePresets.find(p => p.id === previewingTheme)?.nameAr}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  تم تطبيق الثيم مؤقتاً لرؤية التأثير على واجهة المستخدم
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={stopPreview} variant="destructive" className="w-full">
                    إنهاء المعاينة وإعادة الثيم الأصلي
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    onClick={() => handleApplyTheme(previewingTheme)}
                    className="w-full"
                  >
                    تطبيق هذا الثيم نهائياً
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>المعاينة المباشرة</CardTitle>
                <p className="text-sm text-muted-foreground">
                  اختر أي ثيم من الأعلى لرؤية المعاينة المباشرة
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    لم يتم اختيار أي ثيم للمعاينة بعد
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Content for Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <CardTitle className="text-base line-clamp-2">
                    {article.title}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground">
                    بقلم {article.author}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {article.likes}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};