import { cn } from '@/lib/utils';
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
  Palette
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
      id: 'typography-demo',
      label: isArabic ? 'عرض الطباعة' : 'Typography Demo',
      icon: Sparkles,
      show: true
    }
  ];

  const renderMenuSection = (items: any[], title?: string) => (
    <div className="space-y-1">
      {title && (
        <>
          <div className="px-2 py-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic">
              {title}
            </h3>
          </div>
        </>
      )}
      {items.filter(item => item.show).map((item) => (
        <Button
          key={item.id}
          variant={activeView === item.id ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-9 text-sm font-arabic",
            isRTL && "justify-end flex-row-reverse"
          )}
          onClick={() => {
            onViewChange(item.id);
            onClose();
          }}
        >
          <SafeIcon icon={item.icon} className="h-4 w-4" />
          <span className={cn(
            "flex-1 font-arabic",
            isRTL ? "text-right mr-2" : "text-left ml-2"
          )}>
            {item.label}
          </span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs h-4 px-1 font-arabic">
              {item.badge}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );

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
        "fixed top-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isRTL ? "right-0" : "left-0",
        isOpen 
          ? "translate-x-0" 
          : isRTL 
            ? "translate-x-full" 
            : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn("p-4 border-b border-border font-arabic", isRTL && "text-right")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground font-arabic">
                  {isArabic ? 'سبق الذكية' : 'Sabq Althakiyah'}
                </h2>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'نظام إدارة محتوى ذكي' : 'AI-Powered CMS'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {/* Core Items */}
            {renderMenuSection(coreItems)}
            
            <Separator />
            
            {/* Content Management */}
            {renderMenuSection(contentItems, isArabic ? 'إدارة المحتوى' : 'Content')}
            
            <Separator />
            
            {/* AI & Analytics */}
            {renderMenuSection(aiAnalyticsItems, isArabic ? 'التحليلات والذكاء الاصطناعي' : 'AI & Analytics')}
            
            <Separator />
            
            {/* Notifications */}
            {renderMenuSection(notificationItems, isArabic ? 'الإشعارات' : 'Notifications')}
            
            <Separator />
            
            {/* User Experience */}
            {renderMenuSection(userExperienceItems, isArabic ? 'تجربة المستخدم' : 'User Experience')}
            
            <Separator />
            
            {/* Management */}
            {renderMenuSection(managementItems, isArabic ? 'الإدارة' : 'Management')}
          </nav>

          {/* User Info */}
          <div className="p-3 border-t border-border">
            <div className={cn("flex items-center gap-2 p-2 rounded-lg bg-muted/50 font-arabic", isRTL && "flex-row-reverse")}>
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-accent-foreground font-arabic">
                  {user?.name?.charAt(0) || user?.nameAr?.charAt(0) || 'U'}
                </span>
              </div>
              <div className={cn("flex-1 min-w-0 font-arabic", isRTL && "text-right")}>
                <p className="text-xs font-medium truncate font-arabic">
                  {isArabic ? user?.nameAr : user?.name}
                </p>
                <p className="text-xs text-muted-foreground font-arabic">
                  {user?.role === 'admin' ? (isArabic ? 'مدير' : 'Administrator') :
                   user?.role === 'editor-in-chief' ? (isArabic ? 'رئيس تحرير' : 'Editor-in-Chief') :
                   user?.role === 'section-editor' ? (isArabic ? 'محرر قسم' : 'Section Editor') :
                   user?.role === 'journalist' ? (isArabic ? 'صحفي' : 'Journalist') :
                   user?.role === 'opinion-writer' ? (isArabic ? 'كاتب رأي' : 'Opinion Writer') :
                   user?.role === 'analyst' ? (isArabic ? 'محلل' : 'Analyst') : user?.role}
                </p>
              </div>
              <Globe 
                className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                title={isArabic ? 'تغيير اللغة' : 'Switch Language'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <div className={cn("text-xs text-muted-foreground font-arabic", isRTL ? "text-right" : "text-center")}>
              {isArabic ? 'سبق الذكية v1.0' : 'Sabq Althakiyah v1.0'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}