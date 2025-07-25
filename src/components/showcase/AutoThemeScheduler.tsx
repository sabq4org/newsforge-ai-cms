import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Sun, 
  Moon, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Palette,
  Timer,
  Sunrise,
  Sunset,
  Save
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useThemeScheduler, ThemeSchedule } from '@/hooks/useThemeScheduler';

export function AutoThemeScheduler() {
  const {
    schedules,
    isSchedulerActive,
    setIsSchedulerActive,
    nextScheduledChange,
    addSchedule,
    deleteSchedule,
    toggleSchedule,
    testSchedule,
    presetThemes
  } = useThemeScheduler();
  
  const [editingSchedule, setEditingSchedule] = useState<ThemeSchedule | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New schedule form state
  const [newSchedule, setNewSchedule] = useState<Partial<ThemeSchedule>>({
    name: '',
    enabled: true,
    morningTheme: 'sabq-light',
    eveningTheme: 'sabq-dark',
    morningTime: '06:00',
    eveningTime: '18:00',
    weekdays: [1, 2, 3, 4, 5], // Monday to Friday
    transition: 'instant',
    transitionDuration: 5
  });

  const weekdayNames = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];

  const handleCreateSchedule = () => {
    if (!newSchedule.name?.trim()) {
      toast.error('يرجى إدخال اسم الجدولة');
      return;
    }

    const scheduleData = {
      name: newSchedule.name,
      enabled: newSchedule.enabled || true,
      morningTheme: newSchedule.morningTheme || 'sabq-light',
      eveningTheme: newSchedule.eveningTheme || 'sabq-dark',
      morningTime: newSchedule.morningTime || '06:00',
      eveningTime: newSchedule.eveningTime || '18:00',
      weekdays: newSchedule.weekdays || [1, 2, 3, 4, 5],
      transition: newSchedule.transition || 'instant',
      transitionDuration: newSchedule.transitionDuration || 5
    };

    addSchedule(scheduleData);
    setShowCreateForm(false);
    setNewSchedule({
      name: '',
      enabled: true,
      morningTheme: 'sabq-light',
      eveningTheme: 'sabq-dark',
      morningTime: '06:00',
      eveningTime: '18:00',
      weekdays: [1, 2, 3, 4, 5],
      transition: 'instant',
      transitionDuration: 5
    });

    toast.success('تم إنشاء جدولة الثيم بنجاح');
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    toast.success('تم حذف الجدولة');
  };

  const handleToggleSchedule = (scheduleId: string) => {
    toggleSchedule(scheduleId);
  };

  const handleTestSchedule = (schedule: ThemeSchedule) => {
    testSchedule(schedule);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">جدولة الثيمات التلقائية</h1>
          <p className="text-muted-foreground mt-2">
            قم بجدولة تغيير الثيمات تلقائياً حسب الوقت والأيام المحددة
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            الوقت الحالي: <span className="font-mono">{getCurrentTime()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={isSchedulerActive}
              onCheckedChange={setIsSchedulerActive}
            />
            <Label>تفعيل الجدولة التلقائية</Label>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isSchedulerActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {isSchedulerActive ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold">
                  {isSchedulerActive ? 'الجدولة نشطة' : 'الجدولة متوقفة'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSchedulerActive 
                    ? `${schedules.filter(s => s.enabled).length} جدولة نشطة من أصل ${schedules.length}`
                    : 'يمكنك تفعيل الجدولة التلقائية من المفتاح أعلاه'
                  }
                </p>
              </div>
            </div>
            
            {nextScheduledChange && (
              <div className="text-right">
                <p className="text-sm font-medium">التغيير القادم</p>
                <p className="text-sm text-muted-foreground">
                  {nextScheduledChange.period} في {nextScheduledChange.time}
                </p>
                <Badge variant="outline" className="mt-1">
                  {presetThemes.find(t => t.id === nextScheduledChange.theme)?.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => handleToggleSchedule(schedule.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {weekdayNames.filter((_, i) => schedule.weekdays.includes(i)).join('، ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestSchedule(schedule)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    اختبار
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSchedule(schedule)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">الصباح ({schedule.morningTime}):</span>
                  <Badge variant="outline">
                    {presetThemes.find(t => t.id === schedule.morningTheme)?.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">المساء ({schedule.eveningTime}):</span>
                  <Badge variant="outline">
                    {presetThemes.find(t => t.id === schedule.eveningTheme)?.name}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span>الانتقال: {schedule.transition === 'instant' ? 'فوري' : 'تدريجي'}</span>
                {schedule.transition === 'gradual' && (
                  <span>المدة: {schedule.transitionDuration} دقيقة</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {schedules.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">لا توجد جدولات</h3>
              <p className="text-muted-foreground mb-4">
                قم بإنشاء جدولة جديدة لتغيير الثيمات تلقائياً
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Clock className="w-4 h-4 mr-2" />
                إنشاء جدولة جديدة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Schedule Button */}
      {schedules.length > 0 && (
        <Button onClick={() => setShowCreateForm(true)} className="w-full">
          <Clock className="w-4 h-4 mr-2" />
          إنشاء جدولة جديدة
        </Button>
      )}

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء جدولة جديدة</CardTitle>
            <CardDescription>
              قم بتكوين جدولة تلقائية لتغيير الثيمات حسب الوقت
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم الجدولة</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: جدولة المكتب"
                />
              </div>
              
              <div className="space-y-2">
                <Label>نوع الانتقال</Label>
                <Select
                  value={newSchedule.transition}
                  onValueChange={(value: 'instant' | 'gradual') => 
                    setNewSchedule(prev => ({ ...prev, transition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">فوري</SelectItem>
                    <SelectItem value="gradual">تدريجي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newSchedule.transition === 'gradual' && (
              <div className="space-y-2">
                <Label>مدة الانتقال (بالدقائق)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={newSchedule.transitionDuration}
                  onChange={(e) => setNewSchedule(prev => ({ 
                    ...prev, 
                    transitionDuration: parseInt(e.target.value) || 5 
                  }))}
                />
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  إعدادات الصباح
                </h4>
                
                <div className="space-y-2">
                  <Label>وقت بداية الثيم الصباحي</Label>
                  <Input
                    type="time"
                    value={newSchedule.morningTime}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, morningTime: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>الثيم الصباحي</Label>
                  <Select
                    value={newSchedule.morningTheme}
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, morningTheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-purple-500" />
                  إعدادات المساء
                </h4>
                
                <div className="space-y-2">
                  <Label>وقت بداية الثيم المسائي</Label>
                  <Input
                    type="time"
                    value={newSchedule.eveningTime}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, eveningTime: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>الثيم المسائي</Label>
                  <Select
                    value={newSchedule.eveningTheme}
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, eveningTheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>الأيام النشطة</Label>
              <div className="grid grid-cols-7 gap-2">
                {weekdayNames.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Switch
                      checked={newSchedule.weekdays?.includes(index) || false}
                      onCheckedChange={(checked) => {
                        setNewSchedule(prev => ({
                          ...prev,
                          weekdays: checked
                            ? [...(prev.weekdays || []), index]
                            : (prev.weekdays || []).filter(d => d !== index)
                        }));
                      }}
                    />
                    <Label className="text-xs">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateSchedule} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                حفظ الجدولة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Schedule Modal would go here */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>تعديل جدولة "{editingSchedule.name}"</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Edit form would be implemented here */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">سيتم إضافة نموذج التعديل قريباً</p>
                <Button 
                  onClick={() => setEditingSchedule(null)}
                  className="mt-4"
                >
                  إغلاق
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}