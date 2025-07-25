import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { safeDateFormat } from '@/lib/utils';
import { 
  Brain,
  Eye,
  Palette,
  Clock,
  Activity,
  TrendingUp,
  Sparkle,
  Target,
  Heart,
  Timer,
  BookOpen,
  Monitor,
  MagicWand,
  CheckCircle,
  Warning,
  Settings,
  PlayCircle,
  StopCircle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { AdaptiveColorLearningSystem } from './AdaptiveColorLearningSystem';

interface AdaptiveLearningDashboardProps {
  userId?: string;
  onSystemToggle?: (enabled: boolean) => void;
}

interface SystemMetrics {
  adaptationsToday: number;
  totalAdaptations: number;
  userSatisfaction: number;
  readingEfficiencyImprovement: number;
  eyeStrainReduction: number;
  systemAccuracy: number;
}

interface AdaptationEvent {
  id: string;
  timestamp: Date;
  context: string;
  reason: string;
  beforeColors: any;
  afterColors: any;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  effectivenessScore: number;
}

export function AdaptiveLearningDashboard({ 
  userId = 'demo-user',
  onSystemToggle 
}: AdaptiveLearningDashboardProps) {
  const { currentTheme } = useTheme();
  
  // System state
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [isLearning, setIsLearning] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // Metrics and data
  const [systemMetrics, setSystemMetrics] = useKV<SystemMetrics>(`adaptive-metrics-${userId}`, {
    adaptationsToday: 7,
    totalAdaptations: 142,
    userSatisfaction: 89,
    readingEfficiencyImprovement: 23,
    eyeStrainReduction: 31,
    systemAccuracy: 87
  });
  
  const [recentAdaptations, setRecentAdaptations] = useKV<AdaptationEvent[]>(`recent-adaptations-${userId}`, [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      context: 'قراءة مقال تقني',
      reason: 'تقليل إجهاد العين في الضوء المنخفض',
      beforeColors: { background: '#ffffff', text: '#000000' },
      afterColors: { background: '#f8f8f8', text: '#2a2a2a' },
      userFeedback: 'positive',
      effectivenessScore: 92
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      context: 'تحرير مقال',
      reason: 'تحسين التباين للتركيز',
      beforeColors: { background: '#f5f5f5', text: '#666666' },
      afterColors: { background: '#ffffff', text: '#333333' },
      userFeedback: 'positive',
      effectivenessScore: 88
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      context: 'قراءة مساء',
      reason: 'تطبيق الوضع الليلي التدريجي',
      beforeColors: { background: '#ffffff', text: '#000000' },
      afterColors: { background: '#1a1a1a', text: '#e8e8e8' },
      userFeedback: 'positive',
      effectivenessScore: 95
    }
  ]);
  
  // Toggle system state
  const handleSystemToggle = (enabled: boolean) => {
    setIsSystemActive(enabled);
    onSystemToggle?.(enabled);
    
    if (enabled) {
      toast.success('تم تفعيل نظام التعلم التكيفي للألوان');
      setIsLearning(true);
      setTimeout(() => setIsLearning(false), 3000);
    } else {
      toast.info('تم إيقاف نظام التعلم التكيفي');
    }
  };
  
  // Simulate learning activity
  const simulateLearning = () => {
    setIsLearning(true);
    
    setTimeout(() => {
      const newAdaptation: AdaptationEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        context: 'محاكاة تعلم',
        reason: 'تكييف تجريبي بناءً على النشاط الحالي',
        beforeColors: currentTheme,
        afterColors: { ...currentTheme, accent: '#4f46e5' },
        effectivenessScore: Math.floor(Math.random() * 20) + 80
      };
      
      setRecentAdaptations(prev => [newAdaptation, ...prev.slice(0, 9)]);
      setSystemMetrics(prev => ({
        ...prev,
        adaptationsToday: prev.adaptationsToday + 1,
        totalAdaptations: prev.totalAdaptations + 1
      }));
      
      setIsLearning(false);
      toast.success('تم تطبيق تكييف تجريبي للألوان');
    }, 2000);
  };
  
  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getContextIcon = (context: string) => {
    if (context.includes('تحرير')) return <BookOpen className="w-4 h-4" />;
    if (context.includes('قراءة')) return <Eye className="w-4 h-4" />;
    if (context.includes('تحليل')) return <Brain className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام التعلم التكيفي للألوان</h1>
          <p className="text-muted-foreground mt-2">
            يتعلم تفضيلاتك ويكيف الألوان تلقائياً لتحسين تجربة القراءة
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSystemActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isSystemActive ? 'نشط' : 'متوقف'}
            </span>
          </div>
          <Switch
            checked={isSystemActive}
            onCheckedChange={handleSystemToggle}
          />
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تكييفات اليوم</p>
                <p className="text-2xl font-bold">{systemMetrics.adaptationsToday}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي التكييفات</p>
                <p className="text-2xl font-bold">{systemMetrics.totalAdaptations}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">رضا المستخدم</p>
                <p className="text-2xl font-bold">{systemMetrics.userSatisfaction}%</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">دقة النظام</p>
                <p className="text-2xl font-bold">{systemMetrics.systemAccuracy}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              تحسينات الأداء
            </CardTitle>
            <CardDescription>
              تأثير النظام على تجربة القراءة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تحسن كفاءة القراءة</span>
                <span className="text-green-600">+{systemMetrics.readingEfficiencyImprovement}%</span>
              </div>
              <Progress value={systemMetrics.readingEfficiencyImprovement} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تقليل إجهاد العين</span>
                <span className="text-blue-600">-{systemMetrics.eyeStrainReduction}%</span>
              </div>
              <Progress value={systemMetrics.eyeStrainReduction} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>دقة التكييف</span>
                <span className="text-purple-600">{systemMetrics.systemAccuracy}%</span>
              </div>
              <Progress value={systemMetrics.systemAccuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              حالة التعلم
            </CardTitle>
            <CardDescription>
              نشاط نظام الذكاء الاصطناعي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">التعلم النشط</span>
              <div className="flex items-center gap-2">
                {isLearning ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600">جاري التعلم...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-blue-600">في الانتظار</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">جمع البيانات</span>
              <Badge variant="secondary">نشط</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">تحليل السلوك</span>
              <Badge variant="secondary">مستمر</Badge>
            </div>
            
            <Button 
              onClick={simulateLearning}
              disabled={isLearning}
              className="w-full gap-2"
              size="sm"
            >
              {isLearning ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {isLearning ? 'جاري التعلم...' : 'محاكاة تعلم'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Adaptations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-accent" />
            التكييفات الأخيرة
          </CardTitle>
          <CardDescription>
            سجل آخر التعديلات التي تم تطبيقها على الألوان
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAdaptations.slice(0, 5).map((adaptation) => (
              <div key={adaptation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getContextIcon(adaptation.context)}
                  <div>
                    <div className="font-medium">{adaptation.reason}</div>
                    <div className="text-sm text-muted-foreground">
                      {adaptation.context} • {safeDateFormat(adaptation.timestamp, 'ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={adaptation.userFeedback === 'positive' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    <span className={getEffectivenessColor(adaptation.effectivenessScore)}>
                      {adaptation.effectivenessScore}%
                    </span>
                  </Badge>
                  {adaptation.userFeedback === 'positive' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed System View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              إعدادات تفصيلية
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetailedView(!showDetailedView)}
            >
              {showDetailedView ? 'إخفاء' : 'عرض'} التفاصيل
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showDetailedView && (
            <AdaptiveColorLearningSystem
              userId={userId}
              isActive={isSystemActive}
              onColorAdaptation={(colors, reason) => {
                console.log('Dashboard - Color adaptation:', { colors, reason });
                toast.success(`تم تكييف الألوان: ${reason}`);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}