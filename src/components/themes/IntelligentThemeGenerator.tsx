import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Coffee
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useTheme, ThemeColors, ThemePreset } from '@/contexts/ThemeContext';
import { Article } from '@/types';
import { UserProfile, ReadingSession } from '@/types/membership';
import { toast } from 'sonner';
import { safeArray, safeProperty, safeDisplayValue, safeColors, safeExecute } from '@/lib/safeComponentRenderer';

interface IntelligentThemeGeneratorProps {
  userId: string;
  userProfile?: UserProfile;
  articles?: Article[];
  onThemeGenerated?: (theme: ThemePreset) => void;
}

interface ReadingBehaviorPattern {
  timePreferences: {
    morning: number;    // 6-12
    afternoon: number;  // 12-18  
    evening: number;    // 18-22
    night: number;      // 22-6
  };
  contentPreferences: {
    categories: { [category: string]: number };
    readingSpeed: number; // words per minute
    sessionDuration: number; // average minutes
    scrollDepth: number; // percentage
  };
  deviceUsage: {
    mobile: number;
    desktop: number;
  };
  engagementMetrics: {
    averageEngagement: number;
    peakEngagementTime: number; // hour of day
    preferredContentLength: 'short' | 'medium' | 'long';
  };
  visualPreferences: {
    contrastSensitivity: 'low' | 'medium' | 'high';
    colorTemperature: 'warm' | 'neutral' | 'cool';
    brightness: 'dim' | 'medium' | 'bright';
  };
}

interface GeneratedTheme {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  confidence: number; // 0-100
  colors: ThemeColors;
  reasoning: string[];
  basedOn: {
    pattern: string;
    strength: number;
  }[];
}

const colorPalettes = {
  // Morning themes - fresh, energetic
  morning: {
    warm: {
      primary: 'oklch(0.45 0.15 45)', // Warm orange
      accent: 'oklch(0.7 0.2 60)',    // Golden yellow
      background: 'oklch(0.99 0.01 45)',
    },
    cool: {
      primary: 'oklch(0.5 0.12 200)',  // Cool blue
      accent: 'oklch(0.65 0.15 180)',  // Cyan
      background: 'oklch(0.99 0.005 200)',
    },
    neutral: {
      primary: 'oklch(0.4 0.08 280)',  // Purple
      accent: 'oklch(0.6 0.12 60)',    // Light gold
      background: 'oklch(0.98 0 0)',
    }
  },
  
  // Evening themes - warm, comfortable
  evening: {
    warm: {
      primary: 'oklch(0.35 0.12 30)',   // Deep orange
      accent: 'oklch(0.55 0.18 20)',    // Warm red
      background: 'oklch(0.97 0.02 30)',
    },
    neutral: {
      primary: 'oklch(0.3 0.1 40)',     // Brown
      accent: 'oklch(0.5 0.15 25)',     // Amber
      background: 'oklch(0.96 0.02 40)',
    }
  },
  
  // Night themes - dark, easy on eyes
  night: {
    cool: {
      primary: 'oklch(0.6 0.15 220)',   // Light blue
      accent: 'oklch(0.5 0.2 180)',     // Cyan
      background: 'oklch(0.08 0.01 220)',
      foreground: 'oklch(0.9 0 0)',
    },
    warm: {
      primary: 'oklch(0.65 0.18 40)',   // Warm amber
      accent: 'oklch(0.55 0.15 20)',    // Orange
      background: 'oklch(0.06 0.02 30)',
      foreground: 'oklch(0.85 0.02 40)',
    }
  },
  
  // High contrast for readability
  highContrast: {
    light: {
      primary: 'oklch(0.15 0 0)',      // Near black
      accent: 'oklch(0.25 0.15 250)',  // Deep blue
      background: 'oklch(1 0 0)',      // Pure white
      foreground: 'oklch(0.05 0 0)',
    },
    dark: {
      primary: 'oklch(0.9 0 0)',       // Near white
      accent: 'oklch(0.8 0.2 60)',     // Bright yellow
      background: 'oklch(0.05 0 0)',   // Near black
      foreground: 'oklch(0.95 0 0)',
    }
  }
};

