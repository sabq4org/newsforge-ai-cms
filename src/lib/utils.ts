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
  if (!Array.isArray(articles)) {
    console.warn('normalizeArticles: Expected array, got:', typeof articles);
    return [];
  }

  return articles.map((article, index) => {
    if (!article || typeof article !== 'object') {
      console.warn(`normalizeArticles: Invalid article at index ${index}:`, article);
      return null;
    }

    // Ensure category exists and has proper structure
    if (!article.category || typeof article.category !== 'object') {
      // Find category by ID if it's a string, or use default
      const categoryId = typeof article.category === 'string' ? article.category : article.category?.id;
      let foundCategory = null;
      
      // Safe import check for mockCategories
      try {
        foundCategory = mockCategories.find(cat => cat.id === categoryId);
      } catch (e) {
        console.warn('normalizeArticles: Could not access mockCategories:', e);
      }
      
      // If no category found, assign the first available category or create a default
      article.category = foundCategory || {
        id: 'default',
        name: 'عام',
        nameAr: 'عام',
        nameEn: 'General',
        slug: 'general',
        description: 'تصنيف عام',
        color: '#6b7280',
        icon: '📰',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          seoTitle: 'عام',
          seoDescription: 'تصنيف عام للمقالات',
          keywords: ['عام']
        }
      };
    }
    
    // Additional check to ensure the category has required properties
    if (!article.category.color) {
      article.category.color = '#6b7280'; // Default color
    }
    if (!article.category.name) {
      article.category.name = 'عام';
    }
    if (!article.category.nameAr) {
      article.category.nameAr = 'عام';
    }

    // Ensure tags is always an array
    if (!Array.isArray(article.tags)) {
      article.tags = [];
    }

    // Ensure dates are Date objects
    ['createdAt', 'updatedAt', 'publishedAt', 'scheduledAt'].forEach(dateField => {
      const dateValue = article[dateField as keyof Article];
      if (dateValue && typeof dateValue === 'string') {
        try {
          (article as any)[dateField] = new Date(dateValue);
        } catch (e) {
          console.warn(`normalizeArticles: Invalid date for ${dateField}:`, dateValue);
          (article as any)[dateField] = new Date();
        }
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

    // Ensure author exists
    if (!article.author || typeof article.author !== 'object') {
      article.author = {
        id: 'unknown',
        name: 'Unknown',
        email: 'unknown@sabq.sa',
        role: 'journalist',
        permissions: [],
        language: 'ar',
        createdAt: new Date(),
        lastActive: new Date()
      };
    }

    return article;
  }).filter((article): article is Article => article !== null);
}

/**
 * Safely format a date with fallback handling
 */
export function safeDateFormat(
  date: Date | string | number | undefined | null, 
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) {
    return new Date().toLocaleDateString(locale, options);
  }
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date();
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('safeDateFormat: Invalid date provided:', date);
      return new Date().toLocaleDateString(locale, options);
    }
    
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('safeDateFormat: Error formatting date:', date, error);
    return new Date().toLocaleDateString(locale, options);
  }
}

/**
 * Safely format a time with fallback handling
 */
export function safeTimeFormat(
  date: Date | string | number | undefined | null,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) {
    return new Date().toLocaleTimeString(locale, options);
  }
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date();
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('safeTimeFormat: Invalid date provided:', date);
      return new Date().toLocaleTimeString(locale, options);
    }
    
    return dateObj.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('safeTimeFormat: Error formatting time:', date, error);
    return new Date().toLocaleTimeString(locale, options);
  }
}

export function normalizeActivityTimestamps(activities: any[]): any[] {
  if (!Array.isArray(activities)) {
    console.warn('normalizeActivityTimestamps: Expected array, got:', typeof activities);
    return [];
  }
  
  return activities.map((activity, index) => {
    if (!activity || typeof activity !== 'object') {
      console.warn(`normalizeActivityTimestamps: Invalid activity at index ${index}:`, activity);
      return {
        id: `invalid-${index}`,
        type: 'unknown',
        article: 'Unknown',
        user: 'Unknown',
        timestamp: new Date()
      };
    }
    
    // Handle different timestamp formats with extra safety checks
    let timestamp = activity.timestamp;
    
    try {
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        timestamp = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        // Already a Date object, but check if it's valid
        if (isNaN(timestamp.getTime())) {
          timestamp = new Date();
        }
      } else {
        console.warn(`normalizeActivityTimestamps: Invalid timestamp at index ${index}:`, timestamp);
        timestamp = new Date(); // fallback to current date
      }
      
      // Double-check the Date object is valid
      if (!timestamp || !(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
        console.warn(`normalizeActivityTimestamps: Invalid date after processing at index ${index}, using current date`);
        timestamp = new Date(); // fallback to current date for invalid dates
      }
    } catch (error) {
      console.error(`normalizeActivityTimestamps: Error processing timestamp at index ${index}:`, error);
      timestamp = new Date();
    }
    
    return {
      ...activity,
      timestamp,
      id: activity.id || `activity-${index}`,
      type: activity.type || 'unknown',
      article: activity.article || 'Unknown Article',
      user: activity.user || 'Unknown User'
    };
  });
}
