import React from 'react';

// ==========================================
// CRITICAL SAFETY FUNCTIONS - GLOBAL SCOPE
// ==========================================

// Safe class name utility - completely independent
const safeCn = (...classes: any[]): string => {
  try {
    if (!classes || classes.length === 0) return '';
    return classes
      .filter(cls => cls && typeof cls === 'string' && cls.trim().length > 0)
      .map(cls => String(cls).trim())
      .join(' ');
  } catch {
    return '';
  }
};

// Safe date formatting - completely independent
const safeFormatDate = (date: any): string => {
  try {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-SA');
  } catch {
    return new Date().toLocaleDateString('ar-SA');
  }
};

// Safe array operations
const safeMap = <T, R>(arr: any, fn: (item: T, index: number) => R): R[] => {
  try {
    if (!Array.isArray(arr)) return [];
    return arr.map(fn);
  } catch {
    return [];
  }
};

const safeFilter = <T>(arr: any, fn: (item: T, index: number) => boolean): T[] => {
  try {
    if (!Array.isArray(arr)) return [];
    return arr.filter(fn);
  } catch {
    return [];
  }
};

// ==========================================
// SAFE UI COMPONENTS
// ==========================================

interface SafeButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const SafeButton: React.FC<SafeButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '0.5rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  } as const;

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#2563eb',
      color: 'white',
      hoverColor: '#1d4ed8'
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      hoverColor: '#e5e7eb'
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white',
      hoverColor: '#b91c1c'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const currentStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    backgroundColor: isHovered && !disabled ? variantStyles[variant].hoverColor : variantStyles[variant].backgroundColor
  };

  return (
    <button
      style={currentStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={safeCn('safe-button', className)}
    >
      {children}
    </button>
  );
};

interface SafeCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const SafeCard: React.FC<SafeCardProps> = ({ children, title, className = '', padding = 'md' }) => {
  const paddingStyles = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: paddingStyles[padding],
    marginBottom: '1rem'
  };

  const titleStyle = {
    marginTop: 0,
    marginBottom: title ? '1rem' : 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif'
  };

  return (
    <div style={cardStyle} className={safeCn('safe-card', className)}>
      {title && <h3 style={titleStyle}>{title}</h3>}
      {children}
    </div>
  );
};

interface SafeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  disabled?: boolean;
  className?: string;
}

