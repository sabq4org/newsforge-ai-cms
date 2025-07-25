import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Palette, 
  Type, 
  Clock, 
  BookOpen,
  Activity,
  TrendUp,
  Settings as SettingsIcon,
  Lightbulb,
  Target,
  User,
  Star
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  contentWidth: number;
  readingMode: 'comfortable' | 'compact' | 'spacious';
  autoTheme: boolean;
  timeBasedAdjustments: boolean;
  adaptiveBrightness: boolean;
}

interface PersonalizedReadingEngineProps {
  userId?: string;
  onPreferencesChange?: (preferences: ReadingPreferences) => void;
}

export function PersonalizedReadingEngine({ userId, onPreferencesChange }: PersonalizedReadingEngineProps) {
  const [preferences, setPreferences] = useKV<ReadingPreferences>(`reading-preferences-${userId}`, {
    fontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0,
    contentWidth: 65,
    readingMode: 'comfortable',
    autoTheme: false,
    timeBasedAdjustments: false,
    adaptiveBrightness: false,
  });

  const [isLearning, setIsLearning] = useState(false);
  const [adaptationProgress, setAdaptationProgress] = useState(0);
  const [recentAdaptations, setRecentAdaptations] = useState<string[]>([]);
  const [readingAnalytics, setReadingAnalytics] = useKV(`reading-analytics-${userId}`, {
    totalReadingTime: 0,
    averageReadingSpeed: 250,
    preferredReadingTime: 'morning',
    eyeStrainLevel: 'low',
    comprehensionScore: 85,
    lastOptimization: new Date(),
  });

  useEffect(() => {
    // Simulate learning progress
    if (isLearning) {
      const interval = setInterval(() => {
        setAdaptationProgress(prev => {
          if (prev >= 100) {
            setIsLearning(false);
            toast.success('تم تحسين إعدادات القراءة بناءً على سلوكك');
            setRecentAdaptations(prev => [
              'تم تقليل حجم الخط لتحسين الراحة البصرية',
              'تم تعديل المسافات بين الأسطر للقراءة السريعة',
              'تم اقتراح وضع القراءة المريح',
              ...prev.slice(0, 2)
            ]);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLearning]);

  const updatePreference = <K extends keyof ReadingPreferences>(
    key: K, 
    value: ReadingPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (onPreferencesChange) {
      onPreferencesChange({ ...preferences, [key]: value });
    }
    toast.success('تم حفظ التفضيل');
  };

  const startLearning = () => {
    setIsLearning(true);
    setAdaptationProgress(0);
    toast.info('بدء تحليل سلوك القراءة...');
  };

  const resetToDefaults = () => {
    const defaults: ReadingPreferences = {
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      contentWidth: 65,
      readingMode: 'comfortable',
      autoTheme: false,
      timeBasedAdjustments: false,
      adaptiveBrightness: false,
    };
    setPreferences(defaults);
    toast.success('تم إعادة تعيين الإعدادات للوضع الافتراضي');
  };

  const getReadingModeDescription = (mode: string) => {
    switch (mode) {
      case 'comfortable': return 'متوازن للقراءة اليومية';
      case 'compact': return 'مضغوط لعرض أكثر للمحتوى';
      case 'spacious': return 'متباعد للراحة البصرية القصوى';
      default: return '';
    }
  };

  const getComfortScore = () => {
    // Calculate comfort score based on preferences
    let score = 50;
    
    // Font size optimization
    if (preferences.fontSize >= 14 && preferences.fontSize <= 18) score += 15;
    
    // Line height optimization
    if (preferences.lineHeight >= 1.5 && preferences.lineHeight <= 1.8) score += 15;
    
    // Content width optimization
    if (preferences.contentWidth >= 60 && preferences.contentWidth <= 70) score += 10;
    
    // Adaptive features
    if (preferences.autoTheme) score += 5;
    if (preferences.timeBasedAdjustments) score += 5;
    
    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            محرك القراءة الشخصي
          </h2>
          <p className="text-muted-foreground mt-1">
            تخصيص تجربة القراءة بناءً على تفضيلاتك وسلوكك
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{getComfortScore()}%</div>
            <div className="text-xs text-muted-foreground">درجة الراحة</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
          <TabsTrigger value="adaptive">التكيف التلقائي</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="preview">المعاينة</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Typography Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  إعدادات الخط
                </CardTitle>
                <CardDescription>
                  تخصيص حجم ومظهر النص
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">حجم الخط</label>
                    <span className="text-sm text-muted-foreground">{preferences.fontSize}px</span>
                  </div>
                  <Slider
                    value={[preferences.fontSize]}
                    onValueChange={([value]) => updatePreference('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">ارتفاع السطر</label>
                    <span className="text-sm text-muted-foreground">{preferences.lineHeight}</span>
                  </div>
                  <Slider
                    value={[preferences.lineHeight]}
                    onValueChange={([value]) => updatePreference('lineHeight', value)}
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">تباعد الحروف</label>
                    <span className="text-sm text-muted-foreground">{preferences.letterSpacing}em</span>
                  </div>
                  <Slider
                    value={[preferences.letterSpacing]}
                    onValueChange={([value]) => updatePreference('letterSpacing', value)}
                    min={-0.05}
                    max={0.2}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  إعدادات التخطيط
                </CardTitle>
                <CardDescription>
                  تحسين عرض المحتوى
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">عرض المحتوى</label>
                    <span className="text-sm text-muted-foreground">{preferences.contentWidth}%</span>
                  </div>
                  <Slider
                    value={[preferences.contentWidth]}
                    onValueChange={([value]) => updatePreference('contentWidth', value)}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">وضع القراءة</label>
                  <Select
                    value={preferences.readingMode}
                    onValueChange={(value: 'comfortable' | 'compact' | 'spacious') => 
                      updatePreference('readingMode', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">مريح</SelectItem>
                      <SelectItem value="compact">مضغوط</SelectItem>
                      <SelectItem value="spacious">متباعد</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getReadingModeDescription(preferences.readingMode)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    updatePreference('fontSize', 14);
                    updatePreference('lineHeight', 1.4);
                    updatePreference('readingMode', 'compact');
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  قراءة سريعة
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    updatePreference('fontSize', 18);
                    updatePreference('lineHeight', 1.8);
                    updatePreference('readingMode', 'spacious');
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  راحة بصرية
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetToDefaults}
                >
                  <SettingsIcon className="w-4 h-4 mr-1" />
                  الوضع الافتراضي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adaptive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                التكيف الذكي
              </CardTitle>
              <CardDescription>
                تفعيل التحسينات التلقائية بناءً على سلوك القراءة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">تبديل الثيم التلقائي</div>
                  <div className="text-sm text-muted-foreground">تغيير الثيم حسب الوقت والإضاءة</div>
                </div>
                <Switch
                  checked={preferences.autoTheme}
                  onCheckedChange={(value) => updatePreference('autoTheme', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">التعديلات الزمنية</div>
                  <div className="text-sm text-muted-foreground">تحسين الإعدادات حسب الوقت</div>
                </div>
                <Switch
                  checked={preferences.timeBasedAdjustments}
                  onCheckedChange={(value) => updatePreference('timeBasedAdjustments', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">السطوع التكيفي</div>
                  <div className="text-sm text-muted-foreground">تعديل السطوع للراحة البصرية</div>
                </div>
                <Switch
                  checked={preferences.adaptiveBrightness}
                  onCheckedChange={(value) => updatePreference('adaptiveBrightness', value)}
                />
              </div>

              {isLearning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>جاري تحليل سلوك القراءة...</span>
                    <span>{adaptationProgress}%</span>
                  </div>
                  <Progress value={adaptationProgress} />
                </div>
              )}

              <Button 
                onClick={startLearning} 
                disabled={isLearning}
                className="w-full"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isLearning ? 'جاري التحليل...' : 'تحليل وتحسين الإعدادات'}
              </Button>
            </CardContent>
          </Card>

          {recentAdaptations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="w-5 h-5" />
                  التحسينات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAdaptations.map((adaptation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span>{adaptation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  إحصائيات القراءة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>إجمالي وقت القراءة</span>
                  <Badge variant="secondary">
                    {Math.round(readingAnalytics.totalReadingTime / 60)} ساعة
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>متوسط سرعة القراءة</span>
                  <Badge variant="secondary">
                    {readingAnalytics.averageReadingSpeed} كلمة/دقيقة
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>الوقت المفضل للقراءة</span>
                  <Badge variant="secondary">
                    {readingAnalytics.preferredReadingTime === 'morning' ? 'الصباح' :
                     readingAnalytics.preferredReadingTime === 'afternoon' ? 'بعد الظهر' : 'المساء'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>مستوى إجهاد العين</span>
                  <Badge variant={readingAnalytics.eyeStrainLevel === 'low' ? 'default' : 'destructive'}>
                    {readingAnalytics.eyeStrainLevel === 'low' ? 'منخفض' : 'متوسط'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  درجة الفهم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {readingAnalytics.comprehensionScore}%
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    بناءً على أنماط القراءة والتفاعل
                  </div>
                  <Progress value={readingAnalytics.comprehensionScore} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معاينة الإعدادات</CardTitle>
              <CardDescription>
                شاهد كيف ستبدو المقالات مع إعداداتك الحالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-6 bg-background"
                style={{
                  fontSize: `${preferences.fontSize}px`,
                  lineHeight: preferences.lineHeight,
                  letterSpacing: `${preferences.letterSpacing}em`,
                  maxWidth: `${preferences.contentWidth}%`,
                  margin: '0 auto'
                }}
              >
                <h3 className="text-xl font-bold mb-4">
                  عنوان تجريبي للمقال
                </h3>
                <p className="mb-4">
                  هذا نص تجريبي لمعاينة كيف ستبدو المقالات مع الإعدادات الحالية. 
                  يمكنك تعديل الإعدادات ومشاهدة التغييرات فوراً في هذه المعاينة.
                </p>
                <p className="mb-4">
                  نظام "سبق الذكية" يوفر تجربة قراءة مخصصة ومريحة لكل مستخدم 
                  بناءً على تفضيلاته الشخصية وسلوك القراءة الخاص به.
                </p>
                <p>
                  التقنيات الذكية تساعد في تحسين راحة القراءة وزيادة الفهم 
                  من خلال التكيف التلقائي مع احتياجات كل قارئ.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}