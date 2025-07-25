import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Brain, 
  Cpu, 
  Zap, 
  Target, 
  TrendingUp, 
  BookOpen,
  Settings,
  Play,
  Pause,
  Square,
  Save,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Database,
  BarChart3,
  Network,
  Layers,
  Eye,
  Gauge
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Advanced neural network architecture types
interface NeuralNetworkLayer {
  type: 'dense' | 'dropout' | 'batch_norm' | 'activation' | 'attention' | 'embedding';
  units?: number;
  activation?: 'relu' | 'tanh' | 'sigmoid' | 'softmax' | 'swish' | 'gelu';
  dropout?: number;
  name: string;
  id: string;
  trainable: boolean;
}

interface NeuralNetworkArchitecture {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  layers: NeuralNetworkLayer[];
  inputShape: number[];
  outputShape: number[];
  totalParams: number;
  trainableParams: number;
  optimizer: 'adam' | 'sgd' | 'adamw' | 'rmsprop';
  learningRate: number;
  batchSize: number;
  epochs: number;
}

interface TransformerConfig {
  modelDim: number;
  numHeads: number;
  numLayers: number;
  feedforwardDim: number;
  dropout: number;
  maxSeqLength: number;
  vocabSize: number;
  embeddingDim: number;
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
  gradientNorm: number;
  timestamp: Date;
}

interface TrainingSession {
  id: string;
  architecture: NeuralNetworkArchitecture;
  status: 'preparing' | 'training' | 'paused' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  currentEpoch: number;
  totalEpochs: number;
  metrics: TrainingMetrics[];
  bestMetrics?: TrainingMetrics;
  checkpoints: string[];
  tensorboardUrl?: string;
}

// Pre-defined neural network architectures
const PREDEFINED_ARCHITECTURES: NeuralNetworkArchitecture[] = [
  {
    id: 'content_classifier',
    name: 'Content Classifier',
    nameAr: 'مصنف المحتوى',
    description: 'شبكة عصبية لتصنيف المحتوى العربي والتنبؤ بالفئات',
    layers: [
      { type: 'embedding', units: 512, name: 'embedding_layer', id: '1', trainable: true },
      { type: 'dense', units: 256, activation: 'relu', name: 'hidden_1', id: '2', trainable: true },
      { type: 'dropout', dropout: 0.3, name: 'dropout_1', id: '3', trainable: true },
      { type: 'dense', units: 128, activation: 'relu', name: 'hidden_2', id: '4', trainable: true },
      { type: 'batch_norm', name: 'batch_norm_1', id: '5', trainable: true },
      { type: 'dense', units: 64, activation: 'relu', name: 'hidden_3', id: '6', trainable: true },
      { type: 'dropout', dropout: 0.2, name: 'dropout_2', id: '7', trainable: true },
      { type: 'dense', units: 10, activation: 'softmax', name: 'output', id: '8', trainable: true }
    ],
    inputShape: [1000],
    outputShape: [10],
    totalParams: 245000,
    trainableParams: 245000,
    optimizer: 'adam',
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100
  },
  {
    id: 'engagement_predictor',
    name: 'Engagement Predictor',
    nameAr: 'متنبئ التفاعل',
    description: 'شبكة عميقة للتنبؤ بمستوى تفاعل المستخدمين مع المحتوى',
    layers: [
      { type: 'dense', units: 512, activation: 'relu', name: 'input_layer', id: '1', trainable: true },
      { type: 'batch_norm', name: 'batch_norm_1', id: '2', trainable: true },
      { type: 'dropout', dropout: 0.4, name: 'dropout_1', id: '3', trainable: true },
      { type: 'dense', units: 256, activation: 'swish', name: 'hidden_1', id: '4', trainable: true },
      { type: 'dense', units: 128, activation: 'swish', name: 'hidden_2', id: '5', trainable: true },
      { type: 'dropout', dropout: 0.3, name: 'dropout_2', id: '6', trainable: true },
      { type: 'dense', units: 64, activation: 'relu', name: 'hidden_3', id: '7', trainable: true },
      { type: 'dense', units: 1, activation: 'sigmoid', name: 'output', id: '8', trainable: true }
    ],
    inputShape: [48],
    outputShape: [1],
    totalParams: 182000,
    trainableParams: 182000,
    optimizer: 'adamw',
    learningRate: 0.0003,
    batchSize: 64,
    epochs: 150
  }
];

