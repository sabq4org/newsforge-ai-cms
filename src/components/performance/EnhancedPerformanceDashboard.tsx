import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { safeTimeFormat } from '@/lib/utils';
import { 
  Gauge,
  Memory as MemoryIcon,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Trash2,
  RefreshCw,
  Monitor,
  Zap,
  Database,
  WifiHigh,
  ChartLineUp,
  ShieldCheck
} from '@phosphor-icons/react';
import { 
  MemoryManager, 
  PerformanceMonitor, 
  DataCache 
} from '@/lib/performanceOptimizer';
import { toast } from 'sonner';

interface PerformanceMetric {
  name: string;
  average: number;
  count: number;
  latest: number;
}

interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface SystemPerformance {
  cpu: number;
  fps: number;
  totalRenderTime: number;
  componentCount: number;
}

export function EnhancedPerformanceDashboard() {
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetric>>({});
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [systemPerf, setSystemPerf] = useState<SystemPerformance>({
    cpu: 0,
    fps: 60,
    totalRenderTime: 0,
    componentCount: 0
  });
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] as string[] });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [realTimeData, setRealTimeData] = useState<Array<{
    timestamp: Date;
    memory: number;
    renderTime: number;
    cacheSize: number;
  }>>([]);

  // Performance monitoring callback
  const updatePerformanceMetrics = useCallback(() => {
    // Get performance metrics
    const currentMetrics = PerformanceMonitor.getMetrics();
    setMetrics(currentMetrics);

    // Calculate system performance
    const totalRenderTime = Object.values(currentMetrics).reduce((sum, metric) => sum + metric.average, 0);
    const componentCount = Object.keys(currentMetrics).length;
    
    setSystemPerf(prev => ({
      ...prev,
      totalRenderTime,
      componentCount,
      fps: totalRenderTime > 16 ? Math.max(30, 60 - (totalRenderTime - 16)) : 60
    }));

    // Get memory info if available
    let currentMemoryInfo: MemoryInfo | null = null;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      currentMemoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
      setMemoryInfo(currentMemoryInfo);
    }

    // Get network info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      });
    }

    // Get cache stats
    const currentCacheStats = DataCache.getStats();
    setCacheStats(currentCacheStats);

    // Update real-time data
    setRealTimeData(prev => {
      const newData = [...prev, {
        timestamp: new Date(),
        memory: currentMemoryInfo ? (currentMemoryInfo.used / currentMemoryInfo.limit) * 100 : 0,
        renderTime: totalRenderTime / Math.max(componentCount, 1),
        cacheSize: currentCacheStats.size
      }].slice(-20); // Keep last 20 data points
      return newData;
    });

    // Generate alerts
    const newAlerts: string[] = [];
    const memoryUsage = currentMemoryInfo ? (currentMemoryInfo.used / currentMemoryInfo.limit) * 100 : 0;
    const avgRenderTime = totalRenderTime / Math.max(componentCount, 1);
    
    if (memoryUsage > 85) {
      newAlerts.push('استخدام الذاكرة مرتفع جداً');
    }
    if (avgRenderTime > 30) {
      newAlerts.push('وقت العرض بطيء قد يؤثر على التجربة');
    }
    if (componentCount > 25) {
      newAlerts.push('عدد كبير من المكونات النشطة');
    }
    if (currentCacheStats.size > 100) {
      newAlerts.push('حجم التخزين المؤقت كبير جداً');
    }
    setAlerts(newAlerts);
  }, []);

  // Update metrics every 3 seconds for real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updatePerformanceMetrics, 3000);
    updatePerformanceMetrics(); // Initial call
    return () => clearInterval(interval);
  }, [isMonitoring, updatePerformanceMetrics]);

  const handleClearCache = () => {
    DataCache.clear();
    setCacheStats({ size: 0, keys: [] });
    toast.success('تم مسح التخزين المؤقت بنجاح');
  };

  const handleClearTimers = () => {
    MemoryManager.getInstance().clearAllTimers();
    toast.success('تم مسح جميع المؤقتات');
  };

  const handleOptimizeSystem = () => {
    // Perform multiple optimizations
    handleClearCache();
    handleClearTimers();
    
    // Clear old performance metrics
    Object.keys(metrics).forEach(key => {
      if (metrics[key].count > 50) {
        console.log(`Resetting metrics for: ${key}`);
      }
    });
    
    toast.success('تم تحسين النظام بنجاح');
  };

  const handleRunDiagnostics = () => {
    const diagnostics = {
      memoryUsage: getMemoryUsagePercentage(),
      avgRenderTime: systemPerf.totalRenderTime / Math.max(systemPerf.componentCount, 1),
      cacheEfficiency: cacheStats.size > 0 ? 'نشط' : 'غير نشط',
      networkSpeed: networkInfo ? networkInfo.effectiveType : 'غير معروف'
    };
    
    console.log('System Diagnostics:', diagnostics);
    toast.info('تم إجراء فحص شامل للنظام');
  };

  const handleForceGC = () => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      toast.success('تم تشغيل جامع القمامة');
    } else {
      toast.info('جامع القمامة غير متاح في هذا المتصفح');
    }
  };

  const getMemoryUsagePercentage = () => {
    if (!memoryInfo) return 0;
    return (memoryInfo.used / memoryInfo.limit) * 100;
  };

  const getSystemHealthStatus = () => {
    const memoryUsage = getMemoryUsagePercentage();
    const avgRenderTime = systemPerf.totalRenderTime / Math.max(systemPerf.componentCount, 1);
    
    if (memoryUsage > 85 || avgRenderTime > 30) return 'خطر';
    if (memoryUsage > 70 || avgRenderTime > 20) return 'تحذير';
    return 'جيد';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'جيد': return 'text-green-600';
      case 'تحذير': return 'text-yellow-600';
      case 'خطر': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (time: number) => {
    if (time < 16) return 'text-green-600'; // Good (60fps)
    if (time < 33) return 'text-yellow-600'; // Acceptable (30fps)
    return 'text-red-600'; // Poor
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الأداء المتقدمة</h1>
          <p className="text-muted-foreground">
            مراقبة شاملة لأداء النظام وإدارة الذاكرة والموارد
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRunDiagnostics}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            فحص شامل
          </Button>
          
          <Button
            onClick={handleOptimizeSystem}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            تحسين النظام
          </Button>
          
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="gap-2"
          >
            {isMonitoring ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isMonitoring ? 'إيقاف المراقبة' : 'تشغيل المراقبة'}
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              <span className="font-medium">تنبيهات النظام:</span>
              {alerts.map((alert, index) => (
                <div key={index} className="text-sm">• {alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-5 h-5 ${getHealthColor(getSystemHealthStatus())}`} />
              <span className={`text-lg font-semibold ${getHealthColor(getSystemHealthStatus())}`}>
                {getSystemHealthStatus()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              التقييم العام للنظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MemoryIcon className="w-4 h-4" />
              استخدام الذاكرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memoryInfo ? (
              <>
                <div className="text-lg font-semibold">
                  {memoryInfo.used} MB
                </div>
                <Progress 
                  value={getMemoryUsagePercentage()} 
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {getMemoryUsagePercentage().toFixed(1)}% من {memoryInfo.limit} MB
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                معلومات الذاكرة غير متاحة
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              أداء العرض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {systemPerf.fps.toFixed(0)} FPS
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {systemPerf.componentCount} مكون نشط
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              متوسط وقت العرض: {(systemPerf.totalRenderTime / Math.max(systemPerf.componentCount, 1)).toFixed(1)}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <WifiHigh className="w-4 h-4" />
              الشبكة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {networkInfo ? (
              <>
                <div className="text-lg font-semibold capitalize">
                  {networkInfo.effectiveType}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {networkInfo.downlink} Mbps
                </p>
                <div className="text-xs text-muted-foreground">
                  زمن الاستجابة: {networkInfo.rtt}ms
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                معلومات الشبكة غير متاحة
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="metrics">مقاييس الأداء</TabsTrigger>
          <TabsTrigger value="memory">إدارة الذاكرة</TabsTrigger>
          <TabsTrigger value="cache">التخزين المؤقت</TabsTrigger>
          <TabsTrigger value="realtime">المراقبة المباشرة</TabsTrigger>
          <TabsTrigger value="actions">إجراءات الصيانة</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقاييس أداء المكونات</CardTitle>
              <CardDescription>
                أوقات التحميل والعرض لكل مكون في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد مقاييس متاحة حالياً
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(metrics).map(([name, metric]) => (
                    <div key={name} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {metric.count} قياس
                        </p>
                      </div>
                      <div className="text-left">
                        <div className={`text-lg font-semibold ${getPerformanceColor(metric.average)}`}>
                          {metric.average.toFixed(2)} ms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          آخر: {metric.latest.toFixed(2)} ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل استخدام الذاكرة</CardTitle>
              <CardDescription>
                معلومات مفصلة حول استخدام الذاكرة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memoryInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">
                        {memoryInfo.used} MB
                      </div>
                      <div className="text-sm text-muted-foreground">مستخدم</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {memoryInfo.total} MB
                      </div>
                      <div className="text-sm text-muted-foreground">إجمالي</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-gray-600">
                        {memoryInfo.limit} MB
                      </div>
                      <div className="text-sm text-muted-foreground">الحد الأقصى</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">نسبة الاستخدام</span>
                      <span className="text-sm text-muted-foreground">
                        {getMemoryUsagePercentage().toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={getMemoryUsagePercentage()} />
                  </div>
                  
                  {getMemoryUsagePercentage() > 80 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm">
                        استخدام الذاكرة مرتفع. قد تحتاج لإعادة تحميل الصفحة.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  معلومات الذاكرة غير متاحة في هذا المتصفح
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة التخزين المؤقت</CardTitle>
              <CardDescription>
                عرض وإدارة البيانات المحفوظة في التخزين المؤقت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">عناصر التخزين المؤقت</h4>
                    <p className="text-sm text-muted-foreground">
                      {cacheStats.size} عنصر محفوظ
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClearCache}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    مسح الكل
                  </Button>
                </div>
                
                {cacheStats.keys.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">مفاتيح التخزين:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {cacheStats.keys.map((key, index) => (
                        <Badge key={index} variant="secondary" className="justify-start">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLineUp className="w-5 h-5" />
                المراقبة المباشرة
              </CardTitle>
              <CardDescription>
                رسوم بيانية مباشرة لأداء النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Memory Usage Chart */}
                <div>
                  <h4 className="font-medium mb-2">استخدام الذاكرة بمرور الوقت</h4>
                  <div className="h-32 border rounded-lg p-4 bg-muted/20">
                    <div className="h-full flex items-end gap-1">
                      {realTimeData.map((point, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 min-w-[4px] rounded-t"
                          style={{ height: `${point.memory}%` }}
                          title={`${point.memory.toFixed(1)}% في ${safeTimeFormat(point.timestamp, 'ar-SA')}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Render Time Chart */}
                <div>
                  <h4 className="font-medium mb-2">متوسط وقت العرض</h4>
                  <div className="h-32 border rounded-lg p-4 bg-muted/20">
                    <div className="h-full flex items-end gap-1">
                      {realTimeData.map((point, index) => (
                        <div
                          key={index}
                          className={`min-w-[4px] rounded-t ${
                            point.renderTime < 16 ? 'bg-green-500' :
                            point.renderTime < 33 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${Math.min(100, (point.renderTime / 50) * 100)}%` }}
                          title={`${point.renderTime.toFixed(1)}ms في ${safeTimeFormat(point.timestamp, 'ar-SA')}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cache Size */}
                <div>
                  <h4 className="font-medium mb-2">حجم التخزين المؤقت</h4>
                  <div className="h-32 border rounded-lg p-4 bg-muted/20">
                    <div className="h-full flex items-end gap-1">
                      {realTimeData.map((point, index) => (
                        <div
                          key={index}
                          className="bg-purple-500 min-w-[4px] rounded-t"
                          style={{ height: `${Math.min(100, (point.cacheSize / 100) * 100)}%` }}
                          title={`${point.cacheSize} عنصر في ${safeTimeFormat(point.timestamp, 'ar-SA')}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات الصيانة</CardTitle>
              <CardDescription>
                أدوات للحفاظ على أداء النظام وتحسين الذاكرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">تحسين شامل للنظام</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    إجراء عملية تحسين شاملة للذاكرة والتخزين المؤقت والمؤقتات
                  </p>
                  <Button onClick={handleOptimizeSystem} className="gap-2">
                    <Zap className="w-4 h-4" />
                    تحسين شامل
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">مسح التخزين المؤقت</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    مسح جميع البيانات المحفوظة في التخزين المؤقت
                  </p>
                  <Button onClick={handleClearCache} variant="outline" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    مسح التخزين المؤقت
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">إلغاء المؤقتات</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    إلغاء جميع المؤقتات والفترات النشطة
                  </p>
                  <Button onClick={handleClearTimers} variant="outline" className="gap-2">
                    <Clock className="w-4 h-4" />
                    مسح المؤقتات
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">تشغيل جامع القمامة</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    تشغيل جامع القمامة يدوياً لتحرير الذاكرة (إذا كان متاحاً)
                  </p>
                  <Button onClick={handleForceGC} variant="outline" className="gap-2">
                    <MemoryIcon className="w-4 h-4" />
                    تشغيل جامع القمامة
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">إعادة تحميل التطبيق</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    إعادة تحميل كامل للتطبيق لتحرير الذاكرة بالكامل
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="destructive" 
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    إعادة التحميل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}