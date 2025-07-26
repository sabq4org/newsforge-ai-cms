import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Lightning, 
  Eye, 
  Heart, 
  Share, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  TrendingUp,
  Sparkle,
  Play,
  BookmarkSimple,
  CalendarCheck,
  Microphone,
  ChartBarHorizontal
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';
import { mockArticles, mockCategories } from '@/lib/mockData';
import { PersonalizedContentBlock } from './PersonalizedContentBlock';
import { useKV } from '@github/spark/hooks';

interface PublicHomePageProps {
  currentLanguage: 'ar' | 'en';
  onArticleClick: (article: Article) => void;
  onSectionClick: (section: string) => void;
  className?: string;
  articles?: Article[];
  userProfile?: UserProfile | null;
}

export function PublicHomePage({ 
  currentLanguage, 
  onArticleClick, 
  onSectionClick,
  className,
  articles,
  userProfile
}: PublicHomePageProps) {
  const isRTL = currentLanguage === 'ar';
  const locale = isRTL ? ar : enUS;
  const [memberUser] = useKV<UserProfile | null>('current-member-user', null);

  // Use provided articles or fallback to mock articles  
  const availableArticles = articles || mockArticles;

  // Get current time period for smart doses
  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 19) return 'evening';
    return 'night';
  };

  const currentPeriod = getCurrentPeriod();

  // Smart dose content based on time
  const periodContent = {
    morning: {
      titleAr: 'جرعة الصباح ☀️',
      titleEn: 'Morning Dose ☀️',
      subtitleAr: 'ابدأ صباحك بأهم الأخبار!',
      subtitleEn: 'Start your morning with top news!',
      colorClass: 'from-amber-500/20 to-orange-500/20'
    },
    afternoon: {
      titleAr: 'جرعة الظهيرة ☁️',
      titleEn: 'Afternoon Dose ☁️',
      subtitleAr: 'منتصف يومك مع آخر التطورات',
      subtitleEn: 'Midday updates and developments',
      colorClass: 'from-blue-500/20 to-cyan-500/20'
    },
    evening: {
      titleAr: 'جرعة المساء 🌇',
      titleEn: 'Evening Dose 🌇',
      subtitleAr: 'تحليلات خفيفة وسياق ذكي',
      subtitleEn: 'Light analysis and smart context',
      colorClass: 'from-purple-500/20 to-pink-500/20'
    },
    night: {
      titleAr: 'جرعة قبل النوم 🌙',
      titleEn: 'Night Dose 🌙',
      subtitleAr: 'ملخص هادئ ليومك',
      subtitleEn: 'Calm summary of your day',
      colorClass: 'from-indigo-500/20 to-blue-500/20'
    }
  };

  // Filter articles by status and recency
  const publishedArticles = availableArticles.filter(article => article.status === 'published');
  const trendingArticles = publishedArticles
    .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
    .slice(0, 5);
  
  const recentArticles = publishedArticles
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0);
      const dateB = new Date(b.publishedAt || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 6);

  const featuredArticle = publishedArticles.find(article => article.priority === 'high') || publishedArticles[0];
  
  // Safety check for featured article
  if (!featuredArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">لا توجد مقالات متاحة</h2>
              <p className="text-muted-foreground">يرجى المحاولة مرة أخرى لاحقاً</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get articles by category for category showcase
  const categorizedArticles = mockCategories.slice(0, 6).map(category => ({
    category,
    articles: publishedArticles
      .filter(article => article.category?.id === category.id)
      .slice(0, 3)
  })).filter(item => item.articles.length > 0);

  const formatRelativeTime = (date: Date | string | number | undefined) => {
    if (!date) return 'منذ وقت غير محدد';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'منذ وقت غير محدد';
      }
      
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale,
        includeSeconds: false 
      });
    } catch (error) {
      console.warn('formatRelativeTime error:', error);
      return 'منذ وقت غير محدد';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}${isRTL ? 'ك' : 'K'}`;
    }
    return views.toString();
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* System Features Alert */}
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-accent animate-pulse" />
              <span className="font-medium">
                {isRTL 
                  ? '🚀 منصة سبق الذكية مجهزة بأكثر من 50 خدمة متطورة!' 
                  : '🚀 Sabq AI Platform features 50+ advanced services!'}
              </span>
            </div>
            <Badge variant="secondary" className="animate-bounce">
              {isRTL ? 'ذكاء اصطناعي' : 'AI Powered'}
            </Badge>
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <ChartBarHorizontal className="w-3 h-3" />
              <span>{isRTL ? 'تحليلات متقدمة' : 'Advanced Analytics'}</span>
              <span>•</span>
              <Microphone className="w-3 h-3" />
              <span>{isRTL ? 'بودكاست ذكي' : 'Smart Podcast'}</span>
              <span>•</span>
              <BookmarkSimple className="w-3 h-3" />
              <span>{isRTL ? 'توصيات ذكية' : 'Smart Recommendations'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Featured Article */}
      {featuredArticle && (
        <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-primary" />
                  <Badge variant="default" className="bg-primary">
                    {isRTL ? 'مميز' : 'Featured'}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: featuredArticle.category?.color + '20', color: featuredArticle.category?.color }}
                  >
                    <span className="mr-1">{featuredArticle.category?.icon}</span>
                    {isRTL ? featuredArticle.category?.nameAr : featuredArticle.category?.nameEn}
                  </Badge>
                </div>
                
                <h1 
                  className="text-3xl lg:text-4xl font-bold text-foreground leading-tight cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onArticleClick(featuredArticle)}
                >
                  {isRTL ? featuredArticle.titleAr || featuredArticle.title : featuredArticle.title}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {isRTL ? featuredArticle.excerptAr || featuredArticle.excerpt : featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={featuredArticle.author.avatar} />
                      <AvatarFallback>{featuredArticle.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{isRTL ? featuredArticle.author.nameAr || featuredArticle.author.name : featuredArticle.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRelativeTime(featuredArticle.publishedAt || featuredArticle.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(featuredArticle.analytics?.views || 0)}</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={() => onArticleClick(featuredArticle)}
                  className="group"
                >
                  {isRTL ? 'اقرأ المقال كاملاً' : 'Read Full Article'}
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <img
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.title}
                  className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Smart Doses Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isRTL ? periodContent[currentPeriod].titleAr : periodContent[currentPeriod].titleEn}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? periodContent[currentPeriod].subtitleAr : periodContent[currentPeriod].subtitleEn}
            </p>
          </div>

          <Card className={cn("bg-gradient-to-r", periodContent[currentPeriod].colorClass)}>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Sparkle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {isRTL ? 'ملخص ذكي' : 'Smart Summary'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'أهم ٣ أخبار مع تحليل سريع بالذكاء الاصطناعي'
                      : 'Top 3 news with quick AI analysis'
                    }
                  </p>
                </div>
                
                <div className="text-center">
                  <Microphone className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {isRTL ? 'نسخة صوتية' : 'Audio Version'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'استمع للجرعة أثناء تنقلك'
                      : 'Listen to your dose on the go'
                    }
                  </p>
                </div>
                
                <div className="text-center">
                  <CalendarCheck className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {isRTL ? 'مخصصة لك' : 'Personalized'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'بناءً على اهتماماتك وأوقات قراءتك'
                      : 'Based on your interests and reading times'
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  size="lg"
                  onClick={() => onSectionClick('doses')}
                  className="group"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRTL ? 'احصل على جرعتك الآن' : 'Get Your Dose Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Personalized Content Block */}
      {(userProfile || memberUser) && (
        <PersonalizedContentBlock
          currentLanguage={currentLanguage}
          articles={availableArticles}
          userProfile={userProfile || memberUser}
          onArticleClick={onArticleClick}
        />
      )}

      {/* Latest News Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isRTL ? 'آخر الأخبار' : 'Latest News'}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => onSectionClick('news')}
              className="group"
            >
              {isRTL ? 'جميع الأخبار' : 'All News'}
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <Card 
                key={article.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => onArticleClick(article)}
              >
                <div className="relative">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge 
                    className="absolute top-3 left-3"
                    style={{ backgroundColor: article.category?.color, color: 'white' }}
                  >
                    <span className="mr-1">{article.category?.icon}</span>
                    {isRTL ? article.category?.nameAr : article.category?.nameEn}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {isRTL ? article.titleAr || article.title : article.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {isRTL ? article.excerptAr || article.excerpt : article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={article.author.avatar} />
                        <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{isRTL ? article.author.nameAr || article.author.name : article.author.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(article.analytics?.views || 0)}</span>
                      </div>
                      <span>{formatRelativeTime(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Articles */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {isRTL ? 'الأكثر قراءة' : 'Trending Now'}
              </h2>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onSectionClick('trending')}
              className="group"
            >
              {isRTL ? 'المزيد' : 'View More'}
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendingArticles.slice(0, 4).map((article, index) => (
              <Card 
                key={article.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => onArticleClick(article)}
              >
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-l-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4">
                      <Badge 
                        variant="secondary"
                        className="mb-2"
                        style={{ backgroundColor: article.category?.color + '20', color: article.category?.color }}
                      >
                        <span className="mr-1">{article.category?.icon}</span>
                        {isRTL ? article.category?.nameAr : article.category?.nameEn}
                      </Badge>
                      
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {isRTL ? article.titleAr || article.title : article.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(article.analytics?.views || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{article.analytics?.likes || 0}</span>
                        </div>
                        <span>{formatRelativeTime(article.publishedAt || article.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Analysis Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ChartBarHorizontal className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {isRTL ? 'التحليل العميق' : 'Deep Analysis'}
              </h2>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onSectionClick('analysis')}
              className="group"
            >
              {isRTL ? 'جميع التحليلات' : 'All Analysis'}
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {isRTL 
                      ? 'تحليلات مدعومة بالذكاء الاصطناعي'
                      : 'AI-Powered Analysis'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {isRTL 
                      ? 'نقدم تحليلات عميقة للأحداث والتطورات باستخدام تقنيات الذكاء الاصطناعي المتقدمة، مع ربط الأحداث بسياقها التاريخي والسياسي والاقتصادي.'
                      : 'We provide deep analysis of events and developments using advanced AI technologies, connecting events to their historical, political, and economic context.'
                    }
                  </p>
                  <Button onClick={() => onSectionClick('analysis')}>
                    {isRTL ? 'استكشف التحليلات' : 'Explore Analysis'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">85%</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'دقة التنبؤ' : 'Prediction Accuracy'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">120+</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'تحليل شهرياً' : 'Monthly Analysis'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'مراقبة مستمرة' : 'Continuous Monitoring'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">15</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'مصدر بيانات' : 'Data Sources'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {isRTL ? 'تصفح حسب الأقسام' : 'Browse by Categories'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL 
                ? 'اكتشف المحتوى المصنف حسب اهتماماتك واحصل على تجربة قراءة مخصصة'
                : 'Discover content categorized by your interests and get a personalized reading experience'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedArticles.slice(0, 6).map(({ category, articles }) => (
              <Card 
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => onSectionClick(`category-${category.slug}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    >
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {isRTL ? category.nameAr : category.nameEn}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {articles.length} {isRTL ? 'مقال' : 'articles'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {articles.slice(0, 2).map((article) => (
                      <div key={article.id} className="group/article">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover/article:text-primary transition-colors">
                          {isRTL ? article.titleAr || article.title : article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(article.publishedAt || article.createdAt)}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatViews(article.analytics?.views || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionClick(`category-${category.slug}`);
                    }}
                  >
                    {isRTL ? 'عرض المزيد' : 'View More'}
                    {isRTL ? (
                      <ArrowLeft className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}