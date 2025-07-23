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
  ]
};