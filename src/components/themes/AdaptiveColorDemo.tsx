import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Brain,
  Eye,
  Palette,
  Activity,
  Sparkle,
  PlayCircle,
  CheckCircle,
  Settings
} from '@phosphor-icons/react';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface ColorDemoProps {
  userId?: string;
}

export function AdaptiveColorDemo({ userId = 'demo' }: ColorDemoProps) {
  const { currentTheme, applyTheme } = useTheme();
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationCount, setAdaptationCount] = useState(0);
  const [demoPhase, setDemoPhase] = useState<'reading' | 'evening' | 'focus' | 'night'>('reading');
  
  // Simulate different color adaptations based on context
  const colorAdaptations = {
    reading: {
      name: 'وضع القراءة المريح',
      description: 'ألوان محسنة للقراءة المطولة',
      colors: {
        background: 'oklch(0.98 0.005 45)',
        foreground: 'oklch(0.2 0.01 45)',
        card: 'oklch(0.96 0.01 45)',
        primary: 'oklch(0.3 0.08 220)',
        accent: 'oklch(0.6 0.12 45)'
      } as Partial<ThemeColors>
    },
    evening: {
      name: 'وضع المساء الدافئ',
      description: 'ألوان دافئة تقلل إجهاد العين في المساء',
      colors: {
        background: 'oklch(0.95 0.01 30)',
        foreground: 'oklch(0.25 0.02 30)',
        card: 'oklch(0.92 0.02 30)',
        primary: 'oklch(0.35 0.1 30)',
        accent: 'oklch(0.55 0.15 30)'
      } as Partial<ThemeColors>
    },
    focus: {
      name: 'وضع التركيز العالي',
      description: 'تباين عالي لتحسين التركيز والإنتاجية',
      colors: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.1 0 0)',
        card: 'oklch(0.97 0 0)',
        primary: 'oklch(0.2 0.1 250)',
        accent: 'oklch(0.4 0.2 200)'
      } as Partial<ThemeColors>
    },
    night: {
      name: 'الوضع الليلي المتقدم',
      description: 'ألوان داكنة محسنة للقراءة الليلية',
      colors: {
        background: 'oklch(0.15 0.01 240)',
        foreground: 'oklch(0.9 0.01 60)',
        card: 'oklch(0.2 0.02 240)',
        primary: 'oklch(0.6 0.15 200)',
        accent: 'oklch(0.7 0.2 60)'
      } as Partial<ThemeColors>
    }
  };
  
  const runAdaptiveDemo = async () => {
    setIsAdapting(true);
    
    // Cycle through different adaptation phases
    const phases: (keyof typeof colorAdaptations)[] = ['reading', 'evening', 'focus', 'night'];
    
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const adaptation = colorAdaptations[phase];
      
      setDemoPhase(phase);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Apply the adaptation
      applyTheme({ ...currentTheme, ...adaptation.colors });
      
      setAdaptationCount(prev => prev + 1);
      
      toast.success(`تم تطبيق ${adaptation.name}`);
      
      // Wait before next adaptation
      if (i < phases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setIsAdapting(false);
    toast.success('اكتملت عملية العرض التوضيحي للتعلم التكيفي!');
  };
  
  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            عرض توضيحي: نظام التعلم التكيفي للألوان
          </CardTitle>
          <CardDescription>
            شاهد كيف يتعلم النظام ويكيف الألوان تلقائياً حسب السياق والوقت
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${isAdapting ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isAdapting ? 'جاري التكييف...' : 'في انتظار البدء'}
                </span>
              </div>
              {adaptationCount > 0 && (
                <Badge variant="secondary">
                  {adaptationCount} تكييف مكتمل
                </Badge>
              )}
            </div>
            <Button 
              onClick={runAdaptiveDemo}
              disabled={isAdapting}
              className="gap-2"
            >
              {isAdapting ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {isAdapting ? 'جاري العرض...' : 'بدء العرض التوضيحي'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Adaptation Status */}
      {isAdapting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              التكييف الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-medium">{colorAdaptations[demoPhase].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {colorAdaptations[demoPhase].description}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(colorAdaptations[demoPhase].colors).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-border mx-auto mb-1"
                      style={{ backgroundColor: value }}
                    />
                    <div className="text-xs text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Adaptation Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(colorAdaptations).map(([key, adaptation]) => (
          <Card key={key} className={cn(
            "transition-all duration-300",
            demoPhase === key && isAdapting ? "ring-2 ring-primary" : ""
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                {adaptation.name}
                {demoPhase === key && isAdapting && (
                  <Badge className="ml-auto">
                    <Activity className="w-3 h-3 mr-1 animate-spin" />
                    نشط
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{adaptation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(adaptation.colors).map(([colorKey, value]) => (
                  <div key={colorKey} className="text-center">
                    <div 
                      className="w-8 h-8 rounded border mx-auto mb-1"
                      style={{ backgroundColor: value }}
                    />
                    <div className="text-xs text-muted-foreground">{colorKey}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-accent" />
            رؤى التعلم التكيفي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">1.2 ثانية</div>
              <div className="text-sm text-muted-foreground">متوسط وقت التكييف</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">94%</div>
              <div className="text-sm text-muted-foreground">دقة التنبؤ بالتفضيلات</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">15%</div>
              <div className="text-sm text-muted-foreground">تحسن في راحة القراءة</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">كيف يعمل النظام:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                يراقب سلوك المستخدم أثناء القراءة (سرعة التمرير، التوقفات، الوقت)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                يحلل السياق البيئي (الوقت، الإضاءة، نوع الجهاز)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                يستخدم الذكاء الاصطناعي لتوليد ألوان محسنة
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                يطبق التغييرات تدريجياً ويتعلم من ردود أفعال المستخدم
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}