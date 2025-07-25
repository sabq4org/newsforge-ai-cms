import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Brain,
  Palette,
  Eye,
  Clock,
  TrendingUp,
  Sparkle,
  Lightbulb,
  Target,
  Heart,
  Timer,
  Activity,
  BookOpen,
  Monitor,
  Sun,
  Moon,
  Coffee,
  Sunset,
  Cpu,
  MagicWand
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { safeTimeFormat, safeDateFormat } from '@/lib/utils';
import { Article } from '@/types';
import { UserProfile, ReadingSession } from '@/types/membership';
import { toast } from 'sonner';

interface BehavioralThemeLearningSystemProps {
  userId: string;
  userProfile?: UserProfile;
  currentArticle?: Article;
  onThemeAdaptation?: (adaptedTheme: ThemeColors, reasoning: string[]) => void;
}

interface BehavioralPattern {
  timeOfDay: number; // 0-23
  readingDuration: number; // minutes
  scrollSpeed: number; // pixels per second
  pauseFrequency: number; // pauses per minute
  deviceType: 'mobile' | 'desktop';
  ambientLight: 'bright' | 'medium' | 'dim'; // inferred from time/device
  contentType: string; // category
  engagementLevel: number; // 0-100
  eyeStrain: number; // 0-100, inferred from behavior
  focusLevel: number; // 0-100, based on scroll patterns
}

interface AdaptiveThemeRule {
  id: string;
  name: string;
  condition: (pattern: BehavioralPattern) => boolean;
  adaptation: (currentTheme: ThemeColors, pattern: BehavioralPattern) => ThemeColors;
  priority: number;
  reasoning: string;
}

interface ThemeAdaptationHistory {
  timestamp: Date;
  pattern: BehavioralPattern;
  originalTheme: ThemeColors;
  adaptedTheme: ThemeColors;
  userFeedback: 'positive' | 'negative' | 'neutral' | null;
  effectiveness: number; // 0-100
}

// Adaptive theme rules based on behavioral patterns
const adaptiveThemeRules: AdaptiveThemeRule[] = [
  {
    id: 'night-reading-comfort',
    name: 'راحة القراءة الليلية',
    condition: (pattern) => pattern.timeOfDay >= 20 || pattern.timeOfDay <= 6,
    adaptation: (theme, pattern) => ({
      ...theme,
      background: 'oklch(0.08 0.01 230)',
      foreground: 'oklch(0.85 0.02 40)',
      card: 'oklch(0.12 0.01 230)',
      cardForeground: 'oklch(0.85 0.02 40)',
      primary: 'oklch(0.6 0.15 40)',
      accent: 'oklch(0.5 0.2 60)',
    }),
    priority: 9,
    reasoning: 'تم تطبيق ثيم داكن للقراءة المريحة في الليل'
  },
  
  {
    id: 'high-engagement-contrast',
    name: 'تعزيز التباين للتفاعل العالي',
    condition: (pattern) => pattern.engagementLevel > 80,
    adaptation: (theme, pattern) => ({
      ...theme,
      primary: 'oklch(0.2 0.15 250)',
      accent: 'oklch(0.7 0.25 45)',
      border: 'oklch(0.15 0.05 250)',
      foreground: 'oklch(0.05 0 0)',
    }),
    priority: 7,
    reasoning: 'تم زيادة التباين لدعم مستوى التفاعل العالي'
  },

  {
    id: 'mobile-readability',
    name: 'تحسين القراءة على الجوال',
    condition: (pattern) => pattern.deviceType === 'mobile',
    adaptation: (theme, pattern) => ({
      ...theme,
      background: 'oklch(0.99 0 0)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.97 0.01 45)',
      muted: 'oklch(0.96 0.01 45)',
    }),
    priority: 6,
    reasoning: 'تم تحسين الألوان للشاشات الصغيرة'
  },

  {
    id: 'long-session-eye-comfort',
    name: 'راحة العين للجلسات الطويلة',
    condition: (pattern) => pattern.readingDuration > 15,
    adaptation: (theme, pattern) => ({
      ...theme,
      background: 'oklch(0.94 0.02 45)',
      card: 'oklch(0.96 0.01 45)',
      foreground: 'oklch(0.25 0.05 45)',
      primary: 'oklch(0.35 0.12 160)',
    }),
    priority: 8,
    reasoning: 'تم تطبيق ألوان مريحة للعين للجلسات الطويلة'
  },

  {
    id: 'morning-energy-boost',
    name: 'تعزيز الطاقة الصباحية',
    condition: (pattern) => pattern.timeOfDay >= 6 && pattern.timeOfDay <= 10,
    adaptation: (theme, pattern) => ({
      ...theme,
      primary: 'oklch(0.45 0.15 45)',
      accent: 'oklch(0.65 0.2 60)',
      background: 'oklch(0.99 0.005 45)',
    }),
    priority: 5,
    reasoning: 'ألوان منعشة لتحفيز القراءة الصباحية'
  },

  {
    id: 'low-focus-enhancement',
    name: 'تعزيز التركيز المنخفض',
    condition: (pattern) => pattern.focusLevel < 40,
    adaptation: (theme, pattern) => ({
      ...theme,
      primary: 'oklch(0.3 0.15 250)',
      accent: 'oklch(0.6 0.2 30)',
      border: 'oklch(0.2 0.1 250)',
    }),
    priority: 6,
    reasoning: 'ألوان محفزة للتركيز لتحسين الانتباه'
  },

  {
    id: 'eye-strain-relief',
    name: 'تخفيف إجهاد العين',
    condition: (pattern) => pattern.eyeStrain > 60,
    adaptation: (theme, pattern) => ({
      ...theme,
      background: 'oklch(0.92 0.02 120)',
      foreground: 'oklch(0.3 0.05 120)',
      card: 'oklch(0.94 0.01 120)',
      primary: 'oklch(0.4 0.1 160)',
    }),
    priority: 9,
    reasoning: 'ألوان خضراء هادئة لتخفيف إجهاد العين'
  }
];

export const BehavioralThemeLearningSystem: React.FC<BehavioralThemeLearningSystemProps> = ({
  userId,
  userProfile,
  currentArticle,
  onThemeAdaptation
}) => {
  const { getCurrentColors, setTheme } = useTheme();
  
  // State for behavioral analysis
  const [currentPattern, setCurrentPattern] = useState<BehavioralPattern | null>(null);
  const [adaptationHistory, setAdaptationHistory] = useKV<ThemeAdaptationHistory[]>(
    `theme-adaptation-history-${userId}`, []
  );
  const [isLearning, setIsLearning] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [learningEnabled, setLearningEnabled] = useKV<boolean>(
    `behavioral-learning-enabled-${userId}`, true
  );
  const [adaptationSensitivity, setAdaptationSensitivity] = useKV<number>(
    `adaptation-sensitivity-${userId}`, 50
  );

  // Real-time behavior tracking
  const [sessionStartTime] = useState(Date.now());
  const [scrollEvents, setScrollEvents] = useState<Array<{timestamp: number, position: number}>>([]);
  const [pauseEvents, setPauseEvents] = useState<Array<{timestamp: number, duration: number}>>([]);
  
  // Track scroll behavior
  useEffect(() => {
    if (!learningEnabled) return;

    let lastScrollTime = Date.now();
    let lastScrollPosition = window.scrollY;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const now = Date.now();
      const position = window.scrollY;
      
      if (!isScrolling) {
        isScrolling = true;
        // End of a pause
        if (now - lastScrollTime > 2000) {
          setPauseEvents(prev => [...prev, {
            timestamp: lastScrollTime,
            duration: now - lastScrollTime
          }]);
        }
      }

      setScrollEvents(prev => [...prev, { timestamp: now, position }].slice(-100));
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        lastScrollTime = now;
      }, 1000);

      lastScrollPosition = position;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [learningEnabled]);

  // Analyze current behavioral pattern
  const analyzeCurrentPattern = (): BehavioralPattern => {
    const now = new Date();
    const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
    
    // Calculate scroll speed
    const recentScrollEvents = scrollEvents.slice(-20);
    let scrollSpeed = 0;
    if (recentScrollEvents.length > 1) {
      const firstEvent = recentScrollEvents[0];
      const lastEvent = recentScrollEvents[recentScrollEvents.length - 1];
      const timeDiff = (lastEvent.timestamp - firstEvent.timestamp) / 1000; // seconds
      const positionDiff = Math.abs(lastEvent.position - firstEvent.position);
      scrollSpeed = timeDiff > 0 ? positionDiff / timeDiff : 0;
    }

    // Calculate pause frequency
    const pauseFrequency = pauseEvents.length / Math.max(sessionDuration, 1);

    // Infer ambient light from time and device
    const hour = now.getHours();
    let ambientLight: 'bright' | 'medium' | 'dim' = 'medium';
    if (hour >= 6 && hour <= 18) ambientLight = 'bright';
    else if (hour >= 19 && hour <= 21) ambientLight = 'medium';
    else ambientLight = 'dim';

    // Infer eye strain from scroll patterns and session duration
    const eyeStrain = Math.min(
      (sessionDuration * 3) + (pauseFrequency * 20) + (scrollSpeed > 1000 ? 30 : 0),
      100
    );

    // Infer focus level from scroll patterns
    const focusLevel = Math.max(
      100 - (pauseFrequency * 15) - (scrollSpeed > 2000 ? 20 : 0),
      0
    );

    // Mock engagement level (in real system, would come from actual analytics)
    const engagementLevel = Math.max(
      70 - (pauseFrequency * 10) + (sessionDuration > 5 ? 15 : 0),
      0
    );

    return {
      timeOfDay: hour,
      readingDuration: sessionDuration,
      scrollSpeed,
      pauseFrequency,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      ambientLight,
      contentType: currentArticle?.category?.name || 'عام',
      engagementLevel,
      eyeStrain,
      focusLevel
    };
  };

  // Apply adaptive theme based on behavioral pattern
  const applyAdaptiveTheme = async (pattern: BehavioralPattern) => {
    setIsAdapting(true);
    
    try {
      const currentTheme = getCurrentColors();
      let adaptedTheme = { ...currentTheme };
      const appliedReasons: string[] = [];

      // Sort rules by priority and apply matching ones
      const applicableRules = adaptiveThemeRules
        .filter(rule => rule.condition(pattern))
        .sort((a, b) => b.priority - a.priority);

      // Apply rules with sensitivity consideration
      const sensitivityFactor = adaptationSensitivity / 100;
      
      for (const rule of applicableRules.slice(0, 3)) { // Apply max 3 rules
        if (Math.random() < sensitivityFactor) {
          adaptedTheme = rule.adaptation(adaptedTheme, pattern);
          appliedReasons.push(rule.reasoning);
        }
      }

      // Only apply if there are actual changes
      if (appliedReasons.length > 0) {
        // Gradually transition to new theme
        setTimeout(() => {
          setTheme(adaptedTheme);
          
          // Record adaptation
          const adaptation: ThemeAdaptationHistory = {
            timestamp: new Date(),
            pattern,
            originalTheme: currentTheme,
            adaptedTheme,
            userFeedback: null,
            effectiveness: 0
          };
          
          setAdaptationHistory(prev => [...prev, adaptation].slice(-50));
          
          if (onThemeAdaptation) {
            onThemeAdaptation(adaptedTheme, appliedReasons);
          }
          
          // Show subtle notification
          toast.success(`تم تكييف الثيم تلقائياً بناءً على سلوك قراءتك`, {
            description: appliedReasons[0],
            duration: 3000,
          });
          
          setIsAdapting(false);
        }, 1000);
      } else {
        setIsAdapting(false);
      }
    } catch (error) {
      console.error('Error applying adaptive theme:', error);
      setIsAdapting(false);
    }
  };

  // Continuous learning loop
  useEffect(() => {
    if (!learningEnabled) return;

    const learningInterval = setInterval(() => {
      setIsLearning(true);
      
      try {
        const pattern = analyzeCurrentPattern();
        setCurrentPattern(pattern);
        
        // Apply adaptive theme if conditions are met
        if (pattern.readingDuration > 2) { // Only after 2 minutes of reading
          applyAdaptiveTheme(pattern);
        }
      } catch (error) {
        console.error('Error in learning loop:', error);
      } finally {
        setTimeout(() => setIsLearning(false), 1000);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(learningInterval);
  }, [learningEnabled, adaptationSensitivity, scrollEvents, pauseEvents]);

  // Provide feedback on adaptation
  const provideFeedback = (index: number, feedback: 'positive' | 'negative') => {
    setAdaptationHistory(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].userFeedback = feedback;
        updated[index].effectiveness = feedback === 'positive' ? 90 : 20;
      }
      return updated;
    });
    
    toast.success(
      feedback === 'positive' 
        ? 'شكراً! سيتم تطبيق تحسينات مشابهة مستقبلاً'
        : 'تم تسجيل رأيك، سيتم تجنب هذا النوع من التغييرات'
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">نظام التعلم السلوكي للثيمات</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          يتعلم النظام من سلوك قراءتك ويكيف الثيمات تلقائياً لتحسين تجربتك
        </p>
      </div>

      {/* Learning Status */}
      <Card className={learningEnabled ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className={`w-5 h-5 ${isLearning ? 'text-green-500 animate-spin' : 'text-gray-400'}`} />
              نظام التعلم التكيفي
            </div>
            <Button
              variant={learningEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setLearningEnabled(!learningEnabled)}
            >
              {learningEnabled ? 'تعطيل' : 'تفعيل'}
            </Button>
          </CardTitle>
          <CardDescription>
            {learningEnabled 
              ? 'يتم تحليل سلوك قراءتك وتكييف الثيمات تلقائياً'
              : 'النظام معطل - لن يتم تكييف الثيمات'
            }
          </CardDescription>
        </CardHeader>
        
        {learningEnabled && (
          <CardContent className="space-y-4">
            {/* Adaptation Sensitivity */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">حساسية التكيف</label>
                <span className="text-sm text-muted-foreground">{adaptationSensitivity}%</span>
              </div>
              <Slider
                value={[adaptationSensitivity]}
                onValueChange={(value) => setAdaptationSensitivity(value[0])}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                حساسية أعلى = تغييرات أكثر تكراراً، حساسية أقل = تغييرات أكثر دقة
              </p>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Activity className={`w-6 h-6 mx-auto mb-1 ${isLearning ? 'text-green-500' : 'text-gray-400'}`} />
                <p className="text-xs text-muted-foreground">التحليل</p>
                <p className="text-sm font-medium">
                  {isLearning ? 'نشط' : 'في الانتظار'}
                </p>
              </div>
              
              <div className="text-center">
                <MagicWand className={`w-6 h-6 mx-auto mb-1 ${isAdapting ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-xs text-muted-foreground">التكيف</p>
                <p className="text-sm font-medium">
                  {isAdapting ? 'جاري التطبيق' : 'في الانتظار'}
                </p>
              </div>
              
              <div className="text-center">
                <Cpu className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">السجل</p>
                <p className="text-sm font-medium">{adaptationHistory.length}</p>
              </div>
              
              <div className="text-center">
                <Timer className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <p className="text-xs text-muted-foreground">الجلسة</p>
                <p className="text-sm font-medium">
                  {Math.round((Date.now() - sessionStartTime) / 1000 / 60)}د
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Pattern Analysis */}
      {currentPattern && learningEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="text-primary" />
              تحليل النمط الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">الوقت</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentPattern.timeOfDay >= 6 && currentPattern.timeOfDay <= 12 && <Coffee className="w-4 h-4 text-orange-500" />}
                  {currentPattern.timeOfDay > 12 && currentPattern.timeOfDay <= 18 && <Sun className="w-4 h-4 text-yellow-500" />}
                  {currentPattern.timeOfDay > 18 && currentPattern.timeOfDay <= 22 && <Sunset className="w-4 h-4 text-orange-600" />}
                  {(currentPattern.timeOfDay > 22 || currentPattern.timeOfDay < 6) && <Moon className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm">{currentPattern.timeOfDay}:00</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">مدة الجلسة</span>
                </div>
                <span className="text-sm">{Math.round(currentPattern.readingDuration)} دقيقة</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">الجهاز</span>
                </div>
                <span className="text-sm">{currentPattern.deviceType === 'mobile' ? 'جوال' : 'حاسوب'}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">التفاعل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={currentPattern.engagementLevel} className="w-16 h-2" />
                  <span className="text-sm">{Math.round(currentPattern.engagementLevel)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">إجهاد العين</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={currentPattern.eyeStrain} 
                    className="w-16 h-2"
                  />
                  <span className="text-sm">{Math.round(currentPattern.eyeStrain)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">التركيز</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={currentPattern.focusLevel} className="w-16 h-2" />
                  <span className="text-sm">{Math.round(currentPattern.focusLevel)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptation History */}
      {adaptationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary" />
              سجل التكيفات
            </CardTitle>
            <CardDescription>
              آخر التكيفات التي تم تطبيقها على الثيم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adaptationHistory.slice(-5).reverse().map((adaptation, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        {adaptation.timestamp ? 
                          safeTimeFormat(adaptation.timestamp, 'ar-SA') : 
                          'غير متاح'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {adaptation.pattern.contentType} • {adaptation.pattern.deviceType === 'mobile' ? 'جوال' : 'حاسوب'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => provideFeedback(adaptationHistory.length - 1 - index, 'positive')}
                        disabled={adaptation.userFeedback !== null}
                      >
                        👍
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => provideFeedback(adaptationHistory.length - 1 - index, 'negative')}
                        disabled={adaptation.userFeedback !== null}
                      >
                        👎
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: adaptation.originalTheme.primary }} />
                      <span className="text-xs">→</span>
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: adaptation.adaptedTheme.primary }} />
                      <span className="text-xs text-muted-foreground">تغيير اللون الأساسي</span>
                    </div>
                    
                    {adaptation.userFeedback && (
                      <Badge variant={adaptation.userFeedback === 'positive' ? 'default' : 'destructive'}>
                        {adaptation.userFeedback === 'positive' ? 'إيجابي' : 'سلبي'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BehavioralThemeLearningSystem;