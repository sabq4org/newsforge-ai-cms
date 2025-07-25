import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Cpu, 
  Database, 
  Target, 
  TrendingUp,
  Activity,
  Zap,
  Settings,
  BookOpen,
  BarChart3,
  Network,
  Layers,
  FlowArrow,
  Lightning,
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  Eye,
  Gauge,
  Rocket
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Import the individual training modules
import { NeuralNetworkTrainer } from './NeuralNetworkTrainer';
import { TransformerTrainingStudio } from './TransformerTrainingStudio';

interface Pipeline {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  type: 'end_to_end' | 'feature_engineering' | 'model_ensemble' | 'hyperparameter_optimization';
  stages: PipelineStage[];
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  currentStage: number;
  totalStages: number;
  metrics: PipelineMetrics;
  startTime?: Date;
  endTime?: Date;
}

interface PipelineStage {
  id: string;
  name: string;
  nameAr: string;
  type: 'data_preprocessing' | 'feature_extraction' | 'model_training' | 'evaluation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  progress: number;
  config: any;
  results?: any;
}

interface PipelineMetrics {
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  auc: number;
  loss: number;
  trainingTime: number;
  inferenceTime: number;
  modelSize: number;
  computeEfficiency: number;
}

interface AutoMLExperiment {
  id: string;
  name: string;
  nameAr: string;
  objective: 'classification' | 'regression' | 'text_generation' | 'recommendation';
  searchSpace: {
    architectures: string[];
    optimizers: string[];
    learningRates: number[];
    batchSizes: number[];
    epochs: number[];
  };
  budget: {
    maxTrials: number;
    maxTime: number; // in minutes
    maxCompute: number; // in GPU hours
  };
  status: 'configuring' | 'running' | 'completed' | 'failed';
  trials: AutoMLTrial[];
  bestTrial?: AutoMLTrial;
  currentTrial: number;
}

interface AutoMLTrial {
  id: string;
  trialNumber: number;
  hyperparameters: Record<string, any>;
  metrics: PipelineMetrics;
  status: 'running' | 'completed' | 'failed' | 'pruned';
  duration: number;
  startTime: Date;
  endTime?: Date;
}

const PREDEFINED_PIPELINES: Omit<Pipeline, 'id' | 'status' | 'currentStage' | 'totalStages' | 'metrics'>[] = [
  {
    name: 'Arabic Content Classification Pipeline',
    nameAr: 'خط تصنيف المحتوى العربي',
    description: 'خط إنتاج متكامل لمعالجة وتصنيف النصوص العربية باستخدام الشبكات العصبية العميقة',
    type: 'end_to_end',
    stages: [
      {
        id: 'stage_1',
        name: 'Data Preprocessing',
        nameAr: 'معالجة البيانات الأولية',
        type: 'data_preprocessing',
        status: 'pending',
        progress: 0,
        config: {
          tokenization: 'arabic_bert',
          normalization: true,
          diacriticsRemoval: false,
          stemming: true,
          stopWordsRemoval: true
        }
      },
      {
        id: 'stage_2',
        name: 'Feature Engineering',
        nameAr: 'هندسة الخصائص',
        type: 'feature_extraction',
        status: 'pending',
        progress: 0,
        config: {
          embeddings: 'fasttext_arabic',
          tfidf: true,
          nGrams: [1, 2, 3],
          contextualEmbeddings: true
        }
      },
      {
        id: 'stage_3',
        name: 'Model Training',
        nameAr: 'تدريب النموذج',
        type: 'model_training',
        status: 'pending',
        progress: 0,
        config: {
          modelType: 'transformer',
          architecture: 'arabic_bert_base',
          batchSize: 32,
          learningRate: 2e-5,
          epochs: 10
        }
      },
      {
        id: 'stage_4',
        name: 'Model Evaluation',
        nameAr: 'تقييم النموذج',
        type: 'evaluation',
        status: 'pending',
        progress: 0,
        config: {
          metrics: ['accuracy', 'f1_macro', 'precision', 'recall'],
          crossValidation: 5,
          testSplit: 0.2
        }
      },
      {
        id: 'stage_5',
        name: 'Model Deployment',
        nameAr: 'نشر النموذج',
        type: 'deployment',
        status: 'pending',
        progress: 0,
        config: {
          platform: 'api_endpoint',
          optimization: true,
          quantization: '8bit',
          caching: true
        }
      }
    ]
  },
  {
    name: 'Recommendation System Pipeline',
    nameAr: 'خط نظام التوصيات',
    description: 'خط إنتاج متطور لبناء نظام توصيات ذكي باستخدام التعلم العميق والتعلم التعزيزي',
    type: 'end_to_end',
    stages: [
      {
        id: 'stage_1',
        name: 'User Behavior Analysis',
        nameAr: 'تحليل سلوك المستخدم',
        type: 'data_preprocessing',
        status: 'pending',
        progress: 0,
        config: {
          sessionTracking: true,
          clickstreamAnalysis: true,
          temporalFeatures: true,
          demographicFeatures: true
        }
      },
      {
        id: 'stage_2',
        name: 'Content Feature Extraction',
        nameAr: 'استخراج خصائص المحتوى',
        type: 'feature_extraction',
        status: 'pending',
        progress: 0,
        config: {
          textFeatures: true,
          imageFeatures: true,
          metadataFeatures: true,
          semanticEmbeddings: true
        }
      },
      {
        id: 'stage_3',
        name: 'Collaborative Filtering',
        nameAr: 'الترشيح التعاوني',
        type: 'model_training',
        status: 'pending',
        progress: 0,
        config: {
          algorithm: 'neural_collaborative_filtering',
          embeddingDim: 128,
          hiddenLayers: [256, 128, 64],
          regularization: 0.01
        }
      },
      {
        id: 'stage_4',
        name: 'Deep Learning Model',
        nameAr: 'نموذج التعلم العميق',
        type: 'model_training',
        status: 'pending',
        progress: 0,
        config: {
          modelType: 'transformer_recommender',
          sequenceLength: 50,
          attentionHeads: 8,
          layers: 6
        }
      },
      {
        id: 'stage_5',
        name: 'Ensemble & Optimization',
        nameAr: 'التجميع والتحسين',
        type: 'evaluation',
        status: 'pending',
        progress: 0,
        config: {
          ensembleMethods: ['weighted_average', 'stacking'],
          hyperparameterTuning: true,
          onlineEvaluation: true
        }
      }
    ]
  }
];

