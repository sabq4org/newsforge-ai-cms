import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Brain,
  FileText,
  Users,
  ChartBarHorizontal,
  Microphone,
  Images,
  Calendar,
  Bell,
  Palette,
  Trophy,
  Cpu,
  Sparkles,
  Globe,
  Heart,
  Shield,
  Gear as Settings,
  Drop,
  Tag,
  Eye,
  Activity,
  Play,
  Wrench
} from '@phosphor-icons/react';

interface ServiceMapProps {
  onNavigate: (view: string) => void;
}

export function ComprehensiveServiceMap({ onNavigate }: ServiceMapProps) {
  const { language, canAccess, hasPermission } = useAuth();
  const isArabic = language.code === 'ar';
  const isRTL = language.direction === 'rtl';

  const serviceCategories = [
    {
      title: isArabic ? 'إدارة المحتوى الأساسي' : 'Core Content Management',
      description: isArabic ? 'الأدوات الأساسية لإنشاء وإدارة المقالات' : 'Essential tools for creating and managing articles',
      icon: FileText,
      color: 'bg-blue-500',
      services: [
        { id: 'articles', name: isArabic ? 'إدارة المقالات' : 'Article Management', badge: '12', available: true },
        { id: 'editor', name: isArabic ? 'محرر المقالات' : 'Article Editor', badge: 'AI', available: true },
        { id: 'categories', name: isArabic ? 'التصنيفات' : 'Categories', badge: '10', available: hasPermission('update', 'categories') },
        { id: 'tags', name: isArabic ? 'العلامات' : 'Tags', badge: null, available: hasPermission('update', 'tags') },
        { id: 'scheduling', name: isArabic ? 'جدولة النشر' : 'Publishing Schedule', badge: '3', available: hasPermission('schedule', 'articles') }
      ]
    },
    {
      title: isArabic ? 'الذكاء الاصطناعي والتحليل' : 'AI & Analytics',
      description: isArabic ? 'أدوات الذكاء الاصطناعي والتحليل المتقدم' : 'AI tools and advanced analytics',
      icon: Brain,
      color: 'bg-purple-500',
      services: [
        { id: 'deep-analysis', name: isArabic ? 'التحليل العميق' : 'Deep Analysis', badge: 'AI', available: canAccess('ai-tools') },
        { id: 'analytics', name: isArabic ? 'التحليلات المتقدمة' : 'Advanced Analytics', badge: null, available: hasPermission('read', 'analytics') },
        { id: 'user-behavior-analytics', name: isArabic ? 'تحليل سلوك المستخدمين' : 'User Behavior Analytics', badge: 'NEW', available: hasPermission('read', 'analytics') },
        { id: 'reading-pattern-analyzer', name: isArabic ? 'محلل أنماط القراءة' : 'Reading Pattern Analyzer', badge: 'AI', available: hasPermission('read', 'analytics') },
        { id: 'predictive-user-analytics', name: isArabic ? 'التحليلات التنبئية' : 'Predictive Analytics', badge: 'ML', available: hasPermission('read', 'analytics') }
      ]
    },
    {
      title: isArabic ? 'نظام التوصيات الذكي' : 'Smart Recommendation System',
      description: isArabic ? 'أنظمة التوصية بالذكاء الاصطناعي والتعلم الآلي' : 'AI-powered recommendation and ML systems',
      icon: Trophy,
      color: 'bg-amber-500',
      services: [
        { id: 'recommendation-system-overview', name: isArabic ? 'نظرة عامة على نظام التوصيات' : 'Recommendation System Overview', badge: 'AI', available: canAccess('ai-tools') },
        { id: 'smart-recommendation-system', name: isArabic ? 'النظام الذكي المتطور' : 'Advanced Smart System', badge: 'SMART', available: canAccess('ai-tools') },
        { id: 'machine-learning-engine', name: isArabic ? 'محرك التعلم الآلي' : 'Machine Learning Engine', badge: 'ML', available: canAccess('ai-tools') },
        { id: 'generative-recommendations', name: isArabic ? 'التوصيات التوليدية' : 'Generative Recommendations', badge: 'GPT', available: canAccess('ai-tools') },
        { id: 'content-personalization', name: isArabic ? 'تخصيص المحتوى الذكي' : 'Smart Content Personalization', badge: 'PERSONAL', available: canAccess('ai-tools') }
      ]
    },
    {
      title: isArabic ? 'التعلم الآلي المتقدم' : 'Advanced Machine Learning',
      description: isArabic ? 'أدوات التعلم العميق والشبكات العصبية' : 'Deep learning and neural network tools',
      icon: Cpu,
      color: 'bg-emerald-500',
      services: [
        { id: 'ml-prediction-models', name: isArabic ? 'نماذج التوقع الذكية' : 'ML Prediction Models', badge: 'ML', available: canAccess('ai-tools') },
        { id: 'neural-network-trainer', name: isArabic ? 'مدرب الشبكات العصبية' : 'Neural Network Trainer', badge: 'DEEP', available: canAccess('ai-tools') },
        { id: 'transformer-training-studio', name: isArabic ? 'استوديو تدريب المحولات' : 'Transformer Training Studio', badge: 'TRANS', available: canAccess('ai-tools') },
        { id: 'deep-learning-pipeline', name: isArabic ? 'مدير خطوط التعلم العميق' : 'Deep Learning Pipeline', badge: 'PIPELINE', available: canAccess('ai-tools') },
        { id: 'arabic-content-classifier', name: isArabic ? 'مصنف المحتوى العربي' : 'Arabic Content Classifier', badge: 'عربي', available: canAccess('ai-tools') }
      ]
    },
    {
      title: isArabic ? 'الوسائط والصوت' : 'Media & Audio',
      description: isArabic ? 'إدارة الوسائط والبودكاست وتحرير الصوت' : 'Media management, podcasts, and audio editing',
      icon: Microphone,
      color: 'bg-pink-500',
      services: [
        { id: 'media', name: isArabic ? 'مكتبة الوسائط' : 'Media Library', badge: null, available: hasPermission('create', 'articles') },
        { id: 'media-generator', name: isArabic ? 'مولد الوسائط' : 'Media Generator', badge: 'AI', available: hasPermission('create', 'articles') },
        { id: 'audio-editor', name: isArabic ? 'محرر البودكاست' : 'Audio Editor', badge: 'NEW', available: hasPermission('create', 'articles') },
        { id: 'audio-library', name: isArabic ? 'مكتبة البودكاست' : 'Audio Library', badge: null, available: hasPermission('create', 'articles') },
        { id: 'audio-analytics', name: isArabic ? 'تحليلات البودكاست' : 'Audio Analytics', badge: null, available: hasPermission('read', 'analytics') }
      ]
    },
    {
      title: isArabic ? 'المستخدمون والإشعارات' : 'Users & Notifications',
      description: isArabic ? 'إدارة المستخدمين وأنظمة الإشعارات الذكية' : 'User management and smart notification systems',
      icon: Users,
      color: 'bg-indigo-500',
      services: [
        { id: 'users', name: isArabic ? 'إدارة المستخدمين' : 'User Management', badge: '1M+', available: canAccess('user-management') },
        { id: 'member-profile', name: isArabic ? 'الملف الشخصي' : 'Member Profile', badge: null, available: true },
        { id: 'breaking-news', name: isArabic ? 'الأخبار العاجلة' : 'Breaking News', badge: 'LIVE', available: true },
        { id: 'smart-notifications', name: isArabic ? 'الإشعارات الذكية' : 'Smart Notifications', badge: 'AI', available: true },
        { id: 'notification-analytics', name: isArabic ? 'تحليلات الإشعارات' : 'Notification Analytics', badge: null, available: hasPermission('read', 'analytics') }
      ]
    },
    {
      title: isArabic ? 'الثيمات والتخصيص' : 'Themes & Customization',
      description: isArabic ? 'أنظمة الثيمات الذكية والتخصيص التكيفي' : 'Smart theming and adaptive customization',
      icon: Palette,
      color: 'bg-rose-500',
      services: [
        { id: 'theme-settings', name: isArabic ? 'إعدادات الثيم' : 'Theme Settings', badge: null, available: true },
        { id: 'personalized-themes', name: isArabic ? 'الثيمات الشخصية' : 'Personalized Themes', badge: 'SMART', available: true },
        { id: 'intelligent-theme-generator', name: isArabic ? 'مولد الثيمات الذكي' : 'Intelligent Theme Generator', badge: 'AI', available: true },
        { id: 'adaptive-color-learning', name: isArabic ? 'التعلم التكيفي للألوان' : 'Adaptive Color Learning', badge: 'ML', available: true },
        { id: 'personalized-reading', name: isArabic ? 'محرك القراءة الشخصي' : 'Personalized Reading Engine', badge: 'PERSONAL', available: true }
      ]
    },
    {
      title: isArabic ? 'الخدمات المتقدمة' : 'Advanced Services',
      description: isArabic ? 'خدمات متقدمة ومميزة للمنصة' : 'Advanced and premium platform services',
      icon: Sparkles,
      color: 'bg-cyan-500',
      services: [
        { id: 'daily-doses', name: isArabic ? 'الجرعات الذكية' : 'Daily Smart Doses', badge: 'NEW', available: hasPermission('create', 'articles') },
        { id: 'search', name: isArabic ? 'البحث الذكي' : 'AI Search', badge: 'AI', available: true },
        { id: 'loyalty', name: isArabic ? 'نظام الولاء' : 'Loyalty System', badge: null, available: true },
        { id: 'collaborative', name: isArabic ? 'التحرير التعاوني' : 'Collaborative Editing', badge: 'LIVE', available: true },
        { id: 'external-data', name: isArabic ? 'المصادر الخارجية' : 'External Data Sources', badge: 'NEW', available: hasPermission('create', 'articles') }
      ]
    },
    {
      title: isArabic ? 'النظام والأداء' : 'System & Performance',
      description: isArabic ? 'مراقبة النظام وتحسين الأداء' : 'System monitoring and performance optimization',
      icon: Activity,
      color: 'bg-orange-500',
      services: [
        { id: 'performance-dashboard', name: isArabic ? 'لوحة الأداء' : 'Performance Dashboard', badge: null, available: true },
        { id: 'auto-resource-optimizer', name: isArabic ? 'محسن الموارد التلقائي' : 'Auto Resource Optimizer', badge: 'AUTO', available: true },
        { id: 'system-maintenance', name: isArabic ? 'صيانة النظام' : 'System Maintenance', badge: null, available: canAccess('system-admin') },
        { id: 'runtime-check', name: isArabic ? 'فحص النظام' : 'Runtime Check', badge: 'DEBUG', available: true },
        { id: 'general-settings', name: isArabic ? 'الإعدادات العامة' : 'General Settings', badge: null, available: canAccess('settings') }
      ]
    }
  ];

  return (
    <div className={cn("space-y-8", isRTL && "rtl")}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 font-arabic">
          {isArabic ? '🗺️ خريطة خدمات سبق الذكية' : '🗺️ Sabq AI Services Map'}
        </h1>
        <p className="text-lg text-muted-foreground font-arabic">
          {isArabic 
            ? 'جميع الخدمات والأدوات المتاحة في منصة سبق الذكية - أكثر من 50 خدمة متطورة!' 
            : 'All available services and tools in Sabq AI platform - Over 50 advanced services!'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="font-arabic">
            {isArabic ? '50+ خدمة' : '50+ Services'}
          </Badge>
          <Badge variant="outline" className="font-arabic">
            {isArabic ? 'ذكاء اصطناعي' : 'AI Powered'}
          </Badge>
          <Badge variant="outline" className="font-arabic">
            {isArabic ? 'تعلم آلي' : 'Machine Learning'}
          </Badge>
          <Badge variant="outline" className="font-arabic">
            {isArabic ? 'تحليلات متقدمة' : 'Advanced Analytics'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {serviceCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="overflow-hidden">
            <CardHeader className={cn("pb-4", category.color, "text-white")}>
              <div className="flex items-center gap-3">
                <category.icon size={32} weight="bold" />
                <div className="flex-1">
                  <CardTitle className="text-xl font-arabic">{category.title}</CardTitle>
                  <CardDescription className="text-white/90 font-arabic">
                    {category.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-arabic">
                  {category.services.filter(s => s.available).length} {isArabic ? 'خدمة' : 'Services'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {category.services.map((service, serviceIndex) => (
                  <div key={serviceIndex} className="group">
                    <Button
                      variant={service.available ? "outline" : "ghost"}
                      className={cn(
                        "w-full h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200",
                        service.available 
                          ? "hover:bg-primary hover:text-primary-foreground cursor-pointer" 
                          : "opacity-50 cursor-not-allowed",
                        "font-arabic"
                      )}
                      disabled={!service.available}
                      onClick={() => service.available && onNavigate(service.id)}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-sm font-medium leading-tight">
                          {service.name}
                        </div>
                        {service.badge && (
                          <Badge size="sm" variant={service.available ? "default" : "secondary"} className="font-arabic text-xs">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2 font-arabic">
            {isArabic ? '💡 نصائح للاستخدام' : '💡 Usage Tips'}
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground font-arabic">
            <p>
              {isArabic 
                ? '• انقر على أي خدمة للوصول إليها مباشرة' 
                : '• Click on any service to access it directly'}
            </p>
            <p>
              {isArabic 
                ? '• الخدمات المعطلة تتطلب صلاحيات خاصة' 
                : '• Disabled services require special permissions'}
            </p>
            <p>
              {isArabic 
                ? '• استخدم البحث في الشريط الجانبي للوصول السريع' 
                : '• Use sidebar search for quick access'}
            </p>
            <p>
              {isArabic 
                ? '• جميع الخدمات تدعم اللغة العربية بالكامل' 
                : '• All services fully support Arabic language'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComprehensiveServiceMap;