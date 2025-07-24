export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'not-specified';
  country?: string;
  city?: string;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'banned' | 'pending';
  role: 'regular' | 'vip' | 'media' | 'admin' | 'moderator';
  tags: string[];
  joinedAt: Date;
  lastLogin?: Date;
  lastIP?: string;
  deviceInfo?: string;
  preferences: UserPreferences;
  stats: UserStats;
  loyaltyInfo?: LoyaltyInfo;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  newsletter: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  interests: string[];
  readingTime?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface UserStats {
  totalArticlesRead: number;
  totalTimeSpent: number; // in minutes
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
  bookmarksCount: number;
  currentStreak: number;
  longestStreak: number;
  averageReadingTime: number;
  favoriteCategories: string[];
}

export interface LoyaltyInfo {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  level: number;
  badges: string[];
  achievements: string[];
}

export interface UserFilters {
  country?: string;
  city?: string;
  status?: string;
  role?: string;
  gender?: string;
  isVerified?: boolean;
  joinedAfter?: Date;
  joinedBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  minArticlesRead?: number;
  maxArticlesRead?: number;
  tags?: string[];
  interests?: string[];
  search?: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number; // last 30 days
  newUsersToday: number;
  unverifiedUsers: number;
  bannedUsers: number;
  usersByCountry: Record<string, number>;
  usersByRole: Record<string, number>;
  userGrowth: Array<{ date: string; count: number }>;
  engagementMetrics: {
    averageSessionTime: number;
    averageArticlesPerUser: number;
    retentionRate: number;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'article_read' | 'comment' | 'like' | 'share' | 'bookmark';
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface BulkAction {
  type: 'delete' | 'ban' | 'unban' | 'verify' | 'change_role' | 'add_tag' | 'remove_tag';
  userIds: string[];
  data?: any;
}

export interface ImportedUser {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  country?: string;
  city?: string;
  role?: string;
  tags?: string[];
  autoVerify?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields: string[];
  filters?: UserFilters;
  includeStats?: boolean;
  includeLoyalty?: boolean;
}