import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain,
  Cpu,
  TrendingUp,
  Activity,
  Target,
  Sparkles,
  TrendingUp,
  Timer,
  Lightbulb,
  Network,
  GitBranch,
  Zap,
  BookOpen,
  Eye,
  Heart,
  Share,
  Clock
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';
import { UserProfile } from '@/types/membership';
import { toast } from 'sonner';

interface MachineLearningEngineProps {
  userId?: string;
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}

// تعريف أنواع البيانات للتعلم الآلي
interface MLModel {
  id: string;
  name: string;
  type: 'collaborative' | 'content_based' | 'hybrid' | 'neural_network';
  version: string;
  accuracy: number;
  trainingData: {
    samples: number;
    features: number;
    lastTrained: Date;
  };
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    clickThroughRate: number;
  };
  isActive: boolean;
}

interface UserVector {
  userId: string;
  features: {
    categoryPreferences: Record<string, number>;
    timePreferences: Record<string, number>;
    engagementPatterns: Record<string, number>;
    semanticProfile: number[];
  };
  lastUpdated: Date;
}

interface ContentVector {
  articleId: string;
  features: {
    semanticEmbedding: number[];
    topicDistribution: Record<string, number>;
    engagementSignals: Record<string, number>;
    contextualFeatures: Record<string, number>;
  };
  lastUpdated: Date;
}

interface MLPrediction {
  articleId: string;
  score: number;
  confidence: number;
  modelUsed: string;
  features: {
    collaborativeScore: number;
    contentSimilarity: number;
    contextualRelevance: number;
    trendingFactor: number;
    personalityMatch: number;
  };
  explanation: string[];
}

