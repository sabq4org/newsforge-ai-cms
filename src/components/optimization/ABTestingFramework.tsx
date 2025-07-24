import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Plus, 
  Play, 
  Pause, 
  BarChart3,
  Trophy,
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { SabqAIService } from '@/lib/sabqAIService';
import { ABTest, ABTestVariant } from '@/types';
import { toast } from 'sonner';

interface ABTestingFrameworkProps {
  articleId: string;
  currentTitle: string;
  currentSummary: string;
  currentThumbnail?: string;
}

export function ABTestingFramework({
  articleId,
  currentTitle,
  currentSummary,
  currentThumbnail
}: ABTestingFrameworkProps) {
  const { language } = useAuth();
  const [tests, setTests] = useKV<ABTest[]>(`ab-tests-${articleId}`, []);
  const [activeTest, setActiveTest] = useState<ABTest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTestData, setNewTestData] = useState({
    name: '',
    type: 'headline' as 'headline' | 'summary' | 'thumbnail',
    trafficSplit: 50,
    minimumSampleSize: 1000,
    duration: 7 // days
  });

  const isRTL = language.direction === 'rtl';

  useEffect(() => {
    const runningTest = tests.find(test => test.status === 'running');
    setActiveTest(runningTest || null);
  }, [tests]);

  const createABTest = async () => {
    setIsCreating(true);
    
    try {
      // Get the current content based on test type
      const currentContent = newTestData.type === 'headline' ? currentTitle :
                            newTestData.type === 'summary' ? currentSummary :
                            currentThumbnail || '';

      // Generate variants using AI
      const variants = await SabqAIService.generateABTestVariants(
        currentContent,
        newTestData.type,
        3 // Generate 3 variants + original = 4 total
      );

      // Create control variant (original)
      const controlVariant: ABTestVariant = {
        id: `variant_${Date.now()}_control`,
        type: newTestData.type,
        content: currentContent,
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          averageReadTime: 0,
          bounceRate: 0
        }
      };

      // Create test variants
      const testVariants: ABTestVariant[] = variants.map((variant, index) => ({
        ...variant,
        id: `variant_${Date.now()}_${index + 1}`
      }));

      const newTest: ABTest = {
        id: `test_${Date.now()}`,
        articleId,
        name: newTestData.name,
        status: 'draft',
        startDate: new Date(),
        variants: [controlVariant, ...testVariants],
        trafficSplit: Array(testVariants.length + 1).fill(100 / (testVariants.length + 1)),
        minimumSampleSize: newTestData.minimumSampleSize,
        currentSampleSize: 0,
        statisticalSignificance: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setTests(currentTests => [...currentTests, newTest]);
      setShowCreateDialog(false);
      setNewTestData({
        name: '',
        type: 'headline',
        trafficSplit: 50,
        minimumSampleSize: 1000,
        duration: 7
      });

      toast.success(isRTL ? 'تم إنشاء اختبار A/B بنجاح' : 'A/B test created successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في إنشاء الاختبار' : 'Failed to create test');
      console.error('A/B test creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const startTest = (testId: string) => {
    setTests(currentTests => 
      currentTests.map(test => 
        test.id === testId 
          ? { ...test, status: 'running', startDate: new Date() }
          : { ...test, status: test.status === 'running' ? 'paused' : test.status }
      )
    );
    toast.success(isRTL ? 'تم بدء الاختبار' : 'Test started');
  };

  const pauseTest = (testId: string) => {
    setTests(currentTests => 
      currentTests.map(test => 
        test.id === testId ? { ...test, status: 'paused' } : test
      )
    );
    toast.info(isRTL ? 'تم إيقاف الاختبار مؤقتاً' : 'Test paused');
  };

  const completeTest = (testId: string) => {
    setTests(currentTests => 
      currentTests.map(test => {
        if (test.id === testId) {
          // Find winning variant (highest CTR)
          const winnerVariant = test.variants.reduce((winner, current) => 
            current.performance.ctr > winner.performance.ctr ? current : winner
          );
          
          return {
            ...test,
            status: 'completed',
            endDate: new Date(),
            winnerVariantId: winnerVariant.id,
            statisticalSignificance: test.currentSampleSize >= test.minimumSampleSize
          };
        }
        return test;
      })
    );
    toast.success(isRTL ? 'تم إكمال الاختبار' : 'Test completed');
  };

  // Simulate performance data update (in real app, this would come from analytics)
  const simulatePerformanceUpdate = (testId: string) => {
    setTests(currentTests => 
      currentTests.map(test => {
        if (test.id === testId && test.status === 'running') {
          const updatedVariants = test.variants.map(variant => ({
            ...variant,
            performance: {
              impressions: variant.performance.impressions + Math.floor(Math.random() * 100) + 50,
              clicks: variant.performance.clicks + Math.floor(Math.random() * 10) + 2,
              ctr: 0, // Will be calculated
              averageReadTime: Math.floor(Math.random() * 180) + 60,
              bounceRate: Math.random() * 40 + 20
            }
          }));

          // Calculate CTR
          updatedVariants.forEach(variant => {
            variant.performance.ctr = variant.performance.impressions > 0 
              ? (variant.performance.clicks / variant.performance.impressions) * 100 
              : 0;
          });

          const totalImpressions = updatedVariants.reduce((sum, v) => sum + v.performance.impressions, 0);

          return {
            ...test,
            variants: updatedVariants,
            currentSampleSize: totalImpressions,
            updatedAt: new Date()
          };
        }
        return test;
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantPerformanceColor = (ctr: number, allVariants: ABTestVariant[]) => {
    const maxCtr = Math.max(...allVariants.map(v => v.performance.ctr));
    const isWinner = ctr === maxCtr && maxCtr > 0;
    return isWinner ? 'text-green-600' : 'text-muted-foreground';
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-xl font-semibold">
              {isRTL ? 'إطار اختبار A/B' : 'A/B Testing Framework'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'اختبر وحسن أداء المحتوى' : 'Test and optimize content performance'}
            </p>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              {isRTL ? 'اختبار جديد' : 'New Test'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إنشاء اختبار A/B جديد' : 'Create New A/B Test'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختبر أشكالاً مختلفة لتحسين الأداء' : 'Test different variations to improve performance'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">
                  {isRTL ? 'اسم الاختبار' : 'Test Name'}
                </Label>
                <Input
                  id="test-name"
                  value={newTestData.name}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={isRTL ? 'مثل: اختبار العناوين الجذابة' : 'e.g., Engaging Headlines Test'}
                />
              </div>

              <div>
                <Label htmlFor="test-type">
                  {isRTL ? 'نوع الاختبار' : 'Test Type'}
                </Label>
                <Select 
                  value={newTestData.type} 
                  onValueChange={(value: any) => setNewTestData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headline">{isRTL ? 'العنوان' : 'Headline'}</SelectItem>
                    <SelectItem value="summary">{isRTL ? 'الملخص' : 'Summary'}</SelectItem>
                    <SelectItem value="thumbnail">{isRTL ? 'الصورة المصغرة' : 'Thumbnail'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sample-size">
                  {isRTL ? 'حجم العينة المطلوب' : 'Minimum Sample Size'}
                </Label>
                <Input
                  id="sample-size"
                  type="number"
                  value={newTestData.minimumSampleSize}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, minimumSampleSize: parseInt(e.target.value) }))}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  onClick={createABTest} 
                  disabled={isCreating || !newTestData.name}
                  className="flex-1"
                >
                  {isCreating ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Test Alert */}
      {activeTest && (
        <Alert>
          <TestTube className="w-4 h-4" />
          <AlertDescription>
            {isRTL ? 'يوجد اختبار نشط حالياً:' : 'Active test running:'} 
            <strong className="ml-1">{activeTest.name}</strong>
            <Badge variant="outline" className="ml-2">
              {activeTest.currentSampleSize} / {activeTest.minimumSampleSize} {isRTL ? 'عينات' : 'samples'}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Tests List */}
      {tests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isRTL ? 'لا توجد اختبارات حتى الآن' : 'No tests yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'أنشئ أول اختبار A/B لبدء تحسين المحتوى' : 'Create your first A/B test to start optimizing content'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              {isRTL ? 'إنشاء اختبار' : 'Create Test'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.name}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status === 'running' ? (isRTL ? 'نشط' : 'Running') :
                         test.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                         test.status === 'paused' ? (isRTL ? 'متوقف' : 'Paused') :
                         (isRTL ? 'مسودة' : 'Draft')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اختبار' : 'Testing'} {test.variants[0].type} • 
                      {test.variants.length} {isRTL ? 'متغيرات' : 'variants'} •
                      {isRTL ? 'أنشئ في' : 'Created'} {test.createdAt instanceof Date 
                        ? test.createdAt.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')
                        : new Date(test.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status === 'running' && (
                      <Button size="sm" onClick={() => simulatePerformanceUpdate(test.id)}>
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    )}
                    {test.status === 'draft' && (
                      <Button size="sm" onClick={() => startTest(test.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button size="sm" variant="outline" onClick={() => pauseTest(test.id)}>
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    {(test.status === 'running' || test.status === 'paused') && test.currentSampleSize >= test.minimumSampleSize && (
                      <Button size="sm" variant="outline" onClick={() => completeTest(test.id)}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Test Progress */}
                {test.status !== 'draft' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                      <span>
                        {test.currentSampleSize.toLocaleString()} / {test.minimumSampleSize.toLocaleString()}
                        {test.statisticalSignificance && (
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-1" />
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={(test.currentSampleSize / test.minimumSampleSize) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Variants Performance */}
                <div className="space-y-3">
                  {test.variants.map((variant, index) => (
                    <div key={variant.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {index === 0 ? (isRTL ? 'الأصلي' : 'Control') : `${isRTL ? 'متغير' : 'Variant'} ${index}`}
                          </Badge>
                          {test.winnerVariantId === variant.id && (
                            <Trophy className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        {test.status !== 'draft' && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{variant.performance.impressions}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{variant.performance.clicks}</span>
                            </div>
                            <div className={`font-medium ${getVariantPerformanceColor(variant.performance.ctr, test.variants)}`}>
                              {variant.performance.ctr.toFixed(2)}% CTR
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium">{variant.content}</p>
                    </div>
                  ))}
                </div>

                {/* Test Results Summary */}
                {test.status === 'completed' && test.winnerVariantId && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <Trophy className="w-4 h-4" />
                      {isRTL ? 'النتيجة النهائية' : 'Test Results'}
                    </div>
                    <p className="text-sm text-green-700">
                      {(() => {
                        const winner = test.variants.find(v => v.id === test.winnerVariantId);
                        const control = test.variants[0];
                        const improvement = winner && control.performance.ctr > 0 
                          ? ((winner.performance.ctr - control.performance.ctr) / control.performance.ctr) * 100 
                          : 0;
                        
                        return isRTL 
                          ? `المتغير الفائز حقق تحسناً بنسبة ${improvement.toFixed(1)}% في معدل النقر`
                          : `Winner achieved ${improvement.toFixed(1)}% improvement in click-through rate`;
                      })()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}