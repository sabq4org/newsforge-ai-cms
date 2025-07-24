import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye, EyeOff, Palette, Tag, ArrowUp, ArrowDown, Sparkles } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Category } from '@/types';
import { mockCategories } from '@/lib/mockData';

import { CategorySeeder } from './CategorySeeder';

interface CategoryFormData {
  name: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  metadata: {
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
  };
}

const defaultFormData: CategoryFormData = {
  name: '',
  nameAr: '',
  nameEn: '',
  slug: '',
  description: '',
  color: '#3b82f6',
  icon: '📰',
  isActive: true,
  sortOrder: 0,
  metadata: {
    seoTitle: '',
    seoDescription: '',
    keywords: []
  }
};

const predefinedCategories = [
  {
    nameAr: 'محليات',
    nameEn: 'Local',
    slug: 'local',
    description: 'أخبار السعودية والمناطق',
    color: '#1e40af',
    icon: '🗺️'
  },
  {
    nameAr: 'العالم',
    nameEn: 'World',
    slug: 'world',
    description: 'الشؤون الدولية والتحليلات',
    color: '#059669',
    icon: '🌍'
  },
  {
    nameAr: 'حياتنا',
    nameEn: 'Life',
    slug: 'life',
    description: 'نمط الحياة، الصحة، والمجتمع',
    color: '#dc2626',
    icon: '🌱'
  },
  {
    nameAr: 'محطات',
    nameEn: 'Stations',
    slug: 'stations',
    description: 'ملفات وتقارير خاصة',
    color: '#7c3aed',
    icon: '🛤️'
  },
  {
    nameAr: 'رياضة',
    nameEn: 'Sports',
    slug: 'sports',
    description: 'الرياضة محليًا وعالميًا',
    color: '#10b981',
    icon: '⚽'
  },
  {
    nameAr: 'سياحة',
    nameEn: 'Tourism',
    slug: 'tourism',
    description: 'تقارير ومواقع مميزة',
    color: '#0891b2',
    icon: '🧳'
  },
  {
    nameAr: 'أعمال',
    nameEn: 'Business',
    slug: 'business',
    description: 'أخبار الاقتصاد والشركات',
    color: '#f59e0b',
    icon: '💼'
  },
  {
    nameAr: 'تقنية',
    nameEn: 'Technology',
    slug: 'technology',
    description: 'الذكاء الاصطناعي والتكنولوجيا',
    color: '#3b82f6',
    icon: '💻'
  },
  {
    nameAr: 'سيارات',
    nameEn: 'Cars',
    slug: 'cars',
    description: 'كل ما يتعلق بالسيارات',
    color: '#ef4444',
    icon: '🚗'
  },
  {
    nameAr: 'ميديا',
    nameEn: 'Media',
    slug: 'media',
    description: 'محتوى رقمي وفيديوهات',
    color: '#8b5cf6',
    icon: '🎬'
  }
];

const commonIcons = ['📰', '🗺️', '🌍', '🌱', '🛤️', '⚽', '🧳', '💼', '💻', '🚗', '🎬', '🎭', '🎵', '🍽️', '🏠', '⚖️', '🔬', '🎓', '💰', '🏥'];

