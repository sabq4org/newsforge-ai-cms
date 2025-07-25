import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Copy, 
  Check,
  Lightbulb,
  Moon,
  Sun,
  Sparkles
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useTheme, themePresets, ThemeColors } from '@/contexts/ThemeContext';
import { ThemePreviewComponent } from './ThemePreviewComponent';
import { validateAccessibility, exportThemeAsCSS, generatePaletteFromPrimary } from '@/lib/colorUtils';

// Color input component with visual preview
interface ColorInputProps {
  label: string;
  labelAr: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, labelAr, value, onChange, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ قيمة اللون');
  };

  // Extract color preview from oklch value
  const getColorPreview = (oklchValue: string) => {
    // For browser compatibility, we'll use a simplified approach
    return `color(display-p3 ${oklchValue})`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {labelAr} ({label})
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      
      <div className="flex gap-2">
        <div 
          className="w-10 h-10 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: value.startsWith('oklch') ? value : `oklch(${value})` }}
          title={value}
        />
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-xs"
            placeholder="oklch(0.5 0.1 180)"
          />
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Theme preset card component
interface PresetCardProps {
  preset: typeof themePresets[0];
  isActive: boolean;
  onSelect: () => void;
}

const PresetCard: React.FC<PresetCardProps> = ({ preset, isActive, onSelect }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'editorial': return <Lightbulb className="w-4 h-4" />;
      case 'business': return <Sparkles className="w-4 h-4" />;
      case 'modern': return <Moon className="w-4 h-4" />;
      case 'classic': return <Sun className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'editorial': return 'تحريري';
      case 'business': return 'تجاري';
      case 'modern': return 'عصري';
      case 'classic': return 'كلاسيكي';
      default: return 'عام';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{preset.nameAr}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            {getCategoryIcon(preset.category)}
            {getCategoryLabel(preset.category)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{preset.description}</p>
      </CardHeader>
      
      <CardContent>
        {/* Color palette preview */}
        <div className="flex gap-1 mb-3">
          <div 
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: preset.colors.primary }}
            title="Primary"
          />
          <div 
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: preset.colors.accent }}
            title="Accent"
          />
          <div 
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: preset.colors.secondary }}
            title="Secondary"
          />
          <div 
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: preset.colors.card }}
            title="Card"
          />
        </div>
        
        <Button 
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="w-full"
        >
          {isActive ? 'مُطبّق حالياً' : 'تطبيق هذا الثيم'}
        </Button>
      </CardContent>
    </Card>
  );
};

