import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

interface TypographySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineHeight: 'compact' | 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'tight' | 'normal' | 'wide';
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold';
}

interface TypographyContextType {
  settings: TypographySettings;
  updateSettings: (newSettings: Partial<TypographySettings>) => void;
  resetSettings: () => void;
  applyToClass: (element: 'heading' | 'body' | 'summary' | 'caption') => string;
}

const defaultSettings: TypographySettings = {
  fontSize: 'medium',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  fontWeight: 'normal'
};

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export function TypographyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useKV<TypographySettings>('typography-settings', defaultSettings);

  const updateSettings = (newSettings: Partial<TypographySettings>) => {
    setSettings(current => ({ ...current, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Generate appropriate CSS classes based on element type and user settings
  const applyToClass = (element: 'heading' | 'body' | 'summary' | 'caption'): string => {
    const baseClasses = ['font-arabic'];
    
    // Font size mapping
    const fontSizeMap = {
      heading: {
        small: 'text-lg md:text-xl lg:text-2xl',
        medium: 'text-xl md:text-2xl lg:text-3xl',
        large: 'text-2xl md:text-3xl lg:text-4xl',
        'extra-large': 'text-3xl md:text-4xl lg:text-5xl'
      },
      body: {
        small: 'text-sm md:text-base',
        medium: 'text-base md:text-lg',
        large: 'text-lg md:text-xl',
        'extra-large': 'text-xl md:text-2xl'
      },
      summary: {
        small: 'text-xs md:text-sm',
        medium: 'text-sm md:text-base',
        large: 'text-base md:text-lg',
        'extra-large': 'text-lg md:text-xl'
      },
      caption: {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base',
        'extra-large': 'text-lg'
      }
    };

    // Line height mapping - different optimizations for each element type
    const lineHeightMap = {
      heading: {
        compact: 'leading-tight',
        normal: 'leading-snug',
        relaxed: 'leading-normal',
        loose: 'leading-relaxed'
      },
      body: {
        compact: 'leading-normal',
        normal: 'leading-relaxed',
        relaxed: 'leading-loose',
        loose: 'leading-10'
      },
      summary: {
        compact: 'leading-tight',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose'
      },
      caption: {
        compact: 'leading-tight',
        normal: 'leading-snug',
        relaxed: 'leading-normal',
        loose: 'leading-relaxed'
      }
    };

    // Letter spacing mapping - Arabic needs different spacing than Latin
    const letterSpacingMap = {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide'
    };

    // Font weight mapping
    const fontWeightMap = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold'
    };

    // Apply the appropriate classes
    baseClasses.push(fontSizeMap[element][settings.fontSize]);
    baseClasses.push(lineHeightMap[element][settings.lineHeight]);
    baseClasses.push(letterSpacingMap[settings.letterSpacing]);
    
    // Apply font weight differently for headings vs body text
    if (element === 'heading') {
      baseClasses.push(settings.fontWeight === 'light' ? 'font-medium' : 
                       settings.fontWeight === 'normal' ? 'font-semibold' :
                       settings.fontWeight === 'medium' ? 'font-bold' : 'font-bold');
    } else {
      baseClasses.push(fontWeightMap[settings.fontWeight]);
    }

    // Special RTL optimizations for Arabic text
    baseClasses.push('rtl:text-right ltr:text-left');
    
    return baseClasses.join(' ');
  };

  // Apply global typography settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties for dynamic typography
    root.style.setProperty('--user-font-scale', 
      settings.fontSize === 'small' ? '0.875' :
      settings.fontSize === 'medium' ? '1' :
      settings.fontSize === 'large' ? '1.125' : '1.25'
    );
    
    root.style.setProperty('--user-line-height-scale',
      settings.lineHeight === 'compact' ? '1.25' :
      settings.lineHeight === 'normal' ? '1.5' :
      settings.lineHeight === 'relaxed' ? '1.75' : '2'
    );
    
    root.style.setProperty('--user-letter-spacing',
      settings.letterSpacing === 'tight' ? '-0.025em' :
      settings.letterSpacing === 'normal' ? '0' : '0.025em'
    );

    // Add global class for current settings
    root.className = `typography-${settings.fontSize} line-${settings.lineHeight} spacing-${settings.letterSpacing} weight-${settings.fontWeight}`;
  }, [settings]);

  return (
    <TypographyContext.Provider value={{ settings, updateSettings, resetSettings, applyToClass }}>
      {children}
    </TypographyContext.Provider>
  );
}

export function useTypography() {
  const context = useContext(TypographyContext);
  if (context === undefined) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
}