import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Eye, 
  Clock, 
  Target, 
  BookOpen, 
  Zap, 
  Settings as SettingsIcon,
  TrendUp,
  User,
  Palette,
  Type,
  Timer,
  Heart,
  Star,
  Activity,
  BarChart3,
  Lightbulb,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Play,
  Moon,
  Sun,
  Monitor
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { UserProfile } from '@/types/membership';

interface AdaptiveLearningData {
  userId: string;
  preferences: {
    readingSpeed: number; // words per minute
    preferredTimeSlots: string[];
    contentCategories: string[];
    readingEnvironment: 'quiet' | 'moderate' | 'noisy';
    deviceUsage: 'desktop' | 'mobile' | 'tablet' | 'mixed';
  };
  visualSettings: {
    brightness: number;
    contrast: number;
    fontSize: number;
    lineSpacing: number;
    colorScheme: 'light' | 'dark' | 'auto';
  };
  behaviorPatterns: {
    averageSessionTime: number;
    scrollSpeed: number;
    pauseFrequency: number;
    backtrackRate: number;
    interactionRate: number;
  };
  learningProgress: {
    adaptationsApplied: number;
    accuracyScore: number;
    satisfactionRating: number;
    lastLearningSession: Date;
  };
  enabledFeatures: {
    autoThemeSwitch: boolean;
    contentRecommendations: boolean;
    readingTimeOptimization: boolean;
    visualComfortAdjustment: boolean;
    behaviorBasedSuggestions: boolean;
  };
}

interface UserSettingsProps {
  userProfile?: UserProfile;
  onSettingsUpdate?: (settings: any) => void;
}

export function UserAdaptiveLearningSettings({ userProfile, onSettingsUpdate }: UserSettingsProps) {
  const [learningData, setLearningData] = useKV<AdaptiveLearningData>(`adaptive-learning-${userProfile?.id}`, {
    userId: userProfile?.id || 'anonymous',
    preferences: {
      readingSpeed: 250,
      preferredTimeSlots: ['09:00', '14:00', '20:00'],
      contentCategories: [],
      readingEnvironment: 'moderate',
      deviceUsage: 'mixed',
    },
    visualSettings: {
      brightness: 75,
      contrast: 100,
      fontSize: 16,
      lineSpacing: 1.6,
      colorScheme: 'auto',
    },
    behaviorPatterns: {
      averageSessionTime: 15,
      scrollSpeed: 1.2,
      pauseFrequency: 3,
      backtrackRate: 0.1,
      interactionRate: 0.8,
    },
    learningProgress: {
      adaptationsApplied: 0,
      accuracyScore: 0,
      satisfactionRating: 0,
      lastLearningSession: new Date(),
    },
    enabledFeatures: {
      autoThemeSwitch: false,
      contentRecommendations: false,
      readingTimeOptimization: false,
      visualComfortAdjustment: false,
      behaviorBasedSuggestions: false,
    },
  });

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [recentInsights, setRecentInsights] = useState<string[]>([]);

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            setLearningData(prev => ({
              ...prev,
              learningProgress: {
                ...prev.learningProgress,
                adaptationsApplied: prev.learningProgress.adaptationsApplied + 1,
                accuracyScore: Math.min(prev.learningProgress.accuracyScore + 5, 100),
                lastLearningSession: new Date(),
              }
            }));
            
            const insights = [
              'تم اكتشاف تفضيلك للقراءة في المساء - سيتم تعديل التوصيات',
              'يبدو أنك تفضل النصوص المتوسطة الطول - سيتم تحسين الاقتراحات',
              'لوحظ أنك تتفاعل أكثر مع المحتوى المرئي - سيتم زيادة عرضه',
              'تم رصد نمط قراءة سريع - سيتم تحسين عرض المحتوى',
            ];
            
            setRecentInsights(insights.slice(0, 3));
            toast.success('تم تحديث نموذج التعلم الخاص بك بنجاح!');
            return 0;
          }
          return prev + 1.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTraining, setLearningData]);

  const toggleFeature = (feature: keyof AdaptiveLearningData['enabledFeatures']) => {
    setLearningData(prev => ({
      ...prev,
      enabledFeatures: {
        ...prev.enabledFeatures,
        [feature]: !prev.enabledFeatures[feature]
      }
    }));
    
    const featureNames = {
      autoThemeSwitch: 'تبديل الثيم التلقائي',
      contentRecommendations: 'توصيات المحتوى',
      readingTimeOptimization: 'تحسين وقت القراءة',
      visualComfortAdjustment: 'تعديل الراحة البصرية',
      behaviorBasedSuggestions: 'اقتراحات سلوكية',
    };
    
    const status = learningData.enabledFeatures[feature] ? 'تم إيقاف' : 'تم تفعيل';
    toast.success(`${status} ${featureNames[feature]}`);
  };

  const updateVisualSetting = (setting: keyof AdaptiveLearningData['visualSettings'], value: any) => {
    setLearningData(prev => ({
      ...prev,
      visualSettings: {
        ...prev.visualSettings,
        [setting]: value
      }
    }));
    
    if (onSettingsUpdate) {
      onSettingsUpdate({
        ...learningData.visualSettings,
        [setting]: value
      });
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    toast.info('بدء تدريب النموذج على بياناتك الشخصية...');
  };

  const resetLearning = () => {
    setLearningData(prev => ({
      ...prev,
      learningProgress: {
        adaptationsApplied: 0,
        accuracyScore: 0,
        satisfactionRating: 0,
        lastLearningSession: new Date(),
      }
    }));
    setRecentInsights([]);
    toast.success('تم إعادة تعيين بيانات التعلم');
  };

  const calculateOverallScore = () => {
    const enabledCount = Object.values(learningData.enabledFeatures).filter(Boolean).length;
    const featureScore = (enabledCount / 5) * 40;
    const progressScore = (learningData.learningProgress.adaptationsApplied * 10);
    const accuracyScore = learningData.learningProgress.accuracyScore * 0.3;
    
    return Math.min(featureScore + progressScore + accuracyScore, 100);
  };

  if (!userProfile) {
    return (
      <div className="text-center py-12" dir="rtl">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">التعلم التكيفي الشخصي</h2>
        <p className="text-muted-foreground">يرجى تسجيل الدخول لتفعيل التعلم التكيفي المخصص</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            التعلم التكيفي الشخصي
          </h1>
          <p className="text-muted-foreground mt-1">
            مرحباً {userProfile.name}، خصص تجربة القراءة الخاصة بك
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{Math.round(calculateOverallScore())}%</div>
          <div className="text-sm text-muted-foreground">التقدم الإجمالي</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">{learningData.learningProgress.adaptationsApplied}</div>
                <div className="text-xs text-muted-foreground">تكييفات مطبقة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-lg font-semibold">{learningData.learningProgress.accuracyScore}%</div>
                <div className="text-xs text-muted-foreground">دقة النموذج</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-lg font-semibold">{learningData.behaviorPatterns.averageSessionTime}د</div>
                <div className="text-xs text-muted-foreground">متوسط الجلسة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-lg font-semibold">{learningData.preferences.readingSpeed}</div>
                <div className="text-xs text-muted-foreground">كلمة/دقيقة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="visual">البصريات</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
          <TabsTrigger value="insights">الرؤى</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  التبديل التلقائي للثيم
                </CardTitle>
                <CardDescription>
                  تغيير الثيم تلقائياً حسب الوقت والإضاءة المحيطة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>تفعيل التبديل التلقائي</span>
                  <Switch
                    checked={learningData.enabledFeatures.autoThemeSwitch}
                    onCheckedChange={() => toggleFeature('autoThemeSwitch')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  توصيات المحتوى الذكية
                </CardTitle>
                <CardDescription>
                  اقتراح المقالات بناءً على تفضيلاتك وسلوك القراءة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>تفعيل التوصيات الذكية</span>
                  <Switch
                    checked={learningData.enabledFeatures.contentRecommendations}
                    onCheckedChange={() => toggleFeature('contentRecommendations')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  تحسين أوقات القراءة
                </CardTitle>
                <CardDescription>
                  تحديد الأوقات المثلى للقراءة وإرسال تذكيرات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>تفعيل تحسين الأوقات</span>
                  <Switch
                    checked={learningData.enabledFeatures.readingTimeOptimization}
                    onCheckedChange={() => toggleFeature('readingTimeOptimization')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  تعديل الراحة البصرية
                </CardTitle>
                <CardDescription>
                  تحسين السطوع والتباين تلقائياً لتقليل إجهاد العين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>تفعيل التعديل التلقائي</span>
                  <Switch
                    checked={learningData.enabledFeatures.visualComfortAdjustment}
                    onCheckedChange={() => toggleFeature('visualComfortAdjustment')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  إعدادات العرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">السطوع</label>
                    <span className="text-sm text-muted-foreground">{learningData.visualSettings.brightness}%</span>
                  </div>
                  <Slider
                    value={[learningData.visualSettings.brightness]}
                    onValueChange={([value]) => updateVisualSetting('brightness', value)}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">التباين</label>
                    <span className="text-sm text-muted-foreground">{learningData.visualSettings.contrast}%</span>
                  </div>
                  <Slider
                    value={[learningData.visualSettings.contrast]}
                    onValueChange={([value]) => updateVisualSetting('contrast', value)}
                    max={150}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">نظام الألوان</label>
                  <Select
                    value={learningData.visualSettings.colorScheme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => updateVisualSetting('colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  إعدادات النص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">حجم الخط</label>
                    <span className="text-sm text-muted-foreground">{learningData.visualSettings.fontSize}px</span>
                  </div>
                  <Slider
                    value={[learningData.visualSettings.fontSize]}
                    onValueChange={([value]) => updateVisualSetting('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">تباعد الأسطر</label>
                    <span className="text-sm text-muted-foreground">{learningData.visualSettings.lineSpacing}</span>
                  </div>
                  <Slider
                    value={[learningData.visualSettings.lineSpacing]}
                    onValueChange={([value]) => updateVisualSetting('lineSpacing', value)}
                    min={1.2}
                    max={2.5}
                    step={0.1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  أنماط القراءة المكتشفة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>سرعة التمرير</span>
                    <Badge variant="outline">{learningData.behaviorPatterns.scrollSpeed}x</Badge>
                  </div>
                  <Progress value={learningData.behaviorPatterns.scrollSpeed * 50} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>تكرار التوقف</span>
                    <Badge variant="outline">{learningData.behaviorPatterns.pauseFrequency}/دقيقة</Badge>
                  </div>
                  <Progress value={learningData.behaviorPatterns.pauseFrequency * 10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>معدل التراجع</span>
                    <Badge variant="outline">{Math.round(learningData.behaviorPatterns.backtrackRate * 100)}%</Badge>
                  </div>
                  <Progress value={learningData.behaviorPatterns.backtrackRate * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  الأوقات المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium">أوقات القراءة النشطة</div>
                  <div className="flex gap-2 flex-wrap">
                    {learningData.preferences.preferredTimeSlots.map((time, index) => (
                      <Badge key={index} variant="secondary">{time}</Badge>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm font-medium">البيئة المفضلة</div>
                  <Badge variant="outline" className="w-fit">
                    {learningData.preferences.readingEnvironment === 'quiet' ? 'هادئة' :
                     learningData.preferences.readingEnvironment === 'moderate' ? 'متوسطة' : 'صاخبة'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {recentInsights.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  رؤى حديثة مكتشفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">لا توجد رؤى بعد</h3>
                <p className="text-muted-foreground text-sm">
                  ابدأ تدريب النموذج لاكتشاف أنماط قراءتك
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                تدريب النموذج الشخصي
              </CardTitle>
              <CardDescription>
                قم بتدريب النموذج على بياناتك لتحسين دقة التوصيات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>جاري تحليل سلوك القراءة...</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={startTraining} 
                  disabled={isTraining}
                  className="flex-1"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isTraining ? 'جاري التدريب...' : 'تدريب النموذج'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetLearning}
                  disabled={isTraining}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  إعادة تعيين
                </Button>
              </div>

              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  كلما استخدمت النظام أكثر، كلما أصبحت التوصيات أدق وأكثر تخصصاً لاحتياجاتك
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}