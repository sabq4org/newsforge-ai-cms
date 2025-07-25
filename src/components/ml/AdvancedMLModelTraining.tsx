import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartLine, 
  Database, 
  Cpu, 
  Target, 
  TrendingUp, 
  BookOpen,
  Users,
  Clock,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Article } from '@/types';

interface UserInteraction {
  userId: string;
  articleId: string;
  action: 'view' | 'like' | 'share' | 'comment' | 'bookmark' | 'scroll' | 'exit';
  timestamp: Date;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location?: string;
  duration?: number;
  scrollDepth?: number;
}

interface FeatureVector {
  userId: string;
  features: {
    // User features
    readingFrequency: number;
    avgSessionTime: number;
    preferredCategories: Record<string, number>;
    timePatterns: Record<string, number>;
    devicePreference: Record<string, number>;
    
    // Content features
    contentComplexity: number;
    articleLength: number;
    authorAffinity: number;
    topicRelevance: number;
    
    // Contextual features
    timeOfDay: number;
    dayOfWeek: number;
    seasonality: number;
    trendingScore: number;
  };
  lastUpdated: Date;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  trainingLoss: number[];
  validationLoss: number[];
  confusionMatrix: number[][];
}

interface TrainingJob {
  id: string;
  modelType: 'neural_network' | 'random_forest' | 'gradient_boosting' | 'transformer';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  metrics?: ModelMetrics;
  hyperparameters: Record<string, any>;
}

