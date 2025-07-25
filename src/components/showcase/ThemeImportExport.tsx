import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  FileText, 
  Share, 
  Copy,
  Check,
  AlertCircle,
  Package
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface ThemeExport {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  author: string;
  version: string;
  colors: Record<string, string>;
  createdAt: string;
  metadata?: {
    category?: string;
    tags?: string[];
    compatibility?: string;
  };
}

export const ThemeImportExport: React.FC = () => {
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [selectedThemeForExport, setSelectedThemeForExport] = useState<string>('current');
  const [savedThemes, setSavedThemes] = useKV<ThemeExport[]>('exported-themes', []);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [exportMetadata, setExportMetadata] = useState({
    name: 'ثيم مخصص',
    nameAr: 'ثيم مخصص',
    description: 'A custom theme',
    descriptionAr: 'ثيم مخصص تم إنشاؤه في سبق الذكية',
    author: 'مستخدم سبق الذكية',
    tags: 'تحرير, إعلام, ذكي'
  });

  // Get current theme colors from CSS variables
  const getCurrentThemeColors = () => {
    const root = getComputedStyle(document.documentElement);
    return {
      background: root.getPropertyValue('--background').trim(),
      foreground: root.getPropertyValue('--foreground').trim(),
      card: root.getPropertyValue('--card').trim(),
      cardForeground: root.getPropertyValue('--card-foreground').trim(),
      primary: root.getPropertyValue('--primary').trim(),
      primaryForeground: root.getPropertyValue('--primary-foreground').trim(),
      secondary: root.getPropertyValue('--secondary').trim(),
      secondaryForeground: root.getPropertyValue('--secondary-foreground').trim(),
      accent: root.getPropertyValue('--accent').trim(),
      accentForeground: root.getPropertyValue('--accent-foreground').trim(),
      muted: root.getPropertyValue('--muted').trim(),
      mutedForeground: root.getPropertyValue('--muted-foreground').trim(),
      border: root.getPropertyValue('--border').trim(),
      destructive: root.getPropertyValue('--destructive').trim(),
      destructiveForeground: root.getPropertyValue('--destructive-foreground').trim(),
    };
  };

  const handleExportTheme = () => {
    const currentColors = getCurrentThemeColors();
    
    const themeExport: ThemeExport = {
      name: exportMetadata.name,
      nameAr: exportMetadata.nameAr,
      description: exportMetadata.description,
      descriptionAr: exportMetadata.descriptionAr,
      author: exportMetadata.author,
      version: '1.0.0',
      colors: currentColors,
      createdAt: new Date().toISOString(),
      metadata: {
        category: 'custom',
        tags: exportMetadata.tags.split(',').map(tag => tag.trim()),
        compatibility: 'sabq-cms-v1'
      }
    };

    const exportString = JSON.stringify(themeExport, null, 2);
    setExportData(exportString);
    
    // Save to local collection
    setSavedThemes(prev => [...prev, themeExport]);
    
    toast.success('تم تصدير الثيم بنجاح!');
  };

  const handleImportTheme = () => {
    try {
      const themeData: ThemeExport = JSON.parse(importData);
      
      // Validate required fields
      if (!themeData.colors || !themeData.name) {
        throw new Error('Invalid theme format');
      }

      // Apply the imported theme
      const root = document.documentElement;
      Object.entries(themeData.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      });

      // Save to collection
      setSavedThemes(prev => {
        const exists = prev.find(t => t.name === themeData.name);
        if (exists) {
          return prev.map(t => t.name === themeData.name ? themeData : t);
        }
        return [...prev, themeData];
      });

      toast.success(`تم استيراد وتطبيق ثيم "${themeData.nameAr || themeData.name}" بنجاح!`);
      setImportData('');
    } catch (error) {
      toast.error('خطأ في تنسيق ملف الثيم. تأكد من صحة البيانات المدخلة.');
    }
  };

  const handleDownloadTheme = (themeData: string, filename: string) => {
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.sabq-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل ملف الثيم!');
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    toast.success(`تم نسخ ${label}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          تصدير واستيراد الثيمات
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          شارك ثيماتك المخصصة مع الآخرين أو استورد ثيمات جديدة من مصممين آخرين
        </p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="w-4 h-4" />
            استيراد
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <FileText className="w-4 h-4" />
            المكتبة
          </TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                تصدير الثيم الحالي
              </CardTitle>
              <CardDescription>
                قم بتصدير ثيمك الحالي لمشاركته أو حفظه كنسخة احتياطية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-name">اسم الثيم</Label>
                  <Input
                    id="theme-name"
                    value={exportMetadata.name}
                    onChange={(e) => setExportMetadata(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم الثيم بالإنجليزية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-name-ar">اسم الثيم بالعربية</Label>
                  <Input
                    id="theme-name-ar"
                    value={exportMetadata.nameAr}
                    onChange={(e) => setExportMetadata(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="اسم الثيم بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-author">المؤلف</Label>
                  <Input
                    id="theme-author"
                    value={exportMetadata.author}
                    onChange={(e) => setExportMetadata(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="اسم منشئ الثيم"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-tags">الكلمات المفتاحية</Label>
                  <Input
                    id="theme-tags"
                    value={exportMetadata.tags}
                    onChange={(e) => setExportMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="إعلام, تحرير, أخبار"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme-description">الوصف</Label>
                <Textarea
                  id="theme-description"
                  value={exportMetadata.descriptionAr}
                  onChange={(e) => setExportMetadata(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  placeholder="وصف مختصر للثيم وملامحه"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExportTheme} className="gap-2">
                  <Download className="w-4 h-4" />
                  إنشاء ملف التصدير
                </Button>
              </div>

              {/* Export Result */}
              {exportData && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">ملف الثيم جاهز</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={exportData}
                      readOnly
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCopyToClipboard(exportData, 'بيانات الثيم')}
                        className="gap-2"
                      >
                        {copiedText === 'بيانات الثيم' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        نسخ
                      </Button>
                      <Button
                        onClick={() => handleDownloadTheme(exportData, exportMetadata.name)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        تحميل كملف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                استيراد ثيم جديد
              </CardTitle>
              <CardDescription>
                استورد ثيماً من ملف أو من النص المنسوخ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">رفع ملف ثيم</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json,.sabq-theme"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground text-sm">أو</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Text Import */}
              <div className="space-y-2">
                <Label htmlFor="import-text">لصق بيانات الثيم</Label>
                <Textarea
                  id="import-text"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="الصق هنا بيانات الثيم بصيغة JSON..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleImportTheme}
                  disabled={!importData.trim()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  استيراد وتطبيق الثيم
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setImportData('')}
                  className="gap-2"
                >
                  مسح
                </Button>
              </div>

              {/* Import Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-blue-800">
                      <p className="font-medium">تعليمات الاستيراد:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• تأكد من أن الملف بصيغة JSON صحيحة</li>
                        <li>• سيتم تطبيق الثيم فوراً على الواجهة</li>
                        <li>• سيتم حفظ الثيم في مكتبتك الشخصية</li>
                        <li>• يمكنك التراجع من خلال إعدادات الثيم</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                مكتبة الثيمات المحفوظة
              </CardTitle>
              <CardDescription>
                الثيمات التي قمت بحفظها أو استيرادها سابقاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedThemes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد ثيمات محفوظة بعد</p>
                  <p className="text-sm">ابدأ بتصدير ثيمك الحالي أو استيراد ثيم جديد</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedThemes.map((theme, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{theme.nameAr}</CardTitle>
                            <CardDescription className="text-sm">
                              {theme.descriptionAr}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>📅 {new Date(theme.createdAt).toLocaleDateString('ar-SA')}</span>
                              <span>👤 {theme.author}</span>
                              <span>🏷️ {theme.metadata?.tags?.join(', ')}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                              <div 
                                key={idx}
                                className="w-4 h-4 rounded-sm border border-border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // Apply theme
                              const root = document.documentElement;
                              Object.entries(theme.colors).forEach(([key, value]) => {
                                const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                                root.style.setProperty(`--${cssVar}`, value);
                              });
                              toast.success(`تم تطبيق ثيم "${theme.nameAr}"`);
                            }}
                            className="gap-2"
                          >
                            <Eye className="w-3 h-3" />
                            تطبيق
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const exportString = JSON.stringify(theme, null, 2);
                              handleDownloadTheme(exportString, theme.name);
                            }}
                            className="gap-2"
                          >
                            <Download className="w-3 h-3" />
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyToClipboard(JSON.stringify(theme, null, 2), `ثيم ${theme.nameAr}`)}
                            className="gap-2"
                          >
                            {copiedText === `ثيم ${theme.nameAr}` ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            نسخ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSavedThemes(prev => prev.filter((_, i) => i !== index));
                              toast.success('تم حذف الثيم');
                            }}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            🗑️ حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeImportExport;