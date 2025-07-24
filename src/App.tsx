import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CollaborativeProvider } from '@/contexts/CollaborativeContext';
import { TypographyProvider } from '@/contexts/TypographyContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import { AdvancedAnalytics, RealTimeAnalytics, PerformanceInsights } from '@/components/analytics';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleEditor } from '@/components/editor/ArticleEditor';
import { AIOptimizationEngine } from '@/components/optimization/AIOptimizationEngine';
import { ABTestingFramework } from '@/components/optimization/ABTestingFramework';
import { TypographySettings } from '@/components/settings/TypographySettings';
import { TypographyShowcase } from '@/components/showcase/TypographyShowcase';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories } from '@/lib/mockData';

function AppContent() {
  const { isAuthenticated, user, canAccess } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [articles, setArticles] = useKV<Article[]>('sabq-articles', mockArticles);

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
        // Create new article
        const defaultCategory = mockCategories[0]; // Use first category as default
        const newArticle: Article = {
          id: `article_${Date.now()}`,
          title: articleData.title || 'Untitled Article',
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          author: user!,
          category: defaultCategory,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft',
          language: 'ar',
          priority: 'normal',
          analytics: {
            views: 0,
            uniqueViews: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            readTime: 0,
            scrollDepth: 0,
            bounceRate: 0,
            clickThroughRate: 0
          },
          ...articleData
        } as Article;
        return [...currentArticles, newArticle];
      }
    });
    
    setActiveView('articles');
    setEditingArticle(undefined);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <RoleBasedDashboard onNavigate={handleViewChange} />;
      
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
      
      case 'ai-optimization':
        if (editingArticle && editingArticle.category) {
          return (
            <AIOptimizationEngine
              articleId={editingArticle.id}
              title={editingArticle.title}
              content={editingArticle.content}
              category={editingArticle.category.name}
              onOptimizationApplied={(optimization) => {
                // Handle optimization application
                console.log('Optimization applied:', optimization);
              }}
            />
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">AI Optimization Engine</h2>
            <p className="text-muted-foreground mt-2">Select an article to optimize</p>
          </div>
        );
      
      case 'ab-testing':
        if (editingArticle && editingArticle.category) {
          return (
            <ABTestingFramework
              articleId={editingArticle.id}
              currentTitle={editingArticle.title}
              currentSummary={editingArticle.excerpt}
              currentThumbnail={editingArticle.featuredImage}
            />
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">A/B Testing Framework</h2>
            <p className="text-muted-foreground mt-2">Select an article to test</p>
          </div>
        );
      
      case 'categories':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">إدارة الفئات</h2>
            <p className="text-muted-foreground mt-2">قريباً...</p>
          </div>
        );
      
      case 'tags':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">إدارة العلامات</h2>
            <p className="text-muted-foreground mt-2">قريباً...</p>
          </div>
        );
      
      case 'users':
        if (!canAccess('user-management')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">غير مصرح</h2>
              <p className="text-muted-foreground mt-2">ليس لديك صلاحية للوصول لهذه الصفحة</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
            <p className="text-muted-foreground mt-2">قريباً...</p>
          </div>
        );
      
      case 'settings':
        return <TypographySettings />;
      
      case 'typography-demo':
        return <TypographyShowcase />;
      
      case 'scheduled':
        return (
          <ArticleList 
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
            filter="scheduled"
          />
        );
      
      case 'moderation':
        if (!canAccess('moderation')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">غير مصرح</h2>
              <p className="text-muted-foreground mt-2">ليس لديك صلاحية للوصول لهذه الصفحة</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">إدارة المراجعة</h2>
            <p className="text-muted-foreground mt-2">قريباً...</p>
          </div>
        );
      
      default:
        return <RoleBasedDashboard onNavigate={handleViewChange} />;
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
      <TypographyProvider>
        <CollaborativeProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />
        </CollaborativeProvider>
      </TypographyProvider>
    </AuthProvider>
  );
}

export default App;