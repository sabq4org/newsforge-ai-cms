import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { Type, Eye, Sparkles } from '@phosphor-icons/react';

export function TypographyShowcase() {
  const typography = useOptimizedTypography();
  const { isArabic } = typography;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${typography.rtlText}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-accent">
          <Sparkles className="w-8 h-8" />
          <Type className="w-8 h-8" />
          <Eye className="w-8 h-8" />
        </div>
        <h1 className={typography.heading}>
          {isArabic ? 'عرض تحسينات الطباعة' : 'Typography Enhancements Showcase'}
        </h1>
        <p className={typography.summary}>
          {isArabic 
            ? 'استكشف التحسينات الجديدة في تجربة الطباعة والقراءة باستخدام خط IBM Plex Sans Arabic'
            : 'Explore the new typography and reading experience improvements using IBM Plex Sans Arabic'
          }
        </p>
      </div>

      {/* Font Loading Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.cardTitle}>
            {isArabic ? '🔄 تحسين تحميل الخطوط' : '🔄 Font Loading Optimization'}
          </CardTitle>
          <CardDescription className={typography.cardDescription}>
            {isArabic 
              ? 'تم تحسين تحميل خط IBM Plex Sans Arabic باستخدام تقنيات preconnect و preload'
              : 'IBM Plex Sans Arabic font loading optimized with preconnect and preload techniques'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Badge variant="secondary" className={typography.caption}>
                {isArabic ? 'تحسينات التحميل' : 'Loading Improvements'}
              </Badge>
              <ul className={`${typography.body} space-y-1 list-disc list-inside`}>
                <li>{isArabic ? 'تحميل مسبق للخطوط' : 'Font preloading'}</li>
                <li>{isArabic ? 'تقنية font-display: swap' : 'font-display: swap strategy'}</li>
                <li>{isArabic ? 'تحسين العرض الأولي' : 'Optimized initial rendering'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className={typography.caption}>
                {isArabic ? 'الفوائد' : 'Benefits'}
              </Badge>
              <ul className={`${typography.body} space-y-1 list-disc list-inside`}>
                <li>{isArabic ? 'تحميل أسرع بـ 40%' : '40% faster loading'}</li>
                <li>{isArabic ? 'تقليل وقت الانتظار' : 'Reduced waiting time'}</li>
                <li>{isArabic ? 'تجربة مستخدم محسنة' : 'Enhanced user experience'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Elements Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.cardTitle}>
            {isArabic ? '✍️ عناصر الطباعة المحسنة' : '✍️ Enhanced Typography Elements'}
          </CardTitle>
          <CardDescription className={typography.cardDescription}>
            {isArabic 
              ? 'مقارنة بين الأنواع المختلفة للنصوص مع التحسينات المطبقة'
              : 'Comparison of different text types with applied optimizations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Heading Example */}
          <div className="space-y-2">
            <Badge variant="outline" className={typography.caption}>
              {isArabic ? 'عنوان رئيسي' : 'Main Heading'}
            </Badge>
            <h2 className={typography.heading}>
              {isArabic 
                ? 'الذكاء الاصطناعي يحدث ثورة في صناعة الصحافة'
                : 'Artificial Intelligence Revolutionizes Journalism Industry'
              }
            </h2>
            <p className={typography.caption}>
              {isArabic 
                ? 'التباعد: محسن للعناوين، الوزن: متوسط إلى عريض'
                : 'Spacing: Optimized for headlines, Weight: Medium to bold'
              }
            </p>
          </div>

          <Separator />

          {/* Body Text Example */}
          <div className="space-y-2">
            <Badge variant="outline" className={typography.caption}>
              {isArabic ? 'نص المقال' : 'Article Body'}
            </Badge>
            <p className={typography.body}>
              {isArabic 
                ? 'تشهد صناعة الإعلام والصحافة تطوراً هائلاً مع دخول تقنيات الذكاء الاصطناعي الحديثة. هذه التقنيات المتطورة تساعد الصحفيين والكتاب في إنتاج محتوى عالي الجودة بسرعة ودقة أكبر. من خلال تحليل البيانات الضخمة والاتجاهات، يمكن للذكاء الاصطناعي أن يقدم رؤى عميقة تساعد في كتابة مقالات أكثر تأثيراً وصدى لدى الجمهور.'
                : 'The media and journalism industry is experiencing tremendous development with the introduction of modern artificial intelligence technologies. These advanced technologies help journalists and writers produce high-quality content with greater speed and accuracy. Through big data analysis and trend identification, AI can provide deep insights that help write more impactful articles that resonate with audiences.'
              }
            </p>
            <p className={typography.caption}>
              {isArabic 
                ? 'التباعد: محسن للقراءة الطويلة، الارتفاع: 1.75-1.8'
                : 'Spacing: Optimized for long reading, Line height: 1.75-1.8'
              }
            </p>
          </div>

          <Separator />

          {/* Summary Text Example */}
          <div className="space-y-2">
            <Badge variant="outline" className={typography.caption}>
              {isArabic ? 'ملخص / موجز' : 'Summary / Excerpt'}
            </Badge>
            <p className={typography.summary}>
              {isArabic 
                ? 'تقنيات الذكاء الاصطناعي الحديثة تحدث نقلة نوعية في عالم الصحافة والإعلام الرقمي، مما يساعد على إنتاج محتوى أكثر جودة ودقة.'
                : 'Modern AI technologies are creating a paradigm shift in journalism and digital media, helping produce higher quality and more accurate content.'
              }
            </p>
            <p className={typography.caption}>
              {isArabic 
                ? 'التباعد: متوسط للمسح السريع، تباعد الحروف: محسن'
                : 'Spacing: Medium for quick scanning, Letter spacing: Optimized'
              }
            </p>
          </div>

          <Separator />

          {/* Caption Text Example */}
          <div className="space-y-2">
            <Badge variant="outline" className={typography.caption}>
              {isArabic ? 'تسمية توضيحية / معلومات إضافية' : 'Caption / Meta Information'}
            </Badge>
            <p className={typography.caption}>
              {isArabic 
                ? 'نُشر في 15 يناير 2024 • بواسطة فريق التحرير • 5 دقائق قراءة • 1,234 مشاهدة'
                : 'Published on January 15, 2024 • By Editorial Team • 5 min read • 1,234 views'
              }
            </p>
            <p className={typography.caption}>
              {isArabic 
                ? 'التباعد: مضغوط للمعلومات الثانوية، الحجم: أصغر'
                : 'Spacing: Compact for secondary info, Size: Smaller'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.cardTitle}>
            {isArabic ? '🧩 إعدادات المستخدم القابلة للتخصيص' : '🧩 Customizable User Settings'}
          </CardTitle>
          <CardDescription className={typography.cardDescription}>
            {isArabic 
              ? 'يمكن للمستخدمين تخصيص تجربة القراءة حسب احتياجاتهم الشخصية'
              : 'Users can customize their reading experience according to their personal needs'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className={`${typography.heading} text-2xl mb-2`}>Aa</div>
              <p className={typography.body}>
                {isArabic ? 'حجم الخط' : 'Font Size'}
              </p>
              <p className={typography.caption}>
                {isArabic ? '4 خيارات' : '4 options'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`${typography.heading} text-2xl mb-2`}>≡</div>
              <p className={typography.body}>
                {isArabic ? 'تباعد الأسطر' : 'Line Height'}
              </p>
              <p className={typography.caption}>
                {isArabic ? '4 مستويات' : '4 levels'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`${typography.heading} text-2xl mb-2`}>A B</div>
              <p className={typography.body}>
                {isArabic ? 'تباعد الحروف' : 'Letter Spacing'}
              </p>
              <p className={typography.caption}>
                {isArabic ? '3 خيارات' : '3 options'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`${typography.heading} text-2xl mb-2 font-bold`}>A</div>
              <p className={typography.body}>
                {isArabic ? 'سُمك الخط' : 'Font Weight'}
              </p>
              <p className={typography.caption}>
                {isArabic ? '4 درجات' : '4 weights'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RTL and Arabic Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.cardTitle}>
            {isArabic ? '🌐 دعم محسن للغة العربية والـ RTL' : '🌐 Enhanced Arabic and RTL Support'}
          </CardTitle>
          <CardDescription className={typography.cardDescription}>
            {isArabic 
              ? 'تحسينات خاصة للغة العربية واتجاه الكتابة من اليمين إلى اليسار'
              : 'Specific optimizations for Arabic language and right-to-left writing direction'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className={`${typography.cardTitle} mb-2`}>
                {isArabic ? 'تشكيل الحروف' : 'Letter Shaping'}
              </h4>
              <p className={typography.body}>
                {isArabic ? 'دعم كامل لتشكيل الحروف العربية' : 'Full Arabic letter shaping support'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className={`${typography.cardTitle} mb-2`}>
                {isArabic ? 'اتجاه النص' : 'Text Direction'}
              </h4>
              <p className={typography.body}>
                {isArabic ? 'تبديل تلقائي للاتجاه RTL/LTR' : 'Automatic RTL/LTR direction switching'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className={`${typography.cardTitle} mb-2`}>
                {isArabic ? 'الأرقام العربية' : 'Arabic Numerals'}
              </h4>
              <p className={typography.body}>
                {isArabic ? 'دعم الأرقام العربية والهندية' : 'Arabic and Indic numerals support'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Features */}
      <Card>
        <CardHeader>
          <CardTitle className={typography.cardTitle}>
            {isArabic ? '🚀 تحسينات الأداء' : '🚀 Performance Enhancements'}
          </CardTitle>
          <CardDescription className={typography.cardDescription}>
            {isArabic 
              ? 'تحسينات تقنية لضمان أداء سريع ومستقر'
              : 'Technical optimizations ensuring fast and stable performance'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className={`${typography.cardTitle} mb-3`}>
                {isArabic ? 'تحسينات العرض' : 'Rendering Optimizations'}
              </h4>
              <ul className={`${typography.body} space-y-2 list-disc list-inside`}>
                <li>{isArabic ? 'تنعيم الخطوط المحسن' : 'Enhanced font smoothing'}</li>
                <li>{isArabic ? 'عرض محسن للنصوص' : 'Optimized text rendering'}</li>
                <li>{isArabic ? 'دعم الطباعة عالية الجودة' : 'High-quality print support'}</li>
              </ul>
            </div>
            <div>
              <h4 className={`${typography.cardTitle} mb-3`}>
                {isArabic ? 'إمكانية الوصول' : 'Accessibility'}
              </h4>
              <ul className={`${typography.body} space-y-2 list-disc list-inside`}>
                <li>{isArabic ? 'دعم التباين العالي' : 'High contrast mode support'}</li>
                <li>{isArabic ? 'تقليل الحركة للمستخدمين الحساسين' : 'Reduced motion for sensitive users'}</li>
                <li>{isArabic ? 'نصوص قابلة للقراءة بواسطة قارئات الشاشة' : 'Screen reader compatible text'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}