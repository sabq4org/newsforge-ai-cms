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
}

export interface Language {
  code: 'en' | 'ar';
  name: string;
  direction: 'ltr' | 'rtl';
}