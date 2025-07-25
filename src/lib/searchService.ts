import { Article, Category, Tag, MediaFile, User } from '@/types';
import { safeToLowerCase, safeToString } from '@/lib/utils';

export interface SearchQuery {
  text: string;
  filters: {
    category?: string;
    author?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    language?: 'ar' | 'en' | 'both';
    status?: 'draft' | 'published' | 'scheduled';
    priority?: 'low' | 'normal' | 'high' | 'breaking';
  };
  sortBy?: 'relevance' | 'date' | 'views' | 'engagement';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  type: 'article' | 'media' | 'tag' | 'category';
  id: string;
  title: string;
  titleAr?: string;
  excerpt?: string;
  excerptAr?: string;
  score: number;
  highlights: string[];
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  suggestions: string[];
  facets: {
    categories: Array<{ name: string; count: number }>;
    authors: Array<{ name: string; count: number }>;
    languages: Array<{ language: string; count: number }>;
    mediaTypes: Array<{ type: string; count: number }>;
  };
  queryTime: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'entity';
  metadata?: Record<string, any>;
}

/**
 * AI-Powered Search Service for Sabq CMS
 * Provides intelligent search with Arabic language support and advanced filtering
 */
export class SearchService {
  private static instance: SearchService;
  private articles: Article[] = [];
  private mediaFiles: MediaFile[] = [];
  private categories: Category[] = [];
  private tags: Tag[] = [];

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Initialize search service with data
   */
  initialize(data: {
    articles: Article[];
    mediaFiles: MediaFile[];
    categories: Category[];
    tags: Tag[];
  }) {
    this.articles = data.articles;
    this.mediaFiles = data.mediaFiles;
    this.categories = data.categories;
    this.tags = data.tags;
  }

  /**
   * Perform AI-enhanced search
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // Enhanced search with AI analysis
      const enhancedQuery = await this.enhanceSearchQuery(query.text);
      
      // Search articles
      const articleResults = await this.searchArticles(enhancedQuery, query.filters);
      
      // Search media files
      const mediaResults = await this.searchMedia(enhancedQuery, query.filters);
      
      // Combine and rank results
      let allResults = [...articleResults, ...mediaResults];
      
      // Apply AI-powered ranking
      allResults = await this.applyAIRanking(allResults, enhancedQuery);
      
      // Apply sorting
      allResults = this.sortResults(allResults, query.sortBy || 'relevance');
      
      // Pagination
      const startIndex = ((query.page || 1) - 1) * (query.limit || 20);
      const endIndex = startIndex + (query.limit || 20);
      const paginatedResults = allResults.slice(startIndex, endIndex);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(query.text);
      
      // Calculate facets
      const facets = this.calculateFacets(allResults);
      
      return {
        results: paginatedResults,
        totalCount: allResults.length,
        suggestions,
        facets,
        queryTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        results: [],
        totalCount: 0,
        suggestions: [],
        facets: {
          categories: [],
          authors: [],
          languages: [],
          mediaTypes: []
        },
        queryTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSuggestions(partialQuery: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    // Article titles
    this.articles.forEach(article => {
      if (this.matchesPartial(article.title, partialQuery) || 
          (article.titleAr && this.matchesPartial(article.titleAr, partialQuery))) {
        suggestions.push({
          text: article.title,
          type: 'query',
          metadata: { type: 'article', id: article.id }
        });
      }
    });
    
    // Categories
    this.categories.forEach(category => {
      if (this.matchesPartial(category.name, partialQuery) ||
          (category.nameAr && this.matchesPartial(category.nameAr, partialQuery))) {
        suggestions.push({
          text: category.name,
          type: 'filter',
          metadata: { type: 'category', value: category.id }
        });
      }
    });
    
    // Tags
    this.tags.forEach(tag => {
      if (this.matchesPartial(tag.name, partialQuery) ||
          (tag.nameAr && this.matchesPartial(tag.nameAr, partialQuery))) {
        suggestions.push({
          text: tag.name,
          type: 'filter',
          metadata: { type: 'tag', value: tag.id }
        });
      }
    });
    
    // Limit and sort by relevance
    return suggestions
      .sort((a, b) => this.calculateSuggestionRelevance(b, partialQuery) - 
                      this.calculateSuggestionRelevance(a, partialQuery))
      .slice(0, 10);
  }

  /**
   * Enhanced search query using AI to understand context and intent
   */
  private async enhanceSearchQuery(query: string): Promise<string> {
    if (!query.trim()) return query;
    
    // Use Spark LLM for query enhancement
    try {
      const prompt = spark.llmPrompt`
        Enhance this Arabic/English search query for a news content management system.
        Original query: "${query}"
        
        Please:
        1. Expand synonyms and related terms
        2. Handle both Arabic and English variations
        3. Add relevant news-related keywords
        4. Maintain the original intent
        
        Return only the enhanced search terms, separated by spaces.
      `;
      
      const enhancedQuery = await spark.llm(prompt, "gpt-4o-mini");
      return enhancedQuery.trim() || query;
    } catch (error) {
      console.error('AI query enhancement failed:', error);
      return query;
    }
  }