export const ThemeColorSettings: React.FC = () => {
  const {
    themeSettings,
    updateThemeSettings,
    applyPreset,
    getCurrentColors,
    resetToDefault,
    exportTheme,
    importTheme
  } = useTheme();

  const [importData, setImportData] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    updateThemeSettings({
      activePreset: 'custom',
      customColors: {
        ...themeSettings.customColors,
        [colorKey]: value
      }
    });
  };

  const handleImport = () => {
    if (importTheme(importData)) {
      toast.success('تم استيراد الثيم بنجاح');
      setImportData('');
    } else {
      toast.error('فشل في استيراد الثيم - تحقق من صحة البيانات');
    }
  };

  const handleExport = () => {
    const data = exportTheme();
    navigator.clipboard.writeText(data);
    toast.success('تم نسخ بيانات الثيم إلى الحافظة');
  };

  const handleExportCSS = () => {
    const cssCode = exportThemeAsCSS(currentColors, themeSettings);
    navigator.clipboard.writeText(cssCode);
    toast.success('تم نسخ كود CSS إلى الحافظة');
  };

  const validateCurrentColors = () => {
    const validation = validateAccessibility(currentColors);
    if (validation.isValid) {
      toast.success('جميع الألوان تحقق معايير إمكانية الوصول');
    } else {
      toast.error(`مشاكل في إمكانية الوصول:\n${validation.issues.join('\n')}`);
    }
  };

  const generateFromPrimary = () => {
    const generated = generatePaletteFromPrimary(currentColors.primary);
    if (generated) {
      updateThemeSettings({
        activePreset: 'custom',
        customColors: generated as ThemeColors
      });
      toast.success('تم توليد لوحة ألوان متكاملة من اللون الأساسي');
    }
  };

  const currentColors = getCurrentColors();

  const colorDefinitions = [
    { key: 'primary', label: 'Primary', labelAr: 'اللون الأساسي', description: 'اللون الرئيسي للأزرار والروابط المهمة' },
    { key: 'primaryForeground', label: 'Primary Foreground', labelAr: 'نص اللون الأساسي', description: 'لون النص على الخلفية الأساسية' },
    { key: 'secondary', label: 'Secondary', labelAr: 'اللون الثانوي', description: 'اللون الثانوي للعناصر المساعدة' },
    { key: 'secondaryForeground', label: 'Secondary Foreground', labelAr: 'نص اللون الثانوي', description: 'لون النص على الخلفية الثانوية' },
    { key: 'accent', label: 'Accent', labelAr: 'لون التمييز', description: 'لون التمييز للعناصر البارزة' },
    { key: 'accentForeground', label: 'Accent Foreground', labelAr: 'نص لون التمييز', description: 'لون النص على خلفية التمييز' },
    { key: 'background', label: 'Background', labelAr: 'الخلفية الرئيسية', description: 'خلفية الصفحة الأساسية' },
    { key: 'foreground', label: 'Foreground', labelAr: 'النص الأساسي', description: 'لون النص الأساسي' },
    { key: 'card', label: 'Card', labelAr: 'خلفية البطاقات', description: 'خلفية البطاقات والعناصر المرتفعة' },
    { key: 'cardForeground', label: 'Card Foreground', labelAr: 'نص البطاقات', description: 'لون النص داخل البطاقات' },
    { key: 'muted', label: 'Muted', labelAr: 'خلفية مكتومة', description: 'خلفية للعناصر المكتومة وغير النشطة' },
    { key: 'mutedForeground', label: 'Muted Foreground', labelAr: 'نص مكتوم', description: 'لون النص المكتوم والثانوي' },
    { key: 'border', label: 'Border', labelAr: 'لون الحدود', description: 'لون الحدود والفواصل' },
    { key: 'destructive', label: 'Destructive', labelAr: 'لون التحذير', description: 'لون العمليات الخطيرة والتحذيرات' },
    { key: 'destructiveForeground', label: 'Destructive Foreground', labelAr: 'نص التحذير', description: 'لون النص على خلفية التحذير' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الثيم والألوان</h1>
          <p className="text-muted-foreground">
            تخصيص الهوية البصرية والألوان لصحيفة سبق الذكية
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'إنهاء المعاينة' : 'معاينة'}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تعيين
          </Button>
        </div>
      </div>

      <Tabs defaultValue="presets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="presets">الثيمات الجاهزة</TabsTrigger>
          <TabsTrigger value="colors">تخصيص الألوان</TabsTrigger>
          <TabsTrigger value="design">إعدادات التصميم</TabsTrigger>
          <TabsTrigger value="preview">معاينة</TabsTrigger>
          <TabsTrigger value="import-export">استيراد/تصدير</TabsTrigger>
        </TabsList>

        {/* Theme Presets */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                الثيمات المُعدّة مسبقاً
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                اختر من مجموعة الثيمات المصممة خصيصاً لأنواع المحتوى المختلفة
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themePresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isActive={themeSettings.activePreset === preset.id}
                    onSelect={() => applyPreset(preset.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Colors */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تخصيص الألوان</CardTitle>
              <p className="text-sm text-muted-foreground">
                تعديل ألوان النظام لإنشاء هوية بصرية مخصصة
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant="outline"
                  onClick={generateFromPrimary}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  توليد لوحة من اللون الأساسي
                </Button>
                
                <Button
                  variant="outline"
                  onClick={validateCurrentColors}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  فحص إمكانية الوصول
                </Button>
              </div>

              {/* Primary Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">الألوان الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colorDefinitions.slice(0, 6).map((colorDef) => (
                    <ColorInput
                      key={colorDef.key}
                      label={colorDef.label}
                      labelAr={colorDef.labelAr}
                      value={currentColors[colorDef.key]}
                      onChange={(value) => handleColorChange(colorDef.key, value)}
                      description={colorDef.description}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Background Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ألوان الخلفية والنصوص</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colorDefinitions.slice(6, 12).map((colorDef) => (
                    <ColorInput
                      key={colorDef.key}
                      label={colorDef.label}
                      labelAr={colorDef.labelAr}
                      value={currentColors[colorDef.key]}
                      onChange={(value) => handleColorChange(colorDef.key, value)}
                      description={colorDef.description}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* System Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ألوان النظام</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colorDefinitions.slice(12).map((colorDef) => (
                    <ColorInput
                      key={colorDef.key}
                      label={colorDef.label}
                      labelAr={colorDef.labelAr}
                      value={currentColors[colorDef.key]}
                      onChange={(value) => handleColorChange(colorDef.key, value)}
                      description={colorDef.description}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Settings */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التصميم</CardTitle>
              <p className="text-sm text-muted-foreground">
                تخصيص خصائص التصميم العامة
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Border Radius */}
              <div className="space-y-3">
                <Label>نصف قطر الحواف (Border Radius)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[themeSettings.radius]}
                    onValueChange={([value]) => updateThemeSettings({ radius: value })}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>حاد (0)</span>
                    <span className="font-medium">{themeSettings.radius}rem</span>
                    <span>دائري (2)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Font Scale */}
              <div className="space-y-3">
                <Label>مقياس الخط (Font Scale)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[themeSettings.fontScale]}
                    onValueChange={([value]) => updateThemeSettings({ fontScale: value })}
                    max={1.5}
                    min={0.8}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>صغير (0.8)</span>
                    <span className="font-medium">{themeSettings.fontScale}x</span>
                    <span>كبير (1.5)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Height */}
              <div className="space-y-3">
                <Label>ارتفاع السطر (Line Height)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[themeSettings.lineHeightScale]}
                    onValueChange={([value]) => updateThemeSettings({ lineHeightScale: value })}
                    max={2.5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>مضغوط (1)</span>
                    <span className="font-medium">{themeSettings.lineHeightScale}x</span>
                    <span>واسع (2.5)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Letter Spacing */}
              <div className="space-y-3">
                <Label>تباعد الأحرف (Letter Spacing)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[themeSettings.letterSpacing]}
                    onValueChange={([value]) => updateThemeSettings({ letterSpacing: value })}
                    max={0.1}
                    min={-0.05}
                    step={0.005}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>ضيق (-0.05)</span>
                    <span className="font-medium">{themeSettings.letterSpacing}em</span>
                    <span>واسع (0.1)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <ThemePreviewComponent />
        </TabsContent>

        {/* Import/Export */}
        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  تصدير الثيم
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  احفظ إعدادات الثيم الحالية لاستخدامها لاحقاً
                </p>
              </CardHeader>
              
              <CardContent>
                <Button onClick={handleExport} className="w-full gap-2 mb-3">
                  <Download className="w-4 h-4" />
                  نسخ بيانات الثيم
                </Button>
                
                <Button 
                  onClick={handleExportCSS} 
                  variant="outline" 
                  className="w-full gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ كود CSS
                </Button>
              </CardContent>
            </Card>

            {/* Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  استيراد ثيم
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  استيراد إعدادات ثيم محفوظة مسبقاً
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="الصق بيانات الثيم هنا..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                />
                
                <Button 
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="w-full gap-2"
                >
                  <Upload className="w-4 h-4" />
                  استيراد الثيم
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};