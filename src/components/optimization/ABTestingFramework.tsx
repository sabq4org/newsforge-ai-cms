import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FlaskConical, 
  Plus, 
  Play, 
  Pause, 
  Trophy,
  TrendingUp,
  Eye,
  Clock,
  Target,
  BarChart,
  CheckCircle,
  AlertCircle
} from '@phosphor-icons/react';
import { ABTest, ABTestVariant, Article } from '@/types';
import { aiOptimizationService } from '@/lib/aiOptimizationService';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface ABTestingFrameworkProps {
  article: Partial<Article>;
  onTestUpdate?: (tests: ABTest[]) => void;
}

export function ABTestingFramework({ article, onTestUpdate }: ABTestingFrameworkProps) {
  const [tests, setTests] = useKV<ABTest[]>(`ab-tests-${article.id}`, []);
  const [isCreating, setIsCreating] = useState(false);
  const [newTestType, setNewTestType] = useState<'headline' | 'summary' | 'thumbnail'>('headline');
  const [variants, setVariants] = useState<string[]>(['', '']);

  useEffect(() => {
    if (article.abTests) {
      setTests(article.abTests);
    }
  }, [article.abTests, setTests]);

  const addVariant = () => {
    setVariants([...variants, '']);
  };

  const updateVariant = (index: number, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const createTest = async () => {
    const validVariants = variants.filter(v => v.trim());
    if (validVariants.length < 2) {
      toast.error('Please provide at least 2 variants for the test');
      return;
    }

    if (!article.id) {
      toast.error('Article must be saved before creating tests');
      return;
    }

    setIsCreating(true);
    try {
      const newTest = await aiOptimizationService.createABTest(
        article.id,
        newTestType,
        validVariants
      );
      
      setTests(currentTests => [...currentTests, newTest]);
      onTestUpdate?.([...tests, newTest]);
      
      // Reset form
      setVariants(['', '']);
      toast.success('A/B test created successfully!');
    } catch (error) {
      toast.error('Failed to create A/B test');
      console.error('Test creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTestStatus = (testId: string) => {
    setTests(currentTests => 
      currentTests.map(test => {
        if (test.id === testId) {
          const newStatus = test.status === 'running' ? 'paused' : 'running';
          return { ...test, status: newStatus };
        }
        return test;
      })
    );
  };

  const simulateTestResults = (testId: string) => {
    setTests(currentTests =>
      currentTests.map(test => {
        if (test.id === testId && test.status === 'running') {
          const updatedVariants = test.variants.map(variant => ({
            ...variant,
            performance: {
              impressions: Math.floor(Math.random() * 5000) + 1000,
              clicks: Math.floor(Math.random() * 500) + 50,
              ctr: Math.random() * 8 + 2,
              averageReadTime: Math.floor(Math.random() * 180) + 60,
              bounceRate: Math.random() * 40 + 30
            }
          }));

          // Determine winner (highest CTR)
          const bestVariant = updatedVariants.reduce((best, current) => 
            current.performance.ctr > best.performance.ctr ? current : best
          );

          const updatedVariantsWithWinner = updatedVariants.map(variant => ({
            ...variant,
            isWinner: variant.id === bestVariant.id,
            confidence: variant.id === bestVariant.id ? Math.floor(Math.random() * 20) + 80 : undefined
          }));

          return {
            ...test,
            variants: updatedVariantsWithWinner,
            currentSampleSize: Math.floor(Math.random() * 3000) + 2000,
            statisticalSignificance: true,
            winnerVariantId: bestVariant.id,
            status: 'completed' as const
          };
        }
        return test;
      })
    );
    toast.success('Test results simulated - check the performance data!');
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            A/B Testing Framework
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Test different versions of your content to optimize performance
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New A/B Test</DialogTitle>
                  <DialogDescription>
                    Test different versions of your content to see what performs best
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="test-type">Test Type</Label>
                    <Select value={newTestType} onValueChange={setNewTestType as any}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="headline">Headline</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="thumbnail">Thumbnail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Variants</Label>
                    <div className="space-y-3 mt-2">
                      {variants.map((variant, index) => (
                        <div key={index} className="flex gap-2">
                          {newTestType === 'thumbnail' ? (
                            <Input
                              placeholder={`Variant ${index + 1} image URL...`}
                              value={variant}
                              onChange={(e) => updateVariant(index, e.target.value)}
                            />
                          ) : (
                            <Textarea
                              placeholder={`Variant ${index + 1} ${newTestType}...`}
                              value={variant}
                              onChange={(e) => updateVariant(index, e.target.value)}
                              rows={newTestType === 'summary' ? 3 : 2}
                            />
                          )}
                          {variants.length > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        disabled={variants.length >= 5}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Variant
                      </Button>
                      
                      <Button
                        onClick={createTest}
                        disabled={isCreating || variants.filter(v => v.trim()).length < 2}
                        className="ml-auto"
                      >
                        {isCreating ? 'Creating...' : 'Create Test'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Active Tests */}
      {tests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first A/B test to compare different versions of your headlines, summaries, or thumbnails.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <Badge variant="secondary" className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {test.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateTestResults(test.id)}
                      >
                        Simulate Results
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTestStatus(test.id)}
                      disabled={test.status === 'completed'}
                    >
                      {test.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Test Progress */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Progress: {test.currentSampleSize} / {test.minimumSampleSize}</span>
                  {test.statisticalSignificance && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Statistically Significant</span>
                    </div>
                  )}
                </div>
                <Progress value={(test.currentSampleSize / test.minimumSampleSize) * 100} className="h-2" />
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {test.variants.map((variant, index) => (
                    <div key={variant.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          {variant.isWinner && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                          {variant.confidence && (
                            <span className="text-sm text-muted-foreground">
                              {variant.confidence}% confidence
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{variant.content}</p>
                      </div>

                      {/* Performance Metrics */}
                      {variant.performance.impressions > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          <div>
                            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-semibold">{variant.performance.impressions.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                          </div>
                          <div>
                            <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-semibold">{variant.performance.clicks.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                          <div>
                            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-semibold">{variant.performance.ctr.toFixed(2)}%</p>
                            <p className="text-xs text-muted-foreground">CTR</p>
                          </div>
                          <div>
                            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-semibold">{Math.floor(variant.performance.averageReadTime / 60)}:{(variant.performance.averageReadTime % 60).toString().padStart(2, '0')}</p>
                            <p className="text-xs text-muted-foreground">Avg. Read Time</p>
                          </div>
                          <div>
                            <BarChart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-semibold">{variant.performance.bounceRate.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Bounce Rate</p>
                          </div>
                        </div>
                      )}

                      {index < test.variants.length - 1 && <Separator />}
                    </div>
                  ))}

                  {/* Test Recommendations */}
                  {test.status === 'completed' && test.winnerVariantId && (
                    <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <h4 className="font-medium">Test Complete - Recommendation</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Variant {test.variants.findIndex(v => v.id === test.winnerVariantId) + 1} performed best with the highest click-through rate. 
                            Consider using this version for your final publication.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}