const TRANSFORMER_CONFIGS: Record<string, TransformerConfig> = {
  'arabic_content_transformer': {
    modelDim: 512,
    numHeads: 8,
    numLayers: 6,
    feedforwardDim: 2048,
    dropout: 0.1,
    maxSeqLength: 1024,
    vocabSize: 50000,
    embeddingDim: 512
  },
  'recommendation_transformer': {
    modelDim: 256,
    numHeads: 4,
    numLayers: 4,
    feedforwardDim: 1024,
    dropout: 0.15,
    maxSeqLength: 512,
    vocabSize: 30000,
    embeddingDim: 256
  }
};

export function NeuralNetworkTrainer() {
  const [currentSession, setCurrentSession] = useKV<TrainingSession | null>('current-training-session', null);
  const [trainingSessions, setTrainingSessions] = useKV<TrainingSession[]>('training-sessions', []);
  const [selectedArchitecture, setSelectedArchitecture] = useState<NeuralNetworkArchitecture>(PREDEFINED_ARCHITECTURES[0]);
  const [customArchitecture, setCustomArchitecture] = useState<NeuralNetworkArchitecture | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<TrainingMetrics | null>(null);
  const [visualizeArchitecture, setVisualizeArchitecture] = useState(false);
  
  // Training control state
  const [autoSaveCheckpoints, setAutoSaveCheckpoints] = useState(true);
  const [earlyStoppingPatience, setEarlyStoppingPatience] = useState(10);
  const [tensorboardEnabled, setTensorboardEnabled] = useState(true);
  
  // Refs for training simulation
  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup intervals on unmount
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, []);

  // Simulate advanced training process
  const startTraining = async () => {
    const architecture = isCustomMode && customArchitecture ? customArchitecture : selectedArchitecture;
    
    const newSession: TrainingSession = {
      id: `session_${Date.now()}`,
      architecture,
      status: 'preparing',
      startTime: new Date(),
      currentEpoch: 0,
      totalEpochs: architecture.epochs,
      metrics: [],
      checkpoints: [],
      tensorboardUrl: tensorboardEnabled ? `http://localhost:6006` : undefined
    };

    setCurrentSession(newSession);
    setTrainingSessions(prev => [...prev, newSession]);
    
    toast.success(`بدء تدريب نموذج "${architecture.nameAr}"`);

    // Simulate training preparation
    setTimeout(() => {
      setCurrentSession(prev => prev ? { ...prev, status: 'training' } : null);
      simulateTrainingProgress(newSession);
    }, 2000);
  };

  const simulateTrainingProgress = (session: TrainingSession) => {
    let currentEpoch = 0;
    const totalEpochs = session.architecture.epochs;
    const metrics: TrainingMetrics[] = [];
    let bestAccuracy = 0;

    trainingIntervalRef.current = setInterval(() => {
      if (currentEpoch >= totalEpochs) {
        completeTraining(session, metrics);
        return;
      }

      // Simulate realistic training metrics with Arabic content considerations
      const epochProgress = currentEpoch / totalEpochs;
      const loss = Math.max(0.1, 2.5 * Math.exp(-epochProgress * 3) + Math.random() * 0.2);
      const accuracy = Math.min(0.95, 0.3 + epochProgress * 0.6 + Math.random() * 0.1);
      const valLoss = loss + Math.random() * 0.1;
      const valAccuracy = Math.max(0.2, accuracy - Math.random() * 0.05);
      
      const newMetric: TrainingMetrics = {
        epoch: currentEpoch + 1,
        loss,
        accuracy,
        valLoss,
        valAccuracy,
        learningRate: session.architecture.learningRate * Math.pow(0.95, Math.floor(currentEpoch / 10)),
        gradientNorm: 1.0 + Math.random() * 0.5,
        timestamp: new Date()
      };

      metrics.push(newMetric);
      setLiveMetrics(newMetric);

      // Update session
      setCurrentSession(prev => prev ? {
        ...prev,
        currentEpoch: currentEpoch + 1,
        metrics: [...prev.metrics, newMetric],
        bestMetrics: valAccuracy > bestAccuracy ? newMetric : prev.bestMetrics
      } : null);

      if (valAccuracy > bestAccuracy) {
        bestAccuracy = valAccuracy;
        // Simulate checkpoint saving
        if (autoSaveCheckpoints && currentEpoch % 10 === 0) {
          setCurrentSession(prev => prev ? {
            ...prev,
            checkpoints: [...prev.checkpoints, `checkpoint_epoch_${currentEpoch + 1}.pt`]
          } : null);
          toast.info(`تم حفظ نقطة تفتيش في العصر ${currentEpoch + 1}`);
        }
      }

      currentEpoch++;
    }, 200); // Faster simulation for demo
  };

  const completeTraining = (session: TrainingSession, finalMetrics: TrainingMetrics[]) => {
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
    }

    const completedSession: TrainingSession = {
      ...session,
      status: 'completed',
      endTime: new Date(),
      metrics: finalMetrics,
      bestMetrics: finalMetrics.reduce((best, current) => 
        current.valAccuracy > (best?.valAccuracy || 0) ? current : best
      )
    };

    setCurrentSession(completedSession);
    setTrainingSessions(prev => 
      prev.map(s => s.id === session.id ? completedSession : s)
    );

    toast.success(`اكتمل تدريب النموذج! أفضل دقة: ${(completedSession.bestMetrics?.valAccuracy || 0 * 100).toFixed(1)}%`);
  };

  const pauseTraining = () => {
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
    }
    setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
    toast.info('تم إيقاف التدريب مؤقتاً');
  };

  const stopTraining = () => {
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
    }
    setCurrentSession(prev => prev ? { ...prev, status: 'completed', endTime: new Date() } : null);
    toast.info('تم إيقاف التدريب');
  };

  const exportModel = () => {
    if (!currentSession?.bestMetrics) return;
    
    const modelData = {
      architecture: currentSession.architecture,
      bestMetrics: currentSession.bestMetrics,
      checkpoints: currentSession.checkpoints,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.architecture.name}_model.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير النموذج بنجاح');
  };

  const createCustomLayer = () => {
    if (!customArchitecture) {
      setCustomArchitecture({
        ...selectedArchitecture,
        id: 'custom_architecture',
        name: 'Custom Architecture',
        nameAr: 'هيكل مخصص',
        layers: []
      });
    }
  };

  const addLayerToCustom = (layer: Omit<NeuralNetworkLayer, 'id'>) => {
    if (!customArchitecture) return;
    
    const newLayer: NeuralNetworkLayer = {
      ...layer,
      id: `layer_${Date.now()}`
    };
    
    setCustomArchitecture({
      ...customArchitecture,
      layers: [...customArchitecture.layers, newLayer]
    });
  };

  const ArchitectureVisualizer = ({ architecture }: { architecture: NeuralNetworkArchitecture }) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{architecture.nameAr}</h3>
        <p className="text-sm text-muted-foreground">{architecture.description}</p>
      </div>
      
      <div className="flex flex-col space-y-2 bg-muted/30 p-4 rounded-lg">
        {architecture.layers.map((layer, index) => (
          <div key={layer.id} className="flex items-center justify-between p-2 bg-background rounded border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-medium">{layer.name}</span>
              <Badge variant="outline">{layer.type}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {layer.units && `${layer.units} units`}
              {layer.activation && ` • ${layer.activation}`}
              {layer.dropout && ` • dropout: ${layer.dropout}`}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">إجمالي المعاملات:</span>
          <span className="font-medium mr-2">{architecture.totalParams.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">المعاملات القابلة للتدريب:</span>
          <span className="font-medium mr-2">{architecture.trainableParams.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const LiveMetricsDisplay = () => {
    if (!liveMetrics || !currentSession) return null;

    return (
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            مقاييس التدريب المباشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{liveMetrics.epoch}</p>
              <p className="text-xs text-muted-foreground">العصر الحالي</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{liveMetrics.loss.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">خسارة التدريب</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{(liveMetrics.accuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">دقة التدريب</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{(liveMetrics.valAccuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">دقة التحقق</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>تقدم التدريب</span>
              <span>{currentSession.currentEpoch} / {currentSession.totalEpochs}</span>
            </div>
            <Progress 
              value={(currentSession.currentEpoch / currentSession.totalEpochs) * 100} 
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
          <Brain className="w-8 h-8 text-accent" />
          تدريب الشبكات العصبية والمحولات المتقدمة
        </h1>
        <p className="text-muted-foreground text-lg">
          منصة تدريب متقدمة للنماذج العميقة باستخدام أحدث تقنيات التعلم الآلي
        </p>
      </div>

      {currentSession?.status === 'training' && <LiveMetricsDisplay />}

      <Tabs defaultValue="architectures" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="architectures">الهياكل</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
          <TabsTrigger value="transformers">المحولات</TabsTrigger>
          <TabsTrigger value="evaluation">التقييم</TabsTrigger>
        </TabsList>

        <TabsContent value="architectures" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">تصميم الشبكة العصبية</h2>
            <div className="flex items-center gap-2">
              <Switch
                checked={isCustomMode}
                onCheckedChange={setIsCustomMode}
                id="custom-mode"
              />
              <Label htmlFor="custom-mode">وضع التصميم المخصص</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  {isCustomMode ? 'تصميم مخصص' : 'هياكل جاهزة'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCustomMode ? (
                  <>
                    <Select
                      value={selectedArchitecture.id}
                      onValueChange={(value) => {
                        const arch = PREDEFINED_ARCHITECTURES.find(a => a.id === value);
                        if (arch) setSelectedArchitecture(arch);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر هيكل الشبكة" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_ARCHITECTURES.map((arch) => (
                          <SelectItem key={arch.id} value={arch.id}>
                            {arch.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>معدل التعلم</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            value={selectedArchitecture.learningRate}
                            onChange={(e) => setSelectedArchitecture({
                              ...selectedArchitecture,
                              learningRate: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>حجم الدفعة</Label>
                          <Input
                            type="number"
                            value={selectedArchitecture.batchSize}
                            onChange={(e) => setSelectedArchitecture({
                              ...selectedArchitecture,
                              batchSize: parseInt(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label>عدد العصور: {selectedArchitecture.epochs}</Label>
                        <Slider
                          value={[selectedArchitecture.epochs]}
                          onValueChange={([value]) => setSelectedArchitecture({
                            ...selectedArchitecture,
                            epochs: value
                          })}
                          max={500}
                          min={10}
                          step={10}
                        />
                      </div>

                      <Select
                        value={selectedArchitecture.optimizer}
                        onValueChange={(value: any) => setSelectedArchitecture({
                          ...selectedArchitecture,
                          optimizer: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المحسن" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adam">Adam</SelectItem>
                          <SelectItem value="adamw">AdamW</SelectItem>
                          <SelectItem value="sgd">SGD</SelectItem>
                          <SelectItem value="rmsprop">RMSprop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={createCustomLayer} variant="outline" className="w-full">
                      <Layers className="w-4 h-4 mr-2" />
                      إنشاء هيكل مخصص
                    </Button>
                    
                    {customArchitecture && (
                      <div className="space-y-2">
                        <h4 className="font-medium">إضافة طبقة جديدة</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addLayerToCustom({
                              type: 'dense',
                              units: 128,
                              activation: 'relu',
                              name: `dense_${customArchitecture.layers.length + 1}`,
                              trainable: true
                            })}
                          >
                            طبقة كثيفة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addLayerToCustom({
                              type: 'dropout',
                              dropout: 0.2,
                              name: `dropout_${customArchitecture.layers.length + 1}`,
                              trainable: true
                            })}
                          >
                            طبقة إسقاط
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  مخطط الهيكل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ArchitectureVisualizer 
                  architecture={isCustomMode && customArchitecture ? customArchitecture : selectedArchitecture} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                التحكم في التدريب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">حفظ تلقائي</Label>
                    <Switch
                      id="auto-save"
                      checked={autoSaveCheckpoints}
                      onCheckedChange={setAutoSaveCheckpoints}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tensorboard">TensorBoard</Label>
                    <Switch
                      id="tensorboard"
                      checked={tensorboardEnabled}
                      onCheckedChange={setTensorboardEnabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>صبر الإيقاف المبكر: {earlyStoppingPatience}</Label>
                  <Slider
                    value={[earlyStoppingPatience]}
                    onValueChange={([value]) => setEarlyStoppingPatience(value)}
                    max={50}
                    min={5}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    الحالة الحالية
                  </div>
                  <Badge variant={
                    currentSession?.status === 'training' ? 'default' :
                    currentSession?.status === 'completed' ? 'outline' :
                    currentSession?.status === 'paused' ? 'secondary' : 'destructive'
                  }>
                    {currentSession?.status === 'training' ? 'جاري التدريب' :
                     currentSession?.status === 'completed' ? 'مكتمل' :
                     currentSession?.status === 'paused' ? 'متوقف' :
                     currentSession?.status === 'preparing' ? 'جاري التحضير' : 'غير نشط'}
                  </Badge>
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
                
                {currentSession?.status === 'completed' && (
                  <Button onClick={exportModel} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير النموذج
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
                    <span className="text-muted-foreground">وقت البدء:</span>
                    <p className="font-medium">
                      {currentSession.startTime?.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">العصر الحالي:</span>
                    <p className="font-medium">{currentSession.currentEpoch} / {currentSession.totalEpochs}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">نقاط التفتيش:</span>
                    <p className="font-medium">{currentSession.checkpoints.length}</p>
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
                  <BarChart3 className="w-5 h-5" />
                  منحنيات التدريب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentSession && currentSession.metrics.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-center text-sm text-muted-foreground">
                        آخر 10 عصور
                      </div>
                      {currentSession.metrics.slice(-10).map((metric, index) => (
                        <div key={index} className="flex justify-between text-xs border-b pb-1">
                          <span>العصر {metric.epoch}</span>
                          <span>دقة: {(metric.valAccuracy * 100).toFixed(1)}%</span>
                          <span>خسارة: {metric.valLoss.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gauge className="w-12 h-12 mx-auto mb-2" />
                      <p>لا توجد بيانات تدريب حالياً</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  أفضل النتائج
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSession?.bestMetrics ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {(currentSession.bestMetrics.valAccuracy * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">أفضل دقة</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-blue-600">
                          {currentSession.bestMetrics.valLoss.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">أقل خسارة</p>
                      </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      العصر {currentSession.bestMetrics.epoch}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>لا توجد نتائج بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                سجل جلسات التدريب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trainingSessions.length > 0 ? (
                  trainingSessions.slice(-5).reverse().map((session) => (
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
                            دقة: {(session.bestMetrics.valAccuracy * 100).toFixed(1)}%
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

        <TabsContent value="transformers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                نماذج المحولات للمحتوى العربي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(TRANSFORMER_CONFIGS).map(([key, config]) => (
                  <div key={key} className="space-y-3 border rounded-lg p-4">
                    <h3 className="font-semibold">
                      {key === 'arabic_content_transformer' ? 'محول المحتوى العربي' : 'محول التوصيات'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>أبعاد النموذج: {config.modelDim}</div>
                      <div>رؤوس الانتباه: {config.numHeads}</div>
                      <div>عدد الطبقات: {config.numLayers}</div>
                      <div>طول السلسلة: {config.maxSeqLength}</div>
                      <div>حجم المفردات: {config.vocabSize.toLocaleString()}</div>
                      <div>معدل الإسقاط: {config.dropout}</div>
                    </div>
                    <Button size="sm" className="w-full">
                      <Brain className="w-4 h-4 mr-2" />
                      تدريب المحول
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                تقييم النماذج المدربة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">قيد التطوير</h3>
                <p>سيتم إضافة أدوات تقييم متقدمة للنماذج المدربة</p>
                <p className="text-sm mt-2">تشمل: اختبار A/B، تحليل الأخطاء، مقاييس الأداء المخصصة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}