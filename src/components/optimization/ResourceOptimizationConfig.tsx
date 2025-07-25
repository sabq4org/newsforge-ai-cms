/**
 * Advanced Resource Optimization Configuration
 * Allows fine-tuning of the automatic optimization system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings,
  Cpu,
  MemoryStick,
  Timer,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash,
  Edit,
  RotateCcw
} from '@phosphor-icons/react';
import { AutoResourceOptimizer } from '@/lib/autoResourceOptimizer';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';

interface OptimizationConfig {
  memoryThreshold: number;
  performanceThreshold: number;
  monitoringInterval: number;
  optimizationInterval: number;
  enableAutoCleanup: boolean;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  priorityWeights: {
    high: number;
    medium: number;
    low: number;
  };
  customRules: Array<{
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    enabled: boolean;
  }>;
}

const defaultConfig: OptimizationConfig = {
  memoryThreshold: 100,
  performanceThreshold: 100,
  monitoringInterval: 10000,
  optimizationInterval: 30000,
  enableAutoCleanup: true,
  enableLazyLoading: true,
  enablePreloading: true,
  priorityWeights: {
    high: 3,
    medium: 2,
    low: 1
  },
  customRules: []
};

interface ResourceOptimizationConfigProps {
  className?: string;
}

export function ResourceOptimizationConfig({ className }: ResourceOptimizationConfigProps) {
  const [config, setConfig] = useKV<OptimizationConfig>('resource-optimization-config', defaultConfig);
  const [optimizer] = useState(() => AutoResourceOptimizer.getInstance());
  const [isConfigChanged, setIsConfigChanged] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [editingRule, setEditingRule] = useState<string | null>(null);

  useEffect(() => {
    // Apply configuration to optimizer
    applyConfigToOptimizer();
  }, [config]);

  const applyConfigToOptimizer = () => {
    // This would apply the configuration to the actual optimizer
    console.log('تطبيق الإعدادات:', config);
    setIsConfigChanged(false);
  };

  const handleConfigChange = (updates: Partial<OptimizationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setIsConfigChanged(true);
  };

  const handleAddCustomRule = () => {
    if (!newRuleName.trim()) return;

    const newRule = {
      id: `custom_${Date.now()}`,
      name: newRuleName,
      condition: 'metrics.memoryUsage > 100',
      action: 'memory_cleanup',
      priority: 5,
      enabled: true
    };

    handleConfigChange({
      customRules: [...config.customRules, newRule]
    });

    setNewRuleName('');
  };

  const handleDeleteRule = (ruleId: string) => {
    handleConfigChange({
      customRules: config.customRules.filter(rule => rule.id !== ruleId)
    });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    handleConfigChange({
      customRules: config.customRules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    });
  };

  const handleResetToDefaults = () => {
    setConfig(defaultConfig);
    setIsConfigChanged(true);
  };

  const getThresholdColor = (value: number, type: 'memory' | 'performance') => {
    if (type === 'memory') {
      if (value < 50) return 'text-green-600';
      if (value < 100) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value < 50) return 'text-green-600';
      if (value < 100) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className={cn('space-y-6 font-arabic', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إعدادات تحسين الموارد</h1>
          <p className="text-muted-foreground mt-2">
            تخصيص نظام التحسين التلقائي للموارد والذاكرة
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConfigChanged && (
            <Alert className="border-yellow-200 bg-yellow-50 p-2">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                يوجد تغييرات غير محفوظة
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={applyConfigToOptimizer}
            disabled={!isConfigChanged}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="thresholds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="thresholds">العتبات</TabsTrigger>
          <TabsTrigger value="intervals">الفترات الزمنية</TabsTrigger>
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="custom-rules">القواعد المخصصة</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                عتبات التحسين
              </CardTitle>
              <CardDescription>
                تحديد النقاط التي يبدأ عندها النظام في التحسين التلقائي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="memory-threshold">عتبة الذاكرة (MB)</Label>
                    <span className={`text-sm font-medium ${getThresholdColor(config.memoryThreshold, 'memory')}`}>
                      {config.memoryThreshold} MB
                    </span>
                  </div>
                  <Slider
                    id="memory-threshold"
                    min={10}
                    max={500}
                    step={10}
                    value={[config.memoryThreshold]}
                    onValueChange={([value]) => 
                      handleConfigChange({ memoryThreshold: value })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    عندما تتجاوز الذاكرة هذه القيمة، سيبدأ النظام في التنظيف التلقائي
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="performance-threshold">عتبة الأداء (ms)</Label>
                    <span className={`text-sm font-medium ${getThresholdColor(config.performanceThreshold, 'performance')}`}>
                      {config.performanceThreshold} ms
                    </span>
                  </div>
                  <Slider
                    id="performance-threshold"
                    min={10}
                    max={1000}
                    step={10}
                    value={[config.performanceThreshold]}
                    onValueChange={([value]) => 
                      handleConfigChange({ performanceThreshold: value })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    عندما يتجاوز زمن الرسم هذه القيمة، سيتم تفعيل التحسينات
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">أولوية عالية</span>
                  </div>
                  <Input
                    type="number"
                    value={config.priorityWeights.high}
                    onChange={(e) => handleConfigChange({
                      priorityWeights: {
                        ...config.priorityWeights,
                        high: parseInt(e.target.value) || 3
                      }
                    })}
                    className="text-center"
                  />
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">أولوية متوسطة</span>
                  </div>
                  <Input
                    type="number"
                    value={config.priorityWeights.medium}
                    onChange={(e) => handleConfigChange({
                      priorityWeights: {
                        ...config.priorityWeights,
                        medium: parseInt(e.target.value) || 2
                      }
                    })}
                    className="text-center"
                  />
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">أولوية منخفضة</span>
                  </div>
                  <Input
                    type="number"
                    value={config.priorityWeights.low}
                    onChange={(e) => handleConfigChange({
                      priorityWeights: {
                        ...config.priorityWeights,
                        low: parseInt(e.target.value) || 1
                      }
                    })}
                    className="text-center"
                  />
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intervals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                الفترات الزمنية
              </CardTitle>
              <CardDescription>
                تحديد تكرار المراقبة والتحسين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="monitoring-interval">فترة المراقبة (ثانية)</Label>
                  <Input
                    id="monitoring-interval"
                    type="number"
                    value={config.monitoringInterval / 1000}
                    onChange={(e) => handleConfigChange({
                      monitoringInterval: (parseInt(e.target.value) || 10) * 1000
                    })}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    كم مرة يتم جمع البيانات في الثانية
                  </p>
                </div>

                <div>
                  <Label htmlFor="optimization-interval">فترة التحسين (ثانية)</Label>
                  <Input
                    id="optimization-interval"
                    type="number"
                    value={config.optimizationInterval / 1000}
                    onChange={(e) => handleConfigChange({
                      optimizationInterval: (parseInt(e.target.value) || 30) * 1000
                    })}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    كم مرة يتم تشغيل التحسين في الثانية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                الميزات المتقدمة
              </CardTitle>
              <CardDescription>
                تفعيل أو إلغاء الميزات المختلفة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">التنظيف التلقائي</h4>
                    <p className="text-sm text-muted-foreground">
                      تنظيف الذاكرة والمكونات غير المستخدمة تلقائياً
                    </p>
                  </div>
                  <Switch
                    checked={config.enableAutoCleanup}
                    onCheckedChange={(enabled) => 
                      handleConfigChange({ enableAutoCleanup: enabled })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">التحميل الكسول</h4>
                    <p className="text-sm text-muted-foreground">
                      تأجيل تحميل المكونات حتى الحاجة إليها
                    </p>
                  </div>
                  <Switch
                    checked={config.enableLazyLoading}
                    onCheckedChange={(enabled) => 
                      handleConfigChange({ enableLazyLoading: enabled })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">التحميل المسبق</h4>
                    <p className="text-sm text-muted-foreground">
                      تحميل المكونات المستخدمة بكثرة مسبقاً
                    </p>
                  </div>
                  <Switch
                    checked={config.enablePreloading}
                    onCheckedChange={(enabled) => 
                      handleConfigChange({ enablePreloading: enabled })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                القواعد المخصصة
              </CardTitle>
              <CardDescription>
                إضافة قواعد تحسين مخصصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="اسم القاعدة الجديدة"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddCustomRule}
                  disabled={!newRuleName.trim()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </Button>
              </div>

              <div className="space-y-4">
                {config.customRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد قواعد مخصصة
                  </div>
                ) : (
                  config.customRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rule.name}</span>
                          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                            {rule.enabled ? 'مُفعل' : 'معطل'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          الشرط: {rule.condition} | الإجراء: {rule.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => 
                            handleToggleRule(rule.id, enabled)
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRule(rule.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleResetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين الافتراضي
        </Button>
      </div>
    </div>
  );
}