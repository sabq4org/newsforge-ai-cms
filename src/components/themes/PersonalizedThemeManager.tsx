import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Save, Download, Upload, Eye, Clock, Star, Trash2, Copy, Share } from '@phosphor-icons/react';
import { useTheme, ThemeColors, ThemePreset, themePresets } from '@/contexts/ThemeContext';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface UserThemePreference {
  id: string;
  userId: string;
  name: string;
  nameAr: string;
  description?: string;
  colors: ThemeColors;
  settings: {
    radius: number;
    fontScale: number;
    lineHeightScale: number;
    letterSpacing: number;
  };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface ThemeSchedule {
  id: string;
  userId: string;
  name: string;
  themeId: string;
  startTime: string; // HH:MM format
  endTime: string;
  isActive: boolean;
  days: number[]; // 0-6 for Sunday-Saturday
}

interface PersonalizedThemeManagerProps {
  userId?: string;
  currentUser?: {
    id: string;
    name: string;
  };
}

export const PersonalizedThemeManager: React.FC<PersonalizedThemeManagerProps> = ({ 
  userId,
  currentUser 
}) => {
  const { themeSettings, updateThemeSettings, getCurrentColors, setTheme } = useTheme();
  
  // User theme preferences
  const [userThemes, setUserThemes] = useKV<UserThemePreference[]>(`user-themes-${userId || 'guest'}`, []);
  const [publicThemes, setPublicThemes] = useKV<UserThemePreference[]>('public-user-themes', []);
  const [themeSchedules, setThemeSchedules] = useKV<ThemeSchedule[]>(`theme-schedules-${userId || 'guest'}`, []);
  
  // Component state
  const [activeTab, setActiveTab] = useState('my-themes');
  const [editingTheme, setEditingTheme] = useState<UserThemePreference | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeNameAr, setNewThemeNameAr] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [newThemeTags, setNewThemeTags] = useState('');
  const [customColors, setCustomColors] = useState<ThemeColors>(() => {
    try {
      return getCurrentColors() || {
        primary: 'oklch(0.25 0.08 250)',
        primaryForeground: 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0 0)',
        secondaryForeground: 'oklch(0.2 0 0)',
        accent: 'oklch(0.65 0.15 45)',
        accentForeground: 'oklch(1 0 0)',
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.15 0 0)',
        card: 'oklch(0.98 0 0)',
        cardForeground: 'oklch(0.15 0 0)',
        muted: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.45 0 0)',
        border: 'oklch(0.9 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        destructiveForeground: 'oklch(1 0 0)',
      };
    } catch (error) {
      console.warn('Error initializing custom colors:', error);
      return {
        primary: 'oklch(0.25 0.08 250)',
        primaryForeground: 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0 0)',
        secondaryForeground: 'oklch(0.2 0 0)',
        accent: 'oklch(0.65 0.15 45)',
        accentForeground: 'oklch(1 0 0)',
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.15 0 0)',
        card: 'oklch(0.98 0 0)',
        cardForeground: 'oklch(0.15 0 0)',
        muted: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.45 0 0)',
        border: 'oklch(0.9 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        destructiveForeground: 'oklch(1 0 0)',
      };
    }
  });
  const [customSettings, setCustomSettings] = useState({
    radius: themeSettings.radius,
    fontScale: themeSettings.fontScale,
    lineHeightScale: themeSettings.lineHeightScale,
    letterSpacing: themeSettings.letterSpacing,
  });
  
  // Theme scheduling
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    themeId: '',
    startTime: '08:00',
    endTime: '18:00',
    days: [1, 2, 3, 4, 5] as number[], // Mon-Fri by default
  });

  useEffect(() => {
    setCustomColors(getCurrentColors());
  }, [themeSettings]);

  // Theme management functions
  const saveCustomTheme = () => {
    if (!newThemeName.trim() || !newThemeNameAr.trim()) {
      toast.error('يرجى إدخال اسم الثيم بالعربية والإنجليزية');
      return;
    }

    const newTheme: UserThemePreference = {
      id: `theme_${Date.now()}`,
      userId: userId || 'guest',
      name: newThemeName,
      nameAr: newThemeNameAr,
      description: newThemeDescription,
      colors: customColors,
      settings: customSettings,
      isDefault: userThemes.length === 0,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newThemeTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    setUserThemes(prev => [...prev, newTheme]);
    
    // Reset form
    setNewThemeName('');
    setNewThemeNameAr('');
    setNewThemeDescription('');
    setNewThemeTags('');
    
    toast.success(`تم حفظ الثيم "${newTheme.nameAr}" بنجاح`);
  };

  const applyUserTheme = (theme: UserThemePreference) => {
    setTheme(theme.colors);
    updateThemeSettings({
      ...theme.settings,
      activePreset: 'custom',
      customColors: theme.colors,
    });
    toast.success(`تم تطبيق ثيم "${theme.nameAr}"`);
  };

  const deleteUserTheme = (themeId: string) => {
    setUserThemes(prev => prev.filter(theme => theme.id !== themeId));
    toast.success('تم حذف الثيم');
  };

  const duplicateTheme = (theme: UserThemePreference) => {
    const duplicated: UserThemePreference = {
      ...theme,
      id: `theme_${Date.now()}`,
      name: `${theme.name} Copy`,
      nameAr: `${theme.nameAr} - نسخة`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setUserThemes(prev => [...prev, duplicated]);
    toast.success('تم إنشاء نسخة من الثيم');
  };

  const shareTheme = (theme: UserThemePreference) => {
    const updatedTheme = { ...theme, isPublic: true };
    setUserThemes(prev => prev.map(t => t.id === theme.id ? updatedTheme : t));
    
    // Add to public themes
    const publicTheme = { ...updatedTheme };
    setPublicThemes(prev => {
      const exists = prev.some(t => t.id === theme.id);
      return exists ? prev : [...prev, publicTheme];
    });
    
    toast.success('تم مشاركة الثيم مع المجتمع');
  };

  const setDefaultTheme = (themeId: string) => {
    setUserThemes(prev => prev.map(theme => ({
      ...theme,
      isDefault: theme.id === themeId
    })));
    toast.success('تم تعيين الثيم كافتراضي');
  };

  // Theme scheduling functions
  const createSchedule = () => {
    if (!scheduleForm.name.trim() || !scheduleForm.themeId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newSchedule: ThemeSchedule = {
      id: `schedule_${Date.now()}`,
      userId: userId || 'guest',
      name: scheduleForm.name,
      themeId: scheduleForm.themeId,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      isActive: true,
      days: scheduleForm.days,
    };

    setThemeSchedules(prev => [...prev, newSchedule]);
    setScheduleForm({
      name: '',
      themeId: '',
      startTime: '08:00',
      endTime: '18:00',
      days: [1, 2, 3, 4, 5],
    });
    
    toast.success('تم إنشاء جدولة الثيم');
  };

  const toggleSchedule = (scheduleId: string) => {
    setThemeSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ));
  };

  // Color picker component
  const ColorPicker: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (color: string) => void;
  }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        <div 
          className="w-8 h-8 rounded border-2 border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = '#' + value.match(/\d+/g)?.map(x => parseInt(x).toString(16).padStart(2, '0')).join('') || '000000';
            input.onchange = (e) => {
              const hex = (e.target as HTMLInputElement).value;
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              onChange(`rgb(${r}, ${g}, ${b})`);
            };
            input.click();
          }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );

  const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الثيمات الشخصية</h1>
          <p className="text-muted-foreground">قم بإنشاء وإدارة ثيماتك المخصصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير الثيمات
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            استيراد ثيمات
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="my-themes">ثيماتي</TabsTrigger>
          <TabsTrigger value="create">إنشاء ثيم</TabsTrigger>
          <TabsTrigger value="public">المجتمع</TabsTrigger>
          <TabsTrigger value="presets">الثيمات الجاهزة</TabsTrigger>
          <TabsTrigger value="scheduler">الجدولة الذكية</TabsTrigger>
        </TabsList>

        {/* My Themes Tab */}
        <TabsContent value="my-themes" className="space-y-4">
          <div className="grid gap-4">
            {userThemes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Palette className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد ثيمات مخصصة</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    ابدأ بإنشاء ثيم مخصص لتجربة قراءة فريدة
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    إنشاء ثيم جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userThemes.filter(theme => theme && theme.colors).map((theme) => (
                  <Card key={theme.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{theme.nameAr}</CardTitle>
                        <div className="flex gap-1">
                          {theme.isDefault && (
                            <Badge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              افتراضي
                            </Badge>
                          )}
                          {theme.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              <Share className="w-3 h-3 mr-1" />
                              مشارك
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{theme.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Theme Preview */}
                      <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                        <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                        <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                        <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                        <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                      </div>
                      
                      {/* Tags */}
                      {theme.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {theme.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => applyUserTheme(theme)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          تطبيق
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => duplicateTheme(theme)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!theme.isDefault && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setDefaultTheme(theme.id)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareTheme(theme)}
                          disabled={theme.isPublic}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteUserTheme(theme.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Create Theme Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Theme Details */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الثيم</CardTitle>
                <CardDescription>معلومات أساسية عن الثيم الجديد</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-name-ar">الاسم بالعربية</Label>
                  <Input
                    id="theme-name-ar"
                    value={newThemeNameAr}
                    onChange={(e) => setNewThemeNameAr(e.target.value)}
                    placeholder="ثيم التحرير الليلي"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme-name-en">الاسم بالإنجليزية</Label>
                  <Input
                    id="theme-name-en"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="Night Editorial Theme"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme-description">الوصف</Label>
                  <Input
                    id="theme-description"
                    value={newThemeDescription}
                    onChange={(e) => setNewThemeDescription(e.target.value)}
                    placeholder="ثيم داكن مناسب للقراءة المسائية"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme-tags">العلامات (مفصولة بفواصل)</Label>
                  <Input
                    id="theme-tags"
                    value={newThemeTags}
                    onChange={(e) => setNewThemeTags(e.target.value)}
                    placeholder="داكن، مريح، مسائي"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
              <CardHeader>
                <CardTitle>تخصيص الألوان</CardTitle>
                <CardDescription>اختر الألوان المناسبة لثيمك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="اللون الأساسي"
                    value={customColors.primary}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, primary: color }))}
                  />
                  <ColorPicker
                    label="اللون الثانوي"
                    value={customColors.secondary}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, secondary: color }))}
                  />
                  <ColorPicker
                    label="لون التمييز"
                    value={customColors.accent}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, accent: color }))}
                  />
                  <ColorPicker
                    label="الخلفية"
                    value={customColors.background}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, background: color }))}
                  />
                  <ColorPicker
                    label="النص الأساسي"
                    value={customColors.foreground}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, foreground: color }))}
                  />
                  <ColorPicker
                    label="خلفية البطاقات"
                    value={customColors.card}
                    onChange={(color) => setCustomColors(prev => ({ ...prev, card: color }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Design Settings */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التصميم</CardTitle>
                <CardDescription>تخصيص شكل ومظهر العناصر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>انحناء الحواف: {customSettings.radius.toFixed(1)}rem</Label>
                  <Slider
                    value={[customSettings.radius]}
                    onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, radius: value }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>حجم الخط: {(customSettings.fontScale * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[customSettings.fontScale]}
                    onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, fontScale: value }))}
                    max={1.5}
                    min={0.8}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>ارتفاع السطر: {customSettings.lineHeightScale.toFixed(1)}</Label>
                  <Slider
                    value={[customSettings.lineHeightScale]}
                    onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, lineHeightScale: value }))}
                    max={2.5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>تباعد الحروف: {customSettings.letterSpacing.toFixed(3)}em</Label>
                  <Slider
                    value={[customSettings.letterSpacing]}
                    onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, letterSpacing: value }))}
                    max={0.1}
                    min={-0.05}
                    step={0.005}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>معاينة مباشرة</CardTitle>
                <CardDescription>شاهد كيف سيبدو ثيمك</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: customColors.background,
                    color: customColors.foreground,
                    borderColor: customColors.border,
                    borderRadius: `${customSettings.radius}rem`,
                    fontSize: `${customSettings.fontScale}rem`,
                    lineHeight: customSettings.lineHeightScale,
                    letterSpacing: `${customSettings.letterSpacing}em`,
                  }}
                >
                  <h3 
                    className="font-bold mb-2"
                    style={{ color: customColors.primary }}
                  >
                    عنوان تجريبي
                  </h3>
                  <p className="text-sm mb-3">
                    هذا نص تجريبي لمعاينة كيف سيبدو المحتوى مع الثيم الجديد. 
                    يمكنك رؤية الألوان والخطوط والتباعد.
                  </p>
                  <div 
                    className="inline-block px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: customColors.accent,
                      color: customColors.accentForeground,
                      borderRadius: `${customSettings.radius * 0.5}rem`,
                    }}
                  >
                    لون التمييز
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTheme(customColors)}>
              <Eye className="w-4 h-4 mr-2" />
              معاينة مؤقتة
            </Button>
            <Button onClick={saveCustomTheme} className="gap-2">
              <Save className="w-4 h-4" />
              حفظ الثيم
            </Button>
          </div>
        </TabsContent>

        {/* Public Themes Tab */}
        <TabsContent value="public" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicThemes.filter(theme => theme && theme.colors).map((theme) => (
              <Card key={theme.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{theme.nameAr}</CardTitle>
                  <CardDescription>
                    {theme.description}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      بواسطة: مستخدم {theme.userId.slice(-6)}
                    </span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                    <div style={{ backgroundColor: theme.colors?.primary || '#000' }} />
                    <div style={{ backgroundColor: theme.colors?.secondary || '#666' }} />
                    <div style={{ backgroundColor: theme.colors?.accent || '#999' }} />
                    <div style={{ backgroundColor: theme.colors?.background || '#fff', border: '1px solid #ccc' }} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => applyUserTheme(theme)}
                      className="flex-1"
                    >
                      تطبيق
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => duplicateTheme(theme)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themePresets.filter(preset => preset && preset.colors).map((preset) => (
              <Card key={preset.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{preset.nameAr}</CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-1 h-8 rounded overflow-hidden">
                    <div style={{ backgroundColor: preset.colors?.primary || '#000' }} />
                    <div style={{ backgroundColor: preset.colors?.secondary || '#666' }} />
                    <div style={{ backgroundColor: preset.colors?.accent || '#999' }} />
                    <div style={{ backgroundColor: preset.colors?.background || '#fff', border: '1px solid #ccc' }} />
                  </div>
                  
                  <Badge variant="outline">{preset.category}</Badge>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setTheme(preset.colors)}
                      className="flex-1"
                    >
                      تطبيق
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setCustomColors(preset.colors);
                        setNewThemeNameAr(`${preset.nameAr} - مخصص`);
                        setNewThemeName(`${preset.name} - Custom`);
                        setActiveTab('create');
                      }}
                    >
                      تخصيص
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الجدولة الذكية للثيمات</CardTitle>
              <CardDescription>
                قم بجدولة تغيير الثيمات تلقائياً حسب الوقت واليوم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">اسم الجدولة</Label>
                    <Input
                      id="schedule-name"
                      value={scheduleForm.name}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ثيم العمل الصباحي"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schedule-theme">الثيم</Label>
                    <Select 
                      value={scheduleForm.themeId} 
                      onValueChange={(value) => setScheduleForm(prev => ({ ...prev, themeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر ثيم" />
                      </SelectTrigger>
                      <SelectContent>
                        {userThemes.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {theme.nameAr}
                          </SelectItem>
                        ))}
                        {themePresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">وقت البداية</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-time">وقت النهاية</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={createSchedule} className="w-full gap-2">
                    <Clock className="w-4 h-4" />
                    إنشاء جدولة
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Label>أيام الأسبوع</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {dayNames.map((day, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Switch
                          id={`day-${index}`}
                          checked={scheduleForm.days.includes(index)}
                          onCheckedChange={(checked) => {
                            setScheduleForm(prev => ({
                              ...prev,
                              days: checked 
                                ? [...prev.days, index]
                                : prev.days.filter(d => d !== index)
                            }));
                          }}
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Schedules */}
          <Card>
            <CardHeader>
              <CardTitle>الجدولات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              {themeSchedules.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  لا توجد جدولات مُعرَّفة حالياً
                </p>
              ) : (
                <div className="space-y-4">
                  {themeSchedules.map((schedule) => {
                    const theme = userThemes.find(t => t.id === schedule.themeId) || 
                                themePresets.find(p => p.id === schedule.themeId);
                    
                    return (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{schedule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ثيم: {theme?.nameAr || 'غير محدد'} | 
                            {schedule.startTime} - {schedule.endTime} | 
                            {schedule.days.map(d => dayNames[d]).join(', ')}
                          </p>
                        </div>
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={() => toggleSchedule(schedule.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};