import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target,
  BookOpen,
  Heart,
  Share,
  Clock,
  Star,
  Lightbulb,
  Eye,
  ThumbsUp,
  MessageSquare
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { PersonalizedRecommendation, UserBehaviorAnalysis } from '@/types/membership';
import { useAIAnalyticsEngine } from './AIAnalyticsEngine';

interface SmartRecommendationDashboardProps {
  userId: string;
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}

export function SmartRecommendationDashboard({ 
  userId, 
  articles, 
  onArticleSelect 
}: SmartRecommendationDashboardProps) {
  const [activeTab, setActiveTab] = useState('recommendations');
  
  const {
    recommendations,
    behaviorAnalysis,
    trackInteraction,
    generatePersonalizedRecommendations,
    getUserSegment,
    markRecommendationViewed,
    markRecommendationClicked
  } = useAIAnalyticsEngine({ 
    userId, 
    articles,
    onRecommendationGenerated: (recs) => {
      console.log('New recommendations generated:', recs);
    }
  });

  const handleArticleClick = (article: Article, recommendationId?: string) => {
    // Track interaction
    trackInteraction({
      userId,
      articleId: article.id,
      action: 'view',
      source: recommendationId ? 'recommendation' : 'direct'
    });

    // Mark recommendation as clicked if applicable
    if (recommendationId) {
      markRecommendationClicked(recommendationId);
    }

    onArticleSelect(article);
  };

  const userSegment = getUserSegment();

  const getRecommendationsByCategory = () => {
    const categories = recommendations.reduce((acc, rec) => {
      const category = rec.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(rec);
      return acc;
    }, {} as Record<string, PersonalizedRecommendation[]>);

    return categories;
  };

  const getSegmentInfo = (segment: string) => {
    const segmentMap = {
      'power_user': { 
        label: 'مستخدم متقدم', 
        description: 'تفاعل عالي ومستمر مع المحتوى',
        color: 'bg-purple-500',
        icon: TrendingUp
      },
      'regular_reader': { 
        label: 'قارئ منتظم', 
        description: 'يقرأ بانتظام ويقضي وقتاً جيداً في الموقع',
        color: 'bg-blue-500',
        icon: BookOpen
      },
      'explorer': { 
        label: 'مستكشف', 
        description: 'يحب اكتشاف محتوى متنوع',
        color: 'bg-green-500',
        icon: Target
      },
      'news_junkie': { 
        label: 'مدمن الأخبار', 
        description: 'يركز على الأخبار والمحتوى الإخباري',
        color: 'bg-red-500',
        icon: Users
      },
      'casual_reader': { 
        label: 'قارئ عادي', 
        description: 'يقرأ أحياناً ولديه اهتمامات متنوعة',
        color: 'bg-gray-500',
        icon: Eye
      },
      'new_user': { 
        label: 'مستخدم جديد', 
        description: 'بدأ للتو في استخدام الموقع',
        color: 'bg-yellow-500',
        icon: Star
      }
    };

    return segmentMap[segment] || segmentMap['casual_reader'];
  };

  const segmentInfo = getSegmentInfo(userSegment);
  const IconComponent = segmentInfo.icon;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with User Segment */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${segmentInfo.color}`}>
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">التوصيات الذكية</h2>
                <p className="text-muted-foreground">
                  مخصص لك كـ <Badge variant="secondary">{segmentInfo.label}</Badge>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {segmentInfo.description}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">توصية جديدة</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="insights">الرؤى</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">جاري تحليل تفضيلاتك</h3>
                <p className="text-muted-foreground mb-4">
                  سنحتاج إلى المزيد من التفاعل لتقديم توصيات شخصية دقيقة
                </p>
                <Button onClick={() => generatePersonalizedRecommendations()}>
                  إنشاء توصيات
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 9).map(recommendation => {
                const article = articles.find(a => a.id === recommendation.articleId);
                if (!article) return null;

                return (
                  <Card 
                    key={recommendation.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleArticleClick(article, recommendation.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(recommendation.score * 100)}% مطابقة
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-xs text-muted-foreground">توصية</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{article.category?.name}</Badge>
                          <span>•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString('ar')}</span>
                        </div>
                        
                        <div className="bg-accent/10 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb size={14} className="text-accent" />
                            <span className="text-xs font-medium">سبب التوصية</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {recommendation.reason}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {article.analytics?.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp size={12} />
                              {article.analytics?.likes || 0}
                            </span>
                          </div>
                          <span>
                            {article.analytics?.readTime || 5} دقائق قراءة
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {behaviorAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} />
                    أنماط القراءة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>متوسط مدة الجلسة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.averageSessionDuration} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المقالات في الجلسة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.averageArticlesPerSession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سرعة القراءة</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.readingSpeed} كلمة/دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>اليوم الأكثر نشاطاً</span>
                    <span className="font-medium">{behaviorAnalysis.readingPatterns.mostActiveDay}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    مقاييس التفاعل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>معدل التفاعل</span>
                      <span>{Math.round(behaviorAnalysis.engagementMetrics.interactionRate * 100)}%</span>
                    </div>
                    <Progress value={behaviorAnalysis.engagementMetrics.interactionRate * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>معدل العودة</span>
                      <span>{Math.round(behaviorAnalysis.engagementMetrics.returnVisitorRate * 100)}%</span>
                    </div>
                    <Progress value={behaviorAnalysis.engagementMetrics.returnVisitorRate * 100} />
                  </div>
                  
                  <div className="flex justify-between">
                    <span>متوسط الوقت في الموقع</span>
                    <span className="font-medium">{behaviorAnalysis.engagementMetrics.averageTimeOnSite} دقيقة</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} />
                    التصنيفات المفضلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {behaviorAnalysis.contentPreferences.topCategories.map(category => (
                      <div key={category.category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category.category}</span>
                          <span>{category.percentage}%</span>
                        </div>
                        <Progress value={category.percentage} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">جاري تجميع البيانات</h3>
                <p className="text-muted-foreground">
                  نحتاج إلى المزيد من التفاعل لإنشاء تحليل شامل لسلوكك
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {Object.entries(getRecommendationsByCategory()).map(([category, categoryRecs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">{categoryRecs.length} توصية</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryRecs.slice(0, 4).map(rec => {
                    const article = articles.find(a => a.id === rec.articleId);
                    if (!article) return null;
                    
                    return (
                      <div 
                        key={rec.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5"
                        onClick={() => handleArticleClick(article, rec.id)}
                      >
                        <h4 className="font-medium line-clamp-1 mb-2">{article.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(rec.score * 100)}% مطابقة
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString('ar')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} className="text-accent" />
                  رؤى ذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">نمط القراءة</h4>
                  <p className="text-sm text-muted-foreground">
                    تقرأ أكثر في فترة {behaviorAnalysis?.readingPatterns.preferredTimes[0] || 'الصباح'}
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">المحتوى المفضل</h4>
                  <p className="text-sm text-muted-foreground">
                    تظهر اهتماماً كبيراً بـ{behaviorAnalysis?.contentPreferences.topCategories[0]?.category || 'الأخبار العامة'}
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">التوصية</h4>
                  <p className="text-sm text-muted-foreground">
                    جرب قراءة محتوى من تصنيفات جديدة لتوسيع اهتماماتك
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحسين التجربة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => generatePersonalizedRecommendations()}>
                  تحديث التوصيات
                </Button>
                <Button variant="outline" className="w-full">
                  تحديث الاهتمامات
                </Button>
                <Button variant="outline" className="w-full">
                  عرض إعدادات الخصوصية
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}