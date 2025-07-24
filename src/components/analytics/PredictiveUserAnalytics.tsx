import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart } from 'recharts';
import { Brain, TrendingUp, Users, Eye, Clock, Heart, Share, BookOpen, Target, Zap, AlertTriangle, CheckCircle } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface PredictiveModel {
  modelId: string;
  name: string;
  type: 'engagement' | 'retention' | 'conversion' | 'churn' | 'content_success';
  accuracy: number;
  lastTrained: Date;
  predictions: Prediction[];
  features: ModelFeature[];
}

interface Prediction {
  id: string;
  targetMetric: string;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: PredictionFactor[];
  recommendation: string;
}

interface PredictionFactor {
  factor: string;
  impact: number;
  importance: number;
  direction: 'positive' | 'negative';
}

interface ModelFeature {
  name: string;
  importance: number;
  type: 'numerical' | 'categorical' | 'temporal';
  correlation: number;
}

interface BehaviorCluster {
  clusterId: string;
  name: string;
  description: string;
  userCount: number;
  characteristics: ClusterCharacteristic[];
  trends: ClusterTrend[];
  recommendations: string[];
}

interface ClusterCharacteristic {
  feature: string;
  averageValue: number;
  variance: number;
  percentile: number;
}

interface ClusterTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  significance: number;
}

interface AnomalyDetection {
  anomalyId: string;
  timestamp: Date;
  type: 'spike' | 'drop' | 'pattern_change' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  possibleCauses: string[];
  recommendations: string[];
}

export function PredictiveUserAnalytics() {
  const [models, setModels] = useKV<PredictiveModel[]>('predictive-models', []);
  const [clusters, setClusters] = useKV<BehaviorCluster[]>('behavior-clusters', []);
  const [anomalies, setAnomalies] = useKV<AnomalyDetection[]>('detected-anomalies', []);
  const [selectedModel, setSelectedModel] = useState<string>('engagement');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1w' | '1m' | '3m' | '6m'>('1m');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (models.length === 0) {
      generateMockPredictiveData();
    }
  }, []);

  const generateMockPredictiveData = () => {
    const mockModels: PredictiveModel[] = [
      {
        modelId: 'engagement_model',
        name: 'نموذج التفاعل التنبئي',
        type: 'engagement',
        accuracy: 87.5,
        lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        predictions: [
          {
            id: 'pred_1',
            targetMetric: 'معدل التفاعل الأسبوعي',
            predictedValue: 68.2,
            confidence: 92.1,
            timeframe: 'الأسبوع القادم',
            factors: [
              { factor: 'وقت النشر', impact: 0.35, importance: 0.8, direction: 'positive' },
              { factor: 'طول المحتوى', impact: -0.15, importance: 0.6, direction: 'negative' },
              { factor: 'نوع المحتوى', impact: 0.28, importance: 0.75, direction: 'positive' }
            ],
            recommendation: 'انشر المحتوى بين 8-10 صباحاً لزيادة التفاعل'
          }
        ],
        features: [
          { name: 'وقت النشر', importance: 0.8, type: 'temporal', correlation: 0.72 },
          { name: 'طول المحتوى', importance: 0.6, type: 'numerical', correlation: -0.45 },
          { name: 'نوع المحتوى', importance: 0.75, type: 'categorical', correlation: 0.68 }
        ]
      },
      {
        modelId: 'retention_model',
        name: 'نموذج الاحتفاظ بالمستخدمين',
        type: 'retention',
        accuracy: 82.3,
        lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        predictions: [
          {
            id: 'pred_2',
            targetMetric: 'معدل العودة الشهري',
            predictedValue: 45.8,
            confidence: 88.6,
            timeframe: 'الشهر القادم',
            factors: [
              { factor: 'تكرار الزيارات', impact: 0.42, importance: 0.9, direction: 'positive' },
              { factor: 'تنوع المحتوى', impact: 0.31, importance: 0.7, direction: 'positive' },
              { factor: 'سرعة التحميل', impact: -0.22, importance: 0.65, direction: 'negative' }
            ],
            recommendation: 'حسّن سرعة الموقع وادع المحتوى لزيادة الاحتفاظ'
          }
        ],
        features: [
          { name: 'تكرار الزيارات', importance: 0.9, type: 'numerical', correlation: 0.85 },
          { name: 'تنوع المحتوى', importance: 0.7, type: 'numerical', correlation: 0.62 },
          { name: 'سرعة التحميل', importance: 0.65, type: 'numerical', correlation: -0.58 }
        ]
      }
    ];

    const mockClusters: BehaviorCluster[] = [
      {
        clusterId: 'cluster_1',
        name: 'القراء المتفانون',
        description: 'مستخدمون يقضون وقتاً طويلاً في القراءة ويتفاعلون بشكل مستمر',
        userCount: 1250,
        characteristics: [
          { feature: 'متوسط وقت القراءة', averageValue: 8.5, variance: 2.1, percentile: 85 },
          { feature: 'معدل الإكمال', averageValue: 78.2, variance: 12.3, percentile: 90 },
          { feature: 'تكرار الزيارات', averageValue: 12.4, variance: 3.8, percentile: 92 }
        ],
        trends: [
          { metric: 'وقت القراءة', trend: 'increasing', changeRate: 0.15, significance: 0.92 },
          { metric: 'معدل التفاعل', trend: 'stable', changeRate: 0.02, significance: 0.65 }
        ],
        recommendations: [
          'قدم محتوى متقدم وعميق',
          'أضف ميزات التفاعل المتقدمة',
          'اربطهم ببرنامج الولاء'
        ]
      },
      {
        clusterId: 'cluster_2',
        name: 'المتصفحون السريعون',
        description: 'مستخدمون يتصفحون بسرعة ويبحثون عن معلومات محددة',
        userCount: 2890,
        characteristics: [
          { feature: 'متوسط وقت القراءة', averageValue: 2.1, variance: 0.8, percentile: 25 },
          { feature: 'معدل الإكمال', averageValue: 35.7, variance: 15.2, percentile: 30 },
          { feature: 'معدل الارتداد', averageValue: 68.9, variance: 18.5, percentile: 75 }
        ],
        trends: [
          { metric: 'سرعة التصفح', trend: 'increasing', changeRate: 0.08, significance: 0.78 },
          { metric: 'عمق التصفح', trend: 'decreasing', changeRate: -0.12, significance: 0.82 }
        ],
        recommendations: [
          'اجعل المعلومات المهمة في المقدمة',
          'استخدم النقاط والقوائم',
          'أضف ملخصات سريعة'
        ]
      }
    ];

    const mockAnomalies: AnomalyDetection[] = [
      {
        anomalyId: 'anomaly_1',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        type: 'spike',
        severity: 'medium',
        metric: 'معدل الارتداد',
        expectedValue: 45.2,
        actualValue: 67.8,
        deviation: 22.6,
        possibleCauses: [
          'مشكلة فنية في الموقع',
          'محتوى غير مناسب للجمهور',
          'بطء في التحميل'
        ],
        recommendations: [
          'فحص الأخطاء التقنية',
          'مراجعة جودة المحتوى المنشور',
          'تحليل سرعة الموقع'
        ]
      }
    ];

    setModels(mockModels);
    setClusters(mockClusters);
    setAnomalies(mockAnomalies);
  };

  const runPrediction = async () => {
    setLoading(true);
    
    // Simulate AI prediction process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPrediction: Prediction = {
      id: `pred_${Date.now()}`,
      targetMetric: 'التفاعل المتوقع',
      predictedValue: Math.random() * 100,
      confidence: 85 + Math.random() * 10,
      timeframe: 'الأسبوع القادم',
      factors: [
        { factor: 'المحتوى الجديد', impact: Math.random() * 0.5, importance: Math.random(), direction: 'positive' },
        { factor: 'التوقيت المثالي', impact: Math.random() * 0.3, importance: Math.random(), direction: 'positive' }
      ],
      recommendation: 'استمر في النشر بنفس الوتيرة مع التركيز على المحتوى التفاعلي'
    };

    setModels(prev => prev.map(model => 
      model.type === selectedModel 
        ? { ...model, predictions: [...model.predictions, newPrediction] }
        : model
    ));

    setLoading(false);
    toast.success('تم تشغيل النموذج التنبئي بنجاح');
  };

  const getModelData = () => {
    return models.find(m => m.type === selectedModel) || models[0];
  };

  const getClusterDistribution = () => {
    return clusters.map(cluster => ({
      name: cluster.name,
      users: cluster.userCount,
      percentage: (cluster.userCount / clusters.reduce((sum, c) => sum + c.userCount, 0)) * 100
    }));
  };

  const getFeatureImportance = () => {
    const currentModel = getModelData();
    if (!currentModel) return [];
    
    return currentModel.features.map(feature => ({
      feature: feature.name,
      importance: feature.importance * 100,
      correlation: feature.correlation
    }));
  };

  const getPredictionTrends = () => {
    // Mock trend data for different time periods
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA'),
      predicted: 60 + Math.sin(i / 5) * 10 + Math.random() * 5,
      actual: 60 + Math.sin(i / 5) * 10 + Math.random() * 8,
      confidence: 85 + Math.random() * 10
    }));
  };

  const currentModel = getModelData();
  const clusterDistribution = getClusterDistribution();
  const featureImportance = getFeatureImportance();
  const predictionTrends = getPredictionTrends();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التحليلات التنبئية للمستخدمين</h1>
          <p className="text-muted-foreground mt-2">
            استخدام الذكاء الاصطناعي لتوقع سلوك المستخدمين وتحسين الأداء
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">نموذج التفاعل</SelectItem>
              <SelectItem value="retention">نموذج الاحتفاظ</SelectItem>
              <SelectItem value="conversion">نموذج التحويل</SelectItem>
              <SelectItem value="churn">نموذج الانسحاب</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={runPrediction} disabled={loading}>
            {loading ? 'جاري التنبؤ...' : 'تشغيل التنبؤ'}
          </Button>
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">دقة النموذج</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentModel?.accuracy.toFixed(1)}%</div>
            <Progress value={currentModel?.accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر تدريب</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentModel?.lastTrained ? Math.floor((Date.now() - currentModel.lastTrained.getTime()) / (24 * 60 * 60 * 1000)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">أيام مضت</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التنبؤات النشطة</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentModel?.predictions.length || 0}</div>
            <p className="text-xs text-muted-foreground">توقعات قيد التشغيل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشذوذات المكتشفة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">تحتاج لمراجعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="clusters">تجميع السلوك</TabsTrigger>
          <TabsTrigger value="features">أهمية المتغيرات</TabsTrigger>
          <TabsTrigger value="anomalies">كشف الشذوذ</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prediction Trends */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات التنبؤات</CardTitle>
                <p className="text-sm text-muted-foreground">
                  مقارنة القيم المتوقعة مع القيم الفعلية
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={predictionTrends}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="متوقع"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="فعلي"
                      />
                      <Area 
                        dataKey="confidence" 
                        fill="#8884d8" 
                        fillOpacity={0.1}
                        name="مستوى الثقة"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Current Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>التنبؤات الحالية</CardTitle>
                <p className="text-sm text-muted-foreground">
                  آخر التوقعات المولدة من النموذج
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentModel?.predictions.slice(0, 3).map((prediction, index) => (
                  <div key={prediction.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{prediction.targetMetric}</h4>
                        <p className="text-sm text-muted-foreground">{prediction.timeframe}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {prediction.predictedValue.toFixed(1)}%
                        </div>
                        <Badge variant="secondary">
                          ثقة {prediction.confidence.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{prediction.recommendation}</p>
                    <div className="space-y-1">
                      {prediction.factors.map((factor, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span>{factor.factor}</span>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${factor.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span>{(factor.impact * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع مجموعات السلوك</CardTitle>
                <p className="text-sm text-muted-foreground">
                  نسبة المستخدمين في كل مجموعة سلوكية
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={clusterDistribution}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="users" fill="#8884d8" name="عدد المستخدمين" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Cluster Details */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المجموعات</CardTitle>
                <p className="text-sm text-muted-foreground">
                  خصائص وتوصيات لكل مجموعة
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {clusters.map((cluster, index) => (
                  <div key={cluster.clusterId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{cluster.name}</h4>
                      <Badge variant="outline">
                        {cluster.userCount.toLocaleString()} مستخدم
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cluster.description}
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">التوصيات:</h5>
                      <ul className="text-xs space-y-1">
                        {cluster.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importance */}
            <Card>
              <CardHeader>
                <CardTitle>أهمية المتغيرات</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تأثير كل متغير على دقة النموذج
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={featureImportance} layout="horizontal">
                      <XAxis type="number" />
                      <YAxis dataKey="feature" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="importance" fill="#8884d8" name="الأهمية %" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Feature Correlations */}
            <Card>
              <CardHeader>
                <CardTitle>معاملات الارتباط</CardTitle>
                <p className="text-sm text-muted-foreground">
                  قوة العلاقة بين المتغيرات والهدف
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {featureImportance.map((feature, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <span className="text-sm text-muted-foreground">
                        {feature.correlation > 0 ? '+' : ''}{feature.correlation.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.abs(feature.correlation) * 100} 
                        className="flex-1"
                      />
                      <Badge 
                        variant={Math.abs(feature.correlation) > 0.7 ? 'default' : Math.abs(feature.correlation) > 0.4 ? 'secondary' : 'outline'}
                      >
                        {Math.abs(feature.correlation) > 0.7 ? 'قوي' : Math.abs(feature.correlation) > 0.4 ? 'متوسط' : 'ضعيف'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الشذوذات المكتشفة</CardTitle>
              <p className="text-sm text-muted-foreground">
                الانحرافات غير المتوقعة في سلوك المستخدمين
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div 
                    key={anomaly.anomalyId} 
                    className={`p-4 border rounded-lg ${
                      anomaly.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      anomaly.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                      anomaly.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            anomaly.severity === 'critical' ? 'text-red-600' :
                            anomaly.severity === 'high' ? 'text-orange-600' :
                            anomaly.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          {anomaly.metric}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {anomaly.timestamp.toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          anomaly.severity === 'critical' ? 'destructive' :
                          anomaly.severity === 'high' ? 'default' :
                          'secondary'
                        }
                      >
                        {anomaly.severity === 'critical' ? 'حرج' :
                         anomaly.severity === 'high' ? 'عالي' :
                         anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-muted-foreground">القيمة المتوقعة:</span>
                        <div className="font-medium">{anomaly.expectedValue.toFixed(1)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">القيمة الفعلية:</span>
                        <div className="font-medium text-red-600">{anomaly.actualValue.toFixed(1)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium mb-1">الأسباب المحتملة:</h5>
                        <ul className="text-xs space-y-1">
                          {anomaly.possibleCauses.map((cause, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">التوصيات:</h5>
                        <ul className="text-xs space-y-1">
                          {anomaly.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            مركز الإجراءات الذكية
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            إجراءات مقترحة بناءً على التحليلات التنبئية
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">زيادة التفاعل</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                النموذج يتوقع زيادة 15% في التفاعل خلال الأسبوع القادم
              </p>
              <Button size="sm" className="w-full">استغل هذا الاتجاه</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">استهداف القراء المتفانين</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                1,250 مستخدم في هذه الفئة يحتاجون محتوى متخصص
              </p>
              <Button size="sm" variant="outline" className="w-full">إنشاء حملة</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">معالجة الشذوذات</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {anomalies.length} شذوذ مكتشف يحتاج لمراجعة فورية
              </p>
              <Button size="sm" variant="outline" className="w-full">مراجعة الآن</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}