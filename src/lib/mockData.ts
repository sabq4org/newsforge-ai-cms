import { User, Article, Category, Tag, Analytics } from '@/types';

// Mock data for development
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Ahmed',
    email: 'sarah@newsflow.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69c4d00?w=150'
  },
  {
    id: '2',
    name: 'محمد عبدالله',
    email: 'mohammed@newsflow.com',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: '3',
    name: 'Lisa Chen',
    email: 'lisa@newsflow.com',
    role: 'reporter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  }
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Politics', nameAr: 'السياسة', slug: 'politics', color: '#ef4444' },
  { id: '2', name: 'Technology', nameAr: 'التكنولوجيا', slug: 'technology', color: '#3b82f6' },
  { id: '3', name: 'Sports', nameAr: 'الرياضة', slug: 'sports', color: '#10b981' },
  { id: '4', name: 'Business', nameAr: 'الأعمال', slug: 'business', color: '#f59e0b' },
  { id: '5', name: 'Culture', nameAr: 'الثقافة', slug: 'culture', color: '#8b5cf6' }
];

export const mockTags: Tag[] = [
  { id: '1', name: 'Breaking News', nameAr: 'أخبار عاجلة', slug: 'breaking-news' },
  { id: '2', name: 'Analysis', nameAr: 'تحليل', slug: 'analysis' },
  { id: '3', name: 'Interview', nameAr: 'مقابلة', slug: 'interview' },
  { id: '4', name: 'Investigation', nameAr: 'تحقيق', slug: 'investigation' },
  { id: '5', name: 'Opinion', nameAr: 'رأي', slug: 'opinion' }
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'AI Revolution in Journalism: How Technology is Reshaping News',
    content: '<p>The digital transformation of journalism continues to accelerate...</p>',
    excerpt: 'Exploring how artificial intelligence is transforming the way news is created, distributed, and consumed.',
    author: mockUsers[0],
    category: mockCategories[1],
    tags: [mockTags[1], mockTags[0]],
    status: 'published',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    analytics: {
      views: 12547,
      likes: 234,
      shares: 89
    }
  },
  {
    id: '2',
    title: 'تطورات الذكاء الاصطناعي في الشرق الأوسط',
    content: '<p>يشهد الشرق الأوسط تطورات متسارعة في مجال الذكاء الاصطناعي...</p>',
    excerpt: 'نظرة على أحدث التطورات التقنية في المنطقة العربية وأثرها على المجتمع.',
    author: mockUsers[1],
    category: mockCategories[1],
    tags: [mockTags[1]],
    status: 'published',
    publishedAt: new Date('2024-01-14T14:00:00Z'),
    createdAt: new Date('2024-01-14T10:15:00Z'),
    updatedAt: new Date('2024-01-14T13:30:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    analytics: {
      views: 8934,
      likes: 156,
      shares: 67
    }
  },
  {
    id: '3',
    title: 'Global Climate Summit: Key Decisions Made',
    content: '<p>World leaders gathered to discuss urgent climate action...</p>',
    excerpt: 'A comprehensive overview of the major decisions and commitments from the latest climate summit.',
    author: mockUsers[2],
    category: mockCategories[0],
    tags: [mockTags[0], mockTags[3]],
    status: 'scheduled',
    scheduledAt: new Date('2024-01-16T08:00:00Z'),
    createdAt: new Date('2024-01-15T11:20:00Z'),
    updatedAt: new Date('2024-01-15T16:45:00Z'),
    featuredImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?w=800',
    analytics: {
      views: 0,
      likes: 0,
      shares: 0
    }
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