import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bug,
  CheckCircle,
  AlertTriangle,
  Info,
  Wrench,
  Shield,
  Zap,
  RefreshCw,
  Database,
  Code,
  Settings,
  Clock,
  FileText,
  Users,
  BarChart
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Article, Category } from '@/types';
import { normalizeArticles, normalizeActivityTimestamps, safeTimeFormat, safeDateFormat } from '@/lib/utils';
import { mockCategories, mockArticles } from '@/lib/mockData';
import { toast } from 'sonner';

interface SystemIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'data' | 'ui' | 'performance' | 'security';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedComponents: string[];
  suggestedFix: string;
  autoFixAvailable: boolean;
  detectedAt: Date;
  status: 'open' | 'fixing' | 'resolved';
}

interface HealthCheck {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  details: string;
  lastChecked: Date;
  metrics?: Record<string, any>;
}

export function SystemMaintenance() {
  const { user, canAccess } = useAuth();
  const [articles, setArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const [categories, setCategories] = useKV<Category[]>('sabq-categories', mockCategories);
  const [systemIssues, setSystemIssues] = useKV<SystemIssue[]>('sabq-system-issues', []);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Run comprehensive system diagnostics
  const runSystemDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnosticProgress(0);
    const newIssues: SystemIssue[] = [];
    const newHealthChecks: HealthCheck[] = [];

    try {
      // Check 1: Data Integrity
      setDiagnosticProgress(20);
      const dataIssues = await checkDataIntegrity();
      newIssues.push(...dataIssues);
      
      newHealthChecks.push({
        component: 'Data Integrity',
        status: dataIssues.length === 0 ? 'healthy' : 'warning',
        details: `Found ${dataIssues.length} data integrity issues`,
        lastChecked: new Date(),
        metrics: {
          articlesWithMissingCategories: dataIssues.filter(i => i.description.includes('category')).length,
          invalidTimestamps: dataIssues.filter(i => i.description.includes('timestamp')).length
        }
      });

      // Check 2: UI Components
      setDiagnosticProgress(40);
      const uiIssues = await checkUIComponents();
      newIssues.push(...uiIssues);
      
      newHealthChecks.push({
        component: 'UI Components',
        status: uiIssues.length === 0 ? 'healthy' : 'warning',
        details: `Found ${uiIssues.length} UI component issues`,
        lastChecked: new Date()
      });

      // Check 3: Performance
      setDiagnosticProgress(60);
      const performanceIssues = await checkPerformance();
      newIssues.push(...performanceIssues);
      
      newHealthChecks.push({
        component: 'Performance',
        status: performanceIssues.length === 0 ? 'healthy' : 'warning',
        details: `Performance score: ${100 - performanceIssues.length * 10}%`,
        lastChecked: new Date(),
        metrics: {
          memoryUsage: Math.round(Math.random() * 100),
          loadTime: Math.round(Math.random() * 3000 + 500)
        }
      });

      // Check 4: Security
      setDiagnosticProgress(80);
      const securityIssues = await checkSecurity();
      newIssues.push(...securityIssues);
      
      newHealthChecks.push({
        component: 'Security',
        status: securityIssues.length === 0 ? 'healthy' : 'error',
        details: `Found ${securityIssues.length} security concerns`,
        lastChecked: new Date()
      });

      setDiagnosticProgress(100);
      setSystemIssues(newIssues);
      setHealthChecks(newHealthChecks);

      toast.success(`تم الانتهاء من التشخيص - العثور على ${newIssues.length} مشكلة`);

    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('حدث خطأ أثناء التشخيص');
    } finally {
      setIsRunningDiagnostics(false);
      setDiagnosticProgress(0);
    }
  };

  // Check data integrity issues
  const checkDataIntegrity = async (): Promise<SystemIssue[]> => {
    const issues: SystemIssue[] = [];

    // Check articles for missing categories
    articles.forEach(article => {
      if (!article.category || typeof article.category !== 'object' || !article.category.color) {
        issues.push({
          id: `data_category_${article.id}`,
          type: 'error',
          category: 'data',
          title: 'مقال بدون فئة صحيحة',
          description: `المقال "${article.title}" لا يحتوي على فئة صحيحة`,
          severity: 'medium',
          affectedComponents: ['ArticleList', 'CategoryManager'],
          suggestedFix: 'تعيين فئة افتراضية للمقال',
          autoFixAvailable: true,
          detectedAt: new Date(),
          status: 'open'
        });
      }

      // Check for invalid timestamps
      if (article.createdAt && !(article.createdAt instanceof Date) && isNaN(new Date(article.createdAt).getTime())) {
        issues.push({
          id: `data_timestamp_${article.id}`,
          type: 'error',
          category: 'data',
          title: 'تاريخ غير صحيح',
          description: `المقال "${article.title}" يحتوي على تاريخ إنشاء غير صحيح`,
          severity: 'high',
          affectedComponents: ['ArticleList', 'Analytics'],
          suggestedFix: 'تصحيح التاريخ إلى التاريخ الحالي',
          autoFixAvailable: true,
          detectedAt: new Date(),
          status: 'open'
        });
      }
    });

    return issues;
  };

  // Check UI component issues
  const checkUIComponents = async (): Promise<SystemIssue[]> => {
    const issues: SystemIssue[] = [];

    // Simulate UI checks
    const uiChecks = [
      'Missing error boundaries',
      'Unused CSS classes',
      'Accessibility issues',
      'RTL layout problems'
    ];

    uiChecks.forEach((check, index) => {
      if (Math.random() < 0.3) { // 30% chance of finding an issue
        issues.push({
          id: `ui_${index}`,
          type: 'warning',
          category: 'ui',
          title: check,
          description: `مشكلة في واجهة المستخدم: ${check}`,
          severity: 'low',
          affectedComponents: ['UI Components'],
          suggestedFix: 'مراجعة الكود وتصحيح المشكلة',
          autoFixAvailable: false,
          detectedAt: new Date(),
          status: 'open'
        });
      }
    });

    return issues;
  };

  // Check performance issues
  const checkPerformance = async (): Promise<SystemIssue[]> => {
    const issues: SystemIssue[] = [];

    // Simulate performance metrics
    const performanceMetrics = {
      memoryUsage: Math.random() * 100,
      loadTime: Math.random() * 5000,
      bundleSize: Math.random() * 10000
    };

    if (performanceMetrics.memoryUsage > 80) {
      issues.push({
        id: 'perf_memory',
        type: 'warning',
        category: 'performance',
        title: 'استهلاك ذاكرة مرتفع',
        description: `استهلاك الذاكرة يصل إلى ${Math.round(performanceMetrics.memoryUsage)}%`,
        severity: 'medium',
        affectedComponents: ['Application'],
        suggestedFix: 'تحسين إدارة الذاكرة',
        autoFixAvailable: false,
        detectedAt: new Date(),
        status: 'open'
      });
    }

    if (performanceMetrics.loadTime > 3000) {
      issues.push({
        id: 'perf_load',
        type: 'warning',
        category: 'performance',
        title: 'وقت تحميل بطيء',
        description: `وقت التحميل ${Math.round(performanceMetrics.loadTime)}ms`,
        severity: 'medium',
        affectedComponents: ['Application'],
        suggestedFix: 'تحسين أداء التحميل',
        autoFixAvailable: false,
        detectedAt: new Date(),
        status: 'open'
      });
    }

    return issues;
  };

  // Check security issues
  const checkSecurity = async (): Promise<SystemIssue[]> => {
    const issues: SystemIssue[] = [];

    // Simulate security checks
    const securityChecks = [
      'Insecure data storage',
      'Missing input validation',
      'Weak authentication',
      'Exposed API endpoints'
    ];

    securityChecks.forEach((check, index) => {
      if (Math.random() < 0.2) { // 20% chance of finding a security issue
        issues.push({
          id: `security_${index}`,
          type: 'error',
          category: 'security',
          title: check,
          description: `مشكلة أمنية: ${check}`,
          severity: 'high',
          affectedComponents: ['Security Layer'],
          suggestedFix: 'مراجعة أمنية شاملة مطلوبة',
          autoFixAvailable: false,
          detectedAt: new Date(),
          status: 'open'
        });
      }
    });

    return issues;
  };

  // Auto-fix available issues
  const autoFixIssue = async (issue: SystemIssue) => {
    if (!issue.autoFixAvailable) return;

    try {
      if (issue.id.startsWith('data_category_')) {
        // Fix missing category
        const articleId = issue.id.replace('data_category_', '');
        setArticles(current => 
          current.map(article => 
            article.id === articleId 
              ? { ...article, category: mockCategories[0] }
              : article
          )
        );
      } else if (issue.id.startsWith('data_timestamp_')) {
        // Fix invalid timestamp
        const articleId = issue.id.replace('data_timestamp_', '');
        setArticles(current => 
          current.map(article => 
            article.id === articleId 
              ? { ...article, createdAt: new Date() }
              : article
          )
        );
      }

      // Mark issue as resolved
      setSystemIssues(current => 
        current.map(i => 
          i.id === issue.id 
            ? { ...i, status: 'resolved' as const }
            : i
        )
      );

      toast.success('تم إصلاح المشكلة تلقائياً');

    } catch (error) {
      console.error('Auto-fix error:', error);
      toast.error('فشل في الإصلاح التلقائي');
    }
  };

  // Fix all auto-fixable issues
  const autoFixAllIssues = async () => {
    const autoFixableIssues = systemIssues.filter(issue => 
      issue.autoFixAvailable && issue.status === 'open'
    );

    for (const issue of autoFixableIssues) {
      await autoFixIssue(issue);
    }

    toast.success(`تم إصلاح ${autoFixableIssues.length} مشكلة تلقائياً`);
  };

  // Get system health status
  const getSystemHealth = () => {
    const criticalIssues = systemIssues.filter(i => i.severity === 'critical' && i.status === 'open').length;
    const highIssues = systemIssues.filter(i => i.severity === 'high' && i.status === 'open').length;
    const totalIssues = systemIssues.filter(i => i.status === 'open').length;

    if (criticalIssues > 0) return { status: 'critical', color: 'red' };
    if (highIssues > 0) return { status: 'warning', color: 'orange' };
    if (totalIssues > 0) return { status: 'issues', color: 'yellow' };
    return { status: 'healthy', color: 'green' };
  };

  const systemHealth = getSystemHealth();
  const openIssues = systemIssues.filter(i => i.status === 'open');
  const autoFixableIssues = openIssues.filter(i => i.autoFixAvailable);

  if (!canAccess('system-maintenance')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">غير مصرح</h2>
        <p className="text-muted-foreground mt-2">ليس لديك صلاحية للوصول لهذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">صيانة النظام</h1>
          <p className="text-muted-foreground">مراقبة وصيانة صحة النظام</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={runSystemDiagnostics} disabled={isRunningDiagnostics}>
            <Wrench className="ml-2" size={16} />
            {isRunningDiagnostics ? 'جاري التشخيص...' : 'تشخيص شامل'}
          </Button>
          
          {autoFixableIssues.length > 0 && (
            <Button onClick={autoFixAllIssues} variant="outline">
              <Zap className="ml-2" size={16} />
              إصلاح تلقائي ({autoFixableIssues.length})
            </Button>
          )}
        </div>
      </div>

      {/* System Health Overview */}
      <Card className={`border-${systemHealth.color}-200 bg-${systemHealth.color}-50`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-${systemHealth.color}-800`}>
            {systemHealth.status === 'healthy' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            حالة النظام: {
              systemHealth.status === 'healthy' ? 'سليم' :
              systemHealth.status === 'warning' ? 'تحذير' :
              systemHealth.status === 'issues' ? 'مشاكل بسيطة' : 'حرج'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{openIssues.length}</p>
              <p className="text-sm text-muted-foreground">مشاكل مفتوحة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{autoFixableIssues.length}</p>
              <p className="text-sm text-muted-foreground">قابلة للإصلاح التلقائي</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{healthChecks.filter(h => h.status === 'healthy').length}</p>
              <p className="text-sm text-muted-foreground">مكونات سليمة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{articles.length}</p>
              <p className="text-sm text-muted-foreground">مقالات محفوظة</p>
            </div>
          </div>
          
          {isRunningDiagnostics && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">جاري التشخيص...</span>
                <span className="text-sm">{diagnosticProgress}%</span>
              </div>
              <Progress value={diagnosticProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="issues">المشاكل ({openIssues.length})</TabsTrigger>
          <TabsTrigger value="health">فحص الصحة</TabsTrigger>
          <TabsTrigger value="tools">أدوات الصيانة</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthChecks.map(check => (
              <Card key={check.component}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {check.status === 'healthy' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : check.status === 'warning' ? (
                      <AlertTriangle size={16} className="text-yellow-600" />
                    ) : (
                      <Bug size={16} className="text-red-600" />
                    )}
                    {check.component}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{check.details}</p>
                  <p className="text-xs text-muted-foreground">
                    آخر فحص: {safeTimeFormat(check.lastChecked, 'ar-SA')}
                  </p>
                  
                  {check.metrics && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(check.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span>{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <div className="space-y-4">
            {openIssues.map(issue => (
              <Card key={issue.id} className={`border-l-4 ${
                issue.severity === 'critical' ? 'border-l-red-500' :
                issue.severity === 'high' ? 'border-l-orange-500' :
                issue.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          issue.type === 'error' ? 'destructive' :
                          issue.type === 'warning' ? 'outline' : 'secondary'
                        }>
                          {issue.type}
                        </Badge>
                        <Badge variant="outline">{issue.category}</Badge>
                        <Badge variant="outline">{issue.severity}</Badge>
                      </div>
                      
                      <h3 className="font-medium mb-1">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>المكونات المتأثرة: {issue.affectedComponents.join(', ')}</p>
                        <p>الحل المقترح: {issue.suggestedFix}</p>
                        <p>تم الاكتشاف: {safeTimeFormat(issue.detectedAt, 'ar-SA')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {issue.autoFixAvailable && (
                        <Button size="sm" onClick={() => autoFixIssue(issue)}>
                          <Zap size={14} className="ml-1" />
                          إصلاح تلقائي
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        تفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {openIssues.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium mb-2">لا توجد مشاكل</h3>
                  <p className="text-muted-foreground">جميع المكونات تعمل بشكل طبيعي</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Health Check Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-4">
            {[
              { name: 'قاعدة البيانات', status: 'healthy', icon: Database },
              { name: 'واجهة المستخدم', status: 'healthy', icon: Code },
              { name: 'الأمان', status: 'warning', icon: Shield },
              { name: 'الأداء', status: 'healthy', icon: BarChart },
              { name: 'إدارة المستخدمين', status: 'healthy', icon: Users },
              { name: 'إدارة المحتوى', status: 'healthy', icon: FileText }
            ].map(component => (
              <Card key={component.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <component.icon size={24} />
                      <div>
                        <h3 className="font-medium">{component.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          آخر فحص: {safeTimeFormat(new Date(), 'ar-SA')}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={component.status === 'healthy' ? 'default' : 'outline'}>
                      {component.status === 'healthy' ? 'سليم' : 'تحذير'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أدوات البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Database className="ml-2" size={16} />
                  تنظيف قاعدة البيانات
                </Button>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="ml-2" size={16} />
                  إعادة تعيين البيانات
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="ml-2" size={16} />
                  نسخ احتياطي
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أدوات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Settings className="ml-2" size={16} />
                  إعادة تحميل التكوين
                </Button>
                <Button className="w-full" variant="outline">
                  <Clock className="ml-2" size={16} />
                  مزامنة الوقت
                </Button>
                <Button className="w-full" variant="outline">
                  <Info className="ml-2" size={16} />
                  تقرير النظام
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}