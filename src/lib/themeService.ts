import { useKV } from '@github/spark/hooks';

export interface ThemeConfig {
  id: string;
  name: string;
  nameAr: string;
  colors: Record<string, string>;
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  preferences?: {
    autoDetectSystemTheme?: boolean;
    scheduleThemeChanges?: boolean;
    accessibilityMode?: boolean;
  };
  metadata?: {
    createdAt: string;
    updatedAt: string;
    author?: string;
    version?: string;
  };
}

export class ThemeService {
  private static instance: ThemeService;
  
  private constructor() {}
  
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  // Apply theme to document
  applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });

    // Apply typography if provided
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      if (theme.typography.fontSize) {
        root.style.setProperty('--user-font-scale', theme.typography.fontSize.toString());
      }
      if (theme.typography.lineHeight) {
        root.style.setProperty('--user-line-height-scale', theme.typography.lineHeight.toString());
      }
      if (theme.typography.letterSpacing) {
        root.style.setProperty('--user-letter-spacing', `${theme.typography.letterSpacing}em`);
      }
    }

    // Save as current theme
    localStorage.setItem('sabq-current-theme', JSON.stringify(theme));
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }

  // Get current theme from CSS variables
  getCurrentTheme(): ThemeConfig {
    const root = getComputedStyle(document.documentElement);
    
    const colors = {
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

    return {
      id: 'current',
      name: 'Current Theme',
      nameAr: 'الثيم الحالي',
      colors,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
  }

  // Create theme preset
  createPreset(name: string, nameAr: string, author?: string): ThemeConfig {
    const currentTheme = this.getCurrentTheme();
    
    return {
      ...currentTheme,
      id: `preset-${Date.now()}`,
      name,
      nameAr,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: author || 'مستخدم سبق الذكية',
        version: '1.0.0'
      }
    };
  }

  // Restore default theme
  restoreDefault(): void {
    const defaultTheme: ThemeConfig = {
      id: 'default',
      name: 'Sabq Default',
      nameAr: 'سبق الافتراضي',
      colors: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.15 0 0)',
        card: 'oklch(0.98 0 0)',
        cardForeground: 'oklch(0.15 0 0)',
        primary: 'oklch(0.25 0.08 250)',
        primaryForeground: 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0 0)',
        secondaryForeground: 'oklch(0.2 0 0)',
        accent: 'oklch(0.65 0.15 45)',
        accentForeground: 'oklch(1 0 0)',
        muted: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.45 0 0)',
        border: 'oklch(0.9 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        destructiveForeground: 'oklch(1 0 0)',
      }
    };

    this.applyTheme(defaultTheme);
  }

  // Load saved theme on app start
  loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem('sabq-current-theme');
      if (saved) {
        const theme: ThemeConfig = JSON.parse(saved);
        this.applyTheme(theme);
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
      this.restoreDefault();
    }
  }

  // Export theme as JSON
  exportTheme(theme: ThemeConfig): string {
    return JSON.stringify(theme, null, 2);
  }

  // Import theme from JSON
  importTheme(jsonString: string): ThemeConfig {
    try {
      const theme: ThemeConfig = JSON.parse(jsonString);
      
      // Validate required fields
      if (!theme.colors || !theme.name) {
        throw new Error('Invalid theme format: missing required fields');
      }

      // Add metadata if missing
      if (!theme.metadata) {
        theme.metadata = {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }

  // Generate CSS variables string
  generateCSSVariables(theme: ThemeConfig): string {
    const cssLines = Object.entries(theme.colors).map(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  --${cssVar}: ${value};`;
    });

    return `:root {\n${cssLines.join('\n')}\n}`;
  }

  // Auto-detect system theme preference
  setupSystemThemeDetection(callback: (isDark: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    
    // Initial call
    callback(mediaQuery.matches);

    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}

// Singleton instance
export const themeService = ThemeService.getInstance();

// React hook for theme management
export const useThemeManager = () => {
  const [savedThemes, setSavedThemes] = useKV<ThemeConfig[]>('sabq-saved-themes', []);
  const [currentThemeId, setCurrentThemeId] = useKV<string>('sabq-current-theme-id', 'default');

  const saveTheme = (theme: ThemeConfig) => {
    setSavedThemes(prev => {
      const exists = prev.find(t => t.id === theme.id);
      if (exists) {
        return prev.map(t => t.id === theme.id ? theme : t);
      }
      return [...prev, theme];
    });
  };

  const deleteTheme = (themeId: string) => {
    setSavedThemes(prev => prev.filter(t => t.id !== themeId));
  };

  const applyTheme = (theme: ThemeConfig) => {
    themeService.applyTheme(theme);
    setCurrentThemeId(theme.id);
  };

  const createPreset = (name: string, nameAr: string, author?: string) => {
    const preset = themeService.createPreset(name, nameAr, author);
    saveTheme(preset);
    return preset;
  };

  return {
    savedThemes,
    currentThemeId,
    saveTheme,
    deleteTheme,
    applyTheme,
    createPreset,
    restoreDefault: () => {
      themeService.restoreDefault();
      setCurrentThemeId('default');
    },
    getCurrentTheme: () => themeService.getCurrentTheme(),
    exportTheme: themeService.exportTheme,
    importTheme: themeService.importTheme,
    generateCSSVariables: themeService.generateCSSVariables,
  };
};