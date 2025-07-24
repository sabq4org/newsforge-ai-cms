import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  BookOpen,
  Star,
  ThumbsUp,
  Eye,
  Share2,
  Settings,
  RefreshCw,
  Sparkles
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface RecommendationScore {
  articleId: string;
  score: number;
  reasons: string[];
  confidence: number;
  category: 'trending' | 'personalized' | 'similar' | 'editorial';
}

interface RecommendationEngineProps {
  currentArticleId?: string;
  userId?: string;
  onArticleSelect: (article: Article) => void;
}

interface UserPreferences {
  categories: string[];
  readingTime: 'short' | 'medium' | 'long';
  contentTypes: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  language: 'ar' | 'en';
}

interface EngineSettings {
  personalizedWeight: number;
  trendingWeight: number;
  similarityWeight: number;
  editorialWeight: number;
  diversityFactor: number;
  recencyBoost: number;
}

export function AIRecommendationEngine({ 
  currentArticleId, 
  userId, 
  onArticleSelect 
}: RecommendationEngineProps) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [userPreferences, setUserPreferences] = useKV<UserPreferences>('user-preferences', {
    categories: ['سياسة', 'تقنية'],
    readingTime: 'medium',
    contentTypes: ['أخبار', 'تحليل'],
    timeOfDay: 'evening',
    language: 'ar'
  });
  
  const [engineSettings, setEngineSettings] = useKV<EngineSettings>('recommendation-settings', {
    personalizedWeight: 40,
    trendingWeight: 30,
    similarityWeight: 20,
    editorialWeight: 10,
    diversityFactor: 0.3,
    recencyBoost: 0.2
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('recommendations');

  // Simulate user reading behavior data
  const [userBehavior] = useKV('user-behavior', {
    readArticles: ['article_1', 'article_2'],
    likedArticles: ['article_1'],
    sharedArticles: ['article_2'],
    averageReadTime: 180, // seconds
    preferredCategories: ['تقنية', 'سياسة'],
    readingPeakHours: [20, 21, 22] // 8-10 PM
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const scores: RecommendationScore[] = [];
      
      for (const article of articles) {
        if (article.id === currentArticleId) continue;
        
        let totalScore = 0;
        const reasons: string[] = [];
        
        // 1. Personalized scoring based on user preferences
        const personalizedScore = calculatePersonalizedScore(article);
        totalScore += personalizedScore * (engineSettings.personalizedWeight / 100);
        if (personalizedScore > 0.6) {
          reasons.push('يتماشى مع اهتماماتك');
        }
        
        // 2. Trending score based on recent engagement
        const trendingScore = calculateTrendingScore(article);
        totalScore += trendingScore * (engineSettings.trendingWeight / 100);
        if (trendingScore > 0.7) {
          reasons.push('رائج حالياً');
        }
        
        // 3. Content similarity if current article exists
        let similarityScore = 0;
        if (currentArticleId) {
          similarityScore = await calculateSimilarityScore(article, currentArticleId);
          totalScore += similarityScore * (engineSettings.similarityWeight / 100);
          if (similarityScore > 0.6) {
            reasons.push('مشابه للمقال الحالي');
          }
        }
        
        // 4. Editorial priority
        const editorialScore = calculateEditorialScore(article);
        totalScore += editorialScore * (engineSettings.editorialWeight / 100);
        if (editorialScore > 0.8) {
          reasons.push('أولوية تحريرية');
        }
        
        // 5. Apply recency boost
        const recencyScore = calculateRecencyScore(article);
        totalScore += recencyScore * engineSettings.recencyBoost;
        
        // 6. Determine category
        let category: RecommendationScore['category'] = 'personalized';
        if (trendingScore > 0.7) category = 'trending';
        else if (similarityScore > 0.6) category = 'similar';
        else if (editorialScore > 0.8) category = 'editorial';
        
        scores.push({
          articleId: article.id,
          score: Math.min(totalScore, 1),
          reasons,
          confidence: calculateConfidence(totalScore, reasons.length),
          category
        });
      }
      
      // Apply diversity factor and sort
      const diversifiedScores = applyDiversityFactor(scores);
      const sortedRecommendations = diversifiedScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);
      
      setRecommendations(sortedRecommendations);
      toast.success('تم إنشاء التوصيات بنجاح');
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('خطأ في إنشاء التوصيات');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatePersonalizedScore = (article: Article): number => {
    let score = 0;
    
    // Category preference
    if (userPreferences.categories.includes(article.category?.name || '')) {
      score += 0.4;
    }
    
    // Reading time preference
    const wordCount = article.content.split(' ').length;
    const estimatedReadTime = wordCount / 200; // words per minute
    
    if (userPreferences.readingTime === 'short' && estimatedReadTime < 3) score += 0.3;
    else if (userPreferences.readingTime === 'medium' && estimatedReadTime >= 3 && estimatedReadTime <= 8) score += 0.3;
    else if (userPreferences.readingTime === 'long' && estimatedReadTime > 8) score += 0.3;
    
    // Language preference
    if (article.language === userPreferences.language) {
      score += 0.2;
    }
    
    // Previous engagement
    if (userBehavior.likedArticles.includes(article.id)) score += 0.1;
    
    return Math.min(score, 1);
  };

  const calculateTrendingScore = (article: Article): number => {
    const analytics = article.analytics;
    if (!analytics) return 0;
    
    // Normalize engagement metrics
    const viewsScore = Math.min(analytics.views / 10000, 1);
    const likesScore = Math.min(analytics.likes / 1000, 1);
    const sharesScore = Math.min(analytics.shares / 500, 1);
    const ctrScore = analytics.clickThroughRate || 0;
    
    return (viewsScore * 0.3 + likesScore * 0.3 + sharesScore * 0.3 + ctrScore * 0.1);
  };

  const calculateSimilarityScore = async (article: Article, currentId: string): Promise<number> => {
    const currentArticle = articles.find(a => a.id === currentId);
    if (!currentArticle) return 0;
    
    // Simple content similarity using AI
    try {
      const prompt = spark.llmPrompt`
        Compare these two Arabic articles and return a similarity score between 0 and 1:
        
        Article 1: "${currentArticle.title}" - ${currentArticle.excerpt}
        Article 2: "${article.title}" - ${article.excerpt}
        
        Consider: topic similarity, category match, keyword overlap.
        Return only a number between 0 and 1.
      `;
      
      const result = await spark.llm(prompt, 'gpt-4o-mini');
      const score = parseFloat(result.trim());
      return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 1);
    } catch {
      // Fallback: category and tag similarity
      const categoryMatch = article.category?.name === currentArticle.category?.name ? 0.5 : 0;
      const tagOverlap = article.tags?.filter(tag => 
        currentArticle.tags?.some(ctag => ctag.name === tag.name)
      ).length || 0;
      const tagScore = Math.min(tagOverlap * 0.2, 0.5);
      
      return categoryMatch + tagScore;
    }
  };

  const calculateEditorialScore = (article: Article): number => {
    let score = 0;
    
    // Priority level
    if (article.priority === 'urgent') score += 0.5;
    else if (article.priority === 'high') score += 0.3;
    else if (article.priority === 'normal') score += 0.1;
    
    // Status consideration
    if (article.status === 'published') score += 0.3;
    else if (article.status === 'scheduled') score += 0.2;
    
    // Featured content
    if (article.featuredImage) score += 0.2;
    
    return Math.min(score, 1);
  };

  const calculateRecencyScore = (article: Article): number => {
    const now = new Date();
    const articleDate = new Date(article.createdAt);
    const hoursDiff = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
    
    // Recent articles get higher scores, declining over time
    if (hoursDiff < 1) return 1;
    if (hoursDiff < 6) return 0.8;
    if (hoursDiff < 24) return 0.6;
    if (hoursDiff < 72) return 0.4;
    return 0.2;
  };

  const calculateConfidence = (score: number, reasonsCount: number): number => {
    const baseConfidence = score;
    const reasonsBonus = Math.min(reasonsCount * 0.1, 0.3);
    return Math.min(baseConfidence + reasonsBonus, 1);
  };

  const applyDiversityFactor = (scores: RecommendationScore[]): RecommendationScore[] => {
    // Group by category and ensure diversity
    const categories = new Set(scores.map(s => {
      const article = articles.find(a => a.id === s.articleId);
      return article?.category?.name || 'أخرى';
    }));
    
    const diversified: RecommendationScore[] = [];
    const categoryLimits = Math.ceil(12 / categories.size);
    
    categories.forEach(category => {
      const categoryScores = scores
        .filter(s => {
          const article = articles.find(a => a.id === s.articleId);
          return article?.category?.name === category;
        })
        .slice(0, categoryLimits);
      
      diversified.push(...categoryScores);
    });
    
    return diversified;
  };

  const getRecommendationsByCategory = (category: RecommendationScore['category']) => {
    return recommendations.filter(r => r.category === category);
  };

  const renderArticleCard = (recommendation: RecommendationScore) => {
    const article = articles.find(a => a.id === recommendation.articleId);
    if (!article) return null;

    return (
      <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {recommendation.category === 'trending' && 'رائج'}
                  {recommendation.category === 'personalized' && 'مخصص'}
                  {recommendation.category === 'similar' && 'مشابه'}
                  {recommendation.category === 'editorial' && 'تحريري'}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(recommendation.score * 100)}%
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {article.title}
              </h3>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {recommendation.reasons.map((reason, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{article.category?.name}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.analytics?.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {article.analytics?.likes || 0}
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onArticleSelect(article)}
              >
                عرض المقال
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    generateRecommendations();
  }, [currentArticleId, userPreferences, engineSettings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">محرك التوصيات الذكي</h1>
            <p className="text-muted-foreground">توصيات مقالات مدعومة بالذكاء الاصطناعي</p>
          </div>
        </div>
        
        <Button 
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          إنشاء توصيات جديدة
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {/* Trending Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  المقالات الرائجة
                </CardTitle>
                <CardDescription>
                  المقالات الأكثر تفاعلاً حالياً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecommendationsByCategory('trending').slice(0, 6).map(renderArticleCard)}
                </div>
              </CardContent>
            </Card>

            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  توصيات مخصصة
                </CardTitle>
                <CardDescription>
                  مقالات مختارة بناء على اهتماماتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecommendationsByCategory('personalized').slice(0, 6).map(renderArticleCard)}
                </div>
              </CardContent>
            </Card>

            {/* Similar Content */}
            {currentArticleId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    مقالات مشابهة
                  </CardTitle>
                  <CardDescription>
                    مقالات ذات صلة بالمقال الحالي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getRecommendationsByCategory('similar').slice(0, 6).map(renderArticleCard)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">دقة التوصيات</p>
                    <p className="text-2xl font-bold">85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">معدل النقر</p>
                    <p className="text-2xl font-bold">12.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">وقت القراءة</p>
                    <p className="text-2xl font-bold">3.2 د</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">معدل المشاركة</p>
                    <p className="text-2xl font-bold">8.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>أداء التوصيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>التوصيات المخصصة</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>المحتوى الرائج</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>المقالات المشابهة</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>الأولوية التحريرية</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفضيلات المستخدم</CardTitle>
              <CardDescription>
                خصص التوصيات حسب اهتماماتك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الفئات المفضلة</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['سياسة', 'تقنية', 'رياضة', 'اقتصاد', 'ثقافة', 'صحة'].map((category) => (
                    <Badge
                      key={category}
                      variant={userPreferences.categories.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserPreferences(prev => ({
                          ...prev,
                          categories: prev.categories.includes(category)
                            ? prev.categories.filter(c => c !== category)
                            : [...prev.categories, category]
                        }));
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>مدة القراءة المفضلة</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'short', label: 'قصيرة (أقل من 3 دقائق)' },
                    { value: 'medium', label: 'متوسطة (3-8 دقائق)' },
                    { value: 'long', label: 'طويلة (أكثر من 8 دقائق)' }
                  ].map((option) => (
                    <Badge
                      key={option.value}
                      variant={userPreferences.readingTime === option.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserPreferences(prev => ({
                          ...prev,
                          readingTime: option.value as UserPreferences['readingTime']
                        }));
                      }}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>وقت القراءة المفضل</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'morning', label: 'صباحاً' },
                    { value: 'afternoon', label: 'بعد الظهر' },
                    { value: 'evening', label: 'مساءً' }
                  ].map((option) => (
                    <Badge
                      key={option.value}
                      variant={userPreferences.timeOfDay === option.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserPreferences(prev => ({
                          ...prev,
                          timeOfDay: option.value as UserPreferences['timeOfDay']
                        }));
                      }}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المحرك</CardTitle>
              <CardDescription>
                تخصيص أوزان خوارزمية التوصيات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>وزن التخصيص الشخصي ({engineSettings.personalizedWeight}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.personalizedWeight}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      personalizedWeight: parseInt(e.target.value)
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وزن المحتوى الرائج ({engineSettings.trendingWeight}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.trendingWeight}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      trendingWeight: parseInt(e.target.value)
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وزن التشابه ({engineSettings.similarityWeight}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.similarityWeight}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      similarityWeight: parseInt(e.target.value)
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وزن الأولوية التحريرية ({engineSettings.editorialWeight}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.editorialWeight}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      editorialWeight: parseInt(e.target.value)
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>عامل التنوع ({(engineSettings.diversityFactor * 100).toFixed(0)}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.diversityFactor * 100}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      diversityFactor: parseInt(e.target.value) / 100
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>تعزيز الحداثة ({(engineSettings.recencyBoost * 100).toFixed(0)}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={engineSettings.recencyBoost * 100}
                    onChange={(e) => setEngineSettings(prev => ({
                      ...prev,
                      recencyBoost: parseInt(e.target.value) / 100
                    }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateRecommendations}>
                  تطبيق التغييرات
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setEngineSettings({
                    personalizedWeight: 40,
                    trendingWeight: 30,
                    similarityWeight: 20,
                    editorialWeight: 10,
                    diversityFactor: 0.3,
                    recencyBoost: 0.2
                  })}
                >
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}