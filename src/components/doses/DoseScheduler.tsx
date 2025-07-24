import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DoseSchedule, DoseTemplate } from '@/types';
import { 
  Clock, 
  Save,
  Settings,
  Bell,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  CheckCircle,
  AlertCircle,
  Mail,
  Smartphone
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DoseSchedulerProps {
  schedule: DoseSchedule;
  templates: DoseTemplate[];
  onScheduleUpdate: (schedule: DoseSchedule) => void;
  onTemplatesUpdate: (templates: DoseTemplate[]) => void;
}

export function DoseScheduler({ schedule, templates, onScheduleUpdate, onTemplatesUpdate }: DoseSchedulerProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [editedSchedule, setEditedSchedule] = useState<DoseSchedule>({ ...schedule });

  // Time slot icons and info
  const timeSlotInfo = {
    morning: { 
      icon: Sun, 
      emoji: '☀️', 
      label: isArabic ? 'الصباح' : 'Morning',
      color: 'text-yellow-600',
      defaultTime: '07:00'
    },
    noon: { 
      icon: CloudSun, 
      emoji: '☁️', 
      label: isArabic ? 'الظهيرة' : 'Noon',
      color: 'text-blue-600',
      defaultTime: '13:00'
    },
    evening: { 
      icon: Sunset, 
      emoji: '🌇', 
      label: isArabic ? 'المساء' : 'Evening',
      color: 'text-orange-600',
      defaultTime: '18:00'
    },
    night: { 
      icon: Moon, 
      emoji: '🌙', 
      label: isArabic ? 'الليل' : 'Night',
      color: 'text-purple-600',
      defaultTime: '22:00'
    }
  };

  const handleTimeSlotUpdate = (
    slot: keyof typeof editedSchedule.timeSlots,
    field: keyof typeof editedSchedule.timeSlots.morning,
    value: any
  ) => {
    setEditedSchedule(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [slot]: {
          ...prev.timeSlots[slot],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    const updatedSchedule = {
      ...editedSchedule,
      updatedAt: new Date()
    };
    onScheduleUpdate(updatedSchedule);
    toast.success(
      isArabic ? 'تم حفظ إعدادات الجدولة' : 'Schedule settings saved successfully'
    );
  };

  const resetToDefaults = () => {
    const defaultSchedule: DoseSchedule = {
      id: 'default_schedule',
      timeSlots: {
        morning: { time: '07:00', enabled: true },
        noon: { time: '13:00', enabled: true },
        evening: { time: '18:00', enabled: true },
        night: { time: '22:00', enabled: true }
      },
      timezone: 'Asia/Riyadh',
      autoGenerate: true,
      moderationRequired: false,
      notificationSettings: {
        email: true,
        push: true
      },
      isActive: true,
      createdBy: 'system',
      updatedAt: new Date()
    };
    setEditedSchedule(defaultSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h2 className="text-2xl font-bold tracking-tight font-arabic">
            {isArabic ? 'جدولة الجرعات الذكية' : 'Smart Dose Scheduler'}
          </h2>
          <p className="text-muted-foreground font-arabic">
            {isArabic ? 'إعداد أوقات النشر التلقائي للجرعات اليومية' : 'Configure automatic publishing times for daily doses'}
          </p>
        </div>
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" onClick={resetToDefaults} className="font-arabic">
            <SafeIcon icon={Settings} className="h-4 w-4" />
            {isArabic ? 'إعادة تعيين' : 'Reset Defaults'}
          </Button>
          <Button onClick={handleSave} className="font-arabic">
            <SafeIcon icon={Save} className="h-4 w-4" />
            {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'الإعدادات العامة' : 'Master Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label className="font-arabic">{isArabic ? 'تفعيل الجدولة' : 'Enable Scheduling'}</Label>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'تشغيل/إيقاف النظام' : 'Turn system on/off'}
                </p>
              </div>
              <Switch
                checked={editedSchedule.isActive}
                onCheckedChange={(checked) => 
                  setEditedSchedule(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label className="font-arabic">{isArabic ? 'الإنشاء التلقائي' : 'Auto Generate'}</Label>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'إنشاء المحتوى تلقائياً' : 'Generate content automatically'}
                </p>
              </div>
              <Switch
                checked={editedSchedule.autoGenerate}
                onCheckedChange={(checked) => 
                  setEditedSchedule(prev => ({ ...prev, autoGenerate: checked }))
                }
              />
            </div>

            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label className="font-arabic">{isArabic ? 'المراجعة المطلوبة' : 'Moderation Required'}</Label>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'يتطلب مراجعة قبل النشر' : 'Requires review before publishing'}
                </p>
              </div>
              <Switch
                checked={editedSchedule.moderationRequired}
                onCheckedChange={(checked) => 
                  setEditedSchedule(prev => ({ ...prev, moderationRequired: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="font-arabic">{isArabic ? 'المنطقة الزمنية' : 'Timezone'}</Label>
            <Select
              value={editedSchedule.timezone}
              onValueChange={(value) => 
                setEditedSchedule(prev => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="font-arabic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Riyadh" className="font-arabic">
                  {isArabic ? 'الرياض (GMT+3)' : 'Riyadh (GMT+3)'}
                </SelectItem>
                <SelectItem value="Asia/Dubai" className="font-arabic">
                  {isArabic ? 'دبي (GMT+4)' : 'Dubai (GMT+4)'}
                </SelectItem>
                <SelectItem value="Asia/Kuwait" className="font-arabic">
                  {isArabic ? 'الكويت (GMT+3)' : 'Kuwait (GMT+3)'}
                </SelectItem>
                <SelectItem value="Asia/Qatar" className="font-arabic">
                  {isArabic ? 'قطر (GMT+3)' : 'Qatar (GMT+3)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'إعدادات الفترات الزمنية' : 'Time Slot Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(timeSlotInfo).map(([slot, info]) => {
              const slotSettings = editedSchedule.timeSlots[slot as keyof typeof editedSchedule.timeSlots];
              const IconComponent = info.icon;
              const slotTemplates = templates.filter(t => t.timeSlot === slot);

              return (
                <div key={slot} className="space-y-4">
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <SafeIcon icon={IconComponent} className={cn("h-6 w-6", info.color)} />
                    <span className="text-xl">{info.emoji}</span>
                    <h4 className="text-lg font-semibold font-arabic">{info.label}</h4>
                    {slotSettings.enabled ? (
                      <Badge variant="default" className="font-arabic">
                        <SafeIcon icon={CheckCircle} className="h-3 w-3 mr-1" />
                        {isArabic ? 'مفعل' : 'Enabled'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-arabic">
                        <SafeIcon icon={AlertCircle} className="h-3 w-3 mr-1" />
                        {isArabic ? 'معطل' : 'Disabled'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-12">
                    <div className="space-y-2">
                      <Label className="font-arabic">{isArabic ? 'التفعيل' : 'Enable'}</Label>
                      <Switch
                        checked={slotSettings.enabled}
                        onCheckedChange={(checked) => 
                          handleTimeSlotUpdate(slot as any, 'enabled', checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-arabic">{isArabic ? 'وقت النشر' : 'Publish Time'}</Label>
                      <Input
                        type="time"
                        value={slotSettings.time}
                        onChange={(e) => 
                          handleTimeSlotUpdate(slot as any, 'time', e.target.value)
                        }
                        className="font-arabic"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-arabic">{isArabic ? 'القالب الافتراضي' : 'Default Template'}</Label>
                      <Select
                        value={slotSettings.template || ''}
                        onValueChange={(value) => 
                          handleTimeSlotUpdate(slot as any, 'template', value || undefined)
                        }
                      >
                        <SelectTrigger className="font-arabic">
                          <SelectValue placeholder={isArabic ? 'اختياري' : 'Optional'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" className="font-arabic">
                            {isArabic ? 'بدون قالب' : 'No template'}
                          </SelectItem>
                          {slotTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id} className="font-arabic">
                              {isArabic ? template.nameAr : template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <SafeIcon icon={Mail} className="h-5 w-5 text-blue-600" />
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <Label className="font-arabic">{isArabic ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                  <p className="text-xs text-muted-foreground font-arabic">
                    {isArabic ? 'إرسال إشعارات عبر البريد' : 'Send notifications via email'}
                  </p>
                </div>
              </div>
              <Switch
                checked={editedSchedule.notificationSettings.email}
                onCheckedChange={(checked) => 
                  setEditedSchedule(prev => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      email: checked
                    }
                  }))
                }
              />
            </div>

            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <SafeIcon icon={Smartphone} className="h-5 w-5 text-green-600" />
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <Label className="font-arabic">{isArabic ? 'الإشعارات الفورية' : 'Push Notifications'}</Label>
                  <p className="text-xs text-muted-foreground font-arabic">
                    {isArabic ? 'إرسال إشعارات فورية' : 'Send push notifications'}
                  </p>
                </div>
              </div>
              <Switch
                checked={editedSchedule.notificationSettings.push}
                onCheckedChange={(checked) => 
                  setEditedSchedule(prev => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      push: checked
                    }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'معاينة الجدولة' : 'Schedule Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={cn("text-sm text-muted-foreground mb-4 font-arabic", isRTL && "text-right")}>
              {isArabic ? 'الجدولة اليومية المتوقعة:' : 'Expected daily schedule:'}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(timeSlotInfo).map(([slot, info]) => {
                const slotSettings = editedSchedule.timeSlots[slot as keyof typeof editedSchedule.timeSlots];
                const IconComponent = info.icon;

                return (
                  <div 
                    key={slot}
                    className={cn(
                      "p-4 rounded-lg border text-center",
                      slotSettings.enabled 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-muted/30 opacity-60"
                    )}
                  >
                    <SafeIcon icon={IconComponent} className={cn("h-8 w-8 mx-auto mb-2", info.color)} />
                    <div className="text-2xl mb-1">{info.emoji}</div>
                    <h5 className="font-medium font-arabic mb-1">{info.label}</h5>
                    {slotSettings.enabled ? (
                      <>
                        <div className="text-lg font-bold font-arabic mb-1">
                          {slotSettings.time}
                        </div>
                        <div className="text-xs text-muted-foreground font-arabic">
                          {editedSchedule.autoGenerate 
                            ? (isArabic ? 'إنشاء تلقائي' : 'Auto-generate')
                            : (isArabic ? 'يدوي' : 'Manual')
                          }
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground font-arabic">
                        {isArabic ? 'معطل' : 'Disabled'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={cn("text-xs text-muted-foreground font-arabic", isRTL && "text-right")}>
              {isArabic ? 'المنطقة الزمنية:' : 'Timezone:'} {editedSchedule.timezone}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}