export function DeepLearningPipelineManager() {
  const [activePipelines, setActivePipelines] = useKV<Pipeline[]>('active-pipelines', []);
  const [autoMLExperiments, setAutoMLExperiments] = useKV<AutoMLExperiment[]>('automl-experiments', []);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [currentExperiment, setCurrentExperiment] = useState<AutoMLExperiment | null>(null);
  const [showNeuralTrainer, setShowNeuralTrainer] = useState(false);
  const [showTransformerStudio, setShowTransformerStudio] = useState(false);

  useEffect(() => {
    // Simulate pipeline progress if there's an active one
    const runningPipeline = activePipelines.find(p => p.status === 'running');
    if (runningPipeline) {
      const interval = setInterval(() => {
        simulatePipelineProgress(runningPipeline.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activePipelines]);

  const createPipeline = (templateIndex: number) => {
    const template = PREDEFINED_PIPELINES[templateIndex];
    const newPipeline: Pipeline = {
      ...template,
      id: `pipeline_${Date.now()}`,
      status: 'draft',
      currentStage: 0,
      totalStages: template.stages.length,
      metrics: {
        accuracy: 0,
        f1Score: 0,
        precision: 0,
        recall: 0,
        auc: 0,
        loss: 0,
        trainingTime: 0,
        inferenceTime: 0,
        modelSize: 0,
        computeEfficiency: 0
      }
    };

    setActivePipelines(prev => [...prev, newPipeline]);
    setSelectedPipeline(newPipeline);
    toast.success(`تم إنشاء خط الإنتاج "${newPipeline.nameAr}"`);
  };

  const runPipeline = (pipelineId: string) => {
    setActivePipelines(prev => 
      prev.map(p => 
        p.id === pipelineId 
          ? { ...p, status: 'running', startTime: new Date() }
          : p
      )
    );
    toast.success('بدء تشغيل خط الإنتاج');
  };

  const simulatePipelineProgress = (pipelineId: string) => {
    setActivePipelines(prev => 
      prev.map(pipeline => {
        if (pipeline.id !== pipelineId || pipeline.status !== 'running') return pipeline;

        const currentStageObj = pipeline.stages[pipeline.currentStage];
        if (!currentStageObj) return pipeline;

        const newProgress = Math.min(100, currentStageObj.progress + Math.random() * 15);
        const updatedStages = [...pipeline.stages];
        updatedStages[pipeline.currentStage] = {
          ...currentStageObj,
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'running'
        };

        // Move to next stage if current is complete
        let newCurrentStage = pipeline.currentStage;
        if (newProgress === 100 && pipeline.currentStage < pipeline.totalStages - 1) {
          newCurrentStage = pipeline.currentStage + 1;
          updatedStages[newCurrentStage] = {
            ...updatedStages[newCurrentStage],
            status: 'running'
          };
        }

        // Complete pipeline if all stages done
        const isComplete = newCurrentStage === pipeline.totalStages - 1 && newProgress === 100;
        
        return {
          ...pipeline,
          stages: updatedStages,
          currentStage: newCurrentStage,
          status: isComplete ? 'completed' : 'running',
          endTime: isComplete ? new Date() : undefined,
          metrics: isComplete ? {
            accuracy: 0.85 + Math.random() * 0.1,
            f1Score: 0.82 + Math.random() * 0.1,
            precision: 0.88 + Math.random() * 0.08,
            recall: 0.79 + Math.random() * 0.1,
            auc: 0.91 + Math.random() * 0.05,
            loss: Math.random() * 0.3,
            trainingTime: Math.random() * 120 + 30,
            inferenceTime: Math.random() * 50 + 10,
            modelSize: Math.random() * 500 + 100,
            computeEfficiency: 0.7 + Math.random() * 0.2
          } : pipeline.metrics
        };
      })
    );
  };

  const startAutoMLExperiment = () => {
    const newExperiment: AutoMLExperiment = {
      id: `automl_${Date.now()}`,
      name: 'Arabic Content AutoML',
      nameAr: 'تجربة التعلم الآلي التلقائي للمحتوى العربي',
      objective: 'classification',
      searchSpace: {
        architectures: ['bert', 'roberta', 'transformer', 'neural_network'],
        optimizers: ['adam', 'adamw', 'sgd'],
        learningRates: [1e-5, 2e-5, 5e-5, 1e-4],
        batchSizes: [16, 32, 64],
        epochs: [5, 10, 15, 20]
      },
      budget: {
        maxTrials: 50,
        maxTime: 480, // 8 hours
        maxCompute: 20 // 20 GPU hours
      },
      status: 'running',
      trials: [],
      currentTrial: 0
    };

    setAutoMLExperiments(prev => [...prev, newExperiment]);
    setCurrentExperiment(newExperiment);
    
    // Simulate trials
    simulateAutoMLTrials(newExperiment.id);
    toast.success('بدء تجربة التعلم الآلي التلقائي');
  };

  const simulateAutoMLTrials = (experimentId: string) => {
    const interval = setInterval(() => {
      setAutoMLExperiments(prev => 
        prev.map(exp => {
          if (exp.id !== experimentId || exp.status !== 'running') return exp;

          const trialNumber = exp.currentTrial + 1;
          if (trialNumber > exp.budget.maxTrials) {
            return { ...exp, status: 'completed' };
          }

          const newTrial: AutoMLTrial = {
            id: `trial_${trialNumber}`,
            trialNumber,
            hyperparameters: {
              architecture: exp.searchSpace.architectures[Math.floor(Math.random() * exp.searchSpace.architectures.length)],
              optimizer: exp.searchSpace.optimizers[Math.floor(Math.random() * exp.searchSpace.optimizers.length)],
              learningRate: exp.searchSpace.learningRates[Math.floor(Math.random() * exp.searchSpace.learningRates.length)],
              batchSize: exp.searchSpace.batchSizes[Math.floor(Math.random() * exp.searchSpace.batchSizes.length)],
              epochs: exp.searchSpace.epochs[Math.floor(Math.random() * exp.searchSpace.epochs.length)]
            },
            metrics: {
              accuracy: 0.7 + Math.random() * 0.25,
              f1Score: 0.65 + Math.random() * 0.25,
              precision: 0.72 + Math.random() * 0.2,
              recall: 0.68 + Math.random() * 0.22,
              auc: 0.8 + Math.random() * 0.15,
              loss: Math.random() * 0.8,
              trainingTime: Math.random() * 60 + 10,
              inferenceTime: Math.random() * 20 + 2,
              modelSize: Math.random() * 300 + 50,
              computeEfficiency: 0.6 + Math.random() * 0.3
            },
            status: 'completed',
            duration: Math.random() * 30 + 5,
            startTime: new Date(),
            endTime: new Date()
          };

          const updatedTrials = [...exp.trials, newTrial];
          const newBest = !exp.bestTrial || newTrial.metrics.f1Score > exp.bestTrial.metrics.f1Score 
            ? newTrial : exp.bestTrial;

          return {
            ...exp,
            trials: updatedTrials,
            bestTrial: newBest,
            currentTrial: trialNumber
          };
        })
      );
    }, 3000);

    // Stop after reasonable time
    setTimeout(() => clearInterval(interval), 60000);
  };

  const PipelineStageCard = ({ stage, isActive, isCompleted }: { 
    stage: PipelineStage; 
    isActive: boolean; 
    isCompleted: boolean; 
  }) => (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-accent' : ''} ${isCompleted ? 'bg-muted/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{stage.nameAr}</CardTitle>
          <Badge variant={
            stage.status === 'completed' ? 'default' :
            stage.status === 'running' ? 'secondary' :
            stage.status === 'failed' ? 'destructive' : 'outline'
          }>
            {stage.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
            {stage.status === 'running' && <Activity className="w-3 h-3 mr-1 animate-spin" />}
            {stage.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {stage.status === 'completed' ? 'مكتمل' :
             stage.status === 'running' ? 'جاري' :
             stage.status === 'failed' ? 'فشل' : 'منتظر'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>التقدم</span>
            <span>{stage.progress.toFixed(0)}%</span>
          </div>
          <Progress value={stage.progress} className="h-1" />
          
          {stage.duration && (
            <div className="text-xs text-muted-foreground">
              المدة: {stage.duration} دقيقة
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AutoMLTrialCard = ({ trial }: { trial: AutoMLTrial }) => (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">تجربة #{trial.trialNumber}</span>
          <Badge variant={trial.status === 'completed' ? 'default' : 'secondary'}>
            {trial.status === 'completed' ? 'مكتملة' : 'جارية'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">النموذج:</span>
            <span className="mr-1">{trial.hyperparameters.architecture}</span>
          </div>
          <div>
            <span className="text-muted-foreground">F1:</span>
            <span className="mr-1">{trial.metrics.f1Score.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">معدل التعلم:</span>
            <span className="mr-1">{trial.hyperparameters.learningRate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">الدقة:</span>
            <span className="mr-1">{(trial.metrics.accuracy * 100).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (showNeuralTrainer) {
    return (
      <div>
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowNeuralTrainer(false)}
            className="gap-2"
          >
            <FlowArrow className="w-4 h-4" />
            العودة إلى إدارة خطوط الإنتاج
          </Button>
        </div>
        <NeuralNetworkTrainer />
      </div>
    );
  }

  if (showTransformerStudio) {
    return (
      <div>
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowTransformerStudio(false)}
            className="gap-2"
          >
            <FlowArrow className="w-4 h-4" />
            العودة إلى إدارة خطوط الإنتاج
          </Button>
        </div>
        <TransformerTrainingStudio />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Rocket className="w-8 h-8 text-accent" />
          مدير خطوط الإنتاج للتعلم العميق
        </h1>
        <p className="text-muted-foreground text-lg">
          منصة شاملة لإدارة وتشغيل خطوط إنتاج التعلم الآلي والذكاء الاصطناعي
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={() => setShowNeuralTrainer(true)}
          className="gap-2 h-auto p-4 flex-col"
          variant="outline"
        >
          <Brain className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">مدرب الشبكات العصبية</div>
            <div className="text-xs text-muted-foreground">تدريب نماذج التعلم العميق</div>
          </div>
        </Button>
        
        <Button
          onClick={() => setShowTransformerStudio(true)}
          className="gap-2 h-auto p-4 flex-col"
          variant="outline"
        >
          <Lightning className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">استوديو المحولات</div>
            <div className="text-xs text-muted-foreground">تدريب نماذج المحولات</div>
          </div>
        </Button>
        
        <Button
          onClick={startAutoMLExperiment}
          className="gap-2 h-auto p-4 flex-col"
          variant="outline"
        >
          <Target className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">AutoML</div>
            <div className="text-xs text-muted-foreground">تحسين تلقائي للنماذج</div>
          </div>
        </Button>
      </div>

      <Tabs defaultValue="pipelines" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipelines">خطوط الإنتاج</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
          <TabsTrigger value="automl">AutoML</TabsTrigger>
          <TabsTrigger value="deployment">النشر</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">خطوط الإنتاج النشطة</h2>
            <div className="flex gap-2">
              {PREDEFINED_PIPELINES.map((template, index) => (
                <Button
                  key={index}
                  onClick={() => createPipeline(index)}
                  variant="outline"
                  size="sm"
                >
                  إنشاء {template.nameAr}
                </Button>
              ))}
            </div>
          </div>

          {activePipelines.length > 0 ? (
            <div className="space-y-6">
              {activePipelines.map((pipeline) => (
                <Card key={pipeline.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{pipeline.nameAr}</CardTitle>
                        <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          pipeline.status === 'running' ? 'default' :
                          pipeline.status === 'completed' ? 'outline' :
                          pipeline.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {pipeline.status === 'running' ? 'جاري التشغيل' :
                           pipeline.status === 'completed' ? 'مكتمل' :
                           pipeline.status === 'failed' ? 'فشل' :
                           pipeline.status === 'paused' ? 'متوقف' : 'مسودة'}
                        </Badge>
                        {pipeline.status === 'draft' && (
                          <Button
                            onClick={() => runPipeline(pipeline.id)}
                            size="sm"
                            className="gap-1"
                          >
                            <Play className="w-3 h-3" />
                            تشغيل
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {pipeline.stages.map((stage, index) => (
                          <PipelineStageCard
                            key={stage.id}
                            stage={stage}
                            isActive={index === pipeline.currentStage}
                            isCompleted={index < pipeline.currentStage}
                          />
                        ))}
                      </div>
                      
                      {pipeline.status === 'completed' && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">نتائج خط الإنتاج</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">الدقة:</span>
                              <span className="font-medium mr-1">{(pipeline.metrics.accuracy * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">F1:</span>
                              <span className="font-medium mr-1">{pipeline.metrics.f1Score.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">وقت التدريب:</span>
                              <span className="font-medium mr-1">{pipeline.metrics.trainingTime.toFixed(0)} دقيقة</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">حجم النموذج:</span>
                              <span className="font-medium mr-1">{pipeline.metrics.modelSize.toFixed(0)} MB</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">لا توجد خطوط إنتاج نشطة</h3>
              <p className="text-muted-foreground">قم بإنشاء خط إنتاج جديد للبدء</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                مراقبة الأداء في الوقت الفعلي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activePipelines.filter(p => p.status === 'running').length > 0 ? (
                <div className="space-y-4">
                  {activePipelines.filter(p => p.status === 'running').map((pipeline) => (
                    <div key={pipeline.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{pipeline.nameAr}</h4>
                        <Badge>المرحلة {pipeline.currentStage + 1} من {pipeline.totalStages}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>التقدم الإجمالي</span>
                          <span>{((pipeline.currentStage / pipeline.totalStages) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(pipeline.currentStage / pipeline.totalStages) * 100} className="h-2" />
                      </div>
                      
                      <div className="mt-3 text-sm text-muted-foreground">
                        المرحلة الحالية: {pipeline.stages[pipeline.currentStage]?.nameAr}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p>لا توجد خطوط إنتاج قيد التشغيل حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automl" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                تجارب التعلم الآلي التلقائي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentExperiment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{currentExperiment.nameAr}</h3>
                    <Badge variant={
                      currentExperiment.status === 'running' ? 'default' :
                      currentExperiment.status === 'completed' ? 'outline' : 'secondary'
                    }>
                      {currentExperiment.status === 'running' ? 'جاري التشغيل' :
                       currentExperiment.status === 'completed' ? 'مكتمل' : 'معطل'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">التجارب المكتملة:</span>
                      <p className="font-medium">{currentExperiment.currentTrial} / {currentExperiment.budget.maxTrials}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">أفضل F1:</span>
                      <p className="font-medium">
                        {currentExperiment.bestTrial ? currentExperiment.bestTrial.metrics.f1Score.toFixed(3) : '--'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">أفضل دقة:</span>
                      <p className="font-medium">
                        {currentExperiment.bestTrial ? (currentExperiment.bestTrial.metrics.accuracy * 100).toFixed(1) + '%' : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">آخر التجارب</h4>
                    <div className="max-h-60 overflow-y-auto">
                      {currentExperiment.trials.slice(-5).reverse().map((trial) => (
                        <AutoMLTrialCard key={trial.id} trial={trial} />
                      ))}
                    </div>
                  </div>

                  {currentExperiment.bestTrial && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">أفضل تجربة</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">النموذج:</span>
                          <span className="mr-1">{currentExperiment.bestTrial.hyperparameters.architecture}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">المحسن:</span>
                          <span className="mr-1">{currentExperiment.bestTrial.hyperparameters.optimizer}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">معدل التعلم:</span>
                          <span className="mr-1">{currentExperiment.bestTrial.hyperparameters.learningRate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">حجم الدفعة:</span>
                          <span className="mr-1">{currentExperiment.bestTrial.hyperparameters.batchSize}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد تجارب AutoML نشطة</h3>
                  <p className="text-muted-foreground mb-4">
                    قم بإنشاء تجربة تعلم آلي تلقائي لتحسين النماذج تلقائياً
                  </p>
                  <Button onClick={startAutoMLExperiment}>
                    بدء تجربة AutoML
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                نشر النماذج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Rocket className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">قيد التطوير</h3>
                <p>سيتم إضافة أدوات نشر النماذج قريباً</p>
                <p className="text-sm mt-2">
                  ستشمل: API endpoints، Docker containers، Cloud deployment، Model serving
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}