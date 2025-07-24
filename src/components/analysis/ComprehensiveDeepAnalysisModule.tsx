import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Network, 
  TrendUp, 
  Eye, 
  Users, 
  MessageCircle,
  BookOpen,
  Target,
  Lightbulb,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  FileText,
  Hash,
  MapPin,
  User,
  Calendar
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { Article } from '@/types';
import { toast } from 'sonner';

interface AnalysisResult {
  id: string;
  articleId: string;
  articleTitle: string;
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

interface DeepAnalysisModuleProps {
  article?: Article;
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
  onArticleSelect?: (article: Article) => void;
}

export function ComprehensiveDeepAnalysisModule({ 
  article, 
  onAnalysisComplete,
  onArticleSelect 
}: DeepAnalysisModuleProps) {
  const { language, user } = useAuth();
  const [analysisResults, setAnalysisResults] = useKV<AnalysisResult[]>('deep-analysis-results', []);
  const [articles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isArabic = language.code === 'ar';

  // Calculate statistics
  const stats = {
    totalAnalyses: analysisResults.length,
    todayAnalyses: analysisResults.filter(a => {
      const today = new Date().toDateString();
      const analysisDate = new Date(a.timestamp).toDateString();
      return analysisDate === today;
    }).length,
    weekAnalyses: analysisResults.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.timestamp) >= weekAgo;
    }).length,
    averageComplexity: analysisResults.length > 0 
      ? analysisResults.reduce((sum, a) => {
          const complexityScore = a.overview.complexity === 'simple' ? 1 : 
                                 a.overview.complexity === 'moderate' ? 2 : 3;
          return sum + complexityScore;
        }, 0) / analysisResults.length 
      : 0,
    mostCommonTone: analysisResults.length > 0 
      ? analysisResults.reduce((acc, curr) => {
          acc[curr.overview.tone] = (acc[curr.overview.tone] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {},
    topKeywords: analysisResults.flatMap(a => a.entities.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  };

  // Find existing analysis for current article
  useEffect(() => {
    if (article) {
      const existing = analysisResults.find(a => a.articleId === article.id);
      setCurrentAnalysis(existing || null);
    }
  }, [article, analysisResults]);

  const performAIAnalysis = async (targetArticle?: Article) => {
    const analysisTarget = targetArticle || article;
    if (!analysisTarget) return;

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with realistic processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      const prompt = spark.llmPrompt`
        Analyze this Arabic news article in depth:
        
        Title: ${analysisTarget.title}
        Content: ${analysisTarget.content || analysisTarget.excerpt}
        
        Please provide:
        1. Main theme and central message
        2. Key questions raised by this content
        3. Tone analysis (neutral/positive/negative/urgent/analytical)
        4. Complexity level (simple/moderate/complex)
        5. Extract entities: people, organizations, locations, keywords
        6. Provide insights: summary, strengths, potential improvements, related topics
        
        Respond in ${isArabic ? 'Arabic' : 'English'}.
      `;

      const aiResponse = await spark.llm(prompt, 'gpt-4o', true);
      const analysis = JSON.parse(aiResponse);

      const newAnalysis: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        articleId: analysisTarget.id,
        articleTitle: analysisTarget.title,
        timestamp: new Date(),
        overview: {
          mainTheme: analysis.mainTheme || 'Theme analysis in progress',
          keyQuestions: analysis.keyQuestions || [],
          tone: analysis.tone || 'neutral',
          complexity: analysis.complexity || 'moderate',
          readingTime: Math.ceil((analysisTarget.content?.length || 0) / 200)
        },
        entities: {
          people: analysis.entities?.people || [],
          organizations: analysis.entities?.organizations || [],
          locations: analysis.entities?.locations || [],
          keywords: analysis.entities?.keywords || []
        },
        relationships: analysis.relationships || [],
        aiInsights: {
          summary: analysis.insights?.summary || 'Summary being generated...',
          strengths: analysis.insights?.strengths || [],
          improvements: analysis.insights?.improvements || [],
          relatedTopics: analysis.insights?.relatedTopics || []
        }
      };

      setAnalysisResults(prev => {
        const filtered = prev.filter(a => a.articleId !== analysisTarget.id);
        return [...filtered, newAnalysis];
      });

      setCurrentAnalysis(newAnalysis);
      onAnalysisComplete?.(newAnalysis);
      toast.success(isArabic ? 'تم إكمال التحليل العميق' : 'Deep analysis completed');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(isArabic ? 'خطأ في التحليل' : 'Analysis error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredAnalyses = analysisResults.filter(analysis => {
    const matchesSearch = analysis.articleTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'recent' && new Date(analysis.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (statusFilter === 'approved' && analysis.humanReview?.approved) ||
      (statusFilter === 'pending' && !analysis.humanReview);
    
    return matchesSearch && matchesStatus;
  });

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'analytical': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getToneText = (tone: string) => {
    if (isArabic) {
      switch (tone) {
        case 'positive': return 'إيجابي';
        case 'negative': return 'سلبي';
        case 'urgent': return 'عاجل';
        case 'analytical': return 'تحليلي';
        default: return 'محايد';
      }
    }
    return tone.charAt(0).toUpperCase() + tone.slice(1);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'التحليل العميق' : 'Deep Analysis'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? 'تحليل شامل ومتقدم للمحتوى الصحفي بالذكاء الاصطناعي' 
              : 'Comprehensive AI-powered content analysis and insights'}
          </p>
        </div>
        <Button 
          onClick={() => performAIAnalysis()} 
          disabled={!article || isAnalyzing}
          className="gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isArabic ? 'تحليل عميق جديد' : 'New Deep Analysis'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="analyses" className="gap-2">
            <Brain className="w-4 h-4" />
            {isArabic ? 'جميع التحليلات' : 'All Analyses'}
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            {isArabic ? 'الرؤى' : 'Insights'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Brain}
              title={isArabic ? 'إجمالي التحليلات' : 'Total Analyses'}
              value={stats.totalAnalyses}
              subtitle={isArabic ? 'تحليل متاح' : 'analyses available'}
            />
            <StatCard
              icon={Clock}
              title={isArabic ? 'اليوم' : 'Today'}
              value={stats.todayAnalyses}
              subtitle={isArabic ? 'تحليل جديد' : 'new analyses'}
            />
            <StatCard
              icon={TrendUp}
              title={isArabic ? 'هذا الأسبوع' : 'This Week'}
              value={stats.weekAnalyses}
              subtitle={isArabic ? 'تحليل' : 'analyses'}
            />
            <StatCard
              icon={Target}
              title={isArabic ? 'التعقيد المتوسط' : 'Avg Complexity'}
              value={stats.averageComplexity.toFixed(1)}
              subtitle={isArabic ? 'من 3.0' : 'out of 3.0'}
            />
          </div>

          {/* Most Common Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                {isArabic ? 'الكلمات المفتاحية الأكثر شيوعاً' : 'Most Common Keywords'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.topKeywords)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 15)
                  .map(([keyword, count]) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <span className="text-xs opacity-70">({count})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {isArabic ? 'التحليلات الأخيرة' : 'Recent Analyses'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResults.slice(0, 5).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{analysis.articleTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.overview.mainTheme} • {new Date(analysis.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getToneColor(analysis.overview.tone)} variant="secondary">
                        {getToneText(analysis.overview.tone)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentAnalysis(analysis)}
                      >
                        {isArabic ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={isArabic ? 'البحث في التحليلات...' : 'Search analyses...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isArabic ? 'جميع التحليلات' : 'All Analyses'}
                    </SelectItem>
                    <SelectItem value="recent">
                      {isArabic ? 'الأخيرة' : 'Recent'}
                    </SelectItem>
                    <SelectItem value="approved">
                      {isArabic ? 'المعتمدة' : 'Approved'}
                    </SelectItem>
                    <SelectItem value="pending">
                      {isArabic ? 'بانتظار المراجعة' : 'Pending Review'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analyses List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setCurrentAnalysis(analysis)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {analysis.articleTitle}
                    </CardTitle>
                    <Badge className={getToneColor(analysis.overview.tone)} variant="secondary">
                      {getToneText(analysis.overview.tone)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {analysis.overview.mainTheme}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Analysis Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{analysis.overview.complexity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{analysis.overview.readingTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Entities Preview */}
                  <div className="space-y-2">
                    {analysis.entities.people.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {analysis.entities.people.slice(0, 3).map((person) => (
                            <Badge key={person} variant="outline" className="text-xs">
                              {person}
                            </Badge>
                          ))}
                          {analysis.entities.people.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{analysis.entities.people.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {analysis.entities.locations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {analysis.entities.locations.slice(0, 2).map((location) => (
                            <Badge key={location} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                          {analysis.entities.locations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{analysis.entities.locations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Status */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {analysis.humanReview?.approved ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={14} />
                          <span className="text-xs">{isArabic ? 'معتمد' : 'Approved'}</span>
                        </div>
                      ) : analysis.humanReview ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle size={14} />
                          <span className="text-xs">{isArabic ? 'تحت المراجعة' : 'Under Review'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock size={14} />
                          <span className="text-xs">{isArabic ? 'بانتظار المراجعة' : 'Pending'}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnalyses.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد تحليلات' : 'No analyses found'}
                </p>
                <Button 
                  onClick={() => performAIAnalysis()} 
                  disabled={!article}
                  className="mt-4"
                >
                  <Plus size={16} />
                  {isArabic ? 'إنشاء أول تحليل' : 'Create first analysis'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {currentAnalysis ? (
            <div className="space-y-6">
              {/* Current Analysis Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {currentAnalysis.articleTitle}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getToneColor(currentAnalysis.overview.tone)} variant="secondary">
                      {getToneText(currentAnalysis.overview.tone)}
                    </Badge>
                    <Badge variant="outline">
                      {currentAnalysis.overview.complexity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{isArabic ? 'الموضوع الرئيسي' : 'Main Theme'}</h4>
                    <p className="text-muted-foreground">{currentAnalysis.overview.mainTheme}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isArabic ? 'الملخص' : 'Summary'}</h4>
                    <p className="text-muted-foreground">{currentAnalysis.aiInsights.summary}</p>
                  </div>

                  {currentAnalysis.overview.keyQuestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">{isArabic ? 'الأسئلة الرئيسية' : 'Key Questions'}</h4>
                      <ul className="space-y-1">
                        {currentAnalysis.overview.keyQuestions.map((question, index) => (
                          <li key={index} className="text-muted-foreground">• {question}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentAnalysis.aiInsights.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">{isArabic ? 'نقاط القوة' : 'Strengths'}</h4>
                      <ul className="space-y-1">
                        {currentAnalysis.aiInsights.strengths.map((strength, index) => (
                          <li key={index} className="text-muted-foreground">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentAnalysis.aiInsights.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-orange-600">{isArabic ? 'اقتراحات التحسين' : 'Improvements'}</h4>
                      <ul className="space-y-1">
                        {currentAnalysis.aiInsights.improvements.map((improvement, index) => (
                          <li key={index} className="text-muted-foreground">• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? 'اختر تحليلاً لعرض الرؤى التفصيلية' : 'Select an analysis to view detailed insights'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}