export function AdvancedMLModelTraining() {
  const [interactions, setInteractions] = useKV<UserInteraction[]>('user-interactions', []);
  const [featureVectors, setFeatureVectors] = useKV<FeatureVector[]>('feature-vectors', []);
  const [trainingJobs, setTrainingJobs] = useKV<TrainingJob[]>('training-jobs', []);
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    generateSampleData();
    simulateTrainingProgress();
  }, []);

  const generateSampleData = () => {
    // Generate sample interactions if none exist
    if (interactions.length === 0) {
      const sampleInteractions: UserInteraction[] = Array.from({ length: 1000 }, (_, i) => ({
        userId: `user_${Math.floor(i / 10) + 1}`,
        articleId: `article_${Math.floor(Math.random() * 100) + 1}`,
        action: ['view', 'like', 'share', 'comment', 'bookmark'][Math.floor(Math.random() * 5)] as any,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        sessionId: `session_${i}`,
        deviceType: ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)] as any,
        duration: Math.random() * 600,
        scrollDepth: Math.random() * 100
      }));
      setInteractions(sampleInteractions);
    }

    // Generate feature vectors
    if (featureVectors.length === 0) {
      const sampleVectors: FeatureVector[] = Array.from({ length: 100 }, (_, i) => ({
        userId: `user_${i + 1}`,
        features: {
          readingFrequency: Math.random() * 10,
          avgSessionTime: Math.random() * 300,
          preferredCategories: {
            'تقنية': Math.random(),
            'رياضة': Math.random(),
            'محليات': Math.random(),
            'عالم': Math.random()
          },
          timePatterns: {
            morning: Math.random(),
            afternoon: Math.random(),
            evening: Math.random(),
            night: Math.random()
          },
          devicePreference: {
            mobile: Math.random(),
            tablet: Math.random(),
            desktop: Math.random()
          },
          contentComplexity: Math.random() * 5,
          articleLength: Math.random() * 1000,
          authorAffinity: Math.random(),
          topicRelevance: Math.random(),
          timeOfDay: Math.random() * 24,
          dayOfWeek: Math.random() * 7,
          seasonality: Math.random(),
          trendingScore: Math.random()
        },
        lastUpdated: new Date()
      }));
      setFeatureVectors(sampleVectors);
    }
  };

  const simulateTrainingProgress = () => {
    const runningJob = trainingJobs.find(job => job.status === 'running');
    if (runningJob) {
      setCurrentJob(runningJob);
      
      const interval = setInterval(() => {
        setTrainingJobs(current => 
          current.map(job => 
            job.id === runningJob.id && job.progress < 100
              ? { ...job, progress: Math.min(job.progress + Math.random() * 10, 100) }
              : job
          )
        );
        
        setCurrentJob(prev => 
          prev && prev.progress < 100 
            ? { ...prev, progress: Math.min(prev.progress + Math.random() * 10, 100) }
            : prev
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  };

  const startTraining = async (modelType: TrainingJob['modelType']) => {
    const newJob: TrainingJob = {
      id: `job_${Date.now()}`,
      modelType,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      hyperparameters: getDefaultHyperparameters(modelType)
    };

    setTrainingJobs(current => [...current, newJob]);
    setCurrentJob(newJob);

    // Simulate training completion
    setTimeout(() => {
      const completedJob: TrainingJob = {
        ...newJob,
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        metrics: generateMockMetrics()
      };

      setTrainingJobs(current => 
        current.map(job => job.id === newJob.id ? completedJob : job)
      );
      setCurrentJob(null);
      setModelMetrics(completedJob.metrics!);
    }, 10000 + Math.random() * 10000);
  };

  const getDefaultHyperparameters = (modelType: string) => {
    switch (modelType) {
      case 'neural_network':
        return {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 100,
          hiddenLayers: [128, 64, 32],
          dropout: 0.2,
          optimizer: 'adam'
        };
      case 'random_forest':
        return {
          nEstimators: 100,
          maxDepth: 10,
          minSamplesSplit: 2,
          minSamplesLeaf: 1,
          randomState: 42
        };
      case 'gradient_boosting':
        return {
          learningRate: 0.1,
          nEstimators: 100,
          maxDepth: 3,
          subsample: 0.8,
          randomState: 42
        };
      case 'transformer':
        return {
          modelDim: 512,
          numHeads: 8,
          numLayers: 6,
          feedforwardDim: 2048,
          dropout: 0.1,
          maxSeqLength: 1024
        };
      default:
        return {};
    }
  };

  const generateMockMetrics = (): ModelMetrics => ({
    accuracy: 0.85 + Math.random() * 0.1,
    precision: 0.82 + Math.random() * 0.1,
    recall: 0.79 + Math.random() * 0.1,
    f1Score: 0.83 + Math.random() * 0.1,
    mse: Math.random() * 0.1,
    mae: Math.random() * 0.05,
    trainingLoss: Array.from({ length: 50 }, (_, i) => 1 - i * 0.02 + Math.random() * 0.1),
    validationLoss: Array.from({ length: 50 }, (_, i) => 1.1 - i * 0.018 + Math.random() * 0.1),
    confusionMatrix: [
      [85, 15],
      [12, 88]
    ]
  });

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}س ${minutes % 60}د`;
    if (minutes > 0) return `${minutes}د ${seconds % 60}ث`;
    return `${seconds}ث`;
  };

  const ModelCard = ({ type, nameAr, description }: { 
    type: TrainingJob['modelType']; 
    nameAr: string; 
    description: string;
  }) => {
    const isTraining = currentJob?.modelType === type;
    const lastJob = trainingJobs
      .filter(job => job.modelType === type)
      .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime())[0];

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{nameAr}</CardTitle>
            {isTraining && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3 animate-pulse" />
                جاري التدريب
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {lastJob && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>آخر تدريب</span>
                <Badge variant={lastJob.status === 'completed' ? 'default' : 
                              lastJob.status === 'failed' ? 'destructive' : 'secondary'}>
                  {lastJob.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {lastJob.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {lastJob.status === 'completed' ? 'مكتمل' :
                   lastJob.status === 'failed' ? 'فشل' :
                   lastJob.status === 'running' ? 'جاري' : 'منتظر'}
                </Badge>
              </div>
              
              {lastJob.metrics && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">الدقة:</span>
                    <span className="font-medium mr-1">{(lastJob.metrics.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">F1:</span>
                    <span className="font-medium mr-1">{lastJob.metrics.f1Score.toFixed(3)}</span>
                  </div>
                </div>
              )}
              
              {isTraining && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>التقدم</span>
                    <span>{currentJob?.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={currentJob?.progress || 0} className="h-2" />
                </div>
              )}
            </div>
          )}
          
          <Button
            onClick={() => startTraining(type)}
            disabled={isTraining}
            className="w-full"
            variant={isTraining ? "secondary" : "default"}
          >
            {isTraining ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                جاري التدريب...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                بدء التدريب
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-accent" />
          تدريب نماذج التعلم الآلي المتقدمة
        </h1>
        <p className="text-muted-foreground text-lg">
          تطوير وتدريب نماذج ذكية لتوقع تفضيلات القراءة والتفاعل
        </p>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">النماذج</TabsTrigger>
          <TabsTrigger value="data">البيانات</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
          <TabsTrigger value="metrics">المقاييس</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModelCard
              type="neural_network"
              nameAr="الشبكة العصبية العميقة"
              description="نموذج عميق متعدد الطبقات لتعلم الأنماط المعقدة"
            />
            <ModelCard
              type="transformer"
              nameAr="نموذج المحولات"
              description="نموذج متقدم يستخدم آلية الانتباه لفهم النصوص العربية"
            />
            <ModelCard
              type="random_forest"
              nameAr="الغابة العشوائية"
              description="نموذج مبني على الأشجار للتنبؤ عالي الدقة"
            />
            <ModelCard
              type="gradient_boosting"
              nameAr="التعزيز المتدرج"
              description="نموذج يحسن من أخطاء النماذج السابقة تدريجياً"
            />
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  تفاعلات المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{interactions.length.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">تفاعل إجمالي</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المشاهدات</span>
                      <span>{interactions.filter(i => i.action === 'view').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الإعجابات</span>
                      <span>{interactions.filter(i => i.action === 'like').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>المشاركات</span>
                      <span>{interactions.filter(i => i.action === 'share').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>التعليقات</span>
                      <span>{interactions.filter(i => i.action === 'comment').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  متجهات الخصائص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{featureVectors.length}</p>
                    <p className="text-sm text-muted-foreground">مستخدم مُحلل</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>خصائص المستخدم</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>خصائص المحتوى</span>
                      <span>8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>خصائص سياقية</span>
                      <span>6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="w-5 h-5" />
                  جودة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>اكتمال البيانات</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>دقة التسميات</span>
                      <span>97.8%</span>
                    </div>
                    <Progress value={97.8} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>توازن الفئات</span>
                      <span>89.1%</span>
                    </div>
                    <Progress value={89.1} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          {currentJob && (
            <Card className="border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 animate-pulse" />
                  جاري التدريب حالياً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {currentJob.modelType === 'neural_network' && 'الشبكة العصبية العميقة'}
                      {currentJob.modelType === 'transformer' && 'نموذج المحولات'}
                      {currentJob.modelType === 'random_forest' && 'الغابة العشوائية'}
                      {currentJob.modelType === 'gradient_boosting' && 'التعزيز المتدرج'}
                    </span>
                    <Badge variant="secondary">{currentJob.progress.toFixed(0)}%</Badge>
                  </div>
                  
                  <Progress value={currentJob.progress} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">وقت البدء:</span>
                      <p className="font-medium">
                        {currentJob.startTime?.toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الوقت المنقضي:</span>
                      <p className="font-medium">
                        {currentJob.startTime && formatDuration(Date.now() - currentJob.startTime.getTime())}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سجل وظائف التدريب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainingJobs.slice(-5).reverse().map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {job.modelType === 'neural_network' && 'الشبكة العصبية'}
                        {job.modelType === 'transformer' && 'المحولات'}
                        {job.modelType === 'random_forest' && 'الغابة العشوائية'}
                        {job.modelType === 'gradient_boosting' && 'التعزيز المتدرج'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.startTime?.toLocaleString('ar-SA')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.metrics && (
                        <span className="text-xs text-muted-foreground">
                          دقة: {(job.metrics.accuracy * 100).toFixed(1)}%
                        </span>
                      )}
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {job.status === 'completed' ? 'مكتمل' :
                         job.status === 'failed' ? 'فشل' :
                         job.status === 'running' ? 'جاري' : 'منتظر'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {modelMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    مقاييس الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'الدقة (Accuracy)', value: modelMetrics.accuracy },
                      { label: 'الدقة (Precision)', value: modelMetrics.precision },
                      { label: 'الاستدعاء (Recall)', value: modelMetrics.recall },
                      { label: 'F1 Score', value: modelMetrics.f1Score }
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{metric.label}</span>
                          <span className="font-medium">{(metric.value * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={metric.value * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine className="w-5 h-5" />
                    منحنى التدريب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm">خسارة التدريب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm">خسارة التحقق</span>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <ChartLine className="w-12 h-12 mx-auto mb-2" />
                      <p>رسم بياني تفاعلي لمنحنى التدريب</p>
                      <p className="text-xs">(سيتم إضافة مكتبة الرسم البياني)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                ملخص النتائج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">
                    {trainingJobs.filter(j => j.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">نماذج مكتملة</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">
                    {modelMetrics ? (modelMetrics.accuracy * 100).toFixed(1) : '--'}%
                  </p>
                  <p className="text-sm text-muted-foreground">أفضل دقة</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">
                    {featureVectors.length}
                  </p>
                  <p className="text-sm text-muted-foreground">نقاط بيانات</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">~15د</p>
                  <p className="text-sm text-muted-foreground">متوسط وقت التدريب</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}