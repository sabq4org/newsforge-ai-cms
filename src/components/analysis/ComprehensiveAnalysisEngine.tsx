import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Network, 
  TrendingUp, 
  Eye, 
  Users, 
  MessageCircle,
  BookOpen,
  Target,
  Lightbulb,
  Search,
  Edit,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { safeDateFormat } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { toast } from 'sonner';

interface AnalysisResult {
  id: string;
  articleId: string;
  timestamp: Date;
  overview: {
    mainTheme: string;
    keyQuestions: string[];
    tone: 'neutral' | 'positive' | 'negative' | 'urgent' | 'analytical';
    complexity: 'simple' | 'moderate' | 'complex';
    readingTime: number;
  };
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    keywords: string[];
  };
  relationships: {
    source: string;
    target: string;
    type: 'related' | 'mentioned' | 'quoted' | 'referenced';
    strength: number;
  }[];
  aiInsights: {
    summary: string;
    strengths: string[];
    improvements: string[];
    relatedTopics: string[];
  };
  humanReview?: {
    editorNotes: string;
    approved: boolean;
    modifications: string[];
    reviewer: string;
    reviewDate: Date;
  };
}

interface ComprehensiveAnalysisEngineProps {
  article?: Article;
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
}

export function ComprehensiveAnalysisEngine({ 
  article, 
  onAnalysisComplete 
}: ComprehensiveAnalysisEngineProps) {
  const { language, user } = useAuth();
  const [analysisResults, setAnalysisResults] = useKV<AnalysisResult[]>('deep-analysis-results', []);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editorNotes, setEditorNotes] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Find existing analysis for current article
  useEffect(() => {
    if (article) {
      const existing = analysisResults.find(a => a.articleId === article.id);
      setCurrentAnalysis(existing || null);
    }
  }, [article, analysisResults]);

  const performAIAnalysis = async () => {
    if (!article) return;

    setIsAnalyzing(true);
    try {
      // Main content analysis
      const analysisPrompt = spark.llmPrompt`
        قم بتحليل هذا المقال الصحفي باللغة العربية وقدم تحليلاً شاملاً:

        العنوان: ${article.title}
        المحتوى: ${article.content}
        القسم: ${article.category?.name || 'غير محدد'}

        المطلوب:
        1. الموضوع الرئيسي والأفكار المحورية
        2. الأسئلة الجوهرية التي يطرحها المقال
        3. نبرة المقال (محايدة، إيجابية، سلبية، عاجلة، تحليلية)
        4. مستوى التعقيد (بسيط، متوسط، معقد)
        5. استخراج الأشخاص والمؤسسات والأماكن المذكورة
        6. الكلمات المفتاحية الأساسية
        7. نقاط القوة في المقال
        8. اقتراحات للتحسين
        9. مواضيع مرتبطة قد تهم القارئ

        اجعل التحليل باللغة العربية ومفصلاً.
      `;

      const analysisResult = await spark.llm(analysisPrompt, 'gpt-4o', true);
      const parsedAnalysis = JSON.parse(analysisResult);

      // Extract entities
      const entitiesPrompt = spark.llmPrompt`
        من النص التالي، استخرج الكيانات بدقة:
        ${article.content}

        استخرج:
        - الأشخاص (أسماء الأشخاص المذكورة)
        - المؤسسات (الشركات، الحكومات، المنظمات)
        - الأماكن (المدن، البلدان، المواقع)
        - الكلمات المفتاحية (المصطلحات المهمة)

        أرجع النتيجة كـ JSON مع مصفوفات منفصلة.
      `;

      const entitiesResult = await spark.llm(entitiesPrompt, 'gpt-4o', true);
      const entities = JSON.parse(entitiesResult);

      // Calculate reading time (average 200 words per minute for Arabic)
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      const newAnalysis: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        articleId: article.id,
        timestamp: new Date(),
        overview: {
          mainTheme: parsedAnalysis.mainTheme || 'غير محدد',
          keyQuestions: parsedAnalysis.keyQuestions || [],
          tone: parsedAnalysis.tone || 'neutral',
          complexity: parsedAnalysis.complexity || 'moderate',
          readingTime
        },
        entities: {
          people: entities.people || [],
          organizations: entities.organizations || [],
          locations: entities.locations || [],
          keywords: entities.keywords || []
        },
        relationships: [], // Would be calculated based on entity co-occurrence
        aiInsights: {
          summary: parsedAnalysis.summary || '',
          strengths: parsedAnalysis.strengths || [],
          improvements: parsedAnalysis.improvements || [],
          relatedTopics: parsedAnalysis.relatedTopics || []
        }
      };

      // Save analysis
      setAnalysisResults(current => {
        const filtered = current.filter(a => a.articleId !== article.id);
        return [...filtered, newAnalysis];
      });

      setCurrentAnalysis(newAnalysis);
      onAnalysisComplete?.(newAnalysis);
      
      toast.success(language.code === 'ar' ? 'تم إكمال التحليل العميق' : 'Deep analysis completed');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(language.code === 'ar' ? 'فشل في التحليل' : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveHumanReview = () => {
    if (!currentAnalysis || !user) return;

    const updatedAnalysis = {
      ...currentAnalysis,
      humanReview: {
        editorNotes,
        approved: true,
        modifications: [],
        reviewer: user.name,
        reviewDate: new Date()
      }
    };

    setAnalysisResults(current => 
      current.map(a => a.id === currentAnalysis.id ? updatedAnalysis : a)
    );

    setCurrentAnalysis(updatedAnalysis);
    setIsEditMode(false);
    toast.success(language.code === 'ar' ? 'تم حفظ المراجعة' : 'Review saved');
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'analytical': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'complex': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  if (!article) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {language.code === 'ar' ? 'محرك التحليل العميق' : 'Deep Analysis Engine'}
          </h3>
          <p className="text-muted-foreground">
            {language.code === 'ar' ? 'اختر مقالاً لبدء التحليل العميق' : 'Select an article to start deep analysis'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            {language.code === 'ar' ? 'التحليل العميق' : 'Deep Analysis'}
          </h2>
          <p className="text-muted-foreground">
            {article.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {language.code === 'ar' ? 'مراجعة بشرية' : 'Human Review'}
            </Button>
          )}
          
          <Button
            onClick={performAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing 
              ? (language.code === 'ar' ? 'جاري التحليل...' : 'Analyzing...') 
              : (language.code === 'ar' ? 'تحليل بالذكاء الاصطناعي' : 'AI Analysis')
            }
          </Button>
        </div>
      </div>

      {currentAnalysis ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {language.code === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              {language.code === 'ar' ? 'الكيانات' : 'Entities'}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {language.code === 'ar' ? 'الرؤى' : 'Insights'}
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {language.code === 'ar' ? 'المراجعة' : 'Review'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language.code === 'ar' ? 'الموضوع الرئيسي' : 'Main Theme'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{currentAnalysis.overview.mainTheme}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {getComplexityIcon(currentAnalysis.overview.complexity)}
                    {language.code === 'ar' ? 'مستوى التعقيد' : 'Complexity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">
                    {language.code === 'ar' 
                      ? (currentAnalysis.overview.complexity === 'simple' ? 'بسيط' : 
                         currentAnalysis.overview.complexity === 'complex' ? 'معقد' : 'متوسط')
                      : currentAnalysis.overview.complexity
                    }
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language.code === 'ar' ? 'النبرة' : 'Tone'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getToneColor(currentAnalysis.overview.tone)}>
                    {language.code === 'ar' 
                      ? (currentAnalysis.overview.tone === 'positive' ? 'إيجابية' :
                         currentAnalysis.overview.tone === 'negative' ? 'سلبية' :
                         currentAnalysis.overview.tone === 'urgent' ? 'عاجلة' :
                         currentAnalysis.overview.tone === 'analytical' ? 'تحليلية' : 'محايدة')
                      : currentAnalysis.overview.tone
                    }
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {language.code === 'ar' ? 'الأسئلة الجوهرية' : 'Key Questions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentAnalysis.overview.keyQuestions.map((question, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground mt-1">{index + 1}.</span>
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {language.code === 'ar' ? 'الأشخاص' : 'People'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.entities.people.map((person, index) => (
                      <Badge key={index} variant="secondary">{person}</Badge>
                    ))}
                    {currentAnalysis.entities.people.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {language.code === 'ar' ? 'لم يتم ذكر أشخاص محددين' : 'No specific people mentioned'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    {language.code === 'ar' ? 'المؤسسات' : 'Organizations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.entities.organizations.map((org, index) => (
                      <Badge key={index} variant="secondary">{org}</Badge>
                    ))}
                    {currentAnalysis.entities.organizations.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {language.code === 'ar' ? 'لم يتم ذكر مؤسسات محددة' : 'No specific organizations mentioned'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {language.code === 'ar' ? 'الأماكن' : 'Locations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.entities.locations.map((location, index) => (
                      <Badge key={index} variant="secondary">{location}</Badge>
                    ))}
                    {currentAnalysis.entities.locations.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {language.code === 'ar' ? 'لم يتم ذكر أماكن محددة' : 'No specific locations mentioned'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    {language.code === 'ar' ? 'الكلمات المفتاحية' : 'Keywords'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.entities.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language.code === 'ar' ? 'ملخص ذكي' : 'AI Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{currentAnalysis.aiInsights.summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    {language.code === 'ar' ? 'نقاط القوة' : 'Strengths'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAnalysis.aiInsights.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <p className="text-sm">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Lightbulb className="w-5 h-5" />
                    {language.code === 'ar' ? 'اقتراحات التحسين' : 'Improvements'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAnalysis.aiInsights.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                        <p className="text-sm">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {language.code === 'ar' ? 'مواضيع مرتبطة' : 'Related Topics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.aiInsights.relatedTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-accent">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {isEditMode ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    {language.code === 'ar' ? 'مراجعة بشرية' : 'Human Review'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="editorNotes">
                      {language.code === 'ar' ? 'ملاحظات المحرر' : 'Editor Notes'}
                    </Label>
                    <Textarea
                      id="editorNotes"
                      value={editorNotes}
                      onChange={(e) => setEditorNotes(e.target.value)}
                      placeholder={language.code === 'ar' 
                        ? 'أضف ملاحظاتك حول التحليل...' 
                        : 'Add your notes about the analysis...'
                      }
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={saveHumanReview}>
                      <Save className="w-4 h-4 mr-2" />
                      {language.code === 'ar' ? 'حفظ المراجعة' : 'Save Review'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      {language.code === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {language.code === 'ar' ? 'حالة المراجعة' : 'Review Status'}
                    </span>
                    {currentAnalysis.humanReview && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {language.code === 'ar' ? 'تمت المراجعة' : 'Reviewed'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAnalysis.humanReview ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {language.code === 'ar' ? 'ملاحظات المحرر:' : 'Editor Notes:'}
                        </p>
                        <p className="text-sm mt-1">{currentAnalysis.humanReview.editorNotes}</p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {language.code === 'ar' ? 'المراجع:' : 'Reviewer:'} {currentAnalysis.humanReview.reviewer}
                        </span>
                        <span>
                          {safeDateFormat(
                            currentAnalysis.humanReview.reviewDate,
                            language.code === 'ar' ? 'ar-SA' : 'en-US'
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {language.code === 'ar' 
                          ? 'لم تتم مراجعة هذا التحليل بعد من قبل محرر بشري.'
                          : 'This analysis has not been reviewed by a human editor yet.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {language.code === 'ar' ? 'ابدأ التحليل العميق' : 'Start Deep Analysis'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language.code === 'ar' 
                ? 'انقر على "تحليل بالذكاء الاصطناعي" لبدء التحليل العميق للمقال'
                : 'Click "AI Analysis" to start deep analysis of this article'
              }
            </p>
            <Button onClick={performAIAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing 
                ? (language.code === 'ar' ? 'جاري التحليل...' : 'Analyzing...') 
                : (language.code === 'ar' ? 'تحليل بالذكاء الاصطناعي' : 'AI Analysis')
              }
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}