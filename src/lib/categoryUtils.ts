import { Article, Category } from '@/types';
import { safeToLowerCase, safeToString } from '@/lib/utils';

export function applyCategoryToArticles(articles: Article[], categories: Category[]): Article[] {
  // خوارزمية ذكية لتطبيق التصنيفات على المقالات بناءً على المحتوى والعناوين

  const categoryKeywords = {
    'local': ['السعودية', 'المملكة', 'الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'محلي', 'محليات'],
    'world': ['العالم', 'دولي', 'عالمي', 'الولايات المتحدة', 'أوروبا', 'آسيا', 'أفريقيا', 'دولة'],
    'life': ['حياة', 'صحة', 'طعام', 'أسرة', 'مجتمع', 'نمط حياة', 'طبخ', 'موضة'],
    'stations': ['تقرير', 'ملف', 'تحقيق', 'دراسة', 'بحث', 'استطلاع', 'خاص'],
    'sports': ['رياضة', 'كرة', 'بطولة', 'مباراة', 'نادي', 'لاعب', 'دوري', 'فريق'],
    'tourism': ['سياحة', 'سفر', 'وجهة', 'فندق', 'منتجع', 'آثار', 'استكشاف', 'رحلة'],
    'business': ['أعمال', 'اقتصاد', 'شركة', 'استثمار', 'مال', 'بورصة', 'تجارة', 'سوق'],
    'technology': ['تقنية', 'ذكاء اصطناعي', 'تكنولوجيا', 'هاتف', 'حاسوب', 'تطبيق', 'إنترنت', 'برمجة'],
    'cars': ['سيارة', 'سيارات', 'محرك', 'قيادة', 'سباق', 'وقود', 'مركبة', 'سرعة'],
    'media': ['ميديا', 'فيديو', 'فيلم', 'مسلسل', 'تلفزيون', 'راديو', 'إذاعة', 'برنامج']
  };

  return articles.map(article => {
    // إذا كان للمقال تصنيف موجود وصالح، احتفظ به
    if (article.category && categories.find(cat => cat.id === article.category.id)) {
      return article;
    }

    // البحث عن تصنيف مناسب بناءً على المحتوى
    const searchText = safeToLowerCase(`${safeToString(article.title)} ${safeToString(article.content)} ${safeToString(article.excerpt)}`);
    
    let bestMatch = categories[0]; // التصنيف الافتراضي الأول
    let bestScore = 0;

    categories.forEach(category => {
      const keywords = categoryKeywords[category.slug as keyof typeof categoryKeywords] || [];
      let score = 0;

      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          score += 1;
        }
      });

      // إضافة نقاط إضافية إذا كان الكلمة في العنوان
      keywords.forEach(keyword => {
        const safeTitle = safeToLowerCase(safeToString(article.title));
        if (safeTitle.includes(keyword)) {
          score += 2;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    });

    // تطبيق التصنيف المناسب
    return {
      ...article,
      category: bestMatch,
      updatedAt: new Date()
    };
  });
}

export function getCategoryStats(articles: Article[], categories: Category[]) {
  const stats = categories.map(category => {
    const categoryArticles = articles.filter(article => 
      article.category && article.category.id === category.id
    );

    const publishedArticles = categoryArticles.filter(article => 
      article.status === 'published'
    );

    const totalViews = publishedArticles.reduce((sum, article) => 
      sum + (article.analytics?.views || 0), 0
    );

    const totalEngagement = publishedArticles.reduce((sum, article) => 
      sum + (article.analytics?.likes || 0) + 
          (article.analytics?.shares || 0) + 
          (article.analytics?.comments || 0), 0
    );

    return {
      categoryId: category.id,
      categoryName: category.nameAr || category.name,
      totalArticles: categoryArticles.length,
      publishedArticles: publishedArticles.length,
      totalViews,
      totalEngagement,
      engagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
      averageViews: publishedArticles.length > 0 ? totalViews / publishedArticles.length : 0
    };
  });

  return stats;
}