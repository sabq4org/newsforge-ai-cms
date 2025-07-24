import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Tags, Database, Brain } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Category, Article } from '@/types';
import { mockCategories, mockArticles } from '@/lib/mockData';
import { applyCategoryToArticles } from '@/lib/categoryUtils';
import { normalizeArticles } from '@/lib/utils';

export function CategorySeeder() {
  const [categories, setCategories] = useKV<Category[]>('sabq-categories', []);
  const [rawArticles, setArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);

  const seedCategories = () => {
    setCategories(mockCategories);
    toast.success('تم تحميل التصنيفات الافتراضية بنجاح');
  };

  const resetCategories = () => {
    setCategories([]);
    toast.success('تم مسح جميع التصنيفات');
  };

  const applySmartCategories = () => {
    if (categories.length === 0) {
      toast.error('يرجى تحميل التصنيفات أولاً');
      return;
    }

    const updatedArticles = applyCategoryToArticles(articles, categories);
    setArticles(updatedArticles);
    toast.success('تم تطبيق التصنيفات الذكية على المقالات');
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          إعداد التصنيفات
        </CardTitle>
        <CardDescription>
          إدارة البيانات الافتراضية للتصنيفات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">التصنيفات المحملة</p>
            <p className="text-sm text-muted-foreground">{categories.length} تصنيف</p>
          </div>
          <Tags className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={seedCategories} 
            className="w-full"
            disabled={categories.length === mockCategories.length}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            تحميل التصنيفات الافتراضية
          </Button>

          <Button 
            onClick={applySmartCategories} 
            variant="secondary"
            className="w-full"
            disabled={categories.length === 0}
          >
            <Brain className="h-4 w-4 mr-2" />
            تطبيق التصنيفات الذكية
          </Button>
          
          <Button 
            onClick={resetCategories} 
            variant="outline" 
            className="w-full"
            disabled={categories.length === 0}
          >
            مسح جميع التصنيفات
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>التصنيفات الافتراضية تشمل:</p>
          <ul className="mt-1 space-y-1">
            {mockCategories.slice(0, 5).map(cat => (
              <li key={cat.id}>• {cat.nameAr}</li>
            ))}
            {mockCategories.length > 5 && (
              <li>• و {mockCategories.length - 5} تصنيفات أخرى...</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}