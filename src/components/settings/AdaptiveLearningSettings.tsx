import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Eye, 
  Clock, 
  Target, 
  BookOpen, 
  Zap, 
  Settings as SettingsIcon,
  TrendingUp,
  User,
  Palette,
  Type,
  Timer,
  Heart,
  Star,
  Activity,
  ChartBarHorizontal,
  Lightbulb,
  CheckCircle,
  XCircle,
  RotateCcw
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AdaptiveLearningConfig {
  enabled: boolean;
  readingSpeed: {
    enabled: boolean;
    adaptTheme: boolean;
    adaptFontSize: boolean;
  };
  contentPreference: {
    enabled: boolean;
    trackTimeSpent: boolean;
    adaptRecommendations: boolean;
  };
  visualComfort: {
    enabled: boolean;
    autoTheme: boolean;
    autoContrast: boolean;
    autoSpacing: boolean;
  };
  behaviorTracking: {
    enabled: boolean;
    trackScrollPatterns: boolean;
    trackInteractionTime: boolean;
    trackReturnFrequency: boolean;
  };
  aiPersonalization: {
    enabled: boolean;
    contentTone: boolean;
    layoutOptimization: boolean;
    timingOptimization: boolean;
  };
}

interface LearningInsights {
  readingSpeed: number; // words per minute
  preferredCategories: string[];
  optimalReadingTime: string[];
  averageSessionDuration: number;
  preferredArticleLength: 'short' | 'medium' | 'long';
  interactionPatterns: {
    scrollSpeed: number;
    pauseFrequency: number;
    backtrackFrequency: number;
  };
  visualPreferences: {
    preferredContrast: number;
    preferredFontSize: number;
    preferredLineHeight: number;
  };
  lastUpdated: Date;
}

interface AdaptiveLearningSettingsProps {
  userId?: string;
  onSettingsChange?: (config: AdaptiveLearningConfig) => void;
}

export function AdaptiveLearningSettings({ userId, onSettingsChange }: AdaptiveLearningSettingsProps) {
  const [config, setConfig] = useKV<AdaptiveLearningConfig>(`adaptive-learning-${userId}`, {
    enabled: false,
    readingSpeed: {
      enabled: false,
      adaptTheme: false,
      adaptFontSize: false,
    },
    contentPreference: {
      enabled: false,
      trackTimeSpent: false,
      adaptRecommendations: false,
    },
    visualComfort: {
      enabled: false,
      autoTheme: false,
      autoContrast: false,
      autoSpacing: false,
    },
    behaviorTracking: {
      enabled: false,
      trackScrollPatterns: false,
      trackInteractionTime: false,
      trackReturnFrequency: false,
    },
    aiPersonalization: {
      enabled: false,
      contentTone: false,
      layoutOptimization: false,
      timingOptimization: false,
    },
  });

  const [insights, setInsights] = useKV<LearningInsights>(`learning-insights-${userId}`, {
    readingSpeed: 200,
    preferredCategories: [],
    optimalReadingTime: ['09:00', '14:00', '20:00'],
    averageSessionDuration: 0,
    preferredArticleLength: 'medium',
    interactionPatterns: {
      scrollSpeed: 1,
      pauseFrequency: 0,
      backtrackFrequency: 0,
    },
    visualPreferences: {
      preferredContrast: 1,
      preferredFontSize: 16,
      preferredLineHeight: 1.6,
    },
    lastUpdated: new Date(),
  });

  const [learningProgress, setLearningProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Calculate learning progress based on enabled features
    const features = Object.values(config);
    const enabledFeatures = features.filter(feature => 
      typeof feature === 'object' ? Object.values(feature).some(Boolean) : feature
    ).length;
    const totalFeatures = features.length;
    setLearningProgress((enabledFeatures / totalFeatures) * 100);
  }, [config]);

  const updateConfig = (section: keyof AdaptiveLearningConfig, key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    
    if (onSettingsChange) {
      onSettingsChange({
        ...config,
        [section]: {
          ...config[section],
          [key]: value
        }
      });
    }

    toast.success('تم تحديث إعدادات التعلم التكيفي');
  };

  const toggleMainSystem = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
    if (onSettingsChange) {
      onSettingsChange({ ...config, enabled });
    }
    toast.success(enabled ? 'تم تفعيل التعلم التكيفي' : 'تم إيقاف التعلم التكيفي');
  };

  const resetLearningData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setInsights(prev => ({
        ...prev,
        readingSpeed: 200,
        preferredCategories: [],
        averageSessionDuration: 0,
        interactionPatterns: {
          scrollSpeed: 1,
          pauseFrequency: 0,
          backtrackFrequency: 0,
        },
        lastUpdated: new Date(),
      }));
      setIsProcessing(false);
      toast.success('تم إعادة تعيين بيانات التعلم');
    }, 1000);
  };

  const trainAIModel = async () => {
    setIsProcessing(true);
    try {
      // Simulate AI model training with user data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInsights(prev => ({
        ...prev,
        lastUpdated: new Date(),
      }));
      
      toast.success('تم تدريب النموذج بنجاح على بياناتك');
    } catch (error) {
      toast.error('حدث خطأ في تدريب النموذج');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            التعلم التكيفي للقراءة
          </h2>
          <p className="text-muted-foreground mt-1">
            خصص تجربة القراءة تلقائياً بناءً على سلوكك وتفضيلاتك
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">التقدم</div>
            <div className="text-lg font-semibold">{Math.round(learningProgress)}%</div>
          </div>
          <Progress value={learningProgress} className="w-20" />
        </div>
      </div>

      {/* Main System Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                تفعيل النظام الذكي
              </CardTitle>
              <CardDescription>
                فعّل التعلم التكيفي لتخصيص تجربة القراءة تلقائياً
              </CardDescription>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={toggleMainSystem}
            />
          </div>
        </CardHeader>
        {config.enabled && (
          <CardContent>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                النظام نشط ويتعلم من سلوك القراءة لتحسين التجربة تلقائياً
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {config.enabled && (
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">الميزات</TabsTrigger>
            <TabsTrigger value="insights">الرؤى</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="controls">التحكم</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            {/* Reading Speed Adaptation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  تكييف سرعة القراءة
                </CardTitle>
                <CardDescription>
                  تخصيص العرض بناءً على سرعة القراءة المحددة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>تفعيل تتبع سرعة القراءة</span>
                  <Switch
                    checked={config.readingSpeed.enabled}
                    onCheckedChange={(value) => updateConfig('readingSpeed', 'enabled', value)}
                  />
                </div>
                {config.readingSpeed.enabled && (
                  <div className="space-y-3 pr-4">
                    <div className="flex items-center justify-between">
                      <span>تكييف الثيم حسب السرعة</span>
                      <Switch
                        checked={config.readingSpeed.adaptTheme}
                        onCheckedChange={(value) => updateConfig('readingSpeed', 'adaptTheme', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تكييف حجم الخط</span>
                      <Switch
                        checked={config.readingSpeed.adaptFontSize}
                        onCheckedChange={(value) => updateConfig('readingSpeed', 'adaptFontSize', value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  تفضيلات المحتوى
                </CardTitle>
                <CardDescription>
                  تعلم وتذكر نوع المحتوى المفضل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>تفعيل تتبع التفضيلات</span>
                  <Switch
                    checked={config.contentPreference.enabled}
                    onCheckedChange={(value) => updateConfig('contentPreference', 'enabled', value)}
                  />
                </div>
                {config.contentPreference.enabled && (
                  <div className="space-y-3 pr-4">
                    <div className="flex items-center justify-between">
                      <span>تتبع الوقت المستغرق</span>
                      <Switch
                        checked={config.contentPreference.trackTimeSpent}
                        onCheckedChange={(value) => updateConfig('contentPreference', 'trackTimeSpent', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تكييف التوصيات</span>
                      <Switch
                        checked={config.contentPreference.adaptRecommendations}
                        onCheckedChange={(value) => updateConfig('contentPreference', 'adaptRecommendations', value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visual Comfort */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  الراحة البصرية
                </CardTitle>
                <CardDescription>
                  تحسين العرض للراحة البصرية المثلى
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>تفعيل التحسين البصري</span>
                  <Switch
                    checked={config.visualComfort.enabled}
                    onCheckedChange={(value) => updateConfig('visualComfort', 'enabled', value)}
                  />
                </div>
                {config.visualComfort.enabled && (
                  <div className="space-y-3 pr-4">
                    <div className="flex items-center justify-between">
                      <span>تبديل الثيم التلقائي</span>
                      <Switch
                        checked={config.visualComfort.autoTheme}
                        onCheckedChange={(value) => updateConfig('visualComfort', 'autoTheme', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تعديل التباين التلقائي</span>
                      <Switch
                        checked={config.visualComfort.autoContrast}
                        onCheckedChange={(value) => updateConfig('visualComfort', 'autoContrast', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تعديل المسافات التلقائي</span>
                      <Switch
                        checked={config.visualComfort.autoSpacing}
                        onCheckedChange={(value) => updateConfig('visualComfort', 'autoSpacing', value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Personalization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  التخصيص بالذكاء الاصطناعي
                </CardTitle>
                <CardDescription>
                  تحسينات متقدمة بالذكاء الاصطناعي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>تفعيل التخصيص الذكي</span>
                  <Switch
                    checked={config.aiPersonalization.enabled}
                    onCheckedChange={(value) => updateConfig('aiPersonalization', 'enabled', value)}
                  />
                </div>
                {config.aiPersonalization.enabled && (
                  <div className="space-y-3 pr-4">
                    <div className="flex items-center justify-between">
                      <span>تكييف نبرة المحتوى</span>
                      <Switch
                        checked={config.aiPersonalization.contentTone}
                        onCheckedChange={(value) => updateConfig('aiPersonalization', 'contentTone', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تحسين التخطيط</span>
                      <Switch
                        checked={config.aiPersonalization.layoutOptimization}
                        onCheckedChange={(value) => updateConfig('aiPersonalization', 'layoutOptimization', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تحسين التوقيت</span>
                      <Switch
                        checked={config.aiPersonalization.timingOptimization}
                        onCheckedChange={(value) => updateConfig('aiPersonalization', 'timingOptimization', value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    إحصائيات القراءة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>سرعة القراءة</span>
                    <Badge variant="secondary">{insights.readingSpeed} كلمة/دقيقة</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط الجلسة</span>
                    <Badge variant="secondary">{Math.round(insights.averageSessionDuration)} دقيقة</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>طول المقال المفضل</span>
                    <Badge variant="secondary">
                      {insights.preferredArticleLength === 'short' ? 'قصير' :
                       insights.preferredArticleLength === 'medium' ? 'متوسط' : 'طويل'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    أنماط الاستخدام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">أوقات القراءة المثلى</span>
                    <div className="flex gap-2 mt-2">
                      {insights.optimalReadingTime.map((time, index) => (
                        <Badge key={index} variant="outline">{time}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">الأقسام المفضلة</span>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {insights.preferredCategories.length > 0 ? 
                        insights.preferredCategories.map((category, index) => (
                          <Badge key={index} variant="outline">{category}</Badge>
                        )) :
                        <span className="text-muted-foreground text-sm">لا توجد بيانات كافية</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    أنماط التفاعل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>سرعة التمرير</span>
                      <span>{insights.interactionPatterns.scrollSpeed.toFixed(1)}x</span>
                    </div>
                    <Progress value={insights.interactionPatterns.scrollSpeed * 50} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>تكرار التوقف</span>
                      <span>{insights.interactionPatterns.pauseFrequency}%</span>
                    </div>
                    <Progress value={insights.interactionPatterns.pauseFrequency} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    التفضيلات البصرية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>التباين المفضل</span>
                    <Badge variant="secondary">{insights.visualPreferences.preferredContrast}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>حجم الخط المفضل</span>
                    <Badge variant="secondary">{insights.visualPreferences.preferredFontSize}px</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>ارتفاع السطر المفضل</span>
                    <Badge variant="secondary">{insights.visualPreferences.preferredLineHeight}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarHorizontal className="w-5 h-5" />
                  أداء النظام
                </CardTitle>
                <CardDescription>
                  مراقبة فعالية التعلم التكيفي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-muted-foreground">دقة التوقعات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">23%</div>
                    <div className="text-sm text-muted-foreground">تحسن وقت القراءة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-muted-foreground">تفاعلات مُتعلمة</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">التحسينات المطبقة اليوم</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">تم تكييف حجم الخط للراحة البصرية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">تم اقتراح مقالات بناءً على وقت القراءة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">تم تحسين تخطيط الصفحة لسرعة التصفح</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    إعادة التعيين
                  </CardTitle>
                  <CardDescription>
                    إعادة تعيين بيانات التعلم والبدء من جديد
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={resetLearningData}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    إعادة تعيين البيانات
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    تدريب النموذج
                  </CardTitle>
                  <CardDescription>
                    تحسين دقة التوقعات باستخدام البيانات الحديثة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={trainAIModel}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'جاري التدريب...' : 'تدريب النموذج'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>معلومات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>آخر تحديث للبيانات</span>
                  <span className="text-sm text-muted-foreground">
                    {insights.lastUpdated.toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>إصدار النموذج</span>
                  <Badge variant="outline">v2.1.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span>حالة النظام</span>
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? "نشط" : "معطل"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}