export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  joinedAt?: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  readingStats: ReadingStats;
  engagementScore: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: Badge[];
  dailyMeal: DailyMeal;
  activities?: UserActivity[];
  recommendations?: PersonalizedRecommendation[];
}

export interface UserPreferences {
  categories: string[];
  timeSlots: ('morning' | 'afternoon' | 'evening' | 'night')[];
  contentTypes: ('news' | 'analysis' | 'opinion' | 'sports' | 'tech' | 'business')[];
  language?: 'ar' | 'en';
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
  breakingNews: boolean;
  dailyRecommendations: boolean;
  followedTopics: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  readingHistoryVisible: boolean;
  analyticsOptOut: boolean;
}

export interface UserActivity {
  id: string;
  type: 'read' | 'like' | 'share' | 'comment' | 'save' | 'view';
  articleId: string;
  timestamp: Date;
  duration?: number; // in seconds for read activities
  scrollDepth?: number; // percentage for read activities
  metadata?: Record<string, any>;
}

export interface PersonalizedRecommendation {
  id: string;
  articleId: string;
  userId: string;
  score: number;
  reason: string;
  category: string;
  timestamp: Date;
  viewed: boolean;
  clicked: boolean;
  feedback?: RecommendationFeedback;
}

export interface RecommendationFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  reason?: string;
  comment?: string;
  timestamp: Date;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  users: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  readingFrequency?: {
    min?: number;
    max?: number;
    period: 'daily' | 'weekly' | 'monthly';
  };
  preferredCategories?: string[];
  readingTimes?: string[];
  engagementLevel?: 'low' | 'medium' | 'high';
  joinedWithin?: number; // days
  lastActiveWithin?: number; // days
}

export interface UserInteraction {
  userId: string;
  sessionId: string;
  articleId: string;
  action: 'view' | 'read' | 'like' | 'share' | 'save' | 'comment';
  timestamp: Date;
  duration?: number;
  scrollDepth?: number;
  source: 'homepage' | 'recommendation' | 'search' | 'category' | 'direct';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location?: {
    country: string;
    city?: string;
  };
}

export interface UserBehaviorAnalysis {
  userId: string;
  analysisDate: Date;
  readingPatterns: {
    preferredTimes: string[];
    averageSessionDuration: number;
    averageArticlesPerSession: number;
    mostActiveDay: string;
    readingSpeed: number; // words per minute
  };
  contentPreferences: {
    topCategories: { category: string; percentage: number; }[];
    contentLength: 'short' | 'medium' | 'long' | 'mixed';
    contentType: string[];
  };
  engagementMetrics: {
    interactionRate: number;
    returnVisitorRate: number;
    averageTimeOnSite: number;
    bounceRate: number;
  };
  personalityProfile: {
    explorationLevel: 'conservative' | 'moderate' | 'adventurous';
    socialEngagement: 'low' | 'medium' | 'high';
    newsConsumption: 'casual' | 'regular' | 'heavy';
  };
}

// New interfaces for enhanced reading behavior tracking
export interface ReadingStats {
  totalArticles: number;
  totalReadTime: number; // in minutes
  avgSessionTime: number; // in minutes
  favoriteCategory: string;
  readingStreak: number; // consecutive days
  lastActiveDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'engagement' | 'streak' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

export interface DailyMeal {
  articles: any[]; // Array of recommended articles
  generatedAt: Date;
  consumed: boolean;
}

export interface ReadingSession {
  id: string;
  userId: string;
  article: any; // Article interface
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  completion?: number; // percentage 0-100
  engagement?: number; // score 0-100
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    screenSize: string;
    userAgent: string;
  };
  behaviorData?: {
    scrollEvents: ScrollEvent[];
    clickEvents: ClickEvent[];
    pauseEvents: PauseEvent[];
    interactionTimeline: InteractionEvent[];
  };
}

export interface ScrollEvent {
  timestamp: Date;
  scrollTop: number;
  scrollPercentage: number;
  direction: 'up' | 'down';
}

export interface ClickEvent {
  timestamp: Date;
  elementType: string;
  elementId?: string;
  coordinates: { x: number; y: number };
}

export interface PauseEvent {
  timestamp: Date;
  duration: number; // in seconds
  scrollPosition: number;
}

export interface InteractionEvent {
  timestamp: Date;
  type: 'scroll' | 'click' | 'pause' | 'resume' | 'blur' | 'focus';
  data?: any;
}

export interface PersonalizationData {
  readingPattern: {
    preferredTimes: {
      hour: number;
      dayOfWeek: number;
      frequency: number;
    }[];
    sessionDuration: number;
    contentPreferences: {
      category: string;
      engagement: number;
      completion: number;
    }[];
    deviceUsage: {
      mobile: number;
      desktop: number;
    };
  };
  behaviorScore: number;
  lastAnalysis: Date;
}