import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  Sun
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface NotificationPreferences {
  enabled: boolean;
  categories: Record<string, boolean>;
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
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    frequency: 'immediate' | 'batched' | 'daily';
    batchInterval: number; // in minutes
  };
  audio: {
    enabled: boolean;
    volume: number;
    customSound: string;
  };
  vibration: {
    enabled: boolean;
    pattern: 'short' | 'long' | 'custom';
  };
  visual: {
    bannerEnabled: boolean;
    popupEnabled: boolean;
    badgeEnabled: boolean;
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
    inApp: true
  },
  timing: {
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    frequency: 'immediate',
    batchInterval: 30
  },
  audio: {
    enabled: true,
    volume: 70,
    customSound: 'default'
  },
  vibration: {
    enabled: true,
    pattern: 'short'
  },
  visual: {
    bannerEnabled: true,
    popupEnabled: true,
    badgeEnabled: true
  }
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useKV<NotificationPreferences>('notification-preferences', defaultPreferences);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isTestingVibration, setIsTestingVibration] = useState(false);

  const categories = [
    { id: 'local', name: 'محليات', icon: '🗺️' },
    { id: 'world', name: 'العالم', icon: '🌍' },
    { id: 'sports', name: 'رياضة', icon: '⚽' },
    { id: 'business', name: 'أعمال', icon: '💼' },
    { id: 'technology', name: 'تقنية', icon: '💻' },
    { id: 'health', name: 'صحة', icon: '🏥' }
  ];

  // Initialize category preferences
  useEffect(() => {
    if (Object.keys(preferences.categories).length === 0) {
      const categoryDefaults: Record<string, boolean> = {};
      categories.forEach(cat => {
        categoryDefaults[cat.id] = true;
      });
      setPreferences(prev => ({
        ...prev,
        categories: categoryDefaults
      }));
    }
  }, [preferences.categories, setPreferences]);

  const testSound = () => {
    if (!isTestingSound) {
      setIsTestingSound(true);
      // Simulate sound test
      toast.success('تم تشغيل الصوت التجريبي');
      setTimeout(() => setIsTestingSound(false), 2000);
    }
  };

  const testVibration = () => {
    if (!isTestingVibration && 'vibrate' in navigator) {
      setIsTestingVibration(true);
      
      const patterns = {
        short: [200],
        long: [500],
        custom: [200, 100, 200, 100, 200]
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الإشعارات</h1>
          <p className="text-muted-foreground">تخصيص كيفية تلقي الإشعارات والأخبار العاجلة</p>
        </div>
        
        <Button
          onClick={requestNotificationPermission}
          variant="outline"
          className="gap-2"
        >
          <Bell className="w-4 h-4" />
          طلب إذن الإشعارات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإعدادات العامة
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

        {/* Category Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              إشعارات الأقسام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <Label htmlFor={`cat-${category.id}`} className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Label>
                <Switch
                  id={`cat-${category.id}`}
                  checked={preferences.categories[category.id] ?? true}
                  onCheckedChange={(checked) => updatePreference(`categories.${category.id}`, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channel Settings */}
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

        {/* Audio Settings */}
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
                      <Volume className="w-4 h-4" />
                      تجربة الصوت
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vibration Settings */}
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

        {/* Timing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              إعدادات التوقيت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start" className="text-sm">بداية الهدوء</Label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={preferences.timing.quietHours.start}
                    onChange={(e) => updatePreference('timing.quietHours.start', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end" className="text-sm">نهاية الهدوء</Label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={preferences.timing.quietHours.end}
                    onChange={(e) => updatePreference('timing.quietHours.end', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">تكرار الإشعارات</Label>
              <div className="space-y-2">
                {[
                  { id: 'immediate', label: 'فوري' },
                  { id: 'batched', label: 'مجمع' },
                  { id: 'daily', label: 'يومي' }
                ].map((freq) => (
                  <Label key={freq.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={freq.id}
                      checked={preferences.timing.frequency === freq.id}
                      onChange={(e) => updatePreference('timing.frequency', e.target.value)}
                      className="rounded border-border"
                    />
                    <span>{freq.label}</span>
                  </Label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ملخص الإعدادات</CardTitle>
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
                  {preferences.vibration.enabled ? preferences.vibration.pattern : 'معطل'}
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
        </CardContent>
      </Card>
    </div>
  );
}