import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Eye,
  RotateCcw,
  Check,
  Settings
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface QuickTheme {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ComponentType<any>;
  colors: Record<string, string>;
  description: string;
}

const quickThemes: QuickTheme[] = [
  {
    id: 'default',
    name: 'Default',
    nameAr: 'افتراضي',
    icon: Monitor,
    description: 'الثيم الافتراضي للنظام',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.25 0.08 250)',
      accent: 'oklch(0.65 0.15 45)',
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    nameAr: 'داكن',
    icon: Moon,
    description: 'ثيم داكن للاستخدام الليلي',
    colors: {
      background: 'oklch(0.08 0 0)',
      foreground: 'oklch(0.92 0 0)',
      primary: 'oklch(0.7 0.12 250)',
      accent: 'oklch(0.75 0.15 45)',
      card: 'oklch(0.12 0 0)',
      cardForeground: 'oklch(0.92 0 0)',
      secondary: 'oklch(0.18 0 0)',
      secondaryForeground: 'oklch(0.85 0 0)',
      muted: 'oklch(0.15 0 0)',
      mutedForeground: 'oklch(0.6 0 0)',
      border: 'oklch(0.22 0 0)',
    }
  },
  {
    id: 'light',
    name: 'Light',
    nameAr: 'فاتح',
    icon: Sun,
    description: 'ثيم فاتح للاستخدام النهاري',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.1 0 0)',
      primary: 'oklch(0.45 0.15 220)',
      accent: 'oklch(0.55 0.12 200)',
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    nameAr: 'تباين عالي',
    icon: Eye,
    description: 'ثيم عالي التباين لسهولة القراءة',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0 0 0)',
      primary: 'oklch(0.15 0 0)',
      accent: 'oklch(0.25 0 0)',
      border: 'oklch(0.7 0 0)',
    }
  }
];

export const QuickThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [originalTheme, setOriginalTheme] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save original theme on mount
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const saved = {
      background: root.getPropertyValue('--background').trim(),
      foreground: root.getPropertyValue('--foreground').trim(),
      primary: root.getPropertyValue('--primary').trim(),
      accent: root.getPropertyValue('--accent').trim(),
      card: root.getPropertyValue('--card').trim(),
      cardForeground: root.getPropertyValue('--card-foreground').trim(),
      secondary: root.getPropertyValue('--secondary').trim(),
      secondaryForeground: root.getPropertyValue('--secondary-foreground').trim(),
      muted: root.getPropertyValue('--muted').trim(),
      mutedForeground: root.getPropertyValue('--muted-foreground').trim(),
      border: root.getPropertyValue('--border').trim(),
    };
    setOriginalTheme(saved);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (theme: QuickTheme) => {
    const root = document.documentElement;
    
    // Apply the theme colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });

    setCurrentTheme(theme.id);
    setIsOpen(false);
    toast.success(`تم تطبيق ثيم "${theme.nameAr}"`);
  };

  const resetToOriginal = () => {
    const root = document.documentElement;
    
    // Restore original theme
    Object.entries(originalTheme).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });

    setCurrentTheme('default');
    setIsOpen(false);
    toast.success('تم استعادة الثيم الأصلي');
  };

  const getCurrentThemeInfo = () => {
    return quickThemes.find(theme => theme.id === currentTheme) || quickThemes[0];
  };

  const currentThemeInfo = getCurrentThemeInfo();
  const CurrentIcon = currentThemeInfo.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 h-9"
      >
        <Palette className="w-4 h-4" />
        <CurrentIcon className="w-3 h-3" />
        <span className="hidden sm:inline">{currentThemeInfo.nameAr}</span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" />
              اختيار الثيم السريع
            </CardTitle>
            <CardDescription className="text-sm">
              غيّر مظهر النظام بنقرة واحدة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Theme Options */}
            <div className="grid gap-2">
              {quickThemes.map(theme => {
                const IconComponent = theme.icon;
                const isActive = currentTheme === theme.id;
                
                return (
                  <Button
                    key={theme.id}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => applyTheme(theme)}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{theme.nameAr}</span>
                          {isActive && <Check className="w-3 h-3 text-green-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {theme.description}
                        </p>
                      </div>
                      {/* Color Preview */}
                      <div className="flex gap-1">
                        {Object.values(theme.colors).slice(0, 3).map((color, idx) => (
                          <div 
                            key={idx}
                            className="w-3 h-3 rounded-sm border border-border/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToOriginal}
                className="flex-1 gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                استعادة الأصلي
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full theme settings - could emit an event or use a callback
                  toast.info('سيتم إضافة رابط لإعدادات الثيم المتقدمة');
                }}
                className="flex-1 gap-2"
              >
                <Settings className="w-3 h-3" />
                إعدادات متقدمة
              </Button>
            </div>

            {/* Current Theme Info */}
            <div className="bg-muted/50 p-2 rounded text-xs">
              <div className="flex items-center gap-2 mb-1">
                <CurrentIcon className="w-3 h-3" />
                <span className="font-medium">الثيم الحالي: {currentThemeInfo.nameAr}</span>
              </div>
              <p className="text-muted-foreground">{currentThemeInfo.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickThemeSelector;