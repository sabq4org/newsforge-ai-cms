import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Type, 
  AlignJustify, 
  AlignLeft, 
  RotateCcw, 
  Eye,
  Settings,
  Sparkles
} from '@phosphor-icons/react';
import { useTypography } from '@/contexts/TypographyContext';
import { useAuth } from '@/contexts/AuthContext';

export function TypographySettings() {
  const { language } = useAuth();
  const { settings, updateSettings, resetSettings, applyToClass } = useTypography();
  const [showPreview, setShowPreview] = useState(true);
  
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const fontSizeOptions = [
    { value: 'small', label: isArabic ? 'صغير' : 'Small', description: isArabic ? 'مناسب للشاشات الصغيرة' : 'Ideal for small screens' },
    { value: 'medium', label: isArabic ? 'متوسط' : 'Medium', description: isArabic ? 'الحجم الافتراضي' : 'Default size' },
    { value: 'large', label: isArabic ? 'كبير' : 'Large', description: isArabic ? 'سهولة في القراءة' : 'Easier reading' },
    { value: 'extra-large', label: isArabic ? 'كبير جداً' : 'Extra Large', description: isArabic ? 'لضعف البصر' : 'For visual accessibility' }
  ];

  const lineHeightOptions = [
    { value: 'compact', label: isArabic ? 'مضغوط' : 'Compact', description: isArabic ? 'مساحة أقل' : 'Less space' },
    { value: 'normal', label: isArabic ? 'عادي' : 'Normal', description: isArabic ? 'التباعد المثالي' : 'Optimal spacing' },
    { value: 'relaxed', label: isArabic ? 'مريح' : 'Relaxed', description: isArabic ? 'مساحة إضافية' : 'Extra breathing room' },
    { value: 'loose', label: isArabic ? 'واسع' : 'Loose', description: isArabic ? 'أقصى راحة للعين' : 'Maximum eye comfort' }
  ];

  const letterSpacingOptions = [
    { value: 'tight', label: isArabic ? 'متقارب' : 'Tight', description: isArabic ? 'حروف متلاصقة' : 'Close letters' },
    { value: 'normal', label: isArabic ? 'عادي' : 'Normal', description: isArabic ? 'التباعد المعياري' : 'Standard spacing' },
    { value: 'wide', label: isArabic ? 'متباعد' : 'Wide', description: isArabic ? 'وضوح أفضل' : 'Better clarity' }
  ];

  const fontWeightOptions = [
    { value: 'light', label: isArabic ? 'خفيف' : 'Light', description: isArabic ? 'نص رفيع' : 'Thin text' },
    { value: 'normal', label: isArabic ? 'عادي' : 'Normal', description: isArabic ? 'السُمك المعياري' : 'Standard weight' },
    { value: 'medium', label: isArabic ? 'متوسط' : 'Medium', description: isArabic ? 'أكثر وضوحاً' : 'More prominent' },
    { value: 'semibold', label: isArabic ? 'عريض' : 'Semibold', description: isArabic ? 'للتأكيد' : 'For emphasis' }
  ];

  const renderOptionGrid = (
    options: Array<{value: string, label: string, description: string}>,
    currentValue: string,
    onChange: (value: string) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <div
          key={option.value}
          className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${currentValue === option.value 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-border hover:border-muted-foreground hover:bg-muted/30'
            }
          `}
          onClick={() => onChange(option.value)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
            </div>
            {currentValue === option.value && (
              <Badge variant="default" className="text-xs">
                {isArabic ? 'مُحدد' : 'Selected'}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto space-y-6 font-arabic ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className={applyToClass('heading')}>
            {isArabic ? 'إعدادات الطباعة والخطوط' : 'Typography & Font Settings'}
          </h1>
          <p className={`${applyToClass('summary')} text-muted-foreground mt-2`}>
            {isArabic 
              ? 'خصص تجربة القراءة حسب تفضيلاتك الشخصية لتحسين الراحة البصرية'
              : 'Customize your reading experience with personal preferences for optimal visual comfort'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isArabic ? (showPreview ? 'إخفاء المعاينة' : 'عرض المعاينة') : (showPreview ? 'Hide Preview' : 'Show Preview')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {isArabic ? 'إعادة تعيين' : 'Reset'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Font Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                {isArabic ? 'حجم الخط' : 'Font Size'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'اختر حجم الخط المناسب لراحة عينيك ونوع الجهاز المستخدم'
                  : 'Choose the font size that suits your eyes and device type'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOptionGrid(
                fontSizeOptions,
                settings.fontSize,
                (value) => updateSettings({ fontSize: value as any })
              )}
            </CardContent>
          </Card>

          {/* Line Height */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignJustify className="w-5 h-5" />
                {isArabic ? 'تباعد الأسطر' : 'Line Height'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'تحكم في المساحة بين الأسطر لتحسين قابلية القراءة'
                  : 'Control the space between lines to improve readability'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOptionGrid(
                lineHeightOptions,
                settings.lineHeight,
                (value) => updateSettings({ lineHeight: value as any })
              )}
            </CardContent>
          </Card>

          {/* Letter Spacing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5" />
                {isArabic ? 'تباعد الحروف' : 'Letter Spacing'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'اضبط المسافة بين الحروف لوضوح أفضل، خاصة في النصوص العربية'
                  : 'Adjust spacing between letters for better clarity, especially in Arabic text'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOptionGrid(
                letterSpacingOptions,
                settings.letterSpacing,
                (value) => updateSettings({ letterSpacing: value as any })
              )}
            </CardContent>
          </Card>

          {/* Font Weight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {isArabic ? 'سُمك الخط' : 'Font Weight'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'غيّر سماكة الخط لتعزيز الوضوح والتأكيد'
                  : 'Change font thickness to enhance clarity and emphasis'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOptionGrid(
                fontWeightOptions,
                settings.fontWeight,
                (value) => updateSettings({ fontWeight: value as any })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isArabic ? 'معاينة مباشرة' : 'Live Preview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Heading Preview */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {isArabic ? 'عنوان رئيسي' : 'Main Heading'}
                  </Label>
                  <h2 className={applyToClass('heading')}>
                    {isArabic 
                      ? 'الذكاء الاصطناعي يغير مستقبل الصحافة'
                      : 'AI Transforms the Future of Journalism'
                    }
                  </h2>
                </div>

                <Separator />

                {/* Body Text Preview */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {isArabic ? 'نص المقال' : 'Article Body'}
                  </Label>
                  <p className={applyToClass('body')}>
                    {isArabic 
                      ? 'تشهد صناعة الإعلام تطوراً متسارعاً مع دخول تقنيات الذكاء الاصطناعي. هذه التقنيات الحديثة تساعد الصحفيين في كتابة المقالات وتحليل البيانات بشكل أكثر دقة وسرعة.'
                      : 'The media industry is experiencing rapid development with the introduction of artificial intelligence technologies. These modern technologies help journalists write articles and analyze data more accurately and quickly.'
                    }
                  </p>
                </div>

                <Separator />

                {/* Summary Preview */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {isArabic ? 'ملخص' : 'Summary'}
                  </Label>
                  <p className={applyToClass('summary')}>
                    {isArabic 
                      ? 'تقنيات الذكاء الاصطناعي تحدث نقلة نوعية في عالم الصحافة والإعلام الرقمي'
                      : 'AI technologies are creating a paradigm shift in journalism and digital media'
                    }
                  </p>
                </div>

                <Separator />

                {/* Caption Preview */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {isArabic ? 'تسمية توضيحية' : 'Caption'}
                  </Label>
                  <p className={applyToClass('caption')}>
                    {isArabic 
                      ? 'نُشر في 15 يناير 2024 • بواسطة فريق التحرير'
                      : 'Published on January 15, 2024 • By Editorial Team'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Settings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {isArabic ? 'الإعدادات الحالية' : 'Current Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'حجم الخط:' : 'Font Size:'}</span>
                  <Badge variant="outline">{fontSizeOptions.find(o => o.value === settings.fontSize)?.label}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'تباعد الأسطر:' : 'Line Height:'}</span>
                  <Badge variant="outline">{lineHeightOptions.find(o => o.value === settings.lineHeight)?.label}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'تباعد الحروف:' : 'Letter Spacing:'}</span>
                  <Badge variant="outline">{letterSpacingOptions.find(o => o.value === settings.letterSpacing)?.label}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'سُمك الخط:' : 'Font Weight:'}</span>
                  <Badge variant="outline">{fontWeightOptions.find(o => o.value === settings.fontWeight)?.label}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}