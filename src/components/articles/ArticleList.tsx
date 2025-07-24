import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { mockArticles, mockCategories } from '@/lib/mockData';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
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
  Plus
} from '@phosphor-icons/react';

interface ArticleListProps {
  onEditArticle: (article: Article) => void;
  onCreateNew: () => void;
}

export function ArticleList({ onEditArticle, onCreateNew }: ArticleListProps) {
  const { language, hasPermission } = useAuth();
  const typography = useOptimizedTypography();
  const [articles, setArticles] = useKV<Article[]>('newsflow-articles', mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { isRTL, isArabic } = typography;

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category.id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (language.code === 'ar') {
      switch (status) {
        case 'published': return 'منشور';
        case 'draft': return 'مسودة';
        case 'scheduled': return 'مجدول';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = (id: string) => {
    setArticles(currentArticles => currentArticles.filter(article => article.id !== id));
  };

  return (
    <div className={`space-y-6 ${typography.rtlText}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={typography.heading}>
            {isArabic ? 'المقالات' : 'Articles'}
          </h1>
          <p className={`${typography.summary} mt-1`}>
            {isArabic 
              ? 'إدارة وتنظيم جميع المقالات' 
              : 'Manage and organize all your articles'}
          </p>
        </div>
        {hasPermission('create') && (
          <Button onClick={onCreateNew} className={typography.button}>
            <Plus size={16} />
            {language.code === 'ar' ? 'مقال جديد' : 'New Article'}
          </Button>
        )}
      </div>

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
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {language.code === 'ar' ? category.nameAr : category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  className={`absolute top-2 right-2 ${getStatusColor(article.status)}`}
                  variant="secondary"
                >
                  {getStatusText(article.status)}
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
                    className={getStatusColor(article.status)}
                    variant="secondary"
                  >
                    {getStatusText(article.status)}
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
                    {article.publishedAt 
                      ? new Date(article.publishedAt).toLocaleDateString(
                          language.code === 'ar' ? 'ar-SA' : 'en-US'
                        )
                      : article.scheduledAt
                      ? new Date(article.scheduledAt).toLocaleDateString(
                          language.code === 'ar' ? 'ar-SA' : 'en-US'
                        )
                      : new Date(article.createdAt).toLocaleDateString(
                          language.code === 'ar' ? 'ar-SA' : 'en-US'
                        )
                    }
                  </span>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  style={{ borderColor: article.category.color, color: article.category.color }}
                  className="text-xs"
                >
                  {language.code === 'ar' ? article.category.nameAr : article.category.name}
                </Badge>
                {article.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {language.code === 'ar' ? tag.nameAr : tag.name}
                  </Badge>
                ))}
                {article.tags.length > 2 && (
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
              <div className="flex items-center gap-2 pt-2 border-t">
                {hasPermission('edit') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditArticle(article)}
                    className="flex-1"
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
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={14} />
                  </Button>
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
              <Button onClick={onCreateNew} className="mt-4">
                <Plus size={16} />
                {language.code === 'ar' ? 'إنشاء أول مقال' : 'Create your first article'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}