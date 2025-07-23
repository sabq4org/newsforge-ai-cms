import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Language } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { useKV } from '@github/spark/hooks';

interface AuthContextType {
  user: User | null;
  language: Language;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchLanguage: (lang: 'en' | 'ar') => void;
  isAuthenticated: boolean;
  hasPermission: (permission: 'create' | 'edit' | 'publish' | 'manage-users' | 'view-analytics') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const languages: Record<'en' | 'ar', Language> = {
  en: { code: 'en', name: 'English', direction: 'ltr' },
  ar: { code: 'ar', name: 'العربية', direction: 'rtl' }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useKV<User | null>('newsflow-user', null);
  const [language, setLanguage] = useKV<Language>('newsflow-language', languages.en);

  useEffect(() => {
    // Apply language and direction to document
    document.documentElement.setAttribute('lang', language.code);
    document.documentElement.setAttribute('dir', language.direction);
    document.body.className = language.direction === 'rtl' ? 'rtl' : 'ltr';
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

  const hasPermission = (permission: 'create' | 'edit' | 'publish' | 'manage-users' | 'view-analytics'): boolean => {
    if (!user) return false;

    const permissions = {
      admin: ['create', 'edit', 'publish', 'manage-users', 'view-analytics'],
      editor: ['create', 'edit', 'publish', 'view-analytics'],
      reporter: ['create', 'edit']
    };

    return permissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      language,
      login,
      logout,
      switchLanguage,
      isAuthenticated: !!user,
      hasPermission
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
  return context;
}