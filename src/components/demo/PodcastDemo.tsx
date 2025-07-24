import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  Download,
  Waveform,
  Microphone,
  Robot,
  Magic,
  FileAudio,
  SpeakerSimpleHigh,
  CheckCircle,
  Clock,
  Globe,
  Share
} from '@phosphor-icons/react';
import { AudioEditor } from '@/components/audio/AudioEditor';
import { Article } from '@/types';
import { mockUsers, mockCategories } from '@/lib/mockData';
import { toast } from 'sonner';

// Demo article specifically designed for podcast conversion
const demoArticle: Article = {
  id: 'demo_podcast_article',
  title: 'الذكاء الاصطناعي يقود ثورة جديدة في الطب السعودي',
  titleAr: 'الذكاء الاصطناعي يقود ثورة جديدة في الطب السعودي',
  content: `مرحباً بكم في برنامج سبق الإخباري. أنا محدثكم أحمد المنصوري، وموضوع حلقة اليوم مثير للاهتمام حقاً.

تشهد المملكة العربية السعودية اليوم تطوراً مذهلاً في مجال الطب الرقمي، حيث بدأت المستشفيات الحكومية في تطبيق تقنيات الذكاء الاصطناعي المتقدمة.

في مستشفى الملك فيصل التخصصي، تم تركيب نظام ذكي جديد يستطيع تشخيص الأورام بدقة تصل إلى ٩٥٪، وهو رقم مذهل حقاً.

الدكتورة فاطمة الزهراء، استشارية الأورام، تقول إن هذا النظام ساعد في تقليل أوقات التشخيص من ساعات إلى دقائق معدودة.

أما في مستشفى الملك عبدالعزيز الجامعي، فقد تم إطلاق روبوت جراحي يستخدم الذكاء الاصطناعي لإجراء عمليات القلب المعقدة.

النتائج الأولية تشير إلى نجاح باهر، حيث انخفضت مضاعفات العمليات بنسبة ٤٠٪.

هذا التطور لا يقتصر على المستشفيات الكبرى فقط، بل يمتد إلى المراكز الصحية في جميع أنحاء المملكة.

وفي الختام، نؤكد أن هذه التطورات تعكس رؤية ٢٠٣٠ الطموحة في تحويل السعودية إلى مركز عالمي للتقنيات الطبية المتقدمة.

شكراً لمتابعتكم، وإلى اللقاء في حلقة جديدة من سبق الإخباري.`,
  contentAr: `مرحباً بكم في برنامج سبق الإخباري. أنا محدثكم أحمد المنصوري، وموضوع حلقة اليوم مثير للاهتمام حقاً.

تشهد المملكة العربية السعودية اليوم تطوراً مذهلاً في مجال الطب الرقمي، حيث بدأت المستشفيات الحكومية في تطبيق تقنيات الذكاء الاصطناعي المتقدمة.

في مستشفى الملك فيصل التخصصي، تم تركيب نظام ذكي جديد يستطيع تشخيص الأورام بدقة تصل إلى ٩٥٪، وهو رقم مذهل حقاً.

الدكتورة فاطمة الزهراء، استشارية الأورام، تقول إن هذا النظام ساعد في تقليل أوقات التشخيص من ساعات إلى دقائق معدودة.

أما في مستشفى الملك عبدالعزيز الجامعي، فقد تم إطلاق روبوت جراحي يستخدم الذكاء الاصطناعي لإجراء عمليات القلب المعقدة.

النتائج الأولية تشير إلى نجاح باهر، حيث انخفضت مضاعفات العمليات بنسبة ٤٠٪.

هذا التطور لا يقتصر على المستشفيات الكبرى فقط، بل يمتد إلى المراكز الصحية في جميع أنحاء المملكة.

وفي الختام، نؤكد أن هذه التطورات تعكس رؤية ٢٠٣٠ الطموحة في تحويل السعودية إلى مركز عالمي للتقنيات الطبية المتقدمة.

شكراً لمتابعتكم، وإلى اللقاء في حلقة جديدة من سبق الإخباري.`,
  excerpt: 'تقرير شامل عن استخدام الذكاء الاصطناعي في المستشفيات السعودية وتأثيره على جودة الرعاية الصحية.',
  excerptAr: 'تقرير شامل عن استخدام الذكاء الاصطناعي في المستشفيات السعودية وتأثيره على جودة الرعاية الصحية.',
  author: mockUsers[0],
  category: mockCategories[8], // Health category
  tags: [],
  status: 'published',
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  language: 'ar',
  priority: 'high',
  location: 'الرياض',
  socialMediaCard: {
    title: 'الذكاء الاصطناعي في الطب السعودي',
    description: 'ثورة طبية حقيقية',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'
  },
  analytics: {
    views: 5234,
    uniqueViews: 4122,
    likes: 98,
    shares: 45,
    comments: 23,
    readTime: 180,
    scrollDepth: 85,
    bounceRate: 15,
    clickThroughRate: 7.2
  }
};

