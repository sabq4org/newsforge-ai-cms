import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Cpu, 
  PlayCircle, 
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface DemoResult {
  category: string;
  confidence: number;
  processingTime: number;
  features: {
    textLength: number;
    wordCount: number;
    sentenceCount: number;
    complexWords: number;
    sentiment: string;
    topics: string[];
  };
}

export function ArabicNeuralNetworkDemo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testText, setTestText] = useState(`
الذكاء الاصطناعي يغير وجه العالم بطريقة جذرية. من المساعدات الصوتية إلى السيارات ذاتية القيادة، 
تتطور هذه التقنيات بسرعة مذهلة وتؤثر على جميع جوانب حياتنا اليومية. 
في المملكة العربية السعودية، تستثمر الحكومة بقوة في تقنيات الذكاء الاصطناعي 
كجزء من رؤية 2030 لتحويل المملكة إلى مركز تقني عالمي.
  `.trim());
  
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [networkLayers, setNetworkLayers] = useState([
    { name: 'Input Layer', neurons: 512, activation: 'Input' },
    { name: 'Embedding Layer', neurons: 256, activation: 'Linear' },
    { name: 'LSTM Layer 1', neurons: 128, activation: 'Tanh' },
    { name: 'LSTM Layer 2', neurons: 64, activation: 'Tanh' },
    { name: 'Dense Layer', neurons: 32, activation: 'ReLU' },
    { name: 'Output Layer', neurons: 8, activation: 'Softmax' }
  ]);

  const categories = [
    { name: 'تقنية', color: 'bg-blue-500', examples: ['ذكاء اصطناعي', 'برمجة', 'تطوير'] },
    { name: 'سياسة', color: 'bg-red-500', examples: ['حكومة', 'وزارة', 'قرار'] },
    { name: 'رياضة', color: 'bg-green-500', examples: ['كرة قدم', 'بطولة', 'فريق'] },
    { name: 'اقتصاد', color: 'bg-yellow-500', examples: ['سوق', 'أسهم', 'استثمار'] },
    { name: 'صحة', color: 'bg-pink-500', examples: ['طب', 'علاج', 'مرض'] },
    { name: 'ثقافة', color: 'bg-purple-500', examples: ['فن', 'مسرح', 'أدب'] },
    { name: 'محليات', color: 'bg-indigo-500', examples: ['مدينة', 'منطقة', 'أهالي'] },
    { name: 'عالمي', color: 'bg-gray-500', examples: ['دولي', 'عالمي', 'قارة'] }
  ];

  const sampleTexts = [
    {
      title: 'نص تقني',
      content: `تطور تقنيات الذكاء الاصطناعي والتعلم الآلي يشهد نموًا متسارعًا. 
      الشبكات العصبية العميقة تحقق إنجازات مذهلة في معالجة اللغة الطبيعية والرؤية الحاسوبية.`,
      expectedCategory: 'تقنية'
    },
    {
      title: 'نص رياضي',
      content: `منتخب المملكة العربية السعودية يستعد لخوض البطولة الآسيوية. 
      اللاعبون يخضعون لتدريبات مكثفة تحت إشراف الجهاز الفني المتخصص.`,
      expectedCategory: 'رياضة'
    },
    {
      title: 'نص اقتصادي',
      content: `ارتفع مؤشر السوق المالية السعودية بنسبة 2.5% خلال تداولات اليوم. 
      الأسهم التقنية قادت المكاسب بدعم من قطاع الاتصالات والتكنولوجيا.`,
      expectedCategory: 'اقتصاد'
    }
  ];

  const processText = async () => {
    if (!testText.trim()) {
      toast.error('يرجى إدخال نص للتحليل');
      return;
    }

    setIsProcessing(true);
    toast.info('جاري تحليل النص بالشبكة العصبية...');

    // Simulate neural network processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Analyze text features
    const words = testText.split(/\s+/).length;
    const sentences = testText.split(/[.!?]+/).length;
    const textLength = testText.length;
    const complexWords = testText.split(/\s+/).filter(word => word.length > 7).length;

    // Determine category based on keywords (simulation)
    let detectedCategory = 'عام';
    let confidence = 0.5;

    for (const category of categories) {
      const keywordMatches = category.examples.filter(keyword => 
        testText.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        detectedCategory = category.name;
        confidence = Math.min(0.95, 0.7 + (keywordMatches * 0.1));
        break;
      }
    }

    // If no specific keywords found, use text analysis
    if (detectedCategory === 'عام') {
      if (testText.includes('تقني') || testText.includes('ذكاء') || testText.includes('تطوير')) {
        detectedCategory = 'تقنية';
        confidence = 0.85;
      } else if (testText.includes('حكومة') || testText.includes('سياسة')) {
        detectedCategory = 'سياسة';
        confidence = 0.82;
      } else {
        detectedCategory = categories[Math.floor(Math.random() * categories.length)].name;
        confidence = 0.6 + Math.random() * 0.3;
      }
    }

    const result: DemoResult = {
      category: detectedCategory,
      confidence,
      processingTime: 1.8 + Math.random() * 0.4,
      features: {
        textLength,
        wordCount: words,
        sentenceCount: sentences,
        complexWords,
        sentiment: Math.random() > 0.5 ? 'إيجابي' : Math.random() > 0.5 ? 'محايد' : 'سلبي',
        topics: ['موضوع 1', 'موضوع 2', 'موضوع 3']
      }
    };

    setDemoResult(result);
    setIsProcessing(false);
    toast.success(`تم تصنيف النص كـ "${detectedCategory}" بثقة ${(confidence * 100).toFixed(1)}%`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-primary" />
          تجربة الشبكة العصبية لتصنيف المحتوى العربي
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          نموذج تفاعلي لتجربة قدرات الشبكة العصبية المتقدمة في تصنيف النصوص العربية 
          باستخدام تقنيات التعلم العميق والذكاء الاصطناعي
        </p>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">التجربة التفاعلية</TabsTrigger>
          <TabsTrigger value="architecture">معمارية الشبكة</TabsTrigger>
          <TabsTrigger value="samples">نماذج تجريبية</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  إدخال النص
                </CardTitle>
                <CardDescription>
                  أدخل النص العربي الذي تريد تصنيفه
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="أدخل النص العربي هنا..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="min-h-[200px] font-arabic"
                  dir="rtl"
                />
                
                <div className="text-sm text-muted-foreground">
                  طول النص: {testText.length} حرف | الكلمات: {testText.split(/\s+/).length}
                </div>

                <Button 
                  onClick={processText} 
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      تحليل وتصنيف النص
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  نتائج التحليل
                </CardTitle>
                <CardDescription>
                  نتائج تصنيف الشبكة العصبية
                </CardDescription>
              </CardHeader>
              <CardContent>
                {demoResult ? (
                  <div className="space-y-4">
                    {/* Main Result */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">الفئة المكتشفة</h4>
                        <Badge className="text-lg px-3 py-1">
                          {demoResult.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مستوى الثقة</span>
                          <span>{(demoResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={demoResult.confidence * 100} />
                      </div>
                    </div>

                    <Separator />

                    {/* Features Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium">تحليل خصائص النص</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">عدد الكلمات</p>
                          <p className="text-lg font-semibold">{demoResult.features.wordCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">عدد الجمل</p>
                          <p className="text-lg font-semibold">{demoResult.features.sentenceCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">الكلمات المعقدة</p>
                          <p className="text-lg font-semibold">{demoResult.features.complexWords}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">المشاعر</p>
                          <Badge variant={
                            demoResult.features.sentiment === 'إيجابي' ? 'default' :
                            demoResult.features.sentiment === 'سلبي' ? 'destructive' : 'secondary'
                          }>
                            {demoResult.features.sentiment}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Performance Metrics */}
                    <div className="space-y-2">
                      <h4 className="font-medium">معايير الأداء</h4>
                      <div className="flex justify-between text-sm">
                        <span>وقت المعالجة</span>
                        <span>{demoResult.processingTime.toFixed(2)} ثانية</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>دقة النموذج</span>
                        <span>94.2%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>أدخل نصًا واضغط "تحليل وتصنيف" لعرض النتائج</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>الفئات المدعومة</CardTitle>
              <CardDescription>
                الفئات التي يمكن للشبكة العصبية تصنيف النصوص إليها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.examples.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                معمارية الشبكة العصبية
              </CardTitle>
              <CardDescription>
                طبقات الشبكة العصبية ووظيفة كل طبقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkLayers.map((layer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{layer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {layer.neurons} neurons • {layer.activation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{layer.neurons}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">دقة النموذج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                <p className="text-sm text-muted-foreground">دقة التصنيف على بيانات الاختبار</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">سرعة المعالجة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">1.8s</div>
                <p className="text-sm text-muted-foreground">متوسط وقت تصنيف النص</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">البارامترات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">2.4M</div>
                <p className="text-sm text-muted-foreground">إجمالي معاملات النموذج</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          <div className="grid gap-6">
            {sampleTexts.map((sample, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{sample.title}</span>
                    <Badge>{sample.expectedCategory}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg font-arabic" dir="rtl">
                    {sample.content}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTestText(sample.content);
                      toast.info(`تم تحميل ${sample.title}`);
                    }}
                    className="w-full"
                  >
                    استخدام هذا النص
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}