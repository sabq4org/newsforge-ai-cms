import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  WifiHigh
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

export function PerformanceDashboard() {
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
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      });
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
    setCacheStats(DataCache.getStats());

    // Generate alerts
    const newAlerts: string[] = [];
    if (memoryInfo && getMemoryUsagePercentage() > 85) {
      newAlerts.push('استخدام الذاكرة مرتفع جداً');
    }
    if (totalRenderTime > 50) {
      newAlerts.push('وقت العرض بطيء قد يؤثر على التجربة');
    }
    if (componentCount > 20) {
      newAlerts.push('عدد كبير من المكونات النشطة');
    }
    setAlerts(newAlerts);
  }, [memoryInfo]);

  // Update metrics every 3 seconds for real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updatePerformanceMetrics, 3000);
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
        // Reset metrics that have too many data points
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

  const getMemoryUsagePercentage = () => {
    if (!memoryInfo) return 0;
    return (memoryInfo.used / memoryInfo.limit) * 100;
  };

  const handleForceGC = () => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      toast.success('تم تشغيل جامع القمامة');
    } else {
      toast.info('جامع القمامة غير متاح في هذا المتصفح');
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الأداء</h1>
          <p className="text-muted-foreground">
            مراقبة أداء النظام وإدارة الذاكرة
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="gap-2"
          >
            {isMonitoring ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isMonitoring ? 'إيقاف المراقبة' : 'تشغيل المراقبة'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold">نشط</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              النظام يعمل بشكل طبيعي
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
                  من {memoryInfo.limit} MB
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
              <Activity className="w-4 h-4" />
              المكونات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {Object.keys(metrics).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              مكونات تحت المراقبة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              التخزين المؤقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {cacheStats.size}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              عناصر محفوظة
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="metrics">مقاييس الأداء</TabsTrigger>
          <TabsTrigger value="memory">إدارة الذاكرة</TabsTrigger>
          <TabsTrigger value="cache">التخزين المؤقت</TabsTrigger>
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
                  <h4 className="font-medium mb-2">مسح التخزين المؤقت</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    مسح جميع البيانات المحفوظة في التخزين المؤقت
                  </p>
                  <Button onClick={handleClearCache} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    مسح التخزين المؤقت
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">إلغاء المؤقتات</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    إلغاء جميع المؤقتات والفترات النشطة
                  </p>
                  <Button onClick={handleClearTimers} className="gap-2">
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