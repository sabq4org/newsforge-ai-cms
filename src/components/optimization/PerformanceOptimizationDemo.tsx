/**
 * Performance Optimization Demo
 * Shows how to integrate automatic resource optimization into components
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play,
  Pause,
  RotateCcw,
  Activity,
  MemoryStick,
  Clock,
  Zap
} from '@phosphor-icons/react';
import {
  ResourceAwareComponent,
  PerformanceMonitor,
  MemoryTracker,
  useComponentPerformanceTracking,
  withResourceTracking
} from '@/components/optimization';
import { useOptimizationStats } from '@/lib/autoResourceOptimizer';
import { cn } from '@/lib/utils';

interface PerformanceOptimizationDemoProps {
  className?: string;
}

// Demo component with heavy operations
function HeavyComponent() {
  const [data, setData] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { reportRenderTime, getAverageRenderTime, renderCount } = useComponentPerformanceTracking('HeavyComponent');

  const performHeavyOperation = () => {
    setIsProcessing(true);
    const startTime = performance.now();

    // Simulate heavy computation
    setTimeout(() => {
      const newData = Array.from({ length: 10000 }, (_, i) => Math.random() * i);
      setData(newData);
      
      const renderTime = performance.now() - startTime;
      reportRenderTime(renderTime);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">مكون ثقيل الحمل</h3>
        <Badge variant="outline">
          رسم #{renderCount}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">متوسط زمن الرسم:</span>
            <div className="font-mono">{getAverageRenderTime().toFixed(2)}ms</div>
          </div>
          <div>
            <span className="text-muted-foreground">عدد العناصر:</span>
            <div className="font-mono">{data.length.toLocaleString()}</div>
          </div>
        </div>

        <Button 
          onClick={performHeavyOperation} 
          disabled={isProcessing}
          className="w-full gap-2"
        >
          {isProcessing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              تشغيل عملية ثقيلة
            </>
          )}
        </Button>

        {data.length > 0 && (
          <div className="text-xs text-muted-foreground">
            آخر معالجة: {new Date().toLocaleTimeString('ar')}
          </div>
        )}
      </div>
    </Card>
  );
}

// Enhanced version with resource tracking
const OptimizedHeavyComponent = withResourceTracking(HeavyComponent, 'OptimizedHeavyComponent');

export function PerformanceOptimizationDemo({ className }: PerformanceOptimizationDemoProps) {
  const stats = useOptimizationStats();
  const [showOptimized, setShowOptimized] = useState(false);
  const [componentsCount, setComponentsCount] = useState(1);

  const renderMultipleComponents = () => {
    const components = [];
    for (let i = 0; i < componentsCount; i++) {
      components.push(
        showOptimized ? (
          <ResourceAwareComponent 
            key={i} 
            componentName={`Demo-${i}`}
            priority={i < 2 ? 'high' : 'medium'}
          >
            <OptimizedHeavyComponent />
          </ResourceAwareComponent>
        ) : (
          <HeavyComponent key={i} />
        )
      );
    }
    return components;
  };

  return (
    <div className={cn('space-y-6 font-arabic', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">عرض توضيحي لتحسين الأداء</h1>
          <p className="text-muted-foreground mt-2">
            مقارنة بين المكونات العادية والمحسنة تلقائياً
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showOptimized ? 'default' : 'outline'}
            onClick={() => setShowOptimized(!showOptimized)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            {showOptimized ? 'محسن' : 'عادي'}
          </Button>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الذاكرة الحالية</CardTitle>
            <MemoryStick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentMemory.toFixed(1)} MB
            </div>
            <Progress 
              value={Math.min((stats.currentMemory / 200) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكونات النشطة</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComponents}</div>
            <p className="text-xs text-muted-foreground">
              محسن: {showOptimized ? 'نعم' : 'لا'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الرسم</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRenderTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRenderTime < 50 ? 'ممتاز' : 'يحتاج تحسين'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.isActive ? '🟢' : '🔴'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.isActive ? 'نشط' : 'معطل'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Alert */}
      <Alert>
        <Activity className="w-4 h-4" />
        <AlertDescription>
          هذا عرض توضيحي لمقارنة الأداء. المكونات المحسنة تستخدم نظام التتبع التلقائي للموارد.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>التحكم في العرض التوضيحي</CardTitle>
          <CardDescription>
            اختبار المكونات بأحمال مختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">عدد المكونات:</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComponentsCount(Math.max(1, componentsCount - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center">{componentsCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComponentsCount(Math.min(5, componentsCount + 1))}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تشغيل العرض
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Components */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          المكونات التجريبية ({showOptimized ? 'محسن' : 'عادي'})
        </h2>
        
        {showOptimized ? (
          <PerformanceMonitor sectionName="DemoSection">
            <MemoryTracker componentName="DemoComponents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMultipleComponents()}
              </div>
            </MemoryTracker>
          </PerformanceMonitor>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderMultipleComponents()}
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>نصائح لتحسين الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              استخدم <code>ResourceAwareComponent</code> للمكونات الثقيلة
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              راقب استخدام الذاكرة مع <code>MemoryTracker</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              قس الأداء باستخدام <code>PerformanceMonitor</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              استخدم <code>withResourceTracking</code> للمكونات الموجودة
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}