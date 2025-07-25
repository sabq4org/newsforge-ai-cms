import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Lightning, 
  Globe, 
  BookOpen, 
  Target,
  Activity,
  Zap,
  Cpu,
  Database,
  ChartBarHorizontal,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  Settings,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface TransformerArchitecture {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  config: {
    modelDim: number;
    numHeads: number;
    numLayers: number;
    feedforwardDim: number;
    dropout: number;
    maxSeqLength: number;
    vocabSize: number;
    embeddingDim: number;
    positionEncoding: 'sinusoidal' | 'learned';
    attentionType: 'multi_head' | 'sparse' | 'local' | 'global';
    activationFunction: 'relu' | 'gelu' | 'swish';
  };
  specialized: {
    arabicSupport: boolean;
    rtlOptimized: boolean;
    dialectSupport: boolean;
    diacriticsHandling: boolean;
    morphologyAware: boolean;
  };
}

interface TrainingConfig {
  batchSize: number;
  learningRate: number;
  warmupSteps: number;
  maxSteps: number;
  weightDecay: number;
  gradientClipping: number;
  scheduler: 'cosine' | 'linear' | 'polynomial';
  optimizer: 'adam' | 'adamw' | 'adafactor';
}

interface TransformerMetrics {
  step: number;
  epoch: number;
  loss: number;
  perplexity: number;
  bleuScore?: number;
  rougeScore?: number;
  bertScore?: number;
  arabicSpecific: {
    diacriticsAccuracy?: number;
    morphologyScore?: number;
    dialectDetectionF1?: number;
    sentimentAccuracy?: number;
  };
  attention: {
    headEntropy: number[];
    layerNorms: number[];
    gradientFlow: number[];
  };
  timestamp: Date;
}

interface TransformerSession {
  id: string;
  architecture: TransformerArchitecture;
  config: TrainingConfig;
  status: 'preparing' | 'training' | 'evaluating' | 'completed' | 'failed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  metrics: TransformerMetrics[];
  bestMetrics?: TransformerMetrics;
  checkpoints: string[];
  attentionMaps?: any[];
}

// Pre-defined transformer architectures optimized for Arabic
const TRANSFORMER_ARCHITECTURES: TransformerArchitecture[] = [
  {
    id: 'arabaic_bert_base',
    name: 'Arabic BERT Base',
    nameAr: 'بيرت العربي الأساسي',
    description: 'نموذج بيرت محسّن للنصوص العربية مع دعم التشكيل والصرف',
    config: {
      modelDim: 768,
      numHeads: 12,
      numLayers: 12,
      feedforwardDim: 3072,
      dropout: 0.1,
      maxSeqLength: 512,
      vocabSize: 50000,
      embeddingDim: 768,
      positionEncoding: 'learned',
      attentionType: 'multi_head',
      activationFunction: 'gelu'
    },
    specialized: {
      arabicSupport: true,
      rtlOptimized: true,
      dialectSupport: true,
      diacriticsHandling: true,
      morphologyAware: true
    }
  },
  {
    id: 'arabic_gpt_medium',
    name: 'Arabic GPT Medium',
    nameAr: 'جي بي تي العربي المتوسط',
    description: 'نموذج توليدي للنصوص العربية مع فهم السياق والأسلوب',
    config: {
      modelDim: 1024,
      numHeads: 16,
      numLayers: 24,
      feedforwardDim: 4096,
      dropout: 0.1,
      maxSeqLength: 1024,
      vocabSize: 60000,
      embeddingDim: 1024,
      positionEncoding: 'sinusoidal',
      attentionType: 'multi_head',
      activationFunction: 'swish'
    },
    specialized: {
      arabicSupport: true,
      rtlOptimized: true,
      dialectSupport: true,
      diacriticsHandling: true,
      morphologyAware: true
    }
  },
  {
    id: 'news_classifier_transformer',
    name: 'News Classification Transformer',
    nameAr: 'محول تصنيف الأخبار',
    description: 'محول مخصص لتصنيف المقالات الإخبارية العربية وتحليل المشاعر',
    config: {
      modelDim: 512,
      numHeads: 8,
      numLayers: 6,
      feedforwardDim: 2048,
      dropout: 0.15,
      maxSeqLength: 512,
      vocabSize: 30000,
      embeddingDim: 512,
      positionEncoding: 'learned',
      attentionType: 'multi_head',
      activationFunction: 'relu'
    },
    specialized: {
      arabicSupport: true,
      rtlOptimized: true,
      dialectSupport: false,
      diacriticsHandling: false,
      morphologyAware: true
    }
  },
  {
    id: 'recommendation_transformer',
    name: 'Content Recommendation Transformer',
    nameAr: 'محول توصيات المحتوى',
    description: 'محول متقدم لفهم تفضيلات المستخدمين وتوصية المحتوى المناسب',
    config: {
      modelDim: 384,
      numHeads: 6,
      numLayers: 4,
      feedforwardDim: 1536,
      dropout: 0.1,
      maxSeqLength: 256,
      vocabSize: 25000,
      embeddingDim: 384,
      positionEncoding: 'learned',
      attentionType: 'sparse',
      activationFunction: 'gelu'
    },
    specialized: {
      arabicSupport: true,
      rtlOptimized: true,
      dialectSupport: true,
      diacriticsHandling: false,
      morphologyAware: false
    }
  }
];

