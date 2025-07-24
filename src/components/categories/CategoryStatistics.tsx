import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { mockCategories, mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { 
  Eye, 
  Heart, 
  ShareNetwork, 
  MessageCircle,
  TrendUp, 
  TrendDown,
  Calendar,
  Users,
  Target,
  BarChart,
  FileText,
  Clock
} from '@phosphor-icons/react';
import { useState } from 'react';

const chartConfig = {
  views: {
    label: "مشاهدات",
    color: "hsl(var(--chart-1))",
  },
  articles: {
    label: "مقالات",
    color: "hsl(var(--chart-2))",
  },
  engagement: {
    label: "تفاعل",
    color: "hsl(var(--chart-3))",
  },
};

export function CategoryStatistics() {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get articles from KV store
  const [rawArticles] = useKV('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);

  // Calculate category statistics
  const getCategoryStats = () => {
    return mockCategories.map(category => {
      const categoryArticles = articles.filter(article => 
        article.category?.id === category.id && 
        article.status === 'published'
      );
      
      const totalViews = categoryArticles.reduce((sum, article) => sum + (article.analytics?.views || 0), 0);
      const totalLikes = categoryArticles.reduce((sum, article) => sum + (article.analytics?.likes || 0), 0);
      const totalShares = categoryArticles.reduce((sum, article) => sum + (article.analytics?.shares || 0), 0);
      const totalComments = categoryArticles.reduce((sum, article) => sum + (article.analytics?.comments || 0), 0);
      
      const avgViews = categoryArticles.length > 0 ? totalViews / categoryArticles.length : 0;
      const engagementRate = totalViews > 0 ? ((totalLikes + totalShares + totalComments) / totalViews) * 100 : 0;
      
      // Calculate trend (simplified - in real app would compare with previous period)
      const recentArticles = categoryArticles.filter(article => {
        const createdAt = new Date(article.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt >= weekAgo;
      });
      
      const trend = recentArticles.length > categoryArticles.length * 0.3 ? 'up' : 
                   recentArticles.length < categoryArticles.length * 0.1 ? 'down' : 'stable';

      return {
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        icon: category.icon,
        color: category.color,
        articleCount: categoryArticles.length,
        totalViews,
        avgViews: Math.round(avgViews),
        totalLikes,
        totalShares,
        totalComments,
        engagementRate: Number(engagementRate.toFixed(1)),
        trend,
        isActive: category.isActive
      };
    }).filter(stat => stat.isActive);
  };

  const categoryStats = getCategoryStats();
  
  // Sort by performance
  const sortedByViews = [...categoryStats].sort((a, b) => b.totalViews - a.totalViews);
  const sortedByEngagement = [...categoryStats].sort((a, b) => b.engagementRate - a.engagementRate);

  // Prepare chart data
  const chartData = categoryStats.map(stat => ({
    name: stat.nameAr || stat.name,
    views: stat.totalViews,
    articles: stat.articleCount,
    engagement: stat.engagementRate,
    fill: stat.color
  }));

  // Performance metrics
  const totalArticles = categoryStats.reduce((sum, stat) => sum + stat.articleCount, 0);
  const totalViews = categoryStats.reduce((sum, stat) => sum + stat.totalViews, 0);
  const avgEngagement = categoryStats.reduce((sum, stat) => sum + stat.engagementRate, 0) / categoryStats.length || 0;

  // Top performing categories
  const topPerformers = sortedByViews.slice(0, 3);
  const topEngagement = sortedByEngagement.slice(0, 3);

  return (
    <div className={`space-y-6 ${typography.rtlText}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${typography.heading}`}>
            {isArabic ? 'إحصائيات التصنيفات' : 'Category Statistics'}
          </h1>
          <p className={`text-muted-foreground mt-1 ${typography.body}`}>
            {isArabic ? 'تتبع أداء كل تصنيف ومقاييس التفاعل' : 'Track performance and engagement metrics for each category'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 font-arabic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{isArabic ? '7 أيام' : '7 Days'}</SelectItem>
              <SelectItem value="30d">{isArabic ? '30 يوم' : '30 Days'}</SelectItem>
              <SelectItem value="90d">{isArabic ? '90 يوم' : '90 Days'}</SelectItem>
              <SelectItem value="1y">{isArabic ? 'سنة' : '1 Year'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 font-arabic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'جميع التصنيفات' : 'All Categories'}</SelectItem>
              {mockCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="font-arabic">{category.nameAr || category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'إجمالي التصنيفات' : 'Total Categories'}
                </p>
                <p className="text-2xl font-bold">{categoryStats.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'إجمالي المقالات' : 'Total Articles'}
                </p>
                <p className="text-2xl font-bold">{totalArticles.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
                </p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'متوسط التفاعل' : 'Avg Engagement'}
                </p>
                <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Category */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.heading}>
              {isArabic ? 'المشاهدات حسب التصنيف' : 'Views by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.heading}>
              {isArabic ? 'معدل التفاعل' : 'Engagement Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="var(--color-engagement)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.heading}>
            {isArabic ? 'أداء التصنيفات التفصيلي' : 'Detailed Category Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${typography.heading}`}>
                        {stat.nameAr || stat.name}
                      </h3>
                      <p className={`text-sm text-muted-foreground ${typography.body}`}>
                        {stat.articleCount} {isArabic ? 'مقال' : 'articles'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{stat.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'مشاهدة' : 'views'}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-bold">{stat.avgViews.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'متوسط/مقال' : 'avg/article'}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-bold">{stat.engagementRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'تفاعل' : 'engagement'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {stat.trend === 'up' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendUp className="w-4 h-4" />
                          <span className="text-sm">{isArabic ? 'صاعد' : 'Rising'}</span>
                        </div>
                      )}
                      {stat.trend === 'down' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendDown className="w-4 h-4" />
                          <span className="text-sm">{isArabic ? 'هابط' : 'Falling'}</span>
                        </div>
                      )}
                      {stat.trend === 'stable' && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                          <span className="text-sm">{isArabic ? 'مستقر' : 'Stable'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress bars for detailed metrics */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isArabic ? 'الإعجابات' : 'Likes'}
                      </span>
                      <span className="text-xs font-medium">{stat.totalLikes}</span>
                    </div>
                    <Progress 
                      value={stat.totalViews > 0 ? (stat.totalLikes / stat.totalViews) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isArabic ? 'المشاركات' : 'Shares'}
                      </span>
                      <span className="text-xs font-medium">{stat.totalShares}</span>
                    </div>
                    <Progress 
                      value={stat.totalViews > 0 ? (stat.totalShares / stat.totalViews) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isArabic ? 'التعليقات' : 'Comments'}
                      </span>
                      <span className="text-xs font-medium">{stat.totalComments}</span>
                    </div>
                    <Progress 
                      value={stat.totalViews > 0 ? (stat.totalComments / stat.totalViews) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Views */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.heading}>
              {isArabic ? 'الأكثر مشاهدة' : 'Most Viewed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((stat, index) => (
                <div key={stat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${typography.body}`}>
                      {stat.nameAr || stat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.totalViews.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {stat.articleCount} {isArabic ? 'مقال' : 'articles'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top by Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.heading}>
              {isArabic ? 'الأكثر تفاعلاً' : 'Most Engaging'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEngagement.map((stat, index) => (
                <div key={stat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${typography.body}`}>
                      {stat.nameAr || stat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.engagementRate}% {isArabic ? 'معدل تفاعل' : 'engagement rate'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {stat.totalLikes + stat.totalShares + stat.totalComments} {isArabic ? 'تفاعل' : 'interactions'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}