export const IntelligentThemeGenerator: React.FC<IntelligentThemeGeneratorProps> = ({
  userId,
  userProfile,
  articles = [],
  onThemeGenerated
}) => {
  const { setTheme, applyPreset } = useTheme();
  
  // State for reading behavior analysis
  const [readingSessions, setReadingSessions] = useKV<ReadingSession[]>(`reading-sessions-${userId}`, []);
  const [behaviorPattern, setBehaviorPattern] = useState<ReadingBehaviorPattern | null>(null);
  const [generatedThemes, setGeneratedThemes] = useState<GeneratedTheme[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Store generated themes for user
  const [userGeneratedThemes, setUserGeneratedThemes] = useKV<GeneratedTheme[]>(
    `generated-themes-${userId}`, 
    []
  );

  // Analyze reading behavior to create patterns
  const analyzeReadingBehavior = async (): Promise<ReadingBehaviorPattern> => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with real data processing
    const sessions = readingSessions.filter(session => session.userId === userId);
    
    if (sessions.length === 0) {
      // Generate sample pattern for demo
      return {
        timePreferences: { morning: 30, afternoon: 40, evening: 25, night: 5 },
        contentPreferences: {
          categories: { 'تقنية': 40, 'أعمال': 30, 'محليات': 20, 'رياضة': 10 },
          readingSpeed: 180,
          sessionDuration: 8,
          scrollDepth: 75
        },
        deviceUsage: { mobile: 60, desktop: 40 },
        engagementMetrics: {
          averageEngagement: 72,
          peakEngagementTime: 14,
          preferredContentLength: 'medium'
        },
        visualPreferences: {
          contrastSensitivity: 'medium',
          colorTemperature: 'warm',
          brightness: 'medium'
        }
      };
    }

    // Real analysis logic
    const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const categoryEngagement: { [key: string]: number } = {};
    let totalEngagement = 0;
    let totalDuration = 0;
    let totalScrollDepth = 0;
    let mobileCount = 0;
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (hour >= 6 && hour < 12) timeDistribution.morning++;
      else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
      else if (hour >= 18 && hour < 22) timeDistribution.evening++;
      else timeDistribution.night++;
      
      if (session.article?.category?.name) {
        const category = session.article.category.name;
        categoryEngagement[category] = (categoryEngagement[category] || 0) + (session.engagement || 0);
      }
      
      totalEngagement += session.engagement || 0;
      totalDuration += session.duration || 0;
      totalScrollDepth += session.completion || 0;
      
      if (session.deviceInfo?.type === 'mobile') mobileCount++;
    });

    const total = sessions.length;
    
    const pattern: ReadingBehaviorPattern = {
      timePreferences: {
        morning: (timeDistribution.morning / total) * 100,
        afternoon: (timeDistribution.afternoon / total) * 100,
        evening: (timeDistribution.evening / total) * 100,
        night: (timeDistribution.night / total) * 100,
      },
      contentPreferences: {
        categories: categoryEngagement,
        readingSpeed: 180, // Would calculate from actual data
        sessionDuration: totalDuration / total,
        scrollDepth: totalScrollDepth / total
      },
      deviceUsage: {
        mobile: (mobileCount / total) * 100,
        desktop: ((total - mobileCount) / total) * 100
      },
      engagementMetrics: {
        averageEngagement: totalEngagement / total,
        peakEngagementTime: Object.keys(timeDistribution).reduce((a, b) => 
          timeDistribution[a as keyof typeof timeDistribution] > timeDistribution[b as keyof typeof timeDistribution] ? a : b
        ) === 'morning' ? 9 : 
        Object.keys(timeDistribution).reduce((a, b) => 
          timeDistribution[a as keyof typeof timeDistribution] > timeDistribution[b as keyof typeof timeDistribution] ? a : b
        ) === 'afternoon' ? 15 : 
        Object.keys(timeDistribution).reduce((a, b) => 
          timeDistribution[a as keyof typeof timeDistribution] > timeDistribution[b as keyof typeof timeDistribution] ? a : b
        ) === 'evening' ? 20 : 23,
        preferredContentLength: totalDuration > 10 ? 'long' : totalDuration > 5 ? 'medium' : 'short'
      },
      visualPreferences: {
        contrastSensitivity: totalScrollDepth > 80 ? 'high' : totalScrollDepth > 60 ? 'medium' : 'low',
        colorTemperature: timeDistribution.evening + timeDistribution.night > timeDistribution.morning + timeDistribution.afternoon ? 'warm' : 'neutral',
        brightness: mobileCount > total / 2 ? 'medium' : 'bright'
      }
    };

    setTimeout(() => setIsAnalyzing(false), 2000);
    return pattern;
  };

  // Generate intelligent themes based on behavior patterns
  const generateIntelligentThemes = async (pattern: ReadingBehaviorPattern) => {
    try {
      setIsGenerating(true);
      
      // Validate pattern object
      if (!pattern || !pattern.timePreferences || !pattern.visualPreferences) {
        throw new Error('Invalid behavior pattern data');
      }
      
      const themes: GeneratedTheme[] = [];
    
    // Theme 1: Time-optimized theme
    const peakTime = Object.keys(pattern.timePreferences).reduce((a, b) => 
      pattern.timePreferences[a as keyof typeof pattern.timePreferences] > 
      pattern.timePreferences[b as keyof typeof pattern.timePreferences] ? a : b
    ) as keyof typeof pattern.timePreferences;
    
    let timeBasedColors = colorPalettes.morning.neutral;
    let timeThemeName = 'صباحي متوازن';
    
    if (peakTime === 'evening' || peakTime === 'night') {
      timeBasedColors = pattern.visualPreferences.colorTemperature === 'warm' 
        ? colorPalettes.evening.warm 
        : colorPalettes.evening.neutral;
      timeThemeName = peakTime === 'evening' ? 'مسائي دافئ' : 'ليلي مريح';
    }
    
    themes.push({
      id: `time-optimized-${userId}-${Date.now()}`,
      name: `Time-Optimized for ${peakTime}`,
      nameAr: timeThemeName,
      description: `محسّن لقراءتك في فترة ${peakTime === 'morning' ? 'الصباح' : peakTime === 'afternoon' ? 'الظهيرة' : peakTime === 'evening' ? 'المساء' : 'الليل'}`,
      confidence: Math.round(pattern.timePreferences[peakTime]),
      colors: {
        ...timeBasedColors,
        secondary: 'oklch(0.92 0.02 45)',
        secondaryForeground: 'oklch(0.2 0.05 45)',
        muted: 'oklch(0.94 0.02 45)',
        mutedForeground: 'oklch(0.4 0.05 45)',
        border: 'oklch(0.88 0.03 45)',
        destructive: 'oklch(0.6 0.25 15)',
        destructiveForeground: 'oklch(1 0 0)',
        card: timeBasedColors.background || 'oklch(0.97 0.01 45)',
        cardForeground: timeBasedColors.foreground || 'oklch(0.1 0 0)',
        popover: timeBasedColors.background || 'oklch(0.99 0 0)',
        popoverForeground: timeBasedColors.foreground || 'oklch(0.1 0 0)',
        primary: timeBasedColors.primary,
        primaryForeground: 'oklch(1 0 0)',
        accent: timeBasedColors.accent,
        accentForeground: 'oklch(1 0 0)',
        background: timeBasedColors.background || 'oklch(0.98 0.01 45)',
        foreground: timeBasedColors.foreground || 'oklch(0.15 0.02 45)',
      },
      reasoning: [
        `أكثر نشاطًا في فترة ${peakTime === 'morning' ? 'الصباح' : peakTime === 'afternoon' ? 'الظهيرة' : peakTime === 'evening' ? 'المساء' : 'الليل'} بنسبة ${Math.round(pattern.timePreferences[peakTime])}%`,
        `ألوان محسّنة لتفضيلك ${pattern.visualPreferences.colorTemperature === 'warm' ? 'الدافئة' : 'المحايدة'}`,
        `مستوى إضاءة ${pattern.visualPreferences.brightness === 'bright' ? 'مضيء' : 'متوسط'}`
      ],
      basedOn: [
        { pattern: 'وقت القراءة المفضل', strength: pattern.timePreferences[peakTime] },
        { pattern: 'تفضيل درجة الحرارة اللونية', strength: 75 }
      ]
    });

    // Theme 2: Reading-optimized theme based on engagement
    const isHighEngagement = pattern.engagementMetrics.averageEngagement > 70;
    const readingColors = isHighEngagement 
      ? (pattern.visualPreferences.contrastSensitivity === 'high' 
         ? colorPalettes.highContrast.light 
         : colorPalettes.morning.cool)
      : colorPalettes.evening.warm;
    
    themes.push({
      id: `reading-optimized-${userId}-${Date.now()}`,
      name: 'Reading-Optimized',
      nameAr: 'محسّن للقراءة',
      description: `مصمم خصيصًا لنمط قراءتك وتفاعلك (${Math.round(pattern.engagementMetrics.averageEngagement)}% تفاعل)`,
      confidence: Math.round(pattern.engagementMetrics.averageEngagement),
      colors: {
        ...readingColors,
        secondary: 'oklch(0.92 0.02 200)',
        secondaryForeground: 'oklch(0.2 0.05 200)',
        muted: 'oklch(0.94 0.02 200)',
        mutedForeground: 'oklch(0.4 0.05 200)',
        border: 'oklch(0.88 0.03 200)',
        destructive: 'oklch(0.6 0.25 15)',
        destructiveForeground: 'oklch(1 0 0)',
        card: readingColors.background || 'oklch(0.97 0.01 200)',
        cardForeground: readingColors.foreground || 'oklch(0.1 0 0)',
        popover: readingColors.background || 'oklch(0.99 0 0)',
        popoverForeground: readingColors.foreground || 'oklch(0.1 0 0)',
        primary: readingColors.primary,
        primaryForeground: 'oklch(1 0 0)',
        accent: readingColors.accent,
        accentForeground: 'oklch(1 0 0)',
        background: readingColors.background || 'oklch(0.98 0.01 200)',
        foreground: readingColors.foreground || 'oklch(0.15 0.02 200)',
      },
      reasoning: [
        `تفاعل عالي (${Math.round(pattern.engagementMetrics.averageEngagement)}%) يتطلب ألوان واضحة`,
        `تباين ${pattern.visualPreferences.contrastSensitivity === 'high' ? 'عالي' : 'متوسط'} للراحة البصرية`,
        `محسّن لعمق التمرير ${Math.round(pattern.contentPreferences.scrollDepth)}%`
      ],
      basedOn: [
        { pattern: 'مستوى التفاعل', strength: pattern.engagementMetrics.averageEngagement },
        { pattern: 'عمق التمرير', strength: pattern.contentPreferences.scrollDepth }
      ]
    });

    // Theme 3: Device-optimized theme
    const isPrimaryMobile = pattern.deviceUsage.mobile > 50;
    const deviceColors = isPrimaryMobile 
      ? (pattern.visualPreferences.brightness === 'dim' 
         ? colorPalettes.night.warm 
         : colorPalettes.morning.warm)
      : colorPalettes.morning.cool;
    
    themes.push({
      id: `device-optimized-${userId}-${Date.now()}`,
      name: 'Device-Optimized',
      nameAr: isPrimaryMobile ? 'محسّن للجوال' : 'محسّن للحاسوب',
      description: `مصمم خصيصًا لاستخدامك الأساسي على ${isPrimaryMobile ? 'الجوال' : 'الحاسوب'} (${Math.round(isPrimaryMobile ? pattern.deviceUsage.mobile : pattern.deviceUsage.desktop)}%)`,
      confidence: Math.round(isPrimaryMobile ? pattern.deviceUsage.mobile : pattern.deviceUsage.desktop),
      colors: {
        ...deviceColors,
        secondary: 'oklch(0.92 0.02 160)',
        secondaryForeground: 'oklch(0.2 0.05 160)',
        muted: 'oklch(0.94 0.02 160)',
        mutedForeground: 'oklch(0.4 0.05 160)',
        border: 'oklch(0.88 0.03 160)',
        destructive: 'oklch(0.6 0.25 15)',
        destructiveForeground: 'oklch(1 0 0)',
        card: deviceColors.background || 'oklch(0.97 0.01 160)',
        cardForeground: deviceColors.foreground || 'oklch(0.1 0 0)',
        popover: deviceColors.background || 'oklch(0.99 0 0)',
        popoverForeground: deviceColors.foreground || 'oklch(0.1 0 0)',
        primary: deviceColors.primary,
        primaryForeground: 'oklch(1 0 0)',
        accent: deviceColors.accent,
        accentForeground: 'oklch(1 0 0)',
        background: deviceColors.background || 'oklch(0.98 0.01 160)',
        foreground: deviceColors.foreground || 'oklch(0.15 0.02 160)',
      },
      reasoning: [
        `استخدام ${isPrimaryMobile ? 'الجوال' : 'الحاسوب'} بنسبة ${Math.round(isPrimaryMobile ? pattern.deviceUsage.mobile : pattern.deviceUsage.desktop)}%`,
        `ألوان محسّنة لشاشات ${isPrimaryMobile ? 'الأجهزة المحمولة' : 'أجهزة الكمبيوتر'}`,
        `إضاءة ${pattern.visualPreferences.brightness} للراحة البصرية`
      ],
      basedOn: [
        { pattern: 'نوع الجهاز المفضل', strength: isPrimaryMobile ? pattern.deviceUsage.mobile : pattern.deviceUsage.desktop },
        { pattern: 'تفضيل الإضاءة', strength: 70 }
      ]
    });

    setTimeout(() => {
      setGeneratedThemes(themes);
      setUserGeneratedThemes(prev => [...prev, ...themes]);
      setIsGenerating(false);
      toast.success(`تم توليد ${themes.length} ثيمات ذكية بناءً على سلوك قراءتك!`);
    }, 3000);
    } catch (error) {
      console.error('Error generating intelligent themes:', error);
      setIsGenerating(false);
      toast.error('حدث خطأ في توليد الثيمات الذكية');
    }
  };

  // Apply generated theme
  const applyGeneratedTheme = (theme: GeneratedTheme) => {
    setTheme(theme.colors);
    setSelectedTheme(theme.id);
    
    if (onThemeGenerated) {
      const themePreset: ThemePreset = {
        id: theme.id,
        name: theme.name,
        nameAr: theme.nameAr,
        description: theme.description,
        category: 'modern',
        colors: theme.colors
      };
      onThemeGenerated(themePreset);
    }
    
    toast.success(`تم تطبيق الثيم "${theme.nameAr}" بنجاح!`);
  };

  // Initialize behavior analysis
  useEffect(() => {
    if (userId) {
      analyzeReadingBehavior().then(pattern => {
        setBehaviorPattern(pattern);
      });
    }
  }, [userId, readingSessions]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">مولد الثيمات الذكي</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          يحلل نظامنا الذكي سلوك قراءتك وتفاعلك لتوليد ثيمات مخصصة تناسب احتياجاتك البصرية والوظيفية
        </p>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="gap-2">
            <Eye className="w-4 h-4" />
            تحليل السلوك
          </TabsTrigger>
          <TabsTrigger value="generation" className="gap-2">
            <Sparkle className="w-4 h-4" />
            توليد الثيمات
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2">
            <Palette className="w-4 h-4" />
            الثيمات المولدة
          </TabsTrigger>
        </TabsList>

        {/* Behavior Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="text-primary" />
                تحليل سلوك القراءة
              </CardTitle>
              <CardDescription>
                تحليل شامل لعادات القراءة والتفاعل الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Brain className="w-12 h-12 mx-auto text-primary animate-pulse" />
                    <p className="text-lg font-medium">يتم تحليل سلوكك في القراءة...</p>
                    <Progress value={33} className="w-64" />
                  </div>
                </div>
              ) : behaviorPattern && behaviorPattern.timePreferences ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Time Preferences */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      تفضيلات الوقت
                    </h4>
                    <div className="space-y-2">
                      {safeExecute(
                        () => Object.entries(behaviorPattern.timePreferences || {}),
                        [],
                        'Failed to load time preferences'
                      ).map(([time, percentage]) => (
                        <div key={time} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {time === 'morning' && <Coffee className="w-4 h-4 text-orange-500" />}
                            {time === 'afternoon' && <Sun className="w-4 h-4 text-yellow-500" />}
                            {time === 'evening' && <Sun className="w-4 h-4 text-orange-600" />}
                            {time === 'night' && <Moon className="w-4 h-4 text-blue-500" />}
                            <span className="text-sm">
                              {time === 'morning' ? 'الصباح' : 
                               time === 'afternoon' ? 'الظهيرة' : 
                               time === 'evening' ? 'المساء' : 'الليل'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage || 0} className="w-20" />
                            <span className="text-xs font-medium">{safeDisplayValue(Math.round(percentage || 0))}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Usage */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      استخدام الأجهزة
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الجوال</span>
                        <div className="flex items-center gap-2">
                          <Progress value={behaviorPattern.deviceUsage.mobile} className="w-20" />
                          <span className="text-xs font-medium">{Math.round(behaviorPattern.deviceUsage.mobile)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الحاسوب</span>
                        <div className="flex items-center gap-2">
                          <Progress value={behaviorPattern.deviceUsage.desktop} className="w-20" />
                          <span className="text-xs font-medium">{Math.round(behaviorPattern.deviceUsage.desktop)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      مقاييس التفاعل
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">متوسط التفاعل</span>
                        <Badge>{Math.round(behaviorPattern.engagementMetrics.averageEngagement)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">وقت الذروة</span>
                        <Badge variant="outline">{behaviorPattern.engagementMetrics.peakEngagementTime}:00</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">طول المحتوى المفضل</span>
                        <Badge variant="secondary">
                          {behaviorPattern.engagementMetrics.preferredContentLength === 'short' ? 'قصير' :
                           behaviorPattern.engagementMetrics.preferredContentLength === 'medium' ? 'متوسط' : 'طويل'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Visual Preferences */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      التفضيلات البصرية
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">حساسية التباين</span>
                        <Badge variant={behaviorPattern.visualPreferences.contrastSensitivity === 'high' ? 'default' : 'outline'}>
                          {behaviorPattern.visualPreferences.contrastSensitivity === 'high' ? 'عالي' : 
                           behaviorPattern.visualPreferences.contrastSensitivity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">درجة حرارة اللون</span>
                        <Badge variant="secondary">
                          {behaviorPattern.visualPreferences.colorTemperature === 'warm' ? 'دافئ' :
                           behaviorPattern.visualPreferences.colorTemperature === 'cool' ? 'بارد' : 'محايد'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">الإضاءة</span>
                        <Badge variant="outline">
                          {behaviorPattern.visualPreferences.brightness === 'bright' ? 'مضيء' :
                           behaviorPattern.visualPreferences.brightness === 'dim' ? 'خافت' : 'متوسط'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Button onClick={() => analyzeReadingBehavior().then(setBehaviorPattern)}>
                    بدء تحليل سلوك القراءة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Generation Tab */}
        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                توليد الثيمات الذكية
              </CardTitle>
              <CardDescription>
                إنشاء ثيمات مخصصة بناءً على تحليل سلوك القراءة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!behaviorPattern ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    يجب إجراء تحليل سلوك القراءة أولاً قبل توليد الثيمات
                  </p>
                  <Button variant="outline" onClick={() => analyzeReadingBehavior().then(setBehaviorPattern)}>
                    بدء التحليل
                  </Button>
                </div>
              ) : isGenerating ? (
                <div className="text-center py-12">
                  <div className="space-y-4">
                    <Sparkle className="w-12 h-12 mx-auto text-primary animate-spin" />
                    <p className="text-lg font-medium">يتم توليد الثيمات الذكية...</p>
                    <Progress value={66} className="w-64 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      تحليل الأنماط وإنشاء ألوان مخصصة...
                    </p>
                  </div>
                </div>
              ) : generatedThemes.length === 0 ? (
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">محسّن للوقت</h4>
                      <p className="text-sm text-muted-foreground">ثيم مناسب لأوقات قراءتك المفضلة</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">محسّن للقراءة</h4>
                      <p className="text-sm text-muted-foreground">ألوان تعزز التفاعل والراحة البصرية</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Monitor className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">محسّن للجهاز</h4>
                      <p className="text-sm text-muted-foreground">مصمم لجهازك المفضل</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => generateIntelligentThemes(behaviorPattern)}
                    className="gap-2"
                  >
                    <Sparkle className="w-4 h-4" />
                    توليد الثيمات الذكية
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-green-600 font-medium mb-4">
                    ✅ تم توليد {generatedThemes.length} ثيمات ذكية بنجاح!
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => generateIntelligentThemes(behaviorPattern)}
                    className="gap-2"
                  >
                    <Sparkle className="w-4 h-4" />
                    توليد ثيمات جديدة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          {generatedThemes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">لم يتم توليد أي ثيمات بعد</p>
                <Button variant="outline" onClick={() => behaviorPattern && generateIntelligentThemes(behaviorPattern)}>
                  بدء توليد الثيمات
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {generatedThemes.map((theme) => (
                <Card key={theme.id} className={`border-2 ${selectedTheme === theme.id ? 'border-primary' : 'border-border'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {theme.nameAr}
                          <Badge variant="outline">
                            {theme.confidence}% دقة
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {theme.description}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => applyGeneratedTheme(theme)}
                        variant={selectedTheme === theme.id ? "default" : "outline"}
                        className="gap-2"
                      >
                        <Palette className="w-4 h-4" />
                        {selectedTheme === theme.id ? 'مطبق' : 'تطبيق'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Color Preview */}
                    <div className="flex gap-2 mb-4">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: safeProperty(theme.colors, 'primary', '#3b82f6') }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: safeProperty(theme.colors, 'accent', '#f59e0b') }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: safeProperty(theme.colors, 'secondary', '#6b7280') }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: safeProperty(theme.colors, 'background', '#ffffff') }}
                      />
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        سبب التوليد
                      </h5>
                      <ul className="space-y-1">
                        {(theme.reasoning && Array.isArray(theme.reasoning) ? theme.reasoning : ['تم توليد الثيم تلقائياً']).map((reason, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Based On Patterns */}
                    <div>
                      <h5 className="font-medium mb-2">مبني على الأنماط:</h5>
                      <div className="flex flex-wrap gap-2">
                        {(theme.basedOn && Array.isArray(theme.basedOn) ? theme.basedOn : []).map((pattern, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {pattern.pattern} ({Math.round(pattern.strength)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentThemeGenerator;