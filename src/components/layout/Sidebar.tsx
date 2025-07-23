import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Calendar
} from '@phosphor-icons/react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const { language, hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: language.code === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      icon: House,
      permission: null
    },
    {
      id: 'articles',
      label: language.code === 'ar' ? 'المقالات' : 'Articles',
      icon: FileText,
      permission: null,
      badge: '12'
    },
    {
      id: 'create-article',
      label: language.code === 'ar' ? 'مقال جديد' : 'New Article',
      icon: PlusCircle,
      permission: 'create'
    },
    {
      id: 'scheduled',
      label: language.code === 'ar' ? 'المجدولة' : 'Scheduled',
      icon: Calendar,
      permission: 'publish',
      badge: '3'
    },
    {
      id: 'analytics',
      label: language.code === 'ar' ? 'التحليلات' : 'Analytics',
      icon: BarChart3,
      permission: 'view-analytics'
    },
    {
      id: 'categories',
      label: language.code === 'ar' ? 'التصنيفات' : 'Categories',
      icon: FolderOpen,
      permission: 'edit'
    },
    {
      id: 'tags',
      label: language.code === 'ar' ? 'العلامات' : 'Tags',
      icon: Tag,
      permission: 'edit'
    },
    {
      id: 'users',
      label: language.code === 'ar' ? 'المستخدمون' : 'Users',
      icon: Users,
      permission: 'manage-users'
    },
    {
      id: 'settings',
      label: language.code === 'ar' ? 'الإعدادات' : 'Settings',
      icon: Settings,
      permission: null
    }
  ];

  const filteredItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission as any)
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
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        language.direction === 'rtl' && "right-0 left-auto",
        language.direction === 'rtl' && isOpen ? "translate-x-0" : language.direction === 'rtl' && "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {language.code === 'ar' ? 'نظام إدارة المحتوى' : 'Content Management'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language.code === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  language.direction === 'rtl' && "justify-end flex-row-reverse"
                )}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
              >
                <item.icon size={18} />
                <span className={cn(
                  "flex-1",
                  language.direction === 'rtl' ? "text-right mr-3" : "text-left ml-3"
                )}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              NewsFlow v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}