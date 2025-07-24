import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightning, 
  Instagram, 
  TwitterLogo, 
  FacebookLogo, 
  LinkedinLogo,
  YoutubeLogo,
  Envelope,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  Users,
  Headphones
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface PublicFooterProps {
  currentLanguage: 'ar' | 'en';
  onSectionClick: (section: string) => void;
  className?: string;
}

export function PublicFooter({ 
  currentLanguage, 
  onSectionClick,
  className 
}: PublicFooterProps) {
  const isRTL = currentLanguage === 'ar';

  const quickLinks = [
    { 
      id: 'about', 
      labelAr: 'عن سبق الذكية', 
      labelEn: 'About Sabq Althakiyah', 
      section: 'about' 
    },
    { 
      id: 'contact', 
      labelAr: 'تواصل معنا', 
      labelEn: 'Contact Us', 
      section: 'contact' 
    },
    { 
      id: 'privacy', 
      labelAr: 'سياسة الخصوصية', 
      labelEn: 'Privacy Policy', 
      section: 'privacy' 
    },
    { 
      id: 'terms', 
      labelAr: 'شروط الاستخدام', 
      labelEn: 'Terms of Service', 
      section: 'terms' 
    },
    { 
      id: 'careers', 
      labelAr: 'الوظائف', 
      labelEn: 'Careers', 
      section: 'careers' 
    },
    { 
      id: 'support', 
      labelAr: 'الدعم الفني', 
      labelEn: 'Technical Support', 
      section: 'support' 
    }
  ];

  const services = [
    { 
      id: 'news', 
      labelAr: 'الأخبار', 
      labelEn: 'News', 
      section: 'news' 
    },
    { 
      id: 'analysis', 
      labelAr: 'التحليل العميق', 
      labelEn: 'Deep Analysis', 
      section: 'analysis' 
    },
    { 
      id: 'doses', 
      labelAr: 'الجرعات الذكية', 
      labelEn: 'Smart Doses', 
      section: 'doses' 
    },
    { 
      id: 'podcasts', 
      labelAr: 'البودكاست', 
      labelEn: 'Podcasts', 
      section: 'podcasts' 
    },
    { 
      id: 'recommendations', 
      labelAr: 'التوصيات الذكية', 
      labelEn: 'AI Recommendations', 
      section: 'recommendations' 
    },
    { 
      id: 'breaking', 
      labelAr: 'الأخبار العاجلة', 
      labelEn: 'Breaking News', 
      section: 'breaking' 
    }
  ];

  const socialLinks = [
    { 
      id: 'twitter', 
      icon: TwitterLogo, 
      url: 'https://twitter.com/sabq_althakiyah',
      labelAr: 'تويتر',
      labelEn: 'Twitter'
    },
    { 
      id: 'instagram', 
      icon: Instagram, 
      url: 'https://instagram.com/sabq_althakiyah',
      labelAr: 'إنستغرام',
      labelEn: 'Instagram'
    },
    { 
      id: 'facebook', 
      icon: FacebookLogo, 
      url: 'https://facebook.com/sabq.althakiyah',
      labelAr: 'فيسبوك',
      labelEn: 'Facebook'
    },
    { 
      id: 'linkedin', 
      icon: LinkedinLogo, 
      url: 'https://linkedin.com/company/sabq-althakiyah',
      labelAr: 'لينكد إن',
      labelEn: 'LinkedIn'
    },
    { 
      id: 'youtube', 
      icon: YoutubeLogo, 
      url: 'https://youtube.com/@sabq_althakiyah',
      labelAr: 'يوتيوب',
      labelEn: 'YouTube'
    }
  ];

  const contactInfo = [
    {
      icon: Envelope,
      labelAr: 'البريد الإلكتروني',
      labelEn: 'Email',
      value: 'contact@sabq-althakiyah.sa'
    },
    {
      icon: Phone,
      labelAr: 'الهاتف',
      labelEn: 'Phone',
      value: '+966 11 234 5678'
    },
    {
      icon: MapPin,
      labelAr: 'العنوان',
      labelEn: 'Address',
      value: isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'
    }
  ];

  return (
    <footer className={cn("bg-card border-t border-border", className)}>
      {/* Newsletter Subscription */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isRTL ? 'اشترك في النشرة الذكية' : 'Subscribe to Smart Newsletter'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isRTL 
                ? 'احصل على ملخص يومي بأهم الأخبار والتحليلات الذكية مباشرة في بريدك الإلكتروني'
                : 'Get daily summaries of the most important news and smart analysis directly to your email'
              }
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email address'}
                className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button className="px-6">
                {isRTL ? 'اشتراك' : 'Subscribe'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Lightning className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? 'سبق الذكية' : 'Sabq Althakiyah'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'صحافة ذكية' : 'Smart Journalism'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {isRTL 
                ? 'منصة إعلامية ذكية تجمع بين الصحافة التقليدية وتقنيات الذكاء الاصطناعي لتقديم محتوى إخباري متميز وتحليلات عميقة.'
                : 'Smart media platform combining traditional journalism with AI technologies to deliver outstanding news content and deep analysis.'
              }
            </p>
            
            {/* AI Features Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <Lightning className="w-3 h-3 mr-1" />
                {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {isRTL ? 'موثوق' : 'Verified'}
              </Badge>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.id}
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 p-0 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(social.url, '_blank')}
                    title={isRTL ? social.labelAr : social.labelEn}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => onSectionClick(link.section)}
                >
                  {isRTL ? link.labelAr : link.labelEn}
                </Button>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {isRTL ? 'خدماتنا' : 'Our Services'}
            </h4>
            <nav className="space-y-2">
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => onSectionClick(service.section)}
                >
                  {isRTL ? service.labelAr : service.labelEn}
                </Button>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {isRTL ? 'معلومات التواصل' : 'Contact Information'}
            </h4>
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? contact.labelAr : contact.labelEn}
                      </p>
                      <p className="text-sm text-foreground">{contact.value}</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Support Hours */}
              <div className="flex items-start gap-3 mt-4 pt-3 border-t border-border">
                <Headphones className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'ساعات الدعم الفني' : 'Support Hours'}
                  </p>
                  <p className="text-sm text-foreground">
                    {isRTL ? 'الأحد - الخميس: ٩ص - ٦م' : 'Sun - Thu: 9AM - 6PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>
                {isRTL 
                  ? `© ${new Date().getFullYear()} سبق الذكية. جميع الحقوق محفوظة.`
                  : `© ${new Date().getFullYear()} Sabq Althakiyah. All rights reserved.`
                }
              </p>
              <p className="mt-1">
                {isRTL 
                  ? 'مدعوم بتقنيات الذكاء الاصطناعي المتقدمة'
                  : 'Powered by Advanced AI Technologies'
                }
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs hover:text-foreground"
                onClick={() => onSectionClick('privacy')}
              >
                <FileText className="w-3 h-3 mr-1" />
                {isRTL ? 'الخصوصية' : 'Privacy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs hover:text-foreground"
                onClick={() => onSectionClick('terms')}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                {isRTL ? 'الشروط' : 'Terms'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs hover:text-foreground"
                onClick={() => onSectionClick('careers')}
              >
                <Users className="w-3 h-3 mr-1" />
                {isRTL ? 'الوظائف' : 'Careers'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}