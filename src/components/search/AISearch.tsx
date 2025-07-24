import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  MagnifyingGlass,
  Sparkles,
  Filter,
  Clock,
  User,
  Tag,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Brain,
  CheckCircle,
  XCircle,
  Eye,
  Share
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories, mockTags } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface SearchResult {
  article: Article;
  relevanceScore: number;
  matchReason: string[];
  aiSummary?: string;
}

interface SearchFilters {
  category: string;
  author: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  status: 'all' | 'draft' | 'published' | 'scheduled' | 'review';
  hasMedia: boolean;
  language: 'all' | 'ar' | 'en';
  priority: 'all' | 'urgent' | 'high' | 'normal' | 'low';
}

interface AISearchProps {
  onArticleEdit: (article: Article) => void;
}

export function AISearch({ onArticleEdit }: AISearchProps) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    author: 'all',
    dateRange: 'all',
    status: 'all',
    hasMedia: false,
    language: 'all',
    priority: 'all'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useKV<string[]>('search-history', []);

  // AI-powered search suggestions
  const generateSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      const prompt = spark.llmPrompt`
        Based on this partial search query in Arabic: "${query}"
        Generate 5 relevant search suggestions for a news website.
        Consider: news topics, current events, categories like politics, technology, sports, economy.
        Return only the suggestions, one per line, in Arabic.
      `;
      
      const result = await spark.llm(prompt, 'gpt-4o-mini');
      const suggestionList = result.split('\n').filter(s => s.trim()).slice(0, 5);
      setSuggestions(suggestionList);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  // Enhanced AI-powered search function
  const performAISearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
        return newHistory;
      });

      const results: SearchResult[] = [];
      
      for (const article of articles) {
        // Apply filters first
        if (!passesFilters(article, filters)) continue;
        
        let relevanceScore = 0;
        const matchReasons: string[] = [];
        
        // Title matching (highest weight)
        if (article.title.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 0.4;
          matchReasons.push('تطابق في العنوان');
        }
        
        // Content matching
        if (article.content.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 0.3;
          matchReasons.push('تطابق في المحتوى');
        }
        
        // Excerpt matching
        if (article.excerpt.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 0.2;
          matchReasons.push('تطابق في الملخص');
        }
        
        // Category matching
        if (article.category?.name.toLowerCase().includes(query.toLowerCase()) ||
            article.category?.nameAr?.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 0.2;
          matchReasons.push('تطابق في التصنيف');
        }
        
        // Tags matching
        if (article.tags?.some(tag => 
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.nameAr?.toLowerCase().includes(query.toLowerCase())
        )) {
          relevanceScore += 0.15;
          matchReasons.push('تطابق في العلامات');
        }
        
        // Author matching
        if (article.author.name.toLowerCase().includes(query.toLowerCase()) ||
            article.author.nameAr?.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 0.1;
          matchReasons.push('تطابق في اسم الكاتب');
        }

        // AI semantic search
        if (relevanceScore > 0 || query.length > 3) {
          try {
            const semanticScore = await performSemanticSearch(query, article);
            relevanceScore += semanticScore * 0.3;
            if (semanticScore > 0.5) {
              matchReasons.push('تطابق دلالي ذكي');
            }
          } catch (error) {
            console.warn('Semantic search failed:', error);
          }
        }
        
        // Boost recent articles
        const daysSinceCreated = (Date.now() - new Date(article.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) {
          relevanceScore += 0.1;
          matchReasons.push('مقال حديث');
        }
        
        // Boost high-performing articles
        if (article.analytics && article.analytics.views > 1000) {
          relevanceScore += 0.05;
          matchReasons.push('مقال شائع');
        }
        
        if (relevanceScore > 0.1) {
          results.push({
            article,
            relevanceScore,
            matchReason: matchReasons,
            aiSummary: await generateAISummary(article, query)
          });
        }
      }
      
      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('لم يتم العثور على نتائج مطابقة');
      } else {
        toast.success(`تم العثور على ${results.length} نتيجة`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('خطأ في البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const performSemanticSearch = async (query: string, article: Article): Promise<number> => {
    try {
      const prompt = spark.llmPrompt`
        Compare this search query with the article content and return a relevance score between 0 and 1.
        
        Search Query: "${query}"
        Article Title: "${article.title}"
        Article Summary: "${article.excerpt}"
        
        Consider semantic meaning, topic relevance, and intent matching.
        Return only a number between 0 and 1.
      `;
      
      const result = await spark.llm(prompt, 'gpt-4o-mini');
      const score = parseFloat(result.trim());
      return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 1);
    } catch {
      return 0;
    }
  };

  const generateAISummary = async (article: Article, query: string): Promise<string> => {
    try {
      const prompt = spark.llmPrompt`
        Generate a brief summary (2-3 sentences) of why this article is relevant to the search query.
        
        Search Query: "${query}"
        Article Title: "${article.title}"
        Article Content: "${article.excerpt}"
        
        Write in Arabic and focus on the connection to the search query.
      `;
      
      const result = await spark.llm(prompt, 'gpt-4o-mini');
      return result.trim();
    } catch {
      return '';
    }
  };

  const passesFilters = (article: Article, filters: SearchFilters): boolean => {
    // Category filter
    if (filters.category !== 'all' && article.category?.id !== filters.category) {
      return false;
    }
    
    // Author filter
    if (filters.author !== 'all' && article.author.id !== filters.author) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && article.status !== filters.status) {
      return false;
    }
    
    // Language filter
    if (filters.language !== 'all' && article.language !== filters.language) {
      return false;
    }
    
    // Priority filter
    if (filters.priority !== 'all' && article.priority !== filters.priority) {
      return false;
    }
    
    // Media filter
    if (filters.hasMedia && !article.featuredImage) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const articleDate = new Date(article.createdAt);
      const now = new Date();
      const daysDiff = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 1) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'year':
          if (daysDiff > 365) return false;
          break;
      }
    }
    
    return true;
  };

  const handleSearch = () => {
    performAISearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      author: 'all',
      dateRange: 'all',
      status: 'all',
      hasMedia: false,
      language: 'all',
      priority: 'all'
    });
  };

  // Auto-generate suggestions when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        generateSuggestions(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MagnifyingGlass className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">البحث الذكي</h1>
          <p className="text-muted-foreground">بحث متقدم مدعوم بالذكاء الاصطناعي</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="ابحث في المقالات، العناوين، المحتوى، العلامات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                    <MagnifyingGlass className="h-4 w-4" />
                  )}
                  بحث
                </Button>
              </div>

              {/* Search Suggestions */}
              {suggestions.length > 0 && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-right px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSuggestions([]);
                        performAISearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">عمليات بحث سابقة:</span>
                {searchHistory.slice(0, 5).map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setSearchQuery(term);
                      performAISearch(term);
                    }}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">النتائج</TabsTrigger>
          <TabsTrigger value="filters">التصفية</TabsTrigger>
        </TabsList>

        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                تصفية النتائج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">التصنيف</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التصنيفات</SelectItem>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nameAr || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">تاريخ النشر</label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as SearchFilters['dateRange'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">الأسبوع الماضي</SelectItem>
                      <SelectItem value="month">الشهر الماضي</SelectItem>
                      <SelectItem value="year">السنة الماضية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الحالة</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as SearchFilters['status'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                      <SelectItem value="review">قيد المراجعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">اللغة</label>
                  <Select value={filters.language} onValueChange={(value) => setFilters(prev => ({ ...prev, language: value as SearchFilters['language'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع اللغات</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الأولوية</label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as SearchFilters['priority'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                      <SelectItem value="high">مرتفع</SelectItem>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="low">منخفض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasMedia"
                    checked={filters.hasMedia}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasMedia: e.target.checked }))}
                  />
                  <label htmlFor="hasMedia" className="text-sm">يحتوي على وسائط</label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} variant="default">
                  تطبيق التصفية
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  مسح التصفية
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                تم العثور على {searchResults.length} نتيجة
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  ترتيب بالصلة
                </Button>
                <Button size="sm" variant="outline">
                  ترتيب بالتاريخ
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card key={result.article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {result.article.featuredImage && (
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={result.article.featuredImage}
                          alt={result.article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-primary"
                              onClick={() => onArticleEdit(result.article)}>
                            {result.article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            بواسطة {result.article.author.nameAr || result.article.author.name} • 
                            {new Date(result.article.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(result.relevanceScore * 100)}% صلة
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {result.article.excerpt}
                      </p>
                      
                      {result.aiSummary && (
                        <div className="p-3 bg-accent/10 rounded-lg">
                          <p className="text-sm">
                            <Brain className="inline h-4 w-4 mr-1" />
                            {result.aiSummary}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {result.matchReason.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {result.article.analytics?.views || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-3 w-3" />
                            {result.article.analytics?.shares || 0}
                          </div>
                          <Button size="sm" onClick={() => onArticleEdit(result.article)}>
                            تحرير
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <Card>
              <CardContent className="text-center py-12">
                <MagnifyingGlass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم العثور على مقالات تطابق بحثك "{searchQuery}"
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">جرب:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• استخدام كلمات مختلفة</li>
                    <li>• تقليل التصفية المطبقة</li>
                    <li>• البحث في جميع التصنيفات</li>
                    <li>• التحقق من الإملاء</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}