import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export interface ThemeSchedule {
  id: string;
  name: string;
  enabled: boolean;
  morningTheme: string;
  eveningTheme: string;
  morningTime: string; // HH:MM format
  eveningTime: string; // HH:MM format
  weekdays: number[]; // 0-6 (Sunday-Saturday)
  transition: 'instant' | 'gradual';
  transitionDuration: number; // minutes
}

export interface PresetTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  description: string;
  category: 'light' | 'dark' | 'auto';
}

export const presetThemes: PresetTheme[] = [
  {
    id: 'sabq-light',
    name: 'سبق النهاري',
    colors: {
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
    },
    description: 'الثيم الافتراضي المشرق',
    category: 'light'
  },
  {
    id: 'sabq-dark',
    name: 'سبق الليلي',
    colors: {
      primary: 'oklch(0.6 0.15 250)',
      primaryForeground: 'oklch(0.1 0 0)',
      secondary: 'oklch(0.15 0 0)',
      secondaryForeground: 'oklch(0.8 0 0)',
      accent: 'oklch(0.7 0.2 45)',
      accentForeground: 'oklch(0.1 0 0)',
      background: 'oklch(0.08 0 0)',
      foreground: 'oklch(0.9 0 0)',
      card: 'oklch(0.12 0 0)',
      cardForeground: 'oklch(0.9 0 0)',
      muted: 'oklch(0.15 0 0)',
      mutedForeground: 'oklch(0.6 0 0)',
      border: 'oklch(0.2 0 0)',
      destructive: 'oklch(0.65 0.3 25)',
      destructiveForeground: 'oklch(1 0 0)',
    },
    description: 'ثيم داكن مريح للعينين',
    category: 'dark'
  },
  {
    id: 'sabq-warm',
    name: 'سبق الدافئ',
    colors: {
      primary: 'oklch(0.4 0.12 20)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.92 0.01 30)',
      secondaryForeground: 'oklch(0.25 0.08 40)',
      accent: 'oklch(0.6 0.18 35)',
      accentForeground: 'oklch(1 0 0)',
      background: 'oklch(0.98 0.01 30)',
      foreground: 'oklch(0.2 0.02 30)',
      card: 'oklch(0.96 0.02 30)',
      cardForeground: 'oklch(0.2 0.02 30)',
      muted: 'oklch(0.93 0.02 30)',
      mutedForeground: 'oklch(0.4 0.05 30)',
      border: 'oklch(0.88 0.03 30)',
      destructive: 'oklch(0.6 0.25 20)',
      destructiveForeground: 'oklch(1 0 0)',
    },
    description: 'ثيم دافئ للقراءة المريحة',
    category: 'light'
  },
  {
    id: 'sabq-cool',
    name: 'سبق البارد',
    colors: {
      primary: 'oklch(0.55 0.2 220)',
      primaryForeground: 'oklch(0.1 0 0)',
      secondary: 'oklch(0.18 0.02 240)',
      secondaryForeground: 'oklch(0.8 0 0)',
      accent: 'oklch(0.65 0.25 200)',
      accentForeground: 'oklch(0.1 0 0)',
      background: 'oklch(0.12 0.02 240)',
      foreground: 'oklch(0.85 0.03 240)',
      card: 'oklch(0.15 0.02 240)',
      cardForeground: 'oklch(0.85 0.03 240)',
      muted: 'oklch(0.18 0.02 240)',
      mutedForeground: 'oklch(0.6 0.05 240)',
      border: 'oklch(0.25 0.03 240)',
      destructive: 'oklch(0.65 0.3 25)',
      destructiveForeground: 'oklch(1 0 0)',
    },
    description: 'ثيم بارد للتركيز العميق',
    category: 'dark'
  }
];

export function useThemeScheduler() {
  const { setTheme, applyThemeGradually } = useTheme();
  const [schedules, setSchedules] = useKV<ThemeSchedule[]>('theme-schedules', []);
  const [isSchedulerActive, setIsSchedulerActive] = useKV<boolean>('theme-scheduler-active', false);
  const [currentScheduledTheme, setCurrentScheduledTheme] = useState<string | null>(null);
  const [nextScheduledChange, setNextScheduledChange] = useState<{
    time: string;
    theme: string;
    period: string;
  } | null>(null);

  // Function to apply a theme from presets
  const applyScheduledTheme = (themeId: string, schedule: ThemeSchedule) => {
    const theme = presetThemes.find(t => t.id === themeId);
    if (!theme) return;

    if (schedule.transition === 'gradual') {
      applyThemeGradually(theme.colors, schedule.transitionDuration);
    } else {
      setTheme(theme.colors);
    }

    toast.success(`تم تطبيق ثيم ${theme.name} تلقائياً`, {
      description: `وفقاً لجدولة "${schedule.name}"`
    });
  };

  // Function to get the next scheduled change
  const getNextScheduledChange = () => {
    if (!isSchedulerActive || schedules.length === 0) return null;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay();

    const activeSchedule = schedules.find(schedule => 
      schedule.enabled && 
      schedule.weekdays.includes(currentDay)
    );

    if (!activeSchedule) return null;

    const morningTime = activeSchedule.morningTime;
    const eveningTime = activeSchedule.eveningTime;

    if (currentTime < morningTime) {
      return { time: morningTime, theme: activeSchedule.morningTheme, period: 'الصباح' };
    } else if (currentTime < eveningTime) {
      return { time: eveningTime, theme: activeSchedule.eveningTheme, period: 'المساء' };
    } else {
      // Next change is tomorrow morning
      return { time: morningTime, theme: activeSchedule.morningTheme, period: 'صباح الغد' };
    }
  };

  // Function to check and apply scheduled themes
  const checkSchedule = () => {
    if (!isSchedulerActive) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay();

    const activeSchedule = schedules.find(schedule => 
      schedule.enabled && 
      schedule.weekdays.includes(currentDay)
    );

    if (activeSchedule) {
      const morningTime = activeSchedule.morningTime;
      const eveningTime = activeSchedule.eveningTime;
      
      let shouldApplyTheme = null;
      
      // Determine which theme to apply based on time
      if (currentTime >= morningTime && currentTime < eveningTime) {
        shouldApplyTheme = activeSchedule.morningTheme;
      } else {
        shouldApplyTheme = activeSchedule.eveningTheme;
      }

      if (shouldApplyTheme && shouldApplyTheme !== currentScheduledTheme) {
        applyScheduledTheme(shouldApplyTheme, activeSchedule);
        setCurrentScheduledTheme(shouldApplyTheme);
      }
    }

    // Update next scheduled change
    const nextChange = getNextScheduledChange();
    setNextScheduledChange(nextChange);
  };

  // Function to manually test a schedule
  const testSchedule = (schedule: ThemeSchedule) => {
    const now = new Date();
    const morningTime = schedule.morningTime;
    const eveningTime = schedule.eveningTime;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let themeToTest;
    if (currentTime >= morningTime && currentTime < eveningTime) {
      themeToTest = schedule.morningTheme;
    } else {
      themeToTest = schedule.eveningTheme;
    }
    
    const theme = presetThemes.find(t => t.id === themeToTest);
    if (theme) {
      setTheme(theme.colors);
      toast.success(`تم تطبيق ثيم ${theme.name} للاختبار`);
    }
  };

  // Function to add a new schedule
  const addSchedule = (schedule: Omit<ThemeSchedule, 'id'>) => {
    const newSchedule: ThemeSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`
    };
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule.id;
  };

  // Function to update a schedule
  const updateSchedule = (scheduleId: string, updates: Partial<ThemeSchedule>) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, ...updates } : s
    ));
  };

  // Function to delete a schedule
  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  // Function to toggle schedule enabled state
  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Set up the checking interval
  useEffect(() => {
    // Check immediately
    checkSchedule();

    // Then check every minute
    const interval = setInterval(checkSchedule, 60000);

    return () => clearInterval(interval);
  }, [schedules, isSchedulerActive, currentScheduledTheme]);

  return {
    schedules,
    isSchedulerActive,
    setIsSchedulerActive,
    currentScheduledTheme,
    nextScheduledChange,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    testSchedule,
    checkSchedule,
    presetThemes
  };
}