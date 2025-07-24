import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Edit,
  Trash,
  Tag as TagIcon,
  Folder,
  TrendUp,
  Users,
  Hash,
  Palette,
  Settings,
  Search,
  Filter,
  BarChart,
  Target
} from '@phosphor-icons/react';
import { Category, Tag } from '@/types';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { mockCategories } from '@/lib/mockData';
import { toast } from 'sonner';

interface CategoryManagerProps {
  onCategoryUpdate?: (categories: Category[]) => void;
}

export function CategoryManager({ onCategoryUpdate }: CategoryManagerProps) {
  const { user, canAccess } = useAuth();
  const [categories, setCategories] = useKV<Category[]>('sabq-categories', mockCategories);
  const [tags, setTags] = useKV<Tag[]>('sabq-tags', []);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'archived'>('all');

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    color: '#1f2937',
    icon: 'folder',
    parentId: '',
    isActive: true,
    sortOrder: 0,
    metadata: {
      seoTitle: '',
      seoDescription: '',
      keywords: [] as string[]
    }
  });

  const [tagForm, setTagForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    color: '#3b82f6',
    type: 'general' as 'general' | 'location' | 'person' | 'organization' | 'event',
    isActive: true,
    metadata: {
      relatedTerms: [] as string[],
      popularity: 0
    }
  });

  // Generate intelligent category suggestions
  const generateCategorySuggestions = async () => {
    try {
      const prompt = spark.llmPrompt`Based on modern Arabic news organizations, suggest 10-15 comprehensive news categories that would be relevant for "سبق الذكية" news platform. 

Consider:
- Traditional news categories (politics, sports, economy, etc.)
- Modern digital content areas (technology, lifestyle, health)
- Saudi Arabian context and regional interests
- Opinion and analysis sections

Return as JSON array with structure:
{
  "name": "Arabic name",
  "nameEn": "English name", 
  "description": "Brief description in Arabic",
  "color": "hex color code",
  "icon": "phosphor icon name"
}`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const suggestions = JSON.parse(result);
      
      // Add suggested categories
      setCategories(current => {
        const existing = current.map(c => c.name);
        const newCategories = suggestions
          .filter((s: any) => !existing.includes(s.name))
          .map((s: any, index: number) => ({
            id: `cat_${Date.now()}_${index}`,
            name: s.name,
            nameEn: s.nameEn,
            description: s.description,
            color: s.color,
            icon: s.icon,
            parentId: null,
            isActive: true,
            sortOrder: current.length + index,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              seoTitle: s.name,
              seoDescription: s.description,
              keywords: []
            }
          }));
        
        return [...current, ...newCategories];
      });

      toast.success(`تم إضافة ${suggestions.length} فئة جديدة`);
    } catch (error) {
      console.error('Error generating category suggestions:', error);
      toast.error('حدث خطأ في توليد الاقتراحات');
    }
  };

  // Generate trending tags based on content analysis
  const generateTrendingTags = async () => {
    try {
      const prompt = spark.llmPrompt`Generate 20-30 trending and relevant Arabic tags for a modern news platform covering Saudi Arabian and regional news.

Include:
- Current events and trending topics
- Geographic locations (cities, regions)
- Political figures and institutions  
- Technology and innovation terms
- Sports and entertainment
- Economic and business terms
- Social and cultural topics

Return as JSON array with structure:
{
  "name": "Arabic tag name",
  "nameEn": "English equivalent",
  "type": "general|location|person|organization|event",
  "color": "hex color code",
  "description": "Brief description"
}`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const suggestions = JSON.parse(result);
      
      // Add suggested tags
      setTags(current => {
        const existing = current.map(t => t.name);
        const newTags = suggestions
          .filter((s: any) => !existing.includes(s.name))
          .map((s: any, index: number) => ({
            id: `tag_${Date.now()}_${index}`,
            name: s.name,
            nameEn: s.nameEn,
            description: s.description,
            color: s.color,
            type: s.type,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              relatedTerms: [],
              popularity: Math.floor(Math.random() * 100)
            }
          }));
        
        return [...current, ...newTags];
      });

      toast.success(`تم إضافة ${suggestions.length} علامة جديدة`);
    } catch (error) {
      console.error('Error generating tag suggestions:', error);
      toast.error('حدث خطأ في توليد العلامات');
    }
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error('يرجى إدخال اسم الفئة');
      return;
    }

    const categoryData = {
      ...categoryForm,
      id: editingCategory?.id || `cat_${Date.now()}`,
      createdAt: editingCategory?.createdAt || new Date(),
      updatedAt: new Date()
    };

    setCategories(current => {
      if (editingCategory) {
        return current.map(cat => cat.id === editingCategory.id ? categoryData as Category : cat);
      } else {
        return [...current, categoryData as Category];
      }
    });

    onCategoryUpdate?.(categories);
    setIsCategoryDialogOpen(false);
    resetCategoryForm();
    toast.success(editingCategory ? 'تم تحديث الفئة' : 'تم إضافة الفئة');
  };

  const handleSaveTag = () => {
    if (!tagForm.name.trim()) {
      toast.error('يرجى إدخال اسم العلامة');
      return;
    }

    const tagData = {
      ...tagForm,
      id: editingTag?.id || `tag_${Date.now()}`,
      createdAt: editingTag?.createdAt || new Date(),
      updatedAt: new Date()
    };

    setTags(current => {
      if (editingTag) {
        return current.map(tag => tag.id === editingTag.id ? tagData as Tag : tag);
      } else {
        return [...current, tagData as Tag];
      }
    });

    setIsTagDialogOpen(false);
    resetTagForm();
    toast.success(editingTag ? 'تم تحديث العلامة' : 'تم إضافة العلامة');
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      nameEn: '',
      description: '',
      color: '#1f2937',
      icon: 'folder',
      parentId: '',
      isActive: true,
      sortOrder: 0,
      metadata: {
        seoTitle: '',
        seoDescription: '',
        keywords: []
      }
    });
    setEditingCategory(null);
  };

  const resetTagForm = () => {
    setTagForm({
      name: '',
      nameEn: '',
      description: '',
      color: '#3b82f6',
      type: 'general',
      isActive: true,
      metadata: {
        relatedTerms: [],
        popularity: 0
      }
    });
    setEditingTag(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      color: category.color,
      icon: category.icon || 'folder',
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
      metadata: category.metadata || {
        seoTitle: '',
        seoDescription: '',
        keywords: []
      }
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      nameEn: tag.nameEn || '',
      description: tag.description || '',
      color: tag.color,
      type: tag.type || 'general',
      isActive: tag.isActive,
      metadata: tag.metadata || {
        relatedTerms: [],
        popularity: 0
      }
    });
    setIsTagDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(current => current.filter(cat => cat.id !== categoryId));
    toast.success('تم حذف الفئة');
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(current => current.filter(tag => tag.id !== tagId));
    toast.success('تم حذف العلامة');
  };

  // Filter functions
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.nameEn && category.nameEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && category.isActive) ||
                         (filterType === 'archived' && !category.isActive);
    return matchesSearch && matchesFilter;
  });

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.nameEn && tag.nameEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && tag.isActive) ||
                         (filterType === 'archived' && !tag.isActive);
    return matchesSearch && matchesFilter;
  });

  if (!canAccess('content-management')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">غير مصرح</h2>
        <p className="text-muted-foreground mt-2">ليس لديك صلاحية للوصول لهذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الفئات والعلامات</h1>
          <p className="text-muted-foreground">تنظيم وإدارة تصنيفات المحتوى</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generateCategorySuggestions} variant="outline">
            <Target className="ml-2" size={16} />
            اقتراح فئات
          </Button>
          <Button onClick={generateTrendingTags} variant="outline">
            <TrendUp className="ml-2" size={16} />
            علامات رائجة
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="البحث في الفئات والعلامات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع العناصر</SelectItem>
            <SelectItem value="active">نشط فقط</SelectItem>
            <SelectItem value="archived">مؤرشف فقط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Categories and Tags */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder size={16} />
            الفئات ({filteredCategories.length})
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon size={16} />
            العلامات ({filteredTags.length})
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة الفئات</h2>
              
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetCategoryForm()}>
                    <Plus className="ml-2" size={16} />
                    إضافة فئة جديدة
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                    </DialogTitle>
                    <DialogDescription>
                      قم بتحديد تفاصيل الفئة ومعلوماتها
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>الاسم بالعربية *</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="مثال: السياسة"
                        />
                      </div>
                      <div>
                        <Label>الاسم بالإنجليزية</Label>
                        <Input
                          value={categoryForm.nameEn}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, nameEn: e.target.value }))}
                          placeholder="Politics"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>الوصف</Label>
                      <Textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف مختصر للفئة..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>اللون</Label>
                        <Input
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>الأيقونة</Label>
                        <Input
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="folder"
                        />
                      </div>
                      <div>
                        <Label>ترتيب العرض</Label>
                        <Input
                          type="number"
                          value={categoryForm.sortOrder}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>الفئة الأساسية</Label>
                      <Select value={categoryForm.parentId} onValueChange={(value) =>
                        setCategoryForm(prev => ({ ...prev, parentId: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة الأساسية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">بدون فئة أساسية</SelectItem>
                          {categories.filter(cat => cat.id !== editingCategory?.id).map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveCategory}>
                        {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                <Card key={category.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? 'نشط' : 'مؤرشف'}
                      </Badge>
                      {category.nameEn && (
                        <span className="text-xs text-muted-foreground">{category.nameEn}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة العلامات</h2>
              
              <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetTagForm()}>
                    <Plus className="ml-2" size={16} />
                    إضافة علامة جديدة
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTag ? 'تعديل العلامة' : 'إضافة علامة جديدة'}
                    </DialogTitle>
                    <DialogDescription>
                      قم بتحديد تفاصيل العلامة ونوعها
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>الاسم بالعربية *</Label>
                        <Input
                          value={tagForm.name}
                          onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="مثال: الرياض"
                        />
                      </div>
                      <div>
                        <Label>الاسم بالإنجليزية</Label>
                        <Input
                          value={tagForm.nameEn}
                          onChange={(e) => setTagForm(prev => ({ ...prev, nameEn: e.target.value }))}
                          placeholder="Riyadh"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>الوصف</Label>
                      <Textarea
                        value={tagForm.description}
                        onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف مختصر للعلامة..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>النوع</Label>
                        <Select value={tagForm.type} onValueChange={(value: any) =>
                          setTagForm(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">عام</SelectItem>
                            <SelectItem value="location">موقع</SelectItem>
                            <SelectItem value="person">شخص</SelectItem>
                            <SelectItem value="organization">منظمة</SelectItem>
                            <SelectItem value="event">حدث</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>اللون</Label>
                        <Input
                          type="color"
                          value={tagForm.color}
                          onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveTag}>
                        {editingTag ? 'تحديث العلامة' : 'إضافة العلامة'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTags.map(tag => (
                <Card key={tag.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hash size={14} style={{ color: tag.color }} />
                        <span className="font-medium text-sm">{tag.name}</span>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTag(tag)}
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {tag.type}
                      </Badge>
                      <Badge variant={tag.isActive ? "default" : "secondary"} className="text-xs">
                        {tag.isActive ? 'نشط' : 'مؤرشف'}
                      </Badge>
                    </div>
                    
                    {tag.metadata?.popularity !== undefined && (
                      <div className="mt-2 flex items-center gap-1">
                        <BarChart size={12} />
                        <span className="text-xs text-muted-foreground">
                          {tag.metadata.popularity}% شائع
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}