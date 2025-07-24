import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  BookOpen,
  Star,
  ThumbsUp,
  Eye,
  Share2,
  Settings,
  RefreshCw,
  Lightbulb,
  Wand2,
  ChartLine,
  Zap,
  Cpu,
  MessageSquare,
  Heart,
  Award,
  Filter,
  Search,
  Calendar,
  Globe,
  ArrowRight
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface GenerativeRecommendation {
  id: string;
  type: 'content-based' | 'collaborative' | 'hybrid' | 'trend-prediction' | 'contextual';
  articleId: string;
  score: number;
  confidence: number;
  reasoning: string;
  personalizedTitle: string;
  personalizedExcerpt: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  emotionalTone: 'informative' | 'inspiring' | 'urgent' | 'entertaining' | 'analytical';
  aiGeneratedTags: string[];
  predictedEngagement: {
    views: number;
    likes: number;
    shares: number;
    readTime: number;
  };
  explanationText: string;
}

interface UserPersona {
  interests: string[];
  readingPatterns: {
    preferredTime: string[];
    sessionDuration: number;
    articlesPerSession: number;
  };
  engagementHistory: {
    likedCategories: string[];
    averageReadTime: number;
    shareFrequency: number;
  };
  emotionalPreferences: string[];
  currentMood: 'curious' | 'focused' | 'relaxed' | 'urgent' | 'exploratory';
}

interface AIRecommendationConfig {
  diversityWeight: number;
  noveltyWeight: number;
  personalizedWeight: number;
  trendWeight: number;
  timeBasedWeight: number;
  emotionalWeight: number;
  useGenerativeEnhancements: boolean;
  enableRealtimeAdaptation: boolean;
  enableSerendipity: boolean;
  maxRecommendations: number;
}

export function GenerativeAIRecommendationSystem({ 
  onArticleSelect 
}: { 
  onArticleSelect: (article: Article) => void;
}) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [recommendations, setRecommendations] = useState<GenerativeRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('recommendations');
  
  const [userPersona, setUserPersona] = useKV<UserPersona>('user-persona', {
    interests: ['تقنية', 'سياسة', 'علوم'],
    readingPatterns: {
      preferredTime: ['evening', 'night'],
      sessionDuration: 15,
      articlesPerSession: 3
    },
    engagementHistory: {
      likedCategories: ['تقنية', 'علوم'],
      averageReadTime: 4.5,
      shareFrequency: 0.3
    },
    emotionalPreferences: ['inspiring', 'informative'],
    currentMood: 'curious'
  });

  const [aiConfig, setAiConfig] = useKV<AIRecommendationConfig>('ai-recommendation-config', {
    diversityWeight: 0.3,
    noveltyWeight: 0.2,
    personalizedWeight: 0.4,
    trendWeight: 0.3,
    timeBasedWeight: 0.2,
    emotionalWeight: 0.25,
    useGenerativeEnhancements: true,
    enableRealtimeAdaptation: true,
    enableSerendipity: true,
    maxRecommendations: 12
  });

  const [currentQuery, setCurrentQuery] = useState('');
  const [contextualPrompt, setContextualPrompt] = useState('');

  // Generate AI-powered recommendations
  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const generatedRecommendations: GenerativeRecommendation[] = [];
      
      // Step 1: Analyze user context and current mood
      const contextAnalysis = await analyzeUserContext();
      
      // Step 2: Generate content-based recommendations using AI
      const contentRecommendations = await generateContentBasedRecommendations(contextAnalysis);
      generatedRecommendations.push(...contentRecommendations);
      
      // Step 3: Generate collaborative filtering recommendations
      const collaborativeRecommendations = await generateCollaborativeRecommendations();
      generatedRecommendations.push(...collaborativeRecommendations);
      
      // Step 4: Generate trend prediction recommendations
      const trendRecommendations = await generateTrendPredictionRecommendations();
      generatedRecommendations.push(...trendRecommendations);
      
      // Step 5: Generate contextual recommendations based on time/mood
      const contextualRecommendations = await generateContextualRecommendations(contextAnalysis);
      generatedRecommendations.push(...contextualRecommendations);
      
      // Step 6: Apply AI-driven ranking and diversification
      const rankedRecommendations = await rankAndDiversifyRecommendations(generatedRecommendations);
      
      // Step 7: Generate personalized content for each recommendation
      const enhancedRecommendations = await enhanceWithGenerativeContent(rankedRecommendations);
      
      setRecommendations(enhancedRecommendations.slice(0, aiConfig.maxRecommendations));
      toast.success('تم إنتاج التوصيات الذكية بنجاح');
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      toast.error('خطأ في إنتاج التوصيات الذكية');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeUserContext = async () => {
    const prompt = spark.llmPrompt`
      تحليل سياق المستخدم التالي وتقديم رؤى للتوصيات:
      
      الاهتمامات: ${userPersona.interests.join(', ')}
      الحالة المزاجية الحالية: ${userPersona.currentMood}
      أنماط القراءة: ${JSON.stringify(userPersona.readingPatterns)}
      التفضيلات العاطفية: ${userPersona.emotionalPreferences.join(', ')}
      
      الوقت الحالي: ${new Date().toLocaleTimeString('ar-SA')}
      السياق الإضافي: ${contextualPrompt || 'لا يوجد'}
      
      قدم تحليلاً شاملاً لما يحتاجه المستخدم الآن ونوع المحتوى المناسب.
    `;
    
    try {
      const analysis = await spark.llm(prompt, 'gpt-4o');
      return analysis;
    } catch (error) {
      return 'تحليل أساسي: المستخدم يبحث عن محتوى متنوع يتماشى مع اهتماماته';
    }
  };

  const generateContentBasedRecommendations = async (context: string): Promise<GenerativeRecommendation[]> => {
    const recommendations: GenerativeRecommendation[] = [];
    
    for (const article of articles.slice(0, 6)) {
      const prompt = spark.llmPrompt`
        قم بتحليل هذا المقال وتقييم مدى ملائمته للمستخدم:
        
        عنوان المقال: ${article.title}
        المحتوى: ${article.excerpt}
        الفئة: ${article.category?.name || 'عام'}
        
        سياق المستخدم: ${context}
        اهتمامات المستخدم: ${userPersona.interests.join(', ')}
        
        قدم:
        1. نقاط التطابق (0-100)
        2. سبب التوصية
        3. عنوان مخصص للمستخدم
        4. ملخص مخصص
        5. التوقيت المناسب للقراءة
        6. النبرة العاطفية المناسبة
        7. كلمات مفتاحية ذكية
        8. توقع التفاعل
        
        أجب بصيغة JSON فقط.
      `;
      
      try {
        const result = await spark.llm(prompt, 'gpt-4o', true);
        const parsed = JSON.parse(result);
        
        if (parsed.score > 60) {
          recommendations.push({
            id: `content_${article.id}_${Date.now()}`,
            type: 'content-based',
            articleId: article.id,
            score: parsed.score / 100,
            confidence: 0.8,
            reasoning: parsed.reasoning || 'تحليل محتوى ذكي',
            personalizedTitle: parsed.personalizedTitle || article.title,
            personalizedExcerpt: parsed.personalizedExcerpt || article.excerpt,
            timeSlot: parsed.timeSlot || 'evening',
            emotionalTone: parsed.emotionalTone || 'informative',
            aiGeneratedTags: parsed.tags || [],
            predictedEngagement: parsed.predictedEngagement || {
              views: Math.floor(Math.random() * 1000) + 500,
              likes: Math.floor(Math.random() * 100) + 50,
              shares: Math.floor(Math.random() * 50) + 25,
              readTime: Math.floor(Math.random() * 5) + 3
            },
            explanationText: parsed.explanation || 'موصى به بناءً على اهتماماتك'
          });
        }
      } catch (error) {
        // Fallback to basic scoring
        const basicScore = calculateBasicContentScore(article);
        if (basicScore > 0.6) {
          recommendations.push({
            id: `content_fallback_${article.id}`,
            type: 'content-based',
            articleId: article.id,
            score: basicScore,
            confidence: 0.6,
            reasoning: 'تطابق أساسي مع الاهتمامات',
            personalizedTitle: article.title,
            personalizedExcerpt: article.excerpt,
            timeSlot: 'evening',
            emotionalTone: 'informative',
            aiGeneratedTags: [],
            predictedEngagement: {
              views: 750,
              likes: 75,
              shares: 37,
              readTime: 4
            },
            explanationText: 'موصى به بناءً على تفضيلاتك'
          });
        }
      }
    }
    
    return recommendations;
  };

  const generateCollaborativeRecommendations = async (): Promise<GenerativeRecommendation[]> => {
    // Simulate collaborative filtering using AI
    const prompt = spark.llmPrompt`
      بناءً على بيانات المستخدمين المماثلين، ما هي المقالات التي يجب أن نوصي بها؟
      
      اهتمامات المستخدم الحالي: ${userPersona.interests.join(', ')}
      أنماط القراءة: ${JSON.stringify(userPersona.readingPatterns)}
      
      المقالات المتاحة: ${articles.slice(0, 5).map(a => `"${a.title}" - ${a.category?.name}`).join(', ')}
      
      قدم 3 توصيات بناءً على التشابه مع المستخدمين الآخرين بصيغة JSON.
    `;
    
    try {
      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(result);
      
      return parsed.recommendations?.map((rec: any, index: number) => ({
        id: `collaborative_${index}_${Date.now()}`,
        type: 'collaborative' as const,
        articleId: articles[index]?.id || articles[0].id,
        score: rec.score || 0.7,
        confidence: 0.75,
        reasoning: rec.reasoning || 'مستخدمون مماثلون أعجبوا بهذا المحتوى',
        personalizedTitle: rec.title || articles[index]?.title || '',
        personalizedExcerpt: rec.excerpt || articles[index]?.excerpt || '',
        timeSlot: rec.timeSlot || 'evening',
        emotionalTone: rec.tone || 'informative',
        aiGeneratedTags: rec.tags || [],
        predictedEngagement: {
          views: 850,
          likes: 90,
          shares: 45,
          readTime: 5
        },
        explanationText: 'مستخدمون بنفس اهتماماتك قرأوا هذا المحتوى'
      })) || [];
    } catch (error) {
      return [];
    }
  };

  const generateTrendPredictionRecommendations = async (): Promise<GenerativeRecommendation[]> => {
    const prompt = spark.llmPrompt`
      تحليل الاتجاهات الحالية في الأخبار العربية وتوقع المحتوى الذي سيصبح رائجاً:
      
      المقالات الحالية: ${articles.slice(0, 5).map(a => `"${a.title}" - ${a.analytics?.views || 0} مشاهدة`).join(', ')}
      
      اهتمامات المستخدم: ${userPersona.interests.join(', ')}
      
      قدم توقعات للمحتوى الذي سيكون رائجاً خلال الساعات القادمة بصيغة JSON.
    `;
    
    try {
      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(result);
      
      return parsed.predictions?.map((pred: any, index: number) => ({
        id: `trend_${index}_${Date.now()}`,
        type: 'trend-prediction' as const,
        articleId: articles[index]?.id || articles[0].id,
        score: pred.trendScore || 0.8,
        confidence: 0.7,
        reasoning: pred.reasoning || 'متوقع أن يصبح رائجاً',
        personalizedTitle: pred.title || articles[index]?.title || '',
        personalizedExcerpt: pred.excerpt || articles[index]?.excerpt || '',
        timeSlot: pred.timeSlot || 'afternoon',
        emotionalTone: pred.tone || 'urgent',
        aiGeneratedTags: pred.tags || ['رائج', 'متوقع'],
        predictedEngagement: {
          views: pred.predictedViews || 1200,
          likes: pred.predictedLikes || 150,
          shares: pred.predictedShares || 80,
          readTime: 4
        },
        explanationText: 'متوقع أن يكون من أكثر المحتوى تفاعلاً'
      })) || [];
    } catch (error) {
      return [];
    }
  };

  const generateContextualRecommendations = async (context: string): Promise<GenerativeRecommendation[]> => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    let timeContext = 'evening';
    
    if (hour >= 6 && hour < 12) timeContext = 'morning';
    else if (hour >= 12 && hour < 17) timeContext = 'afternoon';
    else if (hour >= 17 && hour < 22) timeContext = 'evening';
    else timeContext = 'night';

    const prompt = spark.llmPrompt`
      بناءً على الوقت الحالي (${timeContext}) والسياق التالي، قدم توصيات مناسبة:
      
      السياق: ${context}
      الحالة المزاجية: ${userPersona.currentMood}
      الوقت: ${timeContext}
      
      المقالات المتاحة: ${articles.slice(0, 4).map(a => `"${a.title}"`).join(', ')}
      
      قدم توصيات مناسبة للوقت والحالة المزاجية بصيغة JSON.
    `;
    
    try {
      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(result);
      
      return parsed.contextual?.map((ctx: any, index: number) => ({
        id: `contextual_${index}_${Date.now()}`,
        type: 'contextual' as const,
        articleId: articles[index]?.id || articles[0].id,
        score: ctx.relevanceScore || 0.75,
        confidence: 0.8,
        reasoning: ctx.reasoning || 'مناسب للوقت والحالة المزاجية',
        personalizedTitle: ctx.title || articles[index]?.title || '',
        personalizedExcerpt: ctx.excerpt || articles[index]?.excerpt || '',
        timeSlot: timeContext as any,
        emotionalTone: ctx.tone || userPersona.currentMood,
        aiGeneratedTags: ctx.tags || [timeContext],
        predictedEngagement: {
          views: 900,
          likes: 100,
          shares: 50,
          readTime: ctx.readTime || 4
        },
        explanationText: `مناسب لوقت ${timeContext === 'morning' ? 'الصباح' : timeContext === 'afternoon' ? 'الظهيرة' : timeContext === 'evening' ? 'المساء' : 'الليل'}`
      })) || [];
    } catch (error) {
      return [];
    }
  };

  const rankAndDiversifyRecommendations = async (recommendations: GenerativeRecommendation[]): Promise<GenerativeRecommendation[]> => {
    // Apply AI-based ranking algorithm
    const rankedRecommendations = recommendations.map(rec => ({
      ...rec,
      finalScore: (
        rec.score * aiConfig.personalizedWeight +
        (rec.type === 'trend-prediction' ? 0.9 : 0.5) * aiConfig.trendWeight +
        rec.confidence * 0.2 +
        (rec.timeSlot === getCurrentTimeSlot() ? 0.3 : 0) * aiConfig.timeBasedWeight
      )
    }));

    // Apply diversity and serendipity
    const diversified = applyDiversityAlgorithm(rankedRecommendations);
    
    return diversified.sort((a, b) => b.finalScore - a.finalScore);
  };

  const enhanceWithGenerativeContent = async (recommendations: GenerativeRecommendation[]): Promise<GenerativeRecommendation[]> => {
    if (!aiConfig.useGenerativeEnhancements) return recommendations;
    
    const enhanced = await Promise.all(recommendations.map(async (rec) => {
      try {
        const article = articles.find(a => a.id === rec.articleId);
        if (!article) return rec;

        const prompt = spark.llmPrompt`
          عزز هذا المحتوى للمستخدم:
          
          العنوان الأصلي: ${article.title}
          الملخص الأصلي: ${article.excerpt}
          
          اهتمامات المستخدم: ${userPersona.interests.join(', ')}
          الحالة المزاجية: ${userPersona.currentMood}
          
          قدم:
          1. عنوان شخصي جذاب
          2. ملخص مخصص ومحفز
          3. سبب شخصي للقراءة
          4. كلمات مفتاحية ذكية
          
          بصيغة JSON.
        `;
        
        const result = await spark.llm(prompt, 'gpt-4o-mini', true);
        const parsed = JSON.parse(result);
        
        return {
          ...rec,
          personalizedTitle: parsed.personalizedTitle || rec.personalizedTitle,
          personalizedExcerpt: parsed.personalizedExcerpt || rec.personalizedExcerpt,
          explanationText: parsed.personalReason || rec.explanationText,
          aiGeneratedTags: [...rec.aiGeneratedTags, ...(parsed.smartTags || [])]
        };
      } catch (error) {
        return rec;
      }
    }));
    
    return enhanced;
  };

  const calculateBasicContentScore = (article: Article): number => {
    let score = 0;
    
    // Category match
    if (userPersona.interests.includes(article.category?.name || '')) {
      score += 0.4;
    }
    
    // Engagement metrics
    const analytics = article.analytics;
    if (analytics) {
      score += Math.min(analytics.views / 1000, 0.3);
      score += Math.min(analytics.likes / 100, 0.2);
      score += Math.min(analytics.shares / 50, 0.1);
    }
    
    return Math.min(score, 1);
  };

  const getCurrentTimeSlot = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const applyDiversityAlgorithm = (recommendations: GenerativeRecommendation[]): GenerativeRecommendation[] => {
    // Simple diversity algorithm - ensure category distribution
    const categoryCount: { [key: string]: number } = {};
    const diversified: GenerativeRecommendation[] = [];
    
    for (const rec of recommendations) {
      const article = articles.find(a => a.id === rec.articleId);
      const category = article?.category?.name || 'other';
      
      if ((categoryCount[category] || 0) < 3) {
        diversified.push(rec);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }
    
    return diversified;
  };

  const renderRecommendationCard = (rec: GenerativeRecommendation) => {
    const article = articles.find(a => a.id === rec.articleId);
    if (!article) return null;

    const typeLabels = {
      'content-based': 'محتوى مناسب',
      'collaborative': 'توصية جماعية',
      'hybrid': 'توصية مختلطة',
      'trend-prediction': 'توقع رائج',
      'contextual': 'مناسب للوقت'
    };

    const emotionLabels = {
      'informative': 'معلوماتي',
      'inspiring': 'ملهم',
      'urgent': 'عاجل',
      'entertaining': 'ترفيهي',
      'analytical': 'تحليلي'
    };

    return (
      <Card key={rec.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {typeLabels[rec.type]}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {Math.round(rec.score * 100)}%
                </Badge>
              </div>
              <Badge 
                variant={rec.confidence > 0.8 ? 'default' : 'secondary'}
                className="gap-1"
              >
                <Brain className="h-3 w-3" />
                ثقة {Math.round(rec.confidence * 100)}%
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg line-clamp-2 text-primary">
                {rec.personalizedTitle}
              </h3>
              
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {rec.personalizedExcerpt}
              </p>
            </div>

            {/* AI Insights */}
            <div className="bg-accent/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-accent" />
                لماذا هذا المحتوى؟
              </div>
              <p className="text-sm text-muted-foreground">{rec.explanationText}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>أفضل وقت: {rec.timeSlot === 'morning' ? 'صباحاً' : rec.timeSlot === 'afternoon' ? 'ظهراً' : rec.timeSlot === 'evening' ? 'مساءً' : 'ليلاً'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>النبرة: {emotionLabels[rec.emotionalTone]}</span>
              </div>
            </div>

            {/* Predicted Engagement */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded">
                <Eye className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="font-medium">{rec.predictedEngagement.views}</div>
                <div className="text-muted-foreground">مشاهدة</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <ThumbsUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <div className="font-medium">{rec.predictedEngagement.likes}</div>
                <div className="text-muted-foreground">إعجاب</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <Share2 className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                <div className="font-medium">{rec.predictedEngagement.shares}</div>
                <div className="text-muted-foreground">مشاركة</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <Clock className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                <div className="font-medium">{rec.predictedEngagement.readTime}د</div>
                <div className="text-muted-foreground">قراءة</div>
              </div>
            </div>

            {/* AI Generated Tags */}
            {rec.aiGeneratedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {rec.aiGeneratedTags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Button */}
            <Button 
              className="w-full gap-2"
              onClick={() => onArticleSelect(article)}
            >
              قراءة المقال
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const generateContextualQuery = async () => {
    if (!currentQuery.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = spark.llmPrompt`
        المستخدم يبحث عن: "${currentQuery}"
        
        بناءً على:
        - اهتماماته: ${userPersona.interests.join(', ')}
        - حالته المزاجية: ${userPersona.currentMood}
        - الوقت الحالي: ${getCurrentTimeSlot()}
        
        قدم توصيات محتوى مخصصة تماماً لهذا الطلب من المقالات المتاحة:
        ${articles.slice(0, 8).map(a => `"${a.title}" - ${a.category?.name}`).join('\n')}
        
        اعط نتائج بصيغة JSON مع توضيح مفصل لكل توصية.
      `;
      
      const result = await spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(result);
      
      if (parsed.recommendations) {
        const contextualRecs: GenerativeRecommendation[] = parsed.recommendations.map((rec: any, idx: number) => ({
          id: `query_${idx}_${Date.now()}`,
          type: 'contextual',
          articleId: articles.find(a => a.title.includes(rec.matchedTitle?.split(' ')[0]))?.id || articles[idx]?.id || articles[0].id,
          score: rec.relevanceScore || 0.8,
          confidence: 0.9,
          reasoning: rec.reasoning || 'استجابة للاستعلام',
          personalizedTitle: rec.personalizedTitle || rec.title,
          personalizedExcerpt: rec.personalizedExcerpt || rec.excerpt,
          timeSlot: getCurrentTimeSlot() as any,
          emotionalTone: rec.tone || 'informative',
          aiGeneratedTags: rec.tags || [currentQuery],
          predictedEngagement: {
            views: 1000,
            likes: 120,
            shares: 60,
            readTime: 5
          },
          explanationText: rec.explanation || `نتيجة بحث عن: ${currentQuery}`
        }));
        
        setRecommendations(contextualRecs);
        toast.success('تم إنتاج توصيات مخصصة للاستعلام');
      }
    } catch (error) {
      toast.error('خطأ في إنتاج التوصيات للاستعلام');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [aiConfig, userPersona]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              نظام التوصيات بالذكاء الاصطناعي التوليدي
            </h1>
            <p className="text-muted-foreground">محرك توصيات متقدم مدعوم بـ GPT للمحتوى المخصص</p>
          </div>
        </div>
        
        <Button 
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="gap-2 bg-gradient-to-r from-primary to-accent"
        >
          {isGenerating ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="h-5 w-5" />
          )}
          إنتاج توصيات جديدة
        </Button>
      </div>

      {/* Contextual Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            استعلام ذكي مخصص
          </CardTitle>
          <CardDescription>
            اطلب محتوى محدد وسنولد لك توصيات مخصصة بالذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="مثال: أريد مقالات ملهمة عن التكنولوجيا..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateContextualQuery} disabled={isGenerating || !currentQuery.trim()}>
              بحث ذكي
            </Button>
          </div>
          
          <Textarea
            placeholder="سياق إضافي أو تفضيلات خاصة (اختياري)"
            value={contextualPrompt}
            onChange={(e) => setContextualPrompt(e.target.value)}
            rows={2}
          />
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recommendations">التوصيات الذكية</TabsTrigger>
          <TabsTrigger value="persona">الشخصية الرقمية</TabsTrigger>
          <TabsTrigger value="config">إعدادات الذكاء الاصطناعي</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات متقدمة</TabsTrigger>
          <TabsTrigger value="insights">رؤى الذكاء الاصطناعي</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد توصيات متاحة</h3>
              <p className="text-muted-foreground mb-4">اضغط على "إنتاج توصيات جديدة" للبدء</p>
              <Button onClick={generateRecommendations} disabled={isGenerating}>
                إنتاج التوصيات
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(renderRecommendationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="persona" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                الشخصية الرقمية للمستخدم
              </CardTitle>
              <CardDescription>
                خصص ملفك الشخصي لتحسين دقة التوصيات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">الاهتمامات الرئيسية</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['سياسة', 'تقنية', 'رياضة', 'اقتصاد', 'ثقافة', 'صحة', 'علوم', 'فن'].map((interest) => (
                    <Badge
                      key={interest}
                      variant={userPersona.interests.includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => {
                        setUserPersona(prev => ({
                          ...prev,
                          interests: prev.interests.includes(interest)
                            ? prev.interests.filter(i => i !== interest)
                            : [...prev.interests, interest]
                        }));
                      }}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">الحالة المزاجية الحالية</Label>
                <div className="flex gap-2 mt-3">
                  {[
                    { value: 'curious', label: 'فضولي', icon: Search },
                    { value: 'focused', label: 'متركز', icon: Target },
                    { value: 'relaxed', label: 'مسترخي', icon: Heart },
                    { value: 'urgent', label: 'متعجل', icon: Zap },
                    { value: 'exploratory', label: 'استكشافي', icon: Globe }
                  ].map((mood) => (
                    <Button
                      key={mood.value}
                      variant={userPersona.currentMood === mood.value ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={() => {
                        setUserPersona(prev => ({
                          ...prev,
                          currentMood: mood.value as any
                        }));
                      }}
                    >
                      <mood.icon className="h-4 w-4" />
                      {mood.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">التفضيلات العاطفية</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['inspiring', 'informative', 'entertaining', 'analytical', 'urgent'].map((pref) => (
                    <Badge
                      key={pref}
                      variant={userPersona.emotionalPreferences.includes(pref) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserPersona(prev => ({
                          ...prev,
                          emotionalPreferences: prev.emotionalPreferences.includes(pref)
                            ? prev.emotionalPreferences.filter(p => p !== pref)
                            : [...prev.emotionalPreferences, pref]
                        }));
                      }}
                    >
                      {pref === 'inspiring' && 'ملهم'}
                      {pref === 'informative' && 'معلوماتي'}
                      {pref === 'entertaining' && 'ترفيهي'}
                      {pref === 'analytical' && 'تحليلي'}
                      {pref === 'urgent' && 'عاجل'}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات محرك الذكاء الاصطناعي
              </CardTitle>
              <CardDescription>
                تخصيص خوارزميات التوصية والذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>وزن التخصيص الشخصي ({Math.round(aiConfig.personalizedWeight * 100)}%)</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={aiConfig.personalizedWeight * 100}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        personalizedWeight: parseInt(e.target.value) / 100
                      }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>وزن التنوع ({Math.round(aiConfig.diversityWeight * 100)}%)</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={aiConfig.diversityWeight * 100}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        diversityWeight: parseInt(e.target.value) / 100
                      }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>وزن الحداثة ({Math.round(aiConfig.noveltyWeight * 100)}%)</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={aiConfig.noveltyWeight * 100}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        noveltyWeight: parseInt(e.target.value) / 100
                      }))}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>وزن الاتجاهات ({Math.round(aiConfig.trendWeight * 100)}%)</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={aiConfig.trendWeight * 100}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        trendWeight: parseInt(e.target.value) / 100
                      }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>وزن التوقيت ({Math.round(aiConfig.timeBasedWeight * 100)}%)</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={aiConfig.timeBasedWeight * 100}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        timeBasedWeight: parseInt(e.target.value) / 100
                      }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>عدد التوصيات القصوى</Label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={aiConfig.maxRecommendations}
                      onChange={(e) => setAiConfig(prev => ({
                        ...prev,
                        maxRecommendations: parseInt(e.target.value)
                      }))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">ميزات متقدمة</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">التحسينات التوليدية</Label>
                    <p className="text-sm text-muted-foreground">تخصيص العناوين والملخصات بالذكاء الاصطناعي</p>
                  </div>
                  <Switch
                    checked={aiConfig.useGenerativeEnhancements}
                    onCheckedChange={(checked) => setAiConfig(prev => ({
                      ...prev,
                      useGenerativeEnhancements: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">التكيف اللحظي</Label>
                    <p className="text-sm text-muted-foreground">تحديث التوصيات بناء على السلوك الحالي</p>
                  </div>
                  <Switch
                    checked={aiConfig.enableRealtimeAdaptation}
                    onCheckedChange={(checked) => setAiConfig(prev => ({
                      ...prev,
                      enableRealtimeAdaptation: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">عنصر المفاجأة</Label>
                    <p className="text-sm text-muted-foreground">إضافة محتوى غير متوقع لتوسيع الآفاق</p>
                  </div>
                  <Switch
                    checked={aiConfig.enableSerendipity}
                    onCheckedChange={(checked) => setAiConfig(prev => ({
                      ...prev,
                      enableSerendipity: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Cpu className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">دقة الذكاء الاصطناعي</p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">معدل النقر على التوصيات</p>
                    <p className="text-2xl font-bold">18.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">متوسط وقت القراءة</p>
                    <p className="text-2xl font-bold">4.8 د</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">رضا المستخدمين</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>أداء أنواع التوصيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'محتوى مناسب', score: 89, color: 'bg-blue-500' },
                  { type: 'توصية جماعية', score: 76, color: 'bg-green-500' },
                  { type: 'توقع رائج', score: 82, color: 'bg-purple-500' },
                  { type: 'مناسب للوقت', score: 94, color: 'bg-orange-500' }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{item.type}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                رؤى الذكاء الاصطناعي
              </CardTitle>
              <CardDescription>
                تحليلات متقدمة وتوصيات لتحسين الأداء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900">اتجاه مكتشف</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        المستخدمون يفضلون المقالات التقنية في ساعات المساء بنسبة 67% أكثر من الصباح
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-900">توصية للتحسين</h4>
                      <p className="text-green-700 text-sm mt-1">
                        إضافة المزيد من المحتوى الملهم قد يزيد من معدل التفاعل بنسبة 23%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-purple-900">تحليل سلوكي</h4>
                      <p className="text-purple-700 text-sm mt-1">
                        المستخدمون الذين يقرأون مقالات التقنية يميلون لقراءة مقالات العلوم بنسبة 78%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-start gap-3">
                    <ChartLine className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-orange-900">توقع أداء</h4>
                      <p className="text-orange-700 text-sm mt-1">
                        المقالات المنشورة بين 7-9 مساءً تحقق تفاعلاً أعلى بـ 45% من المعدل العام
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}