export function CategoryManager({ onCategoryUpdate }: { onCategoryUpdate: (categories: Category[]) => void }) {
  const [categories, setCategories] = useKV<Category[]>('sabq-categories', []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [filteredCategories]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from nameEn
      if (field === 'nameEn' && value) {
        updated.slug = generateSlug(value);
      }
      
      // Auto-generate SEO title from nameAr
      if (field === 'nameAr' && value) {
        updated.metadata.seoTitle = `${value} - سبق الذكية`;
      }
      
      return updated;
    });
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    if (!formData.nameAr.trim()) {
      toast.error('يرجى إدخال الاسم بالعربية');
      return false;
    }
    if (!formData.nameEn.trim()) {
      toast.error('يرجى إدخال الاسم بالإنجليزية');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('يرجى إدخال الرمز المميز');
      return false;
    }
    
    // Check for duplicate slug
    const existingCategory = categories.find(cat => 
      cat.slug === formData.slug && cat.id !== editingCategory?.id
    );
    if (existingCategory) {
      toast.error('الرمز المميز موجود بالفعل');
      return false;
    }
    
    return true;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    
    const newCategory: Category = {
      id: `category_${Date.now()}`,
      name: formData.nameAr,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn,
      slug: formData.slug,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder || categories.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: formData.metadata
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    
    setFormData(defaultFormData);
    setIsCreateDialogOpen(false);
    toast.success('تم إنشاء التصنيف بنجاح');
  };

  const handleEdit = () => {
    if (!validateForm() || !editingCategory) return;
    
    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: formData.nameAr,
            nameAr: formData.nameAr,
            nameEn: formData.nameEn,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            icon: formData.icon,
            isActive: formData.isActive,
            sortOrder: formData.sortOrder,
            updatedAt: new Date(),
            metadata: formData.metadata
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    
    setEditingCategory(null);
    setFormData(defaultFormData);
    setIsEditDialogOpen(false);
    toast.success('تم تحديث التصنيف بنجاح');
  };

  const handleDelete = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    toast.success('تم حذف التصنيف بنجاح');
  };

  const toggleActive = (categoryId: string) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, isActive: !cat.isActive, updatedAt: new Date() }
        : cat
    );
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    toast.success('تم تحديث حالة التصنيف');
  };

  const moveCategoryOrder = (categoryId: string, direction: 'up' | 'down') => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) return;
    
    const newIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    
    const updatedCategories = [...categories];
    [updatedCategories[categoryIndex], updatedCategories[newIndex]] = 
    [updatedCategories[newIndex], updatedCategories[categoryIndex]];
    
    // Update sort order
    updatedCategories.forEach((cat, index) => {
      cat.sortOrder = index;
      cat.updatedAt = new Date();
    });
    
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    toast.success('تم تحديث ترتيب التصنيفات');
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.nameAr || '',
      nameAr: category.nameAr || '',
      nameEn: category.nameEn || '',
      slug: category.slug,
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
    setIsEditDialogOpen(true);
  };

  const seedPredefinedCategories = () => {
    const newCategories = predefinedCategories.map((cat, index) => ({
      id: `category_predefined_${Date.now()}_${index}`,
      name: cat.nameAr,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      isActive: true,
      sortOrder: categories.length + index,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        seoTitle: `${cat.nameAr} - سبق الذكية`,
        seoDescription: cat.description,
        keywords: [cat.nameAr, cat.nameEn]
      }
    }));
    
    const updatedCategories = [...categories, ...newCategories];
    setCategories(updatedCategories);
    onCategoryUpdate(updatedCategories);
    toast.success(`تم إضافة ${newCategories.length} تصنيف افتراضي`);
  };

  const CategoryForm = () => (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nameAr">الاسم بالعربية *</Label>
          <Input
            id="nameAr"
            value={formData.nameAr}
            onChange={(e) => handleFormChange('nameAr', e.target.value)}
            placeholder="محليات"
          />
        </div>
        <div>
          <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => handleFormChange('nameEn', e.target.value)}
            placeholder="Local"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slug">الرمز المميز *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleFormChange('slug', e.target.value)}
            placeholder="local"
          />
        </div>
        <div>
          <Label htmlFor="sortOrder">ترتيب العرض</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => handleFormChange('sortOrder', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="وصف التصنيف..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="color">اللون</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => handleFormChange('color', e.target.value)}
              className="w-16 h-10"
            />
            <Input
              value={formData.color}
              onChange={(e) => handleFormChange('color', e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="icon">الأيقونة</Label>
          <div className="flex items-center gap-2">
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => handleFormChange('icon', e.target.value)}
              placeholder="📰"
              className="w-16 text-center"
            />
            <div className="flex flex-wrap gap-1">
              {commonIcons.slice(0, 8).map(icon => (
                <Button
                  key={icon}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => handleFormChange('icon', icon)}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label>الحالة</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleFormChange('isActive', checked)}
            />
            <span className="text-sm">{formData.isActive ? 'نشط' : 'غير نشط'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>إعدادات SEO</Label>
        <Input
          value={formData.metadata.seoTitle}
          onChange={(e) => handleMetadataChange('seoTitle', e.target.value)}
          placeholder="عنوان SEO"
        />
        <Textarea
          value={formData.metadata.seoDescription}
          onChange={(e) => handleMetadataChange('seoDescription', e.target.value)}
          placeholder="وصف SEO"
        />
        <Input
          value={formData.metadata.keywords.join(', ')}
          onChange={(e) => handleMetadataChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
          placeholder="كلمات مفتاحية (مفصولة بفواصل)"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
          <p className="text-muted-foreground">إدارة تصنيفات المقالات والمحتوى</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                تصنيف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء تصنيف جديد</DialogTitle>
                <DialogDescription>
                  أضف تصنيف جديد لتنظيم المقالات والمحتوى
                </DialogDescription>
              </DialogHeader>
              <CategoryForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreate}>
                  إنشاء التصنيف
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={seedPredefinedCategories}>
            <Sparkles className="h-4 w-4 mr-2" />
            إضافة التصنيفات الافتراضية
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التصنيفات المتاحة</CardTitle>
          <CardDescription>
            إدارة وتخصيص جميع تصنيفات المحتوى
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="البحث في التصنيفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الترتيب</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">اللون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.sortOrder || index}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => moveCategoryOrder(category.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => moveCategoryOrder(category.id, 'down')}
                            disabled={index === sortedCategories.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{category.nameEn}</div>
                          <Badge variant="secondary" className="text-xs">
                            {category.slug}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{category.description}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs font-mono">{category.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(category.id)}
                        className="h-8"
                      >
                        {category.isActive ? (
                          <>
                            <Eye className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600">نشط</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-600">غير نشط</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString('ar-SA') : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف التصنيف "{category.nameAr}"؟ هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedCategories.length === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد تصنيفات</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء تصنيف جديد أو إضافة التصنيفات الافتراضية
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء تصنيف جديد
                </Button>
              </div>
              
              <CategorySeeder />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
            <DialogDescription>
              تحديث معلومات التصنيف "{editingCategory?.nameAr}"
            </DialogDescription>
          </DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEdit}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoryManager;