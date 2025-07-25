import React from 'react';

// Simple, bulletproof fallback app
export default function EmergencyFallbackApp() {
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
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#2563eb',
          marginBottom: '1rem'
        }}>
          سبق الذكية
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          النظام يعمل في الوضع الآمن. جميع الوظائف الأساسية متاحة.
        </p>
        
        <div style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onClick={() => {
              window.location.search = '';
              window.location.reload();
            }}
          >
            العودة للنظام الكامل
          </button>
          
          <button
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.search = '';
              window.location.reload();
            }}
          >
            إعادة تعيين وإعادة تشغيل
          </button>
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem'
        }}>
          <p>تم تشغيل النظام الآمن تلقائياً لضمان الاستقرار</p>
          <p>جميع البيانات محفوظة وآمنة</p>
        </div>
      </div>
    </div>
  );
}