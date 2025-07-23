import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { mockCategories, mockTags } from '@/lib/mockData';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
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
  PaperPlaneTilt
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Partial<Article>) => void;
}

export function ArticleEditor({ article, onSave }: ArticleEditorProps) {
  const { language, user } = useAuth();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [categoryId, setCategoryId] = useState(article?.category.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags.map(tag => tag.id) || []
  );
  const [featuredImage, setFeaturedImage] = useState(article?.featuredImage || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [drafts, setDrafts] = useKV<Partial<Article>[]>('newsflow-drafts', []);

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
          featuredImage,
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
  }, [title, content, excerpt, categoryId, selectedTags, featuredImage, article?.id, setDrafts]);

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

  const handleSave = (status: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) {
      toast.error(language.code === 'ar' ? 'العنوان مطلوب' : 'Title is required');
      return;
    }

    const category = mockCategories.find(c => c.id === categoryId);
    const tags = mockTags.filter(t => selectedTags.includes(t.id));

    const articleData: Partial<Article> = {
      id: article?.id || `article-${Date.now()}`,
      title: title.trim(),
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category!,
      tags,
      status,
      featuredImage,
      author: user!,
      createdAt: article?.createdAt || new Date(),
      updatedAt: new Date(),
      analytics: article?.analytics || { views: 0, likes: 0, shares: 0 }
    };

    if (status === 'published') {
      articleData.publishedAt = new Date();
    }

    onSave(articleData);
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {article 
            ? (language.code === 'ar' ? 'تحرير المقال' : 'Edit Article')
            : (language.code === 'ar' ? 'مقال جديد' : 'New Article')
          }
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language.code === 'ar' ? 'المحتوى' : 'Content'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  {language.code === 'ar' ? 'العنوان' : 'Title'}
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language.code === 'ar' ? 'أدخل عنوان المقال' : 'Enter article title'}
                  className="text-lg font-semibold"
                />
              </div>

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

                  <Textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={language.code === 'ar' ? 'اكتب محتوى المقال هنا...' : 'Write your article content here...'}
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

              <div>
                <Label htmlFor="excerpt">
                  {language.code === 'ar' ? 'المقتطف' : 'Excerpt'}
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder={language.code === 'ar' ? 'ملخص قصير للمقال' : 'Brief summary of the article'}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={language.code === 'ar' ? 'اختر تصنيف' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {language.code === 'ar' ? category.nameAr : category.name}
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
            <CardContent>
              <Input
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder={language.code === 'ar' ? 'رابط الصورة' : 'Image URL'}
              />
              {featuredImage && (
                <div className="mt-2">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}