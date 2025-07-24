import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react';

interface RuntimeError {
  type: 'import' | 'runtime' | 'component' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source?: string;
  timestamp: Date;
}

export function RuntimeChecker() {
  const [errors, setErrors] = useState<RuntimeError[]>([]);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    const checkSystemHealth = () => {
      const newErrors: RuntimeError[] = [];

      // Check for missing imports
      try {
        // Check if ChartLineUp is available from phosphor icons
        import('@phosphor-icons/react').then((icons) => {
          if (!icons.ChartLineUp) {
            setErrors(prev => [...prev, {
              type: 'import',
              severity: 'high',
              message: 'ChartLineUp icon not found in @phosphor-icons/react',
              source: 'PhosphorIcons',
              timestamp: new Date()
            }]);
          }
        }).catch(e => {
          setErrors(prev => [...prev, {
            type: 'import',
            severity: 'critical',
            message: 'Failed to import @phosphor-icons/react',
            source: 'PhosphorIcons',
            timestamp: new Date()
          }]);
        });
      } catch (e) {
        newErrors.push({
          type: 'import',
          severity: 'critical',
          message: 'Failed to check @phosphor-icons/react import',
          source: 'PhosphorIcons',
          timestamp: new Date()
        });
      }

      // Check data normalization
      try {
        const testArticle = {
          id: 'test',
          title: 'Test Article',
          content: 'Test content',
          category: null
        };
        
        import('@/lib/utils').then(({ normalizeArticles }) => {
          const normalized = normalizeArticles([testArticle]);
          
          if (!normalized[0]?.category?.color) {
            setErrors(prev => [...prev, {
              type: 'data',
              severity: 'medium',
              message: 'Article normalization failed to add category.color',
              source: 'Utils',
              timestamp: new Date()
            }]);
          }
        }).catch(e => {
          setErrors(prev => [...prev, {
            type: 'runtime',
            severity: 'high',
            message: `Data normalization error: ${(e as Error).message}`,
            source: 'Utils',
            timestamp: new Date()
          }]);
        });
      } catch (e) {
        newErrors.push({
          type: 'runtime',
          severity: 'high',
          message: `Data normalization error: ${(e as Error).message}`,
          source: 'Utils',
          timestamp: new Date()
        });
      }

      // Check KV storage access
      try {
        import('@github/spark/hooks').then(({ useKV }) => {
          if (!useKV) {
            setErrors(prev => [...prev, {
              type: 'import',
              severity: 'critical',
              message: 'useKV hook not accessible',
              source: 'Spark',
              timestamp: new Date()
            }]);
          }
        }).catch(e => {
          setErrors(prev => [...prev, {
            type: 'import',
            severity: 'critical',
            message: 'Failed to import Spark hooks',
            source: 'Spark',
            timestamp: new Date()
          }]);
        });
      } catch (e) {
        newErrors.push({
          type: 'import',
          severity: 'critical',
          message: 'Failed to check Spark hooks',
          source: 'Spark',
          timestamp: new Date()
        });
      }

      setErrors(newErrors);
      
      if (newErrors.some(e => e.severity === 'critical')) {
        setSystemStatus('error');
      } else if (newErrors.some(e => e.severity === 'high' || e.severity === 'medium')) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('healthy');
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Warning className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Warning className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">فحص حالة النظام</h1>
          <p className="text-muted-foreground">
            مراقبة حالة النظام وكشف الأخطاء في الوقت الفعلي
          </p>
        </div>
        <Badge 
          variant={systemStatus === 'healthy' ? 'default' : systemStatus === 'warning' ? 'secondary' : 'destructive'}
          className="text-sm"
        >
          {systemStatus === 'healthy' && <CheckCircle className="h-4 w-4 ml-1" />}
          {systemStatus === 'warning' && <Warning className="h-4 w-4 ml-1" />}
          {systemStatus === 'error' && <XCircle className="h-4 w-4 ml-1" />}
          {systemStatus === 'healthy' ? 'النظام سليم' : systemStatus === 'warning' ? 'تحذيرات' : 'أخطاء'}
        </Badge>
      </div>

      {systemStatus === 'healthy' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            النظام يعمل بشكل طبيعي. جميع المكونات والواردات متاحة.
          </AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning className="h-5 w-5 text-yellow-500" />
              الأخطاء المكتشفة ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errors.map((error, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(error.severity) as any}>
                          {error.severity}
                        </Badge>
                        <Badge variant="outline">
                          {error.type}
                        </Badge>
                        {error.source && (
                          <Badge variant="secondary">
                            {error.source}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">{error.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.timestamp ? error.timestamp.toLocaleString('ar-SA') : 'وقت غير محدد'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {errors.filter(e => e.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">أخطاء حرجة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {errors.filter(e => e.severity === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">أخطاء عالية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {errors.filter(e => e.severity === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">تحذيرات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {errors.length === 0 ? '✓' : errors.filter(e => e.severity === 'low').length}
              </div>
              <div className="text-sm text-muted-foreground">معلومات</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}