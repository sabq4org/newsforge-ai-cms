import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Star,
  Target,
  Eye,
  ChartBarHorizontal,
  Lightbulb,
  CheckCircle
} from '@phosphor-icons/react';

export function RecommendationSystemOverview() {
  const features = [
    {
      title: 'نظام التقييم الذكي',
      description: 'تقييم شامل من المستخدمين مع تحليل الأسباب والملاحظات',
      icon: MessageCircle,
      features: ['تقييم بالنجوم (1-5)', 'تقييم الفائدة', 'تعليقات مفصلة', 'أسباب التقييم'],
      status: 'مكتمل'
    },
    {
      title: 'تحليل الرؤى المتقدم',
      description: 'رؤى ذكية مدعومة بالذكاء الاصطناعي لتحسين الأداء',
      icon: Lightbulb,
      features: ['رؤى أداء النظام', 'تحليل سلوك المستخدم', 'اكتشاف فجوات المحتوى', 'اقتراحات التحسين'],
      status: 'مكتمل'
    },
    {
      title: 'شرائح المستخدمين',
      description: 'تصنيف المستخدمين لتحسين دقة التوصيات',
      icon: Users,
      features: ['تصنيف ذكي للمستخدمين', 'تحليل أنماط القراءة', 'تخصيص التوصيات', 'متابعة الأداء'],
      status: 'مكتمل'
    },
    {
      title: 'لوحة التحكم المتكاملة',
      description: 'واجهة شاملة لإدارة ومراقبة نظام التوصيات',
      icon: ChartBarHorizontal,
      features: ['نظرة عامة شاملة', 'مقاييس الأداء', 'التحكم في النظام', 'تصدير التقارير'],
      status: 'مكتمل'
    },
    {
      title: 'التحليل المستمر',
      description: 'مراقبة مستمرة للأداء مع تحسينات تلقائية',
      icon: TrendingUp,
      features: ['مراقبة مباشرة', 'تحسين تلقائي', 'تنبيهات ذكية', 'تحليل الاتجاهات'],
      status: 'مكتمل'
    },
    {
      title: 'خوارزمية التحسين',
      description: 'تحسين مستمر للخوارزمية بناءً على التقييمات',
      icon: Brain,
      features: ['تعلم من التقييمات', 'تحسين الدقة', 'تكيف مع السلوك', 'تحديث تلقائي'],
      status: 'مكتمل'
    }
  ];

  const metrics = [
    { label: 'دقة التوصيات', value: '87%', trend: '+5%', icon: Target },
    { label: 'رضا المستخدمين', value: '4.2/5', trend: '+0.3', icon: Star },
    { label: 'معدل التفاعل', value: '18.5%', trend: '+12%', icon: Eye },
    { label: 'التقييمات النشطة', value: '1,284', trend: '+45%', icon: MessageCircle }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">نظام تقييم التوصيات المتكامل</h1>
        <p className="text-xl text-muted-foreground">
          منصة شاملة لتقييم وتحسين نظام التوصيات المدعوم بالذكاء الاصطناعي
        </p>
        <Badge variant="secondary" className="bg-green-50 text-green-700 text-sm px-3 py-1">
          جاهز للاستخدام - الإصدار 2.1
        </Badge>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarHorizontal size={20} />
            مقاييس الأداء الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  <metric.icon size={24} className="text-primary" />
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Badge variant="secondary" className="mt-1 bg-green-50 text-green-600">
                  {metric.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle size={12} className="ml-1" />
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="leading-relaxed">
                {feature.description}
              </CardDescription>
              
              <div>
                <h5 className="font-medium text-sm mb-2">الميزات المتاحة:</h5>
                <ul className="space-y-1">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            فوائد التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain size={24} className="text-blue-600" />
              </div>
              <h4 className="font-semibold">تحسين الذكاء الاصطناعي</h4>
              <p className="text-sm text-muted-foreground">
                خوارزمية تتعلم وتتحسن باستمرار من تقييمات المستخدمين
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users size={24} className="text-green-600" />
              </div>
              <h4 className="font-semibold">تجربة مستخدم محسنة</h4>
              <p className="text-sm text-muted-foreground">
                توصيات أكثر دقة وملاءمة لاحتياجات كل مستخدم
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Target size={24} className="text-purple-600" />
              </div>
              <h4 className="font-semibold">قرارات مدعومة بالبيانات</h4>
              <p className="text-sm text-muted-foreground">
                رؤى وتحليلات تساعد في اتخاذ قرارات تحريرية أفضل
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Stack */}
      <Card>
        <CardHeader>
          <CardTitle>التقنيات المستخدمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'React + TypeScript',
              'Tailwind CSS',
              'Spark Runtime API',
              'Key-Value Storage',
              'Real-time Analytics',
              'AI-Powered Insights',
              'User Feedback System',
              'Performance Monitoring'
            ].map((tech) => (
              <Badge key={tech} variant="outline" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}