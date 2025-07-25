import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Cpu, 
  PlayCircle, 
  StopCircle, 
  Download, 
  Upload, 
  ChartBarHorizontal, 
  Target,
  Zap,
  BookOpen,
  Globe,
  TrendingUp,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { mockArticles } from '@/lib/mockData';

interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
}

interface ClassificationResult {
  category: string;
  confidence: number;
  subCategories: Array<{
    name: string;
    score: number;
  }>;
  sentiment: {
    label: string;
    score: number;
  };
  keywords: string[];
  complexity: number;
  readability: number;
}

interface ModelConfig {
  architecture: 'transformer' | 'lstm' | 'cnn' | 'hybrid';
  layers: number;
  hiddenSize: number;
  learningRate: number;
  batchSize: number;
  epochs: number;
  dropout: number;
  usePretrainedEmbeddings: boolean;
  maxSequenceLength: number;
}

export function ArabicContentClassifier() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [modelConfig, setModelConfig] = useKV<ModelConfig>('arabic-classifier-config', {
    architecture: 'transformer',
    layers: 6,
    hiddenSize: 512,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    dropout: 0.1,
    usePretrainedEmbeddings: true,
    maxSequenceLength: 512
  });
  
  const [testText, setTestText] = useState(`
هذا النص مثال لتجربة نظام التصنيف الذكي للمحتوى العربي. 
يمكن للنظام تحديد الفئة المناسبة للنص، مستوى التعقيد، 
والمشاعر المرتبطة بالمحتوى بدقة عالية.
  `.trim());
  
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [modelMetrics, setModelMetrics] = useKV('arabic-classifier-metrics', {
    totalTrainingSamples: 15000,
    validationAccuracy: 0.94,
    testAccuracy: 0.92,
    f1Score: 0.93,
    precision: 0.95,
    recall: 0.91,
    trainingTime: '2.5 hours',
    modelSize: '245 MB'
  });

  const categories = [
    { name: 'سياسة', nameEn: 'Politics', color: 'bg-red-500' },
    { name: 'رياضة', nameEn: 'Sports', color: 'bg-green-500' },
    { name: 'تقنية', nameEn: 'Technology', color: 'bg-blue-500' },
    { name: 'اقتصاد', nameEn: 'Economy', color: 'bg-yellow-500' },
    { name: 'صحة', nameEn: 'Health', color: 'bg-pink-500' },
    { name: 'ثقافة', nameEn: 'Culture', color: 'bg-purple-500' },
    { name: 'محليات', nameEn: 'Local', color: 'bg-indigo-500' },
    { name: 'عالمي', nameEn: 'International', color: 'bg-gray-500' }
  ];

  const architectures = [
    { 
      id: 'transformer', 
      name: 'Transformer', 
      description: 'نموذج Transformer متقدم مع آلية الانتباه الذاتي',
      pros: ['دقة عالية', 'فهم السياق', 'معالجة متوازية'],
      complexity: 'عالي'
    },
    { 
      id: 'lstm', 
      name: 'LSTM', 
      description: 'شبكة الذاكرة طويلة المدى للنصوص المتسلسلة',
      pros: ['ذاكرة طويلة', 'سرعة تدريب', 'استهلاك ذاكرة منخفض'],
      complexity: 'متوسط'
    },
    { 
      id: 'cnn', 
      name: 'CNN', 
      description: 'الشبكة التطبيقية لاستخراج الميزات المحلية',
      pros: ['سرعة عالية', 'كفاءة حاسوبية', 'ميزات محلية'],
      complexity: 'منخفض'
    },
    { 
      id: 'hybrid', 
      name: 'Hybrid', 
      description: 'دمج متقدم بين Transformer و LSTM و CNN',
      pros: ['أفضل النتائج', 'مرونة عالية', 'تكامل الميزات'],
      complexity: 'عالي جداً'
    }
  ];

  // Simulate training process
  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress([]);
    setCurrentEpoch(0);
    
    toast.success('بدء تدريب النموذج العصبي للتصنيف العربي');
    
    for (let epoch = 1; epoch <= modelConfig!.epochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate training time
      
      const progress: TrainingProgress = {
        epoch,
        loss: Math.max(0.05, 2.5 * Math.exp(-epoch * 0.05) + Math.random() * 0.1),
        accuracy: Math.min(0.98, 0.6 + (epoch / modelConfig!.epochs) * 0.35 + Math.random() * 0.03),
        valLoss: Math.max(0.1, 2.8 * Math.exp(-epoch * 0.04) + Math.random() * 0.15),
        valAccuracy: Math.min(0.95, 0.55 + (epoch / modelConfig!.epochs) * 0.37 + Math.random() * 0.03),
        learningRate: modelConfig!.learningRate * Math.pow(0.95, Math.floor(epoch / 10))
      };
      
      setTrainingProgress(prev => [...prev, progress]);
      setCurrentEpoch(epoch);
      
      // Early stopping simulation
      if (progress.valAccuracy > 0.94 && epoch > 20) {
        toast.success(`التدريب مكتمل! تم الوصول لدقة ${(progress.valAccuracy * 100).toFixed(1)}% في العصر ${epoch}`);
        break;
      }
    }
    
    setIsTraining(false);
    
    // Update model metrics
    const finalProgress = trainingProgress[trainingProgress.length - 1];
    if (finalProgress) {
      setModelMetrics(prev => ({
        ...prev,
        validationAccuracy: finalProgress.valAccuracy,
        testAccuracy: finalProgress.valAccuracy - 0.02,
        trainingTime: `${(currentEpoch * 0.5).toFixed(1)} minutes`
      }));
    }
  };

  const stopTraining = () => {
    setIsTraining(false);
    toast.info('تم إيقاف التدريب');
  };

  // Simulate classification
  const classifyText = async () => {
    if (!testText.trim()) {
      toast.error('يرجى إدخال نص للتصنيف');
      return;
    }

    toast.info('جاري تحليل النص...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic classification results
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = 0.75 + Math.random() * 0.23;
    
    const result: ClassificationResult = {
      category: randomCategory.name,
      confidence,
      subCategories: categories
        .filter(c => c.name !== randomCategory.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(c => ({
          name: c.name,
          score: Math.random() * (1 - confidence)
        })),
      sentiment: {
        label: ['إيجابي', 'سلبي', 'محايد'][Math.floor(Math.random() * 3)],
        score: 0.6 + Math.random() * 0.3
      },
      keywords: ['تقنية', 'ذكاء اصطناعي', 'تطوير', 'نظام', 'محتوى'],
      complexity: Math.random(),
      readability: 0.3 + Math.random() * 0.6
    };
    
    setClassificationResult(result);
    toast.success('تم تصنيف النص بنجاح');
  };

  const exportModel = () => {
    const modelData = {
      config: modelConfig,
      metrics: modelMetrics,
      trainingHistory: trainingProgress,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabic-classifier-model-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير النموذج بنجاح');
  };

  const currentProgress = trainingProgress[trainingProgress.length - 1];
  const overallProgress = modelConfig ? (currentEpoch / modelConfig.epochs) * 100 : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            مصنف المحتوى العربي بالذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground mt-2">
            نظام تدريب شبكة عصبية متقدمة لتصنيف وتحليل المحتوى العربي باستخدام تقنيات التعلم العميق
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportModel}>
            <Download className="w-4 h-4 mr-2" />
            تصدير النموذج
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            استيراد نموذج
          </Button>
        </div>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">التدريب</TabsTrigger>
          <TabsTrigger value="testing">الاختبار</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
          <TabsTrigger value="config">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  التحكم في التدريب
                </CardTitle>
                <CardDescription>
                  بدء وإيقاف عملية تدريب النموذج العصبي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">حالة التدريب</h4>
                    <p className="text-sm text-muted-foreground">
                      {isTraining ? 'جاري التدريب...' : 'متوقف'}
                    </p>
                  </div>
                  <Badge variant={isTraining ? "default" : "secondary"}>
                    {isTraining ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>العصر {currentEpoch} من {modelConfig?.epochs}</span>
                      <span>{overallProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={overallProgress} className="w-full" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={startTraining} 
                    disabled={isTraining}
                    className="flex-1"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {isTraining ? 'جاري التدريب...' : 'بدء التدريب'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={stopTraining}
                    disabled={!isTraining}
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    إيقاف
                  </Button>
                </div>

                {currentProgress && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">الدقة</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(currentProgress.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">الخسارة</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentProgress.loss.toFixed(3)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  معمارية النموذج
                </CardTitle>
                <CardDescription>
                  اختيار نوع الشبكة العصبية والمعمارية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {architectures.map((arch) => (
                    <div
                      key={arch.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        modelConfig?.architecture === arch.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setModelConfig(prev => ({ ...prev!, architecture: arch.id as any }))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{arch.name}</h4>
                        <Badge variant={arch.complexity === 'عالي جداً' ? 'destructive' : 
                                      arch.complexity === 'عالي' ? 'default' : 'secondary'}>
                          {arch.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {arch.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {arch.pros.map((pro, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pro}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training History */}
          {trainingProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarHorizontal className="w-5 h-5" />
                  سجل التدريب
                </CardTitle>
                <CardDescription>
                  متابعة تطور الدقة والخسارة عبر العصور
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2">
                    {trainingProgress.slice(-10).reverse().map((progress, index) => (
                      <div
                        key={progress.epoch}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">العصر {progress.epoch}</Badge>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">
                              دقة: {(progress.accuracy * 100).toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground mx-2">|</span>
                            <span className="text-blue-600 font-medium">
                              خسارة: {progress.loss.toFixed(3)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          تحقق: {(progress.valAccuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  اختبار التصنيف
                </CardTitle>
                <CardDescription>
                  أدخل نصًا عربيًا لتجربة تصنيفه
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="أدخل النص العربي هنا للتصنيف..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="min-h-[200px] font-arabic"
                  dir="rtl"
                />
                
                <Button onClick={classifyText} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  تصنيف النص
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestText(mockArticles[0]?.content.substring(0, 300) + '...')}
                  >
                    نص تجريبي 1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestText(`
في عصر التكنولوجيا الحديثة، أصبح الذكاء الاصطناعي جزءًا لا يتجزأ من حياتنا اليومية. 
من المساعدات الصوتية إلى السيارات ذاتية القيادة، تتطور هذه التقنيات بسرعة مذهلة.
يمكن للذكاء الاصطناعي معالجة البيانات وتحليلها بطرق لم نتخيلها من قبل.
                    `.trim())}
                  >
                    نص تجريبي 2
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Classification Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  نتائج التصنيف
                </CardTitle>
                <CardDescription>
                  تفاصيل تحليل وتصنيف النص
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classificationResult ? (
                  <div className="space-y-4">
                    {/* Main Category */}
                    <div className="p-4 border rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">الفئة الرئيسية</h4>
                        <Badge className="text-lg px-3 py-1">
                          {classificationResult.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">مستوى الثقة:</span>
                        <div className="flex-1">
                          <Progress value={classificationResult.confidence * 100} />
                        </div>
                        <span className="text-sm font-medium">
                          {(classificationResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Sub Categories */}
                    <div>
                      <h4 className="font-medium mb-2">فئات فرعية محتملة</h4>
                      <div className="space-y-2">
                        {classificationResult.subCategories.map((sub, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{sub.name}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={sub.score * 100} className="w-20" />
                              <span className="text-xs text-muted-foreground">
                                {(sub.score * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Sentiment & Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">المشاعر</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            classificationResult.sentiment.label === 'إيجابي' ? 'default' :
                            classificationResult.sentiment.label === 'سلبي' ? 'destructive' : 'secondary'
                          }>
                            {classificationResult.sentiment.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {(classificationResult.sentiment.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">مستوى التعقيد</h4>
                        <Progress value={classificationResult.complexity * 100} />
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <h4 className="font-medium mb-2">الكلمات المفتاحية</h4>
                      <div className="flex flex-wrap gap-1">
                        {classificationResult.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>أدخل نصًا واضغط "تصنيف النص" لعرض النتائج</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Model Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">دقة النموذج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(modelMetrics.validationAccuracy * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">دقة التحقق</p>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">دقة الاختبار: </span>
                  <span className="font-medium">{(modelMetrics.testAccuracy * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">F1 Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {modelMetrics.f1Score.toFixed(3)}
                </div>
                <p className="text-sm text-muted-foreground">نتيجة F1</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">الدقة: </span>
                    <span className="font-medium">{modelMetrics.precision.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الاستدعاء: </span>
                    <span className="font-medium">{modelMetrics.recall.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">معلومات النموذج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">حجم النموذج</p>
                    <p className="font-medium">{modelMetrics.modelSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">وقت التدريب</p>
                    <p className="font-medium">{modelMetrics.trainingTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">عينات التدريب</p>
                    <p className="font-medium">{modelMetrics.totalTrainingSamples.toLocaleString('ar')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarHorizontal className="w-5 h-5" />
                أداء التصنيفات
              </CardTitle>
              <CardDescription>
                دقة النموذج لكل فئة من فئات المحتوى
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => {
                  const accuracy = 0.85 + Math.random() * 0.13; // Simulate different accuracies
                  return (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">({category.nameEn})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={accuracy * 100} className="w-32" />
                        <span className="text-sm font-medium w-12">
                          {(accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات النموذج المتقدمة
              </CardTitle>
              <CardDescription>
                تخصيص معاملات التدريب والمعمارية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="layers">عدد الطبقات</Label>
                    <Input
                      id="layers"
                      type="number"
                      value={modelConfig?.layers || 6}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        layers: parseInt(e.target.value) 
                      }))}
                      min="1"
                      max="24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hiddenSize">حجم الطبقة المخفية</Label>
                    <Input
                      id="hiddenSize"
                      type="number"
                      value={modelConfig?.hiddenSize || 512}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        hiddenSize: parseInt(e.target.value) 
                      }))}
                      min="64"
                      max="2048"
                      step="64"
                    />
                  </div>

                  <div>
                    <Label htmlFor="learningRate">معدل التعلم</Label>
                    <Input
                      id="learningRate"
                      type="number"
                      value={modelConfig?.learningRate || 0.001}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        learningRate: parseFloat(e.target.value) 
                      }))}
                      min="0.0001"
                      max="0.1"
                      step="0.0001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="batchSize">حجم الدفعة</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={modelConfig?.batchSize || 32}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        batchSize: parseInt(e.target.value) 
                      }))}
                      min="8"
                      max="128"
                      step="8"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="epochs">عدد العصور</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={modelConfig?.epochs || 100}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        epochs: parseInt(e.target.value) 
                      }))}
                      min="10"
                      max="500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dropout">معدل الإسقاط</Label>
                    <Input
                      id="dropout"
                      type="number"
                      value={modelConfig?.dropout || 0.1}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        dropout: parseFloat(e.target.value) 
                      }))}
                      min="0"
                      max="0.5"
                      step="0.05"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxLength">الطول الأقصى للتسلسل</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={modelConfig?.maxSequenceLength || 512}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        maxSequenceLength: parseInt(e.target.value) 
                      }))}
                      min="128"
                      max="2048"
                      step="128"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pretrained"
                      checked={modelConfig?.usePretrainedEmbeddings || true}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev!, 
                        usePretrainedEmbeddings: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="pretrained">استخدام تضمينات مدربة مسبقاً</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast.success('تم حفظ إعدادات النموذج');
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  حفظ الإعدادات
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setModelConfig({
                      architecture: 'transformer',
                      layers: 6,
                      hiddenSize: 512,
                      learningRate: 0.001,
                      batchSize: 32,
                      epochs: 100,
                      dropout: 0.1,
                      usePretrainedEmbeddings: true,
                      maxSequenceLength: 512
                    });
                    toast.info('تم إعادة تعيين الإعدادات الافتراضية');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}