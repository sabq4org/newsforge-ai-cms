import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Palette,
  Eye,
  CheckCircle,
  Timer,
  Sparkles,
  Sun,
  Moon,
  Contrast
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { LiveThemePreview } from './LiveThemePreview';
import { ThemeImportExport } from './ThemeImportExport';

interface ThemeDemo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  duration: number; // in seconds
  colors: Record<string, string>;
  category: 'professional' | 'creative' | 'accessibility' | 'seasonal';
}

const themeDemos: ThemeDemo[] = [
  // Professional Day/Night Cycle
  {
    id: 'day-night-cycle',
    name: 'Day to Night Transition',
    nameAr: 'انتقال من النهار إلى الليل',
    description: 'Professional theme that adapts from bright morning to calm evening',
    descriptionAr: 'ثيم مهني يتكيف من الصباح المشرق إلى المساء الهادئ',
    duration: 6,
    category: 'professional',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.25 0.08 250)',
      accent: 'oklch(0.65 0.15 45)',
    }
  },
  // Seasonal Themes
  {
    id: 'autumn-warmth',
    name: 'Autumn Warmth',
    nameAr: 'دفء الخريف',
    description: 'Warm autumn colors transitioning through orange and brown tones',
    descriptionAr: 'ألوان خريفية دافئة تنتقل عبر درجات البرتقالي والبني',
    duration: 5,
    category: 'seasonal',
    colors: {
      background: 'oklch(0.97 0.02 60)',
      foreground: 'oklch(0.15 0.05 40)',
      primary: 'oklch(0.45 0.15 35)',
      accent: 'oklch(0.6 0.18 25)',
    }
  },
  // Creative Energy
  {
    id: 'creative-pulse',
    name: 'Creative Energy Pulse',
    nameAr: 'نبضة الطاقة الإبداعية',
    description: 'Dynamic color transitions for creative and lifestyle content',
    descriptionAr: 'انتقالات لونية ديناميكية للمحتوى الإبداعي ونمط الحياة',
    duration: 4,
    category: 'creative',
    colors: {
      background: 'oklch(0.98 0.02 210)',
      foreground: 'oklch(0.12 0 0)',
      primary: 'oklch(0.5 0.18 180)',
      accent: 'oklch(0.65 0.22 320)',
    }
  },
  // High Contrast
  {
    id: 'accessibility-high-contrast',
    name: 'High Contrast Accessibility',
    nameAr: 'التباين العالي لسهولة الوصول',
    description: 'Maximum contrast for enhanced readability and accessibility',
    descriptionAr: 'أقصى تباين لتحسين القراءة وسهولة الوصول',
    duration: 3,
    category: 'accessibility',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0 0 0)',
      primary: 'oklch(0.15 0 0)',
      accent: 'oklch(0.25 0 0)',
    }
  }
];

