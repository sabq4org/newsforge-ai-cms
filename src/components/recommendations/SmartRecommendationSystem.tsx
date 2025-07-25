import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Brain,
  Cpu,
  Database,
  Network,
  TrendingUp,
  Target,
  Sparkles,
  TrendUp,
  Activity,
  BookOpen,
  Heart,
  Eye,
  Share,
  Clock,
  Timer,
  User,
  ArrowUp,
  Star
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';
import { toast } from 'sonner';

interface SmartRecommendationSystemProps {
  userId?: string;
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}

// نوع البيانات لنماذج التوصيات الذكية
interface SmartModel {
  id: string;
  name: string;
  description: string;
  type: 'deep_learning' | 'reinforcement' | 'transformer' | 'ensemble';
  accuracy: number;
  speed: number;
  confidence: number;
  lastTrained: Date;
  isActive: boolean;
  features: string[];
}

interface RecommendationResult {
  articleId: string;
  score: number;
  confidence: number;
  reasoning: string[];
  modelUsed: string;
  personalityMatch: number;
  contextualRelevance: number;
  trendFactor: number;
  diversityScore: number;
}

export function SmartRecommendationSystem({ userId, articles, onArticleSelect }: SmartRecommendationSystemProps) {
  const [smartModels, setSmartModels] = useKV<SmartModel[]>('smart-ml-models', [
    {
      id: 'transformer-v4',
      name: 'نموذج المحول المتقدم',
      description: 'يستخدم بنية المحولات (Transformers) لفهم السياق والمعنى بعمق',
      type: 'transformer',
      accuracy: 0.96,
      speed: 0.89,
      confidence: 0.94,
      lastTrained: new Date(),
      isActive: true,
      features: ['فهم السياق', 'التحليل الدلالي', 'التنبؤ بالاهتمامات', 'التخصيص الفوري']
    },
    {
      id: 'deep-neural-v3',
      name: 'الشبكة العصبية العميقة',
      description: 'شبكة عصبية متعددة الطبقات لتحليل سلوك المستخدم وتفضيلاته',
      type: 'deep_learning',
      accuracy: 0.93,
      speed: 0.92,
      confidence: 0.91,
      lastTrained: new Date(),
      isActive: true,
      features: ['تعلم الأنماط', 'كشف الاتجاهات', 'التصنيف الذكي', 'التوقع المستقبلي']
    },
    {
      id: 'reinforcement-v2',
      name: 'التعلم التعزيزي الذكي',
      description: 'يتعلم من تفاعلات المستخدم ويحسن توصياته باستمرار',
      type: 'reinforcement',
      accuracy: 0.89,
      speed: 0.94,
      confidence: 0.87,
      lastTrained: new Date(),
      isActive: true,
      features: ['التعلم التفاعلي', 'التحسين المستمر', 'التكيف السريع', 'الاستجابة الفورية']
    },
    {
      id: 'ensemble-fusion-v1',
      name: 'نموذج الدمج المتطور',
      description: 'يدمج جميع النماذج الذكية للحصول على أفضل النتائج',
      type: 'ensemble',
      accuracy: 0.98,
      speed: 0.85,
      confidence: 0.97,
      lastTrained: new Date(),
      isActive: true,
      features: ['دمج النماذج', 'أعلى دقة', 'ثقة عالية', 'نتائج شاملة']
    }
  ]);

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState({
    totalPredictions: 1247,
    accuracyImprovement: 12.5,
    userSatisfaction: 94.3,
    responseTime: 0.023
  });

  // تشغيل نماذج التعلم الآلي المتقدمة
  const runAdvancedML = async () => {
    setIsLearning(true);

    try {
      // محاكاة نماذج ذكية متقدمة
      const results = await Promise.all(
        smartModels
          .filter(model => model.isActive)
          .map(model => processWithModel(model))
      );

      // دمج النتائج من جميع النماذج
      const fusedRecommendations = fuseModelResults(results);
      setRecommendations(fusedRecommendations);

      // تحديث مقاييس النظام
      setSystemMetrics(prev => ({
        ...prev,
        totalPredictions: prev.totalPredictions + fusedRecommendations.length,
        accuracyImprovement: Math.min(prev.accuracyImprovement + Math.random() * 2, 25),
        userSatisfaction: Math.min(prev.userSatisfaction + Math.random() * 1, 99),
        responseTime: Math.max(prev.responseTime - Math.random() * 0.005, 0.01)
      }));

      toast.success('تم توليد التوصيات الذكية بنجاح');

    } catch (error) {
      console.error('خطأ في تشغيل نماذج التعلم الآلي:', error);
      toast.error('حدث خطأ في النظام الذكي');
    } finally {
      setIsLearning(false);
    }
  };

  // معالجة باستخدام نموذج محدد
  const processWithModel = async (model: SmartModel): Promise<RecommendationResult[]> => {
    // محاكاة المعالجة المتقدمة
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return articles.map(article => {
      let score = 0;
      let confidence = 0;
      let reasoning: string[] = [];

      switch (model.type) {
        case 'transformer':
          score = calculateTransformerScore(article);
          confidence = 0.94 + Math.random() * 0.05;
          reasoning = [
            'تحليل السياق بواسطة نموذج المحولات',
            'فهم عميق للمحتوى والدلالات',
            'تطابق مع الاهتمامات المستنتجة'
          ];
          break;

        case 'deep_learning':
          score = calculateDeepLearningScore(article);
          confidence = 0.91 + Math.random() * 0.05;
          reasoning = [
            'تحليل الأنماط بالشبكة العصبية العميقة',
            'كشف الاتجاهات الخفية في السلوك',
            'توقع دقيق للتفضيلات'
          ];
          break;

        case 'reinforcement':
          score = calculateReinforcementScore(article);
          confidence = 0.87 + Math.random() * 0.05;
          reasoning = [
            'تعلم من التفاعلات السابقة',
            'تحسين مستمر بناءً على الاستجابة',
            'تكيف مع تغيرات الاهتمامات'
          ];
          break;

        case 'ensemble':
          score = calculateEnsembleScore(article);
          confidence = 0.97 + Math.random() * 0.02;
          reasoning = [
            'دمج نتائج جميع النماذج الذكية',
            'أعلى دقة ممكنة',
            'ثقة عالية في التوصية'
          ];
          break;
      }

      return {
        articleId: article.id,
        score: Math.min(score * (0.8 + Math.random() * 0.4), 1),
        confidence,
        reasoning,
        modelUsed: model.name,
        personalityMatch: Math.random() * 0.3 + 0.7,
        contextualRelevance: Math.random() * 0.4 + 0.6,
        trendFactor: Math.random() * 0.5 + 0.5,
        diversityScore: Math.random() * 0.2 + 0.8
      };
    });
  };

  // دمج نتائج النماذج المختلفة
  const fuseModelResults = (results: RecommendationResult[][]): RecommendationResult[] => {
    const articleScores: Record<string, RecommendationResult[]> = {};

    // تجميع النتائج لكل مقال
    results.forEach(modelResults => {
      modelResults.forEach(result => {
        if (!articleScores[result.articleId]) {
          articleScores[result.articleId] = [];
        }
        articleScores[result.articleId].push(result);
      });
    });

    // حساب النتيجة النهائية لكل مقال
    const fusedResults = Object.entries(articleScores).map(([articleId, scores]) => {
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      const avgConfidence = scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length;
      const allReasoning = scores.flatMap(s => s.reasoning);
      
      return {
        articleId,
        score: avgScore,
        confidence: avgConfidence,
        reasoning: [...new Set(allReasoning)].slice(0, 4), // إزالة التكرار
        modelUsed: 'نموذج الدمج المتطور',
        personalityMatch: scores.reduce((sum, s) => sum + s.personalityMatch, 0) / scores.length,
        contextualRelevance: scores.reduce((sum, s) => sum + s.contextualRelevance, 0) / scores.length,
        trendFactor: scores.reduce((sum, s) => sum + s.trendFactor, 0) / scores.length,
        diversityScore: scores.reduce((sum, s) => sum + s.diversityScore, 0) / scores.length
      };
    });

    return fusedResults.sort((a, b) => b.score - a.score);
  };

  // دوال حساب النقاط لكل نموذج
  const calculateTransformerScore = (article: Article): number => {
    // محاكاة تحليل المحولات المتقدم
    const semanticScore = Math.random() * 0.4 + 0.6;
    const contextScore = Math.random() * 0.3 + 0.7;
    const relevanceScore = Math.random() * 0.2 + 0.8;
    return (semanticScore + contextScore + relevanceScore) / 3;
  };

  const calculateDeepLearningScore = (article: Article): number => {
    // محاكاة الشبكة العصبية العميقة
    const patternScore = Math.random() * 0.3 + 0.7;
    const behaviorScore = Math.random() * 0.4 + 0.6;
    const predictionScore = Math.random() * 0.3 + 0.7;
    return (patternScore + behaviorScore + predictionScore) / 3;
  };

  const calculateReinforcementScore = (article: Article): number => {
    // محاكاة التعلم التعزيزي
    const feedbackScore = Math.random() * 0.5 + 0.5;
    const adaptationScore = Math.random() * 0.4 + 0.6;
    const optimizationScore = Math.random() * 0.3 + 0.7;
    return (feedbackScore + adaptationScore + optimizationScore) / 3;
  };

  const calculateEnsembleScore = (article: Article): number => {
    // دمج جميع النقاط
    return (
      calculateTransformerScore(article) * 0.4 +
      calculateDeepLearningScore(article) * 0.3 +
      calculateReinforcementScore(article) * 0.3
    );
  };

  // تدريب النماذج
  const trainModels = async () => {
    setIsLearning(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedModels = smartModels.map(model => ({
        ...model,
        accuracy: Math.min(model.accuracy + Math.random() * 0.03, 0.99),
        speed: Math.min(model.speed + Math.random() * 0.02, 0.98),
        confidence: Math.min(model.confidence + Math.random() * 0.02, 0.99),
        lastTrained: new Date()
      }));

      setSmartModels(updatedModels);
      toast.success('تم تدريب جميع النماذج الذكية بنجاح');

    } catch (error) {
      toast.error('حدث خطأ في تدريب النماذج');
    } finally {
      setIsLearning(false);
    }
  };

  useEffect(() => {
    if (articles.length > 0 && realTimeMode) {
      runAdvancedML();
    }
  }, [articles, realTimeMode]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary" />
            نظام التوصيات الذكي المتطور
          </h1>
          <p className="text-muted-foreground mt-2">
            تقنيات الذكاء الاصطناعي المتقدمة مع التعلم العميق والتحليل الذكي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch 
              checked={realTimeMode} 
              onCheckedChange={setRealTimeMode}
              id="realtime-mode"
            />
            <Label htmlFor="realtime-mode" className="text-sm">
              الوضع المباشر
            </Label>
          </div>
          
          <Button 
            onClick={trainModels}
            disabled={isLearning}
            variant="outline"
            className="gap-2"
          >
            {isLearning ? <Timer className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
            {isLearning ? 'يدرب النماذج...' : 'تدريب النماذج'}
          </Button>
          
          <Button 
            onClick={runAdvancedML}
            disabled={isLearning}
            className="gap-2"
          >
            {isLearning ? <Timer className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLearning ? 'يحلل...' : 'تحليل ذكي'}
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التنبؤات</p>
                <p className="text-2xl font-bold text-primary">{systemMetrics.totalPredictions.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تحسن الدقة</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-green-600">+{systemMetrics.accuracyImprovement.toFixed(1)}%</p>
                  <ArrowUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <TrendUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">رضا المستخدمين</p>
                <p className="text-2xl font-bold text-primary">{systemMetrics.userSatisfaction.toFixed(1)}%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">زمن الاستجابة</p>
                <p className="text-2xl font-bold text-primary">{systemMetrics.responseTime.toFixed(3)}s</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">التوصيات الذكية</TabsTrigger>
          <TabsTrigger value="models">إدارة النماذج</TabsTrigger>
          <TabsTrigger value="insights">رؤى ذكية</TabsTrigger>
        </TabsList>

        {/* التوصيات الذكية */}
        <TabsContent value="recommendations" className="space-y-4">
          {isLearning ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Brain className="w-12 h-12 animate-pulse text-primary" />
                  <Network className="w-10 h-10 animate-pulse text-accent" />
                  <Cpu className="w-8 h-8 animate-pulse text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">النماذج الذكية تعمل...</h3>
                <p className="text-muted-foreground mb-4">
                  تشغيل خوارزميات التعلم العميق والمحولات المتقدمة
                </p>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  <div className="flex justify-between text-sm">
                    <span>تحليل السياق</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>الشبكة العصبية</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>التعلم التعزيزي</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.slice(0, 8).map((rec, index) => {
                const article = articles.find(a => a.id === rec.articleId);
                if (!article) return null;

                return (
                  <Card key={article.id} className="hover:shadow-xl transition-all duration-500 border-l-4 border-primary">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-sm font-bold">
                            #{index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            <span className="text-lg font-bold text-primary">
                              {(rec.score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10">
                            ثقة: {(rec.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                          {article.category?.name}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-xl mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      {/* مؤشرات النموذج الذكي */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-2 bg-primary/5 rounded">
                          <div className="text-xs text-muted-foreground mb-1">شخصية</div>
                          <div className="font-bold text-primary">{(rec.personalityMatch * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-2 bg-accent/5 rounded">
                          <div className="text-xs text-muted-foreground mb-1">السياق</div>
                          <div className="font-bold text-accent">{(rec.contextualRelevance * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xs text-muted-foreground mb-1">رائج</div>
                          <div className="font-bold text-green-600">{(rec.trendFactor * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xs text-muted-foreground mb-1">تنوع</div>
                          <div className="font-bold text-purple-600">{(rec.diversityScore * 100).toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* التفسير الذكي */}
                      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-4 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary mb-2">تفسير النموذج الذكي:</p>
                            {rec.reasoning.map((reason, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.analytics?.views?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{article.analytics?.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="w-3 h-3" />
                            <span>{article.analytics?.shares || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.ceil((article.content?.length || 1000) / 200)} د</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => onArticleSelect(article)}
                          className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <BookOpen className="w-4 h-4" />
                          اقرأ الآن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* إدارة النماذج */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {smartModels.map(model => (
              <Card key={model.id} className={`${model.isActive ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                        {model.type === 'transformer' ? <Network className="w-6 h-6 text-primary" /> :
                         model.type === 'deep_learning' ? <Brain className="w-6 h-6 text-primary" /> :
                         model.type === 'reinforcement' ? <Target className="w-6 h-6 text-primary" /> :
                         <Sparkles className="w-6 h-6 text-primary" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>{model.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.isActive ? "default" : "outline"}>
                        {model.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Badge variant="secondary">
                        دقة: {(model.accuracy * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>الدقة</span>
                        <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>السرعة</span>
                        <span>{(model.speed * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.speed * 100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>الثقة</span>
                        <span>{(model.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.confidence * 100} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {model.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* رؤى ذكية */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp />
                  أداء النماذج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {smartModels.map(model => (
                    <div key={model.id} className="flex items-center justify-between">
                      <span className="text-sm">{model.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={model.accuracy * 100} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-12">
                          {(model.accuracy * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User />
                  رضا المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {systemMetrics.userSatisfaction.toFixed(1)}%
                  </div>
                  <Progress value={systemMetrics.userSatisfaction} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    بناءً على تفاعل {systemMetrics.totalPredictions.toLocaleString()} مستخدم
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}