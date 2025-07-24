import { useState, useRef, useCallback } from 'react';
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
import { cn, normalizeArticles } from '@/lib/utils';
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
  Sparkle,
  Tag as TagIcon,
  Plus,
  Trash,
  Camera,
  Download,
  Play,
  Pause
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface ComprehensiveArticleEditorProps {
  article?: Article;
  onSave: (article: Partial<Article>) => void;
  onCancel?: () => void;
}

export function ComprehensiveArticleEditor({ article, onSave, onCancel }: ComprehensiveArticleEditorProps) {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';
  
  // Enhanced form state with all new fields
  const [formData, setFormData] = useState({
    title: article?.title || '',
    subtitle: article?.subtitle || '', // New: Optional subtitle field (max 250 chars)
    content: article?.content || '',
    smartSummary: article?.smartSummary || '', // New: AI-generated smart summary
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
    location: article?.location || '',
    language: article?.language || 'ar'
  });

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Character counts and validation
  const titleLength = formData.title.length;
  const subtitleLength = formData.subtitle.length;
  const contentLength = formData.content.replace(/<[^>]*>/g, '').length; // Strip HTML for count
  const excerptLength = formData.excerpt.length;

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Get available categories
  const [categories] = useKV<Category[]>('sabq-categories', mockCategories);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = isArabic ? 'العنوان مطلوب' : 'Title is required';
    } else if (titleLength > 200) {
      newErrors.title = isArabic ? 'العنوان طويل جداً' : 'Title is too long';
    }

    if (subtitleLength > 250) {
      newErrors.subtitle = isArabic ? 'العنوان الفرعي طويل جداً (250 حرف كحد أقصى)' : 'Subtitle is too long (250 chars max)';
    }

    if (!formData.content.trim()) {
      newErrors.content = isArabic ? 'المحتوى مطلوب' : 'Content is required';
    } else if (contentLength < 50) {
      newErrors.content = isArabic ? 'المحتوى قصير جداً' : 'Content is too short';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = isArabic ? 'الموجز مطلوب' : 'Excerpt is required';
    } else if (excerptLength > 300) {
      newErrors.excerpt = isArabic ? 'الموجز طويل جداً' : 'Excerpt is too long';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = isArabic ? 'التصنيف مطلوب' : 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AI Summary generation
  const generateAISummary = async () => {
    if (!formData.content.trim()) {
      toast.error(isArabic ? 'يرجى إدخال المحتوى أولاً' : 'Please enter content first');
      return;
    }

    setIsGeneratingAISummary(true);
    try {
      const prompt = spark.llmPrompt`
        قم بإنشاء موجز ذكي للمقال التالي باللغة العربية:
        
        العنوان: ${formData.title}
        المحتوى: ${formData.content.replace(/<[^>]*>/g, '')}
        
        المطلوب:
        1. موجز مختصر في 2-3 جمل
        2. يركز على النقاط الرئيسية
        3. مناسب للنشر على وسائل التواصل
        4. باللغة العربية الفصحى
      `;
      
      const summary = await spark.llm(prompt);
      setFormData(prev => ({ ...prev, smartSummary: summary }));
      toast.success(isArabic ? 'تم إنشاء الموجز الذكي' : 'AI summary generated');
    } catch (error) {
      toast.error(isArabic ? 'خطأ في إنشاء الموجز' : 'Error generating summary');
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Image upload simulation
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(isArabic ? 'حجم الصورة كبير جداً (5MB كحد أقصى)' : 'Image too large (5MB max)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock URL (in real implementation, would upload to Cloudinary)
      const mockUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        featuredImage: mockUrl,
        featuredImageSettings: {
          ...prev.featuredImageSettings,
          altText: file.name.replace(/\.[^/.]+$/, '')
        }
      }));

      setUploadProgress(100);
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (error) {
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isArabic]);

  // Save article
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(isArabic ? 'يرجى إصلاح الأخطاء أولاً' : 'Please fix errors first');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
      
      const articleData: Partial<Article> = {
        ...article,
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        excerpt: formData.excerpt,
        smartSummary: formData.smartSummary,
        category: selectedCategory,
        tags: formData.tags.map(tagName => ({
          id: `tag_${Date.now()}_${Math.random()}`,
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-')
        })),
        featuredImage: formData.featuredImage,
        featuredImageSettings: formData.featuredImageSettings,
        publishSettings: formData.publishSettings,
        status: formData.publishSettings.publishNow ? 'published' : 
                formData.publishSettings.scheduledTime ? 'scheduled' : 'draft',
        scheduledAt: formData.publishSettings.scheduledTime,
        priority: formData.priority,
        location: formData.location,
        language: formData.language as 'ar' | 'en',
        updatedAt: new Date()
      };

      if (!article) {
        articleData.createdAt = new Date();
        articleData.author = user;
      }

      if (formData.publishSettings.publishNow) {
        articleData.publishedAt = new Date();
      }

      onSave(articleData);
      toast.success(isArabic ? 'تم حفظ المقال بنجاح' : 'Article saved successfully');
    } catch (error) {
      toast.error(isArabic ? 'خطأ في حفظ المقال' : 'Error saving article');
    } finally {
      setIsSaving(false);
    }
  };

  // Rich text formatting functions
  const formatText = (command: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    switch (command) {
      case 'bold':
        replacement = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        replacement = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        replacement = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        replacement = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        replacement = `<h3>${selectedText}</h3>`;
        break;
      case 'ul':
        replacement = `<ul><li>${selectedText}</li></ul>`;
        break;
      case 'ol':
        replacement = `<ol><li>${selectedText}</li></ol>`;
        break;
      case 'quote':
        replacement = `<blockquote>${selectedText}</blockquote>`;
        break;
      default:
        return;
    }
    
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
      textarea.focus();
    }, 0);
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${typography.rtlText}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(typography.heading, "text-3xl font-bold")}>
            {article ? 
              (isArabic ? 'تحرير المقال' : 'Edit Article') : 
              (isArabic ? 'إنشاء مقال جديد' : 'Create New Article')
            }
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? 'محرر شامل لإنشاء وتحرير المقالات' : 'Comprehensive editor for creating and editing articles'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? (isArabic ? 'تحرير' : 'Edit') : (isArabic ? 'معاينة' : 'Preview')}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <FloppyDisk className="w-4 h-4" />
                {isArabic ? 'حفظ' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {isArabic ? 'المحتوى' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Images className="w-4 h-4" />
            {isArabic ? 'الوسائط' : 'Media'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center gap-2">
            <PaperPlaneTilt className="w-4 h-4" />
            {isArabic ? 'النشر' : 'Publish'}
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title and Subtitle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {isArabic ? 'العنوان والعنوان الفرعي' : 'Title and Subtitle'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className={cn(typography.label, "flex items-center justify-between")}>
                      {isArabic ? 'العنوان الرئيسي' : 'Main Title'}
                      <span className={cn("text-xs", titleLength > 180 ? "text-red-500" : "text-muted-foreground")}>
                        {titleLength}/200
                      </span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={isArabic ? 'أدخل عنوان المقال...' : 'Enter article title...'}
                      className={cn(typography.input, errors.title && "border-red-500")}
                      maxLength={200}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subtitle" className={cn(typography.label, "flex items-center justify-between")}>
                      {isArabic ? 'العنوان الفرعي (اختياري)' : 'Subtitle (Optional)'}
                      <span className={cn("text-xs", subtitleLength > 225 ? "text-red-500" : "text-muted-foreground")}>
                        {subtitleLength}/250
                      </span>
                    </Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder={isArabic ? 'عنوان فرعي توضيحي (250 حرف كحد أقصى)' : 'Descriptive subtitle (250 chars max)'}
                      className={cn(typography.input, errors.subtitle && "border-red-500")}
                      maxLength={250}
                    />
                    {errors.subtitle && (
                      <p className="text-sm text-red-500 mt-1">{errors.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      {isArabic ? 'محرر المحتوى' : 'Content Editor'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contentLength} {isArabic ? 'حرف' : 'characters'}
                    </div>
                  </CardTitle>
                  
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('underline')}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('h1')}
                      className="h-8 px-2 text-xs"
                    >
                      H1
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('h2')}
                      className="h-8 px-2 text-xs"
                    >
                      H2
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('h3')}
                      className="h-8 px-2 text-xs"
                    >
                      H3
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('ul')}
                      className="h-8 w-8 p-0"
                    >
                      <ListBullets className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('ol')}
                      className="h-8 w-8 p-0"
                    >
                      <ListNumbers className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('quote')}
                      className="h-8 w-8 p-0"
                    >
                      <Quotes className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    ref={contentRef}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={isArabic ? 'اكتب محتوى المقال هنا...' : 'Write article content here...'}
                    className={cn(typography.textarea, "min-h-[400px]", errors.content && "border-red-500")}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                </CardContent>
              </Card>

              {/* Smart Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-5 h-5" />
                      {isArabic ? 'الموجز الذكي' : 'Smart Summary'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAISummary}
                      disabled={isGeneratingAISummary || !formData.content.trim()}
                      className="flex items-center gap-2"
                    >
                      {isGeneratingAISummary ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          {isArabic ? 'إنشاء بالذكاء الاصطناعي' : 'Generate with AI'}
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.smartSummary}
                    onChange={(e) => setFormData(prev => ({ ...prev, smartSummary: e.target.value }))}
                    placeholder={isArabic ? 'موجز ذكي للمقال (سيتم إنشاؤه تلقائياً أو يمكن تحريره يدوياً)' : 'Smart summary (auto-generated or manually edited)'}
                    className={cn(typography.textarea, "min-h-[100px]")}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Excerpt */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base">
                      <FileText className="w-4 h-4" />
                      {isArabic ? 'الموجز' : 'Excerpt'}
                    </div>
                    <span className={cn("text-xs", excerptLength > 275 ? "text-red-500" : "text-muted-foreground")}>
                      {excerptLength}/300
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder={isArabic ? 'موجز مختصر للمقال...' : 'Brief article excerpt...'}
                    className={cn(typography.textarea, "min-h-[120px]", errors.excerpt && "border-red-500")}
                    maxLength={300}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
                  )}
                </CardContent>
              </Card>

              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {isArabic ? 'التصنيف' : 'Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className={cn(errors.categoryId && "border-red-500")}>
                      <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{isArabic ? category.nameAr : category.nameEn}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    {isArabic ? 'الكلمات المفتاحية' : 'Tags'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder={isArabic ? 'إضافة كلمة مفتاحية...' : 'Add tag...'}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {isArabic ? 'الأولوية' : 'Priority'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        {isArabic ? 'منخفضة' : 'Low'}
                      </SelectItem>
                      <SelectItem value="normal">
                        {isArabic ? 'عادية' : 'Normal'}
                      </SelectItem>
                      <SelectItem value="high">
                        {isArabic ? 'عالية' : 'High'}
                      </SelectItem>
                      <SelectItem value="breaking">
                        {isArabic ? 'عاجل' : 'Breaking'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {isArabic ? 'الصورة البارزة' : 'Featured Image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.featuredImage ? (
                <div className="space-y-4">
                  <div className="relative border rounded-lg overflow-hidden">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <div>
                      <Label>{isArabic ? 'النص البديل' : 'Alt Text'}</Label>
                      <Input
                        value={formData.featuredImageSettings.altText}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          featuredImageSettings: {
                            ...prev.featuredImageSettings,
                            altText: e.target.value
                          }
                        }))}
                        placeholder={isArabic ? 'وصف الصورة...' : 'Image description...'}
                      />
                    </div>
                    <div>
                      <Label>{isArabic ? 'التعليق' : 'Caption'}</Label>
                      <Input
                        value={formData.featuredImageSettings.caption}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          featuredImageSettings: {
                            ...prev.featuredImageSettings,
                            caption: e.target.value
                          }
                        }))}
                        placeholder={isArabic ? 'تعليق الصورة...' : 'Image caption...'}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {isArabic ? 'رفع صورة' : 'Upload Image'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isArabic ? 'اضغط لاختيار صورة أو اسحبها هنا' : 'Click to select or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, WebP (5MB {isArabic ? 'كحد أقصى' : 'max'})
                    </p>
                  </div>
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{isArabic ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {isArabic ? 'إعدادات عامة' : 'General Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{isArabic ? 'الموقع' : 'Location'}</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={isArabic ? 'موقع الحدث...' : 'Event location...'}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'اللغة' : 'Language'}</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{isArabic ? 'العربية' : 'Arabic'}</SelectItem>
                      <SelectItem value="en">{isArabic ? 'الإنجليزية' : 'English'}</SelectItem>
                      <SelectItem value="both">{isArabic ? 'ثنائي اللغة' : 'Bilingual'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {isArabic ? 'حالة المقال' : 'Article Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant={
                    formData.status === 'published' ? 'default' :
                    formData.status === 'scheduled' ? 'secondary' :
                    formData.status === 'review' ? 'outline' : 'secondary'
                  }>
                    {formData.status === 'published' ? (isArabic ? 'منشور' : 'Published') :
                     formData.status === 'scheduled' ? (isArabic ? 'مجدول' : 'Scheduled') :
                     formData.status === 'review' ? (isArabic ? 'قيد المراجعة' : 'Under Review') :
                     (isArabic ? 'مسودة' : 'Draft')}
                  </Badge>
                  {article && (
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'آخر تحديث: ' : 'Last updated: '}
                      {article.updatedAt ? format(
                        new Date(article.updatedAt), 
                        'PPp', 
                        { locale: isArabic ? ar : enUS }
                      ) : '-'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Publish Tab */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaperPlaneTilt className="w-5 h-5" />
                {isArabic ? 'إعدادات النشر' : 'Publishing Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    {isArabic ? 'نشر الآن' : 'Publish Now'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'نشر المقال فوراً عند الحفظ' : 'Publish article immediately upon saving'}
                  </p>
                </div>
                <Switch
                  checked={formData.publishSettings.publishNow}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    publishSettings: {
                      ...prev.publishSettings,
                      publishNow: checked
                    }
                  }))}
                />
              </div>

              {!formData.publishSettings.publishNow && (
                <div>
                  <Label>{isArabic ? 'جدولة النشر' : 'Schedule Publishing'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarBlank className="mr-2 h-4 w-4" />
                        {formData.publishSettings.scheduledTime ? 
                          format(formData.publishSettings.scheduledTime, 'PPP p', { locale: isArabic ? ar : enUS }) :
                          (isArabic ? 'اختر تاريخ ووقت النشر' : 'Pick publish date & time')
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.publishSettings.scheduledTime}
                        onSelect={(date) => setFormData(prev => ({
                          ...prev,
                          publishSettings: {
                            ...prev.publishSettings,
                            scheduledTime: date
                          }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    {isArabic ? 'إشعار المشتركين' : 'Notify Subscribers'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'إرسال إشعار للمشتركين عند النشر' : 'Send notification to subscribers when published'}
                  </p>
                </div>
                <Switch
                  checked={formData.publishSettings.notifySubscribers}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    publishSettings: {
                      ...prev.publishSettings,
                      notifySubscribers: checked
                    }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}