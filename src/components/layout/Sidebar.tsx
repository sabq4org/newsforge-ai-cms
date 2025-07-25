import { cn, safeToString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { 
  House, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  Users, 
  FolderOpen, 
  Tag, 
  Settings,
  Calendar,
  Brain,
  TestTube,
  Eye,
  TrendingUp,
  Shield,
  Sparkles,
  Globe,
  Images,
  Code,
  Medal,
  GitMerge,
  Wrench,
  Microphone,
  FileAudio,
  TrendUp,
  Coffee,
  Drop,
  Bell,
  BellRinging,
  Cpu,
  Activity,
  MemoryStick,
  BookOpen,
  Palette,
  Package,
  Play,
  PlayCircle,
  Heart,
  Smiley
} from '@phosphor-icons/react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const { language, user, canAccess, hasPermission } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  // Core navigation items
  const coreItems = [
    {
      id: 'dashboard',
      label: isArabic ? 'لوحة التحكم' : 'Dashboard',
      icon: House,
      show: true
    },
    {
      id: 'articles',
      label: isArabic ? 'إدارة المقالات' : 'Article Management',
      icon: FileText,
      show: true,
      badge: isArabic ? '١٢' : '12'
    },
    {
      id: 'deep-analysis',
      label: isArabic ? 'التحليل العميق' : 'Deep Analysis',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'ذكي' : 'AI'
    }
  ];

  // Content management items
  const contentItems = [
    {
      id: 'daily-doses',
      label: isArabic ? 'الجرعات الذكية' : 'Daily Smart Doses',
      icon: Drop,
      show: hasPermission('create', 'articles'),
      badge: isArabic ? 'جديد' : 'New'
    },
    {
      id: 'search',
      label: isArabic ? 'البحث الذكي' : 'AI Search',
      icon: Sparkles,
      show: true
    },
    {
      id: 'scheduled',
      label: isArabic ? 'الجدولة' : 'Scheduled',
      icon: Calendar,
      show: hasPermission('schedule', 'articles'),
      badge: isArabic ? '٣' : '3'
    },
    {
      id: 'categories',
      label: isArabic ? 'التصنيفات' : 'Categories',
      icon: FolderOpen,
      show: hasPermission('update', 'categories')
    },
    {
      id: 'category-statistics',
      label: isArabic ? 'إحصائيات التصنيفات' : 'Category Statistics',
      icon: TrendUp,
      show: hasPermission('view', 'analytics')
    },
    {
      id: 'tags',
      label: isArabic ? 'العلامات' : 'Tags',
      icon: Tag,
      show: hasPermission('update', 'tags')
    },
    {
      id: 'media',
      label: isArabic ? 'مكتبة الوسائط' : 'Media Library',
      icon: Images,
      show: hasPermission('create', 'articles')
    },
    {
      id: 'media-generator',
      label: isArabic ? 'مولد الوسائط' : 'Media Generator',
      icon: Sparkles,
      show: hasPermission('create', 'articles')
    },
    {
      id: 'podcast-demo',
      label: isArabic ? '🎙️ تجربة البودكاست' : '🎙️ Podcast Demo',
      icon: Sparkles,
      show: true,
      badge: isArabic ? 'تجريبي' : 'Demo'
    },
    {
      id: 'runtime-check',
      label: isArabic ? '🔍 فحص النظام' : '🔍 Runtime Check',
      icon: Code,
      show: true,
      badge: isArabic ? 'تشخيص' : 'Debug'
    },
    {
      id: 'audio-editor',
      label: isArabic ? 'محرر البودكاست' : 'Audio Editor',
      icon: Microphone,
      show: hasPermission('create', 'articles')
    },
    {
      id: 'audio-library',
      label: isArabic ? 'مكتبة البودكاست' : 'Audio Library',
      icon: FileAudio,
      show: hasPermission('create', 'articles')
    },
    {
      id: 'audio-analytics',
      label: isArabic ? 'تحليلات البودكاست' : 'Audio Analytics',
      icon: BarChart3,
      show: hasPermission('read', 'analytics')
    },
    {
      id: 'external-data',
      label: isArabic ? 'المصادر الخارجية' : 'External Data',
      icon: Globe,
      show: hasPermission('create', 'articles'),
      badge: isArabic ? 'جديد' : 'New'
    },
    {
      id: 'news-aggregator',
      label: isArabic ? 'مجمع الأخبار' : 'News Aggregator',
      icon: Globe,
      show: hasPermission('create', 'articles')
    },
    {
      id: 'scheduling',
      label: isArabic ? 'جدولة النشر' : 'Publishing Schedule',
      icon: Calendar,
      show: hasPermission('schedule', 'articles')
    }
  ];

  // AI & Analytics items
  const aiAnalyticsItems = [
    {
      id: 'analytics',
      label: isArabic ? 'التحليلات' : 'Analytics',
      icon: BarChart3,
      show: hasPermission('read', 'analytics')
    },
    {
      id: 'user-behavior-analytics',
      label: isArabic ? 'تحليل سلوك المستخدمين' : 'User Behavior Analytics',
      icon: Users,
      show: hasPermission('read', 'analytics'),
      badge: isArabic ? 'متقدم' : 'Advanced'
    },
    {
      id: 'reading-pattern-analyzer',
      label: isArabic ? 'محلل أنماط القراءة' : 'Reading Pattern Analyzer',
      icon: Eye,
      show: hasPermission('read', 'analytics'),
      badge: isArabic ? 'ذكي' : 'AI'
    },
    {
      id: 'predictive-user-analytics',
      label: isArabic ? 'التحليلات التنبئية' : 'Predictive Analytics',
      icon: Brain,
      show: hasPermission('read', 'analytics'),
      badge: isArabic ? 'تنبؤ' : 'Predict'
    },
    {
      id: 'recommendation-system-overview',
      label: isArabic ? 'نظام التوصيات' : 'Recommendation System',
      icon: Medal, // Using Medal instead of Award to fix runtime error
      show: canAccess('ai-tools'),
      badge: isArabic ? 'ذكي' : 'AI'
    },
    {
      id: 'smart-recommendation-system',
      label: isArabic ? 'النظام الذكي المتطور' : 'Advanced Smart System',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'متطور' : 'Advanced'
    },
    {
      id: 'machine-learning-engine',
      label: isArabic ? 'محرك التعلم الآلي' : 'Machine Learning Engine',
      icon: Cpu,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'ذكي' : 'ML'
    },
    {
      id: 'generative-recommendations',
      label: isArabic ? 'الذكاء الاصطناعي التوليدي' : 'Generative AI Recommendations',
      icon: Sparkles,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'توليدي' : 'GPT'
    },
    {
      id: 'content-personalization',
      label: isArabic ? 'تخصيص المحتوى الذكي' : 'Smart Content Personalization',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'شخصي' : 'Personal'
    },
    {
      id: 'ml-prediction-models',
      label: isArabic ? 'نماذج التوقع الذكية' : 'ML Prediction Models',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'تنبؤ' : 'ML'
    },
    {
      id: 'ml-model-training',
      label: isArabic ? 'تدريب النماذج المتقدم' : 'Advanced Model Training',
      icon: Cpu,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'تدريب' : 'Train'
    },
    {
      id: 'neural-network-trainer',
      label: isArabic ? 'مدرب الشبكات العصبية' : 'Neural Network Trainer',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'عميق' : 'Deep'
    },
    {
      id: 'transformer-training-studio',
      label: isArabic ? 'استوديو تدريب المحولات' : 'Transformer Training Studio',
      icon: Sparkles,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'محولات' : 'Transformers'
    },
    {
      id: 'deep-learning-pipeline',
      label: isArabic ? 'مدير خطوط التعلم العميق' : 'Deep Learning Pipeline Manager',
      icon: Activity,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'خطوط' : 'Pipeline'
    },
    {
      id: 'arabic-content-classifier',
      label: isArabic ? 'مصنف المحتوى العربي' : 'Arabic Content Classifier',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'تصنيف' : 'Classify'
    },
    {
      id: 'neural-network-demo',
      label: isArabic ? 'تجربة الشبكة العصبية' : 'Neural Network Demo',
      icon: Brain,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'تجربة' : 'Demo'
    },
    {
      id: 'arabic-sentiment-analyzer',
      label: isArabic ? 'محلل المشاعر العربي' : 'Arabic Sentiment Analyzer',
      icon: Heart,
      show: true,
      badge: isArabic ? 'مشاعر' : 'Sentiment'
    },
    {
      id: 'sentiment-dashboard',
      label: isArabic ? 'لوحة تحليل المشاعر' : 'Sentiment Dashboard',
      icon: Smiley,
      show: true,
      badge: isArabic ? 'لوحة' : 'Dashboard'
    },
    {
      id: 'auto-sentiment-moderation',
      label: isArabic ? 'الرقابة التلقائية على المشاعر' : 'Auto Sentiment Moderation',
      icon: Shield,
      show: canAccess('moderation'),
      badge: isArabic ? 'رقابة' : 'Auto'
    },
    {
      id: 'predictive-behavior',
      label: isArabic ? 'محرك التنبؤ السلوكي' : 'Predictive Behavior Engine',
      icon: TrendingUp,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'سلوك' : 'Behavior'
    },
    {
      id: 'ai-trend-analysis',
      label: isArabic ? 'تحليل الاتجاهات الذكي' : 'AI Trend Analysis',
      icon: TrendingUp,
      show: canAccess('ai-tools'),
      badge: isArabic ? 'توقع' : 'Predict'
    },
    {
      id: 'personalized-recommendations',
      label: isArabic ? 'التوصيات المخصصة' : 'Personalized Recommendations',
      icon: Sparkles,
      show: hasPermission('read', 'analytics'),
      badge: isArabic ? 'جديد' : 'New'
    },
    {
      id: 'ai-optimization',
      label: isArabic ? 'التحسين الذكي' : 'AI Optimization',
      icon: Brain,
      show: canAccess('ai-tools')
    },
    {
      id: 'ab-testing',
      label: isArabic ? 'اختبار A/B' : 'A/B Testing',
      icon: TestTube,
      show: canAccess('ab-testing')
    },
    {
      id: 'collaborative',
      label: isArabic ? 'التعاون المباشر' : 'Live Collaboration',
      icon: GitMerge,
      show: canAccess('collaboration')
    }
  ];

  // Notifications & User Experience items
  const notificationItems = [
    {
      id: 'breaking-news',
      label: isArabic ? 'الأخبار العاجلة' : 'Breaking News',
      icon: BellRinging,
      show: hasPermission('create', 'articles'),
      badge: isArabic ? 'فوري' : 'Live'
    },
    {
      id: 'notification-preferences',
      label: isArabic ? 'إعدادات الإشعارات' : 'Notification Settings',
      icon: Bell,
      show: true
    },
    {
      id: 'smart-notifications',
      label: isArabic ? 'الإشعارات الذكية' : 'Smart Notifications',
      icon: Brain,
      show: true,
      badge: isArabic ? 'ذكي' : 'Smart'
    },
    {
      id: 'notification-analytics',
      label: isArabic ? 'إحصائيات الإشعارات' : 'Notification Analytics',
      icon: BarChart3,
      show: hasPermission('read', 'analytics'),
      badge: isArabic ? 'تحليل' : 'Analytics'
    }
  ];

  // User Experience & Personalization items
  const userExperienceItems = [
    {
      id: 'member-profile',
      label: isArabic ? 'الملف الشخصي' : 'Member Profile',
      icon: Users,
      show: true,
      badge: isArabic ? 'عضو' : 'Member'
    },
    {
      id: 'user-adaptive-settings',
      label: isArabic ? 'إعداداتي التكيفية' : 'My Adaptive Settings',
      icon: Brain,
      show: true,
      badge: isArabic ? 'شخصي' : 'Personal'
    },
    {
      id: 'personalized-feed',
      label: isArabic ? 'الخلاصة المخصصة' : 'Personalized Feed',
      icon: Sparkles,
      show: true,
      badge: isArabic ? 'مخصص' : 'Custom'
    },
    {
      id: 'reading-behavior',
      label: isArabic ? 'تحليل سلوك القراءة' : 'Reading Behavior',
      icon: TrendUp,
      show: true,
      badge: isArabic ? 'تحليل' : 'Analytics'
    },
    {
      id: 'smart-recommendations',
      label: isArabic ? 'التوصيات الذكية' : 'Smart Recommendations',
      icon: Brain,
      show: true,
      badge: isArabic ? 'ذكي' : 'AI'
    }
  ];

  // Management items
  const managementItems = [
    {
      id: 'users',
      label: isArabic ? 'المستخدمون' : 'Users',
      icon: Users,
      show: canAccess('user-management')
    },
    {
      id: 'moderation',
      label: isArabic ? 'الإشراف' : 'Moderation',
      icon: Shield,
      show: canAccess('moderation'),
      badge: isArabic ? '٢' : '2'
    },
    {
      id: 'system-analysis',
      label: isArabic ? 'تحليل النظام' : 'System Analysis',
      icon: Code,
      show: canAccess('user-management')
    },
    {
      id: 'loyalty',
      label: isArabic ? 'نظام الولاء' : 'Loyalty System',
      icon: Medal,
      show: true
    },
    {
      id: 'system-maintenance',
      label: isArabic ? 'صيانة النظام' : 'System Maintenance',
      icon: Wrench,
      show: canAccess('user-management')
    },
    {
      id: 'performance-dashboard',
      label: isArabic ? 'لوحة تحكم الأداء' : 'Performance Dashboard',
      icon: Activity,
      show: canAccess('user-management'),
      badge: isArabic ? 'أداء' : 'Perf'
    },
    {
      id: 'auto-resource-optimizer',
      label: isArabic ? 'محسن الموارد التلقائي' : 'Auto Resource Optimizer',
      icon: MemoryStick,
      show: canAccess('user-management'),
      badge: isArabic ? 'تلقائي' : 'Auto'
    },
    {
      id: 'resource-optimization-config',
      label: isArabic ? 'إعدادات تحسين الموارد' : 'Resource Config',
      icon: Settings,
      show: canAccess('user-management'),
      badge: isArabic ? 'إعدادات' : 'Config'
    },
    {
      id: 'performance-optimization-demo',
      label: isArabic ? 'عرض تحسين الأداء' : 'Performance Demo',
      icon: Activity,
      show: true,
      badge: isArabic ? 'عرض' : 'Demo'
    },
    {
      id: 'auto-resource-optimization-overview',
      label: isArabic ? 'دليل التحسين التلقائي' : 'Auto Optimization Guide',
      icon: BookOpen,
      show: true,
      badge: isArabic ? 'دليل' : 'Guide'
    },
    {
      id: 'settings',
      label: isArabic ? 'إعدادات الطباعة' : 'Typography Settings',
      icon: Settings,
      show: canAccess('settings')
    },
    {
      id: 'theme-settings',
      label: isArabic ? 'إعدادات الثيم والألوان' : 'Theme & Colors',
      icon: Palette,
      show: canAccess('settings'),
      badge: isArabic ? 'ثيم' : 'Theme'
    },
    {
      id: 'general-settings',
      label: isArabic ? 'الإعدادات العامة' : 'General Settings',
      icon: Settings,
      show: canAccess('settings'),
      badge: isArabic ? 'شامل' : 'Full'
    },
    {
      id: 'adaptive-learning-settings',
      label: isArabic ? 'إعدادات التعلم التكيفي' : 'Adaptive Learning Settings',
      icon: Brain,
      show: true,
      badge: isArabic ? 'ذكي' : 'Smart'
    },
    {
      id: 'personalized-reading',
      label: isArabic ? 'محرك القراءة الشخصي' : 'Personalized Reading Engine',
      icon: BookOpen,
      show: true,
      badge: isArabic ? 'شخصي' : 'Personal'
    },
    {
      id: 'typography-demo',
      label: isArabic ? 'عرض الطباعة' : 'Typography Demo',
      icon: Sparkles,
      show: true
    },
    {
      id: 'theme-testing',
      label: isArabic ? 'تجربة الثيمات الجاهزة' : 'Theme Testing',
      icon: Palette,
      show: true,
      badge: isArabic ? 'تجربة' : 'Test'
    },
    {
      id: 'live-theme-preview',
      label: isArabic ? 'معاينة الثيمات المباشرة' : 'Live Theme Preview',
      icon: Eye,
      show: true,
      badge: isArabic ? 'مباشر' : 'Live'
    },
    {
      id: 'theme-import-export',
      label: isArabic ? 'تصدير واستيراد الثيمات' : 'Import/Export Themes',
      icon: Package,
      show: true,
      badge: isArabic ? 'شارك' : 'Share'
    },
    {
      id: 'interactive-theme-demo',
      label: isArabic ? 'العرض التفاعلي للثيمات' : 'Interactive Theme Demo',
      icon: Play,
      show: true,
      badge: isArabic ? 'تفاعلي' : 'Interactive'
    },
    {
      id: 'comprehensive-theme-manager',
      label: isArabic ? 'إدارة الثيمات الشاملة' : 'Theme Manager',
      icon: Palette,
      show: true,
      badge: isArabic ? 'شامل' : 'Complete'
    },
    {
      id: 'auto-theme-scheduler',
      label: isArabic ? 'جدولة الثيمات التلقائية' : 'Auto Theme Scheduler',
      icon: Calendar,
      show: true,
      badge: isArabic ? 'تلقائي' : 'Auto'
    },
    {
      id: 'personalized-themes',
      label: isArabic ? 'الثيمات الشخصية' : 'Personalized Themes',
      icon: Palette,
      show: true,
      badge: isArabic ? 'شخصي' : 'Personal'
    },
    {
      id: 'user-theme-profile',
      label: isArabic ? 'ملف الثيم الشخصي' : 'User Theme Profile',
      icon: Users,
      show: true,
      badge: isArabic ? 'ملفي' : 'My Profile'
    },
    {
      id: 'personalized-themes-dashboard',
      label: isArabic ? 'لوحة الثيمات الشخصية' : 'Personalized Themes Dashboard',
      icon: BarChart3,
      show: true,
      badge: isArabic ? 'لوحة' : 'Dashboard'
    },
    {
      id: 'intelligent-theme-generator',
      label: isArabic ? 'مولد الثيمات الذكي' : 'Intelligent Theme Generator',
      icon: Brain,
      show: true,
      badge: isArabic ? 'ذكي' : 'AI'
    },
    {
      id: 'behavioral-theme-learning',
      label: isArabic ? 'التعلم السلوكي للثيمات' : 'Behavioral Theme Learning',
      icon: Brain,
      show: true,
      badge: isArabic ? 'تكيفي' : 'Adaptive'
    },
    {
      id: 'adaptive-color-learning',
      label: isArabic ? 'التعلم التكيفي للألوان' : 'Adaptive Color Learning',
      icon: Eye,
      show: true,
      badge: isArabic ? 'جديد' : 'New'
    },
    {
      id: 'adaptive-color-demo',
      label: isArabic ? 'عرض التكييف التوضيحي' : 'Adaptive Demo',
      icon: PlayCircle,
      show: true,
      badge: isArabic ? 'تجربة' : 'Demo'
    }
  ];

  const renderMenuSection = (items: any[], title?: string) => {
    // Safe filter to ensure only valid items are processed
    const validItems = (Array.isArray(items) ? items : []).filter(item => {
      try {
        // Check if item exists and has required properties
        if (!item || typeof item !== 'object') {
          console.warn('renderMenuSection: Invalid item found:', item);
          return false;
        }
        
        // Check if item has required properties
        if (!item.id || !item.label || typeof item.show !== 'boolean') {
          console.warn('renderMenuSection: Item missing required properties:', item);
          return false;
        }
        
        // Additional safety checks for icon
        if (item.icon && typeof item.icon !== 'function') {
          console.warn('renderMenuSection: Invalid icon type for item:', item.id, typeof item.icon);
        }
        
        return item.show;
      } catch (error) {
        console.error('renderMenuSection: Error checking item validity:', error, item);
        return false;
      }
    });

    return (
      <div className="space-y-1">
        {title && (
          <div className={cn("px-3 py-2 mb-1", isRTL && "text-right")}>
            <h3 className={cn(
              "text-xs font-semibold text-muted-foreground uppercase tracking-wider font-arabic",
              isRTL && "text-right"
            )}>
              {safeToString(title)}
            </h3>
          </div>
        )}
        {validItems.map((item) => (
          <Button
            key={item.id || 'unknown'}
            variant={activeView === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full h-10 px-3 text-sm font-arabic relative overflow-hidden sidebar-button",
              isRTL ? "justify-start flex-row-reverse" : "justify-start",
              activeView === item.id && "bg-secondary/80 text-secondary-foreground"
            )}
            onClick={() => {
              try {
                if (item.id) {
                  onViewChange(item.id);
                  onClose();
                }
              } catch (error) {
                console.error('renderMenuSection: Error handling click:', error);
              }
            }}
          >
            <div className={cn(
              "flex items-center gap-3 w-full min-w-0",
              isRTL && "flex-row-reverse"
            )}>
              <SafeIcon icon={item.icon} className="h-4 w-4 flex-shrink-0" />
              <span className={cn(
                "flex-1 truncate font-arabic text-left",
                isRTL && "text-right"
              )}>
                {safeToString(item.label || 'Unknown')}
              </span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs h-5 px-2 flex-shrink-0 font-arabic",
                    isRTL && "mr-auto"
                  )}
                >
                  {safeToString(item.badge)}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isRTL ? "right-0 border-l border-r-0" : "left-0",
        isOpen 
          ? "translate-x-0" 
          : isRTL 
            ? "translate-x-full" 
            : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn("p-4 border-b border-border", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground font-arabic truncate">
                  {isArabic ? 'سبق الذكية' : 'Sabq Althakiyah'}
                </h2>
                <p className="text-xs text-muted-foreground font-arabic truncate">
                  {isArabic ? 'نظام إدارة محتوى ذكي' : 'AI-Powered CMS'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-3 sidebar-nav">
            {/* Core Items */}
            {renderMenuSection(coreItems)}
            
            <Separator className="my-2" />
            
            {/* Content Management */}
            {renderMenuSection(contentItems, isArabic ? 'إدارة المحتوى' : 'Content')}
            
            <Separator className="my-2" />
            
            {/* AI & Analytics */}
            {renderMenuSection(aiAnalyticsItems, isArabic ? 'التحليلات والذكاء الاصطناعي' : 'AI & Analytics')}
            
            <Separator className="my-2" />
            
            {/* Notifications */}
            {renderMenuSection(notificationItems, isArabic ? 'الإشعارات' : 'Notifications')}
            
            <Separator className="my-2" />
            
            {/* User Experience */}
            {renderMenuSection(userExperienceItems, isArabic ? 'تجربة المستخدم' : 'User Experience')}
            
            <Separator className="my-2" />
            
            {/* Management */}
            {renderMenuSection(managementItems, isArabic ? 'الإدارة' : 'Management')}
          </nav>

          {/* User Info */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-muted/50 font-arabic", 
              isRTL && "flex-row-reverse"
            )}>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent-foreground font-arabic">
                  {safeToString(user?.name || user?.nameAr || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <p className="text-sm font-medium truncate font-arabic">
                  {safeToString(isArabic ? (user?.nameAr || user?.name) : (user?.name || user?.nameAr)) || 'مستخدم'}
                </p>
                <p className="text-xs text-muted-foreground font-arabic truncate">
                  {user?.role === 'admin' ? (isArabic ? 'مدير' : 'Administrator') :
                   user?.role === 'editor-in-chief' ? (isArabic ? 'رئيس تحرير' : 'Editor-in-Chief') :
                   user?.role === 'section-editor' ? (isArabic ? 'محرر قسم' : 'Section Editor') :
                   user?.role === 'journalist' ? (isArabic ? 'صحفي' : 'Journalist') :
                   user?.role === 'opinion-writer' ? (isArabic ? 'كاتب رأي' : 'Opinion Writer') :
                   user?.role === 'analyst' ? (isArabic ? 'محلل' : 'Analyst') : 
                   safeToString(user?.role) || (isArabic ? 'مستخدم' : 'User')}
                </p>
              </div>
              <Globe 
                className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-shrink-0" 
                title={isArabic ? 'تغيير اللغة' : 'Switch Language'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className={cn(
              "text-xs text-muted-foreground font-arabic text-center",
              isRTL && "text-right"
            )}>
              {isArabic ? 'سبق الذكية v1.0' : 'Sabq Althakiyah v1.0'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}