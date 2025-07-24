import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Tag,
  FileText,
  Image as ImageIcon,
  Video,
  FileAudio,
  Calendar,
  TrendingUp,
  Eye,
  Heart,
  Share,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from '@phosphor-icons/react';
import { searchService, SearchQuery, SearchResult, SearchResponse } from '@/lib/searchService';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories, mockTags, mockMediaFiles } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AISearchProps {
  onResultSelect?: (result: SearchResult) => void;
  onArticleEdit?: (articleId: string) => void;
  className?: string;
}

export function AISearch({ onResultSelect, onArticleEdit, className }: AISearchProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [articles] = useKV('sabq-articles', mockArticles);
  const [mediaFiles] = useKV('sabq-media-files', mockMediaFiles);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SearchQuery['filters']>({});
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useKV<string[]>('search-history', []);
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'media'>('all');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize search service
  useEffect(() => {
    searchService.initialize({
      articles,
      mediaFiles,
      categories: mockCategories,
      tags: mockTags
    });
  }, [articles, mediaFiles]);

  // Handle search input with debouncing
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.trim().length > 0) {
      // Get suggestions with debouncing
      debounceRef.current = setTimeout(async () => {
        try {
          const searchSuggestions = await searchService.getSuggestions(value);
          setSuggestions(searchSuggestions.map(s => s.text));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to get suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      const searchQueryObj: SearchQuery = {
        text: searchText,
        filters: selectedFilters,
        sortBy: 'relevance',
        page: 1,
        limit: 50
      };
      
      const results = await searchService.search(searchQueryObj);
      setSearchResults(results);
      
      // Add to search history
      if (!searchHistory.includes(searchText)) {
        setSearchHistory(prev => [searchText, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        results: [],
        totalCount: 0,
        suggestions: [],
        facets: {
          categories: [],
          authors: [],
          languages: [],
          mediaTypes: []
        },
        queryTime: 0
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedFilters, searchHistory, setSearchHistory]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Filter results by type
  const filteredResults = searchResults?.results.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'articles') return result.type === 'article';
    if (activeTab === 'media') return result.type === 'media';
    return true;
  }) || [];

  // Render search result
  const renderSearchResult = (result: SearchResult) => {
    const isArticle = result.type === 'article';
    
    return (
      <Card 
        key={result.id} 
        className="cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary"
        onClick={() => {
          if (onResultSelect) {
            onResultSelect(result);
          } else if (isArticle && onArticleEdit) {
            onArticleEdit(result.id);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail/Icon */}
            <div className="flex-shrink-0">
              {isArticle ? (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                  {result.metadata.thumbnailUrl ? (
                    <img 
                      src={result.metadata.thumbnailUrl} 
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {result.metadata.mimeType?.startsWith('image/') ? (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      ) : result.metadata.mimeType?.startsWith('video/') ? (
                        <Video className="w-8 h-8 text-muted-foreground" />
                      ) : result.metadata.mimeType?.startsWith('audio/') ? (
                        <FileAudio className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate mb-1">
                    {isArabic && result.titleAr ? result.titleAr : result.title}
                  </h3>
                  
                  {result.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {isArabic && result.excerptAr ? result.excerptAr : result.excerpt}
                    </p>
                  )}
                  
                  {/* Highlights */}
                  {result.highlights.length > 0 && (
                    <div className="mb-2">
                      {result.highlights.slice(0, 2).map((highlight, index) => (
                        <p key={index} className="text-xs text-muted-foreground bg-yellow-50 p-1 rounded mb-1">
                          {highlight}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {isArticle && (
                      <>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{result.metadata.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{result.metadata.category}</span>
                        </div>
                        {result.metadata.analytics && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{result.metadata.analytics.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{result.metadata.analytics.likes}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {!isArticle && (
                      <div className="flex items-center gap-1">
                        <span>{(result.metadata.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(
                          new Date(result.metadata.createdAt || result.metadata.uploadedAt), 
                          'PP',
                          { locale: isArabic ? ar : undefined }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Score and type badge */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge variant={isArticle ? 'default' : 'secondary'} className="text-xs">
                    {isArticle ? (isArabic ? 'مقال' : 'Article') : (isArabic ? 'وسائط' : 'Media')}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{(result.score * 100).toFixed(0)}%</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {isArabic ? 'البحث الذكي' : 'AI-Powered Search'}
          </h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  performSearch();
                }
              }}
              placeholder={isArabic ? 'ابحث في المقالات والوسائط...' : 'Search articles and media...'}
              className="pl-10 pr-4 h-12 text-base"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {isSearching && (
              <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto"
            >
              <CardContent className="p-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={performSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            <Search className="w-4 h-4 mr-2" />
            {isArabic ? 'بحث' : 'Search'}
          </Button>
          
          <Select
            value={selectedFilters.category || ''}
            onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, category: value || undefined }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={isArabic ? 'الفئة' : 'Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{isArabic ? 'جميع الفئات' : 'All Categories'}</SelectItem>
              {mockCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {isArabic && category.nameAr ? category.nameAr : category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedFilters.language || 'both'}
            onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, language: value as any }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">{isArabic ? 'جميع اللغات' : 'All Languages'}</SelectItem>
              <SelectItem value="ar">{isArabic ? 'العربية' : 'Arabic'}</SelectItem>
              <SelectItem value="en">{isArabic ? 'الإنجليزية' : 'English'}</SelectItem>
            </SelectContent>
          </Select>
          
          {Object.keys(selectedFilters).length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedFilters({})}
            >
              <Filter className="w-4 h-4 mr-2" />
              {isArabic ? 'مسح المرشحات' : 'Clear Filters'}
            </Button>
          )}
        </div>
        
        {/* Search History */}
        {searchHistory.length > 0 && !searchResults && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isArabic ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((query, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => handleSuggestionSelect(query)}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? `${searchResults.totalCount.toLocaleString()} نتيجة في ${searchResults.queryTime} مللي ثانية`
                  : `${searchResults.totalCount.toLocaleString()} results in ${searchResults.queryTime}ms`
                }
              </p>
              
              {searchResults.suggestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isArabic ? 'اقتراحات:' : 'Suggestions:'}
                  </span>
                  {searchResults.suggestions.slice(0, 3).map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Result Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="all">
                {isArabic ? 'الكل' : 'All'} ({searchResults.results.length})
              </TabsTrigger>
              <TabsTrigger value="articles">
                {isArabic ? 'المقالات' : 'Articles'} ({searchResults.results.filter(r => r.type === 'article').length})
              </TabsTrigger>
              <TabsTrigger value="media">
                {isArabic ? 'الوسائط' : 'Media'} ({searchResults.results.filter(r => r.type === 'media').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {filteredResults.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredResults.map(renderSearchResult)}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isArabic ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                  <p className="text-muted-foreground">
                    {isArabic 
                      ? 'جرب تعديل مصطلحات البحث أو المرشحات'
                      : 'Try adjusting your search terms or filters'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Facets */}
          {(searchResults.facets.categories.length > 0 || 
            searchResults.facets.authors.length > 0 ||
            searchResults.facets.mediaTypes.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isArabic ? 'تصفية النتائج' : 'Refine Results'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchResults.facets.categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      {isArabic ? 'الفئات' : 'Categories'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.facets.categories.slice(0, 5).map(category => (
                        <Badge
                          key={category.name}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setSelectedFilters(prev => ({ ...prev, category: category.name }))}
                        >
                          {category.name} ({category.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.facets.authors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      {isArabic ? 'الكتاب' : 'Authors'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.facets.authors.slice(0, 5).map(author => (
                        <Badge
                          key={author.name}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setSelectedFilters(prev => ({ ...prev, author: author.name }))}
                        >
                          {author.name} ({author.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}