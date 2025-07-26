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
  style?: React.CSSProperties;
}

const SafeButton: React.FC<SafeButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  style = {}
}) => {
  const baseStyles: React.CSSProperties = {
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
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white'
    }
  };

  const finalStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      try {
        onClick();
      } catch (error) {
        console.error('Button click error:', error);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={finalStyles}
      className={safeCn(className)}
    >
      {children}
    </button>
  );
};

// ==========================================
// SAFE CARD COMPONENT
// ==========================================

interface SafeCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SafeCard: React.FC<SafeCardProps> = ({ title, children, className = '' }) => {
  const cardStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
    textAlign: 'right' as const
  };

  return (
    <div style={cardStyles} className={safeCn('safe-card', className)}>
      {title && (
        <h3 style={titleStyles}>
          {title}
        </h3>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

// ==========================================
// SAFE INPUT COMPONENT
// ==========================================

interface SafeInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  disabled?: boolean;
  className?: string;
}

const SafeInput: React.FC<SafeInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  className = ''
}) => {
  const containerStyles: React.CSSProperties = {
    marginBottom: '1rem',
    direction: 'rtl',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
    textAlign: 'right' as const
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    direction: 'rtl',
    textAlign: 'right' as const,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled ? '#f9fafb' : '#ffffff'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      onChange(e.target.value);
    } catch (error) {
      console.error('Input change error:', error);
    }
  };

  return (
    <div style={containerStyles} className={safeCn('safe-input-container', className)}>
      {label && (
        <label style={labelStyles}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
        className="safe-input"
      />
    </div>
  );
};

// ==========================================
// MAIN ULTIMATE SAFE APP COMPONENT
// ==========================================

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
}

interface AppState {
  currentView: string;
  loading: boolean;
  error: string | null;
  testInput: string;
  articles: Article[];
}

const UltimateSafeApp: React.FC = () => {
  const [state, setState] = React.useState<AppState>({
    currentView: 'dashboard',
    loading: false,
    error: null,
    testInput: '',
    articles: [
      {
        id: '1',
        title: 'أول مقال تجريبي',
        content: 'هذا محتوى المقال التجريبي الأول',
        author: 'كاتب تجريبي',
        date: new Date()
      },
      {
        id: '2', 
        title: 'ثاني مقال تجريبي',
        content: 'هذا محتوى المقال التجريبي الثاني',
        author: 'كاتب آخر',
        date: new Date()
      }
    ]
  });

  // Safe state updater
  const updateState = (updates: Partial<AppState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  // Navigation handler
  const handleNavigate = (view: string) => {
    try {
      updateState({ currentView: view, error: null });
    } catch (error) {
      console.error('Navigation error:', error);
      updateState({ error: 'خطأ في التنقل' });
    }
  };

  // Test input handler
  const handleInputChange = (value: string) => {
    try {
      updateState({ testInput: value });
    } catch (error) {
      console.error('Input change error:', error);
    }
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'IBM Plex Sans Arabic, Arial, sans-serif',
    direction: 'rtl',
    padding: '2rem'
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.125rem',
    color: '#6b7280'
  };

  const navigationStyles: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  };

  const contentStyles: React.CSSProperties = {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  };

  // Render current view content
  const renderContent = () => {
    switch (state.currentView) {
      case 'dashboard':
        return (
          <div style={contentStyles}>
            <SafeCard title="إحصائيات عامة">
              <div style={{ textAlign: 'right' }}>
                <p style={{ marginBottom: '0.5rem' }}>عدد المقالات: {state.articles.length}</p>
                <p style={{ marginBottom: '0.5rem' }}>تاريخ اليوم: {safeFormatDate(new Date())}</p>
                <p>الحالة: نشط</p>
              </div>
            </SafeCard>
            
            <SafeCard title="مقالات حديثة">
              <div style={{ textAlign: 'right' }}>
                {safeMap(state.articles.slice(0, 3), (article: Article, index: number) => (
                  <div key={article.id} style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {article.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {article.author} - {safeFormatDate(article.date)}
                    </p>
                  </div>
                ))}
              </div>
            </SafeCard>
            
            <SafeCard title="اختبار المدخلات">
              <SafeInput
                label="نص تجريبي"
                value={state.testInput}
                onChange={handleInputChange}
                placeholder="اكتب شيئاً هنا..."
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                القيمة: {state.testInput || 'فارغ'}
              </p>
            </SafeCard>
          </div>
        );
        
      case 'articles':
        return (
          <div style={contentStyles}>
            <SafeCard title="جميع المقالات">
              <div style={{ textAlign: 'right' }}>
                {safeMap(state.articles, (article: Article, index: number) => (
                  <div key={article.id} style={{
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' }}>
                      {article.content}
                    </p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      الكاتب: {article.author} | التاريخ: {safeFormatDate(article.date)}
                    </div>
                  </div>
                ))}
              </div>
            </SafeCard>
          </div>
        );
        
      case 'settings':
        return (
          <div style={contentStyles}>
            <SafeCard title="الإعدادات العامة">
              <div style={{ textAlign: 'right' }}>
                <SafeInput
                  label="اسم الموقع"
                  value="سبق الذكية"
                  onChange={() => {}}
                  disabled={true}
                />
                <SafeInput
                  label="اللغة"
                  value="العربية"
                  onChange={() => {}}
                  disabled={true}
                />
                <SafeInput
                  label="المنطقة الزمنية"
                  value="Asia/Riyadh"
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </SafeCard>
            
            <SafeCard title="إعدادات النظام">
              <div style={{ textAlign: 'right' }}>
                <p style={{ marginBottom: '1rem' }}>إصدار النظام: 2.0.0</p>
                <p style={{ marginBottom: '1rem' }}>آخر تحديث: {safeFormatDate(new Date())}</p>
                <p>الحالة: مستقر</p>
              </div>
            </SafeCard>
          </div>
        );
        
      default:
        return (
          <SafeCard title="صفحة غير موجودة">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                الصفحة المطلوبة غير موجودة
              </p>
              <SafeButton
                onClick={() => handleNavigate('dashboard')}
                variant="primary"
                style={{ marginTop: '1rem' }}
              >
                العودة للرئيسية
              </SafeButton>
            </div>
          </SafeCard>
        );
    }
  };

  return (
    <div style={containerStyles} className="ultimate-safe-app">
      {/* Header */}
      <header style={headerStyles}>
        <h1 style={titleStyles}>سبق الذكية - الوضع الآمن</h1>
        <p style={subtitleStyles}>نظام إدارة المحتوى المحمي ضد الأخطاء</p>
      </header>

      {/* Error Display */}
      {state.error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'right' as const
        }}>
          <p style={{ color: '#dc2626', fontWeight: '500' }}>
            خطأ: {state.error}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav style={navigationStyles}>
        <SafeButton
          onClick={() => handleNavigate('dashboard')}
          variant={state.currentView === 'dashboard' ? 'primary' : 'secondary'}
        >
          لوحة التحكم
        </SafeButton>
        <SafeButton
          onClick={() => handleNavigate('articles')}
          variant={state.currentView === 'articles' ? 'primary' : 'secondary'}
        >
          المقالات
        </SafeButton>
        <SafeButton
          onClick={() => handleNavigate('settings')}
          variant={state.currentView === 'settings' ? 'primary' : 'secondary'}
        >
          الإعدادات
        </SafeButton>
      </nav>

      {/* Loading State */}
      {state.loading ? (
        <SafeCard title="تحميل...">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>جاري التحميل...</p>
          </div>
        </SafeCard>
      ) : (
        renderContent()
      )}

      {/* Footer */}
      <footer style={{
        textAlign: 'center' as const,
        marginTop: '3rem',
        padding: '1rem',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        <p>سبق الذكية © 2024 - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default UltimateSafeApp;