import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { safeDateFormat, safeTimeFormat } from '@/lib/utils';
import { 
  Brain,
  Eye,
  Palette,
  Clock,
  Activity,
  TrendingUp,
  Sun,
  Moon,
  Coffee,
  BookOpen,
  Monitor,
  Heart,
  Timer,
  Sparkle,
  Target,
  MagicWand,
  Warning,
  CheckCircle,
  Lightbulb
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';
import { toast } from 'sonner';

interface AdaptiveColorLearningSystemProps {
  userId: string;
  userProfile?: UserProfile;
  currentArticle?: Article;
  isActive?: boolean;
  onColorAdaptation?: (adaptedColors: ThemeColors, reason: string) => void;
}

interface ReadingMetrics {
  scrollSpeed: number;
  pauseFrequency: number;
  readingTime: number;
  clicksPerMinute: number;
  backtrackCount: number;
  timeSpentOnPage: number;
  eyeStrainIndicators: number;
  readingEfficiency: number;
}

interface EnvironmentalContext {
  timeOfDay: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  screenBrightness: number;
  ambientLight: 'bright' | 'medium' | 'dim' | 'dark';
  batteryLevel?: number;
  networkQuality: 'fast' | 'medium' | 'slow';
}

interface ColorPreference {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  satisfaction: number; // 0-100
  readingEfficiency: number;
  environmentalContext: EnvironmentalContext;
  timestamp: Date;
}

interface LearningPattern {
  preferredContrast: number;
  preferredWarmth: number;
  preferredSaturation: number;
  timeBasedPreferences: Map<number, ColorPreference>; // hour -> preference
  contextBasedPreferences: Map<string, ColorPreference>; // context -> preference
}

export function AdaptiveColorLearningSystem({ 
  userId, 
  userProfile, 
  currentArticle,
  isActive = true,
  onColorAdaptation 
}: AdaptiveColorLearningSystemProps) {
  const { currentTheme, applyTheme } = useTheme();
  
  // State management
  const [isLearning, setIsLearning] = useState(false);
  const [adaptationStrength, setAdaptationStrength] = useState([75]);
  const [autoAdaptEnabled, setAutoAdaptEnabled] = useState(true);
  const [currentMetrics, setCurrentMetrics] = useState<ReadingMetrics>({
    scrollSpeed: 0,
    pauseFrequency: 0,
    readingTime: 0,
    clicksPerMinute: 0,
    backtrackCount: 0,
    timeSpentOnPage: 0,
    eyeStrainIndicators: 0,
    readingEfficiency: 75
  });
  
  // Persistent storage
  const [learningPatterns, setLearningPatterns] = useKV<LearningPattern>(`adaptive-learning-${userId}`, {
    preferredContrast: 70,
    preferredWarmth: 50,
    preferredSaturation: 60,
    timeBasedPreferences: new Map(),
    contextBasedPreferences: new Map()
  });
  
  const [colorPreferences, setColorPreferences] = useKV<ColorPreference[]>(`color-prefs-${userId}`, []);
  const [adaptationHistory, setAdaptationHistory] = useKV<any[]>(`adaptation-history-${userId}`, []);
  
  // Real-time tracking refs
  const metricsRef = useRef<ReadingMetrics>(currentMetrics);
  const startTimeRef = useRef<Date>(new Date());
  const scrollPositionRef = useRef<number>(0);
  const pauseStartRef = useRef<Date | null>(null);
  const clickCountRef = useRef<number>(0);
  
  // Environmental context detection
  const detectEnvironmentalContext = useCallback((): EnvironmentalContext => {
    const hour = new Date().getHours();
    const userAgent = navigator.userAgent;
    
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    let ambientLight: 'bright' | 'medium' | 'dim' | 'dark' = 'medium';
    if (hour >= 6 && hour <= 10) ambientLight = 'bright';
    else if (hour >= 11 && hour <= 16) ambientLight = 'bright';
    else if (hour >= 17 && hour <= 20) ambientLight = 'medium';
    else if (hour >= 21 && hour <= 23) ambientLight = 'dim';
    else ambientLight = 'dark';
    
    return {
      timeOfDay: hour,
      deviceType,
      screenBrightness: 80, // Default, would be detected via API if available
      ambientLight,
      networkQuality: 'fast' // Would be detected via connection API
    };
  }, []);
  
  // AI-powered color adaptation based on behavioral patterns
  const generateAdaptiveColors = useCallback(async (
    context: EnvironmentalContext, 
    metrics: ReadingMetrics,
    patterns: LearningPattern
  ): Promise<{ colors: ThemeColors; reasoning: string[] }> => {
    const reasoning: string[] = [];
    
    // Base adaptation prompt for AI
    const adaptationPrompt = spark.llmPrompt`
    Based on the following reading context and behavioral patterns, suggest optimal color adaptations:
    
    Environmental Context:
    - Time: ${context.timeOfDay}:00 (${context.ambientLight} lighting)
    - Device: ${context.deviceType}
    - Screen brightness: ${context.screenBrightness}%
    
    Reading Metrics:
    - Reading efficiency: ${metrics.readingEfficiency}%
    - Eye strain indicators: ${metrics.eyeStrainIndicators}
    - Scroll speed: ${metrics.scrollSpeed} px/s
    - Pause frequency: ${metrics.pauseFrequency} per minute
    
    Learned Preferences:
    - Preferred contrast: ${patterns.preferredContrast}%
    - Preferred warmth: ${patterns.preferredWarmth}%
    - Preferred saturation: ${patterns.preferredSaturation}%
    
    Current article type: ${currentArticle?.category?.name || 'General'}
    
    Provide color recommendations for:
    1. Background color (for optimal eye comfort)
    2. Text color (for maximum readability)
    3. Accent colors (for UI elements)
    4. Specific reasoning for each adaptation
    
    Focus on reducing eye strain and improving reading comfort.
    `;
    
    try {
      const aiResponse = await spark.llm(adaptationPrompt, 'gpt-4o', true);
      const adaptation = JSON.parse(aiResponse);
      
      // Convert AI suggestions to theme colors
      const adaptedColors: ThemeColors = {
        ...currentTheme,
        background: adaptation.backgroundColor || currentTheme.background,
        foreground: adaptation.textColor || currentTheme.foreground,
        accent: adaptation.accentColor || currentTheme.accent,
        // Apply intelligent modifications based on context
        card: adjustBrightness(adaptation.backgroundColor || currentTheme.background, 0.02),
        muted: adjustSaturation(adaptation.backgroundColor || currentTheme.background, -0.1)
      };
      
      reasoning.push(...(adaptation.reasoning || ['AI-optimized color adaptation']));
      
      return { colors: adaptedColors, reasoning };
    } catch (error) {
      console.error('AI adaptation failed:', error);
      
      // Fallback to rule-based adaptation
      const adaptedColors = applyRuleBasedAdaptation(context, metrics, patterns);
      reasoning.push('Applied rule-based color adaptation due to AI unavailability');
      
      return { colors: adaptedColors, reasoning };
    }
  }, [currentTheme, currentArticle]);
  
  // Rule-based fallback adaptation
  const applyRuleBasedAdaptation = useCallback((
    context: EnvironmentalContext, 
    metrics: ReadingMetrics, 
    patterns: LearningPattern
  ): ThemeColors => {
    let adaptedColors = { ...currentTheme };
    
    // Time-based adjustments
    if (context.ambientLight === 'dark' || context.timeOfDay >= 20 || context.timeOfDay <= 6) {
      // Night mode adaptations
      adaptedColors.background = '#1a1a1a';
      adaptedColors.foreground = '#e8e8e8';
      adaptedColors.card = '#252525';
    } else if (context.ambientLight === 'bright') {
      // Bright environment adaptations
      adaptedColors.background = '#ffffff';
      adaptedColors.foreground = '#2a2a2a';
      adaptedColors.card = '#f8f8f8';
    }
    
    // Reading efficiency adjustments
    if (metrics.readingEfficiency < 60) {
      // Increase contrast for better readability
      adaptedColors.foreground = adjustContrast(adaptedColors.foreground, 0.2);
    }
    
    // Eye strain adjustments
    if (metrics.eyeStrainIndicators > 5) {
      // Apply warmer, less saturated colors
      adaptedColors.accent = adjustWarmth(adaptedColors.accent, 0.15);
      adaptedColors.background = adjustSaturation(adaptedColors.background, -0.1);
    }
    
    return adaptedColors;
  }, [currentTheme]);
  
  // Color manipulation utilities
  const adjustBrightness = (color: string, amount: number): string => {
    // Simple brightness adjustment (would use proper color library in production)
    return color; // Placeholder
  };
  
  const adjustContrast = (color: string, amount: number): string => {
    return color; // Placeholder
  };
  
  const adjustWarmth = (color: string, amount: number): string => {
    return color; // Placeholder
  };
  
  const adjustSaturation = (color: string, amount: number): string => {
    return color; // Placeholder
  };
  
  // Real-time metrics tracking
  useEffect(() => {
    if (!isActive || !autoAdaptEnabled) return;
    
    let scrollTimeout: NodeJS.Timeout;
    let clickTimeout: NodeJS.Timeout;
    
    const trackScrollBehavior = () => {
      const currentScroll = window.pageYOffset;
      const scrollDiff = Math.abs(currentScroll - scrollPositionRef.current);
      const timeDiff = Date.now() - startTimeRef.current.getTime();
      
      if (timeDiff > 0) {
        const scrollSpeed = (scrollDiff / timeDiff) * 1000; // px/s
        metricsRef.current.scrollSpeed = scrollSpeed;
      }
      
      scrollPositionRef.current = currentScroll;
      
      // Detect pauses (no scroll for 3+ seconds)
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!pauseStartRef.current) {
          pauseStartRef.current = new Date();
        }
      }, 3000);
    };
    
    const trackClicks = () => {
      clickCountRef.current++;
      const timeElapsed = (Date.now() - startTimeRef.current.getTime()) / 60000; // minutes
      metricsRef.current.clicksPerMinute = clickCountRef.current / timeElapsed;
      
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        clickCountRef.current = 0;
        startTimeRef.current = new Date();
      }, 60000);
    };
    
    // Add event listeners
    window.addEventListener('scroll', trackScrollBehavior);
    document.addEventListener('click', trackClicks);
    
    // Periodic metrics update
    const metricsInterval = setInterval(() => {
      setCurrentMetrics({ ...metricsRef.current });
    }, 5000);
    
    return () => {
      window.removeEventListener('scroll', trackScrollBehavior);
      document.removeEventListener('click', trackClicks);
      clearInterval(metricsInterval);
      clearTimeout(scrollTimeout);
      clearTimeout(clickTimeout);
    };
  }, [isActive, autoAdaptEnabled]);
  
  // Adaptive learning trigger
  useEffect(() => {
    if (!autoAdaptEnabled || !isActive) return;
    
    const adaptationInterval = setInterval(async () => {
      const context = detectEnvironmentalContext();
      const { colors, reasoning } = await generateAdaptiveColors(context, currentMetrics, learningPatterns);
      
      // Apply adaptation based on strength setting
      const adaptationFactor = adaptationStrength[0] / 100;
      if (adaptationFactor > 0.5) {
        applyTheme(colors);
        onColorAdaptation?.(colors, reasoning.join('; '));
        
        // Record successful adaptation
        const newPreference: ColorPreference = {
          backgroundColor: colors?.background || '#ffffff',
          textColor: colors?.foreground || '#000000',
          accentColor: colors?.accent || '#999999',
          satisfaction: 75, // Would be user-rated in full implementation
          readingEfficiency: currentMetrics.readingEfficiency,
          environmentalContext: context,
          timestamp: new Date()
        };
        
        setColorPreferences(prev => [...prev.slice(-19), newPreference]);
        
        toast.success(`تم تكييف الألوان تلقائياً - ${reasoning[0] || 'تحسين تجربة القراءة'}`);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(adaptationInterval);
  }, [autoAdaptEnabled, isActive, adaptationStrength, currentMetrics, learningPatterns, detectEnvironmentalContext, generateAdaptiveColors, applyTheme, onColorAdaptation, setColorPreferences]);
  
  // Manual learning trigger
  const triggerManualAdaptation = async () => {
    setIsLearning(true);
    try {
      const context = detectEnvironmentalContext();
      const { colors, reasoning } = await generateAdaptiveColors(context, currentMetrics, learningPatterns);
      
      applyTheme(colors);
      onColorAdaptation?.(colors, reasoning.join('; '));
      
      setAdaptationHistory(prev => [...prev.slice(-9), {
        timestamp: new Date(),
        colors,
        reasoning,
        context,
        metrics: currentMetrics
      }]);
      
      toast.success('تم تطبيق التكييف اليدوي للألوان بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تكييف الألوان');
    }
    setIsLearning(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            نظام التعلم التكيفي للألوان
          </CardTitle>
          <CardDescription>
            يتعلم تفضيلاتك في الألوان ويكيفها تلقائياً أثناء القراءة لتحسين الراحة البصرية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Learning Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${autoAdaptEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {autoAdaptEnabled ? 'نشط - يتعلم ويكيف الألوان' : 'متوقف مؤقتاً'}
              </span>
            </div>
            <Switch
              checked={autoAdaptEnabled}
              onCheckedChange={setAutoAdaptEnabled}
            />
          </div>
          
          {/* Adaptation Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">قوة التكييف</label>
              <span className="text-sm text-muted-foreground">{adaptationStrength[0]}%</span>
            </div>
            <Slider
              value={adaptationStrength}
              onValueChange={setAdaptationStrength}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>حساس قليلاً</span>
              <span>متوسط</span>
              <span>حساس جداً</span>
            </div>
          </div>
          
          {/* Manual Adaptation Button */}
          <Button 
            onClick={triggerManualAdaptation}
            disabled={isLearning}
            className="w-full gap-2"
          >
            {isLearning ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <MagicWand className="w-4 h-4" />
            )}
            {isLearning ? 'جاري التكييف...' : 'كيّف الألوان الآن'}
          </Button>
        </CardContent>
      </Card>
      
      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            مقاييس القراءة المباشرة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{currentMetrics.readingEfficiency}%</div>
              <div className="text-sm text-muted-foreground">كفاءة القراءة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{Math.round(currentMetrics.scrollSpeed)}</div>
              <div className="text-sm text-muted-foreground">سرعة التمرير</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{currentMetrics.pauseFrequency}</div>
              <div className="text-sm text-muted-foreground">التوقفات/دقيقة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{currentMetrics.eyeStrainIndicators}</div>
              <div className="text-sm text-muted-foreground">مؤشر إجهاد العين</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Environmental Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            السياق البيئي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">الوقت الحالي</div>
                <div className="text-sm text-muted-foreground">
                  {new Date().getHours()}:00 - {detectEnvironmentalContext().ambientLight}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">نوع الجهاز</div>
                <div className="text-sm text-muted-foreground">
                  {detectEnvironmentalContext().deviceType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">نوع المحتوى</div>
                <div className="text-sm text-muted-foreground">
                  {currentArticle?.category?.name || 'عام'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            تقدم التعلم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>بيانات القراءة المجمعة</span>
              <span>{colorPreferences.length}/100</span>
            </div>
            <Progress value={(colorPreferences.length / 100) * 100} className="w-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{learningPatterns.preferredContrast}%</div>
              <div className="text-sm text-muted-foreground">التباين المفضل</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{learningPatterns.preferredWarmth}%</div>
              <div className="text-sm text-muted-foreground">الدفء المفضل</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{learningPatterns.preferredSaturation}%</div>
              <div className="text-sm text-muted-foreground">التشبع المفضل</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Adaptations History */}
      {adaptationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-accent" />
              سجل التكييفات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adaptationHistory.slice(-5).reverse().map((adaptation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: adaptation.colors?.accent || '#999999' }} />
                    <div>
                      <div className="font-medium">{adaptation.reasoning[0]}</div>
                      <div className="text-sm text-muted-foreground">
                        {safeDateFormat(adaptation.timestamp, 'ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {adaptation.context.ambientLight}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}