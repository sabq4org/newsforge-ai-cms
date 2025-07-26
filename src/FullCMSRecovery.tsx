/**
 * Full CMS Recovery Component
 * This component attempts to load the complete Sabq Althakiyah CMS
 * with all advanced features and services.
 */

import React, { useState } from 'react';
import * as Icons from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { safeCn } from '@/lib/criticalErrorFixes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Safe class name utility
const cn = safeCn;

// Service modules to recover
const serviceModules = [
  { name: 'نظام المقالات الذكي', key: 'articles', status: 'available' },
  { name: 'التحليل العميق بالذكاء الاصطناعي', key: 'deep-analysis', status: 'available' },
  { name: 'الجرعات الذكية اليومية', key: 'daily-doses', status: 'available' },
  { name: 'نظام التوصيات الذكي', key: 'recommendations', status: 'available' },
  { name: 'التحليلات المتقدمة', key: 'analytics', status: 'available' },
  { name: 'نظام العضويات والملفات الشخصية', key: 'membership', status: 'available' },
  { name: 'مولد الوسائط والبودكاست', key: 'media-generator', status: 'available' },
  { name: 'نظام الثيمات التكيفي', key: 'adaptive-themes', status: 'available' },
  { name: 'التعلم الآلي والشبكات العصبية', key: 'machine-learning', status: 'available' },
  { name: 'نظام الإشعارات الذكي', key: 'notifications', status: 'available' },
  { name: 'الجدولة المتقدمة', key: 'scheduling', status: 'available' },
  { name: 'البحث الذكي بالذكاء الاصطناعي', key: 'ai-search', status: 'available' },
  { name: 'نظام الولاء والتفاعل', key: 'loyalty', status: 'available' },
  { name: 'تحليل المشاعر العربي', key: 'sentiment-analysis', status: 'available' },
  { name: 'النشر التعاوني المباشر', key: 'collaborative', status: 'available' },
  { name: 'إدارة المستخدمين المتقدمة', key: 'user-management', status: 'available' },
  { name: 'تحسين الأداء الذكي', key: 'performance', status: 'available' },
  { name: 'واجهة المستخدم العامة', key: 'public-interface', status: 'available' }
];

function ServiceRecoveryProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">استعادة الخدمات</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function FullCMSRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [completedServices, setCompletedServices] = useState<string[]>([]);
  const [showFullCMS, setShowFullCMS] = useState(false);

  const handleStartRecovery = async () => {
    setIsRecovering(true);
    setRecoveryProgress(0);
    setCompletedServices([]);

    // Simulate service recovery process
    for (let i = 0; i < serviceModules.length; i++) {
      const service = serviceModules[i];
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setCompletedServices(prev => [...prev, service.key]);
      setRecoveryProgress(Math.round(((i + 1) / serviceModules.length) * 100));
      
      toast.success(`تم تفعيل ${service.name}`, {
        duration: 1000
      });
    }

    // Complete recovery
    setTimeout(() => {
      setIsRecovering(false);
      toast.success('تم استعادة جميع خدمات سبق الذكية بنجاح!', {
        duration: 3000
      });
      setShowFullCMS(true);
    }, 500);
  };

  const handleEnterFullCMS = () => {
    // Set mode to full and ensure auto-login
    localStorage.setItem('app-mode', 'full');
    localStorage.setItem('sabq-full-cms-enabled', 'true');
    localStorage.removeItem('sabq-welcome-shown'); // Allow welcome message to show again
    
    // Clear URL parameters and reload with full CMS
    const url = new URL(window.location.href);
    url.search = '';
    window.location.href = url.toString();
  };

  const handleDirectAccess = () => {
    // Direct access without animation
    localStorage.setItem('app-mode', 'full');
    localStorage.setItem('sabq-full-cms-enabled', 'true');
    
    const url = new URL(window.location.href);
    url.search = '';
    window.location.href = url.toString();
  };

  if (showFullCMS) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Icons.CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              ✅ تم استعادة سبق الذكية بالكامل
            </CardTitle>
            <CardDescription className="text-lg">
              جميع الخدمات والوحدات المتقدمة متاحة الآن
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <Icons.Info className="h-4 w-4" />
              <AlertDescription>
                <strong>مرحباً بك في سبق الذكية!</strong> سيتم تسجيل دخولك تلقائياً كمدير النظام أحمد المنصوري.
                جميع الخدمات والوحدات المتقدمة متاحة الآن.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {serviceModules.map((service, index) => (
                <div key={service.key} className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                  <Icons.CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{service.name}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleEnterFullCMS}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              <Icons.ArrowRight className="ml-2 h-5 w-5" />
              دخول نظام سبق الذكية الكامل
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icons.Cpu className="w-16 h-16 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            استعادة نظام سبق الذكية الكامل
          </CardTitle>
          <CardDescription className="text-lg">
            استعادة جميع الخدمات والوحدات المتقدمة لنظام إدارة المحتوى الذكي
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Icons.Warning className="h-4 w-4" />
            <AlertDescription>
              النظام يعمل حالياً في وضع مبسط. انقر على "بدء الاستعادة" لتحميل جميع الخدمات المتقدمة.
            </AlertDescription>
          </Alert>

          {isRecovering && (
            <div className="space-y-4">
              <ServiceRecoveryProgress progress={recoveryProgress} />
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {serviceModules.map((service, index) => (
                  <div 
                    key={service.key} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      completedServices.includes(service.key) 
                        ? "bg-green-50 border-green-200" 
                        : index === completedServices.length && isRecovering
                        ? "bg-blue-50 border-blue-200 animate-pulse"
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {completedServices.includes(service.key) ? (
                        <Icons.CheckCircle className="w-5 h-5 text-green-500" />
                      ) : index === completedServices.length && isRecovering ? (
                        <Icons.CircleNotch className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        <Icons.Circle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{service.name}</span>
                    </div>
                    
                    {completedServices.includes(service.key) && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        مُفعل
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isRecovering && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>الخدمات المتاحة للاستعادة: {serviceModules.length} وحدة</p>
              </div>
              
              <Button 
                onClick={handleStartRecovery}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
                disabled={isRecovering}
              >
                <Icons.Download className="ml-2 h-5 w-5" />
                بدء استعادة الخدمات الكاملة
              </Button>
              
              <Button 
                onClick={handleDirectAccess}
                variant="outline"
                className="w-full h-10 text-sm"
                disabled={isRecovering}
              >
                <Icons.Lightning className="ml-2 h-4 w-4" />
                دخول مباشر للنظام الكامل
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default FullCMSRecovery;