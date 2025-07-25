/**
 * Automatic Resource Optimization System Overview
 * Complete documentation and integration guide
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  MemoryStick,
  Cpu,
  Timer,
  Target,
  Zap,
  Code,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings
} from '@phosphor-icons/react';
import { useOptimizationStats } from '@/lib/autoResourceOptimizer';
import { cn } from '@/lib/utils';

interface AutoResourceOptimizationOverviewProps {
  className?: string;
}

export function AutoResourceOptimizationOverview({ className }: AutoResourceOptimizationOverviewProps) {
  const stats = useOptimizationStats();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: 'auto-monitoring',
      name: 'المراقبة التلقائية',
      description: 'تتبع استخدام الذاكرة والأداء في الوقت الفعلي',
      icon: Activity,
      status: 'active',
      metrics: ['استخدام الذاكرة', 'زمن الرسم', 'عدد المكونات']
    },
    {
      id: 'pattern-analysis',
      name: 'تحليل الأنماط',
      description: 'فهم سلوك المستخدم وأنماط استخدام المكونات',
      icon: TrendingUp,
      status: 'active',
      metrics: ['تكرار الاستخدام', 'وقت الوصول', 'الأولوية']
    },
    {
      id: 'auto-optimization',
      name: 'التحسين التلقائي',
      description: 'تطبيق تحسينات ذكية بناءً على البيانات المجمعة',
      icon: Zap,
      status: 'active',
      metrics: ['تنظيف الذاكرة', 'التحميل الكسول', 'التحميل المسبق']
    },
    {
      id: 'performance-tracking',
      name: 'تتبع الأداء',
      description: 'قياس وتسجيل أداء المكونات المختلفة',
      icon: Timer,
      status: 'active',
      metrics: ['متوسط الرسم', 'عدد الرسوم', 'استهلاك الموارد']
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: 'تفعيل النظام',
      description: 'إضافة النظام إلى التطبيق الرئيسي',
      code: `import { initializeAutoResourceOptimizer } from '@/lib/autoResourceOptimizer';

// في ملف App.tsx
initializeAutoResourceOptimizer();`
    },
    {
      step: 2,
      title: 'تتبع المكونات',
      description: 'إضافة تتبع للمكونات المهمة',
      code: `import { useResourceOptimization } from '@/lib/autoResourceOptimizer';

function MyComponent() {
  useResourceOptimization('MyComponent');
  
  return <div>محتوى المكون</div>;
}`
    },
    {
      step: 3,
      title: 'تغليف المكونات',
      description: 'استخدام مكونات التتبع المتقدمة',
      code: `import { ResourceAwareComponent } from '@/components/optimization';

<ResourceAwareComponent 
  componentName="HeavyComponent"
  priority="high"
  trackMemory={true}
>
  <MyHeavyComponent />
</ResourceAwareComponent>`
    },
    {
      step: 4,
      title: 'مراقبة الأداء',
      description: 'إضافة مراقبة تفصيلية للأقسام المهمة',
      code: `import { PerformanceMonitor } from '@/components/optimization';

<PerformanceMonitor 
  sectionName="CriticalSection"
  warningThreshold={100}
  errorThreshold={500}
>
  <CriticalComponent />
</PerformanceMonitor>`
    }
  ];

  const bestPractices = [
    {
      title: 'تحديد الأولويات',
      description: 'حدد أولوية المكونات بناءً على أهميتها وتأثيرها على تجربة المستخدم',
      icon: Target,
      level: 'essential'
    },
    {
      title: 'مراقبة الذاكرة',
      description: 'تتبع استخدام الذاكرة للمكونات الثقيلة وقم بتنظيفها عند الحاجة',
      icon: MemoryStick,
      level: 'important'
    },
    {
      title: 'التحميل الذكي',
      description: 'استخدم التحميل الكسول للمكونات غير الضرورية والتحميل المسبق للمهمة',
      icon: Cpu,
      level: 'recommended'
    },
    {
      title: 'القياس المستمر',
      description: 'راقب الأداء باستمرار وقم بضبط الإعدادات حسب الحاجة',
      icon: Activity,
      level: 'essential'
    }
  ];

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'essential': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'recommended': return 'bg-blue-100 text-blue-800 border-blue-200';
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
            دليل شامل لاستخدام وتكامل نظام تحسين الأداء التلقائي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={stats.isActive ? 'default' : 'secondary'}>
            {stats.isActive ? 'نشط' : 'معطل'}
          </Badge>
        </div>
      </div>

      {/* Current Status */}
      <Alert>
        <Activity className="w-4 h-4" />
        <AlertDescription>
          النظام يراقب حالياً {stats.totalComponents} مكون ويستخدم {stats.currentMemory.toFixed(1)} MB من الذاكرة
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="integration">التكامل</TabsTrigger>
          <TabsTrigger value="best-practices">أفضل الممارسات</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                الميزات الرئيسية
              </CardTitle>
              <CardDescription>
                مكونات نظام التحسين التلقائي وكيفية عملها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={feature.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {feature.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {feature.metrics.map((metric) => (
                              <Badge key={metric} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                خطوات التكامل
              </CardTitle>
              <CardDescription>
                كيفية دمج النظام في مشروعك خطوة بخطوة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {integrationSteps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                أفضل الممارسات
              </CardTitle>
              <CardDescription>
                نصائح وإرشادات لاستخدام النظام بفعالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestPractices.map((practice, index) => {
                  const IconComponent = practice.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{practice.title}</h3>
                          <Badge className={getPriorityColor(practice.level)}>
                            {practice.level === 'essential' ? 'أساسي' : 
                             practice.level === 'important' ? 'مهم' : 'مُوصى به'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {practice.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                أدوات المراقبة المتاحة
              </CardTitle>
              <CardDescription>
                لوحات التحكم والأدوات المختلفة لمراقبة الأداء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">لوحة المراقبة</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    مراقبة مباشرة للموارد والأداء
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    فتح اللوحة
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">الإعدادات</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    تخصيص قواعد وعتبات التحسين
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    الإعدادات
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">العرض التوضيحي</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    اختبار وعرض ميزات التحسين
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    تشغيل العرض
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.currentMemory.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">ذاكرة (MB)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalComponents}
              </div>
              <div className="text-sm text-muted-foreground">مكونات مُراقبة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageRenderTime.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">متوسط الرسم (ms)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.isActive ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">حالة النظام</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}