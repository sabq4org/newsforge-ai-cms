import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafeIcon } from '@/components/common';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { DailyDose, DosePhrase, DoseTemplate, DoseSchedule, Article } from '@/types';
import { DoseEditor } from './DoseEditor';
import { DoseViewer } from './DoseViewer';
import { PhraseLibrary } from './PhraseLibrary';
import { DoseScheduler } from './DoseScheduler';
import { DoseAnalytics } from './DoseAnalytics';
import { DoseGenerator } from './DoseGenerator';
import { 
  Sun, 
  CloudSun, 
  Sunset, 
  Moon, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings,
  Sparkles,
  Play,
  Clock,
  TrendingUp,
  Users,
  Zap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface DailyDosesManagerProps {
  articles?: Article[];
}

export function DailyDosesManager({ articles = [] }: DailyDosesManagerProps) {
  const { language, user } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDose, setSelectedDose] = useState<DailyDose | null>(null);
  const [editingDose, setEditingDose] = useState<DailyDose | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // KV Storage for doses data
  const [doses, setDoses] = useKV<DailyDose[]>('sabq-daily-doses', []);
  const [phrases, setPhrases] = useKV<DosePhrase[]>('sabq-dose-phrases', defaultPhrases);
  const [templates, setTemplates] = useKV<DoseTemplate[]>('sabq-dose-templates', defaultTemplates);
  const [schedule, setSchedule] = useKV<DoseSchedule>('sabq-dose-schedule', defaultSchedule);

  // Get today's doses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysDoses = doses.filter(dose => {
    const doseDate = new Date(dose.date);
    doseDate.setHours(0, 0, 0, 0);
    return doseDate.getTime() === today.getTime();
  });

  // Time slot icons and info
  const timeSlotInfo = {
    morning: {
      icon: Sun,
      label: isArabic ? 'جرعة الصباح' : 'Morning Dose',
      emoji: '☀️',
      time: isArabic ? '٦ص - ١١ص' : '6 AM - 11 AM',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    noon: {
      icon: CloudSun,
      label: isArabic ? 'جرعة الظهيرة' : 'Noon Dose',
      emoji: '☁️',
      time: isArabic ? '١١ص - ٤م' : '11 AM - 4 PM',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    evening: {
      icon: Sunset,
      label: isArabic ? 'جرعة المساء' : 'Evening Dose',
      emoji: '🌇',
      time: isArabic ? '٤م - ٧م' : '4 PM - 7 PM',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    night: {
      icon: Moon,
      label: isArabic ? 'جرعة قبل النوم' : 'Night Dose',
      emoji: '🌙',
      time: isArabic ? '٧م - ١ص' : '7 PM - 1 AM',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  };

  const handleGenerateAllDoses = async () => {
    setIsGenerating(true);
    try {
      const newDoses: DailyDose[] = [];
      
      for (const timeSlot of ['morning', 'noon', 'evening', 'night'] as const) {
        const existingDose = todaysDoses.find(d => d.timeSlot === timeSlot);
        if (!existingDose) {
          const newDose = await generateDoseForTimeSlot(timeSlot);
          newDoses.push(newDose);
        }
      }
      
      if (newDoses.length > 0) {
        setDoses(currentDoses => [...currentDoses, ...newDoses]);
        toast.success(
          isArabic 
            ? `تم إنشاء ${newDoses.length} جرعة جديدة لليوم`
            : `Generated ${newDoses.length} new doses for today`
        );
      } else {
        toast.info(
          isArabic 
            ? 'جميع الجرعات متوفرة لليوم'
            : 'All doses are already available for today'
        );
      }
    } catch (error) {
      console.error('Error generating doses:', error);
      toast.error(
        isArabic 
          ? 'حدث خطأ أثناء إنشاء الجرعات'
          : 'Error generating doses'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDoseForTimeSlot = async (timeSlot: 'morning' | 'noon' | 'evening' | 'night'): Promise<DailyDose> => {
    // Get relevant articles for the time slot (last 3-5 hours)
    const relevantArticles = articles.slice(0, 5); // Simplified for demo
    
    // Get random phrases for the time slot
    const availableHeadlines = phrases.filter(p => p.category === timeSlot && p.type === 'headline' && p.isActive);
    const availableSubheadlines = phrases.filter(p => p.category === timeSlot && p.type === 'subheadline' && p.isActive);
    
    const headline = availableHeadlines[Math.floor(Math.random() * availableHeadlines.length)];
    const subheadline = availableSubheadlines[Math.floor(Math.random() * availableSubheadlines.length)];
    
    // Generate AI summary using spark.llm
    const prompt = spark.llmPrompt`Generate a smart summary for a ${timeSlot} news dose in Arabic. Include the following articles: ${relevantArticles.map(a => a.title).join(', ')}. Keep it concise and engaging, maximum 150 words.`;
    const aiSummary = await spark.llm(prompt);
    
    const newDose: DailyDose = {
      id: `dose_${timeSlot}_${Date.now()}`,
      timeSlot,
      date: new Date(),
      headline,
      subheadline,
      content: {
        summary: aiSummary,
        summaryAr: aiSummary, // In real implementation, would translate
        articles: relevantArticles.map(a => a.id),
        insights: [
          isArabic ? 'تحليل ذكي للأحداث' : 'Smart analysis of events',
          isArabic ? 'نظرة على الاتجاهات' : 'Trending insights'
        ],
        tip: isArabic ? 'نصيحة اليوم: ابق على اطلاع دائم' : 'Tip of the day: Stay informed',
        tipAr: 'نصيحة اليوم: ابق على اطلاع دائم'
      },
      analytics: {
        views: 0,
        shares: 0,
        audioPlays: 0,
        averageReadTime: 0,
        engagement: 0
      },
      status: 'published',
      generatedBy: 'ai',
      createdAt: new Date(),
      publishedAt: new Date(),
      metadata: {
        aiModel: 'gpt-4o',
        processingTime: 2.5,
        sourceArticles: relevantArticles.map(a => ({
          id: a.id,
          title: a.title,
          weight: Math.random()
        }))
      }
    };
    
    return newDose;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h2 className="text-2xl font-bold tracking-tight font-arabic">
            {isArabic ? 'الجرعات الذكية اليومية' : 'Daily Smart Doses'}
          </h2>
          <p className="text-muted-foreground font-arabic">
            {isArabic ? 'نظام توليد المحتوى التلقائي على مدار اليوم' : 'Automated content generation throughout the day'}
          </p>
        </div>
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Button
            onClick={handleGenerateAllDoses}
            disabled={isGenerating}
            className="font-arabic"
          >
            <SafeIcon icon={isGenerating ? Clock : Sparkles} className="h-4 w-4" />
            {isArabic ? 'إنشاء جرعات اليوم' : 'Generate Today\'s Doses'}
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('scheduler')} className="font-arabic">
            <SafeIcon icon={Settings} className="h-4 w-4" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </Button>
        </div>
      </div>

      {/* Today's Doses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(timeSlotInfo).map(([slot, info]) => {
          const dose = todaysDoses.find(d => d.timeSlot === slot);
          const IconComponent = info.icon;
          
          return (
            <Card key={slot} className={cn("cursor-pointer transition-all hover:shadow-md", info.bgColor)}>
              <CardHeader className="pb-3">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <SafeIcon icon={IconComponent} className={cn("h-5 w-5", info.color)} />
                    <span className="text-lg">{info.emoji}</span>
                  </div>
                  {dose && (
                    <Badge variant="secondary" className="font-arabic">
                      {isArabic ? 'منشورة' : 'Published'}
                    </Badge>
                  )}
                </div>
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <CardTitle className="text-base font-arabic">{info.label}</CardTitle>
                  <CardDescription className="font-arabic">{info.time}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {dose ? (
                  <div className="space-y-3">
                    <div className={cn("space-y-1", isRTL && "text-right")}>
                      <h4 className="font-medium text-sm font-arabic">{dose.headline.textAr}</h4>
                      <p className="text-xs text-muted-foreground font-arabic">{dose.subheadline.textAr}</p>
                    </div>
                    <div className={cn("flex items-center justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                      <span className="font-arabic">{dose.content.articles.length} {isArabic ? 'مقال' : 'articles'}</span>
                      <span className="font-arabic">{dose.analytics.views} {isArabic ? 'مشاهدة' : 'views'}</span>
                    </div>
                    <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDose(dose)}
                        className="font-arabic text-xs"
                      >
                        <SafeIcon icon={Play} className="h-3 w-3" />
                        {isArabic ? 'عرض' : 'View'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDose(dose)}
                        className="font-arabic text-xs"
                      >
                        {isArabic ? 'تحرير' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <p className="text-sm text-muted-foreground font-arabic mb-3">
                      {isArabic ? 'لم يتم إنشاء الجرعة بعد' : 'Dose not generated yet'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateAllDoses()}
                      className="font-arabic"
                    >
                      <SafeIcon icon={Plus} className="h-3 w-3" />
                      {isArabic ? 'إنشاء' : 'Generate'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={TrendingUp} className="h-4 w-4 text-green-600" />
              {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {todaysDoses.reduce((sum, dose) => sum + dose.analytics.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-arabic">
              {isArabic ? 'اليوم' : 'Today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Users} className="h-4 w-4 text-blue-600" />
              {isArabic ? 'المشاركات' : 'Shares'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {todaysDoses.reduce((sum, dose) => sum + dose.analytics.shares, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-arabic">
              {isArabic ? 'إجمالي' : 'Total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Play} className="h-4 w-4 text-purple-600" />
              {isArabic ? 'تشغيل صوتي' : 'Audio Plays'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {todaysDoses.reduce((sum, dose) => sum + dose.analytics.audioPlays, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-arabic">
              {isArabic ? 'مرات التشغيل' : 'Plays'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Zap} className="h-4 w-4 text-orange-600" />
              {isArabic ? 'معدل التفاعل' : 'Engagement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {todaysDoses.length > 0 
                ? Math.round(todaysDoses.reduce((sum, dose) => sum + dose.analytics.engagement, 0) / todaysDoses.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground font-arabic">
              {isArabic ? 'متوسط' : 'Average'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn("grid w-full grid-cols-6", isRTL && "grid-flow-row-dense")}>
          <TabsTrigger value="overview" className="font-arabic">
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="generator" className="font-arabic">
            {isArabic ? 'المولد' : 'Generator'}
          </TabsTrigger>
          <TabsTrigger value="phrases" className="font-arabic">
            {isArabic ? 'مكتبة العبارات' : 'Phrase Library'}
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="font-arabic">
            {isArabic ? 'الجدولة' : 'Scheduler'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-arabic">
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="history" className="font-arabic">
            {isArabic ? 'السجل' : 'History'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="generator">
          <DoseGenerator
            articles={articles}
            phrases={phrases}
            templates={templates}
            onDoseGenerated={(dose) => {
              setDoses(current => [...current, dose]);
              toast.success(isArabic ? 'تم إنشاء الجرعة بنجاح' : 'Dose generated successfully');
            }}
          />
        </TabsContent>

        <TabsContent value="phrases">
          <PhraseLibrary
            phrases={phrases}
            onPhrasesUpdate={setPhrases}
          />
        </TabsContent>

        <TabsContent value="scheduler">
          <DoseScheduler
            schedule={schedule}
            templates={templates}
            onScheduleUpdate={setSchedule}
            onTemplatesUpdate={setTemplates}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <DoseAnalytics
            doses={doses}
            timeRange="7d"
          />
        </TabsContent>

        <TabsContent value="history">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {doses
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((dose) => {
                  const info = timeSlotInfo[dose.timeSlot];
                  return (
                    <Card key={dose.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                            <SafeIcon icon={info.icon} className={cn("h-5 w-5", info.color)} />
                            <div className={cn("space-y-1", isRTL && "text-right")}>
                              <CardTitle className="text-base font-arabic">{info.label}</CardTitle>
                              <CardDescription className="font-arabic">
                                {safeDateFormat(dose.date, isArabic ? 'ar-SA' : 'en-US')}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={dose.status === 'published' ? 'default' : 'secondary'} className="font-arabic">
                            {dose.status === 'published' 
                              ? (isArabic ? 'منشورة' : 'Published')
                              : (isArabic ? 'مسودة' : 'Draft')
                            }
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={cn("space-y-2", isRTL && "text-right")}>
                          <h4 className="font-medium font-arabic">{dose.headline.textAr}</h4>
                          <p className="text-sm text-muted-foreground font-arabic line-clamp-2">
                            {dose.content.summaryAr}
                          </p>
                          <div className={cn("flex items-center gap-4 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                            <span className="font-arabic">{dose.analytics.views} {isArabic ? 'مشاهدة' : 'views'}</span>
                            <span className="font-arabic">{dose.analytics.shares} {isArabic ? 'مشاركة' : 'shares'}</span>
                            <span className="font-arabic">{dose.content.articles.length} {isArabic ? 'مقال' : 'articles'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Dose Viewer Modal */}
      {selectedDose && (
        <DoseViewer
          dose={selectedDose}
          articles={articles}
          onClose={() => setSelectedDose(null)}
          onEdit={() => {
            setEditingDose(selectedDose);
            setSelectedDose(null);
          }}
        />
      )}

      {/* Dose Editor Modal */}
      {editingDose && (
        <DoseEditor
          dose={editingDose}
          articles={articles}
          phrases={phrases}
          onSave={(updatedDose) => {
            setDoses(current => current.map(d => d.id === updatedDose.id ? updatedDose : d));
            setEditingDose(null);
            toast.success(isArabic ? 'تم حفظ التغييرات' : 'Changes saved');
          }}
          onCancel={() => setEditingDose(null)}
        />
      )}
    </div>
  );
}

// Default phrases for the system
const defaultPhrases: DosePhrase[] = [
  // Morning Headlines
  {
    id: 'morning_h1',
    text: 'Start your morning with the top news!',
    textAr: 'ابدأ صباحك بأهم الأخبار!',
    category: 'morning',
    type: 'headline',
    tone: 'energetic',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'morning_h2',
    text: 'Morning briefing from Sabq',
    textAr: 'ملخّص الصباح من سبق',
    category: 'morning',
    type: 'headline',
    tone: 'informative',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'morning_h3',
    text: 'Your morning with Sabq... different',
    textAr: 'صباحك مع سبق… مختلف',
    category: 'morning',
    type: 'headline',
    tone: 'energetic',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  // Morning Subheadlines
  {
    id: 'morning_s1',
    text: 'Five minutes to catch up on everything.',
    textAr: 'خمس دقائق تغنيك عن متابعة كل شيء.',
    category: 'morning',
    type: 'subheadline',
    tone: 'informative',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'morning_s2',
    text: 'Move confidently with a smart dose.',
    textAr: 'تحرّك بثقة مع جرعة ذكية.',
    category: 'morning',
    type: 'subheadline',
    tone: 'energetic',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'morning_s3',
    text: 'Between news, opinion, and analysis in one shot.',
    textAr: 'ما بين الخبر والرأي والتحليل في لقطة واحدة.',
    category: 'morning',
    type: 'subheadline',
    tone: 'analytical',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  // Noon Headlines
  {
    id: 'noon_h1',
    text: 'Your midday needs organization?',
    textAr: 'منتصف يومك يحتاج ترتيب؟',
    category: 'noon',
    type: 'headline',
    tone: 'informative',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'noon_h2',
    text: 'From the heart of the event... noon dose',
    textAr: 'من قلب الحدث… جرعة الظهيرة',
    category: 'noon',
    type: 'headline',
    tone: 'informative',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'noon_h3',
    text: 'Smart pause for noon',
    textAr: 'وقفة ذكية لنصف النهار',
    category: 'noon',
    type: 'headline',
    tone: 'calm',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  // Evening Headlines  
  {
    id: 'evening_h1',
    text: 'Your evening... news and analysis',
    textAr: 'مساءك إعلام… وتحليل',
    category: 'evening',
    type: 'headline',
    tone: 'analytical',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'evening_h2',
    text: 'Day summary? Available',
    textAr: 'تلخيص لليوم؟ موجود',
    category: 'evening',
    type: 'headline',
    tone: 'informative',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  // Night Headlines
  {
    id: 'night_h1',
    text: 'Tonight... sleep informed',
    textAr: 'الليلة… نام وأنت على اطلاع',
    category: 'night',
    type: 'headline',
    tone: 'calm',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'night_h2',
    text: 'Pre-sleep dose',
    textAr: 'جرعة ما قبل النوم',
    category: 'night',
    type: 'headline',
    tone: 'calm',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  },
  {
    id: 'night_h3',
    text: 'Sabq concludes your day... in summary',
    textAr: 'سبق تختم يومك… باختصار',
    category: 'night',
    type: 'headline',
    tone: 'calm',
    isActive: true,
    usage_count: 0,
    createdAt: new Date()
  }
];

// Default templates
const defaultTemplates: DoseTemplate[] = [
  {
    id: 'morning_energetic',
    name: 'Energetic Morning',
    nameAr: 'صباح نشيط',
    timeSlot: 'morning',
    structure: {
      includeWeather: true,
      includeAnalytics: false,
      includeTrending: true,
      includePersonalized: true,
      maxArticles: 3,
      preferredCategories: ['محليات', 'أعمال', 'تقنية'],
      tone: 'professional'
    },
    audioSettings: {
      voice: 'ar-SA-Wavenet-A',
      speed: 1.1,
      includeMusic: true,
      musicVolume: 0.3
    },
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date()
  },
  {
    id: 'night_calm',
    name: 'Calm Night',
    nameAr: 'ليلة هادئة',
    timeSlot: 'night',
    structure: {
      includeWeather: false,
      includeAnalytics: true,
      includeTrending: false,
      includePersonalized: true,
      maxArticles: 2,
      preferredCategories: ['حياتنا', 'ثقافة'],
      tone: 'calming'
    },
    audioSettings: {
      voice: 'ar-SA-Wavenet-B',
      speed: 0.9,
      includeMusic: true,
      musicVolume: 0.2
    },
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date()
  }
];

// Default schedule
const defaultSchedule: DoseSchedule = {
  id: 'default_schedule',
  timeSlots: {
    morning: { time: '07:00', enabled: true, template: 'morning_energetic' },
    noon: { time: '13:00', enabled: true },
    evening: { time: '18:00', enabled: true },
    night: { time: '22:00', enabled: true, template: 'night_calm' }
  },
  timezone: 'Asia/Riyadh',
  autoGenerate: true,
  moderationRequired: false,
  notificationSettings: {
    email: true,
    push: true
  },
  isActive: true,
  createdBy: 'system',
  updatedAt: new Date()
};