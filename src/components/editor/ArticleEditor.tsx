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
import { useAuth } from '@/contexts/AuthContext';
import { useCollaborative } from '@/contexts/CollaborativeContext';
import { mockCategories, mockTags } from '@/lib/mockData';
import { Article, MediaFile } from '@/types';
import { useKV } from '@github/spark/hooks';
import { PerformanceOptimizationEngine } from '@/components/optimization';
import { CollaborativePresence } from '@/components/collaborative/CollaborativePresence';
import { CollaborativeTextEditor } from '@/components/collaborative/CollaborativeTextEditor';
import { ConflictResolutionPanel } from '@/components/collaborative/ConflictResolutionPanel';
import { CollaborativeWorkspace } from '@/components/collaborative/CollaborativeWorkspace';
import { MediaPicker, MediaGallery } from '@/components/media';
import { mediaService } from '@/lib/mediaService';
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
  X
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Partial<Article>) => void;
}

export function ArticleEditor({ article, onSave }: ArticleEditorProps) {
  const { language, user } = useAuth();
  const { currentSession, resolveConflict } = useCollaborative();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [categoryId, setCategoryId] = useState(article?.category?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map(tag => tag.id) || []
  );
  const [featuredImage, setFeaturedImage] = useState<MediaFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<MediaFile[]>([]);
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Initialize media files from saved media
  const [mediaFiles] = useKV<MediaFile[]>('sabq-media-files', []);
  
  // Initialize featured image and gallery from article
  useEffect(() => {
    if (article?.featuredImage) {
      // Find the media file by URL or create a simple reference
      const mediaFile = mediaFiles.find(m => m.url === article.featuredImage);
      if (mediaFile) {
        setFeaturedImage(mediaFile);
      } else {
        // Create a temporary media file object for existing image URLs
        setFeaturedImage({
          id: 'temp-featured',
          filename: 'featured-image',
          originalName: 'Featured Image',
          mimeType: 'image/jpeg',
          size: 0,
          url: article.featuredImage,
          uploadedBy: 'unknown',
          uploadedAt: new Date(),
          metadata: { format: 'jpeg', originalSize: 0, isOptimized: false },
          optimizations: [],
          tags: [],
          usage: []
        });
      }
    }
    
    if (article?.galleryImages) {
      // Convert gallery image URLs to MediaFile objects
      const gallery = article.galleryImages.map(url => {
        const mediaFile = mediaFiles.find(m => m.url === url);
        return mediaFile || {
          id: `temp-gallery-${url}`,
          filename: 'gallery-image',
          originalName: 'Gallery Image',
          mimeType: 'image/jpeg',
          size: 0,
          url,
          uploadedBy: 'unknown',
          uploadedAt: new Date(),
          metadata: { format: 'jpeg', originalSize: 0, isOptimized: false },
          optimizations: [],
          tags: [],
          usage: []
        };
      });
      setGalleryImages(gallery);
    }
  }, [article, mediaFiles]);
  
  // Mock conflicts for demonstration
  const [conflicts] = useState([
    // This would come from the collaborative context in a real implementation
  ]);
  
  // Create a complete article object for optimization engine
  const [articleData, setArticleData] = useState<Partial<Article>>({
    ...article,
    title,
    content,
    excerpt,
    featuredImage: featuredImage?.url,
    galleryImages: galleryImages.map(img => img.url)
  });
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [drafts, setDrafts] = useKV<Partial<Article>[]>('newsflow-drafts', []);

  // Update article data when content changes
  useEffect(() => {
    setArticleData(prev => ({
      ...prev,
      title,
      content,
      excerpt,
      featuredImage: featuredImage?.url,
      galleryImages: galleryImages.map(img => img.url)
    }));
  }, [title, content, excerpt, featuredImage, galleryImages]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (title || content) {
        const draft = {
          id: article?.id || `draft-${Date.now()}`,
          title,
          content,
          excerpt,
          categoryId,
          selectedTags,
          featuredImage: featuredImage?.url,
          galleryImages: galleryImages.map(img => img.url),
          updatedAt: new Date()
        };
        
        setDrafts(currentDrafts => {
          const existingIndex = currentDrafts.findIndex(d => d.id === draft.id);
          if (existingIndex >= 0) {
            const updated = [...currentDrafts];
            updated[existingIndex] = draft;
            return updated;
          }
          return [...currentDrafts, draft];
        });
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [title, content, excerpt, categoryId, selectedTags, featuredImage, galleryImages, article?.id, setDrafts]);

  const handleFormatText = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
      case 'numbered':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const handleAIAssist = async () => {
    setIsGeneratingAI(true);
    try {
      // Mock AI assistance - in real app, would call LLM API
      const suggestions = [
        language.code === 'ar' ? 'إضافة مقدمة جذابة للمقال' : 'Add an engaging introduction',
        language.code === 'ar' ? 'تحسين التدفق بين الفقرات' : 'Improve flow between paragraphs',
        language.code === 'ar' ? 'إضافة إحصائيات أو أمثلة' : 'Add statistics or examples'
      ];
      
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      toast.success(`AI ${language.code === 'ar' ? 'اقتراح' : 'Suggestion'}: ${suggestion}`);
    } catch (error) {
      toast.error(language.code === 'ar' ? 'فشل في الحصول على اقتراحات الذكاء الاصطناعي' : 'Failed to get AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOptimizationUpdate = (updates: Partial<Article>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
    
    // Update local state if optimization engine updates content
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.content !== undefined) setContent(updates.content);
    if (updates.excerpt !== undefined) setExcerpt(updates.excerpt);
    if (updates.featuredImage !== undefined) {
      // Find the media file by URL or create a temporary one
      if (updates.featuredImage) {
        const mediaFile = mediaFiles.find(m => m.url === updates.featuredImage);
        if (mediaFile) {
          setFeaturedImage(mediaFile);
        } else {
          // Create temporary media file for external URLs
          setFeaturedImage({
            id: 'temp-updated',
            filename: 'updated-image',
            originalName: 'Updated Image',
            mimeType: 'image/jpeg',
            size: 0,
            url: updates.featuredImage,
            uploadedBy: 'optimization',
            uploadedAt: new Date(),
            metadata: { format: 'jpeg', originalSize: 0, isOptimized: false },
            optimizations: [],
            tags: [],
            usage: []
          });
        }
      } else {
        setFeaturedImage(null);
      }
    }
  };

  const handleSave = (status: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) {
      toast.error(language.code === 'ar' ? 'العنوان مطلوب' : 'Title is required');
      return;
    }

    const category = mockCategories.find(c => c.id === categoryId);
    const tags = mockTags.filter(t => selectedTags.includes(t.id));

    const saveData: Partial<Article> = {
      id: article?.id || `article-${Date.now()}`,
      title: title.trim(),
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category!,
      tags,
      status,
      featuredImage: featuredImage?.url,
      galleryImages: galleryImages.map(img => img.url),
      author: user!,
      createdAt: article?.createdAt || new Date(),
      updatedAt: new Date(),
      analytics: article?.analytics || { views: 0, likes: 0, shares: 0 },
      // Include optimization data
      predictiveAnalytics: articleData.predictiveAnalytics,
      contentAnalysis: articleData.contentAnalysis,
      abTests: articleData.abTests,
      aiOptimizations: articleData.aiOptimizations,
      performanceHistory: articleData.performanceHistory
    };

    if (status === 'published') {
      saveData.publishedAt = new Date();
    }

    onSave(saveData);
    toast.success(
      status === 'draft' 
        ? (language.code === 'ar' ? 'تم حفظ المسودة' : 'Draft saved')
        : (language.code === 'ar' ? 'تم نشر المقال' : 'Article published')
    );
  };

  const toolbarButtons = [
    { icon: Bold, action: 'bold', tooltip: 'Bold' },
    { icon: Italic, action: 'italic', tooltip: 'Italic' },
    { icon: Underline, action: 'underline', tooltip: 'Underline' },
    { icon: ListBullets, action: 'list', tooltip: 'Bullet List' },
    { icon: ListNumbers, action: 'numbered', tooltip: 'Numbered List' },
    { icon: Quotes, action: 'quote', tooltip: 'Quote' },
    { icon: Code, action: 'code', tooltip: 'Code' }
  ];

  return (
    <div className={`max-w-6xl mx-auto space-y-6 font-arabic ${language.direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-arabic">
          {article 
            ? (language.code === 'ar' ? 'تحرير المقال' : 'Edit Article')
            : (language.code === 'ar' ? 'مقال جديد' : 'New Article')
          }
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            disabled={activeTab !== 'editor'}
            className="font-arabic"
          >
            <Eye size={16} />
            {isPreview 
              ? (language.code === 'ar' ? 'تحرير' : 'Edit')
              : (language.code === 'ar' ? 'معاينة' : 'Preview')
            }
          </Button>
          <Button
            variant="outline"
            onClick={handleAIAssist}
            disabled={isGeneratingAI}
          >
            <MagicWand size={16} />
            {language.code === 'ar' ? 'مساعدة ذكية' : 'AI Assist'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor" className="gap-2">
            <Eye className="h-4 w-4" />
            {language.code === 'ar' ? 'المحرر' : 'Editor'}
          </TabsTrigger>
          <TabsTrigger value="optimization" className="gap-2">
            <Brain className="h-4 w-4" />
            {language.code === 'ar' ? 'التحسين بالذكاء الاصطناعي' : 'AI Optimization'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-4">
              {/* Collaborative Presence */}
              {article && (
                <CollaborativePresence 
                  articleId={article.id}
                  className="lg:hidden" 
                />
              )}
              
              {/* Conflict Resolution */}
              {conflicts.length > 0 && (
                <ConflictResolutionPanel
                  conflicts={conflicts}
                  onResolveConflict={resolveConflict}
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {language.code === 'ar' ? 'المحتوى التعاوني' : 'Collaborative Content'}
                    </span>
                    {currentSession && (
                      <Badge variant="outline" className="text-xs">
                        {language.code === 'ar' ? 'جلسة تعاونية نشطة' : 'Active Collaboration'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Collaborative Title Editor */}
                  <CollaborativeTextEditor
                    value={title}
                    onChange={setTitle}
                    section="title"
                    label={language.code === 'ar' ? 'العنوان' : 'Title'}
                    placeholder={language.code === 'ar' ? 'أدخل عنوان المقال' : 'Enter article title'}
                    maxLength={120}
                    required
                    rows={1}
                    className="text-lg font-semibold"
                  />

                  {!isPreview && (
                    <>
                      {/* Toolbar */}
                      <div className="flex items-center gap-1 p-2 border rounded-md bg-muted/50">
                        {toolbarButtons.map((button, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFormatText(button.action)}
                            title={button.tooltip}
                          >
                            <button.icon size={16} />
                          </Button>
                        ))}
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="ghost" size="sm" title="Add Link">
                          <Link size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" title="Add Image">
                          <ImageIcon size={16} />
                        </Button>
                      </div>

                      {/* Collaborative Content Editor */}
                      <CollaborativeTextEditor
                        value={content}
                        onChange={setContent}
                        section="content"
                        label={language.code === 'ar' ? 'المحتوى' : 'Content'}
                        placeholder={language.code === 'ar' ? 'اكتب محتوى المقال هنا...' : 'Write your article content here...'}
                        rows={15}
                        className="min-h-[400px] resize-none font-mono text-sm"
                      />
                    </>
                  )}

                  {isPreview && (
                    <div className="min-h-[400px] p-6 border rounded-md bg-background">
                      <h1 className="text-3xl font-bold mb-4">{title}</h1>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    </div>
                  )}

                  {/* Collaborative Excerpt Editor */}
                  <CollaborativeTextEditor
                    value={excerpt}
                    onChange={setExcerpt}
                    section="excerpt"
                    label={language.code === 'ar' ? 'المقتطف' : 'Excerpt'}
                    placeholder={language.code === 'ar' ? 'ملخص قصير للمقال' : 'Brief summary of the article'}
                    rows={3}
                    maxLength={200}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Collaborative Presence - Desktop */}
              {article && (
                <CollaborativePresence 
                  articleId={article.id}
                  className="hidden lg:block" 
                />
              )}
          {/* Publish Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language.code === 'ar' ? 'إجراءات النشر' : 'Publish Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSave('draft')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <FloppyDisk size={16} />
                {language.code === 'ar' ? 'حفظ كمسودة' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSave('published')}
                size="sm"
                className="w-full"
              >
                <PaperPlaneTilt size={16} />
                {language.code === 'ar' ? 'نشر الآن' : 'Publish Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language.code === 'ar' ? 'التصنيف' : 'Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Selected Category Display */}
              {categoryId && (
                <div className="mb-3 p-2 border rounded-md bg-muted/30">
                  {(() => {
                    const selectedCategory = mockCategories.find(c => c.id === categoryId);
                    return selectedCategory ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedCategory.icon}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="font-medium text-sm">
                          {language.code === 'ar' ? selectedCategory.nameAr || selectedCategory.name : selectedCategory.nameEn || selectedCategory.name}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={language.code === 'ar' ? 'اختر تصنيف' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
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
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language.code === 'ar' ? 'العلامات' : 'Tags'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = mockTags.find(t => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      {language.code === 'ar' ? tag.nameAr : tag.name}
                      <button
                        onClick={() => setSelectedTags(tags => tags.filter(id => id !== tagId))}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select onValueChange={(tagId) => {
                if (!selectedTags.includes(tagId)) {
                  setSelectedTags([...selectedTags, tagId]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={language.code === 'ar' ? 'إضافة علامة' : 'Add tag'} />
                </SelectTrigger>
                <SelectContent>
                  {mockTags.filter(tag => !selectedTags.includes(tag.id)).map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {language.code === 'ar' ? tag.nameAr : tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language.code === 'ar' ? 'الصورة البارزة' : 'Featured Image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredImage ? (
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-md bg-muted">
                    <img
                      src={featuredImage.thumbnailUrl || featuredImage.url}
                      alt={featuredImage.alt || featuredImage.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-1"
                      onClick={() => setFeaturedImage(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{featuredImage.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {featuredImage.metadata.width} × {featuredImage.metadata.height} • {mediaService.formatFileSize(featuredImage.size)}
                    </p>
                    {featuredImage.alt && (
                      <p className="text-xs text-muted-foreground truncate">
                        {language.code === 'ar' ? featuredImage.altAr || featuredImage.alt : featuredImage.alt}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-md">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {language.code === 'ar' ? 'لا توجد صورة بارزة' : 'No featured image selected'}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setShowFeaturedImagePicker(true)}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {featuredImage 
                  ? (language.code === 'ar' ? 'تغيير الصورة' : 'Change Image')
                  : (language.code === 'ar' ? 'اختيار صورة' : 'Select Image')
                }
              </Button>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language.code === 'ar' ? 'معرض الصور' : 'Image Gallery'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaGallery
                images={galleryImages}
                onChange={setGalleryImages}
                maxImages={8}
                allowReorder={true}
                showCaptions={true}
              />
            </CardContent>
          </Card>
          
          {/* Collaborative Workspace */}
          {article && (
            <CollaborativeWorkspace 
              articleId={article.id}
            />
          )}
        </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <PerformanceOptimizationEngine 
            article={articleData}
            onArticleUpdate={handleOptimizationUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Media Picker for Featured Image */}
      <MediaPicker
        open={showFeaturedImagePicker}
        onOpenChange={setShowFeaturedImagePicker}
        onSelect={(media) => {
          setFeaturedImage(Array.isArray(media) ? media[0] : media);
          setShowFeaturedImagePicker(false);
        }}
        multiple={false}
        allowedTypes={['image']}
        title={language.code === 'ar' ? 'اختيار الصورة البارزة' : 'Select Featured Image'}
        description={language.code === 'ar' 
          ? 'اختر صورة لتكون الصورة البارزة للمقال'
          : 'Choose an image to be the featured image for this article'
        }
      />
    </div>
  );
}