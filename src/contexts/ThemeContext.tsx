import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  colors: ThemeColors;
  category: 'editorial' | 'business' | 'modern' | 'classic';
}

export interface ThemeSettings {
  activePreset: string;
  customColors: ThemeColors;
  radius: number;
  fontScale: number;
  lineHeightScale: number;
  letterSpacing: number;
}

const defaultColors: ThemeColors = {
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
};

export const themePresets: ThemePreset[] = [
  {
    id: 'sabq-editorial',
    name: 'Sabq Editorial',
    nameAr: 'سبق التحريري',
    description: 'الهوية البصرية الأساسية لصحيفة سبق',
    category: 'editorial',
    colors: defaultColors,
  },
  {
    id: 'midnight-professional',
    name: 'Midnight Professional',
    nameAr: 'احترافي داكن',
    description: 'ثيم داكن أنيق للقراءة المريحة',
    category: 'modern',
    colors: {
      primary: 'oklch(0.7 0.15 200)',
      primaryForeground: 'oklch(0.1 0 0)',
      secondary: 'oklch(0.15 0 0)',
      secondaryForeground: 'oklch(0.8 0 0)',
      accent: 'oklch(0.6 0.2 60)',
      accentForeground: 'oklch(0.1 0 0)',
      background: 'oklch(0.05 0 0)',
      foreground: 'oklch(0.9 0 0)',
      card: 'oklch(0.08 0 0)',
      cardForeground: 'oklch(0.9 0 0)',
      muted: 'oklch(0.12 0 0)',
      mutedForeground: 'oklch(0.6 0 0)',
      border: 'oklch(0.2 0 0)',
      destructive: 'oklch(0.65 0.3 25)',
      destructiveForeground: 'oklch(1 0 0)',
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'ذهبي ملكي',
    description: 'تصميم فاخر بلمسات ذهبية',
    category: 'business',
    colors: {
      primary: 'oklch(0.2 0.1 280)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.93 0.02 50)',
      secondaryForeground: 'oklch(0.25 0.05 280)',
      accent: 'oklch(0.7 0.2 50)',
      accentForeground: 'oklch(0.1 0 0)',
      background: 'oklch(0.99 0.01 50)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.97 0.01 50)',
      cardForeground: 'oklch(0.1 0 0)',
      muted: 'oklch(0.94 0.02 50)',
      mutedForeground: 'oklch(0.4 0.05 280)',
      border: 'oklch(0.88 0.03 50)',
      destructive: 'oklch(0.6 0.25 20)',
      destructiveForeground: 'oklch(1 0 0)',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    nameAr: 'أزرق المحيط',
    description: 'ألوان مستوحاة من المحيط',
    category: 'modern',
    colors: {
      primary: 'oklch(0.45 0.15 220)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.92 0.02 220)',
      secondaryForeground: 'oklch(0.2 0.05 220)',
      accent: 'oklch(0.6 0.18 180)',
      accentForeground: 'oklch(1 0 0)',
      background: 'oklch(0.99 0 0)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.97 0.01 220)',
      cardForeground: 'oklch(0.1 0 0)',
      muted: 'oklch(0.94 0.02 220)',
      mutedForeground: 'oklch(0.4 0.05 220)',
      border: 'oklch(0.88 0.03 220)',
      destructive: 'oklch(0.6 0.25 15)',
      destructiveForeground: 'oklch(1 0 0)',
    },
  },
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    nameAr: 'ترابي دافئ',
    description: 'ألوان طبيعية دافئة ومريحة',
    category: 'classic',
    colors: {
      primary: 'oklch(0.35 0.12 40)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.91 0.03 40)',
      secondaryForeground: 'oklch(0.25 0.08 40)',
      accent: 'oklch(0.65 0.15 25)',
      accentForeground: 'oklch(1 0 0)',
      background: 'oklch(0.98 0.01 40)',
      foreground: 'oklch(0.15 0.02 40)',
      card: 'oklch(0.96 0.02 40)',
      cardForeground: 'oklch(0.15 0.02 40)',
      muted: 'oklch(0.93 0.03 40)',
      mutedForeground: 'oklch(0.4 0.08 40)',
      border: 'oklch(0.87 0.04 40)',
      destructive: 'oklch(0.6 0.25 20)',
      destructiveForeground: 'oklch(1 0 0)',
    },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    nameAr: 'نعناع منعش',
    description: 'ألوان منعشة مع لمسات خضراء',
    category: 'modern',
    colors: {
      primary: 'oklch(0.4 0.12 160)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.92 0.02 160)',
      secondaryForeground: 'oklch(0.2 0.05 160)',
      accent: 'oklch(0.65 0.15 140)',
      accentForeground: 'oklch(1 0 0)',
      background: 'oklch(0.99 0 0)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.97 0.01 160)',
      cardForeground: 'oklch(0.1 0 0)',
      muted: 'oklch(0.94 0.02 160)',
      mutedForeground: 'oklch(0.4 0.05 160)',
      border: 'oklch(0.88 0.03 160)',
      destructive: 'oklch(0.6 0.25 15)',
      destructiveForeground: 'oklch(1 0 0)',
    },
  },
];

const defaultThemeSettings: ThemeSettings = {
  activePreset: 'sabq-editorial',
  customColors: defaultColors,
  radius: 0.5,
  fontScale: 1,
  lineHeightScale: 1.5,
  letterSpacing: 0,
};

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  applyPreset: (presetId: string) => void;
  getCurrentColors: () => ThemeColors;
  resetToDefault: () => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => boolean;
  setTheme: (colors: ThemeColors) => void;
  applyThemeGradually: (colors: ThemeColors, durationMinutes: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useKV<ThemeSettings>(
    'sabq-theme-settings',
    defaultThemeSettings
  );

  const applyCSSVariables = (colors: ThemeColors, radius: number, fontScale: number, lineHeightScale: number, letterSpacing: number) => {
    try {
      const root = document.documentElement;
      
      // Ensure colors exists and fallback to default if needed
      const safeColors = colors || defaultColors;
      
      // Apply color variables with safety checks
      Object.entries(safeColors).forEach(([key, value]) => {
        if (key && value && typeof value === 'string') {
          const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(cssVar, value);
        }
      });
      
      // Apply design system variables with fallbacks
      root.style.setProperty('--radius', `${radius || 0.5}rem`);
      root.style.setProperty('--user-font-scale', (fontScale || 1).toString());
      root.style.setProperty('--user-line-height-scale', (lineHeightScale || 1.5).toString());
      root.style.setProperty('--user-letter-spacing', `${letterSpacing || 0}em`);
    } catch (error) {
      console.warn('CSS variable application error:', error);
    }
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => {
      const current = prev || defaultThemeSettings;
      const updated = { 
        ...current, 
        ...newSettings,
        customColors: newSettings.customColors || current.customColors || defaultColors
      };
      return updated;
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (preset) {
      updateThemeSettings({
        activePreset: presetId,
        customColors: preset.colors,
      });
    }
  };

  const getCurrentColors = (): ThemeColors => {
    const preset = themePresets.find(p => p.id === themeSettings.activePreset);
    const customColors = themeSettings.customColors || defaultColors;
    const presetColors = preset?.colors || defaultColors;
    
    return themeSettings.activePreset === 'custom' 
      ? customColors 
      : presetColors;
  };

  const resetToDefault = () => {
    setThemeSettings(defaultThemeSettings);
  };

  const exportTheme = (): string => {
    return JSON.stringify(themeSettings, null, 2);
  };

  const importTheme = (themeData: string): boolean => {
    try {
      const imported = JSON.parse(themeData) as ThemeSettings;
      
      // Validate the structure
      if (typeof imported.activePreset === 'string' && 
          typeof imported.customColors === 'object' &&
          typeof imported.radius === 'number') {
        setThemeSettings(imported);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const setTheme = (colors: ThemeColors) => {
    updateThemeSettings({
      activePreset: 'custom',
      customColors: colors,
    });
  };

  const applyThemeGradually = (colors: ThemeColors, durationMinutes: number) => {
    const steps = 20;
    const stepDuration = (durationMinutes * 60 * 1000) / steps;
    
    const currentColors = getCurrentColors();
    const targetColors = colors;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      const interpolatedColors = interpolateColors(currentColors, targetColors, progress);
      setTheme(interpolatedColors);
      
      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  };

  const interpolateColors = (from: ThemeColors, to: ThemeColors, progress: number): ThemeColors => {
    // Simple color interpolation - in production, use proper color interpolation
    return Object.keys(from).reduce((acc, key) => {
      const fromColor = from[key as keyof ThemeColors];
      const toColor = to[key as keyof ThemeColors];
      acc[key as keyof ThemeColors] = progress > 0.5 ? toColor : fromColor;
      return acc;
    }, {} as ThemeColors);
  };

  // Apply theme changes to CSS variables
  useEffect(() => {
    try {
      const settings = themeSettings || defaultThemeSettings;
      const colors = getCurrentColors();
      
      // Ensure colors is valid
      if (colors && typeof colors === 'object') {
        applyCSSVariables(
          colors,
          settings.radius || 0.5,
          settings.fontScale || 1,
          settings.lineHeightScale || 1.5,
          settings.letterSpacing || 0
        );
      }
    } catch (error) {
      console.warn('Theme application error:', error);
      // Fallback to default colors
      applyCSSVariables(
        defaultColors,
        0.5,
        1,
        1.5,
        0
      );
    }
  }, [themeSettings]);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Ensure we have valid theme settings on mount
      if (!themeSettings) {
        setThemeSettings(defaultThemeSettings);
      } else {
        // Apply theme immediately on mount
        const colors = getCurrentColors();
        applyCSSVariables(
          colors,
          themeSettings.radius || 0.5,
          themeSettings.fontScale || 1,
          themeSettings.lineHeightScale || 1.5,
          themeSettings.letterSpacing || 0
        );
      }
    } catch (error) {
      console.warn('Theme initialization error:', error);
      setThemeSettings(defaultThemeSettings);
    }
  }, []); // Run only on mount

  const contextValue: ThemeContextType = {
    themeSettings,
    updateThemeSettings,
    applyPreset,
    getCurrentColors,
    resetToDefault,
    exportTheme,
    importTheme,
    setTheme,
    applyThemeGradually,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};