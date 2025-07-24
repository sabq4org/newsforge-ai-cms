import { useState, useEffect } from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { PublicHomePage } from './PublicHomePage';
import { PublicArticleView } from './PublicArticleView';
import { NotificationCenter, LiveNotificationBanner } from '@/components/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  Clock,
  Lightning,
  ChartLine,
  Sparkle,
  Play,
  Calendar,
  Users,
  Globe,
  TrendingUp,
  BookOpen,
  Headphones
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Article } from '@/types';
import { mockArticles, mockCategories } from '@/lib/mockData';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface PublicInterfaceProps {
  className?: string;
}

type ViewMode = 'home' | 'article' | 'news' | 'analysis' | 'doses' | 'category' | 'search' | 'about' | 'contact';

export function PublicInterface({ className }: PublicInterfaceProps) {
  const [currentLanguage, setCurrentLanguage] = useKV<'ar' | 'en'>('public-language', 'ar');
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  const isRTL = currentLanguage === 'ar';
  const locale = isRTL ? ar : enUS;

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  // Filter published articles
  const publishedArticles = mockArticles.filter(article => article.status === 'published');

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setCurrentLanguage(lang);
    toast.success(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English');
  };

  const handleSectionClick = (section: string) => {
    if (section.startsWith('category-')) {
      const categorySlug = section.replace('category-', '');
      setSelectedCategory(categorySlug);
      setCurrentView('category');
    } else {
      setCurrentView(section as ViewMode);
    }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = publishedArticles.filter(article => {
        const title = isRTL ? article.titleAr || article.title : article.title;
        const content = isRTL ? article.contentAr || article.content : article.content;
        const excerpt = isRTL ? article.excerptAr || article.excerpt : article.excerpt;
        
        const searchTerm = query.toLowerCase();
        return title.toLowerCase().includes(searchTerm) ||
               content.toLowerCase().includes(searchTerm) ||
               excerpt.toLowerCase().includes(searchTerm) ||
               article.tags?.some(tag => 
                 (isRTL ? tag.nameAr : tag.name).toLowerCase().includes(searchTerm)
               );
      });
      setFilteredArticles(filtered);
      setCurrentView('search');
    }
  };

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

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <PublicHomePage
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onSectionClick={handleSectionClick}
          />
        );

      case 'article':
        if (!selectedArticle) {
          setCurrentView('home');
          return null;
        }
        return (
          <PublicArticleView
            article={selectedArticle}
            currentLanguage={currentLanguage}
            onBack={() => setCurrentView('home')}
            onArticleClick={handleArticleClick}
          />
        );

      case 'news':
        return (
          <NewsListingPage
            articles={publishedArticles}
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'analysis':
        return (
          <AnalysisPage
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'doses':
        return (
          <SmartDosesPage
            currentLanguage={currentLanguage}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'category':
        const category = mockCategories.find(cat => cat.slug === selectedCategory);
        const categoryArticles = publishedArticles.filter(article => 
          article.category?.slug === selectedCategory
        );
        return (
          <CategoryPage
            category={category}
            articles={categoryArticles}
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'search':
        return (
          <SearchResultsPage
            query={searchQuery}
            articles={filteredArticles}
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'about':
        return (
          <AboutPage
            currentLanguage={currentLanguage}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'contact':
        return (
          <ContactPage
            currentLanguage={currentLanguage}
            onBack={() => setCurrentView('home')}
          />
        );

      default:
        return (
          <PublicHomePage
            currentLanguage={currentLanguage}
            onArticleClick={handleArticleClick}
            onSectionClick={handleSectionClick}
          />
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-background font-arabic", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Live Notification Banner */}
      <LiveNotificationBanner />
      
      <PublicHeader
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onSectionClick={handleSectionClick}
        onSearchChange={handleSearchChange}
      />
      
      <main className="flex-1">
        {renderContent()}
      </main>
      
      <PublicFooter
        currentLanguage={currentLanguage}
        onSectionClick={handleSectionClick}
      />
      
      {/* Notification Center for Public View */}
      <NotificationCenter />
    </div>
  );
}

// News Listing Page Component
function NewsListingPage({ 
  articles, 
  currentLanguage, 
  onArticleClick, 
  onBack 
}: {
  articles: Article[];
  currentLanguage: 'ar' | 'en';
  onArticleClick: (article: Article) => void;
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';
  const locale = isRTL ? ar : enUS;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'جميع الأخبار' : 'All News'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
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
  );
}

// Analysis Page Component
function AnalysisPage({ 
  currentLanguage, 
  onArticleClick, 
  onBack 
}: {
  currentLanguage: 'ar' | 'en';
  onArticleClick: (article: Article) => void;
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <ChartLine className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'التحليل العميق' : 'Deep Analysis'}
        </h1>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 mb-8">
        <CardContent className="p-8 text-center">
          <ChartLine className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isRTL ? 'تحليلات مدعومة بالذكاء الاصطناعي' : 'AI-Powered Analysis'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {isRTL 
              ? 'نستخدم تقنيات الذكاء الاصطناعي المتقدمة لتحليل الأحداث والتطورات وربطها بسياقها التاريخي والسياسي والاقتصادي.'
              : 'We use advanced AI technologies to analyze events and developments, connecting them to their historical, political, and economic context.'
            }
          </p>
          <Button size="lg">
            {isRTL ? 'قريباً' : 'Coming Soon'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Smart Doses Page Component
function SmartDosesPage({ 
  currentLanguage, 
  onBack 
}: {
  currentLanguage: 'ar' | 'en';
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <Sparkle className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'الجرعات الذكية' : 'Smart Doses'}
        </h1>
      </div>

      <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 mb-8">
        <CardContent className="p-8 text-center">
          <Sparkle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isRTL ? 'جرعات إخبارية ذكية ومخصصة' : 'Smart & Personalized News Doses'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {isRTL 
              ? 'احصل على ملخصات إخبارية ذكية مخصصة حسب اهتماماتك ووقت قراءتك، مع إمكانية الاستماع الصوتي.'
              : 'Get smart news summaries personalized based on your interests and reading time, with audio listening capability.'
            }
          </p>
          <Button size="lg">
            {isRTL ? 'قريباً' : 'Coming Soon'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Category Page Component
function CategoryPage({ 
  category, 
  articles, 
  currentLanguage, 
  onArticleClick, 
  onBack 
}: {
  category?: any;
  articles: Article[];
  currentLanguage: 'ar' | 'en';
  onArticleClick: (article: Article) => void;
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {isRTL ? 'القسم غير موجود' : 'Category Not Found'}
        </h1>
        <Button onClick={onBack}>
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: category.color }}
        >
          {category.icon}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? category.nameAr : category.nameEn}
          </h1>
          <p className="text-muted-foreground">
            {articles.length} {isRTL ? 'مقال' : 'articles'}
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
        <NewsListingPage
          articles={articles}
          currentLanguage={currentLanguage}
          onArticleClick={onArticleClick}
          onBack={onBack}
        />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد مقالات في هذا القسم حالياً' : 'No articles in this category yet'}
          </p>
        </Card>
      )}
    </div>
  );
}

// Search Results Page Component
function SearchResultsPage({ 
  query, 
  articles, 
  currentLanguage, 
  onArticleClick, 
  onBack 
}: {
  query: string;
  articles: Article[];
  currentLanguage: 'ar' | 'en';
  onArticleClick: (article: Article) => void;
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <Search className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'نتائج البحث' : 'Search Results'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? `${articles.length} نتيجة للبحث عن "${query}"`
              : `${articles.length} results for "${query}"`
            }
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
        <NewsListingPage
          articles={articles}
          currentLanguage={currentLanguage}
          onArticleClick={onArticleClick}
          onBack={onBack}
        />
      ) : (
        <Card className="p-8 text-center">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isRTL ? 'لم يتم العثور على نتائج' : 'No Results Found'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL 
              ? `لم نجد أي مقالات تحتوي على "${query}". جرب البحث بكلمات أخرى.`
              : `We couldn't find any articles containing "${query}". Try searching with different keywords.`
            }
          </p>
        </Card>
      )}
    </div>
  );
}

