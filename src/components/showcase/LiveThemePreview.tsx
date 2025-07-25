import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Eye, 
  Download, 
  Upload,
  RotateCcw,
  Save,
  Sun,
  Moon,
  Monitor,
  Sparkle,
  Copy,
  Check
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface ThemePreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    destructive: string;
    destructiveForeground: string;
  };
  category: 'professional' | 'creative' | 'modern' | 'classic';
}

const themePresets: ThemePreset[] = [
  // Professional Themes
  {
    id: 'sabq-default',
    name: 'Sabq Default',
    nameAr: 'سبق الافتراضي',
    description: 'Professional editorial theme with deep navy and warm grays',
    descriptionAr: 'ثيم تحريري احترافي بالأزرق الداكن والرمادي الدافئ',
    category: 'professional',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0 0)',
      card: 'oklch(0.98 0 0)',
      cardForeground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.25 0.08 250)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.9 0 0)',
      secondaryForeground: 'oklch(0.2 0 0)',
      accent: 'oklch(0.65 0.15 45)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.95 0 0)',
      mutedForeground: 'oklch(0.45 0 0)',
      border: 'oklch(0.9 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    nameAr: 'الأزرق المؤسسي',
    description: 'Trust-inspiring corporate blue with clean whites',
    descriptionAr: 'أزرق مؤسسي يبعث على الثقة مع الأبيض النظيف',
    category: 'professional',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.99 0 0)',
      cardForeground: 'oklch(0.1 0 0)',
      primary: 'oklch(0.45 0.15 220)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.92 0 0)',
      secondaryForeground: 'oklch(0.25 0 0)',
      accent: 'oklch(0.55 0.12 200)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.96 0 0)',
      mutedForeground: 'oklch(0.4 0 0)',
      border: 'oklch(0.88 0 0)',
      destructive: 'oklch(0.6 0.25 15)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Professional',
    nameAr: 'الغابة المهنية',
    description: 'Sophisticated forest green for environmental or tech news',
    descriptionAr: 'أخضر غابات أنيق للأخبار البيئية أو التقنية',
    category: 'professional',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.12 0 0)',
      card: 'oklch(0.98 0 0)',
      cardForeground: 'oklch(0.12 0 0)',
      primary: 'oklch(0.35 0.12 150)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.91 0 0)',
      secondaryForeground: 'oklch(0.22 0 0)',
      accent: 'oklch(0.45 0.18 120)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.95 0 0)',
      mutedForeground: 'oklch(0.42 0 0)',
      border: 'oklch(0.89 0 0)',
      destructive: 'oklch(0.58 0.24 25)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  
  // Creative Themes
  {
    id: 'sunset-creative',
    name: 'Sunset Creative',
    nameAr: 'الغروب الإبداعي',
    description: 'Warm sunset colors for lifestyle and creative content',
    descriptionAr: 'ألوان غروب دافئة للمحتوى الإبداعي ونمط الحياة',
    category: 'creative',
    colors: {
      background: 'oklch(0.99 0.01 30)',
      foreground: 'oklch(0.15 0 0)',
      card: 'oklch(0.97 0.02 25)',
      cardForeground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.55 0.18 35)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.9 0.05 45)',
      secondaryForeground: 'oklch(0.2 0 0)',
      accent: 'oklch(0.65 0.22 20)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.94 0.03 35)',
      mutedForeground: 'oklch(0.45 0 0)',
      border: 'oklch(0.88 0.04 40)',
      destructive: 'oklch(0.6 0.25 15)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    nameAr: 'عمق المحيط',
    description: 'Deep ocean blues and teals for a calming read',
    descriptionAr: 'أزرق وتركوازي المحيط العميق للقراءة المهدئة',
    category: 'creative',
    colors: {
      background: 'oklch(0.98 0.02 210)',
      foreground: 'oklch(0.12 0 0)',
      card: 'oklch(0.96 0.03 200)',
      cardForeground: 'oklch(0.12 0 0)',
      primary: 'oklch(0.4 0.15 210)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.89 0.05 195)',
      secondaryForeground: 'oklch(0.18 0 0)',
      accent: 'oklch(0.5 0.18 180)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.93 0.04 200)',
      mutedForeground: 'oklch(0.4 0 0)',
      border: 'oklch(0.87 0.06 205)',
      destructive: 'oklch(0.58 0.24 25)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  
  // Modern Themes
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    nameAr: 'الأسود البسيط',
    description: 'Clean dark theme for modern editorial experience',
    descriptionAr: 'ثيم داكن نظيف للتجربة التحريرية الحديثة',
    category: 'modern',
    colors: {
      background: 'oklch(0.08 0 0)',
      foreground: 'oklch(0.92 0 0)',
      card: 'oklch(0.12 0 0)',
      cardForeground: 'oklch(0.92 0 0)',
      primary: 'oklch(0.7 0.12 250)',
      primaryForeground: 'oklch(0.08 0 0)',
      secondary: 'oklch(0.18 0 0)',
      secondaryForeground: 'oklch(0.85 0 0)',
      accent: 'oklch(0.75 0.15 45)',
      accentForeground: 'oklch(0.08 0 0)',
      muted: 'oklch(0.15 0 0)',
      mutedForeground: 'oklch(0.6 0 0)',
      border: 'oklch(0.22 0 0)',
      destructive: 'oklch(0.65 0.25 15)',
      destructiveForeground: 'oklch(0.08 0 0)',
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    nameAr: 'التباين العالي',
    description: 'Maximum readability with high contrast design',
    descriptionAr: 'أقصى قابلية للقراءة مع تصميم عالي التباين',
    category: 'modern',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0 0 0)',
      card: 'oklch(0.99 0 0)',
      cardForeground: 'oklch(0 0 0)',
      primary: 'oklch(0.15 0 0)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.85 0 0)',
      secondaryForeground: 'oklch(0 0 0)',
      accent: 'oklch(0.25 0 0)',
      accentForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.9 0 0)',
      mutedForeground: 'oklch(0.35 0 0)',
      border: 'oklch(0.7 0 0)',
      destructive: 'oklch(0.4 0 0)',
      destructiveForeground: 'oklch(1 0 0)',
    }
  },
  
  // Classic Themes
  {
    id: 'newspaper-classic',
    name: 'Newspaper Classic',
    nameAr: 'الصحيفة الكلاسيكية',
    description: 'Traditional newspaper feel with serif-friendly colors',
    descriptionAr: 'شعور الصحيفة التقليدية مع ألوان متوافقة مع الخطوط التقليدية',
    category: 'classic',
    colors: {
      background: 'oklch(0.98 0.01 50)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.96 0.01 45)',
      cardForeground: 'oklch(0.1 0 0)',
      primary: 'oklch(0.2 0 0)',
      primaryForeground: 'oklch(0.98 0.01 50)',
      secondary: 'oklch(0.88 0.02 40)',
      secondaryForeground: 'oklch(0.15 0 0)',
      accent: 'oklch(0.3 0.05 30)',
      accentForeground: 'oklch(0.98 0.01 50)',
      muted: 'oklch(0.92 0.02 45)',
      mutedForeground: 'oklch(0.4 0 0)',
      border: 'oklch(0.82 0.03 40)',
      destructive: 'oklch(0.5 0.2 20)',
      destructiveForeground: 'oklch(0.98 0.01 50)',
    }
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'الذهبي الملكي',
    description: 'Elegant gold and deep brown for premium content',
    descriptionAr: 'ذهبي أنيق وبني عميق للمحتوى المميز',
    category: 'classic',
    colors: {
      background: 'oklch(0.97 0.02 60)',
      foreground: 'oklch(0.15 0.05 40)',
      card: 'oklch(0.95 0.03 55)',
      cardForeground: 'oklch(0.15 0.05 40)',
      primary: 'oklch(0.25 0.08 35)',
      primaryForeground: 'oklch(0.97 0.02 60)',
      secondary: 'oklch(0.88 0.05 50)',
      secondaryForeground: 'oklch(0.2 0.05 40)',
      accent: 'oklch(0.6 0.15 70)',
      accentForeground: 'oklch(0.15 0.05 40)',
      muted: 'oklch(0.91 0.04 55)',
      mutedForeground: 'oklch(0.42 0.03 45)',
      border: 'oklch(0.83 0.06 50)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(0.97 0.02 60)',
    }
  }
];

