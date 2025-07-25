import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { mockArticles, mockCategories } from '@/lib/mockData';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { normalizeArticles, safeDateFormat } from '@/lib/utils';
import { CategoryDisplay } from '@/components/categories';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Eye, 
  Heart, 
  ShareNetwork, 
  Edit, 
  Trash, 
  Calendar,
  Clock,
  Plus,
  TrendUp,
  FileText,
  Users,
  BarChart3,
  Target,
  EyeSlash,
  Warning,
  Check,
  X
} from '@phosphor-icons/react';

interface ComprehensiveArticleModuleProps {
  onEditArticle: (article: Article) => void;
  onCreateNew: () => void;
}

export function ComprehensiveArticleModule({ onEditArticle, onCreateNew }: ComprehensiveArticleModuleProps) {
  const { language, hasPermission } = useAuth();
  const typography = useOptimizedTypography();
  const [rawArticles, setRawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const setArticles = (updater: (currentArticles: Article[]) => Article[]) => {
    setRawArticles(currentArticles => {
      const normalized = normalizeArticles(currentArticles);
      return updater(normalized);
    });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const { isRTL, isArabic } = typography;

  // Calculate statistics
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    scheduled: articles.filter(a => a.status === 'scheduled').length,
    disabled: articles.filter(a => a.status === 'disabled').length,
    breaking: articles.filter(a => a.priority === 'breaking').length,
    todayArticles: articles.filter(a => {
      const today = new Date().toDateString();
      const articleDate = new Date(a.createdAt).toDateString();
      return articleDate === today;
    }).length,
    weekArticles: articles.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.createdAt) >= weekAgo;
    }).length,
    totalViews: articles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0),
    totalEngagement: articles.reduce((sum, a) => sum + (a.analytics?.likes || 0) + (a.analytics?.shares || 0), 0),
    topPerforming: articles
      .filter(a => a.status === 'published')
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, 5)
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    try {
      return safeDateFormat(date, language.code === 'ar' ? 'ar-SA' : 'en-US');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (article.category && article.category.id === categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string, priority?: string) => {
    if (priority === 'breaking') return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, priority?: string) => {
    if (priority === 'breaking') {
      return language.code === 'ar' ? 'عاجل' : 'Breaking';
    }
    
    if (language.code === 'ar') {
      switch (status) {
        case 'published': return 'منشور';
        case 'draft': return 'مسودة';
        case 'scheduled': return 'مجدول';
        case 'disabled': return 'معطل';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = (id: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this article?')) {
      setArticles(currentArticles => currentArticles.filter(article => article.id !== id));
      toast.success(isArabic ? 'تم حذف المقال بنجاح' : 'Article deleted successfully');
    }
  };

  const handleToggleStatus = (id: string, newStatus: 'published' | 'disabled' | 'draft') => {
    setArticles(currentArticles => 
      currentArticles.map(article => 
        article.id === id 
          ? { ...article, status: newStatus, updatedAt: new Date() }
          : article
      )
    );
    
    const statusText = newStatus === 'disabled' 
      ? (isArabic ? 'تم إخفاء المقال' : 'Article hidden')
      : (isArabic ? 'تم إظهار المقال' : 'Article shown');
    
    toast.success(statusText);
  };

  const handleMarkAsBreaking = (id: string) => {
    setArticles(currentArticles => 
      currentArticles.map(article => 
        article.id === id 
          ? { 
              ...article, 
              priority: article.priority === 'breaking' ? 'normal' : 'breaking',
              status: 'published',
              updatedAt: new Date()
            }
          : article
      )
    );
    
    const article = articles.find(a => a.id === id);
    const isBreaking = article?.priority !== 'breaking';
    
    toast.success(
      isBreaking 
        ? (isArabic ? 'تم تمييز المقال كخبر عاجل' : 'Article marked as breaking news')
        : (isArabic ? 'تم إلغاء تمييز المقال كخبر عاجل' : 'Article unmarked as breaking news')
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendUp className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${typography.rtlText}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className={typography.heading}>
            {isArabic ? 'إدارة المقالات' : 'Article Management'}
          </h1>
          <p className={`${typography.summary} mt-1`}>
            {isArabic 
              ? 'نظرة شاملة على جميع المقالات والمحتوى التحريري' 
              : 'Comprehensive overview of all articles and editorial content'}
          </p>
        </div>
        {hasPermission('create') && (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onCreateNew} 
              className={`${typography.button} gap-2`} 
              size="lg"
            >
              <Plus size={18} />
              {language.code === 'ar' ? 'إنشاء خبر جديد' : 'Create New Article'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {language.code === 'ar' ? 'متاح في جميع التبويبات' : 'Available in all tabs'}
            </p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2">
            <FileText className="w-4 h-4" />
            {isArabic ? 'جميع المقالات' : 'All Articles'}
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Target className="w-4 h-4" />
            {isArabic ? 'الأداء' : 'Performance'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={FileText}
              title={isArabic ? 'إجمالي المقالات' : 'Total Articles'}
              value={stats.total}
              subtitle={isArabic ? `${stats.published} منشور` : `${stats.published} published`}
            />
            <StatCard
              icon={Calendar}
              title={isArabic ? 'اليوم' : 'Today'}
              value={stats.todayArticles}
              subtitle={isArabic ? 'مقال جديد' : 'new articles'}
              trend={stats.todayArticles > 0 ? '+100%' : undefined}
            />
            <StatCard
              icon={Eye}
              title={isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
              value={stats.totalViews.toLocaleString()}
              subtitle={isArabic ? 'هذا الأسبوع' : 'this week'}
            />
            <StatCard
              icon={Heart}
              title={isArabic ? 'التفاعل' : 'Engagement'}
              value={stats.totalEngagement}
              subtitle={isArabic ? 'إعجابات ومشاركات' : 'likes & shares'}
            />
            <StatCard
              icon={Warning}
              title={isArabic ? 'الأخبار العاجلة' : 'Breaking News'}
              value={stats.breaking}
              subtitle={isArabic ? 'خبر عاجل نشط' : 'active breaking news'}
            />
          </div>

          {/* Quick Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {isArabic ? 'حالة المقالات' : 'Article Status'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                  <div className="text-sm text-green-700">{isArabic ? 'منشور' : 'Published'}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                  <div className="text-sm text-yellow-700">{isArabic ? 'مسودة' : 'Draft'}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                  <div className="text-sm text-blue-700">{isArabic ? 'مجدول' : 'Scheduled'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{stats.disabled}</div>
                  <div className="text-sm text-gray-700">{isArabic ? 'معطل' : 'Disabled'}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.breaking}</div>
                  <div className="text-sm text-red-700">{isArabic ? 'عاجل' : 'Breaking'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {articles.slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={article.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {article.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {article.author.name} • {formatDate(article.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(article.status, article.priority)} variant="secondary">
                      {getStatusText(article.status, article.priority)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={language.code === 'ar' ? 'البحث في المقالات...' : 'Search articles...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter size={16} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language.code === 'ar' ? 'جميع الحالات' : 'All Status'}
                    </SelectItem>
                    <SelectItem value="published">
                      {language.code === 'ar' ? 'منشور' : 'Published'}
                    </SelectItem>
                    <SelectItem value="draft">
                      {language.code === 'ar' ? 'مسودة' : 'Draft'}
                    </SelectItem>
                    <SelectItem value="scheduled">
                      {language.code === 'ar' ? 'مجدول' : 'Scheduled'}
                    </SelectItem>
                    <SelectItem value="disabled">
                      {language.code === 'ar' ? 'معطل' : 'Disabled'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language.code === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
                    </SelectItem>
                    {mockCategories
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .filter(category => category.isActive !== false)
                      .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{category.icon}</span>
                          <div 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          />
                          <span>
                            {language.code === 'ar' ? category.nameAr || category.name : category.nameEn || category.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Quick Create Button in Articles Tab */}
                {hasPermission('create') && (
                  <Button 
                    onClick={onCreateNew}
                    className="gap-2 whitespace-nowrap"
                    variant="default"
                  >
                    <Plus size={16} />
                    {language.code === 'ar' ? 'جديد' : 'New'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {article.featuredImage && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusColor(article.status, article.priority)}`}
                      variant="secondary"
                    >
                      {getStatusText(article.status, article.priority)}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>
                    {!article.featuredImage && (
                      <Badge 
                        className={getStatusColor(article.status, article.priority)}
                        variant="secondary"
                      >
                        {getStatusText(article.status, article.priority)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Author & Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={article.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {article.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{article.author.name}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {article.status === 'scheduled' ? <Clock size={12} /> : <Calendar size={12} />}
                      <span>
                        {formatDate(article.publishedAt || article.scheduledAt || article.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Category & Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {article.category && (
                      <CategoryDisplay 
                        category={article.category}
                        variant="compact"
                        showIcon={true}
                        showColor={true}
                      />
                    )}
                    {article.tags && article.tags.length > 0 && article.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {language.code === 'ar' ? tag.nameAr || tag.name : tag.name}
                      </Badge>
                    ))}
                    {article.tags && article.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Analytics */}
                  {article.status === 'published' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{article.analytics.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={14} />
                        <span>{article.analytics.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShareNetwork size={14} />
                        <span>{article.analytics.shares}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    {/* Primary Actions Row */}
                    <div className="flex items-center gap-2">
                      {hasPermission('edit') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditArticle(article)}
                          className="flex-1 gap-1"
                        >
                          <Edit size={14} />
                          {language.code === 'ar' ? 'تحرير' : 'Edit'}
                        </Button>
                      )}
                      
                      {hasPermission('edit') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>

                    {/* Secondary Actions Row */}
                    {hasPermission('edit') && (
                      <div className="flex items-center gap-2">
                        {/* Toggle Visibility */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(
                            article.id, 
                            article.status === 'disabled' ? 'published' : 'disabled'
                          )}
                          className="flex-1 gap-1 text-xs"
                        >
                          {article.status === 'disabled' ? (
                            <>
                              <Eye size={12} />
                              {language.code === 'ar' ? 'إظهار' : 'Show'}
                            </>
                          ) : (
                            <>
                              <EyeSlash size={12} />
                              {language.code === 'ar' ? 'إخفاء' : 'Hide'}
                            </>
                          )}
                        </Button>

                        {/* Breaking News Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsBreaking(article.id)}
                          className={`flex-1 gap-1 text-xs ${
                            article.priority === 'breaking' 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : ''
                          }`}
                        >
                          <Warning size={12} />
                          {article.priority === 'breaking' 
                            ? (language.code === 'ar' ? 'إلغاء العاجل' : 'Remove Breaking')
                            : (language.code === 'ar' ? 'عاجل' : 'Breaking')
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {language.code === 'ar' ? 'لا توجد مقالات' : 'No articles found'}
                </p>
                {hasPermission('create') && (
                  <Button onClick={onCreateNew} className="mt-4 gap-2">
                    <Plus size={16} />
                    {language.code === 'ar' ? 'إنشاء أول مقال' : 'Create your first article'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Performing Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {isArabic ? 'المقالات الأكثر أداءً' : 'Top Performing Articles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPerforming.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {article.author.name} • {formatDate(article.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{article.analytics.views.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {isArabic ? 'مشاهدة' : 'views'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}