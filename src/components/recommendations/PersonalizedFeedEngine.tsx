import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Clock,
  TrendUp,
  Eye,
  Heart,
  BookOpen,
  Calendar,
  Star,
  Target,
  Sparkles,
  TrendingUp,
  Timer,
  Coffee,
  Moon,
  Sunrise
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, ReadingSession, PersonalizationData } from '@/types/membership';
import { Article } from '@/types';
import { toast } from 'sonner';

interface PersonalizedFeedEngineProps {
  userId: string;
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}

// Reading behavior analysis types
interface ReadingPattern {
  preferredTimes: {
    hour: number;
    dayOfWeek: number;
    frequency: number;
  }[];
  sessionDuration: number;
  contentPreferences: {
    category: string;
    engagement: number;
    completion: number;
  }[];
  deviceUsage: {
    mobile: number;
    desktop: number;
  };
}

interface RecommendationScore {
  articleId: string;
  score: number;
  factors: {
    timeRelevance: number;
    categoryMatch: number;
    readingBehavior: number;
    engagement: number;
    novelty: number;
  };
  explanation: string;
}

export function PersonalizedFeedEngine({ userId, articles, onArticleSelect }: PersonalizedFeedEngineProps) {
  const [userProfile, setUserProfile] = useKV<UserProfile>(`user-profile-${userId}`, {
    id: userId,
    preferences: {
      categories: [],
      timeSlots: [],
      contentTypes: []
    },
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
    dailyMeal: {
      articles: [],
      generatedAt: new Date(),
      consumed: false
    }
  });

  const [readingSessions] = useKV<ReadingSession[]>(`reading-sessions-${userId}`, []);
  const [personalizationData] = useKV<PersonalizationData>(`personalization-${userId}`, {
    readingPattern: {
      preferredTimes: [],
      sessionDuration: 0,
      contentPreferences: [],
      deviceUsage: { mobile: 0, desktop: 0 }
    },
    behaviorScore: 0,
    lastAnalysis: new Date()
  });

  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze reading behavior patterns
  const analyzeReadingBehavior = async (): Promise<ReadingPattern> => {
    const sessions = readingSessions.slice(-100); // Last 100 sessions
    
    // Analyze preferred reading times
    const timeFrequency: Record<string, number> = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const dayOfWeek = new Date(session.startTime).getDay();
      const key = `${hour}-${dayOfWeek}`;
      timeFrequency[key] = (timeFrequency[key] || 0) + 1;
    });

    const preferredTimes = Object.entries(timeFrequency)
      .map(([key, frequency]) => {
        const [hour, dayOfWeek] = key.split('-').map(Number);
        return { hour, dayOfWeek, frequency };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Calculate average session duration
    const avgSessionDuration = sessions.reduce((sum, session) => {
      return sum + (session.duration || 0);
    }, 0) / sessions.length;

    // Analyze content preferences
    const categoryEngagement: Record<string, { views: number, completion: number, engagement: number }> = {};
    
    sessions.forEach(session => {
      if (session.article?.category?.name) {
        const cat = session.article.category.name;
        if (!categoryEngagement[cat]) {
          categoryEngagement[cat] = { views: 0, completion: 0, engagement: 0 };
        }
        categoryEngagement[cat].views++;
        categoryEngagement[cat].completion += session.completion || 0;
        categoryEngagement[cat].engagement += session.engagement || 0;
      }
    });

    const contentPreferences = Object.entries(categoryEngagement)
      .map(([category, stats]) => ({
        category,
        engagement: stats.engagement / stats.views,
        completion: stats.completion / stats.views
      }))
      .sort((a, b) => (b.engagement + b.completion) - (a.engagement + a.completion));

    return {
      preferredTimes,
      sessionDuration: avgSessionDuration,
      contentPreferences,
      deviceUsage: { mobile: 0.6, desktop: 0.4 } // Mock data
    };
  };

  // Generate personalized recommendations using AI-like scoring
  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    
    try {
      const behaviorPattern = await analyzeReadingBehavior();
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      
      const scored = articles.map(article => {
        // Time relevance score (0-1)
        const timeRelevance = calculateTimeRelevance(behaviorPattern, currentHour, currentDay);
        
        // Category preference score (0-1)
        const categoryMatch = calculateCategoryMatch(behaviorPattern, article);
        
        // Reading behavior compatibility (0-1)
        const readingBehavior = calculateReadingBehaviorMatch(behaviorPattern, article);
        
        // User engagement history with similar content (0-1)
        const engagement = calculateEngagementScore(article);
        
        // Novelty factor - balance between familiar and new content (0-1)
        const novelty = calculateNoveltyScore(article, userProfile);
        
        // Weighted final score
        const score = (
          timeRelevance * 0.2 +
          categoryMatch * 0.3 +
          readingBehavior * 0.2 +
          engagement * 0.2 +
          novelty * 0.1
        );

        return {
          articleId: article.id,
          score,
          factors: {
            timeRelevance,
            categoryMatch,
            readingBehavior,
            engagement,
            novelty
          },
          explanation: generateExplanation(article, {
            timeRelevance,
            categoryMatch,
            readingBehavior,
            engagement,
            novelty
          })
        };
      }).sort((a, b) => b.score - a.score);

      setRecommendations(scored);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('حدث خطأ في توليد التوصيات');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions for scoring
  const calculateTimeRelevance = (pattern: ReadingPattern, hour: number, day: number): number => {
    const timeMatch = pattern.preferredTimes.find(pt => 
      Math.abs(pt.hour - hour) <= 1 && pt.dayOfWeek === day
    );
    return timeMatch ? Math.min(timeMatch.frequency / 10, 1) : 0.1;
  };

  const calculateCategoryMatch = (pattern: ReadingPattern, article: Article): number => {
    const categoryPref = pattern.contentPreferences.find(cp => 
      cp.category === article.category?.name
    );
    return categoryPref ? (categoryPref.engagement + categoryPref.completion) / 2 : 0.3;
  };

  const calculateReadingBehaviorMatch = (pattern: ReadingPattern, article: Article): number => {
    // Estimate reading time and match with user's session patterns
    const estimatedReadTime = (article.content?.length || 1000) / 200; // ~200 chars per minute
    const sessionCompatibility = Math.abs(pattern.sessionDuration - estimatedReadTime) < 5 ? 0.8 : 0.4;
    return sessionCompatibility;
  };

  const calculateEngagementScore = (article: Article): number => {
    const analytics = article.analytics;
    if (!analytics) return 0.5;
    
    // Normalize engagement metrics
    const viewsScore = Math.min(analytics.views / 1000, 1);
    const likesScore = Math.min(analytics.likes / 100, 1);
    const sharesScore = Math.min(analytics.shares / 50, 1);
    
    return (viewsScore + likesScore + sharesScore) / 3;
  };

  const calculateNoveltyScore = (article: Article, profile: UserProfile): number => {
    // Check if user has read similar content recently
    const categoryFamiliarity = profile.preferences.categories.includes(article.category?.name || '') ? 0.7 : 0.9;
    const recencyBonus = (Date.now() - new Date(article.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) ? 0.8 : 0.5;
    
    return (categoryFamiliarity + recencyBonus) / 2;
  };

  const generateExplanation = (article: Article, factors: RecommendationScore['factors']): string => {
    const reasons = [];
    
    if (factors.timeRelevance > 0.6) {
      reasons.push('يناسب وقت القراءة المفضل لديك');
    }
    
    if (factors.categoryMatch > 0.7) {
      reasons.push(`من اهتماماتك المفضلة (${article.category?.name})`);
    }
    
    if (factors.engagement > 0.6) {
      reasons.push('محتوى شائع ومتفاعل معه');
    }
    
    if (factors.novelty > 0.7) {
      reasons.push('محتوى جديد ومتنوع');
    }
    
    return reasons.length > 0 ? reasons.join(' • ') : 'توصية مخصصة لك';
  };

  // Get current reading context
  const getCurrentContext = () => {
    const now = new Date();
    const hour = now.getHours();
    
    let timeContext = '';
    if (hour < 9) timeContext = 'الصباح الباكر';
    else if (hour < 12) timeContext = 'الصباح';
    else if (hour < 17) timeContext = 'بعد الظهر';
    else if (hour < 21) timeContext = 'المساء';
    else timeContext = 'الليل';
    
    return { timeContext, hour, day: now.getDay() };
  };

  useEffect(() => {
    if (articles.length > 0 && userId) {
      generateRecommendations();
    }
  }, [articles, userId]);

  const context = getCurrentContext();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary" />
            التوصيات الذكية المخصصة
          </h1>
          <p className="text-muted-foreground mt-2">
            محتوى مخصص بناءً على سلوك القراءة والوقت المفضل
          </p>
        </div>
        
        <Button 
          onClick={generateRecommendations}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? <Timer className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? 'يحلل...' : 'تحديث التوصيات'}
        </Button>
      </div>

      {/* Current Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock />
            السياق الحالي للقراءة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {context.hour < 9 ? <Sunrise /> : 
               context.hour < 17 ? <Coffee /> : <Moon />}
              <span>وقت القراءة: {context.timeContext}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar />
              <span>اليوم: {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][context.day]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target />
              <span>توصيات متاحة: {recommendations.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personalized" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personalized">التوصيات المخصصة</TabsTrigger>
          <TabsTrigger value="analytics">تحليل السلوك</TabsTrigger>
          <TabsTrigger value="preferences">إعدادات التخصيص</TabsTrigger>
        </TabsList>

        {/* Personalized Recommendations */}
        <TabsContent value="personalized" className="space-y-4">
          {isAnalyzing ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Timer className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">يحلل سلوك القراءة...</h3>
                <p className="text-muted-foreground">
                  جاري تحليل تفضيلاتك وسلوك القراءة لتوليد توصيات مخصصة
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.slice(0, 10).map((rec, index) => {
                const article = articles.find(a => a.id === rec.articleId);
                if (!article) return null;

                return (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {(rec.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Badge>{article.category?.name}</Badge>
                      </div>

                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>

                      {/* Recommendation factors */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span>توافق الوقت</span>
                          <Progress value={rec.factors.timeRelevance * 100} className="w-20 h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>توافق الاهتمامات</span>
                          <Progress value={rec.factors.categoryMatch * 100} className="w-20 h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>سلوك القراءة</span>
                          <Progress value={rec.factors.readingBehavior * 100} className="w-20 h-2" />
                        </div>
                      </div>

                      <div className="bg-muted/30 p-3 rounded-lg mb-3">
                        <p className="text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {rec.explanation}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span>{article.analytics?.views || 0}</span>
                          <Heart className="w-3 h-3" />
                          <span>{article.analytics?.likes || 0}</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => onArticleSelect(article)}
                          className="gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          اقرأ الآن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Behavior Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock />
                  أوقات القراءة المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalizationData.readingPattern?.preferredTimes?.slice(0, 5).map((time, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {time.hour}:00 - {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][time.dayOfWeek]}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={(time.frequency / 10) * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{time.frequency}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لا توجد بيانات كافية لتحليل أوقات القراءة
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp />
                  تفضيلات المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalizationData.readingPattern?.contentPreferences?.slice(0, 5).map((pref, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{pref.category}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={pref.engagement * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {(pref.engagement * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لا توجد بيانات كافية لتحليل تفضيلات المحتوى
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp />
                إحصائيات القراءة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userProfile.readingStats.totalArticles}</p>
                  <p className="text-sm text-muted-foreground">مقال مقروء</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(userProfile.readingStats.avgSessionTime || 0)}</p>
                  <p className="text-sm text-muted-foreground">دقائق متوسط الجلسة</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userProfile.readingStats.readingStreak}</p>
                  <p className="text-sm text-muted-foreground">أيام متتالية</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userProfile.engagementScore}</p>
                  <p className="text-sm text-muted-foreground">نقاط التفاعل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التخصيص</CardTitle>
              <CardDescription>
                اضبط تفضيلاتك للحصول على توصيات أكثر دقة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">أوقات القراءة المفضلة</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['الصباح الباكر', 'الصباح', 'بعد الظهر', 'المساء', 'الليل'].map(time => (
                    <Button key={time} variant="outline" size="sm">
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">طول المحتوى المفضل</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['قصير (أقل من 3 دقائق)', 'متوسط (3-7 دقائق)', 'طويل (أكثر من 7 دقائق)'].map(length => (
                    <Button key={length} variant="outline" size="sm">
                      {length}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}