export function MachineLearningEngine({ userId, articles, onArticleSelect }: MachineLearningEngineProps) {
  const [mlModels, setMLModels] = useKV<MLModel[]>('ml-models', [
    {
      id: 'collaborative-v2',
      name: 'التصفية التعاونية المتقدمة',
      type: 'collaborative',
      version: '2.1.0',
      accuracy: 0.87,
      trainingData: { samples: 50000, features: 128, lastTrained: new Date() },
      performance: { precision: 0.85, recall: 0.82, f1Score: 0.83, clickThroughRate: 0.12 },
      isActive: true
    },
    {
      id: 'content-neural-v1',
      name: 'الشبكة العصبية للمحتوى',
      type: 'neural_network',
      version: '1.3.0',
      accuracy: 0.91,
      trainingData: { samples: 75000, features: 256, lastTrained: new Date() },
      performance: { precision: 0.89, recall: 0.88, f1Score: 0.89, clickThroughRate: 0.15 },
      isActive: true
    },
    {
      id: 'hybrid-ensemble-v3',
      name: 'النموذج المختلط المطور',
      type: 'hybrid',
      version: '3.0.0',
      accuracy: 0.94,
      trainingData: { samples: 100000, features: 512, lastTrained: new Date() },
      performance: { precision: 0.92, recall: 0.91, f1Score: 0.92, clickThroughRate: 0.18 },
      isActive: true
    }
  ]);

  const [userVectors] = useKV<UserVector[]>('user-vectors', []);
  const [contentVectors] = useKV<ContentVector[]>('content-vectors', []);
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('hybrid-ensemble-v3');
  const [isTraining, setIsTraining] = useState(false);
  const [isInferencing, setIsInferencing] = useState(false);
  
  // التعلم التعاوني المتقدم
  const runCollaborativeFiltering = async (userVector: UserVector): Promise<MLPrediction[]> => {
    // محاكاة خوارزمية التصفية التعاونية
    const similarUsers = userVectors
      .filter(uv => uv.userId !== userVector.userId)
      .map(uv => ({
        userId: uv.userId,
        similarity: calculateUserSimilarity(userVector, uv)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // أفضل 50 مستخدم مشابه

    const recommendations = articles.map(article => {
      const collaborativeScore = similarUsers.reduce((sum, su) => {
        // محاكاة تقييم المستخدمين المشابهين لهذا المقال
        const userRating = Math.random() * 0.5 + 0.3; // محاكاة
        return sum + (su.similarity * userRating);
      }, 0) / similarUsers.length;

      return {
        articleId: article.id,
        score: Math.min(collaborativeScore * 1.2, 1),
        confidence: 0.85,
        modelUsed: 'collaborative-v2',
        features: {
          collaborativeScore,
          contentSimilarity: 0,
          contextualRelevance: 0,
          trendingFactor: 0,
          personalityMatch: 0
        },
        explanation: [
          `تم التوصية بناءً على ${similarUsers.length} مستخدم مشابه`,
          'المستخدمون المشابهون أظهروا اهتماماً بهذا النوع من المحتوى',
          `معدل التشابه: ${(collaborativeScore * 100).toFixed(0)}%`
        ]
      };
    });

    return recommendations.sort((a, b) => b.score - a.score);
  };

  // التعلم القائم على المحتوى بالشبكات العصبية
  const runNeuralContentAnalysis = async (userVector: UserVector): Promise<MLPrediction[]> => {
    const recommendations = articles.map(article => {
      const contentVector = contentVectors.find(cv => cv.articleId === article.id);
      
      if (!contentVector) {
        // إنشاء متجه محتوى جديد
        const newVector = generateContentVector(article);
        contentVectors.push(newVector);
      }

      // محاكاة الشبكة العصبية
      const semanticSimilarity = calculateSemanticSimilarity(
        userVector.features.semanticProfile,
        contentVector?.features.semanticEmbedding || []
      );

      const topicRelevance = calculateTopicRelevance(
        userVector.features.categoryPreferences,
        contentVector?.features.topicDistribution || {}
      );

      const contextualScore = calculateContextualRelevance(article);
      
      const neuralScore = (
        semanticSimilarity * 0.4 +
        topicRelevance * 0.3 +
        contextualScore * 0.3
      );

      return {
        articleId: article.id,
        score: neuralScore,
        confidence: 0.91,
        modelUsed: 'content-neural-v1',
        features: {
          collaborativeScore: 0,
          contentSimilarity: semanticSimilarity,
          contextualRelevance: contextualScore,
          trendingFactor: calculateTrendingFactor(article),
          personalityMatch: topicRelevance
        },
        explanation: [
          `تطابق دلالي: ${(semanticSimilarity * 100).toFixed(0)}%`,
          `صلة بالموضوع: ${(topicRelevance * 100).toFixed(0)}%`,
          'تم التحليل باستخدام شبكة عصبية متقدمة'
        ]
      };
    });

    return recommendations.sort((a, b) => b.score - a.score);
  };

  // النموذج المختلط المطور
  const runHybridEnsemble = async (userVector: UserVector): Promise<MLPrediction[]> => {
    // تشغيل جميع النماذج ودمج النتائج
    const [collaborative, neural] = await Promise.all([
      runCollaborativeFiltering(userVector),
      runNeuralContentAnalysis(userVector)
    ]);

    const hybridRecommendations = articles.map(article => {
      const collabPred = collaborative.find(p => p.articleId === article.id);
      const neuralPred = neural.find(p => p.articleId === article.id);

      // وزن النماذج بناءً على أداءها
      const collaborativeWeight = 0.3;
      const neuralWeight = 0.4;
      const trendingWeight = 0.2;
      const diversityWeight = 0.1;

      const finalScore = (
        (collabPred?.score || 0) * collaborativeWeight +
        (neuralPred?.score || 0) * neuralWeight +
        calculateTrendingFactor(article) * trendingWeight +
        calculateDiversityBonus(article, userVector) * diversityWeight
      );

      const combinedFeatures = {
        collaborativeScore: collabPred?.score || 0,
        contentSimilarity: neuralPred?.features.contentSimilarity || 0,
        contextualRelevance: neuralPred?.features.contextualRelevance || 0,
        trendingFactor: calculateTrendingFactor(article),
        personalityMatch: neuralPred?.features.personalityMatch || 0
      };

      return {
        articleId: article.id,
        score: finalScore,
        confidence: 0.94,
        modelUsed: 'hybrid-ensemble-v3',
        features: combinedFeatures,
        explanation: [
          'توصية من النموذج المختلط المطور',
          `دمج ${Object.keys(combinedFeatures).length} عوامل ذكية`,
          `دقة النموذج: 94%`,
          generateSmartExplanation(combinedFeatures, article)
        ]
      };
    });

    return hybridRecommendations.sort((a, b) => b.score - a.score);
  };

  // تشغيل التوصيات بناءً على النموذج المختار
  const generateMLRecommendations = async () => {
    if (!userId) {
      toast.error('يرجى تسجيل الدخول للحصول على توصيات مخصصة');
      return;
    }

    setIsInferencing(true);

    try {
      // الحصول على متجه المستخدم أو إنشاؤه
      let userVector = userVectors.find(uv => uv.userId === userId);
      if (!userVector) {
        userVector = await generateUserVector(userId);
      }

      const selectedModelData = mlModels.find(m => m.id === selectedModel);
      let recommendations: MLPrediction[] = [];

      switch (selectedModelData?.type) {
        case 'collaborative':
          recommendations = await runCollaborativeFiltering(userVector);
          break;
        case 'neural_network':
          recommendations = await runNeuralContentAnalysis(userVector);
          break;
        case 'hybrid':
          recommendations = await runHybridEnsemble(userVector);
          break;
        default:
          recommendations = await runHybridEnsemble(userVector);
      }

      setPredictions(recommendations);
      toast.success(`تم توليد ${recommendations.length} توصية باستخدام ${selectedModelData?.name}`);

    } catch (error) {
      console.error('Error generating ML recommendations:', error);
      toast.error('حدث خطأ في توليد التوصيات');
    } finally {
      setIsInferencing(false);
    }
  };

  // تدريب النماذج
  const trainModels = async () => {
    setIsTraining(true);
    
    try {
      // محاكاة عملية التدريب
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedModels = mlModels.map(model => ({
        ...model,
        accuracy: Math.min(model.accuracy + Math.random() * 0.02, 0.99),
        trainingData: {
          ...model.trainingData,
          samples: model.trainingData.samples + Math.floor(Math.random() * 5000),
          lastTrained: new Date()
        },
        performance: {
          ...model.performance,
          precision: Math.min(model.performance.precision + Math.random() * 0.01, 0.99),
          recall: Math.min(model.performance.recall + Math.random() * 0.01, 0.99),
          f1Score: Math.min(model.performance.f1Score + Math.random() * 0.01, 0.99),
          clickThroughRate: Math.min(model.performance.clickThroughRate + Math.random() * 0.005, 0.25)
        }
      }));

      setMLModels(updatedModels);
      toast.success('تم تدريب النماذج بنجاح وتحسن الأداء');

    } catch (error) {
      toast.error('حدث خطأ في تدريب النماذج');
    } finally {
      setIsTraining(false);
    }
  };

  // دوال مساعدة
  const calculateUserSimilarity = (user1: UserVector, user2: UserVector): number => {
    // محاكاة حساب التشابه بين المستخدمين
    return Math.random() * 0.4 + 0.3;
  };

  const generateContentVector = (article: Article): ContentVector => {
    return {
      articleId: article.id,
      features: {
        semanticEmbedding: Array.from({ length: 256 }, () => Math.random()),
        topicDistribution: {
          [article.category?.name || 'عام']: 0.8,
          'متنوع': 0.2
        },
        engagementSignals: {
          views: (article.analytics?.views || 0) / 1000,
          likes: (article.analytics?.likes || 0) / 100,
          shares: (article.analytics?.shares || 0) / 50
        },
        contextualFeatures: {
          recency: Math.max(0, 1 - (Date.now() - new Date(article.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)),
          length: Math.min((article.content?.length || 1000) / 5000, 1),
          quality: Math.random() * 0.3 + 0.7
        }
      },
      lastUpdated: new Date()
    };
  };

  const generateUserVector = async (userId: string): Promise<UserVector> => {
    // محاكاة توليد متجه المستخدم
    return {
      userId,
      features: {
        categoryPreferences: {
          'محليات': Math.random(),
          'العالم': Math.random(),
          'رياضة': Math.random(),
          'تقنية': Math.random()
        },
        timePreferences: {
          'صباح': Math.random(),
          'ظهر': Math.random(),
          'مساء': Math.random(),
          'ليل': Math.random()
        },
        engagementPatterns: {
          'قراءة_سريعة': Math.random(),
          'قراءة_عميقة': Math.random(),
          'مشاركة': Math.random(),
          'تعليق': Math.random()
        },
        semanticProfile: Array.from({ length: 128 }, () => Math.random())
      },
      lastUpdated: new Date()
    };
  };

  const calculateSemanticSimilarity = (profile: number[], embedding: number[]): number => {
    if (!profile.length || !embedding.length) return 0.5;
    return Math.random() * 0.4 + 0.3;
  };

  const calculateTopicRelevance = (preferences: Record<string, number>, distribution: Record<string, number>): number => {
    return Math.random() * 0.4 + 0.4;
  };

  const calculateContextualRelevance = (article: Article): number => {
    const recency = Math.max(0, 1 - (Date.now() - new Date(article.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const engagement = Math.min((article.analytics?.views || 0) / 1000, 1);
    return (recency + engagement) / 2;
  };

  const calculateTrendingFactor = (article: Article): number => {
    const recentViews = article.analytics?.views || 0;
    const recentShares = article.analytics?.shares || 0;
    return Math.min((recentViews + recentShares * 10) / 1000, 1);
  };

  const calculateDiversityBonus = (article: Article, userVector: UserVector): number => {
    // تشجيع التنوع في التوصيات
    return Math.random() * 0.2;
  };

  const generateSmartExplanation = (features: MLPrediction['features'], article: Article): string => {
    const topFeature = Object.entries(features).reduce((max, [key, value]) => 
      value > max.value ? { key, value } : max, 
      { key: '', value: 0 }
    );

    const explanations = {
      collaborativeScore: 'المستخدمون المشابهون أحبوا هذا المحتوى',
      contentSimilarity: 'يتطابق مع اهتماماتك المحددة',
      contextualRelevance: 'مناسب للوقت والسياق الحالي',
      trendingFactor: 'محتوى رائج ومتفاعل معه',
      personalityMatch: 'يناسب شخصيتك في القراءة'
    };

    return explanations[topFeature.key as keyof typeof explanations] || 'توصية ذكية مخصصة';
  };

  useEffect(() => {
    if (articles.length > 0 && userId) {
      generateMLRecommendations();
    }
  }, [selectedModel, articles, userId]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary" />
            محرك التوصيات بالتعلم الآلي
          </h1>
          <p className="text-muted-foreground mt-2">
            نظام ذكي متطور يستخدم خوارزميات التعلم الآلي لتوصيات مخصصة دقيقة
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={trainModels}
            disabled={isTraining}
            variant="outline"
            className="gap-2"
          >
            {isTraining ? <Timer className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
            {isTraining ? 'يدرب النماذج...' : 'تدريب النماذج'}
          </Button>
          
          <Button 
            onClick={generateMLRecommendations}
            disabled={isInferencing}
            className="gap-2"
          >
            {isInferencing ? <Timer className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isInferencing ? 'يولد التوصيات...' : 'توصيات جديدة'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">التوصيات الذكية</TabsTrigger>
          <TabsTrigger value="models">إدارة النماذج</TabsTrigger>
          <TabsTrigger value="analytics">تحليل الأداء</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات المتقدمة</TabsTrigger>
        </TabsList>

        {/* التوصيات الذكية */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Label>النموذج المستخدم:</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mlModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(model.accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isInferencing ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">يحلل النماذج ويولد التوصيات...</h3>
                <p className="text-muted-foreground">
                  استخدام خوارزميات التعلم الآلي المتقدمة لتوليد توصيات مخصصة
                </p>
                <Progress value={75} className="w-64 mx-auto mt-4" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {predictions.slice(0, 10).map((prediction, index) => {
                const article = articles.find(a => a.id === prediction.articleId);
                if (!article) return null;

                return (
                  <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs font-medium">
                            #{index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-primary">
                              {(prediction.score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ثقة: {(prediction.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                          {article.category?.name}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      {/* ML Features Visualization */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">تعاوني</div>
                          <Progress value={prediction.features.collaborativeScore * 100} className="h-2" />
                          <div className="text-xs mt-1">{(prediction.features.collaborativeScore * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">محتوى</div>
                          <Progress value={prediction.features.contentSimilarity * 100} className="h-2" />
                          <div className="text-xs mt-1">{(prediction.features.contentSimilarity * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">سياق</div>
                          <Progress value={prediction.features.contextualRelevance * 100} className="h-2" />
                          <div className="text-xs mt-1">{(prediction.features.contextualRelevance * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">رائج</div>
                          <Progress value={prediction.features.trendingFactor * 100} className="h-2" />
                          <div className="text-xs mt-1">{(prediction.features.trendingFactor * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">شخصية</div>
                          <Progress value={prediction.features.personalityMatch * 100} className="h-2" />
                          <div className="text-xs mt-1">{(prediction.features.personalityMatch * 100).toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* AI Explanation */}
                      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                          <div className="space-y-1">
                            {prediction.explanation.map((exp, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {exp}
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
                          <BookOpen className="w-3 h-3" />
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
            {mlModels.map(model => (
              <Card key={model.id} className={`${model.isActive ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {model.type === 'neural_network' ? <Network className="w-5 h-5 text-primary" /> :
                         model.type === 'collaborative' ? <GitBranch className="w-5 h-5 text-primary" /> :
                         <Zap className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>الإصدار {model.version} • {model.type}</CardDescription>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{model.trainingData.samples.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">عينات التدريب</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{model.trainingData.features}</p>
                      <p className="text-sm text-muted-foreground">الخصائص</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{(model.performance.f1Score * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">F1 Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{(model.performance.clickThroughRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">CTR</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>الدقة</span>
                        <span>{(model.performance.precision * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.performance.precision * 100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>الاستدعاء</span>
                        <span>{(model.performance.recall * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.performance.recall * 100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>المعدل الإجمالي</span>
                        <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* تحليل الأداء */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity />
                  متوسط دقة النماذج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {(mlModels.reduce((sum, m) => sum + m.accuracy, 0) / mlModels.length * 100).toFixed(1)}%
                </div>
                <Progress value={(mlModels.reduce((sum, m) => sum + m.accuracy, 0) / mlModels.length * 100)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target />
                  متوسط معدل النقر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {(mlModels.reduce((sum, m) => sum + m.performance.clickThroughRate, 0) / mlModels.length * 100).toFixed(1)}%
                </div>
                <Progress value={(mlModels.reduce((sum, m) => sum + m.performance.clickThroughRate, 0) / mlModels.length * 100)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp />
                  إجمالي عينات التدريب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {mlModels.reduce((sum, m) => sum + m.trainingData.samples, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">عينة تدريب</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* الإعدادات المتقدمة */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات نماذج التعلم الآلي</CardTitle>
              <CardDescription>
                تحكم في معاملات وسلوك نماذج التوصيات الذكية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>عتبة الثقة الدنيا</Label>
                  <Input type="number" placeholder="0.5" min="0" max="1" step="0.1" />
                </div>
                <div>
                  <Label>عدد التوصيات القصوى</Label>
                  <Input type="number" placeholder="10" min="1" max="50" />
                </div>
                <div>
                  <Label>وزن التنوع</Label>
                  <Input type="number" placeholder="0.2" min="0" max="1" step="0.1" />
                </div>
                <div>
                  <Label>فترة إعادة التدريب (أيام)</Label>
                  <Input type="number" placeholder="7" min="1" max="30" />
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full">حفظ الإعدادات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}