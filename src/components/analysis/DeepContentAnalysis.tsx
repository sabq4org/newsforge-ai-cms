import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EntityNetwork } from './EntityNetwork';
import { 
  Brain, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Network, 
  Heart,
  MapPin,
  Building,
  User,
  Link as LinkIcon,
  Sparkles,
  Edit3,
  Save,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';

interface Entity {
  name: string;
  type: 'person' | 'location' | 'organization' | 'event' | 'concept';
  confidence: number;
  mentions: number;
  context?: string;
}

interface Relationship {
  from: string;
  to: string;
  type: 'related' | 'opposes' | 'supports' | 'located_in' | 'works_for';
  strength: number;
}

interface DeepAnalysisResult {
  id: string;
  articleId: string;
  summary: {
    mainTopic: string;
    keyPoints: string[];
    centralQuestion: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
  };
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    emotions: Array<{
      emotion: string;
      intensity: number;
    }>;
    tone: 'formal' | 'informal' | 'urgent' | 'analytical' | 'opinion';
  };
  entities: Entity[];
  relationships: Relationship[];
  insights: {
    readabilityScore: number;
    biasIndicators: string[];
    factualityFlags: string[];
    suggestedImprovements: string[];
  };
  connections: {
    relatedArticles: string[];
    historicalContext: string[];
    followUpQuestions: string[];
  };
  humanReview?: {
    editorNotes: string;
    approvalStatus: 'pending' | 'approved' | 'needs_revision';
    lastReviewedBy: string;
    lastReviewedAt: Date;
  };
  aceIntegration?: {
    status: 'connected' | 'disconnected' | 'processing';
    results?: any;
    lastSyncAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface DeepContentAnalysisProps {
  article?: Article;
  onAnalysisComplete?: (analysis: DeepAnalysisResult) => void;
}

export function DeepContentAnalysis({ article, onAnalysisComplete }: DeepContentAnalysisProps) {
  const [analysisResults, setAnalysisResults] = useKV<DeepAnalysisResult[]>('deep-analysis-results', []);
  const [currentAnalysis, setCurrentAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editorNotes, setEditorNotes] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Find existing analysis for current article
  useEffect(() => {
    if (article) {
      const existing = analysisResults.find(a => a.articleId === article.id);
      setCurrentAnalysis(existing || null);
      if (existing?.humanReview?.editorNotes) {
        setEditorNotes(existing.humanReview.editorNotes);
      }
    }
  }, [article, analysisResults]);

  const performDeepAnalysis = async () => {
    if (!article) {
      toast.error('يرجى اختيار مقال للتحليل');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Step 1: Content Summary Analysis
      setAnalysisProgress(20);
      const summaryPrompt = spark.llmPrompt`
        قم بتحليل المقال التالي وأعطني:
        1. الموضوع الرئيسي
        2. النقاط الأساسية (3-5 نقاط)
        3. السؤال المحوري للمقال
        4. مستوى الأهمية (منخفض/متوسط/عالي/حرج)

        المقال:
        العنوان: ${article.title}
        المحتوى: ${article.content}
      `;
      
      const summaryResult = await spark.llm(summaryPrompt, 'gpt-4o', true);
      const summary = JSON.parse(summaryResult);

      // Step 2: Sentiment and Tone Analysis
      setAnalysisProgress(40);
      const sentimentPrompt = spark.llmPrompt`
        حلل المشاعر والنبرة في النص التالي:
        ${article.content}
        
        أريد:
        1. المشاعر العامة (إيجابي/سلبي/محايد/مختلط)
        2. العواطف المحددة مع شدتها (0-1)
        3. نبرة الكتابة (رسمي/غير رسمي/عاجل/تحليلي/رأي)
      `;
      
      const sentimentResult = await spark.llm(sentimentPrompt, 'gpt-4o', true);
      const sentiment = JSON.parse(sentimentResult);

      // Step 3: Entity Extraction
      setAnalysisProgress(60);
      const entitiesPrompt = spark.llmPrompt`
        استخرج الكيانات المهمة من النص التالي وصنفها:
        ${article.content}
        
        الكيانات: الأشخاص، الأماكن، المنظمات، الأحداث، المفاهيم
        لكل كيان، أعطني: الاسم، النوع، مستوى الثقة، عدد المرات المذكورة، السياق
      `;
      
      const entitiesResult = await spark.llm(entitiesPrompt, 'gpt-4o', true);
      const entities = JSON.parse(entitiesResult);

      // Step 4: Relationship Analysis
      setAnalysisProgress(80);
      const relationshipsPrompt = spark.llmPrompt`
        حدد العلاقات بين الكيانات في النص:
        ${article.content}
        
        أنواع العلاقات: مرتبط، يعارض، يدعم، يقع في، يعمل لدى
        لكل علاقة: من، إلى، نوع العلاقة، قوة العلاقة (0-1)
      `;
      
      const relationshipsResult = await spark.llm(relationshipsPrompt, 'gpt-4o', true);
      const relationships = JSON.parse(relationshipsResult);

      // Step 5: Quality Insights
      setAnalysisProgress(90);
      const insightsPrompt = spark.llmPrompt`
        قيم جودة النص التالي:
        ${article.content}
        
        أعطني:
        1. درجة سهولة القراءة (0-100)
        2. مؤشرات التحيز المحتملة
        3. علامات تحتاج تحقق من الحقائق
        4. اقتراحات للتحسين
      `;
      
      const insightsResult = await spark.llm(insightsPrompt, 'gpt-4o', true);
      const insights = JSON.parse(insightsResult);

      // Step 6: Connections and Context
      setAnalysisProgress(95);
      const connectionsPrompt = spark.llmPrompt`
        اقترح روابط وسياق للمقال:
        ${article.title}
        
        أريد:
        1. مواضيع مشابهة قد تكون مرتبطة
        2. السياق التاريخي المحتمل
        3. أسئلة متابعة مهمة (3-5 أسئلة)
      `;
      
      const connectionsResult = await spark.llm(connectionsPrompt, 'gpt-4o', true);
      const connections = JSON.parse(connectionsResult);

      const newAnalysis: DeepAnalysisResult = {
        id: `analysis_${Date.now()}`,
        articleId: article.id,
        summary,
        sentiment,
        entities,
        relationships,
        insights,
        connections,
        aceIntegration: {
          status: 'disconnected' // Will be implemented when ACE is available
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setAnalysisProgress(100);
      setCurrentAnalysis(newAnalysis);
      
      // Save to storage
      setAnalysisResults(prev => {
        const existingIndex = prev.findIndex(a => a.articleId === article.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newAnalysis;
          return updated;
        }
        return [...prev, newAnalysis];
      });

      onAnalysisComplete?.(newAnalysis);
      toast.success('تم إكمال التحليل العميق بنجاح');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('حدث خطأ أثناء التحليل');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const saveHumanReview = () => {
    if (!currentAnalysis) return;

    const updatedAnalysis = {
      ...currentAnalysis,
      humanReview: {
        editorNotes,
        approvalStatus: 'approved' as const,
        lastReviewedBy: 'Current Editor', // In real app, get from auth context
        lastReviewedAt: new Date()
      },
      updatedAt: new Date()
    };

    setCurrentAnalysis(updatedAnalysis);
    
    setAnalysisResults(prev => 
      prev.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a)
    );

    setEditMode(false);
    toast.success('تم حفظ المراجعة البشرية');
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <User className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'mixed': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!article) {
    return (
      <div className="text-center py-12 space-y-4">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
        <h3 className="text-xl font-semibold">التحليل العميق للمحتوى</h3>
        <p className="text-muted-foreground">اختر مقالاً لبدء التحليل العميق</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التحليل العميق للمحتوى</h1>
          <p className="text-muted-foreground">تحليل شامل مدعوم بالذكاء الاصطناعي</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={performDeepAnalysis}
            disabled={isAnalyzing}
            className="font-arabic"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 ml-2" />
                تحليل عميق
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Article Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">المقال المحدد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-sm text-muted-foreground">
              بواسطة {article.author.name} • {article.category.name}
            </p>
            {article.excerpt && (
              <p className="text-sm">{article.excerpt}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تقدم التحليل</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">الرؤية العامة</TabsTrigger>
            <TabsTrigger value="entities">الكيانات</TabsTrigger>
            <TabsTrigger value="relationships">الترابط</TabsTrigger>
            <TabsTrigger value="sentiment">النبرة</TabsTrigger>
            <TabsTrigger value="insights">الجودة</TabsTrigger>
            <TabsTrigger value="review">المراجعة البشرية</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    الملخص الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">الموضوع الرئيسي</h4>
                    <p className="text-sm">{currentAnalysis.summary.mainTopic}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">السؤال المحوري</h4>
                    <p className="text-sm italic">{currentAnalysis.summary.centralQuestion}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">مستوى الأهمية</h4>
                    <Badge className={getImportanceColor(currentAnalysis.summary.importance)}>
                      {currentAnalysis.summary.importance}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    النقاط الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentAnalysis.summary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  الروابط والسياق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAnalysis.connections.followUpQuestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">أسئلة المتابعة</h4>
                    <ul className="space-y-1">
                      {currentAnalysis.connections.followUpQuestions.map((question, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-6">
            <div className="grid gap-4">
              {currentAnalysis.entities.map((entity, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getEntityIcon(entity.type)}
                        <div>
                          <h4 className="font-semibold">{entity.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {entity.type} • ذُكر {entity.mentions} مرة
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {Math.round(entity.confidence * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">ثقة</p>
                      </div>
                    </div>
                    {entity.context && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {entity.context}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="space-y-6">
            <EntityNetwork 
              entities={currentAnalysis.entities}
              relationships={currentAnalysis.relationships}
            />
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    المشاعر العامة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getSentimentColor(currentAnalysis.sentiment.overall)}`}>
                      {currentAnalysis.sentiment.overall}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      النبرة: {currentAnalysis.sentiment.tone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>العواطف المكتشفة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.sentiment.emotions.map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{emotion.emotion}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={emotion.intensity * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(emotion.intensity * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quality Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    جودة المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">سهولة القراءة</span>
                      <span className="text-sm font-semibold">
                        {currentAnalysis.insights.readabilityScore}/100
                      </span>
                    </div>
                    <Progress value={currentAnalysis.insights.readabilityScore} />
                  </div>

                  {currentAnalysis.insights.biasIndicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        مؤشرات التحيز
                      </h4>
                      <ul className="space-y-1">
                        {currentAnalysis.insights.biasIndicators.map((indicator, index) => (
                          <li key={index} className="text-xs text-muted-foreground">
                            • {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    اقتراحات التحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentAnalysis.insights.suggestedImprovements.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Human Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  المراجعة البشرية
                </CardTitle>
                <CardDescription>
                  أضف ملاحظاتك أو تعديلاتك على نتائج التحليل الآلي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editorNotes}
                      onChange={(e) => setEditorNotes(e.target.value)}
                      placeholder="أضف ملاحظاتك أو تعديلاتك هنا..."
                      rows={6}
                      className="font-arabic"
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveHumanReview}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ المراجعة
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentAnalysis.humanReview ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            {currentAnalysis.humanReview.editorNotes || 'لا توجد ملاحظات'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            آخر مراجعة: {currentAnalysis.humanReview.lastReviewedBy}
                          </span>
                          <span>
                            {currentAnalysis.humanReview.lastReviewedAt.toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>لم تتم المراجعة البشرية بعد</p>
                      </div>
                    )}
                    
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      <Edit3 className="w-4 h-4 ml-2" />
                      {currentAnalysis.humanReview ? 'تعديل المراجعة' : 'إضافة مراجعة'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}