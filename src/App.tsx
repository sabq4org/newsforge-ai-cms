import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Globe, Gear as Settings } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CollaborativeProvider } from '@/contexts/CollaborativeContext';
import { CollaborativeManager } from '@/components/collaborative';
import { TypographyProvider } from '@/contexts/TypographyContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import { PublicInterface } from '@/components/public';
import { AdvancedAnalytics, AnalyticsDashboard, InteractiveAnalytics, RealTimeAnalytics, PerformanceInsights, CategoryAnalytics } from '@/components/analytics';
import { ArticleList } from '@/components/articles/ArticleList';
import { ComprehensiveArticleEditor } from '@/components/editor/ComprehensiveArticleEditor';
import { AIOptimizationEngine } from '@/components/optimization/AIOptimizationEngine';
import { ABTestingFramework } from '@/components/optimization/ABTestingFramework';
import { TypographySettings } from '@/components/settings/TypographySettings';
import { TypographyShowcase } from '@/components/showcase/TypographyShowcase';
import { MediaUpload, MediaGenerator, ComprehensiveMediaManager } from '@/components/media';
import { AudioEditor, AudioLibrary, AudioAnalytics } from '@/components/audio';
import { SystemAnalysis, ComprehensiveAnalysisEngine } from '@/components/analysis';
import { AISearch, ComprehensiveSearch } from '@/components/search';
import { AIRecommendationEngine } from '@/components/recommendations/AIRecommendationEngine';
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';
import { RecommendationEvaluation, RecommendationInsights, RecommendationDashboard, RecommendationSystemOverview } from '@/components/recommendations';
import { ContentModeration } from '@/components/moderation/ContentModeration';
import { SchedulingCalendar } from '@/components/scheduling';
import { CategoryManager, CategoryStatistics, ComprehensiveCategoryManager } from '@/components/categories';
import { LoyaltySystem } from '@/components/loyalty';
import { DailyDosesManager } from '@/components/doses';
import { PodcastDemo } from '@/components/demo/PodcastDemo';
import { ErrorChecker } from '@/components/debug/ErrorChecker';
import { ErrorBoundary } from '@/components/debug/ErrorBoundary';
import { RuntimeChecker } from '@/components/debug/RuntimeChecker';
import { ExternalDataManager, NewsAggregator } from '@/components/external';
import { BreakingNewsNotifications, NotificationCenter, LiveNotificationBanner, NotificationPreferences, NotificationAnalytics } from '@/components/notifications';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories, mockMediaFiles } from '@/lib/mockData';
import { normalizeArticles } from '@/lib/utils';

