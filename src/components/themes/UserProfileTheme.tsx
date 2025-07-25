import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Palette, Moon, Sun, Eye, Save, Download, Upload } from '@phosphor-icons/react';
import { useTheme, ThemeColors, themePresets } from '@/contexts/ThemeContext';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface UserThemeProfile {
  userId: string;
  preferences: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    borderRadius: number;
    colorBlindnessSupport: boolean;
    highContrast: boolean;
    darkModePreference: 'light' | 'dark' | 'auto' | 'scheduled';
  };
  savedThemes: string[]; // IDs of saved theme presets
  customThemes: {
    id: string;
    name: string;
    nameAr: string;
    colors: ThemeColors;
    settings: any;
    createdAt: Date;
  }[];
  schedules: {
    id: string;
    name: string;
    themeId: string;
    startTime: string;
    endTime: string;
    days: number[];
    isActive: boolean;
  }[];
  readingModes: {
    news: string; // theme ID for news reading
    analysis: string; // theme ID for deep analysis
    dashboard: string; // theme ID for admin dashboard
  };
}

interface UserProfileThemeProps {
  userId: string;
  onThemeChange?: (themeId: string) => void;
}

export const UserProfileTheme: React.FC<UserProfileThemeProps> = ({ 
  userId, 
  onThemeChange 
}) => {
  const { themeSettings, updateThemeSettings, applyPreset, getCurrentColors, setTheme } = useTheme();
  
  // User theme profile with comprehensive preferences
  const [userProfile, setUserProfile] = useKV<UserThemeProfile>(`user-theme-profile-${userId}`, {
    userId,
    preferences: {
      fontSize: 1,
      lineHeight: 1.5,
      letterSpacing: 0,
      borderRadius: 0.5,
      colorBlindnessSupport: false,
      highContrast: false,
      darkModePreference: 'auto',
    },
    savedThemes: ['sabq-editorial'],
    customThemes: [],
    schedules: [],
    readingModes: {
      news: 'sabq-editorial',
      analysis: 'midnight-professional',
      dashboard: 'royal-gold',
    },
  });

  const [activeTab, setActiveTab] = useState('preferences');
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-apply user preferences on load
  useEffect(() => {
    const { preferences } = userProfile;
    updateThemeSettings({
      fontScale: preferences.fontSize,
      lineHeightScale: preferences.lineHeight,
      letterSpacing: preferences.letterSpacing,
      radius: preferences.borderRadius,
    });
  }, [userId]);

  // Smart theme detection based on time
  useEffect(() => {
    if (userProfile.preferences.darkModePreference === 'auto') {
      const hour = new Date().getHours();
      const isDarkTime = hour < 7 || hour > 19;
      
      const suitableTheme = isDarkTime ? 'midnight-professional' : 'sabq-editorial';
      if (themeSettings.activePreset !== suitableTheme) {
        applyPreset(suitableTheme);
      }
    }
  }, [userProfile.preferences.darkModePreference]);

  // Handle preference updates
  const updatePreference = <K extends keyof UserThemeProfile['preferences']>(
    key: K, 
    value: UserThemeProfile['preferences'][K]
  ) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));

    // Apply immediately to theme settings
    if (key === 'fontSize') {
      updateThemeSettings({ fontScale: value as number });
    } else if (key === 'lineHeight') {
      updateThemeSettings({ lineHeightScale: value as number });
    } else if (key === 'letterSpacing') {
      updateThemeSettings({ letterSpacing: value as number });
    } else if (key === 'borderRadius') {
      updateThemeSettings({ radius: value as number });
    }

    toast.success('تم تحديث التفضيلات');
  };

  // Save current theme as favorite
  const saveCurrentTheme = () => {
    const currentPreset = themeSettings.activePreset;
    if (currentPreset && !userProfile.savedThemes.includes(currentPreset)) {
      setUserProfile(prev => ({
        ...prev,
        savedThemes: [...prev.savedThemes, currentPreset],
      }));
      toast.success('تم حفظ الثيم في المفضلة');
    }
  };

  // Remove theme from favorites
  const removeSavedTheme = (themeId: string) => {
    setUserProfile(prev => ({
      ...prev,
      savedThemes: prev.savedThemes.filter(id => id !== themeId),
    }));
    toast.success('تم إزالة الثيم من المفضلة');
  };

  // Set reading mode theme
  const setReadingModeTheme = (mode: keyof UserThemeProfile['readingModes'], themeId: string) => {
    setUserProfile(prev => ({
      ...prev,
      readingModes: {
        ...prev.readingModes,
        [mode]: themeId,
      },
    }));
    toast.success(`تم تعيين ثيم ${mode === 'news' ? 'الأخبار' : mode === 'analysis' ? 'التحليل' : 'لوحة التحكم'}`);
  };

  // Export user theme profile
  const exportProfile = () => {
    const exportData = {
      preferences: userProfile.preferences,
      savedThemes: userProfile.savedThemes,
      readingModes: userProfile.readingModes,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabq-theme-profile-${userId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير ملف التفضيلات');
  };

  // Import theme profile
  const importProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        if (imported.preferences && imported.savedThemes) {
          setUserProfile(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...imported.preferences },
            savedThemes: [...new Set([...prev.savedThemes, ...imported.savedThemes])],
            readingModes: { ...prev.readingModes, ...imported.readingModes },
          }));
          toast.success('تم استيراد التفضيلات بنجاح');
        } else {
          toast.error('ملف غير صالح');
        }
      } catch (error) {
        toast.error('خطأ في قراءة الملف');
      }
    };
    reader.readAsText(file);
  };

  // Get accessibility score
  const getAccessibilityScore = () => {
    let score = 100;
    const { preferences } = userProfile;
    
    if (preferences.fontSize < 0.9 || preferences.fontSize > 1.3) score -= 10;
    if (preferences.lineHeight < 1.4 || preferences.lineHeight > 2) score -= 10;
    if (!preferences.highContrast) score -= 5;
    
    return Math.max(score, 60);
  };

  // Get user's saved themes with details
  const savedThemesWithDetails = userProfile.savedThemes.map(themeId => {
    const preset = themePresets.find(p => p.id === themeId);
    const custom = userProfile.customThemes.find(c => c.id === themeId);
    return preset || custom;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تفضيلات الثيم الشخصي</h2>
          <p className="text-muted-foreground">
            خصص تجربة القراءة والتصفح حسب احتياجاتك
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProfile} className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <label>
              <Upload className="w-4 h-4" />
              استيراد
              <input
                type="file"
                accept=".json"
                onChange={importProfile}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Accessibility Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">نقاط إمكانية الوصول</h3>
              <p className="text-sm text-muted-foreground">
                تقييم مدى ملاءمة إعداداتك للاستخدام المريح
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {getAccessibilityScore()}%
              </div>
              <Badge variant={getAccessibilityScore() > 85 ? 'default' : 'secondary'}>
                {getAccessibilityScore() > 85 ? 'ممتاز' : 'جيد'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
          <TabsTrigger value="favorites">المفضلة</TabsTrigger>
          <TabsTrigger value="reading-modes">أنماط القراءة</TabsTrigger>
          <TabsTrigger value="accessibility">إمكانية الوصول</TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النص</CardTitle>
                <CardDescription>
                  تخصيص حجم وشكل النصوص لراحة أكبر في القراءة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>حجم الخط: {(userProfile.preferences.fontSize * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[userProfile.preferences.fontSize]}
                    onValueChange={([value]) => updatePreference('fontSize', value)}
                    min={0.8}
                    max={1.5}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>صغير</span>
                    <span>عادي</span>
                    <span>كبير</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>ارتفاع السطر: {userProfile.preferences.lineHeight.toFixed(1)}</Label>
                  <Slider
                    value={[userProfile.preferences.lineHeight]}
                    onValueChange={([value]) => updatePreference('lineHeight', value)}
                    min={1.2}
                    max={2.2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>مضغوط</span>
                    <span>عادي</span>
                    <span>مريح</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>تباعد الحروف: {userProfile.preferences.letterSpacing.toFixed(3)}em</Label>
                  <Slider
                    value={[userProfile.preferences.letterSpacing]}
                    onValueChange={([value]) => updatePreference('letterSpacing', value)}
                    min={-0.02}
                    max={0.1}
                    step={0.005}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>قريب</span>
                    <span>عادي</span>
                    <span>متباعد</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>انحناء الحواف: {userProfile.preferences.borderRadius.toFixed(1)}rem</Label>
                  <Slider
                    value={[userProfile.preferences.borderRadius]}
                    onValueChange={([value]) => updatePreference('borderRadius', value)}
                    min={0}
                    max={1.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>حاد</span>
                    <span>متوسط</span>
                    <span>دائري</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الوضع المظلم</CardTitle>
                <CardDescription>
                  اختر متى تريد استخدام الوضع المظلم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={userProfile.preferences.darkModePreference === 'light' ? 'default' : 'outline'}
                    onClick={() => updatePreference('darkModePreference', 'light')}
                    className="gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    فاتح
                  </Button>
                  <Button
                    variant={userProfile.preferences.darkModePreference === 'dark' ? 'default' : 'outline'}
                    onClick={() => updatePreference('darkModePreference', 'dark')}
                    className="gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    داكن
                  </Button>
                  <Button
                    variant={userProfile.preferences.darkModePreference === 'auto' ? 'default' : 'outline'}
                    onClick={() => updatePreference('darkModePreference', 'auto')}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    تلقائي
                  </Button>
                  <Button
                    variant={userProfile.preferences.darkModePreference === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => updatePreference('darkModePreference', 'scheduled')}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    مجدول
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {userProfile.preferences.darkModePreference === 'auto' && 
                    'سيتم التبديل تلقائياً حسب الوقت (7 صباحاً - 7 مساءً فاتح)'
                  }
                  {userProfile.preferences.darkModePreference === 'scheduled' && 
                    'يمكنك إعداد جدولة مخصصة في تبويب أنماط القراءة'
                  }
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>معاينة مباشرة</CardTitle>
                <CardDescription>
                  شاهد كيف ستبدو إعداداتك على المحتوى
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-6 border rounded-lg space-y-4"
                  style={{
                    fontSize: `${userProfile.preferences.fontSize}rem`,
                    lineHeight: userProfile.preferences.lineHeight,
                    letterSpacing: `${userProfile.preferences.letterSpacing}em`,
                    borderRadius: `${userProfile.preferences.borderRadius}rem`,
                  }}
                >
                  <h3 className="text-xl font-bold text-primary">
                    عنوان خبر تجريبي من صحيفة سبق
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    منذ ساعتين • محليات • كاتب تجريبي
                  </p>
                  <p>
                    هذا نص تجريبي لمعاينة كيف ستبدو المقالات والأخبار مع الإعدادات الحالية. 
                    يمكنك تجربة تعديل حجم الخط وارتفاع السطر وتباعد الحروف لتحصل على 
                    تجربة قراءة مثالية تناسب احتياجاتك وراحة عينيك.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">تقنية</Badge>
                    <Badge variant="outline">ذكاء اصطناعي</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">الثيمات المفضلة</h3>
            <Button onClick={saveCurrentTheme} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              حفظ الثيم الحالي
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedThemesWithDetails.map((theme) => {
              if (!theme) return null;
              
              return (
                <Card key={theme.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{theme.nameAr}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSavedTheme(theme.id)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    <CardDescription className="text-xs">
                      {theme.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-4 gap-1 h-6 rounded overflow-hidden">
                      <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                      <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                      <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                      <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => {
                        applyPreset(theme.id);
                        onThemeChange?.(theme.id);
                      }}
                      className="w-full gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      تطبيق
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            
            {savedThemesWithDetails.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Palette className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">لا توجد ثيمات مفضلة</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    استكشف الثيمات المتاحة واحفظ المفضل منها
                  </p>
                  <Button onClick={saveCurrentTheme}>
                    حفظ الثيم الحالي
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Reading Modes Tab */}
        <TabsContent value="reading-modes" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">أنماط القراءة المخصصة</h3>
            <p className="text-muted-foreground">
              اختر ثيمات مختلفة لكل نوع من المحتوى لتحسين تجربة القراءة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">قراءة الأخبار</CardTitle>
                <CardDescription>
                  الثيم المستخدم عند قراءة الأخبار والمقالات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                  {(() => {
                    const theme = themePresets.find(p => p.id === userProfile.readingModes.news);
                    return theme ? (
                      <>
                        <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                        <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                        <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                        <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                      </>
                    ) : null;
                  })()}
                </div>
                
                <select
                  value={userProfile.readingModes.news}
                  onChange={(e) => setReadingModeTheme('news', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {themePresets.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.nameAr}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">التحليل العميق</CardTitle>
                <CardDescription>
                  الثيم المستخدم عند قراءة التحليلات والدراسات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                  {(() => {
                    const theme = themePresets.find(p => p.id === userProfile.readingModes.analysis);
                    return theme ? (
                      <>
                        <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                        <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                        <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                        <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                      </>
                    ) : null;
                  })()}
                </div>
                
                <select
                  value={userProfile.readingModes.analysis}
                  onChange={(e) => setReadingModeTheme('analysis', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {themePresets.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.nameAr}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">لوحة التحكم</CardTitle>
                <CardDescription>
                  الثيم المستخدم في لوحة التحكم والإدارة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                  {(() => {
                    const theme = themePresets.find(p => p.id === userProfile.readingModes.dashboard);
                    return theme ? (
                      <>
                        <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                        <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                        <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                        <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                      </>
                    ) : null;
                  })()}
                </div>
                
                <select
                  value={userProfile.readingModes.dashboard}
                  onChange={(e) => setReadingModeTheme('dashboard', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {themePresets.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.nameAr}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات إمكانية الوصول</CardTitle>
              <CardDescription>
                خيارات لتحسين تجربة الاستخدام للأشخاص ذوي الاحتياجات الخاصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">دعم عمى الألوان</Label>
                  <p className="text-sm text-muted-foreground">
                    تحسين التباين وإضافة رموز للتمييز بين الألوان
                  </p>
                </div>
                <Switch
                  checked={userProfile.preferences.colorBlindnessSupport}
                  onCheckedChange={(checked) => updatePreference('colorBlindnessSupport', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">التباين العالي</Label>
                  <p className="text-sm text-muted-foreground">
                    زيادة التباين بين النص والخلفية لقراءة أوضح
                  </p>
                </div>
                <Switch
                  checked={userProfile.preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">نصائح إمكانية الوصول</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• استخدم حجم خط 16px أو أكبر للنصوص المهمة</li>
                  <li>• تأكد من التباين الكافي بين النص والخلفية</li>
                  <li>• استخدم ارتفاع سطر 1.5 أو أكثر للنصوص الطويلة</li>
                  <li>• فعّل دعم عمى الألوان عند الحاجة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileTheme;