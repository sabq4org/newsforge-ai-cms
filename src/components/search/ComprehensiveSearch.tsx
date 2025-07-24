import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { mockCategories, mockArticles } from '@/lib/mockData';
import { Article, Category, User } from '@/types';
import { cn } from '@/lib/utils';
import {
  Search,
  Brain,
  Filter,
  Clock,
  Eye,
  Star,
  User as UserIcon,
  Hash,
  Calendar,
  FileText,
  TrendingUp,
  Globe,
  MagicWand,
  Sparkle,
  Target,
  BookOpen,
  Tag as TagIcon,
  MapPin,
  Lightbulb,
  ArrowRight,
  X,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface SearchResult {
  id: string;
  type: 'article' | 'category' | 'tag' | 'author';
  title: string;
  excerpt?: string;
  relevanceScore: number;
  highlights: string[];
  metadata: {
    author?: string;
    category?: string;
    date?: Date;
    views?: number;
    tags?: string[];
  };
}

interface SearchSuggestion {
  query: string;
  type: 'trending' | 'recent' | 'ai-suggested';
  confidence?: number;
}

interface ComprehensiveSearchProps {
  onArticleEdit?: (article: Article) => void;
}

export function ComprehensiveSearch({ onArticleEdit }: ComprehensiveSearchProps) {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';

  // Data sources
  const [articles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [categories] = useKV<Category[]>('sabq-categories', mockCategories);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiProcessing, setAIProcessing] = useState(false);
  const [recentSearches, setRecentSearches] = useKV<string[]>('sabq-recent-searches', []);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [contentType, setContentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');

  // Get unique authors
  const authors = Array.from(new Set(articles.map(article => article.author.name)))
    .map(name => articles.find(article => article.author.name === name)?.author)
    .filter(Boolean) as User[];

  // Search suggestions
  const generateSearchSuggestions = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([
        { query: isArabic ? 'رؤية 2030' : 'Vision 2030', type: 'trending' },
        { query: isArabic ? 'الذكاء الاصطناعي' : 'Artificial Intelligence', type: 'trending' },
        { query: isArabic ? 'نيوم' : 'NEOM', type: 'trending' },
        { query: isArabic ? 'التحول الرقمي' : 'Digital Transformation', type: 'trending' },
        { query: isArabic ? 'الاقتصاد السعودي' : 'Saudi Economy', type: 'trending' }
      ]);
      return;
    }

    if (isAIMode && searchQuery.length > 3) {
      setAIProcessing(true);
      try {
        const prompt = spark.llmPrompt`
          بناءً على استعلام البحث "${searchQuery}" في سياق موقع أخبار سعودي، 
          اقترح 5 استعلامات بحث ذات صلة باللغة العربية والإنجليزية:
          
          يجب أن تكون الاقتراحات:
          1. ذات صلة بالاستعلام الأصلي
          2. مناسبة للأخبار والمحتوى الإعلامي
          3. تراعي السياق السعودي والعربي
          4. متنوعة في المواضيع
          
          أرجع النتائج في شكل قائمة بسيطة، اقتراح واحد في كل سطر.
        `;
        
        const suggestions = await spark.llm(prompt);
        const suggestionList = suggestions.split('\n')
          .filter(s => s.trim())
          .map(s => s.replace(/^[-•*]\s*/, '').trim())
          .slice(0, 5)
          .map(query => ({
            query,
            type: 'ai-suggested' as const,
            confidence: Math.random() * 0.3 + 0.7 // 70-100%
          }));

        setSearchSuggestions(suggestionList);
      } catch (error) {
        console.error('Error generating AI suggestions:', error);
      } finally {
        setAIProcessing(false);
      }
    }
  }, [searchQuery, isAIMode, isArabic]);

  // Perform search
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Save to recent searches
      setRecentSearches(current => {
        const updated = [searchQuery, ...current.filter(s => s !== searchQuery)].slice(0, 10);
        return updated;
      });

      let results: SearchResult[] = [];

      if (isAIMode) {
        // AI-powered semantic search
        const prompt = spark.llmPrompt`
          قم بتحليل استعلام البحث "${searchQuery}" وابحث في المقالات التالية:
          
          ${articles.map(article => `
          ID: ${article.id}
          العنوان: ${article.title}
          المحتوى: ${article.content.substring(0, 500)}...
          التصنيف: ${article.category?.name}
          الكاتب: ${article.author.name}
          العلامات: ${article.tags?.map(t => t.name).join(', ')}
          `).join('\n---\n')}
          
          أرجع قائمة بـ IDs المقالات الأكثر صلة مع درجة الصلة (0-100) بالتنسيق:
          ID:درجة_الصلة:سبب_الصلة
        `;

        const aiResults = await spark.llm(prompt);
        const aiMatches = aiResults.split('\n')
          .filter(line => line.includes(':'))
          .map(line => {
            const [id, score, reason] = line.split(':');
            return { id: id.trim(), score: parseInt(score) || 0, reason: reason?.trim() || '' };
          })
          .filter(match => match.score > 30); // Only include relevant results

        results = aiMatches.map(match => {
          const article = articles.find(a => a.id === match.id);
          if (!article) return null;

          return {
            id: article.id,
            type: 'article' as const,
            title: article.title,
            excerpt: article.excerpt,
            relevanceScore: match.score,
            highlights: [match.reason],
            metadata: {
              author: article.author.name,
              category: article.category?.name,
              date: article.publishedAt || article.createdAt,
              views: article.analytics.views,
              tags: article.tags?.map(t => t.name)
            }
          };
        }).filter(Boolean) as SearchResult[];

      } else {
        // Traditional keyword search
        const query = searchQuery.toLowerCase();
        
        results = articles
          .map(article => {
            let score = 0;
            const highlights: string[] = [];

            // Title match (highest weight)
            if (article.title.toLowerCase().includes(query)) {
              score += 50;
              highlights.push(isArabic ? 'تطابق في العنوان' : 'Title match');
            }

            // Content match
            if (article.content.toLowerCase().includes(query)) {
              score += 30;
              highlights.push(isArabic ? 'تطابق في المحتوى' : 'Content match');
            }

            // Tags match
            const tagMatch = article.tags?.some(tag => 
              tag.name.toLowerCase().includes(query)
            );
            if (tagMatch) {
              score += 20;
              highlights.push(isArabic ? 'تطابق في العلامات' : 'Tag match');
            }

            // Category match
            if (article.category?.name.toLowerCase().includes(query)) {
              score += 15;
              highlights.push(isArabic ? 'تطابق في التصنيف' : 'Category match');
            }

            // Author match
            if (article.author.name.toLowerCase().includes(query)) {
              score += 10;
              highlights.push(isArabic ? 'تطابق في الكاتب' : 'Author match');
            }

            return score > 0 ? {
              id: article.id,
              type: 'article' as const,
              title: article.title,
              excerpt: article.excerpt,
              relevanceScore: score,
              highlights,
              metadata: {
                author: article.author.name,
                category: article.category?.name,
                date: article.publishedAt || article.createdAt,
                views: article.analytics.views,
                tags: article.tags?.map(t => t.name)
              }
            } : null;
          })
          .filter(Boolean) as SearchResult[];
      }

      // Apply filters
      if (selectedCategory !== 'all') {
        results = results.filter(result => 
          result.metadata.category === selectedCategory
        );
      }

      if (selectedAuthor !== 'all') {
        results = results.filter(result => 
          result.metadata.author === selectedAuthor
        );
      }

      if (dateRange !== 'all') {
        const now = new Date();
        const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        results = results.filter(result => 
          result.metadata.date && new Date(result.metadata.date) > cutoff
        );
      }

      // Sort results
      results.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.metadata.date || 0).getTime() - new Date(a.metadata.date || 0).getTime();
          case 'views':
            return (b.metadata.views || 0) - (a.metadata.views || 0);
          case 'relevance':
          default:
            return b.relevanceScore - a.relevanceScore;
        }
      });

      setSearchResults(results);

    } catch (error) {
      console.error('Search error:', error);
      toast.error(isArabic ? 'خطأ في البحث' : 'Search error');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, isAIMode, selectedCategory, selectedAuthor, dateRange, sortBy, articles, isArabic, setRecentSearches]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Generate suggestions on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSearchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [generateSearchSuggestions]);

  // Clear filters
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAuthor('all');
    setDateRange('all');
    setContentType('all');
    setSortBy('relevance');
  };

  // Handle article click
  const handleArticleClick = (resultId: string) => {
    const article = articles.find(a => a.id === resultId);
    if (article && onArticleEdit) {
      onArticleEdit(article);
    }
  };

  return (
    <div className={cn("space-y-6", typography.rtlText)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(typography.heading, "text-3xl font-bold")}>
            {isArabic ? 'البحث الذكي' : 'Smart Search'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? 'بحث متقدم بالذكاء الاصطناعي في محتوى الموقع' : 'Advanced AI-powered content search'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="ai-mode" className="text-sm">
            {isArabic ? 'البحث بالذكاء الاصطناعي' : 'AI Search'}
          </Label>
          <Switch
            id="ai-mode"
            checked={isAIMode}
            onCheckedChange={setIsAIMode}
          />
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={isArabic ? 
                  (isAIMode ? 'اسأل أي سؤال عن محتوى الموقع...' : 'ابحث في المقالات والمحتوى...') :
                  (isAIMode ? 'Ask any question about the content...' : 'Search articles and content...')
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-lg"
              />
              {isAIMode && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>

            {/* AI Processing Indicator */}
            {aiProcessing && (
              <Alert>
                <Sparkle className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    {isArabic ? 'جاري إنشاء اقتراحات ذكية...' : 'Generating smart suggestions...'}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isArabic ? 'اقتراحات البحث' : 'Search Suggestions'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(suggestion.query)}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      <div className="flex items-center gap-1">
                        {suggestion.type === 'ai-suggested' && <Brain className="w-3 h-3" />}
                        {suggestion.type === 'trending' && <TrendingUp className="w-3 h-3" />}
                        {suggestion.type === 'recent' && <Clock className="w-3 h-3" />}
                        {suggestion.query}
                        {suggestion.confidence && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isArabic ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery(search)}
                      className="h-auto py-1 px-2 text-xs flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {isArabic ? 'المرشحات' : 'Filters'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  {isArabic ? 'مسح' : 'Clear'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  {isArabic ? 'التصنيف' : 'Category'}
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'جميع التصنيفات' : 'All Categories'}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {isArabic ? category.nameAr : category.nameEn || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {isArabic ? 'الكاتب' : 'Author'}
                </Label>
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'جميع الكتاب' : 'All Authors'}</SelectItem>
                    {authors.map(author => (
                      <SelectItem key={author.id} value={author.name}>
                        {isArabic ? author.nameAr || author.name : author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {isArabic ? 'الفترة الزمنية' : 'Time Period'}
                </Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'كل الأوقات' : 'All Time'}</SelectItem>
                    <SelectItem value="week">{isArabic ? 'آخر أسبوع' : 'Last Week'}</SelectItem>
                    <SelectItem value="month">{isArabic ? 'آخر شهر' : 'Last Month'}</SelectItem>
                    <SelectItem value="year">{isArabic ? 'آخر سنة' : 'Last Year'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {isArabic ? 'ترتيب النتائج' : 'Sort Results'}
                </Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{isArabic ? 'الصلة' : 'Relevance'}</SelectItem>
                    <SelectItem value="date">{isArabic ? 'التاريخ' : 'Date'}</SelectItem>
                    <SelectItem value="views">{isArabic ? 'المشاهدات' : 'Views'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Header */}
          {(searchQuery || searchResults.length > 0) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isSearching ? (
                    isArabic ? 'جاري البحث...' : 'Searching...'
                  ) : (
                    isArabic ? 
                      `${searchResults.length} نتيجة للبحث "${searchQuery}"` :
                      `${searchResults.length} results for "${searchQuery}"`
                  )}
                </span>
                {isAIMode && !isSearching && (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    {isArabic ? 'بحث ذكي' : 'AI Search'}
                  </Badge>
                )}
              </div>
              
              {isSearching && (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-4">
            {searchResults.map((result) => (
              <Card 
                key={result.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleArticleClick(result.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                          {result.title}
                        </h3>
                        
                        {result.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {result.excerpt}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {result.metadata.author && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {result.metadata.author}
                            </div>
                          )}
                          
                          {result.metadata.category && (
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {result.metadata.category}
                            </div>
                          )}
                          
                          {result.metadata.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(result.metadata.date), 'PP', { 
                                locale: isArabic ? ar : enUS 
                              })}
                            </div>
                          )}
                          
                          {result.metadata.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {result.metadata.views.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {result.relevanceScore}% {isArabic ? 'مطابقة' : 'match'}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {result.highlights.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {isArabic ? 'أسباب الصلة:' : 'Relevance reasons:'}
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {result.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.metadata.tags && result.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.metadata.tags.slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <TagIcon className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {isArabic ? 'لا توجد نتائج' : 'No results found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isArabic ? 
                    `لم نجد أي نتائج للبحث "${searchQuery}"` :
                    `We couldn't find any results for "${searchQuery}"`
                  }
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'جرب:' : 'Try:'}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {isArabic ? 'استخدام كلمات مفتاحية مختلفة' : 'Using different keywords'}</li>
                    <li>• {isArabic ? 'إزالة المرشحات' : 'Removing filters'}</li>
                    <li>• {isArabic ? 'تجربة البحث الذكي' : 'Trying AI search mode'}</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  {isArabic ? 'مسح المرشحات' : 'Clear Filters'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Default State */}
          {!searchQuery && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {isArabic ? 'ابدأ البحث' : 'Start Searching'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isArabic ? 
                    'ابحث في آلاف المقالات والمحتوى باستخدام البحث الذكي' :
                    'Search through thousands of articles and content using smart search'
                  }
                </p>
                <div className="grid gap-4 md:grid-cols-2 max-w-md mx-auto">
                  <div className="text-center">
                    <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium text-sm">
                      {isArabic ? 'البحث التقليدي' : 'Traditional Search'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'بحث بالكلمات المفتاحية' : 'Keyword-based search'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium text-sm">
                      {isArabic ? 'البحث الذكي' : 'AI Search'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'بحث دلالي بالذكاء الاصطناعي' : 'Semantic AI-powered search'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}