  /**
   * Search articles with enhanced scoring
   */
  private async searchArticles(query: string, filters: SearchQuery['filters']): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const article of this.articles) {
      // Apply filters first
      if (!this.matchesFilters(article, filters)) continue;
      
      const score = this.calculateArticleScore(article, query);
      if (score > 0) {
        const highlights = this.generateHighlights(article, query);
        
        results.push({
          type: 'article',
          id: article.id,
          title: article.title,
          titleAr: article.titleAr,
          excerpt: article.excerpt,
          excerptAr: article.excerptAr,
          score,
          highlights,
          metadata: {
            author: article.author?.name || 'غير محدد',
            category: article.category?.name || 'غير محدد',
            createdAt: article.createdAt,
            status: article.status,
            language: article.language,
            priority: article.priority,
            analytics: article.analytics
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Search media files
   */
  private async searchMedia(query: string, filters: SearchQuery['filters']): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const media of this.mediaFiles) {
      // Apply media type filter
      if (filters.mediaType) {
        const mediaType = this.getMediaType(media.mimeType);
        if (mediaType !== filters.mediaType) continue;
      }
      
      const score = this.calculateMediaScore(media, query);
      if (score > 0) {
        const highlights = this.generateMediaHighlights(media, query);
        
        results.push({
          type: 'media',
          id: media.id,
          title: media.originalName,
          titleAr: media.altAr,
          excerpt: media.caption,
          excerptAr: media.captionAr,
          score,
          highlights,
          metadata: {
            mimeType: media.mimeType,
            size: media.size,
            uploadedAt: media.uploadedAt,
            tags: media.tags,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Apply AI-powered ranking to search results
   */
  private async applyAIRanking(results: SearchResult[], query: string): Promise<SearchResult[]> {
    // Enhanced ranking with engagement data and content quality
    return results.map(result => {
      let finalScore = result.score;
      
      // Boost based on engagement
      if (result.type === 'article' && result.metadata.analytics) {
        const analytics = result.metadata.analytics;
        const engagementScore = (analytics.views + analytics.likes * 5 + analytics.shares * 10) / 100;
        finalScore += engagementScore * 0.3;
      }
      
      // Boost recent content
      const daysSinceCreated = (Date.now() - new Date(result.metadata.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        finalScore += 0.2;
      }
      
      // Boost breaking news
      if (result.metadata.priority === 'breaking') {
        finalScore += 0.5;
      }
      
      return { ...result, score: finalScore };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate relevance score for articles
   */
  private calculateArticleScore(article: Article, query: string): number {
    let score = 0;
    const queryTerms = this.tokenize(query);
    
    // Title match (highest weight)
    score += this.calculateTextMatch(article.title, queryTerms) * 3;
    if (article.titleAr) {
      score += this.calculateTextMatch(article.titleAr, queryTerms) * 3;
    }
    
    // Content match
    score += this.calculateTextMatch(article.content, queryTerms) * 1;
    if (article.contentAr) {
      score += this.calculateTextMatch(article.contentAr, queryTerms) * 1;
    }
    
    // Excerpt match
    score += this.calculateTextMatch(article.excerpt, queryTerms) * 2;
    if (article.excerptAr) {
      score += this.calculateTextMatch(article.excerptAr, queryTerms) * 2;
    }
    
    // Tag matches
    article.tags.forEach(tag => {
      score += this.calculateTextMatch(tag.name, queryTerms) * 1.5;
      if (tag.nameAr) {
        score += this.calculateTextMatch(tag.nameAr, queryTerms) * 1.5;
      }
    });
    
    // Category match
    if (article.category?.name) {
      score += this.calculateTextMatch(article.category.name, queryTerms) * 1.2;
    }
    if (article.category?.nameAr) {
      score += this.calculateTextMatch(article.category.nameAr, queryTerms) * 1.2;
    }
    
    return score;
  }

  /**
   * Calculate relevance score for media files
   */
  private calculateMediaScore(media: MediaFile, query: string): number {
    let score = 0;
    const queryTerms = this.tokenize(query);
    
    // Filename match
    score += this.calculateTextMatch(media.originalName, queryTerms) * 2;
    
    // Alt text match
    if (media.alt) {
      score += this.calculateTextMatch(media.alt, queryTerms) * 2.5;
    }
    if (media.altAr) {
      score += this.calculateTextMatch(media.altAr, queryTerms) * 2.5;
    }
    
    // Caption match
    if (media.caption) {
      score += this.calculateTextMatch(media.caption, queryTerms) * 2;
    }
    if (media.captionAr) {
      score += this.calculateTextMatch(media.captionAr, queryTerms) * 2;
    }
    
    // Tag matches
    media.tags.forEach(tag => {
      score += this.calculateTextMatch(tag, queryTerms) * 1.5;
    });
    
    return score;
  }

  /**
   * Generate search suggestions
   */
  private async generateSuggestions(query: string): Promise<string[]> {
    const suggestions: Set<string> = new Set();
    
    // Add related terms from content
    const queryTerms = this.tokenize(query);
    
    // Find similar articles and extract key terms
    this.articles.forEach(article => {
      if (this.calculateTextMatch(article.title, queryTerms) > 0 ||
          this.calculateTextMatch(article.content, queryTerms) > 0) {
        
        // Add related tags
        article.tags.forEach(tag => {
          suggestions.add(tag.name);
          if (tag.nameAr) suggestions.add(tag.nameAr);
        });
        
        // Add category
        if (article.category?.name) {
          suggestions.add(article.category.name);
        }
        if (article.category?.nameAr) {
          suggestions.add(article.category.nameAr);
        }
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Helper methods
   */
  private tokenize(text: string): string[] {
    // Enhanced tokenization for Arabic and English with safe string handling
    const safeText = safeToString(text);
    return safeToLowerCase(safeText)
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 1);
  }

  private calculateTextMatch(text: string, queryTerms: string[]): number {
    const textTerms = this.tokenize(text);
    let matches = 0;
    
    queryTerms.forEach(queryTerm => {
      textTerms.forEach(textTerm => {
        if (textTerm.includes(queryTerm) || queryTerm.includes(textTerm)) {
          matches += textTerm === queryTerm ? 1 : 0.5;
        }
      });
    });
    
    return matches / Math.max(queryTerms.length, 1);
  }

  private matchesPartial(text: string, partial: string): boolean {
    const safeText = safeToLowerCase(safeToString(text));
    const safePartial = safeToLowerCase(safeToString(partial));
    return safeText.includes(safePartial);
  }

  private calculateSuggestionRelevance(suggestion: SearchSuggestion, query: string): number {
    return this.calculateTextMatch(suggestion.text, this.tokenize(query));
  }

  private matchesFilters(article: Article, filters: SearchQuery['filters']): boolean {
    if (filters.category && article.category?.id !== filters.category) return false;
    if (filters.author && article.author.id !== filters.author) return false;
    if (filters.language && filters.language !== 'both' && article.language !== filters.language) return false;
    if (filters.status && article.status !== filters.status) return false;
    if (filters.priority && article.priority !== filters.priority) return false;
    
    if (filters.dateRange) {
      const articleDate = new Date(article.createdAt);
      if (articleDate < filters.dateRange.start || articleDate > filters.dateRange.end) return false;
    }
    
    return true;
  }

  private getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private generateHighlights(article: Article, query: string): string[] {
    const highlights: string[] = [];
    const queryTerms = this.tokenize(query);
    
    // Extract highlighted snippets from content
    const contentWords = safeToString(article.content).split(' ');
    queryTerms.forEach(term => {
      for (let i = 0; i < contentWords.length; i++) {
        const safeWord = safeToLowerCase(contentWords[i]);
        if (safeWord.includes(term)) {
          const start = Math.max(0, i - 3);
          const end = Math.min(contentWords.length, i + 4);
          const snippet = contentWords.slice(start, end).join(' ');
          highlights.push(`...${snippet}...`);
          break;
        }
      }
    });
    
    return highlights.slice(0, 3);
  }

  private generateMediaHighlights(media: MediaFile, query: string): string[] {
    const highlights: string[] = [];
    const safeQuery = safeToLowerCase(safeToString(query));
    
    if (media.alt && safeToLowerCase(safeToString(media.alt)).includes(safeQuery)) {
      highlights.push(media.alt);
    }
    if (media.caption && safeToLowerCase(safeToString(media.caption)).includes(safeQuery)) {
      highlights.push(media.caption);
    }
    
    return highlights;
  }

  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'date':
        return results.sort((a, b) => 
          new Date(b.metadata.createdAt || 0).getTime() - 
          new Date(a.metadata.createdAt || 0).getTime()
        );
      case 'views':
        return results.sort((a, b) => 
          (b.metadata.analytics?.views || 0) - (a.metadata.analytics?.views || 0)
        );
      case 'engagement':
        return results.sort((a, b) => {
          const aEngagement = (a.metadata.analytics?.likes || 0) + (a.metadata.analytics?.shares || 0);
          const bEngagement = (b.metadata.analytics?.likes || 0) + (b.metadata.analytics?.shares || 0);
          return bEngagement - aEngagement;
        });
      default: // relevance
        return results.sort((a, b) => b.score - a.score);
    }
  }

  private calculateFacets(results: SearchResult[]) {
    const categories = new Map<string, number>();
    const authors = new Map<string, number>();
    const languages = new Map<string, number>();
    const mediaTypes = new Map<string, number>();
    
    results.forEach(result => {
      if (result.metadata.category) {
        categories.set(result.metadata.category, (categories.get(result.metadata.category) || 0) + 1);
      }
      if (result.metadata.author) {
        authors.set(result.metadata.author, (authors.get(result.metadata.author) || 0) + 1);
      }
      if (result.metadata.language) {
        languages.set(result.metadata.language, (languages.get(result.metadata.language) || 0) + 1);
      }
      if (result.metadata.mimeType) {
        const mediaType = this.getMediaType(result.metadata.mimeType);
        mediaTypes.set(mediaType, (mediaTypes.get(mediaType) || 0) + 1);
      }
    });
    
    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      authors: Array.from(authors.entries()).map(([name, count]) => ({ name, count })),
      languages: Array.from(languages.entries()).map(([language, count]) => ({ language, count })),
      mediaTypes: Array.from(mediaTypes.entries()).map(([type, count]) => ({ type, count }))
    };
  }
}

export const searchService = SearchService.getInstance();