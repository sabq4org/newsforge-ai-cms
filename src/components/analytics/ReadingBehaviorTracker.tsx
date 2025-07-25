import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye,
  Clock,
  Calendar,
  TrendUp,
  Brain,
  Target,
  Heart,
  Share,
  BookOpen,
  Timer,
  ChartLineUp,
  Activity
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { ReadingSession, UserProfile } from '@/types/membership';

interface ReadingBehaviorTrackerProps {
  userId: string;
  article?: Article;
  onBehaviorUpdate?: (behavior: ReadingBehaviorData) => void;
}

interface ReadingBehaviorData {
  sessionDuration: number;
  scrollDepth: number;
  engagementEvents: number;
  readingSpeed: number;
  timeOfDay: number;
  dayOfWeek: number;
  deviceType: 'mobile' | 'desktop';
  interactionPattern: {
    pauseCount: number;
    resumeCount: number;
    backtrackCount: number;
  };
}

interface ReadingInsight {
  type: 'time_preference' | 'content_preference' | 'reading_speed' | 'engagement_pattern';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export function ReadingBehaviorTracker({ userId, article, onBehaviorUpdate }: ReadingBehaviorTrackerProps) {
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [readingSessions, setReadingSessions] = useKV<ReadingSession[]>(`reading-sessions-${userId}`, []);
  const [userProfile, setUserProfile] = useKV<UserProfile>(`user-profile-${userId}`, {
    id: userId,
    preferences: { categories: [], timeSlots: [], contentTypes: [] },
    readingStats: {
      totalArticles: 0,
      totalReadTime: 0,
      avgSessionTime: 0,
      favoriteCategory: '',
      readingStreak: 0,
      lastActiveDate: new Date()
    },
    engagementScore: 0,
    loyaltyTier: 'bronze',
    badges: [],
    dailyMeal: { articles: [], generatedAt: new Date(), consumed: false }
  });

  const [insights, setInsights] = useState<ReadingInsight[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Start tracking reading session
  const startReadingSession = (article: Article) => {
    const session: ReadingSession = {
      id: `session_${Date.now()}`,
      userId,
      article,
      startTime: new Date(),
      duration: 0,
      completion: 0,
      engagement: 0,
      deviceInfo: {
        type: window.innerWidth < 768 ? 'mobile' : 'desktop',
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent
      },
      behaviorData: {
        scrollEvents: [],
        clickEvents: [],
        pauseEvents: [],
        interactionTimeline: []
      }
    };

    setCurrentSession(session);
    setIsTracking(true);
  };

  // End reading session and save data
  const endReadingSession = () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60; // minutes

    const completedSession: ReadingSession = {
      ...currentSession,
      endTime,
      duration,
      completion: calculateCompletion(),
      engagement: calculateEngagement()
    };

    // Save session
    setReadingSessions(prev => [...prev, completedSession]);

    // Update user reading stats
    updateUserStats(completedSession);

    // Generate behavior insights
    generateInsights([...readingSessions, completedSession]);

    setCurrentSession(null);
    setIsTracking(false);

    // Notify parent component
    if (onBehaviorUpdate) {
      onBehaviorUpdate(extractBehaviorData(completedSession));
    }
  };

  // Calculate reading completion percentage
  const calculateCompletion = (): number => {
    if (!currentSession?.article?.content) return 0;
    
    // Mock calculation - in real implementation, this would track actual scroll position
    const sessionDuration = (Date.now() - currentSession.startTime.getTime()) / 1000 / 60;
    const estimatedReadTime = currentSession.article.content.length / 200; // ~200 chars per minute
    
    return Math.min((sessionDuration / estimatedReadTime) * 100, 100);
  };

  // Calculate engagement score
  const calculateEngagement = (): number => {
    if (!currentSession) return 0;
    
    const duration = (Date.now() - currentSession.startTime.getTime()) / 1000 / 60;
    const interactionCount = currentSession.behaviorData?.clickEvents?.length || 0;
    
    // Simple engagement calculation
    const durationScore = Math.min(duration / 5, 1); // Max 5 minutes for full score
    const interactionScore = Math.min(interactionCount / 10, 1); // Max 10 interactions for full score
    
    return (durationScore + interactionScore) / 2 * 100;
  };

  // Update user reading statistics
  const updateUserStats = (session: ReadingSession) => {
    setUserProfile(prev => {
      const newTotalTime = prev.readingStats.totalReadTime + (session.duration || 0);
      const newTotalArticles = prev.readingStats.totalArticles + 1;
      
      return {
        ...prev,
        readingStats: {
          ...prev.readingStats,
          totalArticles: newTotalArticles,
          totalReadTime: newTotalTime,
          avgSessionTime: newTotalTime / newTotalArticles,
          lastActiveDate: new Date()
        },
        engagementScore: prev.engagementScore + (session.engagement || 0) / 10
      };
    });
  };

  // Extract behavior data for analysis
  const extractBehaviorData = (session: ReadingSession): ReadingBehaviorData => {
    const startTime = new Date(session.startTime);
    
    return {
      sessionDuration: session.duration || 0,
      scrollDepth: session.completion || 0,
      engagementEvents: session.behaviorData?.clickEvents?.length || 0,
      readingSpeed: calculateReadingSpeed(session),
      timeOfDay: startTime.getHours(),
      dayOfWeek: startTime.getDay(),
      deviceType: session.deviceInfo?.type || 'desktop',
      interactionPattern: {
        pauseCount: session.behaviorData?.pauseEvents?.length || 0,
        resumeCount: 0, // Would be tracked in real implementation
        backtrackCount: 0 // Would be tracked in real implementation
      }
    };
  };

  // Calculate reading speed
  const calculateReadingSpeed = (session: ReadingSession): number => {
    if (!session.article?.content || !session.duration) return 0;
    
    const wordsRead = (session.article.content.length / 5) * (session.completion || 0) / 100;
    return wordsRead / session.duration; // words per minute
  };

  // Generate reading insights
  const generateInsights = (sessions: ReadingSession[]) => {
    const insights: ReadingInsight[] = [];
    
    // Analyze reading time preferences
    const timeFrequency: Record<number, number> = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      timeFrequency[hour] = (timeFrequency[hour] || 0) + 1;
    });
    
    const preferredHour = Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (preferredHour) {
      insights.push({
        type: 'time_preference',
        title: 'وقت القراءة المفضل',
        description: `تقرأ أكثر في الساعة ${preferredHour[0]}:00`,
        impact: 'high',
        recommendation: 'ننصح بجدولة المحتوى المهم في هذا الوقت'
      });
    }

    // Analyze reading speed
    const avgSpeed = sessions.reduce((sum, session) => 
      sum + calculateReadingSpeed(session), 0) / sessions.length;
    
    if (avgSpeed > 0) {
      insights.push({
        type: 'reading_speed',
        title: 'سرعة القراءة',
        description: `متوسط سرعتك ${Math.round(avgSpeed)} كلمة/دقيقة`,
        impact: 'medium',
        recommendation: avgSpeed > 200 ? 'سرعة ممتازة! يمكنك قراءة محتوى أطول' : 'خذ وقتك في القراءة للفهم الأفضل'
      });
    }

    // Analyze content preferences
    const categoryPrefs: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.article?.category?.name) {
        const cat = session.article.category.name;
        categoryPrefs[cat] = (categoryPrefs[cat] || 0) + (session.engagement || 0);
      }
    });
    
    const topCategory = Object.entries(categoryPrefs)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      insights.push({
        type: 'content_preference',
        title: 'المحتوى المفضل',
        description: `تتفاعل أكثر مع محتوى ${topCategory[0]}`,
        impact: 'high',
        recommendation: 'سنعرض لك المزيد من هذا النوع من المحتوى'
      });
    }

    setInsights(insights);
  };

  // Auto-track when article changes
  useEffect(() => {
    if (article && !isTracking) {
      startReadingSession(article);
    }
    
    return () => {
      if (isTracking) {
        endReadingSession();
      }
    };
  }, [article]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSession) {
        endReadingSession();
      }
    };
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Current Session Status */}
      {isTracking && currentSession && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-primary animate-pulse" />
              جلسة قراءة نشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Timer className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">مدة الجلسة</p>
                <p className="font-medium">
                  {Math.round((Date.now() - currentSession.startTime.getTime()) / 1000 / 60)} دقيقة
                </p>
              </div>
              
              <div className="text-center">
                <Progress value={calculateCompletion()} className="mb-2" />
                <p className="text-sm text-muted-foreground">مدى الإكمال</p>
                <p className="font-medium">{Math.round(calculateCompletion())}%</p>
              </div>
              
              <div className="text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-muted-foreground">التفاعل</p>
                <p className="font-medium">{Math.round(calculateEngagement())}%</p>
              </div>
              
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">الجهاز</p>
                <p className="font-medium">
                  {currentSession.deviceInfo?.type === 'mobile' ? 'جوال' : 'حاسوب'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen />
              إحصائيات القراءة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">المقالات المقروءة</span>
                <span className="font-medium">{userProfile.readingStats.totalArticles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">إجمالي وقت القراءة</span>
                <span className="font-medium">{Math.round(userProfile.readingStats.totalReadTime)} دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">متوسط الجلسة</span>
                <span className="font-medium">{Math.round(userProfile.readingStats.avgSessionTime)} دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">أيام متتالية</span>
                <span className="font-medium">{userProfile.readingStats.readingStreak} يوم</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp />
              الأداء الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">نقاط التفاعل</span>
                  <span className="text-sm">{Math.round(userProfile.engagementScore)}</span>
                </div>
                <Progress value={(userProfile.engagementScore % 100)} />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">مستوى الولاء</span>
                  <Badge>{userProfile.loyaltyTier}</Badge>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">الشارات المحصلة</span>
                  <span className="text-sm">{userProfile.badges.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar />
              الجلسات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readingSessions.slice(-5).reverse().map((session, index) => (
                <div key={session.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(session.startTime).toLocaleDateString('ar-SA')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{Math.round(session.duration || 0)}د</span>
                  </div>
                </div>
              ))}
              
              {readingSessions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد جلسات قراءة بعد
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reading Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain />
              رؤى سلوك القراءة
            </CardTitle>
            <CardDescription>
              تحليل ذكي لعادات القراءة وتوصيات للتحسين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant={
                      insight.impact === 'high' ? 'default' :
                      insight.impact === 'medium' ? 'secondary' : 'outline'
                    }>
                      {insight.impact === 'high' ? 'مهم' :
                       insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs">
                      <Target className="w-3 h-3 inline mr-1" />
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLineUp />
            تطور سلوك القراءة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ChartLineUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>رسم بياني لتطور سلوك القراءة</p>
              <p className="text-sm mt-2">سيتم عرض البيانات التفصيلية هنا</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}