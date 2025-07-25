import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Sparkles, 
  BarChart3,
  Eye,
  Heart,
  Share2,
  BookOpen,
  Brain,
  Zap
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { safeToLowerCase } from '@/lib/utils';
import { Article, User } from '@/types';
import { mockArticles, mockCategories } from '@/lib/mockData';

interface RecommendationScore {
  articleId: string;
  score: number;
  factors: {
    engagement: number;
    similarity: number;
    freshness: number;
    categoryMatch: number;
    timeOfDay: number;
    userBehavior: number;
  };
  reason: string;
}

interface UserPreferences {
  userId: string;
  preferredCategories: string[];
  readingTimes: string[];
  engagementPatterns: {
    avgReadTime: number;
    shareRate: number;
    likeRate: number;
    commentRate: number;
  };
  contentTypes: string[];
  lastUpdated: Date;
}

interface PersonalizedRecommendationsProps {
  currentUser?: User;
  articles?: Article[];
  onArticleSelect?: (article: Article) => void;
}

export function PersonalizedRecommendations({ 
  currentUser, 
  articles = mockArticles,
  onArticleSelect 
}: PersonalizedRecommendationsProps) {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useKV<UserPreferences[]>('user-preferences', []);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('personalized');

  // Get current user preferences or create default
  const getCurrentUserPreferences = (): UserPreferences => {
    const userId = currentUser?.id || user?.id || 'default';
    const existing = userPreferences.find(p => p.userId === userId);
    
    if (existing) return existing;
    
    // Create default preferences
    return {
      userId,
      preferredCategories: ['محليات', 'العالم', 'تقنية'],
      readingTimes: ['morning', 'evening'],
      engagementPatterns: {
        avgReadTime: 120,
        shareRate: 0.05,
        likeRate: 0.15,
        commentRate: 0.02
      },
      contentTypes: ['article', 'analysis'],
      lastUpdated: new Date()
    };
  };

  // Calculate article engagement score
  const calculateEngagementScore = (article: Article): number => {
    const analytics = article.analytics;
    if (!analytics) return 0;

    const engagementRate = (analytics.likes + analytics.shares + analytics.comments) / Math.max(analytics.views, 1);
    const readCompletionRate = analytics.readTime > 0 ? Math.min(analytics.readTime / 180, 1) : 0;
    const clickThroughRate = analytics.clickThroughRate || 0;
    
    return (engagementRate * 0.4 + readCompletionRate * 0.4 + clickThroughRate * 0.2) * 100;
  };

  // Calculate content similarity based on category and tags
  const calculateSimilarity = (article: Article, preferences: UserPreferences): number => {
    let similarity = 0;
    
    // Category match
    if (preferences.preferredCategories.includes(article.category?.name || '')) {
      similarity += 0.4;
    }
    
    // Tag overlap
    const userInterests = preferences.preferredCategories.concat(preferences.contentTypes);
    const tagOverlap = article.tags?.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(safeToLowerCase(tag)) || 
        safeToLowerCase(tag).includes(interest.toLowerCase())
      )
    ).length || 0;
    
    similarity += Math.min(tagOverlap * 0.15, 0.6);
    
    return Math.min(similarity, 1) * 100;
  };

  // Calculate freshness score
  const calculateFreshness = (article: Article): number => {
    const now = new Date();
    const articleDate = new Date(article.createdAt);
    const hoursOld = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
    
    // Peak freshness for articles 0-6 hours old, declining after
    if (hoursOld <= 6) return 100;
    if (hoursOld <= 24) return 80 - (hoursOld - 6) * 2;
    if (hoursOld <= 72) return 50 - (hoursOld - 24) * 1;
    return Math.max(10, 50 - hoursOld * 0.5);
  };

  // Calculate time of day relevance
  const calculateTimeRelevance = (preferences: UserPreferences): number => {
    const hour = new Date().getHours();
    const currentPeriod = hour < 11 ? 'morning' : hour < 16 ? 'afternoon' : hour < 20 ? 'evening' : 'night';
    
    return preferences.readingTimes.includes(currentPeriod) ? 100 : 60;
  };

  // Generate AI-powered recommendations
  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const preferences = getCurrentUserPreferences();
      const scores: RecommendationScore[] = [];

      for (const article of articles) {
        if (article.status !== 'published') continue;

        const engagementScore = calculateEngagementScore(article);
        const similarityScore = calculateSimilarity(article, preferences);
        const freshnessScore = calculateFreshness(article);
        const timeRelevance = calculateTimeRelevance(preferences);
        
        // User behavior pattern matching
        const behaviorScore = article.analytics ? 
          Math.min((article.analytics.readTime / preferences.engagementPatterns.avgReadTime) * 100, 100) : 50;

        // Calculate weighted final score
        const finalScore = 
          engagementScore * 0.25 + 
          similarityScore * 0.25 + 
          freshnessScore * 0.2 + 
          timeRelevance * 0.15 + 
          behaviorScore * 0.15;

        // Generate recommendation reason
        let reason = 'مُوصى به بناءً على ';
        const reasons = [];
        
        if (similarityScore > 70) reasons.push('اهتماماتك');
        if (engagementScore > 60) reasons.push('التفاعل العالي');
        if (freshnessScore > 80) reasons.push('الحداثة');
        if (timeRelevance > 80) reasons.push('توقيت القراءة المفضل');
        
        reason += reasons.join(' و ');

        scores.push({
          articleId: article.id,
          score: finalScore,
          factors: {
            engagement: engagementScore,
            similarity: similarityScore,
            freshness: freshnessScore,
            categoryMatch: preferences.preferredCategories.includes(article.category?.name || '') ? 100 : 0,
            timeOfDay: timeRelevance,
            userBehavior: behaviorScore
          },
          reason
        });
      }

      // Sort by score and take top recommendations
      scores.sort((a, b) => b.score - a.score);
      setRecommendations(scores.slice(0, 10));

    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get article by ID
  const getArticleById = (id: string): Article | undefined => {
    return articles.find(a => a.id === id);
  };

  // Generate trending recommendations based on engagement
  const getTrendingRecommendations = (): RecommendationScore[] => {
    return articles
      .filter(a => a.status === 'published')
      .map(article => ({
        articleId: article.id,
        score: calculateEngagementScore(article),
        factors: {
          engagement: calculateEngagementScore(article),
          similarity: 0,
          freshness: calculateFreshness(article),
          categoryMatch: 0,
          timeOfDay: 0,
          userBehavior: 0
        },
        reason: 'مُتداول بكثرة'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  // Get latest articles
  const getLatestRecommendations = (): RecommendationScore[] => {
    return articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map(article => ({
        articleId: article.id,
        score: calculateFreshness(article),
        factors: {
          engagement: 0,
          similarity: 0,
          freshness: calculateFreshness(article),
          categoryMatch: 0,
          timeOfDay: 0,
          userBehavior: 0
        },
        reason: 'جديد'
      }));
  };

  useEffect(() => {
    generateRecommendations();
  }, [articles, selectedTimeSlot]);

  const renderRecommendationCard = (recommendation: RecommendationScore) => {
    const article = getArticleById(recommendation.articleId);
    if (!article) return null;

    return (
      <Card key={recommendation.articleId} className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
                {article.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {article.excerpt}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-xs">
                {Math.round(recommendation.score)}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                {article.category?.name}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Recommendation factors */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-accent" />
                <span>تفاعل: {Math.round(recommendation.factors.engagement)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={12} className="text-primary" />
                <span>تطابق: {Math.round(recommendation.factors.similarity)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                <span>حداثة: {Math.round(recommendation.factors.freshness)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain size={12} className="text-accent" />
                <span>سلوك: {Math.round(recommendation.factors.userBehavior)}%</span>
              </div>
            </div>

            {/* Recommendation reason */}
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              {recommendation.reason}
            </p>

            {/* Article stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {article.analytics?.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {article.analytics?.likes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 size={12} />
                  {article.analytics?.shares || 0}
                </span>
              </div>
              <span>{new Date(article.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={() => onArticleSelect?.(article)}
              >
                <BookOpen size={14} className="ml-1" />
                قراءة
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  // Would trigger recommendation feedback modal
                  toast.info('سيتم فتح نموذج تقييم التوصية');
                }}
                title="تقييم التوصية"
              >
                <Sparkles size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام التوصيات المخصص</h1>
          <p className="text-muted-foreground mt-1">
            محتوى مُوصى به بناءً على تحليل سلوكك وتفضيلاتك
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">الوقت الحالي</SelectItem>
              <SelectItem value="morning">الصباح</SelectItem>
              <SelectItem value="afternoon">بعد الظهر</SelectItem>
              <SelectItem value="evening">المساء</SelectItem>
              <SelectItem value="night">الليل</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateRecommendations} 
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                جاري التحليل...
              </div>
            ) : (
              <>
                <Zap size={16} className="ml-1" />
                تحديث التوصيات
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Brain size={16} />
            مخصص لك
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp size={16} />
            الأكثر تداولاً
          </TabsTrigger>
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock size={16} />
            الأحدث
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-6">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(renderRecommendationCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد توصيات متاحة</h3>
                <p className="text-muted-foreground">
                  ابدأ بقراءة بعض المقالات لنتمكن من تخصيص التوصيات لك
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTrendingRecommendations().map(renderRecommendationCard)}
          </div>
        </TabsContent>

        <TabsContent value="latest" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getLatestRecommendations().map(renderRecommendationCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            نظرة عامة على نمط القراءة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">الأقسام المفضلة</h4>
              <div className="space-y-1">
                {mockCategories.slice(0, 3).map(category => (
                  <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <Progress value={Math.random() * 100} className="w-20 h-2" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">أوقات القراءة النشطة</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">الصباح (6-11)</span>
                  <Progress value={85} className="w-20 h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">المساء (16-20)</span>
                  <Progress value={65} className="w-20 h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">الليل (20-24)</span>
                  <Progress value={40} className="w-20 h-2" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">معدل التفاعل</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">مدة القراءة</span>
                  <Badge variant="secondary">2.5 دقيقة</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">معدل المشاركة</span>
                  <Badge variant="secondary">12%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">معدل الإعجاب</span>
                  <Badge variant="secondary">18%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}