// About Page Component
function AboutPage({ 
  currentLanguage, 
  onBack 
}: {
  currentLanguage: 'ar' | 'en';
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <Lightning className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'عن سبق الذكية' : 'About Sabq Althakiyah'}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {isRTL ? 'مَن نحن' : 'Who We Are'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {isRTL 
                ? 'سبق الذكية هي منصة إعلامية رائدة تجمع بين أفضل ما في الصحافة التقليدية وأحدث تقنيات الذكاء الاصطناعي. نهدف إلى تقديم محتوى إخباري متميز وتحليلات عميقة تساعد قراءنا على فهم العالم من حولهم.'
                : 'Sabq Althakiyah is a leading media platform that combines the best of traditional journalism with the latest AI technologies. We aim to deliver outstanding news content and deep analysis that helps our readers understand the world around them.'
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <Lightning className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  {isRTL ? 'صحافة ذكية' : 'Smart Journalism'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'نستخدم الذكاء الاصطناعي لتحسين جودة المحتوى وتخصيص التجربة'
                    : 'We use AI to enhance content quality and personalize the experience'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <ChartLine className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  {isRTL ? 'تحليل عميق' : 'Deep Analysis'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'تحليلات متقدمة تربط الأحداث بسياقها التاريخي والاقتصادي'
                    : 'Advanced analysis connecting events to their historical and economic context'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  {isRTL ? 'تغطية شاملة' : 'Comprehensive Coverage'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'تغطية محلية وعالمية لجميع المجالات المهمة'
                    : 'Local and global coverage across all important sectors'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Contact Page Component
function ContactPage({ 
  currentLanguage, 
  onBack 
}: {
  currentLanguage: 'ar' | 'en';
  onBack: () => void;
}) {
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
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
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'تواصل معنا' : 'Contact Us'}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {isRTL ? 'نحن هنا للمساعدة' : 'We\'re Here to Help'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  {isRTL ? 'معلومات التواصل' : 'Contact Information'}
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>{isRTL ? 'البريد الإلكتروني:' : 'Email:'} contact@sabq-althakiyah.sa</p>
                  <p>{isRTL ? 'الهاتف:' : 'Phone:'} +966 11 234 5678</p>
                  <p>{isRTL ? 'العنوان:' : 'Address:'} {isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  {isRTL ? 'ساعات العمل' : 'Business Hours'}
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{isRTL ? 'الأحد - الخميس: ٩ص - ٦م' : 'Sunday - Thursday: 9AM - 6PM'}</p>
                  <p>{isRTL ? 'الجمعة - السبت: مغلق' : 'Friday - Saturday: Closed'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}