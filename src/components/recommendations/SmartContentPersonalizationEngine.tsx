import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain,
  User,
  Heart,
  Clock,
  Target,
  Star,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Eye,
  BookOpen,
  Settings,
  Zap,
  Cpu,
  Globe,
  Calendar,
  MessageSquare,
  ArrowRight,
  Filter,
  Search
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface PersonalizedContent {
  id: string;
  originalArticleId: string;
  personalizedTitle: string;
  personalizedExcerpt: string;
  customIntroduction: string;
  adaptedContent: string;
  personalizedTags: string[];
  customMetadata: {
    readingLevel: 'beginner' | 'intermediate' | 'advanced';
    emotionalTone: 'neutral' | 'positive' | 'serious' | 'inspiring';
    contentFocus: string[];
    estimatedReadTime: number;
  };
  userRelevanceScore: number;
  personalizationReason: string;
  createdAt: Date;
}

interface UserContentProfile {
  userId: string;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTone: 'neutral' | 'positive' | 'serious' | 'inspiring';
  interests: string[];
  readingSpeed: number; // words per minute
  preferredContentLength: 'short' | 'medium' | 'long';
  emotionalPreferences: string[];
  timeConstraints: {
    availableTime: number; // in minutes
    preferredSchedule: string[];
  };
  cognitivePreferences: {
    complexity: 'simple' | 'detailed' | 'comprehensive';
    structure: 'linear' | 'modular' | 'exploratory';
  };
  contextualNeeds: {
    currentGoals: string[];
    learningObjectives: string[];
    urgency: 'low' | 'medium' | 'high';
  };
}

interface PersonalizationSettings {
  adaptContentComplexity: boolean;
  personalizeEmotionalTone: boolean;
  adjustReadingLength: boolean;
  customizeIntroductions: boolean;
  addPersonalContext: boolean;
  generateCustomSummaries: boolean;
  enhanceWithRelevantLinks: boolean;
  adaptToTimeConstraints: boolean;
}

