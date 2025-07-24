import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Article, Category } from "@/types"
import { mockCategories } from "./mockData"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize articles to ensure they have proper structure after KV storage
 * This fixes issues with serialization/deserialization of complex objects
 */
export function normalizeArticles(articles: Article[]): Article[] {
  return articles.map(article => {
    // Ensure category exists and has proper structure
    if (!article.category || typeof article.category !== 'object') {
      // Find category by ID if it's a string, or use default
      const categoryId = typeof article.category === 'string' ? article.category : null;
      article.category = mockCategories.find(cat => cat.id === categoryId) || mockCategories[0];
    }

    // Ensure tags is always an array
    if (!Array.isArray(article.tags)) {
      article.tags = [];
    }

    // Ensure dates are Date objects
    ['createdAt', 'updatedAt', 'publishedAt', 'scheduledAt'].forEach(dateField => {
      if (article[dateField as keyof Article] && typeof article[dateField as keyof Article] === 'string') {
        (article as any)[dateField] = new Date(article[dateField as keyof Article] as string);
      }
    });

    // Ensure analytics exists
    if (!article.analytics) {
      article.analytics = {
        views: 0,
        uniqueViews: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        readTime: 0,
        scrollDepth: 0,
        bounceRate: 0,
        clickThroughRate: 0
      };
    }

    return article;
  });
}

/**
 * Normalize activity timestamps to ensure they're Date objects
 */
export function normalizeActivityTimestamps(activities: any[]): any[] {
  return activities.map(activity => ({
    ...activity,
    timestamp: activity.timestamp instanceof Date 
      ? activity.timestamp 
      : new Date(activity.timestamp)
  }));
}
