import React from 'react';

// Global fallbacks for common errors
const globalFallbacks = {
  cn: (...classes: any[]) => {
    try {
      return classes.filter(c => c && typeof c === 'string').join(' ');
    } catch {
      return '';
    }
  },
  formatDate: (date: any) => {
    try {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('ar-SA');
    } catch {
      return '';
    }
  }
};

// Simple button component to avoid external dependencies
const SafeButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}> = ({ onClick, children, variant = 'primary' }) => {
  const baseStyles = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    transition: 'background-color 0.2s ease'
  };

  const variants = {
    primary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db'
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyles,
        ...variants[variant]
      }}
      onMouseOver={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
        } else {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }
      }}
      onMouseOut={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = '#2563eb';
        } else {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }
      }}
    >
      {children}
    </button>
  );
};

// Safe Card component
const SafeCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className }) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}
    >
      {title && (
        <h3 style={{
          marginTop: 0,
          marginBottom: '1rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Main safe fallback app component
export default function SafeFallbackApp() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Basic initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Set up basic error handling
    window.addEventListener('error', (e) => {
      console.error('Safe app error:', e.error);
    });

    // Set document properties
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
    document.title = 'سبق الذكية - الوضع الآمن';
  }, []);

  const handleModeSwitch = (mode: string) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    window.location.search = params.toString();
  };

  const handleClearAndReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.pathname;
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h1 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>سبق الذكية</h1>
          <p style={{ color: '#6b7280' }}>جاري تحميل الوضع الآمن...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const renderDashboard = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="لوحة التحكم الآمنة">
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          مرحباً بك في الوضع الآمن لنظام سبق الذكية. هذا النظام البديل يوفر الوظائف الأساسية مع الحد الأدنى من التعقيد لضمان الاستقرار.
        </p>
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <SafeButton onClick={() => setCurrentView('articles')}>
            📰 إدارة المقالات
          </SafeButton>
          <SafeButton onClick={() => setCurrentView('settings')}>
            ⚙️ الإعدادات
          </SafeButton>
          <SafeButton onClick={() => setCurrentView('analytics')}>
            📊 التحليلات
          </SafeButton>
          <SafeButton onClick={() => setCurrentView('help')}>
            ❓ المساعدة
          </SafeButton>
        </div>
      </SafeCard>

      <div style={{ marginTop: '2rem' }}>
        <SafeCard title="خيارات التطبيق">
          <p style={{ marginBottom: '1rem' }}>جرب أوضاع تشغيل مختلفة:</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <SafeButton onClick={() => handleModeSwitch('full')} variant="secondary">
              التطبيق الكامل
            </SafeButton>
            <SafeButton onClick={() => handleModeSwitch('simple')} variant="secondary">
              الوضع المبسط
            </SafeButton>
            <SafeButton onClick={() => handleModeSwitch('emergency')} variant="secondary">
              وضع الطوارئ
            </SafeButton>
            <SafeButton onClick={handleClearAndReload} variant="secondary">
              🔄 إعادة تعيين
            </SafeButton>
          </div>
        </SafeCard>
      </div>
    </div>
  );

  const renderArticles = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="إدارة المقالات">
        <p style={{ marginBottom: '1rem' }}>قائمة المقالات ستظهر هنا في الوضع الآمن.</p>
        <SafeButton onClick={() => setCurrentView('dashboard')}>
          ← العودة للرئيسية
        </SafeButton>
      </SafeCard>
    </div>
  );

  const renderSettings = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="الإعدادات">
        <p style={{ marginBottom: '1rem' }}>إعدادات النظام الأساسية.</p>
        <SafeButton onClick={() => setCurrentView('dashboard')}>
          ← العودة للرئيسية
        </SafeButton>
      </SafeCard>
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="التحليلات">
        <p style={{ marginBottom: '1rem' }}>إحصائيات بسيطة ستظهر هنا.</p>
        <SafeButton onClick={() => setCurrentView('dashboard')}>
          ← العودة للرئيسية
        </SafeButton>
      </SafeCard>
    </div>
  );

  const renderHelp = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="المساعدة">
        <div style={{ lineHeight: '1.6' }}>
          <h4>إرشادات الاستخدام:</h4>
          <ul>
            <li>هذا هو الوضع الآمن للنظام</li>
            <li>يوفر الوظائف الأساسية فقط</li>
            <li>في حالة حدوث مشاكل، استخدم زر "إعادة تعيين"</li>
            <li>لتجربة الوضع الكامل، اضغط على "التطبيق الكامل"</li>
          </ul>
        </div>
        <SafeButton onClick={() => setCurrentView('dashboard')}>
          ← العودة للرئيسية
        </SafeButton>
      </SafeCard>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'articles': return renderArticles();
      case 'settings': return renderSettings();
      case 'analytics': return renderAnalytics();
      case 'help': return renderHelp();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
      direction: 'rtl'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            سبق الذكية - الوضع الآمن
          </h1>
          <div style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            الوضع الآمن
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        سبق الذكية - نظام إدارة المحتوى الذكي | الوضع الآمن النشط
      </footer>
    </div>
  );
}