import { User, Article, Category, Tag, Analytics, PredictiveAnalytics, ContentAnalysis, AIOptimization, Permission, MediaFile } from '@/types';

// Mock data for Sabq Althakiyah development
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Al-Mansouri',
    nameAr: 'أحمد المنصوري',
    email: 'ahmed@sabq.sa',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Management',
    permissions: [],
    language: 'both',
    createdAt: new Date('2023-01-01'),
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Fatima Al-Zahra',
    nameAr: 'فاطمة الزهراء',
    email: 'fatima@sabq.sa',
    role: 'editor-in-chief',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69c4d00?w=150',
    department: 'Editorial',
    permissions: [],
    language: 'both',
    createdAt: new Date('2023-01-15'),
    lastActive: new Date()
  },
  {
    id: '3',
    name: 'Omar Al-Rashid',
    nameAr: 'عمر الراشد',
    email: 'omar@sabq.sa',
    role: 'section-editor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    department: 'Politics',
    permissions: [],
    language: 'ar',
    createdAt: new Date('2023-02-01'),
    lastActive: new Date()
  },
  {
    id: '4',
    name: 'Nadia Al-Salam',
    nameAr: 'نادية السلام',
    email: 'nadia@sabq.sa',
    role: 'journalist',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    department: 'Politics',
    permissions: [],
    language: 'ar',
    createdAt: new Date('2023-03-01'),
    lastActive: new Date()
  },
  {
    id: '5',
    name: 'Dr. Khalid Al-Harbi',
    nameAr: 'د. خالد الحربي',
    email: 'khalid@sabq.sa',
    role: 'opinion-writer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    department: 'Opinion',
    permissions: [],
    language: 'ar',
    createdAt: new Date('2023-02-15'),
    lastActive: new Date()
  },
  {
    id: '6',
    name: 'Layla Al-Otaibi',
    nameAr: 'ليلى العتيبي',
    email: 'layla@sabq.sa',
    role: 'analyst',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    department: 'Analytics',
    permissions: [],
    language: 'both',
    createdAt: new Date('2023-03-15'),
    lastActive: new Date()
  }
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Politics', nameAr: 'السياسة', slug: 'politics', color: '#ef4444' },
  { id: '2', name: 'Technology', nameAr: 'التكنولوجيا', slug: 'technology', color: '#3b82f6' },
  { id: '3', name: 'Sports', nameAr: 'الرياضة', slug: 'sports', color: '#10b981' },
  { id: '4', name: 'Business', nameAr: 'الأعمال', slug: 'business', color: '#f59e0b' },
  { id: '5', name: 'Culture', nameAr: 'الثقافة', slug: 'culture', color: '#8b5cf6' },
  { id: '6', name: 'Local News', nameAr: 'الأخبار المحلية', slug: 'local', color: '#06b6d4' },
  { id: '7', name: 'International', nameAr: 'دولية', slug: 'international', color: '#84cc16' },
  { id: '8', name: 'Economy', nameAr: 'الاقتصاد', slug: 'economy', color: '#f97316' },
  { id: '9', name: 'Health', nameAr: 'الصحة', slug: 'health', color: '#ec4899' },
  { id: '10', name: 'Education', nameAr: 'التعليم', slug: 'education', color: '#6366f1' }
];

