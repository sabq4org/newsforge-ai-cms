// Test component to verify that all critical dependencies are working
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, ChartLine, Globe, Settings } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const TestAppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={24} />
              تطبيق اختبار "سبق الذكية"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Trophy size={32} className="text-primary" />
                <span className="text-sm">Trophy Icon</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Medal size={32} className="text-primary" />
                <span className="text-sm">Medal Icon</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <ChartLine size={32} className="text-primary" />
                <span className="text-sm">ChartLine Icon</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Globe size={32} className="text-primary" />
                <span className="text-sm">Globe Icon</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">اختبار الأدوات المساعدة:</h3>
              <div className={cn("p-2 bg-muted rounded", "text-sm")}>
                ✅ دالة cn تعمل بشكل صحيح
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  تاريخ الاختبار: {new Date().toLocaleDateString('ar-SA')}
                </p>
                <p className="text-sm text-muted-foreground">
                  وقت الاختبار: {new Date().toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button>
                <Settings size={16} className="mr-2" />
                زر اختبار
              </Button>
              
              <Button variant="outline">
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>اختبار القوائم والبيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['مقال أول', 'مقال ثاني', 'مقال ثالث'].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>{item}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">تعديل</Button>
                    <Button size="sm" variant="ghost">حذف</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAppContent;