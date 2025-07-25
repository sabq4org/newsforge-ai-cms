/**
 * Auto Resource Optimizer Dashboard
 * Real-time monitoring and control for automatic resource optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  MemoryStick,
  Cpu,
  Zap,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from '@phosphor-icons/react';
import {
  AutoResourceOptimizer,
  useOptimizationStats,
  useResourceOptimization
} from '@/lib/autoResourceOptimizer';
import { cn } from '@/lib/utils';

interface AutoResourceOptimizerDashboardProps {
  className?: string;
}

export function AutoResourceOptimizerDashboard({ className }: AutoResourceOptimizerDashboardProps) {
  useResourceOptimization('AutoResourceOptimizerDashboard');
  
  const stats = useOptimizationStats();
  const [optimizer] = useState(() => AutoResourceOptimizer.getInstance());
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailedMetrics, setDetailedMetrics] = useState(optimizer.getDetailedMetrics());
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh detailed metrics every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDetailedMetrics(optimizer.getDetailedMetrics());
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [optimizer]);

  const handleToggleOptimizer = (enabled: boolean) => {
    optimizer.setActive(enabled);
    setRefreshKey(prev => prev + 1);
  };

  const handleManualOptimization = () => {
    // Trigger manual optimization cycle
    optimizer.setActive(false);
    setTimeout(() => optimizer.setActive(true), 100);
    setRefreshKey(prev => prev + 1);
  };

  const getMemoryStatusColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryStatusText = (usage: number) => {
    if (usage < 50) return 'مثالي';
    if (usage < 100) return 'مقبول';
    return 'مرتفع';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes;
    return `${mb.toFixed(1)} MB`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('space-y-6 font-arabic', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">نظام التحسين التلقائي للموارد</h1>
          <p className="text-muted-foreground mt-2">
            مراقبة وتحكم في استخدام الذاكرة والموارد بناءً على أنماط الاستخدام
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={stats.isActive}
              onCheckedChange={handleToggleOptimizer}
              id="optimizer-toggle"
            />
            <label htmlFor="optimizer-toggle" className="text-sm font-medium">
              {stats.isActive ? 'مُفعل' : 'معطل'}
            </label>
          </div>
          <Button
            onClick={handleManualOptimization}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            تحسين يدوي
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {stats.currentMemory > 100 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            استخدام الذاكرة مرتفع ({formatBytes(stats.currentMemory)}). النظام يعمل على التحسين التلقائي.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام الذاكرة</CardTitle>
            <MemoryStick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getMemoryStatusColor(stats.currentMemory)}>
                {formatBytes(stats.currentMemory)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              الحالة: {getMemoryStatusText(stats.currentMemory)}
            </p>
            <Progress 
              value={Math.min((stats.currentMemory / 200) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكونات المُراقبة</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComponents}</div>
            <p className="text-xs text-muted-foreground">
              نشط: {stats.highPriorityComponents + stats.mediumPriorityComponents}
            </p>
            <div className="flex gap-1 mt-2">
              <div className="flex-1 bg-red-200 h-2 rounded" style={{width: `${(stats.highPriorityComponents / stats.totalComponents) * 100}%`}} />
              <div className="flex-1 bg-yellow-200 h-2 rounded" style={{width: `${(stats.mediumPriorityComponents / stats.totalComponents) * 100}%`}} />
              <div className="flex-1 bg-green-200 h-2 rounded" style={{width: `${(stats.lowPriorityComponents / stats.totalComponents) * 100}%`}} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط زمن الرسم</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRenderTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRenderTime < 16 ? 'ممتاز' : stats.averageRenderTime < 50 ? 'جيد' : 'يحتاج تحسين'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">دورات التحسين</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOptimizations}</div>
            <p className="text-xs text-muted-foreground">
              حالة النظام: {stats.isActive ? 'نشط' : 'معطل'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {stats.isActive ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  يعمل
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Pause className="w-3 h-3 ml-1" />
                  متوقف
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">أنماط الاستخدام</TabsTrigger>
          <TabsTrigger value="metrics">المقاييس المباشرة</TabsTrigger>
          <TabsTrigger value="rules">قواعد التحسين</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                أنماط استخدام المكونات
              </CardTitle>
              <CardDescription>
                تحليل سلوك المكونات وتكرار استخدامها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedMetrics.patterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات أنماط الاستخدام بعد
                  </div>
                ) : (
                  detailedMetrics.patterns
                    .sort((a, b) => b.frequency - a.frequency)
                    .slice(0, 10)
                    .map((pattern, index) => (
                      <div key={pattern.componentName} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pattern.componentName}</span>
                            <Badge className={getPriorityColor(pattern.priority)}>
                              {pattern.priority === 'high' ? 'عالي' : pattern.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            التكرار: {pattern.frequency} | الرسم: {pattern.renderTime.toFixed(1)}ms | 
                            آخر استخدام: {new Date(pattern.lastAccessed).toLocaleString('ar')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{pattern.accessCount} مرة</div>
                          <Progress 
                            value={Math.min((pattern.frequency / 50) * 100, 100)} 
                            className="w-20 h-2 mt-1"
                          />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                المقاييس في الوقت الفعلي
              </CardTitle>
              <CardDescription>
                مراقبة الأداء والذاكرة خلال آخر 20 قياس
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedMetrics.metrics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات مقاييس بعد
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedMetrics.metrics.slice(-10).map((metric, index) => (
                      <div key={metric.timestamp} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            القياس #{detailedMetrics.metrics.length - 10 + index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString('ar')}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">الذاكرة:</span>
                            <span className={`text-sm font-medium ${getMemoryStatusColor(metric.memoryUsage)}`}>
                              {formatBytes(metric.memoryUsage)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">الرسم:</span>
                            <span className="text-sm">{metric.renderCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">الوقت:</span>
                            <span className="text-sm">{metric.loadTime.toFixed(1)}ms</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                قواعد التحسين النشطة
              </CardTitle>
              <CardDescription>
                القواعد التي يستخدمها النظام لاتخاذ قرارات التحسين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedMetrics.rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">
                        المعرف: {rule.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        أولوية {rule.priority}
                      </Badge>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}