import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Code
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
      label: isArabic ? 'المقالات' : 'Articles',
      icon: FileText,
      show: true,
      badge: isArabic ? '١٢' : '12'
    },
    {
      id: 'create-article',
      label: isArabic ? 'مقال جديد' : 'New Article',
      icon: PlusCircle,
      show: hasPermission('create', 'articles')
    }
  ];

  // Content management items
  const contentItems = [
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
      id: 'realtime',
      label: isArabic ? 'التحليل المباشر' : 'Real-time',
      icon: Eye,
      show: canAccess('advanced-analytics')
    },
    {
      id: 'insights',
      label: isArabic ? 'رؤى الأداء' : 'Performance Insights',
      icon: TrendingUp,
      show: canAccess('advanced-analytics')
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
      id: 'settings',
      label: isArabic ? 'الإعدادات' : 'Settings',
      icon: Settings,
      show: canAccess('settings')
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
          <item.icon size={16} />
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