import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { mockCategories, mockArticles } from '@/lib/mockData';
import { Category, Article } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash,
  BarChart3,
  TrendingUp,
  Eye,
  Hash,
  Globe,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Users,
  Clock,
  Star,
  Activity,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CategoryStats {
  id: string;
  name: string;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgEngagement: number;
  weeklyGrowth: number;
  popularityScore: number;
  lastActivity: Date;
}

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  articles: {
    label: "Articles",
    color: "hsl(var(--chart-2))",
  },
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-3))",
  },
};

export function ComprehensiveCategoryManager() {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';

  const [categories, setCategories] = useKV<Category[]>('sabq-categories', mockCategories);
  const [articles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStats, setSelectedStats] = useState<string | null>(null);

  // Form state for category editing
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    nameEn: '',
    description: '',
    color: '#6b7280',
    icon: '📰',
    isActive: true,
    sortOrder: 0,
    metadata: {
      seoTitle: '',
      seoDescription: '',
      keywords: [] as string[]
    }
  });

  // Calculate category statistics
  const categoryStats: CategoryStats[] = categories.map(category => {
    const categoryArticles = articles.filter(article => article.category?.id === category.id);
    const totalViews = categoryArticles.reduce((sum, article) => sum + article.analytics.views, 0);
    const totalLikes = categoryArticles.reduce((sum, article) => sum + article.analytics.likes, 0);
    const totalShares = categoryArticles.reduce((sum, article) => sum + article.analytics.shares, 0);
    const avgEngagement = categoryArticles.length > 0 ? 
      (totalLikes + totalShares) / categoryArticles.length : 0;

    // Mock weekly growth calculation
    const weeklyGrowth = Math.random() * 20 - 10; // -10% to +10%
    
    const popularityScore = (totalViews * 0.4) + (totalLikes * 10) + (totalShares * 20) + (categoryArticles.length * 5);
    
    const lastActivity = categoryArticles.length > 0 ? 
      new Date(Math.max(...categoryArticles.map(a => new Date(a.updatedAt).getTime()))) :
      new Date();

    return {
      id: category.id,
      name: isArabic ? category.nameAr || category.name : category.nameEn || category.name,
      articleCount: categoryArticles.length,
      totalViews,
      totalLikes,
      totalShares,
      avgEngagement,
      weeklyGrowth,
      popularityScore,
      lastActivity
    };
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.nameAr?.toLowerCase().includes(searchLower) ||
      category.nameEn?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  });

  // Chart data for analytics
  const performanceData = categoryStats.slice(0, 10).map(stat => ({
    name: stat.name.length > 10 ? stat.name.substring(0, 10) + '...' : stat.name,
    fullName: stat.name,
    views: stat.totalViews,
    articles: stat.articleCount,
    engagement: Math.round(stat.avgEngagement)
  }));

  const engagementData = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.popularityScore,
    color: categories.find(c => c.id === stat.id)?.color || '#6b7280'
  }));

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      nameEn: '',
      description: '',
      color: '#6b7280',
      icon: '📰',
      isActive: true,
      sortOrder: categories.length,
      metadata: {
        seoTitle: '',
        seoDescription: '',
        keywords: []
      }
    });
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  // Load category data for editing
  const loadCategoryForEdit = (category: Category) => {
    setFormData({
      name: category.name,
      nameAr: category.nameAr || '',
      nameEn: category.nameEn || '',
      description: category.description || '',
      color: category.color,
      icon: category.icon || '📰',
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder || 0,
      metadata: {
        seoTitle: category.metadata?.seoTitle || '',
        seoDescription: category.metadata?.seoDescription || '',
        keywords: category.metadata?.keywords || []
      }
    });
    setEditingCategory(category);
    setIsAddingNew(true);
  };

  // Save category
  const saveCategory = () => {
    if (!formData.name.trim()) {
      toast.error(isArabic ? 'اسم التصنيف مطلوب' : 'Category name is required');
      return;
    }

    const categoryData: Category = {
      id: editingCategory?.id || `cat_${Date.now()}`,
      name: formData.name,
      nameAr: formData.nameAr || formData.name,
      nameEn: formData.nameEn || formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
      createdAt: editingCategory?.createdAt || new Date(),
      updatedAt: new Date(),
      metadata: formData.metadata
    };

    if (editingCategory) {
      setCategories(current => current.map(cat => 
        cat.id === editingCategory.id ? categoryData : cat
      ));
      toast.success(isArabic ? 'تم تحديث التصنيف' : 'Category updated');
    } else {
      setCategories(current => [...current, categoryData]);
      toast.success(isArabic ? 'تم إضافة التصنيف' : 'Category added');
    }

    resetForm();
  };

  // Delete category
  const deleteCategory = (categoryId: string) => {
    const categoryArticleCount = articles.filter(article => article.category?.id === categoryId).length;
    
    if (categoryArticleCount > 0) {
      toast.error(isArabic ? 
        `لا يمكن حذف التصنيف (${categoryArticleCount} مقال مرتبط به)` : 
        `Cannot delete category (${categoryArticleCount} articles linked)`
      );
      return;
    }

    setCategories(current => current.filter(cat => cat.id !== categoryId));
    toast.success(isArabic ? 'تم حذف التصنيف' : 'Category deleted');
  };

  // Toggle category status
  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(current => current.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  return (
    <div className={cn("space-y-6", typography.rtlText)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(typography.heading, "text-3xl font-bold")}>
            {isArabic ? 'إدارة التصنيفات' : 'Category Management'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? 'إدارة وتحليل تصنيفات المحتوى' : 'Manage and analyze content categories'}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isArabic ? 'تصنيف جديد' : 'New Category'}
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'بحث في التصنيفات...' : 'Search categories...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredCategories.length} {isArabic ? 'تصنيف' : 'categories'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            {isArabic ? 'إدارة التصنيفات' : 'Category Management'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {isArabic ? 'إحصائيات الأداء' : 'Performance Analytics'}
          </TabsTrigger>
        </TabsList>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-4">
            {filteredCategories.map((category) => {
              const stats = categoryStats.find(s => s.id === category.id);
              
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {isArabic ? category.nameAr : category.nameEn || category.name}
                            </h3>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? 
                                (isArabic ? 'نشط' : 'Active') : 
                                (isArabic ? 'غير نشط' : 'Inactive')
                              }
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-2">
                            {category.description}
                          </p>
                          
                          {stats && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>{stats.articleCount} {isArabic ? 'مقال' : 'articles'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{stats.totalViews.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className={cn("w-4 h-4", stats.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500")} />
                                <span className={stats.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                                  {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category.id)}
                        >
                          {category.isActive ? 
                            <XCircle className="w-4 h-4" /> : 
                            <CheckCircle className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadCategoryForEdit(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'إجمالي التصنيفات' : 'Total Categories'}
                  </span>
                </div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-xs text-muted-foreground">
                  {categories.filter(c => c.isActive).length} {isArabic ? 'نشط' : 'active'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'إجمالي المقالات' : 'Total Articles'}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {categoryStats.reduce((sum, stat) => sum + stat.articleCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? 'موزعة على التصنيفات' : 'across categories'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {categoryStats.reduce((sum, stat) => sum + stat.totalViews, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? 'في جميع التصنيفات' : 'across all categories'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'أفضل تصنيف' : 'Top Category'}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {categoryStats.sort((a, b) => b.popularityScore - a.popularityScore)[0]?.name.substring(0, 8) || '-'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? 'حسب النقاط' : 'by score'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {isArabic ? 'أداء التصنيفات' : 'Category Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{data.fullName}</p>
                              <p className="text-sm">
                                {isArabic ? 'المشاهدات: ' : 'Views: '}
                                <span className="font-medium">{data.views.toLocaleString()}</span>
                              </p>
                              <p className="text-sm">
                                {isArabic ? 'المقالات: ' : 'Articles: '}
                                <span className="font-medium">{data.articles}</span>
                              </p>
                              <p className="text-sm">
                                {isArabic ? 'التفاعل: ' : 'Engagement: '}
                                <span className="font-medium">{data.engagement}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="views" 
                      fill="var(--color-views)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {isArabic ? 'توزيع الشعبية' : 'Popularity Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={engagementData.slice(0, 8)} // Show top 8 categories
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {engagementData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-sm">
                                {isArabic ? 'نقاط الشعبية: ' : 'Popularity Score: '}
                                <span className="font-medium">{Math.round(data.value)}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {isArabic ? 'أفضل التصنيفات أداءً' : 'Top Performing Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats
                  .sort((a, b) => b.popularityScore - a.popularityScore)
                  .slice(0, 10)
                  .map((stat, index) => {
                    const category = categories.find(c => c.id === stat.id);
                    if (!category) return null;

                    return (
                      <div key={stat.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                          {index + 1}
                        </div>
                        
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{stat.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{stat.articleCount} {isArabic ? 'مقال' : 'articles'}</span>
                            <span>{stat.totalViews.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</span>
                            <span>{Math.round(stat.avgEngagement)} {isArabic ? 'تفاعل متوسط' : 'avg engagement'}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {Math.round(stat.popularityScore)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isArabic ? 'نقطة' : 'points'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddingNew} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 
                (isArabic ? 'تحرير التصنيف' : 'Edit Category') :
                (isArabic ? 'إضافة تصنيف جديد' : 'Add New Category')
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{isArabic ? 'الاسم بالعربية' : 'Name (Arabic)'}</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value, name: e.target.value }))}
                  placeholder={isArabic ? 'اسم التصنيف بالعربية' : 'Category name in Arabic'}
                />
              </div>
              <div>
                <Label>{isArabic ? 'الاسم بالإنجليزية' : 'Name (English)'}</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder={isArabic ? 'اسم التصنيف بالإنجليزية' : 'Category name in English'}
                />
              </div>
            </div>

            <div>
              <Label>{isArabic ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isArabic ? 'وصف التصنيف...' : 'Category description...'}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>{isArabic ? 'اللون' : 'Color'}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#6b7280"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>{isArabic ? 'الأيقونة' : 'Icon'}</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="📰"
                  className="text-center text-lg"
                />
              </div>
              
              <div>
                <Label>{isArabic ? 'ترتيب العرض' : 'Display Order'}</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {isArabic ? 'تفعيل التصنيف' : 'Enable Category'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إظهار التصنيف في قائمة التصنيفات' : 'Show category in categories list'}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">{isArabic ? 'إعدادات SEO' : 'SEO Settings'}</h4>
              
              <div>
                <Label>{isArabic ? 'عنوان SEO' : 'SEO Title'}</Label>
                <Input
                  value={formData.metadata.seoTitle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, seoTitle: e.target.value }
                  }))}
                  placeholder={isArabic ? 'عنوان محسن لمحركات البحث' : 'SEO optimized title'}
                />
              </div>
              
              <div>
                <Label>{isArabic ? 'وصف SEO' : 'SEO Description'}</Label>
                <Textarea
                  value={formData.metadata.seoDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, seoDescription: e.target.value }
                  }))}
                  placeholder={isArabic ? 'وصف محسن لمحركات البحث' : 'SEO optimized description'}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={saveCategory}>
                {editingCategory ? 
                  (isArabic ? 'تحديث' : 'Update') : 
                  (isArabic ? 'إضافة' : 'Add')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing import
import { Trophy } from '@phosphor-icons/react';