export const mockTags: Tag[] = [
  { id: '1', name: 'Breaking News', nameAr: 'أخبار عاجلة', slug: 'breaking-news' },
  { id: '2', name: 'Analysis', nameAr: 'تحليل', slug: 'analysis' },
  { id: '3', name: 'Interview', nameAr: 'مقابلة', slug: 'interview' },
  { id: '4', name: 'Investigation', nameAr: 'تحقيق', slug: 'investigation' },
  { id: '5', name: 'Opinion', nameAr: 'رأي', slug: 'opinion' },
  { id: '6', name: 'Saudi Arabia', nameAr: 'السعودية', slug: 'saudi-arabia' },
  { id: '7', name: 'Vision 2030', nameAr: 'رؤية 2030', slug: 'vision-2030' },
  { id: '8', name: 'NEOM', nameAr: 'نيوم', slug: 'neom' },
  { id: '9', name: 'Digital Transformation', nameAr: 'التحول الرقمي', slug: 'digital-transformation' },
  { id: '10', name: 'Artificial Intelligence', nameAr: 'الذكاء الاصطناعي', slug: 'ai' }
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'رؤية 2030: تطورات جديدة في التحول الرقمي السعودي',
    titleAr: 'رؤية 2030: تطورات جديدة في التحول الرقمي السعودي',
    content: '<p>تشهد المملكة العربية السعودية تطورات متسارعة في مجال التحول الرقمي ضمن رؤية 2030، حيث تسعى القيادة الرشيدة إلى بناء مجتمع رقمي متقدم يواكب أحدث التطورات التقنية العالمية...</p>',
    contentAr: '<p>تشهد المملكة العربية السعودية تطورات متسارعة في مجال التحول الرقمي ضمن رؤية 2030، حيث تسعى القيادة الرشيدة إلى بناء مجتمع رقمي متقدم يواكب أحدث التطورات التقنية العالمية...</p>',
    excerpt: 'نظرة على أحدث التطورات في التحول الرقمي السعودي وأثرها على المجتمع والاقتصاد.',
    excerptAr: 'نظرة على أحدث التطورات في التحول الرقمي السعودي وأثرها على المجتمع والاقتصاد.',
    author: mockUsers[3],
    category: mockCategories[1],
    tags: [mockTags[6], mockTags[8], mockTags[9]],
    status: 'published',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    language: 'ar',
    priority: 'high',
    location: 'الرياض',
    socialMediaCard: {
      title: 'رؤية 2030: التحول الرقمي السعودي',
      description: 'تطورات جديدة في التحول الرقمي',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'
    },
    analytics: {
      views: 12547,
      uniqueViews: 8923,
      likes: 234,
      shares: 89,
      comments: 45,
      readTime: 180,
      scrollDepth: 75,
      bounceRate: 25,
      clickThroughRate: 8.5
    },
    relatedArticles: ['2', '3']
  },
  {
    id: '2',
    title: 'مدينة نيوم: مستقبل التكنولوجيا والابتكار',
    titleAr: 'مدينة نيوم: مستقبل التكنولوجيا والابتكار',
    content: '<p>تواصل مدينة نيوم تقدمها كأحد أهم المشاريع الطموحة في رؤية السعودية 2030، حيث تهدف إلى أن تكون نموذجاً عالمياً للمدن الذكية...</p>',
    contentAr: '<p>تواصل مدينة نيوم تقدمها كأحد أهم المشاريع الطموحة في رؤية السعودية 2030، حيث تهدف إلى أن تكون نموذجاً عالمياً للمدن الذكية...</p>',
    excerpt: 'آخر التطورات في مشروع نيوم وتأثيره على مستقبل التكنولوجيا في المنطقة.',
    excerptAr: 'آخر التطورات في مشروع نيوم وتأثيره على مستقبل التكنولوجيا في المنطقة.',
    author: mockUsers[0],
    category: mockCategories[1],
    tags: [mockTags[7], mockTags[8]],
    status: 'published',
    publishedAt: new Date('2024-01-14T14:00:00Z'),
    createdAt: new Date('2024-01-14T10:15:00Z'),
    updatedAt: new Date('2024-01-14T13:30:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    language: 'ar',
    priority: 'normal',
    location: 'نيوم',
    socialMediaCard: {
      title: 'نيوم: مستقبل التكنولوجيا',
      description: 'مدينة المستقبل تتشكل',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'
    },
    analytics: {
      views: 8934,
      uniqueViews: 6234,
      likes: 156,
      shares: 67,
      comments: 23,
      readTime: 145,
      scrollDepth: 68,
      bounceRate: 32,
      clickThroughRate: 6.8
    },
    relatedArticles: ['1', '4']
  },
  {
    id: '3',
    title: 'الذكاء الاصطناعي في التعليم السعودي',
    titleAr: 'الذكاء الاصطناعي في التعليم السعودي',
    content: '<p>تشهد منظومة التعليم في المملكة العربية السعودية تطوراً كبيراً من خلال دمج تقنيات الذكاء الاصطناعي...</p>',
    contentAr: '<p>تشهد منظومة التعليم في المملكة العربية السعودية تطوراً كبيراً من خلال دمج تقنيات الذكاء الاصطناعي...</p>',
    excerpt: 'كيف يعيد الذكاء الاصطناعي تشكيل التعليم في السعودية.',
    excerptAr: 'كيف يعيد الذكاء الاصطناعي تشكيل التعليم في السعودية.',
    author: mockUsers[2],
    category: mockCategories[9],
    tags: [mockTags[9], mockTags[5]],
    status: 'scheduled',
    scheduledAt: new Date('2024-01-16T08:00:00Z'),
    createdAt: new Date('2024-01-15T11:20:00Z'),
    updatedAt: new Date('2024-01-15T16:45:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?w=800',
    language: 'ar',
    priority: 'normal',
    location: 'الرياض',
    socialMediaCard: {
      title: 'الذكاء الاصطناعي في التعليم',
      description: 'مستقبل التعليم السعودي',
      image: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?w=800'
    },
    analytics: {
      views: 0,
      uniqueViews: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      readTime: 0,
      scrollDepth: 0,
      bounceRate: 0,
      clickThroughRate: 0
    },
    relatedArticles: ['1']
  },
  {
    id: '4',
    title: 'رأي: مستقبل الإعلام الرقمي في العالم العربي',
    titleAr: 'رأي: مستقبل الإعلام الرقمي في العالم العربي',
    content: '<p>يشهد الإعلام الرقمي في العالم العربي تطورات متسارعة، وهو ما يتطلب إعادة النظر في استراتيجيات المحتوى...</p>',
    contentAr: '<p>يشهد الإعلام الرقمي في العالم العربي تطورات متسارعة، وهو ما يتطلب إعادة النظر في استراتيجيات المحتوى...</p>',
    excerpt: 'تحليل عميق للتحولات في المشهد الإعلامي الرقمي العربي.',
    excerptAr: 'تحليل عميق للتحولات في المشهد الإعلامي الرقمي العربي.',
    author: mockUsers[4],
    category: mockCategories[4],
    tags: [mockTags[4], mockTags[1]],
    status: 'review',
    createdAt: new Date('2024-01-15T14:30:00Z'),
    updatedAt: new Date('2024-01-15T16:15:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    language: 'ar',
    priority: 'normal',
    location: 'الرياض',
    socialMediaCard: {
      title: 'مستقبل الإعلام الرقمي العربي',
      description: 'رؤية استشرافية للإعلام',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'
    },
    analytics: {
      views: 0,
      uniqueViews: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      readTime: 0,
      scrollDepth: 0,
      bounceRate: 0,
      clickThroughRate: 0
    },
    relatedArticles: ['2']
  },
  {
    id: '5',
    title: 'الاقتصاد السعودي: نمو متسارع في القطاعات غير النفطية',
    titleAr: 'الاقتصاد السعودي: نمو متسارع في القطاعات غير النفطية',
    content: '<p>تواصل المملكة تحقيق نجاحات اقتصادية ملموسة في تنويع مصادر الدخل...</p>',
    contentAr: '<p>تواصل المملكة تحقيق نجاحات اقتصادية ملموسة في تنويع مصادر الدخل...</p>',
    excerpt: 'أرقام وإحصائيات تؤكد نجاح استراتيجية التنويع الاقتصادي.',
    excerptAr: 'أرقام وإحصائيات تؤكد نجاح استراتيجية التنويع الاقتصادي.',
    author: mockUsers[3],
    category: mockCategories[7],
    tags: [mockTags[5], mockTags[6]],
    status: 'draft',
    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-01-15T15:30:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800',
    language: 'ar',
    priority: 'high',
    location: 'الرياض',
    socialMediaCard: {
      title: 'نمو الاقتصاد السعودي',
      description: 'القطاعات غير النفطية تزدهر',
      image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800'
    },
    analytics: {
      views: 0,
      uniqueViews: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      readTime: 0,
      scrollDepth: 0,
      bounceRate: 0,
      clickThroughRate: 0
    },
    relatedArticles: ['1']
  }
];

export const mockAnalytics: Analytics = {
  totalViews: 45782,
  totalArticles: 1247,
  publishedToday: 8,
  engagement: {
    likes: 2456,
    shares: 891,
    comments: 1234
  },
  topArticles: [
    {
      id: '1',
      title: 'AI Revolution in Journalism',
      views: 12547,
      trend: 'up'
    },
    {
      id: '2',
      title: 'تطورات الذكاء الاصطناعي',
      views: 8934,
      trend: 'stable'
    },
    {
      id: '4',
      title: 'Economic Outlook 2024',
      views: 7621,
      trend: 'down'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'publish',
      article: 'AI Revolution in Journalism',
      user: 'Sarah Ahmed',
      timestamp: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: '2',
      type: 'edit',
      article: 'Climate Summit Coverage',
      user: 'Lisa Chen',
      timestamp: new Date('2024-01-15T09:30:00Z')
    },
    {
      id: '3',
      type: 'create',
      article: 'Tech Industry Updates',
      user: 'محمد عبدالله',
      timestamp: new Date('2024-01-15T08:45:00Z')
    }
  ],
  viewsOverTime: [
    { date: '2024-01-08', views: 3245, uniqueVisitors: 2156 },
    { date: '2024-01-09', views: 3890, uniqueVisitors: 2567 },
    { date: '2024-01-10', views: 4123, uniqueVisitors: 2789 },
    { date: '2024-01-11', views: 4567, uniqueVisitors: 3012 },
    { date: '2024-01-12', views: 5234, uniqueVisitors: 3456 },
    { date: '2024-01-13', views: 4789, uniqueVisitors: 3234 },
    { date: '2024-01-14', views: 5678, uniqueVisitors: 3678 },
    { date: '2024-01-15', views: 6234, uniqueVisitors: 4123 }
  ],
  engagementOverTime: [
    { date: '2024-01-08', likes: 245, shares: 89, comments: 156 },
    { date: '2024-01-09', likes: 312, shares: 123, comments: 198 },
    { date: '2024-01-10', likes: 289, shares: 98, comments: 167 },
    { date: '2024-01-11', likes: 356, shares: 145, comments: 234 },
    { date: '2024-01-12', likes: 423, shares: 178, comments: 289 },
    { date: '2024-01-13', likes: 367, shares: 134, comments: 212 },
    { date: '2024-01-14', likes: 445, shares: 198, comments: 267 },
    { date: '2024-01-15', likes: 389, shares: 156, comments: 234 }
  ],
  categoryPerformance: [
    { category: 'Technology', views: 15234, articles: 89, engagementRate: 7.8 },
    { category: 'Politics', views: 12456, articles: 67, engagementRate: 6.2 },
    { category: 'Sports', views: 9876, articles: 45, engagementRate: 8.9 },
    { category: 'Business', views: 8765, articles: 56, engagementRate: 5.4 },
    { category: 'Culture', views: 6543, articles: 34, engagementRate: 9.1 }
  ],
  deviceBreakdown: [
    { device: 'Mobile', percentage: 65, users: 29667 },
    { device: 'Desktop', percentage: 28, users: 12779 },
    { device: 'Tablet', percentage: 7, users: 3198 }
  ],
  trafficSources: [
    { source: 'Direct', percentage: 42, visitors: 19228 },
    { source: 'Social Media', percentage: 28, visitors: 12819 },
    { source: 'Search', percentage: 18, visitors: 8241 },
    { source: 'Referral', percentage: 8, visitors: 3661 },
    { source: 'Email', percentage: 4, visitors: 1833 }
  ],
  authorPerformance: [
    { authorId: '1', authorName: 'Sarah Ahmed', totalViews: 18750, totalArticles: 34, avgEngagement: 8.2 },
    { authorId: '2', authorName: 'محمد عبدالله', totalViews: 14620, totalArticles: 28, avgEngagement: 7.5 },
    { authorId: '3', authorName: 'Lisa Chen', totalViews: 12412, totalArticles: 25, avgEngagement: 6.9 }
  ],
  readingTime: {
    averageTime: 142, // seconds
    bounceRate: 23.4, // percentage
    completionRate: 68.7 // percentage
  }
};

// Mock Media Files for development
export const mockMediaFiles: MediaFile[] = [
  {
    id: 'media_1',
    filename: 'breaking-news-hero-2024-01-15-abc123.jpg',
    originalName: 'breaking-news-hero.jpg',
    mimeType: 'image/jpeg',
    size: 2457600, // 2.4MB
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=1080&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop',
    alt: 'Breaking news coverage with reporters',
    altAr: 'تغطية الأخبار العاجلة مع المراسلين',
    caption: 'Live breaking news coverage from the field',
    captionAr: 'تغطية مباشرة للأخبار العاجلة من الميدان',
    uploadedBy: '1',
    uploadedAt: new Date('2024-01-15T10:30:00Z'),
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpeg',
      colorProfile: 'sRGB',
      hasTransparency: false,
      orientation: 1,
      isOptimized: true,
      originalSize: 3200000,
      compressedSize: 2457600,
      compressionRatio: 23.2
    },
    optimizations: [
      {
        id: 'opt_1_webp',
        type: 'format-convert',
        status: 'completed',
        originalUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=1080&fit=crop',
        optimizedUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=1080&fit=crop&fm=webp',
        settings: {
          width: 1920,
          height: 1080,
          quality: 85,
          format: 'webp',
          progressive: true
        },
        sizeBefore: 3200000,
        sizeAfter: 1890000,
        compressionRatio: 40.9,
        createdAt: new Date('2024-01-15T10:30:30Z'),
        completedAt: new Date('2024-01-15T10:30:35Z')
      }
    ],
    tags: ['breaking-news', 'journalism', 'live-coverage'],
    folder: 'news-images',
    usage: [
      {
        articleId: 'article_1',
        articleTitle: 'AI Revolution in Journalism',
        usageType: 'featured',
        usedAt: new Date('2024-01-15T11:00:00Z'),
        usedBy: '1'
      }
    ]
  },
  {
    id: 'media_2',
    filename: 'tech-innovation-2024-01-14-def456.jpg',
    originalName: 'tech-innovation.jpg',
    mimeType: 'image/jpeg',
    size: 1876500,
    url: 'https://images.unsplash.com/photo-1488229297570-58520851e868?w=1600&h=900&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488229297570-58520851e868?w=300&h=200&fit=crop',
    alt: 'Modern technology and innovation concept',
    altAr: 'مفهوم التكنولوجيا والابتكار الحديث',
    uploadedBy: '2',
    uploadedAt: new Date('2024-01-14T16:45:00Z'),
    metadata: {
      width: 1600,
      height: 900,
      format: 'jpeg',
      isOptimized: true,
      originalSize: 2340000,
      compressedSize: 1876500,
      compressionRatio: 19.8
    },
    optimizations: [],
    tags: ['technology', 'innovation', 'digital'],
    folder: 'technology',
    usage: []
  },
  {
    id: 'media_3',
    filename: 'sports-championship-video-2024-01-13-ghi789.mp4',
    originalName: 'sports-championship.mp4',
    mimeType: 'video/mp4',
    size: 45672000, // 45.6MB
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop',
    alt: 'Championship highlights video',
    altAr: 'فيديو ملخص البطولة',
    caption: 'Key moments from the championship final',
    captionAr: 'اللحظات المهمة من نهائي البطولة',
    uploadedBy: '3',
    uploadedAt: new Date('2024-01-13T14:20:00Z'),
    metadata: {
      width: 1280,
      height: 720,
      duration: 120, // 2 minutes
      format: 'mp4',
      isOptimized: false,
      originalSize: 45672000
    },
    optimizations: [],
    tags: ['sports', 'championship', 'highlights', 'video'],
    folder: 'sports-videos',
    usage: []
  },
  {
    id: 'media_4',
    filename: 'news-report-audio-2024-01-12-jkl012.mp3',
    originalName: 'news-report.mp3',
    mimeType: 'audio/mp3',
    size: 8765432,
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    alt: 'Audio news report',
    altAr: 'تقرير إخباري صوتي',
    uploadedBy: '4',
    uploadedAt: new Date('2024-01-12T09:15:00Z'),
    metadata: {
      duration: 180, // 3 minutes
      format: 'mp3',
      isOptimized: false,
      originalSize: 8765432
    },
    optimizations: [],
    tags: ['audio', 'news', 'report', 'interview'],
    folder: 'audio-content',
    usage: []
  },
  {
    id: 'media_5',
    filename: 'press-release-document-2024-01-11-mno345.pdf',
    originalName: 'press-release.pdf',
    mimeType: 'application/pdf',
    size: 567890,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    alt: 'Official press release document',
    altAr: 'وثيقة البيان الصحفي الرسمي',
    uploadedBy: '5',
    uploadedAt: new Date('2024-01-11T13:30:00Z'),
    metadata: {
      format: 'pdf',
      isOptimized: false,
      originalSize: 567890
    },
    optimizations: [],
    tags: ['document', 'press-release', 'official'],
    folder: 'documents',
    usage: []
  },
  {
    id: 'media_6',
    filename: 'political-conference-gallery-2024-01-10-pqr678.jpg',
    originalName: 'political-conference-1.jpg',
    mimeType: 'image/jpeg',
    size: 3210000,
    url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1600&h=1067&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=300&h=200&fit=crop',
    alt: 'Political conference with speakers',
    altAr: 'مؤتمر سياسي مع المتحدثين',
    uploadedBy: '6',
    uploadedAt: new Date('2024-01-10T18:45:00Z'),
    metadata: {
      width: 1600,
      height: 1067,
      format: 'jpeg',
      isOptimized: false,
      originalSize: 3210000
    },
    optimizations: [],
    tags: ['politics', 'conference', 'speakers', 'event'],
    folder: 'politics',
    usage: []
  }
];