interface PodcastDemoProps {
  onArticleSelect?: (article: Article) => void;
}

export function PodcastDemo({ onArticleSelect }: PodcastDemoProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: 'اختيار المقال',
      description: 'حدد المقال الذي تريد تحويله إلى بودكاست',
      icon: FileAudio,
      action: () => setDemoStep(1)
    },
    {
      title: 'تحليل المحتوى بالذكاء الاصطناعي',
      description: 'يقوم النظام بتحليل النص وتحسينه للصوت',
      icon: Robot,
      action: () => setDemoStep(2)
    },
    {
      title: 'تحويل النص إلى صوت',
      description: 'استخدام تقنية ElevenLabs للحصول على صوت طبيعي',
      icon: SpeakerSimpleHigh,
      action: () => setDemoStep(3)
    },
    {
      title: 'تحرير وتحسين الصوت',
      description: 'إضافة التأثيرات والموسيقى والتحكم في السرعة',
      icon: Waveform,
      action: () => setDemoStep(4)
    },
    {
      title: 'تصدير البودكاست',
      description: 'حفظ الملف النهائي بجودة احترافية',
      icon: Download,
      action: () => setShowEditor(true)
    }
  ];

  const features = [
    {
      title: 'أصوات عربية متقدمة',
      description: 'مجموعة من الأصوات العربية الطبيعية المحسنة بالذكاء الاصطناعي',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      title: 'تحرير احترافي',
      description: 'أدوات تحرير صوتي متقدمة مع إمكانية إضافة المؤثرات والموسيقى',
      icon: Magic,
      color: 'text-purple-600'
    },
    {
      title: 'تحسين تلقائي',
      description: 'تحسين النص تلقائياً للحصول على أفضل نتائج صوتية',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'تصدير متعدد الصيغ',
      description: 'إمكانية التصدير بصيغ مختلفة وجودات متنوعة',
      icon: Share,
      color: 'text-orange-600'
    }
  ];

  if (showEditor) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">تجربة محرر البودكاست المتقدم</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowEditor(false);
              setDemoStep(0);
            }}
          >
            العودة للعرض التوضيحي
          </Button>
        </div>
        
        <AudioEditor 
          article={demoArticle}
          onSave={(project) => {
            console.log('Demo project saved:', project);
            toast.success('تم حفظ مشروع البودكاست التجريبي');
          }}
          onExport={(project) => {
            console.log('Demo project exported:', project);
            toast.success('تم تصدير البودكاست التجريبي بنجاح');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          محرر البودكاست الذكي
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          حول مقالاتك إلى بودكاست احترافي بتقنية الذكاء الاصطناعي والأصوات العربية المتقدمة
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <SpeakerSimpleHigh size={16} className="ml-2" />
            مدعوم بـ ElevenLabs
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Robot size={16} className="ml-2" />
            ذكاء اصطناعي متقدم
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Globe size={16} className="ml-2" />
            أصوات عربية طبيعية
          </Badge>
        </div>
      </div>

      {/* Demo Article Preview */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{demoArticle.title}</CardTitle>
              <CardDescription className="mt-2">
                {demoArticle.excerpt}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">صحة</Badge>
              <Badge variant="outline">ذكاء اصطناعي</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>بواسطة: {demoArticle.author.name}</span>
                <span>الوقت المقدر للقراءة: ٣ دقائق</span>
                <span>الوقت المقدر للبودكاست: ٤ دقائق</span>
              </div>
              <Button 
                onClick={() => setShowEditor(true)}
                className="gap-2"
              >
                <Microphone size={16} />
                تحويل إلى بودكاست
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {demoArticle.content.substring(0, 300)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Steps */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">
          كيف يعمل محرر البودكاست؟
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {demoSteps.map((step, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all ${
                demoStep >= index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={step.action}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                    demoStep >= index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {demoStep > 0 && (
          <div className="mt-8 text-center">
            <Progress value={(demoStep / 5) * 100} className="max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              الخطوة {demoStep} من 5
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">
          مميزات محرر البودكاست
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-muted ${feature.color}`}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">جرب المحرر الآن</h2>
              <p className="text-muted-foreground">
                اختبر قوة الذكاء الاصطناعي في تحويل المحتوى المكتوب إلى تجربة صوتية مميزة
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowEditor(true)}
                  className="gap-2"
                >
                  <Play size={20} />
                  ابدأ التجربة
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onArticleSelect?.(demoArticle)}
                  className="gap-2"
                >
                  <FileAudio size={20} />
                  استخدام مقال آخر
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}