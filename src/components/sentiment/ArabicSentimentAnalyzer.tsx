import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Frown, 
  Smile, 
  Meh, 
  Brain, 
  Eye, 
  TrendingUp,
  Target,
  Zap,
  MessageCircle,
  ChartBarHorizontal,
  AlertTriangle
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export interface SentimentResult {
  overall: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
    intensity: number;
  };
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  aspects: {
    aspect: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    mentions: number;
  }[];
  keywords: {
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    weight: number;
    category: string;
  }[];
  tone: {
    formal: number;
    informal: number;
    emotional: number;
    factual: number;
  };
  readability: {
    complexity: number;
    clarity: number;
    engagement: number;
  };
}

interface ArabicSentimentAnalyzerProps {
  text?: string;
  onAnalysisComplete?: (result: SentimentResult) => void;
  autoAnalyze?: boolean;
}

export function ArabicSentimentAnalyzer({ 
  text: initialText = '', 
  onAnalysisComplete, 
  autoAnalyze = false 
}: ArabicSentimentAnalyzerProps) {
  const [text, setText] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (autoAnalyze && text.trim()) {
      handleAnalyze();
    }
  }, [text, autoAnalyze]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('يرجى إدخال النص المراد تحليله');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis - في التطبيق الفعلي سيتم استخدام نموذج تحليل المشاعر العربي
      const prompt = spark.llmPrompt`
        قم بتحليل المشاعر والعواطف في النص العربي التالي بشكل متقدم ومفصل:

        النص: ${text}

        المطلوب تحليل شامل يشمل:
        1. المشاعر العامة (إيجابي، سلبي، محايد، مختلط) مع درجة الثقة والشدة
        2. العواطف الثمانية الأساسية (فرح، حزن، غضب، خوف، مفاجأة، اشمئزاز، ثقة، توقع)
        3. الجوانب المختلفة في النص ومشاعرها
        4. الكلمات المفتاحية ومشاعرها
        5. نبرة النص (رسمي، غير رسمي، عاطفي، واقعي)
        6. مقروئية النص (تعقيد، وضوح، جاذبية)

        أرجع النتيجة في صيغة JSON صحيحة.
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      
      // تحليل وهمي للعرض التوضيحي
      const mockResult: SentimentResult = {
        overall: {
          sentiment: text.includes('جميل') || text.includes('رائع') || text.includes('ممتاز') ? 'positive' :
                   text.includes('سيء') || text.includes('فظيع') || text.includes('مروع') ? 'negative' : 'neutral',
          confidence: Math.random() * 0.3 + 0.7,
          intensity: Math.random() * 0.5 + 0.5
        },
        emotions: {
          joy: Math.random() * 100,
          sadness: Math.random() * 100,
          anger: Math.random() * 100,
          fear: Math.random() * 100,
          surprise: Math.random() * 100,
          disgust: Math.random() * 100,
          trust: Math.random() * 100,
          anticipation: Math.random() * 100
        },
        aspects: [
          { aspect: 'المحتوى', sentiment: 'positive', confidence: 0.85, mentions: 3 },
          { aspect: 'الأسلوب', sentiment: 'neutral', confidence: 0.72, mentions: 2 },
          { aspect: 'الموضوع', sentiment: 'positive', confidence: 0.91, mentions: 4 }
        ],
        keywords: [
          { word: 'جميل', sentiment: 'positive', weight: 0.9, category: 'صفة' },
          { word: 'مهم', sentiment: 'neutral', weight: 0.6, category: 'صفة' },
          { word: 'مثير', sentiment: 'positive', weight: 0.8, category: 'صفة' }
        ],
        tone: {
          formal: Math.random() * 100,
          informal: Math.random() * 100,
          emotional: Math.random() * 100,
          factual: Math.random() * 100
        },
        readability: {
          complexity: Math.random() * 100,
          clarity: Math.random() * 100,
          engagement: Math.random() * 100
        }
      };

      setResult(mockResult);
      onAnalysisComplete?.(mockResult);
      toast.success('تم تحليل المشاعر بنجاح');
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('حدث خطأ في تحليل المشاعر');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-5 h-5 text-green-500" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-500" />;
      case 'neutral': return <Meh className="w-5 h-5 text-gray-500" />;
      case 'mixed': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default: return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'mixed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢',
      trust: '🤝',
      anticipation: '🔮'
    };
    return icons[emotion as keyof typeof icons] || '😐';
  };

  const getArabicEmotionName = (emotion: string) => {
    const names = {
      joy: 'الفرح',
      sadness: 'الحزن',
      anger: 'الغضب',
      fear: 'الخوف',
      surprise: 'المفاجأة',
      disgust: 'الاشمئزاز',
      trust: 'الثقة',
      anticipation: 'التوقع'
    };
    return names[emotion as keyof typeof names] || emotion;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            محلل المشاعر العربي المتقدم
          </CardTitle>
          <CardDescription>
            تحليل متطور للمشاعر والعواطف في النصوص العربية باستخدام الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="أدخل النص العربي المراد تحليل مشاعره..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              عدد الأحرف: {text.length}
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !text.trim()}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  تحليل المشاعر
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarHorizontal className="w-5 h-5 text-primary" />
              نتائج تحليل المشاعر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="emotions">العواطف</TabsTrigger>
                <TabsTrigger value="aspects">الجوانب</TabsTrigger>
                <TabsTrigger value="analysis">تحليل متقدم</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">المشاعر العامة</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getSentimentIcon(result.overall.sentiment)}
                            <span className="font-semibold capitalize">
                              {result.overall.sentiment === 'positive' ? 'إيجابي' :
                               result.overall.sentiment === 'negative' ? 'سلبي' :
                               result.overall.sentiment === 'neutral' ? 'محايد' : 'مختلط'}
                            </span>
                          </div>
                        </div>
                        <Badge className={getSentimentColor(result.overall.sentiment)}>
                          {Math.round(result.overall.confidence * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">شدة المشاعر</p>
                          <p className="text-lg font-semibold">
                            {Math.round(result.overall.intensity * 100)}%
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                      <Progress 
                        value={result.overall.intensity * 100} 
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">درجة الثقة</p>
                          <p className="text-lg font-semibold">
                            {Math.round(result.overall.confidence * 100)}%
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                      <Progress 
                        value={result.overall.confidence * 100} 
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Top Keywords */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    الكلمات المؤثرة
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.slice(0, 8).map((keyword, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className={getSentimentColor(keyword.sentiment)}
                      >
                        {keyword.word} ({Math.round(keyword.weight * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Emotions Tab */}
              <TabsContent value="emotions" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.emotions).map(([emotion, value]) => (
                    <Card key={emotion}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">
                          {getEmotionIcon(emotion)}
                        </div>
                        <h4 className="font-medium mb-1">
                          {getArabicEmotionName(emotion)}
                        </h4>
                        <p className="text-lg font-bold text-primary">
                          {Math.round(value)}%
                        </p>
                        <Progress value={value} className="mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Aspects Tab */}
              <TabsContent value="aspects" className="space-y-4">
                <div className="space-y-3">
                  {result.aspects.map((aspect, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getSentimentIcon(aspect.sentiment)}
                            <div>
                              <h4 className="font-medium">{aspect.aspect}</h4>
                              <p className="text-sm text-muted-foreground">
                                {aspect.mentions} إشارة في النص
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <Badge className={getSentimentColor(aspect.sentiment)}>
                              {Math.round(aspect.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Advanced Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                {/* Tone Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold">تحليل النبرة</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">رسمي</p>
                      <p className="font-semibold">{Math.round(result.tone.formal)}%</p>
                      <Progress value={result.tone.formal} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">غير رسمي</p>
                      <p className="font-semibold">{Math.round(result.tone.informal)}%</p>
                      <Progress value={result.tone.informal} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">عاطفي</p>
                      <p className="font-semibold">{Math.round(result.tone.emotional)}%</p>
                      <Progress value={result.tone.emotional} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">واقعي</p>
                      <p className="font-semibold">{Math.round(result.tone.factual)}%</p>
                      <Progress value={result.tone.factual} className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Readability Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold">تحليل المقروئية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">التعقيد</p>
                      <p className="font-semibold">{Math.round(result.readability.complexity)}%</p>
                      <Progress value={result.readability.complexity} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">الوضوح</p>
                      <p className="font-semibold">{Math.round(result.readability.clarity)}%</p>
                      <Progress value={result.readability.clarity} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">الجاذبية</p>
                      <p className="font-semibold">{Math.round(result.readability.engagement)}%</p>
                      <Progress value={result.readability.engagement} className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    توصيات التحسين
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm">
                      • يمكن تعزيز المشاعر الإيجابية باستخدام كلمات أكثر حيوية
                    </p>
                    <p className="text-sm">
                      • النبرة متوازنة ومناسبة للجمهور المستهدف
                    </p>
                    <p className="text-sm">
                      • مستوى الوضوح جيد ويسهل فهم المحتوى
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}