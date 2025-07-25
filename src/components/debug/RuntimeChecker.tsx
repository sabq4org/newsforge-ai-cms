import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react';
import { safeDateFormat, normalizeArticles } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';

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
  const [testData, setTestData] = useKV('runtime-test', null);

  useEffect(() => {
    const checkSystemHealth = () => {
      const newErrors: RuntimeError[] = [];

      // Check for essential system components
      try {
        // Check if essential utilities are available
        if (typeof safeDateFormat !== 'function') {
          newErrors.push({
            type: 'import',
            severity: 'high',
            message: 'Date formatting utilities not available',
            source: 'utils.ts',
            timestamp: new Date()
          });
        }

        // Check if spark runtime is available
        if (typeof window !== 'undefined' && !window.spark) {
          newErrors.push({
            type: 'runtime',
            severity: 'medium',
            message: 'Spark runtime not initialized',
            source: 'global',
            timestamp: new Date()
          });
        }

        // Check if KV storage is working
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('health-check', 'test');
            localStorage.removeItem('health-check');
          }
        } catch {
          newErrors.push({
            type: 'runtime',
            severity: 'high',
            message: 'Local storage not available',
            source: 'storage',
            timestamp: new Date()
          });
        }

        // Check data normalization
        try {
          const testArticle = {
            id: 'test',
            title: 'Test Article',
            content: 'Test content',
            category: null,
            author: { id: 'test', name: 'Test' },
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft' as const,
            language: 'ar' as const,
            priority: 'normal' as const,
            analytics: {
              views: 0,
              uniqueViews: 0,
              likes: 0,
              shares: 0,
              comments: 0,
              readTime: 0,
              scrollDepth: 0,
              bounceRate: 0,
              clickThroughRate: 0
            }
          };
          
          const normalized = normalizeArticles([testArticle]);
          
          if (!normalized[0]?.category?.color) {
            newErrors.push({
              type: 'data',
              severity: 'medium',
              message: 'Article normalization failed to add category.color',
              source: 'Utils',
              timestamp: new Date()
            });
          }
        } catch (e) {
          newErrors.push({
            type: 'runtime',
            severity: 'high',
            message: `Data normalization error: ${(e as Error).message}`,
            source: 'Utils',
            timestamp: new Date()
          });
        }

        // Test KV hook functionality
        try {
          if (typeof useKV === 'function') {
            // KV hook is available
          } else {
            newErrors.push({
              type: 'import',
              severity: 'critical',
              message: 'useKV hook not available',
              source: 'Spark Hooks',
              timestamp: new Date()
            });
          }
        } catch (e) {
          newErrors.push({
            type: 'runtime',
            severity: 'critical',
            message: `KV storage error: ${(e as Error).message}`,
            source: 'Spark Hooks',
            timestamp: new Date()
          });
        }

        setErrors(newErrors);
        setSystemStatus(newErrors.length === 0 ? 'healthy' : 
                      newErrors.some(e => e.severity === 'critical') ? 'error' : 'warning');
      } catch (error) {
        console.error('Health check failed:', error);
        setErrors([{
          type: 'runtime',
          severity: 'critical',
          message: 'System health check failed',
          source: 'RuntimeChecker',
          timestamp: new Date()
        }]);
        setSystemStatus('error');
      }
    };

    checkSystemHealth();
    
    // Run health check every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const clearErrors = () => {
    setErrors([]);
    setSystemStatus('healthy');
  };

  const testKVStorage = async () => {
    try {
      setTestData({ test: true, timestamp: Date.now() });
      console.log('KV storage test successful');
    } catch (error) {
      console.error('KV storage test failed:', error);
      setErrors(prev => [...prev, {
        type: 'runtime',
        severity: 'high',
        message: `KV storage test failed: ${(error as Error).message}`,
        source: 'Manual Test',
        timestamp: new Date()
      }]);
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Runtime System Health Check
            <Badge variant={systemStatus === 'healthy' ? 'default' : 'destructive'}>
              {systemStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={clearErrors} variant="outline" size="sm">
                Clear Errors
              </Button>
              <Button onClick={testKVStorage} variant="outline" size="sm">
                Test KV Storage
              </Button>
            </div>

            {errors.length === 0 ? (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  All system components are functioning normally.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">
                  Detected Issues ({errors.length})
                </h3>
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {error.source} - {safeDateFormat(error.timestamp)}
                        </span>
                      </div>
                      <p>{error.message}</p>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">System Information</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p>Spark Runtime: {typeof window !== 'undefined' && window.spark ? '✓ Available' : '✗ Not Found'}</p>
                <p>KV Storage: {typeof useKV === 'function' ? '✓ Available' : '✗ Not Available'}</p>
                <p>Local Storage: {typeof localStorage !== 'undefined' ? '✓ Available' : '✗ Not Available'}</p>
                <p>Date Utils: {typeof safeDateFormat === 'function' ? '✓ Available' : '✗ Not Available'}</p>
                <p>Data Normalization: {typeof normalizeArticles === 'function' ? '✓ Available' : '✗ Not Available'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RuntimeChecker;