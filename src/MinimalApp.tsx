import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Minimal App Component for debugging
 * Loads components incrementally to isolate issues
 */
export function MinimalApp() {
  const [loadStage, setLoadStage] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  
  const addError = (error: string) => {
    setErrors(prev => [...prev, error]);
    console.error('MinimalApp Error:', error);
  };

  const testStages = [
    'Basic UI Elements',
    'Authentication Context', 
    'Theme Context',
    'Layout Components',
    'Full Application'
  ];

  const renderCurrentStage = () => {
    try {
      switch(loadStage) {
        case 0:
          return (
            <div className="p-6 space-y-4">
              <h1 className="text-2xl font-bold">سبق الذكية - اختبار التحميل</h1>
              <p>مرحلة التحميل: {testStages[loadStage]}</p>
              <Button onClick={() => setLoadStage(1)}>
                التالي: تحميل السياق
              </Button>
            </div>
          );
          
        case 1:
          // Test contexts
          const { AuthProvider } = require('@/contexts/AuthContext');
          return (
            <AuthProvider>
              <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold">✓ تم تحميل سياق المصادقة</h1>
                <p>مرحلة التحميل: {testStages[loadStage]}</p>
                <Button onClick={() => setLoadStage(2)}>
                  التالي: تحميل الثيمات
                </Button>
              </div>
            </AuthProvider>
          );
          
        case 2:
          // Test theme context
          const { AuthProvider: AuthProvider2 } = require('@/contexts/AuthContext');
          const { ThemeProvider } = require('@/contexts/ThemeContext');
          return (
            <AuthProvider2>
              <ThemeProvider>
                <div className="p-6 space-y-4">
                  <h1 className="text-2xl font-bold">✓ تم تحميل سياق الثيمات</h1>
                  <p>مرحلة التحميل: {testStages[loadStage]}</p>
                  <Button onClick={() => setLoadStage(3)}>
                    التالي: تحميل التخطيط
                  </Button>
                </div>
              </ThemeProvider>
            </AuthProvider2>
          );
          
        case 3:
          // Test layout components
          const { AuthProvider: AuthProvider3 } = require('@/contexts/AuthContext');
          const { ThemeProvider: ThemeProvider2 } = require('@/contexts/ThemeContext');
          const { Header } = require('@/components/layout/Header');
          const { Sidebar } = require('@/components/layout/Sidebar');
          return (
            <AuthProvider3>
              <ThemeProvider2>
                <div className="min-h-screen bg-background flex">
                  <Sidebar 
                    activeView="dashboard"
                    onViewChange={() => {}}
                    isOpen={false}
                    onClose={() => {}}
                  />
                  <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold">✓ تم تحميل مكونات التخطيط</h1>
                    <p>مرحلة التحميل: {testStages[loadStage]}</p>
                    <Button onClick={() => setLoadStage(4)}>
                      التالي: تحميل التطبيق الكامل
                    </Button>
                  </div>
                </div>
              </ThemeProvider2>
            </AuthProvider3>
          );
          
        case 4:
          // Load full app
          const App = require('./App.tsx').default;
          return <App />;
          
        default:
          return <div>مرحلة غير معروفة</div>;
      }
    } catch (error) {
      addError(`مرحلة ${loadStage}: ${error.message}`);
      return (
        <div className="p-6 space-y-4 border border-red-200 bg-red-50">
          <h1 className="text-xl font-bold text-red-800">خطأ في مرحلة التحميل {loadStage}</h1>
          <p className="text-red-600">{error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => setLoadStage(Math.max(0, loadStage - 1))}
          >
            العودة للمرحلة السابقة
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentStage()}
      
      {errors.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-100 border border-red-200 rounded">
          <h3 className="font-bold text-red-800">الأخطاء المسجلة:</h3>
          <ul className="text-sm text-red-600 mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MinimalApp;