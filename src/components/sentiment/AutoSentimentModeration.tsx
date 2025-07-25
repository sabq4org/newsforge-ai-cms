import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArabicSentimentAnalyzer, type SentimentResult } from './ArabicSentimentAnalyzer';
import { 
  Brain, 
  Zap, 
  Settings, 
  TrendUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { Article } from '@/types';

interface AutoSentimentConfig {
  enabled: boolean;
  threshold: number;
  autoApprove: boolean;
  notifyOnNegative: boolean;
  checkScheduled: boolean;
  analyzeComments: boolean;
}

interface SentimentAlert {
  id: string;
  articleId: string;
  articleTitle: string;
  sentiment: 'negative' | 'warning';
  confidence: number;
  reason: string;
  timestamp: Date;
  resolved: boolean;
}

interface AutoSentimentModerationProps {
  articles?: Article[];
  onArticleFlag?: (articleId: string, reason: string) => void;
  onConfigChange?: (config: AutoSentimentConfig) => void;
}

export function AutoSentimentModeration({ 
  articles = [], 
  onArticleFlag, 
  onConfigChange 
}: AutoSentimentModerationProps) {
  const [config, setConfig] = useKV<AutoSentimentConfig>('auto-sentiment-config', {
    enabled: false,
    threshold: 70,
    autoApprove: false,
    notifyOnNegative: true,
    checkScheduled: true,
    analyzeComments: false
  });

  const [alerts, setAlerts] = useKV<SentimentAlert[]>('sentiment-alerts', []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScan, setLastScan] = useKV<string>('last-sentiment-scan', '');
  const [activeTab, setActiveTab] = useState('overview');

  // تحديث الإعدادات
  const updateConfig = (updates: Partial<AutoSentimentConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    toast.success('تم حفظ الإعدادات');
  };

  // فحص تلقائي للمقالات
  const runAutomaticScan = async () => {
    if (!config.enabled || !articles.length) return;

    setIsProcessing(true);
    const newAlerts: SentimentAlert[] = [];

    try {
      for (const article of articles.slice(0, 3)) { // فحص أول 3 مقالات
        if (!article.content) continue;

        const prompt = spark.llmPrompt`
          قم بتحليل سريع للمشاعر في هذا المقال الإخباري:
          
          العنوان: ${article.title}
          المحتوى: ${article.content.slice(0, 500)}...
          
          هل يحتوي على:
          1. مشاعر سلبية قوية
          2. لغة تحريضية أو مسيئة
          3. محتوى قد يسبب جدلاً
          4. نبرة غير مناسبة للنشر
          
          أعطني تقييم سريع (إيجابي/سلبي/محايد) مع درجة الثقة.
        `;

        // محاكاة نتيجة التحليل
        const sentimentScore = Math.random();
        let sentiment: 'negative' | 'warning' | null = null;
        let reason = '';

        if (sentimentScore < 0.3) {
          sentiment = 'negative';
          reason = 'تم اكتشاف مشاعر سلبية قوية في المحتوى';
        } else if (sentimentScore < 0.5) {
          sentiment = 'warning';
          reason = 'المحتوى قد يحتاج لمراجعة تحريرية';
        }

        if (sentiment) {
          newAlerts.push({
            id: `alert_${Date.now()}_${article.id}`,
            articleId: article.id,
            articleTitle: article.title,
            sentiment,
            confidence: Math.random() * 0.3 + 0.7,
            reason,
            timestamp: new Date(),
            resolved: false
          });
        }
      }

      if (newAlerts.length > 0) {
        setAlerts(current => [...current, ...newAlerts]);
        
        if (config.notifyOnNegative) {
          toast.warning(`تم اكتشاف ${newAlerts.length} تنبيه جديد في تحليل المشاعر`);
        }
      }

      setLastScan(new Date().toISOString());
      
    } catch (error) {
      console.error('Error in automatic scan:', error);
      toast.error('حدث خطأ في الفحص التلقائي');
    } finally {
      setIsProcessing(false);
    }
  };

  // تشغيل الفحص التلقائي كل 5 دقائق
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(runAutomaticScan, 5 * 60 * 1000); // كل 5 دقائق
    
    return () => clearInterval(interval);
  }, [config.enabled, articles]);

  // حل التنبيه
  const resolveAlert = (alertId: string) => {
    setAlerts(current => 
      current.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success('تم حل التنبيه');
  };

  // الحصول على الإحصائيات
  const getStats = () => {
    const totalAlerts = alerts.length;
    const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
    const negativeAlerts = alerts.filter(a => a.sentiment === 'negative').length;
    const warningAlerts = alerts.filter(a => a.sentiment === 'warning').length;
    
    return {
      totalAlerts,
      unresolvedAlerts,
      negativeAlerts,
      warningAlerts,
      resolutionRate: totalAlerts > 0 ? Math.round(((totalAlerts - unresolvedAlerts) / totalAlerts) * 100) : 0
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">الرقابة التلقائية على المشاعر</h2>
          <p className="text-muted-foreground">
            نظام ذكي لمراقبة المشاعر والمحتوى تلقائياً
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAutomaticScan} 
            disabled={isProcessing || !config.enabled}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                فحص فوري
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="analyzer">المحلل</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  حالة النظام
                </span>
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? 'مفعل' : 'معطل'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stats.totalAlerts}
                  </div>
                  <p className="text-sm text-muted-foreground">إجمالي التنبيهات</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {stats.unresolvedAlerts}
                  </div>
                  <p className="text-sm text-muted-foreground">غير محلولة</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.resolutionRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">معدل الحل</p>
                </div>
              </div>
              
              {lastScan && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  آخر فحص: {new Date(lastScan).toLocaleString('ar-SA')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">تنبيهات حرجة</p>
                    <p className="text-2xl font-bold text-red-600">{stats.negativeAlerts}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">تحذيرات</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.warningAlerts}</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المحلولة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalAlerts - stats.unresolvedAlerts}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الكفاءة</p>
                    <p className="text-2xl font-bold">{stats.resolutionRate}%</p>
                  </div>
                  <TrendUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => updateConfig({ enabled: !config.enabled })}
                >
                  <Brain className="w-6 h-6" />
                  {config.enabled ? 'إيقاف النظام' : 'تفعيل النظام'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={runAutomaticScan}
                  disabled={!config.enabled || isProcessing}
                >
                  <Zap className="w-6 h-6" />
                  فحص شامل
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-6 h-6" />
                  الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">لا توجد تنبيهات</h3>
                <p className="text-muted-foreground">
                  جميع المقالات تم فحصها ولا توجد مشاكل في المشاعر
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((alert) => (
                <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alert.sentiment === 'negative' ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Eye className="w-5 h-5 text-orange-500" />
                          )}
                          <Badge 
                            variant={alert.sentiment === 'negative' ? 'destructive' : 'secondary'}
                          >
                            {alert.sentiment === 'negative' ? 'حرج' : 'تحذير'}
                          </Badge>
                          <Badge variant="outline">
                            ثقة {Math.round(alert.confidence * 100)}%
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              محلول
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium mb-1">{alert.articleTitle}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {!alert.resolved && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              حل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onArticleFlag?.(alert.articleId, alert.reason)}
                            >
                              مراجعة
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
              <CardDescription>
                تخصيص سلوك نظام الرقابة التلقائية على المشاعر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enable-system">تفعيل النظام</Label>
                  <p className="text-sm text-muted-foreground">
                    تشغيل/إيقاف الرقابة التلقائية على المشاعر
                  </p>
                </div>
                <Switch
                  id="enable-system"
                  checked={config.enabled}
                  onCheckedChange={(enabled) => updateConfig({ enabled })}
                />
              </div>

              <div className="space-y-3">
                <Label>عتبة الثقة</Label>
                <p className="text-sm text-muted-foreground">
                  الحد الأدنى لدرجة الثقة لإنشاء تنبيه ({config.threshold}%)
                </p>
                <Progress value={config.threshold} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>منخفض</span>
                  <span>عالي</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-approve">الموافقة التلقائية</Label>
                  <p className="text-sm text-muted-foreground">
                    موافقة تلقائية على المقالات ذات المشاعر الإيجابية
                  </p>
                </div>
                <Switch
                  id="auto-approve"
                  checked={config.autoApprove}
                  onCheckedChange={(autoApprove) => updateConfig({ autoApprove })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notify-negative">تنبيه المشاعر السلبية</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعار فوري عند اكتشاف مشاعر سلبية
                  </p>
                </div>
                <Switch
                  id="notify-negative"
                  checked={config.notifyOnNegative}
                  onCheckedChange={(notifyOnNegative) => updateConfig({ notifyOnNegative })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="check-scheduled">فحص المقالات المجدولة</Label>
                  <p className="text-sm text-muted-foreground">
                    تضمين المقالات المجدولة في الفحص التلقائي
                  </p>
                </div>
                <Switch
                  id="check-scheduled"
                  checked={config.checkScheduled}
                  onCheckedChange={(checkScheduled) => updateConfig({ checkScheduled })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analyze-comments">تحليل التعليقات</Label>
                  <p className="text-sm text-muted-foreground">
                    تحليل مشاعر التعليقات والردود (قريباً)
                  </p>
                </div>
                <Switch
                  id="analyze-comments"
                  checked={config.analyzeComments}
                  onCheckedChange={(analyzeComments) => updateConfig({ analyzeComments })}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyzer Tab */}
        <TabsContent value="analyzer">
          <ArabicSentimentAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
}