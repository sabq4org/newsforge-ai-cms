import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as React from 'react';
import { User, Language, Permission } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { useKV } from '@github/spark/hooks';

interface AuthContextType {
  user: User | null;
  language: Language;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchLanguage: (lang: 'en' | 'ar') => void;
  isAuthenticated: boolean;
  hasPermission: (action: Permission['action'], resource: Permission['resource'], scope?: Permission['scope']) => boolean;
  canAccess: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const languages: Record<'en' | 'ar', Language> = {
  en: { code: 'en', name: 'English', direction: 'ltr' },
  ar: { code: 'ar', name: 'العربية', direction: 'rtl' }
};

// Role-based permission matrix
const rolePermissions: Record<string, Permission[]> = {
  'admin': [
    { action: 'create', resource: 'articles' },
    { action: 'read', resource: 'articles' },
    { action: 'update', resource: 'articles' },
    { action: 'delete', resource: 'articles' },
    { action: 'publish', resource: 'articles' },
    { action: 'schedule', resource: 'articles' },
    { action: 'create', resource: 'users' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
    { action: 'delete', resource: 'users' },
    { action: 'read', resource: 'analytics' },
    { action: 'moderate', resource: 'comments' },
    { action: 'update', resource: 'settings' },
    { action: 'read', resource: 'ai-tools' },
    { action: 'create', resource: 'ai-tools' }
  ],
  'editor-in-chief': [
    { action: 'create', resource: 'articles' },
    { action: 'read', resource: 'articles' },
    { action: 'update', resource: 'articles' },
    { action: 'delete', resource: 'articles' },
    { action: 'publish', resource: 'articles' },
    { action: 'schedule', resource: 'articles' },
    { action: 'read', resource: 'users', scope: 'department' },
    { action: 'read', resource: 'analytics' },
    { action: 'moderate', resource: 'comments' },
    { action: 'read', resource: 'ai-tools' },
    { action: 'create', resource: 'ai-tools' }
  ],
  'section-editor': [
    { action: 'create', resource: 'articles', scope: 'department' },
    { action: 'read', resource: 'articles' },
    { action: 'update', resource: 'articles', scope: 'department' },
    { action: 'publish', resource: 'articles', scope: 'department' },
    { action: 'schedule', resource: 'articles', scope: 'department' },
    { action: 'read', resource: 'analytics', scope: 'department' },
    { action: 'moderate', resource: 'comments', scope: 'department' },
    { action: 'read', resource: 'ai-tools' }
  ],
  'journalist': [
    { action: 'create', resource: 'articles', scope: 'own' },
    { action: 'read', resource: 'articles' },
    { action: 'update', resource: 'articles', scope: 'own' },
    { action: 'read', resource: 'analytics', scope: 'own' },
    { action: 'read', resource: 'ai-tools' }
  ],
  'opinion-writer': [
    { action: 'create', resource: 'articles', scope: 'own' },
    { action: 'read', resource: 'articles' },
    { action: 'update', resource: 'articles', scope: 'own' },
    { action: 'read', resource: 'analytics', scope: 'own' },
    { action: 'read', resource: 'ai-tools' }
  ],
  'analyst': [
    { action: 'read', resource: 'articles' },
    { action: 'read', resource: 'analytics' },
    { action: 'read', resource: 'users' },
    { action: 'read', resource: 'ai-tools' }
  ]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auto-login as admin for testing purposes - Welcome to Sabq Althakiyah!
  const [user, setUser] = useKV<User | null>('sabq-user', mockUsers[0]); // Ahmed Al-Mansouri (Admin)
  const [language, setLanguage] = useKV<Language>('sabq-language', languages.ar); // Default to Arabic
  
  // Show welcome message once for auto-login
  React.useEffect(() => {
    if (user && user.id === '1') { // Ahmed Al-Mansouri
      console.log(`🎉 مرحباً بك في سبق الذكية! تم تسجيل الدخول تلقائياً كـ ${user.nameAr} (${user.role})`);
    }
  }, [user]);

  // Ensure language object is always valid
  useEffect(() => {
    if (!language || typeof language !== 'object' || !language.code || !language.direction) {
      console.warn('AuthProvider: Invalid language object detected, resetting to Arabic');
      setLanguage(languages.ar);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    // Apply language and direction to document
    const safeLanguage = language || languages.ar;
    document.documentElement.setAttribute('lang', safeLanguage.code || 'ar');
    document.documentElement.setAttribute('dir', safeLanguage.direction || 'rtl');
    document.body.className = (safeLanguage.direction || 'rtl') === 'rtl' ? 'rtl' : 'ltr';
  }, [language]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchLanguage = (lang: 'en' | 'ar') => {
    setLanguage(languages[lang]);
  };

  const hasPermission = (
    action: Permission['action'], 
    resource: Permission['resource'], 
    scope?: Permission['scope']
  ): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role] || [];
    
    return userPermissions.some(permission => 
      permission.action === action && 
      permission.resource === resource &&
      (!scope || !permission.scope || permission.scope === scope || permission.scope === 'all')
    );
  };

  const canAccess = (feature: string): boolean => {
    if (!user) return false;

    const featureAccess: Record<string, string[]> = {
      'dashboard': ['admin', 'editor-in-chief', 'section-editor', 'journalist', 'opinion-writer', 'analyst'],
      'ai-tools': ['admin', 'editor-in-chief', 'section-editor', 'journalist', 'opinion-writer'],
      'ab-testing': ['admin', 'editor-in-chief', 'section-editor'],
      'user-management': ['admin'],
      'advanced-analytics': ['admin', 'editor-in-chief', 'analyst'],
      'moderation': ['admin', 'editor-in-chief', 'section-editor'],
      'settings': ['admin', 'editor-in-chief']
    };

    return featureAccess[feature]?.includes(user.role) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      language,
      login,
      logout,
      switchLanguage,
      isAuthenticated: !!user,
      hasPermission,
      canAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Ensure context values are always properly defined
  return {
    ...context,
    language: context.language || languages.ar,
    user: context.user || null
  };
}