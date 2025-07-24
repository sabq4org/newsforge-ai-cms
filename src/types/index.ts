export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: 'admin' | 'editor-in-chief' | 'section-editor' | 'journalist' | 'opinion-writer' | 'analyst';
  avatar?: string;
  department?: string;
  permissions: Permission[];
  language: 'en' | 'ar' | 'both';
  createdAt: Date;
  lastActive: Date;
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'publish' | 'schedule' | 'moderate' | 'analytics';
  resource: 'articles' | 'users' | 'categories' | 'tags' | 'comments' | 'settings' | 'ai-tools';
  scope?: 'own' | 'department' | 'all';
}

export interface Article {
  id: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  excerpt: string;
  excerptAr?: string;
  author: User;
  coAuthors?: User[];
  category: Category;
  tags: Tag[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  galleryImages?: string[];
  audioUrl?: string;
  videoUrl?: string;
  location?: string;
  language: 'en' | 'ar' | 'both';
  priority: 'low' | 'normal' | 'high' | 'breaking';
  socialMediaCard?: {
    title: string;
    description: string;
    image: string;
  };
  analytics: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    comments: number;
    readTime: number;
    scrollDepth: number;
    bounceRate: number;
    clickThroughRate: number;
  };
  // AI Optimization fields
  predictiveAnalytics?: PredictiveAnalytics;
  contentAnalysis?: ContentAnalysis;
  abTests?: ABTest[];
  aiOptimizations?: AIOptimization[];
  performanceHistory?: PerformanceMetrics[];
  copyrightCheck?: CopyrightCheck;
  moderationFlags?: ModerationFlag[];
  relatedArticles?: string[];
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

// New advanced features types
export interface CopyrightCheck {
  id: string;
  articleId: string;
  status: 'pending' | 'passed' | 'flagged' | 'manual-review';
  plagiarismScore: number; // 0-100
  flaggedSources?: string[];
  imageRights?: {
    url: string;
    licensed: boolean;
    source?: string;
  }[];
  lastChecked: Date;
}

export interface ModerationFlag {
  id: string;
  type: 'sensitivity' | 'bias' | 'outdated' | 'factual' | 'legal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  autoDetected: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface UserPersonalization {
  userId: string;
  preferences: {
    categories: string[];
    topics: string[];
    readingTime: 'short' | 'medium' | 'long';
    language: 'en' | 'ar' | 'both';
  };
  behaviorData: {
    sessionTime: number;
    articlesRead: number;
    shareFrequency: number;
    commentActivity: number;
    timeSlotActivity: Record<string, number>;
  };
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: string[];
  dailyNewsMeal?: {
    articles: string[];
    opinion: string;
    newTopic: string;
    generatedAt: Date;
  };
}

export interface Comment {
  id: string;
  articleId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  parentId?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy?: string;
  moderatedAt?: Date;
  createdAt: Date;
  likes: number;
  replies?: Comment[];
}

export interface AIPromptAction {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  prompt: string;
  category: 'optimization' | 'generation' | 'analysis' | 'translation';
  inputFields: {
    name: string;
    type: 'text' | 'number' | 'select';
    required: boolean;
    options?: string[];
  }[];
  outputType: 'text' | 'structured' | 'suggestions';
}

export interface SchedulingSlot {
  id: string;
  name: string;
  nameAr: string;
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  targetAudience: string;
  priority: number;
  active: boolean;
}

export interface NotificationPreference {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    newArticle: boolean;
    review: boolean;
    approval: boolean;
    deadline: boolean;
    analytics: boolean;
    breaking: boolean;
  };
}