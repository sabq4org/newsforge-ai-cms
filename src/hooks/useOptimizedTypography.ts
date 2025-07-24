import { useTypography } from '@/contexts/TypographyContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for consistent typography application across components
 * Provides pre-configured classes for different text elements
 */
export function useOptimizedTypography() {
  const { applyToClass } = useTypography();
  const { language } = useAuth();
  
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  return {
    // Main headings (page titles, section headers)
    heading: `${applyToClass('heading')} font-arabic`,
    
    // Secondary headings (card titles, sub-sections)
    subheading: `${applyToClass('heading')} font-arabic text-muted-foreground`,
    
    // Article/content body text
    body: `${applyToClass('body')} font-arabic leading-relaxed`,
    
    // Summary/excerpt text
    summary: `${applyToClass('summary')} font-arabic text-muted-foreground`,
    
    // Caption/meta information
    caption: `${applyToClass('caption')} font-arabic text-muted-foreground`,
    
    // UI labels and form text
    label: `${applyToClass('caption')} font-arabic font-medium`,
    
    // Button text
    button: `${applyToClass('caption')} font-arabic font-medium`,
    
    // Navigation items
    nav: `${applyToClass('summary')} font-arabic`,
    
    // Utility classes
    rtlText: isRTL ? 'text-right' : 'text-left',
    rtlDir: isRTL ? 'rtl' : 'ltr',
    arabicNumerals: 'arabic-numerals',
    
    // Combined classes for common use cases
    articleTitle: `${applyToClass('heading')} font-arabic ${isRTL ? 'text-right' : 'text-left'}`,
    articleBody: `${applyToClass('body')} font-arabic leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`,
    cardTitle: `${applyToClass('heading')} font-arabic font-semibold`,
    cardDescription: `${applyToClass('summary')} font-arabic text-muted-foreground`,
    metaText: `${applyToClass('caption')} font-arabic text-muted-foreground`,
    
    // Language-specific helpers
    isRTL,
    isArabic,
    direction: language.direction,
    locale: language.code
  };
}