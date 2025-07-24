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
  subtitle?: string; // Enhanced: Optional subtitle field (max 250 chars)
  titleAr?: string;
  subtitleAr?: string; // Enhanced: Arabic subtitle
  content: string;
  contentAr?: string;
  excerpt: string;
  excerptAr?: string;
  smartSummary?: string; // Enhanced: AI-generated smart summary
  smartSummaryAr?: string;
  author: User;
  coAuthors?: User[];
  category: Category;
  tags: Tag[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  scheduledAt?: Date;
  publishSettings?: { // Enhanced: Publishing settings
    publishNow: boolean;
    scheduledTime?: Date;
    notifySubscribers: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  featuredImageSettings?: { // Enhanced: Image settings
    altText?: string;
    caption?: string;
    cropArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
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
  nameEn?: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
}

export interface Tag {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  color?: string;
  type?: 'general' | 'location' | 'person' | 'organization' | 'event';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    relatedTerms?: string[];
    popularity?: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  color?: string;
  type?: 'general' | 'location' | 'person' | 'organization' | 'event';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    relatedTerms?: string[];
    popularity?: number;
  };
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

// Real-time Collaborative Editing Types
export interface CollaborativeSession {
  id: string;
  articleId: string;
  participants: CollaborativeUser[];
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  lockTimeout: number; // seconds
}

// Media Management Types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  altAr?: string;
  caption?: string;
  captionAr?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata: MediaMetadata;
  optimizations: ImageOptimization[];
  tags: string[];
  folder?: string;
  copyright?: CopyrightInfo;
  usage: MediaUsage[];
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number; // for video/audio
  format: string;
  colorProfile?: string;
  hasTransparency?: boolean;
  orientation?: number;
  location?: GeoLocation;
  camera?: CameraInfo;
  isOptimized: boolean;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
}

export interface ImageOptimization {
  id: string;
  type: 'resize' | 'compress' | 'format-convert' | 'quality-adjust';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalUrl: string;
  optimizedUrl: string;
  settings: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    progressive?: boolean;
    interlaced?: boolean;
  };
  sizeBefore: number;
  sizeAfter: number;
  compressionRatio: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface CameraInfo {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  flash?: boolean;
}

export interface CopyrightInfo {
  owner: string;
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'rights-managed' | 'royalty-free' | 'editorial-use' | 'custom';
  attribution?: string;
  restrictions?: string[];
  expiryDate?: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface MediaUsage {
  articleId: string;
  articleTitle: string;
  usageType: 'featured' | 'gallery' | 'inline' | 'thumbnail';
  usedAt: Date;
  usedBy: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  nameAr?: string;
  parentId?: string;
  path: string;
  createdBy: string;
  createdAt: Date;
  permissions: FolderPermission[];
  isPublic: boolean;
  color?: string;
}

export interface FolderPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  canUpload: boolean;
  canDelete: boolean;
  canMove: boolean;
  assignedAt: Date;
}

export interface MediaFilter {
  type?: 'image' | 'video' | 'audio' | 'document';
  folder?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  uploadedBy?: string;
  search?: string;
  sortBy?: 'date' | 'name' | 'size' | 'usage';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BulkOperation {
  id: string;
  type: 'move' | 'delete' | 'tag' | 'optimize' | 'export';
  mediaIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: number; // 0-100
  results: {
    successful: number;
    failed: number;
    errors: string[];
  };
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  cursor?: CursorPosition;
  selection?: TextSelection;
  color: string; // Unique color for this session
  isTyping: boolean;
  lastSeen: Date;
  connectionStatus: 'online' | 'away' | 'offline';
}

export interface CursorPosition {
  line: number;
  column: number;
  section: 'title' | 'content' | 'excerpt';
}

export interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
  section: 'title' | 'content' | 'excerpt';
}

export interface CollaborativeOperation {
  id: string;
  sessionId: string;
  userId: string;
  type: 'insert' | 'delete' | 'format' | 'cursor-move' | 'selection-change';
  section: 'title' | 'content' | 'excerpt' | 'tags' | 'category';
  position: {
    index: number;
    length?: number;
  };
  content?: string;
  formatting?: TextFormatting;
  timestamp: Date;
  appliedBy: string[];
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  listType?: 'ordered' | 'unordered' | 'none';
  heading?: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export interface CollaborativeComment {
  id: string;
  articleId: string;
  sessionId: string;
  author: CollaborativeUser;
  content: string;
  position: {
    section: 'title' | 'content' | 'excerpt';
    startIndex: number;
    endIndex: number;
    selectedText: string;
  };
  type: 'comment' | 'suggestion' | 'approval' | 'question';
  status: 'open' | 'resolved' | 'dismissed';
  replies: CollaborativeComment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface CollaborativeChanges {
  articleId: string;
  sessionId: string;
  changes: {
    field: 'title' | 'content' | 'excerpt' | 'tags' | 'category' | 'status';
    oldValue: any;
    newValue: any;
    author: CollaborativeUser;
    timestamp: Date;
    approved: boolean;
    approvedBy?: string;
  }[];
  conflictResolution?: {
    conflicts: ConflictResolution[];
    resolvedAt: Date;
    resolvedBy: string;
  };
}

export interface ConflictResolution {
  id: string;
  type: 'merge' | 'overwrite' | 'manual';
  field: string;
  conflictingChanges: {
    user1: { userId: string; value: any; timestamp: Date };
    user2: { userId: string; value: any; timestamp: Date };
  };
  resolution: any;
  resolvedBy: string;
  resolvedAt: Date;
}

export interface CollaborativePermissions {
  userId: string;
  articleId: string;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canApprove: boolean;
    canPublish: boolean;
    canInviteOthers: boolean;
    sectionsAccess: ('title' | 'content' | 'excerpt' | 'metadata')[];
  };
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

// Daily Smart Doses Types
export interface DosePhrase {
  id: string;
  text: string;
  textAr: string;
  category: 'morning' | 'noon' | 'evening' | 'night';
  type: 'headline' | 'subheadline';
  tone: 'energetic' | 'informative' | 'calm' | 'analytical';
  isActive: boolean;
  usage_count: number;
  last_used?: Date;
  createdAt: Date;
}

export interface DailyDose {
  id: string;
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  date: Date;
  headline: DosePhrase;
  subheadline: DosePhrase;
  content: {
    summary: string;
    summaryAr: string;
    articles: string[]; // Article IDs
    insights: string[];
    tip?: string;
    tipAr?: string;
  };
  audioContent?: {
    url: string;
    duration: number;
    voice: string;
    generatedAt: Date;
  };
  visualContent?: {
    backgroundImage?: string;
    infographic?: string;
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
  };
  analytics: {
    views: number;
    shares: number;
    audioPlays: number;
    averageReadTime: number;
    engagement: number;
  };
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  generatedBy: 'ai' | 'manual' | 'hybrid';
  createdAt: Date;
  publishedAt?: Date;
  metadata: {
    aiModel?: string;
    processingTime?: number;
    sourceArticles: {
      id: string;
      title: string;
      weight: number; // How much this article influenced the dose
    }[];
  };
}

export interface DoseTemplate {
  id: string;
  name: string;
  nameAr: string;
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  structure: {
    includeWeather?: boolean;
    includeAnalytics?: boolean;
    includeTrending?: boolean;
    includePersonalized?: boolean;
    maxArticles: number;
    preferredCategories?: string[];
    tone: 'professional' | 'casual' | 'urgent' | 'calming';
  };
  audioSettings: {
    voice: string;
    speed: number;
    includeMusic: boolean;
    musicVolume?: number;
  };
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface DoseSchedule {
  id: string;
  timeSlots: {
    morning: { time: string; enabled: boolean; template?: string };
    noon: { time: string; enabled: boolean; template?: string };
    evening: { time: string; enabled: boolean; template?: string };
    night: { time: string; enabled: boolean; template?: string };
  };
  timezone: string;
  autoGenerate: boolean;
  moderationRequired: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    slack?: boolean;
  };
  isActive: boolean;
  createdBy: string;
  updatedAt: Date;
}

export interface DoseAnalytics {
  doseId: string;
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  date: Date;
  performance: {
    totalViews: number;
    uniqueViews: number;
    averageReadTime: number;
    bounceRate: number;
    shareRate: number;
    audioCompletionRate: number;
    clickThroughRate: number;
  };
  audienceMetrics: {
    demographics: {
      age: Record<string, number>;
      location: Record<string, number>;
      device: Record<string, number>;
    };
    behaviorPatterns: {
      preferredTime: string;
      averageEngagement: number;
      returnVisitor: boolean;
    };
  };
  contentMetrics: {
    mostViewedArticle: string;
    averageScrollDepth: number;
    popularTags: string[];
    sentimentScore: number;
  };
}

// Audio Editor Types
export interface AudioSegment {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  pause: {
    before: number;
    after: number;
  };
  effects: {
    fade: { in: number; out: number };
    echo: number;
    reverb: number;
    noise: boolean;
  };
  type: 'text' | 'intro' | 'outro' | 'transition' | 'music' | 'sfx';
  isLocked: boolean;
  audioUrl?: string;
  optimizedText?: string;
  recordedAt?: Date;
}

export interface AudioProject {
  id: string;
  name: string;
  articleId: string;
  article: Article;
  segments: AudioSegment[];
  globalSettings: {
    outputFormat: 'mp3' | 'wav' | 'aac';
    sampleRate: 22050 | 44100 | 48000;
    bitrate: 128 | 192 | 256 | 320;
    normalize: boolean;
    limitPeaks: boolean;
    backgroundMusic: {
      enabled: boolean;
      url?: string;
      volume: number;
      fadeIn: number;
      fadeOut: number;
    };
  };
  metadata: {
    title: string;
    author: string;
    description: string;
    language: 'ar' | 'en';
    genre: string;
    thumbnail?: string;
  };
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  outputUrl?: string;
  waveformData?: number[];
}