const SafeInput: React.FC<SafeInputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  className = ''
}) => {
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    backgroundColor: disabled ? '#f9fafb' : 'white',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    direction: 'rtl' as const,
    textAlign: 'right' as const
  };

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={safeCn('safe-input', className)}
      style={{
        ...inputStyle,
        borderColor: isFocused ? '#2563eb' : '#d1d5db'
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================

export default function UltimateSafeApp() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Sample data - completely safe
  const sampleArticles = [
    {
      id: '1',
      title: 'أخبار التكنولوجيا اليوم',
      excerpt: 'آخر أخبار التكنولوجيا والذكاء الاصطناعي',
      author: 'أحمد محمد',
      date: new Date(),
      category: 'تقنية',
      views: 150
    },
    {
      id: '2',
      title: 'تطورات الاقتصاد السعودي',
      excerpt: 'نظرة على أحدث التطورات الاقتصادية في المملكة',
      author: 'سارة أحمد',
      date: new Date(),
      category: 'اقتصاد',
      views: 230
    },
    {
      id: '3',
      title: 'الرياضة المحلية',
      excerpt: 'أخبار الدوري السعودي والرياضة المحلية',
      author: 'محمد علي',
      date: new Date(),
      category: 'رياضة',
      views: 180
    }
  ];

  // Safe initialization
  React.useEffect(() => {
    try {
      // Set up basic document properties
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.title = 'سبق الذكية - نظام إدارة المحتوى';

      // Basic error handling
      const handleError = (e: ErrorEvent) => {
        console.error('Global error caught:', e.error);
        setError(e.message || 'حدث خطأ غير متوقع');
      };

      const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
        console.error('Unhandled promise rejection:', e.reason);
        setError('حدث خطأ في العملية غير المتزامنة');
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        clearTimeout(timer);
      };
    } catch (err) {
      console.error('Initialization error:', err);
      setError('فشل في تهيئة التطبيق');
      setIsLoading(false);
    }
  }, []);

  // Safe mode switching
  const handleModeSwitch = (mode: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      window.location.href = url.toString();
    } catch (err) {
      console.error('Mode switch error:', err);
      window.location.href = `/?mode=${mode}`;
    }
  };

  // Safe reset function
  const handleReset = () => {
    try {
      if (confirm('هل أنت متأكد من إعادة تعيين التطبيق؟')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Reset error:', err);
      window.location.reload();
    }
  };

  // Loading screen
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
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }} />
          <h1 style={{ color: '#2563eb', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            سبق الذكية
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            جاري تحميل النظام الآمن...
          </p>
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

  // Error screen
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
        direction: 'rtl',
        padding: '2rem'
      }}>
        <SafeCard title="🚨 خطأ في النظام" padding="lg">
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <SafeButton onClick={() => setError(null)}>
              المحاولة مرة أخرى
            </SafeButton>
            <SafeButton onClick={handleReset} variant="danger">
              إعادة تعيين
            </SafeButton>
          </div>
        </SafeCard>
      </div>
    );
  }

  // Render dashboard
  const renderDashboard = () => (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <SafeCard title="📊 لوحة التحكم الرئيسية" padding="lg">
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: '#6b7280' }}>
            مرحباً بك في نظام سبق الذكية لإدارة المحتوى. هذا النظام الآمن يوفر جميع الوظائف الأساسية مع ضمان الاستقرار التام.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <SafeButton onClick={() => setCurrentView('articles')}>
              📰 إدارة المقالات
            </SafeButton>
            <SafeButton onClick={() => setCurrentView('analytics')}>
              📊 التحليلات
            </SafeButton>
            <SafeButton onClick={() => setCurrentView('settings')}>
              ⚙️ الإعدادات
            </SafeButton>
            <SafeButton onClick={() => setCurrentView('help')}>
              ❓ المساعدة
            </SafeButton>
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                {sampleArticles.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>مقالة</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                {sampleArticles.reduce((sum, article) => sum + article.views, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>مشاهدة</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#fefce8',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ca8a04' }}>
                3
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>كاتب</div>
            </div>
          </div>
        </SafeCard>
      </div>

      {/* Mode switching */}
      <SafeCard title="🔧 خيارات النظام" padding="lg">
        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
          جرب أوضاع تشغيل مختلفة أو قم بالصيانة:
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <SafeButton onClick={() => handleModeSwitch('full')} variant="secondary">
            النظام الكامل
          </SafeButton>
          <SafeButton onClick={() => handleModeSwitch('simple')} variant="secondary">
            الوضع المبسط
          </SafeButton>
          <SafeButton onClick={() => handleModeSwitch('emergency')} variant="secondary">
            وضع الطوارئ
          </SafeButton>
          <SafeButton onClick={handleReset} variant="danger">
            🔄 إعادة تعيين
          </SafeButton>
        </div>
      </SafeCard>
    </div>
  );

  // Render articles view
  const renderArticles = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="📰 إدارة المقالات" padding="lg">
        <div style={{ marginBottom: '1.5rem' }}>
          <SafeInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="البحث في المقالات..."
            type="search"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <SafeButton onClick={() => setCurrentView('new-article')}>
            ➕ مقال جديد
          </SafeButton>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {safeFilter(sampleArticles, (article) => 
            !searchTerm || article.title.includes(searchTerm) || article.excerpt.includes(searchTerm)
          ).map((article) => (
            <div
              key={article.id}
              style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                backgroundColor: '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: '#111827', fontSize: '1.125rem' }}>
                  {article.title}
                </h4>
                <span style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {article.category}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
                {article.excerpt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
                <span>بواسطة {article.author}</span>
                <span>{article.views} مشاهدة</span>
                <span>{safeFormatDate(article.date)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <SafeButton onClick={() => setCurrentView('dashboard')} variant="secondary">
            ← العودة للرئيسية
          </SafeButton>
        </div>
      </SafeCard>
    </div>
  );

  // Render settings view
  const renderSettings = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="⚙️ إعدادات النظام" padding="lg">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>إعدادات العرض</h4>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              تخصيص طريقة عرض المحتوى
            </p>
            <SafeButton variant="secondary">تغيير الثيم</SafeButton>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>إعدادات المحتوى</h4>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              إدارة أولويات وتصنيفات المحتوى
            </p>
            <SafeButton variant="secondary">إدارة التصنيفات</SafeButton>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>النسخ الاحتياطي</h4>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              حفظ واستعادة البيانات
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <SafeButton variant="secondary">تصدير البيانات</SafeButton>
              <SafeButton variant="secondary">استيراد البيانات</SafeButton>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <SafeButton onClick={() => setCurrentView('dashboard')} variant="secondary">
            ← العودة للرئيسية
          </SafeButton>
        </div>
      </SafeCard>
    </div>
  );

  // Render help view
  const renderHelp = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="❓ مركز المساعدة" padding="lg">
        <div style={{ lineHeight: '1.8' }}>
          <h4>دليل الاستخدام السريع:</h4>
          <ol style={{ paddingRight: '1.5rem' }}>
            <li><strong>لوحة التحكم:</strong> نظرة شاملة على النظام والإحصائيات</li>
            <li><strong>إدارة المقالات:</strong> إنشاء وتحرير ونشر المقالات</li>
            <li><strong>التحليلات:</strong> متابعة أداء المحتوى والمشاهدات</li>
            <li><strong>الإعدادات:</strong> تخصيص النظام حسب احتياجاتك</li>
          </ol>

          <h4 style={{ marginTop: '2rem' }}>معلومات تقنية:</h4>
          <ul style={{ paddingRight: '1.5rem' }}>
            <li>النظام يعمل في الوضع الآمن المحسن</li>
            <li>جميع العمليات محمية ضد الأخطاء</li>
            <li>يمكن التبديل بين أوضاع التشغيل المختلفة</li>
            <li>النظام يدعم اللغة العربية بالكامل</li>
          </ul>

          <h4 style={{ marginTop: '2rem' }}>في حالة حدوث مشاكل:</h4>
          <ul style={{ paddingRight: '1.5rem' }}>
            <li>استخدم زر "إعادة تعيين" لحل معظم المشاكل</li>
            <li>جرب الوضع المبسط إذا واجهت صعوبات</li>
            <li>تأكد من تحديث المتصفح لآخر إصدار</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <SafeButton onClick={() => setCurrentView('dashboard')} variant="secondary">
            ← العودة للرئيسية
          </SafeButton>
        </div>
      </SafeCard>
    </div>
  );

  // Render analytics view
  const renderAnalytics = () => (
    <div style={{ padding: '2rem' }}>
      <SafeCard title="📊 التحليلات والإحصائيات" padding="lg">
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div>
            <h4>إحصائيات عامة</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#eff6ff',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {sampleArticles.reduce((sum, article) => sum + article.views, 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  إجمالي المشاهدات
                </div>
              </div>
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                  {Math.round(sampleArticles.reduce((sum, article) => sum + article.views, 0) / sampleArticles.length)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  متوسط المشاهدات
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4>أداء المقالات</h4>
            <div style={{ marginTop: '1rem' }}>
              {safeMap(sampleArticles, (article, index) => (
                <div
                  key={article.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{article.title}</span>
                  <span style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    {article.views} مشاهدة
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <SafeButton onClick={() => setCurrentView('dashboard')} variant="secondary">
            ← العودة للرئيسية
          </SafeButton>
        </div>
      </SafeCard>
    </div>
  );

  // Main render logic
  const renderContent = () => {
    switch (currentView) {
      case 'articles': 
        return renderArticles();
      case 'analytics': 
        return renderAnalytics();
      case 'settings': 
        return renderSettings();
      case 'help': 
        return renderHelp();
      default: 
        return renderDashboard();
    }
  };

  // Main app render
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
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            cursor: 'pointer'
          }} onClick={() => setCurrentView('dashboard')}>
            سبق الذكية
          </h1>
          
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <SafeButton 
              variant={currentView === 'dashboard' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
            >
              الرئيسية
            </SafeButton>
            <SafeButton 
              variant={currentView === 'articles' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setCurrentView('articles')}
            >
              المقالات
            </SafeButton>
            <SafeButton 
              variant={currentView === 'analytics' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setCurrentView('analytics')}
            >
              التحليلات
            </SafeButton>
          </nav>

          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#166534',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            الوضع الآمن المحسن
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem',
        marginTop: '2rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>سبق الذكية</strong> - نظام إدارة المحتوى الذكي
        </div>
        <div>
          الوضع الآمن المحسن نشط | جميع الوظائف تعمل بأمان تام
        </div>
      </footer>
    </div>
  );
}