export function TransformerTrainingStudio() {
  const [currentSession, setCurrentSession] = useKV<TransformerSession | null>('transformer-session', null);
  const [transformerSessions, setTransformerSessions] = useKV<TransformerSession[]>('transformer-sessions', []);
  const [selectedArchitecture, setSelectedArchitecture] = useState<TransformerArchitecture>(TRANSFORMER_ARCHITECTURES[0]);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    batchSize: 16,
    learningRate: 5e-4,
    warmupSteps: 1000,
    maxSteps: 50000,
    weightDecay: 0.01,
    gradientClipping: 1.0,
    scheduler: 'cosine',
    optimizer: 'adamw'
  });
  const [liveMetrics, setLiveMetrics] = useState<TransformerMetrics | null>(null);
  const [testText, setTestText] = useState('هذا نص تجريبي لاختبار قدرة النموذج على فهم اللغة العربية وتحليلها بدقة عالية.');
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

  useEffect(() => {
    // Simulate real-time training if session is active
    if (currentSession?.status === 'training') {
      const interval = setInterval(() => {
        simulateTrainingStep();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentSession?.status]);

  const simulateTrainingStep = () => {
    if (!currentSession || currentSession.status !== 'training') return;

    const progress = currentSession.currentStep / currentSession.totalSteps;
    
    // Simulate realistic transformer training metrics
    const loss = Math.max(0.5, 4.0 * Math.exp(-progress * 2) + Math.random() * 0.3);
    const perplexity = Math.exp(loss);
    
    const newMetric: TransformerMetrics = {
      step: currentSession.currentStep + 1,
      epoch: Math.floor((currentSession.currentStep + 1) / 1000) + 1,
      loss,
      perplexity,
      bleuScore: Math.min(0.9, 0.2 + progress * 0.6 + Math.random() * 0.1),
      rougeScore: Math.min(0.85, 0.3 + progress * 0.5 + Math.random() * 0.1),
      bertScore: Math.min(0.92, 0.4 + progress * 0.4 + Math.random() * 0.1),
      arabicSpecific: {
        diacriticsAccuracy: selectedArchitecture.specialized.diacriticsHandling 
          ? Math.min(0.95, 0.6 + progress * 0.3 + Math.random() * 0.05) 
          : undefined,
        morphologyScore: selectedArchitecture.specialized.morphologyAware 
          ? Math.min(0.88, 0.5 + progress * 0.3 + Math.random() * 0.08) 
          : undefined,
        dialectDetectionF1: selectedArchitecture.specialized.dialectSupport 
          ? Math.min(0.82, 0.4 + progress * 0.35 + Math.random() * 0.07) 
          : undefined,
        sentimentAccuracy: Math.min(0.9, 0.6 + progress * 0.25 + Math.random() * 0.05)
      },
      attention: {
        headEntropy: Array.from({ length: selectedArchitecture.config.numHeads }, () => Math.random() * 2 + 1),
        layerNorms: Array.from({ length: selectedArchitecture.config.numLayers }, () => Math.random() * 0.5 + 0.5),
        gradientFlow: Array.from({ length: selectedArchitecture.config.numLayers }, () => Math.random() * 1.5 + 0.5)
      },
      timestamp: new Date()
    };

    setLiveMetrics(newMetric);
    
    setCurrentSession(prev => {
      if (!prev) return null;
      
      const updatedMetrics = [...prev.metrics, newMetric];
      const isBest = !prev.bestMetrics || newMetric.loss < prev.bestMetrics.loss;
      
      return {
        ...prev,
        currentStep: prev.currentStep + 1,
        metrics: updatedMetrics,
        bestMetrics: isBest ? newMetric : prev.bestMetrics
      };
    });

    // Check if training is complete
    if (currentSession.currentStep + 1 >= currentSession.totalSteps) {
      completeTraining();
    }
  };

  const startTraining = () => {
    const newSession: TransformerSession = {
      id: `transformer_${Date.now()}`,
      architecture: selectedArchitecture,
      config: trainingConfig,
      status: 'preparing',
      startTime: new Date(),
      currentStep: 0,
      totalSteps: trainingConfig.maxSteps,
      metrics: [],
      checkpoints: []
    };

    setCurrentSession(newSession);
    setTransformerSessions(prev => [...prev, newSession]);
    
    toast.success(`بدء تدريب محول "${selectedArchitecture.nameAr}"`);

    // Start training after preparation
    setTimeout(() => {
      setCurrentSession(prev => prev ? { ...prev, status: 'training' } : null);
    }, 2000);
  };

  const pauseTraining = () => {
    setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
    toast.info('تم إيقاف التدريب مؤقتاً');
  };

  const resumeTraining = () => {
    setCurrentSession(prev => prev ? { ...prev, status: 'training' } : null);
    toast.info('تم استئناف التدريب');
  };

  const stopTraining = () => {
    setCurrentSession(prev => prev ? { 
      ...prev, 
      status: 'completed', 
      endTime: new Date() 
    } : null);
    toast.info('تم إيقاف التدريب نهائياً');
  };

  const completeTraining = () => {
    setCurrentSession(prev => prev ? {
      ...prev,
      status: 'completed',
      endTime: new Date()
    } : null);
    toast.success('اكتمل تدريب المحول بنجاح!');
  };

  const evaluateModel = async () => {
    if (!currentSession?.bestMetrics) return;
    
    setCurrentSession(prev => prev ? { ...prev, status: 'evaluating' } : null);
    
    // Simulate evaluation process
    setTimeout(() => {
      const results = {
        overallScore: 0.87,
        taskSpecific: {
          textClassification: 0.89,
          sentimentAnalysis: 0.84,
          namedEntityRecognition: 0.91,
          textGeneration: 0.82
        },
        arabicSpecific: {
          diacritizationAccuracy: selectedArchitecture.specialized.diacriticsHandling ? 0.93 : null,
          morphologicalAnalysis: selectedArchitecture.specialized.morphologyAware ? 0.88 : null,
          dialectClassification: selectedArchitecture.specialized.dialectSupport ? 0.79 : null
        },
        efficiency: {
          inferenceSpeed: `${Math.random() * 50 + 10} tokens/sec`,
          memoryUsage: `${Math.random() * 2 + 1} GB`,
          modelSize: `${selectedArchitecture.config.modelDim * selectedArchitecture.config.numLayers / 1000} MB`
        }
      };
      
      setEvaluationResults(results);
      setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
      toast.success('اكتمل تقييم النموذج');
    }, 3000);
  };

  const testModelInference = async () => {
    if (!testText.trim()) return;
    
    // Simulate model inference
    const mockResults = {
      input: testText,
      tokenCount: testText.split(' ').length,
      predictions: [
        { label: 'إيجابي', confidence: 0.87 },
        { label: 'محايد', confidence: 0.11 },
        { label: 'سلبي', confidence: 0.02 }
      ],
      entities: [
        { text: 'العربية', type: 'LANGUAGE', start: 12, end: 19 },
        { text: 'النموذج', type: 'TECHNOLOGY', start: 25, end: 32 }
      ],
      attentionWeights: Array.from({ length: selectedArchitecture.config.numHeads }, 
        () => Array.from({ length: 10 }, () => Math.random())
      )
    };

    toast.success('تم اختبار النموذج بنجاح');
    return mockResults;
  };

  const ArchitectureCard = ({ arch, isSelected, onSelect }: { 
    arch: TransformerArchitecture; 
    isSelected: boolean; 
    onSelect: () => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-accent' : ''}`}
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle className="text-lg">{arch.nameAr}</CardTitle>
        <p className="text-sm text-muted-foreground">{arch.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>أبعاد: {arch.config.modelDim}</div>
          <div>طبقات: {arch.config.numLayers}</div>
          <div>رؤوس: {arch.config.numHeads}</div>
          <div>مفردات: {arch.config.vocabSize.toLocaleString()}</div>
        </div>
        
        <div className="space-y-1">
          <h4 className="font-medium text-sm">المزايا المتخصصة:</h4>
          <div className="flex flex-wrap gap-1">
            {arch.specialized.arabicSupport && <Badge variant="secondary" className="text-xs">عربي</Badge>}
            {arch.specialized.rtlOptimized && <Badge variant="secondary" className="text-xs">RTL</Badge>}
            {arch.specialized.dialectSupport && <Badge variant="secondary" className="text-xs">لهجات</Badge>}
            {arch.specialized.diacriticsHandling && <Badge variant="secondary" className="text-xs">تشكيل</Badge>}
            {arch.specialized.morphologyAware && <Badge variant="secondary" className="text-xs">صرف</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LiveTrainingMonitor = () => {
    if (!currentSession || !liveMetrics) return null;

    return (
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            مراقبة التدريب المباشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{liveMetrics.step.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">خطوة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{liveMetrics.loss.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">خسارة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{liveMetrics.perplexity.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">حيرة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {liveMetrics.bleuScore ? (liveMetrics.bleuScore * 100).toFixed(1) : '--'}%
              </p>
              <p className="text-xs text-muted-foreground">BLEU</p>
            </div>
          </div>

          {selectedArchitecture.specialized.arabicSupport && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">مقاييس العربية المتخصصة:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {liveMetrics.arabicSpecific.diacriticsAccuracy && (
                  <div>
                    <span className="text-muted-foreground">دقة التشكيل:</span>
                    <span className="font-medium mr-1">
                      {(liveMetrics.arabicSpecific.diacriticsAccuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {liveMetrics.arabicSpecific.morphologyScore && (
                  <div>
                    <span className="text-muted-foreground">تحليل صرفي:</span>
                    <span className="font-medium mr-1">
                      {(liveMetrics.arabicSpecific.morphologyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {liveMetrics.arabicSpecific.dialectDetectionF1 && (
                  <div>
                    <span className="text-muted-foreground">كشف اللهجة:</span>
                    <span className="font-medium mr-1">
                      {(liveMetrics.arabicSpecific.dialectDetectionF1 * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>تقدم التدريب</span>
              <span>{currentSession.currentStep.toLocaleString()} / {currentSession.totalSteps.toLocaleString()}</span>
            </div>
            <Progress 
              value={(currentSession.currentStep / currentSession.totalSteps) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Lightning className="w-8 h-8 text-accent" />
          استوديو تدريب المحولات المتقدمة
        </h1>
        <p className="text-muted-foreground text-lg">
          تدريب نماذج المحولات (Transformers) المخصصة للغة العربية والمحتوى الإخباري
        </p>
      </div>

      {currentSession?.status === 'training' && <LiveTrainingMonitor />}

      <Tabs defaultValue="architectures" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="architectures">الهياكل</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
          <TabsTrigger value="evaluation">التقييم</TabsTrigger>
          <TabsTrigger value="inference">الاستنتاج</TabsTrigger>
        </TabsList>

        <TabsContent value="architectures" className="space-y-6">
          <h2 className="text-xl font-semibold">اختيار هيكل المحول</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRANSFORMER_ARCHITECTURES.map((arch) => (
              <ArchitectureCard
                key={arch.id}
                arch={arch}
                isSelected={selectedArchitecture.id === arch.id}
                onSelect={() => setSelectedArchitecture(arch)}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                تفاصيل الهيكل المختار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>أبعاد النموذج</Label>
                  <Input
                    type="number"
                    value={selectedArchitecture.config.modelDim}
                    onChange={(e) => setSelectedArchitecture({
                      ...selectedArchitecture,
                      config: { ...selectedArchitecture.config, modelDim: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label>عدد الرؤوس</Label>
                  <Input
                    type="number"
                    value={selectedArchitecture.config.numHeads}
                    onChange={(e) => setSelectedArchitecture({
                      ...selectedArchitecture,
                      config: { ...selectedArchitecture.config, numHeads: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label>عدد الطبقات</Label>
                  <Input
                    type="number"
                    value={selectedArchitecture.config.numLayers}
                    onChange={(e) => setSelectedArchitecture({
                      ...selectedArchitecture,
                      config: { ...selectedArchitecture.config, numLayers: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label>طول السلسلة الأقصى</Label>
                  <Input
                    type="number"
                    value={selectedArchitecture.config.maxSeqLength}
                    onChange={(e) => setSelectedArchitecture({
                      ...selectedArchitecture,
                      config: { ...selectedArchitecture.config, maxSeqLength: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>معدل الإسقاط: {selectedArchitecture.config.dropout}</Label>
                <Slider
                  value={[selectedArchitecture.config.dropout]}
                  onValueChange={([value]) => setSelectedArchitecture({
                    ...selectedArchitecture,
                    config: { ...selectedArchitecture.config, dropout: value }
                  })}
                  max={0.5}
                  min={0}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                إعدادات التدريب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>حجم الدفعة</Label>
                  <Input
                    type="number"
                    value={trainingConfig.batchSize}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      batchSize: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>معدل التعلم</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={trainingConfig.learningRate}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      learningRate: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>خطوات الإحماء</Label>
                  <Input
                    type="number"
                    value={trainingConfig.warmupSteps}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      warmupSteps: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>أقصى خطوات</Label>
                  <Input
                    type="number"
                    value={trainingConfig.maxSteps}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      maxSteps: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المحسن</Label>
                  <Select
                    value={trainingConfig.optimizer}
                    onValueChange={(value: any) => setTrainingConfig({
                      ...trainingConfig,
                      optimizer: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adamw">AdamW</SelectItem>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="adafactor">Adafactor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>جدولة التعلم</Label>
                  <Select
                    value={trainingConfig.scheduler}
                    onValueChange={(value: any) => setTrainingConfig({
                      ...trainingConfig,
                      scheduler: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cosine">Cosine</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="polynomial">Polynomial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={startTraining}
                  disabled={currentSession?.status === 'training' || currentSession?.status === 'preparing'}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  بدء التدريب
                </Button>
                
                {currentSession?.status === 'training' && (
                  <>
                    <Button onClick={pauseTraining} variant="outline" className="gap-2">
                      <Pause className="w-4 h-4" />
                      إيقاف مؤقت
                    </Button>
                    <Button onClick={stopTraining} variant="destructive" className="gap-2">
                      <Square className="w-4 h-4" />
                      إيقاف نهائي
                    </Button>
                  </>
                )}

                {currentSession?.status === 'paused' && (
                  <Button onClick={resumeTraining} className="gap-2">
                    <Play className="w-4 h-4" />
                    استئناف
                  </Button>
                )}

                {currentSession?.status === 'completed' && (
                  <Button onClick={evaluateModel} variant="outline" className="gap-2">
                    <Target className="w-4 h-4" />
                    تقييم النموذج
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الجلسة الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">النموذج:</span>
                    <p className="font-medium">{currentSession.architecture.nameAr}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الحالة:</span>
                    <Badge variant={
                      currentSession.status === 'training' ? 'default' :
                      currentSession.status === 'completed' ? 'outline' :
                      currentSession.status === 'paused' ? 'secondary' : 'destructive'
                    }>
                      {currentSession.status === 'training' ? 'جاري التدريب' :
                       currentSession.status === 'completed' ? 'مكتمل' :
                       currentSession.status === 'paused' ? 'متوقف' :
                       currentSession.status === 'preparing' ? 'جاري التحضير' :
                       currentSession.status === 'evaluating' ? 'جاري التقييم' : 'غير نشط'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الخطوة الحالية:</span>
                    <p className="font-medium">{currentSession.currentStep.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">وقت البدء:</span>
                    <p className="font-medium">
                      {currentSession.startTime?.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarHorizontal className="w-5 h-5" />
                  منحنيات التدريب
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSession && currentSession.metrics.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-muted-foreground">
                      آخر 10 خطوات
                    </div>
                    {currentSession.metrics.slice(-10).map((metric, index) => (
                      <div key={index} className="flex justify-between text-xs border-b pb-1">
                        <span>خطوة {metric.step}</span>
                        <span>خسارة: {metric.loss.toFixed(4)}</span>
                        <span>حيرة: {metric.perplexity.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <p>لا توجد بيانات تدريب</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  تحليل آلية الانتباه
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveMetrics?.attention ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">إنتروبيا رؤوس الانتباه</h4>
                      <div className="grid grid-cols-4 gap-1">
                        {liveMetrics.attention.headEntropy.map((entropy, i) => (
                          <div key={i} className="text-center p-1 border rounded text-xs">
                            <div>رأس {i + 1}</div>
                            <div className="font-medium">{entropy.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">تدفق التدرجات</h4>
                      <div className="space-y-1">
                        {liveMetrics.attention.gradientFlow.slice(0, 6).map((flow, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-16">طبقة {i + 1}</span>
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all"
                                style={{ width: `${Math.min(100, flow * 50)}%` }}
                              />
                            </div>
                            <span className="w-12">{flow.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-2" />
                    <p>لا توجد بيانات انتباه</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سجل جلسات التدريب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transformerSessions.length > 0 ? (
                  transformerSessions.slice(-5).reverse().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{session.architecture.nameAr}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.startTime?.toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.bestMetrics && (
                          <span className="text-sm">
                            خسارة: {session.bestMetrics.loss.toFixed(4)}
                          </span>
                        )}
                        <Badge variant={
                          session.status === 'completed' ? 'default' :
                          session.status === 'training' ? 'secondary' : 'outline'
                        }>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="w-12 h-12 mx-auto mb-2" />
                    <p>لا توجد جلسات تدريب سابقة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                تقييم النموذج المدرب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluationResults ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">
                      {(evaluationResults.overallScore * 100).toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground">النتيجة الإجمالية</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(evaluationResults.taskSpecific).map(([task, score]) => (
                      <div key={task} className="text-center p-3 border rounded">
                        <p className="text-xl font-bold">{((score as number) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {task === 'textClassification' ? 'تصنيف النص' :
                           task === 'sentimentAnalysis' ? 'تحليل المشاعر' :
                           task === 'namedEntityRecognition' ? 'استخراج الكيانات' :
                           task === 'textGeneration' ? 'توليد النص' : task}
                        </p>
                      </div>
                    ))}
                  </div>

                  {evaluationResults.arabicSpecific && (
                    <div>
                      <h3 className="font-semibold mb-3">مقاييس العربية المتخصصة</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(evaluationResults.arabicSpecific).map(([metric, score]) => {
                          if (!score) return null;
                          return (
                            <div key={metric} className="text-center p-3 border rounded">
                              <p className="text-lg font-bold">{((score as number) * 100).toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">
                                {metric === 'diacritizationAccuracy' ? 'دقة التشكيل' :
                                 metric === 'morphologicalAnalysis' ? 'التحليل الصرفي' :
                                 metric === 'dialectClassification' ? 'تصنيف اللهجة' : metric}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">معلومات الكفاءة</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">سرعة الاستنتاج:</span>
                        <p className="font-medium">{evaluationResults.efficiency.inferenceSpeed}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">استخدام الذاكرة:</span>
                        <p className="font-medium">{evaluationResults.efficiency.memoryUsage}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">حجم النموذج:</span>
                        <p className="font-medium">{evaluationResults.efficiency.modelSize}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد نتائج تقييم</h3>
                  <p className="text-muted-foreground mb-4">
                    يرجى إكمال تدريب النموذج أولاً ثم تشغيل التقييم
                  </p>
                  <Button 
                    onClick={evaluateModel}
                    disabled={!currentSession?.bestMetrics || currentSession.status === 'evaluating'}
                  >
                    {currentSession?.status === 'evaluating' ? 'جاري التقييم...' : 'بدء التقييم'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                اختبار النموذج المدرب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>النص التجريبي</Label>
                <Textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="أدخل نصاً عربياً لاختبار النموذج..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={testModelInference}
                disabled={!currentSession?.bestMetrics || !testText.trim()}
                className="w-full"
              >
                <Lightning className="w-4 h-4 mr-2" />
                اختبار النموذج
              </Button>

              {/* Results would be displayed here */}
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-2" />
                <p>ستظهر نتائج الاختبار هنا بعد تشغيل النموذج</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}