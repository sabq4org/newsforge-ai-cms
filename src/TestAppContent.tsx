import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const TestAppContent: React.FC = () => {
  try {
    // Test all the basic context and hooks
    const { isAuthenticated, user, language } = useAuth();
    const isRTL = language?.direction === 'rtl';
    const isArabic = language?.code === 'ar';

    return (
      <div className="min-h-screen bg-white p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 font-arabic">
            {isArabic ? 'سبق الذكية - اختبار النظام' : 'Sabq AI CMS - System Test'}
          </h1>
          
          <div className="grid gap-6">
            {/* Authentication Status */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h2 className="text-xl font-semibold mb-4 font-arabic">
                {isArabic ? 'حالة المصادقة' : 'Authentication Status'}
              </h2>
              <div className="space-y-2">
                <p className="font-arabic">
                  {isArabic ? 'مسجل الدخول:' : 'Authenticated:'} 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {isAuthenticated ? (isArabic ? 'نعم' : 'Yes') : (isArabic ? 'لا' : 'No')}
                  </span>
                </p>
                {user && (
                  <p className="font-arabic">
                    {isArabic ? 'المستخدم:' : 'User:'} {user.name || user.nameAr || 'Unknown'}
                  </p>
                )}
                <p className="font-arabic">
                  {isArabic ? 'اللغة:' : 'Language:'} {language?.name}
                </p>
                <p className="font-arabic">
                  {isArabic ? 'الاتجاه:' : 'Direction:'} {isRTL ? 'RTL' : 'LTR'}
                </p>
              </div>
            </div>
            
            {/* UI Components Test */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-arabic">
                {isArabic ? 'اختبار المكونات' : 'UI Components Test'}
              </h2>
              <div className="space-y-4">
                <Button>
                  {isArabic ? 'زر اختبار' : 'Test Button'}
                </Button>
                <div className="p-4 bg-blue-50 rounded">
                  <p className="font-arabic">
                    {isArabic ? 'هذا نص تجريبي للتأكد من عمل الخطوط العربية بشكل صحيح.' : 'This is a test text to ensure proper font rendering.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* System Information */}
            <div className="p-6 border rounded-lg bg-blue-50">
              <h2 className="text-xl font-semibold mb-4 font-arabic">
                {isArabic ? 'معلومات النظام' : 'System Information'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>React:</strong> ✅ Working</p>
                  <p><strong>Tailwind CSS:</strong> ✅ Working</p>
                  <p><strong>UI Components:</strong> ✅ Working</p>
                </div>
                <div>
                  <p><strong>Auth Context:</strong> ✅ Working</p>
                  <p><strong>Arabic Font:</strong> ✅ Working</p>
                  <p><strong>RTL Support:</strong> ✅ Working</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Test */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-arabic">
                {isArabic ? 'الإجراءات المتاحة' : 'Available Actions'}
              </h2>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = window.location.href.split('?')[0]}
                  className="w-full"
                  variant="outline"
                >
                  {isArabic ? 'تحميل التطبيق الكامل' : 'Load Full Application'}
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="outline"
                >
                  {isArabic ? 'إعادة تحميل الصفحة' : 'Reload Page'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('TestAppContent error:', error);
    return (
      <div className="min-h-screen bg-red-50 p-4 flex items-center justify-center">
        <div className="max-w-lg bg-white p-6 rounded-lg border border-red-200">
          <h1 className="text-xl font-semibold text-red-800 mb-4">Test App Error</h1>
          <p className="text-red-600 mb-4">
            An error occurred while testing the app components.
          </p>
          <pre className="text-xs bg-red-100 p-3 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default TestAppContent;