import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Palette,
  Timer
} from '@phosphor-icons/react';
import { useThemeScheduler } from '@/hooks/useThemeScheduler';

export function ThemeScheduleStatus() {
  const { 
    isSchedulerActive, 
    nextScheduledChange, 
    schedules,
    setIsSchedulerActive 
  } = useThemeScheduler();

  if (!isSchedulerActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSchedulerActive(true)}
        className="gap-2 h-8 text-xs"
      >
        <Clock className="w-3 h-3" />
        تفعيل الجدولة
      </Button>
    );
  }

  const activeSchedulesCount = schedules.filter(s => s.enabled).length;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className="gap-1 h-6 text-xs px-2"
      >
        <Timer className="w-3 h-3" />
        جدولة نشطة ({activeSchedulesCount})
      </Badge>
      
      {nextScheduledChange && (
        <Badge 
          variant="outline" 
          className="gap-1 h-6 text-xs px-2"
        >
          {nextScheduledChange.period === 'الصباح' ? (
            <Sunrise className="w-3 h-3 text-amber-500" />
          ) : nextScheduledChange.period === 'المساء' ? (
            <Sunset className="w-3 h-3 text-purple-500" />
          ) : (
            <Moon className="w-3 h-3 text-blue-500" />
          )}
          {nextScheduledChange.time}
        </Badge>
      )}
    </div>
  );
}