export const InteractiveThemeDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<ThemeDemo>(themeDemos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [originalTheme, setOriginalTheme] = useState<Record<string, string>>({});

  // Save original theme on component mount
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const saved = {
      background: root.getPropertyValue('--background').trim(),
      foreground: root.getPropertyValue('--foreground').trim(),
      primary: root.getPropertyValue('--primary').trim(),
      accent: root.getPropertyValue('--accent').trim(),
    };
    setOriginalTheme(saved);
  }, []);

  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (selectedDemo.duration * 10));
          
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          
          // Apply theme transitions based on progress
          applyThemeTransition(newProgress);
          
          return newProgress;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, selectedDemo]);

  const applyThemeTransition = (progressPercent: number) => {
    const root = document.documentElement;
    const demo = selectedDemo;
    
    // Calculate transition progress (0 to 1)
    const t = progressPercent / 100;
    
    switch (demo.id) {
      case 'day-night-cycle':
        // Transition from light to dark
        const bgLightness = 1 - (t * 0.92); // 1 to 0.08
        const fgLightness = 0.15 + (t * 0.77); // 0.15 to 0.92
        
        root.style.setProperty('--background', `oklch(${bgLightness} 0 0)`);
        root.style.setProperty('--foreground', `oklch(${fgLightness} 0 0)`);
        root.style.setProperty('--card', `oklch(${bgLightness + 0.02} 0 0)`);
        
        // Primary color shifts from blue to purple
        const primaryHue = 250 - (t * 30); // 250 to 220
        root.style.setProperty('--primary', `oklch(${0.25 + t * 0.2} 0.08 ${primaryHue})`);
        break;
        
      case 'autumn-warmth':
        // Transition through autumn colors
        const autumnHue = 60 - (t * 35); // 60 to 25 (yellow to red-orange)
        const autumnSaturation = 0.02 + (t * 0.13); // Increase saturation
        
        root.style.setProperty('--background', `oklch(${0.97 - t * 0.05} ${autumnSaturation} ${autumnHue})`);
        root.style.setProperty('--primary', `oklch(${0.45 - t * 0.1} ${0.15 + t * 0.05} ${autumnHue - 10})`);
        root.style.setProperty('--accent', `oklch(${0.6 - t * 0.15} ${0.18 + t * 0.07} ${autumnHue - 20})`);
        break;
        
      case 'creative-pulse':
        // Dynamic hue rotation
        const pulseHue = 180 + Math.sin(t * Math.PI * 4) * 60; // Oscillating hue
        const pulseSat = 0.18 + Math.sin(t * Math.PI * 6) * 0.08; // Pulsing saturation
        
        root.style.setProperty('--primary', `oklch(0.5 ${pulseSat} ${pulseHue})`);
        root.style.setProperty('--accent', `oklch(0.65 ${pulseSat + 0.04} ${pulseHue + 140})`);
        break;
        
      case 'accessibility-high-contrast':
        // Immediate high contrast application
        root.style.setProperty('--background', `oklch(1 0 0)`);
        root.style.setProperty('--foreground', `oklch(0 0 0)`);
        root.style.setProperty('--primary', `oklch(0.15 0 0)`);
        root.style.setProperty('--accent', `oklch(0.25 0 0)`);
        root.style.setProperty('--border', `oklch(0.7 0 0)`);
        break;
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setProgress(0);
    toast.info(`بدء عرض ثيم "${selectedDemo.nameAr}"`);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    
    // Restore original theme
    const root = document.documentElement;
    Object.entries(originalTheme).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });
    
    toast.success('تم استعادة الثيم الأصلي');
  };

  const handleDemoSelect = (demo: ThemeDemo) => {
    setSelectedDemo(demo);
    setIsPlaying(false);
    setProgress(0);
    handleReset(); // Reset to original theme when changing demos
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return Settings;
      case 'creative': return Sparkles;
      case 'accessibility': return Contrast;
      case 'seasonal': return Sun;
      default: return Palette;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional': return 'blue';
      case 'creative': return 'purple';
      case 'accessibility': return 'green';
      case 'seasonal': return 'orange';
      default: return 'gray';
    }
  };

  const categories = [
    { id: 'all', name: 'الكل', nameEn: 'All' },
    { id: 'professional', name: 'مهني', nameEn: 'Professional' },
    { id: 'creative', name: 'إبداعي', nameEn: 'Creative' },
    { id: 'accessibility', name: 'سهولة الوصول', nameEn: 'Accessibility' },
    { id: 'seasonal', name: 'موسمي', nameEn: 'Seasonal' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredDemos = selectedCategory === 'all' 
    ? themeDemos 
    : themeDemos.filter(demo => demo.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Play className="w-8 h-8 text-primary" />
          عرض الثيمات التفاعلي
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          شاهد كيف تتحول الثيمات والألوان في الوقت الفعلي واختبر تأثيرها على تجربة المستخدم
        </p>
      </div>

      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactive" className="gap-2">
            <Play className="w-4 h-4" />
            العرض التفاعلي
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            المعاينة المباشرة
          </TabsTrigger>
          <TabsTrigger value="import-export" className="gap-2">
            <Settings className="w-4 h-4" />
            الاستيراد والتصدير
          </TabsTrigger>
        </TabsList>

        {/* Interactive Demo Tab */}
        <TabsContent value="interactive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demo Selection */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">اختر عرضاً تفاعلياً</CardTitle>
                  <CardDescription>
                    انقر على أي عرض لاختباره ومشاهدة التحولات اللونية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1">
                    {categories.map(cat => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="text-xs"
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                  
                  {filteredDemos.map(demo => {
                    const CategoryIcon = getCategoryIcon(demo.category);
                    return (
                      <Card 
                        key={demo.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedDemo.id === demo.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleDemoSelect(demo)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <CategoryIcon className="w-4 h-4" />
                                {demo.nameAr}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {demo.descriptionAr}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `var(--${getCategoryColor(demo.category)}-100)`,
                                color: `var(--${getCategoryColor(demo.category)}-700)`
                              }}
                            >
                              {demo.duration}ث
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Demo Controls & Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* Current Demo Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {React.createElement(getCategoryIcon(selectedDemo.category), { className: 'w-5 h-5' })}
                        {selectedDemo.nameAr}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {selectedDemo.descriptionAr}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Timer className="w-3 h-3" />
                      {selectedDemo.duration} ثانية
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>التقدم</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    {!isPlaying ? (
                      <Button onClick={handlePlay} className="gap-2">
                        <Play className="w-4 h-4" />
                        بدء العرض
                      </Button>
                    ) : (
                      <Button onClick={handlePause} variant="outline" className="gap-2">
                        <Pause className="w-4 h-4" />
                        إيقاف مؤقت
                      </Button>
                    )}
                    
                    <Button onClick={handleReset} variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      إعادة تعيين
                    </Button>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isPlaying && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>العرض قيد التشغيل...</span>
                      </>
                    )}
                    {progress === 100 && !isPlaying && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>تم إكمال العرض</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>معاينة مباشرة للثيم</CardTitle>
                  <CardDescription>
                    شاهد كيف يؤثر التغيير على واجهة المستخدم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample UI Elements */}
                    <div className="p-4 rounded-lg border bg-card text-card-foreground">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">سبق الذكية</h3>
                        <Badge variant="secondary">عاجل</Badge>
                      </div>
                      <h4 className="font-medium mb-2">عنوان خبر تجريبي لمعاينة التأثير</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        هذا نص تجريبي لعرض كيفية تأثر الألوان والتباين مع تغيير الثيم.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">
                          اقرأ المزيد
                        </Button>
                        <Button size="sm" variant="outline">
                          مشاركة
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Live Preview Tab */}
        <TabsContent value="preview">
          <LiveThemePreview />
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import-export">
          <ThemeImportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveThemeDemo;