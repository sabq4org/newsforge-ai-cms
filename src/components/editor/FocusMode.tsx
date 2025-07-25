import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useFocusModeSettings, useFocusModeStats } from '@/hooks/useFocusModeSettings';
import { cn } from '@/lib/utils';
import { 
  X, 
  Eye, 
  FloppyDisk, 
  PaperPlaneTilt, 
  MagicWand,
  Gear,
  Moon,
  Sun,
  Monitor,
  TextT,
  Lightning,
  Minus,
  Plus,
  ArrowsOut,
  Sidebar,
  TextAlignRight,
  TextAlignLeft,
  TextAlignCenter,
  Target,
  Timer,
  ChartLine
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FocusModeProps {
  initialTitle?: string;
  initialContent?: string;
  onSave?: (data: { title: string; content: string }) => void;
  onExit?: () => void;
  onPreview?: (data: { title: string; content: string }) => void;
}

export function FocusMode({ 
  initialTitle = '', 
  initialContent = '', 
  onSave, 
  onExit, 
  onPreview 
}: FocusModeProps) {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const { 
    settings, 
    isActive, 
    updateSetting, 
    activateFocusMode, 
    deactivateFocusMode 
  } = useFocusModeSettings();
  
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';
  
  // Content state
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Get writing statistics
  const { stats, wordGoal, setWordGoal } = useFocusModeStats(content);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  
  // Activate focus mode on mount
  useEffect(() => {
    activateFocusMode();
    return () => deactivateFocusMode();
  }, [activateFocusMode, deactivateFocusMode]);
  
  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave && hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, settings.autoSaveInterval * 60 * 1000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, hasUnsavedChanges, settings.autoSave, settings.autoSaveInterval]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Ctrl/Cmd + Enter for preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePreview();
      }
      
      // Escape to exit focus mode
      if (e.key === 'Escape' && !showSettings) {
        handleExit();
      }
      
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      
      // Ctrl/Cmd + Shift + P for settings
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowSettings(!showSettings);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showSettings]);
  
  // Track changes
  useEffect(() => {
    if (title !== initialTitle || content !== initialContent) {
      setHasUnsavedChanges(true);
    }
  }, [title, content, initialTitle, initialContent]);
  
  const handleAutoSave = () => {
    if (hasUnsavedChanges && onSave) {
      onSave({ title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('تم الحفظ التلقائي', { duration: 1500 });
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave({ title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('تم حفظ المقال بنجاح');
    }
  };
  
  const handlePreview = () => {
    if (onPreview) {
      onPreview({ title, content });
    }
    setIsPreviewMode(!isPreviewMode);
  };
  
  const handleExit = () => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('لديك تغييرات غير محفوظة. هل تريد المغادرة؟');
      if (!confirmExit) return;
    }
    
    if (onExit) {
      onExit();
    }
  };
  
  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.15 0 0)',
        card: 'oklch(0.98 0 0)',
        muted: 'oklch(0.95 0 0)'
      },
      dark: {
        background: 'oklch(0.08 0 0)',
        foreground: 'oklch(0.9 0 0)',
        card: 'oklch(0.12 0 0)',
        muted: 'oklch(0.15 0 0)'
      },
      sepia: {
        background: 'oklch(0.95 0.02 85)',
        foreground: 'oklch(0.2 0.02 85)',
        card: 'oklch(0.92 0.02 85)',
        muted: 'oklch(0.88 0.02 85)'
      },
      contrast: {
        background: 'oklch(0 0 0)',
        foreground: 'oklch(1 0 0)',
        card: 'oklch(0.05 0 0)',
        muted: 'oklch(0.1 0 0)'
      }
    };
    
    return themes[settings.theme];
  };
  
  const themeColors = getThemeStyles();
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col transition-all duration-300",
        isFullscreen && "bg-black"
      )}
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.foreground,
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* Top Toolbar */}
      {!settings.hideToolbar && (
        <div 
          className="flex items-center justify-between p-4 border-b transition-all duration-300"
          style={{ 
            backgroundColor: themeColors.card,
            borderColor: themeColors.muted
          }}
        >
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="gap-2"
            >
              <FloppyDisk className="w-4 h-4" />
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreview}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {isArabic ? 'معاينة' : 'Preview'}
            </Button>
          </div>
          
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            {/* Statistics */}
            {(settings.showWordCount || settings.showReadingTime) && (
              <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                {settings.showWordCount && (
                  <span>{stats.wordCount} {isArabic ? 'كلمة' : 'words'}</span>
                )}
                {settings.showReadingTime && (
                  <span>{stats.readingTime} {isArabic ? 'دقيقة قراءة' : 'min read'}</span>
                )}
                <span>{stats.characterCount} {isArabic ? 'حرف' : 'chars'}</span>
                {settings.showProgress && (
                  <span>{stats.progress.toFixed(0)}% {isArabic ? 'من الهدف' : 'of goal'}</span>
                )}
              </div>
            )}
            
            {/* Last saved indicator */}
            {lastSaved && (
              <div className="text-xs text-muted-foreground">
                {isArabic ? 'آخر حفظ:' : 'Saved:'} {lastSaved.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US')}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Gear className="w-4 h-4" />
              {isArabic ? 'إعدادات' : 'Settings'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="p-4 border-b"
          style={{ 
            backgroundColor: themeColors.muted,
            borderColor: themeColors.muted
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Theme Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{isArabic ? 'المظهر' : 'Appearance'}</h3>
                <div className="flex gap-2">
                  {[
                    { key: 'light', icon: Sun, label: isArabic ? 'فاتح' : 'Light' },
                    { key: 'dark', icon: Moon, label: isArabic ? 'داكن' : 'Dark' },
                    { key: 'sepia', icon: Monitor, label: isArabic ? 'بني' : 'Sepia' },
                    { key: 'contrast', icon: Lightning, label: isArabic ? 'تباين' : 'Contrast' }
                  ].map(({ key, icon: Icon, label }) => (
                    <Button
                      key={key}
                      variant={settings.theme === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('theme', key as any)}
                      className="gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Typography Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{isArabic ? 'الطباعة' : 'Typography'}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.max(14, settings.fontSize - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm min-w-12 text-center">{settings.fontSize}px</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 1))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{isArabic ? 'عرض النص:' : 'Width:'}</span>
                    <input
                      type="range"
                      min="600"
                      max="1200"
                      step="50"
                      value={settings.maxWidth}
                      onChange={(e) => updateSetting('maxWidth', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs">{settings.maxWidth}px</span>
                  </div>
                </div>
              </div>
              
              {/* Focus Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{isArabic ? 'التركيز والهدف' : 'Focus & Goals'}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    <span className="text-xs">{isArabic ? 'هدف الكلمات:' : 'Word goal:'}</span>
                    <input
                      type="number"
                      min="100"
                      max="5000"
                      step="50"
                      value={wordGoal}
                      onChange={(e) => setWordGoal(parseInt(e.target.value) || 500)}
                      className="w-16 text-xs border rounded px-1 py-0.5"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.enableTypewriter}
                      onChange={(e) => updateSetting('enableTypewriter', e.target.checked)}
                      className="rounded"
                    />
                    {isArabic ? 'وضع الآلة الكاتبة' : 'Typewriter mode'}
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.hideToolbar}
                      onChange={(e) => updateSetting('hideToolbar', e.target.checked)}
                      className="rounded"
                    />
                    {isArabic ? 'إخفاء شريط الأدوات' : 'Hide toolbar'}
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="rounded"
                    />
                    {isArabic ? 'حفظ تلقائي' : 'Auto-save'}
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.enableZenMode}
                      onChange={(e) => updateSetting('enableZenMode', e.target.checked)}
                      className="rounded"
                    />
                    {isArabic ? 'الوضع الزن (تركيز كامل)' : 'Zen mode (full focus)'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div 
          className="flex-1 p-6 overflow-y-auto"
          style={{
            maxWidth: settings.maxWidth + 'px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          {/* Title Input */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isArabic ? 'عنوان المقال...' : 'Article title...'}
            className={cn(
              "text-2xl md:text-3xl font-bold border-none bg-transparent p-0 mb-6 h-auto",
              "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50",
              isRTL && "text-right"
            )}
            style={{
              fontSize: settings.fontSize * 1.5 + 'px',
              lineHeight: settings.lineHeight,
              backgroundColor: 'transparent',
              color: themeColors.foreground
            }}
          />
          
          {/* Content Textarea */}
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isArabic ? 'ابدأ الكتابة...' : 'Start writing...'}
            className={cn(
              "min-h-[60vh] border-none bg-transparent resize-none focus-content",
              "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50",
              isRTL && "text-right",
              settings.enableTypewriter && "typewriter-mode"
            )}
            style={{
              fontSize: settings.fontSize + 'px',
              lineHeight: settings.lineHeight,
              backgroundColor: 'transparent',
              color: themeColors.foreground,
              fontFamily: isArabic ? '"IBM Plex Sans Arabic", sans-serif' : 'inherit'
            }}
          />

          {/* Progress Bar (if enabled and word goal set) */}
          {settings.showProgress && wordGoal > 0 && (
            <div className="mt-6 space-y-2">
              <div className={cn("flex justify-between text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                <span>{isArabic ? 'التقدم نحو الهدف' : 'Progress to goal'}</span>
                <span>{stats.wordCount}/{wordGoal} {isArabic ? 'كلمة' : 'words'}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, stats.progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      {!settings.hideToolbar && (
        <div 
          className={cn(
            "flex items-center justify-between px-6 py-2 text-xs border-t",
            isRTL && "flex-row-reverse"
          )}
          style={{ 
            backgroundColor: themeColors.card,
            borderColor: themeColors.muted,
            color: themeColors.foreground + '80'
          }}
        >
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <span>{isArabic ? 'وضع التركيز نشط' : 'Focus Mode Active'}</span>
            {hasUnsavedChanges && (
              <span className="text-orange-500">
                {isArabic ? '• غير محفوظ' : '• Unsaved changes'}
              </span>
            )}
          </div>
          
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <span>{isArabic ? 'اختصارات:' : 'Shortcuts:'}</span>
            <span>Ctrl+S {isArabic ? 'حفظ' : 'Save'}</span>
            <span>Ctrl+Enter {isArabic ? 'معاينة' : 'Preview'}</span>
            <span>Esc {isArabic ? 'خروج' : 'Exit'}</span>
          </div>
        </div>
      )}
      
      {/* CSS for typewriter mode */}
      <style jsx>{`
        .typewriter-mode {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            transparent 40%,
            ${themeColors.muted}20 50%,
            transparent 60%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}