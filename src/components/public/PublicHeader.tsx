import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MagnifyingGlass, 
  List, 
  X, 
  Globe,
  Bell,
  Lightning,
  Sparkle,
  Info,
  Envelope,
  BarChart3
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { mockCategories } from '@/lib/mockData';
import sabqLogoOfficial from '@/assets/images/sabq-logo-official.svg';

interface PublicHeaderProps {
  currentLanguage: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
  onSectionClick: (section: string) => void;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function PublicHeader({ 
  currentLanguage, 
  onLanguageChange, 
  onSectionClick, 
  onSearchChange,
  className 
}: PublicHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isRTL = currentLanguage === 'ar';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
    setIsSearchOpen(false);
  };

  const mainNavItems = [
    { 
      id: 'news', 
      labelAr: 'الأخبار', 
      labelEn: 'News', 
      icon: Lightning,
      section: 'news'
    },
    { 
      id: 'analysis', 
      labelAr: 'التحليل العميق', 
      labelEn: 'Deep Analysis', 
      icon: BarChart3,
      section: 'analysis'
    },
    { 
      id: 'doses', 
      labelAr: 'الجرعات الذكية', 
      labelEn: 'Smart Doses', 
      icon: Sparkle,
      section: 'doses'
    },
    { 
      id: 'about', 
      labelAr: 'عن الصحيفة', 
      labelEn: 'About Us', 
      icon: Info,
      section: 'about'
    },
    { 
      id: 'contact', 
      labelAr: 'تواصل معنا', 
      labelEn: 'Contact', 
      icon: Envelope,
      section: 'contact'
    }
  ];

  return (
    <header className={cn("bg-background border-b border-border sticky top-0 z-50", className)}>
      {/* Breaking News Banner */}
      <div className="bg-destructive text-destructive-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 justify-center text-sm">
            <Bell className="w-4 h-4 animate-pulse" />
            <span className="font-medium">
              {isRTL ? 'عاجل:' : 'Breaking:'}
            </span>
            <span className="truncate">
              {isRTL 
                ? 'تطورات مهمة في المشهد التقني السعودي - تابع آخر التحديثات'
                : 'Important developments in Saudi tech landscape - Follow latest updates'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Official Sabq Logo */}
            <div className="flex items-center">
              <img 
                src={sabqLogoOfficial} 
                alt={isRTL ? "شعار سبق الذكية" : "Sabq Althakiyah Logo"}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl font-bold text-foreground">
                {isRTL ? 'سبق الذكية' : 'Sabq Althakiyah'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'صحافة ذكية، تحليل عميق' : 'Smart Journalism, Deep Analysis'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                  onClick={() => onSectionClick(item.section)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isRTL ? item.labelAr : item.labelEn}</span>
                </Button>
              );
            })}
          </nav>

          {/* Search & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden"
            >
              <MagnifyingGlass className="w-5 h-5" />
            </Button>

            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث في الأخبار...' : 'Search news...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </form>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLanguageChange(currentLanguage === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLanguage === 'ar' ? 'EN' : 'عر'}</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث في الأخبار...' : 'Search news...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  autoFocus
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </form>
          </div>
        )}

        {/* Categories Bar */}
        <div className="hidden lg:flex items-center gap-4 py-3 border-t border-border/50">
          <span className="text-sm text-muted-foreground font-medium">
            {isRTL ? 'الأقسام:' : 'Categories:'}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {mockCategories.slice(0, 8).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onSectionClick(`category-${category.slug}`)}
              >
                <span className="mr-1">{category.icon}</span>
                {isRTL ? category.nameAr : category.nameEn}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-3">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onSectionClick(item.section);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{isRTL ? item.labelAr : item.labelEn}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Mobile Categories */}
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isRTL ? 'الأقسام' : 'Categories'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {mockCategories.slice(0, 8).map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => {
                      onSectionClick(`category-${category.slug}`);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>{category.icon}</span>
                    <span className="text-xs">{isRTL ? category.nameAr : category.nameEn}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}