interface PreviewComponentProps {
  theme: ThemePreset;
}

const PreviewComponent: React.FC<PreviewComponentProps> = ({ theme }) => {
  const applyThemeStyles = (colors: ThemePreset['colors']) => {
    return {
      '--background': colors.background,
      '--foreground': colors.foreground,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--border': colors.border,
      '--destructive': colors.destructive,
      '--destructive-foreground': colors.destructiveForeground,
    } as React.CSSProperties;
  };

  return (
    <div 
      className="p-4 rounded-lg border bg-background text-foreground space-y-4"
      style={applyThemeStyles(theme.colors)}
    >
      {/* Header Preview */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">س</span>
          </div>
          <h3 className="font-semibold text-foreground">سبق الذكية</h3>
        </div>
        <Badge variant="secondary">معاينة</Badge>
      </div>

      {/* Article Card Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-accent text-accent-foreground">محليات</Badge>
            <span className="text-xs text-muted-foreground">منذ ساعتين</span>
          </div>
          <CardTitle className="text-lg leading-tight">
            عنوان خبر تجريبي لمعاينة الثيم الجديد
          </CardTitle>
          <CardDescription className="text-sm">
            هذا نص تجريبي لعرض كيفية ظهور المحتوى مع الثيم المختار. يمكنك رؤية الألوان والتباين.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>👁️ 2.3ألف</span>
              <span>💬 45</span>
              <span>📤 123</span>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              اقرأ المزيد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UI Elements Preview */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">زر ثانوي</Button>
        <Button variant="destructive">حذف</Button>
      </div>

      <div className="bg-muted p-3 rounded text-muted-foreground text-sm">
        💡 نص تنبيهي أو ملاحظة مهمة مع خلفية مختلفة
      </div>
    </div>
  );
};

export const LiveThemePreview: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(themePresets[0]);
  const [customTheme, setCustomTheme] = useState<ThemePreset | null>(null);
  const [savedThemes, setSavedThemes] = useKV<ThemePreset[]>('saved-custom-themes', []);
  const [activeTab, setActiveTab] = useState('presets');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'الكل', labelEn: 'All' },
    { id: 'professional', label: 'مهني', labelEn: 'Professional' },
    { id: 'creative', label: 'إبداعي', labelEn: 'Creative' },
    { id: 'modern', label: 'حديث', labelEn: 'Modern' },
    { id: 'classic', label: 'كلاسيكي', labelEn: 'Classic' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredThemes = selectedCategory === 'all' 
    ? themePresets 
    : themePresets.filter(theme => theme.category === selectedCategory);

  const handleApplyTheme = (theme: ThemePreset) => {
    // Apply theme to document root
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
    
    toast.success(`تم تطبيق ثيم "${theme.nameAr}" بنجاح!`);
  };

  const handleSaveCustomTheme = () => {
    if (!customTheme) return;
    
    const newTheme = {
      ...customTheme,
      id: `custom-${Date.now()}`,
      category: 'custom' as any
    };
    
    setSavedThemes(prev => [...prev, newTheme]);
    toast.success('تم حفظ الثيم المخصص!');
  };

  const copyColorValue = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success('تم نسخ قيمة اللون');
  };

  const createCustomTheme = () => {
    const newCustomTheme: ThemePreset = {
      id: 'custom-preview',
      name: 'Custom Theme',
      nameAr: 'ثيم مخصص',
      description: 'Your custom theme creation',
      descriptionAr: 'إنشاء ثيم مخصص',
      category: 'modern',
      colors: { ...selectedTheme.colors }
    };
    setCustomTheme(newCustomTheme);
    setActiveTab('custom');
  };

  const updateCustomColor = (colorKey: keyof ThemePreset['colors'], value: string) => {
    if (!customTheme) return;
    setCustomTheme({
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          معاينة الثيمات المباشرة
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          اختبر الثيمات المختلفة في الوقت الفعلي واطلع على كيفية ظهورها في واجهة المستخدم قبل تطبيقها على الموقع
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Selection Panel */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets" className="gap-2">
                <Eye className="w-4 h-4" />
                الثيمات الجاهزة
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2">
                <Sparkle className="w-4 h-4" />
                تخصيص الألوان
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-sm"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Theme Grid */}
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredThemes.map(theme => (
                  <Card 
                    key={theme.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{theme.nameAr}</CardTitle>
                          <CardDescription className="text-sm">
                            {theme.descriptionAr}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {Object.values(theme.colors).slice(0, 4).map((color, idx) => (
                            <div 
                              key={idx}
                              className="w-4 h-4 rounded-sm border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleApplyTheme(selectedTheme)}
                  className="flex-1 gap-2"
                >
                  <Save className="w-4 h-4" />
                  تطبيق الثيم
                </Button>
                <Button 
                  variant="outline"
                  onClick={createCustomTheme}
                  className="gap-2"
                >
                  <Sparkle className="w-4 h-4" />
                  تخصيص
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              {customTheme && (
                <>
                  {/* Custom Theme Editor */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <h3 className="font-semibold">تخصيص الألوان</h3>
                    
                    {Object.entries(customTheme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={value}
                            onChange={(e) => updateCustomColor(key as keyof ThemePreset['colors'], e.target.value)}
                            className="font-mono text-sm"
                            placeholder="oklch(0.5 0.1 180)"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyColorValue(value)}
                            className="px-2"
                          >
                            {copiedColor === value ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <div 
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                            style={{ backgroundColor: value }}
                            title={value}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Theme Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => handleApplyTheme(customTheme)}
                      className="flex-1 gap-2"
                    >
                      <Save className="w-4 h-4" />
                      تطبيق الثيم المخصص
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSaveCustomTheme}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      حفظ
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">معاينة مباشرة</h2>
            <Badge variant="outline" className="gap-2">
              <Eye className="w-3 h-3" />
              {(customTheme && activeTab === 'custom') ? customTheme.nameAr : selectedTheme.nameAr}
            </Badge>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <PreviewComponent 
                theme={(customTheme && activeTab === 'custom') ? customTheme : selectedTheme} 
              />
            </CardContent>
          </Card>

          {/* Theme Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الثيم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">الاسم</Label>
                <p className="text-foreground">
                  {(customTheme && activeTab === 'custom') ? customTheme.nameAr : selectedTheme.nameAr}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">الوصف</Label>
                <p className="text-muted-foreground text-sm">
                  {(customTheme && activeTab === 'custom') ? customTheme.descriptionAr : selectedTheme.descriptionAr}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">الفئة</Label>
                <Badge variant="secondary" className="mt-1">
                  {categories.find(c => c.id === selectedTheme.category)?.label || 'مخصص'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Custom Themes */}
      {savedThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              الثيمات المحفوظة
            </CardTitle>
            <CardDescription>
              الثيمات المخصصة التي قمت بحفظها مسبقاً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedThemes.map(theme => (
                <Card 
                  key={theme.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTheme(theme)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{theme.nameAr}</CardTitle>
                      <div className="flex gap-1">
                        {Object.values(theme.colors).slice(0, 3).map((color, idx) => (
                          <div 
                            key={idx}
                            className="w-3 h-3 rounded-sm border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTheme(theme);
                        }}
                        className="flex-1 text-xs"
                      >
                        تطبيق
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveThemePreview;