import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { mockCategories } from '@/lib/mockData';
import { Article, Category } from '@/types';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  ListBullets, 
  ListNumbers, 
  Link, 
  Image as ImageIcon,
  Code,
  Quotes,
  MagicWand,
  Eye,
  FloppyDisk,
  PaperPlaneTilt,
  Brain,
  Images,
  X,
  CalendarBlank,
  Hash,
  Upload,
  Crop,
  CheckCircle,
  Clock,
  Globe,
  FileText,
  Sparkle
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface EnhancedArticleEditorProps {
  article?: Article;
  onSave: (article: Partial<Article>) => void;
  onCancel?: () => void;
}

export function EnhancedArticleEditor({ article, onSave, onCancel }: EnhancedArticleEditorProps) {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';
  
  // Enhanced form state
  const [formData, setFormData] = useState({
    title: article?.title || '',
    subtitle: article?.subtitle || '',
    content: article?.content || '',
    smartSummary: article?.smartSummary || '',
    excerpt: article?.excerpt || '',
    categoryId: article?.category?.id || '',
    tags: article?.tags?.map(tag => tag.name) || [],
    featuredImage: article?.featuredImage || '',
    featuredImageSettings: article?.featuredImageSettings || {
      altText: '',
      caption: '',
      cropArea: undefined
    },
    publishSettings: article?.publishSettings || {
      publishNow: true,
      scheduledTime: undefined,
      notifySubscribers: true
    },
    status: article?.status || 'draft',
    priority: article?.priority || 'normal',
    location: article?.location || ''
  });

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Character counts
  const titleLength = formData.title.length;
  const subtitleLength = formData.subtitle.length;
  const excerptLength = formData.excerpt.length;

  // Text editor formatting functions
  const formatText = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  // AI Summary Generation
  const generateAISummary = async () => {
    if (!formData.content || formData.content.length < 100) {
      toast.error(isArabic ? 'المحتوى قصير جداً لإنشاء موجز ذكي' : 'Content too short for AI summary');
      return;
    }

    setIsGeneratingAISummary(true);
    
    try {
      // Create prompt for AI summary
      const prompt = spark.llmPrompt`
        اكتب موجزاً ذكياً للمقال التالي باللغة العربية:
        
        العنوان: ${formData.title}
        المحتوى: ${formData.content.replace(/<[^>]*>/g, '').substring(0, 1000)}
        
        المطلوب:
        - موجز في 2-3 جمل
        - يلخص النقاط الرئيسية
        - جذاب للقارئ
        - باللغة العربية
      `;
      
      const summary = await spark.llm(prompt, 'gpt-4o-mini');
      
      setFormData(prev => ({ 
        ...prev, 
        smartSummary: summary.trim(),
        excerpt: summary.trim() // Also update excerpt if empty
      }));
      
      toast.success(isArabic ? 'تم إنشاء الموجز بنجاح' : 'AI summary generated successfully');
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast.error(isArabic ? 'خطأ في إنشاء الموجز' : 'Error generating summary');
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  // Tag management
  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (formData.tags.includes(newTag.trim())) {
      toast.error(isArabic ? 'الكلمة المفتاحية موجودة بالفعل' : 'Tag already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Image upload handling
  const handleImageUpload = (file: File) => {
    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      featuredImage: imageUrl
    }));
    
    toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = isArabic ? 'العنوان مطلوب' : 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = isArabic ? 'العنوان طويل جداً (200 حرف كحد أقصى)' : 'Title too long (max 200 characters)';
    }
    
    if (formData.subtitle && formData.subtitle.length > 250) {
      newErrors.subtitle = isArabic ? 'العنوان الفرعي طويل جداً (250 حرف كحد أقصى)' : 'Subtitle too long (max 250 characters)';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = isArabic ? 'المحتوى مطلوب' : 'Content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = isArabic ? 'المحتوى قصير جداً (100 حرف كحد أدنى)' : 'Content too short (min 100 characters)';
    }
    
    if (!formData.categoryId) {
      newErrors.category = isArabic ? 'التصنيف مطلوب' : 'Category is required';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = isArabic ? 'الموجز مطلوب' : 'Excerpt is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save article
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(isArabic ? 'يرجى تصحيح الأخطاء أولاً' : 'Please fix errors first');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Find selected category
      const selectedCategory = mockCategories.find(cat => cat.id === formData.categoryId);
      
      const articleData: Partial<Article> = {
        id: article?.id,
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        smartSummary: formData.smartSummary,
        excerpt: formData.excerpt,
        category: selectedCategory!,
        tags: formData.tags.map(tagName => ({
          id: `tag_${tagName}`,
          name: tagName,
          nameAr: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-')
        })),
        featuredImage: formData.featuredImage,
        featuredImageSettings: formData.featuredImageSettings,
        publishSettings: formData.publishSettings,
        status: formData.status as any,
        priority: formData.priority as any,
        location: formData.location,
        language: 'ar',
        updatedAt: new Date(),
        scheduledAt: formData.publishSettings.scheduledTime
      };
      
      if (!article) {
        articleData.createdAt = new Date();
        articleData.author = user!;
      }
      
      await onSave(articleData);
      
      toast.success(isArabic ? 'تم حفظ المقال بنجاح' : 'Article saved successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(isArabic ? 'خطأ في حفظ المقال' : 'Error saving article');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish article
  const handlePublish = async () => {
    if (!validateForm()) return;
    
    const updatedData = { ...formData, status: 'published', publishedAt: new Date() };
    setFormData(updatedData);
    await handleSave();
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-6", typography.rtlText)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-2xl font-bold", typography.heading)}>
            {article ? (isArabic ? 'تحرير المقال' : 'Edit Article') : (isArabic ? 'مقال جديد' : 'New Article')}
          </h1>
          <p className={cn("text-muted-foreground mt-1", typography.body)}>
            {isArabic ? 'أنشئ وحرر مقالاً بأدوات تحرير متقدمة' : 'Create and edit articles with advanced tools'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="font-arabic"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? (isArabic ? 'تحرير' : 'Edit') : (isArabic ? 'معاينة' : 'Preview')}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="font-arabic"
          >
            <FloppyDisk className="w-4 h-4 mr-2" />
            {isSaving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
          </Button>
          
          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="font-arabic"
          >
            <PaperPlaneTilt className="w-4 h-4 mr-2" />
            {isArabic ? 'نشر' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Title Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className={typography.body}>
                    {isArabic ? 'العنوان الرئيسي' : 'Main Title'} *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={isArabic ? 'اكتب عنوان المقال...' : 'Write article title...'}
                    className={cn("text-lg font-medium", typography.body, errors.title && "border-red-500")}
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    <p className="text-xs text-muted-foreground mr-auto">
                      {titleLength}/200
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subtitle" className={typography.body}>
                    {isArabic ? 'العنوان الفرعي' : 'Subtitle'} ({isArabic ? 'اختياري' : 'Optional'})
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder={isArabic ? 'عنوان فرعي يوضح تفاصيل إضافية...' : 'Additional subtitle details...'}
                    className={cn(typography.body, errors.subtitle && "border-red-500")}
                    maxLength={250}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.subtitle && <p className="text-sm text-red-500">{errors.subtitle}</p>}
                    <p className="text-xs text-muted-foreground mr-auto">
                      {subtitleLength}/250
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Smart Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={typography.body}>
                    {isArabic ? 'الموجز الذكي' : 'Smart Summary'}
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAISummary}
                    disabled={isGeneratingAISummary || !formData.content}
                    className="font-arabic"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {isGeneratingAISummary ? 
                      (isArabic ? 'جاري الإنشاء...' : 'Generating...') :
                      (isArabic ? 'اقتراح بالذكاء الاصطناعي' : 'AI Suggestion')
                    }
                  </Button>
                </div>
                
                <Textarea
                  value={formData.smartSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartSummary: e.target.value }))}
                  placeholder={isArabic ? 'موجز ذكي للمقال...' : 'Smart article summary...'}
                  className={cn("min-h-[80px]", typography.body)}
                  rows={3}
                />
                
                {isGeneratingAISummary && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkle className="w-4 h-4 animate-pulse" />
                    {isArabic ? 'الذكاء الاصطناعي يقوم بإنشاء الموجز...' : 'AI is generating summary...'}
                  </div>
                )}
              </div>

              <Separator />

              {/* Content Editor */}
              <div className="space-y-3">
                <Label className={typography.body}>
                  {isArabic ? 'المحتوى التحريري' : 'Article Content'} *
                </Label>
                
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('bold')}
                    className="p-2"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('italic')}
                    className="p-2"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('heading')}
                    className="p-2"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('list')}
                    className="p-2"
                  >
                    <ListBullets className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('quote')}
                    className="p-2"
                  >
                    <Quotes className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('link')}
                    className="p-2"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
                
                <Textarea
                  id="content-editor"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={isArabic ? 'اكتب محتوى المقال هنا...' : 'Write your article content here...'}
                  className={cn("min-h-[400px] leading-relaxed", typography.body, errors.content && "border-red-500")}
                />
                
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {isArabic ? 'عدد الكلمات:' : 'Word count:'} {formData.content.split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                  <span>
                    {isArabic ? 'وقت القراءة المتوقع:' : 'Estimated read time:'} {Math.ceil(formData.content.split(/\s+/).length / 250)} {isArabic ? 'دقيقة' : 'min'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Excerpt */}
              <div className="space-y-3">
                <Label className={typography.body}>
                  {isArabic ? 'الموجز' : 'Excerpt'} *
                </Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder={isArabic ? 'موجز مختصر للمقال...' : 'Brief article excerpt...'}
                  className={cn("min-h-[100px]", typography.body, errors.excerpt && "border-red-500")}
                  rows={4}
                />
                {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
                <p className="text-xs text-muted-foreground">
                  {excerptLength} {isArabic ? 'حرف' : 'characters'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg", typography.heading)}>
                {isArabic ? 'خيارات النشر' : 'Publishing Options'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={typography.body}>
                    {isArabic ? 'نشر الآن' : 'Publish Now'}
                  </Label>
                  <Switch
                    checked={formData.publishSettings.publishNow}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      publishSettings: { ...prev.publishSettings, publishNow: checked }
                    }))}
                  />
                </div>
                
                {!formData.publishSettings.publishNow && (
                  <div>
                    <Label className={typography.body}>
                      {isArabic ? 'موعد النشر' : 'Schedule Time'}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-arabic">
                          <CalendarBlank className="w-4 h-4 mr-2" />
                          {formData.publishSettings.scheduledTime 
                            ? formData.publishSettings.scheduledTime.toLocaleDateString('ar-SA')
                            : (isArabic ? 'اختر التاريخ' : 'Pick date')
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.publishSettings.scheduledTime}
                          onSelect={(date) => setFormData(prev => ({
                            ...prev,
                            publishSettings: { ...prev.publishSettings, scheduledTime: date }
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label className={typography.body}>
                    {isArabic ? 'إشعار المشتركين' : 'Notify Subscribers'}
                  </Label>
                  <Switch
                    checked={formData.publishSettings.notifySubscribers}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      publishSettings: { ...prev.publishSettings, notifySubscribers: checked }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className={typography.body}>
                  {isArabic ? 'حالة المقال' : 'Article Status'}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                    <SelectItem value="review">{isArabic ? 'بانتظار المراجعة' : 'Under Review'}</SelectItem>
                    <SelectItem value="scheduled">{isArabic ? 'مجدول' : 'Scheduled'}</SelectItem>
                    <SelectItem value="published">{isArabic ? 'منشور' : 'Published'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={typography.body}>
                  {isArabic ? 'الأولوية' : 'Priority'}
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{isArabic ? 'منخفضة' : 'Low'}</SelectItem>
                    <SelectItem value="normal">{isArabic ? 'عادية' : 'Normal'}</SelectItem>
                    <SelectItem value="high">{isArabic ? 'عالية' : 'High'}</SelectItem>
                    <SelectItem value="breaking">{isArabic ? 'عاجل' : 'Breaking'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg", typography.heading)}>
                {isArabic ? 'التصنيف' : 'Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className={typography.body}>
                  {isArabic ? 'اختر التصنيف' : 'Select Category'} *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className={cn("font-arabic", errors.category && "border-red-500")}>
                    <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.filter(cat => cat.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-arabic">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg", typography.heading)}>
                {isArabic ? 'الكلمات المفتاحية' : 'Tags'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={isArabic ? 'أضف كلمة مفتاحية...' : 'Add tag...'}
                  className="font-arabic"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" className="font-arabic">
                  {isArabic ? 'إضافة' : 'Add'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 font-arabic">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg", typography.heading)}>
                {isArabic ? 'الصورة البارزة' : 'Featured Image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.featuredImage ? (
                <div className="space-y-3">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageCrop(true)}
                      className="font-arabic"
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      {isArabic ? 'قص' : 'Crop'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      className="font-arabic"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {isArabic ? 'إزالة' : 'Remove'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className={cn("text-sm text-muted-foreground mb-3", typography.body)}>
                    {isArabic ? 'ارفع صورة أو أدخل رابط' : 'Upload image or enter URL'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" size="sm" className="font-arabic" asChild>
                      <span>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {isArabic ? 'اختر صورة' : 'Choose Image'}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className={typography.body}>
                  {isArabic ? 'نص بديل للصورة' : 'Alt Text'}
                </Label>
                <Input
                  value={formData.featuredImageSettings.altText || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    featuredImageSettings: {
                      ...prev.featuredImageSettings,
                      altText: e.target.value
                    }
                  }))}
                  placeholder={isArabic ? 'وصف الصورة...' : 'Image description...'}
                  className="font-arabic"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg", typography.heading)}>
                {isArabic ? 'الموقع' : 'Location'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={isArabic ? 'مكان الحدث أو التقرير...' : 'Event or report location...'}
                className="font-arabic"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}