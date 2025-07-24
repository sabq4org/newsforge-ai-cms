export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'reporter';
  avatar?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  category: Category;
  tags: Tag[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  analytics: {
    views: number;
    likes: number;
    shares: number;
  };
  // AI Optimization fields
  predictiveAnalytics?: PredictiveAnalytics;
  contentAnalysis?: ContentAnalysis;
  abTests?: ABTest[];
  aiOptimizations?: AIOptimization[];
  performanceHistory?: PerformanceMetrics[];
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  color: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
}

export interface Analytics {
  totalViews: number;
  totalArticles: number;
  publishedToday: number;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentActivity: Array<{
    id: string;
    type: 'publish' | 'edit' | 'create';
    article: string;
    user: string;
    timestamp: Date;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  engagementOverTime: Array<{
    date: string;
    likes: number;
    shares: number;
    comments: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    views: number;
    articles: number;
    engagementRate: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
    users: number;
  }>;
  trafficSources: Array<{
    source: string;
    percentage: number;
    visitors: number;
  }>;
  authorPerformance: Array<{
    authorId: string;
    authorName: string;
    totalViews: number;
    totalArticles: number;
    avgEngagement: number;
  }>;
  readingTime: {
    averageTime: number;
    bounceRate: number;
    completionRate: number;
  };
}

export interface Language {
  code: 'en' | 'ar';
  name: string;
  direction: 'ltr' | 'rtl';
}

// AI Performance Optimization Types
export interface PredictiveAnalytics {
  reachScore: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  predictedViews: number;
  predictedEngagement: number;
  optimalPublishTime: Date;
  factors: {
    titleScore: number;
    lengthScore: number;
    categoryTrend: number;
    timingScore: number;
    seasonalityScore: number;
  };
  recommendations: string[];
}

export interface ABTestVariant {
  id: string;
  type: 'headline' | 'summary' | 'thumbnail' | 'content';
  content: string;
  imageUrl?: string;
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    averageReadTime: number;
    bounceRate: number;
  };
  isWinner?: boolean;
  confidence?: number;
}

export interface ABTest {
  id: string;
  articleId: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  trafficSplit: number[]; // percentage split for each variant
  minimumSampleSize: number;
  currentSampleSize: number;
  statisticalSignificance: boolean;
  winnerVariantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIOptimization {
  id: string;
  articleId: string;
  type: 'headline' | 'content' | 'seo' | 'tone' | 'structure';
  priority: 'low' | 'medium' | 'high';
  suggestion: string;
  originalText: string;
  optimizedText: string;
  reason: string;
  impact: 'readability' | 'engagement' | 'seo' | 'clarity' | 'tone';
  estimatedImprovement: number; // percentage
  applied: boolean;
  createdAt: Date;
}

export interface ContentAnalysis {
  readabilityScore: number; // 0-100
  toneAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    formality: 'formal' | 'informal' | 'mixed';
    urgency: 'low' | 'medium' | 'high';
    emotion: string[];
  };
  seoAnalysis: {
    keywordDensity: Record<string, number>;
    metaDescription: string;
    suggestedTags: string[];
    internalLinkOpportunities: string[];
  };
  structureAnalysis: {
    paragraphCount: number;
    averageSentenceLength: number;
    headingStructure: string[];
    wordCount: number;
  };
  languageDetection: 'en' | 'ar' | 'mixed';
  optimizations: AIOptimization[];
}

export interface PerformanceMetrics {
  articleId: string;
  timestamp: Date;
  views: number;
  uniqueViews: number;
  averageReadTime: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  likes: number;
  scrollDepth: number;
  clickThroughRate?: number;
  source: 'organic' | 'social' | 'direct' | 'referral';
}