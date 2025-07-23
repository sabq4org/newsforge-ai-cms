import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AdvancedAnalytics, RealTimeAnalytics, PerformanceInsights } from '@/components/analytics';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleEditor } from '@/components/editor/ArticleEditor';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles } from '@/lib/mockData';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [articles, setArticles] = useKV<Article[]>('newsflow-articles', mockArticles);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setEditingArticle(undefined);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setActiveView('editor');
  };

  const handleCreateNew = () => {
    setEditingArticle(undefined);
    setActiveView('editor');
  };

  const handleSaveArticle = (articleData: Partial<Article>) => {
    setArticles(currentArticles => {
      const existingIndex = currentArticles.findIndex(a => a.id === articleData.id);
      if (existingIndex >= 0) {
        const updated = [...currentArticles];
        updated[existingIndex] = { ...updated[existingIndex], ...articleData } as Article;
        return updated;
      } else {
        return [...currentArticles, articleData as Article];
      }
    });
    
    setActiveView('articles');
    setEditingArticle(undefined);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleViewChange} />;
      case 'articles':
        return (
          <ArticleList 
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
          />
        );
      case 'create-article':
      case 'editor':
        return (
          <ArticleEditor 
            article={editingArticle}
            onSave={handleSaveArticle}
          />
        );
      case 'analytics':
        return <AdvancedAnalytics onNavigate={handleViewChange} />;
      case 'realtime':
        return <RealTimeAnalytics />;
      case 'insights':
        return <PerformanceInsights />;
      case 'categories':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Categories Management</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case 'tags':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Tags Management</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case 'scheduled':
        return (
          <ArticleList 
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </AuthProvider>
  );
}

export default App;