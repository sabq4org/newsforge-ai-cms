import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Flag,
  Brain,
  FileText,
  User,
  Calendar,
  TrendingUp,
  Settings,
  RefreshCw,
  Download,
  Filter
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';
import { toast } from 'sonner';

interface ModerationAlert {
  id: string;
  articleId: string;
  type: 'content' | 'language' | 'policy' | 'bias' | 'sensitivity' | 'accuracy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  autoDetected: boolean;
}

interface ModerationRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  description: string;
}

interface ContentModerationProps {
  onArticleSelect: (article: Article) => void;
}

export function ContentModeration({ onArticleSelect }: ContentModerationProps) {
  const [rawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles);
  
  const [moderationAlerts, setModerationAlerts] = useKV<ModerationAlert[]>('moderation-alerts', []);
  const [moderationRules, setModerationRules] = useKV<ModerationRule[]>('moderation-rules', [
    {
      id: 'rule_1',
      name: 'كلمات محظورة',
      type: 'banned-words',
      enabled: true,
      severity: 'high',
      keywords: ['كلمة محظورة', 'محتوى غير مناسب'],
      description: 'اكتشاف الكلمات المحظورة في المحتوى'
    },
    {
      id: 'rule_2',
      name: 'تحليل المشاعر',
      type: 'sentiment',
      enabled: true,
      severity: 'medium',
      keywords: [],
      description: 'تحليل الطابع العاطفي للمحتوى'
    },
    {
      id: 'rule_3',
      name: 'دقة المعلومات',
      type: 'fact-check',
      enabled: true,
      severity: 'critical',
      keywords: [],
      description: 'التحقق من دقة المعلومات والادعاءات'
    }
  ]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('alerts');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const analyzeArticleContent = async (article: Article) => {
    const alerts: ModerationAlert[] = [];
    
    try {
      // 1. Language Detection and Analysis
      const languageAnalysis = await analyzeLangaugeAndTone(article);
      if (languageAnalysis.issues.length > 0) {
        languageAnalysis.issues.forEach(issue => {
          alerts.push({
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            articleId: article.id,
            type: 'language',
            severity: issue.severity,
            message: issue.message,
            suggestion: issue.suggestion,
            createdAt: new Date(),
            status: 'pending',
            autoDetected: true
          });
        });
      }

      // 2. Content Policy Check
      const policyCheck = await checkContentPolicy(article);
      if (policyCheck.violations.length > 0) {
        policyCheck.violations.forEach(violation => {
          alerts.push({
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            articleId: article.id,
            type: 'policy',
            severity: violation.severity,
            message: violation.message,
            suggestion: violation.suggestion,
            createdAt: new Date(),
            status: 'pending',
            autoDetected: true
          });
        });
      }

      // 3. Bias Detection
      const biasAnalysis = await detectBias(article);
      if (biasAnalysis.biasScore > 0.7) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          articleId: article.id,
          type: 'bias',
          severity: biasAnalysis.biasScore > 0.9 ? 'high' : 'medium',
          message: `تم اكتشاف تحيز محتمل: ${biasAnalysis.type}`,
          suggestion: biasAnalysis.suggestion,
          createdAt: new Date(),
          status: 'pending',
          autoDetected: true
        });
      }

      // 4. Sensitivity Analysis
      const sensitivityCheck = await checkSensitivity(article);
      if (sensitivityCheck.isSensitive) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          articleId: article.id,
          type: 'sensitivity',
          severity: sensitivityCheck.severity,
          message: `محتوى حساس: ${sensitivityCheck.reason}`,
          suggestion: sensitivityCheck.suggestion,
          createdAt: new Date(),
          status: 'pending',
          autoDetected: true
        });
      }

      return alerts;
    } catch (error) {
      console.error('Content analysis error:', error);
      return [];
    }
  };

  const analyzeLangaugeAndTone = async (article: Article) => {
    const prompt = spark.llmPrompt`
      Analyze this Arabic news article for language quality and tone issues:
      
      Title: "${article.title}"
      Content: "${article.content.substring(0, 1000)}..."
      
      Check for:
      1. Grammar and spelling errors
      2. Inappropriate tone for journalism
      3. Offensive or inflammatory language
      4. Professional writing standards
      
      Return a JSON object with:
      {
        "issues": [
          {
            "type": "grammar|tone|language|professionalism",
            "severity": "low|medium|high",
            "message": "Description in Arabic",
            "suggestion": "How to fix it in Arabic"
          }
        ]
      }
    `;

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(result);
    } catch {
      return { issues: [] };
    }
  };

  const checkContentPolicy = async (article: Article) => {
    const prompt = spark.llmPrompt`
      Review this Arabic news article for policy violations:
      
      Title: "${article.title}"
      Content: "${article.content.substring(0, 1000)}..."
      
      Check for violations of:
      1. Editorial guidelines
      2. Fact accuracy requirements
      3. Source attribution standards
      4. Copyright concerns
      5. Privacy issues
      
      Return a JSON object with:
      {
        "violations": [
          {
            "type": "accuracy|attribution|copyright|privacy|editorial",
            "severity": "low|medium|high|critical",
            "message": "Description in Arabic",
            "suggestion": "How to fix it in Arabic"
          }
        ]
      }
    `;

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(result);
    } catch {
      return { violations: [] };
    }
  };

  const detectBias = async (article: Article) => {
    const prompt = spark.llmPrompt`
      Analyze this Arabic news article for potential bias:
      
      Title: "${article.title}"
      Content: "${article.content.substring(0, 1000)}..."
      
      Evaluate for:
      1. Political bias
      2. Cultural bias
      3. Gender bias
      4. Source bias
      5. Confirmation bias
      
      Return a JSON object with:
      {
        "biasScore": 0.0-1.0,
        "type": "political|cultural|gender|source|confirmation",
        "confidence": 0.0-1.0,
        "suggestion": "How to reduce bias in Arabic"
      }
    `;

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(result);
    } catch {
      return { biasScore: 0, type: 'none', confidence: 0, suggestion: '' };
    }
  };

  const checkSensitivity = async (article: Article) => {
    const prompt = spark.llmPrompt`
      Check if this Arabic news article contains sensitive content:
      
      Title: "${article.title}"
      Content: "${article.content.substring(0, 1000)}..."
      
      Look for:
      1. Violence or graphic content
      2. Religious sensitivities
      3. Political tensions
      4. Social controversies
      5. Child safety concerns
      
      Return a JSON object with:
      {
        "isSensitive": true/false,
        "severity": "low|medium|high|critical",
        "reason": "Description in Arabic",
        "suggestion": "How to handle it in Arabic"
      }
    `;

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(result);
    } catch {
      return { isSensitive: false, severity: 'low', reason: '', suggestion: '' };
    }
  };

  const runFullModerationScan = async () => {
    setIsAnalyzing(true);
    
    try {
      const allAlerts: ModerationAlert[] = [];
      
      for (const article of articles) {
        if (article.status === 'draft' || article.status === 'review') {
          const articleAlerts = await analyzeArticleContent(article);
          allAlerts.push(...articleAlerts);
        }
      }
      
      setModerationAlerts(prev => {
        // Remove old alerts for the same articles
        const articleIds = new Set(allAlerts.map(a => a.articleId));
        const filteredPrev = prev.filter(alert => !articleIds.has(alert.articleId) || alert.status !== 'pending');
        return [...filteredPrev, ...allAlerts];
      });
      
      toast.success(`تم فحص ${articles.length} مقال، وتم العثور على ${allAlerts.length} تنبيه جديد`);
      
    } catch (error) {
      console.error('Moderation scan error:', error);
      toast.error('خطأ في فحص المحتوى');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAlertAction = (alertId: string, action: 'approve' | 'reject' | 'escalate') => {
    setModerationAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated',
            reviewedAt: new Date(),
            reviewedBy: 'current-user'
          }
        : alert
    ));
    
    const actionText = action === 'approve' ? 'وافق على' : action === 'reject' ? 'رفض' : 'تم تصعيد';
    toast.success(`تم ${actionText} التنبيه`);
  };

  const getSeverityColor = (severity: ModerationAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: ModerationAlert['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Flag className="h-4 w-4" />;
      case 'low': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const filteredAlerts = moderationAlerts.filter(alert => 
    filterStatus === 'all' || alert.status === filterStatus
  );

  const getStats = () => {
    const total = moderationAlerts.length;
    const pending = moderationAlerts.filter(a => a.status === 'pending').length;
    const critical = moderationAlerts.filter(a => a.severity === 'critical').length;
    const resolved = moderationAlerts.filter(a => a.status === 'approved' || a.status === 'rejected').length;
    
    return { total, pending, critical, resolved };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة المحتوى</h1>
            <p className="text-muted-foreground">مراقبة ذكية للمحتوى مدعومة بالذكاء الاصطناعي</p>
          </div>
        </div>
        
        <Button 
          onClick={runFullModerationScan}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          فحص شامل
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flag className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التنبيهات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">تنبيهات حرجة</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">تم حلها</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          <TabsTrigger value="rules">القواعد</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                الكل
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                قيد المراجعة ({stats.pending})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                موافق عليها
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
              >
                مرفوضة
              </Button>
            </div>
            
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير التقرير
            </Button>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const article = articles.find(a => a.id === alert.articleId);
              
              return (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(alert.severity)}
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity === 'critical' && 'حرج'}
                            {alert.severity === 'high' && 'عالي'}
                            {alert.severity === 'medium' && 'متوسط'}
                            {alert.severity === 'low' && 'منخفض'}
                          </Badge>
                          <Badge variant="secondary">
                            {alert.type === 'content' && 'محتوى'}
                            {alert.type === 'language' && 'لغة'}
                            {alert.type === 'policy' && 'سياسة'}
                            {alert.type === 'bias' && 'تحيز'}
                            {alert.type === 'sensitivity' && 'حساسية'}
                            {alert.type === 'accuracy' && 'دقة'}
                          </Badge>
                          {alert.autoDetected && (
                            <Badge variant="outline">
                              <Brain className="h-3 w-3 mr-1" />
                              كشف تلقائي
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold mb-1">
                          {article?.title || 'مقال محذوف'}
                        </h4>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        
                        {alert.suggestion && (
                          <div className="p-2 bg-accent/10 rounded-lg mb-2">
                            <p className="text-sm">
                              <strong>اقتراح:</strong> {alert.suggestion}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(alert.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                          {alert.reviewedAt && (
                            <span>
                              <User className="inline h-3 w-3 mr-1" />
                              تمت المراجعة: {new Date(alert.reviewedAt).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {alert.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertAction(alert.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertAction(alert.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertAction(alert.id, 'escalate')}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                            {article && (
                              <Button
                                size="sm"
                                onClick={() => onArticleSelect(article)}
                              >
                                مراجعة المقال
                              </Button>
                            )}
                          </>
                        )}
                        
                        {alert.status !== 'pending' && (
                          <Badge variant={alert.status === 'approved' ? 'default' : 'secondary'}>
                            {alert.status === 'approved' && 'موافق عليه'}
                            {alert.status === 'rejected' && 'مرفوض'}
                            {alert.status === 'escalated' && 'مُصعد'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد تنبيهات</h3>
                  <p className="text-muted-foreground">
                    {filterStatus === 'all' 
                      ? 'لا توجد تنبيهات حالياً. قم بتشغيل فحص شامل للمحتوى.'
                      : `لا توجد تنبيهات بحالة "${filterStatus}"`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قواعد الإشراف</CardTitle>
              <CardDescription>
                إدارة قواعد الكشف التلقائي عن المحتوى
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moderationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => {
                          setModerationRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, enabled } : r
                          ));
                        }}
                      />
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                      {rule.severity === 'critical' && 'حرج'}
                      {rule.severity === 'high' && 'عالي'}
                      {rule.severity === 'medium' && 'متوسط'}
                      {rule.severity === 'low' && 'منخفض'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      تحرير
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button className="w-full">
                إضافة قاعدة جديدة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء الإشراف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>معدل الكشف التلقائي</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>دقة التنبيهات</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>سرعة المراجعة</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الفترة الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">مقالات تم فحصها</span>
                    <span className="font-semibold">{articles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">تنبيهات تم إنشاؤها</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">مراجعات مكتملة</span>
                    <span className="font-semibold">{stats.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">متوسط وقت المراجعة</span>
                    <span className="font-semibold">2.5 ساعة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}