import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  BookmarkSimple, 
  Share, 
  Clock, 
  Eye,
  Target,
  Sparkle
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';
import { toast } from 'sonner';

interface PersonalizedContentBlockProps {
  currentLanguage: 'ar' | 'en';
  articles: Article[];
  userProfile?: UserProfile | null;
  onArticleClick: (article: Article) => void;
  className?: string;
}

export function PersonalizedContentBlock({ 
  currentLanguage, 
  articles, 
  userProfile,
  onArticleClick,
  className
}: PersonalizedContentBlockProps) {
  const isRTL = currentLanguage === 'ar';
  const locale = isRTL ? ar : enUS;
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  // Get personalized articles based on user interests
  const personalizedArticles = useMemo(() => {
    if (!userProfile?.interests?.length) {
      // If no user interests, return most recent articles
      return articles
        .filter(article => article.status === 'published')
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0);
          const dateB = new Date(b.publishedAt || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 16);
    }

    // Filter articles by user interests
    const interestCategories = userProfile.interests;
    const filteredArticles = articles.filter(article => 
      article.status === 'published' && 
      article.category && 
      interestCategories.some(interest => 
        interest.toLowerCase() === article.category?.slug?.toLowerCase() ||
        interest.toLowerCase() === article.category?.nameAr?.toLowerCase() ||
        interest.toLowerCase() === article.category?.nameEn?.toLowerCase()
      )
    );

    // Sort by engagement and recency
    const sortedArticles = filteredArticles.sort((a, b) => {
      const scoreA = (a.analytics?.views || 0) * 0.3 + 
                     (a.analytics?.likes || 0) * 0.5 + 
                     (a.analytics?.shares || 0) * 0.2;
      const scoreB = (b.analytics?.views || 0) * 0.3 + 
                     (b.analytics?.likes || 0) * 0.5 + 
                     (b.analytics?.shares || 0) * 0.2;
      
      // Also consider recency
      const dateA = new Date(a.publishedAt || a.createdAt || 0);
      const dateB = new Date(b.publishedAt || b.createdAt || 0);
      const timeDiff = dateB.getTime() - dateA.getTime();
      
      return (scoreB - scoreA) + (timeDiff * 0.0001);
    });

    // If not enough articles from interests, fill with recent articles
    if (sortedArticles.length < 16) {
      const remainingArticles = articles
        .filter(article => 
          article.status === 'published' && 
          !sortedArticles.find(a => a.id === article.id)
        )
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0);
          const dateB = new Date(b.publishedAt || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 16 - sortedArticles.length);
      
      return [...sortedArticles, ...remainingArticles];
    }

    return sortedArticles.slice(0, 16);
  }, [articles, userProfile]);

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

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = isRTL ? 200 : 250; // Arabic is typically read slower
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSaveArticle = (articleId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
        toast.success(isRTL ? 'تم إلغاء حفظ المقال' : 'Article unsaved');
      } else {
        newSet.add(articleId);
        toast.success(isRTL ? 'تم حفظ المقال' : 'Article saved');
      }
      return newSet;
    });
  };

  const handleShareArticle = (article: Article, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  if (!personalizedArticles.length) {
    return (
      <section className={cn("py-12 border-b border-border", className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              🎯 {isRTL ? 'محتوى ذكي مخصص لاهتماماتك' : 'Smart Content Tailored for You'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isRTL 
                ? 'لا توجد مقالات متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
                : 'No articles available right now. Please try again later.'
              }
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-12 border-b border-border", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              🎯 {isRTL ? 'محتوى ذكي مخصص لاهتماماتك' : 'Smart Content Tailored for You'}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {isRTL 
              ? 'نقدم لك أفضل المقالات المختارة خصيصاً بناءً على اهتماماتك المحددة'
              : 'We present the best articles specially selected based on your specified interests'
            }
          </p>
          
          {userProfile?.interests?.length && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkle className="w-4 h-4" />
                {isRTL ? 'اهتماماتك:' : 'Your interests:'}
              </span>
              {userProfile.interests.slice(0, 5).map((interest, index) => (
                <Badge key={index} variant="secondary" className="capitalize">
                  {interest}
                </Badge>
              ))}
              {userProfile.interests.length > 5 && (
                <Badge variant="outline">
                  +{userProfile.interests.length - 5} {isRTL ? 'المزيد' : 'more'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalizedArticles.map((article) => (
            <Card 
              key={article.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
              onClick={() => onArticleClick(article)}
            >
              {/* Article Image */}
              <div className="relative">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Category Badge */}
                <Badge 
                  className="absolute top-3 left-3 text-white border-0"
                  style={{ backgroundColor: article.category?.color || '#6b7280' }}
                >
                  <span className="mr-1">{article.category?.icon}</span>
                  {isRTL ? article.category?.nameAr : article.category?.nameEn}
                </Badge>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                    onClick={(e) => handleSaveArticle(article.id, e)}
                  >
                    <BookmarkSimple 
                      className={cn(
                        "w-4 h-4",
                        savedArticles.has(article.id) ? "text-primary fill-primary" : "text-muted-foreground"
                      )} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                    onClick={(e) => handleShareArticle(article, e)}
                  >
                    <Share className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                {/* Article Title */}
                <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                  {isRTL ? article.titleAr || article.title : article.title}
                </h3>
                
                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={article.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {(isRTL ? article.author.nameAr || article.author.name : article.author.name)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-20">
                      {isRTL ? article.author.nameAr || article.author.name : article.author.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-primary">
                    <Clock className="w-3 h-3" />
                    <span>{calculateReadTime(article.content)} {isRTL ? 'د' : 'm'}</span>
                  </div>
                </div>
                
                {/* Article Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(article.analytics?.views || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{article.analytics?.likes || 0}</span>
                    </div>
                  </div>
                  
                  <span className="truncate">
                    {formatRelativeTime(article.publishedAt || article.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        {articles.length > 16 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Navigate to personalized feed or all articles
                toast.info(isRTL ? 'ستتم إضافة المزيد من المقالات قريباً' : 'More articles coming soon');
              }}
            >
              {isRTL ? 'عرض المزيد من المقالات المخصصة' : 'View More Personalized Articles'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}