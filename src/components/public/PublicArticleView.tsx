import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight,
  Eye, 
  Heart, 
  Share, 
  Clock, 
  BookmarkSimple,
  Play,
  Download,
  ThumbsUp,
  MessageCircle,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  WhatsApp
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Article } from '@/types';
import { mockArticles } from '@/lib/mockData';
import { toast } from 'sonner';

interface PublicArticleViewProps {
  article: Article;
  currentLanguage: 'ar' | 'en';
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  className?: string;
}

export function PublicArticleView({ 
  article, 
  currentLanguage, 
  onBack, 
  onArticleClick,
  className 
}: PublicArticleViewProps) {
  const isRTL = currentLanguage === 'ar';
  const locale = isRTL ? ar : enUS;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.analytics?.likes || 0);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Get related articles
  const relatedArticles = mockArticles
    .filter(a => 
      a.id !== article.id && 
      a.status === 'published' && 
      (a.category?.id === article.category?.id || 
       a.tags?.some(tag => article.tags?.some(articleTag => articleTag.id === tag.id)))
    )
    .slice(0, 3);

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale,
      includeSeconds: false 
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}${isRTL ? 'ك' : 'K'}`;
    }
    return views.toString();
  };

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
      toast.success(isRTL ? 'تم إلغاء الإعجاب' : 'Like removed');
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      toast.success(isRTL ? 'تم الإعجاب' : 'Liked');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked 
      ? (isRTL ? 'تم إلغاء الحفظ' : 'Removed from bookmarks')
      : (isRTL ? 'تم الحفظ' : 'Added to bookmarks')
    );
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = isRTL ? article.titleAr || article.title : article.title;
    const text = isRTL ? article.excerptAr || article.excerpt : article.excerpt;

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
        setShowShareOptions(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
      setShowShareOptions(false);
    }
  };

  const estimatedReadTime = Math.ceil((article.content?.length || 0) / 1000) || 3;

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Article Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              {isRTL ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </>
              )}
            </Button>
            
            <Badge 
              variant="secondary"
              style={{ backgroundColor: article.category?.color + '20', color: article.category?.color }}
            >
              <span className="mr-1">{article.category?.icon}</span>
              {isRTL ? article.category?.nameAr : article.category?.nameEn}
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
              {isRTL ? article.titleAr || article.title : article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {isRTL ? article.excerptAr || article.excerpt : article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={article.author.avatar} />
                  <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">
                    {isRTL ? article.author.nameAr || article.author.name : article.author.name}
                  </div>
                  <div className="text-xs">
                    {isRTL ? article.author.department : article.author.department}
                  </div>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(article.publishedAt || article.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatViews(article.analytics?.views || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{estimatedReadTime} {isRTL ? 'دقائق قراءة' : 'min read'}</span>
              </div>
            </div>

            {/* Article Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                <span>{likesCount}</span>
              </Button>
              
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                <BookmarkSimple className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="gap-2"
                >
                  <Share className="w-4 h-4" />
                  {isRTL ? 'مشاركة' : 'Share'}
                </Button>
                
                {showShareOptions && (
                  <Card className="absolute top-full left-0 mt-2 z-50 p-2 min-w-48">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('copy')}
                      >
                        <Copy className="w-4 h-4" />
                        {isRTL ? 'نسخ الرابط' : 'Copy Link'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('twitter')}
                      >
                        <Twitter className="w-4 h-4" />
                        {isRTL ? 'تويتر' : 'Twitter'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('facebook')}
                      >
                        <Facebook className="w-4 h-4" />
                        {isRTL ? 'فيسبوك' : 'Facebook'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('whatsapp')}
                      >
                        <WhatsApp className="w-4 h-4" />
                        {isRTL ? 'واتساب' : 'WhatsApp'}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info(isRTL ? 'ميزة البودكاست قريباً' : 'Podcast feature coming soon')}
              >
                <Play className="w-4 h-4" />
                {isRTL ? 'استمع' : 'Listen'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: isRTL ? article.contentAr || article.content : article.content 
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isRTL ? 'الوسوم:' : 'Tags:'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {isRTL ? tag.nameAr : tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Article Stats */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{formatViews(article.analytics?.views || 0)}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'مشاهدة' : 'Views'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{likesCount}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'إعجاب' : 'Likes'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{article.analytics?.shares || 0}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'مشاركة' : 'Shares'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{article.analytics?.comments || 0}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? 'تعليق' : 'Comments'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {isRTL ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {relatedArticles.map((relatedArticle) => (
                <Card 
                  key={relatedArticle.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => onArticleClick(relatedArticle)}
                >
                  <div className="relative">
                    <img
                      src={relatedArticle.featuredImage}
                      alt={relatedArticle.title}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      className="absolute top-3 left-3"
                      style={{ backgroundColor: relatedArticle.category?.color, color: 'white' }}
                    >
                      <span className="mr-1">{relatedArticle.category?.icon}</span>
                      {isRTL ? relatedArticle.category?.nameAr : relatedArticle.category?.nameEn}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {isRTL ? relatedArticle.titleAr || relatedArticle.title : relatedArticle.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {isRTL ? relatedArticle.excerptAr || relatedArticle.excerpt : relatedArticle.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={relatedArticle.author.avatar} />
                          <AvatarFallback>{relatedArticle.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{isRTL ? relatedArticle.author.nameAr || relatedArticle.author.name : relatedArticle.author.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(relatedArticle.analytics?.views || 0)}</span>
                        </div>
                        <span>{formatRelativeTime(relatedArticle.publishedAt || relatedArticle.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}