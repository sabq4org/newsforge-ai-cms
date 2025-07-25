import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Star, 
  Heart, 
  Share, 
  BookOpen, 
  Clock,
  Users,
  TrendingUp
} from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemePreviewComponent: React.FC = () => {
  const { themeSettings, getCurrentColors } = useTheme();
  const colors = getCurrentColors();

  const sampleArticles = [
    {
      id: '1',
      title: 'الذكاء الاصطناعي يحول مستقبل الصحافة الرقمية',
      category: 'تقنية',
      author: 'أحمد محمد',
      readTime: '5 دقائق',
      views: 1250,
      likes: 89
    },
    {
      id: '2', 
      title: 'تطوير نظام إدارة المحتوى الذكي لسبق',
      category: 'محليات',
      author: 'فاطمة أحمد',
      readTime: '3 دقائق',
      views: 897,
      likes: 67
    },
    {
      id: '3',
      title: 'مستقبل التحرير الرقمي في المملكة العربية السعودية',
      category: 'رأي',
      author: 'خالد السعيد',
      readTime: '7 دقائق',
      views: 1456,
      likes: 112
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            معاينة الثيم الحالي
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Palette Display */}
            <div className="space-y-4">
              <h3 className="font-semibold">لوحة الألوان</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg border mb-2"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <p className="text-xs font-medium">أساسي</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg border mb-2"
                    style={{ backgroundColor: colors?.accent || '#999999' }}
                  />
                  <p className="text-xs font-medium">تمييز</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg border mb-2"
                    style={{ backgroundColor: colors.secondary }}
                  />
                  <p className="text-xs font-medium">ثانوي</p>
                  <p className="text-xs text-muted-foreground">Secondary</p>
                </div>
              </div>
              
              {/* Design System Values */}
              <div className="pt-4">
                <h4 className="font-medium mb-2">إعدادات التصميم</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>نصف قطر الحواف:</span>
                    <span className="font-mono">{themeSettings.radius}rem</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مقياس الخط:</span>
                    <span className="font-mono">{themeSettings.fontScale}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ارتفاع السطر:</span>
                    <span className="font-mono">{themeSettings.lineHeightScale}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تباعد الأحرف:</span>
                    <span className="font-mono">{themeSettings.letterSpacing}em</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Component Previews */}
            <div className="space-y-4">
              <h3 className="font-semibold">عناصر الواجهة</h3>
              
              {/* Buttons */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button>زر أساسي</Button>
                  <Button variant="secondary">ثانوي</Button>
                  <Button variant="outline">محدود</Button>
                  <Button variant="destructive">تحذير</Button>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge>تقنية</Badge>
                  <Badge variant="secondary">محليات</Badge>
                  <Badge variant="outline">رأي</Badge>
                  <Badge variant="destructive">عاجل</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Cards Preview */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة بطاقات الأخبار</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <CardTitle className="text-base line-clamp-2">
                    {article.title}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground">
                    بقلم {article.author}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {article.likes}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Preview */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة الطباعة</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">عنوان رئيسي - H1</h1>
            <h2 className="text-2xl font-semibold mb-2">عنوان فرعي - H2</h2>
            <h3 className="text-xl font-medium mb-2">عنوان ثالثي - H3</h3>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-base">
              هذا نص تجريبي لعرض نظام الطباعة في صحيفة سبق الذكية. 
              يستخدم النظام خط IBM Plex Sans Arabic للحصول على أفضل تجربة قراءة باللغة العربية.
            </p>
            
            <p className="text-sm text-muted-foreground">
              نص مكتوم أو ثانوي يُستخدم للوصف والتفاصيل الإضافية التي لا تحتاج إلى التركيز الكامل.
            </p>
            
            <p className="text-xs text-muted-foreground">
              نص صغير للتواريخ والأوقات ومعلومات إضافية.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};