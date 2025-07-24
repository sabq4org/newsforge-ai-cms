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
    if (!article.category || typeof article.category !== 'object' || !article.category.color) {
      // Find category by ID if it's a string, or use default
      const categoryId = typeof article.category === 'string' ? article.category : article.category?.id;
      const foundCategory = mockCategories.find(cat => cat.id === categoryId);
      article.category = foundCategory || mockCategories[0];
    }

    // Ensure tags is always an array
    if (!Array.isArray(article.tags)) {
      article.tags = [];
    }

    // Ensure dates are Date objects
    ['createdAt', 'updatedAt', 'publishedAt', 'scheduledAt'].forEach(dateField => {
      const dateValue = article[dateField as keyof Article];
      if (dateValue && typeof dateValue === 'string') {
        (article as any)[dateField] = new Date(dateValue);
      } else if (dateValue && typeof dateValue === 'number') {
        (article as any)[dateField] = new Date(dateValue);
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
  return activities.map(activity => {
    // Handle different timestamp formats
    let timestamp = activity.timestamp;
    
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      timestamp = new Date(timestamp);
    } else if (!timestamp || !(timestamp instanceof Date)) {
      timestamp = new Date(); // fallback to current date
    }
    
    // Ensure the Date object is valid
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date(); // fallback to current date for invalid dates
    }
    
    return {
      ...activity,
      timestamp
    };
  });
}
