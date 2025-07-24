import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DailyDose, Article, DosePhrase, DoseTemplate } from '@/types';
import { 
  Sparkles, 
  RefreshCw, 
  Play,
  Clock,
  TrendingUp,
  FileText,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Zap,
  Settings,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface DoseGeneratorProps {
  articles: Article[];
  phrases: DosePhrase[];
  templates: DoseTemplate[];
  onDoseGenerated: (dose: DailyDose) => void;
}

export function DoseGenerator({ articles, phrases, templates, onDoseGenerated }: DoseGeneratorProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'noon' | 'evening' | 'night'>('morning');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [customSettings, setCustomSettings] = useState({
    includeWeather: false,
    includeAnalytics: true,
    includeTrending: true,
    includePersonalized: false,
    maxArticles: 3,
    tone: 'professional' as 'professional' | 'casual' | 'urgent' | 'calming'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');

  // Time slot icons and info
  const timeSlotInfo = {
    morning: { 
      icon: Sun, 
      emoji: '☀️', 
      label: isArabic ? 'جرعة الصباح' : 'Morning Dose',
      color: 'text-yellow-600',
      description: isArabic ? 'محتوى نشيط ومحفز لبداية اليوم' : 'Energetic and motivating content to start the day'
    },
    noon: { 
      icon: CloudSun, 
      emoji: '☁️', 
      label: isArabic ? 'جرعة الظهيرة' : 'Noon Dose',
      color: 'text-blue-600',
      description: isArabic ? 'تحديثات سريعة ومعلومات مفيدة' : 'Quick updates and useful information'
    },
    evening: { 
      icon: Sunset, 
      emoji: '🌇', 
      label: isArabic ? 'جرعة المساء' : 'Evening Dose',
      color: 'text-orange-600',
      description: isArabic ? 'تحليلات عميقة وملخصات اليوم' : 'Deep analysis and day summaries'
    },
    night: { 
      icon: Moon, 
      emoji: '🌙', 
      label: isArabic ? 'جرعة قبل النوم' : 'Night Dose',
      color: 'text-purple-600',
      description: isArabic ? 'محتوى هادئ ومريح' : 'Calm and relaxing content'
    }
  };

  const info = timeSlotInfo[selectedTimeSlot];
  const IconComponent = info.icon;

  // Filter templates by time slot
  const availableTemplates = templates.filter(t => t.timeSlot === selectedTimeSlot);

  // Filter phrases by time slot
  const availableHeadlines = phrases.filter(p => 
    p.category === selectedTimeSlot && p.type === 'headline' && p.isActive
  );
  const availableSubheadlines = phrases.filter(p => 
    p.category === selectedTimeSlot && p.type === 'subheadline' && p.isActive
  );

  // Get recent articles for selection
  const recentArticles = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 20);

  const handleArticleToggle = (articleId: string, checked: boolean) => {
    if (checked) {
      if (selectedArticles.length < customSettings.maxArticles) {
        setSelectedArticles([...selectedArticles, articleId]);
      } else {
        toast.warning(
          isArabic 
            ? `يمكن اختيار ${customSettings.maxArticles} مقالات كحد أقصى`
            : `Maximum ${customSettings.maxArticles} articles allowed`
        );
      }
    } else {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId));
    }
  };

  const simulateGenerationProgress = async () => {
    const steps = [
      { progress: 20, step: isArabic ? 'اختيار العبارات...' : 'Selecting phrases...' },
      { progress: 40, step: isArabic ? 'تحليل المقالات...' : 'Analyzing articles...' },
      { progress: 60, step: isArabic ? 'إنشاء الملخص بالذكاء الاصطناعي...' : 'Generating AI summary...' },
      { progress: 80, step: isArabic ? 'إضافة الرؤى الذكية...' : 'Adding smart insights...' },
      { progress: 100, step: isArabic ? 'اكتمل!' : 'Complete!' }
    ];

    for (const { progress, step } of steps) {
      setGenerationProgress(progress);
      setGenerationStep(step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const generateDose = async () => {
    if (selectedArticles.length === 0) {
      toast.error(
        isArabic ? 'يرجى اختيار مقال واحد على الأقل' : 'Please select at least one article'
      );
      return;
    }

    if (availableHeadlines.length === 0 || availableSubheadlines.length === 0) {
      toast.error(
        isArabic 
          ? 'لا توجد عبارات متاحة لهذه الفترة الزمنية'
          : 'No phrases available for this time slot'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      await simulateGenerationProgress();

      // Get selected articles
      const doseArticles = articles.filter(a => selectedArticles.includes(a.id));

      // Select random phrases
      const headline = availableHeadlines[Math.floor(Math.random() * availableHeadlines.length)];
      const subheadline = availableSubheadlines[Math.floor(Math.random() * availableSubheadlines.length)];

      // Generate AI summary
      const prompt = spark.llmPrompt`Generate a smart ${selectedTimeSlot} news summary in Arabic for these articles: ${doseArticles.map(a => `${a.title} - ${a.excerpt}`).join('; ')}. Tone should be ${customSettings.tone}. Keep it concise and engaging for ${selectedTimeSlot} audience. Maximum 150 words.`;
      
      const aiSummary = await spark.llm(prompt);

      // Generate insights based on settings
      const insights = [];
      if (customSettings.includeAnalytics) {
        insights.push(isArabic ? 'أداء المحتوى يتزايد بنسبة 15%' : 'Content performance increased by 15%');
      }
      if (customSettings.includeTrending) {
        insights.push(isArabic ? 'الموضوعات الرائجة تركز على التكنولوجيا' : 'Trending topics focus on technology');
      }
      if (customSettings.includeWeather) {
        insights.push(isArabic ? 'الطقس مناسب للأنشطة الخارجية' : 'Weather suitable for outdoor activities');
      }

      const newDose: DailyDose = {
        id: `dose_${selectedTimeSlot}_${Date.now()}`,
        timeSlot: selectedTimeSlot,
        date: new Date(),
        headline,
        subheadline,
        content: {
          summary: aiSummary,
          summaryAr: aiSummary,
          articles: selectedArticles,
          insights,
          tip: selectedTimeSlot === 'morning' 
            ? (isArabic ? 'ابدأ يومك بقراءة الأخبار المهمة' : 'Start your day reading important news')
            : selectedTimeSlot === 'night'
            ? (isArabic ? 'تابع آخر المستجدات قبل النوم' : 'Catch up on latest updates before sleep')
            : (isArabic ? 'ابق على اطلاع بأحدث التطورات' : 'Stay updated with latest developments'),
          tipAr: selectedTimeSlot === 'morning' 
            ? 'ابدأ يومك بقراءة الأخبار المهمة'
            : selectedTimeSlot === 'night'
            ? 'تابع آخر المستجدات قبل النوم'
            : 'ابق على اطلاع بأحدث التطورات'
        },
        analytics: {
          views: 0,
          shares: 0,
          audioPlays: 0,
          averageReadTime: 0,
          engagement: 0
        },
        status: 'draft',
        generatedBy: 'ai',
        createdAt: new Date(),
        metadata: {
          aiModel: 'gpt-4o',
          processingTime: 3.2,
          sourceArticles: doseArticles.map(a => ({
            id: a.id,
            title: a.title,
            weight: Math.random()
          }))
        }
      };

      onDoseGenerated(newDose);
      
      toast.success(
        isArabic ? 'تم إنشاء الجرعة الذكية بنجاح!' : 'Smart dose generated successfully!'
      );

      // Reset selections
      setSelectedArticles([]);
      setGenerationProgress(0);
      setGenerationStep('');

    } catch (error) {
      console.error('Error generating dose:', error);
      toast.error(
        isArabic ? 'حدث خطأ أثناء إنشاء الجرعة' : 'Error generating dose'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomSettings({
        includeWeather: template.structure.includeWeather || false,
        includeAnalytics: template.structure.includeAnalytics || false,
        includeTrending: template.structure.includeTrending || false,
        includePersonalized: template.structure.includePersonalized || false,
        maxArticles: template.structure.maxArticles,
        tone: template.structure.tone
      });
      
      // Auto-select articles based on template preferences
      if (template.structure.preferredCategories && template.structure.preferredCategories.length > 0) {
        const preferredArticles = recentArticles
          .filter(a => template.structure.preferredCategories!.includes(a.category.nameAr || a.category.name))
          .slice(0, template.structure.maxArticles);
        setSelectedArticles(preferredArticles.map(a => a.id));
      }

      toast.success(
        isArabic ? 'تم تطبيق القالب' : 'Template applied successfully'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("space-y-1", isRTL && "text-right")}>
        <h2 className="text-2xl font-bold tracking-tight font-arabic">
          {isArabic ? 'مولد الجرعات الذكية' : 'Smart Dose Generator'}
        </h2>
        <p className="text-muted-foreground font-arabic">
          {isArabic ? 'إنشاء جرعات ذكية مخصصة باستخدام الذكاء الاصطناعي' : 'Create customized smart doses using AI'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Time Slot Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
                {isArabic ? 'اختيار الفترة الزمنية' : 'Select Time Slot'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(timeSlotInfo).map(([slot, slotInfo]) => {
                const SlotIcon = slotInfo.icon;
                const isSelected = selectedTimeSlot === slot;
                
                return (
                  <div
                    key={slot}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50",
                      isRTL && "text-right"
                    )}
                    onClick={() => setSelectedTimeSlot(slot as any)}
                  >
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <SafeIcon icon={SlotIcon} className={cn("h-5 w-5", slotInfo.color)} />
                      <span className="text-lg">{slotInfo.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium font-arabic">{slotInfo.label}</div>
                        <div className="text-xs text-muted-foreground font-arabic">
                          {slotInfo.description}
                        </div>
                      </div>
                      {isSelected && (
                        <SafeIcon icon={CheckCircle} className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
                {isArabic ? 'القوالب الجاهزة' : 'Ready Templates'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableTemplates.length > 0 ? (
                <>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder={isArabic ? 'اختر قالباً...' : 'Select a template...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id} className="font-arabic">
                          {isArabic ? template.nameAr : template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedTemplate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyTemplate(selectedTemplate)}
                      className="w-full font-arabic"
                    >
                      <SafeIcon icon={Settings} className="h-4 w-4" />
                      {isArabic ? 'تطبيق القالب' : 'Apply Template'}
                    </Button>
                  )}
                </>
              ) : (
                <p className={cn("text-sm text-muted-foreground font-arabic", isRTL && "text-right")}>
                  {isArabic ? 'لا توجد قوالب متاحة لهذه الفترة' : 'No templates available for this time slot'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Custom Settings */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
                {isArabic ? 'الإعدادات المخصصة' : 'Custom Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: 'includeWeather', label: isArabic ? 'تضمين الطقس' : 'Include Weather' },
                  { key: 'includeAnalytics', label: isArabic ? 'تضمين الإحصائيات' : 'Include Analytics' },
                  { key: 'includeTrending', label: isArabic ? 'تضمين الرائج' : 'Include Trending' },
                  { key: 'includePersonalized', label: isArabic ? 'تخصيص المحتوى' : 'Personalized Content' }
                ].map(({ key, label }) => (
                  <div key={key} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <Label className="font-arabic">{label}</Label>
                    <Checkbox
                      checked={customSettings[key as keyof typeof customSettings] as boolean}
                      onCheckedChange={(checked) => 
                        setCustomSettings(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'عدد المقالات' : 'Number of Articles'}</Label>
                <Select
                  value={customSettings.maxArticles.toString()}
                  onValueChange={(value) => 
                    setCustomSettings(prev => ({ ...prev, maxArticles: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()} className="font-arabic">
                        {num} {isArabic ? 'مقالات' : 'articles'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'نبرة المحتوى' : 'Content Tone'}</Label>
                <Select
                  value={customSettings.tone}
                  onValueChange={(value: any) => 
                    setCustomSettings(prev => ({ ...prev, tone: value }))
                  }
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional" className="font-arabic">
                      {isArabic ? 'مهني' : 'Professional'}
                    </SelectItem>
                    <SelectItem value="casual" className="font-arabic">
                      {isArabic ? 'غير رسمي' : 'Casual'}
                    </SelectItem>
                    <SelectItem value="urgent" className="font-arabic">
                      {isArabic ? 'عاجل' : 'Urgent'}
                    </SelectItem>
                    <SelectItem value="calming" className="font-arabic">
                      {isArabic ? 'هادئ' : 'Calming'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center justify-between font-arabic", isRTL && "flex-row-reverse")}>
                <span>{isArabic ? 'اختيار المقالات' : 'Select Articles'}</span>
                <Badge variant="secondary" className="font-arabic">
                  {selectedArticles.length} / {customSettings.maxArticles}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentArticles.map(article => (
                  <div 
                    key={article.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      selectedArticles.includes(article.id) ? "border-primary bg-primary/5" : "border-border",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Checkbox
                      checked={selectedArticles.includes(article.id)}
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

          {/* Generation Panel */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
                {isArabic ? 'إنشاء الجرعة' : 'Generate Dose'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <SafeIcon icon={RefreshCw} className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                    <h4 className="font-medium font-arabic">{generationStep}</h4>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <div className={cn("text-sm text-muted-foreground text-center font-arabic", isRTL && "text-right")}>
                    {generationProgress}% {isArabic ? 'مكتمل' : 'complete'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <SafeIcon icon={Sparkles} className={cn("h-8 w-8 mx-auto mb-2", info.color)} />
                    <h4 className="font-medium font-arabic mb-2">
                      {isArabic ? 'جاهز لإنشاء الجرعة الذكية' : 'Ready to Generate Smart Dose'}
                    </h4>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isArabic 
                        ? `سيتم إنشاء ${info.label} باستخدام ${selectedArticles.length} مقال`
                        : `Will generate ${info.label} using ${selectedArticles.length} articles`
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 font-arabic">
                        {availableHeadlines.length}
                      </div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'عنوان رئيسي' : 'Headlines'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 font-arabic">
                        {availableSubheadlines.length}
                      </div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'عنوان فرعي' : 'Subheadlines'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 font-arabic">
                        {selectedArticles.length}
                      </div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'مقال مختار' : 'Selected Articles'}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={generateDose}
                    disabled={selectedArticles.length === 0 || isGenerating}
                    className="w-full font-arabic"
                    size="lg"
                  >
                    <SafeIcon icon={Zap} className="h-5 w-5" />
                    {isArabic ? 'إنشاء الجرعة الذكية' : 'Generate Smart Dose'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}