import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { HeaderProfileMenu } from '@/components/membership';
import { QuickThemeSelector } from '@/components/showcase/QuickThemeSelector';
import { ThemeScheduleStatus } from '@/components/showcase';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Globe, 
  User, 
  SignOut, 
  Gear, 
  Bell,
  Menu,
  X,
  Crown,
  Brain
} from '@phosphor-icons/react';
import { UserProfile } from '@/types/membership';
import sabqLogoOfficial from '@/assets/images/sabq-logo-official.svg';

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
  memberUser?: UserProfile | null;
  onShowMemberLogin?: () => void;
  onShowMemberProfile?: () => void;
  onMemberLogout?: () => void;
}

export function Header({ 
  onMenuClick, 
  isMobileMenuOpen, 
  memberUser, 
  onShowMemberLogin, 
  onShowMemberProfile, 
  onMemberLogout 
}: HeaderProps) {
  const { user, logout, language, switchLanguage } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const getRoleDisplayName = () => {
    if (!user) return '';
    
    const roleNames = {
      'admin': isArabic ? 'مدير' : 'Administrator',
      'editor-in-chief': isArabic ? 'رئيس التحرير' : 'Editor-in-Chief',
      'section-editor': isArabic ? 'محرر القسم' : 'Section Editor',
      'journalist': isArabic ? 'صحفي' : 'Journalist',
      'opinion-writer': isArabic ? 'كاتب رأي' : 'Opinion Writer',
      'analyst': isArabic ? 'محلل' : 'Analyst'
    };

    return roleNames[user.role] || user.role;
  };

  const getRoleIcon = () => {
    if (!user) return User;
    
    switch (user.role) {
      case 'admin':
      case 'editor-in-chief':
        return Crown;
      case 'analyst':
        return Brain;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <header className={cn(
      "bg-card border-b border-border px-4 py-3 no-zoom",
      isRTL && "direction-rtl"
    )}>
      <div className={cn(
        "flex items-center justify-between w-full",
        isRTL && "flex-row-reverse"
      )}>
        {/* Left section (Logo + menu button) */}
        <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            {/* Official Sabq Logo */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src={sabqLogoOfficial} 
                alt={isArabic ? "شعار سبق الذكية" : "Sabq Althakiyah Logo"}
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className={cn("hidden lg:block font-arabic min-w-0", isRTL && "text-right")}>
              <h1 className="text-lg font-bold text-primary font-arabic truncate">
                {isArabic ? 'سبق الذكية' : 'Sabq Althakiyah'}
              </h1>
              <p className="text-xs text-muted-foreground -mt-1 font-arabic truncate">
                {isArabic ? 'نظام إدارة محتوى ذكي' : 'AI-Powered Newsroom'}
              </p>
            </div>
          </div>
        </div>

        {/* Right section (Controls + User menu) */}
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          {/* Language Selector */}
          <Select value={language.code} onValueChange={(value: 'en' | 'ar') => switchLanguage(value)}>
            <SelectTrigger className="w-16 h-9 border-0 bg-transparent hover:bg-muted">
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <span className="text-xs font-medium">
                  {language.code === 'ar' ? 'عر' : 'EN'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">
                <div className="flex items-center gap-2">
                  <span>🇸🇦</span>
                  <span>العربية</span>
                </div>
              </SelectItem>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>English</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Quick Theme Selector */}
          <QuickThemeSelector />

          {/* Theme Schedule Status */}
          <ThemeScheduleStatus />

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full"></span>
          </Button>

          {/* User Menu */}
          {memberUser ? (
            <HeaderProfileMenu
              user={memberUser}
              onShowProfile={onShowMemberProfile || (() => {})}
              onShowSettings={onShowMemberProfile || (() => {})}
              onLogout={onMemberLogout || (() => {})}
              unreadNotifications={3}
            />
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-9"
              onClick={onShowMemberLogin}
            >
              <User size={16} />
              <span className="hidden sm:inline">
                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
              </span>
            </Button>
          )}

          {/* Admin User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 px-2 gap-2 rounded-lg">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {(isArabic ? user?.nameAr : user?.name)?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("hidden md:block min-w-0", isRTL ? "text-right" : "text-left")}>
                  <p className="text-sm font-medium leading-none font-arabic truncate">
                    {isArabic ? user?.nameAr : user?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <RoleIcon size={10} />
                    <span className="text-xs text-muted-foreground font-arabic truncate">
                      {getRoleDisplayName()}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64" 
              align={isRTL ? "start" : "end"} 
              forceMount
            >
              <div className={cn("flex flex-col space-y-2 p-3", isRTL && "text-right")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {(isArabic ? user?.nameAr : user?.name)?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {isArabic ? user?.nameAr : user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs h-5">
                      <RoleIcon size={10} className={cn(isRTL ? "ml-1" : "mr-1")} />
                      {getRoleDisplayName()}
                    </Badge>
                  </div>
                </div>
                
                {user?.department && (
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? 'القسم:' : 'Department:'} {user.department}
                  </div>
                )}
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className={cn(isRTL && "flex-row-reverse")}>
                <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <span>{isArabic ? 'الملف الشخصي' : 'Profile'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className={cn(isRTL && "flex-row-reverse")}>
                <Gear className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <span>{isArabic ? 'الإعدادات' : 'Settings'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={logout}
                className={cn("text-red-600 focus:text-red-600", isRTL && "flex-row-reverse")}
              >
                <SignOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <span>{isArabic ? 'تسجيل الخروج' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}