export function SmartContentPersonalizationEngine({ 
  onArticleSelect 
}: { 
  onArticleSelect: (article: Article) => void;
}) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent[]>([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  
  const [userProfile, setUserProfile] = useKV<UserContentProfile>('user-content-profile', {
    userId: 'user_1',
    readingLevel: 'intermediate',
    preferredTone: 'positive',
    interests: ['تقنية', 'علوم', 'ابتكار'],
    readingSpeed: 200,
    preferredContentLength: 'medium',
    emotionalPreferences: ['inspiring', 'informative'],
    timeConstraints: {
      availableTime: 15,
      preferredSchedule: ['evening', 'weekend']
    },
    cognitivePreferences: {
      complexity: 'detailed',
      structure: 'modular'
    },
    contextualNeeds: {
      currentGoals: ['تعلم التقنيات الجديدة', 'متابعة الأخبار'],
      learningObjectives: ['فهم الذكاء الاصطناعي', 'مواكبة التطورات'],
      urgency: 'medium'
    }
  });

  const [personalizationSettings, setPersonalizationSettings] = useKV<PersonalizationSettings>('personalization-settings', {
    adaptContentComplexity: true,
    personalizeEmotionalTone: true,
    adjustReadingLength: true,
    customizeIntroductions: true,
    addPersonalContext: true,
    generateCustomSummaries: true,
    enhanceWithRelevantLinks: true,
    adaptToTimeConstraints: true
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activePersonalization, setActivePersonalization] = useState<PersonalizedContent | null>(null);

  // Personalize content using AI
  const personalizeArticle = async (article: Article) => {
    setIsPersonalizing(true);
    
    try {
      const personalizationPrompt = spark.llmPrompt`
        قم بتخصيص هذا المقال للمستخدم التالي:

        المقال الأصلي:
        العنوان: ${article.title}
        المحتوى: ${article.excerpt}
        الفئة: ${article.category?.name || 'عام'}

        ملف المستخدم:
        مستوى القراءة: ${userProfile.readingLevel}
        النبرة المفضلة: ${userProfile.preferredTone}
        الاهتمامات: ${userProfile.interests.join(', ')}
        سرعة القراءة: ${userProfile.readingSpeed} كلمة/دقيقة
        الطول المفضل: ${userProfile.preferredContentLength}
        الوقت المتاح: ${userProfile.timeConstraints.availableTime} دقيقة
        التعقيد المفضل: ${userProfile.cognitivePreferences.complexity}
        الأهداف الحالية: ${userProfile.contextualNeeds.currentGoals.join(', ')}

        إعدادات التخصيص:
        ${Object.entries(personalizationSettings).filter(([_, enabled]) => enabled).map(([setting, _]) => setting).join(', ')}

        قم بإنتاج:
        1. عنوان مخصص يتناسب مع اهتماماته ومستواه
        2. ملخص مخصص بالطول والتعقيد المناسب
        3. مقدمة شخصية تربط المحتوى بأهدافه
        4. محتوى معدل يناسب مستوى القراءة والوقت المتاح
        5. كلمات مفتاحية شخصية
        6. سبب التخصيص
        7. نقاط الصلة بأهدافه الشخصية
        8. تقدير الوقت اللازم للقراءة
        9. مستوى الصعوبة المعدل
        10. النبرة العاطفية المطبقة

        أجب بصيغة JSON مفصلة.
      `;

      const result = await spark.llm(personalizationPrompt, 'gpt-4o', true);
      const personalization = JSON.parse(result);

      const personalizedItem: PersonalizedContent = {
        id: `personalized_${article.id}_${Date.now()}`,
        originalArticleId: article.id,
        personalizedTitle: personalization.personalizedTitle || article.title,
        personalizedExcerpt: personalization.personalizedExcerpt || article.excerpt,
        customIntroduction: personalization.personalIntroduction || '',
        adaptedContent: personalization.adaptedContent || article.content,
        personalizedTags: personalization.personalizedTags || [],
        customMetadata: {
          readingLevel: personalization.adjustedReadingLevel || userProfile.readingLevel,
          emotionalTone: personalization.appliedTone || userProfile.preferredTone,
          contentFocus: personalization.focusAreas || [],
          estimatedReadTime: personalization.estimatedReadTime || 5
        },
        userRelevanceScore: personalization.relevanceScore || 0.8,
        personalizationReason: personalization.personalizationReason || 'محتوى مخصص بناءً على تفضيلاتك',
        createdAt: new Date()
      };

      setPersonalizedContent(prev => [personalizedItem, ...prev.slice(0, 9)]);
      setActivePersonalization(personalizedItem);
      toast.success('تم تخصيص المحتوى بنجاح');

    } catch (error) {
      console.error('Error personalizing content:', error);
      toast.error('خطأ في تخصيص المحتوى');
    } finally {
      setIsPersonalizing(false);
    }
  };

  // Batch personalize multiple articles
  const batchPersonalizeArticles = async () => {
    setIsPersonalizing(true);
    
    try {
      const batchPrompt = spark.llmPrompt`
        قم بترتيب وتخصيص هذه المقالات للمستخدم بناءً على ملفه الشخصي:

        المقالات:
        ${articles.slice(0, 5).map((article, idx) => `
        ${idx + 1}. "${article.title}" - ${article.category?.name}
        الملخص: ${article.excerpt}
        `).join('\n')}

        ملف المستخدم:
        الاهتمامات: ${userProfile.interests.join(', ')}
        المستوى: ${userProfile.readingLevel}
        الوقت المتاح: ${userProfile.timeConstraints.availableTime} دقيقة
        الأهداف: ${userProfile.contextualNeeds.currentGoals.join(', ')}

        رتب المقالات حسب الأولوية وخصص العناوين والملخصات لكل منها.
        اقترح ترتيب قراءة مثالي وخطة شخصية للاستفادة القصوى.

        أجب بصيغة JSON مع تفاصيل التخصيص لكل مقال.
      `;

      const result = await spark.llm(batchPrompt, 'gpt-4o', true);
      const batchPersonalization = JSON.parse(result);

      if (batchPersonalization.personalizedArticles) {
        const personalizedItems: PersonalizedContent[] = batchPersonalization.personalizedArticles.map((item: any, idx: number) => ({
          id: `batch_${idx}_${Date.now()}`,
          originalArticleId: articles[idx]?.id || articles[0].id,
          personalizedTitle: item.personalizedTitle || articles[idx]?.title || '',
          personalizedExcerpt: item.personalizedExcerpt || articles[idx]?.excerpt || '',
          customIntroduction: item.personalIntroduction || '',
          adaptedContent: item.adaptedContent || articles[idx]?.content || '',
          personalizedTags: item.tags || [],
          customMetadata: {
            readingLevel: userProfile.readingLevel,
            emotionalTone: userProfile.preferredTone,
            contentFocus: item.focusAreas || [],
            estimatedReadTime: item.estimatedReadTime || 5
          },
          userRelevanceScore: item.priority || 0.7,
          personalizationReason: item.reason || 'ضمن الخطة الشخصية المقترحة',
          createdAt: new Date()
        }));

        setPersonalizedContent(personalizedItems);
        toast.success(`تم تخصيص ${personalizedItems.length} مقالات بنجاح`);
      }

    } catch (error) {
      console.error('Error batch personalizing:', error);
      toast.error('خطأ في التخصيص المتعدد');
    } finally {
      setIsPersonalizing(false);
    }
  };

  // Generate reading plan
  const generatePersonalizedReadingPlan = async () => {
    try {
      const planPrompt = spark.llmPrompt`
        اصنع خطة قراءة شخصية لهذا المستخدم:

        ملف المستخدم:
        الوقت المتاح يومياً: ${userProfile.timeConstraints.availableTime} دقيقة
        سرعة القراءة: ${userProfile.readingSpeed} كلمة/دقيقة
        الاهتمامات: ${userProfile.interests.join(', ')}
        الأهداف: ${userProfile.contextualNeeds.currentGoals.join(', ')}
        المستوى: ${userProfile.readingLevel}
        أوقات القراءة المفضلة: ${userProfile.timeConstraints.preferredSchedule.join(', ')}

        المحتوى المتاح المخصص:
        ${personalizedContent.map((content, idx) => `
        ${idx + 1}. "${content.personalizedTitle}"
        الوقت المقدر: ${content.customMetadata.estimatedReadTime} دقيقة
        درجة الصلة: ${content.userRelevanceScore}
        `).join('\n')}

        اصنع خطة قراءة لأسبوع تتضمن:
        1. ترتيب المحتوى حسب الأولوية
        2. توزيع زمني مقترح
        3. أهداف تعلم محددة
        4. نصائح لتحقيق أقصى استفادة
        5. خطة متابعة

        أجب بصيغة JSON مفصلة.
      `;

      const planResult = await spark.llm(planPrompt, 'gpt-4o', true);
      const plan = JSON.parse(planResult);

      toast.success('تم إنشاء خطة القراءة الشخصية');
      return plan;
    } catch (error) {
      toast.error('خطأ في إنشاء خطة القراءة');
      return null;
    }
  };

  const renderPersonalizedContentCard = (content: PersonalizedContent) => {
    const originalArticle = articles.find(a => a.id === content.originalArticleId);
    
    return (
      <Card key={content.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header with personalization badge */}
            <div className="flex items-start justify-between">
              <Badge variant="default" className="gap-1 bg-gradient-to-r from-accent to-primary">
                <Sparkles className="h-3 w-3" />
                مخصص لك
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {Math.round(content.userRelevanceScore * 100)}% ملائم
              </Badge>
            </div>

            {/* Personalized content */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg line-clamp-2 text-primary">
                {content.personalizedTitle}
              </h3>
              
              {content.customIntroduction && (
                <div className="bg-accent/10 rounded-lg p-3 border-l-2 border-accent">
                  <p className="text-sm font-medium text-accent-foreground">
                    {content.customIntroduction}
                  </p>
                </div>
              )}
              
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {content.personalizedExcerpt}
              </p>
            </div>

            {/* Personalization metadata */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{content.customMetadata.estimatedReadTime} دقيقة</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span>
                  {content.customMetadata.readingLevel === 'beginner' && 'مبتدئ'}
                  {content.customMetadata.readingLevel === 'intermediate' && 'متوسط'}
                  {content.customMetadata.readingLevel === 'advanced' && 'متقدم'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>
                  {content.customMetadata.emotionalTone === 'neutral' && 'محايد'}
                  {content.customMetadata.emotionalTone === 'positive' && 'إيجابي'}
                  {content.customMetadata.emotionalTone === 'serious' && 'جدي'}
                  {content.customMetadata.emotionalTone === 'inspiring' && 'ملهم'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span>مخصص</span>
              </div>
            </div>

            {/* Personalized tags */}
            {content.personalizedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.personalizedTags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Personalization reason */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                لماذا هذا المحتوى مناسب لك؟
              </div>
              <p className="text-sm text-blue-700">{content.personalizationReason}</p>
            </div>

            {/* Focus areas */}
            {content.customMetadata.contentFocus.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">نقاط التركيز:</p>
                <div className="flex flex-wrap gap-1">
                  {content.customMetadata.contentFocus.map((focus, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  if (originalArticle) {
                    onArticleSelect(originalArticle);
                  }
                }}
              >
                قراءة المحتوى المخصص
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActivePersonalization(content)}
              >
                التفاصيل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUserProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          ملف المحتوى الشخصي
        </CardTitle>
        <CardDescription>
          خصص إعدادات التخصيص لتحسين جودة المحتوى المقترح
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">مستوى القراءة</label>
              <div className="flex gap-2 mt-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <Button
                    key={level}
                    variant={userProfile.readingLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserProfile(prev => ({ ...prev, readingLevel: level as any }))}
                  >
                    {level === 'beginner' && 'مبتدئ'}
                    {level === 'intermediate' && 'متوسط'}
                    {level === 'advanced' && 'متقدم'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">النبرة المفضلة</label>
              <div className="flex gap-2 mt-2">
                {['neutral', 'positive', 'serious', 'inspiring'].map((tone) => (
                  <Button
                    key={tone}
                    variant={userProfile.preferredTone === tone ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserProfile(prev => ({ ...prev, preferredTone: tone as any }))}
                  >
                    {tone === 'neutral' && 'محايد'}
                    {tone === 'positive' && 'إيجابي'}
                    {tone === 'serious' && 'جدي'}
                    {tone === 'inspiring' && 'ملهم'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">طول المحتوى المفضل</label>
              <div className="flex gap-2 mt-2">
                {['short', 'medium', 'long'].map((length) => (
                  <Button
                    key={length}
                    variant={userProfile.preferredContentLength === length ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserProfile(prev => ({ ...prev, preferredContentLength: length as any }))}
                  >
                    {length === 'short' && 'قصير'}
                    {length === 'medium' && 'متوسط'}
                    {length === 'long' && 'طويل'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">الوقت المتاح يومياً (دقيقة)</label>
              <input
                type="range"
                min="5"
                max="60"
                value={userProfile.timeConstraints.availableTime}
                onChange={(e) => setUserProfile(prev => ({
                  ...prev,
                  timeConstraints: { ...prev.timeConstraints, availableTime: parseInt(e.target.value) }
                }))}
                className="w-full mt-2"
              />
              <div className="text-center text-sm text-muted-foreground">
                {userProfile.timeConstraints.availableTime} دقيقة
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">سرعة القراءة (كلمة/دقيقة)</label>
              <input
                type="range"
                min="100"
                max="400"
                value={userProfile.readingSpeed}
                onChange={(e) => setUserProfile(prev => ({ ...prev, readingSpeed: parseInt(e.target.value) }))}
                className="w-full mt-2"
              />
              <div className="text-center text-sm text-muted-foreground">
                {userProfile.readingSpeed} كلمة/دقيقة
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">التعقيد المفضل</label>
              <div className="flex gap-2 mt-2">
                {['simple', 'detailed', 'comprehensive'].map((complexity) => (
                  <Button
                    key={complexity}
                    variant={userProfile.cognitivePreferences.complexity === complexity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserProfile(prev => ({
                      ...prev,
                      cognitivePreferences: { ...prev.cognitivePreferences, complexity: complexity as any }
                    }))}
                  >
                    {complexity === 'simple' && 'بسيط'}
                    {complexity === 'detailed' && 'مفصل'}
                    {complexity === 'comprehensive' && 'شامل'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              محرك تخصيص المحتوى الذكي
            </h1>
            <p className="text-muted-foreground">تخصيص المحتوى بناءً على الملف الشخصي والتفضيلات</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={batchPersonalizeArticles}
            disabled={isPersonalizing}
            className="gap-2"
          >
            <Cpu className="h-4 w-4" />
            تخصيص متعدد
          </Button>
          <Button 
            onClick={generatePersonalizedReadingPlan}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            خطة قراءة
          </Button>
        </div>
      </div>

      {/* Quick personalization section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            تخصيص سريع
          </CardTitle>
          <CardDescription>
            اختر مقالاً لتخصيصه فوراً بناءً على ملفك الشخصي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(0, 6).map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium line-clamp-2">{article.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    <Button 
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => personalizeArticle(article)}
                      disabled={isPersonalizing}
                    >
                      <Sparkles className="h-4 w-4" />
                      تخصيص الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Profile Settings */}
      {renderUserProfileSettings()}

      {/* Personalized Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            المحتوى المخصص لك
          </CardTitle>
          <CardDescription>
            محتوى تم تخصيصه خصيصاً بناءً على تفضيلاتك وأهدافك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalizedContent.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا يوجد محتوى مخصص بعد</h3>
              <p className="text-muted-foreground mb-4">ابدأ بتخصيص بعض المقالات لتظهر هنا</p>
              <Button onClick={batchPersonalizeArticles} disabled={isPersonalizing}>
                ابدأ التخصيص
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personalizedContent.map(renderPersonalizedContentCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalization Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            تحليلات التخصيص
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{personalizedContent.length}</div>
              <div className="text-sm text-blue-600">محتوى مخصص</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {personalizedContent.length > 0 ? Math.round(personalizedContent.reduce((acc, content) => acc + content.userRelevanceScore, 0) / personalizedContent.length * 100) : 0}%
              </div>
              <div className="text-sm text-green-600">متوسط الملائمة</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {personalizedContent.length > 0 ? Math.round(personalizedContent.reduce((acc, content) => acc + content.customMetadata.estimatedReadTime, 0)) : 0}
              </div>
              <div className="text-sm text-purple-600">إجمالي وقت القراءة (دقيقة)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}