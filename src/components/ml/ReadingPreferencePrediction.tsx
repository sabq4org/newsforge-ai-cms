import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  ChartBarHorizontal, 
  Users, 
  Clock,
  BookOpen,
  Zap,
  Medal,
  Eye,
  Heart,
  Share2
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface ReadingPattern {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  duration: number; // minutes
  categories: string[];
  contentType: 'news' | 'analysis' | 'opinion' | 'features';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  scrollDepth: number;
  engagementScore: number;
}

interface UserBehavior {
  userId: string;
  patterns: ReadingPattern[];
  preferences: {
    categories: Record<string, number>; // category -> affinity score
    readingTimes: Record<string, number>; // time -> frequency
    contentLength: 'short' | 'medium' | 'long';
    complexity: 'simple' | 'moderate' | 'complex';
  };
  interactions: {
    likes: number;
    shares: number;
    comments: number;
    bookmarks: number;
  };
  lastUpdated: Date;
}

interface PredictionModel {
  id: string;
  name: string;
  nameAr: string;
  type: 'collaborative' | 'content_based' | 'hybrid' | 'deep_learning';
  accuracy: number;
  predictions: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'inactive';
}

interface ReadingRecommendation {
  articleId: string;
  title: string;
  category: string;
  confidence: number;
  reasons: string[];
  predictedEngagement: number;
  estimatedReadTime: number;
}

export function ReadingPreferencePrediction() {
  const [models, setModels] = useKV<PredictionModel[]>('ml-prediction-models', [
    {
      id: 'collaborative_filter',
      name: 'Collaborative Filtering',
      nameAr: 'التصفية التعاونية',
      type: 'collaborative',
      accuracy: 87.5,
      predictions: 15420,
      lastTrained: new Date(),
      status: 'active'
    },
    {
      id: 'content_based',
      name: 'Content-Based',
      nameAr: 'التوصية المبنية على المحتوى',
      type: 'content_based',
      accuracy: 84.2,
      predictions: 12350,
      lastTrained: new Date(),
      status: 'active'
    },
    {
      id: 'hybrid_model',
      name: 'Hybrid Neural Network',
      nameAr: 'الشبكة العصبية المختلطة',
      type: 'hybrid',
      accuracy: 92.8,
      predictions: 8750,
      lastTrained: new Date(),
      status: 'training'
    },
    {
      id: 'deep_learning',
      name: 'Transformer-based Model',
      nameAr: 'نموذج المحولات العميق',
      type: 'deep_learning',
      accuracy: 95.1,
      predictions: 5200,
      lastTrained: new Date(),
      status: 'active'
    }
  ]);

  const [userBehaviors, setUserBehaviors] = useKV<UserBehavior[]>('user-behaviors', []);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('hybrid_model');
  const [predictions, setPredictions] = useState<ReadingRecommendation[]>([]);
  const [modelPerformance, setModelPerformance] = useState<Record<string, any>>({});

  useEffect(() => {
    generatePredictions();
    analyzeModelPerformance();
  }, [selectedModel]);

  const generatePredictions = async () => {
    // Simulate ML prediction generation
    const mockPredictions: ReadingRecommendation[] = [
      {
        articleId: 'article_1',
        title: 'تحليل عميق: مستقبل الذكاء الاصطناعي في الصحافة',
        category: 'تقنية',
        confidence: 94.5,
        reasons: ['اهتمام قوي بالتقنية', 'يفضل المحتوى التحليلي', 'نشط في المساء'],
        predictedEngagement: 8.7,
        estimatedReadTime: 12
      },
      {
        articleId: 'article_2',
        title: 'الرياض تشهد افتتاح أكبر مركز للابتكار التقني',
        category: 'محليات',
        confidence: 89.2,
        reasons: ['قارئ محلي نشط', 'اهتمام بالأخبار التقنية', 'يفضل الأخبار الحديثة'],
        predictedEngagement: 7.8,
        estimatedReadTime: 6
      },
      {
        articleId: 'article_3',
        title: 'مراجعة: أحدث هواتف آيفون وتقنياتها المتطورة',
        category: 'تقنية',
        confidence: 91.8,
        reasons: ['اهتمام بمراجعات التقنية', 'تفاعل عالي مع محتوى الهواتف', 'قراءة منتظمة'],
        predictedEngagement: 8.2,
        estimatedReadTime: 9
      }
    ];

    setPredictions(mockPredictions);
  };

  const analyzeModelPerformance = () => {
    const performance = {
      accuracy: {
        daily: [85, 87, 89, 91, 93, 92, 94],
        weekly: [88, 89, 91, 92, 93, 94, 95],
        labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      },
      categoryAccuracy: {
        'تقنية': 96.2,
        'رياضة': 89.5,
        'محليات': 92.1,
        'اقتصاد': 87.8,
        'صحة': 91.4
      },
      userSegments: {
        'القراء النشطون': { accuracy: 94.2, count: 1250 },
        'القراء العاديون': { accuracy: 88.7, count: 3420 },
        'القراء الجدد': { accuracy: 76.5, count: 890 }
      }
    };
    setModelPerformance(performance);
  };

  const trainModel = async (modelId: string) => {
    setIsTraining(true);
    
    // Simulate model training process
    const model = models.find(m => m.id === modelId);
    if (model) {
      // Update model status
      setModels(current => 
        current.map(m => 
          m.id === modelId 
            ? { ...m, status: 'training' as const }
            : m
        )
      );

      // Simulate training time
      setTimeout(() => {
        setModels(current => 
          current.map(m => 
            m.id === modelId 
              ? { 
                  ...m, 
                  status: 'active' as const, 
                  accuracy: Math.min(m.accuracy + Math.random() * 2, 99.9),
                  lastTrained: new Date(),
                  predictions: m.predictions + Math.floor(Math.random() * 100)
                }
              : m
          )
        );
        setIsTraining(false);
      }, 3000);
    }
  };

  const ModelCard = ({ model }: { model: PredictionModel }) => (
    <Card className="border-2 hover:border-accent/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{model.nameAr}</CardTitle>
          <Badge 
            variant={model.status === 'active' ? 'default' : 
                    model.status === 'training' ? 'secondary' : 'outline'}
            className="gap-1"
          >
            {model.status === 'active' && <Zap className="w-3 h-3" />}
            {model.status === 'training' && <Brain className="w-3 h-3 animate-pulse" />}
            {model.status === 'active' ? 'نشط' : 
             model.status === 'training' ? 'قيد التدريب' : 'غير نشط'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{model.name}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>دقة النموذج</span>
            <span className="font-medium">{model.accuracy.toFixed(1)}%</span>
          </div>
          <Progress value={model.accuracy} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">التوقعات</p>
            <p className="font-medium">{model.predictions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">آخر تدريب</p>
            <p className="font-medium">{model.lastTrained.toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => trainModel(model.id)}
            disabled={isTraining || model.status === 'training'}
            className="flex-1"
          >
            {model.status === 'training' ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                جاري التدريب...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                إعادة تدريب
              </>
            )}
          </Button>
          
          <Button
            variant={selectedModel === model.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedModel(model.id)}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            {selectedModel === model.id ? 'مُختار' : 'اختيار'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PredictionCard = ({ prediction }: { prediction: ReadingRecommendation }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm leading-tight">{prediction.title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0 mr-2">
              {prediction.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>ثقة: {prediction.confidence}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{prediction.estimatedReadTime} د</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{prediction.predictedEngagement.toFixed(1)}/10</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">أسباب التوصية:</p>
            <div className="flex flex-wrap gap-1">
              {prediction.reasons.map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
          
          <Progress value={prediction.confidence} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-accent" />
          نماذج التعلم الآلي لتوقع تفضيلات القراءة
        </h1>
        <p className="text-muted-foreground text-lg">
          تطوير وإدارة نماذج الذكاء الاصطناعي لفهم وتوقع سلوك القراء
        </p>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">النماذج</TabsTrigger>
          <TabsTrigger value="predictions">التوقعات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="insights">الرؤى</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                نماذج التعلم الآلي المتاحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                توقعات القراءة المخصصة
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                توقعات مبنية على النموذج: {models.find(m => m.id === selectedModel)?.nameAr}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((prediction, index) => (
                  <PredictionCard key={index} prediction={prediction} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                توقعات حسب فئات القراء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(modelPerformance.userSegments || {}).map(([segment, data]) => (
                  <Card key={segment} className="border-2">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{segment}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>دقة التوقع</span>
                          <span className="font-medium">{data.accuracy}%</span>
                        </div>
                        <Progress value={data.accuracy} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {data.count.toLocaleString()} قارئ
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarHorizontal className="w-5 h-5" />
                  أداء النماذج اليومي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelPerformance.accuracy?.labels.map((day, index) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-16">{day}</span>
                      <div className="flex-1">
                        <Progress 
                          value={modelPerformance.accuracy.daily[index]} 
                          className="h-3" 
                        />
                      </div>
                      <span className="text-sm font-medium w-12">
                        {modelPerformance.accuracy.daily[index]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  دقة التوقع حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(modelPerformance.categoryAccuracy || {}).map(([category, accuracy]) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-16">{category}</span>
                      <div className="flex-1">
                        <Progress value={accuracy} className="h-3" />
                      </div>
                      <span className="text-sm font-medium w-12">
                        {accuracy.toFixed(1)}%
                      </span>
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
                مؤشرات الأداء الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">94.2%</p>
                  <p className="text-sm text-muted-foreground">دقة التوقع الإجمالية</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">5,560</p>
                  <p className="text-sm text-muted-foreground">المستخدمون النشطون</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">41.7K</p>
                  <p className="text-sm text-muted-foreground">توقعات اليوم</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Share2 className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">87.3%</p>
                  <p className="text-sm text-muted-foreground">معدل النقر المتوقع</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  رؤى ذكية من النماذج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-accent/10 rounded-lg border-r-4 border-accent">
                  <h4 className="font-semibold text-sm">اكتشاف نمط جديد</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    القراء يفضلون المحتوى التقني في ساعات المساء بنسبة 34% أكثر من الصباح
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border-r-4 border-blue-500">
                  <h4 className="font-semibold text-sm">توصية تحسين</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    نشر المقالات التحليلية بين 7-9 مساءً يحسن معدل التفاعل بـ 23%
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border-r-4 border-green-500">
                  <h4 className="font-semibold text-sm">فرصة نمو</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    المحتوى الرياضي يحتاج مزيد من التخصيص لزيادة دقة التوقعات
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  توصيات التطوير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">نموذج التعلم العميق</h4>
                  <p className="text-xs text-muted-foreground">
                    إضافة طبقات انتباه متعددة للنص العربي
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    تطبيق التحسين
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">نموذج المحتوى</h4>
                  <p className="text-xs text-muted-foreground">
                    تحسين معالجة البيانات التفاعلية
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    بدء التطوير
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">النموذج المختلط</h4>
                  <p className="text-xs text-muted-foreground">
                    دمج البيانات الزمنية والسياقية
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    جدولة التدريب
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}