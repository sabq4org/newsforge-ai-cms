import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Article, Category } from "@/types"

// Safe cn function implementation
export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs))
  } catch (error) {
    // Fallback: simple class concatenation
    return inputs
      .filter(input => input != null && input !== false && input !== '')
      .map(input => {
        if (typeof input === 'string') return input.trim();
        if (typeof input === 'object' && input !== null) {
          return Object.entries(input)
            .filter(([_, condition]) => Boolean(condition))
            .map(([className]) => String(className).trim())
            .join(' ');
        }
        return String(input).trim();
      })
      .filter(className => className && className.length > 0)
      .join(' ');
  }
}
      clsxResult = clsx(...safeInputs);
    } catch (clsxError) {
      console.warn('clsx error, using manual join:', clsxError);
// Utility functions for data normalization and safe operations

// Mock categories for fallback
const defaultCategories = [
  { id: 'local', name: 'محليات', color: '#3b82f6', slug: 'local' },
  { id: 'world', name: 'العالم', color: '#10b981', slug: 'world' },
  { id: 'sports', name: 'رياضة', color: '#f59e0b', slug: 'sports' },
  { id: 'tech', name: 'تقنية', color: '#8b5cf6', slug: 'tech' }
];

/**
 * Normalize articles to ensure they have proper structure
 */
export function normalizeArticles(articles: Article[]): Article[] {
  try {
    if (!Array.isArray(articles)) {
      console.warn('normalizeArticles: Expected array, got:', typeof articles);
      return [];
    }

    return articles
      .filter(article => article && typeof article === 'object')
      .map((article) => {
        // Ensure category exists and has proper structure
        if (!article.category || typeof article.category !== 'object') {
          article.category = defaultCategories[0]; // Use default category
        }

        // Ensure author exists
        if (!article.author || typeof article.author !== 'object') {
          article.author = {
            id: 'system',
            name: 'النظام',
            role: 'admin',
            email: 'system@sabq.org'
          };
        }

        // Ensure dates are proper Date objects
        if (article.createdAt && !(article.createdAt instanceof Date)) {
          article.createdAt = new Date(article.createdAt);
        }
        if (article.updatedAt && !(article.updatedAt instanceof Date)) {
          article.updatedAt = new Date(article.updatedAt);
        }

        // Ensure arrays are arrays
        if (!Array.isArray(article.tags)) {
          article.tags = [];
        }

        return article;
      });
  } catch (error) {
    console.error('normalizeArticles error:', error);
    return [];
  }
}

/**
 * Normalize data object to handle serialization issues
 */
export function normalizeDataObject<T>(data: T): T {
  try {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => normalizeDataObject(item)) as T;
    }

    const result = { ...data } as any;
    
    // Handle Date strings
    for (const key in result) {
      const value = result[key];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        try {
          result[key] = new Date(value);
        } catch {
          // Keep original value if date parsing fails
        }
      } else if (value && typeof value === 'object') {
        result[key] = normalizeDataObject(value);
      }
    }

    return result;
  } catch (error) {
    console.error('normalizeDataObject error:', error);
    return data;
  }
}

