import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Heart, Share2, MessageCircle, Clock, CalendarIcon, Filter, Download } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article, Category } from '@/types';
import { mockArticles, mockCategories } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';

interface CategoryPerformanceData {
  category: Category;
  articlesCount: number;
  totalViews: number;
  totalEngagement: number;
  averageReadTime: number;
  bounceRate: number;
  topArticle: Article | null;
  trending: 'up' | 'down' | 'stable';
  growthRate: number;
  engagementRate: number;
  publishingFrequency: number;
  readerRetention: number;
  shareabilityScore: number;
  timeOfDayPerformance: { hour: number; views: number; engagement: number }[];
  weeklyTrends: { week: string; views: number; engagement: number; articles: number }[];
  authorContribution: { authorName: string; articles: number; avgViews: number }[];
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: 'آخر 7 أيام', value: '7d', days: 7 },
  { label: 'آخر 30 يوم', value: '30d', days: 30 },
  { label: 'آخر 90 يوم', value: '90d', days: 90 },
  { label: 'آخر 365 يوم', value: '1y', days: 365 },
];

const COLORS = ['#1e40af', '#059669', '#dc2626', '#7c3aed', '#f59e0b', '#10b981', '#0891b2', '#3b82f6', '#ef4444', '#8b5cf6'];

