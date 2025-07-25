import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  ArrowsOut, 
  Sidebar, 
  Eye, 
  Monitor,
  TextT,
  Lightning 
} from '@phosphor-icons/react';
import { FocusMode } from './FocusMode';

interface FocusModeToggleProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

export function FocusModeToggle({ 
  title, 
  content, 
  onTitleChange, 
  onContentChange, 
  onSave,
  onPreview,
  className 
}: FocusModeToggleProps) {
  const { language } = useAuth();
  const isArabic = language.code === 'ar';
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const handleEnterFocusMode = () => {
    setIsFocusMode(true);
    
    // Add focus mode class to body for additional styling
    document.body.classList.add('focus-mode-active');
  };
  
  const handleExitFocusMode = () => {
    setIsFocusMode(false);
    
    // Remove focus mode class from body
    document.body.classList.remove('focus-mode-active');
  };
  
  const handleFocusSave = (data: { title: string; content: string }) => {
    onTitleChange(data.title);
    onContentChange(data.content);
    if (onSave) {
      onSave();
    }
  };
  
  const handleFocusPreview = (data: { title: string; content: string }) => {
    onTitleChange(data.title);
    onContentChange(data.content);
    if (onPreview) {
      onPreview();
    }
  };
  
  if (isFocusMode) {
    return (
      <FocusMode
        initialTitle={title}
        initialContent={content}
        onSave={handleFocusSave}
        onExit={handleExitFocusMode}
        onPreview={handleFocusPreview}
      />
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnterFocusMode}
      className={cn("gap-2", className)}
      title={isArabic ? 'وضع التركيز - للكتابة بدون تشتيت' : 'Focus Mode - Distraction-free writing'}
    >
      <ArrowsOut className="w-4 h-4" />
      <span className="hidden sm:inline">
        {isArabic ? 'وضع التركيز' : 'Focus Mode'}
      </span>
      <span className="sm:hidden">
        {isArabic ? 'تركيز' : 'Focus'}
      </span>
    </Button>
  );
}

// Helper component for quick focus mode features info
export function FocusModeFeatures() {
  const { language } = useAuth();
  const isArabic = language.code === 'ar';
  const isRTL = language.direction === 'rtl';
  
  const features = [
    {
      icon: ArrowsOut,
      titleAr: 'وضع ملء الشاشة',
      titleEn: 'Fullscreen Writing',
      descAr: 'اكتب في وضع ملء الشاشة بدون أي تشتيت',
      descEn: 'Write in fullscreen mode without distractions'
    },
    {
      icon: Sidebar,
      titleAr: 'إخفاء العناصر الجانبية',
      titleEn: 'Hide Sidebars',
      descAr: 'إخفاء جميع الأشرطة الجانبية وعناصر التنقل',
      descEn: 'Hide all sidebars and navigation elements'
    },
    {
      icon: TextT,
      titleAr: 'تخصيص الخط',
      titleEn: 'Custom Typography',
      descAr: 'تحكم في حجم الخط وتباعد الأسطر',
      descEn: 'Control font size and line spacing'
    },
    {
      icon: Monitor,
      titleAr: 'ثيمات متنوعة',
      titleEn: 'Multiple Themes',
      descAr: 'اختر من بين ثيمات مختلفة للكتابة',
      descEn: 'Choose from different writing themes'
    },
    {
      icon: Lightning,
      titleAr: 'اختصارات لوحة المفاتيح',
      titleEn: 'Keyboard Shortcuts',
      descAr: 'اختصارات سريعة للحفظ والمعاينة',
      descEn: 'Quick shortcuts for saving and preview'
    },
    {
      icon: Eye,
      titleAr: 'وضع الآلة الكاتبة',
      titleEn: 'Typewriter Mode',
      descAr: 'ركز على الفقرة الحالية فقط',
      descEn: 'Focus only on current paragraph'
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={cn(
              "flex gap-3 p-3 rounded-lg bg-muted/50 border",
              isRTL && "flex-row-reverse text-right"
            )}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">
                {isArabic ? feature.titleAr : feature.titleEn}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isArabic ? feature.descAr : feature.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className={cn(
        "p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800",
        isRTL && "text-right"
      )}>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {isArabic ? 
            '💡 نصيحة: استخدم Ctrl+S للحفظ، Ctrl+Enter للمعاينة، و Esc للخروج من وضع التركيز' :
            '💡 Tip: Use Ctrl+S to save, Ctrl+Enter to preview, and Esc to exit focus mode'
          }
        </p>
      </div>
    </div>
  );
}