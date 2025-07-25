import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';

export interface FocusModeSettings {
  theme: 'light' | 'dark' | 'sepia' | 'contrast';
  fontSize: number; // 14-24px
  lineHeight: number; // 1.4-2.0
  maxWidth: number; // 600-1200px
  showWordCount: boolean;
  showReadingTime: boolean;
  enableTypewriter: boolean;
  hideToolbar: boolean;
  backgroundNoise: 'none' | 'rain' | 'cafe' | 'forest';
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  enableZenMode: boolean; // Extra minimal mode
  highlightCurrentLine: boolean;
  showProgress: boolean;
  customFont?: string;
}

const DEFAULT_SETTINGS: FocusModeSettings = {
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 800,
  showWordCount: true,
  showReadingTime: true,
  enableTypewriter: false,
  hideToolbar: false,
  backgroundNoise: 'none',
  autoSave: true,
  autoSaveInterval: 2,
  enableZenMode: false,
  highlightCurrentLine: false,
  showProgress: true
};

export function useFocusModeSettings() {
  const [settings, setSettings] = useKV<FocusModeSettings>('focus-mode-settings', DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);

  // Update CSS variables when settings change
  useEffect(() => {
    if (isActive) {
      const root = document.documentElement;
      
      // Apply theme
      root.setAttribute('data-focus-theme', settings.theme);
      
      // Apply typography settings
      root.style.setProperty('--focus-font-size', `${settings.fontSize}px`);
      root.style.setProperty('--focus-line-height', settings.lineHeight.toString());
      root.style.setProperty('--focus-max-width', `${settings.maxWidth}px`);
      
      // Apply custom font if set
      if (settings.customFont) {
        root.style.setProperty('--focus-font-family', settings.customFont);
      }
      
      // Apply zen mode class
      if (settings.enableZenMode) {
        document.body.classList.add('focus-zen-mode');
      } else {
        document.body.classList.remove('focus-zen-mode');
      }
    }
  }, [settings, isActive]);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!isActive) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T: Toggle typewriter mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        updateSetting('enableTypewriter', !settings.enableTypewriter);
      }
      
      // Ctrl/Cmd + Shift + H: Toggle toolbar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        updateSetting('hideToolbar', !settings.hideToolbar);
      }
      
      // Ctrl/Cmd + Shift + Z: Toggle zen mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        updateSetting('enableZenMode', !settings.enableZenMode);
      }
      
      // Ctrl/Cmd + Plus/Minus: Font size
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        updateSetting('fontSize', Math.min(24, settings.fontSize + 1));
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        updateSetting('fontSize', Math.max(14, settings.fontSize - 1));
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isActive, settings]);

  const updateSetting = useCallback(<K extends keyof FocusModeSettings>(
    key: K, 
    value: FocusModeSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const updateSettings = useCallback((newSettings: Partial<FocusModeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const activateFocusMode = useCallback(() => {
    setIsActive(true);
    document.body.classList.add('focus-mode-active');
  }, []);

  const deactivateFocusMode = useCallback(() => {
    setIsActive(false);
    document.body.classList.remove('focus-mode-active', 'focus-zen-mode');
    
    // Reset CSS variables
    const root = document.documentElement;
    root.removeAttribute('data-focus-theme');
    root.style.removeProperty('--focus-font-size');
    root.style.removeProperty('--focus-line-height');
    root.style.removeProperty('--focus-max-width');
    root.style.removeProperty('--focus-font-family');
  }, []);

  // Auto-save settings validation
  const isValidAutoSaveInterval = settings.autoSaveInterval >= 1 && settings.autoSaveInterval <= 30;
  const isValidFontSize = settings.fontSize >= 14 && settings.fontSize <= 24;
  const isValidLineHeight = settings.lineHeight >= 1.2 && settings.lineHeight <= 2.5;
  const isValidMaxWidth = settings.maxWidth >= 400 && settings.maxWidth <= 1400;

  return {
    settings,
    isActive,
    updateSetting,
    updateSettings,
    resetToDefaults,
    activateFocusMode,
    deactivateFocusMode,
    validation: {
      isValidAutoSaveInterval,
      isValidFontSize,
      isValidLineHeight,
      isValidMaxWidth
    }
  };
}

// Helper hook for focus mode statistics
export function useFocusModeStats(content: string) {
  const [startTime] = useState(Date.now());
  const [wordGoal, setWordGoal] = useState(500);

  const stats = {
    wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
    characterCount: content.length,
    characterCountNoSpaces: content.replace(/\s/g, '').length,
    paragraphCount: content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
    readingTime: Math.ceil(content.trim().split(/\s+/).length / 200), // Arabic reading speed
    writingTime: Math.floor((Date.now() - startTime) / 60000), // minutes
    progress: Math.min(100, (content.trim().split(/\s+/).length / wordGoal) * 100)
  };

  return {
    stats,
    wordGoal,
    setWordGoal
  };
}