import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Shield, Brain, Cog, Share, CloudDownload, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface SiteSettings {
  siteName: string;
  mainLogo: string;
  mobileLogo: string;
  siteDescription: string;
  baseUrl: string;
  defaultLanguage: 'ar' | 'en';
  defaultCountry: string;
  timezone: string;
  dateFormat: string;
}

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  ogType: string;
  canonicalUrl: string;
  robotsTxt: string;
  autoSitemap: boolean;
  pageMetaSettings: {
    [key: string]: {
      title: string;
      description: string;
    };
  };
}

interface SocialSettings {
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  iosApp: string;
  androidApp: string;
  officialEmail: string;
  supportPhone: string;
}

interface ContentSettings {
  autoPublish: boolean;
  editorialReview: boolean;
  homePageArticles: number;
  breakingNewsDuration: number;
  autoOptimizeTitles: boolean;
  showViewCount: boolean;
  allowComments: boolean;
  moderateComments: boolean;
}

interface AISettings {
  enableAISuggestions: boolean;
  enableAutoSummary: boolean;
  showAIHints: boolean;
  useCustomModel: boolean;
  aiLanguage: 'ar' | 'en' | 'auto';
  aiProvider: 'openai' | 'claude' | 'custom';
}

interface SecuritySettings {
  enable2FA: boolean;
  maxLoginAttempts: number;
  allowedIPs: string[];
  notifyOnSettingsChange: boolean;
  sessionTimeout: number;
}

interface BackupSettings {
  autoBackup: 'daily' | 'weekly' | 'manual';
  notifyOnBackup: boolean;
  notifyOnUpdates: boolean;
  keepChangeLog: boolean;
  backupLocation: string;
}

const defaultSiteSettings: SiteSettings = {
  siteName: 'صحيفة سبق الإلكترونية',
  mainLogo: '',
  mobileLogo: '',
  siteDescription: 'صحيفة سبق الذكية - أخبار السعودية والعالم بتقنية الذكاء الاصطناعي',
  baseUrl: 'https://sabq.org',
  defaultLanguage: 'ar',
  defaultCountry: 'SA',
  timezone: 'Asia/Riyadh',
  dateFormat: 'DD MMMM YYYY - HH:mm'
};

const defaultSEOSettings: SEOSettings = {
  metaTitle: 'صحيفة سبق الذكية - أخبار السعودية والعالم',
  metaDescription: 'تابع آخر الأخبار المحلية والعالمية مع صحيفة سبق الذكية المدعومة بالذكاء الاصطناعي',
  keywords: 'أخبار، السعودية، الرياضة، التقنية، سبق، ذكاء اصطناعي',
  ogImage: '',
  ogType: 'website',
  canonicalUrl: 'https://sabq.org',
  robotsTxt: 'User-agent: *\nAllow: /',
  autoSitemap: true,
  pageMetaSettings: {
    about: {
      title: 'عن صحيفة سبق الذكية',
      description: 'تعرف على صحيفة سبق الذكية ورسالتها في تقديم الأخبار بتقنية الذكاء الاصطناعي'
    },
    contact: {
      title: 'تواصل معنا - صحيفة سبق',
      description: 'تواصل مع فريق صحيفة سبق الذكية للاستفسارات والمقترحات'
    }
  }
};

const defaultSocialSettings: SocialSettings = {
  twitter: '',
  instagram: '',
  facebook: '',
  youtube: '',
  iosApp: '',
  androidApp: '',
  officialEmail: 'info@sabq.org',
  supportPhone: '920000000'
};

const defaultContentSettings: ContentSettings = {
  autoPublish: false,
  editorialReview: true,
  homePageArticles: 8,
  breakingNewsDuration: 90,
  autoOptimizeTitles: true,
  showViewCount: true,
  allowComments: false,
  moderateComments: true
};

const defaultAISettings: AISettings = {
  enableAISuggestions: true,
  enableAutoSummary: true,
  showAIHints: true,
  useCustomModel: false,
  aiLanguage: 'ar',
  aiProvider: 'openai'
};

const defaultSecuritySettings: SecuritySettings = {
  enable2FA: false,
  maxLoginAttempts: 3,
  allowedIPs: [],
  notifyOnSettingsChange: true,
  sessionTimeout: 24
};

