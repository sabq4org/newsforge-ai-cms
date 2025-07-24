import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DailyDose, Article, DosePhrase } from '@/types';
import { 
  Save, 
  X,
  Sparkles,
  RefreshCw,
  Play,
  Upload,
  FileText,
  Clock,
  TrendingUp,
  Eye,
  Tag,
  Sun,
  CloudSun,
  Sunset,
  Moon
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface DoseEditorProps {
  dose: DailyDose;
  articles: Article[];
  phrases: DosePhrase[];
  onSave: (updatedDose: DailyDose) => void;
  onCancel: () => void;
}

export function DoseEditor({ dose, articles, phrases, onSave, onCancel }: DoseEditorProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [editedDose, setEditedDose] = useState<DailyDose>({ ...dose });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'articles' | 'audio' | 'settings'>('content');

  // Get time slot icon and info
  const timeSlotInfo = {
    morning: { icon: Sun, emoji: '☀️', color: 'text-yellow-600' },
    noon: { icon: CloudSun, emoji: '☁️', color: 'text-blue-600' },
    evening: { icon: Sunset, emoji: '🌇', color: 'text-orange-600' },
    night: { icon: Moon, emoji: '🌙', color: 'text-purple-600' }
  };

  const info = timeSlotInfo[editedDose.timeSlot];
  const IconComponent = info.icon;

  // Filter phrases by category and type
  const availableHeadlines = phrases.filter(p => 
    p.category === editedDose.timeSlot && p.type === 'headline' && p.isActive
  );
  const availableSubheadlines = phrases.filter(p => 
    p.category === editedDose.timeSlot && p.type === 'subheadline' && p.isActive
  );

  // Get related articles
  const relatedArticles = articles.filter(article => 
    editedDose.content.articles.includes(article.id)
  );

  const handleHeadlineChange = (phraseId: string) => {
    const selectedPhrase = availableHeadlines.find(p => p.id === phraseId);
    if (selectedPhrase) {
      setEditedDose(prev => ({
        ...prev,
        headline: selectedPhrase
      }));
    }
  };

  const handleSubheadlineChange = (phraseId: string) => {
    const selectedPhrase = availableSubheadlines.find(p => p.id === phraseId);
    if (selectedPhrase) {
      setEditedDose(prev => ({
        ...prev,
        subheadline: selectedPhrase
      }));
    }
  };

  const handleContentChange = (field: string, value: any) => {
    setEditedDose(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const handleArticleToggle = (articleId: string, checked: boolean) => {
    setEditedDose(prev => ({
      ...prev,
      content: {
        ...prev.content,
        articles: checked 
          ? [...prev.content.articles, articleId]
          : prev.content.articles.filter(id => id !== articleId)
      }
    }));
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    try {
      const selectedArticles = articles.filter(a => editedDose.content.articles.includes(a.id));
      const prompt = spark.llmPrompt`Generate a smart ${editedDose.timeSlot} news summary in Arabic for these articles: ${selectedArticles.map(a => `${a.title} - ${a.excerpt}`).join('; ')}. Keep it concise, engaging, and appropriate for the ${editedDose.timeSlot} time slot. Maximum 150 words.`;
      
      const aiSummary = await spark.llm(prompt);
      
      setEditedDose(prev => ({
        ...prev,
        content: {
          ...prev.content,
          summary: aiSummary,
          summaryAr: aiSummary
        }
      }));
      
      toast.success(
        isArabic ? 'تم إنشاء الملخص بالذكاء الاصطناعي' : 'AI summary generated successfully'
      );
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(
        isArabic ? 'حدث خطأ أثناء إنشاء الملخص' : 'Error generating summary'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    setIsGenerating(true);
    try {
      // Simulate audio generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEditedDose(prev => ({
        ...prev,
        audioContent: {
          url: 'https://example.com/audio.mp3',
          duration: 180,
          voice: 'ar-SA-Wavenet-A',
          generatedAt: new Date()
        }
      }));
      
      toast.success(
        isArabic ? 'تم إنشاء النسخة الصوتية' : 'Audio version generated successfully'
      );
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(
        isArabic ? 'حدث خطأ أثناء إنشاء الصوت' : 'Error generating audio'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const updatedDose = {
      ...editedDose,
      updatedAt: new Date()
    };
    onSave(updatedDose);
  };

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Headlines */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'العناوين' : 'Headlines'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-arabic">
              {isArabic ? 'العنوان الرئيسي' : 'Main Headline'}
            </Label>
            <Select
              value={editedDose.headline.id}
              onValueChange={handleHeadlineChange}
            >
              <SelectTrigger className="font-arabic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableHeadlines.map(phrase => (
                  <SelectItem key={phrase.id} value={phrase.id} className="font-arabic">
                    {phrase.textAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-arabic">
              {isArabic ? 'العنوان الفرعي' : 'Subheadline'}
            </Label>
            <Select
              value={editedDose.subheadline.id}
              onValueChange={handleSubheadlineChange}
            >
              <SelectTrigger className="font-arabic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSubheadlines.map(phrase => (
                  <SelectItem key={phrase.id} value={phrase.id} className="font-arabic">
                    {phrase.textAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center justify-between font-arabic", isRTL && "flex-row-reverse")}>
            <span>{isArabic ? 'المحتوى' : 'Content'}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={generateAISummary}
              disabled={isGenerating}
              className="font-arabic"
            >
              <SafeIcon icon={isGenerating ? RefreshCw : Sparkles} className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              {isArabic ? 'إنشاء بالذكاء الاصطناعي' : 'Generate with AI'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-arabic">
              {isArabic ? 'الملخص الذكي' : 'Smart Summary'}
            </Label>
            <Textarea
              value={editedDose.content.summaryAr}
              onChange={(e) => handleContentChange('summaryAr', e.target.value)}
              placeholder={isArabic ? 'اكتب الملخص هنا...' : 'Write summary here...'}
              className="min-h-[120px] font-arabic"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
            <div className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
              {editedDose.content.summaryAr.length} / 500 {isArabic ? 'حرف' : 'characters'}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-arabic">
              {isArabic ? 'نصيحة اليوم' : 'Tip of the Day'}
            </Label>
            <Input
              value={editedDose.content.tipAr || ''}
              onChange={(e) => handleContentChange('tipAr', e.target.value)}
              placeholder={isArabic ? 'نصيحة مفيدة...' : 'Helpful tip...'}
              className="font-arabic"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-arabic">
              {isArabic ? 'الرؤى الذكية' : 'Smart Insights'}
            </Label>
            <div className="space-y-2">
              {editedDose.content.insights.map((insight, index) => (
                <div key={index} className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Input
                    value={insight}
                    onChange={(e) => {
                      const newInsights = [...editedDose.content.insights];
                      newInsights[index] = e.target.value;
                      handleContentChange('insights', newInsights);
                    }}
                    className="font-arabic"
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newInsights = editedDose.content.insights.filter((_, i) => i !== index);
                      handleContentChange('insights', newInsights);
                    }}
                  >
                    <SafeIcon icon={X} className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newInsights = [...editedDose.content.insights, ''];
                  handleContentChange('insights', newInsights);
                }}
                className="font-arabic"
              >
                {isArabic ? 'إضافة رؤية' : 'Add Insight'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderArticlesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
          {isArabic ? 'المقالات المرتبطة' : 'Related Articles'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.slice(0, 10).map(article => (
            <div key={article.id} className={cn("flex items-start gap-3 p-3 border rounded-lg", isRTL && "flex-row-reverse")}>
              <Checkbox
                checked={editedDose.content.articles.includes(article.id)}
                onCheckedChange={(checked) => handleArticleToggle(article.id, checked as boolean)}
                className="mt-1"
              />
              
              {article.featuredImage && (
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={article.featuredImage} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className={cn("flex-1 space-y-1", isRTL && "text-right")}>
                <h6 className="font-medium text-sm font-arabic line-clamp-2">
                  {article.title}
                </h6>
                <p className="text-xs text-muted-foreground font-arabic line-clamp-2">
                  {article.excerpt}
                </p>
                <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                  <span className="font-arabic">{article.category.nameAr}</span>
                  <span className="font-arabic">{article.analytics.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</span>
                  <span className="font-arabic">{safeDateFormat(article.createdAt, isArabic ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAudioTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className={cn("flex items-center justify-between font-arabic", isRTL && "flex-row-reverse")}>
          <span>{isArabic ? 'النسخة الصوتية' : 'Audio Version'}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={generateAudio}
            disabled={isGenerating}
            className="font-arabic"
          >
            <SafeIcon icon={isGenerating ? RefreshCw : Upload} className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            {isArabic ? 'إنشاء صوت' : 'Generate Audio'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editedDose.audioContent ? (
          <div className="space-y-4">
            <div className={cn("flex items-center gap-3 p-4 bg-muted/50 rounded-lg", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Play} className="h-8 w-8 text-primary" />
              <div className={cn("flex-1", isRTL && "text-right")}>
                <div className="font-medium font-arabic">
                  {isArabic ? 'ملف صوتي جاهز' : 'Audio File Ready'}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  {isArabic ? 'المدة:' : 'Duration:'} {Math.floor(editedDose.audioContent.duration / 60)}:{(editedDose.audioContent.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <Badge variant="secondary" className="font-arabic">
                {editedDose.audioContent.voice}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'الصوت' : 'Voice'}</Label>
                <Select
                  value={editedDose.audioContent.voice}
                  onValueChange={(value) => {
                    setEditedDose(prev => ({
                      ...prev,
                      audioContent: {
                        ...prev.audioContent!,
                        voice: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar-SA-Wavenet-A" className="font-arabic">صوت ذكوري عربي</SelectItem>
                    <SelectItem value="ar-SA-Wavenet-B" className="font-arabic">صوت أنثوي عربي</SelectItem>
                    <SelectItem value="ar-SA-Wavenet-C" className="font-arabic">صوت طبيعي مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'تاريخ الإنشاء' : 'Generated'}</Label>
                <Input
                  value={safeDateFormat(editedDose.audioContent.generatedAt, isArabic ? 'ar-SA' : 'en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  disabled
                  className="font-arabic"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("text-center py-8", isRTL && "text-right")}>
            <SafeIcon icon={Upload} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium font-arabic mb-2">
              {isArabic ? 'لا توجد نسخة صوتية' : 'No Audio Version'}
            </h4>
            <p className="text-sm text-muted-foreground font-arabic mb-4">
              {isArabic ? 'انقر على "إنشاء صوت" لتوليد نسخة صوتية من المحتوى' : 'Click "Generate Audio" to create an audio version of the content'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'إعدادات النشر' : 'Publishing Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'الحالة' : 'Status'}</Label>
              <Select
                value={editedDose.status}
                onValueChange={(value: any) => setEditedDose(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="font-arabic">
                    {isArabic ? 'مسودة' : 'Draft'}
                  </SelectItem>
                  <SelectItem value="scheduled" className="font-arabic">
                    {isArabic ? 'مجدولة' : 'Scheduled'}
                  </SelectItem>
                  <SelectItem value="published" className="font-arabic">
                    {isArabic ? 'منشورة' : 'Published'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'طريقة الإنشاء' : 'Generation Method'}</Label>
              <Select
                value={editedDose.generatedBy}
                onValueChange={(value: any) => setEditedDose(prev => ({ ...prev, generatedBy: value }))}
              >
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai" className="font-arabic">
                    {isArabic ? 'ذكاء اصطناعي' : 'AI Generated'}
                  </SelectItem>
                  <SelectItem value="manual" className="font-arabic">
                    {isArabic ? 'يدوي' : 'Manual'}
                  </SelectItem>
                  <SelectItem value="hybrid" className="font-arabic">
                    {isArabic ? 'مختلط' : 'Hybrid'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-arabic">{isArabic ? 'تاريخ النشر' : 'Publish Date'}</Label>
            <Input
              type="datetime-local"
              value={editedDose.publishedAt ? new Date(editedDose.publishedAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setEditedDose(prev => ({ ...prev, publishedAt: date }));
              }}
              className="font-arabic"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'إحصائيات الأداء' : 'Performance Stats'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'المشاهدات' : 'Views'}</Label>
              <Input
                type="number"
                value={editedDose.analytics.views}
                onChange={(e) => {
                  setEditedDose(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      views: parseInt(e.target.value) || 0
                    }
                  }));
                }}
                className="font-arabic"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'المشاركات' : 'Shares'}</Label>
              <Input
                type="number"
                value={editedDose.analytics.shares}
                onChange={(e) => {
                  setEditedDose(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      shares: parseInt(e.target.value) || 0
                    }
                  }));
                }}
                className="font-arabic"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'تشغيل صوتي' : 'Audio Plays'}</Label>
              <Input
                type="number"
                value={editedDose.analytics.audioPlays}
                onChange={(e) => {
                  setEditedDose(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      audioPlays: parseInt(e.target.value) || 0
                    }
                  }));
                }}
                className="font-arabic"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'معدل التفاعل %' : 'Engagement %'}</Label>
              <Input
                type="number"
                value={editedDose.analytics.engagement}
                onChange={(e) => {
                  setEditedDose(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      engagement: parseInt(e.target.value) || 0
                    }
                  }));
                }}
                className="font-arabic"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-3 font-arabic", isRTL && "flex-row-reverse")}>
            <SafeIcon icon={IconComponent} className={cn("h-6 w-6", info.color)} />
            <span className="text-lg">{info.emoji}</span>
            <span>{isArabic ? 'تحرير الجرعة الذكية' : 'Edit Smart Dose'}</span>
            <Badge variant="secondary" className="font-arabic">
              {safeDateFormat(editedDose.date, isArabic ? 'ar-SA' : 'en-US')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className={cn("flex gap-1 p-1 bg-muted rounded-lg", isRTL && "flex-row-reverse")}>
          {[
            { id: 'content', label: isArabic ? 'المحتوى' : 'Content', icon: FileText },
            { id: 'articles', label: isArabic ? 'المقالات' : 'Articles', icon: Tag },
            { id: 'audio', label: isArabic ? 'الصوت' : 'Audio', icon: Play },
            { id: 'settings', label: isArabic ? 'الإعدادات' : 'Settings', icon: Clock }
          ].map(tab => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn("flex-1 font-arabic", isRTL && "flex-row-reverse")}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-1">
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'articles' && renderArticlesTab()}
            {activeTab === 'audio' && renderAudioTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </ScrollArea>

        <DialogFooter className={cn("gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" onClick={onCancel} className="font-arabic">
            <SafeIcon icon={X} className="h-4 w-4" />
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} className="font-arabic">
            <SafeIcon icon={Save} className="h-4 w-4" />
            {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}