function AppContent() {
  const { isAuthenticated, user, canAccess } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [rawArticles, setRawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(rawArticles || []);
  const [isPublicView, setIsPublicView] = useState(false);
  
  // Initialize media files
  const [mediaFiles, setMediaFiles] = useKV('sabq-media-files', mockMediaFiles);
  
  const setArticles = (updater: (currentArticles: Article[]) => Article[]) => {
    setRawArticles(currentArticles => {
      const normalized = normalizeArticles(currentArticles || []);
      return updater(normalized);
    });
  };

  // If in public view mode, show public interface
  if (isPublicView) {
    return (
      <div className="relative">
        {/* Admin Toggle */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            onClick={() => setIsPublicView(false)}
            className="gap-2 bg-background border-border"
          >
            <Settings className="w-4 h-4" />
            لوحة التحكم
          </Button>
        </div>
        <PublicInterface articles={articles} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Public/Login Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            onClick={() => setIsPublicView(true)}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            عرض الموقع العام
          </Button>
        </div>
        <LoginForm />
      </div>
    );
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
          <ComprehensiveArticleEditor 
            article={editingArticle}
            onSave={handleSaveArticle}
            onCancel={() => setActiveView('articles')}
          />
        );
      
      case 'analytics':
        return <AnalyticsDashboard onNavigate={handleViewChange} />;
      
      case 'category-analytics':
        return <CategoryAnalytics />;
      
      case 'interactive-analytics':
        return <InteractiveAnalytics onExport={(data) => console.log('Exported data:', data)} />;
      
      case 'advanced-analytics':
        return <AdvancedAnalytics onNavigate={handleViewChange} />;
      
      case 'realtime':
        return <RealTimeAnalytics />;
      
      case 'recommendation-system-overview':
        return <RecommendationSystemOverview />;
      
      case 'recommendation-dashboard':
        return (
          <RecommendationDashboard
            onNavigate={handleViewChange}
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'personalized-recommendations':
        return (
          <PersonalizedRecommendations
            currentUser={user}
            articles={articles}
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'recommendations':
        return (
          <AIRecommendationEngine
            currentArticleId={editingArticle?.id}
            userId={user?.id}
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'recommendation-insights':
        return (
          <RecommendationInsights
            onInsightAction={(insight, action) => {
              console.log('Insight action:', insight, action);
              toast.success(`تم ${action === 'implement' ? 'تطبيق' : 'عرض تفاصيل'} الرؤية`);
            }}
          />
        );
      
      case 'recommendation-evaluation':
        return (
          <RecommendationEvaluation
            articleId={editingArticle?.id}
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted:', feedback);
              toast.success('تم إرسال تقييمك بنجاح');
            }}
          />
        );
      
      case 'ai-optimization':
        if (editingArticle && editingArticle.category) {
          return (
            <AIOptimizationEngine
              articleId={editingArticle.id}
              title={editingArticle.title}
              content={editingArticle.content}
              category={editingArticle.category?.name || 'عام'}
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
      
      case 'category-statistics':
        return <CategoryStatistics />;
      
      case 'categories':
        return <ComprehensiveCategoryManager />;
      
      case 'daily-doses':
        return <DailyDosesManager articles={articles} />;
      
      case 'tags':
        return <CategoryManager onCategoryUpdate={(cats) => console.log('Categories updated:', cats)} />;
      
      case 'scheduling':
      case 'calendar':
        return <SchedulingCalendar articles={articles} onScheduleCreated={(schedule) => console.log('Schedule created:', schedule)} />;
      
      case 'media-generator':
        return <MediaGenerator articles={articles} selectedArticle={editingArticle} />;
      
      case 'audio-editor':
        return (
          <AudioEditor 
            article={editingArticle}
            onSave={(project) => {
              console.log('Audio project saved:', project);
              toast.success('تم حفظ مشروع البودكاست');
            }}
            onExport={(project) => {
              console.log('Audio project exported:', project);
              toast.success('تم تصدير البودكاست بنجاح');
            }}
          />
        );
      
      case 'audio-library':
        return (
          <AudioLibrary 
            onEditProject={(project) => {
              setEditingArticle(project.article);
              setActiveView('audio-editor');
            }}
            onCreateProject={(article) => {
              if (article) {
                setEditingArticle(article);
              }
              setActiveView('audio-editor');
            }}
          />
        );
      
      case 'audio-analytics':
        return (
          <AudioAnalytics 
            projects={[]} // In real implementation, would pass actual audio projects
            onProjectSelect={(project) => {
              setEditingArticle(project.article);
              setActiveView('audio-editor');
            }}
          />
        );
      
      case 'loyalty':
        return <LoyaltySystem articles={articles} currentUser={user} />;

      case 'collaborative':
        return <CollaborativeManager article={editingArticle} onConflictResolved={(resolution) => console.log('Conflict resolved:', resolution)} />;

      case 'system-maintenance':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">صيانة النظام</h2>
            <p className="text-muted-foreground mt-2">أدوات صيانة وإدارة النظام</p>
          </div>
        );
      
      case 'podcast-demo':
        return (
          <PodcastDemo 
            onArticleSelect={(article) => {
              setEditingArticle(article);
              setActiveView('audio-editor');
            }}
          />
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
      
      case 'media':
        return <ComprehensiveMediaManager />;
      
      case 'system-analysis':
        return <SystemAnalysis />;
      
      case 'search':
        return <ComprehensiveSearch onArticleEdit={handleEditArticle} />;
      
      case 'moderation':
        if (!canAccess('moderation')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">غير مصرح</h2>
              <p className="text-muted-foreground mt-2">ليس لديك صلاحية للوصول لهذه الصفحة</p>
            </div>
          );
        }
        return <ContentModeration onArticleSelect={handleEditArticle} />;
      
      case 'scheduled':
        return (
          <ArticleList 
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
            filter="scheduled"
          />
        );
      
      case 'error-check':
        return <ErrorChecker />;
      
      case 'runtime-check':
        return <RuntimeChecker />;
      
      case 'external-data':
        return <ExternalDataManager />;
      
      case 'news-aggregator':
        return <NewsAggregator />;
      
      case 'breaking-news':
        return <BreakingNewsNotifications />;
      
      case 'notification-preferences':
        return <NotificationPreferences />;
      
      case 'notification-analytics':
        return <NotificationAnalytics />;
      
      case 'deep-analysis':
        return (
          <ComprehensiveAnalysisEngine 
            article={editingArticle}
            onAnalysisComplete={(analysis) => {
              console.log('Analysis completed:', analysis);
              toast.success('تم إكمال التحليل العميق');
            }}
          />
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
          {/* Live Notification Banner */}
          <LiveNotificationBanner />
          
          <Header 
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          
          {/* Public View Toggle */}
          <div className="border-b border-border px-6 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublicView(true)}
              className="gap-2 ml-auto"
            >
              <Globe className="w-4 h-4" />
              عرض الموقع العام
            </Button>
          </div>
          
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;