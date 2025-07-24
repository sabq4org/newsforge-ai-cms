import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRinging, 
  BellSlash, 
  Volume, 
  VolumeX,
  Vibrate,
  Clock,
  Globe,
  Smartphone,
  Mail,
  Monitor,
  Moon,
  Sun,
  User,
  Settings,
  Target,
  Filter,
  Bookmark,
  Calendar,
  MapPin,
  Tag,
  TrendUp,
  Shield,
  Heart,
  Share,
  Eye,
  BookmarkSimple,
  Star,
  Palette,
  SoundcloudLogo,
  Download,
  Upload
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPreferences {
  enabled: boolean;
  categories: Record<string, {
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    keywords: string[];
    excludeKeywords: string[];
  }>;
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  channels: {
    browser: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      weekendsOnly: boolean;
      customDays: string[];
    };
    frequency: 'immediate' | 'batched' | 'daily' | 'custom';
    batchInterval: number;
    maxPerHour: number;
    timezone: string;
  };
  audio: {
    enabled: boolean;
    volume: number;
    customSound: string;
    differentSounds: boolean;
    categorySounds: Record<string, string>;
  };
  vibration: {
    enabled: boolean;
    pattern: 'short' | 'long' | 'custom';
    customPattern: number[];
    intensity: number;
  };
  visual: {
    bannerEnabled: boolean;
    popupEnabled: boolean;
    badgeEnabled: boolean;
    toastEnabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
    theme: 'light' | 'dark' | 'auto';
    duration: number;
    animations: boolean;
  };
  personalization: {
    readingInterests: string[];
    favoriteAuthors: string[];
    preferredLanguage: 'ar' | 'en' | 'both';
    locationBased: boolean;
    currentLocation: string;
    timeBasedPreferences: Record<string, string[]>; // hour -> categories
    engagementTracking: boolean;
    smartFiltering: boolean;
  };
  advanced: {
    emailDigest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      includeAnalytics: boolean;
      maxArticles: number;
    };
    breakingNews: {
      enabled: boolean;
      threshold: 'low' | 'medium' | 'high';
      sources: string[];
      immediateDelivery: boolean;
    };
    trending: {
      enabled: boolean;
      threshold: number;
      categories: string[];
      timeWindow: number; // hours
    };
    collaboration: {
      enabled: boolean;
      teamNotifications: boolean;
      assignmentAlerts: boolean;
      deadlineReminders: boolean;
    };
  };
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  categories: {},
  priorities: {
    low: false,
    medium: true,
    high: true,
    critical: true
  },
  channels: {
    browser: true,
    email: true,
    sms: false,
    inApp: true,
    desktop: true,
    mobile: true
  },
  timing: {
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      weekendsOnly: false,
      customDays: []
    },
    frequency: 'immediate',
    batchInterval: 30,
    maxPerHour: 10,
    timezone: 'Asia/Riyadh'
  },
  audio: {
    enabled: true,
    volume: 70,
    customSound: 'default',
    differentSounds: false,
    categorySounds: {}
  },
  vibration: {
    enabled: true,
    pattern: 'short',
    customPattern: [200, 100, 200],
    intensity: 50
  },
  visual: {
    bannerEnabled: true,
    popupEnabled: true,
    badgeEnabled: true,
    toastEnabled: true,
    position: 'top-right',
    theme: 'auto',
    duration: 5000,
    animations: true
  },
  personalization: {
    readingInterests: [],
    favoriteAuthors: [],
    preferredLanguage: 'ar',
    locationBased: false,
    currentLocation: '',
    timeBasedPreferences: {},
    engagementTracking: true,
    smartFiltering: true
  },
  advanced: {
    emailDigest: {
      enabled: false,
      frequency: 'daily',
      time: '08:00',
      includeAnalytics: false,
      maxArticles: 10
    },
    breakingNews: {
      enabled: true,
      threshold: 'high',
      sources: [],
      immediateDelivery: true
    },
    trending: {
      enabled: true,
      threshold: 100,
      categories: [],
      timeWindow: 24
    },
    collaboration: {
      enabled: true,
      teamNotifications: true,
      assignmentAlerts: true,
      deadlineReminders: true
    }
  }
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useKV<NotificationPreferences>('notification-preferences', defaultPreferences);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isTestingVibration, setIsTestingVibration] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'local', name: 'محليات', icon: '🗺️', color: 'bg-blue-100 text-blue-800' },
    { id: 'world', name: 'العالم', icon: '🌍', color: 'bg-green-100 text-green-800' },
    { id: 'sports', name: 'رياضة', icon: '⚽', color: 'bg-orange-100 text-orange-800' },
    { id: 'business', name: 'أعمال', icon: '💼', color: 'bg-purple-100 text-purple-800' },
    { id: 'technology', name: 'تقنية', icon: '💻', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'health', name: 'صحة', icon: '🏥', color: 'bg-red-100 text-red-800' },
    { id: 'tourism', name: 'سياحة', icon: '🧳', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'cars', name: 'سيارات', icon: '🚗', color: 'bg-gray-100 text-gray-800' },
    { id: 'media', name: 'ميديا', icon: '🎬', color: 'bg-pink-100 text-pink-800' }
  ];

  const soundOptions = [
    { id: 'default', name: 'الافتراضي' },
    { id: 'bell', name: 'جرس' },
    { id: 'chime', name: 'نغمة' },
    { id: 'alert', name: 'تنبيه' },
    { id: 'notification', name: 'إشعار' },
    { id: 'custom', name: 'مخصص' }
  ];

  const timezones = [
    { id: 'Asia/Riyadh', name: 'الرياض (GMT+3)' },
    { id: 'Asia/Dubai', name: 'دبي (GMT+4)' },
    { id: 'Asia/Kuwait', name: 'الكويت (GMT+3)' },
    { id: 'Asia/Qatar', name: 'الدوحة (GMT+3)' },
    { id: 'Asia/Bahrain', name: 'المنامة (GMT+3)' }
  ];

  const authors = [
    'أحمد الشمري', 'فاطمة العتيبي', 'محمد القحطاني', 'نورا السعد', 'خالد المطيري',
    'سارة الدوسري', 'عبدالله النجار', 'هنوف الراشد', 'يوسف الغامدي', 'مها العنزي'
  ];

  // Initialize category preferences
  useEffect(() => {
    if (Object.keys(preferences.categories).length === 0) {
      const categoryDefaults: Record<string, any> = {};
      categories.forEach(cat => {
        categoryDefaults[cat.id] = {
          enabled: true,
          priority: 'medium',
          keywords: [],
          excludeKeywords: []
        };
      });
      setPreferences(prev => ({
        ...prev,
        categories: categoryDefaults
      }));
    }
  }, [preferences.categories, setPreferences]);

  const testSound = async () => {
    if (!isTestingSound) {
      setIsTestingSound(true);
      
      // Use Web Audio API for better sound control
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(preferences.audio.volume / 100, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        toast.success('تم تشغيل الصوت التجريبي');
      } catch (error) {
        toast.error('تعذر تشغيل الصوت');
      }
      
      setTimeout(() => setIsTestingSound(false), 2000);
    }
  };

  const testVibration = () => {
    if (!isTestingVibration && 'vibrate' in navigator) {
      setIsTestingVibration(true);
      
      const patterns = {
        short: [200],
        long: [500],
        custom: preferences.vibration.customPattern
      };
      
      navigator.vibrate(patterns[preferences.vibration.pattern]);
      toast.success('تم تشغيل الاهتزاز التجريبي');
      setTimeout(() => setIsTestingVibration(false), 1000);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('تم منح إذن الإشعارات');
        setPreferences(prev => ({
          ...prev,
          channels: { ...prev.channels, browser: true }
        }));
      } else {
        toast.error('تم رفض إذن الإشعارات');
        setPreferences(prev => ({
          ...prev,
          channels: { ...prev.channels, browser: false }
        }));
      }
    }
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notification-preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير الإعدادات');
  };

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPrefs = JSON.parse(e.target?.result as string);
          setPreferences(importedPrefs);
          toast.success('تم استيراد الإعدادات بنجاح');
        } catch (error) {
          toast.error('فشل في استيراد الإعدادات');
        }
      };
      reader.readAsText(file);
    }
  };

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const newPrefs = { ...prev };
      let current: any = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof current[keys[i]] === 'object') {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const addKeywordToCategory = (categoryId: string, keyword: string, isExclude = false) => {
    if (!keyword.trim()) return;
    
    const field = isExclude ? 'excludeKeywords' : 'keywords';
    const currentKeywords = preferences.categories[categoryId]?.[field] || [];
    
    if (!currentKeywords.includes(keyword.trim())) {
      updatePreference(`categories.${categoryId}.${field}`, [...currentKeywords, keyword.trim()]);
      setNewKeyword('');
      toast.success(`تمت إضافة الكلمة المفتاحية`);
    }
  };

  const removeKeywordFromCategory = (categoryId: string, keyword: string, isExclude = false) => {
    const field = isExclude ? 'excludeKeywords' : 'keywords';
    const currentKeywords = preferences.categories[categoryId]?.[field] || [];
    updatePreference(`categories.${categoryId}.${field}`, currentKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الإشعارات الشخصية</h1>
          <p className="text-muted-foreground">تخصيص كامل لتجربة الإشعارات حسب تفضيلاتك</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportPreferences}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير الإعدادات
          </Button>
          
          <Button
            variant="outline"
            className="gap-2 relative"
          >
            <Upload className="w-4 h-4" />
            استيراد الإعدادات
            <input
              type="file"
              accept=".json"
              onChange={importPreferences}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
          
          <Button
            onClick={requestNotificationPermission}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            طلب إذن الإشعارات
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="w-4 h-4" />
            الأقسام
          </TabsTrigger>
          <TabsTrigger value="personalization" className="gap-2">
            <User className="w-4 h-4" />
            شخصي
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Monitor className="w-4 h-4" />
            القنوات
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <Palette className="w-4 h-4" />
            التجربة
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Shield className="w-4 h-4" />
            متقدم
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  الإعدادات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="global-enabled" className="text-base">تفعيل جميع الإشعارات</Label>
                  <Switch
                    id="global-enabled"
                    checked={preferences.enabled}
                    onCheckedChange={(checked) => updatePreference('enabled', checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base">أولوية الإشعارات</Label>
                  {Object.entries(preferences.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <Label htmlFor={`priority-${priority}`} className="flex items-center gap-2">
                        {priority === 'critical' ? <BellRinging className="w-4 h-4 text-red-500" /> :
                         priority === 'high' ? <Bell className="w-4 h-4 text-orange-500" /> :
                         priority === 'medium' ? <Bell className="w-4 h-4 text-yellow-500" /> :
                         <Clock className="w-4 h-4 text-blue-500" />}
                        <span>
                          {priority === 'critical' ? 'حرجة' : 
                           priority === 'high' ? 'عالية' :
                           priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>
                      </Label>
                      <Switch
                        id={`priority-${priority}`}
                        checked={enabled}
                        onCheckedChange={(checked) => updatePreference(`priorities.${priority}`, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  إعدادات التوقيت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Select value={preferences.timing.timezone} onValueChange={(value) => updatePreference('timing.timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.id} value={tz.id}>{tz.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الحد الأقصى للإشعارات في الساعة</Label>
                  <Slider
                    value={[preferences.timing.maxPerHour]}
                    onValueChange={(value) => updatePreference('timing.maxPerHour', value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {preferences.timing.maxPerHour} إشعارات كحد أقصى
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours" className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>ساعات الهدوء</span>
                  </Label>
                  <Switch
                    id="quiet-hours"
                    checked={preferences.timing.quietHours.enabled}
                    onCheckedChange={(checked) => updatePreference('timing.quietHours.enabled', checked)}
                  />
                </div>

                {preferences.timing.quietHours.enabled && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quiet-start" className="text-sm">بداية الهدوء</Label>
                        <Input
                          id="quiet-start"
                          type="time"
                          value={preferences.timing.quietHours.start}
                          onChange={(e) => updatePreference('timing.quietHours.start', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiet-end" className="text-sm">نهاية الهدوء</Label>
                        <Input
                          id="quiet-end"
                          type="time"
                          value={preferences.timing.quietHours.end}
                          onChange={(e) => updatePreference('timing.quietHours.end', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekends-only" className="text-sm">عطلة نهاية الأسبوع فقط</Label>
                      <Switch
                        id="weekends-only"
                        checked={preferences.timing.quietHours.weekendsOnly}
                        onCheckedChange={(checked) => updatePreference('timing.quietHours.weekendsOnly', checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Categories Settings */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  تخصيص الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => {
                  const categoryPref = preferences.categories[category.id];
                  return (
                    <div key={category.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                          <Badge className={category.color} variant="secondary">
                            {categoryPref?.priority || 'medium'}
                          </Badge>
                        </Label>
                        <Switch
                          checked={categoryPref?.enabled ?? true}
                          onCheckedChange={(checked) => updatePreference(`categories.${category.id}.enabled`, checked)}
                        />
                      </div>
                      
                      {categoryPref?.enabled && (
                        <div className="space-y-3 pt-2 border-t">
                          <div>
                            <Label className="text-sm">أولوية القسم</Label>
                            <Select 
                              value={categoryPref?.priority || 'medium'} 
                              onValueChange={(value) => updatePreference(`categories.${category.id}.priority`, value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">منخفضة</SelectItem>
                                <SelectItem value="medium">متوسطة</SelectItem>
                                <SelectItem value="high">عالية</SelectItem>
                                <SelectItem value="critical">حرجة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">الكلمات المفتاحية المهمة</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder="أضف كلمة مفتاحية..."
                                value={selectedCategory === category.id ? newKeyword : ''}
                                onChange={(e) => {
                                  setNewKeyword(e.target.value);
                                  setSelectedCategory(category.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addKeywordToCategory(category.id, newKeyword);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => addKeywordToCategory(category.id, newKeyword)}
                                disabled={!newKeyword.trim()}
                              >
                                إضافة
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(categoryPref?.keywords || []).map((keyword, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => removeKeywordFromCategory(category.id, keyword)}
                                >
                                  {keyword} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  فلترة الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تكرار الإشعارات</Label>
                  <Select value={preferences.timing.frequency} onValueChange={(value) => updatePreference('timing.frequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">فوري</SelectItem>
                      <SelectItem value="batched">مجمع</SelectItem>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="custom">مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {preferences.timing.frequency === 'batched' && (
                  <div className="space-y-2">
                    <Label>فترة التجميع (بالدقائق)</Label>
                    <Slider
                      value={[preferences.timing.batchInterval]}
                      onValueChange={(value) => updatePreference('timing.batchInterval', value[0])}
                      max={240}
                      min={15}
                      step={15}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      كل {preferences.timing.batchInterval} دقيقة
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-base">الأخبار الشائعة</Label>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trending-enabled" className="text-sm">تتبع الأخبار الشائعة</Label>
                    <Switch
                      id="trending-enabled"
                      checked={preferences.advanced.trending.enabled}
                      onCheckedChange={(checked) => updatePreference('advanced.trending.enabled', checked)}
                    />
                  </div>
                  
                  {preferences.advanced.trending.enabled && (
                    <div className="space-y-2">
                      <Label className="text-sm">عتبة الشهرة</Label>
                      <Slider
                        value={[preferences.advanced.trending.threshold]}
                        onValueChange={(value) => updatePreference('advanced.trending.threshold', value[0])}
                        max={1000}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {preferences.advanced.trending.threshold} مشاهدة
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personalization Settings */}
        <TabsContent value="personalization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  اهتماماتك الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اللغة المفضلة</Label>
                  <Select value={preferences.personalization.preferredLanguage} onValueChange={(value) => updatePreference('personalization.preferredLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                      <SelectItem value="both">كلاهما</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الكتّاب المفضلون</Label>
                  <div className="space-y-2">
                    {authors.map((author) => (
                      <Label key={author} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.personalization.favoriteAuthors.includes(author)}
                          onChange={(e) => {
                            const current = preferences.personalization.favoriteAuthors;
                            if (e.target.checked) {
                              updatePreference('personalization.favoriteAuthors', [...current, author]);
                            } else {
                              updatePreference('personalization.favoriteAuthors', current.filter(a => a !== author));
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{author}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="location-based" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>الأخبار المحلية</span>
                  </Label>
                  <Switch
                    id="location-based"
                    checked={preferences.personalization.locationBased}
                    onCheckedChange={(checked) => updatePreference('personalization.locationBased', checked)}
                  />
                </div>

                {preferences.personalization.locationBased && (
                  <div className="space-y-2">
                    <Label htmlFor="location">موقعك الحالي</Label>
                    <Input
                      id="location"
                      placeholder="المدينة أو المنطقة"
                      value={preferences.personalization.currentLocation}
                      onChange={(e) => updatePreference('personalization.currentLocation', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="w-5 h-5" />
                  التخصيص الذكي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="engagement-tracking" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>تتبع التفاعل</span>
                  </Label>
                  <Switch
                    id="engagement-tracking"
                    checked={preferences.personalization.engagementTracking}
                    onCheckedChange={(checked) => updatePreference('personalization.engagementTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smart-filtering" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>الفلترة الذكية</span>
                  </Label>
                  <Switch
                    id="smart-filtering"
                    checked={preferences.personalization.smartFiltering}
                    onCheckedChange={(checked) => updatePreference('personalization.smartFiltering', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اهتماماتك في القراءة</Label>
                  <Textarea
                    placeholder="اكتب عن اهتماماتك ومواضيعك المفضلة..."
                    value={preferences.personalization.readingInterests.join(', ')}
                    onChange={(e) => {
                      const interests = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updatePreference('personalization.readingInterests', interests);
                    }}
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground">
                    فصل بينها بفواصل (مثال: السياسة, التكنولوجيا, الرياضة)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ملخص يومي بالبريد الإلكتروني</Label>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-digest" className="text-sm">تفعيل الملخص اليومي</Label>
                    <Switch
                      id="email-digest"
                      checked={preferences.advanced.emailDigest.enabled}
                      onCheckedChange={(checked) => updatePreference('advanced.emailDigest.enabled', checked)}
                    />
                  </div>
                  
                  {preferences.advanced.emailDigest.enabled && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <Label className="text-sm">التكرار</Label>
                        <Select value={preferences.advanced.emailDigest.frequency} onValueChange={(value) => updatePreference('advanced.emailDigest.frequency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">يومي</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                            <SelectItem value="monthly">شهري</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">وقت الإرسال</Label>
                        <Input
                          type="time"
                          value={preferences.advanced.emailDigest.time}
                          onChange={(e) => updatePreference('advanced.emailDigest.time', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels Settings */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  قنوات التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-browser" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>إشعارات المتصفح</span>
                  </Label>
                  <Switch
                    id="channel-browser"
                    checked={preferences.channels.browser}
                    onCheckedChange={(checked) => updatePreference('channels.browser', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-desktop" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>سطح المكتب</span>
                  </Label>
                  <Switch
                    id="channel-desktop"
                    checked={preferences.channels.desktop}
                    onCheckedChange={(checked) => updatePreference('channels.desktop', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-mobile" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>الهاتف المحمول</span>
                  </Label>
                  <Switch
                    id="channel-mobile"
                    checked={preferences.channels.mobile}
                    onCheckedChange={(checked) => updatePreference('channels.mobile', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>البريد الإلكتروني</span>
                  </Label>
                  <Switch
                    id="channel-email"
                    checked={preferences.channels.email}
                    onCheckedChange={(checked) => updatePreference('channels.email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-sms" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>الرسائل النصية</span>
                  </Label>
                  <Switch
                    id="channel-sms"
                    checked={preferences.channels.sms}
                    onCheckedChange={(checked) => updatePreference('channels.sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="channel-inapp" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>إشعارات داخل التطبيق</span>
                  </Label>
                  <Switch
                    id="channel-inapp"
                    checked={preferences.channels.inApp}
                    onCheckedChange={(checked) => updatePreference('channels.inApp', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRinging className="w-5 h-5" />
                  الأخبار العاجلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="breaking-enabled" className="text-base">تفعيل الأخبار العاجلة</Label>
                  <Switch
                    id="breaking-enabled"
                    checked={preferences.advanced.breakingNews.enabled}
                    onCheckedChange={(checked) => updatePreference('advanced.breakingNews.enabled', checked)}
                  />
                </div>

                {preferences.advanced.breakingNews.enabled && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>عتبة الأهمية</Label>
                      <Select value={preferences.advanced.breakingNews.threshold} onValueChange={(value) => updatePreference('advanced.breakingNews.threshold', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفضة</SelectItem>
                          <SelectItem value="medium">متوسطة</SelectItem>
                          <SelectItem value="high">عالية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="immediate-delivery" className="text-sm">التوصيل الفوري</Label>
                      <Switch
                        id="immediate-delivery"
                        checked={preferences.advanced.breakingNews.immediateDelivery}
                        onCheckedChange={(checked) => updatePreference('advanced.breakingNews.immediateDelivery', checked)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-base">التعاون والفريق</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="team-notifications" className="text-sm">إشعارات الفريق</Label>
                      <Switch
                        id="team-notifications"
                        checked={preferences.advanced.collaboration.teamNotifications}
                        onCheckedChange={(checked) => updatePreference('advanced.collaboration.teamNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignment-alerts" className="text-sm">تنبيهات المهام</Label>
                      <Switch
                        id="assignment-alerts"
                        checked={preferences.advanced.collaboration.assignmentAlerts}
                        onCheckedChange={(checked) => updatePreference('advanced.collaboration.assignmentAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="deadline-reminders" className="text-sm">تذكير المواعيد النهائية</Label>
                      <Switch
                        id="deadline-reminders"
                        checked={preferences.advanced.collaboration.deadlineReminders}
                        onCheckedChange={(checked) => updatePreference('advanced.collaboration.deadlineReminders', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Experience Settings */}
        <TabsContent value="experience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume className="w-5 h-5" />
                  إعدادات الصوت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-enabled" className="text-base">تفعيل الصوت</Label>
                  <Switch
                    id="audio-enabled"
                    checked={preferences.audio.enabled}
                    onCheckedChange={(checked) => updatePreference('audio.enabled', checked)}
                  />
                </div>

                {preferences.audio.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">مستوى الصوت</Label>
                      <div className="flex items-center gap-3">
                        <VolumeX className="w-4 h-4" />
                        <Slider
                          value={[preferences.audio.volume]}
                          onValueChange={(value) => updatePreference('audio.volume', value[0])}
                          max={100}
                          step={10}
                          className="flex-1"
                        />
                        <Volume className="w-4 h-4" />
                        <span className="text-sm font-medium w-8">{preferences.audio.volume}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">نغمة الإشعار</Label>
                      <Select value={preferences.audio.customSound} onValueChange={(value) => updatePreference('audio.customSound', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {soundOptions.map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>{sound.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="different-sounds" className="text-sm">أصوات مختلفة للأقسام</Label>
                      <Switch
                        id="different-sounds"
                        checked={preferences.audio.differentSounds}
                        onCheckedChange={(checked) => updatePreference('audio.differentSounds', checked)}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={testSound}
                      disabled={isTestingSound}
                      className="w-full gap-2"
                    >
                      {isTestingSound ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          جاري التشغيل...
                        </>
                      ) : (
                        <>
                          <SoundcloudLogo className="w-4 h-4" />
                          تجربة الصوت
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vibrate className="w-5 h-5" />
                  إعدادات الاهتزاز
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vibration-enabled" className="text-base">تفعيل الاهتزاز</Label>
                  <Switch
                    id="vibration-enabled"
                    checked={preferences.vibration.enabled}
                    onCheckedChange={(checked) => updatePreference('vibration.enabled', checked)}
                  />
                </div>

                {preferences.vibration.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">شدة الاهتزاز</Label>
                      <Slider
                        value={[preferences.vibration.intensity]}
                        onValueChange={(value) => updatePreference('vibration.intensity', value[0])}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {preferences.vibration.intensity}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">نمط الاهتزاز</Label>
                      <div className="space-y-2">
                        {[
                          { id: 'short', label: 'قصير' },
                          { id: 'long', label: 'طويل' },
                          { id: 'custom', label: 'مخصص' }
                        ].map((pattern) => (
                          <Label key={pattern.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="vibration-pattern"
                              value={pattern.id}
                              checked={preferences.vibration.pattern === pattern.id}
                              onChange={(e) => updatePreference('vibration.pattern', e.target.value)}
                              className="rounded border-border"
                            />
                            <span>{pattern.label}</span>
                          </Label>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={testVibration}
                      disabled={isTestingVibration}
                      className="w-full gap-2"
                    >
                      {isTestingVibration ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          جاري التجربة...
                        </>
                      ) : (
                        <>
                          <Vibrate className="w-4 h-4" />
                          تجربة الاهتزاز
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  المظهر والعرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>موقع الإشعارات</Label>
                  <Select value={preferences.visual.position} onValueChange={(value) => updatePreference('visual.position', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-right">أعلى اليمين</SelectItem>
                      <SelectItem value="top-left">أعلى اليسار</SelectItem>
                      <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                      <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                      <SelectItem value="center">المنتصف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>سمة المظهر</Label>
                  <Select value={preferences.visual.theme} onValueChange={(value) => updatePreference('visual.theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>مدة العرض (بالثواني)</Label>
                  <Slider
                    value={[preferences.visual.duration / 1000]}
                    onValueChange={(value) => updatePreference('visual.duration', value[0] * 1000)}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {preferences.visual.duration / 1000} ثانية
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">خيارات العرض</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="banner-enabled" className="text-sm">اللافتة العلوية</Label>
                      <Switch
                        id="banner-enabled"
                        checked={preferences.visual.bannerEnabled}
                        onCheckedChange={(checked) => updatePreference('visual.bannerEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="popup-enabled" className="text-sm">النوافذ المنبثقة</Label>
                      <Switch
                        id="popup-enabled"
                        checked={preferences.visual.popupEnabled}
                        onCheckedChange={(checked) => updatePreference('visual.popupEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="toast-enabled" className="text-sm">إشعارات التوست</Label>
                      <Switch
                        id="toast-enabled"
                        checked={preferences.visual.toastEnabled}
                        onCheckedChange={(checked) => updatePreference('visual.toastEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="badge-enabled" className="text-sm">شارات العدد</Label>
                      <Switch
                        id="badge-enabled"
                        checked={preferences.visual.badgeEnabled}
                        onCheckedChange={(checked) => updatePreference('visual.badgeEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations-enabled" className="text-sm">الحركات والانتقالات</Label>
                      <Switch
                        id="animations-enabled"
                        checked={preferences.visual.animations}
                        onCheckedChange={(checked) => updatePreference('visual.animations', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  إعدادات متقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">نسخ احتياطي للإعدادات</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportPreferences} className="flex-1 gap-2">
                      <Download className="w-4 h-4" />
                      تصدير
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 relative">
                      <Upload className="w-4 h-4" />
                      استيراد
                      <input
                        type="file"
                        accept=".json"
                        onChange={importPreferences}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">إعدادات الأمان</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• يتم تشفير تفضيلاتك محلياً</p>
                    <p>• لا يتم مشاركة البيانات مع أطراف ثالثة</p>
                    <p>• يمكنك حذف جميع البيانات في أي وقت</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف جميع إعدادات الإشعارات؟')) {
                        setPreferences(defaultPreferences);
                        toast.success('تم حذف جميع الإعدادات');
                      }
                    }}
                  >
                    حذف جميع الإعدادات
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">معلومات النظام</Label>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>دعم الإشعارات:</span>
                      <Badge variant={('Notification' in window) ? 'default' : 'destructive'}>
                        {('Notification' in window) ? 'مدعوم' : 'غير مدعوم'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>حالة الإذن:</span>
                      <Badge variant={
                        Notification.permission === 'granted' ? 'default' :
                        Notification.permission === 'denied' ? 'destructive' : 'secondary'
                      }>
                        {Notification.permission === 'granted' ? 'ممنوح' :
                         Notification.permission === 'denied' ? 'مرفوض' : 'لم يتم طلبه'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>دعم الاهتزاز:</span>
                      <Badge variant={('vibrate' in navigator) ? 'default' : 'secondary'}>
                        {('vibrate' in navigator) ? 'مدعوم' : 'غير مدعوم'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  إحصائيات الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(preferences.categories).filter(cat => cat?.enabled).length}
                    </div>
                    <div className="text-sm text-blue-600">أقسام نشطة</div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(preferences.channels).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-green-600">قنوات مفعلة</div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {preferences.personalization.favoriteAuthors.length}
                    </div>
                    <div className="text-sm text-purple-600">كتّاب مفضلون</div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {preferences.personalization.readingInterests.length}
                    </div>
                    <div className="text-sm text-orange-600">اهتمامات</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">ملخص التفضيلات</Label>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>التوقيت المفضل:</span>
                      <span>{preferences.timing.frequency === 'immediate' ? 'فوري' : 'مجمع'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>اللغة:</span>
                      <span>
                        {preferences.personalization.preferredLanguage === 'ar' ? 'العربية' :
                         preferences.personalization.preferredLanguage === 'en' ? 'الإنجليزية' : 'كلاهما'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الفلترة الذكية:</span>
                      <span>{preferences.personalization.smartFiltering ? 'مفعلة' : 'معطلة'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الأخبار العاجلة:</span>
                      <span>{preferences.advanced.breakingNews.enabled ? 'مفعلة' : 'معطلة'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الإعدادات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${preferences.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {preferences.enabled ? <Bell className="w-6 h-6 mx-auto" /> : <BellSlash className="w-6 h-6 mx-auto" />}
              </div>
              <div className="text-sm">
                <div className="font-semibold">الإشعارات</div>
                <div className="text-muted-foreground">{preferences.enabled ? 'مفعلة' : 'معطلة'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${preferences.audio.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {preferences.audio.enabled ? <Volume className="w-6 h-6 mx-auto" /> : <VolumeX className="w-6 h-6 mx-auto" />}
              </div>
              <div className="text-sm">
                <div className="font-semibold">الصوت</div>
                <div className="text-muted-foreground">
                  {preferences.audio.enabled ? `${preferences.audio.volume}%` : 'معطل'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${preferences.vibration.enabled ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                <Vibrate className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">الاهتزاز</div>
                <div className="text-muted-foreground">
                  {preferences.vibration.enabled ? `${preferences.vibration.pattern} (${preferences.vibration.intensity}%)` : 'معطل'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${preferences.timing.quietHours.enabled ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                {preferences.timing.quietHours.enabled ? <Moon className="w-6 h-6 mx-auto" /> : <Sun className="w-6 h-6 mx-auto" />}
              </div>
              <div className="text-sm">
                <div className="font-semibold">ساعات الهدوء</div>
                <div className="text-muted-foreground">
                  {preferences.timing.quietHours.enabled 
                    ? `${preferences.timing.quietHours.start} - ${preferences.timing.quietHours.end}` 
                    : 'معطلة'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')} في {new Date().toLocaleTimeString('ar-SA')}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {Object.values(preferences.categories).filter(cat => cat?.enabled).length} أقسام نشطة
                </Badge>
                <Badge variant="outline">
                  {Object.values(preferences.channels).filter(Boolean).length} قنوات مفعلة
                </Badge>
                <Badge variant="outline">
                  حد أقصى {preferences.timing.maxPerHour} إشعارات/ساعة
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}