const defaultBackupSettings: BackupSettings = {
  autoBackup: 'daily',
  notifyOnBackup: true,
  notifyOnUpdates: true,
  keepChangeLog: true,
  backupLocation: 'cloud'
};

export function GeneralSettings() {
  const [siteSettings, setSiteSettings] = useKV<SiteSettings>('site-settings', defaultSiteSettings);
  const [seoSettings, setSeoSettings] = useKV<SEOSettings>('seo-settings', defaultSEOSettings);
  const [socialSettings, setSocialSettings] = useKV<SocialSettings>('social-settings', defaultSocialSettings);
  const [contentSettings, setContentSettings] = useKV<ContentSettings>('content-settings', defaultContentSettings);
  const [aiSettings, setAISettings] = useKV<AISettings>('ai-settings', defaultAISettings);
  const [securitySettings, setSecuritySettings] = useKV<SecuritySettings>('security-settings', defaultSecuritySettings);
  const [backupSettings, setBackupSettings] = useKV<BackupSettings>('backup-settings', defaultBackupSettings);
  
  const [activeTab, setActiveTab] = useState('identity');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, would save to database
      toast.success('تم حفظ الإعدادات بنجاح');
      setHasChanges(false);
      
      // Log settings change if enabled
      if (securitySettings.notifyOnSettingsChange) {
        console.log('Settings changed:', {
          timestamp: new Date(),
          changes: { siteSettings, seoSettings, socialSettings, contentSettings, aiSettings, securitySettings, backupSettings }
        });
      }
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSiteSettings(defaultSiteSettings);
    setSeoSettings(defaultSEOSettings);
    setSocialSettings(defaultSocialSettings);
    setContentSettings(defaultContentSettings);
    setAISettings(defaultAISettings);
    setSecuritySettings(defaultSecuritySettings);
    setBackupSettings(defaultBackupSettings);
    setHasChanges(true);
    toast.info('تم إعادة تعيين الإعدادات للقيم الافتراضية');
  };

  const exportSettings = () => {
    const allSettings = {
      site: siteSettings,
      seo: seoSettings,
      social: socialSettings,
      content: contentSettings,
      ai: aiSettings,
      security: { ...securitySettings, allowedIPs: ['***'] }, // Hide sensitive data
      backup: backupSettings
    };
    
    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sabq-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الصحيفة</h1>
          <p className="text-muted-foreground">
            إدارة شاملة لإعدادات صحيفة سبق الذكية
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <CloudDownload className="w-4 h-4 ml-2" />
            تصدير الإعدادات
          </Button>
          <Button variant="outline" onClick={handleReset}>
            إعادة تعيين
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="gap-2"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ هناك تغييرات لم يتم حفظها. لا تنس حفظ إعداداتك!
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            الهوية
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            التواصل
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            المحتوى
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            الذكاء الاصطناعي
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <CloudDownload className="w-4 h-4" />
            النسخ الاحتياطي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                إعدادات الهوية
              </CardTitle>
              <CardDescription>
                إعدادات أساسية للموقع والهوية البصرية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">اسم الصحيفة</Label>
                  <Input 
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => {
                      setSiteSettings(prev => ({ ...prev, siteName: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="صحيفة سبق الإلكترونية"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">الرابط الأساسي</Label>
                  <Input 
                    id="baseUrl"
                    value={siteSettings.baseUrl}
                    onChange={(e) => {
                      setSiteSettings(prev => ({ ...prev, baseUrl: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://sabq.org"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">الوصف التعريفي</Label>
                <Textarea 
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => {
                    setSiteSettings(prev => ({ ...prev, siteDescription: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="وصف مختصر للصحيفة يظهر في محركات البحث"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mainLogo">الشعار الرئيسي</Label>
                  <Input 
                    id="mainLogo"
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={(e) => {
                      // In real implementation, would upload file and get URL
                      const file = e.target.files?.[0];
                      if (file) {
                        setSiteSettings(prev => ({ ...prev, mainLogo: URL.createObjectURL(file) }));
                        setHasChanges(true);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">PNG أو SVG، بحد أقصى 2MB</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileLogo">الشعار المصغّر</Label>
                  <Input 
                    id="mobileLogo"
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSiteSettings(prev => ({ ...prev, mobileLogo: URL.createObjectURL(file) }));
                        setHasChanges(true);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">للأجهزة المحمولة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
                  <Select 
                    value={siteSettings.defaultLanguage} 
                    onValueChange={(value: 'ar' | 'en') => {
                      setSiteSettings(prev => ({ ...prev, defaultLanguage: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultCountry">الدولة الافتراضية</Label>
                  <Input 
                    id="defaultCountry"
                    value={siteSettings.defaultCountry}
                    onChange={(e) => {
                      setSiteSettings(prev => ({ ...prev, defaultCountry: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="SA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select 
                    value={siteSettings.timezone} 
                    onValueChange={(value: string) => {
                      setSiteSettings(prev => ({ ...prev, timezone: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Europe/London">لندن (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">نيويورك (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                إعدادات SEO
              </CardTitle>
              <CardDescription>
                تحسين محركات البحث والمشاركة الاجتماعية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input 
                    id="metaTitle"
                    value={seoSettings.metaTitle}
                    onChange={(e) => {
                      setSeoSettings(prev => ({ ...prev, metaTitle: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="العنوان الذي يظهر في Google"
                  />
                  <p className="text-xs text-muted-foreground">الطول المثالي: 50-60 حرف</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input 
                    id="canonicalUrl"
                    value={seoSettings.canonicalUrl}
                    onChange={(e) => {
                      setSeoSettings(prev => ({ ...prev, canonicalUrl: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://sabq.org"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea 
                  id="metaDescription"
                  value={seoSettings.metaDescription}
                  onChange={(e) => {
                    setSeoSettings(prev => ({ ...prev, metaDescription: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="وصف مختصر يظهر في نتائج البحث"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">الطول المثالي: 150-160 حرف</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">الكلمات المفتاحية</Label>
                <Input 
                  id="keywords"
                  value={seoSettings.keywords}
                  onChange={(e) => {
                    setSeoSettings(prev => ({ ...prev, keywords: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="أخبار، السعودية، الرياضة، التقنية"
                />
                <p className="text-xs text-muted-foreground">افصل بفواصل</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image</Label>
                  <Input 
                    id="ogImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSeoSettings(prev => ({ ...prev, ogImage: URL.createObjectURL(file) }));
                        setHasChanges(true);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">1200x630 بكسل للمشاركة الاجتماعية</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ogType">OG Type</Label>
                  <Select 
                    value={seoSettings.ogType} 
                    onValueChange={(value: string) => {
                      setSeoSettings(prev => ({ ...prev, ogType: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch 
                  id="autoSitemap"
                  checked={seoSettings.autoSitemap}
                  onCheckedChange={(checked) => {
                    setSeoSettings(prev => ({ ...prev, autoSitemap: checked }));
                    setHasChanges(true);
                  }}
                />
                <Label htmlFor="autoSitemap">توليد Sitemap تلقائي</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">محتوى Robots.txt</Label>
                <Textarea 
                  id="robotsTxt"
                  value={seoSettings.robotsTxt}
                  onChange={(e) => {
                    setSeoSettings(prev => ({ ...prev, robotsTxt: e.target.value }));
                    setHasChanges(true);
                  }}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5" />
                إعدادات التواصل والمشاركة
              </CardTitle>
              <CardDescription>
                روابط وسائل التواصل الاجتماعي ومعلومات الاتصال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="twitter">تويتر/X</Label>
                  <Input 
                    id="twitter"
                    value={socialSettings.twitter}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, twitter: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://twitter.com/sabq"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">إنستغرام</Label>
                  <Input 
                    id="instagram"
                    value={socialSettings.instagram}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, instagram: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://instagram.com/sabq"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook">فيسبوك</Label>
                  <Input 
                    id="facebook"
                    value={socialSettings.facebook}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, facebook: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://facebook.com/sabq"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube">يوتيوب</Label>
                  <Input 
                    id="youtube"
                    value={socialSettings.youtube}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, youtube: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://youtube.com/sabq"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="iosApp">رابط تطبيق iOS</Label>
                  <Input 
                    id="iosApp"
                    value={socialSettings.iosApp}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, iosApp: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://apps.apple.com/app/sabq"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="androidApp">رابط تطبيق Android</Label>
                  <Input 
                    id="androidApp"
                    value={socialSettings.androidApp}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, androidApp: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="https://play.google.com/store/apps/details?id=sabq"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="officialEmail">البريد الرسمي</Label>
                  <Input 
                    id="officialEmail"
                    type="email"
                    value={socialSettings.officialEmail}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, officialEmail: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="info@sabq.org"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">رقم الدعم الفني</Label>
                  <Input 
                    id="supportPhone"
                    value={socialSettings.supportPhone}
                    onChange={(e) => {
                      setSocialSettings(prev => ({ ...prev, supportPhone: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="920000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="w-5 h-5" />
                إعدادات التحكم في المحتوى
              </CardTitle>
              <CardDescription>
                التحكم في سلوك المحتوى والنشر والتفاعل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="autoPublish"
                    checked={contentSettings.autoPublish}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, autoPublish: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="autoPublish">تفعيل المقالات تلقائياً</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="editorialReview"
                    checked={contentSettings.editorialReview}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, editorialReview: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="editorialReview">تفعيل المراجعة التحريرية</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="autoOptimizeTitles"
                    checked={contentSettings.autoOptimizeTitles}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, autoOptimizeTitles: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="autoOptimizeTitles">تصغير العناوين تلقائياً</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="showViewCount"
                    checked={contentSettings.showViewCount}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, showViewCount: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="showViewCount">عرض عدد القراءات</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="allowComments"
                    checked={contentSettings.allowComments}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, allowComments: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="allowComments">السماح بالتعليقات</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="moderateComments"
                    checked={contentSettings.moderateComments}
                    onCheckedChange={(checked) => {
                      setContentSettings(prev => ({ ...prev, moderateComments: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="moderateComments">مراقبة التعليقات قبل النشر</Label>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homePageArticles">عدد المقالات في الصفحة الرئيسية</Label>
                  <Input 
                    id="homePageArticles"
                    type="number"
                    min="4"
                    max="20"
                    value={contentSettings.homePageArticles}
                    onChange={(e) => {
                      setContentSettings(prev => ({ ...prev, homePageArticles: parseInt(e.target.value) || 8 }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="breakingNewsDuration">مدة ظهور الخبر العاجل (دقائق)</Label>
                  <Input 
                    id="breakingNewsDuration"
                    type="number"
                    min="15"
                    max="1440"
                    value={contentSettings.breakingNewsDuration}
                    onChange={(e) => {
                      setContentSettings(prev => ({ ...prev, breakingNewsDuration: parseInt(e.target.value) || 90 }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                إعدادات الذكاء الاصطناعي
              </CardTitle>
              <CardDescription>
                التحكم في ميزات الذكاء الاصطناعي والتحسين التلقائي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="enableAISuggestions"
                    checked={aiSettings.enableAISuggestions}
                    onCheckedChange={(checked) => {
                      setAISettings(prev => ({ ...prev, enableAISuggestions: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="enableAISuggestions">تفعيل العناوين المقترحة من AI</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="enableAutoSummary"
                    checked={aiSettings.enableAutoSummary}
                    onCheckedChange={(checked) => {
                      setAISettings(prev => ({ ...prev, enableAutoSummary: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="enableAutoSummary">تفعيل التلخيص التلقائي</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="showAIHints"
                    checked={aiSettings.showAIHints}
                    onCheckedChange={(checked) => {
                      setAISettings(prev => ({ ...prev, showAIHints: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="showAIHints">عرض إشارات AI للمحرر</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="useCustomModel"
                    checked={aiSettings.useCustomModel}
                    onCheckedChange={(checked) => {
                      setAISettings(prev => ({ ...prev, useCustomModel: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="useCustomModel">استخدام نموذج مخصص</Label>
                  <Badge variant="secondary">متقدم</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="aiLanguage">لغة الإخراج من AI</Label>
                  <Select 
                    value={aiSettings.aiLanguage} 
                    onValueChange={(value: 'ar' | 'en' | 'auto') => {
                      setAISettings(prev => ({ ...prev, aiLanguage: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                      <SelectItem value="auto">تلقائي حسب لغة المقال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">مقدم خدمة AI</Label>
                  <Select 
                    value={aiSettings.aiProvider} 
                    onValueChange={(value: 'openai' | 'claude' | 'custom') => {
                      setAISettings(prev => ({ ...prev, aiProvider: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="custom">نموذج مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                إعدادات الأمان والإدارة
              </CardTitle>
              <CardDescription>
                التحكم في أمان النظام وصلاحيات الوصول
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="enable2FA"
                    checked={securitySettings.enable2FA}
                    onCheckedChange={(checked) => {
                      setSecuritySettings(prev => ({ ...prev, enable2FA: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="enable2FA">تشغيل المصادقة الثنائية (2FA)</Label>
                  <Badge variant="secondary">موصى به</Badge>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="notifyOnSettingsChange"
                    checked={securitySettings.notifyOnSettingsChange}
                    onCheckedChange={(checked) => {
                      setSecuritySettings(prev => ({ ...prev, notifyOnSettingsChange: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="notifyOnSettingsChange">إشعار عند تعديل الإعدادات</Label>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">عدد محاولات الدخول المسموحة</Label>
                  <Input 
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => {
                      setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 3 }));
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">بعدها يتم تعطيل الحساب مؤقتاً</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">انتهاء الجلسة (ساعات)</Label>
                  <Input 
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 24 }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedIPs">عناوين IP المسموحة (اختياري)</Label>
                <Textarea 
                  id="allowedIPs"
                  value={securitySettings.allowedIPs.join('\n')}
                  onChange={(e) => {
                    const ips = e.target.value.split('\n').filter(ip => ip.trim());
                    setSecuritySettings(prev => ({ ...prev, allowedIPs: ips }));
                    setHasChanges(true);
                  }}
                  placeholder="192.168.1.1&#10;203.0.113.1"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">عنوان IP واحد في كل سطر. اتركه فارغاً للسماح لجميع العناوين.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudDownload className="w-5 h-5" />
                إعدادات النسخ الاحتياطي والتحديث
              </CardTitle>
              <CardDescription>
                إدارة النسخ الاحتياطي وتحديثات النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="notifyOnBackup"
                    checked={backupSettings.notifyOnBackup}
                    onCheckedChange={(checked) => {
                      setBackupSettings(prev => ({ ...prev, notifyOnBackup: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="notifyOnBackup">إشعار عند كل عملية نسخ احتياطي</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="notifyOnUpdates"
                    checked={backupSettings.notifyOnUpdates}
                    onCheckedChange={(checked) => {
                      setBackupSettings(prev => ({ ...prev, notifyOnUpdates: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="notifyOnUpdates">تنبيه عند توفر تحديث للنظام</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="keepChangeLog"
                    checked={backupSettings.keepChangeLog}
                    onCheckedChange={(checked) => {
                      setBackupSettings(prev => ({ ...prev, keepChangeLog: checked }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="keepChangeLog">حفظ سجل التعديلات على الإعدادات</Label>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="autoBackup">تكرار النسخ الاحتياطي</Label>
                  <Select 
                    value={backupSettings.autoBackup} 
                    onValueChange={(value: 'daily' | 'weekly' | 'manual') => {
                      setBackupSettings(prev => ({ ...prev, autoBackup: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="manual">يدوي فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backupLocation">موقع النسخ الاحتياطي</Label>
                  <Input 
                    id="backupLocation"
                    value={backupSettings.backupLocation}
                    onChange={(e) => {
                      setBackupSettings(prev => ({ ...prev, backupLocation: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="cloud / local / s3"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">معلومات النسخة الاحتياطية الأخيرة</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>آخر نسخة احتياطي: اليوم الساعة 3:00 ص</p>
                  <p>الحجم: 2.3 جيجابايت</p>
                  <p>الحالة: ✅ مكتملة بنجاح</p>
                </div>
                <Button size="sm" className="mt-3">
                  إنشاء نسخة احتياطي الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}