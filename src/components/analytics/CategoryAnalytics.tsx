import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Clock,
  Users,
  Target,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Brain
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { mockArticles, mockCategories } from '@/lib/mockData';

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalViews: number;
  totalEngagement: number;
  articlesCount: number;
  avgViewsPerArticle: number;
  avgEngagementRate: number;
  growthRate: number;
  topArticles: Article[];
}

interface EngagementTrend {
  date: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement: number;
}

interface CategoryAnalyticsProps {
  articles?: Article[];
  onCategorySelect?: (categoryId: string) => void;
  onArticleSelect?: (article: Article) => void;
}

export function CategoryAnalytics({ 
  articles = mockArticles,
  onCategorySelect,
  onArticleSelect 
}: CategoryAnalyticsProps) {
  const [categoryPerformance, setCategoryPerformance] = useKV<CategoryPerformance[]>('category-performance', []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [sortBy, setSortBy] = useState('views');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate performance metrics for each category
  const calculateCategoryPerformance = () => {
    setIsLoading(true);
    
    try {
      const categoryStats: { [categoryId: string]: CategoryPerformance } = {};
      
      // Initialize categories
      mockCategories.forEach(category => {
        categoryStats[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          totalViews: 0,
          totalEngagement: 0,
          articlesCount: 0,
          avgViewsPerArticle: 0,
          avgEngagementRate: 0,
          growthRate: 0,
          topArticles: []
        };
      });

      // Aggregate article data by category
      articles.filter(a => a.status === 'published').forEach(article => {
        const categoryId = article.category?.id;
        if (!categoryId || !categoryStats[categoryId]) return;

        const views = article.analytics?.views || 0;
        const engagement = (article.analytics?.likes || 0) + 
                          (article.analytics?.shares || 0) + 
                          (article.analytics?.comments || 0);

        categoryStats[categoryId].totalViews += views;
        categoryStats[categoryId].totalEngagement += engagement;
        categoryStats[categoryId].articlesCount++;
        categoryStats[categoryId].topArticles.push(article);
      });

      // Calculate derived metrics
      Object.values(categoryStats).forEach(category => {
        if (category.articlesCount > 0) {
          category.avgViewsPerArticle = category.totalViews / category.articlesCount;
          category.avgEngagementRate = category.totalViews > 0 
            ? (category.totalEngagement / category.totalViews) * 100 
            : 0;
          category.growthRate = Math.random() * 40 - 20; // Mock growth rate
          
          // Sort top articles by views
          category.topArticles.sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0));
          category.topArticles = category.topArticles.slice(0, 5);
        }
      });

      setCategoryPerformance(Object.values(categoryStats));
    } catch (error) {
      console.error('Error calculating category performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get sorted categories based on selected sort criteria
  const getSortedCategories = () => {
    return [...categoryPerformance].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.totalViews - a.totalViews;
        case 'engagement':
          return b.totalEngagement - a.totalEngagement;
        case 'articles':
          return b.articlesCount - a.articlesCount;
        case 'growth':
          return b.growthRate - a.growthRate;
        default:
          return b.totalViews - a.totalViews;
      }
    });
  };

  // Get category details
  const getSelectedCategoryData = () => {
    if (selectedCategory === 'all') {
      return {
        name: 'جميع التصنيفات',
        totalViews: categoryPerformance.reduce((sum, cat) => sum + cat.totalViews, 0),
        totalEngagement: categoryPerformance.reduce((sum, cat) => sum + cat.totalEngagement, 0),
        totalArticles: categoryPerformance.reduce((sum, cat) => sum + cat.articlesCount, 0),
        avgEngagementRate: categoryPerformance.length > 0 
          ? categoryPerformance.reduce((sum, cat) => sum + cat.avgEngagementRate, 0) / categoryPerformance.length
          : 0
      };
    }
    
    const category = categoryPerformance.find(cat => cat.categoryId === selectedCategory);
    return category ? {
      name: category.categoryName,
      totalViews: category.totalViews,
      totalEngagement: category.totalEngagement,
      totalArticles: category.articlesCount,
      avgEngagementRate: category.avgEngagementRate
    } : null;
  };

  // Generate engagement trends (mock data)
  const generateEngagementTrends = (): EngagementTrend[] => {
    const trends: EngagementTrend[] = [];
    const days = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 7;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const views = Math.floor(Math.random() * 1000) + 200;
      const likes = Math.floor(views * 0.1 * Math.random());
      const shares = Math.floor(views * 0.03 * Math.random());
      const comments = Math.floor(views * 0.02 * Math.random());
      
      trends.push({
        date: date.toLocaleDateString('ar-SA'),
        views,
        likes,
        shares,
        comments,
        engagement: likes + shares + comments
      });
    }
    
    return trends;
  };

  useEffect(() => {
    calculateCategoryPerformance();
  }, [articles, selectedTimeframe]);

  const sortedCategories = getSortedCategories();
  const selectedCategoryData = getSelectedCategoryData();
  const engagementTrends = generateEngagementTrends();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تحليلات التصنيفات</h1>
          <p className="text-muted-foreground mt-1">
            أداء تفصيلي لكل تصنيف ومقارنة شاملة
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">المشاهدات</SelectItem>
              <SelectItem value="engagement">التفاعل</SelectItem>
              <SelectItem value="articles">عدد المقالات</SelectItem>
              <SelectItem value="growth">النمو</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={calculateCategoryPerformance} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                تحديث...
              </div>
            ) : (
              <>
                <RefreshCw size={16} className="ml-1" />
                تحديث
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {selectedCategoryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold">{selectedCategoryData.totalViews.toLocaleString()}</p>
                </div>
                <Eye size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التفاعل</p>
                  <p className="text-2xl font-bold">{selectedCategoryData.totalEngagement.toLocaleString()}</p>
                </div>
                <Heart size={24} className="text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عدد المقالات</p>
                  <p className="text-2xl font-bold">{selectedCategoryData.totalArticles}</p>
                </div>
                <BarChart3 size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">معدل التفاعل</p>
                  <p className="text-2xl font-bold">{selectedCategoryData.avgEngagementRate.toFixed(1)}%</p>
                </div>
                <TrendingUp size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              أداء التصنيفات
            </CardTitle>
            <CardDescription>
              مقارنة شاملة لجميع التصنيفات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCategories.map(category => (
                <div 
                  key={category.categoryId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.categoryId);
                    onCategorySelect?.(category.categoryId);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{category.categoryName}</h4>
                      <Badge variant={category.growthRate > 0 ? 'default' : 'secondary'}>
                        {category.growthRate > 0 ? '↗' : '↘'} {Math.abs(category.growthRate).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {category.totalViews.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {category.totalEngagement.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={12} />
                          {category.articlesCount} مقال
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress value={Math.min((category.avgEngagementRate / 10) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              اتجاه التفاعل
            </CardTitle>
            <CardDescription>
              تطور التفاعل خلال الفترة المحددة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple line chart representation */}
              <div className="grid grid-cols-7 gap-1 h-32">
                {engagementTrends.map((trend, index) => {
                  const maxEngagement = Math.max(...engagementTrends.map(t => t.engagement));
                  const height = (trend.engagement / maxEngagement) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col justify-end items-center">
                      <div 
                        className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                        style={{ height: `${height}%` }}
                        title={`${trend.date}: ${trend.engagement} تفاعل`}
                      />
                      <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-bottom-left">
                        {trend.date.split('/')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>إجمالي التفاعل</span>
                </div>
              </div>
              
              {/* Metrics breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {engagementTrends.reduce((sum, t) => sum + t.views, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">مشاهدات</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {engagementTrends.reduce((sum, t) => sum + t.engagement, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">تفاعلات</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Articles by Category */}
      {selectedCategory !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              أفضل المقالات - {categoryPerformance.find(c => c.categoryId === selectedCategory)?.categoryName}
            </CardTitle>
            <CardDescription>
              المقالات الأكثر أداءً في هذا التصنيف
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance
                .find(c => c.categoryId === selectedCategory)
                ?.topArticles.slice(0, 5).map((article, index) => (
                <div 
                  key={article.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onArticleSelect?.(article)}
                >
                  <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2 mb-2">{article.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {article.analytics?.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {article.analytics?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 size={12} />
                        {article.analytics?.shares || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(article.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-4 flex-col items-start">
          <Download size={20} className="mb-2" />
          <span className="font-medium">تصدير التقرير</span>
          <span className="text-sm text-muted-foreground">حفظ البيانات كملف Excel</span>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 flex-col items-start">
          <Brain size={20} className="mb-2" />
          <span className="font-medium">توصيات ذكية</span>
          <span className="text-sm text-muted-foreground">اقتراحات لتحسين الأداء</span>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 flex-col items-start">
          <Zap size={20} className="mb-2" />
          <span className="font-medium">تحليل تلقائي</span>
          <span className="text-sm text-muted-foreground">جدولة تقارير دورية</span>
        </Button>
      </div>
    </div>
  );
}