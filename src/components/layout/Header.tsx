import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Newspaper, 
  Globe, 
  User, 
  SignOut, 
  Gear, 
  Bell,
  Menu,
  X
} from '@phosphor-icons/react';

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const { user, logout, language, switchLanguage } = useAuth();

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        
        <div className="flex items-center gap-2">
          <Newspaper size={24} className="text-primary" />
          <h1 className="text-xl font-bold text-primary hidden sm:block">NewsFlow</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <Select value={language.code} onValueChange={(value: 'en' | 'ar') => switchLanguage(value)}>
          <SelectTrigger className="w-20 h-9">
            <Globe size={16} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="ar">عر</SelectItem>
          </SelectContent>
        </Select>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{language.code === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Gear className="mr-2 h-4 w-4" />
              <span>{language.code === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <SignOut className="mr-2 h-4 w-4" />
              <span>{language.code === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}