export function CategoryAnalytics() {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  const [categories] = useKV<Category[]>('sabq-categories', mockCategories);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'articles'>('views');

  // محاكاة بيانات الأداء المتقدمة
  const generatePerformanceData = (category: Category): CategoryPerformanceData => {
    const categoryArticles = articles.filter(article => 
      article.category && article.category.id === category.id
    );
    const publishedArticles = categoryArticles.filter(article => article.status === 'published');
    
    const totalViews = publishedArticles.reduce((sum, article) => sum + article.analytics.views, 0);
    const totalEngagement = publishedArticles.reduce((sum, article) => 
      sum + article.analytics.likes + article.analytics.shares + article.analytics.comments, 0);
    const avgReadTime = publishedArticles.length > 0 
      ? publishedArticles.reduce((sum, article) => sum + article.analytics.readTime, 0) / publishedArticles.length 
      : 0;
    const avgBounceRate = publishedArticles.length > 0
      ? publishedArticles.reduce((sum, article) => sum + article.analytics.bounceRate, 0) / publishedArticles.length
      : 0;

    const topArticle = publishedArticles.sort((a, b) => b.analytics.views - a.analytics.views)[0] || null;

    // محاكاة البيانات المتقدمة
    const growthRate = Math.random() * 40 - 20; // -20% to +20%
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    const publishingFrequency = categoryArticles.length / 30; // articles per day (assuming 30 days)
    const readerRetention = 60 + Math.random() * 30; // 60-90%
    const shareabilityScore = Math.min(100, (totalEngagement / Math.max(1, publishedArticles.length)) * 2);

    // بيانات الأداء حسب الوقت
    const timeOfDayPerformance = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      views: Math.floor(Math.random() * 1000) + 100,
      engagement: Math.floor(Math.random() * 100) + 10
    }));

    // اتجاهات أسبوعية
    const weeklyTrends = Array.from({ length: 8 }, (_, i) => {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      return {
        week: weekDate.toLocaleDateString('ar-SA'),
        views: Math.floor(Math.random() * 5000) + 1000,
        engagement: Math.floor(Math.random() * 500) + 100,
        articles: Math.floor(Math.random() * 10) + 1
      };
    }).reverse();

    // مساهمة المؤلفين
    const authorContribution = Array.from(new Set(
      categoryArticles
        .filter(a => a.author && a.author.name)
        .map(a => a.author.name)
    )).map(authorName => {
      const authorArticles = categoryArticles.filter(a => a.author && a.author.name === authorName);
      const avgViews = authorArticles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0) / authorArticles.length || 0;
      return {
        authorName,
        articles: authorArticles.length,
        avgViews: Math.floor(avgViews)
      };
    });

    return {
      category,
      articlesCount: categoryArticles.length,
      totalViews,
      totalEngagement,
      averageReadTime: Math.floor(avgReadTime),
      bounceRate: Math.floor(avgBounceRate),
      topArticle,
      trending: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable',
      growthRate: Math.floor(growthRate * 10) / 10,
      engagementRate: Math.floor(engagementRate * 10) / 10,
      publishingFrequency: Math.floor(publishingFrequency * 10) / 10,
      readerRetention: Math.floor(readerRetention),
      shareabilityScore: Math.floor(shareabilityScore),
      timeOfDayPerformance,
      weeklyTrends,
      authorContribution
    };
  };

  const performanceData = useMemo(() => {
    // Ensure categories is an array and contains valid category objects
    if (!Array.isArray(categories) || categories.length === 0) {
      console.warn('CategoryAnalytics: No valid categories found');
      return [];
    }
    
    return categories
      .filter(category => category && typeof category === 'object' && category.id)
      .map(category => {
        try {
          return generatePerformanceData(category);
        } catch (error) {
          console.error('Error generating performance data for category:', category.id, error);
          // Return minimal valid data structure
          return {
            category: {
              ...category,
              color: category.color || '#6b7280'
            },
            articlesCount: 0,
            totalViews: 0,
            totalEngagement: 0,
            averageReadTime: 0,
            bounceRate: 0,
            topArticle: null,
            trending: 'stable' as const,
            growthRate: 0,
            engagementRate: 0,
            publishingFrequency: 0,
            readerRetention: 0,
            shareabilityScore: 0,
            timeOfDayPerformance: [],
            weeklyTrends: [],
            authorContribution: []
          };
        }
      });
  }, [articles, categories]);

  const sortedData = useMemo(() => {
    return [...performanceData].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.totalViews - a.totalViews;
        case 'engagement':
          return b.totalEngagement - a.totalEngagement;
        case 'articles':
          return b.articlesCount - a.articlesCount;
        default:
          return 0;
      }
    });
  }, [performanceData, sortBy]);

  const selectedCategoryData = selectedCategory === 'all' 
    ? null 
    : performanceData.find(d => d && d.category && d.category.id === selectedCategory) || null;

  const overallStats = useMemo(() => {
    const total = performanceData.reduce((acc, data) => ({
      views: acc.views + data.totalViews,
      engagement: acc.engagement + data.totalEngagement,
      articles: acc.articles + data.articlesCount,
      avgReadTime: acc.avgReadTime + data.averageReadTime
    }), { views: 0, engagement: 0, articles: 0, avgReadTime: 0 });

    return {
      ...total,
      avgReadTime: Math.floor(total.avgReadTime / performanceData.length),
      engagementRate: total.views > 0 ? (total.engagement / total.views) * 100 : 0
    };
  }, [performanceData]);

  const exportData = () => {
    const csvData = performanceData.map(data => ({
      'التصنيف': data.category?.nameAr || 'غير محدد',
      'عدد المقالات': data.articlesCount,
      'إجمالي المشاهدات': data.totalViews,
      'إجمالي التفاعل': data.totalEngagement,
      'معدل القراءة (ثانية)': data.averageReadTime,
      'معدل الارتداد %': data.bounceRate,
      'معدل النمو %': data.growthRate,
      'معدل التفاعل %': data.engagementRate,
      'تكرار النشر': data.publishingFrequency,
      'الاحتفاظ بالقراء %': data.readerRetention,
      'نقاط القابلية للمشاركة': data.shareabilityScore
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `category-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إحصائيات التصنيفات</h1>
          <p className="text-muted-foreground">متابعة شاملة لأداء جميع التصنيفات</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">حسب المشاهدات</SelectItem>
              <SelectItem value="engagement">حسب التفاعل</SelectItem>
              <SelectItem value="articles">حسب عدد المقالات</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">{overallStats.views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي التفاعل</p>
                <p className="text-2xl font-bold">{overallStats.engagement.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المقالات</p>
                <p className="text-2xl font-bold">{overallStats.articles}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل التفاعل</p>
                <p className="text-2xl font-bold">{overallStats.engagementRate.toFixed(1)}%</p>
              </div>
              <Share2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedCategory === 'all' ? 'overview' : 'detailed'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" onClick={() => setSelectedCategory('all')}>
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="detailed">
            تفاصيل التصنيف
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* مخطط أداء التصنيفات */}
          <Card>
            <CardHeader>
              <CardTitle>أداء التصنيفات - مقارنة شاملة</CardTitle>
              <CardDescription>
                مقارنة المشاهدات والتفاعل لجميع التصنيفات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category.nameAr" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => `التصنيف: ${label}`}
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      name === 'totalViews' ? 'المشاهدات' : 
                      name === 'totalEngagement' ? 'التفاعل' : 
                      name === 'articlesCount' ? 'المقالات' : name
                    ]}
                  />
                  <Bar dataKey="totalViews" fill="#3b82f6" name="المشاهدات" />
                  <Bar dataKey="totalEngagement" fill="#10b981" name="التفاعل" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع المشاهدات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المشاهدات</CardTitle>
                <CardDescription>نسبة المشاهدات لكل تصنيف</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sortedData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category.nameAr} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalViews"
                    >
                      {sortedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), 'المشاهدات']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>عدد المقالات</CardTitle>
                <CardDescription>توزيع المقالات حسب التصنيف</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sortedData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category.nameAr" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [value, 'عدد المقالات']}
                      labelFormatter={(label) => `التصنيف: ${label}`}
                    />
                    <Bar dataKey="articlesCount" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معدلات التفاعل</CardTitle>
                <CardDescription>معدل التفاعل بالنسبة للمشاهدات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category.nameAr" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'معدل التفاعل']}
                      labelFormatter={(label) => `التصنيف: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagementRate" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء الشامل</CardTitle>
                <CardDescription>مقارنة جميع المؤشرات لأهم التصنيفات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sortedData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category.nameAr" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        value.toFixed(1),
                        name === 'engagementRate' ? 'معدل التفاعل %' : 
                        name === 'readerRetention' ? 'الاحتفاظ بالقراء %' :
                        name === 'shareabilityScore' ? 'نقاط المشاركة' : name
                      ]}
                      labelFormatter={(label) => `التصنيف: ${label}`}
                    />
                    <Line type="monotone" dataKey="engagementRate" stroke="#3b82f6" strokeWidth={2} name="معدل التفاعل" />
                    <Line type="monotone" dataKey="readerRetention" stroke="#10b981" strokeWidth={2} name="الاحتفاظ بالقراء" />
                    <Line type="monotone" dataKey="shareabilityScore" stroke="#f59e0b" strokeWidth={2} name="نقاط المشاركة" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معدلات التفاعل</CardTitle>
                <CardDescription>معدل التفاعل بالنسبة للمشاهدات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category.nameAr" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'معدل التفاعل']}
                      labelFormatter={(label) => `التصنيف: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagementRate" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* جدول التصنيفات التفصيلي */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل أداء التصنيفات</CardTitle>
              <CardDescription>جدول شامل لجميع المؤشرات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">التصنيف</th>
                      <th className="text-right p-2">المقالات</th>
                      <th className="text-right p-2">المشاهدات</th>
                      <th className="text-right p-2">التفاعل</th>
                      <th className="text-right p-2">معدل التفاعل</th>
                      <th className="text-right p-2">وقت القراءة</th>
                      <th className="text-right p-2">معدل الارتداد</th>
                      <th className="text-right p-2">النمو</th>
                      <th className="text-right p-2">أفضل مقال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.filter(data => data && data.category).map((data) => (
                      <tr key={data.category?.id || 'unknown'} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{data.category?.icon || '📰'}</span>
                            <div>
                              <span className="font-medium">{data.category?.nameAr || 'غير محدد'}</span>
                              <Badge 
                                variant="secondary" 
                                className="mr-2"
                                style={{ 
                                  backgroundColor: data.category?.color ? data.category.color + '20' : '#6b728020',
                                  color: data.category?.color || '#6b7280'
                                }}
                              >
                                {data.category?.slug || 'عام'}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 font-medium">{data.articlesCount}</td>
                        <td className="p-2 font-medium">{data.totalViews.toLocaleString()}</td>
                        <td className="p-2 font-medium">{data.totalEngagement.toLocaleString()}</td>
                        <td className="p-2">
                          <span className="font-medium">{data.engagementRate.toFixed(1)}%</span>
                        </td>
                        <td className="p-2">{Math.floor(data.averageReadTime / 60)}:{(data.averageReadTime % 60).toString().padStart(2, '0')}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Progress value={data.bounceRate} className="w-12 h-2" />
                            <span className="text-xs">{data.bounceRate}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <TrendIcon trend={data.trending} />
                            <span className={`text-sm font-medium ${
                              data.trending === 'up' ? 'text-green-600' : 
                              data.trending === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {data.growthRate > 0 ? '+' : ''}{data.growthRate}%
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCategory(data.category?.id || 'unknown')}
                            className="text-xs"
                          >
                            {data.topArticle ? data.topArticle.title.substring(0, 30) + '...' : 'لا توجد مقالات'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">تفاصيل التصنيف</h2>
              <p className="text-muted-foreground">اختر تصنيفاً لعرض التفاصيل المتقدمة</p>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر تصنيفاً" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.nameAr}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategoryData && selectedCategoryData.category ? (
            <>
              {/* بطاقة معلومات التصنيف المختار */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedCategoryData.category.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{selectedCategoryData.category.nameAr}</CardTitle>
                      <CardDescription>{selectedCategoryData.category.description}</CardDescription>
                    </div>
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: selectedCategoryData.category?.color ? selectedCategoryData.category.color + '20' : '#6b728020',
                        color: selectedCategoryData.category?.color || '#6b7280'
                      }}
                    >
                      {selectedCategoryData.category.slug}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedCategoryData.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedCategoryData.totalEngagement.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">إجمالي التفاعل</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedCategoryData.articlesCount}</p>
                      <p className="text-sm text-muted-foreground">عدد المقالات</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{selectedCategoryData.engagementRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">معدل التفاعل</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* مؤشرات الأداء المتقدمة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">الاحتفاظ بالقراء</p>
                        <p className="text-xl font-bold">{selectedCategoryData.readerRetention}%</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <Progress value={selectedCategoryData.readerRetention} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">نقاط المشاركة</p>
                        <p className="text-xl font-bold">{selectedCategoryData.shareabilityScore}</p>
                      </div>
                      <Share2 className="h-8 w-8 text-green-500" />
                    </div>
                    <Progress value={selectedCategoryData.shareabilityScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">تكرار النشر</p>
                        <p className="text-xl font-bold">{selectedCategoryData.publishingFrequency}</p>
                        <p className="text-xs text-muted-foreground">مقالة/يوم</p>
                      </div>
                      <CalendarIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">متوسط وقت القراءة</p>
                        <p className="text-xl font-bold">{Math.floor(selectedCategoryData.averageReadTime / 60)}:{(selectedCategoryData.averageReadTime % 60).toString().padStart(2, '0')}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* الاتجاهات الأسبوعية */}
              <Card>
                <CardHeader>
                  <CardTitle>الاتجاهات الأسبوعية</CardTitle>
                  <CardDescription>تطور الأداء على مدار الأسابيع الماضية</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedCategoryData.weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => `الأسبوع: ${label}`}
                        formatter={(value: any, name: string) => [
                          value.toLocaleString(),
                          name === 'views' ? 'المشاهدات' : 
                          name === 'engagement' ? 'التفاعل' : 
                          name === 'articles' ? 'المقالات' : name
                        ]}
                      />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="المشاهدات" />
                      <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="التفاعل" />
                      <Line type="monotone" dataKey="articles" stroke="#f59e0b" strokeWidth={2} name="المقالات" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* أداء المؤلفين */}
              <Card>
                <CardHeader>
                  <CardTitle>مساهمة المؤلفين</CardTitle>
                  <CardDescription>أداء المؤلفين في هذا التصنيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCategoryData.authorContribution.map((author, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {author.authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{author.authorName}</p>
                            <p className="text-sm text-muted-foreground">{author.articles} مقالة</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{author.avgViews.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">متوسط المشاهدات</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* أداء حسب الوقت */}
              <Card>
                <CardHeader>
                  <CardTitle>أداء حسب الوقت</CardTitle>
                  <CardDescription>توزيع المشاهدات والتفاعل على مدار اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={selectedCategoryData.timeOfDayPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `الساعة: ${hour}:00`}
                        formatter={(value: any, name: string) => [
                          value.toLocaleString(),
                          name === 'views' ? 'المشاهدات' : 'التفاعل'
                        ]}
                      />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="engagement" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">اختر تصنيفاً</h3>
                <p className="text-muted-foreground">
                  يرجى اختيار تصنيف من القائمة أعلاه لعرض التحليلات التفصيلية
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CategoryAnalytics;